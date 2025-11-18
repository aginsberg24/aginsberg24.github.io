document.addEventListener("DOMContentLoaded", () => {
    displayWorkouts();
    updateWorkoutChart();
  });
  
  // Element references
  const form = document.getElementById("workout-form");
  const entries = document.getElementById("workout-entries");
  const clearBtn = document.getElementById("clear-workouts");
  const filterDate = document.getElementById("filter-date");
  
  // --------------------
  // Add Workout
  // --------------------
  form.addEventListener("submit", (e) => {
    e.preventDefault();
  
    const workout = {
      exercise: document.getElementById("exercise").value,
      sets: parseInt(document.getElementById("sets").value),
      reps: parseInt(document.getElementById("reps").value),
      weight: parseInt(document.getElementById("weight").value),
      date: document.getElementById("date").value || new Date().toISOString().split("T")[0],
    };
  
    let workouts = JSON.parse(localStorage.getItem("workouts")) || [];
    workouts.push(workout);
    localStorage.setItem("workouts", JSON.stringify(workouts));
  
    form.reset();
    displayWorkouts();
    updateWorkoutChart();
  });
  
  // --------------------
  // Display Table (Filtered by Date)
  // --------------------
  function displayWorkouts() {
    entries.innerHTML = "";
    const workouts = JSON.parse(localStorage.getItem("workouts")) || [];
    const selectedDate = filterDate.value;
  
    let filteredWorkouts = workouts;
    if (selectedDate) {
      filteredWorkouts = workouts.filter((w) => w.date === selectedDate);
    }
  
    if (filteredWorkouts.length === 0) {
      entries.innerHTML = `<tr><td colspan="6">No workouts found for this date.</td></tr>`;
      return;
    }
  
    // Display filtered workouts in table
    filteredWorkouts.forEach((w, index) => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${w.exercise}</td>
        <td>${w.sets}</td>
        <td>${w.reps}</td>
        <td>${w.weight}</td>
        <td>${w.date}</td>
        <td><button class="delete-btn" data-date="${w.date}" data-exercise="${w.exercise}" data-weight="${w.weight}" data-sets="${w.sets}" data-reps="${w.reps}">Delete</button></td>
      `;
      entries.appendChild(row);
    });
  
    // Attach delete event listeners (since we’re regenerating rows)
    document.querySelectorAll(".delete-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const { date, exercise, sets, reps, weight } = e.target.dataset;
        deleteWorkout(date, exercise, sets, reps, weight);
      });
    });
  }
  
  // --------------------
  // Delete Workout
  // --------------------
  function deleteWorkout(date, exercise, sets, reps, weight) {
    let workouts = JSON.parse(localStorage.getItem("workouts")) || [];
  
    // Match exact record
    workouts = workouts.filter(
      (w) =>
        !(
          w.date === date &&
          w.exercise === exercise &&
          w.sets == sets &&
          w.reps == reps &&
          w.weight == weight
        )
    );
  
    localStorage.setItem("workouts", JSON.stringify(workouts));
    displayWorkouts();
    updateWorkoutChart();
  }
  
  // --------------------
  // Clear All Workouts
  // --------------------
  clearBtn.addEventListener("click", () => {
    localStorage.removeItem("workouts");
    entries.innerHTML = "";
    updateWorkoutChart();
  });
  
  // --------------------
  // Filter by Date
  // --------------------
  filterDate.addEventListener("change", () => {
    displayWorkouts();
  });
  
  // --------------------
  // Chart.js Line Chart (Weight Over Time)
  // --------------------
  const ctx = document.getElementById("workoutChart").getContext("2d");
  
  let workoutChart = new Chart(ctx, {
    type: "line",
    data: {
      labels: [],
      datasets: [],
    },
    options: {
      responsive: true,
      interaction: { mode: "index", intersect: false },
      plugins: {
        title: {
          display: true,
          text: "Average Weight Lifted Per Exercise Over Time",
          color: "#222",
          font: { size: 18 },
        },
        legend: { position: "bottom" },
      },
      scales: {
        x: { title: { display: true, text: "Date" } },
        y: { title: { display: true, text: "Weight (lbs)" }, beginAtZero: true },
      },
    },
  });
  
  // --------------------
  // Update Chart
  // --------------------
  function updateWorkoutChart() {
    const workouts = JSON.parse(localStorage.getItem("workouts")) || [];
    if (workouts.length === 0) {
      workoutChart.data.labels = [];
      workoutChart.data.datasets = [];
      workoutChart.update();
      return;
    }
  
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
        const avg = weights.reduce((a, b) => a + b, 0) / weights.length;
        return avg;
      });
  
      return {
        label: exercise,
        data,
        fill: false,
        tension: 0.3,
        borderWidth: 2,
        borderColor: getRandomColor(),
        pointRadius: 4,
        pointHoverRadius: 6,
      };
    });
  
    workoutChart.data.labels = dates;
    workoutChart.data.datasets = datasets;
    workoutChart.update();
  }
  
  // --------------------
  // Random Color Generator
  // --------------------
  function getRandomColor() {
    const r = Math.floor(Math.random() * 200);
    const g = Math.floor(Math.random() * 200);
    const b = Math.floor(Math.random() * 200);
    return `rgb(${r}, ${g}, ${b})`;
  }
  