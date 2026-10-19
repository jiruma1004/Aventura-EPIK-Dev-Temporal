/* Ignitia's open-air launch court. All ornaments are visual: walking and
   console interaction keep their original coordinates. Small textures are
   built once, then projected using the shared wall-depth buffer. */
window.IgnitiaLaunchpad={
 beacons:[{x:12.3,y:4.3},{x:12.3,y:10.7},{x:19.4,y:4.3},{x:19.4,y:10.7}],
 floor(x,y){
  const seam=x%1<.035||y%1<.035,dx=x-16,dy=y-7.5,r2=dx*dx+dy*dy;
  if(r2<10.9){
   if(r2>9.8)return Math.floor(Math.atan2(dy,dx)*12)%2?'#b2a16c':'#384b50';
   if(r2>8.9)return '#72bdb7';
   if(Math.abs(dx)<.055||Math.abs(dy)<.055)return '#a1afa1';
   return seam?'#273d47':(Math.floor(x*2)+Math.floor(y*2))%2?'#4b6267':'#40545f';
  }
  // Brass-trimmed walkway and a short cyan branch leading to the console.
  if(x<11.5&&Math.abs(y-7.5)<1.1){
   if(Math.abs(y-7.5)>.97)return '#a59566';
   if(x>4.5&&x<7.6&&Math.abs(y-6.55)<.045)return '#83d5ce';
   return seam?'#4b514e':'#7e8171';
  }
  if(x>6.6&&x<8.4&&y>4.8&&y<6.55)return seam?'#324c4c':'#5c7771';
  if(x>7.4&&x<7.5&&y>5.5&&y<7.5)return '#83d5ce';
  return seam?'#25373e':(Math.floor(x)+Math.floor(y))%2?'#3f5054':'#35464c';
 },
 texture(name){
  this.art??={};if(this.art[name])return this.art[name];
  const a=document.createElement('canvas');a.width=256;a.height=512;const c=a.getContext('2d');
  if(name==='banner'){
   c.fillStyle='#aa9362';c.fillRect(10,17,236,12);
   c.fillStyle='#132e43';c.beginPath();c.moveTo(34,29);c.lineTo(222,29);c.lineTo(222,432);c.lineTo(128,495);c.lineTo(34,432);c.closePath();c.fill();
   c.strokeStyle='#b5a477';c.lineWidth=5;c.stroke();c.strokeStyle='#3e6572';c.lineWidth=3;c.strokeRect(49,45,158,365);
   // A guild crest: a rocket pointing toward a star, framed by an orbit.
   c.strokeStyle='#a4c8bd';c.lineWidth=4;c.beginPath();c.ellipse(128,211,66,98,.3,0,Math.PI*2);c.stroke();
   c.fillStyle='#e2d7ac';c.beginPath();c.moveTo(128,115);c.quadraticCurveTo(102,145,111,238);c.lineTo(145,238);c.quadraticCurveTo(154,145,128,115);c.fill();
   c.fillStyle='#bba16c';c.beginPath();c.moveTo(110,205);c.lineTo(88,252);c.lineTo(112,241);c.moveTo(145,205);c.lineTo(168,252);c.lineTo(144,241);c.fill();
   c.fillStyle='#539a9f';c.beginPath();c.arc(128,172,12,0,7);c.fill();
   c.fillStyle='#eab76b';c.beginPath();c.moveTo(116,245);c.lineTo(128,285);c.lineTo(140,245);c.fill();
   c.font='bold 32px Georgia';c.textAlign='center';c.fillStyle='#eee0b0';c.fillText('IGNITIA',128,351);c.font='27px Georgia';c.fillText('✦',128,83);
  }else if(name==='beacon'){
   const g=c.createRadialGradient(128,103,8,128,103,100);g.addColorStop(0,'#b4fff481');g.addColorStop(1,'#70dcd200');c.fillStyle=g;c.fillRect(0,0,256,213);
   c.fillStyle='#273e48';c.fillRect(91,143,74,320);c.fillStyle='#627b78';c.fillRect(91,143,16,320);c.fillStyle='#a8996c';c.fillRect(76,451,104,37);c.fillRect(82,155,92,18);
   c.fillStyle='#a9e7d3';c.fillRect(99,74,58,69);c.fillStyle='#eff9cf';c.fillRect(111,80,10,58);
   c.strokeStyle='#b7a879';c.lineWidth=8;c.strokeRect(91,65,74,88);c.fillStyle='#a29368';c.beginPath();c.moveTo(80,65);c.lineTo(128,30);c.lineTo(176,65);c.fill();
   c.strokeStyle='#799b93';c.lineWidth=4;c.strokeRect(112,208,32,179);
  }else if(name==='gantry'){
   // Slim brass-and-iron service scaffold; transparent center keeps the rocket visible.
   c.strokeStyle='#233a46';c.lineWidth=17;
   for(const x of [24,232]){c.beginPath();c.moveTo(x,497);c.lineTo(x,20);c.stroke();}
   c.strokeStyle='#9d9877';c.lineWidth=5;
   for(const x of [18,226]){c.beginPath();c.moveTo(x,497);c.lineTo(x,20);c.stroke();}
   for(let y=35;y<480;y+=65){c.strokeStyle='#587177';c.lineWidth=7;c.beginPath();c.moveTo(29,y);c.lineTo(53,y+60);c.lineTo(29,y+60);c.moveTo(227,y);c.lineTo(203,y+60);c.lineTo(227,y+60);c.stroke();}
   c.fillStyle='#415b61';c.fillRect(17,17,222,24);c.fillStyle='#b5a77c';c.fillRect(17,17,222,5);
   c.fillStyle='#a8dcca';for(const x of [48,128,208])c.fillRect(x-4,27,8,8);
   c.fillStyle='#354e58';c.fillRect(5,486,62,24);c.fillRect(189,486,62,24);
  }
  return this.art[name]=a;
 },
 wall(r,hit,sx,top,height){
  let u;
  if(hit.axis==='y'&&(hit.cy===0||hit.cy===14)){
   const center=[6,13,20].find(x=>Math.abs(hit.px-x)<.7);if(center===undefined)return;u=(hit.px-center+.7)/1.4;
  }else if(hit.axis==='x'&&hit.cx===24&&Math.abs(hit.py-7.5)<1.4)u=(hit.py-6.1)/2.8;
  else return;
  const c=r.ctx;c.save();c.globalAlpha=Math.max(.4,1/(1+hit.distance*.04));c.drawImage(this.texture('banner'),Math.min(255,Math.floor(u*256)),0,1,512,sx,top-height*1.35,3,height*2.15);c.restore();
 },
 draw(r,player,actors){
  WorldBillboard(r,player,actors,this.texture('gantry'),19.6,7.5,0,5.6,6.2);
  // Only four small ornaments; reuse the list rather than allocating it per frame.
  this.beacons.sort((a,b)=>(b.x-player.x)**2+(b.y-player.y)**2-(a.x-player.x)**2-(a.y-player.y)**2);
  for(const p of this.beacons)WorldBillboard(r,player,actors,this.texture('beacon'),p.x,p.y,0,.5,1.15);
 }
};
