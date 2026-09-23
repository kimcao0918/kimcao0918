/*
 * 门窗助手核心公共模块
 * 这里不包含任何具体窗型的计算规则。
 */

/* =========================================================
   默认数据
========================================================= */

const data={

4:{
winW:1800,
winH:1800,
fanW:540,
fanH:1160,
winNum:1
},

3:{
winW:1800,
winH:1800,
fanW:540,
fanH:1160,
winNum:1
},

double:{
winW:2040,
winH:1800,
fanW:540,
fanH:1160,
winNum:1
},

balcony:{
winW:2800,
winH:2880,
fanW:540,
fanH:1370,
upperBright:551,
lowerBright:801,
winNum:1
}

};


/* =========================================================
   状态
========================================================= */

let currentMode=4;

let diagramCollapsed=false;

let glassCollapsed=true;

let historyEditMode=false;

let listEditMode=false;


/*
3块：

false = 默认右开扇
true = 左通高
*/

let threeLeftTong=false;


/*
双扇：

false = 原来的双扇窗型
true = 三分格双扇窗型
*/

let doubleThreePart=false;


/*
=========================================================
阳台组合

默认：

固 + 扇 + 固

之后点击：

＋ 固
或
＋ 扇

就继续累积。

例如：

固 + 扇 + 固 + 扇 + 固
=========================================================
*/

let balconyParts=[
'固',
'扇',
'固'
];


let shoppingList=
JSON.parse(
localStorage.getItem('windowShoppingList')||'[]'
);

let historyList=
JSON.parse(
localStorage.getItem('windowHistoryList')||'[]'
);


/* =========================================================
   工具
========================================================= */

function $(id){
return document.getElementById(id)
}

function escapeHtml(str){

return String(str||'')

.replace(/&/g,'&amp;')

.replace(/</g,'&lt;')

.replace(/>/g,'&gt;')

.replace(/"/g,'&quot;')

.replace(/'/g,'&#039;')

}

function clearInputOnClick(i){

if(!i.dataset.clicked){

i.dataset.clicked='1';

i.value='';

i.dispatchEvent(new Event('input'));

setTimeout(()=>{

delete i.dataset.clicked

},300)

}

}


/* =========================================================
   数量
========================================================= */

function changeNum(delta){

let n=parseInt($('winNum').value)||1;

n=Math.max(1,n+delta);

$('winNum').value=n;

calc()

}


/* =========================================================
   图示
========================================================= */

function toggleDiagram(){

diagramCollapsed=!diagramCollapsed;

$('diagramWrapper')
.classList
.toggle(
'collapse',
diagramCollapsed
);

$('diagramToggle').innerText=
diagramCollapsed
?'展开图示'
:'收起图示';

}


/* =========================================================
   玻璃表格
========================================================= */

function toggleGlass(){

glassCollapsed=!glassCollapsed;

$('glassTableWrap')
.classList
.toggle(
'show',
!glassCollapsed
);

$('glassToggle').innerText=
glassCollapsed
?'展开玻璃尺寸'
:'收起玻璃尺寸';

}


/* =========================================================
   包边
========================================================= */

function togglePerimeter(){

$('perimeterDisplay')
.classList
.toggle(
'show',
$('perimeterToggle').checked
);

calc()

}


/* =========================================================
   读取数据
========================================================= */

function getValues(){

const read=(id,oldValue)=>{

const el=$(id);

if(el){

return +el.value||0

}

return +oldValue||0

};

const d=data[currentMode]||{};

return{

W:read('winW',d.winW),

H:read('winH',d.winH),

FW:read('fanW',d.fanW),

FH:read('fanH',d.fanH),

upperBright:read(
'upperBright',
d.upperBright
),

lowerBright:read(
'lowerBright',
d.lowerBright
)

}

}


/* =========================================================
   SVG
========================================================= */

function svgHeader(){

return`<defs>

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

</defs>`

}

function verticalDimension(
x,
y1,
y2,
text,
guideX
){

return`

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
x1="${x+5}"
y1="${y1}"
x2="${guideX}"
y2="${y1}"/>

<line
class="dimension-dash"
x1="${x+5}"
y1="${y2}"
x2="${guideX}"
y2="${y2}"/>

<text
class="dimension-text"
x="${x-10}"
y="${(y1+y2)/2}">
${text}
</text>

`

}

function totalHeightDimension(
x,
y1,
y2,
text,
guideX
){

return`

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
x2="${x-5}"
y2="${y1}"/>

<line
class="dimension-dash"
x1="${guideX}"
y1="${y2}"
x2="${x-5}"
y2="${y2}"/>

<text
class="dimension-text"
x="${x+10}"
y="${(y1+y2)/2}">
${text}
</text>

`

}

function horizontalDimension(
x1,
x2,
y,
text,
guideY
){

return`

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
y2="${y-5}"/>

<line
class="dimension-dash"
x1="${x2}"
y1="${guideY}"
x2="${x2}"
y2="${y-5}"/>

<text
class="dimension-text"
x="${(x1+x2)/2}"
y="${y+9}">
${text}
</text>

`

}


/* =========================================================
   4块
========================================================= */

function saveCurrentData(){

data[currentMode]={

winW:$('winW').value,

winH:$('winH').value,

fanW:$('fanW').value,

fanH:$('fanH').value,

upperBright:$('upperBright').value,

lowerBright:$('lowerBright').value,

winNum:$('winNum').value

}

}


/* =========================================================
   加载数据
========================================================= */

function loadDataToInputs(){

$('winW').value=
data[currentMode].winW||'';

$('winH').value=
data[currentMode].winH||'';

$('fanW').value=
data[currentMode].fanW||'';

$('fanH').value=
data[currentMode].fanH||'';

$('upperBright').value=
data[currentMode].upperBright||'';

$('lowerBright').value=
data[currentMode].lowerBright||'';

$('winNum').value=
data[currentMode].winNum||1;

}


/* =========================================================
   显示结果
========================================================= */

function showResult(
id,
size,
count,
unit
){

$(id+'_size').innerHTML=
'<b>'+size+'</b>';

$(id+'_count').innerText=
'*'+count+unit;

}


/* =========================================================
   清空结果
========================================================= */

function clearResults(){

[
'g1',
'g2',
'g3',
'g4',
'g5',
'g6',
'gScreen'
].forEach(id=>{

$(id+'_size').innerHTML='-';

$(id+'_count').innerText='';

});

}


/* =========================================================
   核心计算
========================================================= */

function getCurrentResults(){

const result=[];

const rows=[
'rowG1',
'rowBright',
'rowBrightFan',
'rowG4',
'rowLowerFan',
'rowSash',
'rowScreen'
];


rows.forEach(id=>{

const row=$(id);

if(
!row||
row.classList.contains('hidden')
)
return;


const size=
row.querySelector('.size-val');

const count=
row.querySelector('.count-val');


if(
size&&
size.innerText&&
size.innerText!=='-'
){

result.push({

name:
row.querySelector('td')
.innerText
.trim(),

size:
size.innerText
.trim(),

count:
count?
count.innerText.trim():
''

});

}

});


return result

}


/* =========================================================
   加入清单
========================================================= */

function addToList(){

saveCurrentData();

const Glen=
getCurrentResults();

if(!Glen.length)
return;


let modeName=
$('modeDropdown')
.selectedOptions[0]
.text;


/* 3块 */

if(currentMode===3){

if(threeLeftTong){

modeName=
'3块 (左通高+右开扇)';

}else{

modeName=
'3块 (右开扇+通头顶上亮)';

}

}


/* 双扇 */

if(currentMode==='double'){

if(doubleThreePart){

modeName=
'双扇 (三分格双扇窗型)';

}else{

modeName=
'双扇 (两边开扇+中间固定)';

}

}


/* 阳台 */

if(currentMode==='balcony'){

modeName=
'阳台 ('+
balconyParts.join('+')+
')';

}


const item={

id:Date.now(),

mode:modeName,

modeValue:currentMode,

doubleThreePart:
currentMode==='double'
?doubleThreePart
:false,

threeLeftTong:
currentMode===3
?threeLeftTong
:false,

balconyParts:
currentMode==='balcony'
?[...balconyParts]
:[],

W:data[currentMode].winW,

H:data[currentMode].winH,

FW:data[currentMode].fanW,

FH:data[currentMode].fanH,

upperBright:
data[currentMode].upperBright,

lowerBright:
data[currentMode].lowerBright,

num:
parseInt(data[currentMode].winNum)||1,

time:
new Date().toLocaleString(),

results:Glen,

tag:''

};


shoppingList.push(item);

historyList.unshift(item);


if(shoppingList.length>100)
shoppingList.shift();


if(historyList.length>100)
historyList.pop();


localStorage.setItem(
'windowShoppingList',
JSON.stringify(shoppingList)
);

localStorage.setItem(
'windowHistoryList',
JSON.stringify(historyList)
);


renderList();

renderHistory();


alert('已加入清单');

}


/* =========================================================
   清单
========================================================= */

function renderList(){

const box=
$('listContent');


if(!shoppingList.length){

box.innerHTML=
'<div class="panel-empty">暂无清单内容</div>';

return

}


box.innerHTML='';


[...shoppingList]
.reverse()
.forEach(item=>{

const div=
document.createElement('div');

div.className=
'list-item';


let html='';


item.results.forEach(r=>{

html+=
`${escapeHtml(r.name)}：${escapeHtml(r.size)} ${escapeHtml(r.count)}<br>`;

});


const num=
item.num||1;


const tag=
listEditMode

?`<input
class="list-tag-input"
data-id="${item.id}"
value="${escapeHtml(item.tag||'')}"
placeholder="输入标签">`

:item.tag

?`<span class="list-tag">
${escapeHtml(item.tag)}
</span>`

:'';


div.innerHTML=`

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


box.querySelectorAll(
'.list-tag-input'
).forEach(input=>{

input.addEventListener(
'click',
function(e){
e.stopPropagation()
}
);


input.addEventListener(
'input',
function(){

const id=
Number(this.dataset.id);

const item=
shoppingList.find(
i=>i.id===id
);


if(item){

item.tag=
this.value;

localStorage.setItem(
'windowShoppingList',
JSON.stringify(shoppingList)
);

}

});


input.addEventListener(
'keydown',
function(e){

if(e.key==='Enter'){

this.blur();

}

});

});


box.querySelectorAll(
'.delete-btn'
).forEach(btn=>{

btn.onclick=
function(e){

e.stopPropagation();

const id=
Number(this.dataset.id);

shoppingList=
shoppingList.filter(
i=>i.id!==id
);

localStorage.setItem(
'windowShoppingList',
JSON.stringify(shoppingList)
);

renderList();

}

});

}


/* =========================================================
   恢复历史
========================================================= */

function restoreHistory(item){

currentMode=
item.modeValue;


$('modeDropdown').value=
String(currentMode);


data[currentMode]={

winW:item.W||'',

winH:item.H||'',

fanW:item.FW||'',

fanH:item.FH||'',

upperBright:item.upperBright||'',

lowerBright:item.lowerBright||'',

winNum:item.num||1

};


/*
恢复3块
*/

if(currentMode===3){

threeLeftTong=
!!item.threeLeftTong;

}


/*
恢复双扇
*/

if(currentMode==='double'){

doubleThreePart=
!!item.doubleThreePart;

}


/*
恢复阳台组合
*/

if(currentMode==='balcony'){

if(
Array.isArray(item.balconyParts)&&
item.balconyParts.length
){

balconyParts=
[...item.balconyParts];

}else{

balconyParts=
['固','扇','固'];

}

}


const u=
$('upperBrightBox');

const l=
$('lowerBrightBox');


if(currentMode==='balcony'){

u.classList.remove('hidden');

l.classList.remove('hidden');

}else{

u.classList.add('hidden');

l.classList.add('hidden');

}


updateGlassRows();

updateModeSwitchButton();

updateBalconyButtons();

loadDataToInputs();

calc();


window.scrollTo({

top:0,

behavior:'smooth'

});

}


/* =========================================================
   历史
========================================================= */

function renderHistory(){

const box=
$('historyContent');


if(!historyList.length){

box.innerHTML=
'<div class="panel-empty">暂无历史记录</div>';

return

}


box.innerHTML='';


historyList.forEach(item=>{

const div=
document.createElement('div');

div.className=
'history-item';


let html='';


item.results.forEach(r=>{

html+=
`${escapeHtml(r.name)}：${escapeHtml(r.size)} ${escapeHtml(r.count)}<br>`;

});


const num=
item.num||1;


const tag=
historyEditMode

?`<input
class="history-tag-input"
data-id="${item.id}"
value="${escapeHtml(item.tag||'')}"
placeholder="输入标签">`

:item.tag

?`<span class="history-tag">
${escapeHtml(item.tag)}
</span>`

:'';


div.innerHTML=`

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


div.addEventListener(
'click',
function(e){

if(historyEditMode)
return;

if(
e.target.closest(
'.history-delete-btn'
)
)
return;

restoreHistory(item);

});


box.appendChild(div);

});


box.querySelectorAll(
'.history-tag-input'
).forEach(input=>{

input.addEventListener(
'click',
function(e){
e.stopPropagation()
}
);


input.addEventListener(
'input',
function(){

const id=
Number(this.dataset.id);

const item=
historyList.find(
i=>i.id===id
);


if(item){

item.tag=
this.value;

localStorage.setItem(
'windowHistoryList',
JSON.stringify(historyList)
);

}

});


input.addEventListener(
'keydown',
function(e){

if(e.key==='Enter')
this.blur();

});

});


box.querySelectorAll(
'.history-delete-btn'
).forEach(btn=>{

btn.addEventListener(
'click',
function(e){

e.stopPropagation();

const id=
Number(this.dataset.id);

historyList=
historyList.filter(
i=>i.id!==id
);

localStorage.setItem(
'windowHistoryList',
JSON.stringify(historyList)
);

renderHistory();

});

});

}


/* =========================================================
   编辑清单
========================================================= */

function toggleListEdit(){

listEditMode=
!listEditMode;

$('listEditButton').innerText=
listEditMode
?'完成'
:'编辑';

renderList();

}


/* =========================================================
   编辑历史
========================================================= */

function toggleHistoryEdit(){

historyEditMode=
!historyEditMode;

$('historyEditButton').innerText=
historyEditMode
?'完成'
:'编辑';

renderHistory();

}


/* =========================================================
   面板
========================================================= */

function toggleList(){

$('listPanel')
.classList
.toggle('show');

$('historyPanel')
.classList
.remove('show');

}

function toggleHistory(){

$('historyPanel')
.classList
.toggle('show');

$('listPanel')
.classList
.remove('show');

}


/* =========================================================
   清空
========================================================= */

function clearList(){

shoppingList=[];

localStorage.setItem(
'windowShoppingList',
'[]'
);

renderList();

}

function clearHistory(){

historyList=[];

localStorage.setItem(
'windowHistoryList',
'[]'
);

renderHistory();

}


/* =========================================================
   导出图片
========================================================= */

function exportGlassImage(){

saveCurrentData();

const glassList=
getCurrentResults();


if(!glassList.length){

alert('暂无玻璃尺寸');

return

}


const sourceSvg=
$('diagramWrapper')
.querySelector('svg');


if(!sourceSvg){

alert('暂无窗型图');

return

}


const svgClone=
sourceSvg.cloneNode(true);


svgClone.setAttribute(
'xmlns',
'http://www.w3.org/2000/svg'
);

svgClone.setAttribute(
'width',
'220'
);

svgClone.setAttribute(
'height',
'180'
);


let svgText=
new XMLSerializer()
.serializeToString(svgClone);


svgText=
svgText.replace(
/var\(--text-main\)/g,
'#333'
);


svgText=
svgText.replace(
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

</style><defs>`
);


const canvas=
document.createElement('canvas');


const canvasW=1800;

const cardH=150;

const gap=20;

const cardTop=60;

const cardsHeight=
glassList.length*cardH+
(glassList.length-1)*gap;

const diagramW=700;

const diagramH=
diagramW*(180/220);

const canvasH=
Math.max(
1100,
Math.ceil(
Math.max(
cardsHeight,
diagramH
)+120
)
);


canvas.width=
canvasW*2;

canvas.height=
canvasH*2;


const ctx=
canvas.getContext('2d');


ctx.scale(2,2);

ctx.fillStyle='#fff';

ctx.fillRect(
0,
0,
canvasW,
canvasH
);


const img=
new Image();


const svgBlob=
new Blob(
[svgText],
{
type:'image/svg+xml;charset=utf-8'
}
);


const url=
URL.createObjectURL(svgBlob);


img.onload=()=>{

const diagramX=50;

const diagramY=
60+
(
Math.max(
cardsHeight,
diagramH
)-
diagramH
)/2;


ctx.drawImage(
img,
diagramX,
diagramY,
diagramW,
diagramH
);


const cardX=820;

const cardW=930;


glassList.forEach(
(item,i)=>{

const y=
cardTop+
i*(cardH+gap);

const isScreen=
item.name.includes('纱窗');

ctx.save();

ctx.strokeStyle=
isScreen
?'#ff9800'
:'#e3e3e3';

ctx.lineWidth=2;

ctx.beginPath();

ctx.roundRect(
cardX,
y,
cardW,
cardH,
26
);

ctx.stroke();

ctx.fillStyle=
isScreen
?'#ff9800'
:'#333';

ctx.font=
'900 68px Arial,sans-serif';

ctx.textAlign=
'center';

ctx.textBaseline=
'middle';

ctx.fillText(
item.size,
cardX+cardW/2-35,
y+cardH/2
);

ctx.fillStyle=
isScreen
?'#ff9800'
:'#666';

ctx.font=
'800 38px Arial,sans-serif';

ctx.textAlign=
'right';

ctx.fillText(
item.count,
cardX+cardW-35,
y+cardH/2
);


if(isScreen){

ctx.fillStyle=
'#ff9800';

ctx.font=
'900 34px Arial,sans-serif';

ctx.textAlign=
'left';

ctx.fillText(
'纱窗',
cardX+35,
y+cardH/2
);

}

ctx.restore();

});


URL.revokeObjectURL(url);


canvas.toBlob(
async blob=>{

if(!blob){

alert('导出失败');

return

}


const file=
new File(
[blob],
'玻璃尺寸.png',
{
type:'image/png'
}
);


if(
navigator.share&&
navigator.canShare&&
navigator.canShare({
files:[file]
})
){

try{

await navigator.share({

files:[file],

title:'玻璃尺寸'

});

}catch(e){}

}else{

const a=
document.createElement('a');

a.download=
'玻璃尺寸.png';

a.href=
URL.createObjectURL(blob);

a.click();

setTimeout(
()=>{
URL.revokeObjectURL(a.href)
},
1000
);

}

},
'image/png'
);

};


img.onerror=()=>{

URL.revokeObjectURL(url);

alert('导出失败');

};


img.src=url;

}


/* =========================================================
   输入
========================================================= */

/* =========================================================
   页面应用层
========================================================= */

/*
 * 门窗助手应用层
 * 模式模块只负责自己的窗型计算/图示；这里负责页面公共流程。
 */

function updateGlassRows(){

const balcony=
currentMode==='balcony';


$('rowBrightFan').className='hidden';

$('rowLowerFan').className='hidden';

$('rowSash').className='hidden';


/* =========================
   阳台
========================= */

if(balcony){

$('rowBright').className='';

$('rowBrightFan').className='';

$('rowLowerFan').className='';

$('rowSash').className='';

$('label1').innerText=
'固定主玻璃';

$('label2').innerText=
'上亮固定玻璃';

$('label3').innerText=
'下亮固定玻璃';

$('label4').innerText=
'上亮扇固定玻璃';

$('label5').innerText=
'下亮扇固定玻璃';

$('label6').innerText=
'扇子玻璃';

return

}


/* =========================
   普通
========================= */

$('rowBright').className='';


/* =========================
   4块
========================= */

if(currentMode===4){

$('rowBrightFan').className='';

$('label1').innerText=
'下固定玻璃';

$('label2').innerText=
'上亮固定玻璃';

$('label3').innerText=
'上亮扇固定玻璃';

$('label4').innerText=
'扇子玻璃';

}


/* =========================
   双扇
========================= */

else if(currentMode==='double'){

if(doubleThreePart){

$('rowBrightFan').className='';

$('label1').innerText=
'下中间固定玻璃';

$('label2').innerText=
'左右上亮玻璃';

$('label3').innerText=
'中间上亮玻璃';

$('label4').innerText=
'扇子玻璃';

}else{

$('rowBrightFan').className='hidden';

$('label1').innerText=
'下中间玻璃';

$('label2').innerText=
'上亮玻璃';

$('label4').innerText=
'扇子玻璃';

}

}


/* =========================
   3块
========================= */

else{

if(threeLeftTong){

$('label1').innerText=
'通高大玻璃';

$('label2').innerText=
'右侧上亮玻璃';

$('label4').innerText=
'扇子玻璃';

}else{

$('label1').innerText=
'下固定玻璃';

$('label2').innerText=
'上亮玻璃';

$('label4').innerText=
'扇子玻璃';

}

}

}


/* =========================================================
   模式按钮
========================================================= */

function updateModeSwitchButton(){

const row=
$('modeSwitchRow');

const btn=
$('modeSwitchButton');


if(currentMode===3){

row.classList.add('show');

btn.innerText=
threeLeftTong
?'切换为右开扇'
:'切换为左通';

}

else if(currentMode==='double'){

row.classList.add('show');

btn.innerText=
doubleThreePart
?'切换为原双扇窗型'
:'切换为三分格双扇窗型';

}

else{

row.classList.remove('show');

}

}


/* =========================================================
   阳台按钮显示
========================================================= */

function updateBalconyButtons(){

const row=
$('balconyAddRow');

if(currentMode==='balcony'){

row.classList.add('show');

}else{

row.classList.remove('show');

}

}


/* =========================================================
   切换模式
========================================================= */

function switchMode(v){

saveCurrentData();

currentMode=
v==='3'||v==='4'
?+v
:v;


const u=
$('upperBrightBox');

const l=
$('lowerBrightBox');


if(currentMode==='balcony'){

u.classList.remove('hidden');

l.classList.remove('hidden');

}else{

u.classList.add('hidden');

l.classList.add('hidden');

}


updateGlassRows();

updateModeSwitchButton();

updateBalconyButtons();

loadDataToInputs();

calc();

}


/* =========================================================
   保存当前模式数据
========================================================= */

function bindInput(id){

$(id).addEventListener(
'click',
function(){

clearInputOnClick(this)

}
);


$(id).addEventListener(
'input',
calc
);

}


/* =========================================================
   切换 3块 / 双扇
========================================================= */

function toggleModeSwitch(){

/*
3块左右通切换
*/

if(currentMode===3){

threeLeftTong=
!threeLeftTong;

updateGlassRows();

updateModeSwitchButton();

calc();

return

}


/*
双扇窗型切换
*/

if(currentMode==='double'){

doubleThreePart=
!doubleThreePart;

updateGlassRows();

updateModeSwitchButton();

calc();

return

}

}


/* =========================================================
   阳台增加 固 / 扇
========================================================= */

function addBalconyPart(type){

if(currentMode!=='balcony')
return;


/*
累积
*/

balconyParts.push(type);


/*
重新计算
*/

calc();

}


/* =========================================================
   页面初始化
========================================================= */

window.onload=function(){


/* 模式 */

$('modeDropdown')
.addEventListener(
'change',
function(){

switchMode(
this.value
);

}
);


/* 数量 */

$('minusNum')
.addEventListener(
'click',
function(){

changeNum(-1);

}
);


$('plusNum')
.addEventListener(
'click',
function(){

changeNum(1);

}
);


/* 图示 */

$('diagramToggle')
.addEventListener(
'click',
toggleDiagram
);


/* 玻璃 */

$('glassToggle')
.addEventListener(
'click',
toggleGlass
);


/* 包边 */

$('perimeterToggle')
.addEventListener(
'change',
togglePerimeter
);


/* 导出 */

$('exportButton')
.addEventListener(
'click',
exportGlassImage
);


/* 清单 */

$('addListButton')
.addEventListener(
'click',
addToList
);


$('listButton')
.addEventListener(
'click',
toggleList
);


/* 历史 */

$('historyButton')
.addEventListener(
'click',
toggleHistory
);


$('listEditButton')
.addEventListener(
'click',
toggleListEdit
);


$('historyEditButton')
.addEventListener(
'click',
toggleHistoryEdit
);


$('clearListButton')
.addEventListener(
'click',
clearList
);


$('clearHistoryButton')
.addEventListener(
'click',
clearHistory
);


/* 3块 / 双扇切换 */

$('modeSwitchButton')
.addEventListener(
'click',
toggleModeSwitch
);


/* 阳台 */

$('addFixedButton')
.addEventListener(
'click',
function(){

addBalconyPart('固');

}
);


$('addFanButton')
.addEventListener(
'click',
function(){

addBalconyPart('扇');

}
);


/* 输入 */

bindInput('winNum');

bindInput('winH');

bindInput('winW');

bindInput('fanW');

bindInput('fanH');

bindInput('upperBright');

bindInput('lowerBright');


/* 初始化 */

loadDataToInputs();

updateGlassRows();

updateModeSwitchButton();

updateBalconyButtons();

renderList();

renderHistory();


$('glassTableWrap')
.classList
.remove('show');

$('glassToggle').innerText=
'展开玻璃尺寸';


calc();

};

/* =========================================================
   图示入口
========================================================= */

function drawDiagram(){

const wrapper=$('diagramWrapper');

if(!wrapper){
console.error('找不到图示容器 #diagramWrapper');
return;
}

if(currentMode===4){
drawMode4();
}
else if(currentMode===3){
threeLeftTong ? drawMode3Left() : drawMode3Right();
}
else if(currentMode==='double'){
doubleThreePart ? drawModeDoubleThree() : drawModeDoubleOriginal();
}
else if(currentMode==='balcony'){
drawModeBalcony();
}
}

/* =========================================================
   核心计算
========================================================= */

function calc(){

if(currentMode==='balcony'){

const totalH=+$('winH').value||0;
const uB=+$('upperBright').value||0;
const lB=+$('lowerBright').value||0;
const fH=+$('fanH').value||0;

if(totalH>0){
const active=document.activeElement;

if(active===$('fanH')){
const computedLB=totalH-100-29-29-uB-fH;
if(computedLB>0)$('lowerBright').value=Math.round(computedLB);
}
else if(active===$('upperBright')||active===$('lowerBright')){
const computedFH=totalH-100-29-29-uB-lB;
if(computedFH>0)$('fanH').value=Math.round(computedFH);
}
else if(uB>0&&lB>0&&active!==$('fanH')){
const computedFH=totalH-100-29-29-uB-lB;
if(computedFH>0)$('fanH').value=Math.round(computedFH);
}
}
}

saveCurrentData();
clearResults();

const values=getValues();
const num=parseInt($('winNum').value)||1;
const ctx={...values,num};

drawDiagram();

$('areaNum').innerText=((ctx.W*ctx.H*num)/1e6).toFixed(2);
$('areaUnit').innerText='m² (共 '+num+' 套)';
$('perimeterNum').innerText=(((ctx.H+ctx.W)/1000)*2*num).toFixed(2);

if(currentMode==='balcony')calculateModeBalcony(ctx);
else if(currentMode==='double')calculateModeDouble(ctx);
else if(currentMode===3)calculateMode3(ctx);
else calculateMode4(ctx);
}

/* =========================================================
   页面初始化
========================================================= */

window.addEventListener('load',function(){

$('modeDropdown').addEventListener('change',function(){switchMode(this.value)});
$('minusNum').addEventListener('click',function(){changeNum(-1)});
$('plusNum').addEventListener('click',function(){changeNum(1)});
$('diagramToggle').addEventListener('click',toggleDiagram);
$('glassToggle').addEventListener('click',toggleGlass);
$('perimeterToggle').addEventListener('change',togglePerimeter);
$('exportButton').addEventListener('click',exportGlassImage);
$('addListButton').addEventListener('click',addToList);
$('listButton').addEventListener('click',toggleList);
$('historyButton').addEventListener('click',toggleHistory);
$('listEditButton').addEventListener('click',toggleListEdit);
$('historyEditButton').addEventListener('click',toggleHistoryEdit);
$('clearListButton').addEventListener('click',clearList);
$('clearHistoryButton').addEventListener('click',clearHistory);
$('modeSwitchButton').addEventListener('click',toggleModeSwitch);
$('addFixedButton').addEventListener('click',function(){addBalconyPart('固')});
$('addFanButton').addEventListener('click',function(){addBalconyPart('扇')});

bindInput('winNum');
bindInput('winH');
bindInput('winW');
bindInput('fanW');
bindInput('fanH');
bindInput('upperBright');
bindInput('lowerBright');

loadDataToInputs();
updateGlassRows();
updateModeSwitchButton();
updateBalconyButtons();
renderList();
renderHistory();
$('glassTableWrap').classList.remove('show');
$('glassToggle').innerText='展开玻璃尺寸';
calc();
});
