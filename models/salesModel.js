const mongoose = require("mongoose");

const salesSchema = new mongoose.Schema({
  customerName: {
    type: String,
    required: true,
  },
  productType: {
    type: String,
    required: true,
  },
  productName: {
    type: String,
    required: true,
    trim: true,
  },
  quantitySold: {
    type: Number,
    required: true,
  },
  unitPrice : {
    type : Number,
    required : true,
  },
  date : {
    type : String,
    required : true,
  },
  paymentType: {
    type : String,
    required: true,
  },
  salesAgent: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "userModel",
    required : true,
  },
  checkBox: {
    type: String,
  },
});



module.exports = mongoose.model("salesModel", salesSchema);
