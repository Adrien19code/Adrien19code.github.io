const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(70, window.innerWidth * 0.8 / (window.innerHeight * 0.8), 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth * 0.8, window.innerHeight * 0.8);
document.body.appendChild(renderer.domElement);

const ambientLight = new THREE.AmbientLight(0x404040, 1.5);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(5, 10, 5);
scene.add(directionalLight);

const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(15, 200),
    new THREE.MeshBasicMaterial({ color: new THREE.Color(34 / 255, 139 / 255, 34 / 255), side: THREE.DoubleSide })
);
floor.rotation.x = -Math.PI / 2;
floor.position.z = -50;
scene.add(floor);

const lanes = [-4.5, 0, 4.5];
let currentLane = 1, isJumping = false, isDucking = false, velocityY = 5, gravity = -0.015, jumpStrength = 0.35;
let canJump = true, canDuck = true, duckStartTime = 0, duckDuration = 2;

const railLoader = new THREE.GLTFLoader();
let rails = [], railsPerLane = 80, railSpacing = 2.5;

railLoader.load("imagesminecraft/rail_minecraft.glb", (gltf) => {
    lanes.forEach(lane => {
        for (let i = 0; i < railsPerLane; i++) {
            const rail = gltf.scene.clone();
            rail.position.set(lane, -1, i * railSpacing - 200);
            rail.scale.set(1.7, 1.7, 3);
            scene.add(rail);
            rails.push(rail);
        }
    });
});

const steveLoader = new THREE.GLTFLoader();
let steve = null;

steveLoader.load("imagesminecraft/steve_minecraft.glb", (gltf) => {
    steve = gltf.scene;
    steve.position.set(lanes[currentLane], 2, 5);
    steve.scale.set(0.1, 0.1, 0.1);
    steve.rotation.y = Math.PI;
    scene.add(steve);
});

const boutonQuitter = document.getElementById("bouton-quitter");
boutonQuitter.addEventListener("click", () => {
    window.location.href = "index.html";
});

const boutonRejouer = document.getElementById("bouton-rejouer");
boutonRejouer.addEventListener("click", () => {
    location.reload();
});

camera.position.set(0, 7, 12);
camera.lookAt(0, 1, 0);

document.addEventListener("keydown", (event) => {
    if (!steve) return;

    if (event.key === "ArrowLeft" && currentLane > 0) {
        currentLane--;
    }
    if (event.key === "ArrowRight" && currentLane < 2) {
        currentLane++;
    }
    if (event.key === "ArrowUp" && !isJumping && canJump) {
        isJumping = true;
        velocityY = jumpStrength;
        canJump = false;
    }
    if (event.key === "ArrowDown" && !isDucking && canDuck) {
        isDucking = true;
        steve.scale.y = 0.07;
        steve.position.y = 1;
        canDuck = false;
        duckStartTime = Date.now();
    }
    steve.position.x = lanes[currentLane];
});

document.addEventListener("keyup", (event) => {
    if (event.key === "ArrowUp") canJump = true;
});

const ghastLoader = new THREE.GLTFLoader();
let ghast = null;
ghastLoader.load("imagesminecraft/ghast_minecraft.glb", (gltf) => {
    ghast = gltf.scene;
    ghast.scale.set(0.2, 0.2, 0.2);
});

const spiderLoader = new THREE.GLTFLoader();
let spiderModel = null;
spiderLoader.load("imagesminecraft/spider_minecraft.glb", (gltf) => {
    spiderModel = gltf.scene;
    spiderModel.scale.set(0.15, 0.15, 0.15);
});

const cartLoader = new THREE.GLTFLoader();
let cartModel = null;
cartLoader.load("imagesminecraft/cart_minecraft.glb", (gltf) => {
    cartModel = gltf.scene;
    cartModel.scale.set(0.15, 0.15, 0.15);
});

let obstacles = [];
let gameOver = false;

function createObstacle(isGhast) {
    if (!ghast || !spiderModel) return;

    let laneIndex = Math.floor(Math.random() * 3);
    let laneX = lanes[laneIndex];
    let obstacleHeight = isGhast ? 6 : 0.9;

    let obstacle;
    if (isGhast) {
        obstacle = ghast.clone();
        obstacle.userData.type = "ghast";
    } else {
        obstacle = spiderModel.clone();
        obstacle.userData.type = "spider";
    }

    obstacle.position.set(laneX, obstacleHeight, -50);
    scene.add(obstacle);
    obstacles.push(obstacle);
}

setInterval(() => {
    const isGhast = Math.random() < 0.5;
    createObstacle(isGhast);
}, 5000);

function checkCollision() {
    if (gameOver || !steve) return;

    const playerBox = new THREE.Box3().setFromObject(steve);

    obstacles.forEach(obstacle => {
        const obstacleBox = new THREE.Box3().setFromObject(obstacle);

        if (playerBox.intersectsBox(obstacleBox)) {
            if (obstacle.userData.type === "ghast") {
                if (isDucking) {
                    console.log("Steve passe sous le Ghast !");
                } else {
                    gameOver = true;
                    console.log("Game Over ! Vous avez touché un Ghast !");
                    boutonRejouer.style.display = "inline";
                }
            } else if (obstacle.userData.type === "spider") {
                if (!isJumping && steve.position.y <= 2) {
                    gameOver = true;
                    console.log("Game Over ! Vous avez touché une araignée !");
                    boutonRejouer.style.display = "inline";
                }
            }
        }
    });
}

function updateObstacles() {
    obstacles.forEach((obstacle, index) => {
        obstacle.position.z += 0.15;
        if (obstacle.position.z > 20) {
            scene.remove(obstacle);
            obstacles.splice(index, 1);
        }
    });
}

function updateRails() {
    rails.forEach(rail => {
        rail.position.z += 0.15;
        if (rail.position.z > 20) rail.position.z -= railsPerLane * railSpacing;
    });
}

function animate() {
    requestAnimationFrame(animate);

    if (gameOver) return;

    floor.position.z += 0.15;
    if (floor.position.z > 0) floor.position.z = -50;

    updateObstacles();
    updateRails();
    checkCollision();

    if (isJumping) {
        steve.position.y += velocityY;
        velocityY += gravity;
        if (steve.position.y <= 2) {
            steve.position.y = 2;
            isJumping = false;
            velocityY = 0;
        }
    }

    if (isDucking) {
        let elapsedTime = (Date.now() - duckStartTime) / 1000;
        if (elapsedTime >= duckDuration) {
            isDucking = false;
            steve.scale.y = 0.1;
            steve.position.y = 2;
            canDuck = true;
        }
    }

    steve.position.x = lanes[currentLane];

    renderer.render(scene, camera);
}

animate();

