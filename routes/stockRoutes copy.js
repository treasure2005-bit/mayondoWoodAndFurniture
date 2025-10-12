const express = require("express");
const router = express.Router();
exports.router = router;
const moment = require("moment");
const {ensureauthenticated, ensureManager} = require("../middleware/auth")



const stockModel = require("../models/stockModel");

//ensureauthenticated,ensureManager,
  // GET: Display stock registration form
  router.get("/registerStock", (_req, res) => {
    res.render("stock");
  });




router.get("/suppliers", (_req, res) => {
  res.render("suppliers");
});




//ensureauthenticated,ensureManager,
  // POST: Handle stock registration
  router.post("/registerStock", async (req, res) => {
    try {
      const stock = new stockModel(req.body);
      await stock.save();
      res.redirect("/stocklist");
    } catch (error) {
      console.error("Error saving stock:", error);
      res.redirect("/registerStock");
    }
  });

// GET: Display dashboard
router.get("/dashboard", (_req, res) => {
  res.render("dashboard", { title: "Dashboard page" });
});

// GET: Display all stock items
router.get("/stocklist", async (_req, res) => {
  try {
    const items = await stockModel.find().sort({ $natural: -1 });
    res.render("stockTable", { items, moment });
  } catch (error) {
    console.error("Error fetching stock:", error);
    res.status(500).send("Unable to get data from the database");
  }
});

// GET: Display edit form for specific stock item
router.get("/editstock/:id", async (req, res) => {
  try {
    const item = await stockModel.findById(req.params.id);
    if (!item) {
      return res.status(404).send("Product not found");
    }
    res.render("editStock", { item });
  } catch (error) {
    console.error("Error fetching item for edit:", error);
    res.status(500).send("Error loading edit form");
  }
});

// POST: Handle stock updates
router.post("/editStock/:id", async (req, res) => {
  try {
    const updatedProduct = await stockModel.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!updatedProduct) {
      return res.status(404).send("Product not found");
    }

    res.redirect("/stocklist");
  } catch (error) {
    console.error("Error updating product:", error);
    res.status(500).send("Error updating product");
  }
});

// POST: Handle stock deletion
router.post("/deleteStock/:id", async (req, res) => {
  try {
    const deletedProduct = await stockModel.findByIdAndDelete(req.params.id);
    if (!deletedProduct) {
      return res.status(404).send("Product not found");
    }
    res.redirect("/stocklist");
  } catch (error) {
    console.error("Error deleting product:", error);
    res.status(500).send("Error deleting product");
  }
});

module.exports = router;
