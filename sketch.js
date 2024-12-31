let sprites = {
  player1: {
    idle: {
      img: null,
      width: 38.5,
      height: 61,
      frames: 10
    },
    walk: {
      img: null,
      width: 46.5,
      height: 62,
      frames: 10
    },
    jump: {
      img: null,
      width: 91.4,
      height: 70,
      frames: 9
    }
  },
  player2: {
    idle: {
      img: null,
      width: 51.2,
      height: 50,
      frames: 7
    },
    walk: {
      img: null,
      width: 51.2,
      height: 50,
      frames: 7
    },
    jump: {
      img: null,
      width: 79.2,
      height: 47,
      frames: 7
    }
  }
};

let player1, player2;
let backgroundImg;
let keys = {
  a: false,
  d: false,
  w: false,
  left: false,
  right: false,
  up: false
};

let bullets = [];  // 儲存所有子彈

// 添加子彈類別
class Bullet {
  constructor(x, y, direction, isPlayer1, speed = 15) {
    this.x = x;
    this.y = y;
    this.direction = direction;
    this.speed = speed;
    this.width = 30;
    this.height = 15;
    this.isPlayer1 = isPlayer1;
  }

  update() {
    this.x += this.speed * this.direction;
  }

  draw() {
    push();
    if (this.isPlayer1) {
      fill(255, 255, 0);
    } else {
      fill(255, 0, 0);
    }
    noStroke();
    rect(this.x, this.y - this.height/2, this.width, this.height);
    pop();
  }
}

function preload() {
   backgroundImg = loadImage('background/1.png')
  // 載入第一個角色的所有動作圖片
  sprites.player1.idle.img = loadImage('player1/22222.png');
  sprites.player1.walk.img = loadImage('player1/11111.png');
  sprites.player1.jump.img = loadImage('player1/33333.png');
  
  // 載入第二個角色的所有動作圖片
  sprites.player2.idle.img = loadImage('player2/2121.png');
  sprites.player2.walk.img = loadImage('player2/2222.png');
  sprites.player2.jump.img = loadImage('player2/2323.png');
}

function updateAndDrawPlayer(player, playerSprites) {
  let currentSprite = playerSprites[player.action];
  player.currentFrame = (player.currentFrame + 1) % currentSprite.frames;
  
  push();
  translate(player.x, player.y);
  scale(player.facing * player.scale, player.scale);
  
  image(currentSprite.img,
        -currentSprite.width/2, -currentSprite.height/2,
        currentSprite.width, currentSprite.height,
        player.currentFrame * currentSprite.width, 0,
        currentSprite.width, currentSprite.height);
  pop();
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  frameRate(12);
  
  // 在這裡初始化玩家位置
  player1 = {
    x: windowWidth/2 - 300,
    y: windowHeight/2 + 100,
    currentFrame: 0,
    action: 'idle',
    facing: 1,
    scale: 4,
    health: 100
  };
  
  player2 = {
    x: windowWidth/2 + 300,
    y: windowHeight/2 + 100,
    currentFrame: 0,
    action: 'idle',
    facing: -1,
    scale: 4,
    health: 100
  };
}

function drawHealthBar(player, x, y) {
  push();
  // 血條背景
  fill(255, 0, 0);
  rect(x, y, 100, 10);
  // 當前血量
  fill(0, 255, 0);
  rect(x, y, player.health, 10);
  pop();
}

function draw() {
  image(backgroundImg, 0, 0, width, height);
  
  // 處理玩家1的移動
  if (keys.a) {
    player1.action = 'walk';
    player1.facing = -1;
    player1.x -= 10;
  }
  if (keys.d) {
    player1.action = 'walk';
    player1.facing = 1;
    player1.x += 10;
  }
  
  // 處理玩家2的移動
  if (keys.left) {
    player2.action = 'walk';
    player2.facing = -1;
    player2.x -= 10;
  }
  if (keys.right) {
    player2.action = 'walk';
    player2.facing = 1;
    player2.x += 10;
  }
  
  // 更新和繪製所有子彈，添加碰撞檢測
  for (let i = bullets.length - 1; i >= 0; i--) {
    bullets[i].update();
    bullets[i].draw();
    
    // 檢查子彈之間的碰撞
    for (let j = bullets.length - 1; j > i; j--) {
      if (bullets[i] && bullets[j] && 
          bullets[i].isPlayer1 !== bullets[j].isPlayer1 && // 確保是不同玩家的子彈
          checkBulletCollision(bullets[i], bullets[j])) {
        // 移除碰撞的兩顆子彈
        bullets.splice(j, 1);
        bullets.splice(i, 1);
        break;
      }
    }
    
    // 如果子彈已經被移除，跳過後續檢查
    if (!bullets[i]) continue;
    
    // 檢查子彈是否擊中玩家的程式碼...
    if (bullets[i].isPlayer1) {
      if (checkCollision(bullets[i], player2)) {
        player2.health -= 10;
        bullets.splice(i, 1);
        continue;
      }
    } else {
      if (checkCollision(bullets[i], player1)) {
        player1.health -= 10;
        bullets.splice(i, 1);
        continue;
      }
    }
    
    // 移除超出螢幕的子彈
    if (bullets[i] && (bullets[i].x < 0 || bullets[i].x > width)) {
      bullets.splice(i, 1);
    }
  }
  
  updateAndDrawPlayer(player1, sprites.player1);
  updateAndDrawPlayer(player2, sprites.player2);
  
  // 繪製血量條
  drawHealthBar(player1, 50, 30);
  drawHealthBar(player2, width - 150, 30);
  
  // 檢查遊戲結束
  if (player1.health <= 0 || player2.health <= 0) {
    textSize(64);
    textAlign(CENTER, CENTER);
    fill(255);
    text(player1.health <= 0 ? "Player 2 Wins!" : "Player 1 Wins!", width/2, height/2);
    noLoop();  // 停止遊戲
  }
}

function keyPressed() {
  // 玩家1的控制 (WASD)
  switch(key.toLowerCase()) {
    case 'a': keys.a = true; break;
    case 'd': keys.d = true; break;
    case 'w': 
      keys.w = true;
      player1.action = 'jump';
      break;
  }
  
  // 玩家2的控制 (方向鍵)
  switch(keyCode) {
    case LEFT_ARROW: keys.left = true; break;
    case RIGHT_ARROW: keys.right = true; break;
    case UP_ARROW:
      keys.up = true;
      player2.action = 'jump';
      break;
  }
  
  // 射擊控制
  if (key === ' ') {  // 空白鍵射擊 - 玩家1
    bullets.push(new Bullet(
      player1.x + (50 * player1.facing),
      player1.y,
      player1.facing,
      true
    ));
  }
  if (keyCode === ENTER) {  // Enter鍵射擊 - 玩家2
    bullets.push(new Bullet(
      player2.x + (50 * player2.facing),
      player2.y,
      player2.facing,
      false
    ));
  }
}

function keyReleased() {
  switch(key.toLowerCase()) {
    case 'a': keys.a = false; break;
    case 'd': keys.d = false; break;
    case 'w': keys.w = false; break;
  }
  
  switch(keyCode) {
    case LEFT_ARROW: keys.left = false; break;
    case RIGHT_ARROW: keys.right = false; break;
    case UP_ARROW: keys.up = false; break;
  }
  
  // 如果沒有按著移動鍵，回到閒置狀態
  if (!keys.a && !keys.d) {
    player1.action = 'idle';
  }
  if (!keys.left && !keys.right) {
    player2.action = 'idle';
  }
}

// 添加碰撞檢測函數
function checkCollision(bullet, player) {
  // 簡單的矩形碰撞檢測
  let playerWidth = 50;  // 調整碰撞箱大小
  let playerHeight = 80;
  
  return bullet.x < player.x + playerWidth/2 &&
         bullet.x + bullet.width > player.x - playerWidth/2 &&
         bullet.y < player.y + playerHeight/2 &&
         bullet.y + bullet.height > player.y - playerHeight/2;
}

// 添加子彈碰撞檢測函數
function checkBulletCollision(bullet1, bullet2) {
  return bullet1.x < bullet2.x + bullet2.width &&
         bullet1.x + bullet1.width > bullet2.x &&
         bullet1.y < bullet2.y + bullet2.height &&
         bullet1.y + bullet1.height > bullet2.y;
}

