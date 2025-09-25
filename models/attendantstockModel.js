const mongoose = require("mongoose");

const attendantstockSchema = new mongoose.Schema({
  productName: {
    type: String,
    required: true,
  },
  productType: {
    type: String,
    required: true,
  },
  productPrice: {
    type: Number,
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
  },
  costPrice: {
    type: Number,
    required: true,
  },
  supplierName: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
  quality: {
    type: String,
    required: true,
  },
  color: {
    type: String,
    required: false,
  },
  measurements: {
    type: String,
    required: false,
  },
});

module.exports = mongoose.model("attendantstockModel", attendantstockSchema);
