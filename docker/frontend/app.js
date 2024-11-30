// Sayfa içeriklerini tanımlayın
const routes = {
    "#home": `
      <h1>Welcome to the Home Page</h1>
      <p>This is the home page content.</p>
    `,
    "#profile": `
      <h1>Your Profile</h1>
      <p>This is your profile page content.</p>
    `,
    "#contact": `
      <h1>Contact Us</h1>
      <p>Feel free to contact us at <a href="mailto:info@example.com">info@example.com</a>.</p>
    `,
    "#game": `
      <h1>Pong Game</h1>
      <div id="game-container">
        <iframe src="game/index.html" style="width: 100%; height: 600px; border: none;"></iframe>
      </div>
    `,
  };
  
  // Sayfayı render eden fonksiyon
  const renderPage = () => {
    const hash = window.location.hash || "#home"; // Varsayılan olarak home
    const mainContent = document.getElementById("main-content");
    mainContent.innerHTML = routes[hash] || "<h1>404</h1><p>Page not found!</p>";
  };
  
  // Hash değişikliklerini dinle
  window.addEventListener("hashchange", renderPage);
  
  // İlk yüklemede sayfayı render et
  document.addEventListener("DOMContentLoaded", () => {
    renderPage();
  
    // Linklere tıklamayı yönlendir
    document.querySelectorAll("a[data-link]").forEach((link) =>
      link.addEventListener("click", (e) => {
        e.preventDefault();
        window.location.hash = link.getAttribute("href");
      })
    );
  });
  