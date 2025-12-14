const mongoose = require('mongoose');

const adminSchema = new mongoose.Schema(
  {
    adminId: {
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
    firstName: {
      type: String,
      required: true,
    },
    lastName: {
      type: String,
      required: true,
    },
    phone: String,
    photo: String,
    role: {
      type: String,
      enum: ['superadmin', 'admin', 'subadmin'],
      default: 'admin',
    },
    permissions: [
      {
        module: String,
        actions: [String],
      },
    ],
    department: String,
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Admin', adminSchema);
