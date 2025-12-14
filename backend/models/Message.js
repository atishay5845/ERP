// BACKEND/models/Message.js
const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: "senderModel",
      required: true,
    },
    senderModel: {
      // We treat superadmin as Admin in controller, so only these values are stored
      type: String,
      enum: ["Admin", "Teacher", "Student"],
      required: true,
    },
    senderName: String,
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: "recipientModel",
      required: true,
    },
    recipientModel: {
      type: String,
      enum: ["Admin", "Teacher", "Student"],
      required: true,
    },
    recipientName: String,
    subject: String,
    message: {
      type: String,
      required: true,
    },
    messageType: {
      type: String,
      enum: ["text", "announcement", "assignment", "grade_notification"],
      default: "text",
    },
    attachments: [
      {
        fileName: String,
        fileUrl: String,
      },
    ],
    isRead: {
      type: Boolean,
      default: false,
    },
    readAt: Date,
    priority: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "medium",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Message", messageSchema);