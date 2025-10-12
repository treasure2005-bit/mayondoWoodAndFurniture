const mongoose = require("mongoose");

const offloadingSchema = new mongoose.Schema(
  {
    deliveryReference: {
      type: String,
      required: true,
    },
    offloadingDate: {
      type: Date,
      required: true,
    },
    vehicleInfo: {
      type: String,
      required: true,
    },
    driverName: {
      type: String,
      required: true,
    },
    productCategory: {
      type: String,
      required: true,
    },
    productName: {
      type: String,
      required: true,
    },
    expectedQuantity: {
      type: Number,
    },
    actualQuantity: {
      type: Number,
      required: true,
    },
    unit: {
      type: String,
      required: true,
    },
    discrepancy: {
      type: String,
      enum: ["match", "shortage", "excess"],
      required: true,
    },
    productCondition: {
      type: String,
      enum: ["excellent", "good", "fair", "poor", "damaged"],
      required: true,
    },
    damageDescription: String,
    photosRequired: {
      type: Boolean,
      default: false,
    },
    attendantName: {
      type: String,
      required: true,
    },
    storageLocation: {
      type: String,
      required: true,
    },
    receivedBy: String,
    additionalNotes: String,
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "userModel",
    },
    createdByName: String,
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "userModel",
    },
    updatedAt: Date,
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Offloading", offloadingSchema);
