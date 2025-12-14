const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema(
  {
    courseName: {
      type: String,
      required: true,
    },
    courseCode: {
      type: String,
      unique: true,
      required: true,
    },
    description: String,
    department: String,
    duration: Number,
    totalSemesters: Number,
    totalCredits: Number,
    eligibility: String,
    admissionCapacity: Number,
    courseFee: Number,
    subjects: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Subject',
      },
    ],
    coordinator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Teacher',
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

module.exports = mongoose.model('Course', courseSchema);
