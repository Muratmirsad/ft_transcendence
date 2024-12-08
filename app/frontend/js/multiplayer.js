const canvas = document.getElementById("gc");
const context = canvas.getContext("2d");

// Game variables for the top and bottom games
const games = [
    {
      paddle1: { y: 40, upKey: "q", downKey: "a" }, // Game 1, Player 1
      paddle2: { y: 40, upKey: "e", downKey: "d" }, // Game 1, Player 2
      ball: { x: 400, y: 250, dx: 5, dy: 5, radius: 10 },
      score: { player1: 0, player2: 0 },
    },
    {
      paddle1: { y: 540, upKey: "u", downKey: "j" }, // Game 2, Player 1
      paddle2: { y: 540, upKey: "o", downKey: "l" }, // Game 2, Player 2
      ball: { x: 400, y: 750, dx: 5, dy: -5, radius: 10 },
      score: { player1: 0, player2: 0 },
    },
  ];
  

const paddleWidth = 10;
const paddleHeight = 100;
const paddleSpeed = 10;
const winningScore = 5;

let keysPressed = {};
let resetGame = false;

// Track key presses
window.addEventListener("keydown", (e) => {
  keysPressed[e.key.toLowerCase()] = true;
});

window.addEventListener("keyup", (e) => {
  keysPressed[e.key.toLowerCase()] = false;
});

// Reset the ball position
function resetBall(ball, yPosition) {
  ball.x = canvas.width / 2;
  ball.y = yPosition;
  ball.dx *= -1; // Reverse direction
  ball.dy = (Math.random() > 0.5 ? 1 : -1) * 5;
}

// Move paddles based on key presses
function movePaddles(game, isTopGame) {
    const topBoundary = isTopGame ? 0 : canvas.height / 2;
    const bottomBoundary = isTopGame ? canvas.height / 2 : canvas.height;
  
    // Paddle 1 (Left paddle)
    if (keysPressed[game.paddle1.upKey] && game.paddle1.y > topBoundary) {
      game.paddle1.y -= paddleSpeed;
    }
    if (
      keysPressed[game.paddle1.downKey] &&
      game.paddle1.y + paddleHeight < bottomBoundary
    ) {
      game.paddle1.y += paddleSpeed;
    }
  
    // Paddle 2 (Right paddle)
    if (keysPressed[game.paddle2.upKey] && game.paddle2.y > topBoundary) {
      game.paddle2.y -= paddleSpeed;
    }
    if (
      keysPressed[game.paddle2.downKey] &&
      game.paddle2.y + paddleHeight < bottomBoundary
    ) {
      game.paddle2.y += paddleSpeed;
    }
  }
  
  

// Move the ball
function moveBall(game) {
  const ball = game.ball;
  ball.x += ball.dx;
  ball.y += ball.dy;

  // Collision with top and bottom walls
  if (ball.y - ball.radius < (game === games[0] ? 0 : canvas.height / 2) || ball.y + ball.radius > (game === games[0] ? canvas.height / 2 : canvas.height)) {
    ball.dy *= -1;
  }

  // Collision with paddles
  if (
    ball.x - ball.radius < paddleWidth &&
    ball.y > game.paddle1.y &&
    ball.y < game.paddle1.y + paddleHeight
  ) {
    ball.dx *= -1;
    ball.dy += (ball.y - (game.paddle1.y + paddleHeight / 2)) * 0.3;
  }

  if (
    ball.x + ball.radius > canvas.width - paddleWidth &&
    ball.y > game.paddle2.y &&
    ball.y < game.paddle2.y + paddleHeight
  ) {
    ball.dx *= -1;
    ball.dy += (ball.y - (game.paddle2.y + paddleHeight / 2)) * 0.3;
  }

  // Check for scoring
  if (ball.x - ball.radius < 0) {
    game.score.player2++;
    resetBall(ball, game === games[0] ? 250 : 750);
  } else if (ball.x + ball.radius > canvas.width) {
    game.score.player1++;
    resetBall(ball, game === games[0] ? 250 : 750);
  }
}

// Draw the game
function drawGame(game, offsetY) {
  const ball = game.ball;

  // Paddle 1 (sol paddle)
  context.fillStyle = "#000000"; // Paddle 1 rengi (siyah)
  context.fillRect(0, game.paddle1.y, paddleWidth, paddleHeight);

  // Paddle 2 (sağ paddle)
  context.fillStyle = "#000000"; // Paddle 2 rengi (siyah)
  context.fillRect(
    canvas.width - paddleWidth,
    game.paddle2.y,
    paddleWidth,
    paddleHeight
  );

  // Ball
  context.fillStyle = "#000000"; // Topun rengi (siyah)
  context.beginPath();
  context.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2, true);
  context.fill();

  // Scores
  context.fillStyle = "#F4D03F"; // Skor rengi (sarı)
  context.font = "30px Arial";
  context.fillText(game.score.player1, 100, offsetY + 50);
  context.fillText(game.score.player2, canvas.width - 100, offsetY + 50);

  // 2 oyun arasına siyah bir çizgi ekle
  if (offsetY > 0) {
    context.strokeStyle = "#000000"; // Çizgi rengi (siyah)
    context.beginPath();
    context.moveTo(0, offsetY);
    context.lineTo(canvas.width, offsetY);
    context.stroke();
  }
}

// Draw the divider line
function drawDivider() {
  context.strokeStyle = "white";
  context.setLineDash([5, 15]);
  context.beginPath();
  context.moveTo(0, canvas.height / 2);
  context.lineTo(canvas.width, canvas.height / 2);
  context.stroke();
  context.setLineDash([]);
}

function createPlayAgainButton() {
    const button = document.createElement("button");
    button.id = "play-again-button";
    button.textContent = "Play Again";
    button.style.position = "absolute";
    button.style.top = "50%";
    button.style.left = "50%";
    button.style.transform = "translate(-50%, -50%)";
    button.style.padding = "10px 20px";
    button.style.fontSize = "20px";
    button.style.cursor = "pointer";
    button.style.backgroundColor = "#fff";
    button.style.color = "#000";
    button.style.border = "none";
    button.style.borderRadius = "5px";
    button.style.boxShadow = "0px 4px 6px rgba(0, 0, 0, 0.1)";
  
    button.addEventListener("click", restartGame);
  
    document.body.appendChild(button);
  }  

function restartGame() {
    // Reset all game variables
    games.forEach((game, index) => {
      game.score.player1 = 0;
      game.score.player2 = 0;
      game.paddle1.y = index === 0 ? 40 : 540; // Reset paddle positions
      game.paddle2.y = index === 0 ? 40 : 540;
      game.ball.x = canvas.width / 2;
      game.ball.y = index === 0 ? 250 : 750;
      game.ball.dx = 5 * (Math.random() > 0.5 ? 1 : -1);
      game.ball.dy = 5 * (Math.random() > 0.5 ? 1 : -1);
    });
  
    // Remove the Play Again button
    const button = document.getElementById("play-again-button");
    if (button) {
      button.remove();
    }
  
    // Restart the game loop
    gameLoop();
  } 

export function removePlayAgainButton() {
  const button = document.getElementById("play-again-button");
  if (button) {
    button.remove(); // "Play Again" butonunu DOM'dan kaldır
  }
}
  

// Main game loop
function gameLoop() {
    context.clearRect(0, 0, canvas.width, canvas.height);
    drawDivider();
  
    let allGamesFinished = true;
  
    games.forEach((game, index) => {
      const isTopGame = index === 0; // First game is the top game
      if (game.score.player1 < winningScore && game.score.player2 < winningScore) {
        movePaddles(game, isTopGame);
        moveBall(game);
        drawGame(game, isTopGame ? 0 : canvas.height / 2);
        allGamesFinished = false;
      }
    });
  
    if (!allGamesFinished) {
      requestAnimationFrame(gameLoop);
    } else {
      context.font = "50px Arial";
      context.fillText(
        "Game Over",
        canvas.width / 2 - 100,
        canvas.height / 2 - 50
      );
  
      // Create a Play Again button
      // createPlayAgainButton();
    }
  }
  
  
  let canvas1;
  let context1;
  
  // Canvas ve bağlamı başlat
  function initializeCanvas() {
    canvas1 = document.getElementById("gc");
    if (!canvas1) {
      console.error("Canvas element not found");
      return false;
    }
    context1 = canvas1.getContext("2d");
    return true;
  }
  
  // Canvas ve bağlamı dışa aktarın
  export function getCanvasContext() {
    return { canvas1, context1 };
  }
  
  // Multiplayer setup
  export function setupMultiplayer() {
    if (!initializeCanvas()) {
      console.error("Canvas initialization failed.");
      return;
    }
    
    gameLoop();
  }
  