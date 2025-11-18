let workoutChart, mealChart, habitChart;

document.addEventListener("DOMContentLoaded", () => {
  renderAllCharts();
  window.addEventListener("storage", renderAllCharts);
});

// ---------- RENDER ALL ----------
function renderAllCharts() {
  renderWorkoutChart();
  renderMealChart();
  renderHabitsChart();
}

// ---------- WORKOUT CHART ----------
function renderWorkoutChart() {
  const workouts = JSON.parse(localStorage.getItem("workouts")) || [];
  const ctx = document.getElementById("workoutOverviewChart").getContext("2d");
  if (workoutChart) workoutChart.destroy();

  if (workouts.length === 0) {
    workoutChart = new Chart(ctx, {
      type: "line",
      data: { labels: [], datasets: [] },
      options: { plugins: { title: { display: true, text: "No workout data yet" } } },
    });
    return;
  }

  // Group workouts by date & exercise
  const dates = [...new Set(workouts.map((w) => w.date))].sort();
  const grouped = {};

  workouts.forEach((w) => {
    if (!grouped[w.exercise]) grouped[w.exercise] = {};
    if (!grouped[w.exercise][w.date]) grouped[w.exercise][w.date] = [];
    grouped[w.exercise][w.date].push(w.weight);
  });

  const datasets = Object.keys(grouped).map((exercise) => {
    const data = dates.map((d) => {
      const weights = grouped[exercise][d];
      if (!weights) return null;
      return weights.reduce((a, b) => a + b, 0) / weights.length;
    });
    return {
      label: exercise,
      data,
      fill: false,
      borderColor: getRandomColor(),
      borderWidth: 2,
      tension: 0.3,
      pointRadius: 4,
      pointHoverRadius: 6,
    };
  });

  workoutChart = new Chart(ctx, {
    type: "line",
    data: { labels: dates, datasets },
    options: {
      responsive: true,
      interaction: { mode: "index", intersect: false },
      plugins: {
        title: { display: true, text: "Average Weight per Exercise Over Time" },
        legend: { position: "bottom" },
      },
      scales: {
        x: { title: { display: true, text: "Date" } },
        y: { title: { display: true, text: "Avg Weight (lbs)" }, beginAtZero: true },
      },
    },
  });
}

// ---------- MEAL CHART ----------
function renderMealChart() {
  const meals = JSON.parse(localStorage.getItem("meals")) || [];
  const ctx = document.getElementById("mealOverviewChart").getContext("2d");
  if (mealChart) mealChart.destroy();

  if (meals.length === 0) {
    mealChart = new Chart(ctx, {
      type: "line",
      data: { labels: [], datasets: [] },
      options: { plugins: { title: { display: true, text: "No meal data yet" } } },
    });
    return;
  }

  const dates = [...new Set(meals.map((m) => m.date))].sort();
  const totalCalories = dates.map((d) => {
    const daily = meals.filter((m) => m.date === d);
    return daily.reduce((sum, m) => sum + (parseInt(m.calories) || 0), 0);
  });

  mealChart = new Chart(ctx, {
    type: "line",
    data: {
      labels: dates,
      datasets: [
        {
          label: "Calories Consumed",
          data: totalCalories,
          borderColor: "#e67e22",
          backgroundColor: "rgba(230,126,34,0.3)",
          tension: 0.3,
          borderWidth: 2,
          fill: true,
        },
      ],
    },
    options: {
      responsive: true,
      animation: { duration: 800 },
      plugins: { legend: { display: false } },
      scales: {
        y: { beginAtZero: true, title: { display: true, text: "Calories" } },
      },
    },
  });
}

// ---------- HABITS CHART ----------
function renderHabitsChart() {
  const habits = JSON.parse(localStorage.getItem("habits")) || [];
  const ctx = document.getElementById("habitsOverviewChart").getContext("2d");
  if (habitChart) habitChart.destroy();

  if (habits.length === 0) {
    habitChart = new Chart(ctx, {
      type: "bar",
      data: { labels: [], datasets: [] },
      options: { plugins: { title: { display: true, text: "No habit data yet" } } },
    });
    return;
  }

  const week = getCurrentWeek();
  const filtered = habits.filter((h) => week.includes(h.date));
  const grouped = {};

  filtered.forEach((h) => {
    if (!grouped[h.name]) grouped[h.name] = 0;
    if (h.completed) grouped[h.name]++;
  });

  habitChart = new Chart(ctx, {
    type: "bar",
    data: {
      labels: Object.keys(grouped),
      datasets: [
        {
          label: "Completions This Week",
          data: Object.values(grouped),
          backgroundColor: "rgba(46,204,113,0.6)",
          borderColor: "#2ecc71",
          borderWidth: 2,
          borderRadius: 6,
        },
      ],
    },
    options: {
      responsive: true,
      animation: { duration: 800 },
      plugins: { legend: { display: false } },
      scales: {
        y: { beginAtZero: true, title: { display: true, text: "Times Completed" } },
      },
    },
  });
}

function getCurrentWeek() {
  const today = new Date();
  const firstDay = new Date(today);
  firstDay.setDate(today.getDate() - today.getDay() + 1);
  const week = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(firstDay);
    d.setDate(firstDay.getDate() + i);
    week.push(d.toISOString().split("T")[0]);
  }
  return week;
}

function getRandomColor() {
  const r = Math.floor(Math.random() * 180);
  const g = Math.floor(Math.random() * 180);
  const b = Math.floor(Math.random() * 180);
  return `rgb(${r}, ${g}, ${b})`;
}
