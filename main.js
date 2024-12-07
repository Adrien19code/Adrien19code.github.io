// Contexte graphique
const cvs = document.getElementById("zone_de_dessin");
cvs.width = 300;
cvs.height = 400;
const ctx = cvs.getContext("2d");

// Images
const imageArrierePlan = new Image();
imageArrierePlan.src = "https://github.com/Adrien19code/Adrien19code.github.io/raw/main/images/arrierePlan.png"; // URL pour l'arrière-plan
const imageAvantPlan = new Image();
imageAvantPlan.src = "https://github.com/Adrien19code/Adrien19code.github.io/raw/main/images/avantPlan.png"; // URL pour l'avant-plan
const imageTuyauBas = new Image();
imageTuyauBas.src = "https://github.com/Adrien19code/Adrien19code.github.io/raw/main/images/tuyauBas.png"; // URL pour le tuyau bas
const imageTuyauHaut = new Image();
imageTuyauHaut.src = "https://github.com/Adrien19code/Adrien19code.github.io/raw/main/images/tuyauHaut.png"; // URL pour le tuyau haut
const imageOiseau1 = new Image();
imageOiseau1.src = "https://github.com/Adrien19code/Adrien19code.github.io/raw/main/images/oiseau1.png"; // URL pour l'image du premier oiseau
const imageOiseau2 = new Image();
imageOiseau2.src = "https://github.com/Adrien19code/Adrien19code.github.io/raw/main/images/oiseau2.png"; // URL pour l'image du second oiseau

// Sons
const sonVole = new Audio();
sonVole.src = "https://github.com/Adrien19code/Adrien19code.github.io/raw/main/sons/sonVole.mp3"; // URL pour le son de vol
const sonScore = new Audio();
sonScore.src = "https://github.com/Adrien19code/Adrien19code.github.io/raw/main/sons/sonScore.mp3"; // URL pour le son de score
const sonChoc = new Audio();
sonChoc.src = "https://github.com/Adrien19code/Adrien19code.github.io/raw/main/sons/sonChoc.mp3"; // URL pour le son de choc


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

let finDuJeu = false 
let score = 0;



// Utilisation de la barre d'espace pour faire monter l'oiseau
document.addEventListener("keydown", function(event) {
    if (event.code === "Space") { // Vérifie si la touche pressée est "Space"
        monte();
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


function monte(){
    if(finDuJeu === false){
        oiseauMonte = 10;
        yOiseau -= 25;
        sonVole.play();
    
    } else{
        setTimeout(rechargeLejeu, 500);
    }
}

function rechargeLejeu(){
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
        // Gestion des colisions
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
    }else{
    ctx.fillStyle = "black";
    ctx.font = "30px Verdana";
    ctx.fillText("Fin de partie", 50, 200);
    ctx.font = "20px Verdana";
    ctx.fillText("cliquer pour recommencer", 15, 230);
    }
}

dessine();
