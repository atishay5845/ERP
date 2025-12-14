const mongoose = require('mongoose');

const examSchema = new mongoose.Schema(
  {
    examName: {
      type: String,
      required: true,
    },
    examType: {
      type: String,
      enum: [
              'midterm', 'final', 'internal', 'practical',
              'Midterm', 'Final', 'Internal', 'Practical'
            ],
      required: true,
    },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: true,
    },
    courseName: String,
    batch: {
      type: String,
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    startTime: String,
    endTime: String,
    totalMarks: {
      type: Number,
      required: true,
    },
    passingMarks: {
      type: Number,
      required: true,
    },
    location: String,
    description: String,
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Admin',
    },
    isPublished: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Exam', examSchema);
