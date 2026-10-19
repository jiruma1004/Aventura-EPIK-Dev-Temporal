/* Shared pit bounds for geometry, floor rays and visual masonry. */
window.EricArena={
 pit:{minX:17,maxX:24,minY:1,maxY:14,depth:2.4},
 pitColor(player,dx,dy,top,eye,time,opened){
  const p=this.pit,x=player.x+top*dx,y=player.y+top*dy;
  if(opened&&Math.floor(y)===7)return x%1<.09?'#b9bba7':'#657b76';
  const bottom=top*(eye+p.depth)/eye;
  let exit=Infinity,axis='x';
  if(Math.abs(dx)>1e-9){const t=((dx>0?p.maxX:p.minX)-player.x)/dx;if(t>top+.001)exit=t;}
  if(Math.abs(dy)>1e-9){const t=((dy>0?p.maxY:p.minY)-player.y)/dy;if(t>top+.001&&t<exit){exit=t;axis='y';}}
  if(exit<bottom){
   const z=Math.min(p.depth,Math.max(0,eye*(exit/top-1))),along=axis==='x'?player.y+exit*dy:player.x+exit*dx;
   const mortar=z%.35<.035||((along+(Math.floor(z/.35)%2)*.35)%.7+.7)%.7<.035;
   if(z<.09)return '#8b927c';
   if(mortar)return z<1?'#202e30':'#0d1d22';
   return z<.5?'#475453':z<1?'#344446':z<1.7?'#25363b':'#18292f';
  }
  const bx=player.x+bottom*dx,by=player.y+bottom*dy;
  const crack=Math.sin(bx*3.7+Math.sin(by*2.2))*.5+Math.sin(by*4.3)*.5;
  return crack>.94?'#244c40':((Math.floor(bx*3)+Math.floor(by*3))%3?'#07131b':'#0d2027');
 },
 floor(x,y){
  const seam=((x%1)+1)%1<.035||((y%1)+1)%1<.035;
  const rim=x>16.65&&x<17;
  if(rim)return Math.floor(y*3)%2?'#ad975e':'#303a37';
  const cable=Math.abs(y-2.2)<.045||Math.abs(y-12.8)<.045;
  if(cable&&x>5&&x<11.5)return '#5fbc91';
  const ring=Math.hypot(x-7.5,y-7.5);if(Math.abs(ring-2.5)<.045||Math.abs(ring-2.7)<.025)return '#998557';
  if(Math.abs(y-7.5)<.65)return seam?'#585a50':'#827d67';
  return seam?'#253036':(Math.floor(x)+Math.floor(y))%2?'#41494b':'#354145';
 },
 wallArt(){
  if(this.art)return this.art;const a=document.createElement('canvas');a.width=256;a.height=512;const c=a.getContext('2d');
  c.fillStyle='#14232b';c.fillRect(28,20,200,477);c.strokeStyle='#8c8568';c.lineWidth=14;c.beginPath();c.moveTo(35,494);c.lineTo(35,115);c.quadraticCurveTo(128,-10,221,115);c.lineTo(221,494);c.stroke();
  const glass=c.createLinearGradient(0,0,256,0);glass.addColorStop(0,'#0c2630');glass.addColorStop(.5,'#245445');glass.addColorStop(1,'#0b2531');c.fillStyle=glass;c.beginPath();c.moveTo(53,462);c.lineTo(53,120);c.quadraticCurveTo(128,15,203,120);c.lineTo(203,462);c.closePath();c.fill();
  c.strokeStyle='#a29468';c.lineWidth=5;for(const y of [165,260,355]){c.beginPath();c.moveTo(53,y);c.lineTo(203,y);c.stroke();}c.beginPath();c.moveTo(128,62);c.lineTo(128,462);c.stroke();
  c.strokeStyle='#72bc96';c.lineWidth=4;c.beginPath();c.arc(128,260,55,0,7);c.stroke();c.font='bold 50px Georgia';c.textAlign='center';c.fillStyle='#b6d6aa';c.fillText('Δ',128,278);
  this.art=a;return a;
 },
 brazier(){
  if(this.brazierArt)return this.brazierArt;
  const a=document.createElement('canvas');a.width=256;a.height=512;const c=a.getContext('2d');
  const glow=c.createRadialGradient(128,105,12,128,105,103);glow.addColorStop(0,'#a4ffa35c');glow.addColorStop(1,'#70ff9900');c.fillStyle=glow;c.fillRect(0,0,256,230);
  c.fillStyle='#4e5856';c.fillRect(74,279,108,190);c.fillStyle='#747c69';c.fillRect(54,267,148,28);c.fillRect(49,466,158,33);c.fillStyle='#2e3d3e';c.fillRect(160,295,22,170);
  c.strokeStyle='#b3a374';c.lineWidth=5;c.strokeRect(89,305,58,128);c.fillStyle='#9bd5a7';c.font='48px Georgia';c.textAlign='center';c.fillText('Δ',119,385);
  c.strokeStyle='#a39265';c.lineWidth=12;for(const x of [70,128,186]){c.beginPath();c.moveTo(x,205);c.lineTo(128,266);c.stroke();}
  c.fillStyle='#253d38';c.beginPath();c.ellipse(128,206,81,25,0,0,7);c.fill();c.strokeStyle='#bcab77';c.lineWidth=6;c.stroke();
  c.fillStyle='#61c995';c.beginPath();c.moveTo(87,202);c.quadraticCurveTo(61,147,121,71);c.quadraticCurveTo(116,130,153,120);c.quadraticCurveTo(191,175,160,201);c.fill();c.fillStyle='#d0f5ad';c.beginPath();c.moveTo(112,202);c.quadraticCurveTo(101,170,137,134);c.quadraticCurveTo(135,173,151,199);c.fill();
  this.brazierArt=a;return a;
 },
 draw(r,player,actors){
  const art=this.brazier(),props=[];
  for(const x of [7,15.6])for(const y of [1.25,13.75])props.push({x,y});
  props.sort((a,b)=>Math.hypot(b.x-player.x,b.y-player.y)-Math.hypot(a.x-player.x,a.y-player.y));
  for(const p of props)WorldBillboard(r,player,actors,art,p.x,p.y,0,.65,1.5);
 },
 wall(r,room,hit,sx,top,height){
  if(!room.boss||hit.tile!==1||hit.axis!=='y'||![0,14].includes(hit.cy))return;
  const center=[5,9,14,21].find(x=>Math.abs(hit.px-x)<.75);if(center===undefined)return;
  const u=(hit.px-center+.75)/1.5,c=r.ctx;c.save();c.globalAlpha=Math.max(.35,1/(1+hit.distance*.05));c.drawImage(this.wallArt(),Math.floor(u*255),0,1,512,sx,top-height*1.65,3,height*2.45);c.restore();
 }
};
