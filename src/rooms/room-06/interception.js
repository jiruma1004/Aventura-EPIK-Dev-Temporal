/* A local, uniform-gravity training model, in km and seconds. Not orbital mechanics. */
window.InterceptionPhysics = {
 g: .00981, tolerance: 3, ericSpeed:.308, get moonTime(){return Math.hypot(132,60)/this.ericSpeed;},
 get ericVelocity(){const k=this.ericSpeed/Math.hypot(11,5);return {x:11*k,y:5*k};},
 limits: {speed:[.8,3], angle:[5,85], delay:[0,60], duration:[40,140]},
 initial: {speed:1.8, angle:48, delay:10, duration:90},
 valid(p){return Object.entries(this.limits).every(([k,[min,max]])=>Number.isFinite(p[k])&&p[k]>=min&&p[k]<=max);},
 eric(t){return {x:120+this.ericVelocity.x*t,y:60+this.ericVelocity.y*t};},
 rocket(p,t){const a=p.angle*Math.PI/180;return {x:p.speed*Math.cos(a)*t,y:p.speed*Math.sin(a)*t-.5*this.g*t*t};},
 groundTime(p){return 2*p.speed*Math.sin(p.angle*Math.PI/180)/this.g;},
 evaluate(p,epoch=0){
  if(!this.valid(p)||!Number.isFinite(epoch)||epoch<0)return {hit:false,valid:false,distance:Infinity};
  const time=epoch+p.delay+p.duration,ours=this.rocket(p,p.duration),target=this.eric(time),distance=Math.hypot(ours.x-target.x,ours.y-target.y),ground=this.groundTime(p)<p.duration,late=time>=this.moonTime;
  return {valid:true,hit:!ground&&!late&&distance<=this.tolerance,distance,ground,late,ours,target,time};
 },
 aimAt(p,x,y){
  const vx=x/p.duration,vy=(y+.5*this.g*p.duration*p.duration)/p.duration;
  const clamp=(n,[min,max])=>Math.max(min,Math.min(max,n));
  return {...p,speed:clamp(Math.hypot(vx,vy),this.limits.speed),angle:clamp(Math.atan2(vy,vx)*180/Math.PI,this.limits.angle)};
 }
};

window.InterceptionConsole = class {
 constructor(panel,ericArt,rocketArt,onReady){
  this.panel=panel;this.ericArt=ericArt;this.rocketArt=rocketArt;this.onReady=onReady;
  panel.innerHTML=`<button id="rocket-close" class="bubble-fold" aria-label="Cerrar panel">×</button>
   <header><p class="eyebrow">IGNITIA · RUMBO A LA LUNA</p><h2>A por Eric</h2><p class="intercept-intro">Eric no piensa esperarnos. Alcanza su cohete antes de que llegue a la Luna.</p></header>
   <div class="intercept-workspace"><div class="intercept-map">
    <div class="intercept-map-top"><span>RADAR · EN DIRECTO</span><output id="intercept-clock" aria-label="Tiempo hasta la llegada lunar" aria-live="off">${Math.ceil(InterceptionPhysics.moonTime)} s</output></div>
    <canvas id="intercept-canvas" width="1000" height="480" aria-label="Trayectorias de Ignitia y Eric. Arrastra el punto verde para ajustar rapidez y ángulo; también puedes usar los controles deslizantes."></canvas>
    <div class="intercept-legend"><span class="ours-key">Ignitia</span><span class="eric-key">Eric</span><span class="future-key">Posición prevista al encuentro</span></div>
    <p class="intercept-drag">Arrastra el punto verde de la trayectoria o usa los controles.</p>
   </div><div class="intercept-controls">
    <div id="intercept-sliders"></div>
    <div class="intercept-actions"><button id="intercept-trial" class="primary">Probar mi rumbo</button><button id="intercept-reset" aria-label="Restablecer parámetros">↺</button></div>
    <p id="rocket-feedback" role="status" aria-live="polite"></p>
    <button id="intercept-launch" class="primary" hidden>¡Despegar!</button>
   </div></div>
   <section class="intercept-equations" aria-label="Ecuaciones del movimiento">
    <div><b>Tu cohete · tiro parabólico</b><p class="intercept-formula" data-no-translate>x(t) = v₀ cos(θ) t<br>y(t) = v₀ sin(θ) t − ½gt²</p><p>t es el tiempo desde tu salida (el tiempo de vuelo τ del control). v₀ es la rapidez inicial y θ el ángulo sobre la horizontal. g = 0.00981 km/s².</p></div>
   </section><p class="intercept-model">Modelo balístico 2D, sin motor ni aire, con gravedad uniforme; Luna fuera de escala. Encuentro a ≤ 3 km. Llegada lunar: t ≈ ${InterceptionPhysics.moonTime.toFixed(2)} s. Reloj ×1 al planear, ×20 al ensayar; sigue al cerrar el panel.</p>`;
  this.canvas=panel.querySelector('canvas');this.ctx=this.canvas.getContext('2d');
  this.clock=panel.querySelector('#intercept-clock');this.feedback=panel.querySelector('#rocket-feedback');
  this.trialButton=panel.querySelector('#intercept-trial');this.launchButton=panel.querySelector('#intercept-launch');
  const labels={speed:['Rapidez inicial · v₀','km/s','Más rapidez: mayor alcance.'],angle:['Ángulo · θ','°','Más ángulo: más altura, menos avance horizontal.'],delay:['Retraso de salida · d','s','Eric sigue avanzando mientras esperas.'],duration:['Tiempo de vuelo · τ','s','Elige cuándo deben encontrarse.']};
  for(const [key,[min,max]] of Object.entries(InterceptionPhysics.limits)){
   const [label,unit,hint]=labels[key],step=key==='speed'?.01:key==='angle'?.1:1;
   panel.querySelector('#intercept-sliders').insertAdjacentHTML('beforeend',`<label for="intercept-${key}"><span>${label}</span><output id="intercept-${key}-value" data-no-translate></output><input id="intercept-${key}" type="range" min="${min}" max="${max}" step="${step}" aria-describedby="intercept-${key}-hint"><small id="intercept-${key}-hint">${hint}</small></label>`);
   const input=panel.querySelector('#intercept-'+key);input.dataset.unit=unit;
   input.oninput=()=>{this.params[key]=Number(input.value);this.edited();};
  }
  this.trialButton.onclick=()=>this.startTrial();
  panel.querySelector('#intercept-reset').onclick=()=>this.resetControls();
  this.launchButton.onclick=()=>{if(this.ready&&InterceptionPhysics.evaluate(this.params,this.launchEpoch).hit&&this.canRun?.())this.onReady();};
  this.canvas.addEventListener('pointerdown',e=>{
   if(this.running)return;const p=this.point(e),end=this.project(InterceptionPhysics.rocket(this.params,this.params.duration));
   if(Math.hypot(p.x-end.x,p.y-end.y)>35)return;
   this.dragging=true;this.canvas.setPointerCapture(e.pointerId);e.preventDefault();
  });
  this.canvas.addEventListener('pointermove',e=>{
   if(!this.dragging)return;const p=this.point(e),world=this.unproject(p);
   this.params=InterceptionPhysics.aimAt(this.params,Math.max(1,world.x),Math.max(0,world.y));this.params.speed=Number(this.params.speed.toFixed(2));this.params.angle=Number(this.params.angle.toFixed(1));this.edited();
  });
  const release=()=>{this.dragging=false;this.draw();};
  this.canvas.addEventListener('pointerup',release);this.canvas.addEventListener('pointercancel',release);this.canvas.addEventListener('lostpointercapture',release);
  this.resize=new ResizeObserver(()=>this.draw());this.resize.observe(this.canvas);
  window.addEventListener('astralia:language',()=>{this.sync();this.draw();});
  this.reset();
 }
 reset(){this.missionTime=0;this.launchEpoch=0;this.failed=false;this.active=false;this.attempts=0;this.resetControls();}
 resetControls(){if(this.running)this.onAttemptEnd?.('interrupted','reset');this.params={...InterceptionPhysics.initial};this.running=false;this.ready=false;this.elapsed=0;this.dragging=false;this.result=null;this.feedback.textContent='Ajusta tu ruta. Eric sigue avanzando; restablecer los controles no reinicia su reloj.';this.sync();this.draw();}
 get predictionEpoch(){return this.running||this.ready?this.launchEpoch:this.missionTime;}
 cancel(){if(this.running){this.onAttemptEnd?.('interrupted','cancelled');this.elapsed=0;this.feedback.textContent='Ensayo cancelado. Puedes ajustar la ruta y volver a probar.';}this.running=false;this.dragging=false;this.sync();}
 show(){this.draw();this.panel.querySelector('#intercept-speed').focus({preventScroll:true});}
 edited(){this.running=false;this.ready=false;this.elapsed=0;this.result=null;this.feedback.textContent='Ruta actualizada. Ensaya para comprobar si coinciden en el mismo instante.';this.sync();this.draw();}
 sync(){
  for(const key of Object.keys(InterceptionPhysics.limits)){
   const input=this.panel.querySelector('#intercept-'+key);input.value=this.params[key];input.disabled=this.running;
   this.panel.querySelector('#intercept-'+key+'-value').textContent=`${this.params[key].toFixed(key==='speed'?2:key==='angle'?1:0)} ${input.dataset.unit}`;
  }
  this.trialButton.disabled=this.running;this.trialButton.textContent=this.running?'Simulando…':'Probar mi rumbo';this.launchButton.hidden=true;
 }
 startTrial(){
  if(this.running||!this.canRun?.()||!InterceptionPhysics.valid(this.params))return;
  this.onAttemptStart?.({...this.params,epoch:this.missionTime});this.launchEpoch=this.missionTime;this.elapsed=0;this.running=true;this.ready=false;this.result=null;this.attempts++;
  this.feedback.textContent='Ensayo en curso · reloj ×20. Eric también avanza: los intentos consumen tiempo de misión.';this.sync();
 }
 tick(dt){
  if(!this.active||this.failed||this.ready||!this.canAdvance?.()){this.draw();return;}
  const finish=this.running?this.launchEpoch+this.params.delay+Math.min(this.params.duration,InterceptionPhysics.groundTime(this.params)):Infinity;
  this.missionTime=Math.min(InterceptionPhysics.moonTime,finish,this.missionTime+dt*(this.running?20:1));
  if(this.missionTime>=InterceptionPhysics.moonTime){if(this.running)this.onAttemptEnd?.('incorrect','moon');this.failed=true;this.running=false;this.ready=false;this.sync();this.draw();this.onFail?.();return;}
  if(this.running){
   this.elapsed=this.missionTime-this.launchEpoch;
   const landed=InterceptionPhysics.groundTime(this.params)<this.params.duration;
   if(this.missionTime>=finish){
    this.result=InterceptionPhysics.evaluate(this.params,this.launchEpoch);this.onAttemptEnd?.(this.result.hit?'correct':'incorrect',this.result.hit?'':landed?'ground':'miss');this.running=false;this.ready=this.result.hit;
    if(this.ready)this.feedback.textContent='¡Intercepción lograda! Iniciando el despegue con tu trayectoria.';
    else if(landed)this.feedback.textContent='El cohete vuelve al suelo antes del encuentro. Prueba más rapidez, otro ángulo o menos tiempo de vuelo.';
    else this.feedback.textContent='Separación al encuentro: '+this.result.distance.toFixed(1)+' km. Ajusta la ruta y vuelve a ensayar. No pierdes vidas.';
    this.sync();if(this.ready)this.onReady();
   }
  }
  this.draw();
 }
 point(e){const r=this.canvas.getBoundingClientRect();return {x:e.clientX-r.left,y:e.clientY-r.top};}
 project(p){const b=this.bounds;return {x:48+p.x/b.x*(this.width-70),y:this.height-32-p.y/b.y*(this.height-57)};}
 unproject(p){return {x:(p.x-48)/(this.width-70)*this.bounds.x,y:(this.height-32-p.y)/(this.height-57)*this.bounds.y};}
 draw(){
  if(this.panel.hidden)return;const r=this.canvas.getBoundingClientRect();if(r.width<1)return;
  this.width=r.width;this.height=r.height;const dpr=Math.min(2,window.devicePixelRatio||1),w=Math.round(r.width*dpr),h=Math.round(r.height*dpr);
  if(this.canvas.width!==w||this.canvas.height!==h){this.canvas.width=w;this.canvas.height=h;}
  const c=this.ctx;c.setTransform(dpr,0,0,dpr,0,0);c.clearRect(0,0,this.width,this.height);
  const p=this.params,preview=Array.from({length:101},(_,i)=>InterceptionPhysics.rocket(p,p.duration*i/100)),target=InterceptionPhysics.eric(this.predictionEpoch+p.delay+p.duration),original=InterceptionPhysics.eric(0),moon=InterceptionPhysics.eric(InterceptionPhysics.moonTime);
  if(!this.dragging||!this.bounds)this.bounds={x:Math.ceil(Math.max(moon.x+35,target.x+25,...preview.map(q=>q.x+15))/50)*50,y:Math.ceil(Math.max(moon.y+30,target.y+25,...preview.map(q=>q.y+15))/25)*25};
  c.fillStyle='#031a16';c.fillRect(0,0,this.width,this.height);
  c.font='12px sans-serif';c.lineWidth=1;c.textAlign='center';
  for(let i=0;i<=4;i++){
   const x=i*this.bounds.x/4,y=i*this.bounds.y/4,px=this.project({x,y:0}),py=this.project({x:0,y});
   c.strokeStyle='#164438';c.beginPath();c.moveTo(px.x,25);c.lineTo(px.x,this.height-32);c.moveTo(48,py.y);c.lineTo(this.width-22,py.y);c.stroke();
   c.fillStyle='#8abbaa';c.fillText(String(x),px.x,this.height-14);c.textAlign='right';c.fillText(String(y),41,py.y+4);c.textAlign='center';
  }
  c.fillStyle='#acd4c1';c.textAlign='left';c.fillText('y · km',8,15);c.textAlign='right';c.fillText('x · km',this.width-3,this.height-1);
  // A pixel-art destination on the explicitly reduced, fictional mission map.
  this.drawMoon(this.project(moon));
  const path=(points,color,dash=[])=>{c.strokeStyle=color;c.lineWidth=2;c.setLineDash(dash);c.beginPath();let started=false;for(const q of points){if(q.y<0)break;const xy=this.project(q);if(!started){c.moveTo(xy.x,xy.y);started=true;}else c.lineTo(xy.x,xy.y);}c.stroke();c.setLineDash([]);};
  c.save();c.beginPath();c.rect(47,21,this.width-68,this.height-52);c.clip();
  path([original,moon],'#f5c57966',[6,5]);path(preview,'#65eab18a',[5,5]);
  const flight=this.running||this.ready?Math.max(0,this.elapsed-p.delay):0,ours=InterceptionPhysics.rocket(p,flight),current=InterceptionPhysics.eric(this.missionTime);
  if(flight>0)path(preview.filter((q,i)=>p.duration*i/100<=flight),'#7bffb9');path([original,current],'#ffd699');
  const end=this.project(preview[100]),ep=this.project(target),real=this.project(current);
  c.strokeStyle='#f5c579';c.lineWidth=1.5;c.setLineDash([3,4]);c.beginPath();c.arc(ep.x,ep.y,13,0,Math.PI*2);c.stroke();c.setLineDash([]);
  this.miniature(this.ericArt,ep,Math.atan2(InterceptionPhysics.ericVelocity.x,InterceptionPhysics.ericVelocity.y),.23);
  this.miniature(this.ericArt,real,Math.atan2(InterceptionPhysics.ericVelocity.x,InterceptionPhysics.ericVelocity.y),1);
  this.miniature(this.rocketArt,this.project(ours),Math.atan2(p.speed*Math.cos(p.angle*Math.PI/180),p.speed*Math.sin(p.angle*Math.PI/180)-InterceptionPhysics.g*flight),1);
  c.strokeStyle='#91ffbe';c.lineWidth=2;c.fillStyle='#0d4430';c.beginPath();c.arc(end.x,end.y,10,0,Math.PI*2);c.fill();c.stroke();c.beginPath();c.moveTo(end.x-5,end.y);c.lineTo(end.x+5,end.y);c.moveTo(end.x,end.y-5);c.lineTo(end.x,end.y+5);c.stroke();
  if(this.ready){c.strokeStyle='#b8ffbd';c.beginPath();c.arc(ep.x,ep.y,22+Math.sin(this.elapsed)*2,0,Math.PI*2);c.stroke();}
  c.restore();
  c.fillStyle='#ffd699';c.textAlign='left';c.font='bold 12px sans-serif';c.fillText('ERIC',Math.min(this.width-47,real.x+16),Math.max(32,real.y-17));
  const clockText=`t = ${this.missionTime.toFixed(1)} s · ${Math.ceil(InterceptionPhysics.moonTime-this.missionTime)} s → ☾`;if(this.clock.textContent!==clockText)this.clock.textContent=clockText;
  this.clock.classList.toggle('urgent',InterceptionPhysics.moonTime-this.missionTime<120);
 }
 drawMoon(at){
  const c=this.ctx,px=2,r=10;c.save();
  for(let y=-r;y<=r;y++)for(let x=-r;x<=r;x++){
   if(x*x+y*y>r*r)continue;
   const crater=(x+4)**2+(y+3)**2<8||(x-3)**2+(y-3)**2<12||(x-1)**2+(y+6)**2<4;
   c.fillStyle=crater?'#7e978d':x>5?'#94ac9f':x<-3?'#e0eace':'#bacfba';c.fillRect(Math.round(at.x+x*px),Math.round(at.y+y*px),px,px);
  }
  c.fillStyle='#dceacb';c.textAlign='center';c.font='bold 11px sans-serif';c.fillText('LUNA',at.x,at.y-25);c.restore();
 }
 miniature(art,at,angle,alpha){
  const c=this.ctx;c.save();c.translate(at.x,at.y);c.rotate(angle);c.globalAlpha=alpha;c.imageSmoothingEnabled=false;
  if(art.complete&&art.naturalWidth)c.drawImage(art,-18,-30,36,60);
  else {c.fillStyle='#bcffd1';c.beginPath();c.moveTo(0,-16);c.lineTo(8,14);c.lineTo(-8,14);c.closePath();c.fill();}c.restore();
 }
};
