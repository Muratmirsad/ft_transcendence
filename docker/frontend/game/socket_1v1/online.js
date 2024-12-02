// Canvas ayarları
const canvas = document.getElementById("gc");
const context = canvas.getContext("2d");

// HTML Elementleri
const createRoomButton = document.getElementById("create-room-button");
const joinRoomButton = document.getElementById("join-room-button");
const roomCodeDisplay = document.getElementById("room-code-display");
const roomCodeSpan = document.getElementById("room-code");
const roomInput = document.getElementById("room-input");
const mainMenu = document.getElementById("main-menu");

// Oyun değişkenleri
let paddle1_y = 40;
let paddle2_y = 40;
const paddle_thickness = 10;
const paddle_height = 100;
let ball_x = canvas.width / 2;
let ball_y = canvas.height / 2;
let ball_dimension = 10;
let x_velocity = 5;
let y_velocity = 5;
let player1_score = 0;
let player2_score = 0;
let gameActive = false;
let roomName = null;
let socket = null;

// Klavye tuslari icin
const keysPressed = {};

// Rastgele 4 haneli bir oda kodu oluştur
function generateRoomCode() {
  return Math.floor(1000 + Math.random() * 9000).toString();
}

// WebSocket bağlantısını başlat
function startWebSocket(roomName) {
  socket = new WebSocket(`ws://localhost:8000/ws/game/${roomName}/`);

  socket.onopen = function () {
    console.log(`WebSocket bağlantısı kuruldu. Room: ${roomName}`);
  };

  socket.onmessage = function (event) {
    const data = JSON.parse(event.data);

    if (data.action === "update_paddle") {
      // Diğer oyuncunun paddle pozisyonunu güncelle
      paddle2_y = data.paddle_y;
    }

    if (data.action === "update_ball") {
      // Top pozisyonunu güncelle
      ball_x = data.ball_data.x;
      ball_y = data.ball_data.y;
    }

    if (data.action === "update_score") {
      // Skorları güncelle
      player1_score = data.score_data.player1_score;
      player2_score = data.score_data.player2_score;
    }

    if (data.action === "start_game") {
      // Oyunu başlat
      console.log("Oyun başladı!");
      startGame();
    }
  };

  socket.onclose = function () {
    console.log("WebSocket bağlantısı kapatıldı.");
  };
}

// Paddle hareketlerini gönder
function sendPaddlePosition() {
  if (socket && socket.readyState === WebSocket.OPEN) {
    socket.send(
      JSON.stringify({
        action: "update_paddle",
        paddle_y: paddle1_y,
      })
    );
  }
}

// Skor güncellemelerini gönder
function sendScoreUpdate() {
  if (socket && socket.readyState === WebSocket.OPEN) {
    socket.send(
      JSON.stringify({
        action: "update_score",
        score_data: {
          player1_score: player1_score,
          player2_score: player2_score,
        },
      })
    );
  }
}

// Oyunu başlat
function startGame() {
  if (!gameActive) { // Oyunun zaten aktif olup olmadığını kontrol et
    console.log("Oyun başlıyor...");
    mainMenu.style.display = "none";
    canvas.style.display = "block";
    gameActive = true; // Oyunu aktif hale getir
    gameLoop(); // Oyun döngüsünü başlat
  }
}


// Tuş basma ve bırakma olayları
window.addEventListener("keydown", (e) => {
  if (gameActive) {
    keysPressed[e.key.toLowerCase()] = true;
    sendPaddlePosition();
  }
});

window.addEventListener("keyup", (e) => {
  if (gameActive) {
    keysPressed[e.key.toLowerCase()] = false;
    sendPaddlePosition();
  }
});

// Paddle hareketleri
function movePaddles() {
  if (keysPressed["w"] && paddle1_y > 0) {
    paddle1_y -= 10;
  }
  if (keysPressed["s"] && paddle1_y < canvas.height - paddle_height) {
    paddle1_y += 10;
  }
}

// Topun başlangıç pozisyonunu sıfırla
function resetBall() {
  ball_x = canvas.width / 2;
  ball_y = canvas.height / 2;
  x_velocity = -x_velocity; // Topun yönünü değiştir
  y_velocity = 5; // Varsayılan bir y_velocity değeri
}

// Top hareketi
function moveBall() {
  ball_x += x_velocity;
  ball_y += y_velocity;

  if (ball_y < 0 || ball_y > canvas.height) {
    y_velocity = -y_velocity;
  }

  if (
    ball_x < paddle_thickness &&
    ball_y > paddle1_y &&
    ball_y < paddle1_y + paddle_height
  ) {
    x_velocity = -x_velocity;
  }

  if (
    ball_x > canvas.width - paddle_thickness &&
    ball_y > paddle2_y &&
    ball_y < paddle2_y + paddle_height
  ) {
    x_velocity = -x_velocity;
  }

  if (ball_x < 0) {
    player2_score++;
    resetBall();
    sendScoreUpdate();
  }

  if (ball_x > canvas.width) {
    player1_score++;
    resetBall();
    sendScoreUpdate();
  }
}

// Canvas çizimi
function draw() {
  context.fillStyle = "black";
  context.fillRect(0, 0, canvas.width, canvas.height);

  context.fillStyle = "white";
  context.fillRect(0, paddle1_y, paddle_thickness, paddle_height);
  context.fillRect(
    canvas.width - paddle_thickness,
    paddle2_y,
    paddle_thickness,
    paddle_height
  );

  context.fillStyle = "white";
  context.beginPath();
  context.arc(ball_x, ball_y, ball_dimension, 0, Math.PI * 2, true);
  context.fill();

  context.font = "30px Arial";
  context.fillText(player1_score, 100, 50);
  context.fillText(player2_score, canvas.width - 100, 50);
}

// Oyun döngüsü
function gameLoop() {
  if (gameActive) {
    movePaddles();
    moveBall();
    draw();
    requestAnimationFrame(gameLoop);
  }
}

// "Create Room" butonuna tıklanınca
createRoomButton.addEventListener("click", () => {
  roomName = generateRoomCode();
  roomCodeSpan.textContent = roomName;
  roomCodeDisplay.style.display = "block";
  startWebSocket(roomName);
});

// "Join Room" butonuna tıklanınca
joinRoomButton.addEventListener("click", () => {
  const enteredRoomCode = roomInput.value.trim();
  if (enteredRoomCode) {
    roomName = enteredRoomCode;
    startWebSocket(roomName);
    startGame();
  }
});
