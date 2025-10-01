const mongoose = require("mongoose");

const loadingformSchema = new mongoose.Schema({
  loadingDate: Date,
  vehicleInfo: String,
  driverName: String,
  destination: String,
  productCategory: String,
  productName: String,
  quantity: Number,
  unit: String,
  attendantName: String,
  specialInstructions: String,
  priority: { type: String, default: "normal" },
});

module.exports = mongoose.model("Loading", loadingformSchema);
