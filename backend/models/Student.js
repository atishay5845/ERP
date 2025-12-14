const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema(
  {
    admissionNumber: {
      type: String,
      unique: true,
      sparse: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
    },
    applicationSubmitted: {
      type: Boolean,
      default: false,
    },
    courseApplyingFor: {
      type: String,
    },
    mobileNumber: {
      type: String,
    },
    personalDetails: {
      firstName: {
        type: String,
        required: true,
      },
      lastName: {
        type: String,
        required: true,
      },
      dob: Date,
      gender: String,
      bloodGroup: String,
      nationality: String,
      phone: String,
      photo: String,
    },
    academicDetails: {
      rollNumber: String,
      batch: String,
      course: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course',
      },
      currentSemester: Number,
      cgpa: {
        type: Number,
        default: 0,
      },
      enrollmentStatus: {
        type: String,
        enum: ['active', 'inactive', 'graduated'],
        default: 'active',
      },
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
    documents: [
      {
        documentType: String,
        fileName: String,
        fileUrl: String,
        uploadDate: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    attendance: {
      totalDays: {
        type: Number,
        default: 0,
      },
      presentDays: {
        type: Number,
        default: 0,
      },
      absentDays: {
        type: Number,
        default: 0,
      },
      attendancePercentage: {
        type: Number,
        default: 0,
      },
    },
    fees: {
      totalFees: Number,
      paidAmount: {
        type: Number,
        default: 0,
      },
      pendingDues: {
        type: Number,
        default: 0,
      },
      feePaymentHistory: [
        {
          amount: Number,
          paymentDate: Date,
          method: String,
          transactionId: String,
          status: {
            type: String,
            enum: ['pending', 'completed', 'failed'],
          },
        },
      ],
    },
    hostel: {
      roomNumber: String,
      blockName: String,
      checkInDate: Date,
      checkOutDate: Date,
    },
    transport: {
      routeId: mongoose.Schema.Types.ObjectId,
      routeName: String,
      stopName: String,
      vehicleNumber: String,
    },
    preferredTeacher: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Teacher',
    },
    assignedTimetable: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'StudentTimetable',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Student', studentSchema);
