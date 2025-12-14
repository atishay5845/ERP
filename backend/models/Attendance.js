const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: true,
    },
    subject: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Subject',
    },
    teacher: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Teacher',
    },
    batch: String,
    date: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ['present', 'absent', 'leave', 'late'],
      required: true,
    },
    remarks: String,
    markedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Teacher',
    },
    biometricId: String,
    rfidId: String,
  },
  {
    timestamps: true,
  }
);

attendanceSchema.index({ student: 1, date: 1 });
attendanceSchema.index({ batch: 1, date: 1 });

module.exports = mongoose.model('Attendance', attendanceSchema);
