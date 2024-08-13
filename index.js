const express = require('express');
const { createServer } = require('node:http');
const { Server } = require('socket.io');

const app = express();

const server = app.listen(5000, () => {
  console.log('server running at http://localhost:3000');
});

const io = new Server(server, {
  cors: {
    origin: '*',
  },
});

const userOnline = [{ id: '', user: '' }];
const messageRead = [];

io.on('connection', (socket) => {
  socket.on('sendMessage', (msg) => {
    io.emit('receiveMessage', msg);
  });
  socket.on('online', (userId) => {
    if (
      userOnline.length === 0 ||
      userOnline.findIndex((user) => user.user === userId) === -1
    ) {
      userOnline.push({
        id: socket.id,
        user: userId,
      });
    }
    io.emit('onlineUser', userOnline);
  });
  socket.on('typing', (chat) => {
    io.emit('userTyping', chat);
  });
  socket.on('stopTyping', (chat) => {
    io.emit('stopTypingUser', chat);
  });
  socket.on('lastMessage', (chat, text) => {
    socket.emit('setLastMessage', chat.id, text);
  });

  socket.on('newMessage', (chat) => {
    io.emit('readMessage', chat);
  });

  socket.on('chatChange', (chatid) => {
    io.emit('selectChat', chatid);
  });

  socket.on('disconnect', () => {
    const index = userOnline.findIndex((user) => user.id === socket.id);
    if (index !== -1) {
      userOnline.splice(index, 1);
    }
    io.emit('onlineUser', userOnline);
  });
});

// io.on('connection', (socket) => {
//   socket.on('joinRoom', (msg) => {
//     console.log('message: ', msg);
//     socket.join(msg.room);
//   });

// });

app.get('/', (req, res) => {
  return res.send('hello');
});
// io.on('connection', (socket) => {
//   console.log('a user connected');
//   socket.on('disconnect', () => {
//     console.log('user disconnected');
//   });
// });
