/* Coordenadas del panel (X,Y), distintas de las coordenadas del suelo del motor. */
window.EricVariants={
 bank:[],bag:[],last:null,
 take(){if(!this.bag.length){this.bag=this.bank.slice();for(let i=this.bag.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[this.bag[i],this.bag[j]]=[this.bag[j],this.bag[i]];}const n=this.bag.length-1;if(this.bag[n].id===this.last)[this.bag[0],this.bag[n]]=[this.bag[n],this.bag[0]];}
  const support=this.bag.pop();this.last=support.id;return support;}
};
(()=>{
 const gcd=(a,b)=>b?gcd(b,a%b):a;
 const fraction=(n,d)=>{const k=gcd(Math.abs(n),d);return d/k===1?String(n/k):`${n/k}/${d/k}`;};
 const linearTerm=(n,d)=>{if(!n)return '';const k=gcd(Math.abs(n),d),a=Math.abs(n)/k,b=d/k;return (n<0?'−':'')+(a===1?'':a)+'x'+(b===1?'':'/'+b);};
 for(const left of [-2,-3,-4,-5])for(const right of [2,3,4,5,6]){
  const id=EricVariants.bank.length+1,d=id%2?3:4,c=1+(id%3),sum=left+right,intercept=c*d-left*right;
  const parabola=x=>x*x/d+c,line=x=>(sum*x+intercept)/d;
  EricVariants.bank.push(Object.freeze({id,d,c,parabola,line,parabolaText:`x²/${d} + ${c}`,lineText:(sum?linearTerm(sum,d)+' + ':'')+fraction(intercept,d),intersections:[[left,line(left)],[right,line(right)]]}));
 }
})();
window.ParabolaPuzzle=class {
 constructor(support=EricVariants.take()){this.support=support;this.cuts=[false,false];}
 submit(side,x,y){
  if(!Number.isFinite(x)||!Number.isFinite(y)||![-1,1].includes(side))return false;
  const s=this.support;
  if((side<0?x>=0:x<=0)||Math.abs(y-s.parabola(x))>.04||Math.abs(y-s.line(x))>.04)return false;
  this.cuts[side<0?0:1]=true;return true;
 }
 get solved(){return this.cuts.every(Boolean);}
};
window.EricPotions=class {
 constructor(onEvent){this.onEvent=onEvent;this.config=EpikDifficulty.profile;this.reset();}
 reset(){this.time=0;this.nextThrow=this.config.potionFirst;this.history=[];this.bottles=[];this.pools=[];this.bursts=[];this.caught=false;}
 tick(dt,player,allowThrow=true){if(this.caught)return;this.time+=dt;this.history.push({t:this.time,x:player.x,y:player.y});while(this.history.length>1&&this.history[1].t<this.time-2)this.history.shift();
  this.pools=this.pools.filter(p=>this.time<p.expires);this.bursts=this.bursts.filter(b=>this.time-b.born<.7);
  for(const b of this.bottles){b.age+=dt;if(b.age>=1.6&&!b.landed){b.landed=true;this.pools.push({x:b.x,y:b.y,expires:this.time+2});this.bursts.push({x:b.x,y:b.y,born:this.time});this.onEvent('splash');}}
  this.bottles=this.bottles.filter(b=>!b.landed);
  if(allowThrow&&this.time>=this.nextThrow){const target=this.history.findLast(p=>p.t<=this.time-1.5)||this.history[0];this.bottles.push({x:target.x,y:target.y,age:0});this.nextThrow=this.time+this.config.potionInterval;this.onEvent('throw');}
  if((player.jumpHeight||0)<.18&&this.pools.some(p=>Math.hypot(player.x-p.x,player.y-p.y)<.7)){this.caught=true;this.onEvent('hit');}
 }
 draw(renderer,player,actors,art){const c=renderer.ctx;
  const disc=(x,y,r,color,outline=false)=>{const center=actors.project(renderer,player,x,y,.025);if(!center||center.depth>(renderer.depths[Math.floor(center.x/3)*3]??Infinity)+.05)return;const points=Array.from({length:33},(_,i)=>actors.project(renderer,player,x+Math.cos(i*Math.PI/16)*r,y+Math.sin(i*Math.PI/16)*r,.025));if(points.some(p=>!p))return;c.beginPath();points.forEach((p,i)=>i?c.lineTo(p.x,p.y):c.moveTo(p.x,p.y));c.closePath();c.fillStyle=color;c.strokeStyle='#d1ffa2';c.lineWidth=2;if(outline)c.stroke();else{c.fill();c.stroke();}};
  c.save();for(const p of this.pools){c.globalAlpha=Math.min(1,(p.expires-this.time)/.3);disc(p.x,p.y,.7,'#79dc36bb');}c.globalAlpha=1;
  for(const b of this.bottles){disc(b.x,b.y,.7,'',true);const t=Math.min(1,b.age/1.6),o=this.origin||{x:20.9,y:7.5,z:1.5};WorldBillboard(renderer,player,actors,art,o.x+(b.x-o.x)*t,o.y+(b.y-o.y)*t,o.z*(1-t)+3.2*t*(1-t),.32,.42);}
  for(const b of this.bursts){const t=Math.max(0,(this.time-b.born)/.7),p=actors.project(renderer,player,b.x,b.y,.1);if(!p||p.depth>(renderer.depths[Math.floor(p.x/3)*3]??Infinity)+.1)continue;c.globalAlpha=1-t;for(let i=0;i<9;i++){const angle=i*2.4,spread=(.12+t*.7)*p.scale,x=p.x+Math.cos(angle)*spread,y=p.y-Math.sin(i*3)**2*p.scale*(.4+t*.4);c.fillStyle=i%2?'#baff66':'#30da4b';c.beginPath();c.moveTo(x-p.scale*.08,y);c.quadraticCurveTo(x-p.scale*.1,y-p.scale*.2,x,y-p.scale*(.3+.3*(1-t)));c.quadraticCurveTo(x+p.scale*.12,y-p.scale*.15,x+p.scale*.08,y);c.fill();}}c.globalAlpha=1;
  c.restore();
 }
};
/* One delayed, blinding spectacle with a synchronized flame wave per attempt. Game time pauses with play.
   A smooth bloom replaces flashing; reduced-motion disables screen shake. */
window.EricSupernova=class {
 static minTrigger=120;
 static maxTrigger=180;
 constructor(enabled,random=Math.random){this.enabled=enabled;this.random=random;this.reset();}
 reset(){this.triggerAt=EricSupernova.minTrigger+this.random()*(EricSupernova.maxTrigger-EricSupernova.minTrigger);this.elapsed=0;this.age=-1;this.used=false;this.canvas?.style.removeProperty('transform');this.canvas?.parentElement?.classList.remove('nova-blind');}
 get blind(){return this.age>=2&&this.age<5;}
 get active(){return this.age>=0&&this.age<6;}
 tick(dt,stunned=false,attackDt=dt){
  // The deadline advances even while stunned; effects use active attack time.
  this.elapsed+=dt;
  if(this.active&&!stunned)this.age+=attackDt;
  if(this.enabled&&!stunned&&!this.used&&this.elapsed>=this.triggerAt){this.used=true;this.age=0;return true;}
  return false;
 }
 draw(renderer,player,actors){
  this.canvas=renderer.canvas;this.canvas.parentElement?.classList.toggle('nova-blind',this.blind);const c=renderer.ctx,w=this.canvas.width,h=this.canvas.height;
  if(!this.active){this.canvas.style.removeProperty('transform');return;}
  const t=this.age,reduced=window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  const amplitude=reduced?0:Math.sin(Math.min(1,t/6)*Math.PI)*5;
  this.canvas.style.transform=`translate(${Math.sin(t*31)*amplitude}px,${Math.cos(t*27)*amplitude*.65}px)`;
  c.save();
  if(this.blind){c.fillStyle='#54ed35';c.fillRect(0,0,w,h);}
  else if(t>=5){c.fillStyle=`rgba(84,237,53,${Math.max(0,6-t)})`;c.fillRect(0,0,w,h);}
  else {
   // The source is in world space behind Eric, not at the screen center.
   const origin=actors?.project(renderer,player,23,7.5,2.8)||{x:w/2,y:h*.4};
   const radius=Math.max(8,Math.hypot(w,h)*Math.pow(t/2,2));
   const g=c.createRadialGradient(origin.x,origin.y,0,origin.x,origin.y,radius);
   g.addColorStop(0,'#dcffac');g.addColorStop(.5,'#54ed35');g.addColorStop(1,'rgba(84,237,53,0)');
   c.fillStyle=g;c.fillRect(0,0,w,h);
  }
  c.restore();
 }
};

window.EricEncounter=class {
 constructor(onEvent){this.onEvent=onEvent;this.stun=new EricSpark(()=>this.electrocute());this.supernova=new EricSupernova(!EpikDifficulty.easy);this.potions=new EricPotions(type=>{if(type==='hit')this.onEvent('potion');else if(type==='splash')Sound.flare();else if(type==='throw'){this.lastPotionAt=this.potions.time;this.say('¡Ja, ja! ¡Cuidado con la mezcla!',false);Sound.laugh();this.lastLaugh=this.elapsed;this.tauntClock=9;}});this.wave=new EricFlameWave(type=>{if(type==='hit')this.onEvent('flame');else if(type==='warning'){this.say('¡Veamos si puedes elevar tus expectativas!',false);Sound.tone(240,.5,'triangle',.13);this.tauntClock=10;}else if(type==='launch'){Sound.flare();}else if(type==='resume')this.potions.nextThrow=this.potions.time;});this.puzzle=new ParabolaPuzzle();this.elapsed=0;this.fall=0;this.active=-1;this.approachLatch=-1;this.speech=null;this.speechLeft=0;this.tauntClock=2;this.tauntIndex=0;this.lastLaugh=-20;this.lastPotionAt=-Infinity;this.potions.origin={x:20.9,y:6.65,z:.20*this.puzzle.support.parabola(0)+1.95};this.lasers=[{x:11.5,y:2.2,side:-1},{x:11.5,y:12.8,side:1}];this.eric=new Image();this.eric.src='assets/cast/eric-battle-b-v1.webp';this.art=new Map();
  if(!document.querySelector('#boss-mission'))document.querySelector('.scene-view').insertAdjacentHTML('beforeend',`<aside id="boss-mission" class="world-bubble"><button id="boss-fold" class="bubble-fold" aria-label="Minimizar o mostrar el reto" aria-expanded="true">−</button><div id="boss-mission-content"><p class="eyebrow">EL SOPORTE DE ERIC</p><h3>Dos cortes, una parábola</h3><p>Parábola: <b id="boss-parabola" data-no-translate></b><br>Recta de corte: <b id="boss-line" data-no-translate></b></p><p>Calcula sus dos intersecciones (x, y). Ve a cada láser lateral y pulsa E para programar el corte de su rama.</p><p id="boss-progress">0 / 2 cortes</p><small>X aumenta hacia la derecha; Y es altura. Unidades del plano del soporte.</small></div></aside><section id="boss-panel" class="world-console" hidden><button id="boss-close" class="bubble-fold" aria-label="Cerrar láser">×</button><p class="eyebrow" id="boss-laser-label"></p><h2>Coordenadas de corte</h2><p>Iguala las dos expresiones:</p><p id="boss-equality" data-no-translate></p><p>Escribe las coordenadas de la intersección de esta rama.</p><form id="boss-form"><label>Coordenada x<input id="boss-x" type="number" step="any" required inputmode="decimal"></label><label>Coordenada y<input id="boss-y" type="number" step="any" required inputmode="decimal"></label><button class="primary">Disparar láser</button></form><p id="boss-feedback" role="status"></p></section>`);
  document.querySelector('#boss-parabola').textContent='y = '+this.puzzle.support.parabolaText;document.querySelector('#boss-line').textContent='y = '+this.puzzle.support.lineText;document.querySelector('#boss-equality').textContent=this.puzzle.support.parabolaText+' = '+this.puzzle.support.lineText;
  document.querySelector('#boss-mission').hidden=false;document.querySelector('#boss-mission-content').hidden=false;document.querySelector('#boss-fold').onclick=e=>{const hidden=document.querySelector('#boss-mission-content').hidden=!document.querySelector('#boss-mission-content').hidden;e.target.textContent=hidden?'+':'−';e.target.setAttribute('aria-expanded',String(!hidden));};document.querySelector('#boss-panel').hidden=true;document.querySelector('#boss-progress').textContent='0 / 2 cortes';document.querySelector('#boss-close').onclick=()=>this.close();document.querySelector('#boss-form').onsubmit=e=>{e.preventDefault();this.fire();};
 }
 near(player,renderer,room,opened){return this.lasers.findIndex(l=>{const d=Math.hypot(player.x-l.x,player.y-l.y),a=Math.atan2(l.y-player.y,l.x-player.x);return d<2.2&&Math.cos(a-player.angle)>.80&&renderer.cast(room,player.x,player.y,a,opened).distance+.1>=d;});}
 open(player,renderer,room,opened){if(this.supernova.active)return false;const n=this.near(player,renderer,room,opened);if(n<0)return false;this.active=n;this.approachLatch=n;window.dispatchEvent(new Event('astralia:ui-open'));document.querySelector('#boss-laser-label').textContent=n===0?'LÁSER IZQUIERDO · RAÍZ NEGATIVA':'LÁSER DERECHO · RAÍZ POSITIVA';document.querySelector('#boss-form').reset();document.querySelector('#boss-feedback').textContent=this.puzzle.cuts[n]?'Este soporte ya está cortado.':'';document.querySelector('#boss-panel').hidden=false;document.querySelector('#boss-x').focus();return true;}
 close(){this.active=-1;document.querySelector('#boss-panel').hidden=true;}
 fire(){if(this.supernova.active||this.active<0||!this.canFire?.())return;const ix=document.querySelector('#boss-x'),iy=document.querySelector('#boss-y'),feedback=document.querySelector('#boss-feedback');if(!ix.value.trim()||!iy.value.trim()){feedback.textContent='Escribe ambas coordenadas.';return;}
  if(this.puzzle.cuts[this.active])return;const side=this.active;const ok=this.puzzle.submit(this.lasers[this.active].side,Number(ix.value),Number(iy.value));this.onAnswer?.({side,x:Number(ix.value),y:Number(iy.value),correct:ok});feedback.textContent=ok?'¡Intersección correcta! El láser corta el soporte.':'Ese punto no pertenece a ambas curvas en esta rama. Sustituye x e y en las dos ecuaciones.';
  if(!ok)this.say('¡Ja, ja! Ese punto no está en mis dos curvas.',true);
  if(ok){this.close();document.querySelector('#game').focus({preventScroll:true});this.say(this.puzzle.solved?'¡Mi soporte! ¡Esto no estaba en la gráfica!':'¿Un corte? Todavía te falta la otra intersección.',false);Sound.tone(900,.25,'sawtooth',.06);document.querySelector('#boss-progress').textContent=this.puzzle.cuts.filter(Boolean).length+' / 2 cortes';if(this.puzzle.solved){this.resetAttacks();this.close();this.onEvent('solved');}}
 }
 say(text,laugh=false){this.speech=text;this.speechLeft=6;if(laugh&&this.elapsed-this.lastLaugh>=12){Sound.laugh();this.lastLaugh=this.elapsed;}}
 stopAttacks(){this.resetAttacks();this.attacksStopped=true;}
 resetAttacks(){Sound.stopArcaneCharge();this.stun?.cancel();this.lastPotionAt=-Infinity;this.supernova.reset();this.potions.reset();this.wave.reset();this.attacksStopped=false;}
 electrocute(){
  // Clear attacks already on screen; keep the encounter's supernova deadline.
  this.potions.bottles=[];this.potions.pools=[];this.potions.history=[];this.potions.bursts=[];this.potions.caught=false;
  this.potions.nextThrow=this.potions.time+Math.max(2,this.potions.config.potionFirst);
  this.lastPotionAt=-Infinity;this.wave.reset();if(this.supernova.active)this.supernova.used=false;this.supernova.age=-1;this.novaWaveLaunched=false;
  this.say('¡Mi propia máquina! ¡Esto es una descarga de traición!',false);this.tauntClock=20;
  Sound.arcaneStun();
  this.onEvent('stun');
 }
 tick(dt,player,renderer,room,opened){if(document.hidden)return;const fighting=!this.puzzle.solved&&!this.attacksStopped;const attackDt=fighting?this.stun.tick(dt,player):0;if(fighting){if(this.supernova.tick(dt,this.stun.active,attackDt)){this.close();this.potions.reset();this.wave.reset();this.novaWaveLaunched=false;this.say('¡Se acabó la espera! Contempla mi SUPERNOVA.',false);Sound.arcaneNovaCharge();this.tauntClock=10;}if(attackDt>0){if(this.supernova.active){if(this.supernova.blind&&!this.novaWaveLaunched){this.novaWaveLaunched=true;this.wave.phase='wave';this.wave.x=EricFlameWave.config.startX;this.wave.previousPlayer=null;Sound.arcaneNovaImpact();}if(this.novaWaveLaunched)this.wave.tick(attackDt,player,true);}else{this.wave.tick(attackDt,player,!this.potions.bottles.length&&!this.potions.pools.length);if(!this.wave.caught&&!this.attacksStopped)this.potions.tick(attackDt,player,!this.wave.blocksPotions);}}} this.elapsed+=dt;this.speechLeft=Math.max(0,this.speechLeft-dt);this.tauntClock-=dt;
  if(!this.puzzle.solved&&!this.stun.active&&this.tauntClock<=0){const lines=['¡Ja, ja, ja! Mi parábola sostiene el futuro.','¿Encontraste x? No olvides calcular también y.','Dos curvas, dos cortes… ¡demuéstralo!','¡Al menos ponle título a esa gráfica!'];this.say(lines[this.tauntIndex++%lines.length],false);this.tauntClock=18;}
 if(this.puzzle.solved)this.fall=Math.min(2,this.fall+dt);if(this.active>=0&&this.near(player,renderer,room,opened)!==this.active)this.close();
  if(this.approachLatch>=0&&Math.hypot(player.x-this.lasers[this.approachLatch].x,player.y-this.lasers[this.approachLatch].y)>2.6)this.approachLatch=-1;
  const near=this.near(player,renderer,room,opened);if(near>=0&&near!==this.approachLatch&&this.active<0&&!this.puzzle.cuts[near]&&!this.supernova.active&&this.canAutoOpen?.()){this.approachLatch=near;if(this.open(player,renderer,room,opened))this.onAutoOpen?.();}
 }
 // Visual preparation anticipates the existing deadline; it never schedules an attack.
 battleFrame(){
  if(this.fall>0||this.puzzle.solved)return 7;
  if(this.supernova.active||this.wave.phase==='warning'||this.wave.phase==='wave')return 6;
  const age=this.potions.time-this.lastPotionAt;
  if(age>=0&&age<.18)return 4;
  if(age>=.18&&age<.48)return 5;
  const until=this.potions.nextThrow-this.potions.time;
  if(!this.attacksStopped&&!this.wave.blocksPotions&&until>0&&until<=.32)return 3;
  return this.speechLeft>0?[0,1,2,1][Math.floor(this.elapsed*7)%4]:0;
 }
 texture(kind){if(this.art.has(kind))return this.art.get(kind);if(kind!=='potion'){const art=EricMachinery.texture(kind);this.art.set(kind,art);return art;}const a=document.createElement('canvas');a.width=512;a.height=512;const c=a.getContext('2d');
  if(kind==='potion'){c.fillStyle='#b8f5de';c.fillRect(213,40,86,160);c.beginPath();c.arc(256,310,150,0,7);c.fill();c.fillStyle='#7bdd38';c.beginPath();c.arc(256,325,120,0,Math.PI);c.fill();c.fillStyle='#ba8747';c.fillRect(201,25,110,50);c.fillStyle='#f0fff7';c.fillRect(170,230,25,90);}
  this.art.set(kind,a);return a;
 }
 draw(renderer,player,actors){const c=renderer.ctx,project=(x,y,z)=>actors.project(renderer,player,x,y,z),pt=(x,y)=>project(21,7.5+x,.20*y),line=(a,b,color,width=3)=>{if(!a||!b)return;c.strokeStyle=color;c.lineWidth=width;c.beginPath();c.moveTo(a.x,a.y);c.lineTo(b.x,b.y);c.stroke();};
  EricArena.draw(renderer,player,actors);
  c.save();if(this.puzzle.solved)c.globalAlpha=.3;WorldBillboard(renderer,player,actors,this.texture('rig'),23.5,7.5,0,5.8,4.5);c.restore();
  // Plano del soporte: anclado a los dos muros laterales en X = −6.5 y +6.5.
  for(let x=-6.5;x<6.5;x+=.12){if(this.puzzle.solved&&x>this.puzzle.support.intersections[0][0]&&x<this.puzzle.support.intersections[1][0])continue;line(pt(x,this.puzzle.support.parabola(x)),pt(x+.12,this.puzzle.support.parabola(x+.12)),'#e8c783',7);}
  for(const x of [-6.5,6.5]){const p=pt(x,this.puzzle.support.parabola(x));if(p){c.fillStyle='#b9c4d5';c.fillRect(p.x-9,p.y-9,18,18);}}
  // Ejes de referencia y recta guía; los disparos se ven sólidos al acertar.
  line(pt(-6.5,0),pt(6.5,0),'#99b4cd',1);line(pt(0,0),pt(0,16),'#99b4cd',1);
  c.setLineDash([7,7]);line(pt(-6,this.puzzle.support.line(-6)),pt(6,this.puzzle.support.line(6)),'#6eaab4',2);c.setLineDash([]);
  for(const x of [-6,-4,-2,0,2,4,6]){const p=pt(x,0);if(p){c.fillStyle='#d9e5e8';c.font='12px Georgia';c.textAlign='center';c.fillText(String(x),p.x,p.y+14);}}
  for(const y of [2,4,6,8,10,12,14,16]){const p=pt(0,y);if(p){c.fillStyle='#d9e5e8';c.font='12px Georgia';c.fillText(String(y),p.x+8,p.y);}}
  const ericArt=this.stun.active&&this.stun.eric.complete&&this.stun.eric.naturalWidth?this.stun.eric:this.eric,ericFrame=ericArt===this.stun.eric?this.stun.frame():this.battleFrame();
  if(ericArt.complete&&ericArt.naturalWidth&&this.fall<1.5)WorldBillboard(renderer,player,actors,RPGCast.textureFrame(ericArt,ericFrame,RPGCast.actionCell),20.9,7.5,.20*this.puzzle.support.parabola(0)-this.fall*.7-2.55*16/320,2.55*384/320,2.55);
  for(let i=0;i<2;i++){const l=this.lasers[i];WorldBillboard(renderer,player,actors,this.texture(i===0?'left':'right'),l.x,l.y,0,1.35,1.55);if(this.puzzle.cuts[i]){const root=this.puzzle.support.intersections[i];line(project(l.x,l.y,1),pt(...root),i===0?'#97f6d0':'#d8a6ff',4);}}
  EricMachinery.effects(renderer,player,actors,this.elapsed,this.puzzle.solved);
  for(let i=0;i<2;i++)EricMachinery.label(renderer,player,actors,this.lasers[i],this.puzzle.cuts[i]);
  if(!this.puzzle.solved&&!this.attacksStopped)this.stun.draw(renderer,player,actors,{x:20.9,y:7.5,z:.20*this.puzzle.support.parabola(0)+2.55});
  this.potions.origin.z=.20*this.puzzle.support.parabola(0)+1.95;
  this.potions.draw(renderer,player,actors,this.texture('potion'));
  if(!this.puzzle.solved)this.wave.draw(renderer,player,actors,this.elapsed);this.drawSpeech(renderer,player,actors);this.supernova.draw(renderer,player,actors);
 }
 drawSpeech(renderer,player,actors){
  if(!this.speech||this.speechLeft<=0||this.fall>=1.5||Sound.dead)return;
  const c=renderer.ctx,w=renderer.canvas.width,h=renderer.canvas.height,head=actors.project(renderer,player,20.9,7.5,2.45+.20*this.puzzle.support.parabola(0)-this.fall*.7);
  if(!head||head.x<0||head.x>w||head.y<0||head.y>h)return;
  const unit=w/Math.max(320,renderer.canvas.clientWidth),font=15*unit,width=Math.min(w*.56,250*unit),pad=12*unit;
  c.save();c.font=`${font}px Georgia`;const lines=[];let line='';for(const word of this.speech.split(' ')){const test=(line+' '+word).trim();if(c.measureText(test).width>width-2*pad&&line){lines.push(line);line=word;}else line=test;}if(line)lines.push(line);
  const height=lines.length*font*1.35+pad*2,left=Math.max(8,Math.min(w-width-8,head.x-width-20*unit)),top=Math.max(8,Math.min(h-height-8,head.y-height*.7));
  c.fillStyle='#f3e4c7c7';c.strokeStyle='#725047';c.lineWidth=2*unit;c.beginPath();c.roundRect(left,top,width,height,13*unit);c.fill();c.stroke();c.beginPath();c.moveTo(left+width-16*unit,top+height*.7);c.lineTo(head.x-4*unit,head.y+6*unit);c.lineTo(left+width-4*unit,top+height*.45);c.fill();c.stroke();c.fillStyle='#342439';c.textAlign='left';lines.forEach((text,i)=>c.fillText(text,left+pad,top+pad+font+i*font*1.35));c.restore();
 }

};
