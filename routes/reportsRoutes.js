const express = require("express");
const router = express.Router();
const Stock = require("../models/stockModel");
const Sale = require("../models/salesModel");

router.get("/reports", async (req, res) => {
  try {
    const stockData = await Stock.find();
    const salesData = await Sale.find();

    console.log("Stock:", stockData); 
    console.log("Sales:", salesData); 

    res.render("reports", {
      stock: stockData,
      sales: salesData,
    });
  } catch (error) {
    console.error("Error fetching reports:", error);
    res.status(500).send("Error fetching reports");
  }
});

module.exports = router;
