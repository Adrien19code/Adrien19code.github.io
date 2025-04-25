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

// Images
const imageArrierePlan = new Image();
imageArrierePlan.src = "imagesflapy/arrierePlan.png";
const imageAvantPlan = new Image();
imageAvantPlan.src = "imagesflapy/avantPlan.png";
const imageTuyauBas = new Image();
imageTuyauBas.src = "imagesflapy/tuyauBas.png";
const imageTuyauHaut = new Image();
imageTuyauHaut.src = "imagesflapy/tuyauHaut.png";
const imageOiseau1 = new Image();
imageOiseau1.src = "imagesflapy/oiseau1.png";
const imageOiseau2 = new Image();
imageOiseau2.src = "imagesflapy/oiseau2.png";

// Sons
const sonVole = new Audio("sons/sonVole.mp3");
const sonScore = new Audio("sons/sonScore.mp3");
const sonChoc = new Audio("sons/sonChoc.mp3");

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
const ecartTuyaux = 85;
let tabTuyaux, xOiseau, yOiseau, gravite, oiseauMonte, score, finDuJeu;
let toucheEnfoncee = false; // Empêche les sauts multiples lorsque la touche est maintenue

// Charger le score maximum depuis localStorage
let scoreMax = localStorage.getItem("scoreMax") ? parseInt(localStorage.getItem("scoreMax")) : 0;

// Réinitialiser le jeu
function resetJeu() {
    tabTuyaux = [{ x: cvs.width, y: cvs.height - 150 }];
    xOiseau = 100;
    yOiseau = 150;
    gravite = 2; // Augmenter la gravité pour que l'oiseau tombe plus vite
    oiseauMonte = 0;
    score = 0; // Réinitialiser le score
    finDuJeu = false;
}

// Fonction pour démarrer le jeu
function demarrerJeu() {
    resetJeu();
    dessine();
}





// Bouton "Quitter"
const boutonQuitter = document.getElementById("bouton-quitter");
boutonQuitter.addEventListener("click", () => {
    window.location.href = "index.html"; // Redirige vers la page d'accueil
});








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
        oiseauMonte = 15;
        yOiseau -= 25;
        sonVole.play().catch(() => console.error("Erreur sonVole"));
    }
}

// Fonction pour dessiner et gérer la logique
function dessine() {
    ctx.drawImage(imageArrierePlan, 0, 0, cvs.width, cvs.height);

    for (let i = 0; i < tabTuyaux.length; i++) {
        tabTuyaux[i].x -= 2; // Augmenter la vitesse de déplacement des tuyaux

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

        // Détection de collision
        if (
            yOiseau < 0 || // Collision avec le bord supérieur
            yOiseau + 24 > cvs.height - imageAvantPlan.height || // Collision avec le sol
            (
                xOiseau + 34 >= tabTuyaux[i].x && 
                xOiseau <= tabTuyaux[i].x + largeurTuyau && 
                (
                    yOiseau <= tabTuyaux[i].y - ecartTuyaux || // Collision avec le tuyau haut
                    yOiseau + 24 >= tabTuyaux[i].y // Collision avec le tuyau bas
                )
            )
        ) {
            sonChoc.play().catch(() => console.error("Erreur sonChoc"));
            finDuJeu = true; // Le jeu s'arrête immédiatement après la collision
            if (score > scoreMax) {
                scoreMax = score;
                localStorage.setItem("scoreMax", scoreMax);
            }
        }

        // Incrémenter le score si l'oiseau passe entre les tuyaux
        if (tabTuyaux[i].x + largeurTuyau < xOiseau && !tabTuyaux[i].passed) {
            score++; // Incrémenter le score
            tabTuyaux[i].passed = true; // Marquer que le tuyau a été traversé
            sonScore.play().catch(() => console.error("Erreur sonScore"));
        }
    }

    ctx.drawImage(imageAvantPlan, 0, cvs.height - imageAvantPlan.height, cvs.width, imageAvantPlan.height);
    ctx.drawImage(oiseauMonte > 0 ? imageOiseau2 : imageOiseau1, xOiseau, yOiseau, 34, 24);

    if (oiseauMonte > 0) {
        oiseauMonte--;
    } else {
        yOiseau += gravite; // L'oiseau tombe plus vite
    }

    // Texte du score
    ctx.fillStyle = "black";
    ctx.font = "15px Arial";
    ctx.fillText("Score: " + score, 10, 20);
    ctx.fillText("Score Max: " + scoreMax, 10, 40);

    if (finDuJeu) {
        ctx.font = "20px Arial";
        const messageLigne1 = "Cliquez sur la barre ";
        const messageLigne2 = "espace pour rejouer";
        const largeurMessage = Math.max(
            ctx.measureText(messageLigne1).width,
            ctx.measureText(messageLigne2).width
        );
        ctx.fillStyle = "white";
        ctx.fillRect(cvs.width / 2 - largeurMessage / 2 - 10, cvs.height / 2 - 30, largeurMessage + 20, 60);

        ctx.fillStyle = "black";
        ctx.fillText(messageLigne1, cvs.width / 2 - largeurMessage / 2, cvs.height / 2 - 10);
        ctx.fillText(messageLigne2, cvs.width / 2 - largeurMessage / 2, cvs.height / 2 + 20);
        return;
    }

    requestAnimationFrame(dessine);
}

// Démarrer le jeu immédiatement
demarrerJeu(); 


