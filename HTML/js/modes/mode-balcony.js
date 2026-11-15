/*
 * 门窗助手窗型模块：mode-balcony.js
 * 阳台（固 / 扇 组合，可点按钮增减）
 *
 * 结果行对照：
 *   g1 固定主玻璃  = (固定格宽) × (总内高-10)
 *   g2 上亮固定    = (固定格宽) × (上亮-10)
 *   g3 下亮固定    = (固定格宽) × (下亮-10)
 *   g4 上亮扇固定  = (FW-10) × (上亮-10)
 *   g5 下亮扇固定  = (FW-10) × (下亮-10)
 *   g6 扇子玻璃    = (FW-93) × (总内高-82)
 *   gScreen 纱窗   = (FH-45) × (FW-45)
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
function getBalconyGeometry() {
  const { W, H, FW, upperBright, lowerBright } = getValues();

  const parts = balconyParts.length ? balconyParts : ["固", "扇", "固"];

  const fanCount = parts.filter((p) => p === "扇").length;

  const fixedCount = parts.filter((p) => p === "固").length;

  /*
按照原来的宽度扣减逻辑
*/

  /*
   * 可用宽度 = 总宽 - 上下框总扣减(100)
   *            - 每个扇子的宽(FW × 扇数)
   *            - 中柱(29) × 3 根
   * 注：这里的 3 根中柱是固定分隔，与 balconyParts 的增减无关
   */

  const usableW = W - 100 - FW * fanCount - 29 - 29 - 29;

  /*
固定部分平均分配
*/

  const fixedW = fixedCount > 0 ? Math.floor(usableW / fixedCount) - 10 : 0;

  /*
高度保持原来的阳台算法
*/

  /*
   * 内部总高 = 总高 - 上下框(100) - 上亮 - 下亮 - 横中柱(29) × 2
   */

  const totalInnerH = H - 100 - upperBright - lowerBright - 29 - 29;

  /* 主玻璃高 = 内部总高 - 玻璃配合间隙(10) */
  const mainFixedH = totalInnerH - 10;

  /*
   * 扇子玻璃高（阳台）：内部总高 - 82
   * 可由扇玻璃高口径推导：内部净高 + 10(配合间隙) - 92(扇框+玻璃) = 内部净高 - 82
   */
  const sashH = totalInnerH - 82;

  return {
    W,
    H,
    FW,
    upperBright,
    lowerBright,

    parts,

    fanCount,
    fixedCount,

    fixedW,

    totalInnerH,
    mainFixedH,
    sashH,
  };
}

/* =========================================================
   阳台
========================================================= */

function drawModeBalcony() {
  const g = getBalconyGeometry();

  const { W, H, FW, upperBright, lowerBright, fixedW, parts, totalInnerH } = g;

  const widthRatio = W || 1;
  const heightRatio = H || 1;

  let drawW = 200;

  let drawH = drawW * (heightRatio / widthRatio);

  if (drawH > 125) {
    drawH = 125;

    drawW = drawH * (widthRatio / heightRatio);
  }

  const frameX = (260 - drawW) / 2;

  const frameY = 18;

  const frameBottom = frameY + drawH;

  const frameLeft = frameX + drawW * (50 / W);

  const frameRight = frameX + drawW * ((W - 50) / W);

  const upperY = frameY + drawH * ((100 + upperBright) / H);

  const fanBottomY = upperY + drawH * (totalInnerH / H);

  /* =========================
   生成分格
========================= */

  let currentX = frameLeft;

  let verticalLines = "";

  let arrows = "";

  parts.forEach((part, index) => {
    let partW;

    if (part === "扇") {
      partW = drawW * (FW / W);
    } else {
      partW = drawW * (fixedW / W);
    }

    if (index === parts.length - 1) {
      partW = frameRight - currentX;
    }

    const nextX = currentX + partW;

    /*
分格线
*/

    if (index < parts.length - 1) {
      verticalLines += `

<line
x1="${nextX}"
y1="${frameY}"
x2="${nextX}"
y2="${frameBottom}"/>
`;
    }

    /*
扇子开启箭头
*/

    if (part === "扇") {
      const arrowX = currentX + partW / 2;

      const middleY = upperY + (fanBottomY - upperY) / 2;

      arrows += `

<polyline
points="${arrowX + 12},
${middleY - 18}
${arrowX - 5},
${middleY}
${arrowX + 12},
${middleY + 18}"/>
`;
    }

    currentX = nextX;
  });

  $("diagramWrapper").innerHTML = `<svg
class="svg-canvas"
viewBox="0 0 220 180">

${svgHeader()}

<rect
x="${frameX}"
y="${frameY}"
width="${drawW}"
height="${drawH}"/>

<!-- 上亮 -->

<line
x1="${frameLeft}"
y1="${upperY}"
x2="${frameRight}"
y2="${upperY}"/>

<!-- 下亮 -->

<line
x1="${frameLeft}"
y1="${fanBottomY}"
x2="${frameRight}"
y2="${fanBottomY}"/>

<!-- 固 / 扇 分格 -->

${verticalLines}

<!-- 扇开启方向 -->

${arrows}

${verticalDimension(8, frameY, upperY, Math.round(upperBright), frameLeft)}

${verticalDimension(8, upperY, fanBottomY, Math.round(totalInnerH), frameLeft)}

${verticalDimension(8, fanBottomY, frameBottom, Math.round(lowerBright), frameLeft)}

${totalHeightDimension(252, frameY, frameBottom, Math.round(H), frameRight)}

${horizontalDimension(frameX, frameX + drawW, 165, Math.round(W), frameBottom)}

</svg>`;
}

/* =========================================================
   图示入口
========================================================= */

function calculateModeBalcony(ctx) {
  const { W, H, FW, FH, upperBright, lowerBright, num } = ctx;
  const g = getBalconyGeometry();
  const { fixedW, mainFixedH, sashH, fanCount, fixedCount } = g;
  showResult("g1", Math.floor(fixedW) + "×" + Math.floor(mainFixedH), num * fixedCount, "块");
  showResult("g2", Math.floor(fixedW) + "×" + Math.floor(upperBright - 10), num * fixedCount, "块");
  showResult("g3", Math.floor(fixedW) + "×" + Math.floor(lowerBright - 10), num * fixedCount, "块");
  showResult("g4", Math.floor(FW - 10) + "×" + Math.floor(upperBright - 10), num * fanCount, "块");
  showResult("g5", Math.floor(FW - 10) + "×" + Math.floor(lowerBright - 10), num * fanCount, "块");
  showResult("g6", Math.floor(FW - 93) + "×" + Math.floor(sashH), num * fanCount, "块");
  showResult("gScreen", Math.floor(FH - 45) + "×" + Math.floor(FW - 45), num * fanCount, "个");
}
