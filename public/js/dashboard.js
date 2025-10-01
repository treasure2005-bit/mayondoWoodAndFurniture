// Dashboard JavaScript functionality
class MWFDashboard {
  constructor() {
    this.salesChart = null;
    this.stockChart = null;
    this.initializeEventListeners();
    this.updateDateTime();
    this.loadDashboardData();

    // Update time every second
    setInterval(() => this.updateDateTime(), 1000);

    // Refresh data every 5 minutes
    setInterval(() => this.loadDashboardData(), 300000);
  }

  initializeEventListeners() {
    // Refresh stock button
    const refreshBtn = document.getElementById("refreshStock");
    if (refreshBtn) {
      refreshBtn.addEventListener("click", () => this.refreshStockData());
    }

    // Sales period selector
    const salesPeriod = document.getElementById("salesPeriod");
    if (salesPeriod) {
      salesPeriod.addEventListener("change", (e) =>
        this.updateSalesChart(e.target.value)
      );
    }
  }

  updateDateTime() {
    const now = new Date();
    const options = {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    };

    const dateElement = document.getElementById("currentDate");
    const timeElement = document.getElementById("currentTime");

    if (dateElement) {
      dateElement.textContent = now.toLocaleDateString("en-UG", options);
    }

    if (timeElement) {
      timeElement.textContent = now.toLocaleTimeString("en-UG");
    }
  }

  async loadDashboardData() {
    try {
      // Fetch real data from your backend API
      const data = await this.fetchDashboardData();
      this.updateMetrics(data.metrics);
      this.updateLowStockAlerts(data.lowStock);
      this.initializeCharts(data.charts);
      this.updateRecentTransactions(data.transactions);
    } catch (error) {
      console.error("Error loading dashboard data:", error);
      this.showError("Failed to load dashboard data");
    }
  }

  async fetchDashboardData() {
    try {
      // Make real API call to your backend
      const response = await fetch("/dashboard/api/data");
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      // Return fallback data if API fails
      return {
        metrics: {
          totalSales: 0,
          totalStock: 0,
          stockValue: 0,
          totalOrders: 0,
          changes: {
            sales: 0,
            stock: 0,
            value: 0,
            orders: 0,
          },
        },
        lowStock: [],
        charts: {
          sales: [],
          stock: [],
        },
        transactions: [],
      };
    }
  }

  updateMetrics(metrics) {
    // Update metric values
    this.updateElement(
      "totalSales",
      `UGX ${this.formatCurrency(metrics.totalSales)}`
    );
    this.updateElement("totalStock", metrics.totalStock.toLocaleString());
    this.updateElement(
      "stockValue",
      `UGX ${this.formatCurrency(metrics.stockValue)}`
    );
    this.updateElement("totalOrders", metrics.totalOrders.toLocaleString());

    // Update changes
    this.updateChange("salesChange", metrics.changes.sales);
    this.updateChange("stockChange", metrics.changes.stock);
    this.updateChange("valueChange", metrics.changes.value);
    this.updateChange("ordersChange", metrics.changes.orders);
  }

  formatCurrency(amount) {
    if (amount >= 1000000) {
      return (amount / 1000000).toFixed(1) + "M";
    } else if (amount >= 1000) {
      return (amount / 1000).toFixed(1) + "K";
    } else {
      return amount.toLocaleString();
    }
  }

  updateChange(elementId, change) {
    const element = document.getElementById(elementId);
    if (element) {
      const isPositive = change > 0;
      const icon = element.querySelector("i");
      const span = element.querySelector("span");

      element.className = `metric-change ${
        isPositive ? "positive" : "negative"
      }`;

      if (icon) {
        icon.className = `fas fa-arrow-${isPositive ? "up" : "down"}`;
      }

      if (span) {
        span.textContent = `${isPositive ? "+" : ""}${change.toFixed(1)}%`;
      }
    }
  }

  updateLowStockAlerts(lowStock) {
    const alertSection = document.getElementById("lowStockAlert");
    const alertContent = document.getElementById("alertContent");

    if (lowStock && lowStock.length > 0) {
      alertSection.style.display = "block";
      alertContent.innerHTML = lowStock
        .map(
          (item) => `
                <div class="alert-item">
                    <span><strong>${item.name}</strong></span>
                    <span>${item.quantity} units (Min: ${item.minStock})</span>
                </div>
            `
        )
        .join("");
    } else {
      alertSection.style.display = "none";
    }
  }

  initializeCharts(chartData) {
    this.initSalesChart(chartData.sales);
    this.initStockChart(chartData.stock);
  }

  initSalesChart(salesData) {
    const ctx = document.getElementById("salesChart");
    if (!ctx) return;

    if (this.salesChart) {
      this.salesChart.destroy();
    }

    // Handle empty data
    if (!salesData || salesData.length === 0) {
      ctx.getContext("2d").clearRect(0, 0, ctx.width, ctx.height);
      return;
    }

    this.salesChart = new Chart(ctx, {
      type: "line",
      data: {
        labels: salesData.map((item) => item.month),
        datasets: [
          {
            label: "Sales (UGX)",
            data: salesData.map((item) => item.sales),
            borderColor: "#667eea",
            backgroundColor: "rgba(102, 126, 234, 0.1)",
            borderWidth: 3,
            fill: true,
            tension: 0.4,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false,
          },
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              callback: (value) => {
                return "UGX " + this.formatCurrency(value);
              },
            },
          },
        },
      },
    });
  }

  initStockChart(stockData) {
    const ctx = document.getElementById("stockChart");
    if (!ctx) return;

    if (this.stockChart) {
      this.stockChart.destroy();
    }

    // Handle empty data
    if (!stockData || stockData.length === 0) {
      ctx.getContext("2d").clearRect(0, 0, ctx.width, ctx.height);
      return;
    }

    this.stockChart = new Chart(ctx, {
      type: "bar",
      data: {
        labels: stockData.map((item) => item.name),
        datasets: [
          {
            label: "Current Stock",
            data: stockData.map((item) => item.quantity),
            backgroundColor: "#8B4513",
            borderRadius: 8,
            borderSkipped: false,
          },
          {
            label: "Minimum Stock",
            data: stockData.map((item) => item.minStock),
            backgroundColor: "#FFB347",
            borderRadius: 8,
            borderSkipped: false,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: "top",
          },
        },
        scales: {
          x: {
            ticks: {
              maxRotation: 45,
            },
          },
          y: {
            beginAtZero: true,
          },
        },
      },
    });
  }

  updateRecentTransactions(transactions) {
    const container = document.getElementById("recentTransactions");
    if (!container) return;

    if (!transactions || transactions.length === 0) {
      container.innerHTML =
        '<div class="loading">No recent transactions found.</div>';
      return;
    }

    container.innerHTML = transactions
      .map(
        (transaction) => `
            <div class="activity-item">
                <div class="activity-info">
                    <h4>${transaction.customer}</h4>
                    <p>${transaction.product} • ${transaction.date} • ${
          transaction.agent
        }</p>
                </div>
                <div class="activity-amount">
                    UGX ${this.formatCurrency(transaction.amount)}
                </div>
            </div>
        `
      )
      .join("");
  }

  async refreshStockData() {
    const refreshBtn = document.getElementById("refreshStock");
    const icon = refreshBtn?.querySelector("i");

    if (icon) {
      icon.style.animation = "spin 1s linear infinite";
    }

    try {
      // Fetch fresh stock data from API
      const response = await fetch("/dashboard/api/stock/refresh");
      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          // Update stock chart with fresh data
          this.initStockChart(result.data);
        }
      }
    } catch (error) {
      console.error("Error refreshing stock data:", error);
      this.showError("Failed to refresh stock data");
    } finally {
      if (icon) {
        icon.style.animation = "";
      }
    }
  }

  async updateSalesChart(period) {
    try {
      // Fetch sales data for the selected period
      const response = await fetch(`/dashboard/api/sales/${period}`);
      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          this.initSalesChart(result.data);
        }
      }
    } catch (error) {
      console.error("Error updating sales chart:", error);
      this.showError("Failed to update sales chart");
    }
  }

  updateElement(id, value) {
    const element = document.getElementById(id);
    if (element) {
      element.textContent = value;
    }
  }

  showError(message) {
    // Create a simple error notification
    const errorDiv = document.createElement("div");
    errorDiv.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #f56565;
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 8px;
            box-shadow: 0 4px 16px rgba(0,0,0,0.1);
            z-index: 1000;
            font-weight: 500;
        `;
    errorDiv.textContent = message;
    document.body.appendChild(errorDiv);

    // Remove after 5 seconds
    setTimeout(() => {
      if (document.body.contains(errorDiv)) {
        document.body.removeChild(errorDiv);
      }
    }, 5000);
  }
}

// CSS for spin animation
const style = document.createElement("style");
style.textContent = `
    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }
`;
document.head.appendChild(style);

// Initialize dashboard when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  new MWFDashboard();
});
