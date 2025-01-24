// Récupérer le canvas et le contexte
const canvas = document.getElementById("zone_de_jeu");
const ctx = canvas.getContext("2d");

// Ajuster la taille du canvas pour s'adapter aux appareils mobiles
function ajusterCanvas() {
    const largeurEcran = window.innerWidth;
    const hauteurEcran = window.innerHeight;

    if (largeurEcran < 768) {
        canvas.width = largeurEcran * 0.9;
        canvas.height = canvas.width;
    } else {
        canvas.width = 400;
        canvas.height = 400;
    }
}
ajusterCanvas();
window.addEventListener("resize", ajusterCanvas);

// Taille des cases de la grille
const box = 20;

// Charger les ressources
const pommeImg = new Image();
pommeImg.src = "images/pomme.png";

// Sons
const mangeSon = new Audio("sons/mange.mp3");
const gameOverSon = new Audio("sons/gameover.mp3");

// Variables du jeu
let serpent = [{ x: 9 * box, y: 9 * box }];
let direction = null;
let pomme = {
    x: Math.floor(Math.random() * (canvas.width / box)) * box,
    y: Math.floor(Math.random() * (canvas.height / box)) * box,
};
let score = 0;

// Gestion des contrôles clavier
document.addEventListener("keydown", changerDirection);
function changerDirection(event) {
    if (event.code === "ArrowUp" && direction !== "BAS") {
        direction = "HAUT";
    } else if (event.code === "ArrowDown" && direction !== "HAUT") {
        direction = "BAS";
    } else if (event.code === "ArrowLeft" && direction !== "DROITE") {
        direction = "GAUCHE";
    } else if (event.code === "ArrowRight" && direction !== "GAUCHE") {
        direction = "DROITE";
    }
}

// Gestion des contrôles tactiles
let touchStartX = 0;
let touchStartY = 0;
let touchEndX = 0;
let touchEndY = 0;

canvas.addEventListener("touchstart", (e) => {
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
});

canvas.addEventListener("touchend", (e) => {
    touchEndX = e.changedTouches[0].clientX;
    touchEndY = e.changedTouches[0].clientY;

    const diffX = touchEndX - touchStartX;
    const diffY = touchEndY - touchStartY;

    if (Math.abs(diffX) > Math.abs(diffY)) {
        if (diffX > 0 && direction !== "GAUCHE") {
            direction = "DROITE";
        } else if (diffX < 0 && direction !== "DROITE") {
            direction = "GAUCHE";
        }
    } else {
        if (diffY > 0 && direction !== "HAUT") {
            direction = "BAS";
        } else if (diffY < 0 && direction !== "BAS") {
            direction = "HAUT";
        }
    }
});

// Dessiner un élément
function drawBox(x, y, color) {
    ctx.fillStyle = color;
    ctx.fillRect(x, y, box, box);
    ctx.strokeStyle = "black";
    ctx.strokeRect(x, y, box, box);
}

// Dessiner le jeu
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Dessiner le serpent
    for (let i = 0; i < serpent.length; i++) {
        drawBox(serpent[i].x, serpent[i].y, i === 0 ? "green" : "lightgreen");
    }

    // Dessiner la pomme
    ctx.drawImage(pommeImg, pomme.x, pomme.y, box, box);

    // Position actuelle de la tête
    let teteX = serpent[0].x;
    let teteY = serpent[0].y;

    // Mise à jour de la position de la tête
    if (direction === "HAUT") teteY -= box;
    if (direction === "BAS") teteY += box;
    if (direction === "GAUCHE") teteX -= box;
    if (direction === "DROITE") teteX += box;

    // Vérifier si le serpent mange la pomme
    if (teteX === pomme.x && teteY === pomme.y) {
        score++;
        mangeSon.play();
        pomme = {
            x: Math.floor(Math.random() * (canvas.width / box)) * box,
            y: Math.floor(Math.random() * (canvas.height / box)) * box,
        };
    } else {
        serpent.pop(); // Retirer la dernière cellule si pas de pomme mangée
    }

    // Ajouter une nouvelle tête
    const nouvelleTete = { x: teteX, y: teteY };

    // Vérifier les collisions
    if (
        teteX < 0 ||
        teteY < 0 ||
        teteX >= canvas.width ||
        teteY >= canvas.height ||
        collision(nouvelleTete, serpent)
    ) {
        gameOverSon.play();
        clearInterval(jeu);
        alert("Game Over! Score: " + score);
        return;
    }

    serpent.unshift(nouvelleTete);

    // Afficher le score
    ctx.fillStyle = "black";
    ctx.font = "20px Arial";
    ctx.fillText("Score: " + score, 10, canvas.height - 10);
}

// Vérifier les collisions avec le corps
function collision(tete, corps) {
    for (let i = 0; i < corps.length; i++) {
        if (tete.x === corps[i].x && tete.y === corps[i].y) {
            return true;
        }
    }
    return false;
}

// Démarrer le jeu
let jeu = setInterval(draw, 100);
