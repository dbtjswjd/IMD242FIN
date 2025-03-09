// server.js
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// 정적 파일 제공
app.use(express.static('public'));

// 소켓 연결
io.on('connection', (socket) => {
  console.log('A user connected');

  // 클라이언트에서 'value' 이벤트 받기
  socket.on('value', (data) => {
    console.log('Received value:', data);
    // 클라이언트에 배경 색상 변경 이벤트 전송
    io.emit(
      'background',
      'rgb(' +
        Math.random() * 255 +
        ',' +
        Math.random() * 255 +
        ',' +
        Math.random() * 255 +
        ')'
    );
  });

  // 클라이언트 연결 종료 시
  socket.on('disconnect', () => {
    console.log('User disconnected');
  });
});

// 서버 실행
server.listen(3000, () => {
  console.log('Server is running on http://localhost:3000');
});
