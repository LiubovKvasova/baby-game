'use strict';
// canvas
const canvas = document.querySelector('#canvas1');
const ctx = canvas.getContext('2d');
const repeat = document.querySelector('#gameOver');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// characteristics
let score = 0;
let gameFrame = 0;
let lives = 5;
let allTotal = localStorage.getItem('allTotal');
allTotal = parseInt(allTotal);

if (isNaN(allTotal)) {
  allTotal = 0;
}

const allTotalEl = document.getElementById('allTotal');
allTotalEl.value = allTotal;

const fontSize = 30;
ctx.font = `${fontSize}px arial`;

// sound for the game
//burst bubbles
const bulMusic = document.getElementById('musicSoundBul');
//game over
const gameOverMusic = document.getElementById('musicGameover');

// coordinates and mouse control
const canvasPosition = canvas.getBoundingClientRect();
const mouse = {
  x: canvas.width / 2,
  y: canvas.height / 2
};

canvas.addEventListener('mousemove', (event) => {
  mouse.x = event.x - canvasPosition.left;
  mouse.y = event.y - canvasPosition.top;
});

// create the main character
const imgPlayer = new Image();
imgPlayer.src = './img/baby.png';

class Player {
  constructor() {
    this.x = canvas.width;
    this.y = canvas.height / 2;
    this.radius = 70;
    this.imageSize = this.radius * 2;
    this.movementSpeed = 15;
  }

  update() {
    const dx = this.x - mouse.x;
    const dy = this.y - mouse.y;

    if (mouse.x !== this.x) {
      this.x -= dx / this.movementSpeed;
    }

    if (mouse.y !== this.y) {
      this.y -= dy / this.movementSpeed;
    }
  }

  draw() {
    ctx.drawImage(imgPlayer, this.x - this.radius, this.y - this.radius, this.imageSize, this.imageSize);
  }
}

const player = new Player();

/* create bubbles for which
the protagonist will receive points*/
let bulArray = [];

const imgBul = new Image();
imgBul.src = './img/bul.png';

class Bul {
  constructor() {
    this.radius = 50;
    this.imageSize = this.radius * 2;

    this.x = Math.random() * canvas.width;
    this.y = canvas.height + this.radius * 2;

    this.speed = Math.random() * 6 + 1;
    this.distance = Number.MAX_SAFE_INTEGER;
  }

  update() {
    this.y -= this.speed;
    const dx = this.x - player.x;
    const dy = this.y - player.y;
    this.distance = Math.sqrt(dx * dx + dy * dy);
  }

  draw() {
    ctx.drawImage(imgBul, this.x - this.radius, this.y - this.radius, this.imageSize, this.imageSize);
  }
}

/* the frequency of bubbles on the screen
and the condition of disappearance*/
function handleBul() {
  if (gameFrame % 50 === 0) {
    bulArray.push(new Bul());
  }

  for (let i = 0; i < bulArray.length; i++) {
    if (bulArray[i].y < 0) {
      lives--;
      bulArray.splice(i, 1);
    }

    bulArray[i].update();
    bulArray[i].draw();

    if (bulArray[i].distance < bulArray[i].radius + player.radius) {
      bulMusic.play();
      score++;
      bulArray.splice(i, 1);
    }
  }
}

// creating a dangerous cat
const dangerousCatImage = new Image();
dangerousCatImage.src = './img/danger.png';

class DangerousCat {
  constructor() {
    this.x = 0;
    this.y = Math.random() * canvas.height;
    this.radius = 100;
    this.imageSize = this.radius * 2;
    this.speed = Math.random() * 2 + 2;
  }

  draw() {
    ctx.drawImage(dangerousCatImage, this.x - this.radius, this.y - this.radius, this.imageSize, this.imageSize);
  }

  update() {
    this.x += this.speed;

    // If the cat was pushed to the edge
    if (this.x > canvas.width + this.imageSize) {
      this.x = 0;
      this.y = Math.random() * canvas.height;
      this.speed = Math.random() * 2 + 3;
    }
  
    const dx = this.x - player.x;
    const dy = this.y - player.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    const minimalDistance = (this.radius + player.radius) * 0.8;

    if (distance < minimalDistance) {
      lives = 0;
    }
  }
}

const dangerousCat = new DangerousCat();

function handleDangerousCat() {
  dangerousCat.update();
  dangerousCat.draw();
}

// inscription on canvas
function writeInCtx() {
  // ctx.fillStyle = 'black';
  const positionOffset = fontSize * 1.5;

  ctx.fillText(`score: ${score}`, positionOffset, positionOffset);
  ctx.fillText(`love: ${lives}♥ `, positionOffset, positionOffset * 2);
}

function gameOver() {
  gameOverMusic.play();

  allTotal += Math.floor(score / 10);
  localStorage.setItem('allTotal', JSON.stringify(allTotal));
  allTotalEl.value = allTotal;
  bulArray = [];

  repeat.style.visibility = 'visible';
}

// animation
function animation() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  repeat.style.visibility = 'hidden';

  handleBul();
  
  if (score >= 15) { 
    handleDangerousCat();
  }

  player.update();
  player.draw();
  writeInCtx();

  if (lives <= 0) {
    gameOver();
    return;
  }

  gameFrame++;
  window.requestAnimationFrame(animation);
}

window.requestAnimationFrame(animation);

repeat.addEventListener('click', () => {
  location.reload();
});
