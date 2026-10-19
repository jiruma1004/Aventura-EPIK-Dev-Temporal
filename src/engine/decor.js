/* Arte original dibujado en canvas. Se proyecta sobre la pared, no sobre la cámara. */
window.makeWallArt=()=>{
  const make=(width,height,paint)=>{const canvas=document.createElement('canvas');canvas.width=width;canvas.height=height;paint(canvas.getContext('2d'),width,height);return canvas;};
  const portrait=make(320,360,(c,w,h)=>{
    c.fillStyle='#302b3a';c.fillRect(0,0,w,h);c.strokeStyle='#d6bc7c';c.lineWidth=12;c.strokeRect(8,8,w-16,h-16);c.lineWidth=2;c.strokeRect(22,22,w-44,h-44);
    const bg=c.createLinearGradient(0,30,w,300);bg.addColorStop(0,'#374c6b');bg.addColorStop(1,'#16283b');c.fillStyle=bg;c.fillRect(27,27,w-54,278);
    c.fillStyle='#c0cdd1';c.font='italic 22px Georgia';c.fillText('x = v·t',42,65);
    // Chaqueta, cabello despeinado y rostro: un retrato ilustrado de Einstein.
    c.fillStyle='#6a737e';c.beginPath();c.moveTo(57,302);c.quadraticCurveTo(62,241,137,229);c.lineTo(183,229);c.quadraticCurveTo(251,244,265,302);c.fill();
    c.fillStyle='#d6d9d4';c.beginPath();c.moveTo(127,231);c.lineTo(161,274);c.lineTo(193,231);c.closePath();c.fill();
    c.fillStyle='#f2ead9';
    for(let i=0;i<22;i++){const a=Math.PI+i/21*Math.PI*1.35,x=160+Math.cos(a)*73,y=160+Math.sin(a)*64;c.beginPath();c.ellipse(x,y,24,10,a-.7,0,Math.PI*2);c.fill();}
    c.fillStyle='#d7af91';c.beginPath();c.ellipse(160,174,53,70,0,0,Math.PI*2);c.fill();
    c.strokeStyle='#b18770';c.lineWidth=2;for(let y=131;y<147;y+=6){c.beginPath();c.moveTo(137,y);c.quadraticCurveTo(160,y-6,181,y);c.stroke();}
    c.strokeStyle='#f3ecdf';c.lineWidth=8;c.beginPath();c.moveTo(124,161);c.lineTo(146,157);c.moveTo(171,157);c.lineTo(194,162);c.stroke();
    c.fillStyle='#33404a';for(const x of [139,180]){c.beginPath();c.ellipse(x,168,4,3,0,0,Math.PI*2);c.fill();}
    c.strokeStyle='#98705d';c.lineWidth=3;c.beginPath();c.moveTo(162,171);c.lineTo(154,190);c.quadraticCurveTo(159,195,167,190);c.stroke();
    c.fillStyle='#eee6d7';c.beginPath();c.moveTo(160,194);c.bezierCurveTo(135,190,139,208,122,212);c.quadraticCurveTo(143,218,160,202);c.quadraticCurveTo(176,218,198,212);c.bezierCurveTo(179,208,185,190,160,194);c.fill();
    c.strokeStyle='#956e5e';c.lineWidth=2;c.beginPath();c.moveTo(147,219);c.quadraticCurveTo(160,225,176,219);c.stroke();
    c.fillStyle='#eedfb8';c.textAlign='center';c.font='20px Trebuchet MS, sans-serif';c.fillText('ALBERT EINSTEIN',160,332);
  });
  const equations=make(600,260,(c)=>{
    c.save();c.translate(25,55);c.rotate(-.045);c.fillStyle='#bbdfde';c.font='italic 43px Georgia';c.fillText('y = y₀ + v₀ᵧt − ½gt²',0,20);c.fillStyle='#e3c58b';c.fillText('v² = v₀² + 2aΔx',36,95);c.font='italic 25px Trebuchet MS, sans-serif';c.fillText('¿Y si pruebas otro ángulo?',65,155);c.strokeStyle='#b8d4e0';c.lineWidth=3;c.beginPath();c.moveTo(430,150);c.quadraticCurveTo(505,0,550,135);c.lineTo(535,127);c.moveTo(550,135);c.lineTo(553,117);c.stroke();c.restore();
  });
  const crest=make(100,300,(c)=>{
    c.fillStyle='#1b2b48';c.beginPath();c.moveTo(10,0);c.lineTo(90,0);c.lineTo(90,250);c.lineTo(50,294);c.lineTo(10,250);c.closePath();c.fill();c.strokeStyle='#b7a476';c.lineWidth=3;c.stroke();
    c.strokeStyle='#a9d6ec';c.beginPath();c.moveTo(50,60);c.lineTo(72,120);c.lineTo(50,180);c.lineTo(28,120);c.closePath();c.stroke();c.beginPath();c.arc(50,120,33,0,Math.PI*2);c.stroke();
  });
  const brick=make(512,512,(c,w,h)=>{
    let seed=7301;const random=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};
    c.fillStyle='#292a28';c.fillRect(0,0,w,h);
    // Hiladas alternadas, juntas hundidas, cantos gastados y humedad.
    for(let row=0;row<8;row++)for(let col=-1;col<5;col++){
      const x=col*128+(row%2)*64,y=row*64,tone=Math.floor(random()*30),warm=random()>.5;
      const gradient=c.createLinearGradient(x,y,x+35,y+64);gradient.addColorStop(0,`rgb(${140+tone},${warm?112+tone:122+tone},${98+tone})`);gradient.addColorStop(1,`rgb(${99+tone},${warm?78+tone:89+tone},${70+tone})`);
      c.fillStyle=gradient;c.beginPath();c.moveTo(x+7,y+4);c.lineTo(x+120,y+3);c.lineTo(x+125,y+9);c.lineTo(x+124,y+55);c.lineTo(x+118,y+60);c.lineTo(x+6,y+59);c.lineTo(x+3,y+52);c.lineTo(x+3,y+10);c.closePath();c.fill();
      c.strokeStyle='#d5c9a944';c.lineWidth=2;c.beginPath();c.moveTo(x+7,y+7);c.lineTo(x+120,y+6);c.moveTo(x+6,y+9);c.lineTo(x+6,y+50);c.stroke();
      c.strokeStyle='#171d2480';c.beginPath();c.moveTo(x+8,y+57);c.lineTo(x+120,y+57);c.lineTo(x+122,y+11);c.stroke();
      if(random()>.58){const cx=x+15+random()*90;c.strokeStyle='#2c302b99';c.lineWidth=1.5;c.beginPath();c.moveTo(cx,y+5);c.lineTo(cx-7,y+17);c.lineTo(cx+2,y+27);c.lineTo(cx-3,y+37);c.stroke();}
      for(let i=0;i<30;i++){c.fillStyle=i%2?'#e3d6b618':'#19211f25';c.fillRect(x+8+random()*109,y+9+random()*43,1+random()*4,1+random()*2);}
      if(random()>.63){c.fillStyle='#45503c66';for(let i=0;i<18;i++){const mx=x+random()*125,my=y+55+random()*7;c.beginPath();c.ellipse(mx,my,3+random()*9,1+random()*3,0,0,Math.PI*2);c.fill();}}
    }
  });
  return {portrait,equations,crest,brick};
};
