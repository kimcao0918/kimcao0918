/*
 * 门窗助手核心公共模块
 * 这里不包含任何具体窗型的计算规则。
 *
 * 版本：v7.1
 * 修改内容见 README.md
 */

/* =========================================================
   默认数据
========================================================= */

const data = {
  4: {
    winW: 1800,
    winH: 1800,
    fanW: 540,
    fanH: 1160,
    upperBright: 511,
    winNum: 1,
  },

  3: {
    winW: 1800,
    winH: 1800,
    fanW: 540,
    fanH: 1160,
    upperBright: 511,
    winNum: 1,
  },

  double: {
    winW: 2040,
    winH: 1800,
    fanW: 540,
    fanH: 1160,
    upperBright: 511,
    winNum: 1,
  },

  balcony: {
    winW: 2800,
    winH: 2880,
    fanW: 540,
    fanH: 1370,
    upperBright: 551,
    lowerBright: 801,
    winNum: 1,
  },

  door: {
    winW: 1970,
    winH: 2600,
    fanW: 1304,
    fanH: 0,
    upperBright: 491,
    lowerBright: 0,
    winNum: 1,
  },
};

/* =========================================================
   状态
========================================================= */

let currentMode = 4;

let diagramCollapsed = false;

let glassCollapsed = true;

let historyEditMode = false;

let listEditMode = false;

/*
3块：

false = 默认右开扇
true = 左通高
*/

let threeLeftTong = false;

/*
双扇：

false = 原来的双扇窗型
true = 三分格双扇窗型
*/

let doubleThreePart = false;

/*
阳台组合
*/

let balconyParts = ["固", "扇", "固"];

let shoppingList = JSON.parse(localStorage.getItem("windowShoppingList") || "[]");

let historyList = JSON.parse(localStorage.getItem("windowHistoryList") || "[]");

/* =========================================================
   工具
========================================================= */

function $(id) {
  return document.getElementById(id);
}

function escapeHtml(str) {
  return String(str || "")
    .replace(/&/g, "&amp;")

    .replace(/</g, "&lt;")

    .replace(/>/g, "&gt;")

    .replace(/"/g, "&quot;")

    .replace(/'/g, "&#039;");
}

function clearInputOnClick(i) {
  if (!i.dataset.clicked) {
    /* 代码里直接点按钮也会触发清空，排除掉 */
    if (i.type === "button" || i.type === "checkbox") return;

    i.dataset.clicked = "1";

    i.value = "";

    i.dispatchEvent(new Event("input"));

    setTimeout(() => {
      delete i.dataset.clicked;
    }, 300);
  }
}

/* =========================================================
   数量
========================================================= */

function changeNum(delta) {
  let n = parseInt($("winNum").value) || 1;

  n = Math.max(1, n + delta);

  $("winNum").value = n;

  calc();
}

/* =========================================================
   图示
========================================================= */

function toggleDiagram() {
  diagramCollapsed = !diagramCollapsed;

  $("diagramWrapper").classList.toggle("collapse", diagramCollapsed);

  $("diagramToggle").textContent = diagramCollapsed ? "展开图示" : "收起图示";
}

/* =========================================================
   玻璃表格
========================================================= */

function toggleGlass() {
  glassCollapsed = !glassCollapsed;

  $("glassTableWrap").classList.toggle("show", !glassCollapsed);

  $("glassToggle").textContent = glassCollapsed ? "展开玻璃尺寸" : "收起玻璃尺寸";
}

/* =========================================================
   包边
========================================================= */

function togglePerimeter() {
  $("perimeterDisplay").classList.toggle("show", $("perimeterToggle").checked);

  calc();
}

/* =========================================================
   读取数据
========================================================= */

function getValues() {
  /*
   * 读取输入框：
   * - 输入框为空 / 非法 → 返回 0（交给各模式判空）
   * - 只有输入框不存在时才回退默认值
   * 旧版 +el.value||0 后再被模式里的 ||默认值 兜底，
   * 会出现「输入框是空的，结果还是旧尺寸」的假数据
   */

  const read = (id, oldValue) => {
    const el = $(id);

    const raw = el ? String(el.value).trim() : "NaN";

    if (el && raw === "") return 0;

    const n = el ? Number(raw) : Number(oldValue);

    return Number.isFinite(n) ? n : 0;
  };

  const d = data[currentMode] || {};

  return {
    W: read("winW", d.winW),

    H: read("winH", d.winH),

    FW: read("fanW", d.fanW),

    FH: read("fanH", d.fanH),

    upperBright: read("upperBright", d.upperBright),

    lowerBright: read("lowerBright", d.lowerBright),
  };
}

/* =========================================================
   SVG
========================================================= */

function svgHeader() {
  return `<defs>

<marker
id="arrow"
markerWidth="5"
markerHeight="5"
refX="2.5"
refY="2.5"
orient="auto-start-reverse">

<path
d="M 0 0 L 5 2.5 L 0 5 z"
fill="var(--text-main)"/>

</marker>

</defs>`;
}

function verticalDimension(x, y1, y2, text, guideX) {
  return `

<line
class="dimension-line"
x1="${x}"
y1="${y1}"
x2="${x}"
y2="${y2}"
marker-start="url(#arrow)"
marker-end="url(#arrow)"/>

<line
class="dimension-dash"
x1="${x + 5}"
y1="${y1}"
x2="${guideX}"
y2="${y1}"/>

<line
class="dimension-dash"
x1="${x + 5}"
y1="${y2}"
x2="${guideX}"
y2="${y2}"/>

<text
class="dimension-text"
x="${x - 10}"
y="${(y1 + y2) / 2}">
${text}
</text>

`;
}

function totalHeightDimension(x, y1, y2, text, guideX) {
  return `

<line
class="dimension-line"
x1="${x}"
y1="${y1}"
x2="${x}"
y2="${y2}"
marker-start="url(#arrow)"
marker-end="url(#arrow)"/>

<line
class="dimension-dash"
x1="${guideX}"
y1="${y1}"
x2="${x - 5}"
y2="${y1}"/>

<line
class="dimension-dash"
x1="${guideX}"
y1="${y2}"
x2="${x - 5}"
y2="${y2}"/>

<text
class="dimension-text"
x="${x + 10}"
y="${(y1 + y2) / 2}">
${text}
</text>

`;
}

function horizontalDimension(x1, x2, y, text, guideY) {
  return `

<line
class="dimension-line"
x1="${x1}"
y1="${y}"
x2="${x2}"
y2="${y}"
marker-start="url(#arrow)"
marker-end="url(#arrow)"/>

<line
class="dimension-dash"
x1="${x1}"
y1="${guideY}"
x2="${x1}"
y2="${y - 5}"/>

<line
class="dimension-dash"
x1="${x2}"
y1="${guideY}"
x2="${x2}"
y2="${y - 5}"/>

<text
class="dimension-text"
x="${(x1 + x2) / 2}"
y="${y + 9}">
${text}
</text>

`;
}

/* =========================================================
   保存当前数据
========================================================= */

function saveCurrentData() {
  data[currentMode] = {
    winW: $("winW").value,

    winH: $("winH").value,

    fanW: $("fanW").value,

    fanH: $("fanH").value,

    upperBright: $("upperBright").value,

    lowerBright: $("lowerBright").value,

    winNum: $("winNum").value,
  };
}

/* =========================================================
   加载数据
========================================================= */

function loadDataToInputs() {
  $("winW").value = data[currentMode].winW || "";

  $("winH").value = data[currentMode].winH || "";

  $("fanW").value = data[currentMode].fanW || "";

  $("fanH").value = data[currentMode].fanH || "";

  $("upperBright").value = data[currentMode].upperBright || "";

  $("lowerBright").value = data[currentMode].lowerBright || "";

  $("winNum").value = data[currentMode].winNum || 1;
}

/* =========================================================
   显示结果
========================================================= */

function showResult(id, size, count, unit) {
  const sizeEl = $(id + "_size");

  const countEl = $(id + "_count");

  if (!sizeEl || !countEl) return;

  /* 负数尺寸标红，提示输入不合理（原来会安静地显示负值） */
  sizeEl.innerHTML = "<b>" + size + "</b>";

  sizeEl.style.color = /-\d/.test(String(size)) ? "#e53935" : "";

  sizeEl.title = /-\d/.test(String(size)) ? "尺寸为负：请检查窗总高/总宽与扇子尺寸" : "";

  /* 统一成「× 2块」格式，与大门模式保持一致 */
  countEl.textContent = "× " + count + unit;
}

/* =========================================================
   清空结果
========================================================= */

function clearResults() {
  ["g1", "g2", "g3", "g4", "g5", "g6", "gScreen"].forEach((id) => {
    const size = $(id + "_size");

    const count = $(id + "_count");

    if (size) {
      size.innerHTML = "-";

      size.style.color = "";

      size.title = "";
    }

    if (count) count.textContent = "";
  });
}

/* =========================================================
   当前结果
========================================================= */

function getCurrentResults() {
  const result = [];

  const rows = [
    "rowG1",
    "rowBright",
    "rowBrightFan",
    "rowG4",
    "rowLowerFan",
    "rowSash",
    "rowScreen",
  ];

  /*
   * 用 textContent 而不是 innerText：
   * innerText 依赖布局，隐藏容器 / 非浏览器环境会拿到 undefined，
   * 导致结果被静默丢弃（清单和导出都会变空）
   */

  const textOf = (el) =>
    el
      ? String(el.textContent || "")
          .replace(/\s+/g, " ")
          .trim()
      : "";

  rows.forEach((id) => {
    const row = $(id);

    if (!row || row.classList.contains("hidden")) return;

    const size = row.querySelector(".size-val");

    const count = row.querySelector(".count-val");

    const sizeText = textOf(size);

    const countText = textOf(count);

    if (sizeText && sizeText !== "-") {
      result.push({
        name: textOf(row.querySelector("td")),

        size: sizeText,

        count: countText,

        num: countText.match(/\d+/) ? parseInt(countText.match(/\d+/)[0], 10) : 0,
      });
    }
  });

  return result;
}

/**
 * 统一尺寸计数格式
 * normCount('× 2')       → '× 2'
 * normCount('× 2块')     → '× 2块'
 * normCount('*3块')      → '× 3块'
 * normCount('*1')        → '× 1'
 * normCount('')          → ''
 */
function normCount(text) {
  const s = String(text || "")
    .replace(/\s+/g, " ")
    .trim();

  if (!s) return "";

  const m = s.match(/(\d+)(\s*.+)?$/);

  if (!m) return s;

  const unit = (m[2] || "")
    .trim()
    .replace(/^[×xX*]/, "")
    .trim();

  return "× " + m[1] + (unit ? " " + unit : "");
}

/* =========================================================
   加入清单
========================================================= */

function addToList() {
  saveCurrentData();

  const Glen = getCurrentResults();

  if (!Glen.length) return;

  let modeName = $("modeDropdown").selectedOptions[0].text;

  /* 3块 */

  if (currentMode === 3) {
    modeName = threeLeftTong ? "3块 (左通高+右开扇)" : "3块 (右开扇+通头顶上亮)";
  }

  /* 双扇 */

  if (currentMode === "double") {
    modeName = doubleThreePart ? "双扇 (三分格双扇窗型)" : "双扇 (两边开扇+中间固定)";
  }

  /* 阳台 */

  if (currentMode === "balcony") {
    modeName = "阳台 (" + balconyParts.join("+") + ")";
  }

  /* 断桥门：标题带上具体门型 */

  if (currentMode === "door") {
    modeName = "断桥门-" + (doorType === 4 ? "四门" : doorType === 2 ? "双门" : "单门");
  }

  const item = {
    id: Date.now(),

    mode: modeName,

    modeValue: currentMode,

    doubleThreePart: currentMode === "double" ? doubleThreePart : false,

    /* 断桥门型：4 四门 / 2 双门 / 1 单门（旧记录没有此字段，按四门处理） */
    doorType: currentMode === "door" ? doorType : 4,

    threeLeftTong: currentMode === 3 ? threeLeftTong : false,

    balconyParts: currentMode === "balcony" ? [...balconyParts] : [],

    W: data[currentMode].winW,

    H: data[currentMode].winH,

    FW: data[currentMode].fanW,

    FH: data[currentMode].fanH,

    upperBright: data[currentMode].upperBright,

    lowerBright: data[currentMode].lowerBright,

    num: parseInt(data[currentMode].winNum) || 1,

    time: new Date().toLocaleString(),

    results: Glen,

    tag: "",
  };

  shoppingList.push(item);

  historyList.unshift(item);

  if (shoppingList.length > 100) shoppingList.shift();

  if (historyList.length > 100) historyList.pop();

  localStorage.setItem("windowShoppingList", JSON.stringify(shoppingList));

  localStorage.setItem("windowHistoryList", JSON.stringify(historyList));

  renderList();

  renderHistory();

  alert("已加入清单");
}

/* =========================================================
   清单
========================================================= */

function renderList() {
  const box = $("listContent");

  if (!shoppingList.length) {
    box.innerHTML = '<div class="panel-empty">暂无清单内容</div>';

    return;
  }

  box.innerHTML = "";

  [...shoppingList].reverse().forEach((item) => {
    const div = document.createElement("div");

    div.className = "list-item";

    let html = "";

    item.results.forEach((r) => {
      html += `${escapeHtml(r.name)}：${escapeHtml(r.size)} ${escapeHtml(r.count)}<br>`;
    });

    const num = item.num || 1;

    const tag = listEditMode
      ? `<input
class="list-tag-input"
data-id="${item.id}"
value="${escapeHtml(item.tag || "")}"
placeholder="输入标签">`
      : item.tag
        ? `<span class="list-tag">
${escapeHtml(item.tag)}
</span>`
        : "";

    div.innerHTML = `

<button
type="button"
class="delete-btn"
data-id="${item.id}">
×
</button>

<div class="list-item-title">

${tag}

${escapeHtml(item.mode)}

<span class="item-size">
高${item.H}×宽${item.W}×${num}个
</span>

</div>

<div class="list-item-detail">

${html}

</div>

`;

    box.appendChild(div);
  });

  box.querySelectorAll(".list-tag-input").forEach((input) => {
    input.addEventListener("click", function (e) {
      e.stopPropagation();
    });

    input.addEventListener("input", function () {
      const id = Number(this.dataset.id);

      const item = shoppingList.find((i) => i.id === id);

      if (item) {
        item.tag = this.value;

        localStorage.setItem("windowShoppingList", JSON.stringify(shoppingList));
      }
    });

    input.addEventListener("keydown", function (e) {
      if (e.key === "Enter") this.blur();
    });
  });

  box.querySelectorAll(".delete-btn").forEach((btn) => {
    btn.onclick = function (e) {
      e.stopPropagation();

      const id = Number(this.dataset.id);

      shoppingList = shoppingList.filter((i) => i.id !== id);

      localStorage.setItem("windowShoppingList", JSON.stringify(shoppingList));

      renderList();
    };
  });
}

/* =========================================================
   恢复历史
========================================================= */

function restoreHistory(item) {
  currentMode = item.modeValue;

  $("modeDropdown").value = String(currentMode);

  data[currentMode] = {
    winW: item.W || "",

    winH: item.H || "",

    fanW: item.FW || "",

    fanH: item.FH || "",

    upperBright: item.upperBright || "",

    lowerBright: item.lowerBright || "",

    winNum: item.num || 1,
  };

  if (currentMode === 3) {
    threeLeftTong = !!item.threeLeftTong;
  }

  if (currentMode === "double") {
    doubleThreePart = !!item.doubleThreePart;
  }

  /* 断桥门型（旧记录没有该字段，按四门） */

  if (currentMode === "door") {
    doorType = Number(item.doorType) || 4;
  }

  if (currentMode === "balcony") {
    if (Array.isArray(item.balconyParts) && item.balconyParts.length) {
      balconyParts = [...item.balconyParts];
    } else {
      balconyParts = ["固", "扇", "固"];
    }
  }

  /* 恢复历史时同步大类/子模式/门型按钮的高亮 */
  updateKindButtons();

  updateModeInputs();

  updateGlassRows();

  updateModeSwitchButton();

  updateBalconyButtons();

  loadDataToInputs();

  /*
   * 大门模式有自己的一组默认值（门框宽 1970 / 门总高 2600 …），
   * loadDataToInputs 写进去的还是公用默认值，
   * 这里补一次大门初始化，避免从历史回到大门时拿错默认值
   */

  if (currentMode === "door" && typeof initDoorMode === "function") {
    initDoorMode();
  }

  calc();

  window.scrollTo({
    top: 0,

    behavior: "smooth",
  });
}

/* =========================================================
   历史
========================================================= */

function renderHistory() {
  const box = $("historyContent");

  if (!historyList.length) {
    box.innerHTML = '<div class="panel-empty">暂无历史记录</div>';

    return;
  }

  box.innerHTML = "";

  historyList.forEach((item) => {
    const div = document.createElement("div");

    div.className = "history-item";

    let html = "";

    item.results.forEach((r) => {
      html += `${escapeHtml(r.name)}：${escapeHtml(r.size)} ${escapeHtml(r.count)}<br>`;
    });

    const num = item.num || 1;

    const tag = historyEditMode
      ? `<input
class="history-tag-input"
data-id="${item.id}"
value="${escapeHtml(item.tag || "")}"
placeholder="输入标签">`
      : item.tag
        ? `<span class="history-tag">
${escapeHtml(item.tag)}
</span>`
        : "";

    div.innerHTML = `

<button
type="button"
class="history-delete-btn"
data-id="${item.id}">
×
</button>

<div class="history-item-title">

${tag}

${escapeHtml(item.mode)}

<span class="item-size">
高${item.H}×宽${item.W}×${num}个
</span>

</div>

<div class="history-item-detail">

${escapeHtml(item.time)}
<br>

${html}

</div>

`;

    div.addEventListener("click", function (e) {
      if (historyEditMode) return;

      if (e.target.closest(".history-delete-btn")) return;

      restoreHistory(item);
    });

    box.appendChild(div);
  });

  box.querySelectorAll(".history-tag-input").forEach((input) => {
    input.addEventListener("click", function (e) {
      e.stopPropagation();
    });

    input.addEventListener("input", function () {
      const id = Number(this.dataset.id);

      const item = historyList.find((i) => i.id === id);

      if (item) {
        item.tag = this.value;

        localStorage.setItem("windowHistoryList", JSON.stringify(historyList));
      }
    });

    input.addEventListener("keydown", function (e) {
      if (e.key === "Enter") this.blur();
    });
  });

  box.querySelectorAll(".history-delete-btn").forEach((btn) => {
    btn.addEventListener("click", function (e) {
      e.stopPropagation();

      const id = Number(this.dataset.id);

      historyList = historyList.filter((i) => i.id !== id);

      localStorage.setItem("windowHistoryList", JSON.stringify(historyList));

      renderHistory();
    });
  });
}

/* =========================================================
   导出清单（v6.3）
   生成可直接发给客户的文本，支持系统分享或下载 txt
========================================================= */

function buildListText() {
  if (!shoppingList.length) return "";

  const lines = [];

  lines.push("门窗下料清单");
  lines.push("生成时间：" + new Date().toLocaleString());
  lines.push("共 " + shoppingList.length + " 项");
  lines.push("");

  shoppingList.forEach(function (item, idx) {
    const num = item.num || 1;

    lines.push("【" + (idx + 1) + "】" + (item.tag ? "[" + item.tag + "] " : "") + (item.mode || ""));
    lines.push("  高" + item.H + " × 宽" + item.W + " × " + num + " 套");

    (item.results || []).forEach(function (r) {
      lines.push("  · " + r.name + "：" + r.size + " " + (r.count || ""));
    });

    lines.push("");
  });

  return lines.join("\n");
}

function exportList() {
  const text = buildListText();

  if (!text) {
    alert("清单是空的");
    return;
  }

  if (navigator.share) {
    navigator.share({ title: "门窗下料清单", text: text }).catch(function () {});
    return;
  }

  const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");

  a.href = url;
  a.download = "门窗下料清单.txt";
  a.click();

  setTimeout(function () {
    URL.revokeObjectURL(url);
  }, 1000);
}

/* =========================================================
   编辑清单
========================================================= */

function toggleListEdit() {
  listEditMode = !listEditMode;

  $("listEditButton").textContent = listEditMode ? "完成" : "编辑";

  renderList();
}

/* =========================================================
   编辑历史
========================================================= */

function toggleHistoryEdit() {
  historyEditMode = !historyEditMode;

  $("historyEditButton").textContent = historyEditMode ? "完成" : "编辑";

  renderHistory();
}

/* =========================================================
   面板
========================================================= */

function toggleList() {
  $("listPanel").classList.toggle("show");

  $("historyPanel").classList.remove("show");
}

function toggleHistory() {
  $("historyPanel").classList.toggle("show");

  $("listPanel").classList.remove("show");
}

/* =========================================================
   清空
========================================================= */

function clearList() {
  shoppingList = [];

  localStorage.setItem("windowShoppingList", "[]");

  renderList();
}

function clearHistory() {
  historyList = [];

  localStorage.setItem("windowHistoryList", "[]");

  renderHistory();
}

/* =========================================================
   导出图片
========================================================= */

function exportGlassImage() {
  saveCurrentData();

  const glassList = getCurrentResults();

  if (!glassList.length) {
    alert("暂无玻璃尺寸");

    return;
  }

  const sourceSvg = $("diagramWrapper").querySelector("svg");

  if (!sourceSvg) {
    alert("暂无窗型图");

    return;
  }

  const svgClone = sourceSvg.cloneNode(true);

  svgClone.setAttribute("xmlns", "http://www.w3.org/2000/svg");

  svgClone.setAttribute("width", "220");

  svgClone.setAttribute("height", "180");

  let svgText = new XMLSerializer().serializeToString(svgClone);

  svgText = svgText.replace(/var\(--text-main\)/g, "#333");

  svgText = svgText.replace(
    /<defs>/,

    `<style>

.svg-canvas rect{
fill:#fff;
stroke:#333;
stroke-width:2
}

.svg-canvas line{
stroke:#333;
stroke-width:2
}

.svg-canvas polyline{
fill:none;
stroke:#333;
stroke-width:2;
stroke-linecap:round;
stroke-linejoin:round
}

.dimension-line{
stroke:#333;
stroke-width:1.2;
fill:none
}

.dimension-dash{
stroke:#333;
stroke-width:1;
stroke-dasharray:3 3;
fill:none
}

.dimension-text{
fill:#333;
font-family:Arial,sans-serif;
font-size:8px;
font-weight:400;
letter-spacing:-.3px;
text-anchor:middle;
dominant-baseline:middle
}

</style><defs>`,
  );

  const canvas = document.createElement("canvas");

  const canvasW = 1800;

  const cardH = 150;

  const gap = 20;

  const cardTop = 60;

  const cardsHeight = glassList.length * cardH + (glassList.length - 1) * gap;

  const diagramW = 700;

  const diagramH = diagramW * (180 / 220);

  const canvasH = Math.max(1100, Math.ceil(Math.max(cardsHeight, diagramH) + 120));

  canvas.width = canvasW * 2;

  canvas.height = canvasH * 2;

  const ctx = canvas.getContext("2d");

  ctx.scale(2, 2);

  ctx.fillStyle = "#fff";

  ctx.fillRect(0, 0, canvasW, canvasH);

  const img = new Image();

  const svgBlob = new Blob([svgText], {
    type: "image/svg+xml;charset=utf-8",
  });

  const url = URL.createObjectURL(svgBlob);

  img.onload = () => {
    const diagramX = 50;

    const diagramY = 60 + (Math.max(cardsHeight, diagramH) - diagramH) / 2;

    ctx.drawImage(img, diagramX, diagramY, diagramW, diagramH);

    const cardX = 820;

    const cardW = 930;

    glassList.forEach((item, i) => {
      const y = cardTop + i * (cardH + gap);

      const isScreen = item.name.includes("纱窗");

      ctx.save();

      ctx.strokeStyle = isScreen ? "#ff9800" : "#e3e3e3";

      ctx.lineWidth = 2;

      ctx.beginPath();

      ctx.roundRect(cardX, y, cardW, cardH, 26);

      ctx.stroke();

      ctx.fillStyle = isScreen ? "#ff9800" : "#333";

      ctx.font = "900 68px Arial,sans-serif";

      ctx.textAlign = "center";

      ctx.textBaseline = "middle";

      ctx.fillText(item.size, cardX + cardW / 2 - 35, y + cardH / 2);

      ctx.fillStyle = isScreen ? "#ff9800" : "#666";

      ctx.font = "800 38px Arial,sans-serif";

      ctx.textAlign = "right";

      ctx.fillText(item.count, cardX + cardW - 35, y + cardH / 2);

      if (isScreen) {
        ctx.fillStyle = "#ff9800";

        ctx.font = "900 34px Arial,sans-serif";

        ctx.textAlign = "left";

        ctx.fillText("纱窗", cardX + 35, y + cardH / 2);
      }

      ctx.restore();
    });

    URL.revokeObjectURL(url);

    canvas.toBlob(async (blob) => {
      if (!blob) {
        alert("导出失败");

        return;
      }

      const file = new File([blob], "玻璃尺寸.png", {
        type: "image/png",
      });

      if (
        navigator.share &&
        navigator.canShare &&
        navigator.canShare({
          files: [file],
        })
      ) {
        try {
          await navigator.share({
            files: [file],

            title: "玻璃尺寸",
          });
        } catch (e) {}
      } else {
        const a = document.createElement("a");

        a.download = "玻璃尺寸.png";

        a.href = URL.createObjectURL(blob);

        a.click();

        setTimeout(() => {
          URL.revokeObjectURL(a.href);
        }, 1000);
      }
    }, "image/png");
  };

  img.onerror = () => {
    URL.revokeObjectURL(url);

    alert("导出失败");
  };

  img.src = url;
}

/* =========================================================
   页面输入
========================================================= */

function bindInput(id) {
  const input = $(id);

  if (!input) return;

  if (!input.dataset.bound) {
    input.dataset.bound = "1";

    /*
     * 大门模式的输入框由 mode-door.js 的
     * bindDoorInputClear() 统一处理点按清空，
     * 这里不能再挂一次，否则 value 会被清两遍、
     * 并与 door 的 dataset 状态打架
     */

    input.addEventListener("click", function () {
      /*
       * 大门模式的输入框由 mode-door.js 的
       * bindDoorClickClear() 统一处理点按清空，
       * 这里直接跳过，避免 value 被清两次、
       * 两次 dispatch('input') 让光标跳回旧值
       */

      if (currentMode === "door" && this.dataset.doorClickBind) return;

      clearInputOnClick(this);
    });

    input.addEventListener("input", calc);
  }
}

/* =========================================================
   上亮输入框：搬进图示标题栏
========================================================= */

/*
 * 上亮框在「收起图示」那一行靠左显示，
 * 与大门模式的排布保持一致。
 * 所有模式都搬，切模式时只改标签/显隐，不再搬来搬去
 */

function moveBrightToTitleRow() {
  const u = $("upperBrightBox");

  const titleRow = document.querySelector(".diagram-title-row");

  if (!u || !titleRow) return;

  if (u.parentElement !== titleRow) {
    titleRow.insertBefore(u, titleRow.firstChild);
  }

  titleRow.classList.add("has-bright");

  u.classList.add("upper-bright-inline");
}

/* 输入框宽度跟随数字长度，避免右侧留白 */
function fitBrightInputWidth() {
  const input = $("upperBright");

  if (!input) return;

  const len = String(input.value || "").length || 1;

  /* 每个数字约 0.62em，至少留 1 个字符宽 */
  input.style.width = (Math.max(1, len) * 0.66).toFixed(2) + "em";
}

/* =========================================================
   大门/普通模式输入显示
========================================================= */

function updateModeInputs() {
  const u = $("upperBrightBox");

  const l = $("lowerBrightBox");

  const fanWBox = $("fanWBox");

  const fanHBox = $("fanHBox");

  if (currentMode === "door") {
    /*
大门：

winW → 门框宽
winH → 门总高
fanW → 门宽空
fanH → 隐藏
上亮 → 图示标题显示
*/

    fanWBox.classList.remove("hidden");

    fanHBox.classList.add("hidden");

    /*
     * 四门：两侧有固定格，中间是「门宽空」
     * 双门 / 单门：整门就只有扇子，「门宽」即真正的门宽
     */

    fanWBox.querySelector("label").textContent = doorType === 4 ? "门宽空" : "门扇宽";

    $("winW").previousElementSibling.textContent = "门框宽";

    $("winH").previousElementSibling.textContent = "门总高";

    u.classList.add("hidden");

    l.classList.add("hidden");

    if (typeof initDoorMode === "function") initDoorMode();
  } else {
    fanWBox.classList.remove("hidden");

    fanHBox.classList.remove("hidden");

    fanWBox.querySelector("label").textContent = "扇子宽";

    $("winW").previousElementSibling.textContent = "窗总宽";

    $("winH").previousElementSibling.textContent = "窗总高";

    /* 离开大门模式时收掉输入提示条，避免残留 */
    if (typeof updateDoorWarning === "function") updateDoorWarning("");

    /*
     * 同时摘掉标题栏的大门专用类（上亮框与按钮的间距）
     * updateDiagramTitleLayout 只在进入大门时执行，
     * 不在这里清就会一直残留到其它窗型
     */

    const titleRowEl = document.querySelector(".diagram-title-row");

    if (titleRowEl) {
      titleRowEl.classList.remove("door-title-row");

      titleRowEl.style.removeProperty("gap");
    }

    /*
     * 门板高度输入框 / 门板尺寸行 只属于大门模式：
     * updateDoorInputs() 只在进入大门时执行，
     * 不在这里隐藏就会残留到 4块 / 3块 / 双扇 / 阳台
     */

    const panelBoxEl = $("doorPanelHBox");

    if (panelBoxEl) {
      panelBoxEl.classList.add("hidden");

      panelBoxEl.style.display = "none";
    }

    const doorPanelRowEl = $("rowDoorPanel");

    if (doorPanelRowEl) {
      doorPanelRowEl.classList.add("hidden");

      doorPanelRowEl.style.display = "none";
    }

    /*
     * 上亮输入框：所有模式统一放进 .diagram-title-row
     * 与「收起图示」按钮同一行（上亮靠左、按钮靠右），
     * 不再占用输入区的一格
     */

    moveBrightToTitleRow();

    u.classList.remove("door-bright-box");

    delete u.dataset.doorMoved;

    u.style.cssText = "";

    u.removeAttribute("style");

    u.querySelector("label").textContent = "上亮:";

    /*
     * 上亮输入框：所有模式统一显示、可编辑
     * （下亮仍只在阳台模式出现）
     */

    u.classList.remove("hidden");

    if (currentMode === "balcony") {
      l.classList.remove("hidden");
    } else {
      l.classList.add("hidden");
    }
  }
}

/* =========================================================
   玻璃表格
========================================================= */

function updateGlassRows() {
  const balcony = currentMode === "balcony";

  $("rowBrightFan").className = "hidden";

  $("rowLowerFan").className = "hidden";

  $("rowSash").className = "hidden";

  $("rowScreen").classList.add("hidden");

  /* =========================
   大门
========================= */

  if (currentMode === "door") {
    $("rowBright").className = "hidden";

    $("rowBrightFan").className = "hidden";

    $("rowLowerFan").className = "hidden";

    $("rowSash").className = "hidden";

    $("rowScreen").classList.add("hidden");

    $("label1").textContent = "固定玻璃";

    $("label2").textContent = "双扇玻璃";

    $("rowG1").className = "";

    $("rowG4").className = "";

    return;
  }

  /* =========================
   阳台
========================= */

  if (balcony) {
    $("rowBright").className = "";

    $("rowBrightFan").className = "";

    $("rowLowerFan").className = "";

    $("rowSash").className = "";

    $("label1").textContent = "固定主玻璃";

    $("label2").textContent = "上亮固定玻璃";

    $("label3").textContent = "下亮固定玻璃";

    $("label4").textContent = "上亮扇固定玻璃";

    $("label5").textContent = "下亮扇固定玻璃";

    $("label6").textContent = "扇子玻璃";

    /* 阳台也有纱窗（按扇数计），要显示出来 */
    $("rowScreen").classList.remove("hidden");

    return;
  }

  /* =========================
   普通
========================= */

  $("rowBright").className = "";

  /*
   * 纱窗行：4块 / 3块 / 双扇 / 阳台 都要显示
   * （上面默认把它设成 hidden 了，
   *   大门分支会提前 return，所以这里补回来）
   */

  $("rowScreen").classList.remove("hidden");

  /* =========================
   4块
========================= */

  if (currentMode === 4) {
    $("rowBrightFan").className = "";

    $("label1").textContent = "下固定玻璃";

    $("label2").textContent = "上亮固定玻璃";

    $("label3").textContent = "上亮扇固定玻璃";

    $("label4").textContent = "扇子玻璃";
  }

  /* =========================
   双扇
========================= */
  else if (currentMode === "double") {
    if (doubleThreePart) {
      $("rowBrightFan").className = "";

      $("label1").textContent = "下中间固定玻璃";

      $("label2").textContent = "左右上亮玻璃";

      $("label3").textContent = "中间上亮玻璃";

      $("label4").textContent = "扇子玻璃";
    } else {
      $("rowBrightFan").className = "hidden";

      $("label1").textContent = "下中间玻璃";

      $("label2").textContent = "上亮玻璃";

      $("label4").textContent = "扇子玻璃";
    }
  }

  /* =========================
   3块
========================= */
  else {
    if (threeLeftTong) {
      $("label1").textContent = "通高大玻璃";

      $("label2").textContent = "右侧上亮玻璃";

      $("label4").textContent = "扇子玻璃";
    } else {
      $("label1").textContent = "下固定玻璃";

      $("label2").textContent = "上亮玻璃";

      $("label4").textContent = "扇子玻璃";
    }
  }
}

/* =========================================================
   模式按钮
========================================================= */

/*
 * 3块 / 双扇 的「切换」按钮行
 * v4.0 起由窗户子模式按钮（4块/3块/3块左通/双扇）取代，
 * 这里只保证它不再显示，逻辑保留供兼容
 */

function updateModeSwitchButton() {
  const row = $("modeSwitchRow");

  const btn = $("modeSwitchButton");

  row.classList.remove("show");

  if (currentMode === 3) {
    btn.textContent = threeLeftTong ? "切换为右开扇" : "切换为左通";
  } else if (currentMode === "double") {
    /*
     * 双扇的「三分格」变体按钮 v4.0 起也不再显示，
     * 只在子模式里保留原双扇一种（需要三分格请用历史记录）
     */

    row.classList.remove("show");

    btn.textContent = doubleThreePart ? "切换为原双扇窗型" : "切换为三分格双扇窗型";
  } else {
    row.classList.remove("show");
  }
}

/* =========================================================
   阳台按钮
========================================================= */

function updateBalconyButtons() {
  const row = $("balconyAddRow");

  if (currentMode === "balcony") {
    row.classList.add("show");
  } else {
    row.classList.remove("show");
  }
}

/* =========================================================
   窗型按钮（v4.0）
-----------------------------------------------------------
   三大类：窗户 / 阳台 / 大门
   窗户下 4 个按钮：
     sub=4        → currentMode=4
     sub=3right   → currentMode=3, threeLeftTong=false
     sub=3left    → currentMode=3, threeLeftTong=true
     sub=double   → currentMode='double'

   下拉框 #modeDropdown 仍然保留（隐藏），
   用来兼容历史记录 / 清单 / 旧调用
========================================================= */

/* 当前选中的窗户子模式 */
let currentSub = "4";

/* 断桥门类型：4=四门（默认）2=双门 1=单门 */
let doorType = (function () {
  const saved = parseInt(localStorage.getItem("mc_doorType"), 10);
  return [1, 2, 4].includes(saved) ? saved : 4;
})();

/* 供 mode-door.js 读取 */
window.getDoorType = function () {
  return doorType;
};

/* 当前大类：'window' | 'balcony' | 'door' */
let currentKind = "window";

/* 把 (大类 + 子模式) 写回隐藏的 select，保持兼容 */
function syncDropdown() {
  const sel = $("modeDropdown");

  if (!sel) return;

  if (currentKind === "balcony") {
    sel.value = "balcony";
  } else if (currentKind === "door") {
    sel.value = "door";
  } else {
    /*
     * 3块 / 4块 / 双扇
     * 3块的「右开扇 / 左通」靠 threeLeftTong 区分，select 都是 '3'
     */

    sel.value = currentSub === "4" ? "4" : currentSub === "double" ? "double" : "3";
  }
}

/* 同步按钮高亮 */
function updateKindButtons() {
  document.querySelectorAll(".kind-btn").forEach(function (b) {
    const on = b.dataset.kind === currentKind;

    b.classList.toggle("active", on);
  });

  const subRow = $("subModeRow");

  if (subRow) {
    subRow.classList.toggle("show", currentKind === "window");
  }

  /* 断桥门型行只在「大门」下显示 */
  const doorRow = $("doorTypeRow");

  if (doorRow) {
    doorRow.classList.toggle("show", currentKind === "door");
  }

  document.querySelectorAll(".door-type-btn").forEach(function (b) {
    b.classList.toggle("active", Number(b.dataset.door) === doorType);
  });

  document.querySelectorAll(".sub-mode-btn").forEach(function (b) {
    b.classList.toggle("active", b.dataset.sub === currentSub);
  });

  if (typeof updateSubButtonLabels === "function") updateSubButtonLabels();
}

/* 由子模式名推导 currentMode 与变体开关 */
function applySubMode(sub) {
  currentSub = sub;

  if (sub === "4") {
    currentMode = 4;
    threeLeftTong = false;
  } else if (sub === "3") {
    /* 3块：变体由 threeLeftTong 决定，切换按钮不改它 */
    currentMode = 3;
  } else if (sub === "double") {
    currentMode = "double";
  }

  syncDropdown();

  updateKindButtons();
}

/* =========================================================
   双击切换变体（v4.1）
-----------------------------------------------------------
   3块：右开扇 ↔ 左通
   双扇：原双扇 ↔ 三分格
   其它按钮双击无效果
========================================================= */

function toggleSubVariant() {
  if (currentSub === "3") {
    threeLeftTong = !threeLeftTong;

    updateGlassRows();

    calc();

    return true;
  }

  if (currentSub === "double") {
    doubleThreePart = !doubleThreePart;

    updateGlassRows();

    calc();

    return true;
  }

  return false;
}

/* 按钮上显示当前变体提示 */
function updateSubButtonLabels() {
  document.querySelectorAll(".sub-mode-btn").forEach(function (b) {
    const sub = b.dataset.sub;

    let base = sub === "4" ? "4块" : sub === "3" ? "3块" : "双扇";

    if (sub === "3") {
      b.textContent = base + (threeLeftTong ? "·左通" : "·右开");
    } else if (sub === "double") {
      b.textContent = base + (doubleThreePart ? "·三分格" : "");
    } else {
      b.textContent = base;
    }
  });
}

/* 大类切换 */
function setKind(kind) {
  saveCurrentData();

  currentKind = kind;

  if (kind === "balcony") {
    currentMode = "balcony";
    syncDropdown();
  } else if (kind === "door") {
    currentMode = "door";
    syncDropdown();
  } else {
    applySubMode(currentSub || "4");
  }

  /* 大类切换后必须刷新按钮高亮与子按钮行显隐 */
  updateKindButtons();

  updateModeInputs();

  updateGlassRows();

  updateModeSwitchButton();

  updateBalconyButtons();

  loadDataToInputs();

  if (currentKind === "door" && typeof initDoorMode === "function") {
    if ($("upperBright") && !String($("upperBright").value).trim()) $("upperBright").value = 491;

    initDoorMode();
  }

  calc();
}

/* =========================================================
   切换模式
========================================================= */

/*
 * 兼容入口：老代码/历史记录仍会调用 switchMode('4'|'3'|'double'|...)
 * v4.0 起同时更新 大类 + 子模式按钮的高亮
 */

function switchMode(v) {
  saveCurrentData();

  currentMode = v === "3" || v === "4" ? +v : v;

  /* 同步新的按钮状态 */
  if (currentMode === "balcony") {
    currentKind = "balcony";
  } else if (currentMode === "door") {
    currentKind = "door";
  } else {
    currentKind = "window";

    if (currentMode === 4) {
      currentSub = "4";
    } else if (currentMode === "double") {
      currentSub = "double";
    } else if (currentMode === 3) {
      currentSub = "3";
    }
  }

  syncDropdown();

  updateKindButtons();

  updateModeInputs();

  updateGlassRows();

  updateModeSwitchButton();

  updateBalconyButtons();

  loadDataToInputs();

  /*
   * 旧版每次切进大门都把上亮强制写回 491，
   * 用户自己输的上亮（以及历史记录里的上亮）会被覆盖，
   * 现在只在「上亮为空」时才补默认值
   */

  if (currentMode === "door") {
    if ($("upperBright") && !String($("upperBright").value).trim()) $("upperBright").value = 491;

    if (typeof initDoorMode === "function") initDoorMode();
  }

  calc();
}

/* =========================================================
   3块 / 双扇
========================================================= */

/*
 * 3块 / 双扇 的旧「切换」按钮：
 * v4.0 起改为在子模式按钮里直接选，
 * 这里保留以兼容可能存在的调用
 */

function toggleModeSwitch() {
  if (currentMode === 3) {
    setKind("window");

    applySubMode(threeLeftTong ? "3right" : "3left");

    updateModeInputs();

    updateGlassRows();

    updateModeSwitchButton();

    calc();

    return;
  }

  if (currentMode === "double") {
    doubleThreePart = !doubleThreePart;

    updateGlassRows();

    updateModeSwitchButton();

    calc();

    return;
  }
}

/* =========================================================
   阳台增加
========================================================= */

function addBalconyPart(type) {
  if (currentMode !== "balcony") return;

  balconyParts.push(type);

  calc();
}

/* =========================================================
   核心计算
========================================================= */

function calc() {
  if (currentMode === "balcony") {
    const totalH = +$("winH").value || 0;

    const uB = +$("upperBright").value || 0;

    const lB = +$("lowerBright").value || 0;

    const fH = +$("fanH").value || 0;

    if (totalH > 0) {
      const active = document.activeElement;

      if (active === $("fanH")) {
        const computedLB = totalH - 100 - 29 - 29 - uB - fH;

        if (computedLB > 0) $("lowerBright").value = Math.round(computedLB);
      } else if (active === $("upperBright") || active === $("lowerBright")) {
        const computedFH = totalH - 100 - 29 - 29 - uB - lB;

        if (computedFH > 0) $("fanH").value = Math.round(computedFH);
      } else if (uB > 0 && lB > 0 && active !== $("fanH")) {
        const computedFH = totalH - 100 - 29 - 29 - uB - lB;

        if (computedFH > 0) $("fanH").value = Math.round(computedFH);
      }
    }
  }

  /*
   * v3.0：上亮 与 扇子高 双向联动
   * （只改高度，宽度公式不受影响）
   *
   *   4块 / 3块 / 双扇：
   *     下部净高 = 总高 - 上下框(100) - 上亮 - 中柱(29)
   *     扇子高   = 下部净高 - 玻璃间隙(10)
   *   阳台：已有自己的上下亮联动，不在这里处理
   *
   * 以最后编辑的那个输入框为准，反推另一个
   */

  function syncBrightAndFan() {
    /*
     * 4块 与 3块 在启用数字型 currentMode（4 / 3），
     * 双扇是字符串 'double'，两者都要判到
     */

    if (Number(currentMode) !== 4 && Number(currentMode) !== 3 && currentMode !== "double") return;

    const totalH = +$("winH").value || 0;

    if (totalH <= 0) return;

    const active = document.activeElement;

    const uEl = $("upperBright");
    const fEl = $("fanH");

    const UB = +uEl.value || 0;
    const FH = +fEl.value || 0;

    /*
     * 改了上亮 → 反推扇子高
     *   原公式：上亮玻璃高 = H-100-FH-29-10
     *   上亮(U) = 玻璃高 + 10 → FH = H-100-U-29
     */

    if (active === uEl && UB > 0) {
      const nextFH = totalH - 100 - UB - 29;

      $("fanH").value = Math.max(0, Math.round(nextFH));

      return;
    }

    /* 改了扇子高 → 反推上亮：U = H-100-FH-29 */
    if (active === fEl && FH > 0) {
      const nextUB = totalH - 100 - FH - 29;

      $("upperBright").value = Math.max(0, Math.round(nextUB));

      return;
    }

    /* 其它情况：上亮为空时用扇子高补齐 */
    if (!(UB > 0) && FH > 0) {
      $("upperBright").value = Math.max(0, Math.round(totalH - 100 - FH - 29));
    }
  }

  syncBrightAndFan();

  fitBrightInputWidth();

  saveCurrentData();

  clearResults();

  const values = getValues();

  /*
   * 数量：0 或空都按 1 处理（原来 0 会被 || 变成 1，
   * 但输入框里仍显示 0，容易误读成 0 套）
   */

  let num = parseInt($("winNum").value, 10);

  if (!Number.isFinite(num) || num < 1) {
    num = 1;

    if ($("winNum")) $("winNum").value = 1;
  }

  const ctx = {
    ...values,
    num,
  };

  drawDiagram();

  /* =============================================
   面积 / 包边
   输入不完整时不再显示 0.00 这种假数据
============================================= */

  const areaValid = ctx.W > 0 && ctx.H > 0;

  $("areaNum").textContent = areaValid ? ((ctx.W * ctx.H * num) / 1e6).toFixed(2) : "-";

  $("areaUnit").textContent = areaValid ? "㎡ (共 " + num + " 套)" : "";

  $("perimeterNum").textContent = areaValid ? (((ctx.H + ctx.W) / 1000) * 2 * num).toFixed(2) : "-";

  if (currentMode === "balcony") {
    calculateModeBalcony(ctx);
  } else if (currentMode === "door") {
    calculateModeDoor(ctx);
  } else if (currentMode === "double") {
    calculateModeDouble(ctx);
  } else if (currentMode === 3) {
    calculateMode3(ctx);
  } else {
    calculateMode4(ctx);
  }
}

/* =========================================================
   图示入口
========================================================= */

/*
 * 图示容器样式重置（v5.9）
 * 大门模式会把容器高度按画布比例调高，
 * 切回窗户/阳台时要还原成默认 220×180，
 * 否则窗户图示会被拉变形或留大片空白
 */

function resetDiagramWrapperStyle() {
  const wrapper = $("diagramWrapper");

  if (!wrapper) return;

  wrapper.style.width = "";
  wrapper.style.maxWidth = "";
  wrapper.style.height = "";
  wrapper.style.aspectRatio = "";
}

function drawDiagram() {
  resetDiagramWrapperStyle();

  const wrapper = $("diagramWrapper");

  if (!wrapper) {
    console.error("找不到图示容器 #diagramWrapper");

    return;
  }

  if (currentMode === 4) {
    drawMode4();
  } else if (currentMode === 3) {
    threeLeftTong ? drawMode3Left() : drawMode3Right();
  } else if (currentMode === "double") {
    doubleThreePart ? drawModeDoubleThree() : drawModeDoubleOriginal();
  } else if (currentMode === "balcony") {
    drawModeBalcony();
  } else if (currentMode === "door") {
    drawModeDoor();
  }
}

/* =========================================================
   页面初始化
========================================================= */

window.addEventListener("load", function () {
  /* 模式：大分类按钮 */

  document.querySelectorAll(".kind-btn").forEach(function (btn) {
    btn.addEventListener("click", function () {
      setKind(this.dataset.kind);
    });
  });

  /* 模式：窗户子分类按钮 */

  document.querySelectorAll(".sub-mode-btn").forEach(function (btn) {
    btn.addEventListener("click", function () {
      const sub = btn.dataset.sub;

      /*
       * 单击同一个按钮 = 在该模式的变体间循环：
       *   3块 ：右开扇 → 左通 → 右开扇 …
       *   双扇：原双扇 → 三分格 → 原双扇 …
       *   4块 ：无变体，点了没变化
       */

      if (sub === currentSub) {
        if (!toggleSubVariant()) {
          return;
        }

        updateSubButtonLabels();

        updateModeSwitchButton();

        return;
      }

      /* 切到别的模式 */
      saveCurrentData();

      currentKind = "window";

      applySubMode(sub);

      updateModeInputs();

      updateGlassRows();

      updateModeSwitchButton();

      updateBalconyButtons();

      loadDataToInputs();

      updateSubButtonLabels();

      calc();
    });
  });

  /* 断桥门类型按钮：四门 / 双门 / 单门 */

  document.querySelectorAll(".door-type-btn").forEach(function (btn) {
    btn.addEventListener("click", function () {
      const t = Number(this.dataset.door);

      if (t === doorType) return;

      saveCurrentData();

      doorType = t;

    try {
      localStorage.setItem("mc_doorType", String(t));
    } catch (e) {}

      /*
       * 切换门型时给一组合适的默认门宽（门洞宽）：
       *   四门 1970（两侧带固定，沿用原默认）
       *   双门 1200
       *   单门 900
       */

      const defW = t === 4 ? 1970 : t === 2 ? 1200 : 900;

      if ($("winW")) $("winW").value = defW;

      /*
       * 四门：门宽空要单独输入（两侧固定后剩下的中间区）
       * 单/双门：门宽空 = 门洞宽，自动填好
       */

      if ($("fanW")) {
        $("fanW").value = t === 4 ? 1304 : defW - 100;
      }

      /*
       * 门型变了要刷新输入框标签
       * （四门叫「门宽空」，双门/单门叫「门扇宽」）
       */

      updateModeInputs();

      updateKindButtons();

      calc();
    });
  });

  /* 兼容：隐藏的下拉框仍可被程序驱动 */

  $("modeDropdown").addEventListener("change", function () {
    switchMode(this.value);
  });

  /* 数量 */

  $("minusNum").addEventListener("click", function () {
    changeNum(-1);
  });

  $("plusNum").addEventListener("click", function () {
    changeNum(1);
  });

  /* 图示 */

  $("diagramToggle").addEventListener("click", toggleDiagram);

  /* 玻璃 */

  $("glassToggle").addEventListener("click", toggleGlass);

  /* 包边 */

  $("perimeterToggle").addEventListener("change", togglePerimeter);

  /* 导出 */

  $("exportButton").addEventListener("click", exportGlassImage);

  /* 清单 */

  $("addListButton").addEventListener("click", addToList);

  const exportListBtn = $("exportListButton");

  if (exportListBtn) {
    exportListBtn.addEventListener("click", exportList);
  }

  $("listButton").addEventListener("click", toggleList);

  /* 历史 */

  $("historyButton").addEventListener("click", toggleHistory);

  $("listEditButton").addEventListener("click", toggleListEdit);

  $("historyEditButton").addEventListener("click", toggleHistoryEdit);

  $("clearListButton").addEventListener("click", clearList);

  $("clearHistoryButton").addEventListener("click", clearHistory);

  /* 3块 / 双扇 */

  $("modeSwitchButton").addEventListener("click", toggleModeSwitch);

  /* 阳台 */

  $("addFixedButton").addEventListener("click", function () {
    addBalconyPart("固");
  });

  $("addFanButton").addEventListener("click", function () {
    addBalconyPart("扇");
  });

  /* 输入 */

  bindInput("winNum");

  bindInput("winH");

  bindInput("winW");

  bindInput("fanW");

  bindInput("fanH");

  bindInput("upperBright");

  bindInput("lowerBright");

  /* 初始化 */

  updateKindButtons();

  updateSubButtonLabels();

  fitBrightInputWidth();

  loadDataToInputs();

  updateModeInputs();

  updateGlassRows();

  updateModeSwitchButton();

  updateBalconyButtons();

  renderList();

  renderHistory();

  $("glassTableWrap").classList.remove("show");

  $("glassToggle").textContent = "展开玻璃尺寸";

  calc();
});
