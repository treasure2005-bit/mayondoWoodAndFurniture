// dashboard.route.js - Add this to your routes folder
const express = require("express");
const router = express.Router();

// Sample data - replace with actual database queries
const getDashboardData = async () => {
  try {
    // In a real application, you would fetch this data from your database
    // Example queries you might use:

    // const totalSales = await db.query('SELECT SUM(amount) FROM sales WHERE MONTH(date) = MONTH(CURDATE())');
    // const totalStock = await db.query('SELECT SUM(quantity) FROM stock');
    // const lowStock = await db.query('SELECT * FROM stock WHERE quantity <= min_stock_level');

    return {
      metrics: {
        totalSales: 58000000,
        totalStock: 187,
        stockValue: 275000000,
        totalOrders: 159,
        changes: {
          sales: 12.5,
          stock: -2.3,
          value: 8.7,
          orders: 15.2,
        },
      },
      lowStock: [
        { name: "Timber", quantity: 8, minStock: 15 },
        { name: "Poles", quantity: 3, minStock: 10 },
      ],
      charts: {
        sales: [
          { month: "Apr", sales: 61000000 },
          { month: "May", sales: 55000000 },
          { month: "Jun", sales: 58000000 },
          { month: "Jul", sales: 52000000 },
          { month: "Aug", sales: 64000000 },
          { month: "Sep", sales: 58000000 },
        ],
        stock: [
          { name: "Beds", quantity: 45, minStock: 20 },
          { name: "Timber", quantity: 8, minStock: 15 },
          { name: "Sofa", quantity: 67, minStock: 25 },
          { name: "Poles", quantity: 3, minStock: 10 },
          { name: "Dining Tables", quantity: 12, minStock: 8 },
          { name: "Hard wood", quantity: 6, minStock: 5 },
          { name: "Cupboards", quantity: 6, minStock: 5 },
          { name: "Soft wood", quantity: 6, minStock: 5 },
          { name: "Drawers", quantity: 6, minStock: 5 },
          { name: "Home furniture", quantity: 6, minStock: 5 },
          { name: "Office furniture", quantity: 6, minStock: 5 },
        ],
      },
      transactions: [
        {
          customer: "Kampala Construction Ltd",
          product: "Mahogany Timber",
          amount: 8500000,
          date: "2024-09-17",
          agent: "John Mukisa",
        },
        {
          customer: "Modern Homes Uganda",
          product: "Office Desk Set",
          amount: 3750000,
          date: "2024-09-16",
          agent: "Sarah Nambi",
        },
        {
          customer: "Elite Furniture Co.",
          product: "Sofa Set",
          amount: 2500000,
          date: "2024-09-16",
          agent: "David Kato",
        },
      ],
    };
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    throw error;
  }
};

// Main dashboard page
router.get("/", async (req, res) => {
  try {
    // Check if user is authenticated (adjust based on your auth system)
    if (!req.session.user || req.session.user.role !== "manager") {
      return res.redirect("/login");
    }

    // Render the dashboard
    res.render("dashboard", {
      title: "MWF Manager Dashboard",
      user: req.session.user,
    });
  } catch (error) {
    console.error("Error rendering dashboard:", error);
    res.status(500).render("error", {
      message: "Error loading dashboard",
      error: error,
    });
  }
});

// API endpoint for dashboard data
router.get("/api/data", async (req, res) => {
  try {
    const data = await getDashboardData();
    res.json(data);
  } catch (error) {
    console.error("Error fetching dashboard API data:", error);
    res.status(500).json({ error: "Failed to fetch dashboard data" });
  }
});

// API endpoint for refreshing stock data
router.get("/api/stock/refresh", async (req, res) => {
  try {
    // In a real app, this would refresh stock data from your database
    const stockData = [
      { name: "Beds", quantity: 45, minStock: 20 },
      { name: "Timber", quantity: 8, minStock: 15 },
      { name: "Sofa", quantity: 67, minStock: 25 },
      { name: "Poles", quantity: 3, minStock: 10 },
      { name: "Dining Tables", quantity: 12, minStock: 8 },
      { name: "Hard wood", quantity: 6, minStock: 5 },
      { name: "Cupboards", quantity: 6, minStock: 5 },
      { name: "Soft wood", quantity: 6, minStock: 5 },
      { name: "Drawers", quantity: 6, minStock: 5 },
      { name: "Home furniture", quantity: 6, minStock: 5 },
      { name: "Office furniture", quantity: 6, minStock: 5 },
    ];

    res.json({ success: true, data: stockData });
  } catch (error) {
    console.error("Error refreshing stock data:", error);
    res.status(500).json({ error: "Failed to refresh stock data" });
  }
});

// API endpoint for sales data by period
router.get("/api/sales/:period", async (req, res) => {
  try {
    const { period } = req.params;

    // In a real app, query database based on period
    let salesData;

    if (period === "12") {
      // Last 12 months data
      salesData = [
        { month: "Oct 2023", sales: 45000000 },
        { month: "Nov 2023", sales: 52000000 },
        { month: "Dec 2023", sales: 48000000 },
        { month: "Jan 2024", sales: 55000000 },
        { month: "Feb 2024", sales: 49000000 },
        { month: "Mar 2024", sales: 61000000 },
        { month: "Apr 2024", sales: 58000000 },
        { month: "May 2024", sales: 55000000 },
        { month: "Jun 2024", sales: 52000000 },
        { month: "Jul 2024", sales: 64000000 },
        { month: "Aug 2024", sales: 58000000 },
        { month: "Sep 2024", sales: 62000000 },
      ];
    } else {
      // Last 6 months data (default)
      salesData = [
        { month: "Apr", sales: 61000000 },
        { month: "May", sales: 55000000 },
        { month: "Jun", sales: 58000000 },
        { month: "Jul", sales: 52000000 },
        { month: "Aug", sales: 64000000 },
        { month: "Sep", sales: 58000000 },
      ];
    }

    res.json({ success: true, data: salesData });
  } catch (error) {
    console.error("Error fetching sales data:", error);
    res.status(500).json({ error: "Failed to fetch sales data" });
  }
});

module.exports = router;
