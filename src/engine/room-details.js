/* Ambientación decorativa fija: no modifica colisiones ni las respuestas de los retos. */
window.RoomDetails={
 graffiti:[
  {room:'room-01',text:'67',axis:'x',face:1,start:1.3,end:2.15,z:.48,h:.24},
  {room:'room-03',text:'67',axis:'y',face:1,start:26,end:27,z:.48,h:.24},
  {room:'room-02',text:'0 aura',axis:'x',face:1,start:4.8,end:5.65,z:.46,h:.24},
  {room:'room-04',text:'0 aura',axis:'y',face:7.3,start:37,end:38.2,z:.44,h:.24},
  {room:'room-06',text:'Eduardo estuvo aqui',axis:'x',face:1,start:11,end:13,z:.5,h:.26},
  {room:'room-02',text:'Sin unidades no hay respuesta',axis:'y',face:1,start:2,end:4.2,z:.48,h:.23},
  {room:'room-03',text:'La inercia no perdona',axis:'y',face:1,start:13.5,end:16.5,z:.9,h:.3},
  {room:'room-04',text:'La velocidad tiene dirección',axis:'y',face:1.7,start:8,end:11,z:.47,h:.23},
  {room:'room-05',text:'El movimiento es relativo',axis:'y',face:14,start:6,end:10,z:.85,h:.33},
  {room:'room-06',text:'Todo impulso cuenta',axis:'y',face:1,start:10,end:13,z:.85,h:.3}
 ],
 props:[
  ['room-00',2,1.55,'books'],['room-00',18.5,6.4,'books'],
  ['room-01',2.2,1.55,'books'],['room-01',4.7,5.4,'flask'],
  ['room-02',1.6,5.3,'books'],['room-02',5.9,1.5,'flask'],['room-02',2,1.5,'open'],
  ['room-03',2,14.6,'books'],['room-03',14,1.5,'open'],['room-03',26,1.55,'flask'],['room-03',38,14.5,'books'],
  ['room-04',9,2.1,'books'],['room-04',38.5,6.95,'open'],
  ['room-05',5,1.6,'flask'],['room-05',7,13.4,'books'],['room-05',13,13.4,'flask'],
  ['room-06',1.65,12.5,'books'],['room-06',11,1.6,'open'],['room-06',22,12.8,'flask']
 ],
 cache:new Map(),
 art(kind){
  if(this.cache.has(kind))return this.cache.get(kind);
  const a=document.createElement('canvas');a.width=256;a.height=192;const c=a.getContext('2d');
  c.fillStyle='#07091066';c.beginPath();c.ellipse(128,178,107,10,0,0,Math.PI*2);c.fill();
  if(kind==='flask'){
   c.strokeStyle='#a2c3c4';c.lineWidth=5;c.fillStyle='#b7dee233';c.beginPath();c.moveTo(105,22);c.lineTo(105,75);c.lineTo(58,161);c.quadraticCurveTo(53,176,73,178);c.lineTo(181,178);c.quadraticCurveTo(201,176,196,161);c.lineTo(148,75);c.lineTo(148,22);c.closePath();c.fill();c.stroke();
   c.fillStyle='#63988d';c.beginPath();c.moveTo(88,119);c.lineTo(167,119);c.lineTo(193,166);c.lineTo(64,166);c.closePath();c.fill();c.fillStyle='#b6ded5';c.fillRect(77,142,5,14);c.fillRect(110,32,5,49);c.fillStyle='#876947';c.fillRect(101,14,51,17);
   c.fillStyle='#e1d8b9';c.fillRect(107,129,43,28);c.fillStyle='#53616b';c.font='17px Georgia';c.fillText('φ',122,149);
  }else if(kind==='open'){
   c.fillStyle='#543742';c.beginPath();c.moveTo(20,95);c.lineTo(111,82);c.lineTo(129,94);c.lineTo(150,81);c.lineTo(230,98);c.lineTo(225,174);c.lineTo(132,178);c.lineTo(29,169);c.closePath();c.fill();
   c.fillStyle='#dbcc9f';c.beginPath();c.moveTo(26,88);c.quadraticCurveTo(94,65,128,97);c.quadraticCurveTo(160,71,225,88);c.lineTo(218,162);c.quadraticCurveTo(160,145,128,172);c.quadraticCurveTo(92,143,35,158);c.closePath();c.fill();c.strokeStyle='#938268';c.lineWidth=2;
   for(let i=0;i<6;i++){c.beginPath();c.moveTo(44,100+i*8);c.quadraticCurveTo(90,91+i*8,117,109+i*8);c.stroke();c.beginPath();c.moveTo(142,108+i*8);c.quadraticCurveTo(179,96+i*8,210,101+i*8);c.stroke();}c.beginPath();c.moveTo(128,98);c.lineTo(128,171);c.stroke();
  }else{
   for(let i=0;i<3;i++){c.save();c.translate(126,165-i*35);c.rotate([-.06,.11,-.14][i]);c.fillStyle=['#594534','#354e55','#633c48'][i];c.fillRect(-94,-24,188,34);c.fillStyle='#c8b993';c.fillRect(-78,-17,166,18);c.fillStyle='#907d5b';for(let j=0;j<3;j++)c.fillRect(-77,-13+j*5,162,1);c.fillStyle='#c5a269';c.fillRect(-87,-18,5,22);c.restore();}
  }
  this.cache.set(kind,a);return a;
 },
 ink(g){
  if(g.art)return g.art;const a=document.createElement('canvas');a.width=1024;a.height=160;const c=a.getContext('2d');c.fillStyle='#d1c6aa';c.font='italic 64px Georgia';c.textAlign='center';c.textBaseline='middle';c.translate(512,80);c.rotate(-.025);c.globalAlpha=.78;c.fillText(g.text,0,0,960);
  // Faint breaks in chalk keep the lettering from looking like a printed sign.
  c.globalCompositeOperation='destination-out';c.globalAlpha=.2;for(let i=0;i<150;i++)c.fillRect((i*71)%1000-500,(i*43)%110-55,2,3);
  return g.art=a;
 },
 wall(r,room,hit,x,top,height,player){
  if(room.maze?.dungeon)return;
  for(const g of this.graffiti){if(g.room!==room.id||hit.axis!==g.axis||Math.abs((g.axis==='x'?hit.px:hit.py)-g.face)>.02)continue;
   const along=g.axis==='x'?hit.py:hit.px;if(along<g.start||along>g.end)continue;
   const art=this.ink(g),flip=g.axis==='x'?player.x>g.face:player.y<g.face;
   const at=s=>{const a=player.angle+Math.atan((s/r.canvas.width*2-1)*.66),q=g.axis==='x'?player.y+(g.face-player.x)*Math.tan(a):player.x+(g.face-player.y)/Math.tan(a);const u=(q-g.start)/(g.end-g.start);return flip?1-u:u;};
   const c=r.ctx;c.save();c.imageSmoothingEnabled=true;
   for(let s=x;s<x+3;s++){const u=at(s),v=at(s+1),lo=Math.max(0,Math.min(u,v)),hi=Math.min(1,Math.max(u,v));if(hi>lo)c.drawImage(art,lo*art.width,0,(hi-lo)*art.width,art.height,s,top+(1-g.z)*height,1,g.h*height);}c.restore();
  }
 },
 draw(r,room,player){if(room.maze?.dungeon)return;
  const items=this.props.filter(p=>p[0]===room.id).sort((a,b)=>Math.hypot(b[1]-player.x,b[2]-player.y)-Math.hypot(a[1]-player.x,a[2]-player.y));
  for(const [,x,y,kind] of items){if(Math.hypot(x-player.x,y-player.y)>15)continue;WorldBillboard(r,player,r.actors,this.art(kind),x,y,.012,kind==='flask'?.42:.75,kind==='flask'?.46:kind==='open'?.22:.32);}
 }
};
