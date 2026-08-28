const fruits = ["apple", "banana", "blueberry", "coconut", "orange", "pear"];
const rows = 10;
const columns = 10;

let board = [];
let score = 0;
let currTile;
let otherTile;
let timeLeft = 60;
let timerInterval;
let gameInterval;
let isGameOver = false;

let comboMultiplier = 1;
let comboTimer;

// --- Variabel Pelacak Layar Sentuh ---
let touchStartX = 0;
let touchStartY = 0;
let touchEndX = 0;
let touchEndY = 0;

window.onload = function () {
    document.getElementById("start-btn").addEventListener("click", initGame);
    document.getElementById("restart-btn").addEventListener("click", initGame);
}

function initGame() {
    document.getElementById("start-btn").style.display = "none";
    document.getElementById("restart-btn").style.display = "none";

    score = 0;
    timeLeft = 60;
    isGameOver = false;

    comboMultiplier = 1;
    document.getElementById("combo").style.opacity = "0";

    document.getElementById("score").innerText = score;
    document.getElementById("timer").innerText = timeLeft;

    document.getElementById("board").innerHTML = "";
    board = [];

    startGame();

    clearInterval(gameInterval);
    clearInterval(timerInterval);

    gameInterval = window.setInterval(function () {
        crushFruit();
        slideFruit();
        generateFruit();
    }, 100);

    timerInterval = window.setInterval(function () {
        timeLeft -= 1;
        document.getElementById("timer").innerText = timeLeft;

        if (timeLeft <= 0) endGame();
    }, 1000);
}

function endGame() {
    isGameOver = true;
    clearInterval(gameInterval);
    clearInterval(timerInterval);
    document.getElementById("restart-btn").style.display = "inline-block";
    alert("Time's up! Your final score is: " + score);
}

function randomFruit() {
    return fruits[Math.floor(Math.random() * fruits.length)];
}

function startGame() {
    for (let r = 0; r < rows; r++) {
        let row = [];
        for (let c = 0; c < columns; c++) {
            let tile = document.createElement("img");
            tile.id = `${r}-${c}`;

            let randomF;
            let currentSrc;
            let isMatch;

            do {
                randomF = randomFruit();
                currentSrc = `./assets/${randomF}.png`;
                isMatch = false;

                if (c >= 2) {
                    let f1 = row[c - 1].getAttribute("src");
                    let f2 = row[c - 2].getAttribute("src");
                    if (f1 === currentSrc && f2 === currentSrc) {
                        isMatch = true;
                    }
                }

                if (r >= 2) {
                    let f1 = board[r - 1][c].getAttribute("src");
                    let f2 = board[r - 2][c].getAttribute("src");
                    if (f1 === currentSrc && f2 === currentSrc) {
                        isMatch = true;
                    }
                }
            } while (isMatch);

            tile.setAttribute("src", currentSrc);

            // Desktop Drag Events
            tile.addEventListener("dragstart", dragStart);
            tile.addEventListener("dragover", dragOver);
            tile.addEventListener("dragenter", dragEnter);
            tile.addEventListener("dragleave", dragLeave);
            tile.addEventListener("drop", dragDrop);
            tile.addEventListener("dragend", dragEnd);

            // Mobile Touch Events (Mencegah scroll bawaan dengan { passive: false })
            tile.addEventListener("touchstart", touchStart, { passive: false });
            tile.addEventListener("touchmove", touchMove, { passive: false });
            tile.addEventListener("touchend", touchEnd);

            document.getElementById("board").append(tile);
            row.push(tile);
        }
        board.push(row);
    }
}

// --- DESKTOP DRAG EVENTS ---
function dragStart() {
    if (!isGameOver) currTile = this;
}
function dragOver(e) { e.preventDefault(); }
function dragEnter(e) { e.preventDefault(); }
function dragLeave() { }
function dragDrop() {
    if (!isGameOver) otherTile = this;
}
function dragEnd() {
    if (isGameOver || !currTile || !otherTile) return;
    if (currTile.src.includes("blank") || otherTile.src.includes("blank")) return;

    const [r1, c1] = currTile.id.split("-").map(Number);
    const [r2, c2] = otherTile.id.split("-").map(Number);

    const isAdjacent = (Math.abs(r1 - r2) === 1 && c1 === c2) ||
        (Math.abs(c1 - c2) === 1 && r1 === r2);

    if (isAdjacent) {
        swapFruits(currTile, otherTile);
        if (!checkValid()) {
            swapFruits(currTile, otherTile);
        }
    }
}

// --- MOBILE TOUCH EVENTS ---
function touchStart(e) {
    if (isGameOver) return;
    currTile = this;
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
}

function touchMove(e) {
    if (isGameOver) return;
    e.preventDefault(); // Mengunci layar agar tidak scroll saat mengusap buah
}

function touchEnd(e) {
    if (isGameOver || !currTile) return;
    if (currTile.src.includes("blank")) return;

    touchEndX = e.changedTouches[0].clientX;
    touchEndY = e.changedTouches[0].clientY;

    let deltaX = touchEndX - touchStartX;
    let deltaY = touchEndY - touchStartY;

    // Jika jari hanya menekan (tap) tanpa geser, abaikan
    if (Math.abs(deltaX) < 10 && Math.abs(deltaY) < 10) return;

    let [r, c] = currTile.id.split("-").map(Number);
    let r2 = r;
    let c2 = c;

    // Menentukan arah usapan jari
    if (Math.abs(deltaX) > Math.abs(deltaY)) {
        if (deltaX > 0) c2 += 1; // Geser Kanan
        else c2 -= 1; // Geser Kiri
    } else {
        if (deltaY > 0) r2 += 1; // Geser Bawah
        else r2 -= 1; // Geser Atas
    }

    // Pastikan pergeseran tidak menabrak batas luar papan
    if (r2 < 0 || r2 >= rows || c2 < 0 || c2 >= columns) return;

    otherTile = document.getElementById(`${r2}-${c2}`);
    if (otherTile.src.includes("blank")) return;

    const isAdjacent = (Math.abs(r - r2) === 1 && c === c2) ||
        (Math.abs(c - c2) === 1 && r === r2);

    if (isAdjacent) {
        swapFruits(currTile, otherTile);
        if (!checkValid()) {
            swapFruits(currTile, otherTile);
        }
    }
}

function swapFruits(tile1, tile2) {
    const tempImg = tile1.src;
    tile1.src = tile2.src;
    tile2.src = tempImg;
}

// --- GAME MECHANICS ---
function isBoardFull() {
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < columns; c++) {
            if (board[r][c].src.includes("blank")) return false;
        }
    }
    return true;
}

function crushFruit() {
    let isCrushed = crushThree();

    if (isCrushed) {
        if (comboMultiplier > 1) {
            let comboEl = document.getElementById("combo");
            comboEl.innerText = `Combo x${comboMultiplier}!`;
            comboEl.style.opacity = "1";

            clearTimeout(comboTimer);
            comboTimer = setTimeout(function () {
                comboEl.style.opacity = "0";
            }, 2000);
        }
        comboMultiplier++;
    } else {
        if (isBoardFull()) {
            comboMultiplier = 1;
        }
    }
    document.getElementById("score").innerText = score;
}

function crushThree() {
    let crushedSomething = false;

    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < columns - 2; c++) {
            let f1 = board[r][c], f2 = board[r][c + 1], f3 = board[r][c + 2];
            if (f1.src === f2.src && f2.src === f3.src && !f1.src.includes("blank")) {
                f1.src = f2.src = f3.src = "./assets/blank.png";
                score += (30 * comboMultiplier);
                crushedSomething = true;
            }
        }
    }

    for (let c = 0; c < columns; c++) {
        for (let r = 0; r < rows - 2; r++) {
            let f1 = board[r][c], f2 = board[r + 1][c], f3 = board[r + 2][c];
            if (f1.src === f2.src && f2.src === f3.src && !f1.src.includes("blank")) {
                f1.src = f2.src = f3.src = "./assets/blank.png";
                score += (30 * comboMultiplier);
                crushedSomething = true;
            }
        }
    }
    return crushedSomething;
}

function checkValid() {
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < columns - 2; c++) {
            let f1 = board[r][c], f2 = board[r][c + 1], f3 = board[r][c + 2];
            if (f1.src === f2.src && f2.src === f3.src && !f1.src.includes("blank")) return true;
        }
    }

    for (let c = 0; c < columns; c++) {
        for (let r = 0; r < rows - 2; r++) {
            let f1 = board[r][c], f2 = board[r + 1][c], f3 = board[r + 2][c];
            if (f1.src === f2.src && f2.src === f3.src && !f1.src.includes("blank")) return true;
        }
    }
    return false;
}

function slideFruit() {
    for (let c = 0; c < columns; c++) {
        let ind = rows - 1;
        for (let r = rows - 1; r >= 0; r--) {
            if (!board[r][c].src.includes("blank")) {
                board[ind][c].src = board[r][c].src;
                ind -= 1;
            }
        }
        for (let r = ind; r >= 0; r--) {
            board[r][c].src = "./assets/blank.png";
        }
    }
}

function generateFruit() {
    for (let c = 0; c < columns; c++) {
        if (board[0][c].src.includes("blank")) {
            board[0][c].src = `./assets/${randomFruit()}.png`;
        }
    }
}