const canvas = document.getElementById("myCanvas");
// 因為貪吃蛇遊戲是2d所以在()內要寫2d
// getContext() method會回傳一個canvas的drawing context
// drawing context可以用來在canvas內畫圖
const ctx = canvas.getContext("2d");
// 設定單位用來畫蛇
const unit = 20;
const row = canvas.height / unit; // 320 / 20 = 16
const column = canvas.width / unit; // 320 / 20 = 16

// array中的每個元素都是一個物件
let snake = [];
function createSnake() {
  // 物件的工作是儲存身體的x,y座標
  snake[0] = {
    x: 80,
    y: 0,
  };

  snake[1] = {
    x: 60,
    y: 0,
  };

  snake[2] = {
    x: 40,
    y: 0,
  };

  snake[3] = {
    x: 20,
    y: 0,
  };
}

class Fruit {
  constructor() {
    // 隨機數 * column(目前是16，因為 畫布 320 / unit 20 ) 再捨去可以得到0~15之間的數字，再乘上unit
    this.x = Math.floor(Math.random() * column) * unit;
    this.y = Math.floor(Math.random() * row) * unit;
  }
  drawFruit() {
    ctx.fillStyle = "yellow";
    ctx.fillRect(this.x, this.y, unit, unit);
  }

  pickALocation() {
    let overLapping = false;
    let new_x, new_y;

    // 檢查果實位置跟蛇的身體是否有重疊
    function checkOverLap(new_x, new_y) {
      snake.forEach((v) => {
        if (v.x === new_x && v.y === new_y) {
          overLapping = true;
          return;
        } else {
          overLapping = false;
        }
      });
    }

    // 當果實跟蛇的身體重疊時，果實需要重新選一個位置
    do {
      new_x = Math.floor(Math.random() * column) * unit;
      new_y = Math.floor(Math.random() * row) * unit;
      checkOverLap(new_x, new_y);
    } while (overLapping);

    // 改變果實x跟y的位置
    this.x = new_x;
    this.y = new_y;
  }
}

// 初始設定
createSnake();
// 製作果實
let myFruit = new Fruit();
window.addEventListener("keydown", changeDirection);
// 捕捉鍵盤事件
// 預設蛇往右邊移動
let d = "Right";
function changeDirection(e) {
  if (e.key === "ArrowLeft" && d != "Right") {
    d = "Left";
  } else if (e.key === "ArrowRight" && d != "Left") {
    d = "Right";
  } else if (e.key === "ArrowUp" && d != "Down") {
    d = "Up";
  } else if (e.key === "ArrowDown" && d != "Up") {
    d = "Down";
  }

  // 每次按上下左右鍵之後，在下一幀被畫出來之前不接受任何keydown事件
  // 如此一來可以防止連續快速按鍵導致蛇在邏輯上自殺
  window.removeEventListener("keydown", changeDirection);
}
// 要先取得localStorage中是否有最高分數
let highestScore;
loadHighestScore();
// 設定遊戲初始分數
let score = 0;
document.getElementById("myScore").innerHTML = "遊戲分數: " + score;
document.getElementById("myScore2").innerHTML = "最高分數: " + highestScore;

function draw() {
  // 因為forEach的return不會結束整個function，所以需要另外設定遊戲結束
  let gameOver = false;
  // 每次畫圖之前，確認蛇有無咬到自己
  snake.forEach((v, i) => {
    if (i != 0) {
      if (snake[0].x == v.x && snake[0].y == v.y) {
        clearInterval(myGame);
        gameOver = true;
        alert("遊戲結束");
        return;
      }
    }
  });

  if (gameOver) {
    return;
  }

  // 每次執行時都要把背景重新填滿，因為畫布上是會疊加每次畫的東西，如果不重新蓋掉整張畫布，就會看到舊的蛇跟新的蛇同時出現
  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  myFruit.drawFruit();

  // 畫出蛇
  snake.forEach((v, i) => {
    // 讓頭的顏色跟身體有區別
    // 填滿矩形
    if (i == 0) {
      ctx.fillStyle = "lightgreen";
    } else {
      ctx.fillStyle = "lightblue";
    }
    // 設定外框顏色 (後面要用strokeRect製作外框)
    ctx.strokeStyle = "white";

    // 判斷蛇是否超過邊界
    if (v.x >= canvas.width) {
      v.x = 0;
    }
    if (v.y >= canvas.height) {
      v.y = 0;
    }
    if (v.x < 0) {
      v.x = canvas.width - unit;
    }
    if (v.y < 0) {
      v.y = canvas.height - unit;
    }

    // x, y, width, height
    ctx.fillRect(v.x, v.y, unit, unit);
    // 製作外框
    ctx.strokeRect(v.x, v.y, unit, unit);
  });

  // 以目前的d變數方向，來決定蛇的下一幀要放在哪個座標
  let snakeX = snake[0].x;
  let snakeY = snake[0].y;
  if (d == "Left") {
    snakeX -= unit;
  } else if (d == "Up") {
    snakeY -= unit;
  } else if (d == "Right") {
    snakeX += unit;
  } else if (d == "Down") {
    snakeY += unit;
  }

  let newHead = {
    x: snakeX,
    y: snakeY,
  };

  // 確認蛇是否有吃到果實
  if (snake[0].x === myFruit.x && snake[0].y === myFruit.y) {
    // 重新選定一個新的隨機位置
    // 畫出新果實
    myFruit.pickALocation();
    // 更新分數
    score++;
    setHighestScore(score);
    document.getElementById("myScore").innerHTML = "遊戲分數: " + score;
    document.getElementById("myScore2").innerHTML = "最高分數: " + highestScore;
  } else {
    snake.pop();
  }

  snake.unshift(newHead);
  window.addEventListener("keydown", changeDirection);
}

// 設定每0.1秒就讓蛇移動
let myGame = setInterval(draw, 100);
// 載入最高分，從localStorage中取得
function loadHighestScore() {
  if (localStorage.getItem("highestScore") == null) {
    highestScore = 0;
  } else {
    highestScore = Number(localStorage.getItem("highestScore"));
  }
}

// 設定最高分
function setHighestScore(score) {
  if (score > highestScore) {
    localStorage.setItem("highestScore", score);
    highestScore = score;
  }
}
