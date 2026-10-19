/* Experimental developer-only interlude. Coordinates are horizontal map positions,
   not altitude. The cinematic clock is held until the wind challenge is solved. */
(()=>{
'use strict';
const M=window.ParachuteVectorModel=Object.freeze({
 origin:Object.freeze({x:0,y:0}),a:Object.freeze({x:40,y:20}),b:Object.freeze({x:30,y:-10}),
 boat:Object.freeze({x:70,y:10}),prison:Object.freeze({x:20,y:50}),
 add:(p,q)=>({x:p.x+q.x,y:p.y+q.y}),
 number(value){const s=String(value??'').trim().replace('−','-').replace(',','.');return /^[+-]?(?:\d+(?:\.\d*)?|\.\d+)$/.test(s)?Number(s):NaN;},
 landing(c){return {x:70+c.x,y:10+c.y};},
 correct(c){const p=this.landing(c);return Number.isFinite(c.x)&&Number.isFinite(c.y)&&Math.abs(p.x-20)<.01&&Math.abs(p.y-50)<.01;}
});
const lerp=(a,b,u)=>({x:a.x+(b.x-a.x)*u,y:a.y+(b.y-a.y)*u});
const clamp=x=>Math.max(0,Math.min(1,x));
window.ParachuteVectors=class {
 constructor(library){
  this.lib=library;this.visible=false;this.done=false;this.failures=0;
  this.panel=document.createElement('dialog');this.panel.id='parachute-vectors';this.panel.dataset.noTranslate='';
  this.panel.setAttribute('aria-labelledby','vector-title');
  this.panel.innerHTML=`<header><span class="vector-kicker">RETO EXTRA · DESARROLLADOR</span><h2 id="vector-title">Los vientos de Epithea</h2><p id="vector-story">¡Eric ha saltado del cohete! Su paracaídas lo mantiene en el aire, pero dos ráfagas lo llevan hacia su lancha. Dirige un último viento mágico para que aterrice en el patio de la prisión.</p></header>
   <div class="vector-layout"><figure><canvas id="vector-map" width="800" height="620" role="img" aria-label="Mapa visto desde arriba: inicio (0, 0); primer desplazamiento (40, 20) metros; segundo (30, −10) metros; lancha (70, 10); prisión (20, 50)."></canvas><figcaption id="vector-caption" aria-live="polite">Vista desde arriba · x hacia el este; y hacia el norte. No representa la altura.</figcaption></figure>
   <section class="vector-task"><div id="vector-exercise"><h3>Un último empujón</h3><p>Eric parte de <b>P₀ = (0, 0) m</b>. Primero actúa <b>A = (40, 20) m</b> y después <b>B = (30, −10) m</b>.</p><p>La prisión está en <b>R = (20, 50) m</b>. ¿Qué <b>vector de desplazamiento C</b> debe actuar después de A y B para que Eric llegue a R?</p><p class="vector-equation">P₀ + A + B + C = R</p><form id="vector-form" novalidate><div class="vector-components"><label for="vector-x">Cₓ (m)<input id="vector-x" name="x" type="text" inputmode="decimal" autocomplete="off" placeholder="Componente en x" aria-describedby="vector-feedback"></label><label for="vector-y">Cᵧ (m)<input id="vector-y" name="y" type="text" inputmode="decimal" autocomplete="off" placeholder="Componente en y" aria-describedby="vector-feedback"></label></div><small>Incluye el signo: este y norte (+); oeste y sur (−).</small><button class="primary" id="vector-cast" type="submit">Invocar el viento</button></form><div class="vector-help-buttons"><button id="vector-paola" type="button">Ayuda de Paola</button><button id="vector-palma" type="button" disabled>Palma IA · tras 3 intentos</button></div><p id="vector-help" hidden></p></div><p id="vector-feedback" role="status"></p><div id="vector-outcome" hidden><h3 id="vector-result-title"></h3><p id="vector-result-body"></p><button id="vector-retry" class="primary" hidden>Reintentar desde el paracaídas</button></div></section></div>`;
  document.querySelector('.scene-view').append(this.panel);this.canvas=this.panel.querySelector('canvas');this.ctx=this.canvas.getContext('2d');
  this.panel.addEventListener('cancel',e=>e.preventDefault());
  this.panel.querySelector('form').onsubmit=e=>{e.preventDefault();this.submit();};
  this.panel.querySelector('#vector-paola').onclick=()=>this.help(false);
  this.panel.querySelector('#vector-palma').onclick=()=>this.help(true);
  this.panel.querySelector('#vector-retry').onclick=()=>this.retry();
 }
 q(s){return this.panel.querySelector(s);}
 reset(){this.hide();this.done=false;this.failures=0;this.answer=null;this.phase='idle';}
 open(){
  if(this.visible||this.done)return;this.visible=true;this.phase='winds';this.elapsed=0;this.answer=null;
  this.lib.paused=true;this.lib.stopEffects();this.lib.refresh();
  this.scene=new SpaceCinematic({ctx:this.ctx,canvas:this.canvas,images:this.lib.images,legacySource:this.lib.legacySource});
  this.scene.currentTime=22;
  this.resetForm();this.panel.showModal();this.onActive?.(true);this.draw();this.q('#vector-x').focus({preventScroll:true});
 }
 resetForm(){
  this.q('#vector-exercise').hidden=false;this.q('#vector-outcome').hidden=true;this.q('#vector-retry').hidden=true;
  this.q('#vector-help').hidden=true;this.q('#vector-feedback').textContent='';this.q('#vector-form').reset();
  this.q('#vector-palma').disabled=this.failures<3;this.q('#vector-palma').textContent=this.failures<3?'Palma IA · tras 3 intentos':'Palma IA';
  for(const el of this.panel.querySelectorAll('input'))el.removeAttribute('aria-invalid');
  this.q('#vector-cast').disabled=false;this.panel.dataset.phase=this.phase;
  this.q('#vector-caption').textContent='Vista desde arriba · x hacia el este; y hacia el norte. No representa la altura.';
 }
 hide(){if(!this.visible)return;this.visible=false;this.panel.close();this.onActive?.(false);}
 retry(){if(this.phase!=='gameover')return;this.phase='ready';this.elapsed=0;this.answer=null;this.resetForm();this.draw();this.q('#vector-x').focus({preventScroll:true});}
 help(palma){
  if(!['winds','ready'].includes(this.phase))return;
  if(palma){if(this.failures<3||this.onPalma?.()===false)return;}else this.onHint?.();
  this.q('#vector-help').hidden=false;this.q('#vector-help').textContent=palma?'Palma IA: Cₓ = 20 − (0 + 40 + 30); Cᵧ = 50 − (0 + 20 − 10). Haz las dos restas y conserva sus signos.':'Paola: «Suma A y B por componentes para ubicar a Eric. Después resta su posición actual a la posición de la prisión. El vector que buscas indica cuánto y hacia dónde se mueve; no es la coordenada de la prisión». ';
 }
 submit(){
  if(!['winds','ready'].includes(this.phase))return;
  const c={x:M.number(this.q('#vector-x').value),y:M.number(this.q('#vector-y').value)};
  for(const key of ['x','y'])this.q('#vector-'+key).setAttribute('aria-invalid',String(!Number.isFinite(c[key])));
  if(!Number.isFinite(c.x)||!Number.isFinite(c.y)){this.q('#vector-feedback').textContent='Escribe un número con su signo en cada componente. Puedes usar punto o coma decimal.';return;}
  this.answer=c;const correct=M.correct(c);this.onAttempt?.(c,correct);
  this.phase=correct?'capture':'miss';this.elapsed=0;if(!correct)this.failures++;
  this.q('#vector-exercise').hidden=true;this.q('#vector-outcome').hidden=false;
  this.q('#vector-result-title').textContent=correct?'¡Viento bien dirigido!':'El viento no alcanza la prisión…';
  const p=M.landing(c);
  this.q('#vector-feedback').textContent=`Posición obtenida: (${Number(p.x.toFixed(2))}, ${Number(p.y.toFixed(2))}) m.`;
  this.q('#vector-result-body').textContent=correct?'El desplazamiento lleva a Eric al patio. Continúa su descenso…':'Ese desplazamiento no termina en R. Eric aprovecha el desvío y maniobra hacia su lancha.';
  this.q('#vector-caption').textContent=correct?'C dirige a Eric desde (70, 10) hasta la prisión.':'La marca roja señala el destino de tu vector. Eric escapa del viento mágico.';
  this.panel.dataset.phase=this.phase;this.q('#vector-result-title').setAttribute('tabindex','-1');this.q('#vector-result-title').focus({preventScroll:true});Sound.tone(correct?620:155,.18,'triangle',.12);this.draw();
 }
 tick(dt){
  if(!this.visible||document.hidden)return;this.elapsed+=dt;
  if(this.phase==='winds'&&this.elapsed>=3.5)this.phase='ready';
  if(this.phase==='capture'&&this.elapsed>=3.2){this.done=true;this.hide();this.lib.paused=false;this.lib.refresh();this.lib.draw();return;}
  if(this.phase==='miss'&&this.elapsed>=2){this.phase='escape';this.elapsed=0;this.q('#vector-caption').textContent='Eric: «¡Siempre tengo un plan de escape!»';}
  if(this.phase==='escape'&&this.elapsed>=7.5){this.phase='gameover';this.q('#vector-result-title').textContent='GAME OVER';this.q('#vector-result-body').textContent='Eric ha escapado en su lancha. Revisa el desplazamiento y vuelve a intentarlo desde este punto.';this.q('#vector-retry').hidden=false;this.q('#vector-retry').focus({preventScroll:true});this.q('#vector-caption').textContent='La prisión queda vacía. Puedes reintentar el reto sin repetir el lanzamiento.';Sound.tone(130,.35,'triangle',.1);}
  this.panel.dataset.phase=this.phase;this.draw();
 }
 text(text,x,y,color='#eee1b7',size=20,align='center'){
  const c=this.ctx;c.font=`${size}px EPIKText, Georgia, serif`;c.textAlign=align;c.fillStyle='#0a151ee8';const width=c.measureText(text).width;c.fillRect(x-(align==='center'?width/2:0)-5,y-size,width+10,size+7);c.fillStyle=color;c.fillText(text,x,y);
 }
 boat(x,y,scale=1){const c=this.ctx;c.save();c.translate(x,y);c.scale(scale,scale);c.fillStyle='#513a35';c.beginPath();c.moveTo(-35,0);c.lineTo(35,0);c.lineTo(21,19);c.lineTo(-24,19);c.closePath();c.fill();c.strokeStyle='#d4ba77';c.lineWidth=3;c.stroke();c.fillStyle='#b68b55';c.fillRect(-23,-5,45,6);c.fillStyle='#373444';c.fillRect(-11,-17,23,12);c.fillStyle='#8ee9c3';c.fillRect(-5,-15,11,7);c.restore();}
 fortress(x,y){const c=this.ctx;c.save();c.translate(x,y);c.fillStyle='#333b48';c.fillRect(-29,-32,58,54);c.fillStyle='#7b8390';c.fillRect(-35,-48,18,70);c.fillRect(17,-48,18,70);for(let i=0;i<4;i++)c.fillRect(-35+i*18,-41,10,18);c.fillStyle='#a2a5a0';c.fillRect(-35,-48,5,70);c.fillRect(17,-48,5,70);c.fillStyle='#14222c';c.fillRect(-11,-8,22,30);c.strokeStyle='#a3a199';for(let i=-7;i<10;i+=5){c.beginPath();c.moveTo(i,-8);c.lineTo(i,22);c.stroke();}c.restore();}
 arrow(a,b,color,label){const c=this.ctx;c.save();c.strokeStyle=color;c.fillStyle=color;c.lineWidth=4;c.beginPath();c.moveTo(a.x,a.y);c.lineTo(b.x,b.y);c.stroke();const angle=Math.atan2(b.y-a.y,b.x-a.x);c.translate(b.x,b.y);c.rotate(angle);c.beginPath();c.moveTo(0,0);c.lineTo(-15,-7);c.lineTo(-15,7);c.closePath();c.fill();c.restore();if(label)this.text(label,(a.x+b.x)/2,(a.y+b.y)/2-12,color,20);}
 draw(){
  if(!this.scene)return;
  if(['escape','gameover'].includes(this.phase)){this.drawEscape();return;}
  const c=this.ctx,w=800,h=620;c.imageSmoothingEnabled=false;
  const g=c.createLinearGradient(0,0,0,h);g.addColorStop(0,'#152c35');g.addColorStop(1,'#071c29');c.fillStyle=g;c.fillRect(0,0,w,h);
  const map=p=>({x:115+p.x*6.4,y:505-p.y*6.4});
  // A coastline, a stone prison and a launch jetty keep the diagram in the RPG world.
  c.fillStyle='#354940';c.beginPath();c.moveTo(0,0);c.lineTo(400,0);c.lineTo(410,170);c.lineTo(360,235);c.lineTo(380,300);c.lineTo(290,335);c.lineTo(260,620);c.lineTo(0,620);c.fill();
  c.strokeStyle='#87bc9b22';c.lineWidth=1;
  for(let i=0;i<=80;i+=10){const x=map({x:i,y:0}).x;c.beginPath();c.moveTo(x,75);c.lineTo(x,510);c.stroke();this.text(String(i),x,534,'#b2c6b7',16);}
  for(let i=0;i<=60;i+=10){const y=map({x:0,y:i}).y;c.beginPath();c.moveTo(110,y);c.lineTo(650,y);c.stroke();this.text(String(i),88,y+5,'#b2c6b7',16);}
  this.arrow(map({x:0,y:0}),map({x:86,y:0}),'#b7c8bb');this.arrow(map({x:0,y:0}),map({x:0,y:65}),'#b7c8bb');
  this.text('x (m) · Este',657,565,'#d8e4c7',18);this.text('y (m) · Norte',120,58,'#d8e4c7',18);
  const p1=M.add(M.origin,M.a),p2=M.add(p1,M.b),o=map(M.origin),a=map(p1),b=map(p2),r=map(M.prison);
  this.fortress(r.x,r.y);this.text('Prisión R (20, 50)',r.x,r.y-67,'#f6d387',21);this.boat(b.x,b.y);this.text('Lancha (70, 10)',b.x,b.y+52,'#c2ddd8',21);
  this.arrow(o,a,'#9acfea','A (40, 20)');this.arrow(a,b,'#dcb88e','B (30, −10)');
  this.text('P₀ (0, 0)',o.x-7,o.y+70,'#dee1bb',19);this.text('P₁ (40, 20)',a.x,a.y+35,'#dbe4cb',19);
  let eric=p2;
  if(this.phase==='winds'){eric=this.elapsed<1.6?lerp(M.origin,p1,clamp(this.elapsed/1.6)):lerp(p1,p2,clamp((this.elapsed-1.6)/1.6));}
  if(this.answer){const dest=M.landing(this.answer),raw=map(dest),end={x:Math.max(25,Math.min(w-25,raw.x)),y:Math.max(25,Math.min(h-25,raw.y))};this.arrow(b,end,this.phase==='capture'?'#aaf7bd':'#ff9e9a','C');
   if(this.phase==='capture')eric=lerp(p2,M.prison,clamp(this.elapsed/2.7));
   else {c.strokeStyle='#ff9e9a';c.lineWidth=3;c.strokeRect(end.x-7,end.y-7,14,14);if(raw.x!==end.x||raw.y!==end.y)this.text('Destino fuera del mapa',400,600,'#ffb1a1',18);}
  }
  const pos=map(eric);this.scene.currentTime=22+this.elapsed;this.scene.parachute(pos.x,pos.y-4,40,1);
  c.strokeStyle='#c2aa6c';c.lineWidth=3;c.strokeRect(3,3,w-6,h-6);
 }
 drawEscape(){
  const c=this.ctx,w=800,h=620,t=this.phase==='gameover'?7.5:this.elapsed;c.imageSmoothingEnabled=false;
  const sky=c.createLinearGradient(0,0,0,430);sky.addColorStop(0,'#07122e');sky.addColorStop(1,'#183951');c.fillStyle=sky;c.fillRect(0,0,w,h);
  c.fillStyle='#d2e5e4';for(let i=0;i<45;i++){const x=(i*137)%800,y=20+(i*71)%200;c.globalAlpha=.2+.3*(1+Math.sin(i))/2;c.fillRect(x,y,2,2);}c.globalAlpha=1;
  for(let k=0;k<3;k++){c.fillStyle=['#16293a','#132638','#102532'][k];c.beginPath();c.moveTo(0,430);for(let x=0;x<=840;x+=60)c.lineTo(x,285+k*36+Math.sin(x*.017+k)*27);c.lineTo(800,455);c.fill();}
  const prison=this.lib.images.prisonAtlas;
  if(prison?.naturalWidth){c.drawImage(prison,0,0,prison.naturalWidth/2,prison.naturalHeight,-35,-5,460,460);const mist=c.createLinearGradient(300,0,430,0);mist.addColorStop(0,'#122a3b00');mist.addColorStop(1,'#122a3b');c.fillStyle=mist;c.fillRect(300,0,130,430);}
  c.fillStyle='#273640';c.beginPath();c.moveTo(0,415);c.lineTo(240,401);c.lineTo(320,428);c.lineTo(350,470);c.lineTo(0,480);c.fill();
  c.fillStyle='#6e6553';c.fillRect(190,427,190,10);c.fillStyle='#373632';c.fillRect(202,436,11,42);c.fillRect(355,436,11,42);c.strokeStyle='#bdaf8266';for(let x=195;x<380;x+=16){c.beginPath();c.moveTo(x,428);c.lineTo(x,436);c.stroke();}
  c.fillStyle='#13394a';c.fillRect(0,430,w,190);c.strokeStyle='#65959666';c.lineWidth=2;
  for(let row=0;row<7;row++)for(let x=-80;x<w;x+=120){const y=448+row*24,dx=(t*30+row*19)%120;c.beginPath();c.moveTo(x+dx,y);c.quadraticCurveTo(x+dx+26,y-7,x+dx+55,y);c.stroke();}
  const depart=clamp((t-3.1)/4),x=440+depart*depart*460,y=444+Math.sin(t*3)*3;
  if(t<3.2){const u=clamp(t/3.1);this.scene.currentTime=22+t;this.scene.parachute(x,115+u*322,116,Math.max(0,1-(u-.84)/.16));}
  else {this.scene.currentTime=33;this.scene.drawEric(4,x,y-5,116);c.strokeStyle='#b8e4dc';c.lineWidth=3;for(let i=0;i<3;i++){c.beginPath();c.moveTo(x-65-i*24,y+12+i*8);c.lineTo(x-115-i*40-depart*90,y+12+i*8);c.stroke();}}
  this.boat(x,y,2.3);
  this.text(t<3.1?'Eric desciende hacia su lancha…':'«¡Nos volveremos a ver, Ignitia!»',400,75,'#f7dfa6',26);
  if(this.phase==='gameover'){c.fillStyle='#080e1dbb';c.fillRect(0,0,w,h);this.text('GAME OVER',400,280,'#efa197',52);this.text('Eric ha escapado',400,325,'#e5d9b6',27);}
  c.strokeStyle='#c2aa6c';c.lineWidth=3;c.strokeRect(3,3,w-6,h-6);
 }
};
const Base=window.CinematicLibrary;
window.CinematicLibrary=class extends Base {
 constructor(){super();this.vectors=new ParachuteVectors(this);
  const replay=document.querySelector('#cinema-replay'),repeat=replay.onclick;replay.onclick=event=>{this.vectors.reset();repeat(event);};
  const preview=document.createElement('button');preview.id='vectors-preview';preview.innerHTML='<strong>Reto extra: los vientos de Epithea</strong><span>Intercepción, paracaídas y vectores. Dos desenlaces: prisión o fuga en lancha.</span>';
  preview.onclick=()=>{this.play('intercepcion-espacial');this.ready.then(()=>{if(this.item?.id==='intercepcion-espacial'&&!this.loading){this.time=17;this.audio();this.draw();}});};document.querySelector('#cinematics-list').append(preview);
 }
 vectorCut(){return this.item?.id==='ignitia-intercepcion'?39:this.item?.id==='intercepcion-espacial'?20:null;}
 needsVectors(){return this.vectorCut()!==null&&!this.vectors.done;}
 play(id,options){this.vectors.reset();return super.play(id,options);}
 open(){this.vectors.hide();return super.open();}
 tick(dt){
  if(this.vectors.visible){this.vectors.tick(dt);return;}
  if(this.active&&!this.loading&&!this.paused&&!this.finished&&!document.hidden&&this.needsVectors()){
   const cut=this.vectorCut(),next=this.item.id==='ignitia-intercepcion'?SpaceInterception.advance(this.time,dt,25,36):SpaceInterception.advance(this.time,dt);
   if(next>=cut){this.time=cut;this.audio();this.draw();this.vectors.open();return;}
  }
  super.tick(dt);
 }
 finish(){if(this.loading)return;if(this.needsVectors()){this.time=this.vectorCut();this.audio();this.draw();this.vectors.open();return;}return super.finish();}
 requestClose(){if(this.story&&this.needsVectors()){if(this.acceptInput())this.finish();return;}if(this.vectors.visible)return;return super.requestClose();}
 close(completeStory=false){if(completeStory&&this.story&&this.needsVectors()){this.finish();return;}this.vectors.hide();return super.close(completeStory);}
};
})();
