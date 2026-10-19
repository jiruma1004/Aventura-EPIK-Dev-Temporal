/* Escenografía de exteriores dibujada en canvas y fijada al mundo. */
window.WorldBillboard=function(renderer,player,actors,art,x,y,z,width,height,occlude=true){
 const p=actors.project(renderer,player,x,y,z);if(!p||!art.width)return;const c=renderer.ctx,w=p.scale*width,h=p.scale*height,left=p.x-w/2,top=p.y-h;
 c.save();c.imageSmoothingEnabled=false;
 for(let sx=Math.max(0,Math.floor(left/3)*3);sx<Math.min(renderer.canvas.width,left+w);sx+=3){if(occlude&&p.depth>(renderer.depths[sx]??Infinity)+.05)continue;const u=Math.max(0,(sx-left)/w),sw=Math.min(art.width-u*art.width,3/w*art.width);if(sw>0)c.drawImage(art,u*art.width,0,sw,art.height,sx,top,3,h);}c.restore();
};
window.CastleExterior=class {
 constructor(){
  this.castle=document.createElement('canvas');this.castle.width=1024;this.castle.height=768;const c=this.castle.getContext('2d');
  c.fillStyle='#454b62';c.fillRect(60,440,900,330);
  for(const [x,y,w,h] of [[80,215,155,553],[265,350,155,418],[430,115,190,653],[655,320,145,448],[815,230,155,538]]){
   c.fillStyle='#454d63';c.fillRect(x,y,w,h);c.fillStyle='#697083';c.fillRect(x,y,12,h);
   for(let i=0;i<w;i+=28)c.fillRect(x+i,y-25,18,30);
   c.fillStyle='#232e42';c.beginPath();c.moveTo(x-15,y-27);c.lineTo(x+w/2,y-135);c.lineTo(x+w+15,y-27);c.fill();
   c.fillStyle='#e1b473';for(let wy=y+45;wy<690;wy+=100){c.fillRect(x+w/2-7,wy,14,31);}
  }
  c.strokeStyle='#20273566';c.lineWidth=2;for(let y=440;y<768;y+=25){c.beginPath();c.moveTo(60,y);c.lineTo(960,y);c.stroke();}c.fillStyle='#101728';c.fillRect(467,615,96,153);
  this.torch=document.createElement('canvas');this.torch.width=128;this.torch.height=320;const t=this.torch.getContext('2d');t.fillStyle='#292a31';t.fillRect(56,110,16,185);t.fillRect(28,289,72,18);t.fillStyle='#a99463';t.fillRect(35,105,58,16);t.fillRect(48,135,32,12);t.fillStyle='#ff8d36';t.beginPath();t.moveTo(32,103);t.quadraticCurveTo(22,75,68,10);t.quadraticCurveTo(66,60,91,66);t.quadraticCurveTo(110,93,83,106);t.fill();t.fillStyle='#ffe7a1';t.beginPath();t.ellipse(63,80,15,27,0,0,7);t.fill();
 }
 // Small cached halo behind the silhouette; no filters or new network assets per frame.
 divergenceHalo(){
  if(this.halo)return this.halo;
  const a=document.createElement('canvas');a.width=384;a.height=320;const c=a.getContext('2d');
  const glow=c.createRadialGradient(192,151,24,192,151,156);
  glow.addColorStop(0,'rgba(94,216,111,0.32)');glow.addColorStop(.43,'rgba(55,179,99,0.22)');glow.addColorStop(.76,'rgba(31,126,83,0.09)');glow.addColorStop(1,'rgba(20,88,64,0)');
  c.fillStyle=glow;c.fillRect(0,0,a.width,a.height);this.halo=a;return a;
 }
 background(renderer,room,player,actors){if(!room.corridor)return;if(!this.rpgCastle){this.rpgCastle=new Image();this.rpgCastle.src='assets/garden/castle-16bit.webp';}const art=this.rpgCastle.complete&&this.rpgCastle.naturalWidth?this.rpgCastle:this.castle;const x=(room.oakDoor?.x||51)+2;WorldBillboard(renderer,player,actors,this.divergenceHalo(),x+.15,4.5,-.4,23,15,false);WorldBillboard(renderer,player,actors,art,x,4.5,0,16,10,false);}
 draw(renderer,room,player,actors,time){const ys=room.corridor?[2.05,6.95]:[1.6,13.4],xs=room.corridor?[4,10,16,22,28,34,40,46,53].map(x=>2.9+(x-2.5)*.9).concat([52,60,65]):[4,10,16,23];const torches=xs.filter(x=>!room.lava||x<room.lava.start||x>room.lava.end).flatMap(x=>ys.map(y=>({x,y})));torches.sort((a,b)=>Math.hypot(b.x-player.x,b.y-player.y)-Math.hypot(a.x-player.x,a.y-player.y));for(const t of torches)WorldBillboard(renderer,player,actors,this.torch,t.x,t.y,0,.42,1.35+Math.sin(time*.009+t.x)*.018);}
};
