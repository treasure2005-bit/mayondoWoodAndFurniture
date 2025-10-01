// Attendant Dashboard JavaScript - MongoDB Version

// Initialize dashboard when page loads
document.addEventListener("DOMContentLoaded", function () {
  updateTime();
  setInterval(updateTime, 1000);
  loadDashboardStats();
  loadRecentActivity();
  animateCards();
});

// Update current time display
function updateTime() {
  const timeDisplay = document.getElementById("currentTime");
  if (timeDisplay) {
    const now = new Date();
    const options = {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    };
    timeDisplay.textContent = now.toLocaleDateString("en-US", options);
  }
}

// Load dashboard statistics from MongoDB
async function loadDashboardStats() {
  try {
    showLoading();
    const response = await fetch("/api/attendant/stats");
    const data = await response.json();

    if (data.success) {
      updateStatCards(data.stats);
    } else {
      console.error("Error loading stats:", data.message);
      showNotification("Error loading dashboard stats", "error");
    }
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    showNotification("Failed to load dashboard data", "error");
  } finally {
    hideLoading();
  }
}

// Update stat cards with animated numbers
function updateStatCards(stats) {
  const statCards = document.querySelectorAll(".stat-number");

  if (statCards[0]) {
    animateNumber(statCards[0], stats.todaySales);
  }
  if (statCards[1]) {
    animateNumber(statCards[1], stats.todayRevenue, "UGX ");
  }
  if (statCards[2]) {
    animateNumber(statCards[2], stats.stockItems);
  }
  if (statCards[3]) {
    animateNumber(statCards[3], stats.lowStockAlerts);

    // Add warning class if low stock alerts > 0
    const parentCard = statCards[3].closest(".stat-card");
    if (stats.lowStockAlerts > 0) {
      parentCard.classList.add("alert-warning");
    } else {
      parentCard.classList.remove("alert-warning");
    }
  }
}

// Animate number counting up
function animateNumber(element, target, prefix = "", duration = 1000) {
  const start = 0;
  const increment = target / (duration / 16);
  let current = start;

  const timer = setInterval(() => {
    current += increment;
    if (current >= target) {
      current = target;
      clearInterval(timer);
    }

    if (prefix === "UGX ") {
      element.textContent = prefix + Math.floor(current).toLocaleString();
    } else {
      element.textContent = Math.floor(current);
    }
  }, 16);
}

// Load recent activity from MongoDB
async function loadRecentActivity() {
  try {
    const response = await fetch("/api/attendant/recent-activity");
    const data = await response.json();

    if (data.success) {
      displayRecentActivity(data.activities);
    } else {
      console.error("Error loading recent activity:", data.message);
      displayActivityError();
    }
  } catch (error) {
    console.error("Error fetching recent activity:", error);
    displayActivityError();
  }
}

// Display recent activity items
function displayRecentActivity(activities) {
  const activityContainer = document.getElementById("recentActivity");

  if (!activityContainer) return;

  if (activities.length === 0) {
    activityContainer.innerHTML = `
      <div class="activity-item empty">
        <div class="activity-icon">
          <i class="fas fa-info-circle"></i>
        </div>
        <div class="activity-content">
          <div class="activity-title">No recent activity</div>
          <div class="activity-time">Start by recording sales or managing stock</div>
        </div>
      </div>
    `;
    return;
  }

  activityContainer.innerHTML = activities
    .map(
      (activity) => `
    <div class="activity-item ${activity.type}">
      <div class="activity-icon">
        <i class="fas ${activity.icon}"></i>
      </div>
      <div class="activity-content">
        <div class="activity-title">${escapeHtml(activity.title)}</div>
        <div class="activity-description">${escapeHtml(
          activity.description
        )}</div>
        <div class="activity-time">${escapeHtml(activity.time)}</div>
      </div>
    </div>
  `
    )
    .join("");
}

// Display error message for activity
function displayActivityError() {
  const activityContainer = document.getElementById("recentActivity");
  if (activityContainer) {
    activityContainer.innerHTML = `
      <div class="activity-item error">
        <div class="activity-icon">
          <i class="fas fa-exclamation-triangle"></i>
        </div>
        <div class="activity-content">
          <div class="activity-title">Error loading activities</div>
          <div class="activity-time">Please refresh the page</div>
        </div>
      </div>
    `;
  }
}

// Show loading overlay
function showLoading() {
  const overlay = document.getElementById("loadingOverlay");
  if (overlay) {
    overlay.style.display = "flex";
  }
}

// Hide loading overlay
function hideLoading() {
  const overlay = document.getElementById("loadingOverlay");
  if (overlay) {
    overlay.style.display = "none";
  }
}

// Animate cards on page load
function animateCards() {
  const cards = document.querySelectorAll(".card");
  cards.forEach((card, index) => {
    card.style.opacity = "0";
    card.style.transform = "translateY(20px)";

    setTimeout(() => {
      card.style.transition = "all 0.5s ease";
      card.style.opacity = "1";
      card.style.transform = "translateY(0)";
    }, index * 100);
  });
}

// Refresh dashboard data
function refreshDashboard() {
  loadDashboardStats();
  loadRecentActivity();

  // Show success message
  showNotification("Dashboard refreshed successfully", "success");
}

// Show notification
function showNotification(message, type = "info") {
  // Remove any existing notifications
  const existingNotifications = document.querySelectorAll(".notification");
  existingNotifications.forEach((notif) => notif.remove());

  const notification = document.createElement("div");
  notification.className = `notification ${type}`;
  notification.innerHTML = `
    <i class="fas ${
      type === "success"
        ? "fa-check-circle"
        : type === "error"
        ? "fa-exclamation-circle"
        : "fa-info-circle"
    }"></i>
    <span>${escapeHtml(message)}</span>
  `;

  document.body.appendChild(notification);

  setTimeout(() => {
    notification.style.opacity = "1";
    notification.style.transform = "translateY(0)";
  }, 100);

  setTimeout(() => {
    notification.style.opacity = "0";
    notification.style.transform = "translateY(-20px)";
    setTimeout(() => notification.remove(), 300);
  }, 3000);
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
  const map = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;",
  };
  return text.replace(/[&<>"']/g, (m) => map[m]);
}

// Handle quick action clicks with animation
document.addEventListener("click", function (e) {
  const quickAction = e.target.closest(".quick-action");
  if (quickAction) {
    // Add loading animation
    quickAction.style.transform = "scale(0.95)";
    setTimeout(() => {
      quickAction.style.transform = "scale(1)";
    }, 100);
  }
});

// Add hover effects to cards
const cards = document.querySelectorAll(".card");
cards.forEach((card) => {
  card.addEventListener("mouseenter", function () {
    if (this.style.opacity === "1") {
      // Only animate if card is visible
      this.style.transform = "translateY(-5px)";
    }
  });

  card.addEventListener("mouseleave", function () {
    if (this.style.opacity === "1") {
      this.style.transform = "translateY(0)";
    }
  });
});

// Auto-refresh dashboard every 5 minutes
setInterval(() => {
  loadDashboardStats();
  loadRecentActivity();
  console.log("Dashboard auto-refreshed");
}, 300000);

// Handle page visibility change - refresh when user comes back
document.addEventListener("visibilitychange", function () {
  if (!document.hidden) {
    loadDashboardStats();
    loadRecentActivity();
  }
});

// Export functions for global use
window.loadRecentActivity = loadRecentActivity;
window.refreshDashboard = refreshDashboard;
