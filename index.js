"use strict";

// 前端服务器 + 信令服务器

// part 1  : 前端服务器
var express = require("express");
var fs = require("fs");
var path  = require("path");
var app = express();
var privateKey = fs.readFileSync('./certificate/private.pem','utf8');
var certificate = fs.readFileSync('./certificate/csr.crt','utf8');
var credentials = {key: privateKey, cert: certificate};

var http = require("http").createServer(app);
var https = require("https").createServer(credentials,app);
// var io = require("socket.io")(http);
var io = require("socket.io")(https);


// app.use(express.static(path.join(__dirname, '')));
app.use(express.static(__dirname));

app.get("/", function (request, response) {
  response.sendFile(__dirname + "/index.html");
});

// app.get("/alice", function (request, response) {
//   response.sendFile(__dirname + "/alice.html");
// });

// app.get("/bob", function (request, response) {
//   response.sendFile(__dirname + "/bob.html");
// });

// app.get("/single", function (request, response) {
//   response.sendFile(__dirname + "/single.html");
// });


// app.get("/clientA", function (request, response) {
//   response.sendFile(__dirname + "/test/clientA.html");
// });
// app.get("/clientB", function (request, response) {
//   response.sendFile(__dirname + "/clientB.html");
// });


// part 2  : 信令服务器

io.on("connection", function (socket) {
  console.log("有用户加入进来");

  socket.on("signal", function (message) {
    socket.to("room").emit("signal", message);
  });

  socket.on("ice", function (message) {
    socket.to("room").emit("ice", message);
  });

  socket.on("test", function (message) {
    console.log("test",message)
    socket.to("room").emit("test", message);
  });
  socket.on("create or join", function (room) {
    var clientsInRoom = io.sockets.adapter.rooms[room];
    var numClients = clientsInRoom
      ? Object.keys(clientsInRoom.sockets).length
      : 0;
    console.log(numClients);
    if (numClients === 0) {
      socket.join(room);
      socket.emit("create", room, socket.id);
      console.log("caller joined");
    } else if (numClients === 1) {
      socket.join(room);
      socket.to("room").emit("call");
      console.log("callee joined");
    }
  });
});

var httpServer = http.listen(9007, function () {

  console.log("http listening 9007", );
});

var httpsServer = https.listen(9008,function(){
  console.log("https listening 9008")
})