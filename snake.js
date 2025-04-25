let gameInterval;
let snake, food, score, direction;

const gridSize = 20;

function initializeGame() {
    snake = [{ x: 5, y: 5 }];
    food = generateFood();
    score = 0;
    direction = { x: 0, y: 0 };
    drawBoard();
    drawSnake();
    drawFood();

    document.getElementById("restartButton").style.display = "none";
}

function generateFood() {
    return {
        x: Math.floor(Math.random() * gridSize),
        y: Math.floor(Math.random() * gridSize)
    };
}

function startGame() {
    clearInterval(gameInterval);
    initializeGame();
    gameInterval = setInterval(gameLoop, 100);
}

function gameLoop() {
    updateSnake();
    checkCollisions();
    drawBoard();
    drawSnake();
    drawFood();
}

function drawBoard() {
    const board = document.getElementById("board");
    const ctx = board.getContext("2d");
    board.width = 400;
    board.height = 400;

    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, board.width, board.height);
}

function drawSnake() {
    const board = document.getElementById("board");
    const ctx = board.getContext("2d");

    ctx.fillStyle = "green";
    snake.forEach(segment => {
        ctx.fillRect(segment.x * 20, segment.y * 20, 20, 20);
    });
}

function drawFood() {
    const board = document.getElementById("board");
    const ctx = board.getContext("2d");

    ctx.fillStyle = "red";
    ctx.fillRect(food.x * 20, food.y * 20, 20, 20);
}

function checkCollisions() {
    const head = snake[0];

    if (
        head.x < 0 || head.y < 0 ||
        head.x >= gridSize || head.y >= gridSize ||
        snake.some((segment, index) => index !== 0 && segment.x === head.x && segment.y === head.y)
    ) {
        clearInterval(gameInterval);
        console.log("Game Over");

        document.getElementById("restartButton").style.display = "block";
    }

    if (head.x === food.x && head.y === food.y) {
        score += 10;
        snake.push({});
        food = generateFood();
    }
}

function updateSnake() {
    const head = { x: snake[0].x + direction.x, y: snake[0].y + direction.y };
    snake.unshift(head);
    snake.pop();
}

document.addEventListener("keydown", (e) => {
    switch (e.key) {
        case "ArrowUp":
            if (direction.y === 0) direction = { x: 0, y: -1 };
            break;
        case "ArrowDown":
            if (direction.y === 0) direction = { x: 0, y: 1 };
            break;
        case "ArrowLeft":
            if (direction.x === 0) direction = { x: -1, y: 0 };
            break;
        case "ArrowRight":
            if (direction.x === 0) direction = { x: 1, y: 0 };
            break;
    }
});

document.getElementById("restartButton").addEventListener("click", startGame);
document.getElementById("quitButton").addEventListener("click", () => {
    window.location.href = "index.html";
});

startGame();

const arrows = {
    ArrowUp: document.querySelector('.up'),
    ArrowDown: document.querySelector('.down'),
    ArrowLeft: document.querySelector('.left'),
    ArrowRight: document.querySelector('.right')
};

document.addEventListener('keydown', (e) => {
    if (arrows[e.key]) {
        arrows[e.key].classList.add('active');
    }
});

document.addEventListener('keyup', (e) => {
    if (arrows[e.key]) {
        arrows[e.key].classList.remove('active');
    }
});
