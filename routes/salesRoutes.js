const express = require("express");
const router = express.Router();
const salesModel = require("../models/salesModel");
const stockModel = require("../models/stockModel");
const attendantstockModel = require("../models/attendantstockModel");

// FIXED Authentication middleware - uses session instead of Passport
const isAuthenticated = (req, res, next) => {
  if (req.session.user) {
    return next();
  }
  res.redirect("/login");
};

// Sales Table - Shows edit/delete only for Managers
router.get("/salesTable", isAuthenticated, async (req, res) => {
  try {
    const sales = await salesModel
      .find()
      .populate("salesAgent", "fullName email")
      .sort({ _id: -1 });

    res.render("salesTable", {
      title: "Sales Records",
      sales: sales,
      user: req.session.user,
      userRole: req.session.user.role,
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
      user: req.session.user,
    });
  } catch (error) {
    console.error("Error loading recording sales page:", error);
    res.status(500).send("Error loading page");
  }
});

// Create new sale with SMART STOCK REDUCTION
router.post("/recordingSales", isAuthenticated, async (req, res) => {
  try {
    const {
      customerName,
      productType,
      productName,
      quantitySold,
      unitPrice,
      date,
      paymentType,
      checkBox,
    } = req.body;

    const soldQuantity = parseInt(quantitySold);

    // ✅ SMART LOGIC: Check which stock table to use based on product type
    const isWoodProduct =
      productType?.toLowerCase().includes("wood") ||
      productType?.toLowerCase().includes("timber") ||
      productName?.toLowerCase().includes("wood") ||
      productName?.toLowerCase().includes("timber");

    let product;
    let stockSource;

    if (isWoodProduct) {
      // Wood products - Check attendant stock first
      product = await attendantstockModel.findOne({
        productName: productName.toLowerCase(),
        productType: productType,
      });
      stockSource = "attendantstock";

      // If not found in attendant stock, try manager stock
      if (!product) {
        product = await stockModel.findOne({
          productName: productName.toLowerCase(),
          productType: productType,
        });
        stockSource = "managerstock";
      }
    } else {
      // Non-wood products - Use manager stock
      product = await stockModel.findOne({
        productName: productName.toLowerCase(),
        productType: productType,
      });
      stockSource = "managerstock";
    }

    // Check if product exists
    if (!product) {
      return res
        .status(400)
        .send(
          `Error: Product "${productName}" not found in stock. Please register it first.`
        );
    }

    // Check if enough quantity is available
    if (product.quantity < soldQuantity) {
      return res
        .status(400)
        .send(
          `Error: Insufficient stock for "${productName}". Available: ${product.quantity}, Requested: ${soldQuantity}`
        );
    }

    // Create the sale
    const newSale = new salesModel({
      customerName: customerName,
      productType: productType,
      productName: productName,
      quantitySold: soldQuantity,
      unitPrice: unitPrice,
      date: date,
      paymentType: paymentType,
      salesAgent: req.session.user._id,
      checkBox: checkBox || "",
    });

    await newSale.save();

    // ✅ REDUCE STOCK from the correct table
    product.quantity = product.quantity - soldQuantity;
    await product.save();

    console.log(
      `✅ Sale recorded: ${productName} x${soldQuantity}. Stock source: ${stockSource}. Remaining: ${product.quantity}`
    );

    res.redirect("/salesTable");
  } catch (error) {
    console.error("Error recording sale:", error);
    res.status(500).send("Error recording sale");
  }
});

// Edit sale - Only for Managers
router.get("/editSales/:id", isAuthenticated, async (req, res) => {
  if (req.session.user.role !== "Manager") {
    return res.status(403).send("Access denied. Managers only.");
  }

  try {
    const sale = await salesModel.findById(req.params.id);
    res.render("editSales", {
      title: "Edit Sale",
      sale: sale,
      user: req.session.user,
    });
  } catch (error) {
    console.error("Error loading sale:", error);
    res.status(500).send("Error loading sale");
  }
});

// Update sale - Only for Managers (with stock adjustment)
router.post("/editSales/:id", isAuthenticated, async (req, res) => {
  if (req.session.user.role !== "Manager") {
    return res.status(403).send("Access denied. Managers only.");
  }

  try {
    // Get the original sale
    const originalSale = await salesModel.findById(req.params.id);
    const originalQuantity = originalSale.quantitySold;
    const newQuantity = parseInt(req.body.quantitySold);

    // Determine if it's a wood product
    const isWoodProduct =
      originalSale.productType?.toLowerCase().includes("wood") ||
      originalSale.productType?.toLowerCase().includes("timber") ||
      originalSale.productName?.toLowerCase().includes("wood") ||
      originalSale.productName?.toLowerCase().includes("timber");

    let product;

    // Find product in correct stock table
    if (isWoodProduct) {
      product = await attendantstockModel.findOne({
        productName: originalSale.productName.toLowerCase(),
        productType: originalSale.productType,
      });

      if (!product) {
        product = await stockModel.findOne({
          productName: originalSale.productName.toLowerCase(),
          productType: originalSale.productType,
        });
      }
    } else {
      product = await stockModel.findOne({
        productName: originalSale.productName.toLowerCase(),
        productType: originalSale.productType,
      });
    }

    if (product) {
      // Restore original quantity first
      product.quantity = product.quantity + originalQuantity;

      // Check if new quantity is available
      if (product.quantity < newQuantity) {
        return res
          .status(400)
          .send(
            `Error: Insufficient stock. Available: ${product.quantity}, Requested: ${newQuantity}`
          );
      }

      // Deduct new quantity
      product.quantity = product.quantity - newQuantity;
      await product.save();
    }

    // Update the sale
    await salesModel.findByIdAndUpdate(req.params.id, req.body);

    console.log(
      `✅ Sale updated. Stock adjusted for ${originalSale.productName}`
    );

    res.redirect("/salesTable");
  } catch (error) {
    console.error("Error updating sale:", error);
    res.status(500).send("Error updating sale");
  }
});

// Delete sale - Only for Managers (with stock restoration)
router.post("/sales/delete/:id", isAuthenticated, async (req, res) => {
  if (req.session.user.role !== "Manager") {
    return res.status(403).send("Access denied. Managers only.");
  }

  try {
    // Get the sale before deleting
    const sale = await salesModel.findById(req.params.id);

    if (sale) {
      // Determine if it's a wood product
      const isWoodProduct =
        sale.productType?.toLowerCase().includes("wood") ||
        sale.productType?.toLowerCase().includes("timber") ||
        sale.productName?.toLowerCase().includes("wood") ||
        sale.productName?.toLowerCase().includes("timber");

      let product;

      // Find product in correct stock table
      if (isWoodProduct) {
        product = await attendantstockModel.findOne({
          productName: sale.productName.toLowerCase(),
          productType: sale.productType,
        });

        if (!product) {
          product = await stockModel.findOne({
            productName: sale.productName.toLowerCase(),
            productType: sale.productType,
          });
        }
      } else {
        product = await stockModel.findOne({
          productName: sale.productName.toLowerCase(),
          productType: sale.productType,
        });
      }

      if (product) {
        product.quantity = product.quantity + sale.quantitySold;
        await product.save();
        console.log(
          `✅ Stock restored: ${sale.productName} +${sale.quantitySold}`
        );
      }
    }

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
      .populate("salesAgent", "fullName email");

    if (!sale) {
      return res.status(404).send("Receipt not found");
    }

    res.render("receipt", {
      title: "Receipt",
      sale: sale,
      user: req.session.user,
    });
  } catch (error) {
    console.error("Error loading receipt:", error);
    res.status(500).send("Error loading receipt");
  }
});

module.exports = router;
