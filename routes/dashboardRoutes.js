// dashboard.route.js - Updated with real database integration
const express = require("express");
const router = express.Router();

// Add this import for user management
const userModel = require("../models/userModel");

// Import your models
const stockModel = require("../models/stockModel");
const salesModel = require("../models/salesModel");

// Real data from database
const getDashboardData = async () => {
  try {
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth() + 1;
    const currentYear = currentDate.getFullYear();
    const lastMonth = currentMonth === 1 ? 12 : currentMonth - 1;
    const lastMonthYear = currentMonth === 1 ? currentYear - 1 : currentYear;

    // 1. Get total stock items and stock value
    const allStock = await stockModel.find({ status: "approved" }); // Only count approved stock
    const totalStock = allStock.reduce(
      (sum, item) => sum + (item.quantity || 0),
      0
    );
    const stockValue = allStock.reduce(
      (sum, item) => sum + (item.quantity || 0) * (item.productPrice || 0),
      0
    );

    // 2. Get low stock items (using 10 as default minimum since no minStockLevel field)
    const lowStockItems = allStock.filter((item) => {
      const minLevel = 10; // Default minimum stock level
      return (item.quantity || 0) <= minLevel;
    });

    // 3. Get current month sales
    let totalSales = 0;
    let totalOrders = 0;
    let lastMonthSales = 0;

    try {
      // Get sales for current month (date is stored as string, so we need to parse it)
      const allSales = await salesModel
        .find({})
        .populate("salesAgent", "fullName");

      const currentMonthSales = allSales.filter((sale) => {
        const saleDate = new Date(sale.date);
        return (
          saleDate.getMonth() + 1 === currentMonth &&
          saleDate.getFullYear() === currentYear
        );
      });

      const lastMonthSalesData = allSales.filter((sale) => {
        const saleDate = new Date(sale.date);
        return (
          saleDate.getMonth() + 1 === lastMonth &&
          saleDate.getFullYear() === lastMonthYear
        );
      });

      totalSales = currentMonthSales.reduce((sum, sale) => {
        const saleAmount = (sale.quantitySold || 0) * (sale.unitPrice || 0);
        return sum + saleAmount;
      }, 0);

      totalOrders = currentMonthSales.length;

      lastMonthSales = lastMonthSalesData.reduce((sum, sale) => {
        const saleAmount = (sale.quantitySold || 0) * (sale.unitPrice || 0);
        return sum + saleAmount;
      }, 0);
    } catch (salesError) {
      console.log("Sales data error:", salesError.message);
    }

    // 4. Calculate percentage changes
    const salesChange =
      lastMonthSales > 0
        ? ((totalSales - lastMonthSales) / lastMonthSales) * 100
        : 0;

    // 5. Get recent sales data for charts (last 6 months)
    const salesChartData = [];
    const allSales = await salesModel.find({});

    for (let i = 5; i >= 0; i--) {
      const targetMonth = currentMonth - i;
      const targetYear = targetMonth <= 0 ? currentYear - 1 : currentYear;
      const adjustedMonth = targetMonth <= 0 ? targetMonth + 12 : targetMonth;

      const monthSales = allSales.filter((sale) => {
        const saleDate = new Date(sale.date);
        return (
          saleDate.getMonth() + 1 === adjustedMonth &&
          saleDate.getFullYear() === targetYear
        );
      });

      const monthTotal = monthSales.reduce((sum, sale) => {
        const saleAmount = (sale.quantitySold || 0) * (sale.unitPrice || 0);
        return sum + saleAmount;
      }, 0);

      const monthDate = new Date(targetYear, adjustedMonth - 1, 1);
      salesChartData.push({
        month: monthDate.toLocaleDateString("en-US", { month: "short" }),
        sales: monthTotal,
      });
    }

    // 6. Get recent transactions (last 10)
    let recentTransactions = [];
    try {
      const recentSales = await salesModel
        .find({})
        .sort({ _id: -1 }) // Sort by most recent (using _id since date is string)
        .limit(10)
        .populate("salesAgent", "fullName")
        .exec();

      recentTransactions = recentSales.map((sale) => ({
        customer: sale.customerName || "Unknown Customer",
        product: sale.productName || "Product",
        amount: (sale.quantitySold || 0) * (sale.unitPrice || 0),
        date: sale.date || new Date().toISOString().split("T")[0],
        agent: sale.salesAgent ? sale.salesAgent.fullName : "Unknown Agent",
      }));
    } catch (error) {
      console.log("Recent transactions error:", error.message);
    }

    return {
      metrics: {
        totalSales: totalSales,
        totalStock: totalStock,
        stockValue: stockValue,
        totalOrders: totalOrders,
        changes: {
          sales: Math.round(salesChange * 100) / 100,
          stock: 0, // Calculate based on your needs
          value: 0, // Calculate based on your needs
          orders: 0, // Calculate based on your needs
        },
      },
      lowStock: lowStockItems.map((item) => ({
        name: item.productName,
        quantity: item.quantity || 0,
        minStock: 10, // Default minimum
      })),
      charts: {
        sales: salesChartData,
        stock: allStock
          .map((item) => ({
            name: item.productName,
            quantity: item.quantity || 0,
            minStock: 10, // Default minimum
          }))
          .slice(0, 10), // Limit to top 10 for chart
      },
      transactions: recentTransactions,
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
    if (!req.session.user || req.session.user.role !== "Manager") {
      return res.redirect("/login");
    }

    // Render the dashboard
    res.render("manager", {
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

// ========== NEW ATTENDANT MANAGEMENT ROUTES ==========

// Manager attendant management page
router.get("/attendants", async (req, res) => {
  try {
    console.log("Session user:", req.session.user); // Debug line
    console.log(
      "User role:",
      req.session.user ? req.session.user.role : "No user"
    ); // Debug line

    // Check if user is authenticated and is manager
    if (!req.session.user || req.session.user.role !== "Manager") {
      console.log("Auth failed, redirecting to login");
      return res.redirect("/login");
    }

    // Get all attendants
    const attendants = await userModel.find({ role: "Attendant" });

    res.render("manageAttendants", {
      title: "Manage Attendants",
      user: req.session.user,
      attendants: attendants,
      success: req.query.success,
      error: req.query.error,
    });
  } catch (error) {
    console.error("Error loading attendants:", error);
    res.redirect("/dashboard?error=Failed to load attendants");
  }
});

// Create new attendant
router.post("/create-attendant", async (req, res) => {
  try {
    // Check if user is manager
    if (!req.session.user || req.session.user.role !== "Manager") {
      return res.redirect("/login");
    }

    const { email, password, fullName } = req.body;

    // Validate input
    if (!email || !password || !fullName) {
      return res.redirect(
        "/dashboard/attendants?error=All fields are required"
      );
    }

    // Check if attendant already exists
    let existingUser = await userModel.findOne({ email: email });
    if (existingUser) {
      return res.redirect(
        "/dashboard/attendants?error=Attendant with this email already exists"
      );
    }

    // Create new attendant
    const attendant = new userModel({
      email: email,
      fullName: fullName,
      role: "Attendant",
    });

    await userModel.register(attendant, password, (error) => {
      if (error) {
        console.error("Error creating attendant:", error);
        return res.redirect(
          "/dashboard/attendants?error=Failed to create attendant"
        );
      }
      res.redirect(
        "/dashboard/attendants?success=Attendant created successfully"
      );
    });
  } catch (error) {
    console.error("Error creating attendant:", error);
    res.redirect("/dashboard/attendants?error=Error creating attendant");
  }
});



// Update attendant
router.post("/update-attendant/:id", async (req, res) => {
  try {
    // Check if user is manager
    if (!req.session.user || req.session.user.role !== "Manager") {
      return res.redirect("/login");
    }

    const { fullName, email, password } = req.body;
    const attendantId = req.params.id;

    // Validate input
    if (!email || !fullName) {
      return res.redirect(
        "/dashboard/attendants?error=Full name and email are required"
      );
    }

    // Check if email is already used by another user
    const existingUser = await userModel.findOne({ 
      email: email,
      _id: { $ne: attendantId } // Exclude current user
    });
    
    if (existingUser) {
      return res.redirect(
        "/dashboard/attendants?error=Email already in use by another user"
      );
    }

    // Find the attendant
    const attendant = await userModel.findById(attendantId);
    
    if (!attendant) {
      return res.redirect(
        "/dashboard/attendants?error=Attendant not found"
      );
    }

    // Update basic info
    attendant.fullName = fullName;
    attendant.email = email;

    // If password is provided, update it
    if (password && password.trim() !== '') {
      if (password.length < 6) {
        return res.redirect(
          "/dashboard/attendants?error=Password must be at least 6 characters"
        );
      }
      
      // Use passport-local-mongoose's setPassword method
      await attendant.setPassword(password);
    }

    // Save the updated attendant
    await attendant.save();

    res.redirect(
      "/dashboard/attendants?success=Attendant updated successfully"
    );
  } catch (error) {
    console.error("Error updating attendant:", error);
    res.redirect("/dashboard/attendants?error=Error updating attendant");
  }
});



// Delete attendant
router.post("/delete-attendant/:id", async (req, res) => {
  try {
    // Check if user is manager
    if (!req.session.user || req.session.user.role !== "Manager") {
      return res.redirect("/login");
    }

    await userModel.findByIdAndDelete(req.params.id);
    res.redirect(
      "/dashboard/attendants?success=Attendant deleted successfully"
    );
  } catch (error) {
    console.error("Error deleting attendant:", error);
    res.redirect("/dashboard/attendants?error=Error deleting attendant");
  }
});

// ========== END ATTENDANT MANAGEMENT ROUTES ==========

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
    // Get real stock data from database
    const allStock = await stockModel.find({ status: "approved" }); // Only approved stock
    const stockData = allStock.map((item) => ({
      name: item.productName,
      quantity: item.quantity || 0,
      minStock: 10, // Default minimum
    }));

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
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth() + 1;
    const currentYear = currentDate.getFullYear();

    let salesData = [];
    const monthsToShow = period === "12" ? 12 : 6;

    // Get all sales data
    const allSales = await salesModel.find({});

    // Generate real sales data for the specified period
    for (let i = monthsToShow - 1; i >= 0; i--) {
      const targetMonth = currentMonth - i;
      const targetYear = targetMonth <= 0 ? currentYear - 1 : currentYear;
      const adjustedMonth = targetMonth <= 0 ? targetMonth + 12 : targetMonth;

      const monthSales = allSales.filter((sale) => {
        const saleDate = new Date(sale.date);
        return (
          saleDate.getMonth() + 1 === adjustedMonth &&
          saleDate.getFullYear() === targetYear
        );
      });

      const monthTotal = monthSales.reduce((sum, sale) => {
        const saleAmount = (sale.quantitySold || 0) * (sale.unitPrice || 0);
        return sum + saleAmount;
      }, 0);

      const monthDate = new Date(targetYear, adjustedMonth - 1, 1);
      const monthLabel =
        period === "12"
          ? monthDate.toLocaleDateString("en-US", {
              month: "short",
              year: "numeric",
            })
          : monthDate.toLocaleDateString("en-US", { month: "short" });

      salesData.push({
        month: monthLabel,
        sales: monthTotal,
      });
    }

    res.json({ success: true, data: salesData });
  } catch (error) {
    console.error("Error fetching sales data:", error);
    res.status(500).json({ error: "Failed to fetch sales data" });
  }
});

module.exports = router;
