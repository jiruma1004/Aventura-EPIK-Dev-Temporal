// Un respiro entre el laberinto y las salas finales del castillo.
window.CORRIDOR_LAVA={
 start:20,end:33,minY:1.7,maxY:7.3,
 // Dos recorridos laterales. Reducir cada lado por √0.70 conserva el 70 % del área.
 platforms:[
  {id:'L1',x:21.1,y:3.6,size:1.7},{id:'L2',x:23.8,y:2.75,size:1.7},{id:'L3',x:26.5,y:2.75,size:1.7},{id:'L4',x:29.2,y:3.3,size:1.7},
  {id:'R1',x:21.1,y:5.4,size:1.7},{id:'R2',x:23.8,y:6.25,size:1.7},{id:'R3',x:26.5,y:6.25,size:1.7},{id:'R4',x:29.2,y:5.7,size:1.7},
  {id:'cross',x:26.5,y:4.5,size:1.35},{id:'exit',x:31.9,y:4.5,size:1.9}].map(p=>({...p,size:p.size*Math.sqrt(.70)})),
 routes:[['L1','L2','L3','L4','exit'],['R1','R2','R3','R4','exit'],['L1','L2','L3','cross','R3','R4','exit']],
 contains(x,y){return x>=this.start&&x<this.end&&y>=this.minY&&y<=this.maxY;},
 platformAt(x,y){return this.platforms.find(p=>Math.abs(x-p.x)<=p.size/2&&Math.abs(y-p.y)<=p.size/2);},
 supports(x,y){return !this.contains(x,y)||!!this.platformAt(x,y);},
 // The lava sits below the playable plane. Jump distances and fatal contacts
 // still use contains()/supports(); visual depth does not change the puzzle.
 visualDepth:.31,
 moltenColor(x,y,time){
  const wave=Math.sin(Math.floor(x*9)*1.3+Math.floor(y*11)*1.7+time*.0018)+Math.sin(x*4-y*7-time*.0008);
  return wave>1.25?'#ffe184':wave>.25?'#ff962e':wave>-.7?'#da461e':'#82251b';
 },
 rayColor(player,dx,dy,groundDepth,eye,time){
  const x=player.x+dx*groundDepth,y=player.y+dy*groundDepth;
  if(this.platformAt(x,y))return this.color(x,y,time);
  const bottom=groundDepth*(eye+this.visualDepth)/eye;
  const exitX=Math.abs(dx)<1e-9?Infinity:((dx>0?this.end:this.start)-player.x)/dx;
  const exitY=Math.abs(dy)<1e-9?Infinity:((dy>0?this.maxY:this.minY)-player.y)/dy;
  const edge=Math.min(exitX,exitY);
  if(bottom<=edge)return this.moltenColor(player.x+dx*bottom,player.y+dy*bottom,time);
  // Vertical rock bank: stable cracks and a warm glow nearest the lava.
  const below=Math.max(0,Math.min(1,(edge/groundDepth-1)*eye/this.visualDepth));
  const along=exitX<exitY?player.y+dy*edge:player.x+dx*edge;
  const fissure=Math.abs(Math.sin(along*11+Math.floor(below*5)*.8))>.975;
  if(fissure)return '#2c2321';
  const band=Math.floor(below*5);
  return below>.78?'#9a4d29':band%2?'#51443c':'#6a5543';
 },
 drawSupports(r,player){
  const c=r.ctx,w=r.canvas.width,h=r.canvas.height,eye=.5+(player.jumpHeight||0),horizon=h*(.5+(player.pitch||0)),co=Math.cos(player.angle),si=Math.sin(player.angle);
  const depth=([x,y])=>(x-player.x)*co+(y-player.y)*si;
  const project=points=>{
   const input=points.map(([x,y,z])=>({d:depth([x,y]),s:-(x-player.x)*si+(y-player.y)*co,z})),out=[];
   for(let i=0;i<input.length;i++){
    const a=input[i],b=input[(i+1)%input.length],inside=a.d>=.08,next=b.d>=.08;
    if(inside)out.push(a);
    if(inside!==next){const t=(.08-a.d)/(b.d-a.d);out.push({d:.08,s:a.s+(b.s-a.s)*t,z:a.z+(b.z-a.z)*t});}
   }
   return out.map(p=>({x:w/2+p.s/p.d*w/1.32,y:horizon-(p.z-eye)*h/p.d}));
  };
  const path=points=>{if(points.length<3)return false;c.beginPath();points.forEach((p,i)=>i?c.lineTo(p.x,p.y):c.moveTo(p.x,p.y));c.closePath();return true;};
  const mouth=project([[this.start,this.minY,0],[this.end,this.minY,0],[this.end,this.maxY,0],[this.start,this.maxY,0]]);
  if(!path(mouth))return;
  c.save();c.clip();
  // Back-to-front blocks, clipped to the river mouth so nothing covers the bank.
  for(const p of [...this.platforms].sort((a,b)=>depth([b.x,b.y])-depth([a.x,a.y]))){
   const half=p.size/2,x=p.x-half,y=p.y-half,size=p.size;
   const corners=[[x,y],[x+size,y],[x+size,y+size],[x,y+size]];
   const faces=corners.map((a,i)=>({a,b:corners[(i+1)%4],i})).sort((a,b)=>depth(b.a)+depth(b.b)-depth(a.a)-depth(a.b));
   for(const {a,b,i} of faces){
    for(let band=0;band<3;band++){
     const z1=-this.visualDepth*band/3,z2=-this.visualDepth*(band+1)/3;
     if(path(project([[...a,z1],[...b,z1],[...b,z2],[...a,z2]]))){c.fillStyle=band===2?'#805239':i%2?'#46474d':'#5b5b60';c.fill();c.strokeStyle='#242934';c.lineWidth=1;c.stroke();}
    }
   }
   if(path(project(corners.map(v=>[...v,.005])))){c.fillStyle='#7b8391';c.fill();c.strokeStyle='#bbaa7f';c.lineWidth=2;c.stroke();}
   for(const [a,b] of [[[x+.05,p.y,.008],[x+size-.05,p.y,.008]],[[p.x,y+.05,.008],[p.x,y+size-.05,.008]]]){
    const line=project([a,b,b]);if(line.length<3)continue;c.strokeStyle='#46434a';c.lineWidth=1.5;c.beginPath();c.moveTo(line[0].x,line[0].y);c.lineTo(line[1].x,line[1].y);c.stroke();
   }
  }
  c.restore();
 },
 color(x,y,time){
  const p=this.platformAt(x,y);
  if(p){const edge=Math.min(p.size/2-Math.abs(x-p.x),p.size/2-Math.abs(y-p.y));if(edge<.065)return '#bbaa7f';const seam=Math.abs((x-p.x)*2%1)<.035||Math.abs((y-p.y)*2%1)<.035;return seam?'#3a3d49':'#7b8391';}
  return this.moltenColor(x,y,time);
 }
};
window.ESCAPE_ROOMS=window.ESCAPE_ROOMS||[];
window.ESCAPE_ROOMS.push({
 id:'room-04',name:'El corredor de las ideas',color:[121,112,94],
 environment:{kind:'courtyard',label:'Camino a la sala principal',tint:'#675333',portraits:['tesla','curie']},
 spawn:{x:2.9,y:4.5,angle:0},exitX:67.65,corridor:true,lava:window.CORRIDOR_LAVA,bounds:{minY:1.7,maxY:7.3},oakDoor:{x:67,y:4},
 challenge:{id:'challenge-04',title:'Salta, esquiva y respira',implemented:true},
 canUnlock(context){return context.ready===true&&context.guardianSolved===true&&context.gateOpened===true;},
 map:Array.from({length:9},(_,y)=>Array.from({length:70},(_,x)=>x===0||x===69||y===0||y===8||x===67?(x===67&&y===4?2:1):0))
});
