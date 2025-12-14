const mongoose = require('mongoose');

const teacherSchema = new mongoose.Schema(
  {
    employeeId: {
      type: String,
      unique: true,
      required: true,
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
      phone: String,
      photo: String,
      qualifications: [
        {
          degree: String,
          university: String,
          passingYear: Number,
        },
      ],
    },
    department: {
      type: String,
      required: true,
    },
    designation: {
      type: String,
      required: true,
    },
    specialization: [String],
    subjectsAssigned: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Subject',
      },
    ],
    coursesAssigned: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course',
      },
    ],
    studentsAssigned: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student',
      },
    ],
    timetable: [
      {
        day: String,
        startTime: String,
        endTime: String,
        subject: String,
        batch: String,
      },
    ],
    experience: {
      yearsOfExperience: Number,
      previousSchools: [String],
    },
    salary: {
      basicSalary: Number,
      allowances: Number,
      deductions: Number,
      netSalary: Number,
    },
    documents: [
      {
        documentType: String,
        fileUrl: String,
        uploadDate: Date,
      },
    ],
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Teacher', teacherSchema);
