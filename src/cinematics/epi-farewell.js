/* One shared curtain-call after either ending. Sprites bend at the waist;
   per-frame foot anchors keep the cast grounded without rotating whole bodies. */
window.EpiFarewell=class {
 static source='assets/cast/epis-farewell-v1.webp';
 static cast=[
  {name:'Iván',height:388,frames:[[98,6,164,393],[402,18,175,381],[705,80,181,319],[998,6,166,393]]},
  {name:'Eric',height:380,frames:[[53,405,248,385],[370,414,229,376],[670,473,240,317],[980,405,216,385]]},
  {name:'Paola',height:425,frames:[[58,800,237,427],[362,804,239,423],[670,840,235,387],[970,798,241,430]]}
 ];
 constructor(el){
  this.el=el;this.age=0;this.active=false;this.loaded=false;this.art=new Image();this.art.decoding='async';
  el.classList.add('epi-farewell');el.insertAdjacentHTML('afterbegin','<canvas id="epi-farewell-canvas" role="img" aria-label="Iván, Eric y Paola hacen una reverencia de despedida"></canvas>');
  el.insertAdjacentHTML('beforeend','<nav class="epi-farewell-actions" aria-label="Opciones al terminar"><button id="epi-farewell-replay" type="button">Repetir reverencia</button><div class="epi-play-again-group"><button id="epi-play-again" type="button" class="primary" aria-describedby="epi-ending-hint">¿Otra vez? ¡Eric no aprende!</button><small id="epi-ending-hint">Quizá este no es el único final....</small></div></nav>');
  this.canvas=el.querySelector('canvas');this.ctx=this.canvas.getContext('2d');this.title=el.querySelector('#chapter-ending-text');this.replay=el.querySelector('#epi-farewell-replay');
  this.replay.onclick=()=>{this.age=0;this.animate=true;this.prepare().then(()=>this.draw()).catch(()=>{});};
  this.restart=el.querySelector('#epi-play-again');this.restart.onclick=()=>{if(this.active)window.dispatchEvent(new Event('epik:play-again'));};
  this.resize=new ResizeObserver(()=>{if(this.active)this.draw()});this.resize.observe(el);
  window.addEventListener('astralia:language',()=>{if(this.active){this.labels();this.draw()}});
 }
 prepare(){
  if(this.loading)return this.loading;
  this.loading=new Promise((resolve,reject)=>{this.art.onload=async()=>{try{await this.art.decode();this.loaded=true;resolve();if(this.active)this.draw();}catch(e){this.loading=null;reject(e)}};this.art.onerror=()=>{this.loading=null;reject(Error('Farewell sprites unavailable'))};this.art.src=EpiFarewell.source;});return this.loading;
 }
 labels(){const en=I18n.lang==='en';this.title.textContent=en?'Thank you for playing · Aventura EPIK':'Gracias por jugar · Aventura EPIK';this.replay.textContent=en?'Repeat bow':'Repetir reverencia';this.restart.textContent=en?'Again? Eric never learns!':'¿Otra vez? ¡Eric no aprende!';this.el.querySelector('#epi-ending-hint').textContent=en?'Perhaps this is not the only ending....':'Quizá este no es el único final....';this.restart.setAttribute('aria-label',en?'Play again from the beginning':'Volver a jugar desde el principio');this.canvas.setAttribute('aria-label',en?'Iván, Eric and Paola take a farewell bow':'Iván, Eric y Paola hacen una reverencia de despedida');}
 open(){this.active=true;this.age=0;this.animate=!matchMedia('(prefers-reduced-motion: reduce)').matches;this.el.hidden=false;this.labels();this.prepare().catch(()=>{});this.draw();this.title.focus({preventScroll:true});}
 close(){this.active=false;this.el.hidden=true;}
 tick(dt){if(!this.active||document.hidden)return;if(this.loaded&&this.animate)this.age=Math.min(7,this.age+Math.max(0,dt));const key=this.animate?EpiFarewell.cast.map((_,i)=>EpiFarewell.pose(this.age-i*.1)).join(','):'still';if(this.frameKey!==key){this.frameKey=key;this.draw();}}
 static pose(t){return t<1.7?0:t<2.05?1:t<3.25?2:t<3.6?1:3;}
 draw(){
  if(!this.active||this.el.hidden)return;const box=this.el.getBoundingClientRect(),w=box.width,h=box.height;if(w<1||h<1)return;
  const dpr=Math.min(devicePixelRatio||1,2),pw=Math.round(w*dpr),ph=Math.round(h*dpr);if(this.canvas.width!==pw||this.canvas.height!==ph){this.canvas.width=pw;this.canvas.height=ph;}
  const c=this.ctx;c.setTransform(dpr,0,0,dpr,0,0);c.clearRect(0,0,w,h);
  const glow=c.createRadialGradient(w*.5,h*.55,0,w*.5,h*.55,w*.6);glow.addColorStop(0,'#26374b');glow.addColorStop(.55,'#101a2e');glow.addColorStop(1,'#050914');c.fillStyle=glow;c.fillRect(0,0,w,h);
  // Quiet, fixed starlight keeps the final screen calm after the bow.
  for(let i=0;i<32;i++){const x=((i*173+43)%997)/997*w,y=((i*97+11)%389)/389*h*.7;c.globalAlpha=.18+(i%4)*.08;c.fillStyle=i%3?'#c8d7ed':'#e6c785';c.fillRect(x,y,i%5?1.5:3,i%5?1.5:3);}c.globalAlpha=1;
  const portrait=w<h,baseline=h*(portrait?.72:.79),height=Math.min(h*(portrait?.39:.49),w*.38,330),span=Math.min(w*.30,310),positions=[w/2-span,w/2,w/2+span];
  c.fillStyle='#152334';c.strokeStyle='#c6a56755';c.lineWidth=1;c.beginPath();c.ellipse(w/2,baseline+4,Math.min(w*.46,540),Math.max(20,height*.14),0,0,Math.PI*2);c.fill();c.stroke();
  if(this.loaded)EpiFarewell.cast.forEach((actor,i)=>{
   const frame=this.animate?EpiFarewell.pose(this.age-i*.1):3,rect=actor.frames[frame],scale=height/actor.height,x=positions[i],foot=baseline;
   c.fillStyle='#03071077';c.beginPath();c.ellipse(x,foot+2,height*.24,height*.035,0,0,Math.PI*2);c.fill();
   c.drawImage(this.art,...rect,x-rect[2]*scale/2,foot-rect[3]*scale,rect[2]*scale,rect[3]*scale);
   c.textAlign='center';c.fillStyle='#f4dfae';c.font=`${Math.max(14,Math.min(22,w*.026))}px "Astralia RPG", Georgia, serif`;c.fillText(actor.name,x,baseline+Math.max(30,height*.14));
  });
 }
};
