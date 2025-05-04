const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*', // In production, restrict this
    methods: ['GET', 'POST']
  }
});

io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  socket.on('join', (data) => {
    const room = data.room;
    socket.join(room);
    socket.to(room).emit('joined'); // Notify others in the room
  });

  socket.on('signal', (data) => {
    const room = data.room;
    socket.to(room).emit('signal', data); // Relay signaling data to peers
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

server.listen(5000, () => {
  console.log('Signaling server listening on port 5000');
});
