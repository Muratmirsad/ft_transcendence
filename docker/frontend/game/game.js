// Canvas ayarları
const canvas = document.getElementById("gc");
const context = canvas.getContext("2d");

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
const winning_score = 5;
let reset_game = false;

let keysPressed = {}; // Tuş durumlarını tutmak için

// Tuş basma ve bırakma olayları
window.addEventListener("keydown", (e) => {
  keysPressed[e.key.toLowerCase()] = true;
});

window.addEventListener("keyup", (e) => {
  keysPressed[e.key.toLowerCase()] = false;
});

// Topun başlangıç pozisyonu
function resetBall() {
  ball_x = canvas.width / 2;
  ball_y = canvas.height / 2;
  x_velocity = -x_velocity;
  y_velocity = 5;
}

// Paddle hareketleri
function movePaddles() {
  // Birinci oyuncu: W ve S
  if (keysPressed["w"] && paddle1_y > 0) {
    paddle1_y -= 10;
  }
  if (keysPressed["s"] && paddle1_y < canvas.height - paddle_height) {
    paddle1_y += 10;
  }

  // İkinci oyuncu: O ve L
  if (keysPressed["o"] && paddle2_y > 0) {
    paddle2_y -= 10;
  }
  if (keysPressed["l"] && paddle2_y < canvas.height - paddle_height) {
    paddle2_y += 10;
  }
}

// Top hareketi
function moveBall() {
  ball_x += x_velocity;
  ball_y += y_velocity;

  // Üst ve alt çarpma
  if (ball_y < 0 || ball_y > canvas.height) {
    y_velocity = -y_velocity;
  }

  // Sol paddle çarpma
  if (
    ball_x < paddle_thickness &&
    ball_y > paddle1_y &&
    ball_y < paddle1_y + paddle_height
  ) {
    x_velocity = -x_velocity;
    let delta_y = ball_y - (paddle1_y + paddle_height / 2);
    y_velocity = delta_y * 0.3;
  }

  // Sağ paddle çarpma
  if (
    ball_x > canvas.width - paddle_thickness &&
    ball_y > paddle2_y &&
    ball_y < paddle2_y + paddle_height
  ) {
    x_velocity = -x_velocity;
    let delta_y = ball_y - (paddle2_y + paddle_height / 2);
    y_velocity = delta_y * 0.3;
  }

  // Gol kontrolü
  if (ball_x < 0) {
    player2_score++;
    resetBall();
  }

  if (ball_x > canvas.width) {
    player1_score++;
    resetBall();
  }
}

// Canvas çizimi
function draw() {
  // Arka plan
  context.fillStyle = "black";
  context.fillRect(0, 0, canvas.width, canvas.height);

  // Paddle'lar
  context.fillStyle = "white";
  context.fillRect(0, paddle1_y, paddle_thickness, paddle_height);
  context.fillRect(
    canvas.width - paddle_thickness,
    paddle2_y,
    paddle_thickness,
    paddle_height
  );

  // Top
  context.fillStyle = "white";
  context.beginPath();
  context.arc(ball_x, ball_y, ball_dimension, 0, Math.PI * 2, true);
  context.fill();

  // Skor
  context.font = "30px Arial";
  context.fillText(player1_score, 100, 50);
  context.fillText(player2_score, canvas.width - 100, 50);
}

// Oyun döngüsü
function gameLoop() {
  if (!reset_game) {
    movePaddles(); // Paddle hareketlerini kontrol et
    moveBall(); // Top hareketini kontrol et
    draw(); // Ekranı çiz
    requestAnimationFrame(gameLoop);
  }
}

gameLoop();
