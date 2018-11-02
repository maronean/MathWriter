let path = require('path');
let express = require('express');
let app = express();
let http = require('http').Server(app);
let io = require('socket.io')(http);
let request = require('request');
let dir = path.join(__dirname, 'public');

let MYSCRIPT_REST_ENDPOINT = 'https://cloud.myscript.com/api/v3.0/recognition/rest/text/doSimpleRecognition.json';
let MYSCRIPT_APPLICATION_KEY = process.env.MYSCRIPT_APPLICATION_KEY;
let CANVAS_UPDATE_MESSAGE = 'canvas update';
let SEND_COORDINATES_MESSAGE = 'stroke coordinates';

app.use(express.static(dir));

app.get('/', function(req, res) {
    res.sendFile(__dirname + '/canvastest.html');
});

io.on('connection', function(socket){
    //Listening for client request to send coordinate data.
    socket.on(SEND_COORDINATES_MESSAGE, function(msg){
      sendMyScriptCoordinates(msg, socket);
    });
});

let port = process.env.PORT || 3000;
http.listen(port, function(){
    console.log('listening on *:3000');
});

/**
 * Parses the JSON response from MyScript to extract the most likely number value match.
 * @param responseBody - json response body.
 * @returns string represening the number identified by Myscript.
 */
function parseMyscriptResponse(responseBody) {
    let responseJson = JSON.parse(responseBody);
    return responseJson.result.textSegmentResult.candidates[0].label;
}

/**
 * Sents a POST request to MyScript with the list of graphical coordinates to be evaluated
 * @param clientRequest - incomplete request sent by client.
 * @param clientSocket - client socket, used to send results to client.
 */
function sendMyScriptCoordinates(clientRequest, clientSocket) {
  let payload = {
      applicationKey : MYSCRIPT_APPLICATION_KEY,
      textInput : clientRequest.textInput
  };
  request.post(MYSCRIPT_REST_ENDPOINT, { form : payload}, function(error, response, body) {
    if (error) {
      return console.error('MyScript service responded with error.', error);
    }
    if (response.statusCode == 200) {
        let responseValue = parseMyscriptResponse(body);
        clientSocket.emit(CANVAS_UPDATE_MESSAGE,{'coordinates':clientRequest.cell,'value':responseValue});
    }
  });
}