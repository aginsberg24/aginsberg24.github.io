document.addEventListener("DOMContentLoaded", () => {
  displayTasks();
  updateChart();
});

const form = document.getElementById("task-form");
const entries = document.getElementById("task-entries");
const clearBtn = document.getElementById("clear-tasks");
const filterButtons = document.querySelectorAll(".filters button");

let currentFilter = "all";

// --------------------
// Add Task
// --------------------
form.addEventListener("submit", (e) => {
  e.preventDefault();

  const taskName = document.getElementById("task-name").value;
  const taskDate = document.getElementById("task-date").value || "No Date";
  const task = { name: taskName, date: taskDate, completed: false };

  let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
  tasks.push(task);
  localStorage.setItem("tasks", JSON.stringify(tasks));

  form.reset();
  displayTasks();
  updateChart();
});

// --------------------
// Display Tasks (with Filters)
// --------------------
function displayTasks() {
  entries.innerHTML = "";
  let tasks = JSON.parse(localStorage.getItem("tasks")) || [];

  const filteredTasks = tasks.filter((t) => applyFilter(t));

  filteredTasks.forEach((t, index) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${t.name}</td>
      <td>${t.date}</td>
      <td><input type="checkbox" onchange="toggleComplete(${index})" ${t.completed ? "checked" : ""}/></td>
      <td><button onclick="deleteTask(${index})">Delete</button></td>
    `;
    if (t.completed) row.classList.add("completed");
    entries.appendChild(row);
  });
}

// --------------------
// Filter Logic
// --------------------
function applyFilter(task) {
  const today = new Date();
  const taskDate = task.date !== "No Date" ? new Date(task.date) : null;

  switch (currentFilter) {
    case "today":
      return taskDate && isSameDay(today, taskDate);
    case "week":
      return taskDate && isSameWeek(today, taskDate);
    case "completed":
      return task.completed;
    default:
      return true;
  }
}

function isSameDay(d1, d2) {
  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
  );
}

function isSameWeek(today, date) {
  const diff = Math.abs(today - date);
  const days = diff / (1000 * 60 * 60 * 24);
  return days < 7 && today.getDay() >= date.getDay();
}

// --------------------
// Filter Buttons Event
// --------------------
filterButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    filterButtons.forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    currentFilter = btn.dataset.filter;
    displayTasks();
  });
});

// --------------------
// Toggle Completion
// --------------------
function toggleComplete(index) {
  let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
  tasks[index].completed = !tasks[index].completed;
  localStorage.setItem("tasks", JSON.stringify(tasks));
  displayTasks();
  updateChart();
}

// --------------------
// Delete Task
// --------------------
function deleteTask(index) {
  let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
  tasks.splice(index, 1);
  localStorage.setItem("tasks", JSON.stringify(tasks));
  displayTasks();
  updateChart();
}

// --------------------
// Clear All Tasks
// --------------------
clearBtn.addEventListener("click", () => {
  localStorage.removeItem("tasks");
  entries.innerHTML = "";
  updateChart();
});

// --------------------
// Chart.js Setup
// --------------------
const ctx = document.getElementById("taskChart").getContext("2d");

let taskChart = new Chart(ctx, {
  type: "doughnut",
  data: {
    labels: ["Completed", "Pending"],
    datasets: [
      {
        data: [0, 0],
        backgroundColor: ["rgba(75, 192, 192, 0.7)", "rgba(255, 99, 132, 0.7)"],
      },
    ],
  },
  options: {
    responsive: true,
    plugins: {
      title: {
        display: true,
        text: "Task Completion Overview",
      },
    },
  },
});

// --------------------
// Update Chart
// --------------------
function updateChart() {
  const tasks = JSON.parse(localStorage.getItem("tasks")) || [];
  const completedCount = tasks.filter((t) => t.completed).length;
  const pendingCount = tasks.length - completedCount;

  taskChart.data.datasets[0].data = [completedCount, pendingCount];
  taskChart.update();
}
