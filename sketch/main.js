const aspectW = 4;
const aspectH = 3;
// html에서 클래스명이 container-canvas인 첫 엘리먼트: 컨테이너 가져오기.
const container = document.body.querySelector('.container-canvas');
// 필요에 따라 이하에 변수 생성.

let faceMesh;
let video;
let tiles = []; //날라갈 타일만들기
let videoWidth, videoHeight;

// let alpha = 255;
let isFading = false; //여기까지는 문제없음
let isWaiting = false;

let faces = [];
let options = { maxFaces: 2, refineLandmarks: false, flipped: true };
let mosaicSize = 12; // 모자이크 사이즈 크기

class Tile {
  constructor(x, y, brightness) {
    this.position = createVector(x, y);
    this.velocity = createVector(0, 0);
    this.acceleration = createVector(0, 0);
    this.brightness = brightness;
  }

  applyForce(force) {
    this.acceleration.add(force);
  }

  update() {
    this.velocity.add(this.acceleration);
    this.position.add(this.velocity);
    this.acceleration.mult(0);
  }

  isOffscreen() {
    return (
      this.position.x < -mosaicSize ||
      this.position.x > width + mosaicSize ||
      this.position.y < -mosaicSize ||
      this.position.y > height + mosaicSize
    );
  }

  display(size) {
    fill(this.brightness);
    noStroke();
    rect(this.position.x, this.position.y, size, size);
  }
}

function preload() {
  // Load the faceMesh model
  faceMesh = ml5.faceMesh(options);
}

function setup() {
  const { width: containerW, height: containerH } =
    container.getBoundingClientRect();

  if (aspectW === 0 || aspectH === 0) {
    createCanvas(containerW, containerH).parent(container);
  } else if (containerW / containerH > aspectW / aspectH) {
    createCanvas((containerH * aspectW) / aspectH, containerH).parent(
      container
    );
  } else {
    createCanvas(containerW, (containerW * aspectH) / aspectW).parent(
      container
    );
  }
  init();
  // createCanvas를 제외한 나머지 구문을 여기 혹은 init()에 작성.

  video = createCapture(VIDEO, { flipped: true });
  video.size(containerW, (containerW * aspectH) / aspectW).parent(container);

  video.hide();

  videoWidth = video.width;
  videoHeight = video.height;

  initializeTiles();
}

// windowResized()에서 setup()에 준하는 구문을 실행해야할 경우를 대비해 init이라는 명칭의 함수를 만들어 둠.
function init() {}

function initializeTiles() {
  setTimeout(() => {
    video.loadPixels();
    tiles = [];

    video.loadPixels();
    tiles = [];

    for (let y = 0; y < videoHeight; y += mosaicSize) {
      for (let x = 0; x < videoWidth; x += mosaicSize) {
        let index = (x + y * video.width) * 4;
        let r = video.pixels[index];
        let g = video.pixels[index + 1];
        let b = video.pixels[index + 2];

        let brightness = (r + g + b) / 1.8;
        let tileX = (x / videoWidth) * width;
        let tileY = (y / videoHeight) * height;
        tiles.push(new Tile(tileX, tileY, brightness));
      }
    }
  }, 500);
}

function draw() {
  // if (isFading) {
  //   initiallizeTiles();
  // } else {
  //   drawMosaic();
  // }
  background(0);
  video.loadPixels();

  tiles = tiles.filter((tile) => !tile.isOffscreen());

  tiles.forEach((tile) => {
    let x = floor((tile.position.x / width) * videoWidth);
    let y = floor((tile.position.y / height) * videoHeight);
    let index = (x + y * videoWidth) * 4;

    if (index >= 0 && index < video.pixels.length) {
      let r = video.pixels[index];
      let g = video.pixels[index + 1];
      let b = video.pixels[index + 2];
      tile.brightness = (r + g + b) / 1.8; // 흑백 밝기 계산
    }

    tile.update();
    tile.display(mosaicSize);
  });

  if (tiles.length == 0) {
    initializeTiles();
  }
}

// function drawMosaic() {
//   background(0);

//   video.loadPixels();

//   for (let y = 0; y < video.height; y += mosaicSize) {
//     for (let x = 0; x < video.width; x += mosaicSize) {
//       let index = (x + y * video.width) * 4;
//       let r = video.pixels[index];
//       let g = video.pixels[index + 1];
//       let b = video.pixels[index + 2];

//       // fill(r, g, b);
//       let brightness = (r + g + b) / 1.5;
//       fill(brightness, alpha);
//       noStroke();
//       rect(
//         x * (width / video.width),
//         y * (height / video.height),
//         mosaicSize * (width / video.width),
//         mosaicSize * (height / video.height)
//       );
//     }
//   }
// }

// function fadeAndShakeMosaic() {
//   background(0);
//   video.loadPixels();

//   for (let y = 0; y < video.height; y += mosaicSize) {
//     for (let x = 0; x < video.width; x += mosaicSize) {
//       let index = (x + y * video.width) * 4;
//       let r = video.pixels[index];
//       let g = video.pixels[index + 1];
//       let b = video.pixels[index + 2];
//       let brightness = (r + g + b) / 1.5;

//       //   let randomShakeX = radom(-50, 50);
//       //   let randomShakeY = random(-50, 50);
//       //   fill(brightness, alpha);
//       //   noStroke();
//       //   rect(
//       //     x * (width / video.width) + randomShakeX,
//       //     y * (height / video.height) + randomShakeY,
//       //     mosaicSize * (width / video.width),
//       //     mosaicSize * (height / video.height)
//       //   );
//       // }
//       // let randomShakeIntensity = map(alpha, 0, 255, 80, 20);
//       let randomShakeIntensity = map(alpha, 0, 255, 100, 20);

//       let angle = random(TWO_PI);
//       let distance = random(0, randomShakeIntensity);
//       let randomShakeX = cos(angle) * distance;
//       let randomShakeY = sin(angle) * distance;

//       fill(brightness, alpha);
//       noStroke();
//       rect(
//         x * (width / video.width) + randomShakeX,
//         y * (height / video.height) + randomShakeY,
//         mosaicSize * (width / video.width),
//         mosaicSize * (height / video.height)
//       );
//     }
//   }

//   alpha -= 10;
//   if (alpha <= 0) {
//     alpha = 0;
//     isFading = false;
//     isWaiting = true;

//     setTimeout(() => {
//       isWaiting = false;
//       alpha = 255;
//       loop();
//     }, 2000);
//   }
// }

function mousePressed() {
  // if (!isFading && !isWaiting) {
  //   isFading = true;
  //   alpha = 255;
  // }
  let mouth = createVector(mouseX, mouseY);

  tiles.forEach((tile) => {
    let force = p5.Vector.sub(tile.position, mouth);
    let distance = force.mag();
    force.normalize();

    let magnitude = random(2, 30);
    force.mult(magnitude);

    tile.applyForce(force);
  });
}

function windowResized() {
  const { width: containerW, height: containerH } =
    container.getBoundingClientRect();

  if (aspectW === 0 || aspectH === 0) {
    resizeCanvas(containerW, containerH);
  } else if (containerW / containerH > aspectW / aspectH) {
    resizeCanvas((containerH * aspectW) / aspectH, containerH);
  } else {
    resizeCanvas(containerW, (containerW * aspectH) / aspectW);
  }
}
