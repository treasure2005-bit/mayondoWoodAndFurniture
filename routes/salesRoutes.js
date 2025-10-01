const express = require("express");
const router = express.Router();
const salesModel = require("../models/salesModel");

// Middleware to check authentication - FIXED VERSION
const isAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect("/login");
};

// Sales Table - Shows edit/delete only for Managers
router.get("/salesTable", isAuthenticated, async (req, res) => {
  try {
    const sales = await salesModel
      .find()
      .populate("salesAgent", "username email")
      .sort({ _id: -1 });

    res.render("salesTable", {
      title: "Sales Records",
      sales: sales,
      user: req.user,
      userRole: req.user.role, // Pass role to template
    });
  } catch (error) {
    console.error("Error fetching sales:", error);
    res.status(500).send("Error loading sales");
  }
});

// Recording Sales Page
router.get("/recordingSales", isAuthenticated, async (req, res) => {
  try {
    res.render("recordingSales", {
      title: "Record Sale",
      user: req.user,
    });
  } catch (error) {
    console.error("Error loading recording sales page:", error);
    res.status(500).send("Error loading page");
  }
});

// Create new sale
router.post("/recordingSales", isAuthenticated, async (req, res) => {
  try {
    const newSale = new salesModel({
      customerName: req.body.customerName,
      productType: req.body.productType,
      productName: req.body.productName,
      quantitySold: req.body.quantitySold,
      unitPrice: req.body.unitPrice,
      date: req.body.date,
      paymentType: req.body.paymentType,
      salesAgent: req.user._id,
      checkBox: req.body.checkBox || "",
    });

    await newSale.save();
    res.redirect("/salesTable");
  } catch (error) {
    console.error("Error recording sale:", error);
    res.status(500).send("Error recording sale");
  }
});

// Edit sale - Only for Managers
router.get("/sales/edit/:id", isAuthenticated, async (req, res) => {
  // Check if user is Manager
  if (req.user.role !== "Manager") {
    return res.status(403).send("Access denied. Managers only.");
  }

  try {
    const sale = await salesModel.findById(req.params.id);
    res.render("editSale", {
      title: "Edit Sale",
      sale: sale,
      user: req.user,
    });
  } catch (error) {
    console.error("Error loading sale:", error);
    res.status(500).send("Error loading sale");
  }
});

// Update sale - Only for Managers
router.post("/sales/edit/:id", isAuthenticated, async (req, res) => {
  // Check if user is Manager
  if (req.user.role !== "Manager") {
    return res.status(403).send("Access denied. Managers only.");
  }

  try {
    await salesModel.findByIdAndUpdate(req.params.id, req.body);
    res.redirect("/salesTable");
  } catch (error) {
    console.error("Error updating sale:", error);
    res.status(500).send("Error updating sale");
  }
});

// Delete sale - Only for Managers
router.post("/sales/delete/:id", isAuthenticated, async (req, res) => {
  // Check if user is Manager
  if (req.user.role !== "Manager") {
    return res.status(403).send("Access denied. Managers only.");
  }

  try {
    await salesModel.findByIdAndDelete(req.params.id);
    res.redirect("/salesTable");
  } catch (error) {
    console.error("Error deleting sale:", error);
    res.status(500).send("Error deleting sale");
  }
});

// View Receipt
router.get("/getReceipt/:id", isAuthenticated, async (req, res) => {
  try {
    const sale = await salesModel
      .findById(req.params.id)
      .populate("salesAgent", "username email");

    if (!sale) {
      return res.status(404).send("Receipt not found");
    }

    res.render("receipt", {
      title: "Receipt",
      sale: sale,       // 👈 pass sale to Pug
      user: req.user,
    });
  } catch (error) {
    console.error("Error loading receipt:", error);
    res.status(500).send("Error loading receipt");
  }
});


module.exports = router;
