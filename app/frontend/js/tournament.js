// Oyun değişkenleri
let canvas, ctx;
let playerNames = [];
let currentMatch = { player1: "", player2: "", score1: 0, score2: 0 };
let tournamentStage = "setup";
let ball = { x: 300, y: 200, dx: 2, dy: 2, radius: 7, speed: 2 };
let paddle1 = { x: 20, y: 170, width: 10, height: 60 };
let paddle2 = { x: 570, y: 170, width: 10, height: 60 };
let matches = [];
let currentMatchIndex = 0;
let lastTime = 0;

// DOM elementleri
const setupScreen = document.getElementById("setupScreen");
const gameScreen = document.getElementById("gameScreen");
const playerCountSelect = document.getElementById("playerCount");
const generateInputsButton = document.getElementById("generateInputs");
const playerInputsDiv = document.getElementById("playerInputs");
const startButton = document.getElementById("startTournament");
const scoreBoard = document.getElementById("scoreBoard");
const tournamentInfo = document.getElementById("tournamentInfo");

// setupTournament fonksiyonu
export function setupTournament() {
    setupScreen.style.display = "block";
    gameScreen.style.display = "none";

    generateInputsButton.addEventListener("click", generatePlayerInputs);
    startButton.addEventListener("click", startTournament);
}

function generatePlayerInputs() {
    const count = parseInt(playerCountSelect.value);
    playerInputsDiv.innerHTML = "";
    for (let i = 0; i < count; i++) {
        const input = document.createElement("input");
        input.type = "text";
        input.placeholder = `Oyuncu ${i + 1}`;
        playerInputsDiv.appendChild(input);
    }
    startButton.style.display = "inline-block";
}

function startTournament() {
    playerNames = Array.from(playerInputsDiv.children).map((input) =>
        input.value.trim()
    );

    if (playerNames.some((name) => name === "")) {
        alert("Lütfen tüm oyuncu isimlerini girin!");
        return;
    }

    setupScreen.style.display = "none";
    gameScreen.style.display = "block";

    canvas = document.getElementById("gameCanvas");
    ctx = canvas.getContext("2d");

    document.addEventListener("keydown", movePaddle);

    matches = createTournamentMatches(playerNames);
    startNextMatch();
}

function createTournamentMatches(players) {
    let matchups = [];
    while (players.length > 1) {
        let round = [];
        for (let i = 0; i < players.length; i += 2) {
            if (i + 1 < players.length) {
                round.push([players[i], players[i + 1]]);
            } else {
                round.push([players[i], null]); // Bye
            }
        }
        matchups.push(round);
        players = round
            .filter((match) => match[1] !== null) // Boş eşleşmeleri ele
            .map((match) => match[0]); // Sadece kazananları taşı
    }
    return matchups;
}

function startNextMatch() {
    if (currentMatchIndex >= matches[0].length) {
        matches.shift();
        currentMatchIndex = 0;

        if (matches.length === 0) {
            // Final kontrolü: Eğer kazanan finalde belirlenmemişse hata
            if (playerNames.length > 1) {
                console.error("Hata: Final maçı oynanmadan kazanan belirlendi.");
                return;
            }

            endTournament(playerNames[0]); // Turnuvayı kazananı ilan et
            return;
        }
    }

    let match = matches[0][currentMatchIndex];
    if (!match[1]) {
        // Bye durumunda otomatik kazananı ilerlet
        matches[0][currentMatchIndex] = [match[0], null];
        playerNames = [match[0]]; // Sadece kazananı taşı
        currentMatchIndex++;
        startNextMatch();
        return;
    }

    currentMatch = {
        player1: match[0],
        player2: match[1],
        score1: 0,
        score2: 0,
    };
    updateScoreBoard();
    updateTournamentInfo();
    resetBall();
    lastTime = performance.now();
    requestAnimationFrame(gameLoop);
}

function gameLoop(currentTime) {
    const deltaTime = (currentTime - lastTime) / 1000;
    lastTime = currentTime;

    updateGame(deltaTime);
    drawGame();

    if (currentMatch.score1 < 5 && currentMatch.score2 < 5) {
        requestAnimationFrame(gameLoop);
    } else {
        endMatch();
    }
}



function updateGame() {
  // Top hareketi
  ball.x += ball.dx;
  ball.y += ball.dy;

  // Duvarlardan sekme
  if (ball.y + ball.radius > canvas.height || ball.y - ball.radius < 0) {
    ball.dy *= -1;
  }

  // Raketlerle çarpışma kontrolü
  if (
    (ball.x - ball.radius < paddle1.x + paddle1.width &&
      ball.y > paddle1.y &&
      ball.y < paddle1.y + paddle1.height) ||
    (ball.x + ball.radius > paddle2.x &&
      ball.y > paddle2.y &&
      ball.y < paddle2.y + paddle2.height)
  ) {
    ball.dx *= -1;
    increaseBallSpeed();
  }

  // Skor kontrolü
  if (ball.x + ball.radius > canvas.width) {
    currentMatch.score1++;
    resetBall();
  } else if (ball.x - ball.radius < 0) {
    currentMatch.score2++;
    resetBall();
  }

  updateScoreBoard();
}

function drawGame() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "#ecf0f1";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.beginPath();
    ctx.setLineDash([5, 15]);
    ctx.moveTo(canvas.width / 2, 0);
    ctx.lineTo(canvas.width / 2, canvas.height);
    ctx.strokeStyle = "#95a5a6";
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
    ctx.fillStyle = "#e74c3c";
    ctx.fill();
    ctx.closePath();

    ctx.fillStyle = "#2c3e50";
    ctx.fillRect(paddle1.x, paddle1.y, paddle1.width, paddle1.height);
    ctx.fillRect(paddle2.x, paddle2.y, paddle2.width, paddle2.height);
}

function resetBall() {
    ball.x = canvas.width / 2;
    ball.y = canvas.height / 2;
    ball.speed = 2;
    const angle = (Math.random() * Math.PI) / 2 - Math.PI / 4;
    ball.dx = Math.cos(angle) * ball.speed * (Math.random() < 0.5 ? 1 : -1);
    ball.dy = Math.sin(angle) * ball.speed;
}

function movePaddle(e) {
    if (!canvas) return; // Canvas henüz yüklenmediyse fonksiyondan çık

    const key = e.key;
    const paddleSpeed = 15;

    if (key === "w" && paddle1.y > 0) {
        paddle1.y -= paddleSpeed;
    } else if (key === "s" && paddle1.y + paddle1.height < canvas.height) {
        paddle1.y += paddleSpeed;
    }

    if (key === "ArrowUp" && paddle2.y > 0) {
        paddle2.y -= paddleSpeed;
    } else if (
        key === "ArrowDown" &&
        paddle2.y + paddle2.height < canvas.height
    ) {
        paddle2.y += paddleSpeed;
    }
}

function updateScoreBoard() {
    scoreBoard.innerHTML = `${currentMatch.player1}: ${currentMatch.score1} - ${currentMatch.player2}: ${currentMatch.score2}`;
}

function updateTournamentInfo() {
    let roundName =
        matches.length === 1
            ? "Final"
            : matches.length === 2
            ? "Yarı Final"
            : `${matches.length}. Tur`;
    tournamentInfo.innerHTML = `${roundName}: ${currentMatch.player1} vs ${currentMatch.player2}`;
}

function endMatch() {
    const winner =
        currentMatch.score1 > currentMatch.score2
            ? currentMatch.player1
            : currentMatch.player2;
    matches[0][currentMatchIndex] = [winner, null];
    currentMatchIndex++;
    startNextMatch();
}

function endTournament(winner) {
    gameScreen.innerHTML = `
        <h2>Turnuva Bitti!</h2>
        <p>Kazanan: ${winner}</p>
        <button onclick="location.reload()">Yeni Turnuva</button>
    `;
}

function increaseBallSpeed() {
    ball.speed *= 1.05;
    const angle = Math.atan2(ball.dy, ball.dx);
    ball.dx = Math.cos(angle) * ball.speed;
    ball.dy = Math.sin(angle) * ball.speed;
}

function addSpinToBall() {
    const spinFactor = 0.2;
    const paddleHitPosition = ball.y - (ball.y > canvas.height / 2 ? paddle2.y : paddle1.y);
    ball.dy += paddleHitPosition * spinFactor;
}

// Turnuvayı başlat
setupTournament();

