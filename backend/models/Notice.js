const mongoose = require('mongoose');

const noticeSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      enum: ['academic', 'events', 'holiday', 'maintenance', 'general'],
      required: true,
    },
    attachments: [
      {
        fileName: String,
        fileUrl: String,
      },
    ],
    postedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Admin',
      required: true,
    },
    postedByName: String,
    visibility: {
      type: String,
      enum: ['all', 'students', 'teachers', 'staff'],
      default: 'all',
    },
    expiryDate: Date,
    isPinned: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    views: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Notice', noticeSchema);
