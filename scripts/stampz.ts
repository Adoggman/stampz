
//#region variables
let canvas: HTMLCanvasElement;
let context: CanvasRenderingContext2D;

let inked: boolean;
let inkAlpha: number = 1;
let currentStamp: string = "";
//#endregion variables

const emojiFontSize = "20px";
const clearButtonFontSize = "24px";
const stampFontSize = "64px";
const font = "Garamond";

const debug = true;

//#region symbols

let smiley = "😎";
let lightning = "⚡";
let pawprint = "🐾";
let star = "⭐";

let symbols: string[] = [smiley, lightning, pawprint, star];

//#endregion symbols

//#region utility
// function randomInt(min: number, max: number): number {
//   return Math.floor(Math.random() * (max - min + 1)) + min;
// }

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
}
//#endregion

//#region context prep

function prepareContext(): void {
  context.font = `${emojiFontSize} ${font}`;
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

//#endregion context prep

//#region stamp
interface stamp {
  front: string;
  back: string;
}

function newStamp(s1: string, s2: string, s3: string, back: string): stamp {
  return {
    front: concat(s1, s2, s3),
    back: back
  };
}

//#endregion

//#region stamp set

const stamps: stamp[] = [
  newStamp(pawprint, pawprint, pawprint,"f"),
  newStamp(pawprint, star, pawprint,"?"),
  newStamp(pawprint, lightning, pawprint,"y"),
  newStamp(pawprint, smiley, pawprint,"c"),

  newStamp(pawprint, pawprint, smiley,"q"),
  newStamp(pawprint, star, smiley,"u"),
  newStamp(pawprint, lightning, smiley,"!"),
  newStamp(pawprint, smiley, smiley,"w"),

  newStamp(star, pawprint, star,"l"),
  newStamp(star, star, star,"p"),
  newStamp(star, lightning, star,"h"),
  newStamp(star, smiley, star,"r"),

  newStamp(lightning, pawprint, pawprint,"i"),
  newStamp(lightning, star, pawprint,"x"),
  newStamp(lightning, lightning, pawprint,"n"),
  newStamp(lightning, smiley, pawprint,"s"),

  newStamp(lightning, pawprint, smiley,"m"),
  newStamp(lightning, star, smiley,"t"),
  newStamp(lightning, lightning, smiley,"k"),
  newStamp(lightning, smiley, smiley,"z"),

  newStamp(smiley, pawprint, star,"v"),
  newStamp(smiley, star, star,"a"),
  newStamp(smiley, lightning, star,"d"),
  newStamp(smiley, smiley, star,"g"),

  newStamp(smiley, pawprint, lightning,"j"),
  newStamp(smiley, star, lightning,"b"),
  newStamp(smiley, lightning, lightning,"e"),
  newStamp(smiley, smiley, lightning,"o"),
];

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

  context.font = `${clearButtonFontSize} ${font}`;
  context.strokeRect(0, 0, clearButtonSize.width, clearButtonSize.height);
  context.fillText("clear", clearButtonSize.width / 2, clearButtonSize.height * 0.7, 100);
}

function clear(): void {
  inked = false;
  context.globalAlpha = 1;
  inkAlpha = 1;
  context.clearRect(0,0, stampSetXOffset-1, canvas.clientHeight);
  drawClearButton();
}
//#endregion clear button

//#region click handling
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
      clear();
    }
    else {
      context.font = `${stampFontSize} ${font}`;

      context.fillText(currentStamp, x, y);
      inkAlpha = inkAlpha / 2;
      context.globalAlpha = inkAlpha;
    }

  }

}

//#endregion click handling

function main(): void {

  canvas = getCanvas();
  addListeners(canvas);

  context = canvas.getContext("2d");
  prepareContext();
  drawStampSet();
  drawClearButton();
}

main();
