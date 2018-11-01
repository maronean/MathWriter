let TIME_TO_SEND = 1500;
let canvas;
let ctx;
let flag = false;
let prevX = 0, currX = 0, prevY = 0, currY = 0;

let strokex = [];
let strokey = [];
let previousCell;
let sendTimer;

let cellHistory = [];
let cellMap = {};

/**
 * Initializes html canvas and registers event listeners.
 */
function init() {
    canvas = document.getElementById('can');
    ctx = canvas.getContext('2d');
    canvas.width = document.body.clientWidth;
    canvas.height = document.body.clientHeight;
    w = canvas.width;
    h = canvas.height;

    addCanvasListeners(canvas);

    // Prevent scrolling when touching the canvas
    document.body.addEventListener('touchstart', function (evt) {
        if (evt.target == canvas) {
            evt.preventDefault();
        }
    }, false);
    document.body.addEventListener('touchend', function (evt) {
        if (evt.target == canvas) {
            evt.preventDefault();
        }
    }, false);
    document.body.addEventListener('touchmove', function (evt) {
        if (evt.target == canvas) {
            evt.preventDefault();
        }
    }, false);
    drawGrid();
}


/**
 * Begins recording pen stroke.
 * Sets flag to false to show that new data in being added.
 * @param evt
 */
function processPennDown(evt) {
    strokex = [];
    strokey = [];
    clearTimeout(sendTimer);
    sendTimer = null;
    prevX = currX;
    prevY = currY;
    currX = evt.clientX - canvas.offsetLeft;
    currY = evt.clientY - canvas.offsetTop;
    strokex.push(currX);
    strokey.push(currY);
    flag = true;
}

/**
 * Continues to record pen stroke.
 * @param evt
 */
function processPenMove(evt) {
    if (flag) {
        prevX = currX;
        prevY = currY;
        currX = evt.clientX - canvas.offsetLeft;
        currY = evt.clientY - canvas.offsetTop;
        draw(prevX, prevY, currX, currY);
        strokex.push(currX);
        strokey.push(currY);
    }
}

/**
 * Ends recording of the pen stroke.
 * Determines if the last stroke needs to be sent.
 * @param evt
 */
function processPenUp(evt) {
    if (!flag) { return; }
    flag = false;
    let cellPosition = getCellPosition(strokex, strokey);

    //If the penstroke belongs to the active cell then the active cell is updated
    if (previousCell != null && previousCell.isEqual(cellPosition)) {
        previousCell.updateCoords({'x': strokex, 'y': strokey});
        sendTimer = setTimeout(function() { sendPenStrokes(previousCell) }, TIME_TO_SEND);
    } else {
        let newCell = new CellContent(strokex, strokey, cellPosition);
        storeCell(newCell);
        if (previousCell != null) {
            sendPenStrokes(previousCell);
        }
        previousCell = newCell;
        sendTimer = setTimeout(function() { sendPenStrokes(previousCell) }, TIME_TO_SEND);
    }
}

/**
 * Records the data from the pen stroke as CellContent
 * @param cell
 */
function storeCell(cell) {
    cellHistory.push(cell.cellPosition);
    if (cellMap[cell.cellPosition] == undefined) {
        cellMap[cell.cellPosition] = cell;
    } else {
        cellMap[cell.cellPosition].xCoords.push(cell.xCoords);
        cellMap[cell.cellPosition].yCoords.push(cell.yCoords);
    }
}

/**
 * Removes the most recent record added to cellHistory
 * Rerenders the canvas so it is no longer displayed.
 */
function undo(){
    let removedCoord = cellHistory.pop();
    let removedCell = cellMap[removedCoord];
    if (removedCell.isSet && removedCell.xCoords.length > 0) {
        removedCell.xCoords.pop();
        removedCell.yCoords.pop();
    } else {
        delete cellMap[removedCoord.cellPosition];
    }
    updateCanvas();
}

/**
 * Find the center of a list of xy coordinates
 * @param xCoords and array of x coordinates
 * @param yCoords an array of y coordinates
 *
 * Returns an integer array with x,y elements
 */
function findCenter(xCoords, yCoords) {
    let sumX = 0;
    for (let i = 0; i < xCoords.length; i++) {
        sumX += xCoords[i];
    }
    let sumY = 0;
    for (let i = 0; i < yCoords.length; i++) {
        sumY += yCoords[i];
    }
    return [sumX/xCoords.length, sumY/yCoords.length];
}

/**
 *
 * @param xCoords Array of integers representing x coordinates.
 * @param yCoords Array of integers representing x coordinates.
 * @returns {{x: number, y: number}}
 */
function getCellPosition(xCoords, yCoords) {
    let centerPosition = findCenter(xCoords, yCoords);
    let xCell = centerPosition[0] / CELL_SIZE;
    let yCell = centerPosition[1] / CELL_SIZE;
    return [Math.floor(xCell), Math.floor(yCell)];
}

/**
 * Redraws the contents of the canvas. Based on data in cellHistory.
 */
function updateCanvas() {
    ctx.clearRect(0, 0, w, h);
    drawGrid();
    for (let currentCell of cellHistory) {
        cellMap[currentCell].drawPenStrokes(ctx);
        if (cellMap[currentCell].isSet) {
            cellMap[currentCell].drawNumber(ctx);
        }
    }
    if (strokex.length > 1 && strokey.length > 1){
        ctx.beginPath();
        ctx.moveTo(strokex[0],strokey[0]);
        for (let i = 0; i < strokex; i++) {
            ctx.lineTo(strokex[i],strokey[i]);
            ctx.moveTo(strokex[i],strokey[i]);
        }
        ctx.strokeStyle = STROKE_STYLE;
        ctx.lineWidth = LINE_WIDTH;
        ctx.stroke();
    }
    console.log('canvas update');
    console.log(cellHistory);
    console.log(cellMap);
}

/**
 * Sends request for recognition of provided pen strokes.
 * @param cellToSend - An instance of CellContent
 */
function sendPenStrokes(cellToSend) {
    if(cellToSend.isSet) {
        return;
    }
    let content = previousCell.buildMessage();
    socket.emit('stroke coordinates', content);
}

let socket = io();
socket.on('canvas update', function(msg) {
    let coord = msg.coordinates;
    cellMap[coord].setValueAndClear(msg.value);
    updateCanvas();
});