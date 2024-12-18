// Contexte graphique
const cvs = document.getElementById("zone_de_dessin");
const ctx = cvs.getContext("2d");

// Fonction pour ajuster automatiquement la taille du canvas
function ajusterTailleCanvas() {
    const largeurEcran = window.innerWidth;
    const hauteurEcran = window.innerHeight;

    if (largeurEcran < 768) {
        cvs.width = largeurEcran * 0.8;
        cvs.height = cvs.width * 4 / 3;
    } else {
        cvs.width = 300;
        cvs.height = 400;
    }
}

ajusterTailleCanvas();
window.addEventListener("resize", ajusterTailleCanvas);

// Initialiser les éléments de la page
const pageAccueil = document.getElementById("page-accueil");
const boutonPlay = document.getElementById("bouton-play");
const boutonQuitter = document.getElementById("bouton-quitter");

let jeuDemarre = false; // Empêche le démarrage du jeu depuis la page d'accueil

boutonPlay.addEventListener("click", function () {
    jeuDemarre = true; // Active le démarrage du jeu
    pageAccueil.style.display = "none";
    boutonQuitter.style.display = "block";
    cvs.style.display = "block";
    demarrerJeu();
});

boutonQuitter.addEventListener("click", function () {
    finDuJeu = true;
    jeuDemarre = false; // Réinitialise l'état de démarrage
    pageAccueil.style.display = "flex";
    boutonQuitter.style.display = "none";
    cvs.style.display = "none";
});

// Images
const imageArrierePlan = new Image();
imageArrierePlan.src = "./images/arrierePlan.png";
const imageAvantPlan = new Image();
imageAvantPlan.src = "./images/avantPlan.png";
const imageTuyauBas = new Image();
imageTuyauBas.src = "./images/tuyauBas.png";
const imageTuyauHaut = new Image();
imageTuyauHaut.src = "./images/tuyauHaut.png";
const imageOiseau1 = new Image();
imageOiseau1.src = "./images/oiseau1.png";
const imageOiseau2 = new Image();
imageOiseau2.src = "./images/oiseau2.png";

// Sons
const sonVole = new Audio("./sons/sonVole.mp3");
const sonScore = new Audio("./sons/sonScore.mp3");
const sonChoc = new Audio("./sons/sonChoc.mp3");

let sonsPrets = false;
document.addEventListener("click", () => {
    if (!sonsPrets && jeuDemarre) {
        sonVole.play().catch(() => {});
        sonScore.play().catch(() => {});
        sonChoc.play().catch(() => {});
        sonsPrets = true;
    }
});

// Variables du jeu
const largeurTuyau = 40;
const ecartTuyaux = 80;
let tabTuyaux, xOiseau, yOiseau, gravite, oiseauMonte, score, finDuJeu;
let espaceEnfonce = false; // Gérer l'appui sur la barre espace

// Charger le score maximum depuis localStorage
let scoreMax = localStorage.getItem("scoreMax") ? parseInt(localStorage.getItem("scoreMax")) : 0;

// Réinitialiser le jeu
function resetJeu() {
    tabTuyaux = [{ x: cvs.width, y: cvs.height - 150 }];
    xOiseau = 100;
    yOiseau = 150;
    gravite = 1;
    oiseauMonte = 0;
    score = 0;
    finDuJeu = false;
}

// Fonction pour démarrer le jeu
function demarrerJeu() {
    resetJeu();
    dessine();
}

// Événements clavier
document.addEventListener("keydown", function (event) {
    if (event.code === "Space" && !finDuJeu && jeuDemarre && !espaceEnfonce) {
        monte();
        espaceEnfonce = true; // Empêche un nouvel appui tant que la barre n'est pas relâchée
    }
});

document.addEventListener("keyup", function (event) {
    if (event.code === "Space") {
        espaceEnfonce = false; // Autorise un nouvel appui
    }
});

function monte() {
    if (!finDuJeu) {
        oiseauMonte = 10;
        yOiseau -= 25;
        sonVole.play().catch(() => console.error("Erreur sonVole"));
    }
}

// Fonction pour dessiner et gérer la logique
function dessine() {
    ctx.drawImage(imageArrierePlan, 0, 0, cvs.width, cvs.height);

    for (let i = 0; i < tabTuyaux.length; i++) {
        tabTuyaux[i].x--;

        ctx.drawImage(imageTuyauBas, tabTuyaux[i].x, tabTuyaux[i].y, largeurTuyau, imageTuyauBas.height);
        ctx.drawImage(imageTuyauHaut, tabTuyaux[i].x, tabTuyaux[i].y - ecartTuyaux - imageTuyauHaut.height, largeurTuyau, imageTuyauHaut.height);

        if (tabTuyaux[i].x === 100) {
            tabTuyaux.push({
                x: cvs.width,
                y: Math.floor(100 + Math.random() * (cvs.height - 200))
            });
        }

        if (tabTuyaux[i].x + largeurTuyau < 0) {
            tabTuyaux.splice(i, 1);
        }

        if (
            yOiseau < 0 ||
            yOiseau + 24 > cvs.height - imageAvantPlan.height ||
            (xOiseau + 34 >= tabTuyaux[i].x && xOiseau <= tabTuyaux[i].x + largeurTuyau &&
                (yOiseau + 24 >= tabTuyaux[i].y || yOiseau <= tabTuyaux[i].y - ecartTuyaux))
        ) {
            finDuJeu = true;

            // Mettre à jour le score maximum si nécessaire
            if (score > scoreMax) {
                scoreMax = score;
                localStorage.setItem("scoreMax", scoreMax); // Sauvegarder le score maximum
            }
        }

        if (xOiseau === tabTuyaux[i].x + largeurTuyau + 5) {
            score++;
            sonScore.play().catch(() => {});
        }
    }

    ctx.drawImage(imageAvantPlan, 0, cvs.height - imageAvantPlan.height, cvs.width, imageAvantPlan.height);

    ctx.drawImage(oiseauMonte > 0 ? imageOiseau2 : imageOiseau1, xOiseau, yOiseau, 34, 24);

    if (oiseauMonte > 0) {
        oiseauMonte--;
    } else {
        yOiseau += gravite;
    }

    ctx.fillStyle = "black";
    ctx.font = "16px Arial";
    ctx.fillText("Score : " + score, 10, 20);
    ctx.fillText("Meilleur Score : " + scoreMax, 10, 40);

    if (!finDuJeu) {
        requestAnimationFrame(dessine);
    } else {
        ctx.fillText("Game Over", cvs.width / 2 - 50, cvs.height / 2);
    }
}

