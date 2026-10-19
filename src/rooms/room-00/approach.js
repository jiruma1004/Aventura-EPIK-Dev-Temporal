/* Primer umbral: la respuesta se elige aterrizando, no mediante un formulario. */
window.APPROACH_QUESTIONS=[
 {text:'La rapidez es una magnitud vectorial.',answer:false,hint:'Distingue cuánto se mueve un objeto de hacia dónde se mueve.'},
 {text:'En el vacío, dos cuerpos de distinta masa caen con la misma aceleración.',answer:true,hint:'Piensa en qué cambia cuando desaparece la resistencia del aire.'},
 {text:'Si la fuerza neta es cero, un cuerpo necesariamente está en reposo.',answer:false,hint:'Recuerda qué puede conservarse cuando no hay aceleración.'},
 {text:'La pendiente de una gráfica de velocidad contra tiempo representa la aceleración.',answer:true,hint:'Observa las unidades de los dos ejes.'},
 {text:'En un tiro parabólico ideal, la aceleración horizontal es cero.',answer:true,hint:'Piensa hacia dónde actúa la gravedad.'}
];
window.ApproachTrial=class {
 constructor(room,onEvent){this.room=room;this.onEvent=onEvent;this.stage=0;this.broken=new Set();this.finished=false;this.art=new Map();}
 // Assistance transports the player; it never fabricates correct answers.
 startZipline(){
  if(this.finished||this.zipline?.active)return false;
  this.zipline={active:true,time:0,duration:7,from:null};this.onEvent('zipline-start');return true;
 }
 tickZipline(dt,player){
  const z=this.zipline;if(!z?.active)return;
  z.from??={x:player.x,y:player.y};z.time=Math.min(z.duration,z.time+dt);
  const t=z.time/z.duration,e=t*t*(3-2*t);
  player.x=z.from.x+(17.6-z.from.x)*e;player.y=z.from.y+(3.85-z.from.y)*e;
  player.angle=0;player.pitch=-.06;player.jumpVelocity=0;player.jumpHeight=1.25*Math.sin(Math.PI*t);
  if(t===1){z.active=false;player.jumpHeight=0;player.pitch=0;this.finished=true;this.stage=5;this.onEvent('zipline-end',{x:17.6,y:3.85,angle:0});}
 }
 drawZipline(r,player,actors){
  if(!this.zipline)return;
  const c=r.ctx,w=r.canvas.width,h=r.canvas.height;
  const line=(a,b,color,width)=>{const p=actors.project(r,player,...a),q=actors.project(r,player,...b);if(!p||!q)return;c.strokeStyle=color;c.lineWidth=width;c.beginPath();c.moveTo(p.x,p.y);c.lineTo(q.x,q.y);c.stroke();};
  c.save();
  for(const x of [3.3,18]){
   for(const y of [2.9,4.8])line([x,y,0],[x,y,3.1],'#795234',8);
   line([x,2.9,3.1],[x,4.8,3.1],'#be995f',9);
  }
  for(let x=3.3;x<18;x+=.3){const end=Math.min(18,x+.3),height=a=>3.05-.45*Math.sin((a-3.3)/14.7*Math.PI);line([x,3.85,height(x)],[end,3.85,height(end)],'#c0d6dc',4);}
  if(this.zipline.active){
   // Foreground pulley and handle make the ride legible in first person.
   c.strokeStyle='#536976';c.lineWidth=8;c.beginPath();c.moveTo(w*.5,0);c.lineTo(w*.5,h*.23);c.stroke();
   c.fillStyle='#cfb777';c.beginPath();c.arc(w*.5,h*.10,15,0,Math.PI*2);c.fill();c.stroke();
   c.strokeStyle='#d7aa62';c.lineWidth=13;c.beginPath();c.moveTo(w*.39,h*.23);c.lineTo(w*.61,h*.23);c.stroke();
   c.fillStyle='#132b36dd';c.fillRect(w*.24,h*.78,w*.52,48);c.fillStyle='#c3ffe1';c.textAlign='center';c.font='bold 20px Trebuchet MS';c.fillText(I18n.t('Ayuda IA · Cruzando en tirolesa'),w*.5,h*.78+30);
  }
  c.restore();
 }
 get question(){return APPROACH_QUESTIONS[Math.min(this.stage,4)];}
 platforms(){const scale=EpikDifficulty.easy?1.05:.9;return this.tiles??=APPROACH_QUESTIONS.flatMap((q,stage)=>[true,false].map((answer,lane)=>({stage,answer,x:5+stage*2.3+1.5*(1-scale)/2,y:(lane?4.05:2.25)+1.4*(1-scale)/2,w:1.5*scale,h:1.4*scale,key:stage+':'+answer})));}
 platformAt(x,y){const tiles=this.platforms(),first=tiles[0],last=tiles[tiles.length-1];if(x<first.x||x>last.x+last.w||y<first.y||y>last.y+last.h)return;return tiles.find(p=>x>=p.x&&x<=p.x+p.w&&y>=p.y&&y<=p.y+p.h);}
 supports(x,y){if(x<4.2||x>=16.7)return true;const p=this.platformAt(x,y);return !!p&&!this.broken.has(p.key);}
 land(player){if(this.finished||player.jumpHeight>0)return;const p=this.platformAt(player.x,player.y);if(!p||p.stage<this.stage)return;
  if(this.broken.has(p.key))return;
  if(p.stage!==this.stage){this.onEvent('fall');return;}
  this.onAnswer?.(p.answer,p.answer===this.question.answer);if(p.answer!==this.question.answer){this.broken.add(p.key);this.onEvent('break');return;}
  // Al acertar también desaparece la alternativa incorrecta de ese nivel.
  this.broken.add(p.stage+':'+!p.answer);
  this.stage++;this.finished=this.stage===5;this.onEvent('safe',{x:p.x+p.w/2,y:p.y+p.h/2,angle:0});
 }
 restore(){/* Los tablones rotos permanecen ausentes hasta reiniciar la sala. */}
 background(r,player,time){
  const c=r.ctx,w=r.canvas.width,h=r.canvas.height,horizon=h*(.5+(player.pitch||0));
  const sky=c.createLinearGradient(0,0,0,horizon);sky.addColorStop(0,'#28394f');sky.addColorStop(.7,'#889293');sky.addColorStop(1,'#dab889');c.fillStyle=sky;c.fillRect(0,0,w,horizon);
  for(let band=0;band<3;band++){c.fillStyle=['#708474','#627658','#536344'][band];c.beginPath();c.moveTo(0,horizon+70);for(let x=0;x<=w+8;x+=8){const a=player.angle+(x/w-.5)*1.32;c.lineTo(x,horizon-15-band*3-Math.sin(a*3+band)*18-Math.sin(a*7+band)*7);}c.lineTo(w,horizon+70);c.fill();}
  // El bosque cierra el horizonte frontal; los laterales quedan abiertos a la llanura.
  for(let i=0;i<75;i++){const y=-19+i*.62,p=r.actors.project(r,player,24+Math.sin(i)*2,y,0);if(!p)continue;
   const tall=1.7+(Math.sin(i*13)*.5+.5)*1.1;c.fillStyle=i%2?'#253e30':'#304b36';c.beginPath();c.moveTo(p.x-p.scale*.45,p.y);c.lineTo(p.x,p.y-p.scale*tall);c.lineTo(p.x+p.scale*.45,p.y);c.fill();}
 }
 color(x,y){
  const p=this.platformAt(x,y);
  if(p&&!this.broken.has(p.key)){
   const u=x-p.x,v=y-p.y,board=Math.floor(u/.25),seam=u% .25<.028;
   if(seam)return '#251a15';
   if((v<.10||v>p.h-.10)&&u%.25>.10&&u%.25<.14)return '#322c28';
   const grain=Math.sin(y*83+board*7)*Math.sin(y*17+board);
   return grain>.68?'#392a20':grain<-.6?'#a48459':board%2?'#795738':'#896643';
  }
  const noise=Math.sin(Math.floor(x*20)*13+Math.floor(y*20)*37);
  const rim=x>=4.2&&x<16.7?Math.pow(Math.abs((x-10.45)/6.6),8)+Math.pow(Math.abs((y-3.85)/5.5),4):Infinity;
  if(x>=4.2&&x<16.7&&rim<1.1){const band=Math.floor(rim*9);return noise>.8?'#706150':rim>.86?'#a1855e':rim>.6?(band%2?'#76624d':'#8b7357'):rim>.3?(band%2?'#574b40':'#665746'):'#3b342f';}
  if(y<1.7||y>6.1)return noise>.25?'#6d784b':noise<-.4?'#52653d':'#627044';
  return noise>.3?'#9c815b':noise<-.4?'#806546':'#8b7250';
 }

 // The cavity is real projected geometry below the walking plane. Its mouth
 // matches the unsupported interval; this never changes jump/collision rules.
 drawCrater(r,player){
  const c=r.ctx,w=r.canvas.width,h=r.canvas.height,eye=.5+(player.jumpHeight||0),horizon=h*(.5+(player.pitch||0));
  const cos=Math.cos(player.angle),sin=Math.sin(player.angle);
  const view=([x,y,z])=>({side:-(x-player.x)*sin+(y-player.y)*cos,depth:(x-player.x)*cos+(y-player.y)*sin,z});
  const screen=p=>({x:w/2+p.side/p.depth*w/1.32,y:horizon-(p.z-eye)*h/p.depth});
  // Near-plane clipping prevents popping when the player jumps over the lip.
  const project=points=>{
   const input=points.map(view),out=[];
   for(let i=0;i<input.length;i++){
    const a=input[i],b=input[(i+1)%input.length],inside=a.depth>=.08,next=b.depth>=.08;
    if(inside)out.push(a);
    if(inside!==next){const t=(.08-a.depth)/(b.depth-a.depth);out.push({side:a.side+(b.side-a.side)*t,depth:.08,z:a.z+(b.z-a.z)*t});}
   }
   return out.map(screen);
  };
  const path=points=>{if(points.length<3)return false;c.beginPath();points.forEach((p,i)=>i?c.lineTo(p.x,p.y):c.moveTo(p.x,p.y));c.closePath();return true;};
  if(!this.craterMesh){
   const rim=[];
   for(let side=0;side<4;side++)for(let n=0;n<8;n++){
    const t=n/8;
    rim.push(side===0?[4.2+12.5*t,0]:side===1?[16.7,7*t]:side===2?[16.7-12.5*t,7]:[4.2,7-7*t]);
   }
   const levels=[[1,0],[.98,-.55],[.89,-1.5],[.73,-2.8],[.49,-4.6]];
   const rings=levels.map(([scale,z],level)=>rim.map(([x,y],i)=>{
    const rough=level?Math.sin(i*17+level)*.025:0;
    return [10.45+(x-10.45)*(scale+rough),3.5+(y-3.5)*(scale+rough),z+(level?Math.sin(i*9)*.10:0)];
   }));
   const faces=[];
   for(let level=0;level<rings.length-1;level++)for(let i=0;i<rim.length;i++){
    const j=(i+1)%rim.length;faces.push({level,i,points:[rings[level][i],rings[level][j],rings[level+1][j],rings[level+1][i]]});
   }
   this.craterMesh={rim:rings[0],faces};
  }
  const mouth=project(this.craterMesh.rim);if(mouth.length<3)return;
  c.save();path(mouth);c.clip();c.fillStyle='#090c12';c.fillRect(0,0,w,h);
  const faces=this.craterMesh.faces.map(face=>({...face,depth:face.points.reduce((sum,p)=>sum+view(p).depth,0)/4})).sort((a,b)=>b.depth-a.depth);
  for(const face of faces){
   const points=project(face.points);if(!path(points))continue;
   const ys=points.map(p=>p.y),top=Math.max(-h,Math.min(...ys)),bottom=Math.min(h*2,Math.max(...ys));
   const palette=[['#a58a62','#725c45'],['#755d48','#493c32'],['#493d34','#25242a'],['#27272d','#0b1019']][face.level];
   const gradient=c.createLinearGradient(0,top,0,Math.max(top+1,bottom));gradient.addColorStop(0,palette[0]);gradient.addColorStop(1,palette[1]);c.fillStyle=gradient;c.fill();
   c.fillStyle=`rgba(4,8,14,${.08+(face.i%4)*.045})`;c.fill();
   c.strokeStyle=face.level===0?'#b89a7040':'#090e1840';c.lineWidth=1;c.stroke();
   // Fractures and strata follow the projected cliff, not the flat floor.
   if(face.i%3===0){const a=project([face.points[0],face.points[1],face.points[2]]);if(a.length===3){c.strokeStyle='#0b0c164d';c.beginPath();c.moveTo((a[0].x+a[1].x)/2,(a[0].y+a[1].y)/2);c.lineTo((a[1].x+a[2].x)/2,(a[1].y+a[2].y)/2);c.stroke();}}
  }
  // Redraw the surviving planks above the hole, with visible timber thickness.
  for(const p of [...this.platforms()].sort((a,b)=>view([b.x,b.y,0]).depth-view([a.x,a.y,0]).depth)){
   if(this.broken.has(p.key))continue;
   for(const [a,b] of [[[p.x,p.y],[p.x+p.w,p.y]],[[p.x+p.w,p.y],[p.x+p.w,p.y+p.h]],[[p.x+p.w,p.y+p.h],[p.x,p.y+p.h]],[[p.x,p.y+p.h],[p.x,p.y]]]){
    if(path(project([[...a,0],[...b,0],[...b,-.12],[...a,-.12]]))){c.fillStyle='#352218';c.fill();}
   }
   for(let board=0;board<6;board++){
    const x=p.x+board*.25;
    if(path(project([[x+.018,p.y,.012],[x+.235,p.y,.012],[x+.235,p.y+p.h,.012],[x+.018,p.y+p.h,.012]]))){c.fillStyle=board%2?'#8a6844':'#a18054';c.fill();c.strokeStyle='#4a3328';c.lineWidth=1;c.stroke();}
   }
  }
  c.restore();
 }

 draw(r,player,actors){this.drawZipline(r,player,actors);this.drawLights(r,player,actors);this.drawCastleSign(r,player,actors);for(const p of [...this.platforms()].reverse()){if(this.zipline||this.broken.has(p.key)||p.stage!==Math.min(this.stage,4))continue;const pos=actors.project(r,player,p.x+p.w/2,p.y+p.h/2,.13);if(!pos)continue;
   const c=r.ctx,label=I18n.t(p.answer?'VERDADERO':'FALSO');c.save();c.textAlign='center';c.font='bold '+Math.max(10,Math.min(34,pos.scale*.14))+'px Trebuchet MS';c.strokeStyle='#071321';c.lineWidth=4;c.strokeText(label,pos.x,pos.y);c.fillStyle='#ffedb9';c.fillText(label,pos.x,pos.y);c.restore();}
 }
 drawCastleSign(r,player,actors){
  if(!this.finished)return;
  // Right verge (+Y), with the post anchored to the same world ground as the path.
  const pos=actors.project(r,player,19.2,5.35,.85),foot=actors.project(r,player,19.2,5.35,0);if(!pos||!foot)return;
  if(pos.depth>(r.depths[Math.floor(pos.x/3)*3]??Infinity)+.1)return;
  const c=r.ctx,scale=pos.scale/280,w=170*scale,h=48*scale;
  c.save();c.translate(pos.x,pos.y);c.fillStyle='#513520';c.fillRect(-6*scale,0,12*scale,foot.y-pos.y);
  c.fillStyle='#8a6036';c.strokeStyle='#d1ad69';c.lineWidth=2*scale;c.beginPath();c.moveTo(-w/2,0);c.lineTo(-w*.34,-h/2);c.lineTo(w/2,-h/2);c.lineTo(w/2,h/2);c.lineTo(-w*.34,h/2);c.closePath();c.fill();c.stroke();
  c.fillStyle='#f8e5b0';c.textAlign='center';c.textBaseline='middle';c.font=`bold ${18*scale}px Georgia`;c.fillText('←  '+I18n.t('CASTILLO'),5*scale,0);c.restore();
 }
 drawLights(r,player,actors){
  const c=r.ctx,segment=(a,b,color,width)=>{const p=actors.project(r,player,...a),q=actors.project(r,player,...b);if(!p||!q)return;c.strokeStyle=color;c.lineWidth=Math.max(1,Math.min(8,p.scale*width));c.beginPath();c.moveTo(p.x,p.y);c.lineTo(q.x,q.y);c.stroke();};
  for(const x of [3.5,17.5])for(const y of [1.65,6.05]){
   segment([x,y,0],[x,y,1.1],'#37312b',.05);segment([x,y,.86],[x,y-.23,.99],'#9a7c45',.035);segment([x,y,.86],[x,y+.23,.99],'#9a7c45',.035);
   for(const dy of [-.23,0,.23]){const p=actors.project(r,player,x,y+dy,1.05);if(!p)continue;const glow=c.createRadialGradient(p.x,p.y,0,p.x,p.y,p.scale*.32);glow.addColorStop(0,'#ffcb6866');glow.addColorStop(1,'#ffcb6800');c.fillStyle=glow;c.fillRect(p.x-p.scale*.32,p.y-p.scale*.32,p.scale*.64,p.scale*.64);c.fillStyle='#ffe1a0';c.fillRect(p.x-p.scale*.025,p.y-p.scale*.11,p.scale*.05,p.scale*.13);}
  }
  // Broken rope and timber edges do not block the jumps.
  for(const p of this.platforms()){if(this.broken.has(p.key))continue;for(const y of [p.y,p.y+p.h]){segment([p.x,y,0],[p.x+p.w,y,0],'#bd9a67',.025);segment([p.x,y,0],[p.x,y,.22],'#493223',.035);}}
 }

};
const approach={id:'room-00',label:'I',name:'El sendero de las decisiones',trial:true,color:[76,88,65],
 environment:{kind:'plain',label:'El puente viejo del cráter'},spawn:{x:2.5,y:3.85,angle:0},exitX:18.5,
 challenge:{id:'challenge-00',title:'Cinco saltos de verdadero o falso',implemented:true},canUnlock:()=>false,
 map:Array.from({length:8},(_,y)=>Array.from({length:21},(_,x)=>x===0||x===20||y===0||y===7?1:0))};
window.ESCAPE_ROOMS.push(approach);
window.ADVENTURE_ORDER=[approach,...ESCAPE_ROOMS.filter(r=>r!==approach&&!r.optional)];
ADVENTURE_ORDER.forEach((r,i)=>r.label=['I','II','III','IV','V','VI','VII'][i]);
window.StoryRoute={choice:'wave',chosen:false,reset(){this.choice='wave';this.chosen=false;},choose(choice){this.choice=choice;this.chosen=true;}};
