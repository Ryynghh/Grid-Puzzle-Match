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

// --- Variabel Baru untuk Combo ---
let comboMultiplier = 1;
let comboTimer;

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

    // Reset combo dan pastikan teks tersembunyi saat game baru dimulai
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

            tile.addEventListener("dragstart", dragStart);
            tile.addEventListener("dragover", dragOver);
            tile.addEventListener("dragenter", dragEnter);
            tile.addEventListener("dragleave", dragLeave);
            tile.addEventListener("drop", dragDrop);
            tile.addEventListener("dragend", dragEnd);

            document.getElementById("board").append(tile);
            row.push(tile);
        }
        board.push(row);
    }
}

// --- DRAG EVENTS ---
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

function swapFruits(tile1, tile2) {
    const tempImg = tile1.src;
    tile1.src = tile2.src;
    tile2.src = tempImg;
}

// --- GAME MECHANICS ---

// Fungsi Helper Baru: Mengecek apakah papan sedang berjatuhan atau sudah stabil
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
        // Hanya munculkan teks jika ini benar-benar combo (multiplier > 1)
        if (comboMultiplier > 1) {
            let comboEl = document.getElementById("combo");
            comboEl.innerText = `Combo x${comboMultiplier}!`;
            comboEl.style.opacity = "1"; // Munculkan teks

            // Hapus timer lama jika ada, supaya teks tidak hilang di tengah-tengah rentetan combo
            clearTimeout(comboTimer);

            // Set timer untuk menyembunyikan teks setelah 2 detik (2000 milidetik)
            comboTimer = setTimeout(function () {
                comboEl.style.opacity = "0";
            }, 2000);
        }

        comboMultiplier++;
    } else {
        if (isBoardFull()) {
            comboMultiplier = 1;
            // Kita tidak menyembunyikan teks di sini, biarkan setTimeout yang menyelesaikannya 
            // agar pemain sempat membaca tulisan combo terakhirnya.
        }
    }

    document.getElementById("score").innerText = score;
}

function crushThree() {
    let crushedSomething = false;

    // Check Rows
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < columns - 2; c++) {
            let f1 = board[r][c], f2 = board[r][c + 1], f3 = board[r][c + 2];
            if (f1.src === f2.src && f2.src === f3.src && !f1.src.includes("blank")) {
                f1.src = f2.src = f3.src = "./assets/blank.png";
                score += (30 * comboMultiplier); // Terapkan multiplier
                crushedSomething = true;
            }
        }
    }

    // Check Columns
    for (let c = 0; c < columns; c++) {
        for (let r = 0; r < rows - 2; r++) {
            let f1 = board[r][c], f2 = board[r + 1][c], f3 = board[r + 2][c];
            if (f1.src === f2.src && f2.src === f3.src && !f1.src.includes("blank")) {
                f1.src = f2.src = f3.src = "./assets/blank.png";
                score += (30 * comboMultiplier); // Terapkan multiplier
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