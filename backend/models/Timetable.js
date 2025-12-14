const mongoose = require('mongoose');

const timetableSchema = new mongoose.Schema(
  {
    batch: {
      type: String,
      required: true,
    },
    semester: Number,
    academicYear: String,
    schedule: [
      {
        day: {
          type: String,
          enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
          required: true,
        },
        slot: {
          slotNumber: Number,
          startTime: String,
          endTime: String,
        },
        subject: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Subject',
        },
        subjectName: String,
        teacher: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Teacher',
        },
        teacherName: String,
        classroom: String,
        type: {
          type: String,
          enum: ['theory', 'practical', 'lab'],
        },
      },
    ],
    isActive: {
      type: Boolean,
      default: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Admin',
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Teacher',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Timetable', timetableSchema);
