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

boutonPlay.addEventListener("click", function () {
    pageAccueil.style.display = "none";
    boutonQuitter.style.display = "block";
    cvs.style.display = "block";
    demarrerJeu();
});

boutonQuitter.addEventListener("click", function () {
    finDuJeu = true;
    pageAccueil.style.display = "flex";
    boutonQuitter.style.display = "none";
    cvs.style.display = "none";
});

// Images
const imageArrierePlan = new Image();
imageArrierePlan.src = "images/arrierePlan.png"; // Chemin vers le dossier 'images'
const imageAvantPlan = new Image();
imageAvantPlan.src = "images/avantPlan.png"; // Chemin vers le dossier 'images'
const imageTuyauBas = new Image();
imageTuyauBas.src = "images/tuyauBas.png"; // Chemin vers le dossier 'images'
const imageTuyauHaut = new Image();
imageTuyauHaut.src = "images/tuyauHaut.png"; // Chemin vers le dossier 'images'
const imageOiseau1 = new Image();
imageOiseau1.src = "images/oiseau1.png"; // Chemin vers le dossier 'images'
const imageOiseau2 = new Image();
imageOiseau2.src = "images/oiseau2.png"; // Chemin vers le dossier 'images'

// Sons
const sonVole = new Audio("sons/sonVole.mp3"); // Chemin vers le dossier 'sons'
const sonScore = new Audio("sons/sonScore.mp3"); // Chemin vers le dossier 'sons'
const sonChoc = new Audio("sons/sonChoc.mp3"); // Chemin vers le dossier 'sons'

let sonsPrets = false;
document.addEventListener("click", () => {
    if (!sonsPrets) {
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
let toucheEnfoncee = false; // Empêche les sauts multiples lorsque la touche est maintenue

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
    if (event.code === "Space" && !toucheEnfoncee) {
        if (finDuJeu) {
            demarrerJeu(); // Redémarrer le jeu si terminé
        } else {
            monte(); // Fait sauter l'oiseau
        }
        toucheEnfoncee = true; // Empêche les sauts multiples
    }
});

document.addEventListener("keyup", function (event) {
    if (event.code === "Space") {
        toucheEnfoncee = false; // Autorise un nouveau saut après relâchement
    }
});

// Événement tactile pour les appareils mobiles
document.addEventListener("touchstart", function (event) {
    if (!toucheEnfoncee) {
        if (finDuJeu) {
            demarrerJeu(); // Redémarrer le jeu si terminé
        } else {
            monte(); // Fait sauter l'oiseau
        }
        toucheEnfoncee = true; // Empêche les sauts multiples
    }
});

document.addEventListener("touchend", function (event) {
    toucheEnfoncee = false; // Autorise un nouveau saut après relâchement
});

// Fonction pour faire sauter l'oiseau
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

        // Détection de collision : vérification des bords des tuyaux
        if (
            yOiseau < 0 || // Collision avec le bord supérieur
            yOiseau + 24 > cvs.height - imageAvantPlan.height || // Collision avec le bord inférieur
            (xOiseau + 34 >= tabTuyaux[i].x && xOiseau <= tabTuyaux[i].x + largeurTuyau && 
                (yOiseau + 24 >= tabTuyaux[i].y || yOiseau <= tabTuyaux[i].y - ecartTuyaux - imageTuyauHaut.height)) || // Collision avec le côté des tuyaux
            (xOiseau + 34 >= tabTuyaux[i].x && xOiseau <= tabTuyaux[i].x + largeurTuyau && // Collision avec le côté du tuyau bas
                yOiseau + 24 >= tabTuyaux[i].y)
        ) {
            sonChoc.play().catch(() => console.error("Erreur sonChoc"));
            finDuJeu = true;  // Le jeu s'arrête immédiatement après la collision
            if (score > scoreMax) {
                scoreMax = score;
                localStorage.setItem("scoreMax", scoreMax);
            }
        }
    }

    ctx.drawImage(imageAvantPlan, 0, cvs.height - imageAvantPlan.height, cvs.width, imageAvantPlan.height);
    ctx.drawImage(oiseauMonte > 0 ? imageOiseau2 : imageOiseau1, xOiseau, yOiseau, 34, 24);

    if (oiseauMonte > 0) {
        oiseauMonte--;
    } else {
        yOiseau += gravite;
    }

    // Texte du score
    ctx.fillStyle = "black";
    ctx.font = "15px Arial";
    ctx.fillText("Score: " + score, 10, 20);
    ctx.fillText("Score Max: " + scoreMax, 10, 40);

    if (finDuJeu) {
        ctx.font = "20px Arial";
        const messageLigne1 = "Cliquez sur la barre espace";
        const messageLigne2 = "pour rejouer";
        const texteLargeurLigne1 = ctx.measureText(messageLigne1).width;
        const texteLargeurLigne2 = ctx.measureText(messageLigne2).width;

        ctx.fillText(messageLigne1, (cvs.width - texteLargeurLigne1) / 2, cvs.height / 2 - 10);
        ctx.fillText(messageLigne2, (cvs.width - texteLargeurLigne2) / 2, cvs.height / 2 + 20);
    } else {
        requestAnimationFrame(dessine); // Continuation de l'animation tant que le jeu n'est pas fini
    }
}
