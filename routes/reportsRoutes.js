const express = require("express");
const router = express.Router();
const stockModel = require("../models/stockModel");
const salesModel = require("../models/salesModel");
const attendantstockModel = require("../models/attendantstockModel");

router.get("/reports", async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    let dateFilter = {};

    if (startDate || endDate) {
      dateFilter.date = {};

      if (startDate) {
        dateFilter.date.$gte = new Date(startDate);
      }

      if (endDate) {
        const endDateTime = new Date(endDate);
        endDateTime.setHours(23, 59, 59, 999);
        dateFilter.date.$lte = endDateTime;
      }
    }

    const stock = await stockModel.find(dateFilter).sort({ date: -1 });
    const sales = await salesModel.find(dateFilter).sort({ date: -1 });

    res.render("reports", {
      stock,
      sales,
      startDate: startDate || "",
      endDate: endDate || "",
    });
  } catch (error) {
    console.error("Error fetching reports:", error);
    res.status(500).send("Error loading reports");
  }
});



module.exports = router;
