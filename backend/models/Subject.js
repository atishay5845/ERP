const mongoose = require('mongoose');

const subjectSchema = new mongoose.Schema(
  {
    subjectCode: {
      type: String,
      unique: true,
      required: true,
    },
    subjectName: {
      type: String,
      required: true,
    },
    description: String,
    credits: {
      type: Number,
      required: true,
    },
    semester: {
      type: Number,
      required: true,
    },
    department: String,
    assignedTeacher: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Teacher',
    },
    theory: {
      hoursPerWeek: Number,
      maxMarks: Number,
    },
    practical: {
      hoursPerWeek: Number,
      maxMarks: Number,
    },
    batches: [String],
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Subject', subjectSchema);
