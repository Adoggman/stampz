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
    symbolTwo: "🍀",
    symbolThree: "💧",
    symbolFour: "❤️" // Star
};
//#endregion Fonts/Symbols
//#region variables
var canvas;
var context;
var inked;
var inkAlpha = 1;
var currentStamp = "";
//#endregion variables
var debug = false;
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
    window.addEventListener("keydown", keyPressed);
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
var encodingHash = new Map();
function populateEncodingHash() {
    for (var i = 0; i < stamps.length; i++) {
        var stamp = stamps[i];
        encodingHash.set(stamp.back, stamp.front);
    }
}
populateEncodingHash();
var stampSize = { width: 100, height: 60 };
var numColumns = 4;
var stampsGrid = [];
var stampSetXOffset;
var stampSetWidth;
function drawStampSet() {
    stampSetWidth = (numColumns * stampSize.width);
    stampSetXOffset = context.canvas.width - stampSetWidth;
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
    context.fillStyle = "white";
    context.fillText("inkpad", stampSetXOffset + (stampSetWidth / 2), inkpadY + 20, stampSetWidth);
    context.fillStyle = "black";
}
//#endregion stamp set
//#region clear button
var clearButtonSize = { width: 100, height: 50 };
function drawClearButton() {
    context.font = fonts.clearButtonFont;
    context.strokeRect(0, 0, clearButtonSize.width, clearButtonSize.height);
    context.fillText("clear", clearButtonSize.width / 2, clearButtonSize.height * 0.7, 100);
}
function clearPad() {
    inked = false;
    context.globalAlpha = 1;
    inkAlpha = 1;
    context.clearRect(0, 0, stampSetXOffset - 1, canvas.clientHeight);
    drawClearButton();
}
//#endregion clear button
//#region event handling
function keyPressed(event) {
    if (event.key === "d") {
        debug = !debug;
        clearAll();
        drawAll();
    }
    else if (event.keyCode === 8) {
        clearPad();
    }
    else if (event.key === "e") {
        var message = prompt("Enter a message to encode");
        var encodedMessage = encode(message);
        drawEncodedMessage(encodedMessage);
        var urlParams = new URLSearchParams(window.location.search);
        urlParams.set("word", encodeURIComponent(btoa(message)));
        var location_1 = window.location;
        location_1.search = urlParams.toString();
    }
}
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
            clearPad();
        }
        else {
            if (currentStamp === "") {
                // No stamp
                if (debug)
                    alert("u need a stamp");
            }
            else if (!inked || inkAlpha < .02) {
                // No ink
                alert("Click the inkpad to use the stamp");
            }
            else {
                // Successfully stamping
                context.font = fonts.stampFont;
                context.fillText(currentStamp, x, y + 20);
                inkAlpha = inkAlpha / 2;
                context.globalAlpha = inkAlpha;
            }
        }
    }
}
//#endregion event handling
//#region drawing and clearing
function clearAll() {
    context.clearRect(0, 0, canvas.clientWidth, canvas.clientHeight);
}
function drawAll() {
    prepareContext();
    drawStampSet();
    drawClearButton();
}
function drawEncodedMessage(messages) {
    clearPad();
    var currentX = 150;
    for (var i = 0; i < messages.length; i++) {
        // Handle characters that were not encoded
        if (!messages[i]) {
            continue;
        }
        context.fillText(messages[i], currentX, 200, 90);
        context.strokeRect(currentX - 50, 170, 100, 50);
        context.strokeRect(currentX - 50, 220, 100, 100);
        currentX = currentX + 100;
    }
}
//#endregion
function encode(message) {
    var encodedMessage = [];
    for (var i = 0; i < message.length; i++) {
        var letter = message.charAt(i);
        encodedMessage[i] = encodingHash.get(letter);
    }
    return encodedMessage;
}
function main() {
    canvas = getCanvas();
    addListeners(canvas);
    context = canvas.getContext("2d");
    drawAll();
    var urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has("word")) {
        var encodedWord = urlParams.get("word");
        console.log(encodedWord);
        console.log(decodeURIComponent(encodedWord));
        var word = atob(decodeURIComponent(encodedWord));
        if (word) {
            var encodedMessage = encode(word);
            drawEncodedMessage(encodedMessage);
        }
    }
}
main();
//# sourceMappingURL=stampz.js.map