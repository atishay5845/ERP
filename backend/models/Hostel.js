const mongoose = require('mongoose');

const hostelSchema = new mongoose.Schema(
  {
    hostelName: {
      type: String,
      required: true,
    },
    hostelCode: {
      type: String,
      unique: true,
      required: true,
    },
    warden: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Teacher',
    },
    blocks: [
      {
        blockName: String,
        capacity: Number,
        rooms: [
          {
            roomNumber: String,
            type: {
              type: String,
              enum: ['single', 'double', 'triple'],
            },
            capacity: Number,
            occupiedBeds: Number,
            students: [
              {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Student',
              },
            ],
            furniture: [String],
            rentPerMonth: Number,
          },
        ],
      },
    ],
    totalRooms: Number,
    totalCapacity: Number,
    address: String,
    phone: String,
    fees: {
      monthlyRent: Number,
      securityDeposit: Number,
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

module.exports = mongoose.model('Hostel', hostelSchema);
