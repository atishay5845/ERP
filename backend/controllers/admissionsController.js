const Admission = require('../models/Admission');
const Student = require('../models/Student');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const { sendApprovalEmail, sendRejectionEmail } = require('../utils/mailer');

const generateAdmissionNumber = () => {
  const year = new Date().getFullYear();
  const random = Math.floor(Math.random() * 10000);
  return `ADM${year}${String(random).padStart(5, '0')}`;
};

const generateTemporaryPassword = () => {
  return `Temp${Math.random().toString(36).substring(2, 10)}`;
};

const generateToken = (user, role) => {
  return jwt.sign(
    { id: user._id, email: user.email, role },
    process.env.JWT_SECRET || 'your_jwt_secret_key_change_in_production',
    { expiresIn: process.env.JWT_EXPIRE || '7d' }
  );
};

const submitAdmission = async (req, res) => {
  try {
    const { personalDetails, guardianDetails, academicDetails } = req.body;

    if (!personalDetails || !personalDetails.email || !personalDetails.firstName) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    const existingAdmission = await Admission.findOne({ 'personalDetails.email': personalDetails.email });
    if (existingAdmission) {
      return res.status(400).json({ success: false, message: 'Application already submitted with this email' });
    }

    const existingStudent = await Student.findOne({ email: personalDetails.email });
    if (existingStudent) {
      return res.status(400).json({ success: false, message: 'Email already registered' });
    }

    const admission = new Admission({
      personalDetails,
      guardianDetails,
      academicDetails,
    });

    await admission.save();

    res.status(201).json({
      success: true,
      message: 'Admission application submitted successfully. Please wait for admin approval.',
      admissionId: admission._id,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getPendingAdmissions = async (req, res) => {
  try {
    const admissions = await Admission.find({ admissionStatus: 'pending' })
      .sort({ appliedDate: -1 })
      .populate('academicDetails.course');

    res.status(200).json({
      success: true,
      count: admissions.length,
      data: admissions,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getAllAdmissions = async (req, res) => {
  try {
    const { status } = req.query;
    let query = {};

    if (status) {
      query.admissionStatus = status;
    }

    const admissions = await Admission.find(query)
      .sort({ appliedDate: -1 })
      .populate('academicDetails.course')
      .populate('statusHistory.changedBy');

    res.status(200).json({
      success: true,
      count: admissions.length,
      data: admissions,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getAdmissionById = async (req, res) => {
  try {
    const { id } = req.params;

    const admission = await Admission.findById(id)
      .populate('academicDetails.course')
      .populate('statusHistory.changedBy');

    if (!admission) {
      return res.status(404).json({ success: false, message: 'Admission not found' });
    }

    res.status(200).json({
      success: true,
      data: admission,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const approveAdmission = async (req, res) => {
  try {
    const { id } = req.params;
    const adminId = req.user.id;

    const admission = await Admission.findById(id);
    if (!admission) {
      return res.status(404).json({ success: false, message: 'Admission not found' });
    }

    if (admission.admissionStatus !== 'pending') {
      return res.status(400).json({ success: false, message: 'Only pending admissions can be approved' });
    }

    const admissionNumber = generateAdmissionNumber();
    const tempPassword = generateTemporaryPassword();
    const hashedPassword = await bcrypt.hash(tempPassword, 10);

    let student = await Student.findOne({ email: admission.personalDetails.email });

    if (student) {
      student.admissionNumber = admissionNumber;
      student.password = hashedPassword;
      student.personalDetails = {
        ...student.personalDetails,
        firstName: admission.personalDetails.firstName,
        lastName: admission.personalDetails.lastName,
        phone: admission.personalDetails.phone,
        dob: admission.personalDetails.dob,
        gender: admission.personalDetails.gender,
        bloodGroup: admission.personalDetails.bloodGroup,
        nationality: admission.personalDetails.nationality,
      };
      student.guardianDetails = admission.guardianDetails;
      student.academicDetails = {
        ...student.academicDetails,
        batch: admission.academicDetails.batch,
        course: admission.academicDetails.course,
      };
    } else {
      student = new Student({
        admissionNumber,
        email: admission.personalDetails.email,
        password: hashedPassword,
        personalDetails: {
          firstName: admission.personalDetails.firstName,
          lastName: admission.personalDetails.lastName,
          phone: admission.personalDetails.phone,
          dob: admission.personalDetails.dob,
          gender: admission.personalDetails.gender,
          bloodGroup: admission.personalDetails.bloodGroup,
          nationality: admission.personalDetails.nationality,
        },
        guardianDetails: admission.guardianDetails,
        academicDetails: {
          batch: admission.academicDetails.batch,
          course: admission.academicDetails.course,
        },
        documents: admission.documents,
      });
    }

    await student.save();

    admission.admissionStatus = 'approved';
    admission.admissionNumber = admissionNumber;
    admission.approvalDate = new Date();
    admission.statusHistory.push({
      status: 'approved',
      changedBy: adminId,
      remarks: 'Admission approved by admin',
    });

    await admission.save();

    try {
      const studentName = `${admission.personalDetails.firstName} ${admission.personalDetails.lastName}`;
      await sendApprovalEmail(
        admission.personalDetails.email,
        studentName,
        admissionNumber,
        tempPassword
      );
    } catch (emailError) {
      console.error('Error sending approval email:', emailError);
    }

    res.status(200).json({
      success: true,
      message: 'Admission approved successfully',
      data: {
        admissionNumber,
        studentId: student._id,
        email: admission.personalDetails.email,
        tempPassword,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const rejectAdmission = async (req, res) => {
  try {
    const { id } = req.params;
    const { rejectionReason } = req.body;
    const adminId = req.user.id;

    if (!rejectionReason) {
      return res.status(400).json({ success: false, message: 'Rejection reason is required' });
    }

    const admission = await Admission.findById(id);
    if (!admission) {
      return res.status(404).json({ success: false, message: 'Admission not found' });
    }

    if (admission.admissionStatus !== 'pending') {
      return res.status(400).json({ success: false, message: 'Only pending admissions can be rejected' });
    }

    admission.admissionStatus = 'rejected';
    admission.rejectionReason = rejectionReason;
    admission.statusHistory.push({
      status: 'rejected',
      changedBy: adminId,
      remarks: rejectionReason,
    });

    await admission.save();

    try {
      const studentName = `${admission.personalDetails.firstName} ${admission.personalDetails.lastName}`;
      await sendRejectionEmail(
        admission.personalDetails.email,
        studentName,
        rejectionReason
      );
    } catch (emailError) {
      console.error('Error sending rejection email:', emailError);
    }

    res.status(200).json({
      success: true,
      message: 'Admission rejected successfully',
      data: admission,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getAdmissionStats = async (req, res) => {
  try {
    const total = await Admission.countDocuments();
    const pending = await Admission.countDocuments({ admissionStatus: 'pending' });
    const approved = await Admission.countDocuments({ admissionStatus: 'approved' });
    const rejected = await Admission.countDocuments({ admissionStatus: 'rejected' });

    res.status(200).json({
      success: true,
      stats: {
        total,
        pending,
        approved,
        rejected,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const submitApplicationForPhase2 = async (req, res) => {
  try {
    const { personalDetails, guardianDetails, academicDetails } = req.body;
    const studentId = req.user.id;

    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    if (student.applicationSubmitted) {
      return res.status(400).json({ 
        success: false, 
        message: 'Application already submitted',
        applicationId: student.admissionApplicationId
      });
    }

    student.personalDetails = {
      ...student.personalDetails,
      ...personalDetails,
    };
    student.guardianDetails = guardianDetails;
    student.academicDetails = academicDetails;
    student.applicationSubmitted = true;

    const admission = new Admission({
      personalDetails: {
        ...student.personalDetails,
        email: student.email,
      },
      guardianDetails,
      academicDetails,
      admissionStatus: 'pending',
      appliedDate: new Date(),
      student: student._id
    });

    await admission.save();
    student.admissionApplicationId = admission._id;
    await student.save();

    res.status(201).json({
      success: true,
      message: 'Application submitted successfully. Admin will review and notify you soon.',
      studentId: student._id,
      admissionId: admission._id,
    });

  } catch (error) {
    console.error('Error submitting application:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message || 'Failed to submit application',
      error: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

module.exports = {
  submitAdmission,
  getPendingAdmissions,
  getAllAdmissions,
  getAdmissionById,
  approveAdmission,
  rejectAdmission,
  getAdmissionStats,
  submitApplicationForPhase2,
};
