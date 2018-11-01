let LINE_WIDTH = 2;
let CELL_SIZE = 120;
let STROKE_STYLE = "black";
let CANVAS_FONT = '80px Arial';
let MATH_OPERATION = '+';

function addCanvasListeners(canvas) {
    //Set up listener for mouse events
    canvas.addEventListener("mousemove", function (evt) {
        processPenMove(evt)
    }, false);
    canvas.addEventListener("mousedown", function (evt) {
        processPennDown(evt)
    }, false);
    canvas.addEventListener("mouseup", function (evt) {
        processPenUp(evt)
    }, false);
    canvas.addEventListener("mouseout", function (evt) {
        processPenUp(evt)
    }, false);

    // Set up listener for touch events for mobile, etc
    canvas.addEventListener("touchstart", function (evt) {
        let touch = evt.touches[0];
        let mouseEvent = new MouseEvent("mousedown", {
            clientX: touch.clientX,
            clientY: touch.clientY
        });
        canvas.dispatchEvent(mouseEvent);
    }, false);

    canvas.addEventListener("touchend", function (evt) {
        let mouseEvent = new MouseEvent("mouseup", {});
        canvas.dispatchEvent(mouseEvent);
    }, false);

    canvas.addEventListener("touchmove", function (evt) {
        let touch = evt.touches[0];
        let mouseEvent = new MouseEvent("mousemove", {
            clientX: touch.clientX,
            clientY: touch.clientY
        });
        canvas.dispatchEvent(mouseEvent);
    }, false);
}

/**
 * Draws the grid displayed on the canvas.
 */
function drawGrid() {
    ctx.beginPath();
    ctx.moveTo(0,0);
    // can width
    let bw = canvas.width;
    // Box height
    let bh = canvas.height;
    // Padding
    let p = 0;
    ctx.lineWidth = 1;
    for (let x = 0; x <= bw; x += CELL_SIZE) {
        ctx.moveTo(0.5 + x + p, p);
        ctx.lineTo(0.5 + x + p, bh + p);
    }
    for (let x = 0; x <= bh; x += CELL_SIZE) {
        ctx.moveTo(p, 0.5 + x + p);
        ctx.lineTo(bw + p, 0.5 + x + p);
    }

    ctx.stroke();

    ctx.stroke();
    ctx.beginPath();
    ctx.lineWidth = 4;
    ctx.moveTo(0, 480);
    ctx.lineTo(bw + p, 480);

    ctx.stroke();
    ctx.lineWidth=1;
    ctx.font = CANVAS_FONT;
    ctx.beginPath();
    ctx.fillText(MATH_OPERATION,
        20,((4)*CELL_SIZE) - 20);
    ctx.stroke();
}

/**
 * Draws a linse between 2 sets of coordinates on an html canvas.
 * @param prevX - Integer representing x coordinate 1.
 * @param prevY - Integer representing y coordinate 1.
 * @param currX - Integer representing x coordinate 2.
 * @param currY - Integer representing y coordinate 2.
 */
function draw(prevX, prevY, currX, currY) {
    ctx.beginPath();
    ctx.moveTo(prevX, prevY);
    ctx.lineTo(currX, currY);
    ctx.strokeStyle = STROKE_STYLE;
    ctx.lineWidth = LINE_WIDTH;
    ctx.stroke();
    ctx.closePath();
}

class CellContent {
    constructor(xCoords, yCoords, cellPosition) {
        this.xCoords = [xCoords];
        this.yCoords = [yCoords];
        this.cellPosition = cellPosition;
        this.isSet = false;
        this.cellValue = '';
    }

    isEqual(compareTo) {
        console.log(this.cellPosition);
        console.log(compareTo);
        return this.cellPosition[0] == compareTo[0] && this.cellPosition[1] == compareTo[1];
    }

    updateCoords(newCoords) {
        this.xCoords.push(newCoords['x']);
        this.yCoords.push(newCoords['y']);
    }

    /**
     * Merges an array of arrays
     * @param coords an array of coordinate arrays
     * @returns an array of all coordinate values
     */
    mergeCoords(coords) {
        return [].concat.apply([],coords);
    }

    /**
     * Constructs a JSON formatted string representing the recorded coordinates.
     * @returns {} a JSON formatted string
     */
    buildMessage() {
        let textInput = JSON.stringify({
            'textParameter':
                {'textInputMode':'CURSIVE',
                    'resultDetail':'CHARACTER',
                    'language':'en_US',
                    'contentTypes':['text'],
                    'subsetKnowledges': ['digit']
                },
            'inputUnits':[
                {'textInputType':'CHAR',
                    'components':[
                        {'type':'stroke','x':this.mergeCoords(this.xCoords), 'y':this.mergeCoords(this.yCoords)}
                    ]
                }
            ]
        });
        return {'cell':this.cellPosition,'textInput':textInput};
    }

    /**
     * Redraws the penstrokes stored by this object.
     * @param canvas - reference for the canvas to be drawn on.
     */
    drawPenStrokes(canvas) {
        for (let i = 0; i < this.xCoords.length; i++) {
            canvas.beginPath();
            if (this.xCoords[i].length > 0) {
                canvas.moveTo(this.xCoords[i][0], this.yCoords[i][0]);
            }
            for (let f = 0; f < this.xCoords[i].length; f++) {
                canvas.lineTo(this.xCoords[i][f], this.yCoords[i][f]);
                canvas.moveTo(this.xCoords[i][f], this.yCoords[i][f]);
            }
            canvas.strokeStyle = STROKE_STYLE;
            canvas.lineWidth = LINE_WIDTH;
            canvas.stroke();
        }
    }

    /**
     * Draws the value of this object.
     * @param canvas - reference for the canvas to be drawn on.
     */
    drawNumber(canvas) {
        canvas.font = CANVAS_FONT;
        canvas.beginPath();
        canvas.fillText(this.cellValue,(this.cellPosition[0]*CELL_SIZE) +
            20,((this.cellPosition[1] + 1)*CELL_SIZE) - 20);
    }

    /**
     * Sets the number to be displayed. Clears stored pen strokes.
     * @param val a string representing the number to be displayed on in the cell.
     */
    setValueAndClear(val) {
        this.isSet = true;
        this.xCoords = [];
        this.yCoords = [];
        this.cellValue = val;
    }
}