const fruits = ["apple", "banana", "blueberry", "orange", "pear"];
const rows = 10, columns = 10;

let board = [], score = 0, timeLeft = 60, movesLeft = 30;
let currTile, otherTile, timerInterval, gameInterval, comboTimer;
let isGameOver = false, isAnimating = false, comboMultiplier = 1;

// --- DOM ELEMENTS ---
const ui = {};

window.onload = () => {
    ui.startBtn = document.getElementById("start-btn");
    ui.restartBtn = document.getElementById("modal-restart-btn");
    ui.modal = document.getElementById("game-over-modal");
    ui.score = document.getElementById("score");
    ui.timer = document.getElementById("timer");
    ui.moves = document.getElementById("moves");
    ui.combo = document.getElementById("combo");
    ui.board = document.getElementById("board");
    ui.finalScore = document.getElementById("final-score");

    ui.startBtn.onclick = initGame;
    ui.restartBtn.onclick = initGame;
};

// --- GAME INITIALIZATION ---
function initGame() {
    ui.startBtn.style.display = "none";
    ui.modal.classList.add("modal-hidden");
    ui.combo.style.opacity = "0";

    score = 0; timeLeft = 60; movesLeft = 30; comboMultiplier = 1;
    isGameOver = false; isAnimating = false;
    currTile = null; otherTile = null; board = [];

    ui.score.innerText = score;
    ui.timer.innerText = timeLeft;
    ui.moves.innerText = movesLeft;
    ui.board.innerHTML = "";

    startGame();

    clearInterval(gameInterval);
    clearInterval(timerInterval);

    gameInterval = setInterval(() => {
        crushFruit();
        slideFruit();
        generateFruit();
    }, 100);

    timerInterval = setInterval(() => {
        ui.timer.innerText = --timeLeft;
        if (timeLeft <= 0) endGame();
    }, 1000);
}

// --- BOARD SETUP ---
function startGame() {
    for (let r = 0; r < rows; r++) {
        let row = [];
        for (let c = 0; c < columns; c++) {
            let tile = document.createElement("img");
            tile.id = `${r}-${c}`;
            let randomF, currentSrc, isMatch;

            do {
                randomF = fruits[Math.floor(Math.random() * fruits.length)];
                currentSrc = `./assets/${randomF}.png`;
                isMatch = (c >= 2 && row[c - 1].getAttribute("src") === currentSrc && row[c - 2].getAttribute("src") === currentSrc) ||
                    (r >= 2 && board[r - 1][c].getAttribute("src") === currentSrc && board[r - 2][c].getAttribute("src") === currentSrc);
            } while (isMatch);

            tile.setAttribute("src", currentSrc);
            tile.onclick = selectTile;
            ui.board.append(tile);
            row.push(tile);
        }
        board.push(row);
    }
}

// --- PLAYER INTERACTION ---
function selectTile() {
    if (isGameOver || isAnimating || this.src.includes("blank")) return;

    if (!currTile) {
        currTile = this;
        currTile.style.opacity = "0.5";
        return;
    }

    if (currTile === this) {
        currTile.style.opacity = "1";
        currTile = null;
        return;
    }

    otherTile = this;
    const [r1, c1] = currTile.id.split("-").map(Number);
    const [r2, c2] = otherTile.id.split("-").map(Number);
    const isAdjacent = (Math.abs(r1 - r2) === 1 && c1 === c2) || (Math.abs(c1 - c2) === 1 && r1 === r2);

    if (isAdjacent) {
        currTile.style.opacity = "1";
        swapFruits(currTile, otherTile);

        if (!getMatches().size) {
            isAnimating = true;
            let t1 = currTile, t2 = otherTile;
            setTimeout(() => {
                swapFruits(t1, t2);
                isAnimating = false;
            }, 400);
        } else {
            ui.moves.innerText = --movesLeft;
        }

        currTile = null; otherTile = null;
    } else {
        currTile.style.opacity = "1";
        currTile = this;
        currTile.style.opacity = "0.5";
        otherTile = null;
    }
}

function swapFruits(t1, t2) {
    [t1.src, t2.src] = [t2.src, t1.src]; // Swap elegan ES6
}

function endGame() {
    if (isGameOver) return;
    isGameOver = true;
    clearInterval(gameInterval);
    clearInterval(timerInterval);
    if (currTile) currTile.style.opacity = "1";
    ui.finalScore.innerText = score;
    ui.modal.classList.remove("modal-hidden");
}

// --- CORE MECHANICS ---
function getMatches() {
    let matched = new Set();
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < columns; c++) {
            let f1 = board[r][c];
            if (f1.src.includes("blank")) continue;

            if (c < columns - 2 && f1.src === board[r][c + 1].src && f1.src === board[r][c + 2].src) {
                matched.add(f1).add(board[r][c + 1]).add(board[r][c + 2]);
            }
            if (r < rows - 2 && f1.src === board[r + 1][c].src && f1.src === board[r + 2][c].src) {
                matched.add(f1).add(board[r + 1][c]).add(board[r + 2][c]);
            }
        }
    }
    return matched;
}

function crushFruit() {
    const matches = getMatches();

    if (matches.size > 0) {
        matches.forEach(t => t.src = "./assets/blank.png");
        score += matches.size * 10 * comboMultiplier;

        if (comboMultiplier > 1) {
            ui.combo.innerText = `Combo x${comboMultiplier}!`;
            ui.combo.style.opacity = "1";
            clearTimeout(comboTimer);
            comboTimer = setTimeout(() => ui.combo.style.opacity = "0", 2000);
        }
        comboMultiplier++;
    } else if (board.every(row => row.every(t => !t.src.includes("blank")))) {
        comboMultiplier = 1;
        if (movesLeft <= 0) endGame();
    }

    ui.score.innerText = score;
}

function slideFruit() {
    for (let c = 0; c < columns; c++) {
        let emptyIdx = rows - 1;
        for (let r = rows - 1; r >= 0; r--) {
            if (!board[r][c].src.includes("blank")) {
                board[emptyIdx][c].src = board[r][c].src;
                emptyIdx--;
            }
        }
        for (let r = emptyIdx; r >= 0; r--) {
            board[r][c].src = "./assets/blank.png";
        }
    }
}

function generateFruit() {
    for (let c = 0; c < columns; c++) {
        if (board[0][c].src.includes("blank")) {
            let randomF = fruits[Math.floor(Math.random() * fruits.length)];
            board[0][c].src = `./assets/${randomF}.png`;
        }
    }
}