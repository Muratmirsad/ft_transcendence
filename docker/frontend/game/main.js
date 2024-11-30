// Butonları seç
const localButton = document.getElementById("local");
const onlineButton = document.getElementById("online");
const aiButton = document.getElementById("ai");

// Yönlendirme işlemleri
localButton.addEventListener("click", () => {
  window.location.href = "local_1v1/game.html"; // Local 1v1 oyun sayfasına yönlendirme
});

onlineButton.addEventListener("click", () => {
  window.location.href = "socket_1v1/online.html"; // Online 1v1 oyun sayfasına yönlendirme
});

aiButton.addEventListener("click", () => {
  window.location.href = "ai.html"; // AI 1v1 oyun sayfasına yönlendirme
});
