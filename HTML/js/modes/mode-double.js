/*
 * 门窗助手窗型模块：mode-double.js
 * 双扇（两边开扇+中间固定 / 三分格双扇 两种形态）
 *
 * 结果行对照：
 *   默认双扇：
 *     g1 下中间玻璃  = (W-100-2*FW-29-29-10) × (FH-10)
 *     g2 上亮玻璃    = ((W-100-29)/2-10) × (H-100-FH-29-10)
 *   三分格：
 *     g1 下中间固定  = (W-100-2*FW-29-29-10) × (FH-10)
 *     g2 左右上亮    = (FW-10) × (H-100-FH-29-10)
 *     g3 中间上亮    = (W-100-2*FW-29-29-10) × (H-100-FH-29-10)
 *   通用：
 *     g4 扇子玻璃    = (FW-93) × (FH-92)    × 2
 *     gScreen 纱窗   = (FH-45) × (FW-45)    × 2
 *
 * 当前版本：v7.1 · 修改记录见 README.md
 */
/*
 * ---------------------------------------------------------------
 * 下料常数口径（已与用户确认，勿随意改动）
 * ---------------------------------------------------------------
 *   100  窗/门上下框总扣减
 *   29   窗中柱宽（4块 / 3块 / 双扇 / 阳台）
 *   39   门中柱宽（大门模式，见 mode-door.js）
 *   10   玻璃与框的配合间隙
 *   45   纱窗总余量  纱窗 = (扇子高-45) × (扇子宽-45)
 *
 *   扇子玻璃宽 = 扇子空 - 93
 *   扇子玻璃高 = 扇子高 - 92
 *   （现行出货口径，统一按此计算。
 *     不要改写成 "扇子空+10-102" 之类，两者差 1mm）
 * ---------------------------------------------------------------
 */
function drawModeDoubleOriginal() {
  const { W, H, FH } = getValues();

  const x = 35;
  const y = 20;
  const width = 150;
  const height = 120;

  const upperHeight = H - 100 - FH - 29;

  const upperY = y + height * (upperHeight / H);

  const leftFanX = x + 35;

  const rightFanX = x + 115;

  $("diagramWrapper").innerHTML = `<svg
class="svg-canvas"
viewBox="0 0 220 180">

${svgHeader()}

<rect
x="${x}"
y="${y}"
width="${width}"
height="${height}"/>

<line
x1="${x}"
y1="${upperY}"
x2="${x + width}"
y2="${upperY}"/>

<line
x1="${x + 75}"
y1="${y}"
x2="${x + 75}"
y2="${upperY}"/>

<line
x1="${leftFanX}"
y1="${upperY}"
x2="${leftFanX}"
y2="${y + height}"/>

<line
x1="${rightFanX}"
y1="${upperY}"
x2="${rightFanX}"
y2="${y + height}"/>

<polyline
points="${x + 9},${y + 62}
${x + 26},${y + 80}
${x + 9},${y + 98}"/>

<polyline
points="${x + width - 9},${y + 62}
${x + width - 26},${y + 80}
${x + width - 9},${y + 98}"/>

${verticalDimension(10, y, upperY, Math.round(upperHeight), x)}

${verticalDimension(10, upperY, y + height, Math.round(FH), x)}

${totalHeightDimension(210, y, y + height, Math.round(H), x + width)}

${horizontalDimension(x, x + width, 165, Math.round(W), y + height)}

</svg>`;
}

/* =========================================================
   新双扇三分格
========================================================= */

function drawModeDoubleThree() {
  const { W, H, FH, FW } = getValues();

  const x = 35;
  const y = 20;
  const width = 150;
  const height = 120;

  const upperHeight = H - 100 - FH - 29;

  const upperY = y + height * (upperHeight / H);

  const centerW = W - 100 - 2 * FW - 29 - 29 - 10;

  const totalInnerW = 2 * FW + centerW;

  const leftX = x + width * (FW / totalInnerW);

  const centerRightX = leftX + width * (centerW / totalInnerW);

  $("diagramWrapper").innerHTML = `<svg
class="svg-canvas"
viewBox="0 0 220 180">

${svgHeader()}

<rect
x="${x}"
y="${y}"
width="${width}"
height="${height}"/>

<line
x1="${x}"
y1="${upperY}"
x2="${x + width}"
y2="${upperY}"/>

<line
x1="${leftX}"
y1="${y}"
x2="${leftX}"
y2="${y + height}"/>

<line
x1="${centerRightX}"
y1="${y}"
x2="${centerRightX}"
y2="${y + height}"/>

<polyline
points="${x + 12},${upperY + 35}
${x + 30},${upperY + 53}
${x + 12},${upperY + 71}"/>

<polyline
points="${x + width - 12},${upperY + 35}
${x + width - 30},${upperY + 53}
${x + width - 12},${upperY + 71}"/>

${verticalDimension(10, y, upperY, Math.round(upperHeight), x)}

${verticalDimension(10, upperY, y + height, Math.round(FH), x)}

${totalHeightDimension(210, y, y + height, Math.round(H), x + width)}

${horizontalDimension(x, x + width, 165, Math.round(W), y + height)}

</svg>`;
}

/* =========================================================
   阳台几何
========================================================= */

function calculateModeDouble(ctx) {
  const { W, H, FW, FH, num, upperBright } = ctx;

  /*
   * 原公式里 gH 算出的是「上亮玻璃高」
   * v3.0 改为由上亮高度直接控制；为空/0 时回退原公式
   */
  const gH = upperBright > 0 ? upperBright - 10 : H - 100 - FH - 29 - 10;
  if (doubleThreePart) {
    const centerW = W - 100 - 2 * FW - 29 - 29 - 10;
    const sideUpperW = FW - 10;
    showResult("g1", Math.round(centerW) + "×" + Math.round(FH - 10), num, "块");
    showResult("g2", Math.round(sideUpperW) + "×" + Math.round(gH), num * 2, "块");
    showResult("g3", Math.round(centerW) + "×" + Math.round(gH), num, "块");
    showResult("g4", Math.round(FW - 93) + "×" + Math.round(FH - 92), num * 2, "块");
    showResult("gScreen", Math.round(FH - 45) + "×" + Math.round(FW - 45), num * 2, "个");
  } else {
    showResult("g2", Math.round((W - 100 - 29) / 2 - 10) + "×" + Math.round(gH), num * 2, "块");
    showResult(
      "g1",
      Math.round(W - 100 - 2 * FW - 29 - 29 - 10) + "×" + Math.round(FH - 10),
      num,
      "块",
    );
    showResult("g4", Math.round(FW - 93) + "×" + Math.round(FH - 92), num * 2, "块");
    showResult("gScreen", Math.round(FH - 45) + "×" + Math.round(FW - 45), num * 2, "个");
  }
}
