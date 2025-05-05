let gameInterval;
let snake, food, score, direction;

const gridSize = 20;

// Initialize the game
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

// Generate a new food position
function generateFood() {
    return {
        x: Math.floor(Math.random() * gridSize),
        y: Math.floor(Math.random() * gridSize)
    };
}

// Start the game loop
function startGame() {
    clearInterval(gameInterval);
    initializeGame();
    gameInterval = setInterval(gameLoop, 200); // Speed of the game
}

// Main game loop
function gameLoop() {
    updateSnake();
    checkCollisions();
    drawBoard();
    drawSnake();
    drawFood();
}

// Draw the board (black background)
function drawBoard() {
    const board = document.getElementById("board");
    const ctx = board.getContext("2d");
    board.width = 400;
    board.height = 400;

    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, board.width, board.height);
}

// Draw the snake
function drawSnake() {
    const board = document.getElementById("board");
    const ctx = board.getContext("2d");

    ctx.fillStyle = "green";
    snake.forEach(segment => {
        ctx.fillRect(segment.x * 20, segment.y * 20, 20, 20);
    });
}

// Draw the food
function drawFood() {
    const board = document.getElementById("board");
    const ctx = board.getContext("2d");

    ctx.fillStyle = "red";
    ctx.fillRect(food.x * 20, food.y * 20, 20, 20);
}

// Check collisions (walls, self, food)
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
        snake.push({}); // Grow the snake
        food = generateFood();
    }
}

// Update the snake position
function updateSnake() {
    const head = { x: snake[0].x + direction.x, y: snake[0].y + direction.y };
    snake.unshift(head);
    snake.pop();
}

// Change direction safely (keyboard or touch)
function changeDirectionFromKey(key) {
    if (key === "ArrowUp" && direction.y === 0) {
        direction = { x: 0, y: -1 };
    } else if (key === "ArrowDown" && direction.y === 0) {
        direction = { x: 0, y: 1 };
    } else if (key === "ArrowLeft" && direction.x === 0) {
        direction = { x: -1, y: 0 };
    } else if (key === "ArrowRight" && direction.x === 0) {
        direction = { x: 1, y: 0 };
    }
}

// Keyboard input
document.addEventListener("keydown", (e) => {
    changeDirectionFromKey(e.key);
});

// Restart and quit buttons
document.getElementById("restartButton").addEventListener("click", startGame);
document.getElementById("quitButton").addEventListener("click", () => {
    window.location.href = "index.html";
});

// Start game on load
startGame();

// Highlight arrows on key press (desktop)
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

// Handle touch and mouse clicks on arrow buttons (mobile)
const arrowButtons = document.querySelectorAll('.arrow');

arrowButtons.forEach(button => {
    const key = button.dataset.direction;

    const handlePress = () => {
        button.classList.add('active');
        changeDirectionFromKey(key);
    };

    const handleRelease = () => {
        button.classList.remove('active');
    };

    button.addEventListener('touchstart', handlePress);
    button.addEventListener('mousedown', handlePress);

    button.addEventListener('touchend', handleRelease);
    button.addEventListener('mouseup', handleRelease);
    button.addEventListener('touchcancel', handleRelease);
});



