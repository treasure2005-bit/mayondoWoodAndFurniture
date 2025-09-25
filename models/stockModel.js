const mongoose = require("mongoose");

const stockSchema = new mongoose.Schema(
  {
    managerName: {
      type: String,
      required: true,
      trim: true,
    },
    managerId: {
      type: String,
      required: true,
      trim: true,
    },
    date: {
      type: Date,
      required: true,
    },
    productName: {
      type: String,
      required: true,
      enum: ["beds", "sofa", "dining tables", "cupboards", "drawers","timber","poles","hardwood","softwood"],
    },
    productType: {
      type: String,
      required: true,
      enum: ["home furniture", "office furniture","wood"],
    },
    costPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    productPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
    supplierName: {
      type: String,
      required: true,
      trim: true,
    },
    quality: {
      type: String,
      required: true,
      trim: true,
    },
    color: {
      type: String,
      required: true,
    },
    measurement: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      required: true,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Stock", stockSchema);
