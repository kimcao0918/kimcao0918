function drawMode4(){
const{
W,
H,
FH
}=getValues();
const x=50;
const y=20;
const width=120;
const height=120;
const upperHeight=
H-100-FH-29;
const upperY=
y+height*(upperHeight/H);
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
x1="${x+80}"
y1="${y}"
x2="${x+80}"
y2="${y+height}"/>
<polyline
points="${x+110},${y+62}
${x+93},${y+80}
${x+110},${y+98}"/>
${verticalDimension(
25,
y,
upperY,
Math.round(upperHeight),
x
)}
${verticalDimension(
25,
upperY,
y+height,
Math.round(FH),
x
)}
${totalHeightDimension(
190,
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
   4块模式计算
========================================================= */
function calculateMode4(ctx){
const {W,H,FW,FH,num}=ctx;
const gW=
W-100-FW-29-10;
const gH=
H-100-FH-29-10;
showResult(
'g1',
Math.round(gW)+'×'+Math.round(FH-10),
num,
'块'
);
showResult(
'g4',
Math.round(FW-93)+'×'+Math.round(FH-92),
num,
'块'
);
showResult(
'gScreen',
Math.round(FH-45)+'×'+Math.round(FW-45),
num,
'个'
);
showResult(
'g2',
Math.round(gW)+'×'+Math.round(gH),
num,
'块'
);
showResult(
'g3',
Math.round(FW-10)+'×'+Math.round(gH),
num,
'块'
);
}