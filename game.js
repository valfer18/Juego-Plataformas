// Variables del juego
let player;
let enemies = [];
let platforms = [];
let gameOver = false;
let score = 0;
let gameStarted = false;
let gameLoopId = null;

// Obtener información del jugador desde localStorage
const playerData = JSON.parse(localStorage.getItem('playerData')) || {
    nickname: 'Jugador',
    age: 'Desconocido'
};

// Actualizar el panel de información del jugador
function updatePlayerInfo() {
    const playerInfoDiv = document.getElementById('player-info');
    if (playerInfoDiv) {
        playerInfoDiv.innerHTML = `
            <div class="info-item">
                <span>Nombre:</span>
                <span>${playerData.nickname}</span>
            </div>
            <div class="info-item">
                <span>Edad:</span>
                <span>${playerData.age}</span>
            </div>
            <div class="info-item">
                <span>Puntuación:</span>
                <span id="score-display">0</span>
            </div>
        `;
    }
}

// Actualizar la puntuación en el panel de información
window.updateScore = function(score) {
    const scoreDisplay = document.getElementById('score-display');
    if (scoreDisplay) {
        scoreDisplay.textContent = score;
    }
}

// Obtener elementos del DOM
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const restartBtn = document.getElementById('restart-btn');
const returnBtn = document.getElementById('return-btn');

// Clases del juego
class Player {
    constructor() {
        this.width = 32;
        this.height = 32;
        this.x = 100;
        this.y = canvas.height - this.height - 10;
        this.speed = 3;
        this.jumpForce = -12;
        this.gravity = 0.85;
        this.velocityY = 0;
        this.velocityX = 0;
        this.isGrounded = false;
    }

    draw() {
        ctx.fillStyle = 'red';
        ctx.fillRect(this.x, this.y, this.width, this.height);
    }

    update() {
        this.x += this.velocityX;
        this.y += this.velocityY;
        this.velocityY += this.gravity;

        // Límites horizontales
        if (this.x < 0) {
            this.x = 0;
        } else if (this.x > canvas.width - this.width) {
            this.x = canvas.width - this.width;
        }

        // Límites verticales
        if (this.y > canvas.height - this.height - 10) {
            this.y = canvas.height - this.height - 10;
            this.velocityY = 0;
            this.isGrounded = true;
        } else if (this.y < 0) {
            this.y = 0;
            this.velocityY = 0;
        } else {
            this.isGrounded = false;
        }
    }

    jump() {
        if (this.isGrounded) {
            this.velocityY = this.jumpForce;
            this.isGrounded = false;
        }
    }
}

class Enemy {
    constructor(x) {
        this.width = 32;
        this.height = 32;
        this.x = x;
        this.y = canvas.height - this.height - 10;
        this.speed = 2;
    }

    draw() {
        ctx.fillStyle = 'blue';
        ctx.fillRect(this.x, this.y, this.width, this.height);
    }

    update() {
        this.x -= this.speed;
    }
}

class Platform {
    constructor(x, y, width) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = 10;
    }

    draw() {
        ctx.fillStyle = 'brown';
        ctx.fillRect(this.x, this.y, this.width, this.height);
    }
}

// Funciones del juego
function createPlatforms() {
    platforms = [];
    platforms.push(new Platform(200, 300, 200));
    platforms.push(new Platform(400, 200, 150));
    platforms.push(new Platform(600, 100, 100));
}

function initGame() {
    player = new Player();
    enemies = [];
    createPlatforms();
    gameOver = false;
    score = 0;
    gameStarted = true;
    canvas.width = 800;
    canvas.height = 400;
    gameLoop();
}

function checkCollisions() {
    enemies.forEach(enemy => {
        if (player.x < enemy.x + enemy.width &&
            player.x + player.width > enemy.x &&
            player.y < enemy.y + enemy.height &&
            player.y + player.height > enemy.y) {
            gameOver = true;
        }
    });

    platforms.forEach(platform => {
        if (player.x < platform.x + platform.width &&
            player.x + player.width > platform.x &&
            player.y + player.height >= platform.y &&
            player.y + player.height <= platform.y + platform.height) {
            player.y = platform.y - player.height;
            player.velocityY = 0;
            player.isGrounded = true;
        }
    });
}

function gameLoop() {
    if (gameOver) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        ctx.fillStyle = 'white';
        ctx.font = '40px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('¡Game Over!', canvas.width / 2, canvas.height / 2 - 40);
        
        ctx.font = '20px Arial';
        ctx.fillText(`Puntuación: ${score}`, canvas.width / 2, canvas.height / 2);
        ctx.fillText('Presiona R para reiniciar', canvas.width / 2, canvas.height / 2 + 40);
        return;
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    player.update();
    player.draw();

    enemies.forEach(enemy => {
        enemy.update();
        enemy.draw();
    });

    platforms.forEach(platform => {
        platform.draw();
    });

    checkCollisions();

    if (Math.random() < 0.02) {
        enemies.push(new Enemy(canvas.width));
    }

    enemies = enemies.filter(enemy => enemy.x > -enemy.width);

    score++;
    ctx.fillStyle = 'black';
    ctx.font = '20px Arial';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.fillText(`Puntuación: ${score}`, 10, 10);

    if (typeof window.updateScore === 'function') {
        window.updateScore(score);
    }

    gameLoopId = requestAnimationFrame(gameLoop);
}

// Funciones de control del juego
function restartGame() {
    location.reload();
}

function returnToLanding() {
    localStorage.removeItem('playerData');
    window.location.href = 'index.html';
}

// Función para manejar teclas
function handleKeyDown(e) {
    if (gameOver) {
        if (e.code === 'KeyR') {
            restartGame();
        }
    } else {
        if (e.code === 'Space' || e.code === 'ArrowUp') {
            player.jump();
        }
        if (e.code === 'ArrowLeft') {
            player.velocityX = -player.speed;
        }
        if (e.code === 'ArrowRight') {
            player.velocityX = player.speed;
        }
    }
}

function handleKeyUp(e) {
    if (e.code === 'ArrowLeft' || e.code === 'ArrowRight') {
        player.velocityX = 0;
    }
}

// Agregar eventos a los botones
restartBtn.addEventListener('click', restartGame);
returnBtn.addEventListener('click', returnToLanding);

// Agregar eventos de teclado
document.addEventListener('keydown', handleKeyDown);
document.addEventListener('keyup', handleKeyUp);

// Iniciar el juego automáticamente cuando se carga la página
document.addEventListener('DOMContentLoaded', () => {
    if (canvas && ctx) {
        updatePlayerInfo(); // Mostrar la información del jugador
        initGame();
    } else {
        console.error('No se pudo encontrar el canvas o el contexto');
    }
});

// Función para iniciar el juego desde el botón
window.startGame = function() {
    window.location.href = 'juego.html';
}
