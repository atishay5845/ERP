const mongoose = require('mongoose');

const inventorySchema = new mongoose.Schema(
  {
    itemName: {
      type: String,
      required: true,
    },
    itemCode: {
      type: String,
      unique: true,
      required: true,
    },
    category: {
      type: String,
      enum: ['books', 'equipment', 'furniture', 'electronics', 'other'],
      required: true,
    },
    description: String,
    quantity: {
      type: Number,
      required: true,
      default: 0,
    },
    reorderLevel: Number,
    unitPrice: Number,
    totalValue: Number,
    location: String,
    department: String,
    supplier: String,
    dateOfPurchase: Date,
    warrantyExpiry: Date,
    status: {
      type: String,
      enum: ['available', 'damaged', 'lost', 'maintenance'],
      default: 'available',
    },
    history: [
      {
        action: String,
        quantityChanged: Number,
        date: Date,
        remarks: String,
      },
    ],
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Inventory', inventorySchema);
