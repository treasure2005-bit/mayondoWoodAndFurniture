const express = require("express");
const router = express.Router();
const {ensureauthenticated,ensureAgent} = require("../middleware/auth")

const salesModel = require("../models/salesModel");

// GET: Display edit form for specific sale
router.get("/editSales/:id", async (req, res) => {
  try {
    const sale = await salesModel.findById(req.params.id);
    if (!sale) {
      return res.status(404).send("sale not found");
    }
    res.render("editSales", { sale });
  } catch (error) {
    console.error("Error fetching sale for edit:", error);
    res.status(500).send("Error loading edit form");
  }
});

// POST: Handle sale updates
router.post("/editSales/:id", async (req, res) => {
  try {
    const updatedSales = await salesModel.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!updatedSales) {
      return res.status(404).send("sale not found");
    }

    res.redirect("/salesTable");
  } catch (error) {
    console.error("Error updating sale:", error);
    res.status(500).send("Error updating sale");
  }
});

// POST: Handle sale deletion
router.post("/deleteSales/:id", async (req, res) => {
  try {
    const deletedSales = await salesModel.findByIdAndDelete(req.params.id);
    if (!deletedSales) {
      return res.status(404).send("sale not found");
    }
    res.redirect("/salesTable");
  } catch (error) {
    console.error("Error deleting sale:", error);
    res.status(500).send("Error deleting sale");
  }
});

router.get("/recordingSales", (req, res) => {
    res.render("recordingSales");
});


router.post("/recordingSales",ensureauthenticated,ensureAgent, async (req, res) => {
    try{
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
        const userId = req.session.user._id;

        const sale = new salesModel({
          customerName,
          productType,
          productName,
          quantitySold,
          unitPrice,
          date,
          paymentType,
          salesAgent: userId,
          checkBox,
        });
        console.log(userId);
        await sale.save();
        res.redirect("/salesTable")
    }  catch (error) {
        console.error(error);
        res.redirect("/recordingSales");
    }
});


// router.get("/salesTable", (req, res) => {
//     res.render("salesTable");
// });

router.get("/salesTable", async (req, res) => {
  try {
    const sales = await salesModel.find()
    .populate("salesAgent", "email");

    console.log(
      "Sales data:",
      sales.map((sale) => ({
        id: sale._id,
        salesAgent: sale.salesAgent,
        customerName: sale.customerName,
      }))
    );


    const currentUser = req.session.user;


    console.log(currentUser);
    res.render("salesTable", { sales, currentUser });
  } catch (error) {
    console.log(error.message);
    res.redirect("/salesTable")
  }
});

router.get("/getReceipt/:id", async (req, res) => {
  try {
    const sale = await salesModel.findOne({_id:req.params.id}).populate("salesAgent", "fullname");
    res.render("receipt", { sale });
  } catch (error) {
    console.error(error.message);
    res.status(400).send("Unble to find sale");
  }
});




module.exports = router;