// controllers/razorpayController.js
const Razorpay = require('razorpay');
const crypto = require('crypto');
const Fee = require('../models/Fee');
const Student = require('../models/Student'); // optional, adjust path
const nodemailer = require('nodemailer');

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || process.env.SMTP_HOST,
  port: Number(process.env.EMAIL_PORT || process.env.SMTP_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER || process.env.SMTP_USER,
    pass: process.env.EMAIL_PASS || process.env.SMTP_PASS,
  },
});

exports.createOrder = async (req, res) => {
  try {
    // expects { feeId, amount } in rupees
    const { feeId, amount } = req.body;
    const fee = await Fee.findById(feeId);
    if (!fee) return res.status(404).json({ error: 'Fee not found' });

    // Validate amount doesn't exceed pending
    const payAmount = Number(amount || fee.pendingAmount || fee.totalFee - fee.paidAmount);
    if (payAmount <= 0) return res.status(400).json({ error: 'Invalid amount' });

    const amountPaise = Math.round(payAmount * 100);

    const options = {
      amount: amountPaise,
      currency: 'INR',
      receipt: `fee_rcpt_${feeId}_${Date.now()}`,
      payment_capture: 1, // auto capture
    };

    const order = await razorpay.orders.create(options);

    // store orderId temporarily on fee
    fee.razorpay = fee.razorpay || {};
    fee.razorpay.orderId = order.id;
    await fee.save();

    res.json({ order });
  } catch (err) {
    console.error('createOrder error', err);
    res.status(500).json({ error: 'Failed to create order' });
  }
};

exports.verifyPayment = async (req, res) => {
  try {
    // from frontend handler after checkout
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      feeId,
      amount,
      method,
      transactionId,
    } = req.body;

    const generated_signature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    if (generated_signature !== razorpay_signature) {
      return res.status(400).json({ success: false, message: 'Signature verification failed' });
    }

    const fee = await Fee.findById(feeId);
    if (!fee) return res.status(404).json({ success: false, message: 'Fee not found' });

    // Amount is rupees in payload — coerce to number
    const amt = Number(amount || 0);

    fee.feePayments = fee.feePayments || [];
    fee.feePayments.push({
      amount: amt,
      paymentDate: new Date(),
      paymentMethod: method || 'online',
      transactionId: razorpay_payment_id || transactionId,
      status: 'completed',
      razorpay: {
        orderId: razorpay_order_id,
        paymentId: razorpay_payment_id,
        signature: razorpay_signature,
      },
    });

    // Update aggregates
    fee.paidAmount = (Number(fee.paidAmount) || 0) + amt;
    fee.pendingAmount = Math.max((Number(fee.totalFee) || 0) - fee.paidAmount, 0);
    fee.feeStatus = fee.pendingAmount <= 0 ? 'paid' : (fee.paidAmount > 0 ? 'partial' : 'pending');

    fee.razorpay = {
      orderId: razorpay_order_id,
      paymentId: razorpay_payment_id,
      signature: razorpay_signature,
      paymentMethod: method,
      captured: true,
    };

    await fee.save();

    // notify via email (optional)
    try {
      const student = await Student.findById(fee.student);
      const adminEmail = process.env.EMAIL_USER || process.env.FROM_EMAIL;
      if (adminEmail) {
        await transporter.sendMail({
          from: process.env.EMAIL_USER || process.env.FROM_EMAIL,
          to: adminEmail,
          subject: `Fee paid by ${student?.name || fee.admissionNumber}`,
          text: `Payment of ₹${amt} received. Payment ID: ${razorpay_payment_id}`,
        });
      }
    } catch (e) {
      console.warn('Email notify failed', e.message);
    }

    // socket notification (if io available)
    try {
      const io = req.app.get('io');
      if (io) {
        io.emit('fee-paid', { feeId: fee._id.toString(), studentId: fee.student.toString(), amount: amt });
      }
    } catch (e) {
      console.warn('Socket emit failed', e.message);
    }

    res.json({ success: true, message: 'Payment verified and recorded' });
  } catch (err) {
    console.error('verifyPayment error', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// webhook for Razorpay events
exports.webhookHandler = async (req, res) => {
  try {
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
    const payload = req.body;
    const signature = req.headers['x-razorpay-signature'];

    const shasum = crypto.createHmac('sha256', secret).update(JSON.stringify(payload)).digest('hex');

    if (shasum !== signature) {
      console.warn('Webhook signature mismatch');
      return res.status(400).json({ ok: false, message: 'Invalid signature' });
    }

    const event = payload.event;
    if (event === 'payment.captured' || event === 'payment.authorized') {
      const entity = payload.payload.payment.entity;
      const orderId = entity.order_id;
      const paymentId = entity.id;

      const fee = await Fee.findOne({ 'razorpay.orderId': orderId });
      if (fee) {
        // Avoid duplicate push if already recorded
        const already = fee.feePayments?.some(fp => fp.razorpay?.paymentId === paymentId);
        if (!already) {
          const amt = (entity.amount || 0) / 100;
          fee.feePayments = fee.feePayments || [];
          fee.feePayments.push({
            amount: amt,
            paymentDate: new Date((entity.created_at || Date.now()) * 1000),
            paymentMethod: entity.method || 'online',
            transactionId: paymentId,
            status: 'completed',
            razorpay: { orderId, paymentId, signature: '' },
          });

          fee.paidAmount = (Number(fee.paidAmount) || 0) + amt;
          fee.pendingAmount = Math.max((Number(fee.totalFee) || 0) - fee.paidAmount, 0);
          fee.feeStatus = fee.pendingAmount <= 0 ? 'paid' : (fee.paidAmount > 0 ? 'partial' : 'pending');
          fee.razorpay = fee.razorpay || {};
          fee.razorpay.paymentId = paymentId;
          fee.razorpay.captured = true;

          await fee.save();

          // emit socket
          try {
            const io = req.app.get('io');
            if (io) io.emit('fee-paid', { feeId: fee._id.toString(), studentId: fee.student.toString(), amount: amt });
          } catch (e) { /* ignore */ }
        }
      }
    }

    res.json({ ok: true });
  } catch (err) {
    console.error('webhookHandler error', err);
    res.status(500).json({ ok: false, message: 'server error' });
  }
};
