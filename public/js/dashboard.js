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
      // In a real application, these would be API calls to your Node.js backend
      // For now, using sample data

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
    // Simulate API call - replace with actual fetch to your Node.js endpoints
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
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
        });
      }, 1000);
    });
  }

  updateMetrics(metrics) {
    // Update metric values
    this.updateElement(
      "totalSales",
      `UGX ${(metrics.totalSales / 1000000).toFixed(1)}M`
    );
    this.updateElement("totalStock", metrics.totalStock.toLocaleString());
    this.updateElement(
      "stockValue",
      `UGX ${(metrics.stockValue / 1000000).toFixed(1)}M`
    );
    this.updateElement("totalOrders", metrics.totalOrders.toLocaleString());

    // Update changes
    this.updateChange("salesChange", metrics.changes.sales);
    this.updateChange("stockChange", metrics.changes.stock);
    this.updateChange("valueChange", metrics.changes.value);
    this.updateChange("ordersChange", metrics.changes.orders);
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

    if (lowStock.length > 0) {
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
              callback: function (value) {
                return "UGX " + value / 1000000 + "M";
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
                    UGX ${(transaction.amount / 1000000).toFixed(1)}M
                </div>
            </div>
        `
      )
      .join("");
  }

  refreshStockData() {
    const refreshBtn = document.getElementById("refreshStock");
    const icon = refreshBtn?.querySelector("i");

    if (icon) {
      icon.style.animation = "spin 1s linear infinite";
    }

    // Simulate data refresh
    setTimeout(() => {
      this.loadDashboardData();
      if (icon) {
        icon.style.animation = "";
      }
    }, 1000);
  }

  updateSalesChart(period) {
    // In a real app, fetch new data based on period
    console.log(`Updating sales chart for ${period} months`);
    // For now, just refresh with existing data
    this.loadDashboardData();
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
      document.body.removeChild(errorDiv);
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