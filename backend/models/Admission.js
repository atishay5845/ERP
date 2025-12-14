const mongoose = require('mongoose');

const admissionSchema = new mongoose.Schema(
  {
    personalDetails: {
      firstName: {
        type: String,
        required: true,
      },
      lastName: {
        type: String,
        required: true,
      },
      email: {
        type: String,
        required: true,
        unique: true,
        sparse: true,
        lowercase: true,
      },
      phone: {
        type: String,
        required: true,
      },
      dob: {
        type: Date,
        required: true,
      },
      gender: String,
      bloodGroup: String,
      nationality: String,
    },
    guardianDetails: {
      fatherName: String,
      fatherPhone: String,
      motherName: String,
      motherPhone: String,
      primaryGuardian: String,
      guardianPhone: String,
      guardianEmail: String,
      address: String,
    },
    academicDetails: {
      course: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course',
      },
      batch: String,
      previousSchool: String,
      previousBoard: String,
      percentage: Number,
    },
    documents: [
      {
        documentType: {
          type: String,
          enum: ['idCard', 'certificate', 'marksheet', 'other'],
        },
        fileName: String,
        fileUrl: String,
        uploadDate: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    admissionStatus: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
    statusHistory: [
      {
        status: String,
        date: {
          type: Date,
          default: Date.now,
        },
        changedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Admin',
        },
        remarks: String,
      },
    ],
    admissionNumber: {
      type: String,
      sparse: true,
    },
    rejectionReason: String,
    approvalDate: Date,
    appliedDate: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Admission', admissionSchema);
