const express = require("express");
const router = express.Router();
const attendantstockModel = require("../models/attendantstockModel");

// Authentication middleware
const isAuthenticated = (req, res, next) => {
  if (req.session.user) {
    return next();
  }
  res.redirect("/login");
};

// GET route to display stock report - NOW WITH AUTH
router.get("/stockreport", isAuthenticated, async (req, res) => {
  try {
    // Fetch all stock records, sorted by date (newest first)
    const stocks = await attendantstockModel.find().sort({ date: -1 });

    res.render("stockreport", {
      stocks: stocks,
      title: "Stock Report",
      user: req.session.user,
    });
  } catch (error) {
    console.error("Error fetching stock report:", error);
    res.status(500).send("Error loading stock report");
  }
});

// POST route to handle stock recording
router.post("/attendantstock", isAuthenticated, async (req, res) => {
  try {
    const {
      productName,
      productType,
      productPrice,
      costPrice,
      quantity,
      supplierName,
      date,
      quality,
      color,
      measurements,
    } = req.body;

    const attendantName =
      req.session.user.fullName ||
      req.session.user.email ||
      "Unknown Attendant";
    const attendantId = req.session.user._id;

    const newStock = new attendantstockModel({
      productName,
      productType,
      productPrice: Number(productPrice),
      costPrice: Number(costPrice),
      quantity: Number(quantity),
      supplierName,
      date: new Date(date),
      quality,
      color: color || undefined,
      measurements: measurements || undefined,
      recordedBy: attendantName,
      attendantId: attendantId,
      recordedAt: new Date(),
    });

    await newStock.save();
    res.redirect("/attendant?success=Stock recorded successfully");
  } catch (error) {
    console.error("Error recording stock:", error);
    res.redirect("/attendant?error=Failed to record stock: " + error.message);
  }
});

// API endpoint to get filtered stock data
router.get("/api/stock", async (req, res) => {
  try {
    const { dateFrom, dateTo, productName, quality, supplier } = req.query;

    let query = {};

    if (dateFrom || dateTo) {
      query.date = {};
      if (dateFrom) query.date.$gte = new Date(dateFrom);
      if (dateTo) query.date.$lte = new Date(dateTo);
    }

    if (productName) query.productName = productName;
    if (quality) query.quality = quality;
    if (supplier) query.supplierName = supplier;

    const stocks = await attendantstockModel.find(query).sort({ date: -1 });

    res.json({
      success: true,
      data: stocks,
    });
  } catch (error) {
    console.error("Error fetching filtered stock:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching stock data",
    });
  }
});

// API endpoint to get stock statistics
router.get("/api/stock/stats", async (req, res) => {
  try {
    const { dateFrom, dateTo } = req.query;

    let matchQuery = {};
    if (dateFrom || dateTo) {
      matchQuery.date = {};
      if (dateFrom) matchQuery.date.$gte = new Date(dateFrom);
      if (dateTo) matchQuery.date.$lte = new Date(dateTo);
    }

    const stats = await attendantstockModel.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: null,
          totalItems: { $sum: 1 },
          totalQuantity: { $sum: "$quantity" },
          totalValue: { $sum: { $multiply: ["$productPrice", "$quantity"] } },
          totalCost: { $sum: { $multiply: ["$costPrice", "$quantity"] } },
        },
      },
    ]);

    res.json({
      success: true,
      data: stats[0] || {
        totalItems: 0,
        totalQuantity: 0,
        totalValue: 0,
        totalCost: 0,
      },
    });
  } catch (error) {
    console.error("Error fetching stock statistics:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching statistics",
    });
  }
});

module.exports = router;
