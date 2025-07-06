// Game configuration and state variables
const GOAL_CANS = 25;        // Total items needed to collect
let currentCans = 0;         // Current number of items collected
let gameActive = false;      // Tracks if game is currently running
let spawnInterval;          // Holds the interval for spawning items
let timerInterval;
let timeLeft = 30;
let paused = false;

const startBtn = document.getElementById('start-game');
const restartBtn = document.getElementById('restart-game');
const cansSpan = document.getElementById('current-cans');
const timerSpan = document.getElementById('timer');
const feedback = document.getElementById('feedback-message');
const grid = document.querySelector('.game-grid');

// Winning and losing messages
const winMessages = [
  "Great job! Clean water unlocked 💧",
  "You’re a Water Hero! 🌟",
  "Awesome! You helped someone drink safe water 🚰"
];
const loseMessages = [
  "Try again! Every tap counts 🙌",
  "So close! Tap faster next time 🫧",
  "Almost there! Give it another shot 🔄"
];

// Shows a final message based on the score
function showFinalMessage(finalScore) {
  const resultEl = document.getElementById('resultMessage');
  if (!resultEl) return;
  let msgArr = finalScore >= 20 ? winMessages : loseMessages;
  const msg = msgArr[Math.floor(Math.random() * msgArr.length)];
  resultEl.textContent = msg;
}

// Creates the 3x3 game grid where items will appear
function createGrid() {
  const grid = document.querySelector('.game-grid');
  grid.innerHTML = '';
  for (let i = 0; i < 9; i++) {
    const cell = document.createElement('div');
    cell.className = 'grid-cell';
    // Add misclick handler
    cell.addEventListener('click', function (e) {
      // Only count as misclick if clicking empty cell (not on a can)
      if (!cell.querySelector('.water-can') && gameActive && !paused) {
        if (currentCans > 0) {
          currentCans = currentCans - 1;
          cansSpan.textContent = currentCans;
          feedback.textContent = 'Oops! -1 point!';
        } else {
          feedback.textContent = '';
        }
        // Prevent bubbling to grid or other handlers
        e.stopPropagation();
      }
    });
    grid.appendChild(cell);
  }
}

// Ensure the grid is created when the page loads
createGrid();

// Spawns a new item in a random grid cell
function spawnWaterCan() {
  if (!gameActive || paused) return;
  const cells = document.querySelectorAll('.grid-cell');
  cells.forEach(cell => {
    cell.innerHTML = '';
    // Remove previous handlers to avoid stacking
    cell.onclick = null;
  });

  const randomIndex = Math.floor(Math.random() * cells.length);
  const randomCell = cells[randomIndex];
  randomCell.innerHTML = `
    <div class="water-can-wrapper">
      <div class="water-can"></div>
    </div>
  `;

  // Track if the can was clicked
  let canClicked = false;

  // Handler for all cells
  cells.forEach((cell, idx) => {
    cell.onclick = function (e) {
      if (!gameActive || paused) return;
      // If this is the cell with the can and not already clicked
      if (idx === randomIndex && !canClicked && cell.querySelector('.water-can')) {
        canClicked = true;
        currentCans++;
        cansSpan.textContent = currentCans;
        feedback.textContent = getFeedbackMessage(currentCans);
        cell.innerHTML = '';
        // Confetti effect when score reaches 20
        if (typeof confetti === "function" && currentCans === 20) {
          confetti({
            particleCount: 120,
            spread: 90,
            origin: { y: 0.6 }
          });
        }
      } else if (idx !== randomIndex && gameActive && !paused) {
        // Misclick on empty cell
        if (currentCans > 0) {
          currentCans--;
          cansSpan.textContent = currentCans;
          feedback.textContent = 'Oops! -1 point!';
        } else {
          feedback.textContent = '';
        }
      }
      e.stopPropagation();
      // Remove all handlers after any click (so only one click per round)
      cells.forEach(c => c.onclick = null);
    };
  });
}

function getFeedbackMessage(score) {
  if (score === 0) return '';
  if (score < 5) return 'Keep going!';
  if (score < 15) return 'Nice!';
  if (score < 25) return 'Great job!';
  return 'Amazing!';
}

function startTimer() {
  timerSpan.textContent = timeLeft;
  timerInterval = setInterval(() => {
    if (!gameActive || paused) return;
    timeLeft--;
    timerSpan.textContent = timeLeft;
    if (timeLeft <= 0) {
      endGame();
    }
  }, 1000);
}

// Initializes and starts a new game
function startGame() {
  if (gameActive && !paused) return; // Prevent starting a new game if one is already active
  if (!gameActive) {
    // New game
    currentCans = 0;
    cansSpan.textContent = currentCans;
    timeLeft = 30;
    timerSpan.textContent = timeLeft;
    feedback.textContent = '';
    createGrid();
    gameActive = true;
    paused = false;
    startBtn.textContent = 'Pause';
    restartBtn.style.display = 'inline-block';
    spawnInterval = setInterval(spawnWaterCan, 800);
    startTimer();
  } else if (paused) {
    // Resume
    paused = false;
    startBtn.textContent = 'Pause';
  }
}

function pauseGame() {
  if (!gameActive || paused) return;
  paused = true;
  startBtn.textContent = 'Resume';
}

function restartGame() {
  endGame();
  currentCans = 0;
  cansSpan.textContent = currentCans;
  timeLeft = 30;
  timerSpan.textContent = timeLeft;
  feedback.textContent = '';
  gameActive = false;
  paused = false;
  startBtn.textContent = 'Start Game';
  restartBtn.style.display = 'none';
  createGrid();
}

function endGame() {
  gameActive = false;
  paused = false;
  clearInterval(spawnInterval);
  clearInterval(timerInterval);
  feedback.textContent = `Time's up! Your score: ${currentCans}`;
  showFinalMessage(currentCans);
  startBtn.textContent = 'Start Game';
  restartBtn.style.display = 'inline-block';
  // Remove any remaining cans
  document.querySelectorAll('.grid-cell').forEach(cell => cell.innerHTML = '');
}

// Button handlers
startBtn.addEventListener('click', () => {
  if (!gameActive || paused) {
    startGame();
  } else {
    pauseGame();
  }
});
restartBtn.addEventListener('click', restartGame);
