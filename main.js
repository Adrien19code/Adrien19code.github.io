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

// sons
const sonVole = new Audio();
sonVole.src = "sons/sonVole.mp3";
const sonScore = new Audio();
sonScore.src = "sons/sonScore.mp3";
const sonChoc = new Audio();
sonChoc.src = "sons/sonChoc.mp3";


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

// Contrôle de l'état de la touche espace
let toucheEspaceEnfoncee = false;

// Utilisation de la barre d'espace pour faire monter l'oiseau
document.addEventListener("keydown", function(event) {
    if (event.code === "Space" && !toucheEspaceEnfoncee) { // Vérifie si la touche pressée est "Space"
        toucheEspaceEnfoncee = true;  // Empêche un double saut avant que la touche soit relâchée
        monte();
    }
});

// Lorsque la touche est relâchée, on permet à l'oiseau de sauter à nouveau
document.addEventListener("keyup", function(event) {
    if (event.code === "Space") {
        toucheEspaceEnfoncee = false;  // La touche est maintenant relâchée, donc on peut sauter à nouveau
    }
});

function monte() {
    if (finDuJeu === false) {
        oiseauMonte = 10;
        yOiseau -= 25;
        sonVole.play();
    } else {
        setTimeout(rechargeLejeu, 500);
    }
}

// Utilisation du clic droit pour faire monter l'oiseau
document.addEventListener("contextmenu", function(event) {
    event.preventDefault(); // Empêche l'ouverture du menu contextuel
    monte();
});

function rechargeLejeu() {
    finDuJeu = false;
    location.reload();
}

// Dessin
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
        else if (tabTuyaux[i].x + largeurTuyau < 0){
            tabTuyaux.splice(i, 1);
        }
        // Gestion des collisions
        if(yOiseau < 0 || yOiseau + hauteurOiseau > 300 ||(xOiseau + largeurOiseau >= tabTuyaux [i].x && xOiseau<= tabTuyaux[i].x + largeurTuyau
        && (yOiseau + hauteurOiseau >= tabTuyaux[i].y || yOiseau + ecartTuyaux <= tabTuyaux[i].y ))){
            sonChoc.play();
            finDuJeu = true;
        }
        // Gestion du score
        if(xOiseau === tabTuyaux[i].x + largeurTuyau + 5){
            score++;
            sonScore.play();
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

    if(finDuJeu === false) {
        requestAnimationFrame(dessine);
    } else {
        ctx.fillStyle = "black";
        ctx.font = "30px Verdana";
        ctx.fillText("Fin de partie", 50, 200);
        ctx.font = "20px Verdana";
        ctx.fillText("cliquer pour recommencer", 15, 230);
    }
}

dessine();

