import { loadPage } from "./pageLoader.js";
import { logout } from "./auth.js";

const defaultLinks = ["register", "login", "profile", "friend", "tournament", "multiplayer"];

const specialLinks = {
  "game-link": function () {
    if (localStorage.getItem("jwt")) {
      loadPage("game");
    } else {
      alert("Please log in to access the game.");
      loadPage("login");
    }
  },
  "logout-link": function () {
    console.log("Logging out...");
    logout();
  },

  "multiplayer-link": function () {
    if (localStorage.getItem("jwt")) {
      loadPage("multiplayer");
    } else {
      alert("Please log in to access the multiplayer game.");
      loadPage("login");
    }
  },
};

export function setupNavLinks() {
  defaultLinks.forEach((link) => {
    const element = document.getElementById(`${link}-link`);
    if (element) {
      element.addEventListener("click", function (event) {
        event.preventDefault();
        loadPage(link);
      });
    }
  });

  Object.entries(specialLinks).forEach(([id, action]) => {
    document.getElementById(id)?.addEventListener("click", (event) => {
      event.preventDefault();
      action();
    });
  });
}
