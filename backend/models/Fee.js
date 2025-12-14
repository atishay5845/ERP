// models/Fee.js
const mongoose = require('mongoose');

const feePaymentSchema = new mongoose.Schema({
  amount: Number,
  paymentDate: Date,
  paymentMethod: {
    type: String,
    enum: ['cash', 'check', 'online', 'transfer', 'card', 'upi', 'netbanking'],
  },
  transactionId: String,
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed'],
  },
  remarks: String,
  razorpay: {
    orderId: String,
    paymentId: String,
    signature: String,
  },
});

const feeSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: true,
    },
    admissionNumber: String,
    semester: Number,
    academicYear: String,
    feeStructure: {
      tuitionFee: Number,
      labFee: Number,
      libraryFee: Number,
      sportsFee: Number,
      otherFee: Number,
    },
    totalFee: {
      type: Number,
      required: true,
    },
    paidAmount: {
      type: Number,
      default: 0,
    },
    pendingAmount: {
      type: Number,
      required: true,
    },
    dueDate: Date,
    feePayments: [feePaymentSchema],
    feeStatus: {
      type: String,
      enum: ['paid', 'pending', 'overdue', 'partial'],
      default: 'pending',
    },
    // Razorpay meta for the current outstanding fee/order
    razorpay: {
      orderId: String,
      paymentId: String,
      signature: String,
      captured: { type: Boolean, default: false },
      paymentMethod: String,
    },
    lastReminderSent: Date,
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Fee', feeSchema);
