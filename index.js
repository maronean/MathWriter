var path = require('path');
var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var request = require('request');
var dir = path.join(__dirname, 'public');

var MYSCRIPT_REST_ENDPOINT = 'https://cloud.myscript.com/api/v3.0/recognition/rest/text/doSimpleRecognition.json';
var MYSCRIPT_APPLICATION_KEY = process.env.MYSCRIPT_APPLICATION_KEY;
app.use(express.static(dir));

app.get('/', function(req, res) {
    res.sendFile(__dirname + '/canvastest.html');
});
 
 
io.on('connection', function(socket){
  socket.on('stroke coordinates', function(msg){
      sendMyScriptCoordinates(msg, socket);
  });
});




function parseMyscriptResponse(responseBody) {
    var responseJson = JSON.parse(responseBody);
    return responseJson.result.textSegmentResult.candidates[0].label;
}

function sendMyScriptCoordinates(clientRequest, clientSocket) {
  var payload = {
      applicationKey : MYSCRIPT_APPLICATION_KEY,
      textInput : clientRequest.textInput
  };
  request.post(MYSCRIPT_REST_ENDPOINT, { form : payload}, function(error, response, body) {
    if (error) {
      return console.error('MyScript service responded with error.', error);
    }
    if (response.statusCode == 200) {
        var responseValue = parseMyscriptResponse(body);
        clientSocket.emit('canvas update',{'coordinates':clientRequest.cell,'value':responseValue});
    }
  });
}

var port = process.env.PORT || 3000;
http.listen(port, function(){
    console.log('listening on *:3000');
});