const mongoose = require('mongoose');

const transportSchema = new mongoose.Schema(
  {
    routeName: {
      type: String,
      required: true,
    },
    routeCode: {
      type: String,
      unique: true,
      required: true,
    },
    vehicleNumber: String,
    vehicleType: String,
    driver: String,
    driverPhone: String,
    capacity: Number,
    stops: [
      {
        stopName: String,
        stopCode: String,
        pickupTime: String,
        dropTime: String,
        location: String,
        distance: Number,
      },
    ],
    students: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student',
      },
    ],
    routeFee: Number,
    startPoint: String,
    endPoint: String,
    frequency: {
      type: String,
      enum: ['daily', 'alternate', 'weekly'],
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

module.exports = mongoose.model('Transport', transportSchema);
