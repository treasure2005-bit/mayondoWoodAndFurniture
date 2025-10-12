const express = require("express");
const router = express.Router();
const Offloading = require("../models/offloadingModel");
const attendantstockModel = require("../models/attendantstockModel");
const UserModel = require("../models/userModel");

// Middleware to check if user is authenticated and is attendant
const isAttendant = (req, res, next) => {
  if (req.isAuthenticated() && req.user.role === "Attendant") {
    return next();
  }
  res.redirect("/login");
};

// OFFLOADING FORM PAGE - Display form
router.get("/offloadingform", isAttendant, (req, res) => {
  res.render("offloadingform", {
    title: "Offloading Form",
    user: req.user,
  });
});

// OFFLOADING FORM SUBMISSION - Handle form data
router.post("/offloadingform", isAttendant, async (req, res) => {
  if (req.is("application/json")) {
    // Handle JSON request (AJAX submission)
    try {
      const offloadingData = new Offloading({
        deliveryReference: req.body.deliveryReference,
        offloadingDate: req.body.offloadingDate,
        vehicleInfo: req.body.vehicleInfo,
        driverName: req.body.driverName,
        productCategory: req.body.productCategory,
        productName: req.body.productName,
        expectedQuantity: req.body.expectedQuantity,
        actualQuantity: req.body.actualQuantity,
        unit: req.body.unit,
        discrepancy: req.body.discrepancy,
        productCondition: req.body.productCondition,
        damageDescription: req.body.damageDescription,
        photosRequired: req.body.photosRequired || false,
        attendantName: req.user.fullName || req.user.username,
        storageLocation: req.body.storageLocation,
        receivedBy: req.body.receivedBy,
        additionalNotes: req.body.additionalNotes,
        createdBy: req.user._id,
        createdByName: req.user.fullName || req.user.username,
      });

      await offloadingData.save();

      // ✅ AUTO-ADD TO STOCK if quantities match and condition is good
      if (
        req.body.discrepancy === "match" &&
        (req.body.productCondition === "excellent" ||
          req.body.productCondition === "good")
      ) {
        // Check if product already exists in stock
        const existingStock = await attendantstockModel.findOne({
          productName: req.body.productName,
          productType: req.body.productCategory,
        });

        if (existingStock) {
          // Product exists - ADD to existing quantity
          existingStock.quantity += parseInt(req.body.actualQuantity);
          await existingStock.save();
          console.log(
            `✅ Stock updated: ${req.body.productName} +${req.body.actualQuantity}. New total: ${existingStock.quantity}`
          );
        } else {
          // Product doesn't exist - CREATE new stock entry
          // You'll need to provide additional required fields
          const newStock = new attendantstockModel({
            productName: req.body.productName,
            productType: req.body.productCategory,
            productPrice: 0, // Set default or get from form
            quantity: parseInt(req.body.actualQuantity),
            costPrice: 0, // Set default or calculate
            supplierName: "Delivery",
            date: req.body.offloadingDate,
            quality: req.body.productCondition,
            color: "", // Optional
            measurements: "", // Optional
            recordedBy: req.user.fullName || req.user.username,
            attendantId: req.user._id.toString(),
            recordedAt: new Date(),
          });
          await newStock.save();
          console.log(
            `✅ New stock created: ${req.body.productName} x${req.body.actualQuantity}`
          );
        }
      }

      res.json({
        success: true,
        message: "Offloading operation recorded successfully!",
        redirectUrl: "/offloadinglist",
        data: offloadingData,
      });
    } catch (error) {
      console.error("Offloading form submission error:", error);

      if (error.name === "ValidationError") {
        return res.status(400).json({
          success: false,
          message:
            "Validation error: " +
            Object.values(error.errors)
              .map((e) => e.message)
              .join(", "),
        });
      }

      res.status(500).json({
        success: false,
        message: "Failed to record offloading operation. Please try again.",
      });
    }
  } else {
    // Handle regular form submission
    try {
      const offloadingData = new Offloading(req.body);
      offloadingData.createdBy = req.user._id;
      offloadingData.createdByName = req.user.fullName || req.user.username;
      offloadingData.attendantName = req.user.fullName || req.user.username;

      await offloadingData.save();

      // ✅ AUTO-ADD TO STOCK if quantities match and condition is good
      if (
        req.body.discrepancy === "match" &&
        (req.body.productCondition === "excellent" ||
          req.body.productCondition === "good")
      ) {
        const existingStock = await attendantstockModel.findOne({
          productName: req.body.productName,
          productType: req.body.productCategory,
        });

        if (existingStock) {
          // Product exists - ADD to existing quantity
          existingStock.quantity += parseInt(req.body.actualQuantity);
          await existingStock.save();
          console.log(
            `✅ Stock updated: ${req.body.productName} +${req.body.actualQuantity}. New total: ${existingStock.quantity}`
          );
        } else {
          // Product doesn't exist - CREATE new stock entry
          const newStock = new attendantstockModel({
            productName: req.body.productName,
            productType: req.body.productCategory,
            productPrice: 0, // Set default or get from form
            quantity: parseInt(req.body.actualQuantity),
            costPrice: 0, // Set default or calculate
            supplierName: "Delivery",
            date: req.body.offloadingDate,
            quality: req.body.productCondition,
            color: "", // Optional
            measurements: "", // Optional
            recordedBy: req.user.fullName || req.user.username,
            attendantId: req.user._id.toString(),
            recordedAt: new Date(),
          });
          await newStock.save();
          console.log(
            `✅ New stock created: ${req.body.productName} x${req.body.actualQuantity}`
          );
        }
      }

      res.redirect("/offloadinglist");
    } catch (error) {
      console.error("Offloading form error:", error);
      res.status(500).send("Error saving offloading form");
    }
  }
});

// OFFLOADING LIST PAGE - Display all offloading records
router.get("/offloadinglist", isAttendant, async (req, res) => {
  try {
    const offloadings = await Offloading.find()
      .sort({ offloadingDate: -1 })
      .populate("createdBy", "username fullName");

    res.render("offloadinglist", {
      title: "All Offloading Operations",
      offloadings: offloadings,
      user: req.user,
    });
  } catch (error) {
    console.error("Error fetching offloadings:", error);
    res.status(500).send("Error loading offloadings page");
  }
});

// EDIT OFFLOADING PAGE - Display edit form
router.get("/offloadingform/:id/edit", isAttendant, async (req, res) => {
  try {
    const offloading = await Offloading.findById(req.params.id);

    if (!offloading) {
      return res.status(404).send("Offloading record not found");
    }

    res.render("editoffloading", {
      title: "Edit Offloading",
      offloading: offloading,
      user: req.user,
    });
  } catch (error) {
    console.error("Error fetching offloading:", error);
    res.status(500).send("Error loading edit page");
  }
});

// UPDATE OFFLOADING - Handle update form submission
router.post("/offloadingform/:id/update", isAttendant, async (req, res) => {
  try {
    await Offloading.findByIdAndUpdate(req.params.id, {
      deliveryReference: req.body.deliveryReference,
      offloadingDate: req.body.offloadingDate,
      vehicleInfo: req.body.vehicleInfo,
      driverName: req.body.driverName,
      productCategory: req.body.productCategory,
      productName: req.body.productName,
      expectedQuantity: req.body.expectedQuantity,
      actualQuantity: req.body.actualQuantity,
      unit: req.body.unit,
      discrepancy: req.body.discrepancy,
      productCondition: req.body.productCondition,
      damageDescription: req.body.damageDescription,
      photosRequired: req.body.photosRequired || false,
      attendantName: req.body.attendantName,
      storageLocation: req.body.storageLocation,
      receivedBy: req.body.receivedBy,
      additionalNotes: req.body.additionalNotes,
      updatedBy: req.user._id,
      updatedAt: new Date(),
    });

    res.redirect("/offloadinglist");
  } catch (error) {
    console.error("Error updating offloading:", error);
    res.status(500).send("Error updating offloading record");
  }
});

// DELETE OFFLOADING - Handle delete
router.post("/offloadingform/:id/delete", isAttendant, async (req, res) => {
  try {
    await Offloading.findByIdAndDelete(req.params.id);
    res.redirect("/offloadinglist");
  } catch (error) {
    console.error("Error deleting offloading:", error);
    res.status(500).send("Error deleting offloading record");
  }
});

// API: Get offloading by delivery reference
router.get("/api/offloading/reference/:ref", isAttendant, async (req, res) => {
  try {
    const offloading = await Offloading.findOne({
      deliveryReference: req.params.ref,
    });

    if (!offloading) {
      return res.status(404).json({
        success: false,
        message: "Offloading record not found",
      });
    }

    res.json({
      success: true,
      data: offloading,
    });
  } catch (error) {
    console.error("Error fetching offloading:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching offloading record",
    });
  }
});

// API: Get all offloadings with discrepancies
router.get("/api/offloading/discrepancies", isAttendant, async (req, res) => {
  try {
    const discrepancies = await Offloading.find({
      discrepancy: { $in: ["shortage", "excess"] },
    }).sort({ offloadingDate: -1 });

    res.json({
      success: true,
      count: discrepancies.length,
      data: discrepancies,
    });
  } catch (error) {
    console.error("Error fetching discrepancies:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching discrepancy records",
    });
  }
});

// API: Get damaged products
router.get("/api/offloading/damaged", isAttendant, async (req, res) => {
  try {
    const damagedProducts = await Offloading.find({
      productCondition: { $in: ["fair", "poor", "damaged"] },
    }).sort({ offloadingDate: -1 });

    res.json({
      success: true,
      count: damagedProducts.length,
      data: damagedProducts,
    });
  } catch (error) {
    console.error("Error fetching damaged products:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching damaged product records",
    });
  }
});

module.exports = router;
