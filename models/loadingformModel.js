const mongoose = require("mongoose");

const loadingformSchema = new mongoose.Schema({
  loadingDate: {
    type: Date,
    required: true,
    default: Date.now,
  },
  vehicleInfo: {
    type: String,
    required: true,
    trim: true,
  },
  driverName: {
    type: String,
    required: true,
    trim: true,
  },
  destination: {
    type: String,
    required: true,
    trim: true,
  },
  productCategory: {
    type: String,
    required: true,
    enum: ["timber", "furniture", "other"],
  },
  productName: {
    type: String,
    required: true,
    trim: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
  },
  unit: {
    type: String,
    required: true,
    enum: ["pieces", "kg", "tons", "cubic_meters", "sets"],
  },
  attendantName: {
    type: String,
    required: true,
    trim: true,
  },
  specialInstructions: {
    type: String,
    trim: true,
  },
  priority: {
    type: String,
    enum: ["normal", "urgent", "low"],
    default: "normal",
  },
  status: {
    type: String,
    enum: ["pending", "in_transit", "delivered", "cancelled"],
    default: "pending",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});
loadingSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model("Loading", loadingformSchema);
