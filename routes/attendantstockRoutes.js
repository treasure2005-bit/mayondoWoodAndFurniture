const express = require("express");
const router = express.Router();
const moment = require("moment");
const {ensureauthenticated, ensureAgent} = require("../middleware/auth")



const attendantstockModel = require("../models/attendantstockModel");


router.get("/attendantstock", (_req, res) => {
  res.render("attendantstock");
});

router.post("/attendantstock", async (req, res) => {
  try {
    // parse numbers safely
    const unitPrice = Number(req.body.productPrice) || 0;
    const qty = Number(req.body.quantity) || 0;

    // compute total cost from unit price * quantity
    const totalCost = unitPrice * qty;

    // build payload to save (override costPrice to guarantee consistency)
    const payload = {
      ...req.body,
      productPrice: unitPrice,
      quantity: qty,
      costPrice: totalCost,
    };

    const stock = new attendantstockModel(payload);
    await stock.save();
    res.redirect("/attendantstocklist");
  } catch (error) {
    res.status(400).send(error.message);
  }
});


router.get("/attendant", (_req, res) => {
  res.render("attendant");
});

// GET: Display all stock items
router.get("/attendantstocklist", async (_req, res) => {
  try {
    const items = await attendantstockModel.find().sort({ $natural: -1 });
    res.render("attendantstocklist", { items, moment });
  } catch (error) {
    console.error("Error fetching stock:", error);
    res.status(500).send("Unable to get data from the database");
  }
});


// GET: Display edit form for specific stock item
router.get("/editstock/:id", async (req, res) => {
  try {
    const item = await attendantstockModel.findById(req.params.id);
    if (!item) {
      return res.status(404).send("Product not found");
    }
    res.render("editstock", { item });
  } catch (error) {
    console.error("Error fetching item for edit:", error);
    res.status(500).send("Error loading edit form");
  }
});

// POST: Handle stock updates
router.post("/editstock/:id", async (req, res) => {
  try {
    const updatedProduct = await attendantstockModel.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!updatedProduct) {
      return res.status(404).send("Product not found");
    }

    res.redirect("/attendantstocklist");
  } catch (error) {
    console.error("Error updating product:", error);
    res.status(500).send("Error updating product");
  }
});

// POST: Handle stock deletion
router.post("/deleteStock/:id", async (req, res) => {
  try {
    const deletedProduct = await attendantstockModel.findByIdAndDelete(req.params.id);
    if (!deletedProduct) {
      return res.status(404).send("Product not found");
    }
    res.redirect("/attendantstocklist");
  } catch (error) {
    console.error("Error deleting product:", error);
    res.status(500).send("Error deleting product");
  }
});


router.get("/stock-report", async (req, res) => {
  const stock = await attendantstockModel.find();
  res.render("stockReport", { stock });
});







module.exports = router;
