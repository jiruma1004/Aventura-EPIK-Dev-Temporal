/* Lunar defeat uses the same cast and arcane machine as the playable rooms.
   Assets are requested only on reaching Ignitia, never during the first room. */
window.MoonDivergence=class {
 static duration=16;
 static prepare(){
  if(this.art)return this.art;
  this.art={};
  for(const [key,path] of Object.entries({land:'assets/cinematics/moon-divergence-v1.webp',eric:'assets/cast/eric-b-v1.webp',rocket:'assets/cast/eric-cockpit-b-v1.webp'})){
   const image=new Image();image.decoding='async';image.src=path;this.art[key]=image;
  }
  return this.art;
 }
 static state(t){
  const clamp=x=>Math.max(0,Math.min(1,x)),land=clamp(t/3.8),walk=clamp((t-4.7)/2.8);
  return {land,walk,rocketY:440-650*(1-land)**2,ericX:260+255*walk,
   phase:t<3.8?'landing':t<4.7?'hatch':t<7.5?'walk':t<9.5?'activate':t<12.5?'wave':'divergence',
   charge:clamp((t-7.5)/2),wave:clamp((t-9.5)/3),complete:t>=this.duration};
 }
 constructor(){
  this.art=MoonDivergence.prepare();this.machine=EricMachinery.texture('rig');this.machineOff=document.createElement('canvas');this.machineOff.width=this.machineOff.height=640;const dim=this.machineOff.getContext('2d');dim.drawImage(this.machine,0,0);dim.globalCompositeOperation='source-atop';dim.fillStyle='#030b1466';dim.fillRect(0,0,640,640);this.cues=new Set();
  this.reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
 }
 stop(){Sound.stopArcaneCharge?.();}
 sound(t){
  for(const [time,id,play] of [[3.8,'land',()=>Sound.arcaneLayer?.({from:90,to:35,duration:.7,volume:.10,noise:true})],[7.5,'charge',()=>Sound.arcaneNovaCharge?.()],[9.5,'wave',()=>Sound.arcaneNovaImpact?.()]]){
   if(t>=time&&!this.cues.has(id)){this.cues.add(id);play();}
  }
 }
 caption(t){
  const tr=parts=>parts.map(text=>window.I18n?I18n.t(text):text);
  if(t<3.8)return tr(['LA LUNA','El cohete de Eric ha llegado a su destino.']);
  if(t<7.5)return tr(['DR. ERIC','«Demasiado tarde. Desde aquí, nadie podrá detenerme.»']);
  if(t<9.5)return tr(['DR. ERIC','«¡Que comience la divergencia!»']);
  return tr(['EPITHEA','Una luz verde recorre la Luna. La divergencia ha comenzado.']);
 }
 draw(ctx,width,height,t,{audio=true}={}){
  t=Math.max(0,Math.min(t,MoonDivergence.duration));
  const c=ctx,s=MoonDivergence.state(t),W=960,H=600;
  if(audio)this.sound(t);
  c.save();c.fillStyle='#030611';c.fillRect(0,0,width,height);
  const scale=Math.min(width/W,height/H);c.translate((width-W*scale)/2,(height-H*scale)/2);c.scale(scale,scale);
  c.beginPath();c.rect(0,0,W,H);c.clip();c.imageSmoothingEnabled=false;
  c.save();
  if(!this.reduced&&t>=9.5&&t<11){const k=(11-t)*2;c.translate(Math.sin(t*37)*k,Math.cos(t*29)*k*.6);}
  if(this.art.land.complete&&this.art.land.naturalWidth)c.drawImage(this.art.land,0,0,W,540);
  else {const sky=c.createLinearGradient(0,0,0,540);sky.addColorStop(0,'#070c27');sky.addColorStop(.6,'#22334e');sky.addColorStop(.61,'#667188');sky.addColorStop(1,'#252f45');c.fillStyle=sky;c.fillRect(0,0,W,540);}
  // Soft contact shadows anchor the rocket, the machine and Eric to one plane.
  for(const [x,y,rx,ry,a] of [[230,449,95,14,s.land*.55],[690,460,130,18,.65],[s.ericX,466,35,7,.5]]){
   if(x===s.ericX&&t<4.7)continue;c.fillStyle=`rgba(3,8,17,${a})`;c.beginPath();c.ellipse(x,y,rx,ry,0,0,7);c.fill();
  }
  c.drawImage(this.machineOff,550,183,280,280);c.save();c.globalAlpha=s.charge;c.drawImage(this.machine,550,183,280,280);c.restore();
  const ship=this.art.rocket,shipW=274,shipH=300,shipX=230;
  if(ship.complete&&ship.naturalWidth){
   // Crop the static exhaust; the flame below is animated and stops at landing.
   c.drawImage(ship,0,0,ship.naturalWidth,560,shipX-shipW/2,s.rocketY-shipH,shipW,shipH);
   if(t<3.8){const flame=40+14*Math.sin(t*31);c.fillStyle='#ff9c3b';c.beginPath();c.moveTo(shipX-18,s.rocketY-8);c.lineTo(shipX,s.rocketY+flame);c.lineTo(shipX+18,s.rocketY-8);c.fill();c.fillStyle='#fff0ab';c.beginPath();c.moveTo(shipX-9,s.rocketY-8);c.lineTo(shipX,s.rocketY+flame*.6);c.lineTo(shipX+9,s.rocketY-8);c.fill();}
   // Once he exits, the open hatch covers his cockpit portrait.
   if(t>=4.1){c.fillStyle='#0a1421';c.strokeStyle='#8ba3b1';c.lineWidth=4;c.beginPath();c.ellipse(shipX,s.rocketY-shipH+139,45.5*Math.min(1,(t-4.1)/.5),39,0,0,7);c.fill();c.stroke();}
  }
  if(t>=3.4&&t<5.4){const age=t-3.4;c.save();c.globalAlpha=Math.max(0,1-age/2)*.5;c.fillStyle='#afb7bd';for(let i=0;i<14;i++){c.beginPath();c.ellipse(230+Math.cos(i*2.4)*(24+age*70),445+Math.sin(i*3.2)*9,9+age*10,3+age*4,0,0,7);c.fill();}c.restore();}
  if(t>=4.7){
   const frame=s.phase==='walk'?4+Math.floor((t-4.7)*7)%4:s.phase==='activate'?10:s.phase==='divergence'?15:0;
   RPGCast.draw(c,this.art.eric,'idle',0,s.ericX,466,160,{frame});
  }
  if(s.charge>0){
   const glow=c.createRadialGradient(690,322,4,690,322,170+80*s.charge);glow.addColorStop(0,`rgba(187,255,197,${.7*s.charge})`);glow.addColorStop(.3,`rgba(51,255,139,${.35*s.charge})`);glow.addColorStop(1,'#1bff9800');c.fillStyle=glow;c.fillRect(400,30,560,490);
   c.save();c.translate(690,322);c.strokeStyle='#b6ffba';c.lineWidth=2;
   for(let i=0;i<3;i++){c.beginPath();c.ellipse(0,0,48+12*i,20+8*i,(this.reduced?0:t*.45)+i*Math.PI/3,0,7);c.stroke();}c.restore();
   if(s.phase==='activate'){c.strokeStyle='#b1ffc6';c.lineWidth=2;c.beginPath();c.moveTo(563,360);c.lineTo(603,342);c.lineTo(620,353);c.lineTo(690,322);c.stroke();}
  }
  if(t>=9.5){
   const age=t-9.5;
   c.save();c.globalAlpha=Math.min(.65,age*.5);const beam=c.createLinearGradient(640,0,740,0);beam.addColorStop(0,'#3cff9000');beam.addColorStop(.5,'#a0ffc788');beam.addColorStop(1,'#3cff9000');c.fillStyle=beam;c.fillRect(640,0,100,322);c.restore();
   for(let i=0;i<3;i++){const r=Math.max(0,age-i*.5)*230;if(r<=0)continue;c.save();c.globalAlpha=Math.max(0,.8-r/1400);c.strokeStyle=i%2?'#ceffd3':'#53ff96';c.lineWidth=4;c.beginPath();c.ellipse(690,448,r,r*.28,0,0,7);c.stroke();c.restore();}
   // Persistent luminous cracks, a smooth wave rather than repeated flashes.
   c.strokeStyle='#6bffa3';c.lineWidth=2;c.globalAlpha=.65*s.wave;
   for(let i=0;i<9;i++){c.beginPath();const end=690+(i-4)*190*s.wave;for(let k=0;k<=7;k++){const x=690+(end-690)*k/7,y=445+k*(i%2?10:7)+Math.sin(i*3+k*2)*9;if(k)c.lineTo(x,y);else c.moveTo(x,y);}c.stroke();}c.globalAlpha=1;
   c.fillStyle=`rgba(12,113,62,${.27*s.wave})`;c.fillRect(0,0,W,540);
  }
  c.restore();
  c.fillStyle='#060e1bdb';c.fillRect(0,0,W,48);c.strokeStyle='#a6bd9d';c.lineWidth=1;c.beginPath();c.moveTo(28,48);c.lineTo(932,48);c.stroke();
  c.textAlign='center';c.fillStyle='#eee5c4';c.font='bold 20px Georgia';c.fillText(window.I18n?I18n.t('EL ÚLTIMO EXPERIMENTO'):'EL ÚLTIMO EXPERIMENTO',480,31);
  const [who,text]=this.caption(t);
  c.fillStyle='#071222ed';c.fillRect(0,512,W,88);c.strokeStyle='#7dbda0';c.beginPath();c.moveTo(30,512);c.lineTo(930,512);c.stroke();
  c.fillStyle='#a5e3bc';c.font='bold 17px Georgia';c.fillText(who,480,538);
  c.fillStyle='#f1ead8';c.font='21px Georgia';c.fillText(text,480,574);
  if(t>13){const fade=Math.min(.35,(t-13)*.1);c.fillStyle=`rgba(0,6,10,${fade})`;c.fillRect(0,48,W,464);}
  c.restore();
 }
};
