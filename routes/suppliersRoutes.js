const express = require("express");
const router = express.Router();
// const passport = require("passport");
const moment = require("moment");

// const Supplier = require("../models/suppliersModel"); 
const suppliersModel = require("../models/suppliersModel");

// GET suppliers page
router.get("/suppliers", async (req, res) => {
  try {
    const suppliers = await suppliersModel.find().sort({ createdAt: -1 });
    console.log("Number of suppliers found:", suppliers.length);
    res.render("suppliers", { suppliers: suppliers });
  } catch (error) {
    console.error("Error fetching suppliers:", error);
    res.render("suppliers", { suppliers: [] });
  }
});

//GET SUPPLIERS TABLE
router.get("/suppliersTable", async (_req, res) => {
  try {
    const suppliers = await suppliersModel.find().sort({ $natural: -1 });
    res.render("suppliersTable", { suppliers, moment });
  } catch (error) {
    console.error("Error fetching stock:", error);
    res.status(500).send("Unable to get data from the database");
  }
});


// POST add new supplier
router.post("/suppliers/add", async (req, res) => {
  try {
    console.log("Received form data:", req.body);

    const newSupplier = new suppliersModel({
      name: req.body.name,
      contact: req.body.contact,
      phone: req.body.phone,
      location: req.body.location,
      woodType: req.body.woodType,
      payment: req.body.payment,
    });

    await newSupplier.save();
    console.log("Supplier saved successfully!");
    res.redirect("/suppliersTable");
  } catch (error) {
    console.error("Error saving supplier:", error);
    res.redirect("/suppliers");
  }
});


// edit supplier
router.get("/editSupplier/:id", async (req, res) => {
  try {
    const supplier = await suppliersModel.findById(req.params.id);
    if (!supplier) {
      return res.status(404).send("supplier not found");
    }
    res.render("editSuppliers", { supplier });
  } catch (error) {
    console.error("Error fetching supplier for edit:", error);
    res.status(500).send("Error loading edit form");
  }
});

router.post("/editSupplier/:id", async (req, res) => {
  try {
    const updatedSupplier = await suppliersModel.findByIdAndUpdate(
      req.params.id,
      {
        name: req.body.name,
        contact: req.body.contact,
        phone: req.body.phone,
        location: req.body.location,
        woodType: req.body.woodType,
        payment: req.body.payment,
      },
      { new: true, runValidators: true }
    );

    if (!updatedSupplier) {
      return res.status(404).send("Supplier not found");
    }

    res.redirect("/suppliersTable");
  } catch (error) {
    console.error("Error updating supplier:", error);
    res.status(500).send("Error updating supplier");
  }
});

router.post("/deleteSupplier/:id", async (req, res) => {
  try {
    const deletedSupplier = await suppliersModel.findByIdAndDelete(req.params.id);
    if (!deletedSupplier) {
      return res.status(404).send("Supplier not found");
    }
    res.redirect("/suppliersTable");
  } catch (error) {
    console.error("Error deleting supplier:", error);
    res.status(500).send("Error deleting supplier");
  }
});









module.exports = router;