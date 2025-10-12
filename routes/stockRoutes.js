const express = require("express");
const router = express.Router();
const moment = require("moment");
const { ensureauthenticated, ensureManager } = require("../middleware/auth");

const stockModel = require("../models/stockModel");

// GET: Display stock registration form
router.get("/registerStock", (_req, res) => {
  res.render("stock");
});

// GET: Suppliers page
router.get("/suppliers", (_req, res) => {
  res.render("suppliers");
});

// POST: Handle stock registration with automatic inventory update
router.post("/registerStock", async (req, res) => {
  try {
    const {
      productName,
      productType,
      quantity,
      costPrice,
      productPrice,
      supplierName,
      quality,
      color,
      measurement,
      managerName,
      managerId,
      date,
      status,
    } = req.body;

    // Check if product already exists (same name, type, and color)
    const existingProduct = await stockModel.findOne({
      productName: productName,
      productType: productType,
      color: color,
    });

    if (existingProduct) {
      // Product exists - UPDATE quantity and prices
      existingProduct.quantity =
        parseInt(existingProduct.quantity) + parseInt(quantity);
      existingProduct.costPrice = costPrice; // Update to latest cost
      existingProduct.productPrice = productPrice; // Update to latest price
      existingProduct.supplierName = supplierName;
      existingProduct.quality = quality;
      existingProduct.measurement = measurement;
      existingProduct.date = date;
      existingProduct.managerName = managerName;
      existingProduct.managerId = managerId;
      existingProduct.status = status;

      await existingProduct.save();
      console.log(
        `✅ Updated existing product: ${productName}. New quantity: ${existingProduct.quantity}`
      );
    } else {
      // Product doesn't exist - CREATE new entry
      const newStock = new stockModel(req.body);
      await newStock.save();
      console.log(
        `✅ Created new product: ${productName} with quantity: ${quantity}`
      );
    }

    res.redirect("/products");
  } catch (error) {
    console.error("Error saving stock:", error);
    res.redirect("/registerStock");
  }
});

// GET: Products Inventory Page (NEW ROUTE)
router.get("/products", async (req, res) => {
  try {
    // Get all products with aggregated quantities
    const products = await stockModel.find().sort({ productName: 1 });

    // Calculate statistics
    const totalQuantity = products.reduce(
      (sum, product) => sum + (product.quantity || 0),
      0
    );
    const lowStockCount = products.filter(
      (product) => product.quantity > 0 && product.quantity <= 5
    ).length;

    res.render("products", {
      title: "Products Inventory",
      products: products,
      totalQuantity: totalQuantity,
      lowStockCount: lowStockCount,
      moment: moment,
    });
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).send("Unable to get products from database");
  }
});

// GET: Product Details Page (NEW ROUTE)
router.get("/productDetails/:id", async (req, res) => {
  try {
    const product = await stockModel.findById(req.params.id);
    if (!product) {
      return res.status(404).send("Product not found");
    }
    res.render("productDetails", {
      title: "Product Details",
      product: product,
      moment: moment,
    });
  } catch (error) {
    console.error("Error fetching product details:", error);
    res.status(500).send("Error loading product details");
  }
});

// GET: Display dashboard
router.get("/dashboard", (_req, res) => {
  res.render("dashboard", { title: "Dashboard page" });
});

// GET: Display all stock items (original stock history)
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
