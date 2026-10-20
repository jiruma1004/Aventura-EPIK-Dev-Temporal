window.RoomActors=class {
 constructor(){this.ivan=new Image();this.ivan.src='assets/cast/ivan-chase-demonic-v3.webp';this.doorArt=new Map();}
 doorTexture(door){
  const key=(door.dungeon?'dungeon-':'maze-')+door.stage+'-'+door.choice+(door.blocked?'-blocked-'+I18n.lang:'');if(this.doorArt.has(key))return this.doorArt.get(key);
  const art=document.createElement('canvas');art.width=art.height=512;const c=art.getContext('2d');
  if(door.blocked){
   c.fillStyle='#21141c';c.fillRect(0,0,512,512);
   const glow=c.createRadialGradient(256,256,30,256,256,250);glow.addColorStop(0,'#4a101c');glow.addColorStop(.7,'#8f2034');glow.addColorStop(.9,'#ed4b55');glow.addColorStop(1,'#26121c');c.fillStyle=glow;
   c.beginPath();c.ellipse(256,256,215,245,0,0,Math.PI*2);c.fill();
   for(let i=0;i<7;i++){c.strokeStyle=i%2?'#ff6c69':'#ad3042';c.lineWidth=3;c.beginPath();c.ellipse(256,256,80+i*20,110+i*20,i*.13,0,Math.PI*1.7);c.stroke();}
   c.fillStyle='#260e18e8';c.fillRect(85,191,342,147);c.strokeStyle='#ffaf9a';c.lineWidth=8;c.beginPath();c.arc(256,231,25,Math.PI,0);c.lineTo(281,259);c.moveTo(231,231);c.lineTo(231,259);c.stroke();c.fillStyle='#ffaf9a';c.fillRect(223,251,66,47);
   c.textAlign='center';c.font='bold 27px Georgia';c.fillText('SELLADO',256,325);
   this.doorArt.set(key,art);return art;
  }
  c.fillStyle=door.branch?(door.choice===0?'#18396c':'#6c202b'):'#273346';c.fillRect(0,0,512,512);for(let i=0;i<8;i++){c.fillStyle=door.branch?(door.choice===0?(i%2?'#346ccc':'#244f9a'):(i%2?'#b7434a':'#8b2837')):(i%2?'#324257':'#2b394d');c.fillRect(14+i*61,12,56,488);}c.strokeStyle=door.branch?(door.choice===0?'#8bc4ff':'#ffa0a7'):'#ba9764';c.lineWidth=13;c.strokeRect(14,14,484,484);
  c.fillStyle='#101c2bf2';c.fillRect(36,113,440,239);c.strokeStyle='#d0bb8e';c.lineWidth=3;c.strokeRect(36,113,440,239);c.textAlign='center';c.fillStyle='#ecd3a2';c.font='bold 68px Georgia';if(!door.branch)c.fillText(door.letter,256,192,416);
  c.fillStyle='#ddba76';c.beginPath();c.arc(432,404,13,0,Math.PI*2);c.fill();this.doorArt.set(key,art);return art;
 }
 project(renderer,player,x,y,z){const w=renderer.canvas.width,h=renderer.canvas.height,dx=x-player.x,dy=y-player.y,depth=dx*Math.cos(player.angle)+dy*Math.sin(player.angle),side=-dx*Math.sin(player.angle)+dy*Math.cos(player.angle);if(depth<.12)return null;return {x:w/2+side/depth*w/1.32,y:h*(.5+(player.pitch||0))-(z-.5-(player.jumpHeight||0))*h/depth,scale:h/depth,depth};}
 draw(renderer,room,player,opened,time,maze){
  if(opened&&(room.physics||room.boss))this.drawBridgeRails(renderer,room,player);
  const objects=[];if(room.answerDesk)objects.push({...room.answerDesk,kind:'desk'});if(maze?.chasing&&!maze.caught)objects.push({...maze.enemy,kind:'ivan'});
  objects.sort((a,b)=>Math.hypot(b.x-player.x,b.y-player.y)-Math.hypot(a.x-player.x,a.y-player.y));
  this.deskBounds=this.guideBounds=null;
  this.freezeButtonBounds=null;if(maze?.freezeButton)this.drawFreezePlate(renderer,player,maze,time);
  if(maze)this.drawDoorLabels(renderer,room,player,maze);
  for(const obj of objects){const p=this.project(renderer,player,obj.x,obj.y,0);if(!p)continue;const c=renderer.ctx;
   if(obj.kind==='rift'){this.drawRift(renderer,p,time);continue;}
   if(obj.kind==='ivan'){this.drawIvan(renderer,p,maze.freezeLeft>0?0:time,maze.bite>0);this.drawIvanSpeech(renderer,p,maze);if(maze.freezeLeft>0){c.fillStyle='#62dfff';c.font='24px Georgia';c.textAlign='center';c.fillText('❄',p.x,p.y-p.scale);}continue;}
   const hit=renderer.cast(room,player.x,player.y,Math.atan2(obj.y-player.y,obj.x-player.x),opened);if(hit.distance+.1<Math.hypot(obj.x-player.x,obj.y-player.y))continue;
   c.save();c.translate(p.x,p.y);const s=p.scale/350;c.scale(s,s);
   if(obj.kind==='desk'){
    c.fillStyle='#1c2535';c.strokeStyle='#c7a877';c.lineWidth=4;c.fillRect(-103,-136,17,135);c.fillRect(85,-136,17,135);c.fillStyle='#40516b';c.beginPath();c.ellipse(0,-140,132,35,0,0,Math.PI*2);c.fill();c.stroke();c.fillStyle='#869d9c';c.fillRect(-5,-185,10,40);
    c.fillStyle='#082b2a';c.strokeStyle='#9ae9c5';c.lineWidth=3;c.fillRect(-81,-291,162,110);c.strokeRect(-81,-291,162,110);c.fillStyle='#c8ffe5';c.font='16px Trebuchet MS';c.textAlign='center';c.fillText('RESPUESTAS',0,-260);c.font='13px Trebuchet MS';c.fillText('Mira aquí · E',0,-235);c.fillStyle='#82c9aa';c.fillRect(-55,-218,110,12);this.deskBounds={x:p.x-85*s,y:p.y-295*s,w:170*s,h:125*s};
   }c.restore();
  }
  if(room.conceptual||room.roulette){const c=renderer.ctx,w=renderer.canvas.width,h=renderer.canvas.height;c.fillStyle='#eee7c1';c.fillRect(w/2-2,h/2-2,4,4);}
  if(maze?.bite>0){const c=renderer.ctx;c.fillStyle=`rgba(150,35,65,${maze.bite*.15})`;c.fillRect(0,0,renderer.canvas.width,renderer.canvas.height);}
 }
 drawBridgeRails(renderer,room,player){
  const c=renderer.ctx,forest=!!room.physics,{start,end,y}=room.bridge,sides=[y+.03,y+.97];
  const segment=(a,b,color,width)=>{const p=this.project(renderer,player,...a),q=this.project(renderer,player,...b);if(!p||!q)return;const mid=(p.x+q.x)/2;if(mid<0||mid>renderer.canvas.width||Math.min(p.depth,q.depth)>(renderer.depths[Math.floor(mid/3)*3]??Infinity)+.08)return;c.strokeStyle=color;c.lineWidth=Math.min(16,Math.max(1,(p.scale+q.scale)*width/2));c.beginPath();c.moveTo(p.x,p.y);c.lineTo(q.x,q.y);c.stroke();};
  c.save();c.lineCap='round';for(const y of sides){for(let x=start;x<=end;x+=1)segment([x,y,0],[x,y,.62],forest?'#a67a47':'#b7ccd5',.045);for(const z of [.28,.58])for(let x=start;x<end;x+=.2)segment([x,y,z],[Math.min(end,x+.2),y,z],forest?'#c19b67':'#77aabd',.025);}c.restore();
 }
 drawFreezePlate(renderer,player,maze,time){
  const b=maze.freezeButton,c=renderer.ctx,p=this.project(renderer,player,b.x,b.y,.65);if(!p||p.depth<.3)return;
  if(p.depth>(renderer.depths[Math.round(p.x/3)*3]??Infinity)+.1)return;
  const corners=[[-.32,.97],[.32,.97],[.32,.33],[-.32,.33]].map(([x,z])=>this.project(renderer,player,b.x+x,b.y,z));if(corners.some(q=>!q))return;
  c.save();c.fillStyle=maze.freezeUsed?'#364f67':'#168fe8';c.strokeStyle='#a1f3ff';c.lineWidth=3;c.beginPath();corners.forEach((q,i)=>i?c.lineTo(q.x,q.y):c.moveTo(q.x,q.y));c.closePath();c.fill();c.stroke();c.fillStyle='#e7ffff';c.font=`bold ${Math.max(12,p.scale*.13)}px Georgia`;c.textAlign='center';c.fillText(maze.freezeUsed?'✓':'❄ 10 s',p.x,p.y);c.font=`${Math.max(10,p.scale*.09)}px Georgia`;c.fillText('E',p.x,p.y+p.scale*.17);c.restore();
  const xs=corners.map(q=>q.x),ys=corners.map(q=>q.y);this.freezeButtonBounds={x:Math.min(...xs),y:Math.min(...ys),w:Math.max(...xs)-Math.min(...xs),h:Math.max(...ys)-Math.min(...ys)};
 }
 drawRift(renderer,p,time){
  const c=renderer.ctx,size=p.scale*.9,left=p.x-size*.36,top=p.y-size,w=size*.72;
  c.save();
  for(let x=Math.max(0,Math.floor(left/3)*3);x<Math.min(renderer.canvas.width,left+w);x+=3){
   if(p.depth>(renderer.depths[x]??Infinity)+.05)continue;
   const u=(x-left)/w*2-1,r=Math.sqrt(Math.max(0,1-u*u)),height=size*r;
   c.fillStyle='#50286bcc';c.fillRect(x,top+(size-height)/2,3,height);
   c.fillStyle=`rgba(179,126,245,${.65+.25*Math.sin(time/210+u*8)})`;c.fillRect(x,top+(size-height)/2,3,Math.min(height,5));c.fillRect(x,top+(size+height)/2-5,3,5);
  }c.restore();
 }
 drawIvanSpeech(renderer,p,maze){
  const w=renderer.canvas.width,h=renderer.canvas.height,headY=p.y-p.scale*.84;
  if(!maze.chasing||maze.finished||maze.caught||maze.freezeLeft>0||maze.grace>0||maze.speechLeft<=0||!maze.speech||p.depth>8||p.x<0||p.x>w||headY<0||headY>h)return false;
  if(p.depth>(renderer.depths[Math.floor(p.x/3)*3]??Infinity)+.05)return false;
  const c=renderer.ctx,unit=w/Math.max(320,renderer.canvas.clientWidth),font=15*unit,pad=11*unit;
  const text=window.I18n?I18n.t(maze.speech):maze.speech;
  c.save();c.font=`${font}px Georgia`;const width=Math.min(w*.65,270*unit,Math.max(150*unit,c.measureText(text).width+2*pad)),lines=[];let line='';
  for(const word of text.split(' ')){const next=(line+' '+word).trim();if(line&&c.measureText(next).width>width-2*pad){lines.push(line);line=word;}else line=next;}if(line)lines.push(line);
  const height=lines.length*font*1.35+pad*2,left=Math.max(8,Math.min(w-width-8,p.x-width-18*unit));let top=Math.max(8,Math.min(h-height-8,headY-height*.7));
  for(const selector of ['#question-bubble','#chase-indicator']){const panel=document.querySelector(selector);
   if(panel&&!panel.hidden){const q=panel.getBoundingClientRect(),r=renderer.canvas.getBoundingClientRect(),qx=(q.left-r.left)*w/r.width,qy=(q.top-r.top)*h/r.height,qw=q.width*w/r.width,qh=q.height*h/r.height;if(left<qx+qw&&left+width>qx&&top<qy+qh&&top+height>qy)top=Math.min(h-height-8,qy+qh+12*unit);}
  }
  c.fillStyle='#f3e4c7';c.strokeStyle='#725047';c.lineWidth=2*unit;c.beginPath();c.roundRect(left,top,width,height,11*unit);c.fill();c.stroke();
  c.beginPath();c.moveTo(left+width-12*unit,top+height*.65);c.lineTo(p.x,headY+8*unit);c.lineTo(left+width-24*unit,top+height*.85);c.fill();c.stroke();
  c.fillStyle='#342439';c.textAlign='left';lines.forEach((s,i)=>c.fillText(s,left+pad,top+pad+font+i*font*1.35));c.restore();return true;
 }
 drawIvanCapture(c,w,h,t){
  // Use one atlas cell; the world actor is hidden once the chase is caught.
  const art=RPGCast.texture(this.ivan,'catch',t,RPGCast.actionCell);if(!art)return;
  const height=Math.min(w/1.2,h)*(.65+Math.min(t,.6)*.35),width=height*1.2;
  c.save();c.imageSmoothingEnabled=false;c.drawImage(art,(w-width)/2,(h-height)/2,width,height);c.restore();
 }
 drawIvan(renderer,p,time,biting){
  if(!this.ivan.complete||!this.ivan.naturalWidth)return;
  const c=renderer.ctx,art=RPGCast.texture(this.ivan,biting?'catch':'chase',time/1000,RPGCast.actionCell),size=p.scale*.84,width=size*1.2,left=p.x-width/2,top=p.y-size+Math.sin(time/180)*p.scale*.012;
  c.save();c.imageSmoothingEnabled=false;
  // Keep the original occlusion and gameplay silhouette; use the new face and outfit.
  for(let x=Math.max(0,Math.floor(left/3)*3);x<Math.min(renderer.canvas.width,left+width);x+=3){if(p.depth>(renderer.depths[x]??Infinity)+.05)continue;const u=Math.max(0,(x-left)/width);c.drawImage(art,u*384,0,Math.min(3/width*384,384-u*384),320,x,top,3,size);}

  c.restore();
 }
 drawDoorLabels(renderer,room,player,maze){
  const c=renderer.ctx;
  for(const door of maze.doors.filter(d=>d.stage===maze.stage&&!d.blocked&&room.map[d.y][d.x]===2)){
   const x=door.x-.02,y=door.y+.5,p=this.project(renderer,player,x,y,.52);if(!p||p.depth<.45||p.depth>10)continue;
   const hit=renderer.cast(room,player.x,player.y,Math.atan2(y-player.y,x-player.x),false);if(hit.distance+.03<Math.hypot(x-player.x,y-player.y))continue;
   c.save();const width=Math.min(280,Math.max(104,p.scale*.83)),font=Math.max(14,Math.min(22,p.scale*.08));c.font=`${font}px Trebuchet MS`;c.textAlign='center';
   const lines=[];let line='';for(const word of door.text.split(' ')){if(c.measureText((line+' '+word).trim()).width>width-16){lines.push(line);line=word;}else line=(line+' '+word).trim();}if(line)lines.push(line);
   const height=lines.length*(font+4)+18;c.fillStyle='#102031';c.fillRect(p.x-width/2,p.y-height/2,width,height);c.strokeStyle='#cdb482';c.strokeRect(p.x-width/2,p.y-height/2,width,height);c.fillStyle='#f6e4c0';lines.forEach((text,i)=>c.fillText(text,p.x,p.y-height/2+font+6+i*(font+4)));c.restore();
  }
 }
};
