import { setupNavLinks } from "./navigation.js";

let pageLoading = false;

function getCookie(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(";").shift();
}

export function getPageFromURL() {
  const hash = window.location.hash;
  return hash.slice(1);
}

const pageModules = {
  login: { module: "./auth.js", method: "setupLoginForm" },
  register: { module: "./auth.js", method: "setupRegisterForm" },
  game: { module: "./game.js", method: "setupGame" },
  home: { module: "./home.js", method: "setupHome" },
  "2fa": { module: "./2fa.js", method: "verifyCode" },
  profile: { module: "./profile.js", method: "setupProfile" },
  tournament: { module: "./tournament.js", method: "setupTournament" },
  multiplayer: { module: "./multiplayer.js", method: "setupMultiplayer" },
  password: {
    module: "./password.js",
    method: "password",
    params: [0],
  },
};

export function setupDynamicContent(page) {
  const pageModule = pageModules[page];
  if (pageModule) {
    import(pageModule.module).then((module) => {
      if (pageModule.params) {
        module[pageModule.method](...pageModule.params);
      } else {
        module[pageModule.method]();
      }
    });
  }
}

export function loadPage(page) {
  if (pageLoading) return Promise.resolve(); // Sayfa yükleniyorsa, Promise.resolve() döndür
  pageLoading = true;

  const content = document.getElementById("content");
  if (page === "game" && !localStorage.getItem("jwt")) {
    alert("Please log in to access the game.");
    loadPage("login");
    pageLoading = false;
    return Promise.resolve(); // Giriş yapılmadıysa, Promise.resolve() döndür
  }

  const pageExists = [
    "index",
    "register",
    "login42",
    "login",
    "game",
    "home",
    "profile",
    "password",
    "tournament",
    "multiplayer",
  ].includes(page);

  if (!pageExists) {
    if (!page) {
      console.log("No page specified, loading home page");
      loadPage("home");
      pageLoading = false;
      return Promise.resolve();
    } else {
      console.error("Page not found");
      content.innerHTML = "<h1>Page not found</h1>";
      pageLoading = false;
      return Promise.resolve();
    }
  }

  content.innerHTML = "";
  const pagePath = page === "index" ? `${page}.html` : `pages/${page}.html`;
  setupNavbarCSS();

  return fetch(pagePath)
    .then((response) => {
      if (!response.ok) {
        throw new Error("Page not found");
      }
      return response.text();
    })
    .then((html) => {
      content.innerHTML = html;
      history.pushState({ page: page }, null, `#${page}`);
      setupDynamicContent(page);
      return Promise.resolve(); // Sayfa başarıyla yüklendiğinde Promise.resolve() döndür
    })
    .catch((error) => {
      console.error("Error:", error);
      content.innerHTML = "<h1>Page not found</h1>";
      return Promise.reject(error);
    })
    .finally(() => {
      pageLoading = false;
    });
}

function setupNavbarCSS() {
  const jwt = getCookie("jwt");
  const navbar = document.getElementById("mainNavbar");

  let navbarHTML = `
    <div class="container-fluid">
      <a href="#home" id="home-link" class="d-flex align-items-center text-decoration-none">
        <span style="color: orange; font-weight: bold; font-size: 1.75rem; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.2);">42</span>
        <span style="color: white; font-weight: 500; font-size: 1.75rem; margin-left: 0.3rem; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.2);">Game</span>
      </a>
      <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
        <span class="navbar-toggler-icon"></span>
      </button>
      <div class="collapse navbar-collapse" id="navbarNav">
        <ul class="navbar-nav ms-auto">`;

  if (jwt) {
    navbarHTML += `
      <li class="nav-item me-3">
        <a class="nav-link" href="#" id="game-link">
          <i class="bi bi-controller"></i> <h6 id="game-butonu">Remote</h6>
        </a>
      </li>
      <li class="nav-item me-3">
        <a class="nav-link" href="#" id="tournament-link">
          <i class="bi bi-person-circle"></i> <h6 id="turnuva-butonu">Tournament</h6>
        </a>
      </li>
      <li class="nav-item me-3">
        <a class="nav-link" href="#" id="multiplayer-link">
          <i class="bi bi-person-circle"></i> <h6 id="multiplayer-butonu">Multiplayer</h6>
        </a>
      </li>
      <li class="nav-item me-3">
        <a class="nav-link" href="#" id="profile-link">
          <i class="bi bi-person-circle"></i> <h6 id="profil-butonu">Profile</h6>
        </a>
      </li>
      <li class="nav-item">
        <a class="nav-link" href="#" id="logout-link">
          <i class="bi bi-box-arrow-right"></i> <h6 id="logout-butonu">Logout</h6>
        </a>
      </li>
    `;
  } else {
    navbarHTML += `
      <li class="nav-item me-3">
        <a class="nav-link" href="#" id="login-link">
          <i class="bi bi-box-arrow-in-right"></i> <b id= "sign_in_first">SIGN IN</b>
        </a>
      </li>
      <li class="nav-item">
        <a class="nav-link" href="#" id="register-link">
          <i class="bi bi-person-plus"></i> <b id="sign_up_first">SIGN UP</b>
        </a>
      </li>
    `;
  }
  navbarHTML += `
        </ul>
      </div>
    </div>`;

  navbar.innerHTML = navbarHTML;
  setupNavLinks(); // Navbar oluşturulduktan sonra linkleri ayarla
}

window.onload = function () {
  const page = getPageFromURL();
  loadPage(page || "home");
};

window.onhashchange = function () {
  if (!pageLoading) {
    const page = getPageFromURL();
    loadPage(page || "home");
  }
};
