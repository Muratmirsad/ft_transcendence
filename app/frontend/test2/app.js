// Define routes and their corresponding HTML file paths
const routes = {
    "/": "/pages/home.html",
    "/about1": "/game_local/game.html",
    "/contact": "/pages/contact.html",
  };
  
  // Function to navigate to a new URL
  function navigateTo(url) {
    history.pushState(null, null, url);
    renderPage();
  }
  
  // Function to fetch and render the current page's content
  async function renderPage() {
    const app = document.getElementById("app");
    const route = routes[window.location.pathname];
  
    if (route) {
      try {
        const response = await fetch(route); // Fetch the corresponding HTML file
        if (!response.ok) throw new Error("Page not found");
        const content = await response.text();
        app.innerHTML = content;
      } catch (error) {
        app.innerHTML = "<h1>404</h1><p>Page not found!</p>";
      }
    } else {
      app.innerHTML = "<h1>404</h1><p>Page not found!</p>";
    }
  }
  
  // Event listener for link clicks
  document.addEventListener("click", (event) => {
    if (event.target.matches("[data-link]")) {
      event.preventDefault();
      navigateTo(event.target.href);
    }
  });
  
  // Handle back/forward navigation
  window.addEventListener("popstate", renderPage);
  
  // Initial page load
  document.addEventListener("DOMContentLoaded", renderPage);
  