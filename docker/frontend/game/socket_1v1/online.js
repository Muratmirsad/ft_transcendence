const canvas = document.getElementById("gc");
const context = canvas.getContext("2d");

let paddle_y = 40; // Yerel paddle
let opponent_paddle_y = 40; // Karşı oyuncunun paddle'ı
const paddle_thickness = 10;
const paddle_height = 100;
let ball_x = canvas.width / 2;
let ball_y = canvas.height / 2;
let score = 0;
let opponent_score = 0;

let keysPressed = {};
const roomName = "example_room";
let ws;

// WebSocket bağlantısını başlat
function connectWebSocket() {
  ws = new WebSocket(`ws://localhost:8000/ws/game/${roomName}/`);

  ws.onopen = () => {
    console.log("WebSocket bağlantısı kuruldu.");
  };

  ws.onmessage = (message) => {
    const data = JSON.parse(message.data);

    if (data.event === "update") {
      opponent_paddle_y = data.paddle_y || opponent_paddle_y;
      ball_x = data.ball_x || ball_x;
      ball_y = data.ball_y || ball_y;
      score = data.score || score;
      opponent_score = data.opponent_score || opponent_score;
    }
  };

  ws.onclose = () => {
    console.warn("WebSocket bağlantısı kapandı. Yeniden bağlanılıyor...");
    setTimeout(connectWebSocket, 5000);
  };

  ws.onerror = (error) => {
    console.error("WebSocket hatası:", error);
  };
}

// Paddle hareketlerini dinle
window.addEventListener("keydown", (e) => {
  keysPressed[e.key.toLowerCase()] = true;

  if (["w", "s"].includes(e.key.toLowerCase())) {
    sendMessage({ event: "move", paddle_y });
  }
});

window.addEventListener("keyup", (e) => {
  keysPressed[e.key.toLowerCase()] = false;
});

// Paddle ve top hareketleri
function movePaddles() {
  if (keysPressed["w"] && paddle_y > 0) {
    paddle_y -= 10;
    sendMessage({ event: "move", paddle_y });
  }
  if (keysPressed["s"] && paddle_y < canvas.height - paddle_height) {
    paddle_y += 10;
    sendMessage({ event: "move", paddle_y });
  }
}

// Çizim
function draw() {
  context.clearRect(0, 0, canvas.width, canvas.height);

  // Paddle'lar
  context.fillStyle = "white";
  context.fillRect(0, paddle_y, paddle_thickness, paddle_height);
  context.fillRect(
    canvas.width - paddle_thickness,
    opponent_paddle_y,
    paddle_thickness,
    paddle_height
  );

  // Top
  context.beginPath();
  context.arc(ball_x, ball_y, 10, 0, Math.PI * 2);
  context.fill();

  // Skor
  context.font = "20px Arial";
  context.fillText(score, 50, 50);
  context.fillText(opponent_score, canvas.width - 50, 50);
}

// Oyun döngüsü
function gameLoop() {
  movePaddles();
  draw();
  requestAnimationFrame(gameLoop);
}

// Başlat
connectWebSocket();
gameLoop();
