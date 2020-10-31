//#region Fonts/Symbols
var fonts = {
    // Fonts
    emojiFont: "20px Arial",
    stampFont: "64px Garamond",
    clearButtonFont: "24px Arial"
};
// Symbols
var symbols = {
    symbolOne: "😎",
    symbolTwo: "⚡",
    symbolThree: "🐾",
    symbolFour: "⭐" // Star
};
//#endregion Fonts/Symbols
//#region variables
var canvas;
var context;
var inked;
var inkAlpha = 1;
var currentStamp = "";
//#endregion variables
var debug = true;
//#region utility
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
    context.font = fonts.emojiFont;
    context.textAlign = "center";
    context.lineCap = 'round';
    context.lineJoin = 'round';
    context.strokeStyle = 'black';
    context.lineWidth = 1;
    context.fillStyle = 'black';
}
function newStamp(front1, front2, front3, back) {
    return {
        front: concat(front1, front2, front3),
        back: back
    };
}
//#endregion
//#region stamp set
var stamps = [
    newStamp(symbols.symbolThree, symbols.symbolThree, symbols.symbolThree, "f"),
    newStamp(symbols.symbolThree, symbols.symbolFour, symbols.symbolThree, "?"),
    newStamp(symbols.symbolThree, symbols.symbolTwo, symbols.symbolThree, "y"),
    newStamp(symbols.symbolThree, symbols.symbolOne, symbols.symbolThree, "c"),
    newStamp(symbols.symbolThree, symbols.symbolThree, symbols.symbolOne, "q"),
    newStamp(symbols.symbolThree, symbols.symbolFour, symbols.symbolOne, "u"),
    newStamp(symbols.symbolThree, symbols.symbolTwo, symbols.symbolOne, "!"),
    newStamp(symbols.symbolThree, symbols.symbolOne, symbols.symbolOne, "w"),
    newStamp(symbols.symbolFour, symbols.symbolThree, symbols.symbolFour, "l"),
    newStamp(symbols.symbolFour, symbols.symbolFour, symbols.symbolFour, "p"),
    newStamp(symbols.symbolFour, symbols.symbolTwo, symbols.symbolFour, "h"),
    newStamp(symbols.symbolFour, symbols.symbolOne, symbols.symbolFour, "r"),
    newStamp(symbols.symbolTwo, symbols.symbolThree, symbols.symbolThree, "i"),
    newStamp(symbols.symbolTwo, symbols.symbolFour, symbols.symbolThree, "x"),
    newStamp(symbols.symbolTwo, symbols.symbolTwo, symbols.symbolThree, "n"),
    newStamp(symbols.symbolTwo, symbols.symbolOne, symbols.symbolThree, "s"),
    newStamp(symbols.symbolTwo, symbols.symbolThree, symbols.symbolOne, "m"),
    newStamp(symbols.symbolTwo, symbols.symbolFour, symbols.symbolOne, "t"),
    newStamp(symbols.symbolTwo, symbols.symbolTwo, symbols.symbolOne, "k"),
    newStamp(symbols.symbolTwo, symbols.symbolOne, symbols.symbolOne, "z"),
    newStamp(symbols.symbolOne, symbols.symbolThree, symbols.symbolFour, "v"),
    newStamp(symbols.symbolOne, symbols.symbolFour, symbols.symbolFour, "a"),
    newStamp(symbols.symbolOne, symbols.symbolTwo, symbols.symbolFour, "d"),
    newStamp(symbols.symbolOne, symbols.symbolOne, symbols.symbolFour, "g"),
    newStamp(symbols.symbolOne, symbols.symbolThree, symbols.symbolTwo, "j"),
    newStamp(symbols.symbolOne, symbols.symbolFour, symbols.symbolTwo, "b"),
    newStamp(symbols.symbolOne, symbols.symbolTwo, symbols.symbolTwo, "e"),
    newStamp(symbols.symbolOne, symbols.symbolOne, symbols.symbolTwo, "o"),
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
    context.font = fonts.clearButtonFont;
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
            if (currentStamp === "") {
                // No stamp
                alert("u need a stamp");
            }
            else if (!inked || inkAlpha < .02) {
                // No ink
                alert("u need ink");
            }
            else {
                // Successfully stamping
                context.font = fonts.stampFont;
                context.fillText(currentStamp, x, y);
                inkAlpha = inkAlpha / 2;
                context.globalAlpha = inkAlpha;
            }
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