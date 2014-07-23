var http = require('http');

var express = require('express');
var WebSocketServer = require('ws').Server;

var app = express();
var port = process.env.PORT || 5000;

app.use(express.static(__dirname + '/www'));

var server = http.createServer(app);

server.listen(port);

console.log('http server listening on %d', port);

var wss = new WebSocketServer({server: server});
console.log('websocket server created');

var browserWs = null;
var tesselSocket = null;

function sendBrowser(message) {
  if (browserWs) {
    browserWs.send(JSON.stringify(message));
  }
}

function sendTessel(message) {
  if (tesselSocket) {
    tesselSocket.write(message);
  }
}

wss.on('connection/browser', function(ws) {
  if (browserWs) {
    browserWs.close();
  }
  browserWs = ws;

  console.log('websocket browser connection open');

  ws.on('message', function(data) {
    var message = JSON.parse(data);

    sendTessel(message);
  });

  ws.on('close', function() {
    console.log('websocket browser connection close');
    browserWs = null;

    sendTessel({
      reset: true
    });
  });
});


