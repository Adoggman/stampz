//#region Fonts/Symbols
const fonts = {
    // Fonts
    emojiFont: "20px Arial",
    stampFont: "64px Garamond",
    clearButtonFont: "24px Arial"
  }

// Symbols
const symbols = {
    symbolOne: "😎", // Smiley
    symbolTwo: "🍀", // Lightning
    symbolThree: "💧", // Pawprints
    symbolFour: "❤️" // Star
  }
//#endregion Fonts/Symbols

//#region variables
let canvas: HTMLCanvasElement;
let context: CanvasRenderingContext2D;

let inked: boolean;
let inkAlpha: number = 1;
let currentStamp: string = "";
//#endregion variables

let debug = false;

//#region utility
function concat(s1: string, s2: string, s3: string): string {
  return `${s1}${s2}${s3}`;
}
//#endregion utility

//#region DOM
function getCanvas(): HTMLCanvasElement {
  return document.getElementById('canvas') as
    HTMLCanvasElement;
}
//#endregion DOM

//#region listeners
function addListeners(canvas: HTMLCanvasElement): void {
  canvas.addEventListener("click", canvasClicked);
  window.addEventListener("keydown", keyPressed);
}

//#endregion

//#region context prep

function prepareContext(): void {
  context.font = fonts.emojiFont;
  context.textAlign = "center";

  context.lineCap = 'round';
  context.lineJoin = 'round';
  context.strokeStyle = 'black';
  context.lineWidth = 1;

  context.fillStyle = 'black';
}

//#endregion context prep

//#region stamp

interface stamp {
  front: string;
  back: string;
}

function newStamp(front1: string, front2: string, front3: string, back: string): stamp {
  return {
    front: concat(front1, front2, front3),
    back: back
  };
}

//#endregion

//#region stamp set

const stamps: stamp[] = [
  newStamp(symbols.symbolThree, symbols.symbolThree, symbols.symbolThree,"f"),
  newStamp(symbols.symbolThree, symbols.symbolFour, symbols.symbolThree,"?"),
  newStamp(symbols.symbolThree, symbols.symbolTwo, symbols.symbolThree,"y"),
  newStamp(symbols.symbolThree, symbols.symbolOne, symbols.symbolThree,"c"),

  newStamp(symbols.symbolThree, symbols.symbolThree, symbols.symbolOne,"q"),
  newStamp(symbols.symbolThree, symbols.symbolFour, symbols.symbolOne,"u"),
  newStamp(symbols.symbolThree, symbols.symbolTwo, symbols.symbolOne,"!"),
  newStamp(symbols.symbolThree, symbols.symbolOne, symbols.symbolOne,"w"),

  newStamp(symbols.symbolFour, symbols.symbolThree, symbols.symbolFour,"l"),
  newStamp(symbols.symbolFour, symbols.symbolFour, symbols.symbolFour,"p"),
  newStamp(symbols.symbolFour, symbols.symbolTwo, symbols.symbolFour,"h"),
  newStamp(symbols.symbolFour, symbols.symbolOne, symbols.symbolFour,"r"),

  newStamp(symbols.symbolTwo, symbols.symbolThree, symbols.symbolThree,"i"),
  newStamp(symbols.symbolTwo, symbols.symbolFour, symbols.symbolThree,"x"),
  newStamp(symbols.symbolTwo, symbols.symbolTwo, symbols.symbolThree,"n"),
  newStamp(symbols.symbolTwo, symbols.symbolOne, symbols.symbolThree,"s"),

  newStamp(symbols.symbolTwo, symbols.symbolThree, symbols.symbolOne,"m"),
  newStamp(symbols.symbolTwo, symbols.symbolFour, symbols.symbolOne,"t"),
  newStamp(symbols.symbolTwo, symbols.symbolTwo, symbols.symbolOne,"k"),
  newStamp(symbols.symbolTwo, symbols.symbolOne, symbols.symbolOne,"z"),

  newStamp(symbols.symbolOne, symbols.symbolThree, symbols.symbolFour,"v"),
  newStamp(symbols.symbolOne, symbols.symbolFour, symbols.symbolFour,"a"),
  newStamp(symbols.symbolOne, symbols.symbolTwo, symbols.symbolFour,"d"),
  newStamp(symbols.symbolOne, symbols.symbolOne, symbols.symbolFour,"g"),

  newStamp(symbols.symbolOne, symbols.symbolThree, symbols.symbolTwo,"j"),
  newStamp(symbols.symbolOne, symbols.symbolFour, symbols.symbolTwo,"b"),
  newStamp(symbols.symbolOne, symbols.symbolTwo, symbols.symbolTwo,"e"),
  newStamp(symbols.symbolOne, symbols.symbolOne, symbols.symbolTwo,"o"),
];

const encodingHash: Map<string,string> = new Map<string, string>();
function populateEncodingHash(): void {
  for (let i = 0; i < stamps.length; i++) {
    const stamp: stamp = stamps[i];
    encodingHash.set(stamp.back, stamp.front);
  }
}
populateEncodingHash();


let stampSize = {width: 100, height: 60};
const numColumns = 4;
let stampsGrid: string[][] = [];
let stampSetXOffset: number;

function drawStampSet(): void {
  stampSetXOffset = context.canvas.width - (numColumns * stampSize.width);

  for (let i = 0; i < stamps.length; i++) {
    const col = (i % numColumns);
    const x = col * stampSize.width + stampSetXOffset;
    const row = Math.floor(i/numColumns);
    const y = row * stampSize.height;
    context.strokeRect(x, y, stampSize.width, stampSize.height);

    const stamp = stamps[i];
    if (!stampsGrid[col]) {
      stampsGrid[col] = [];
    }
    stampsGrid[col][row] = stamp.back.toUpperCase();
    context.fillText(`${stamp.front}${debug ? stamp.back : ""}`, x + (stampSize.width / 2), y + (stampSize.height * 0.6), stampSize.width - 10);
  }

  const inkpadY = stampSize.height * stampsGrid[0].length
  context.fillRect(stampSetXOffset, inkpadY, context.canvas.width - stampSetXOffset, context.canvas.height - inkpadY);
}

//#endregion stamp set

//#region clear button
const clearButtonSize = {width: 100, height: 50};

function drawClearButton(): void {
  context.font = fonts.clearButtonFont;
  context.strokeRect(0, 0, clearButtonSize.width, clearButtonSize.height);
  context.fillText("clear", clearButtonSize.width / 2, clearButtonSize.height * 0.7, 100);
}

function clearPad(): void {
  inked = false;
  context.globalAlpha = 1;
  inkAlpha = 1;
  context.clearRect(0,0, stampSetXOffset-1, canvas.clientHeight);
  drawClearButton();
}
//#endregion clear button

//#region event handling
function keyPressed(event: KeyboardEvent): void {
  if (event.key === "d") {
    debug = !debug;
    clearAll();
    drawAll();
  } else if (event.keyCode === 8) {
    clearPad();
  } else if (event.key === "e") {
    const message = prompt("Enter a message to encode");
    const encodedMessage = encode(message);
    drawEncodedMessage(encodedMessage);
    alert(window.location.hostname + window.location.pathname + "?word=" + atob(message));
  }

}

function canvasClicked(event: MouseEvent): void {
  const x = event.clientX;
  const y = event.clientY;

  if (x > stampSetXOffset) {
    const localX = x - stampSetXOffset;
    const col = Math.floor(localX / stampSize.width);
    const row = Math.floor(y / stampSize.height);

    if (row < stampsGrid[col].length) {
      currentStamp = stampsGrid[col][row];
      inked = false;
      inkAlpha = 0;
      context.globalAlpha = inkAlpha;
    } else {
      inked = true;
      inkAlpha = 1;
      context.globalAlpha = inkAlpha;
    }
  }
  else
  {
    if (x < clearButtonSize.width && y < clearButtonSize.height) {
      console.log("clear");
      clearPad();
    }
    else {

      if (currentStamp === "") {
        // No stamp
        if (debug) alert("u need a stamp");
      } else if (!inked || inkAlpha < .02) {
        // No ink
        if (debug) alert("u need ink");
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
function clearAll(): void {
  context.clearRect(0,0, canvas.clientWidth, canvas.clientHeight);
}

function drawAll(): void {
  prepareContext();
  drawStampSet();
  drawClearButton();
}

function drawEncodedMessage(messages: string[]): void {
  clearPad();
  let currentX = 150;
  for (let i = 0; i < messages.length; i++) {

    // Handle characters that were not encoded
    if (!messages[i]) {
      continue;
    }

    context.fillText(messages[i], currentX, 200, 90);
    context.strokeRect(currentX-50,170,100,50);
    context.strokeRect(currentX-50,220,100,100);
    currentX = currentX + 100;
  }
}
//#endregion

function encode(message: string): string[] {
  let encodedMessage: string[] = [];

  for (let i = 0; i < message.length; i++) {
    const letter = message.charAt(i);
    encodedMessage[i] = encodingHash.get(letter);
  }

  return encodedMessage;
}

function main(): void {
  canvas = getCanvas();
  addListeners(canvas);

  context = canvas.getContext("2d");
  drawAll();

  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.has("word")) {
    const encodedWord = urlParams.get("word");
    const word = atob(encodedWord);
    if (word) {
      const encodedMessage = encode(word);
      drawEncodedMessage(encodedMessage);
    }
  }
}

main();
