const express = require("express");
const router = express.Router();
const stockModel = require("../models/stockModel"); // Adjust path as needed
const salesModel = require("../models/salesModel"); // Adjust path as needed

router.get("/reports", async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    // Build date filter
    let dateFilter = {};

    if (startDate || endDate) {
      dateFilter.date = {};

      if (startDate) {
        dateFilter.date.$gte = new Date(startDate);
      }

      if (endDate) {
        // Set to end of day
        const endDateTime = new Date(endDate);
        endDateTime.setHours(23, 59, 59, 999);
        dateFilter.date.$lte = endDateTime;
      }
    }

    // Fetch stock data with date filter
    const stock = await stockModel.find(dateFilter).sort({ date: -1 });

    // Fetch sales data with date filter
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

// const express = require("express");
// const router = express.Router();
// const Stock = require("../models/stockModel");
// const Sale = require("../models/salesModel");

// router.get("/reports", async (req, res) => {
//   try {
//     const stockData = await Stock.find();
//     const salesData = await Sale.find();

//     console.log("Stock:", stockData);
//     console.log("Sales:", salesData);

//     res.render("reports", {
//       stock: stockData,
//       sales: salesData,
//     });
//   } catch (error) {
//     console.error("Error fetching reports:", error);
//     res.status(500).send("Error fetching reports");
//   }
// });

// module.exports = router;
