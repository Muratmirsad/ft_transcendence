// Canvas ayarları
const canvas = document.getElementById("gc");
const context = canvas.getContext("2d");

// Kare oyun alanı boyutları
canvas.width = 600;
canvas.height = 600;

// Oyun değişkenleri
const paddleSize = 80;
const paddleThickness = 10;
const ballDimension = 10;
let ballX = canvas.width / 2;
let ballY = canvas.height / 2;
let ballVelocityX = 4;
let ballVelocityY = 4;
const velocityIncrease = 0.2; // Her çarpışmada hız artışı
const maxVelocity = 10; // Topun maksimum hızı
const minVelocity = 3; // Topun minimum hızı

const winningScore = 5;
let playerScores = [0, 0, 0, 0]; // Oyuncu puanları

// Paddle pozisyonları
let paddles = [
  { x: canvas.width / 2 - paddleSize / 2, y: 0 }, // Üst paddle
  { x: canvas.width - paddleThickness, y: canvas.height / 2 - paddleSize / 2 }, // Sağ paddle
  { x: canvas.width / 2 - paddleSize / 2, y: canvas.height - paddleThickness }, // Alt paddle
  { x: 0, y: canvas.height / 2 - paddleSize / 2 }, // Sol paddle
];

let keysPressed = {};

// Tuş olayları
window.addEventListener("keydown", (e) => {
  keysPressed[e.key.toLowerCase()] = true;
});

window.addEventListener("keyup", (e) => {
  keysPressed[e.key.toLowerCase()] = false;
});

// Tuş eşlemeleri
const controls = [
  { up: "q", down: "a" },
  { up: "e", down: "d" },
  { up: "u", down: "j" },
  { up: "o", down: "l" },
];

// Paddle hareket fonksiyonu
function movePaddles() {
  paddles.forEach((paddle, index) => {
    if (keysPressed[controls[index].up]) {
      if (index === 0 || index === 2) paddle.x = Math.max(paddle.x - 8, 0);
      else paddle.y = Math.max(paddle.y - 8, 0);
    }
    if (keysPressed[controls[index].down]) {
      if (index === 0 || index === 2)
        paddle.x = Math.min(paddle.x + 8, canvas.width - paddleSize);
      else paddle.y = Math.min(paddle.y + 8, canvas.height - paddleSize);
    }
  });
}

// Rastgele açıyla yön değiştir
function randomizeAngle() {
  const angle = (Math.random() * Math.PI) / 2 + Math.PI / 4; // Rastgele 45-135 derece
  const signX = Math.random() > 0.5 ? 1 : -1; // X yönü rastgele
  const signY = Math.random() > 0.5 ? 1 : -1; // Y yönü rastgele
  return {
    x: Math.cos(angle) * signX,
    y: Math.sin(angle) * signY,
  };
}

// Hız kontrol fonksiyonu
function adjustVelocity(velocity) {
  if (Math.abs(velocity) < minVelocity) {
    return minVelocity * Math.sign(velocity);
  }
  if (Math.abs(velocity) > maxVelocity) {
    return maxVelocity * Math.sign(velocity);
  }
  return velocity;
}

// Top hareketi ve çarpma kontrolü
function moveBall() {
  ballX += ballVelocityX;
  ballY += ballVelocityY;

  // Duvar çarpması
  if (ballY <= 0 || ballY >= canvas.height - ballDimension) {
    const newAngle = randomizeAngle();
    ballVelocityY = adjustVelocity(newAngle.y * (Math.abs(ballVelocityY) + velocityIncrease));
    ballVelocityX = adjustVelocity(newAngle.x * Math.abs(ballVelocityX));
  }
  if (ballX <= 0 || ballX >= canvas.width - ballDimension) {
    const newAngle = randomizeAngle();
    ballVelocityX = adjustVelocity(newAngle.x * (Math.abs(ballVelocityX) + velocityIncrease));
    ballVelocityY = adjustVelocity(newAngle.y * Math.abs(ballVelocityY));
  }

  // Paddle çarpması
  paddles.forEach((paddle, index) => {
    if (index === 0 && ballY <= paddleThickness && ballX >= paddle.x && ballX <= paddle.x + paddleSize) {
      ballVelocityY = adjustVelocity(-ballVelocityY);
      playerScores[index]++;
      resetBall();
    } else if (
      index === 1 &&
      ballX >= canvas.width - paddleThickness &&
      ballY >= paddle.y &&
      ballY <= paddle.y + paddleSize
    ) {
      ballVelocityX = adjustVelocity(-ballVelocityX);
      playerScores[index]++;
      resetBall();
    } else if (
      index === 2 &&
      ballY >= canvas.height - paddleThickness &&
      ballX >= paddle.x &&
      ballX <= paddle.x + paddleSize
    ) {
      ballVelocityY = adjustVelocity(-ballVelocityY);
      playerScores[index]++;
      resetBall();
    } else if (
      index === 3 &&
      ballX <= paddleThickness &&
      ballY >= paddle.y &&
      ballY <= paddle.y + paddleSize
    ) {
      ballVelocityX = adjustVelocity(-ballVelocityX);
      playerScores[index]++;
      resetBall();
    }
  });

  // Kazanan kontrolü
  for (let i = 0; i < playerScores.length; i++) {
    if (playerScores[i] >= winningScore) {
      alert(`Oyuncu ${i + 1} kazandı!`);
      resetGame();
    }
  }
}

// Topun başlangıç pozisyonunu sıfırla
function resetBall() {
  ballX = canvas.width / 2;
  ballY = canvas.height / 2;
  const newAngle = randomizeAngle();
  ballVelocityX = adjustVelocity(newAngle.x * 4);
  ballVelocityY = adjustVelocity(newAngle.y * 4);
}

// Oyunu sıfırla
function resetGame() {
  playerScores = [0, 0, 0, 0];
  resetBall();
}

// Çizim
function draw() {
  // Arka plan
  context.fillStyle = "black";
  context.fillRect(0, 0, canvas.width, canvas.height);

  // Paddle'lar
  context.fillStyle = "white";
  paddles.forEach((paddle, index) => {
    if (index === 0 || index === 2) {
      context.fillRect(paddle.x, paddle.y, paddleSize, paddleThickness);
    } else {
      context.fillRect(paddle.x, paddle.y, paddleThickness, paddleSize);
    }
  });

  // Top
  context.beginPath();
  context.arc(ballX, ballY, ballDimension, 0, Math.PI * 2);
  context.fill();

  // Skorlar
  context.font = "20px Arial";
  context.fillStyle = "white";
  context.fillText(`P1: ${playerScores[0]}`, 20, 20);
  context.fillText(`P2: ${playerScores[1]}`, canvas.width - 100, 20);
  context.fillText(`P3: ${playerScores[2]}`, 20, canvas.height - 20);
  context.fillText(`P4: ${playerScores[3]}`, canvas.width - 100, canvas.height - 20);
}

// Oyun döngüsü
function gameLoop() {
  movePaddles();
  moveBall();
  draw();
  requestAnimationFrame(gameLoop);
}

gameLoop();
