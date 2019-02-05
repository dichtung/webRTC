const path = require('path');
const http = require('http');
const express = require('express');
const socketio = require('socket.io');


const publicPath = path.join(__dirname, 'public');
const port = 4000;

var app = express();
var server = http.Server(app);
var io = socketio(server);

app.use(express.static(publicPath));


var connectionNumber = 0;
var io = socketio(server);

io.on('connection', function(socket) {
  connectionNumber++;
  console.log(`Socket.io server: New user connected. Number of active connections: ${connectionNumber}`);
  console.log(`Socket.io server: Id of a newly connected user is: ${socket.id}`);
  var msg = {
    'brojKon': connectionNumber,
    'idSocket': socket.id
  };

  //reakcija na sending_key_from_init
  socket.on('sending_key_from_init', function(data){
    console.log('Socket.io Server: Primam kljuc od inita i prosledjujem ka sekundarnom Peer-u!');
    console.log('Socket.io Server: Propagiram kljuc od servera ka sekundarnom Peer-u!');
    socket.broadcast.emit('propagate_key_from_init',data);
  });



  if (connectionNumber <= 2) {
    io.emit('connUpd', msg);
    console.log(`Socket.io server: Emitting conUpd event.`);
    console.log(`Socket.io server: ${JSON.stringify(msg,undefined,2)}`);
    socket.on('disconnect', function(socket) {
      connectionNumber--;
      console.log(`Socket.io server: A user dropped connection. Number of active connections: ${connectionNumber}`);
      msg = {
        'brojKon': connectionNumber
      };
      io.emit('connUpd', msg);
    });
  }else{
    //slucaj kada predjemo na 3+ konekcije, bitno je novonakacenom socketu reci da nije pozeljan na serveru!!!
    socket.emit('connRedirect');
    connectionNumber--;
  }

});




server.listen(port, function() {
  console.log(`Server is listening at http://localhost:${port}`);
});
