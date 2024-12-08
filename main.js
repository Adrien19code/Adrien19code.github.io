// Contexte graphique
const cvs = document.getElementById("zone_de_dessin");
cvs.width = 300;
cvs.height = 400;
const ctx = cvs.getContext("2d");

// Images
const imageArrierePlan = new Image();
imageArrierePlan.src = "images/arrierePlan.png";
const imageAvantPlan = new Image();
imageAvantPlan.src = "images/avantPlan.png";
const imageTuyauBas = new Image();
imageTuyauBas.src = "images/tuyauBas.png";
const imageTuyauHaut = new Image();
imageTuyauHaut.src = "images/tuyauHaut.png";
const imageOiseau1 = new Image();
imageOiseau1.src = "images/oiseau1.png";
const imageOiseau2 = new Image();
imageOiseau2.src = "images/oiseau2.png";

// Sons
const sonVole = new Audio("sons/sonVole.mp3");
const sonScore = new Audio("sons/sonScore.mp3");
const sonChoc = new Audio("sons/sonChoc.mp3");

// Activation des sons uniquement après une interaction utilisateur (nécessaire pour certains navigateurs)
let sonsPrets = false;

document.addEventListener("click", () => {
    if (!sonsPrets) {
        sonVole.play().catch(() => {}); // Lance une lecture silencieuse pour initialiser les sons
        sonScore.play().catch(() => {});
        sonChoc.play().catch(() => {});
        sonsPrets = true;
    }
});

// Paramètres des tuyaux
const largeurTuyau = 40;
const ecartTuyaux = 80;
let tabTuyaux = [];
tabTuyaux[0] = { 
    x: cvs.width,
    y: cvs.height - 150
};

// Paramètres de l'oiseau
let xOiseau = 100;
let yOiseau = 150;
const gravite = 1;
let oiseauMonte = 0;
const largeurOiseau = 34;
const hauteurOiseau = 24;

let finDuJeu = false;
let score = 0;

// Gestion de la barre d'espace et des événements tactiles
let espaceMaintenu = false;  // Flag pour savoir si l'espace est maintenu

document.addEventListener("keydown", function(event) {
    if (event.code === "Space" && !espaceMaintenu) {
        espaceMaintenu = true;
        monte();
    }
});

document.addEventListener("keyup", function(event) {
    if (event.code === "Space") {
        espaceMaintenu = false;
    }
});

// Événements tactiles sur mobile
cvs.addEventListener("touchstart", function(event) {
    event.preventDefault(); // Empêche le zoom
    if (!espaceMaintenu) {
        espaceMaintenu = true;
        monte();
    }
});

cvs.addEventListener("touchend", function(event) {
    espaceMaintenu = false;
});

// Fonction pour faire monter l'oiseau
function monte() {
    if (!finDuJeu) {
        oiseauMonte = 10;
        yOiseau -= 25;
        sonVole.play().catch(() => console.error("Erreur lors de la lecture du son 'sonVole.mp3'"));
    } else {
        setTimeout(rechargeLejeu, 500);
    }
}

// Recharge le jeu après la fin de partie
function rechargeLejeu() {
    finDuJeu = false;
    location.reload();
}

// Dessin du jeu
function dessine() {
    ctx.drawImage(imageArrierePlan, 0, 0);

    // Gestion des tuyaux
    for (let i = 0; i < tabTuyaux.length; i++) {
        tabTuyaux[i].x--;

        // Dessin du tuyau
        ctx.drawImage(imageTuyauBas, tabTuyaux[i].x, tabTuyaux[i].y);
        ctx.drawImage(imageTuyauHaut, tabTuyaux[i].x, tabTuyaux[i].y - ecartTuyaux - imageTuyauHaut.height);

        // Ajout d'un nouveau tuyau lorsque le tuyau actuel atteint x = 100
        if (tabTuyaux[i].x === 100) {
            tabTuyaux.push({
                x: cvs.width,
                y: Math.floor(100 + Math.random() * 180)
            });
        } 
        else if (tabTuyaux[i].x + largeurTuyau < 0) {
            tabTuyaux.splice(i, 1);
        }

        // Gestion des collisions
        if (yOiseau < 0 || yOiseau + hauteurOiseau > 300 || (xOiseau + largeurOiseau >= tabTuyaux[i].x && xOiseau <= tabTuyaux[i].x + largeurTuyau
            && (yOiseau + hauteurOiseau >= tabTuyaux[i].y || yOiseau + ecartTuyaux <= tabTuyaux[i].y))) {
            sonChoc.play().catch(() => console.error("Erreur lors de la lecture du son 'sonChoc.mp3'"));
            finDuJeu = true;
        }

        // Gestion du score
        if (xOiseau === tabTuyaux[i].x + largeurTuyau + 5) {
            score++;
            sonScore.play().catch(() => console.error("Erreur lors de la lecture du son 'sonScore.mp3'"));
        }
    }

    ctx.drawImage(imageAvantPlan, 0, cvs.height - imageAvantPlan.height);

    // Mouvement de l'oiseau
    yOiseau += gravite;
    if (oiseauMonte > 0) {
        oiseauMonte--;
        ctx.drawImage(imageOiseau2, xOiseau, yOiseau);
    } else {
        ctx.drawImage(imageOiseau1, xOiseau, yOiseau);
    }

    ctx.lineWidth = 3;
    ctx.strokeRect(0, 0, cvs.width, cvs.height);

    ctx.fillStyle = "black";
    ctx.font = "20px Verdana";
    ctx.fillText("Score :" + score, 10, cvs.height - 20);

    if (!finDuJeu) {
        requestAnimationFrame(dessine);
    } else {
        ctx.fillStyle = "black";
        ctx.font = "30px Verdana";
        ctx.fillText("Fin de partie", 50, 200);
        ctx.font = "20px Verdana";
        ctx.fillText("Cliquez pour recommencer", 15, 230);
    }
}

// Écouteur d'événement pour recommencer le jeu après la fin
cvs.addEventListener("click", function() {
    if (finDuJeu) {
        rechargeLejeu();
    }
});

// Lancement du jeu
dessine();

