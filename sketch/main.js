// 종횡비를 고정하고 싶을 경우: 아래 두 변수를 0이 아닌 원하는 종, 횡 비율값으로 설정.
// 종횡비를 고정하고 싶지 않을 경우: 아래 두 변수 중 어느 하나라도 0으로 설정.
const aspectW = 4;
const aspectH = 3;
// html에서 클래스명이 container-canvas인 첫 엘리먼트: 컨테이너 가져오기.
const container = document.body.querySelector('.container-canvas');
// 필요에 따라 이하에 변수 생성.

let faceMesh;
let video;

let alpha = 255;
let isFading = false; //여기까지는 문제없음
let isWaiting = false;

let faces = [];
let options = { maxFaces: 2, refineLandmarks: false, flipped: true };
let mosaicSize = 15; // 모자이크 사이즈 크기

function preload() {
  // Load the faceMesh model
  faceMesh = ml5.faceMesh(options);
}

// function gotFaces(results) {
//   faces = results;
// }

function setup() {
  // 컨테이너의 현재 위치, 크기 등의 정보 가져와서 객체구조분해할당을 통해 너비, 높이 정보를 변수로 추출.
  const { width: containerW, height: containerH } =
    container.getBoundingClientRect();
  // 종횡비가 설정되지 않은 경우:
  // 컨테이너의 크기와 일치하도록 캔버스를 생성하고, 컨테이너의 자녀로 설정.
  if (aspectW === 0 || aspectH === 0) {
    createCanvas(containerW, containerH).parent(container);
  }
  // 컨테이너의 가로 비율이 설정한 종횡비의 가로 비율보다 클 경우:
  // 컨테이너의 세로길이에 맞춰 종횡비대로 캔버스를 생성하고, 컨테이너의 자녀로 설정.
  else if (containerW / containerH > aspectW / aspectH) {
    createCanvas((containerH * aspectW) / aspectH, containerH).parent(
      container
    );
  }
  // 컨테이너의 가로 비율이 설정한 종횡비의 가로 비율보다 작거나 같을 경우:
  // 컨테이너의 가로길이에 맞춰 종횡비대로 캔버스를 생성하고, 컨테이너의 자녀로 설정.
  else {
    createCanvas(containerW, (containerW * aspectH) / aspectW).parent(
      container
    );
  }
  init();
  // createCanvas를 제외한 나머지 구문을 여기 혹은 init()에 작성.

  video = createCapture(VIDEO, { flipped: true });
  video.size(width, height);
  // faceMesh.detectStart(video);//얼굴 감지시작을 알림
  video.hide();
  // noLoop();
}

// windowResized()에서 setup()에 준하는 구문을 실행해야할 경우를 대비해 init이라는 명칭의 함수를 만들어 둠.
function init() {}

function draw() {
  if (isFading) {
    fadeAndShakeMosaic();
  } else {
    drawMosaic();
  }

  // background(220); //백그라운드 생성안하면 비디오 안나옴.. 바보..
  // image(video, 0, 0, width, height);
}

function drawMosaic() {
  background(0);

  video.loadPixels();

  for (let y = 0; y < video.height; y += mosaicSize) {
    for (let x = 0; x < video.width; x += mosaicSize) {
      let index = (x + y * video.width) * 4;
      let r = video.pixels[index];
      let g = video.pixels[index + 1];
      let b = video.pixels[index + 2];

      // fill(r, g, b);
      let brightness = (r + g + b) / 1.5;
      fill(brightness, alpha);
      noStroke();
      rect(
        x * (width / video.width),
        y * (height / video.height),
        mosaicSize * (width / video.width),
        mosaicSize * (height / video.height)
      );
    }
  }
}

function fadeAndShakeMosaic() {
  background(0);
  video.loadPixels();

  // if (isWaiting) {
  //   return;
  // }
  // if (isFading) {
  //   fadeAndShakeMosaic();
  // } else {
  //   drawMosaic();
  // }

  for (let y = 0; y < video.height; y += mosaicSize) {
    for (let x = 0; x < video.width; x += mosaicSize) {
      let index = (x + y * video.width) * 4;
      let r = video.pixels[index];
      let g = video.pixels[index + 1];
      let b = video.pixels[index + 2];
      let brightness = (r + g + b) / 1.5;

      //   let randomShakeX = radom(-50, 50);
      //   let randomShakeY = random(-50, 50);
      //   fill(brightness, alpha);
      //   noStroke();
      //   rect(
      //     x * (width / video.width) + randomShakeX,
      //     y * (height / video.height) + randomShakeY,
      //     mosaicSize * (width / video.width),
      //     mosaicSize * (height / video.height)
      //   );
      // }
      // let randomShakeIntensity = map(alpha, 0, 255, 80, 20);
      let randomShakeIntensity = map(alpha, 0, 255, 100, 20);

      let angle = random(TWO_PI);
      let distance = random(0, randomShakeIntensity);
      let randomShakeX = cos(angle) * distance;
      let randomShakeY = sin(angle) * distance;

      fill(brightness, alpha);
      noStroke();
      rect(
        x * (width / video.width) + randomShakeX,
        y * (height / video.height) + randomShakeY,
        mosaicSize * (width / video.width),
        mosaicSize * (height / video.height)
      );
    }
  }

  alpha -= 10;
  if (alpha <= 0) {
    alpha = 0;
    isFading = false;
    isWaiting = true;

    setTimeout(() => {
      isWaiting = false;
      alpha = 255;
      loop();
    }, 2000);
  }
}

function mousePressed() {
  if (!isFading && !isWaiting) {
    isFading = true;
    alpha = 255;
  }
}

function windowResized() {
  // 컨테이너의 현재 위치, 크기 등의 정보 가져와서 객체구조분해할당을 통해 너비, 높이 정보를 변수로 추출.
  const { width: containerW, height: containerH } =
    container.getBoundingClientRect();
  // 종횡비가 설정되지 않은 경우:
  // 컨테이너의 크기와 일치하도록 캔버스 크기를 조정.
  if (aspectW === 0 || aspectH === 0) {
    resizeCanvas(containerW, containerH);
  }
  // 컨테이너의 가로 비율이 설정한 종횡비의 가로 비율보다 클 경우:
  // 컨테이너의 세로길이에 맞춰 종횡비대로 캔버스 크기를 조정.
  else if (containerW / containerH > aspectW / aspectH) {
    resizeCanvas((containerH * aspectW) / aspectH, containerH);
  }
  // 컨테이너의 가로 비율이 설정한 종횡비의 가로 비율보다 작거나 같을 경우:
  // 컨테이너의 가로길이에 맞춰 종횡비대로 캔버스 크기를 조정.
  else {
    resizeCanvas(containerW, (containerW * aspectH) / aspectW);
  }
  // 위 과정을 통해 캔버스 크기가 조정된 경우, 다시 처음부터 그려야할 수도 있다.
  // 이런 경우 setup()의 일부 구문을 init()에 작성해서 여기서 실행하는게 편리하다.
  // init();
}
