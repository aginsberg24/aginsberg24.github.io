const API_KEY = "34a3dd75715f409eae47991c1673077b";

document.addEventListener("DOMContentLoaded", () => {
  displayMeals();
  updateMealChart();
});

const form = document.getElementById("meal-form");
const entries = document.getElementById("meal-entries");
const clearBtn = document.getElementById("clear-meals");
const filterDate = document.getElementById("filter-date");
const searchBtn = document.getElementById("search-food");
const searchResults = document.getElementById("search-results");

// --------------------
// ADD MEAL
// --------------------
form.addEventListener("submit", (e) => {
  e.preventDefault();

  const meal = {
    name: document.getElementById("meal-name").value,
    calories: parseFloat(document.getElementById("meal-calories").value) || 0,
    protein: parseFloat(document.getElementById("meal-protein").value) || 0,
    carbs: parseFloat(document.getElementById("meal-carbs").value) || 0,
    fat: parseFloat(document.getElementById("meal-fat").value) || 0,
    date: document.getElementById("meal-date").value || new Date().toISOString().split("T")[0],
  };

  let meals = JSON.parse(localStorage.getItem("meals")) || [];
  meals.push(meal);
  localStorage.setItem("meals", JSON.stringify(meals));

  form.reset();
  searchResults.innerHTML = "";
  displayMeals();
  updateMealChart();
});

// --------------------
// DISPLAY MEALS (FILTERED BY DATE)
// --------------------
function displayMeals() {
  entries.innerHTML = "";
  const meals = JSON.parse(localStorage.getItem("meals")) || [];
  const selectedDate = filterDate.value || new Date().toISOString().split("T")[0];
  filterDate.value = selectedDate;

  const filtered = meals.filter((m) => m.date === selectedDate);

  filtered.forEach((m, index) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${m.name}</td>
      <td>${m.calories}</td>
      <td>${m.protein}</td>
      <td>${m.carbs}</td>
      <td>${m.fat}</td>
      <td>${m.date}</td>
      <td><button onclick="deleteMeal(${index})">Delete</button></td>
    `;
    entries.appendChild(row);
  });
}

// --------------------
// DELETE MEAL
// --------------------
function deleteMeal(index) {
  let meals = JSON.parse(localStorage.getItem("meals")) || [];
  meals.splice(index, 1);
  localStorage.setItem("meals", JSON.stringify(meals));
  displayMeals();
  updateMealChart();
}

// --------------------
// CLEAR ALL
// --------------------
clearBtn.addEventListener("click", () => {
  localStorage.removeItem("meals");
  entries.innerHTML = "";
  updateMealChart();
});

// --------------------
// FILTER BY DATE
// --------------------
filterDate.addEventListener("change", () => {
  displayMeals();
  updateMealChart();
});

// --------------------
// CHART.JS - DAILY CALORIES
// --------------------
const ctx = document.getElementById("mealChart").getContext("2d");
let mealChart = new Chart(ctx, {
  type: "bar",
  data: { labels: [], datasets: [{ label: "Total Daily Calories", data: [], backgroundColor: "rgba(54, 162, 235, 0.6)", borderColor: "#2563eb", borderWidth: 2 }] },
  options: {
    responsive: true,
    plugins: { title: { display: true, text: "Daily Calorie Intake" }, legend: { display: false } },
    scales: { y: { beginAtZero: true, title: { display: true, text: "Calories" } }, x: { title: { display: true, text: "Date" } } },
  },
});

function updateMealChart() {
  const meals = JSON.parse(localStorage.getItem("meals")) || [];
  const selectedDate = filterDate.value || new Date().toISOString().split("T")[0];
  const filtered = meals.filter((m) => m.date === selectedDate);
  const totalCalories = filtered.reduce((sum, m) => sum + m.calories, 0);

  mealChart.data.labels = [selectedDate];
  mealChart.data.datasets[0].data = [totalCalories];
  mealChart.update();
}

// --------------------
// SPOONACULAR INLINE SEARCH
// --------------------
searchBtn.addEventListener("click", async () => {
  const query = document.getElementById("meal-name").value.trim();
  if (!query) return;
  searchResults.innerHTML = "<li>Loading...</li>";

  try {
    const res = await fetch(
      `https://api.spoonacular.com/food/menuItems/search?query=${query}&number=5&apiKey=${API_KEY}`
    );
    const data = await res.json();

    searchResults.innerHTML = "";
    if (!data.menuItems || data.menuItems.length === 0) {
      searchResults.innerHTML = "<li>No results found.</li>";
      return;
    }

    data.menuItems.forEach((item) => {
      const li = document.createElement("li");
      li.textContent = item.title;
      li.addEventListener("click", async () => {
        const infoRes = await fetch(
          `https://api.spoonacular.com/food/menuItems/${item.id}?apiKey=${API_KEY}`
        );
        const details = await infoRes.json();

        const nutrients = details.nutrition?.nutrients || [];
        const getNutrient = (name) =>
          nutrients.find((n) => n.name.toLowerCase() === name.toLowerCase())?.amount || 0;

        document.getElementById("meal-name").value = details.title || query;
        document.getElementById("meal-calories").value = getNutrient("Calories");
        document.getElementById("meal-protein").value = getNutrient("Protein");
        document.getElementById("meal-carbs").value = getNutrient("Carbohydrates");
        document.getElementById("meal-fat").value = getNutrient("Fat");

        searchResults.innerHTML = ""; // clear dropdown after selecting
      });
      searchResults.appendChild(li);
    });
  } catch (error) {
    console.error("API Error:", error);
    searchResults.innerHTML = "<li>Error fetching data.</li>";
  }
});
