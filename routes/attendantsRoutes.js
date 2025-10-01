const express = require("express");
const router = express.Router();
const attendantstockModel = require("../models/attendantstockModel");
const salesModel = require("../models/salesModel");
const Loading = require("../models/loadingformModel");
const Supplier = require("../models/suppliersModel");

// Middleware to check if user is authenticated and is attendant
const isAttendant = (req, res, next) => {
  if (req.isAuthenticated() && req.user.role === "Attendant") {
    return next();
  }
  res.redirect("/login");
};

// ============ DASHBOARD PAGE ============
router.get("/attendant", isAttendant, (req, res) => {
  res.render("attendant", {
    title: "Attendant Dashboard",
    user: req.user,
  });
});

// ============ DASHBOARD STATS API ============
router.get("/api/attendant/stats", isAttendant, async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Today's sales count
    const todaySalesCount = await salesModel.countDocuments({
      date: {
        $gte: today.toISOString().split("T")[0],
        $lt: tomorrow.toISOString().split("T")[0],
      },
    });

    // Today's revenue
    const todaySales = await salesModel.find({
      date: {
        $gte: today.toISOString().split("T")[0],
        $lt: tomorrow.toISOString().split("T")[0],
      },
    });

    const todayRevenue = todaySales.reduce((sum, sale) => {
      return sum + sale.quantitySold * sale.unitPrice;
    }, 0);

    // Total stock items
    const stockItemsCount = await attendantstockModel.countDocuments();

    // Low stock alerts (quantity < 10)
    const lowStockCount = await attendantstockModel.countDocuments({
      quantity: { $lt: 10 },
    });

    res.json({
      success: true,
      stats: {
        todaySales: todaySalesCount,
        todayRevenue: todayRevenue,
        stockItems: stockItemsCount,
        lowStockAlerts: lowStockCount,
      },
    });
  } catch (error) {
    console.error("Error fetching stats:", error);
    res
      .status(500)
      .json({ success: false, message: "Error fetching statistics" });
  }
});

// ============ RECENT ACTIVITY API ============
router.get("/api/attendant/recent-activity", isAttendant, async (req, res) => {
  try {
    // Get recent sales (last 10)
    const recentSales = await salesModel
      .find()
      .sort({ _id: -1 })
      .limit(5)
      .populate("salesAgent", "username");

    // Get recent loading operations (last 5)
    const recentLoadings = await Loading.find()
      .sort({ loadingDate: -1 })
      .limit(5);

    // Get recent stock additions (last 5)
    const recentStock = await attendantstockModel
      .find()
      .sort({ date: -1 })
      .limit(5);

    // Combine and format activities
    const activities = [];

    recentSales.forEach((sale) => {
      activities.push({
        type: "sale",
        icon: "fa-shopping-cart",
        title: `Sale: ${sale.productName} (${sale.quantitySold} units)`,
        description: `Customer: ${sale.customerName} | Payment: ${sale.paymentType}`,
        time: formatTimeAgo(sale.date),
        date: new Date(sale.date),
      });
    });

    recentLoadings.forEach((loading) => {
      activities.push({
        type: "loading",
        icon: "fa-truck-loading",
        title: `Loading: ${loading.productName}`,
        description: `Destination: ${loading.destination} | Driver: ${loading.driverName}`,
        time: formatTimeAgo(loading.loadingDate),
        date: new Date(loading.loadingDate),
      });
    });

    recentStock.forEach((stock) => {
      activities.push({
        type: "stock",
        icon: "fa-box",
        title: `Stock Added: ${stock.productName}`,
        description: `Quantity: ${stock.quantity} | Supplier: ${stock.supplierName}`,
        time: formatTimeAgo(stock.date),
        date: new Date(stock.date),
      });
    });

    // Sort by date (most recent first)
    activities.sort((a, b) => b.date - a.date);

    res.json({
      success: true,
      activities: activities.slice(0, 10),
    });
  } catch (error) {
    console.error("Error fetching recent activity:", error);
    res
      .status(500)
      .json({ success: false, message: "Error fetching recent activity" });
  }
});

// ============ RECORDING SALES PAGE ============
router.get("/recordingSales", isAttendant, (req, res) => {
  res.render("recordingSales", {
    title: "Record Sales",
    user: req.user,
  });
});

// ============ ATTENDANT STOCK PAGE ============
router.get("/attendantstock", isAttendant, async (req, res) => {
  try {
    const stocks = await attendantstockModel.find().sort({ date: -1 });
    res.render("attendantstock", {
      title: "Manage Stock",
      stocks: stocks,
      user: req.user,
    });
  } catch (error) {
    console.error("Error fetching stock:", error);
    res.status(500).send("Error loading stock page");
  }
});

// ============ LOADING FORM PAGE ============
router.get("/loadingform", isAttendant, (req, res) => {
  res.render("loadingform", {
    title: "Loading Form",
    user: req.user,
  });
});

// ============ SUPPLIERS TABLE PAGE ============
router.get("/suppliersTable", isAttendant, async (req, res) => {
  try {
    const suppliers = await Supplier.find().sort({ createdAt: -1 });
    res.render("suppliersTable", {
      title: "Suppliers",
      suppliers: suppliers,
      user: req.user,
    });
  } catch (error) {
    console.error("Error fetching suppliers:", error);
    res.status(500).send("Error loading suppliers page");
  }
});

// ============ LOW STOCK API ============
router.get("/api/attendant/low-stock", isAttendant, async (req, res) => {
  try {
    const lowStockItems = await attendantstockModel
      .find({ quantity: { $lt: 10 } })
      .sort({ quantity: 1 });

    res.json({
      success: true,
      items: lowStockItems,
    });
  } catch (error) {
    console.error("Error fetching low stock:", error);
    res
      .status(500)
      .json({ success: false, message: "Error fetching low stock items" });
  }
});

// Helper function to format time ago
function formatTimeAgo(date) {
  const dateObj = new Date(date);
  const now = new Date();
  const diffMs = now - dateObj;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? "s" : ""} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;

  return dateObj.toLocaleDateString();
}

module.exports = router;
