let loggedInEmail = "";

async function signup() {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  const res = await fetch("/signup", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password })
  });

  const msg = await res.text();
  document.getElementById("message").innerText = msg;

  if (res.ok) {
    localStorage.setItem("userEmail", email);
    window.location.href = "/dashboard.html";
  }
}

async function login() {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  const res = await fetch("/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password })
  });

  const msg = await res.text();
  document.getElementById("message").innerText = msg;

  if (res.ok) {
    localStorage.setItem("userEmail", email);
    window.location.href = "/dashboard.html";
  }
}

async function getRecipe() {
  const res = await fetch("https://www.themealdb.com/api/json/v1/1/random.php");
  const data = await res.json();
  const recipe = data.meals[0];

  document.getElementById("recipe").innerHTML = `
    <div class="recipe-card">
      <h4>${recipe.strMeal}</h4>
      <img src="${recipe.strMealThumb}" alt="${recipe.strMeal}" />
      <p>${recipe.strInstructions.slice(0, 300)}...</p>
    </div>
  `;

  // Save data for Save button
  window.currentRecipe = {
    id: recipe.idMeal,
    title: recipe.strMeal,
    image: recipe.strMealThumb,
    instructions: recipe.strInstructions
  };
}

async function saveFavorite() {
  const email = localStorage.getItem("userEmail");
  const recipe = window.currentRecipe;

  if (!email || !recipe) return alert("Missing required field");

  const res = await fetch("/save-favorite", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...recipe, email })
  });

  const msg = await res.text();
  alert(msg);

  if (res.ok) loadFavorites();
}

async function loadFavorites() {
    const email = localStorage.getItem("userEmail");
    if (!email) return;
  
    const res = await fetch(`/favorites?email=${encodeURIComponent(email)}`);
    const favs = await res.json();
  
    const favContainer = document.getElementById("favorites");
    favContainer.innerHTML = favs.length === 0
      ? "<p>No favorites yet.</p>"
      : favs.map(fav => `
        <div class="recipe-card">
          <h4>${fav.title}</h4>
          <img src="${fav.image}" alt="${fav.title}" />
          <p>${fav.instructions.slice(0, 200)}...</p>
        </div>
      `).join("");
  }
  
if (window.location.pathname.includes("dashboard.html")) {
  loadFavorites();
}
