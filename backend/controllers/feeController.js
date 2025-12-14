const Fee = require('../models/Fee');
const Student = require('../models/Student');

const createFeeStructure = async (req, res) => {
  try {
    const { student, semester, academicYear, feeStructure, totalFee, dueDate } = req.body;

    if (!student || !totalFee) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    const fee = new Fee({
      student,
      semester,
      academicYear,
      feeStructure,
      totalFee,
      pendingAmount: totalFee,
      dueDate,
      feeStatus: 'pending',
    });

    await fee.save();

    res.status(201).json({ success: true, message: 'Fee structure created', fee });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const recordFeePayment = async (req, res) => {
  try {
    const { feeId, amount, paymentMethod, transactionId, status } = req.body;

    if (!feeId || !amount) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    const fee = await Fee.findById(feeId);

    if (!fee) {
      return res.status(404).json({ success: false, message: 'Fee record not found' });
    }

    fee.feePayments.push({
      amount,
      paymentDate: new Date(),
      paymentMethod,
      transactionId,
      status: status || 'completed',
    });

    fee.paidAmount += amount;
    fee.pendingAmount = fee.totalFee - fee.paidAmount;

    if (fee.pendingAmount <= 0) {
      fee.feeStatus = 'paid';
    } else if (fee.paidAmount > 0) {
      fee.feeStatus = 'partial';
    }

    if (fee.pendingAmount > 0 && new Date(fee.dueDate) < new Date()) {
      fee.feeStatus = 'overdue';
    }

    await fee.save();

    res.status(200).json({ success: true, message: 'Payment recorded', fee });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getStudentFees = async (req, res) => {
  try {
    const { studentId } = req.params;

    const fees = await Fee.find({ student: studentId })
      .populate('student', 'personalDetails admissionNumber')
      .sort({ createdAt: -1 });

    if (!fees || fees.length === 0) {
      // Return empty array with 200 so clients can handle 'no records' without a network error
      return res.status(200).json({ success: true, fees: [] });
    }

    res.status(200).json({ success: true, fees });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getAllFees = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const status = req.query.status || '';
    const semester = req.query.semester || '';

    const query = {};
    if (status) query.feeStatus = status;
    if (semester) query.semester = semester;

    const fees = await Fee.find(query)
      .populate('student', 'personalDetails admissionNumber')
      .limit(limit)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const total = await Fee.countDocuments(query);

    res.status(200).json({
      success: true,
      fees,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getPendingFees = async (req, res) => {
  try {
    const pendingFees = await Fee.find({
      $or: [{ feeStatus: 'pending' }, { feeStatus: 'partial' }, { feeStatus: 'overdue' }],
    })
      .populate('student', 'personalDetails admissionNumber email')
      .sort({ dueDate: 1 });

    res.status(200).json({ success: true, fees: pendingFees });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const generateFeeReport = async (req, res) => {
  try {
    const { month, year } = req.query;

    const query = {};

    if (month && year) {
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 1);
      query.createdAt = { $gte: startDate, $lt: endDate };
    }

    const fees = await Fee.find(query)
      .populate('student', 'personalDetails admissionNumber')
      .sort({ createdAt: -1 });

    let totalCollected = 0;
    let totalPending = 0;

    fees.forEach((fee) => {
      totalCollected += fee.paidAmount;
      totalPending += fee.pendingAmount;
    });

    res.status(200).json({
      success: true,
      report: {
        totalRecords: fees.length,
        totalCollected,
        totalPending,
        totalAmount: totalCollected + totalPending,
        fees,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  createFeeStructure,
  recordFeePayment,
  getStudentFees,
  getAllFees,
  getPendingFees,
  generateFeeReport,
};
