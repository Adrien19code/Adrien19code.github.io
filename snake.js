let gameInterval; // Variable pour stocker l'intervalle du jeu
let snake, food, score, direction;

// Taille de la grille (20x20 cellules)
const gridSize = 20;

// Fonction pour initialiser ou réinitialiser le jeu
function initializeGame() {
    snake = [{ x: 5, y: 5 }]; // Position de départ du serpent
    food = generateFood(); // Position initiale de la nourriture
    score = 0;
    direction = { x: 0, y: 0 }; // Pas de mouvement au début
    drawBoard();
    drawSnake();
    drawFood();
}

// Fonction pour générer une position aléatoire pour la nourriture
function generateFood() {
    return {
        x: Math.floor(Math.random() * gridSize),
        y: Math.floor(Math.random() * gridSize)
    };
}

// Fonction pour démarrer le jeu
function startGame() {
    clearInterval(gameInterval); // Arrête un jeu en cours
    initializeGame();

    // Lance la boucle principale toutes les 100ms
    gameInterval = setInterval(gameLoop, 100);
}

// Fonction pour la logique principale du jeu
function gameLoop() {
    updateSnake();
    checkCollisions();
    drawBoard();
    drawSnake();
    drawFood();
}

// Fonction pour dessiner le tableau
function drawBoard() {
    const board = document.getElementById("board");
    const ctx = board.getContext("2d");
    board.width = 400;
    board.height = 400;

    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, board.width, board.height);
}

// Fonction pour dessiner le serpent
function drawSnake() {
    const board = document.getElementById("board");
    const ctx = board.getContext("2d");

    ctx.fillStyle = "green";
    snake.forEach(segment => {
        ctx.fillRect(segment.x * 20, segment.y * 20, 20, 20);
    });
}

// Fonction pour dessiner la nourriture
function drawFood() {
    const board = document.getElementById("board");
    const ctx = board.getContext("2d");

    ctx.fillStyle = "red";
    ctx.fillRect(food.x * 20, food.y * 20, 20, 20);
}

// Fonction pour vérifier les collisions
function checkCollisions() {
    const head = snake[0];

    // Collision avec les murs ou soi-même
    if (
        head.x < 0 || head.y < 0 ||
        head.x >= gridSize || head.y >= gridSize ||
        snake.some((segment, index) => index !== 0 && segment.x === head.x && segment.y === head.y)
    ) {
        clearInterval(gameInterval); // Arrête le jeu silencieusement
        console.log("Game Over"); // Affiche un message dans la console
    }

    // Collision avec la nourriture
    if (head.x === food.x && head.y === food.y) {
        score += 10;
        snake.push({}); // Ajoute un segment au serpent
        food = generateFood(); // Génère une nouvelle nourriture
    }
}

// Fonction pour mettre à jour la position du serpent
function updateSnake() {
    const head = { x: snake[0].x + direction.x, y: snake[0].y + direction.y };
    snake.unshift(head); // Ajoute une nouvelle tête
    snake.pop(); // Supprime la queue
}

// Écouteur d'événements pour les touches directionnelles
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

// Écouteur pour le bouton "Restart Game"
document.getElementById("restartButton").addEventListener("click", startGame);

// Écouteur pour le bouton "Quit"
document.getElementById("quitButton").addEventListener("click", () => {
    window.location.href = "index.html"; // Redirige vers la page d'accueil
});

// Démarre le jeu au chargement de la page
startGame();

