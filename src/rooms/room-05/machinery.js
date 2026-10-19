/* Cached metal, brass and glass hardware. Animation is drawn separately. */
window.EricMachinery={
 texture(kind){
  const a=document.createElement('canvas');a.width=640;a.height=640;const c=a.getContext('2d');
  const metal=(x,y,w,h)=>{const g=c.createLinearGradient(x,y,x+w,y);g.addColorStop(0,'#19292c');g.addColorStop(.24,'#738580');g.addColorStop(.48,'#354b49');g.addColorStop(1,'#142426');c.fillStyle=g;c.fillRect(x,y,w,h);c.strokeStyle='#ac9670';c.lineWidth=4;c.strokeRect(x,y,w,h);};
  const bolt=(x,y)=>{c.fillStyle='#d3b77c';c.beginPath();c.arc(x,y,5,0,7);c.fill();c.strokeStyle='#493b26';c.beginPath();c.moveTo(x-3,y);c.lineTo(x+3,y);c.stroke();};
  if(kind==='rig'){
   metal(40,570,560,54);metal(95,132,66,438);metal(479,132,66,438);metal(130,100,380,50);
   for(const x of [128,512]){metal(x-26,42,52,115);for(let y=65;y<540;y+=28){c.strokeStyle='#b79961';c.lineWidth=7;c.beginPath();c.ellipse(x,y,39,11,0,0,7);c.stroke();}}
   const glow=c.createRadialGradient(320,318,10,320,318,190);glow.addColorStop(0,'#b0ffc3b0');glow.addColorStop(.4,'#48ed9455');glow.addColorStop(1,'#35ee8800');c.fillStyle=glow;c.fillRect(130,128,380,380);
   for(const [r,color,width] of [[180,'#101d22',32],[172,'#9e855a',12],[148,'#536b68',20],[138,'#81ffb3',4]]){c.strokeStyle=color;c.lineWidth=width;c.beginPath();c.arc(320,318,r,0,7);c.stroke();}
   for(let i=0;i<12;i++){const t=i*Math.PI/6;bolt(320+Math.cos(t)*172,318+Math.sin(t)*172);}
   c.fillStyle='#061d20';c.beginPath();c.arc(320,318,99,0,7);c.fill();c.strokeStyle='#75f9a8';c.lineWidth=5;
   for(let i=0;i<3;i++){c.beginPath();c.ellipse(320,318,80,30,i*Math.PI/3,0,7);c.stroke();}
   c.fillStyle='#d9ffe5';c.beginPath();c.arc(320,318,15,0,7);c.fill();metal(230,505,180,60);
   c.fillStyle='#0b2622';c.fillRect(250,516,140,32);c.fillStyle='#a0fbbb';c.font='18px Georgia';c.textAlign='center';c.fillText('DIVERGENCIA',320,539);
   for(const x of [62,578]){bolt(x,590);bolt(x,610);}
  }else{
   // Three-dimensional beveled foot and curved brass emitter.
   c.fillStyle='#142024';c.beginPath();c.moveTo(122,573);c.lineTo(470,573);c.lineTo(528,620);c.lineTo(78,620);c.closePath();c.fill();metal(155,350,300,222);
   c.fillStyle='#253b3d';c.beginPath();c.moveTo(455,350);c.lineTo(503,384);c.lineTo(503,575);c.lineTo(455,572);c.closePath();c.fill();
   metal(263,160,88,180);metal(239,59,136,114);for(let y=73;y<166;y+=19){c.strokeStyle='#c5a46a';c.lineWidth=8;c.beginPath();c.ellipse(307,y,77,15,0,0,7);c.stroke();}
   c.fillStyle='#092f25';c.beginPath();c.ellipse(307,56,53,19,0,0,7);c.fill();c.strokeStyle='#7effb0';c.lineWidth=6;c.stroke();
   // Slanted green control display, luminous but legible.
   c.fillStyle='#172629';c.beginPath();c.moveTo(153,265);c.lineTo(444,265);c.lineTo(467,402);c.lineTo(132,402);c.closePath();c.fill();c.strokeStyle='#b39a6c';c.lineWidth=9;c.stroke();
   const screen=c.createLinearGradient(0,277,0,390);screen.addColorStop(0,'#164f3a');screen.addColorStop(1,'#05251d');c.fillStyle=screen;c.fillRect(167,281,264,104);c.strokeStyle='#6dfda6';c.lineWidth=3;c.strokeRect(167,281,264,104);
   c.fillStyle='#bdffd5';c.textAlign='center';c.font='bold 29px Georgia';c.fillText(kind==='left'?'LÁSER −':'LÁSER +',299,318);c.font='25px Georgia';c.fillText('( x , y )',299,359);
   for(let y=285;y<384;y+=7){c.fillStyle='#7cff9910';c.fillRect(169,y,260,1);}
   for(let i=0;i<3;i++){c.fillStyle=i?'#608174':'#8affb7';c.beginPath();c.arc(214+i*74,441,10,0,7);c.fill();}for(const x of [175,435])for(const y of [375,545])bolt(x,y);
  }
  return a;
 },
 effects(r,player,actors,time,solved){
  if(solved)return;const p=actors.project(r,player,23.45,7.5,2.25);if(!p||p.depth<.3||p.x<0||p.x>r.canvas.width||p.depth>(r.depths[Math.floor(p.x/3)*3]??Infinity)+.1)return;
  const c=r.ctx,s=p.scale;c.save();c.globalAlpha=.55+.08*Math.sin(time*1.6);c.strokeStyle='#7dffae';c.lineWidth=Math.max(1,s*.014);
  // Slow shifting arcs, without full-screen flashes or expensive blur filters.
  for(let arm=0;arm<5;arm++){const a=arm*Math.PI*2/5+time*.12;c.beginPath();for(let j=0;j<7;j++){const radius=j*.24,angle=a+Math.sin(j*2.7+time*3+arm)*.12;const x=p.x+Math.cos(angle)*radius*s,y=p.y+Math.sin(angle)*radius*s;if(j)c.lineTo(x,y);else c.moveTo(x,y);}c.stroke();}
  c.fillStyle='#cbffdc';c.beginPath();c.arc(p.x,p.y,s*.075,0,7);c.fill();c.restore();
 },
 label(r,player,actors,l,done){
  const p=actors.project(r,player,l.x,l.y,1.75);if(!p||p.depth<.4||p.depth>20||p.x<0||p.x>r.canvas.width||p.depth>(r.depths[Math.floor(p.x/3)*3]??Infinity)+.1)return;
  const c=r.ctx,unit=r.canvas.width/Math.max(320,r.canvas.clientWidth),near=Math.hypot(player.x-l.x,player.y-l.y)<2.2;
  const text=I18n.t(done?'Láser · Listo':near?'Láser · E / tocar':'Láser');c.save();c.font=`${14*unit}px Georgia`;const w=c.measureText(text).width+22*unit,h=29*unit,x=Math.max(6,Math.min(r.canvas.width-w-6,p.x-w/2)),y=Math.max(6,p.y-h);c.fillStyle='#082d24cf';c.strokeStyle='#8ae8ab';c.lineWidth=unit;c.beginPath();c.roundRect(x,y,w,h,7*unit);c.fill();c.stroke();c.beginPath();c.moveTo(p.x-5*unit,y+h);c.lineTo(p.x,y+h+6*unit);c.lineTo(p.x+5*unit,y+h);c.fill();c.fillStyle='#d5ffe3';c.textAlign='center';c.fillText(text,x+w/2,y+20*unit);c.restore();
 }
};
