let userChart = null;
let hourChart = null;
let dailyChart = null;

function destroyCharts() {
  if (userChart) userChart.destroy();
  if (hourChart) hourChart.destroy();
  if (dailyChart) dailyChart.destroy();
}

function drawUserChart(ctx, data) {
  destroyCharts();

  const sortedUsers = Object.entries(data)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 15);

  userChart = new Chart(ctx, {
    type: "bar",
    data: {
      labels: sortedUsers.map((u) => u[0]),
      datasets: [
        {
          label: "Messages",
          data: sortedUsers.map((u) => u[1]),
          backgroundColor: "rgba(34, 197, 94, 0.8)",
          borderColor: "rgba(34, 197, 94, 1)",
          borderWidth: 1,
          borderRadius: 8,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      plugins: {
        legend: { display: false },
      },
      scales: {
        y: { beginAtZero: true },
      },
    },
  });
}

function drawHourChart(ctx, data) {
  const sortedHours = Object.entries(data).sort(
    (a, b) => parseInt(a[0]) - parseInt(b[0]),
  );

  hourChart = new Chart(ctx, {
    type: "line",
    data: {
      labels: sortedHours.map((h) => h[0] + ":00"),
      datasets: [
        {
          label: "Messages",
          data: sortedHours.map((h) => h[1]),
          borderColor: "rgba(59, 130, 246, 1)",
          backgroundColor: "rgba(59, 130, 246, 0.1)",
          tension: 0.4,
          fill: true,
          pointBackgroundColor: "rgba(59, 130, 246, 1)",
          pointBorderColor: "#fff",
          pointBorderWidth: 2,
          pointRadius: 5,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      plugins: {
        legend: { display: false },
      },
      scales: {
        y: { beginAtZero: true },
      },
    },
  });
}

function drawDailyChart(ctx, data) {
  // Sort days properly by parsing the date format correctly
  const sortedDays = Object.entries(data).sort((a, b) => {
    // Parse dates in M/D/YYYY format
    const [aMonth, aDay, aYear] = a[0].split("/");
    const [bMonth, bDay, bYear] = b[0].split("/");

    const dateA = new Date(aYear, aMonth - 1, aDay);
    const dateB = new Date(bYear, bMonth - 1, bDay);

    return dateA - dateB;
  });

  // Limit to last 60 days for readability
  const recentDays = sortedDays.slice(-60);

  dailyChart = new Chart(ctx, {
    type: "line",
    data: {
      labels: recentDays.map((d) => {
        // Parse the date correctly from M/D/YYYY format
        const [month, day, year] = d[0].split("/");
        return month + "/" + day;
      }),
      datasets: [
        {
          label: "Daily Messages",
          data: recentDays.map((d) => d[1]),
          borderColor: "rgba(147, 51, 234, 1)",
          backgroundColor: "rgba(147, 51, 234, 0.1)",
          tension: 0.4,
          fill: true,
          pointBackgroundColor: "rgba(147, 51, 234, 1)",
          pointBorderColor: "#fff",
          pointBorderWidth: 2,
          pointRadius: 4,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      plugins: {
        legend: { display: false },
      },
      scales: {
        y: { beginAtZero: true },
      },
    },
  });
}

export { drawUserChart, drawHourChart, drawDailyChart };
