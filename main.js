document.addEventListener("DOMContentLoaded", () => {
  let textSizeManuallySet = false;
  let displayedTextSize = 40;
  let requestedTextSize = 40;

  const sliders = [
    { id: "pixelCount", valueEl: "pixelCountValue" },
    { id: "pixelHeight", valueEl: "pixelHeightValue" },
    { id: "opacityPixels", valueEl: "opacityPixelsValue" },
    { id: "opacityText", valueEl: "opacityTextValue" },
    { id: "textSize", valueEl: "textSizeValue" },
    { id: "overlayWidth", valueEl: "overlayWidthValue" },
  ];

  const textSizeSlider = document.getElementById("textSize");
  if (textSizeSlider) {
    textSizeSlider.addEventListener("input", () => {
      textSizeManuallySet = true;

      const newTextSize = Number(textSizeSlider.value) || 40;
      requestedTextSize = newTextSize;
      displayedTextSize = newTextSize;

      const textSizeValue = document.getElementById("textSizeValue");
      if (textSizeValue) textSizeValue.textContent = Math.round(newTextSize);

      if (typeof generateImage === "function") generateImage();
    });
  }

  const fontSelect = document.getElementById("fontStyle");
  if (fontSelect) {
    fontSelect.addEventListener("change", () => {
      const fontStyle = getFontStyle();
      const fontSpec = `${fontStyle.style} ${fontStyle.weight} 40px "${fontStyle.family}"`;
      document.fonts.load(fontSpec).then(() => generateImage());
    });
  }

  sliders.forEach((sliderConfig) => {
    const slider = document.getElementById(sliderConfig.id);
    const valueDisplay = document.getElementById(sliderConfig.valueEl);
    if (!slider || !valueDisplay) return;

    valueDisplay.textContent = slider.value;

    slider.addEventListener("input", () => {
      valueDisplay.textContent = slider.value;

      function clampNumber(value, minimum, maximum) {
        return Math.max(minimum, Math.min(maximum, value));
      }

      function interpolateFromCurve(pixelHeightPercent, curve) {
        if (pixelHeightPercent >= curve[0].h) return curve[0].s;

        for (let i = 0; i < curve.length - 1; i++) {
          const pointA = curve[i];
          const pointB = curve[i + 1];
          if (pixelHeightPercent <= pointA.h && pixelHeightPercent >= pointB.h) {
            const t = (pixelHeightPercent - pointB.h) / (pointA.h - pointB.h);
            const interpolatedSize = pointB.s + t * (pointA.s - pointB.s);
            return Math.round(interpolatedSize);
          }
        }

        const lastPoint = curve[curve.length - 1];
        const secondLastPoint = curve[curve.length - 2];
        const slope = (lastPoint.s - secondLastPoint.s) / (lastPoint.h - secondLastPoint.h);
        return Math.round(lastPoint.s + slope * (pixelHeightPercent - lastPoint.h));
      }

      function applyAutoTextSize() {
        if (textSizeManuallySet) return;

        const pixelCount = Number(document.getElementById("pixelCount").value);
        const pixelHeightPercent = Number(document.getElementById("pixelHeight").value);

        const textSizeCurveDefault = [
          { h: 8, s: 40 },
          { h: 7, s: 50 },
          { h: 5, s: 70 },
          { h: 2, s: 85 },
        ];
        const textSizeCurveDense = [
          { h: 8, s: 25 },
          { h: 7, s: 30 },
          { h: 5, s: 40 },
          { h: 2, s: 85 },
        ];
        const textSizeCurveDenser = [
          { h: 8, s: 20 },
          { h: 7, s: 30 },
          { h: 5, s: 45 },
          { h: 2, s: 85 },
        ];

        if (pixelCount <= 9) {
          requestedTextSize =
            pixelHeightPercent >= 8
              ? 40
              : clampNumber(interpolateFromCurve(pixelHeightPercent, textSizeCurveDefault), 1, 200);
        } else if (pixelCount <= 19) {
          requestedTextSize = clampNumber(interpolateFromCurve(pixelHeightPercent, textSizeCurveDense), 1, 200);
        } else {
          requestedTextSize = clampNumber(interpolateFromCurve(pixelHeightPercent, textSizeCurveDenser), 1, 200);
        }

        displayedTextSize = requestedTextSize;
        const textSizeSlider = document.getElementById("textSize");
        const textSizeValue = document.getElementById("textSizeValue");
        if (textSizeSlider && textSizeValue) {
          textSizeSlider.value = Math.round(displayedTextSize);
          textSizeValue.textContent = Math.round(displayedTextSize);
        }
      }

      if (slider.id === "pixelCount" || slider.id === "pixelHeight") {
        applyAutoTextSize();
      }

      if (typeof generateImage === "function") generateImage();
    });
  });

  const resetBtn = document.getElementById("resetBtn");
  if (resetBtn) {
    resetBtn.addEventListener("click", () => {
      document.getElementById("canvasWidth").value = 1920;
      document.getElementById("canvasHeight").value = 1080;

      const pixelCountSlider = document.getElementById("pixelCount");
      if (pixelCountSlider) {
        pixelCountSlider.value = 9;
        document.getElementById("pixelCountValue").textContent = 9;
      }

      const pixelHeightSlider = document.getElementById("pixelHeight");
      if (pixelHeightSlider) {
        pixelHeightSlider.value = 8;
        document.getElementById("pixelHeightValue").textContent = 8;
      }

      const opacityPixelsSlider = document.getElementById("opacityPixels");
      if (opacityPixelsSlider) {
        opacityPixelsSlider.value = 100;
        document.getElementById("opacityPixelsValue").textContent = 100;
      }

      const opacityTextSlider = document.getElementById("opacityText");
      if (opacityTextSlider) {
        opacityTextSlider.value = 100;
        document.getElementById("opacityTextValue").textContent = 100;
      }

      const textSizeResetSlider = document.getElementById("textSize");
      if (textSizeResetSlider) {
        textSizeResetSlider.value = 40;
        document.getElementById("textSizeValue").textContent = 40;
      }

      const fontSelect = document.getElementById("fontStyle");
      if (fontSelect) {
        fontSelect.value = "Inter-400";
      }

      const c1 = document.getElementById("color1");
      if (c1) c1.value = "#ffb0c5";
      const c2 = document.getElementById("color2");
      if (c2) c2.value = "#99cdf0";
      const ct = document.getElementById("colorText");
      if (ct) ct.value = "#000000";

      const overlayWidthSlider = document.getElementById("overlayWidth");
      if (overlayWidthSlider) {
        overlayWidthSlider.value = 60;
        const overlayWidthValue = document.getElementById("overlayWidthValue");
        if (overlayWidthValue) overlayWidthValue.textContent = 60;
      }

      updateCanvasLabel();

      if (typeof generateImage === "function") generateImage();
      textSizeManuallySet = false;

      resetBtn.blur();
    });
  }

  const downloadBtn = document.getElementById("downloadBtn");
  if (downloadBtn) {
    downloadBtn.addEventListener("click", downloadImage);
  }

  function updateCanvasLabel() {
    if (typeof generateImage === "function") generateImage();
  }

  ["canvasWidth", "canvasHeight"].forEach((id) =>
    document.getElementById(id).addEventListener("input", updateCanvasLabel),
  );
  updateCanvasLabel();

  const colorInputPairs = [
    { textInputId: "color1Text", colorPickerId: "color1" },
    { textInputId: "color2Text", colorPickerId: "color2" },
    { textInputId: "textColorHexInput", colorPickerId: "colorText" },
  ];
  colorInputPairs.forEach(({ textInputId, colorPickerId }) => {
    const textInput = document.getElementById(textInputId);
    const colorPicker = document.getElementById(colorPickerId);
    if (!textInput || !colorPicker) return;

    textInput.value = colorPicker.value.toUpperCase();

    textInput.addEventListener("input", (event) => {
      const typedValue = event.target.value.trim();
      const isValidHexColor = /^#[0-9A-Fa-f]{6}$/.test(typedValue);
      if (isValidHexColor) {
        colorPicker.value = typedValue;
        if (typeof generateImage === "function") generateImage();
      }
    });

    colorPicker.addEventListener("input", () => {
      textInput.value = colorPicker.value.toUpperCase();
      if (typeof generateImage === "function") generateImage();
    });
  });

  if (typeof generateImage === "function") generateImage();
});

function getFontStyle() {
  const fontSelect = document.getElementById("fontStyle");
  const selectedValue = fontSelect ? fontSelect.value : "Inter-400";

  const [fontFamily, weightAndStyle] = selectedValue.split("-");
  const isItalic = weightAndStyle.endsWith("i");
  const weight = isItalic ? weightAndStyle.slice(0, -1) : weightAndStyle;
  const style = isItalic ? "italic" : "normal";

  return { family: fontFamily, weight: weight, style: style };
}

function generateImage() {
  var canvasWidth = parseInt(document.getElementById("canvasWidth").value, 10);
  var canvasHeight = parseInt(document.getElementById("canvasHeight").value, 10);
  var pixels = parseInt(document.getElementById("pixelCount").value, 10);
  var color1 = (document.getElementById("color1") || {}).value || "#ffb0c5";
  var color2 = (document.getElementById("color2") || {}).value || "#99cdf0";
  var colorText =
    (document.getElementById("colorText") || {}).value || "black";
  var opacityPixels = parseInt(
    (document.getElementById("opacityPixels") || {}).value,
    10,
  );
  if (isNaN(opacityPixels)) opacityPixels = 100;
  var opacityText = parseInt(
    (document.getElementById("opacityText") || {}).value,
    10,
  );
  if (isNaN(opacityText)) opacityText = 100;
  var pixelHeightPct =
    parseInt((document.getElementById("pixelHeight") || {}).value, 10) || 8;
  const fontStyle = getFontStyle();

  const c1Text = document.getElementById("color1Text");
  const c2Text = document.getElementById("color2Text");
  const textColorHexInput = document.getElementById("textColorHexInput");
  if (c1Text) c1Text.value = color1.toUpperCase();
  if (c2Text) c2Text.value = color2.toUpperCase();
  if (textColorHexInput) textColorHexInput.value = colorText.toUpperCase();

  var canvas = document.getElementById("overlayCanvas");
  if (!canvas) return;
  canvas.width = canvasWidth;
  canvas.height = canvasHeight;
  var ctx = canvas.getContext("2d");
  if (canvasWidth <= 0 || canvasHeight <= 0) return;

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.globalAlpha = 0;
  ctx.fillStyle = "white";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.globalAlpha = 1;

  const blocksWide = parseInt((document.getElementById("overlayWidth") || {}).value, 10) || 60;
  const pixelWidth = Math.max(1, canvasWidth / blocksWide);

  const pixelHeight = Math.max(1, Math.round((canvasHeight * pixelHeightPct) / 100));
  const pixelY = Math.round(canvasHeight / 2 - pixelHeight / 2);

  const textSizeInput =
    parseInt((document.getElementById("textSize") || {}).value, 10) || 40;

  let computedFontSize;
  if (pixelHeightPct >= 8) {
    computedFontSize = textSizeInput;
  } else {
    const textSizePercent = textSizeInput / 100;
    computedFontSize = Math.max(1, Math.round(pixelHeight * textSizePercent));
  }

  function setFont(size) {
    ctx.font = `${fontStyle.style} ${fontStyle.weight} ${size}px "${fontStyle.family}"`;
  }

  const fontSize = Math.max(1, Math.floor(computedFontSize));
  setFont(fontSize);

  for (let i = -pixels; i < pixels; i++) {
    var pixelX = canvasWidth / 2 + i * pixelWidth;
    ctx.globalAlpha = opacityPixels / 100;
    ctx.fillStyle = Math.abs(i % 2) === 1 ? color2 : color1;
    ctx.fillRect(pixelX, pixelY, pixelWidth, pixelHeight);

    var num = i < 0 ? Math.abs(i) : i + 1;
    ctx.globalAlpha = opacityText / 100;
    setFont(fontSize);
    ctx.fillStyle = colorText;
    ctx.textAlign = "center";
    const metrics = ctx.measureText(num);
    const textHeight =
      metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent;
    const textY = pixelY + pixelHeight / 2 + metrics.actualBoundingBoxAscent - textHeight / 2;
    ctx.fillText(num, pixelX + pixelWidth / 2, textY);
  }

  ctx.globalAlpha = 1;

  var crosshairWidth = 0.003125 * canvasWidth;
  var crosshairHeight = canvasHeight;
  var crosshairX = canvasWidth / 2 - crosshairWidth;
  var crosshairY = 0;
  ctx.fillStyle = "#e8e8e8";
  ctx.fillRect(crosshairX, crosshairY, crosshairWidth, crosshairHeight);

  const dl = document.getElementById("downloadBtn");
  if (dl) dl.disabled = false;

  const CENTER_WIDTH = blocksWide;
  const CENTER_HEIGHT = 580;

  const left = Math.max(0, Math.round((canvasWidth - CENTER_WIDTH) / 2));
  const right = left;
  const top = Math.max(0, Math.round((canvasHeight - CENTER_HEIGHT) / 2));
  const bottom = top;

  const cropHorizontalLabel = document.getElementById("cropHorizontal");
  const cropVerticalLabel = document.getElementById("cropVertical");

  if (cropHorizontalLabel) cropHorizontalLabel.textContent = `Left: ${left} Right: ${right}`;
  if (cropVerticalLabel) cropVerticalLabel.textContent = `Top: ${top} Bottom: ${bottom}`;
}

function downloadImage() {
  var canvas = document.getElementById("overlayCanvas");
  if (!canvas) return;
  var link = document.createElement("a");
  link.href = canvas.toDataURL();
  link.download = "overlay.png";
  link.click();
}

const toggleBtn = document.getElementById("toggleTransformBtn");
const transformModal = document.getElementById("transformModal");
const closeModal = document.getElementById("closeModal");

if (toggleBtn && transformModal) {
  toggleBtn.addEventListener("click", () => {
    transformModal.style.display = "flex";
  });
}

if (closeModal && transformModal) {
  closeModal.addEventListener("click", () => {
    transformModal.style.display = "none";
  });
}

transformModal.addEventListener("click", (e) => {
  if (e.target === transformModal) transformModal.style.display = "none";
});
