// Canvas ayarları
const canvas = document.getElementById("gc");
const context = canvas.getContext("2d");

// Oyun değişkenleri
let paddle_y = 40; // Yerel paddle
let opponent_paddle_y = 40; // Karşı oyuncunun paddle'ı
const paddle_thickness = 10;
const paddle_height = 100;
let ball_x = canvas.width / 2;
let ball_y = canvas.height / 2;
let ball_velocity_x = 5;
let ball_velocity_y = 5;
const ball_dimension = 10; // Topun boyutu
let score = 0;
let opponent_score = 0;

let keysPressed = {};
let ws;
let role = ""; // Oyuncu rolü (player_1 veya player_2)

// Oyunu başlatma
function startGame() {
  console.log("Oyun başladı!");
  document.getElementById("main-menu").style.display = "none";
  document.getElementById("gc").style.display = "block";

  gameLoop();
}

// WebSocket bağlantısını başlat
function connectWebSocket(room) {
  ws = new WebSocket(`ws://localhost:8000/ws/game/${room}/`);

  ws.onopen = () => {
    console.log("WebSocket bağlantısı kuruldu.");
  };

  ws.onmessage = (message) => {
    const data = JSON.parse(message.data);
    console.log("Sunucudan mesaj alındı:", data);

    if (data.event === "connected") {
      role = data.role;
      console.log(`Bu oyuncunun rolü: ${role}`);
    }

    if (data.event === "start_game") {
      startGame(); // Sunucudan "start_game" olayı alındığında oyun başlar
    }

    if (data.event === "update") {
      ball_x = data.ball_position.x;
      ball_y = data.ball_position.y;
      opponent_paddle_y = data.paddle_positions[role === "player_1" ? "player_2" : "player_1"];
      score = data.scores[role];
      opponent_score = data.scores[role === "player_1" ? "player_2" : "player_1"];
      player_count = data.player_count;
      roles = data.roles;

      // Oyuncu sayısına göre arayüzü güncelle (örneğin, ikinci oyuncu katıldığında mesaj göster)
      if (player_count === 2) {
          // İkinci oyuncu katıldı, oyun başlayabilir
          startGame();
      }
  }
};

  ws.onclose = () => {
    console.error("WebSocket bağlantısı kapandı. Yeniden bağlanılıyor...");
    setTimeout(() => connectWebSocket(room), 5000);
  };

  ws.onerror = (error) => {
    console.error("WebSocket hatası:", error);
  };
}

// Paddle hareketlerini dinle
window.addEventListener("keydown", (e) => {
  if (e.key && e.key.toLowerCase) {
    keysPressed[e.key.toLowerCase()] = true;

    if (e.key.toLowerCase() === "w" || e.key.toLowerCase() === "s") {
      sendMessage({ event: "move", key: e.key.toLowerCase(), role });
    }
  }
});

window.addEventListener("keyup", (e) => {
  if (e.key && e.key.toLowerCase) {
    keysPressed[e.key.toLowerCase()] = false;
  }
});

// Paddle ve top hareketleri
function movePaddles() {
  if (keysPressed["w"] && paddle_y > 0) {
    paddle_y -= 10;
  }
  if (keysPressed["s"] && paddle_y < canvas.height - paddle_height) {
    paddle_y += 10;
  }
}

// Çizim
function draw() {
  context.clearRect(0, 0, canvas.width, canvas.height);

  context.fillStyle = "white";
  context.fillRect(0, paddle_y, paddle_thickness, paddle_height); // Yerel paddle
  context.fillRect(
    canvas.width - paddle_thickness,
    opponent_paddle_y,
    paddle_thickness,
    paddle_height
  ); // Karşı oyuncunun paddle'ı

  context.beginPath();
  context.arc(ball_x, ball_y, ball_dimension, 0, Math.PI * 2);
  context.fill();

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

// WebSocket mesaj gönderme fonksiyonu
function sendMessage(data) {
  if (ws && ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify(data));
  } else {
    console.error("WebSocket bağlantısı açık değil. Mesaj gönderilemedi.");
  }
}

// Oda oluşturma ve katılma butonları
document.getElementById("create-room-button").addEventListener("click", () => {
  const roomName = Math.floor(1000 + Math.random() * 9000).toString();
  console.log(`Oda oluşturuluyor: ${roomName}`);
  connectWebSocket(roomName);

  const roomCodeDisplay = document.getElementById("room-code-display");
  const roomCodeSpan = document.getElementById("room-code");
  roomCodeSpan.textContent = roomName;
  roomCodeDisplay.style.display = "block";
});

document.getElementById("join-room-button").addEventListener("click", () => {
  const enteredRoom = document.getElementById("room-input").value.trim();
  if (enteredRoom) {
    console.log(`Odaya katılınıyor: ${enteredRoom}`);
    connectWebSocket(enteredRoom);
  } else {
    alert("Lütfen bir oda adı girin!");
  }
});
