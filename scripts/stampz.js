//#region variables
var canvas;
var context;
var inked;
var inkAlpha = 1;
var currentStamp = "";
//#endregion variables
var emojiFontSize = "20px";
var clearButtonFontSize = "24px";
var stampFontSize = "64px";
var font = "Garamond";
var debug = true;
//#region symbols
var smiley = "😎";
var lightning = "⚡";
var pawprint = "🐾";
var star = "⭐";
var symbols = [smiley, lightning, pawprint, star];
//#endregion symbols
//#region utility
// function randomInt(min: number, max: number): number {
//   return Math.floor(Math.random() * (max - min + 1)) + min;
// }
function concat(s1, s2, s3) {
    return "" + s1 + s2 + s3;
}
//#endregion utility
//#region DOM
function getCanvas() {
    return document.getElementById('canvas');
}
//#endregion DOM
//#region listeners
function addListeners(canvas) {
    canvas.addEventListener("click", canvasClicked);
}
//#endregion
//#region context prep
function prepareContext() {
    context.font = emojiFontSize + " " + font;
    context.textAlign = "center";
    context.lineCap = 'round';
    context.lineJoin = 'round';
    context.strokeStyle = 'black';
    context.lineWidth = 1;
    context.fillStyle = 'black';
    //  Example line drawing:
    //   context.beginPath();
    //   context.moveTo(200,200);
    //   context.lineTo(500,500);
    //   context.stroke();
    //   context.closePath();
}
function newStamp(s1, s2, s3, back) {
    return {
        front: concat(s1, s2, s3),
        back: back
    };
}
//#endregion
//#region stamp set
var stamps = [
    newStamp(pawprint, pawprint, pawprint, "f"),
    newStamp(pawprint, star, pawprint, "?"),
    newStamp(pawprint, lightning, pawprint, "y"),
    newStamp(pawprint, smiley, pawprint, "c"),
    newStamp(pawprint, pawprint, smiley, "q"),
    newStamp(pawprint, star, smiley, "u"),
    newStamp(pawprint, lightning, smiley, "!"),
    newStamp(pawprint, smiley, smiley, "w"),
    newStamp(star, pawprint, star, "l"),
    newStamp(star, star, star, "p"),
    newStamp(star, lightning, star, "h"),
    newStamp(star, smiley, star, "r"),
    newStamp(lightning, pawprint, pawprint, "i"),
    newStamp(lightning, star, pawprint, "x"),
    newStamp(lightning, lightning, pawprint, "n"),
    newStamp(lightning, smiley, pawprint, "s"),
    newStamp(lightning, pawprint, smiley, "m"),
    newStamp(lightning, star, smiley, "t"),
    newStamp(lightning, lightning, smiley, "k"),
    newStamp(lightning, smiley, smiley, "z"),
    newStamp(smiley, pawprint, star, "v"),
    newStamp(smiley, star, star, "a"),
    newStamp(smiley, lightning, star, "d"),
    newStamp(smiley, smiley, star, "g"),
    newStamp(smiley, pawprint, lightning, "j"),
    newStamp(smiley, star, lightning, "b"),
    newStamp(smiley, lightning, lightning, "e"),
    newStamp(smiley, smiley, lightning, "o"),
];
var stampSize = { width: 100, height: 60 };
var numColumns = 4;
var stampsGrid = [];
var stampSetXOffset;
function drawStampSet() {
    stampSetXOffset = context.canvas.width - (numColumns * stampSize.width);
    for (var i = 0; i < stamps.length; i++) {
        var col = (i % numColumns);
        var x = col * stampSize.width + stampSetXOffset;
        var row = Math.floor(i / numColumns);
        var y = row * stampSize.height;
        context.strokeRect(x, y, stampSize.width, stampSize.height);
        var stamp = stamps[i];
        if (!stampsGrid[col]) {
            stampsGrid[col] = [];
        }
        stampsGrid[col][row] = stamp.back.toUpperCase();
        context.fillText("" + stamp.front + (debug ? stamp.back : ""), x + (stampSize.width / 2), y + (stampSize.height * 0.6), stampSize.width - 10);
    }
    var inkpadY = stampSize.height * stampsGrid[0].length;
    context.fillRect(stampSetXOffset, inkpadY, context.canvas.width - stampSetXOffset, context.canvas.height - inkpadY);
}
//#endregion stamp set
//#region clear button
var clearButtonSize = { width: 100, height: 50 };
function drawClearButton() {
    context.font = clearButtonFontSize + " " + font;
    context.strokeRect(0, 0, clearButtonSize.width, clearButtonSize.height);
    context.fillText("clear", clearButtonSize.width / 2, clearButtonSize.height * 0.7, 100);
}
function clear() {
    inked = false;
    context.globalAlpha = 1;
    inkAlpha = 1;
    context.clearRect(0, 0, stampSetXOffset - 1, canvas.clientHeight);
    drawClearButton();
}
//#endregion clear button
//#region click handling
function canvasClicked(event) {
    var x = event.clientX;
    var y = event.clientY;
    if (x > stampSetXOffset) {
        var localX = x - stampSetXOffset;
        var col = Math.floor(localX / stampSize.width);
        var row = Math.floor(y / stampSize.height);
        if (row < stampsGrid[col].length) {
            currentStamp = stampsGrid[col][row];
            inked = false;
            inkAlpha = 0;
            context.globalAlpha = inkAlpha;
        }
        else {
            inked = true;
            inkAlpha = 1;
            context.globalAlpha = inkAlpha;
        }
    }
    else {
        if (x < clearButtonSize.width && y < clearButtonSize.height) {
            console.log("clear");
            clear();
        }
        else {
            context.font = stampFontSize + " " + font;
            context.fillText(currentStamp, x, y);
            inkAlpha = inkAlpha / 2;
            context.globalAlpha = inkAlpha;
        }
    }
}
//#endregion click handling
function main() {
    canvas = getCanvas();
    addListeners(canvas);
    context = canvas.getContext("2d");
    prepareContext();
    drawStampSet();
    drawClearButton();
}
main();
//# sourceMappingURL=stampz.js.map