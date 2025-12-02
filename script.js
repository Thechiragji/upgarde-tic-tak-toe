const cells = Array.from(document.querySelectorAll(".cell"));
const statusText = document.getElementById("status");
const currentPlayerEl = document.getElementById("currentPlayer");
const restartBtn = document.getElementById("restartBtn");

const scoreXEl = document.getElementById("scoreX");
const scoreOEl = document.getElementById("scoreO");
const scoreDrawEl = document.getElementById("scoreDraw");

const modeInputs = document.querySelectorAll('input[name="mode"]');

let board = Array(9).fill(null);
let currentPlayer = "X";
let gameOver = false;
let mode = "pvp"; // "pvp" | "ai"

const scores = {
  X: 0,
  O: 0,
  draw: 0,
};

const WIN_PATTERNS = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
];

function setStatus(message) {
  statusText.textContent = message;
}

function updateScoreboard() {
  scoreXEl.textContent = scores.X;
  scoreOEl.textContent = scores.O;
  scoreDrawEl.textContent = scores.draw;
}

function resetBoard(keepScores = true) {
  board = Array(9).fill(null);
  gameOver = false;
  currentPlayer = "X";
  currentPlayerEl.textContent = currentPlayer;

  cells.forEach((cell) => {
    cell.textContent = "";
    cell.disabled = false;
    cell.classList.remove("x", "o", "win");
  });

  if (!keepScores) {
    scores.X = 0;
    scores.O = 0;
    scores.draw = 0;
    updateScoreboard();
  }

  setStatus("Game start! X begins.");
}

function switchPlayer() {
  currentPlayer = currentPlayer === "X" ? "O" : "X";
  currentPlayerEl.textContent = currentPlayer;
}

function checkWinner() {
  for (const [a, b, c] of WIN_PATTERNS) {
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return { winner: board[a], pattern: [a, b, c] };
    }
  }

  if (board.every((cell) => cell !== null)) {
    return { winner: "draw", pattern: [] };
  }

  return null;
}

function highlightWin(pattern) {
  pattern.forEach((index) => {
    cells[index].classList.add("win");
  });
}

function endGame(result) {
  gameOver = true;
  cells.forEach((cell) => (cell.disabled = true));

  if (result.winner === "draw") {
    scores.draw += 1;
    setStatus("It's a draw.");
  } else {
    scores[result.winner] += 1;
    highlightWin(result.pattern);
    setStatus(`${result.winner} wins!`);
  }

  updateScoreboard();
}

function handleCellClick(e) {
  const index = parseInt(e.target.dataset.index, 10);

  if (board[index] || gameOver) return;

  makeMove(index, currentPlayer);

  const result = checkWinner();
  if (result) {
    endGame(result);
    return;
  }

  switchPlayer();

  if (mode === "ai" && currentPlayer === "O" && !gameOver) {
    setTimeout(aiMove, 250);
  }
}

function makeMove(index, player) {
  board[index] = player;
  const cell = cells[index];
  cell.textContent = player;
  cell.classList.add(player.toLowerCase());
  cell.disabled = true;
}

/* --- Simple AI: priority based --- */

function aiMove() {
  if (gameOver) return;

  // 1. If AI can win, do it
  let move = findBestMove("O");
  // 2. Else block X win
  if (move === null) move = findBestMove("X");
  // 3. Take center
  if (move === null && board[4] === null) move = 4;
  // 4. Take any corner
  if (move === null) {
    const corners = [0, 2, 6, 8].filter((i) => board[i] === null);
    if (corners.length) move = randomFrom(corners);
  }
  // 5. Take any side
  if (move === null) {
    const sides = [1, 3, 5, 7].filter((i) => board[i] === null);
    if (sides.length) move = randomFrom(sides);
  }

  if (move === null) return;

  makeMove(move, "O");

  const result = checkWinner();
  if (result) {
    endGame(result);
    return;
  }

  switchPlayer();
}

function findBestMove(player) {
  for (const [a, b, c] of WIN_PATTERNS) {
    const line = [board[a], board[b], board[c]];
    const playerCount = line.filter((v) => v === player).length;
    const emptyIndices = [a, b, c].filter((i) => board[i] === null);

    if (playerCount === 2 && emptyIndices.length === 1) {
      return emptyIndices[0];
    }
  }
  return null;
}

function randomFrom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

/* --- Event Listeners --- */

cells.forEach((cell) => {
  cell.addEventListener("click", handleCellClick);
});

restartBtn.addEventListener("click", () => {
  resetBoard(true);
});

modeInputs.forEach((input) => {
  input.addEventListener("change", (e) => {
    mode = e.target.value;
    resetBoard(true);
    setStatus(
      mode === "pvp"
        ? "Player vs Player mode. X begins."
        : "Player vs Computer mode. You are X."
    );
  });
});

/* Init */
resetBoard(true);
