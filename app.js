const express = require('express');
const app = express();
const { Server } = require('socket.io');

// 初始化socket.io server实例对象并且监听3000端口
const io = new Server(3000, {
  // 配置跨域
  cors: {
    origin: ['http://localhost:8080']
  }
});

const userList = [];

// 监听客户端连接
io.on('connection', (socket) => {
  console.log("connected")
  // 客户端发送的参数
  const { username } = socket.handshake.query;
  if (!username) return;
  const userinfo = userList.find(item => item.username === username);
  if (userinfo) {
    // 用户信息以及存在，说明是重新登录操作，则替换id
    userinfo.id = socket.id;
  } else {
    userList.push({ username, id: socket.id })
  }

  // console.log('userlist >>>>> ', userList);
  io.emit('online', userList);

  // 监听send事件
  socket.on('send', ({
    fromUsername,
    targetId,
    msg
  }) => {
    // console.log('监听send事件: ', fromUsername, targetId, msg);
    // 一对一聊天的关键代码,服务器找出目标socket id，建立一对一的通话连接
    const targetSocket = io.sockets.sockets.get(targetId);
    console.log('targetSocket: ', io.sockets.sockets.size);
    const toUsername = userList.find(item => item.id === targetId);
    // 发射名为receive的事件
    targetSocket.emit('receive', {
      fromUsername,
      toUsername: toUsername.username,
      msg,
      dateTime: new Date().getTime()
    })
  })
})


// 开启express服务器
app.listen(8000, () => {
  console.log('ok');
})