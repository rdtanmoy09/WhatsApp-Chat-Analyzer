import { parseChat } from "./parser.js";
import { saveAnalysis, loadAnalysis } from "./storage.js";
import { drawUserChart, drawHourChart, drawDailyChart } from "./charts.js";

// DOM Elements
const fileInput = document.getElementById("fileInput");
const dropZone = document.getElementById("dropZone");
const analytics = document.getElementById("analytics");
const uploadSection = document.getElementById("uploadSection");

const totalMessages = document.getElementById("totalMessages");
const totalUsers = document.getElementById("totalUsers");
const avgMessages = document.getElementById("avgMessages");
const totalHours = document.getElementById("totalHours");
const topUser = document.getElementById("topUser");
const topUserDesc = document.getElementById("topUserDesc");
const activeHour = document.getElementById("activeHour");
const activeHourDesc = document.getElementById("activeHourDesc");
const chatDuration = document.getElementById("chatDuration");
const chatDurationDesc = document.getElementById("chatDurationDesc");
const userStatsTable = document.getElementById("userStatsTable");

const userChartJs = document.getElementById("userChartJs");
const hourChartJs = document.getElementById("hourChartJs");
const dailyChartJs = document.getElementById("dailyChartJs");

const uploadNewBtn = document.getElementById("uploadNewBtn");
const clearBtn = document.getElementById("clearBtn");
const exportBtn = document.getElementById("exportBtn");
const toast = document.getElementById("toast");

let currentAnalysis = null;

// File handling
function handleFile(file) {
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const result = parseChat(e.target.result);
      if (result.total === 0) {
        showToast("No messages found. Please check the file format.", "error");
        return;
      }
      currentAnalysis = result;
      render(result);
      saveAnalysis(result);
      showToast("Chat analyzed successfully!");
    } catch (error) {
      showToast("Error parsing file. Please check the format.", "error");
      console.error(error);
    }
  };
  reader.onerror = () => {
    showToast("Error reading file.", "error");
  };
  reader.readAsText(file);
}

// File input events
fileInput.addEventListener("change", (e) => {
  handleFile(e.target.files[0]);
});

// Drag and drop
dropZone.addEventListener("dragover", (e) => {
  e.preventDefault();
  dropZone.classList.add("border-green-500", "bg-green-50");
});

dropZone.addEventListener("dragleave", () => {
  dropZone.classList.remove("border-green-500", "bg-green-50");
});

dropZone.addEventListener("drop", (e) => {
  e.preventDefault();
  dropZone.classList.remove("border-green-500", "bg-green-50");
  handleFile(e.dataTransfer.files[0]);
});

// Render analytics
function render(data) {
  analytics.classList.remove("hidden");
  uploadSection.classList.add("hidden");
  clearBtn.classList.remove("hidden");
  exportBtn.classList.remove("hidden");

  // Validate data to prevent NaN
  if (!data.total || !data.userCount || data.userCount === 0) {
    showToast("No valid messages found in the chat.", "error");
    analytics.classList.add("hidden");
    uploadSection.classList.remove("hidden");
    return;
  }

  // Update key stats
  totalMessages.textContent = data.total.toLocaleString();
  totalUsers.textContent = data.userCount;
  avgMessages.textContent = Math.round(data.total / data.userCount);
  totalHours.textContent = Object.keys(data.hours).length;

  // Top user
  const topEntries = Object.entries(data.users);
  if (topEntries.length > 0) {
    const top = topEntries.sort((a, b) => b[1] - a[1])[0];
    topUser.textContent = top[0];
    topUserDesc.textContent = `${top[1].toLocaleString()} messages (${((top[1] / data.total) * 100).toFixed(1)}%)`;
  } else {
    topUser.textContent = "-";
    topUserDesc.textContent = "No users found";
  }

  // Active hour
  const hourEntries = Object.entries(data.hours);
  if (hourEntries.length > 0) {
    const hour = hourEntries.sort((a, b) => b[1] - a[1])[0];
    const paddedHour = String(hour[0]).padStart(2, "0");
    activeHour.textContent = `${paddedHour}:00`;
    activeHourDesc.textContent = `${hour[1].toLocaleString()} messages at this hour`;
  } else {
    activeHour.textContent = "-";
    activeHourDesc.textContent = "No hourly data available";
  }

  // Chat duration - with validation
  if (
    data.firstDate &&
    data.lastDate &&
    data.firstDate !== "Invalid Date" &&
    data.lastDate !== "Invalid Date"
  ) {
    chatDuration.textContent = data.chatDurationDays.toLocaleString();
    chatDurationDesc.textContent = data.firstDate + " to " + data.lastDate;
  } else {
    chatDuration.textContent = "-";
    chatDurationDesc.textContent = "Date information unavailable";
  }

  // Build user stats table
  const sortedUsers = Object.entries(data.users).sort((a, b) => b[1] - a[1]);
  
  // Debug: Log all users found
  console.log("Users found:", sortedUsers);
  
  userStatsTable.innerHTML = sortedUsers
    .map(([user, count]) => {
      const percentage = ((count / data.total) * 100).toFixed(1);
      return `
        <tr class="hover:bg-gray-50 transition">
          <td class="px-6 py-4 text-sm font-medium text-gray-900">${user}</td>
          <td class="px-6 py-4 text-sm text-gray-600">${count.toLocaleString()}</td>
          <td class="px-6 py-4 text-sm text-gray-600">${percentage}%</td>
          <td class="px-6 py-4">
            <div class="w-full bg-gray-200 rounded-full h-2">
              <div class="bg-green-600 h-2 rounded-full" style="width: ${percentage}%"></div>
            </div>
          </td>
        </tr>
      `;
    })
    .join("");

  // Draw charts
  drawUserChart(userChartJs, data.users);
  drawHourChart(hourChartJs, data.hours);
  drawDailyChart(dailyChartJs, data.days);
}

// Show toast notification
function showToast(message, type = "success") {
  toast.textContent = message;
  toast.classList.remove("hidden");
  if (type === "error") {
    toast.classList.add("bg-red-600");
    toast.classList.remove("bg-green-600");
  } else {
    toast.classList.add("bg-green-600");
    toast.classList.remove("bg-red-600");
  }
  setTimeout(() => {
    toast.classList.add("hidden");
  }, 3000);
}

// Upload new file
uploadNewBtn.addEventListener("click", () => {
  analytics.classList.add("hidden");
  uploadSection.classList.remove("hidden");
  clearBtn.classList.add("hidden");
  exportBtn.classList.add("hidden");
  currentAnalysis = null;
  fileInput.value = "";
});

// Clear data
clearBtn.addEventListener("click", () => {
  if (confirm("Are you sure you want to clear all data?")) {
    localStorage.removeItem("lastChatAnalysis");
    analytics.classList.add("hidden");
    uploadSection.classList.remove("hidden");
    clearBtn.classList.add("hidden");
    exportBtn.classList.add("hidden");
    currentAnalysis = null;
    fileInput.value = "";
    showToast("Data cleared successfully!");
  }
});

// Export report
exportBtn.addEventListener("click", () => {
  if (!currentAnalysis) return;

  const data = currentAnalysis;
  const report = `
WhatsApp Chat Analysis Report
========================================
Generated: ${new Date().toLocaleString()}

SUMMARY STATISTICS
- Total Messages: ${data.total.toLocaleString()}
- Total Users: ${data.userCount}
- Average Messages per User: ${Math.round(data.total / data.userCount)}
- Chat Duration: ${data.chatDurationDays} days
- Date Range: ${data.firstDate} to ${data.lastDate}
- Active Hours: ${Object.keys(data.hours).length}

TOP 10 MOST ACTIVE USERS
${Object.entries(data.users)
  .sort((a, b) => b[1] - a[1])
  .slice(0, 10)
  .map(
    ([user, count], i) =>
      `${i + 1}. ${user}: ${count.toLocaleString()} messages (${((count / data.total) * 100).toFixed(1)}%)`,
  )
  .join("\n")}

HOURLY ACTIVITY DISTRIBUTION
${Object.entries(data.hours)
  .sort((a, b) => parseInt(a[0]) - parseInt(b[0]))
  .map(
    ([hour, count]) =>
      `${String(hour).padStart(2, "0")}:00 - ${count} messages`,
  )
  .join("\n")}
  `;

  const element = document.createElement("a");
  element.setAttribute(
    "href",
    "data:text/plain;charset=utf-8," + encodeURIComponent(report),
  );
  element.setAttribute("download", `whatsapp-analysis-${Date.now()}.txt`);
  element.style.display = "none";
  document.body.appendChild(element);
  element.click();
  document.body.removeChild(element);

  showToast("Report exported successfully!");
});

// Load saved data on page load
const saved = loadAnalysis();
if (saved && saved.total > 0) {
  currentAnalysis = saved;
  render(saved);
}
