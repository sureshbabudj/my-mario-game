import './style.css'

import platformImage from './img/platform.png';
import cloudImage from './img/clouds.jpg';
import playerImage from './img/player.png';
import brickImage from './img/brick.jpg';

const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
canvas.height = 576;
canvas.width = 1024;
const MOVEMENT_SPEED = 5;
const gravity = 1.5;
const keys = {
  left: { pressed: false },
  right: { pressed: false },
  up: { pressed: false },
  down: { pressed: false }
}
const platformWidth = 1842;

let player, platforms, genericObjects, scrollOffset, bricks, maxLimit, game;

function createImageNode(img) {
  const imgNode = new Image();
  imgNode.src = img;
  return imgNode;
}

class Player {
  constructor() {
    this.height = 130 / 2;
    this.width = (864 / 8) / 2;
    this.pos = {
      x: 100,
      y: 100
    }
    this.color = 'red';
    this.velocity = {
      x: 0,
      y: 0
    }
    this.image = createImageNode(playerImage);
    this.frames = 0;
    this.motions = { 'leftIdle': false, 'rightIdle': true, 'leftWalk': false, 'rightWalk': false };
  }
  draw() {
    const frameWidth = 864 / 8;
    if (this.motions.rightWalk) {
      ctx.drawImage(this.image, frameWidth * this.frames, 0, frameWidth, 130, this.pos.x, this.pos.y, this.width, this.height);
    } else if (this.motions.leftWalk) {
      ctx.drawImage(this.image, (frameWidth * 7) - (frameWidth * this.frames), 140, frameWidth, 130, this.pos.x, this.pos.y, this.width, this.height);
    } else if (this.motions.leftIdle) {
      ctx.drawImage(this.image, frameWidth * 7, 140, frameWidth, 130, this.pos.x, this.pos.y, this.width, this.height);
    } else if (this.motions.rightIdle) {
      ctx.drawImage(this.image, 0, 0, frameWidth, 130, this.pos.x, this.pos.y, this.width, this.height);
    }
    this.frames++;
    if (this.frames >= 8) {
      this.frames = 0;
    }
  }

  update() {
    this.draw();
    this.pos.x += this.velocity.x;
    this.pos.y += this.velocity.y;
    this.velocity.y += gravity;
  }
}

class Platform {
  constructor({ x, y, index, gap, image, width, height }) {
    this.index = index;
    this.image = createImageNode(image);
    this.width = width || platformWidth / 2;
    this.height = height || 238 / 2;
    this.gap = gap;
    this.velocity = { x: 0, y: 0 }
    this.pos = { x: x || (this.width * this.index) + this.gap, y: y || canvas.height - this.height };
  }
  draw() {
    ctx.drawImage(this.image, this.pos.x, this.pos.y, this.width, this.height);
  }
}

class GenericObject {
  constructor({ x, y, index, gap },) {
    this.index = index;
    this.image = createImageNode(cloudImage);
    this.width = this.image.width || 820 / 2;
    this.height = this.image.height || 399 / 2;
    this.gap = gap;
    this.velocity = { x: 0, y: 0 }
    this.pos = { x: x || (this.width * this.index) + this.gap, y: 60 };
  }
  draw() {
    ctx.drawImage(this.image, this.pos.x, this.pos.y, this.width, this.height);
  }
}

function clear() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
}

function writeText(text, color, style, x, y) {
  ctx.fillStyle = color;
  ctx.font = style;
  ctx.fillText(text, x, y);
}

function complete() {
  removeEventListener('keydown', keyDownFn);
  removeEventListener('keyup', keyUpFn);
  game = 'off';
  addEventListener('keydown', ({ keyCode }) => {
    if (keyCode === 13) {
      init();
    }
  });
  writeText('Press ENTER to replay', 'red', 'bold 16px Arial', (canvas.width / 2) + 40, canvas.height - 20);
}

function animate() {
  if (game === 'on') {
    requestAnimationFrame(animate);
  }
  clear();
  genericObjects.forEach(genericObject => genericObject.draw());
  platforms.forEach(platform => platform.draw());
  player.update();

  if (keys.left.pressed && player.pos.x >= canvas.width / 10) {
    player.velocity.x = -MOVEMENT_SPEED;
  } else if (keys.right.pressed && player.pos.x <= canvas.width / 2) {
    player.velocity.x = MOVEMENT_SPEED;
  } else {
    player.velocity.x = 0;
    if (keys.left.pressed && scrollOffset > 0) {
      scrollOffset -= MOVEMENT_SPEED;
      platforms.forEach(platform => platform.pos.x += MOVEMENT_SPEED);
      genericObjects.forEach(obj => obj.pos.x += MOVEMENT_SPEED - 2);
    } else if (keys.right.pressed) {
      scrollOffset += MOVEMENT_SPEED;
      platforms.forEach(platform => platform.pos.x -= MOVEMENT_SPEED);
      genericObjects.forEach(obj => obj.pos.x -= 2);
    }
  }
  platforms.forEach(platform => {
    if (
      player.pos.y + player.height <= platform.pos.y &&
      player.pos.y + player.height + player.velocity.y >= platform.pos.y &&
      player.pos.x + player.width >= platform.pos.x &&
      player.pos.x <= platform.pos.x + platform.width
    ) {
      player.velocity.y = 0;
    }
  });

  console.log(scrollOffset);
  if (scrollOffset >= maxLimit) {
    console.log('you win');
    clear();
    writeText('You Win!', 'green', '50px Arial', 100, canvas.height / 2);
    complete();
  }

  if (player.pos.y + player.height >= canvas.height) {
    console.log("you lose");
    clear();
    writeText('You Lose!', 'red', '50px Arial', 100, canvas.height / 2);
    complete();
  }
}

function keyDownFn({ keyCode }) {
  console.log(keyCode);
  switch (keyCode) {
    case 87:
    case 38:
      keys.up.pressed = true;
      player.velocity.y = -30;
      if (player.pos.y < 0) {
        player.velocity.y += 30;
      }
      break;
    case 65:
    case 37:
      keys.left.pressed = true;
      Object.keys(player.motions).forEach(i => i === 'leftWalk' ? player.motions[i] = true : player.motions[i] = false);
      break;
    case 83:
    case 40:
      keys.down.pressed = true;
      break;
    case 68:
    case 39:
      keys.right.pressed = true;
      Object.keys(player.motions).forEach(i => i === 'rightWalk' ? player.motions[i] = true : player.motions[i] = false);
      break;
  }
}

function keyUpFn({ keyCode }) {
  switch (keyCode) {
    case 87:
    case 38:
      keys.up.pressed = false;
      player.velocity.y = 0;
      break;
    case 65:
    case 37:
      keys.left.pressed = false;
      Object.keys(player.motions).forEach(i => i === 'leftIdle' ? player.motions[i] = true : player.motions[i] = false);
      break;
    case 83:
    case 40:
      keys.down.pressed = false;
      break;
    case 68:
    case 39:
      keys.right.pressed = false;
      Object.keys(player.motions).forEach(i => i === 'rightIdle' ? player.motions[i] = true : player.motions[i] = false);
      break;
  }
}



function init() {
  addEventListener('keydown', keyDownFn);
  addEventListener('keyup', keyUpFn);
  game = 'on';
  keys.left.pressed = false;
  keys.right.pressed = false;
  keys.up.pressed = false;
  keys.down.pressed = false;
  scrollOffset = 0;
  platforms = [];
  genericObjects = [];
  bricks = [];
  player = new Player();
  maxLimit = platformWidth * 8;
  for (let i = 0; i < 10; i++) {
    const gap = i * 150;
    maxLimit = maxLimit + gap;
    const platform = new Platform({ index: i, gap, image: platformImage });
    bricks.push(new Platform({ y: 200, index: i, gap: gap + 3000, image: brickImage, width: 326 / 3, height: 100 / 3 }));
    platforms.push(platform);
    genericObjects.push(new GenericObject({ index: i, gap }));
  }
  platforms = [...platforms, ...bricks];
  animate();
}


init();
