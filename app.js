(function(){
const canvas = document.getElementById("main-canvas");
const ctx = canvas.getContext('2d');
const animationPlayerCanvas = document.getElementById("animation-player__canvas");
const ctxPlayer = animationPlayerCanvas.getContext("2d");

// // -----some figure
// ctx.fillStyle = "blue"
// ctx.fillRect(0, 0, 100, 100)
// ctx.beginPath()
// ctx.fillStyle = "green";
// ctx.fillRect(100, 100, 100, 100)
// ctx.beginPath();
// ctx.fillStyle = "gold";
// ctx.fillRect(200, 200, 100, 100)
// ctx.beginPath();
// ctx.fillStyle = "yellow";
// ctx.fillRect(300, 300, 100, 100)


canvas.addEventListener('mousemove', (event) => {
  let x = event.offsetX;
  let y = event.offsetY;
})

// ------------------------------------- color--------------------------------------------------------------
let colorPrimary = "#000";
let colorSecondary = "#000";

function setColorToPrimaryPalette(color) {
  const palette = document.getElementsByClassName("palette__item--primary")[0];
  palette.style.backgroundColor = color;
}

function setColorToSecondaryPalette(color) {
  const palette = document.getElementsByClassName("palette__item--secondary")[0];
  palette.style.backgroundColor = color;
}

function swapColor() {

  let swap = colorPrimary;
  colorPrimary = colorSecondary;
  colorSecondary = swap;
  setColorToPrimaryPalette(colorPrimary);
  setColorToSecondaryPalette(colorSecondary);
}

// ----- palette change color-----------
let inputPrimary = document.getElementById('palette__primary');
let inputSecondary = document.getElementById("palette__secondary");
let colorSwitcher = document.getElementById('swap-color');

colorSwitcher.addEventListener("click", swapColor);

inputPrimary.addEventListener('change', event => {
  colorPrimary = event.target.value;
  setColorToPrimaryPalette(colorPrimary);
})

inputSecondary.addEventListener("change", event => {
  colorSecondary = event.target.value;
  setColorToSecondaryPalette(colorSecondary);
});

// ------color-picker-----
function getColorFromCanvas(event) {
  let x = event.offsetX;
  let y = event.offsetY;
  let imageData = ctx.getImageData(x, y, 1, 1).data;
  let rgbaColor = `rgba(${imageData[0]}, ${imageData[1]}, ${imageData[2]}, 1)`;
  return rgbaColor;
}

//------------------------------------Position--------------------------------------

const canvWidth = 800;
const canvHeight = 800;
const canvCellCount = 32;
const cellWidth = canvWidth / canvCellCount;
const cellHeight = canvHeight / canvCellCount;
const cursorPosition = document.getElementById('cursor-position');

let x, y, cellX, cellY;

function setCursorPositionOnCanvas(event) {
  x = event.offsetX;
  y = event.offsetY;
  cellX = Math.floor(x / cellWidth);
  cellY = Math.floor(y / cellHeight);
  cursorPosition.textContent = `[${cellX + 1} x ${cellY + 1}]`;
}

function resetCursorPositionOnCanvas() {
  cursorPosition.textContent = `[${canvCellCount} x ${canvCellCount}]`;
}
canvas.addEventListener("mousemove", setCursorPositionOnCanvas);
canvas.addEventListener("mouseout", resetCursorPositionOnCanvas);

// -----pen------
function drawCell() {
  ctx.beginPath();
  ctx.fillStyle = colorPrimary;
  ctx.fillRect(cellX * cellWidth, cellY * cellHeight, cellWidth, cellHeight)
}

canvas.addEventListener('mousedown', () => {
  drawCell()
  canvas.addEventListener('mousemove', drawCell);
  canvas.addEventListener('mouseup', function deleteEvent() {
    canvas.removeEventListener('mousemove', drawCell);
    canvas.removeEventListener('mouseup', deleteEvent)
  })
})

// --------------------------------  frames  ---------------------------------
const buttonAddFrame = document.getElementById("add-frame");
const framesContainer = document.getElementById("frames");
let liveСollectionOfFrame = document.getElementsByClassName("frames__item");
let ctxChoosenFrame;

function setImageData(fromContext, toContext) {
  let imageData = fromContext.getImageData(0, 0, canvWidth, canvHeight);
  toContext.putImageData(imageData, 0, 0);
}

function removeFocusFromFrames() {
  for (let i = 0; i < liveСollectionOfFrame.length; i++) {
    liveСollectionOfFrame[i].classList.remove("frames__item--active");
  }
}

function createFrame() {
  const html = document.createElement('li');
  html.classList.add("frames__item", "frames__item--active");
  html.innerHTML =
    `<div class="frames__button frames__button--move"></div>`;

  // --------basket-----------------
  function deleteFrame(event) {
    if (liveСollectionOfFrame[1]) {
      event.target.parentElement.remove();
    }
  }
  const basket = document.createElement('div');
  basket.classList.add("frames__button", "frames__button--delete");
  basket.addEventListener("click", deleteFrame);
  html.appendChild(basket)

  //   //--------duplicate-----------
  function duplicateFrame(event) {
    removeFocusFromFrames();
    const ctxOrigin = event.target.nextElementSibling.getContext("2d");
    const cloneFrame = createFrame();
    ctxClone = cloneFrame.lastChild.getContext("2d");
    ctxChoosenFrame = ctxClone;
    setImageData(ctxOrigin, ctxClone);
    setImageData(ctxOrigin, ctx)
    event.target.parentNode.parentNode.insertBefore(cloneFrame, event.target.parentNode.nextElementSibling)
  }
  const duplicateButton = document.createElement("div");
  duplicateButton.classList.add("frames__button", "frames__button--duplicate");
  duplicateButton.addEventListener("click", duplicateFrame);
  html.appendChild(duplicateButton);

  //---------- canvas-----------
  const canvasFrame = document.createElement('canvas');
  const ctxFrame = canvasFrame.getContext("2d");
  canvasFrame.setAttribute("width", canvWidth);
  canvasFrame.setAttribute("height", canvHeight);
  canvasFrame.classList.add('frames__canvas');
  setImageData(ctxFrame, ctx);
  ctxChoosenFrame = ctxFrame;
  html.appendChild(canvasFrame);
  //-----------event on canv
  canvasFrame.addEventListener('click', (event) => {
    ctxChoosenFrame = ctxFrame;
    setImageData(ctxFrame, ctx);
    setImageData(ctxFrame, ctxPlayer);
    removeFocusFromFrames();
    event.target.parentNode.classList.add("frames__item--active");
  })

  return html;
}


buttonAddFrame.addEventListener('click', () => {
  removeFocusFromFrames();
  framesContainer.appendChild(createFrame());
  setImageData(ctx, ctxPlayer)
})

canvas.addEventListener("mouseup", () => {
  setImageData(ctx, ctxChoosenFrame);
  setImageData(ctx, ctxPlayer)
});



//create first frame
framesContainer.appendChild(createFrame())

// ----------------------------- animation player -------------------------


const fpsInput = document.getElementById('fps__range');
const fpsDisplay = document.getElementById("fps__display");

let idInterval;
let fps = 1;
let i = 1;

function startAnimation() {
  idInterval = setInterval(() => {
    let ctxFrame = getContextFromFrame(
      liveСollectionOfFrame[i % liveСollectionOfFrame.length]
    );
    i++;
    setImageData(ctxFrame, ctxPlayer);
  }, 1000 / fps);
}

function getContextFromFrame(frame) {
  let ctxFrame = frame.children[3].getContext("2d");
  return ctxFrame;
}

fpsInput.addEventListener("change", event => {
  fps = event.target.value;
  fpsDisplay.textContent = `${fps} FPS`;
  if (event.target.value === '0') {
    clearInterval(idInterval);
    return
  }

  clearInterval(idInterval);
  startAnimation()
});


//--------popup------
const animationPlayer = document.getElementById("animation-player");

const popup = document.createElement("div");
popup.classList.add("animation-player__button", "animation-player__button--popup");
popup.addEventListener("click", () => {
//   canvas.requestFullscreen();
    animationPlayerCanvas.requestFullscreen();
});
animationPlayer.appendChild(popup);
})()




