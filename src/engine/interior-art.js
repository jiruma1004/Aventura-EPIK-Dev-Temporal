/* Decoración fija: se proyecta con la misma geometría que las paredes y el suelo. */
window.makeInteriorArt=()=>{
 const make=paint=>{const a=document.createElement('canvas');a.width=a.height=512;paint(a.getContext('2d'));return a;};
 const shopWall=make(c=>{
  c.fillStyle='#342a45';c.fillRect(0,0,512,512);
  for(let y=0;y<350;y+=55)for(let x=-40;x<550;x+=90){c.fillStyle=(x+y)%3?'#50415b':'#45384f';c.fillRect(x+(y/55%2)*40+2,y+2,86,50);}
  c.fillStyle='#382821';c.fillRect(0,335,512,177);for(let x=0;x<512;x+=64){c.strokeStyle='#997551';c.lineWidth=3;c.strokeRect(x+8,351,48,142);}c.fillStyle='#c39f60';c.fillRect(0,331,512,7);
  c.fillStyle='#2a2435';c.fillRect(36,32,440,295);c.strokeStyle='#b99b62';c.lineWidth=8;c.strokeRect(36,32,440,295);
  for(let x=76;x<450;x+=85){c.strokeStyle='#6b567a';c.lineWidth=2;c.beginPath();c.moveTo(x,52);c.lineTo(x+25,85);c.lineTo(x,119);c.lineTo(x-25,85);c.closePath();c.stroke();}
  c.fillStyle='#9d779d';c.textAlign='center';c.font='60px Georgia';c.fillText('✧',256,240);
 });
 const shopShelf=make(c=>{
  c.drawImage(shopWall,0,0);c.fillStyle='#201c2c';c.fillRect(50,35,412,286);c.strokeStyle='#aa8550';c.lineWidth=10;c.strokeRect(50,35,412,286);
  for(let row=0;row<3;row++){const floor=119+row*93;c.fillStyle='#7b583b';c.fillRect(55,floor,403,13);c.fillStyle='#c19b62';c.fillRect(55,floor,403,3);
   for(let i=0;i<7;i++){const x=76+i*53;
    if((i+row)%3===0){c.fillStyle=['#735378','#405875','#7b553d'][row];c.fillRect(x,floor-57,29,57);c.fillStyle='#d3b677';c.fillRect(x+5,floor-49,19,3);c.fillRect(x+5,floor-14,19,3);c.fillStyle='#30283a';c.fillRect(x+4,floor-40,3,22);}
    else{const color=['#71cab0','#bd8de2','#dea563'][(i+row)%3];c.fillStyle='#afc0caaa';c.fillRect(x+10,floor-67,13,24);c.beginPath();c.ellipse(x+16,floor-26,18,25,0,0,7);c.fill();c.fillStyle=color;c.beginPath();c.ellipse(x+16,floor-22,14,18,0,0,7);c.fill();c.fillStyle='#ead8ba';c.fillRect(x+8,floor-71,17,8);c.fillStyle='#ffffffaa';c.fillRect(x+6,floor-39,4,16);}
   }
  }
 });
 const vines=make(c=>{
  for(let i=0;i<9;i++){const root=20+i*60,len=100+(i*137)%380;c.strokeStyle='#344b32';c.lineWidth=6;c.beginPath();c.moveTo(root,-10);c.bezierCurveTo(root-30,len*.3,root+25,len*.7,root-12,len);c.stroke();
   for(let j=20;j<len;j+=28){const x=root+Math.sin(j/38)*14;c.fillStyle=j%3?'#4c6841':'#718153';c.beginPath();c.ellipse(x-9,j,14,6,-.5,0,7);c.fill();c.beginPath();c.ellipse(x+12,j+11,12,5,.6,0,7);c.fill();}
  }
  c.strokeStyle='#c0c4ab44';c.lineWidth=1;for(let i=0;i<7;i++){c.beginPath();c.moveTo(512,0);c.lineTo(512-i*25,150-i*15);c.stroke();}for(let r=35;r<150;r+=27){c.beginPath();c.arc(512,0,r,Math.PI/2,Math.PI);c.stroke();}
 });
 const chain=make(c=>{
  for(let y=-8;y<415;y+=25){c.strokeStyle=y%50===17?'#8c8070':'#534e48';c.lineWidth=9;c.beginPath();c.ellipse(256,y, y%50===17?11:21,21,0,0,7);c.stroke();c.strokeStyle='#b3a28c';c.lineWidth=2;c.beginPath();c.ellipse(254,y-1,15,17,0,Math.PI,Math.PI*1.7);c.stroke();}
  c.fillStyle='#493e30';c.fillRect(216,403,80,82);c.strokeStyle='#a89468';c.lineWidth=7;c.strokeRect(216,403,80,82);c.fillStyle='#9eaf78';c.fillRect(226,417,60,49);c.fillStyle='#e6d69b';c.fillRect(248,412,14,54);c.fillStyle='#252b2b';c.fillRect(247,401,13,87);
 });
 const narrow=document.createElement('canvas');narrow.width=128;narrow.height=512;narrow.getContext('2d').drawImage(chain,192,0,128,512,0,0,128,512);
 return {shopWall,shopShelf,vines,chain:narrow};
};
window.InteriorAtmosphere={
 shopFloor(x,y){
  const rug=x>1.15&&x<6.8&&y>1.5&&y<5.5;
  if(!rug)return (Math.floor(x*2)+Math.floor(y*2))%2?'#55505e':'#44414e';
  const edge=Math.min(x-1.15,6.8-x,y-1.5,5.5-y);
  if(edge<.09)return '#d7b36e';if(edge<.18)return '#4b335e';if(edge<.23)return '#af905c';
  const dx=(x-4)/1.8,dy=(y-3.5)/1.35,d=Math.abs(dx)+Math.abs(dy);
  if(Math.abs(d-.86)<.055||Math.abs(d-.38)<.04)return '#b9956c';
  return (Math.floor(x*17)+Math.floor(y*17))%3?'#4b325e':'#553c68';
 },
 exams:[[2.7,2.2,.28],[3.2,4.7,-.4],[5.4,1.9,.65],[6.2,4.7,-.2],[6.5,3.1,.35]],
 drawExams(r,player){const c=r.ctx;c.save();for(const [x,y,a] of this.exams){const center=r.actors.project(r,player,x,y,.014);if(!center||center.depth>(r.depths[Math.floor(center.x/3)*3]??Infinity)+.05)continue;
  const p=(u,v)=>r.actors.project(r,player,x+.78*(u*Math.cos(a)-v*Math.sin(a)),y+.78*(u*Math.sin(a)+v*Math.cos(a)),.014);
  const corners=[p(-.42,-.3),p(.42,-.3),p(.42,.3),p(-.42,.3)];if(corners.some(q=>!q))continue;c.fillStyle='#eee3c8';c.strokeStyle='#a99d86';c.lineWidth=1;c.beginPath();corners.forEach((q,i)=>i?c.lineTo(q.x,q.y):c.moveTo(q.x,q.y));c.closePath();c.fill();c.stroke();
  const line=(u,v,uu,vv,color,width)=>{const b=p(u,v),e=p(uu,vv);if(!b||!e)return;c.strokeStyle=color;c.lineWidth=width;c.beginPath();c.moveTo(b.x,b.y);c.lineTo(e.x,e.y);c.stroke();};
  line(-.31,-.23,.07,-.23,'#696663',Math.max(.5,center.scale*.003));
  for(let row=0;row<5;row++)for(let j=0;j<12-row%3;j++){const u=-.31+j*.033,v=-.15+row*.075;line(u,v,u+.019,v-.009*((j+row)%3),'#87847c',Math.max(.4,center.scale*.0018));if(j%3===0)line(u+.007,v-.01,u+.012,v+.013,'#87847c',Math.max(.4,center.scale*.0016));}
  // Uneven pen loops and two curved underlines, projected onto each sheet.
  const stroke=(points,width)=>{c.strokeStyle='#dc252b';c.lineWidth=Math.max(.65,center.scale*width);c.lineCap='round';c.lineJoin='round';c.beginPath();points.forEach(([u,v],i)=>{const q=p(u,v);if(q)i?c.lineTo(q.x,q.y):c.moveTo(q.x,q.y);});c.stroke();};
  const zero=[];for(let i=0;i<=48;i++){const t=-1.1+i/48*Math.PI*2.06, v=Math.sin(t)*.102;zero.push([.245+Math.cos(t)*.069+v*.38,-.115+v]);}stroke(zero,.005);
  stroke([[.252,-.233],[.273,-.229],[.29,-.218],[.302,-.204]],.004);
  for(let j=0;j<2;j++){const curve=[];for(let i=0;i<=20;i++){const t=i/20;curve.push([.12+t*.26,.10+j*.043-t*.082-.023*Math.sin(t*Math.PI)]);}stroke(curve,.0045);}

 }c.restore();},
 draw(renderer,room,player,time){
  RoomDetails.draw(renderer,room,player);
  if(room.roulette)this.drawExams(renderer,player);
  if(!room.environment?.abandoned)return;
  const points=room.maze?.dungeon?[[3.5,3.5],[10.5,6.5],[5.5,10.5]]:Array.from({length:4},(_,i)=>[[i*12+2.5,3.5],[i*12+5.5,8.5],[i*12+5.5,12.5]]).flat();
  for(const [x,y] of points){if(room.map[Math.floor(y)]?.[Math.floor(x)]!==0||Math.hypot(x-player.x,y-player.y)>12)continue;
   const top=room.environment.ceilingHeight||1;WorldBillboard(renderer,player,renderer.actors,renderer.art.chain,x+Math.sin(time*.0007+x)*.015,y,top-.62,.28,.62);
  }
 }
};
