/* Escenografía y retratos ilustrados originales, sin descargas externas. */
window.makeScenery=()=>{
 const make=(w,h,paint)=>{const a=document.createElement('canvas');a.width=w;a.height=h;paint(a.getContext('2d'));return a;};
 let seed=401;const rnd=()=>{seed=(1664525*seed+1013904223)>>>0;return seed/4294967296;};
 const forest=make(512,768,c=>{
  c.fillStyle='#122b26';c.fillRect(0,0,512,768);
  for(let i=0;i<18;i++){const x=i*37-40;c.fillStyle=i%2?'#263c32':'#1a332c';c.fillRect(x,120,10+rnd()*12,640);}
  for(const x of [82,320,480]){const g=c.createLinearGradient(x-25,0,x+30,0);g.addColorStop(0,'#18251e');g.addColorStop(.5,'#655b3e');g.addColorStop(1,'#2b3627');c.fillStyle=g;c.beginPath();c.moveTo(x-30,740);c.lineTo(x-13,100);c.lineTo(x+12,80);c.lineTo(x+24,740);c.fill();c.strokeStyle='#4c5335';c.lineWidth=13;for(let j=0;j<5;j++){c.beginPath();c.moveTo(x,300+j*65);c.lineTo(x+(j%2?95:-83),190+j*57);c.stroke();}c.lineWidth=2;c.strokeStyle='#0c211b88';for(let i=0;i<8;i++){c.beginPath();c.moveTo(x-15+i*5,270);c.lineTo(x-20+i*6,720);c.stroke();}}
  for(let i=0;i<360;i++){const x=rnd()*512,y=rnd()*380;c.fillStyle=['#204633','#305b3c','#417148','#183a2e'][i%4];c.beginPath();c.ellipse(x,y,12+rnd()*42,8+rnd()*23,rnd()*3,0,Math.PI*2);c.fill();}
  for(let i=0;i<220;i++){const x=rnd()*512,y=590+rnd()*178;c.fillStyle=['#1a422c','#39613a','#557344','#284e32'][i%4];c.beginPath();c.ellipse(x,y,4+rnd()*23,3+rnd()*10,rnd()*3,0,Math.PI*2);c.fill();}
  c.strokeStyle='#73904b';c.lineWidth=2;for(let i=0;i<40;i++){const x=rnd()*512;c.beginPath();c.moveTo(x,768);c.quadraticCurveTo(x-16,708,x+8,682+rnd()*55);c.stroke();}
 });
 const portal=open=>make(512,512,c=>{
  if(!open){c.fillStyle='#100e27';c.fillRect(0,0,512,512);}else{c.fillStyle='#29285888';c.fillRect(35,10,442,502);}
  c.save();c.translate(256,256);c.scale(.82,1);
  const aura=c.createRadialGradient(0,0,20,0,0,252);aura.addColorStop(0,open?'#8cfff522':'#412473');aura.addColorStop(.65,open?'#7051d255':'#291942');aura.addColorStop(.87,open?'#95ffff':'#9964cd');aura.addColorStop(1,'#15142600');c.fillStyle=aura;c.fillRect(-310,-256,620,512);
  c.strokeStyle=open?'#bdfff1':'#d4b4fa';c.lineWidth=9;c.beginPath();c.ellipse(0,0,235,245,0,0,Math.PI*2);c.stroke();c.lineWidth=2;c.beginPath();c.ellipse(0,0,207,219,0,0,Math.PI*2);c.stroke();
  for(let i=0;i<12;i++){c.save();c.rotate(i*Math.PI/6);c.translate(0,-228);c.strokeStyle=open?'#deffb9':'#b9a0e2';c.lineWidth=3;c.strokeRect(-6,-8,12,16);c.beginPath();c.moveTo(-11,0);c.lineTo(11,0);c.stroke();c.restore();}
  c.lineWidth=3;c.strokeStyle=open?'#8effe388':'#a783d8';c.beginPath();for(let i=0;i<160;i++){const a=i*.11,r=10+i*.95;const x=Math.cos(a)*r,y=Math.sin(a)*r;(i?c.lineTo(x,y):c.moveTo(x,y));}c.stroke();
  if(!open){c.fillStyle='#1d1634';c.fillRect(-70,-74,140,148);c.strokeStyle='#f3d99c';c.lineWidth=5;c.strokeRect(-55,-58,110,116);c.beginPath();c.moveTo(0,-48);c.lineTo(38,0);c.lineTo(0,48);c.lineTo(-38,0);c.closePath();c.stroke();c.font='23px Trebuchet MS';c.textAlign='center';c.fillStyle='#f2dcb1';c.fillText('SELLO',0,99);}
  c.restore();
 });
 const portrait=(kind,name,frame,accent)=>make(320,380,c=>{
  c.fillStyle='#1c1728';c.fillRect(0,0,320,380);c.strokeStyle=frame;c.lineWidth=12;c.strokeRect(9,9,302,362);c.lineWidth=2;c.strokeRect(23,23,274,334);
  const oval=kind==='planck'||kind==='curie';c.save();c.beginPath();if(oval)c.ellipse(160,168,124,143,0,0,Math.PI*2);else c.rect(29,29,262,282);c.clip();
  const g=c.createRadialGradient(165,143,10,160,170,210);g.addColorStop(0,accent);g.addColorStop(1,'#101825');c.fillStyle=g;c.fillRect(24,24,274,292);
  c.strokeStyle='#d8eeef22';c.lineWidth=2;for(let i=0;i<5;i++){c.beginPath();c.arc(160,170,45+i*26,0,Math.PI*2);c.stroke();}
  const poly=(pts,color)=>{c.fillStyle=color;c.beginPath();pts.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.closePath();c.fill();};
  poly([[53,316],[75,245],[130,228],[191,228],[250,253],[272,316]],kind==='doof'?'#dedccf':'#252532');
  if(kind==='doof'){
   poly([[118,99],[183,105],[191,147],[238,172],[178,181],[174,228],[146,238],[136,194],[109,166]],'#e8ba93');
   poly([[107,150],[99,103],[114,112],[116,79],[132,99],[153,72],[157,93],[187,87],[185,115],[128,121]],'#7b472d');
   c.fillStyle='#f5f2dd';c.beginPath();c.ellipse(157,144,17,11,-.14,0,Math.PI*2);c.fill();c.fillStyle='#293632';c.fillRect(163,140,5,8);c.strokeStyle='#653c2a';c.lineWidth=4;c.beginPath();c.moveTo(142,128);c.lineTo(178,136);c.moveTo(146,193);c.lineTo(177,187);c.stroke();poly([[130,239],[146,278],[176,239],[186,316],[127,316]],'#26252b');
  }else{
   c.fillStyle='#d2ad92';c.beginPath();c.ellipse(160,166,51,71,0,0,Math.PI*2);c.fill();
   if(kind==='planck'){c.fillStyle='#c3c4b5';for(const x of [105,203]){c.beginPath();c.ellipse(x,163,12,42,0,0,Math.PI*2);c.fill();}c.strokeStyle='#9c816d';c.lineWidth=2;for(let y=120;y<140;y+=7){c.beginPath();c.moveTo(139,y);c.lineTo(178,y);c.stroke();}}
   else if(kind==='curie'){c.fillStyle='#302921';c.beginPath();c.ellipse(160,106,61,35,0,Math.PI,2*Math.PI);c.fill();c.fillRect(103,105,16,76);c.fillRect(201,105,16,76);c.beginPath();c.arc(214,114,26,0,Math.PI*2);c.fill();}
   else {poly([[107,155],[101,107],[126,78],[145,90],[172,74],[211,106],[208,153],[188,121],[146,111]],kind==='eric'?'#867194':'#302a29');}
   c.strokeStyle='#382e31';c.lineWidth=4;c.beginPath();c.moveTo(126,154);c.lineTo(148,161);c.moveTo(173,161);c.lineTo(194,154);c.stroke();
   c.fillStyle='#c7ffba';for(const x of [140,181]){c.beginPath();c.ellipse(x,170,6,4,0,0,Math.PI*2);c.fill();}
   if(kind==='planck'||kind==='eric'){c.strokeStyle=frame;c.lineWidth=3;for(const x of [137,183]){c.beginPath();c.arc(x,170,19,0,Math.PI*2);c.stroke();}c.beginPath();c.moveTo(156,169);c.lineTo(164,169);c.stroke();}
   c.strokeStyle='#8d6858';c.lineWidth=3;c.beginPath();c.moveTo(161,173);c.lineTo(151,194);c.lineTo(166,194);c.stroke();
   if(kind==='planck'||kind==='tesla')poly([[140,206],[155,198],[180,206],[170,215],[157,207],[145,215]],kind==='planck'?'#989182':'#322a28');
   c.strokeStyle='#714754';c.beginPath();c.moveTo(148,223);c.quadraticCurveTo(160,kind==='eric'?237:218,179,218);c.stroke();poly([[128,238],[160,270],[191,238],[177,313],[142,313]],accent);
  }
  c.restore();if(oval){c.strokeStyle=frame;c.lineWidth=6;c.beginPath();c.ellipse(160,168,125,144,0,0,Math.PI*2);c.stroke();}
  else{c.fillStyle=frame;for(const [x,y] of [[20,20],[300,20],[20,318],[300,318]]){c.beginPath();c.moveTo(x,y-13);c.lineTo(x+10,y);c.lineTo(x,y+13);c.lineTo(x-10,y);c.closePath();c.fill();}}
  c.textAlign='center';c.fillStyle='#f0dfba';c.font=(name.length>16?'18':'21')+'px Trebuchet MS';c.fillText(name,160,339);c.fillStyle='#b3afc5';c.font='12px Trebuchet MS';c.fillText('GALERÍA DEL DR. ERIC · FICCIÓN',160,360);
 });
 const chalkWall=make(1600,500,c=>{
  // Fondo transparente: la pintura queda directamente sobre los ladrillos.
  const equations=[
   ['y = y₀ + x tan(θ) − gx²/(2v₀² cos²θ)',40,80,-.008,64,'#d9e9d1'],
   ['v₀ = √(2E/m)',60,195,-.015,64,'#e7dcad'],
   ['x = v₀ cos(θ)t',830,195,.015,62,'#d5e6ed'],
   ['y = y₀ + v₀ sen(θ)t − ½gt²',60,320,-.008,62,'#d5e6ed'],
   ['vᵧ = v₀ sen(θ) − gt',50,455,-.010,52,'#e7dcad'],
   ['yₘáx = y₀ + v₀² sen²(θ)/(2g)',770,455,.008,50,'#d9e9d1']
  ];
  c.fillStyle='#d9e9d1';c.font='italic 30px Georgia';c.fillText('φ = 0°',1410,140);
  for(const [eq,x,y,angle,size,color] of equations){c.save();c.translate(x,y);c.rotate(angle);c.fillStyle=color;c.globalAlpha=.93;c.font=`italic ${size}px Georgia`;c.fillText(eq,0,0);c.restore();}
  // Desgaste en los trazos, sin añadir una placa ni un recuadro opaco.
  c.globalCompositeOperation='destination-out';
  for(let i=0;i<3500;i++){c.fillStyle='#00000055';c.fillRect(rnd()*1600,rnd()*500,1+rnd()*3,1+rnd()*2);}
  c.globalCompositeOperation='source-over';
 });
 return {forest,chalkWall,portalSealed:portal(false),portalOpen:portal(true),doof:portrait('doof','DOOFENSHMIRTZ','#b091c9','#49306c'),planck:portrait('planck','MAX PLANCK','#c0a16c','#345c45'),tesla:portrait('tesla','NIKOLA TESLA','#91aebe','#303d75'),curie:portrait('curie','MARIE CURIE','#987565','#496737'),eric:portrait('eric','DR. ERIC','#b4a477','#633d61')};
};
