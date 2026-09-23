// 门窗助手窗型模块：mode-double.js

function drawModeDoubleOriginal(){

const{
W,
H,
FH
}=getValues();

const x=35;
const y=20;
const width=150;
const height=120;

const upperHeight=
H-100-FH-29;

const upperY=
y+height*(upperHeight/H);

const leftFanX=
x+35;

const rightFanX=
x+115;


$('diagramWrapper').innerHTML=

`<svg
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
x2="${x+width}"
y2="${upperY}"/>

<line
x1="${x+75}"
y1="${y}"
x2="${x+75}"
y2="${upperY}"/>

<line
x1="${leftFanX}"
y1="${upperY}"
x2="${leftFanX}"
y2="${y+height}"/>

<line
x1="${rightFanX}"
y1="${upperY}"
x2="${rightFanX}"
y2="${y+height}"/>

<polyline
points="${x+9},${y+62}
${x+26},${y+80}
${x+9},${y+98}"/>

<polyline
points="${x+width-9},${y+62}
${x+width-26},${y+80}
${x+width-9},${y+98}"/>

${verticalDimension(
10,
y,
upperY,
Math.round(upperHeight),
x
)}

${verticalDimension(
10,
upperY,
y+height,
Math.round(FH),
x
)}

${totalHeightDimension(
210,
y,
y+height,
Math.round(H),
x+width
)}

${horizontalDimension(
x,
x+width,
165,
Math.round(W),
y+height
)}

</svg>`

}


/* =========================================================
   新双扇三分格
========================================================= */

function drawModeDoubleThree(){

const{
W,
H,
FH,
FW
}=getValues();

const x=35;
const y=20;
const width=150;
const height=120;

const upperHeight=
H-100-FH-29;

const upperY=
y+height*(upperHeight/H);

const centerW=
W-100-2*FW-29-29-10;

const totalInnerW=
2*FW+centerW;

const leftX=
x+width*(FW/totalInnerW);

const centerRightX=
leftX+width*(centerW/totalInnerW);


$('diagramWrapper').innerHTML=

`<svg
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
x2="${x+width}"
y2="${upperY}"/>

<line
x1="${leftX}"
y1="${y}"
x2="${leftX}"
y2="${y+height}"/>

<line
x1="${centerRightX}"
y1="${y}"
x2="${centerRightX}"
y2="${y+height}"/>

<polyline
points="${x+12},${upperY+35}
${x+30},${upperY+53}
${x+12},${upperY+71}"/>

<polyline
points="${x+width-12},${upperY+35}
${x+width-30},${upperY+53}
${x+width-12},${upperY+71}"/>

${verticalDimension(
10,
y,
upperY,
Math.round(upperHeight),
x
)}

${verticalDimension(
10,
upperY,
y+height,
Math.round(FH),
x
)}

${totalHeightDimension(
210,
y,
y+height,
Math.round(H),
x+width
)}

${horizontalDimension(
x,
x+width,
165,
Math.round(W),
y+height
)}

</svg>`

}


/* =========================================================
   阳台几何
========================================================= */


function calculateModeDouble(ctx){
  const {W,H,FW,FH,num}=ctx;
  const gH=H-100-FH-29-10;
  if(doubleThreePart){
    const centerW=W-100-2*FW-29-29-10;
    const sideUpperW=FW-10;
    showResult('g1',Math.round(centerW)+'×'+Math.round(FH-10),num,'块');
    showResult('g2',Math.round(sideUpperW)+'×'+Math.round(gH),num*2,'块');
    showResult('g3',Math.round(centerW)+'×'+Math.round(gH),num,'块');
    showResult('g4',Math.round(FW-93)+'×'+Math.round(FH-92),num*2,'块');
    showResult('gScreen',Math.round(FH-45)+'×'+Math.round(FW-45),num*2,'个');
  }else{
    showResult('g2',Math.round(((W-100-29)/2)-10)+'×'+Math.round(gH),num*2,'块');
    showResult('g1',Math.round(W-100-2*FW-29-29-10)+'×'+Math.round(FH-10),num,'块');
    showResult('g4',Math.round(FW-93)+'×'+Math.round(FH-92),num*2,'块');
    showResult('gScreen',Math.round(FH-45)+'×'+Math.round(FW-45),num*2,'个');
  }
}
