/* Símbolos en carriles rectos: jamás siguen al jugador. */
window.RelaxCorridor=class {
 constructor(onEvent){this.onEvent=onEvent;this.guardian=new GardenGuardian(onEvent);this.time=0;this.hitboxScale=EpikDifficulty.profile.symbolHitboxScale;this.readyShown=false;this.caught=false;
  this.obstacles=[{x:8,y:2.9,width:2.2,height:.22},{x:12,y:6.1,width:2.2,height:.22},{x:16,y:4.5,width:1.8,height:.22},{x:20,y:2.9,width:2.2,height:.22},{x:24,y:6.1,width:2.2,height:.22}];
  this.obstacles.push(...this.obstacles.map(o=>({...o,x:o.x+27})));
  this.obstacles.forEach(o=>o.x=2.9+(o.x-2.5)*.9);
  // Reservar las zonas de aterrizaje: los símbolos sí siguen cruzando la lava.
  this.obstacles=this.obstacles.filter(o=>o.x<window.CORRIDOR_LAVA.start-1.5||o.x>window.CORRIDOR_LAVA.end+1.5);
  this.spawnX=46;this.speed=EpikDifficulty.profile.symbolSpeed;this.spawnInterval=EpikDifficulty.profile.symbolInterval;this.spawnClock=this.spawnInterval;this.nextLane=0;
  this.glyphs=['π','∑','∫','dy/dx','Δx','eˣ'];
  this.symbols=this.initialSymbols();this.art=new Map();
 }
 initialSymbols(){return Array.from({length:9},(_,i)=>({y:2.2+(i%3)*1.55+Math.random()*1.4,text:this.glyphs[i%6],x:2.9+(8+i*5-2.5)*.9,age:1}));}
 resetHazards(){this.caught=false;this.time=0;this.nextLane=0;this.symbols=this.guardian.arrived?[]:this.initialSymbols();this.spawnClock=this.spawnInterval;}
 // El aviso y su confirmación comparten el mismo alcance.
 nearExit(player){return Math.hypot(player.x-67,player.y-4.5)<=2.4;}
 blocks(x,y,height){return this.guardian.blocks(x,y)||height<.25*.9&&this.obstacles.some(o=>Math.abs(x-o.x)<.32*.9&&Math.abs(y-o.y)<(o.width/2+.18)*.9);}
 tick(dt,player){if(this.caught)return;this.time+=dt;
  if(player.x>=GUARDIAN_GARDEN.start)this.guardian.enter();
  if(this.guardian.arrived){this.symbols=[];this.guardian.tick(dt,player);return;}
  this.spawnClock-=dt;while(this.spawnClock<=0){const band=this.nextLane%3;this.symbols.push({y:2.2+band*1.55+Math.random()*1.4,text:this.glyphs[this.nextLane++%this.glyphs.length],x:this.spawnX,age:0});this.spawnClock+=this.spawnInterval;}
  for(const s of this.symbols){s.age+=dt;s.x-=this.speed*dt;
   if(s.age>=.65&&player.jumpHeight<.30*.9*.9*this.hitboxScale&&Math.hypot(player.x-s.x,player.y-s.y)<.48*.9*.9*this.hitboxScale){this.caught=true;this.onEvent('hit');return;}
  }
  this.symbols=this.symbols.filter(s=>s.x>=1.8);

 }
 texture(obj,crate){const key=crate?'crate':obj.text;if(this.art.has(key))return this.art.get(key);const a=document.createElement('canvas');a.width=512;a.height=256;const c=a.getContext('2d');
  if(crate){c.fillStyle='#735338';c.fillRect(0,0,512,256);for(let i=0;i<8;i++){c.fillStyle=i%2?'#917046':'#7f603e';c.fillRect(i*64+3,5,57,246);}c.strokeStyle='#c2a371';c.lineWidth=14;c.strokeRect(8,8,496,240);c.beginPath();c.moveTo(15,240);c.lineTo(497,15);c.stroke();}
  else{c.fillStyle='#beffe0';c.shadowColor='#5fffc7';c.shadowBlur=12;c.textAlign='center';c.font=obj.text.length>2?'bold 145px Georgia':'bold 210px Georgia';c.fillText(obj.text,256,210,480);}
  this.art.set(key,a);return a;
 }
 draw(renderer,player,actors){this.guardian.draw(renderer,player,actors,this.time*1000);const objs=[...this.obstacles.map(o=>({...o,crate:true})),...this.symbols];objs.sort((a,b)=>Math.hypot(b.x-player.x,b.y-player.y)-Math.hypot(a.x-player.x,a.y-player.y));
  for(const o of objs){const p=actors.project(renderer,player,o.x,o.y,0);if(!p)continue;const art=this.texture(o,o.crate),width=p.scale*(o.width||.8),height=p.scale*(o.crate?.22:.48),left=p.x-width/2,top=p.y-height-(o.crate?0:.06)*p.scale,c=renderer.ctx;
   c.save();if(!o.crate&&o.age<.65)c.globalAlpha=.35+.35*Math.sin(o.age*30)**2;
   for(let x=Math.max(0,Math.floor(left/3)*3);x<Math.min(renderer.canvas.width,left+width);x+=3){if(p.depth>(renderer.depths[x]??Infinity)+.04)continue;const u=Math.max(0,(x-left)/width);c.drawImage(art,u*512,0,Math.min(512-u*512,3/width*512),256,x,top,3,height);}c.restore();
  }
 }
};
window.makeOakDoor=function(){
 const a=document.createElement('canvas');a.width=a.height=512;const c=a.getContext('2d');c.fillStyle='#38291d';c.fillRect(0,0,512,512);
 for(let i=0;i<8;i++){const x=16+i*60;c.fillStyle=['#886031','#966b38','#795029'][i%3];c.fillRect(x,12,57,488);for(let j=0;j<12;j++){c.strokeStyle=j%2?'#b48a4a77':'#49301d88';c.lineWidth=1+j%2;c.beginPath();c.moveTo(x+4+j*4,14);c.bezierCurveTo(x+17+j*3,140,x+j*4,330,x+5+j*4,498);c.stroke();}}
 c.strokeStyle='#c19b63';c.lineWidth=12;c.strokeRect(8,8,496,496);
 for(const y of [99,370]){c.fillStyle='#262c30';c.fillRect(17,y,478,25);c.fillStyle='#b0a17f';for(const x of [35,110,210,302,402,478]){c.beginPath();c.arc(x,y+12,4,0,Math.PI*2);c.fill();}}
 c.strokeStyle='#d0ac62';c.lineWidth=9;c.beginPath();c.arc(405,257,23,0,Math.PI*2);c.stroke();c.fillStyle='#25231c';c.fillRect(399,289,12,20);
 return a;
};
