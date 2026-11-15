/*
 * 门窗助手窗型模块：mode-4.js
 * 4块（左右分格 + 上亮）
 *
 * 结果行对照：
 *   g1 下固定玻璃    = (W-100-FW-29-10) × (FH-10)
 *   g2 上亮固定玻璃  = (W-100-FW-29-10) × (H-100-FH-29-10)
 *   g3 上亮扇固定    = (FW-10) × (H-100-FH-29-10)
 *   g4 扇子玻璃      = (FW-93) × (FH-92)
 *   gScreen 纱窗     = (FH-45) × (FW-45)
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

function drawMode4() {
  const { W, H, FH } = getValues();
  const x = 50;
  const y = 20;
  const width = 120;
  const height = 120;
  const upperHeight = H - 100 - FH - 29;
  const upperY = y + height * (upperHeight / H);
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
x1="${x + 80}"
y1="${y}"
x2="${x + 80}"
y2="${y + height}"/>
<polyline
points="${x + 110},${y + 62}
${x + 93},${y + 80}
${x + 110},${y + 98}"/>
${verticalDimension(25, y, upperY, Math.round(upperHeight), x)}
${verticalDimension(25, upperY, y + height, Math.round(FH), x)}
${totalHeightDimension(190, y, y + height, Math.round(H), x + width)}
${horizontalDimension(x, x + width, 165, Math.round(W), y + height)}
</svg>`;
}
/* =========================================================
   4块模式计算
========================================================= */
function calculateMode4(ctx) {
  const { W, H, FW, FH, num, upperBright } = ctx;

  /*
   * 原公式里 gH 算出的就是「上亮玻璃高」：
   *   gH = H - 100(上下框) - FH(扇高) - 29(中柱) - 10(玻璃间隙)
   *
   * v3.0 改为由「上亮高度」直接控制（双向联动，只影响高度）：
   *   gH = 上亮 - 10(玻璃间隙)
   *   上亮为空/0 时回退到原公式（按扇子高反推），保证兼容
   */

  const gW = W - 100 - FW - 29 - 10;

  const gH = upperBright > 0 ? upperBright - 10 : H - 100 - FH - 29 - 10;
  showResult("g1", Math.round(gW) + "×" + Math.round(FH - 10), num, "块");
  showResult("g4", Math.round(FW - 93) + "×" + Math.round(FH - 92), num, "块");
  showResult("gScreen", Math.round(FH - 45) + "×" + Math.round(FW - 45), num, "个");
  showResult("g2", Math.round(gW) + "×" + Math.round(gH), num, "块");
  showResult("g3", Math.round(FW - 10) + "×" + Math.round(gH), num, "块");
}
