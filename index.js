const canvas = document.querySelector('canvas');
const c = canvas.getContext('2d');

canvas.width = innerWidth - 5;
canvas.height = innerHeight - 5;

const canvasEl = document.querySelector('#canvasEl');
const scoreEl = document.querySelector('#scoreEl');
const startGameBtn = document.querySelector('#startGameBtn');
const modalEl = document.querySelector('#modalEl');
const bigScoreEl = document.querySelector('#bigScoreEl');

class Player {
    constructor(x, y, radius, color) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.color = color;
    }

    draw() {
        c.beginPath();
        c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
        c.fillStyle = this.color;
        c.fill();
    }
}

class Projectile {
    constructor(x, y, radius, color, velocity) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.color = color;
        this.velocity = velocity;
    }

    draw() {
        c.beginPath();
        c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
        c.fillStyle = this.color;
        c.fill();
    }

    update() {
        this.draw();
        this.x = this.x + this.velocity.x;
        this.y = this.y + this.velocity.y;

    }
}

class Enemy {
    constructor(x, y, radius, color, velocity) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.color = color;
        this.velocity = velocity;
    }

    draw() {
        c.beginPath();
        c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
        c.fillStyle = this.color;
        c.fill();
    }

    update() {
        this.draw();
        this.x = this.x + this.velocity.x;
        this.y = this.y + this.velocity.y;

    }
}

const friction = 1;

class Particle {
    constructor(x, y, radius, color, velocity) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.color = color;
        this.velocity = velocity;
        this.alpha = 1;
    }

    draw() {
        c.save();
        c.globalAlpha = this.alpha;
        c.beginPath();
        c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
        c.fillStyle = this.color;
        c.fill();
        c.restore();
    }

    update() {
        this.draw();
        this.velocity.x *= friction;
        this.velocity.y *= friction;
        this.x = this.x + this.velocity.x;
        this.y = this.y + this.velocity.y;
        this.alpha -= 0.02;
    }
}

const centerX = canvas.width / 2;
const centerY = canvas.height / 2;

let player = new Player(centerX, centerY, 20, 'white');
let projectiles = [];
let enemies = [];
let particles = [];

function init() {
    player = new Player(centerX, centerY, 20, 'white');
    projectiles = [];
    enemies = [];
    particles = [];
    score = 0;
    scoreEl.innerHTML = score;
    bigScoreEl.innerHTML = score;
}

function spawnEnemies() {
    setInterval(() => {
        const radius = Math.random() * (40 - 10) + 10;
        let x;
        let y;
        if (Math.random() < 0.5) {
            x = Math.random() < 0.5 ? 0 - radius : canvas.width + radius;
            y = Math.random() * canvas.height;
        }
        else {
            x = Math.random() * canvas.width;
            y = Math.random() < 0.5 ? 0 - radius : canvas.height + radius;
        }
        const color = `hsl(${Math.random() * 360}, 80%, 50%)`;
        const angle = Math.atan2(centerY - y, centerX - x);
        const velocity = { x: Math.cos(angle), y: Math.sin(angle) };

        enemies.push(new Enemy(x, y, radius, color, velocity));
    }, 1000);
}

let animationId;
let score = 0;

function animate() {
    animationId = requestAnimationFrame(animate);
    c.fillStyle = 'rgba(0, 0, 0, 0.08)';
    c.fillRect(0, 0, canvas.width, canvas.height);
    player.draw();
    particles.forEach((particle, index) => {
        if (particle.alpha < 0) {
            particles.splice(index, 1);
        } else {
            particle.update();
        }
    });

    projectiles.forEach((projectile, index) => {
        projectile.update();
        // Remove from edges of the screen
        if (projectile.x + projectile.radius < 0 || projectile.x - projectile.radius > canvas.width ||
            projectile.y + projectile.radius < 0 || projectile.y - projectile.radius > canvas.height) {
            setTimeout(() => {
                projectiles.splice(index, 1);
            }, 0);
        }
    });

    enemies.forEach((enemy, index) => {
        enemy.update();

        // Check if hit Player and end of game.
        const dist = Math.hypot(player.x - enemy.x, player.y - enemy.y);
        if (dist - enemy.radius - player.radius < 1) {
            cancelAnimationFrame(animationId);
            modalEl.style.display = 'flex';
            bigScoreEl.innerHTML = score;
        }

        projectiles.forEach((projectile, projectileIndex) => {
            const dist = Math.hypot(projectile.x - enemy.x, projectile.y - enemy.y);

            // When projectile collided with enemy
            if (dist - enemy.radius - projectile.radius < 1) {

                score += 100;
                scoreEl.innerHTML = score;

                for (let i = 0; i < enemy.radius * 2; i++) {
                    particles.push(new Particle(projectile.x,
                        projectile.y,
                        Math.random() * 2,
                        enemy.color,
                        {
                            x: (Math.random() - 0.5) * (Math.random() * 10),
                            y: (Math.random() - 0.5) * (Math.random() * 10)
                        }));
                }

                if (enemy.radius - 10 > 15) {
                    gsap.to(enemy, {
                        radius: enemy.radius - 10
                    })
                    setTimeout(() => {
                        projectiles.splice(projectileIndex, 1);
                    }, 0);
                }
                else {
                    // Remove enemy completely from screen
                    score += 250;
                    scoreEl.innerHTML = score;

                    setTimeout(() => {
                        enemies.splice(index, 1);
                        projectiles.splice(projectileIndex, 1);
                    }, 0);
                }
            }
        })
    })
}

canvasEl.addEventListener('click', (event) => {
    const angle = Math.atan2(event.clientY - centerY, event.clientX - centerX);
    const velocity = {
        x: Math.cos(angle) * 7,
        y: Math.sin(angle) * 7
    }

    projectiles.push(new Projectile(centerX, centerY, 5, 'white', velocity))
});

startGameBtn.addEventListener('click', () => {
    init();
    animate();
    spawnEnemies();
    modalEl.style.display = 'none';
});


