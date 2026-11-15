// 门窗助手窗型模块：mode-door.js
// ============================================================
// 大门模式
//
// 上亮高度：
// 放在「收起图示」栏左侧
//
// 门板高度：
// 放在「扇子宽」旁边
//
// 门板尺寸：
// 玻璃尺寸列表中的独立展开/收起行
//
// 输入框：
// 点击后直接清空当前数值
// 然后可以直接输入新数值
//
// 大门结构：
// 上亮：左固定 + 中间门上亮 + 右固定
// 下部：左固定 + 左门扇 + 右门扇 + 右固定
//
// 历史版本：
// 1. 门总高尺寸文字加粗、放大
// 2. 门总宽尺寸文字加粗、放大
// 3. 门总高默认值为 2600
// 4. 门总高文字放在尺寸线外侧
// 5. 门总宽文字放在尺寸线外侧
// 6. 门板高度输入框仅大门模式显示
// 7. 门板尺寸结果行仅大门模式显示
//
// ============================================================
// 下料常数口径（已与用户确认，勿随意改动）
//
//   100   门上下框总扣减
//   39    门中柱宽（注意：窗用 29，门用 39）
//   10    玻璃 / 门板配合间隙
//   65    大门单边槽深（双扇门板 = FW/2 - 65 - 65 - 10）
//
//   左右固定玻璃宽 = (W - 100 - 39 - 39 - FW) / 2 - 10
//   图示标注的左右固定宽 = 该值 + 10（净格宽，不扣配合间隙）
//   双门玻璃宽 = FW / 2 - 65 - 65 - 10（与双扇门板同宽）
// ============================================================
// v2.0  修复与口径调整（详见 README.md）
//
// 1. 图示左右固定宽改为净格宽（不扣玻璃 10mm）：
//    244 = (W-100-39-39-FW)/2 ，料表玻璃宽仍为该值 -10 = 234
// 2. 双门玻璃宽改为与双扇门板同口径：
//    FW/2-65-65-10（默认 1304 → 512）
// 3. 下部净高不再 Math.max(0,·) 夹值，
//    上亮+门板高超过门总高时输出真实负值并标红提示
// 4. 新增输入合理性问题提示条（#doorWarning）
// 5. 门板尺寸行改为 MC.html 静态结构（#rowDoorPanel）
// 6. 输入框点按清空改为同步清空，统一由本文件接管
// 7. 计算与图示共用 readDoorNumber() 取值，避免图上数值与料表不一致
// ============================================================
// v2.1  小改动
//
// 1. 「收起图示」按钮在所有模式统一靠右
// 2. 大门模式下上亮框与按钮同排，间距改用 .door-title-row 类
//    （原来用行内 gap，离开大门后会残留，已在 app.js 里补清理）
// ============================================================
// v2.2  小改动
//
// 1. 上亮输入框在全部模式显示（4块/3块/双扇 原本隐藏）
//    注：4块/3块/双扇 里只作输入框显示，暂不参与计算
// 2. 大门模式下上亮框靠左、按钮靠右
//    （去掉行内 margin:0，改用 CSS margin-right:auto）
// 3. 修复：离开大门后「门板高度」框与门板尺寸行残留
// ============================================================
// v3.0  大改动（计算口径变化）
//
// 1. 4块 / 3块 / 双扇 的上亮高度改为「参与计算」
//    原：gH = H-100-FH-29-10（由扇高反推）
//    新：gH = 上亮 - 10           （由输入的上亮直接算）
//    上亮为空/0 时仍回退原公式，保证旧数据兼容
// 2. 上亮 与 扇子高 双向联动（只影响高度，宽度公式不变）
//    U = H-100-FH-29
// 3. 上述三个模式默认上亮值补为 511（对应 H=1800、扇高=1160）
//    默认结果与 v2.2 完全一致
// 4. 阳台、大门计算逻辑不变
// ============================================================
// v3.1  小改动
//
// 1. 上亮输入框从输入区搬到「收起图示」那一行
//    （靠左，与大门模式排布一致），所有模式统一
// 2. 上亮框样式改由 CSS 类 .upper-bright-inline 控制，
//    去掉 ensureDoorBrightInput() 里的大段内联样式
// ============================================================
// v3.2  小改动
//
// 1. 「收起图示」按钮还原原始样式（padding 4px 12px，不设固定高度）
//    上亮框向它看齐：同字号 .8rem、同内边距，不加粗不放大
// 2. 修复：纱窗尺寸行被默认隐藏后从未恢复显示，
//    4块 / 3块 / 双扇 / 阳台 四个模式都看不到纱窗（原版遗留 bug）
// 3. 恢复被误删的 readDoorNumber() / refresh()
// ============================================================
// v3.3  小改动
//
// 1. 纱窗尺寸行做视觉区分：橙色左侧色条 + 浅橙底 +
//    橙色斜体数字/边框，不再和绿色玻璃行一个样子
// 2. 修复：updateGlassRows() 用 className='' 会清掉
//    #rowScreen 原本的 .screen-row 类，改用 classList
//    （只切换 hidden，保留样式类）
// ============================================================
// v3.4  小改动
//
// 1. 上亮输入框收窄：标签「上亮：」改为「上亮」，
//    内边距 12px→8px、间距 4px→2px，输入框整宽
//    110px → 86px（与「收起图示」77px 基本对齐）
// 2. 输入数字改左对齐，不再居中留白
// ============================================================
// v4.0  结构改版（界面重组）
//
// 1. 去掉「计算模式」下拉框，改成按钮组：
//      大类：窗户 / 阳台 / 大门
//      窗户下：4块 / 3块 / 3块左通 / 双扇
// 2. 原「切换左通」「切换三分格」副按钮不再显示
//    （变体直接由窗户子按钮选择）
// 3. 下拉框 #modeDropdown 保留但隐藏，仅用于程序兼容
//    （历史记录恢复 / 旧代码调用仍可用）
// 4. 计算逻辑与下料数值完全未变
// ============================================================
// v4.1  小改动
//
// 1. 窗户按钮精简为 3 个：4块 / 3块 / 双扇
//    （原「3块左通」合并进「3块」）
// 2. 3块：双击在「右开扇 ↔ 左通」之间切换
//    双扇：双击在「原双扇 ↔ 三分格」之间切换
// 3. 按钮文字实时显示当前变体：3块·右开 / 3块·左通 / 双扇·三分格
// 4. 用 dblclick 事件判断双击，不用点击间隔，
//    避免两次快速单击被误判成双击
// ============================================================
// v4.2  小改动
//
// 1. 取消双击操作，改为「点一下切换一个」：
//    3块 单击循环 右开扇 → 左通 → 右开扇 …
//    双扇 单击循环 原双扇 → 三分格 → 原双扇 …
// 2. 上亮输入框宽度跟随数字长度自适应（JS 同步），
//    去掉数字后面的多余空白，整体宽 86px → 74px
// 3. 标签恢复为「上亮:」（带冒号）
// ============================================================
// v4.3  小改动
//
// 1. 大门门板改为细斜线填充（与参考图一致）
//    此前用 <pattern patternTransform>，在 iOS Safari 上
//    不渲染，改为「clipPath 裁剪 + 一组 45° 斜线」
//    间距 4.5，线宽 0.9，白底
// ============================================================
// v5.0  大改动（新功能：断桥门三种门型）
//
// 「大门」更名为「断桥门」，新增三个门型按钮：
//   四门（默认，原有结构：两侧固定 + 中间双扇）
//   双门（只有两扇，无固定格）
//   单门（只有一扇，无固定格）
//
// 门宽 = 门洞宽 + 100
//
// 门扇玻璃宽：
//   四门 FW/2 - 65 - 65 - 10      例 1304 门宽空 → 512
//   双门 门洞/2 - 65 - 65 - 10     例 1200 门宽 → 门洞1100 → 410
//   单门 门洞 - 65 - 65 - 10       例 900 门宽  → 门洞800  → 660
//
// 门量子宽 = 门洞宽 - 10
//   单门例：900-100-10 = 790
//
// 高度计算三种门型一致（沿用四门逻辑）
// 图示：单门只画一扇、双门画两扇、四门画固定格+双扇
// ============================================================
// v5.1  小改动
//
// 1. 图示按实际宽高比绘制（原来固定 150×135，
//    不管门宽 900 还是 1970 都画得一样宽）
//    画布高度也随门比例自动增加
// 2. 单门只保留一个「〈」开启指示（原来画了两个）
// 3. 尺寸线位置跟随图示（原来写死 22 / 208，
//    门变窄后会跑到门外面）
// 4. 门总宽标注改为跟随门底，不再压住门板
// ============================================================
// v5.2  小改动
//
// 1. 图示再放宽：可用宽度 150 → 190，优先撑满宽度；
//    又高又窄的门额外给宽度下限 95，避免变成细条
// 2. 单门箭头居中放在门扇玻璃正中间（原来在 1/4 处）
// 3. 箭头尺寸固定 13（原来按门宽 ×0.14，单门被缩得很小）
// ============================================================
// v5.3  小改动
//
// 1. 图示不再使用宽高比，改为宽、高各自独立缩放：
//      宽：以 1970 为基准，按门与门的相对宽窄铺到 190
//      高：以 2600 为基准，按门与门的相对高矮铺到 230
//    这样窄门不会被拉成细条，门与门之间仍能直观比较
// ============================================================
// v5.4  小改动
//
// 1. 回到改比例之前的观感：容器 190×150（更宽更扁）
//    高度统一 150，不再叠真实高矮
// 2. 宽度仍按门与门的相对宽窄分配（1970 铺满 190，最小 70）
// ============================================================
// v5.5  小改动
//
// 四门图示太宽，宽度分段压缩：
//   单门 900  → 87（不变）
//   双门 1200 → 116（不变）
//   四门 1970 → 166（原 190）
// 即 1200 以内按原斜率，超过后斜率降为 0.65 倍
// ============================================================
// v5.6  小改动
//
// 1. 单门图示宽度再收窄（87 → 76），双门四门不变
// 2. 开启箭头放大：13 → 18
// 3. 修复单门玻璃条目：
//    - 门扇玻璃数量 2 → 1
//    - 标签改为「上亮玻璃 / 门扇玻璃」
//      （原来是四门的「门上亮中间玻璃 / 双门玻璃」）
//    单门、双门各只有 2 块玻璃
// ============================================================
// v5.7  小改动
//
// 1. 开启箭头垂直居中于门扇玻璃区
//    （原来固定在下部高度 31% 处，看着偏上）
// 2. 图示整体放大：190×150 → 210×172
//    画布 230 → 250，右侧尺寸线边界同步调整
// ============================================================
// v5.8  小改动
//
// 1. 图示标注字号放大（与窗户模式保持相同显示比例）：
//    普通标注 8px → 9px，总宽总高 14px → 16px
//    （大门画布 250 宽 vs 窗户 220 宽，同样 8px 显示更小）
// 2. 图示不再偏上：顶部留白 16 → 34，画布高度 +18
// ============================================================
// v5.9  小改动（重要：图示终于放大了）
//
// 根因：图示容器固定 220×180（窗户的画布比例），
// 大门画布是 250×270，宽高比不同，
// preserveAspectRatio="meet" 按短边缩放 →
// 门图示只画成 146×158，四周大片留白。
//
// 修法：画完图后按画布比例设置容器宽高（aspect-ratio），
// 图示铺满 220 宽；切回窗户/阳台时由
// app.js 的 resetDiagramWrapperStyle() 还原默认尺寸。
//
// 效果：大门图示 146px → 220px 宽（放大约 50%）
// ============================================================
// v6.0  小改动
//
// 门图示铺满 220 宽后偏大，收回到 178px：
// 需要直接给 <svg> 设 width（!important），
// 因为 .svg-canvas 是 width:100%，会覆盖父容器宽度
// ============================================================
// v6.1  小改动（修复）
//
// 门扇门板数量：单门 1 块（原来写死 ×2，单门也显示 2 块）
// 双门 / 四门仍为 2 块
// ============================================================
// v7.1  小改动
//
// 大门图示宽度 178px → 210px
// （卡片可用宽度 350px，240px 偏大，折中取 210px）
//
// v7.0  代码质量优化（大改动，功能与数值不变）
//
// 1. 全项目用 Prettier 格式化（print-width 100）
//    行数 3776 → 2333（app.js）、2646 → 1974（mode-door.js）
//    已用 AST + 模板字符串逐字符比对验证无损
// 2. innerText 全部改为 textContent（38 处）
// 3. 输入校验细化：逐条指出具体哪个输入不合理
//    门框宽 ≤100 / 门宽空超宽 / 上亮 ≥ 门总高 / 门板高超限
// 4. 清单导出：生成文本，支持系统分享或下载 txt
// 5. 断桥门型存入 localStorage，刷新不再回到四门
// 6. 标题栏布局从行内样式移回 CSS
//
// v6.2  健壮性修复
//
// 1. 清单/历史记录保存 doorType（单/双/四门），
//    修复「加清单后恢复变回四门」的问题；旧记录无此字段按四门
// 2. 清单标题区分门型：断桥门-四门 / 双门 / 单门
// 3. 恢复历史时刷新门型按钮高亮
// 4. 数量输入 0 或空时回填为 1（原来结果按 1 算但框里还显示 0）
// ============================================================

(function () {
  "use strict";

  const DOOR_BRIGHT_H = 491;
  const DOOR_DEFAULT_H = 2600;
  const DOOR_DEFAULT_W = 1970;
  const DOOR_DEFAULT_FW = 1304;
  const DOOR_DEFAULT_PANEL_H = 600;

  let doorPanelExpanded = true;

  function getEl(id) {
    return document.getElementById(id);
  }

  function getNumber(id, fallback) {
    const el = getEl(id);
    if (!el) return fallback;

    const value = Number(el.value);

    return Number.isFinite(value) ? value : fallback;
  }

  function roundValue(value) {
    const n = Number(value);

    if (!Number.isFinite(n)) {
      return 0;
    }

    return Math.round(n);
  }

  // ============================================================
  // 输入框点击清除
  // ============================================================

  function clearDoorInputAfterApp(input) {
    if (!input) return;

    input.dataset.doorClearing = "1";
    input.dataset.doorEditing = "1";

    /*
     * 旧版用 setTimeout(0) 清空：
     * 浏览器的 click 事件在 mousedown/mouseup 之后才派发，
     * 清空完成后光标位置会让部分输入法把旧值写回来，
     * 手机上表现为「点了没清掉、或清掉又被填回」。
     * 这里改为同步清空，只在 300ms 内防重复触发。
     */

    if (input.dataset.doorJustCleared === "1") {
      return;
    }

    input.value = "";

    input.dataset.doorJustCleared = "1";

    setTimeout(function () {
      input.dataset.doorJustCleared = "";

      input.dataset.doorClearing = "";
    }, 300);
  }

  function bindDoorInputClear(input, defaultValue) {
    if (!input) return;

    if (input.dataset.doorClearBind) {
      return;
    }

    input.dataset.doorClearBind = "1";

    input.addEventListener("click", function () {
      clearDoorInputAfterApp(input);
    });

    input.addEventListener("focus", function () {
      if (input.dataset.doorEditing === "1") {
        return;
      }

      clearDoorInputAfterApp(input);
    });

    input.addEventListener("input", function () {
      input.dataset.doorEditing = "1";

      const oldValue = input.value;

      const newValue = oldValue.replace(/[^0-9]/g, "");

      if (oldValue !== newValue) {
        input.value = newValue;
      }
    });

    input.addEventListener("blur", function () {
      const value = input.value.trim();

      if (!value) {
        input.value = defaultValue;
      }

      input.dataset.doorEditing = "";
      input.dataset.doorClearing = "";

      const mode = getEl("modeDropdown");

      if (mode && mode.value === "door") {
        calculateModeDoor();
      }
    });
  }

  // ============================================================
  // 门板高度输入框
  // ============================================================

  function ensureDoorPanelInput() {
    const fanWBox = getEl("fanWBox");

    if (!fanWBox) {
      return null;
    }

    let panelBox = getEl("doorPanelHBox");

    if (panelBox) {
      const input = getEl("doorPanelH");

      bindDoorInputClear(input, DOOR_DEFAULT_PANEL_H);

      return panelBox;
    }

    panelBox = document.createElement("div");

    panelBox.className = "input-box hidden";

    panelBox.id = "doorPanelHBox";

    panelBox.innerHTML = `
            <label>门板高度</label>

            <input
                type="number"
                id="doorPanelH"
                inputmode="numeric"
                pattern="[0-9]*"
                autocomplete="off"
                min="1"
                step="1"
                value="${DOOR_DEFAULT_PANEL_H}"
            >
        `;

    fanWBox.insertAdjacentElement("afterend", panelBox);

    const input = getEl("doorPanelH");

    if (input && !input.dataset.doorBind) {
      input.dataset.doorBind = "1";

      input.addEventListener("input", function () {
        const mode = getEl("modeDropdown");

        if (currentMode !== "door" && mode && mode.value !== "door") {
          return;
        }

        if (this.value === "") {
          return;
        }

        this.value = this.value.replace(/[^0-9]/g, "");

        refresh();
      });

      input.addEventListener("change", function () {
        const mode = getEl("modeDropdown");

        if (currentMode !== "door" && mode && mode.value !== "door") {
          return;
        }

        refresh();
      });
    }

    bindDoorInputClear(input, DOOR_DEFAULT_PANEL_H);

    return panelBox;
  }

  // ============================================================
  // 上亮输入框
  // ============================================================

  function ensureDoorBrightInput() {
    const brightBox = getEl("upperBrightBox");

    /*
     * v3.0 起上亮框由 app.js 的 moveBrightToTitleRow()
     * 统一搬进标题栏，这里只保证它在位并绑好输入事件
     */

    if (typeof moveBrightToTitleRow === "function") {
      moveBrightToTitleRow();
    }

    if (!brightBox) {
      return;
    }

    brightBox.classList.add("upper-bright-inline");

    brightBox.classList.remove("hidden");

    const label = brightBox.querySelector("label");

    if (label) {
      label.textContent = "上亮:";
    }

    const input = getEl("upperBright");

    if (!input) {
      return;
    }

    if (!input.dataset.doorBind) {
      input.dataset.doorBind = "1";

      input.addEventListener("input", function () {
        if (this.value === "") {
          return;
        }

        this.value = this.value.replace(/[^0-9]/g, "");

        if (typeof calc === "function") {
          calc();
        }
      });
    }

    bindDoorInputClear(input, DOOR_BRIGHT_H);
  }

  // ============================================================
  // 图示标题布局
  // ============================================================

  function updateDiagramTitleLayout(isDoor) {
    const titleRow = document.querySelector(".diagram-title-row");

    if (!titleRow) {
      return;
    }

    /*
     * 布局（display / 对齐 / 宽度 / 靠右）已由 MC.html 里的
     * .diagram-title-row 统一定义，这里不再重复写行内样式
     */

    /*
     * 用类控制间距，而不是行内 gap：
     * updateDiagramTitleLayout 只在进入大门时调用，
     * 行内 gap 会残留在切走之后的其它窗型上
     */

    titleRow.classList.toggle("door-title-row", !!isDoor);

    const brightBox = getEl("upperBrightBox");

    const toggle = getEl("diagramToggle");

    /*
     * 高度、内边距、字号统一由 CSS 类控制
     * （.upper-bright-inline 与 .diagram-toggle），
     * 这里不再写死 29px，否则大门模式会和其它模式不一致
     */
  }

  // ============================================================
  // 重新计算
  //
  // 优先调用 app.js 的 calc()，让面积/包边等公共结果
  // 与门板一并刷新；取不到时退回本模块计算
  // ============================================================

  function refresh() {
    if (typeof calc === "function") {
      calc();
      return;
    }

    calculateModeDoor();
  }

  // ============================================================
  // 统一取值
  //
  // 计算与图示必须走同一个函数，否则会出现
  //「结果里是 234，图里画的是别的宽度」
  // 输入为空按 0；只有输入框不存在才回退默认值
  // ============================================================

  function readDoorNumber(value, id, fallback) {
    const n = Number(value);

    if (Number.isFinite(n) && n > 0) {
      return n;
    }

    const el = getEl(id);

    if (!el) {
      return fallback;
    }

    const raw = String(el.value).trim();

    if (raw === "") {
      return 0;
    }

    const v = Number(raw);

    return Number.isFinite(v) && v >= 0 ? v : fallback;
  }

  // ============================================================
  // 获取上亮高度
  // ============================================================

  function getDoorBrightH() {
    const input = getEl("upperBright");

    if (!input) {
      return DOOR_BRIGHT_H;
    }

    const value = Number(input.value);

    /* 输入框为空时按 0 计算，不再偷偷回退默认值 491 */
    if (String(input.value).trim() === "") {
      return 0;
    }

    if (!Number.isFinite(value) || value < 0) {
      return DOOR_BRIGHT_H;
    }

    return Math.round(value);
  }

  // ============================================================
  // 获取门板高度
  // ============================================================

  function getDoorPanelH() {
    const input = getEl("doorPanelH");

    if (!input) {
      return DOOR_DEFAULT_PANEL_H;
    }

    const value = Number(input.value);

    /* 输入框为空时按 0 计算，不再偷偷回退默认值 600 */
    if (String(input.value).trim() === "") {
      return 0;
    }

    if (!Number.isFinite(value) || value < 0) {
      return DOOR_DEFAULT_PANEL_H;
    }

    return Math.round(value);
  }

  // ============================================================
  // 初始化默认值
  // ============================================================

  function initDoorDefaults() {
    const hInput = getEl("winH");

    const wInput = getEl("winW");

    const fwInput = getEl("fanW");

    const brightInput = getEl("upperBright");

    const panelInput = getEl("doorPanelH");

    if (hInput && !hInput.value && !hInput.dataset.doorEditing && !hInput.dataset.doorClearing) {
      hInput.value = DOOR_DEFAULT_H;
    }

    if (wInput && !wInput.value && !wInput.dataset.doorEditing && !wInput.dataset.doorClearing) {
      wInput.value = DOOR_DEFAULT_W;
    }

    if (
      fwInput &&
      !fwInput.value &&
      !fwInput.dataset.doorEditing &&
      !fwInput.dataset.doorClearing
    ) {
      fwInput.value = DOOR_DEFAULT_FW;
    }

    if (
      brightInput &&
      !brightInput.value &&
      !brightInput.dataset.doorEditing &&
      !brightInput.dataset.doorClearing
    ) {
      brightInput.value = DOOR_BRIGHT_H;
    }

    if (
      panelInput &&
      !panelInput.value &&
      !panelInput.dataset.doorEditing &&
      !panelInput.dataset.doorClearing
    ) {
      panelInput.value = DOOR_DEFAULT_PANEL_H;
    }

    bindDoorInputClear(hInput, DOOR_DEFAULT_H);

    bindDoorInputClear(wInput, DOOR_DEFAULT_W);

    bindDoorInputClear(fwInput, DOOR_DEFAULT_FW);

    bindDoorInputClear(brightInput, DOOR_BRIGHT_H);

    bindDoorInputClear(panelInput, DOOR_DEFAULT_PANEL_H);
  }

  // ============================================================
  // 输入框点按清空（大门模式专用）
  //
  // app.js 在进入大门后不再接管点击，
  // 所以在切进大门时统一给几个输入框补上点击清空
  // ============================================================

  function bindDoorClickClear() {
    ["winW", "winH", "fanW", "upperBright", "doorPanelH"].forEach(function (id) {
      const input = getEl(id);

      if (!input || input.dataset.doorClickBind) {
        return;
      }

      input.dataset.doorClickBind = "1";

      /*
       * app.js 的通用点击清空带有 300ms 节流
       * （dataset.clicked），大门这里自己管理清空，
       * 因此把通用监听的「已处理」标记提前打上，
       * 只保留 door 自己这一份，避免清空两次
       */

      input.addEventListener(
        "click",
        function () {
          if (getEl("modeDropdown") && getEl("modeDropdown").value !== "door") {
            return;
          }

          clearDoorInputAfterApp(this);
        },
        true,
      );
    });
  }

  // ============================================================
  // 更新输入框显示
  // ============================================================

  function updateDoorInputs() {
    const mode = getEl("modeDropdown");

    const isDoor = mode && mode.value === "door";

    updateDiagramTitleLayout(isDoor);

    const brightBox = getEl("upperBrightBox");

    if (brightBox) {
      if (isDoor) {
        brightBox.classList.remove("hidden");

        brightBox.style.display = "flex";
      } else {
        brightBox.classList.add("hidden");

        brightBox.style.display = "none";
      }
    }

    // ========================================================
    // 门板高度
    // 大门模式恢复原本 input-box 的显示方式
    // 其他模式强制隐藏
    // ========================================================

    const panelBox = getEl("doorPanelHBox");

    if (panelBox) {
      if (isDoor) {
        panelBox.classList.remove("hidden");

        // 恢复原有 .input-box CSS 布局
        panelBox.style.display = "";
      } else {
        panelBox.classList.add("hidden");

        panelBox.style.display = "none";
      }
    }

    // ========================================================
    // 门板尺寸结果行
    // 只有大门模式显示
    // ========================================================

    const panelRow = getEl("rowDoorPanel");

    if (panelRow) {
      if (isDoor) {
        panelRow.classList.remove("hidden");

        panelRow.style.display = "table-row";
      } else {
        panelRow.classList.add("hidden");

        panelRow.style.display = "none";
      }
    }
  }

  // ============================================================
  // SVG 横向尺寸线
  //
  // totalDimension = true 时：
  // 门总宽文字加粗 + 放大
  // 并放到尺寸线外侧
  // ============================================================

  function doorHorizontalDimension(x1, x2, y, value, extensionY, totalDimension) {
    const tick = 4;

    const textY = totalDimension ? y + 8 : y - 5;

    /*
     * 字号按画布比例放大（v5.8）
     * 大门画布 250 宽，窗户 220 宽，
     * 同样 8px 的字在大门里显示反而更小，
     * 所以按 250/220 ≈ 1.14 倍放大
     */

    const textStyle = totalDimension
      ? `
                    font-size:16px;
                    font-weight:900;
                `
      : `
                    font-size:9px;
                `;

    return `
            <g class="door-dimension">

                <line
                    x1="${x1}"
                    y1="${extensionY}"
                    x2="${x1}"
                    y2="${y}"
                    class="dimension-dash"
                />

                <line
                    x1="${x2}"
                    y1="${extensionY}"
                    x2="${x2}"
                    y2="${y}"
                    class="dimension-dash"
                />

                <line
                    x1="${x1}"
                    y1="${y}"
                    x2="${x2}"
                    y2="${y}"
                    class="dimension-line"
                />

                <line
                    x1="${x1}"
                    y1="${y - tick}"
                    x2="${x1}"
                    y2="${y + tick}"
                    class="dimension-line"
                />

                <line
                    x1="${x2}"
                    y1="${y - tick}"
                    x2="${x2}"
                    y2="${y + tick}"
                    class="dimension-line"
                />

                <text
                    x="${(x1 + x2) / 2}"
                    y="${textY}"
                    class="dimension-text"
                    style="${textStyle}"
                >
                    ${value}
                </text>

            </g>
        `;
  }

  // ============================================================
  // SVG 纵向尺寸线
  //
  // totalDimension = true 时：
  // 门总高文字加粗 + 放大
  // 并放到尺寸线外侧
  // ============================================================

  function doorVerticalDimension(y1, y2, x, value, extensionX, totalDimension) {
    const tick = 4;

    const textX = totalDimension ? x + 10 : x - 5;

    /*
     * 字号按画布比例放大（v5.8）
     * 大门画布 250 宽，窗户 220 宽，
     * 同样 8px 的字在大门里显示反而更小，
     * 所以按 250/220 ≈ 1.14 倍放大
     */

    const textStyle = totalDimension
      ? `
                    font-size:16px;
                    font-weight:900;
                `
      : `
                    font-size:9px;
                `;

    return `
            <g class="door-dimension">

                <line
                    x1="${extensionX}"
                    y1="${y1}"
                    x2="${x}"
                    y2="${y1}"
                    class="dimension-dash"
                />

                <line
                    x1="${extensionX}"
                    y1="${y2}"
                    x2="${x}"
                    y2="${y2}"
                    class="dimension-dash"
                />

                <line
                    x1="${x}"
                    y1="${y1}"
                    x2="${x}"
                    y2="${y2}"
                    class="dimension-line"
                />

                <line
                    x1="${x - tick}"
                    y1="${y1}"
                    x2="${x + tick}"
                    y2="${y1}"
                    class="dimension-line"
                />

                <line
                    x1="${x - tick}"
                    y1="${y2}"
                    x2="${x + tick}"
                    y2="${y2}"
                    class="dimension-line"
                />

                <text
                    x="${textX}"
                    y="${(y1 + y2) / 2}"
                    class="dimension-text"
                    style="${textStyle}"
                    transform="
                        rotate(
                            -90
                            ${textX}
                            ${(y1 + y2) / 2}
                        )
                    "
                >
                    ${value}
                </text>

            </g>
        `;
  }

  // ============================================================
  // 绘制大门
  // ============================================================

  /*
   * 门板斜线：在给定矩形内生成 45° 平行线
   * 间距 5，线宽由调用处的 stroke-width 控制
   */

  function panelHatchLines(x, y, w, h) {
    const gap = 4.5;

    let out = "";

    /*
     * 45° 斜线从左下往右上：
     * 起点沿底边平移，保证覆盖整个矩形，
     * 起点从 x - h 开始（左侧留够），到 x + w 结束
     */

    const startX = x - h;

    const endX = x + w;

    for (let sx = startX; sx <= endX; sx += gap) {
      out +=
        '<line x1="' +
        sx.toFixed(2) +
        '" y1="' +
        (y + h).toFixed(2) +
        '" x2="' +
        (sx + h).toFixed(2) +
        '" y2="' +
        y.toFixed(2) +
        '"/>';
    }

    return out;
  }

  function drawModeDoor() {
    let values = {};

    if (typeof getValues === "function") {
      values = getValues() || {};
    }

    /* 与 calculateModeDoor 保持同一套取值规则，图示才不会和结果打架 */
    const W = readDoorNumber(values.W, "winW", DOOR_DEFAULT_W);

    const H = readDoorNumber(values.H, "winH", DOOR_DEFAULT_H);

    const FW = readDoorNumber(values.FW, "fanW", 0);

    const panelH = getDoorPanelH();

    const brightRealH = getDoorBrightH();

    /*
     * 图示尺寸按门宽高比计算（v5.1）
     * 之前固定 150×135，不管门宽是 900 还是 1970
     * 都画成一样宽，导致单/双门看着比例不对
     *
     * 画布可用区：W 150、H 135
     * 按实际 W:H 等比缩放，取能装下的那个方向
     */

    /*
     * 门一般比窗高瘦，按中心那条边撑满可用区
     * （原来两个方向都取 min，导致门图示缩得很小）
     */

    /*
     * 门的宽高比通常比窗更瘦（如 900×2600），
     * 画布高度按比例给足，避免门被压扁
     */

    /*
     * 图示尺寸（v5.4）
     * 回到改比例之前的观感：容器 150×135（宽:高 ≈ 1.11）
     * 差别只在「门与门之间」的宽窄关系：
     *   宽度按真实门宽的相对值分配，最宽的铺满
     * 高度统一按容器高，不再叠真实高矮
     */

    /* 整体放大（v5.7）：190×150 → 210×172 */
    const boxW = 210;
    const boxH = 172;

    const realW = Math.max(W, 1);

    /*
     * 宽度按门与门的相对宽窄分配：
     *   单门 900  → 87（保持）
     *   双门 1200 → 116（保持）
     *   四门 1970 → 166（收窄，原来 190 太宽）
     * 用分段线性：1200 以下按原斜率，超过后放缓
     */

    let width;

    if (realW <= 900) {
      /* 单门区间：斜率略降，比原来窄一点 */
      width = boxW * (realW / 1970) * 0.88;
    } else if (realW <= 1200) {
      width = boxW * (realW / 1970);
    } else {
      /* 1200 之后斜率降到 0.65 倍，最宽约 166 */
      const base = boxW * (1200 / 1970);

      width = base + (realW - 1200) * 0.0655;
    }

    width = Math.max(70, Math.min(boxW, width));

    const height = boxH;

    /* 水平居中于画布（250 宽），顶部留 16 */
    const x = (250 - width) / 2;

    /*
     * 垂直位置（v5.8）
     * 顶部要留给宽度标注，底部要留给高度标注，
     * 原来顶部只留 16、底部留 80，看着整体偏上
     */

    const y = 34;

    const safeW = Math.max(W, 1);

    const safeH = Math.max(H, 1);

    const lowerRealH = Math.max(0, safeH - 100 - brightRealH - 39);

    const brightSvgH = height * (brightRealH / safeH);

    const brightHeight = Math.min(Math.max(12, brightSvgH), height - 25);

    const lowerHeight = height - brightHeight;

    const brightBottom = y + brightHeight;

    const bottom = y + height;

    /*
     * 门型：4=四门（两侧固定+双扇）
     *       2=双门（只有两扇，无固定）
     *       1=单门（只有一扇，无固定）
     */

    const doorTypeDraw =
      typeof window !== "undefined" && typeof window.getDoorType === "function"
        ? window.getDoorType()
        : 4;

    let doorRatio = doorTypeDraw === 4 ? FW / safeW : 1; /* 单/双门：扇子占满整宽 */

    doorRatio = Math.max(0.05, Math.min(0.9, doorRatio));

    const doorWidth = width * doorRatio;

    const fixedTotal = width - doorWidth;

    const fixedWidth = fixedTotal / 2;

    const leftDoorX = x + fixedWidth;

    const rightDoorX = leftDoorX + doorWidth;

    const centerDoorX = leftDoorX + doorWidth / 2;

    /* 单门：只有一扇，中间不再分割 */
    const singleLeaf = doorTypeDraw === 1;

    const safeLowerRealH = Math.max(lowerRealH, 1);

    const actualPanelH = Math.min(Math.max(panelH, 0), safeLowerRealH);

    const panelSvgH = lowerHeight * (actualPanelH / safeLowerRealH);

    const panelTopY = bottom - panelSvgH;

    /*
     * 箭头垂直居中于门扇玻璃区（v5.7）
     * 原来固定在下部高度 31% 处，看着偏上
     * 门扇玻璃区 = brightBottom ~ panelTopY
     */

    const arrowY = brightBottom + (panelTopY - brightBottom) / 2;

    /*
     * 箭头大小固定（原来按门宽 × 0.14 算，
     * 单门门宽窄，箭头被缩得很小）
     */

    const arrowSize = 18;

    /*
     * 单门：箭头放在门扇玻璃正中间
     * 双门：两扇各放一个（0.25 / 0.75）
     * 四门：同双门
     */

    const leftArrowCenter = singleLeaf ? leftDoorX + doorWidth / 2 : leftDoorX + doorWidth * 0.25;

    const rightArrowCenter = leftDoorX + doorWidth * 0.75;

    /*
     * 尺寸线位置跟着图示走（v5.1）
     * 之前写死 22 / 208，门图示变窄后会跑到门外面
     */

    const leftDimX = Math.max(6, x - 22);

    const rightDimX = Math.min(244, x + width + 22);

    const widthDimY = Math.max(4, y - 8);

    const panelDimX = x + width + 13;

    /*
     * 图示标注的是「净格宽」（留给玻璃的整格空间，不扣 10mm 配合间隙）
     * 料表里的玻璃宽 = 净格宽 - 10，两者对应关系是 244 / 234
     */

    const fixedCellW = (W - 100 - 39 - 39 - FW) / 2;

    const svg = `
        <svg
            class="svg-canvas"
            viewBox="0 0 250 ${Math.round(height + 98)}"
            preserveAspectRatio="xMidYMid meet"
            xmlns="http://www.w3.org/2000/svg"
        >

            <defs>

                <!--
                    门板斜线：此前用 <pattern patternTransform>，
                    在 iOS Safari 上不渲染，改为
                    「clipPath 裁剪 + 一组斜线」实现
                -->

                <clipPath
                    id="doorPanelClip">

                    <rect
                        x="${x}"
                        y="${panelTopY}"
                        width="${width}"
                        height="${bottom - panelTopY}"
                    />

                </clipPath>

            </defs>

            <rect
                x="${x}"
                y="${y}"
                width="${width}"
                height="${height}"
                fill="rgba(76,175,80,.02)"
            />

            <!-- 门板：白底 + 细斜线（45°） -->
            <rect
                x="${x}"
                y="${panelTopY}"
                width="${width}"
                height="${bottom - panelTopY}"
                fill="#ffffff"
                stroke="none"
            />

            <g
                clip-path="url(#doorPanelClip)"
                stroke="#6b6b6b"
                stroke-width="0.9"
                fill="none"
            >

                ${panelHatchLines(x + 0.5, panelTopY + 0.5, width - 1, bottom - panelTopY - 1)}

            </g>

            <line
                x1="${x}"
                y1="${brightBottom}"
                x2="${x + width}"
                y2="${brightBottom}"
                class="dimension-line"
            />

            ${
              doorTypeDraw === 4
                ? `
            <line
                x1="${leftDoorX}"
                y1="${y}"
                x2="${leftDoorX}"
                y2="${bottom}"
                class="dimension-line"
            />

            <line
                x1="${rightDoorX}"
                y1="${y}"
                x2="${rightDoorX}"
                y2="${bottom}"
                class="dimension-line"
            />`
                : ""
            }

            ${
              singleLeaf
                ? ""
                : `
            <line
                x1="${centerDoorX}"
                y1="${brightBottom}"
                x2="${centerDoorX}"
                y2="${bottom}"
                class="dimension-line"
            />`
            }

            <line
                x1="${x}"
                y1="${panelTopY}"
                x2="${x + width}"
                y2="${panelTopY}"
                class="dimension-dash"
            />

            <polyline
                points="
                    ${leftArrowCenter},
                    ${arrowY - arrowSize}

                    ${leftArrowCenter - arrowSize},
                    ${arrowY}

                    ${leftArrowCenter},
                    ${arrowY + arrowSize}
                "
                class="dimension-line"
            />

            ${
              singleLeaf
                ? ""
                : `
            <polyline
                points="
                    ${rightArrowCenter},
                    ${arrowY - arrowSize}

                    ${rightArrowCenter + arrowSize},
                    ${arrowY}

                    ${rightArrowCenter},
                    ${arrowY + arrowSize}
                "
                class="dimension-line"
            />`
            }

            <!--
                顶部宽度标注
                四门：固定宽 | 门宽空 | 固定宽
                双门：每扇宽 | 每扇宽
                单门：整门宽
            -->

            ${
              doorTypeDraw === 4
                ? `

            ${doorHorizontalDimension(x, leftDoorX, widthDimY, roundValue(fixedCellW), y)}

            ${doorHorizontalDimension(leftDoorX, rightDoorX, widthDimY, roundValue(FW), y)}

            ${doorHorizontalDimension(rightDoorX, x + width, widthDimY, roundValue(fixedCellW), y)}`
                : doorTypeDraw === 2
                  ? `

            ${doorHorizontalDimension(x, centerDoorX, widthDimY, Math.round((W - 100) / 2), y)}

            ${doorHorizontalDimension(
              centerDoorX,
              x + width,
              widthDimY,
              Math.round((W - 100) / 2),
              y,
            )}`
                  : `

            ${doorHorizontalDimension(x, x + width, widthDimY, Math.round(W - 100), y)}`
            }

            <!-- 上亮高度 -->
            ${doorVerticalDimension(y, brightBottom, leftDimX, roundValue(brightRealH), x)}

            <!-- 下部高度 -->
            ${doorVerticalDimension(brightBottom, bottom, leftDimX, roundValue(lowerRealH), x)}

            <!-- 门板高度 -->
            ${doorVerticalDimension(
              panelTopY,
              bottom,
              panelDimX,
              roundValue(actualPanelH),
              x + width,
            )}

            <!-- 门总高：加粗 + 放大 + 尺寸线外侧 -->
            ${doorVerticalDimension(y, bottom, rightDimX, roundValue(H), x + width, true)}

            <!-- 门总宽：加粗 + 放大 + 放在门下方 -->
            ${doorHorizontalDimension(x, x + width, bottom + 18, roundValue(W), bottom, true)}

        </svg>
        `;

    const wrapper = getEl("diagramWrapper");

    if (wrapper) {
      wrapper.innerHTML = svg;

      /*
       * 容器尺寸自适应（v5.9）
       * 容器默认 220×180（窗户的画布比例），
       * 大门画布是 250×高，宽高比不同，
       * 用 meet 会按短边缩放，导致门图示整体变小、四周留白。
       * 这里按画布比例把容器高度调好，让图示铺满可用宽度。
       */

      const vbH = Math.round(height + 98);

      /*
       * 宽度控制在 190，比窗户（220）略小一点，
       * 避免门图示铺满卡片显得过大
       */

      /*
       * 宽度比窗户（220）略小一点，避免门图示铺满卡片显得过大
       * 注意 .svg-canvas 是 width:100%，所以要连 svg 一起设
       */

      wrapper.style.width = "210px";

      wrapper.style.maxWidth = "100%";

      wrapper.style.height = "auto";

      wrapper.style.aspectRatio = "250 / " + vbH;

      const svgEl = wrapper.querySelector("svg");

      if (svgEl) {
        /* 直接给 svg 固定宽度，优先级最高 */
        svgEl.style.setProperty("width", "210px", "important");

        svgEl.style.setProperty("height", "auto", "important");
      }
    }
  }

  // ============================================================
  // 门板尺寸结果行
  // ============================================================

  function ensureDoorPanelRow() {
    /*
     * 门板尺寸行已写在 MC.html（#rowDoorPanel），
     * 这里只负责显示/隐藏与首次绑定展开按钮
     */

    const row = getEl("rowDoorPanel");

    if (!row) {
      return null;
    }

    /*
     * 用 currentMode 判断更可靠：
     * 下拉框的 value 与状态变量可能短暂不同步，
     * 会导致大门模式下门板行被误隐藏
     */

    const isDoor =
      typeof currentMode === "undefined"
        ? getEl("modeDropdown") && getEl("modeDropdown").value === "door"
        : currentMode === "door";

    /*
     * 只控制 style.display，不再用 .hidden 类：
     * .hidden 带 !important，会和内联 display:table-row
     * 打架，导致大门模式下门板行明明算出来却看不到
     */

    row.classList.remove("hidden");

    row.style.display = isDoor ? "table-row" : "none";

    const button = getEl("doorPanelToggle");

    if (button && !button.dataset.bound) {
      button.dataset.bound = "1";

      button.addEventListener("click", function () {
        doorPanelExpanded = !doorPanelExpanded;

        updateDoorPanelDisplay();
      });
    }

    updateDoorPanelDisplay();

    return row;
  }

  // ============================================================
  // 门板展开/收起
  // ============================================================

  function updateDoorPanelDisplay() {
    const details = getEl("doorPanelDetails");

    const button = getEl("doorPanelToggle");

    if (!details || !button) {
      return;
    }

    if (doorPanelExpanded) {
      details.style.display = "block";

      button.textContent = "收起";
    } else {
      details.style.display = "none";

      button.textContent = "展开";
    }
  }

  // ============================================================
  // 更新门板尺寸
  // ============================================================

  function updateDoorPanelResult(fixedPanelW, fixedPanelH, sashPanelW, sashPanelH, hasFixed) {
    const row = ensureDoorPanelRow();

    if (!row) {
      return;
    }

    const fixedResult = getEl("doorFixedPanelResult");

    const fixedBad = fixedPanelW < 0 || fixedPanelH < 0;

    if (fixedResult) {
      fixedResult.style.display = hasFixed === false ? "none" : "";

      fixedResult.innerHTML = `
                <span>
                    左右固定门板
                </span>

                <strong${fixedBad ? ' style="color:#e53935"' : ""}>
                    ${roundValue(fixedPanelW)}
                    ×
                    ${roundValue(fixedPanelH)}
                    × 2
                </strong>
            `;
    }

    const sashResult = getEl("doorSashPanelResult");

    const sashBad = sashPanelW < 0 || sashPanelH < 0;

    if (sashResult) {
      /*
       * 门扇门板数量：
       *   单门 1 块、双门 2 块、四门 2 块
       * （原来写死 × 2，单门也显示 2 块，错的）
       */

      const sashCount = doorType === 1 ? 1 : 2;

      sashResult.innerHTML = `
                <span>
                    ${doorType === 1 ? "门扇门板" : "双扇门板"}
                </span>

                <strong${sashBad ? ' style="color:#e53935"' : ""}>
                    ${roundValue(sashPanelW)}
                    ×
                    ${roundValue(sashPanelH)}
                    × ${sashCount}
                </strong>
            `;
    }

    updateDoorPanelDisplay();
  }

  // ============================================================
  // 设置玻璃结果
  // ============================================================

  function setResult(sizeId, countId, size, count) {
    const sizeEl = getEl(sizeId);

    if (sizeEl) {
      sizeEl.textContent = size;

      /* 尺寸为负 / 含 0 宽高时标红，替用户挡住错料 */
      const bad = /-\d/.test(String(size));

      sizeEl.style.color = bad ? "#e53935" : "";

      sizeEl.title = bad ? "尺寸不合理：请检查上亮高度、门板高度与门总高" : "";
    }

    const countEl = getEl(countId);

    if (countEl) {
      countEl.textContent = count ? `× ${count}` : "";
    }
  }

  // ============================================================
  // 输入不合理提示条
  // ============================================================

  function updateDoorWarning(message) {
    let bar = getEl("doorWarning");

    if (!message) {
      if (bar) {
        bar.textContent = "";
        bar.style.display = "none";
      }

      return;
    }

    if (!bar) {
      const glassSection = document.querySelector(".glass-section");

      const anchor = getEl("fanHBox") || glassSection;

      if (!anchor) {
        return;
      }

      bar = document.createElement("div");

      bar.id = "doorWarning";

      bar.className = "door-warning";

      glassSection
        ? glassSection.parentElement.insertBefore(bar, glassSection)
        : anchor.parentElement.appendChild(bar);
    }

    bar.textContent = message;

    bar.style.display = "block";
  }

  // ============================================================
  // 显示/隐藏结果行
  // ============================================================

  function showRow(id, show) {
    const row = getEl(id);

    if (!row) {
      return;
    }

    row.classList.toggle("hidden", !show);
  }

  // ============================================================
  // 大门计算
  // ============================================================

  function calculateModeDoor() {
    ensureDoorPanelInput();
    ensureDoorBrightInput();
    initDoorDefaults();
    updateDoorInputs();

    let values = {};

    if (typeof getValues === "function") {
      values = getValues() || {};
    }

    const W = readDoorNumber(values.W, "winW", DOOR_DEFAULT_W);

    const H = readDoorNumber(values.H, "winH", DOOR_DEFAULT_H);

    /* 门宽空为空时不再回退 1304，避免「输入框空着还出旧尺寸」 */
    const FW = readDoorNumber(values.FW, "fanW", 0);

    const brightH = getDoorBrightH();

    const panelH = getDoorPanelH();

    /*
     * 断桥门类型（v5.0）
     *   4=四门：两侧固定 + 中间双扇（原有结构）
     *   2=双门：只有两扇，整门宽即门洞宽
     *   1=单门：只有一扇
     */

    const doorType =
      typeof window !== "undefined" && typeof window.getDoorType === "function"
        ? window.getDoorType()
        : 4;

    /* 门洞宽 = 门宽 - 100 */
    const doorOpening = W - 100;

    /*
     * 门宽空 FW：
     *   四门 = 输入框里的「门宽空」（两侧固定后中间区域）
     *   单/双门 = 门洞宽（整门都是扇子，没有固定格）
     */

    const fanZoneW = doorType === 4 ? FW : doorOpening;

    /*
     * 下部净高按真实几何计算（不再 Math.max(0, …)）：
     * 先夹成 0 会让「上亮 + 门板高 > 门总高」时
     * 玻璃显示 0 而门板显示 99989 这种自相矛盾的结果，
     * 现在统一输出真实值，由 setResult 标红提示
     */
    const lowerHeight = H - 100 - brightH - 39;

    /*
     * 输入校验（v6.3）
     * 逐条指出具体哪个输入不合理，不再笼统提示
     */
    const problems = [];

    if (W <= 100) {
      problems.push("门框宽需大于 100（当前 " + Math.round(W) + "）");
    }

    if (FW <= 0) {
      problems.push(doorType === 4 ? "门宽空需大于 0" : "门扇宽需大于 0");
    }

    if (doorType === 4 && FW > 0 && W > 100 && FW > W - 178) {
      problems.push("门宽空（" + Math.round(FW) + "）超过门洞可容纳的宽度");
    }

    if (brightH >= H) {
      problems.push(
        "上亮（" + Math.round(brightH) + "）需小于门总高（" + Math.round(H) + "）"
      );
    }

    if (lowerHeight <= 0) {
      problems.push("上亮过高：门洞需留出下部空间（当前下部净高 " + Math.round(lowerHeight) + "）");
    }

    const panelInvalid = panelH > 0 && lowerHeight > 0 && panelH > lowerHeight - 49;

    if (panelInvalid) {
      problems.push(
        "门板高度（" +
          Math.round(panelH) +
          "）超过门下部净高（" +
          Math.round(lowerHeight) +
          "）可容纳的范围"
      );
    }

    const glassInvalid = lowerHeight - 49 - panelH < 0;

    if (glassInvalid && !panelInvalid) {
      problems.push("门板高度与上亮之和超过门总高，玻璃尺寸已为负");
    }

    const doorInvalid = problems.length > 0;

    const doorWarning = problems.slice(0, 2).join("；");

    updateDoorWarning(doorWarning);

    /* 四门：两侧固定格宽（中间放扇子区 FW） */
    const fixedGlassW = doorType === 4 ? (doorOpening - 39 - 39 - fanZoneW) / 2 - 10 : 0;

    const brightGlassH = Math.max(0, brightH - 10);

    /* 门上亮中间玻璃宽：四门用 FW，单/双门用门洞宽 */
    const doorBrightGlassW = fanZoneW - 10;

    /*
     * 双门玻璃宽：与双扇门板同一套扣减
     * （门宽空 / 2 − 65 − 65 − 10）
     * 例：1304 / 2 = 652 → 652 − 65 − 65 = 522 → 512
     */

    /*
     * 门扇玻璃宽
     *   四门：FW / 2 - 65 - 65 - 10        （例 1304 → 512）
     *   双门：门洞 / 2 - 65 - 65 - 10       （例 1200 → 410）
     *   单门：门洞 - 65 - 65 - 10           （例 900  → 660）
     */

    const doorGlassW = doorType === 1 ? fanZoneW - 65 - 65 - 10 : fanZoneW / 2 - 65 - 65 - 10;

    const fixedGlassH = lowerHeight - 39 - panelH - 10;

    const doorGlassH = lowerHeight - panelH - 39 - 60 - 10;

    const fixedPanelW = doorType === 4 ? (doorOpening - fanZoneW - 39 - 39) / 2 - 10 : 0;

    const fixedPanelH = panelH - 10;

    /*
     * 门扇门板宽（与扇玻璃同口径，只是不再扣玻璃间隙的那 10）
     *   四门 FW/2 -65 -65 -10
     *   双门 门洞/2 -65 -65 -10
     *   单门 门洞 -65 -65 -10
     */

    const sashPanelW = doorType === 1 ? fanZoneW - 65 - 65 - 10 : fanZoneW / 2 - 65 - 65 - 10;

    const sashPanelH = panelH - 60 - 10;

    setResult("g1_size", "g1_count", `${roundValue(fixedGlassW)} × ${roundValue(fixedGlassH)}`, 2);

    setResult("g2_size", "g2_count", `${roundValue(fixedGlassW)} × ${roundValue(brightGlassH)}`, 2);

    setResult(
      "g3_size",
      "g3_count",
      `${roundValue(doorBrightGlassW)} × ${roundValue(brightGlassH)}`,
      1,
    );

    /*
     * 门扇玻璃数量：
     *   单门 1 块、双门 2 块、四门 2 块
     */

    setResult(
      "g4_size",
      "g4_count",
      `${roundValue(doorGlassW)} × ${roundValue(doorGlassH)}`,
      doorType === 1 ? 1 : 2,
    );

    const label1 = getEl("label1");

    const label2 = getEl("label2");

    const label3 = getEl("label3");

    const label4 = getEl("label4");

    if (label1) {
      label1.textContent = "左右固定玻璃";
    }

    /*
     * 结果行标签按门型区分（v5.6）
     *   四门：左右上亮固定玻璃 + 门上亮中间玻璃 + 双门玻璃
     *   双门：上亮玻璃 + 门扇玻璃
     *   单门：上亮玻璃 + 门扇玻璃
     */

    if (label2) {
      label2.textContent = "左右上亮固定玻璃";
    }

    if (label3) {
      label3.textContent = doorType === 4 ? "门上亮中间玻璃" : "上亮玻璃";
    }

    if (label4) {
      label4.textContent = doorType === 4 ? "双门玻璃" : doorType === 2 ? "门扇玻璃" : "门扇玻璃";
    }

    /*
     * 四门有两侧固定格，
     * 双门 / 单门没有固定格，这两个结果行不显示
     */

    const hasFixed = doorType === 4;

    showRow("rowG1", hasFixed);

    showRow("rowBright", hasFixed);

    showRow("rowBrightFan", true);

    showRow("rowG4", true);

    showRow("rowLowerFan", false);

    showRow("rowSash", false);

    showRow("rowScreen", false);

    updateDoorPanelResult(fixedPanelW, fixedPanelH, sashPanelW, sashPanelH, hasFixed);

    const area = (W * H) / 1000000;

    const areaNum = getEl("areaNum");

    const areaUnit = getEl("areaUnit");

    if (areaNum) {
      areaNum.textContent = area.toFixed(2);
    }

    if (areaUnit) {
      areaUnit.textContent = "㎡";
    }

    const perimeterNum = getEl("perimeterNum");

    if (perimeterNum) {
      perimeterNum.textContent = ((2 * (W + H)) / 1000).toFixed(2);
    }

    drawModeDoor();

    return {
      mode: "door",
      W,
      H,
      FW,
      brightH,
      panelH,
      lowerHeight,
      fixedGlassW,
      fixedGlassH,
      brightGlassH,
      doorBrightGlassW,
      doorGlassW,
      doorGlassH,
      fixedPanelW,
      fixedPanelH,
      sashPanelW,
      sashPanelH,
      area,
    };
  }

  // ============================================================
  // 初始化大门模式
  // ============================================================

  function initDoorMode() {
    ensureDoorPanelInput();
    ensureDoorBrightInput();
    bindDoorClickClear();
    updateDoorInputs();

    const mode = getEl("modeDropdown");

    if (mode && mode.value === "door") {
      initDoorDefaults();

      doorPanelExpanded = true;

      updateDoorInputs();
    }
  }

  // ============================================================
  // 对外接口
  // ============================================================

  window.drawModeDoor = drawModeDoor;

  window.calculateModeDoor = calculateModeDoor;

  window.updateDoorInputs = updateDoorInputs;

  window.ensureDoorBrightInput = ensureDoorBrightInput;

  window.ensureDoorPanelInput = ensureDoorPanelInput;

  window.getDoorPanelH = getDoorPanelH;

  window.updateDoorWarning = updateDoorWarning;

  window.initDoorMode = initDoorMode;

  window.getDoorBrightH = getDoorBrightH;
})();
