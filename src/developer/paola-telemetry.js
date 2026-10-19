/* Rocket tablet challenge. Loaded before main.js.
 * One continuous VERTICAL training flight, independent of Eric's live cruise radar.
 * Net acceleration +5 m/s² for 0–4 s, then free fall under g=9.81 m/s².
 */
(() => {
 'use strict';
 const M=window.PaolaTelemetryModel={
  cutoff:4,g:9.81,peak:4+20/9.81,impact:4+(20+Math.sqrt(400+2*9.81*40))/9.81,
  at(t){t=Math.max(0,Math.min(this.impact,t));const u=t-4;return t<4?{a:5,v:5*t,y:2.5*t*t}:{a:-this.g,v:20-this.g*u,y:Math.max(0,40+20*u-.5*this.g*u*u)};},
  number(value){const s=String(value).trim().replace(',','.');return s!==''&&/^[+-]?(?:\d+\.?\d*|\.\d+)$/.test(s)?Number(s):NaN;},
  issues(stage,a){
   const errors=[],add=(field,message)=>errors.push({field,message});
   if(stage===0){if(a.meaning!=='acceleration')add('meaning','Revisa qué magnitud expresa el cambio de velocidad por cada segundo.');
    if(a.sign!=='positive')add('sign','Compara el punto de la derecha con el de la izquierda: ¿la velocidad aumenta o disminuye?');
    if(!Number.isFinite(this.number(a.value))||Math.abs(this.number(a.value)-5)>.05)add('value','Divide el cambio de velocidad entre el intervalo de tiempo: Δvᵧ / Δt.');
    if(a.unit!=='acceleration')add('unit','Divide las unidades de velocidad entre las unidades de tiempo: (m/s) / s.');
    if(a.trend!=='constant')add('trend','Observa si la recta cambia de inclinación durante los cuatro segundos.');
   }else if(stage===1){if(a.position!=='curved')add('position','La pendiente de la altura representa la velocidad. Revisa si debe aumentar o disminuir su inclinación.');
    if(a.acceleration!=='constant')add('acceleration','La aceleración corresponde a la pendiente de la recta de velocidad.');
   }else if(stage===2){if(!Number.isFinite(this.number(a.peak))||Math.abs(this.number(a.peak)-this.peak)>.10)add('peak','Busca dónde la velocidad vertical llega a cero. Cuenta los segundos desde el despegue, no desde el fallo del motor.');
    if(a.motion!=='up-slow')add('motion','Observa el signo de la velocidad y cómo cambia su valor después del fallo, antes de cruzar el cero.');
    if(a.position!=='coast')add('position','Al apagarse el motor, el cohete aún tiene velocidad hacia arriba. Revisa cómo debe cambiar su altura.');
    if(a.gravity!=='negative')add('gravity','Que la velocidad sea cero en un instante no significa que la gravedad deje de actuar.');
   }else add('stage','Registro desconocido.');
   return errors;
  },
  grade(stage,a){return this.issues(stage,a)[0]?.message||'';}
 };
 const hints=[
  ['El eje vertical muestra la velocidad y el horizontal, el tiempo. Calcula cuánto cambia la velocidad entre los dos puntos y divide entre los segundos transcurridos.','aᵧ = (20 − 0) / (4 − 0) m/s². Haz la división y observa si la recta cambia su inclinación.'],
  ['La pendiente de y(t) es vᵧ(t); la pendiente de vᵧ(t) es aᵧ(t). Compara cómo cambia cada pendiente.','Con vᵧ = 5t y y₀ = 0: y = (5/2)t²; aᵧ = (20 − 0)/(4 − 0). Busca las formas correspondientes.'],
  ['Aunque el motor se apague, el cohete conserva su velocidad hacia arriba. Busca el instante en que esa velocidad llega a cero: ahí alcanza su altura máxima.','vᵧ = 20 − 9.81(t − 4). Para el instante en que alcanza su altura máxima: t = 4 + 20/9.81. Después del fallo, y = 40 + 20(t − 4) − (9.81/2)(t − 4)².']
 ];
 const success=[
  'La pendiente es +5 m/s²: la velocidad aumenta y la aceleración permanece constante.',
  'Las tres coinciden: y(t) se curva hacia arriba, vᵧ(t) es una recta creciente y aᵧ(t) es constante.',
  'El cohete alcanza su altura máxima 6.04 s después del despegue. En ese instante su velocidad vertical es cero y su aceleración sigue siendo −9.81 m/s². Después comienza a bajar.'
 ];
 window.PaolaTelemetry=class {
  constructor(owner){
   this.owner=owner;this.stage=0;this.done=false;this.passed=false;this.failures=[0,0,0];this.answers=[{},{},{}];this.points=[0,4];this.seek=0;this.enabled=false;this.playing=false;
   this.body=new Image();
   this.portrait=new Image();this.portrait.src='assets/cast/paola-b-v1-portrait.webp';this.portrait.onload=()=>this.drawPortrait();
   document.querySelector('.scene-view').insertAdjacentHTML('beforeend',`<section id="paola-tablet" class="world-console" hidden role="dialog" aria-modal="true" aria-labelledby="telemetry-title" data-no-translate>
    <header class="telemetry-header"><canvas width="128" height="128" aria-label="Paola"></canvas><div><p class="eyebrow">PAOLA · ARCHIVO DE VUELO</p><h2 id="telemetry-title">El rastro de Eric</h2><p id="telemetry-intro">Antes de usar la consola, aprendamos a leer su movimiento.</p></div><button type="button" id="telemetry-close" aria-label="Cerrar tablet">×</button></header>
    <div class="telemetry-meta"><span id="telemetry-progress"></span><span>Ventaja de Eric en pausa · El tiempo general continúa</span></div>
    <p class="telemetry-model">Vuelo vertical de práctica: y es la altura sobre la plataforma y t se mide desde el despegue. Hacia arriba es positivo. No es el radar en directo.</p>
    <div id="telemetry-content"></div>
    <p id="telemetry-feedback" role="status" aria-live="polite"></p><p id="telemetry-help" hidden></p>
    <footer class="telemetry-actions"><button type="button" id="telemetry-hint">Pista de Paola</button><button type="button" id="telemetry-palma">Palma IA · 3 errores</button><button type="button" id="telemetry-check" class="primary">Comprobar respuestas</button><button type="button" id="telemetry-next" class="primary" hidden>Siguiente ejercicio</button></footer>
   </section>`);
   this.panel=document.querySelector('#paola-tablet');
   this.praise=document.createElement('aside');this.praise.id='paola-encouragement';this.praise.hidden=true;this.praise.setAttribute('role','status');this.praise.setAttribute('aria-live','polite');
   this.praise.innerHTML='<canvas width="128" height="128" aria-label="Paola"></canvas><p></p>';document.querySelector('.scene-view').append(this.praise);

   this.panel.querySelector('#telemetry-close').onclick=()=>this.close();
   this.panel.querySelector('#telemetry-check').onclick=()=>this.submit();
   this.panel.querySelector('#telemetry-next').onclick=()=>this.next();
   this.panel.querySelector('#telemetry-hint').onclick=()=>this.help(false);
   this.panel.querySelector('#telemetry-palma').onclick=()=>this.help(true);
   this.panel.addEventListener('input',e=>this.input(e));
   this.panel.addEventListener('change',e=>this.input(e));
   this.panel.addEventListener('click',e=>this.click(e));
   this.panel.addEventListener('keydown',e=>{if(e.key==='Escape'){e.preventDefault();this.close();}else if(e.key==='Tab'){const nodes=[...this.panel.querySelectorAll('button:not([disabled]),input:not([disabled]),select:not([disabled])')].filter(n=>n.getClientRects().length);if(e.shiftKey&&document.activeElement===nodes[0]){e.preventDefault();nodes.at(-1)?.focus();}else if(!e.shiftKey&&document.activeElement===nodes.at(-1)){e.preventDefault();nodes[0]?.focus();}}});
   this.resize=new ResizeObserver(()=>{if(this.visible)this.drawGraphs();});this.resize.observe(this.panel);
  }
  get visible(){return !this.panel.hidden;}
  get pending(){return this.enabled&&!this.done;}
  reset(room,preserve=false){clearTimeout(this.praiseTimer);if(this.praise)this.praise.hidden=true;const saved=preserve?this.snapshot():null;this.close();this.enabled=!!room.rocket;if(this.enabled&&!this.body.getAttribute('src')){this.body.decoding='async';this.body.src='assets/cast/paola-b-v1.webp';}this.stage=0;this.done=false;this.passed=false;this.failures=[0,0,0];this.answers=[{},{},{}];this.points=[0,4];this.seek=0;if(saved)this.restore(saved);}
  snapshot(){return {version:1,stage:this.stage,done:this.done,passed:this.passed,failures:[...this.failures],answers:JSON.parse(JSON.stringify(this.answers)),points:[...this.points],seek:this.seek};}
  restore(s){if(!s||s.version!==1)return;this.stage=Math.max(0,Math.min(2,Math.trunc(s.stage)||0));this.done=s.done===true;this.passed=s.passed===true;this.failures=[0,1,2].map(i=>Math.max(0,Math.min(1000,Number(s.failures?.[i])||0)));this.answers=[0,1,2].map(i=>s.answers?.[i]&&typeof s.answers[i]==='object'?{...s.answers[i]}:{});this.points=Array.isArray(s.points)?[...new Set(s.points.filter(t=>[0,2,4].includes(t)))].slice(-2):[0,4];this.seek=Math.max(0,Math.min(M.impact,Number(s.seek)||0));if(this.passed&&!this.done){if(this.stage===2)this.done=true;else{this.stage++;this.passed=false;this.seek=0;}}}
  near(p){return this.enabled&&Math.hypot(p.x-7.4,p.y-7.3)<2.7&&Math.cos(Math.atan2(7.3-p.y,7.4-p.x)-p.angle)>.65;}
  open(){if(!this.enabled)return;this.owner.closeConsole();this.owner.speaking=false;document.querySelector('#ignitia-dialog').hidden=true;document.querySelector('#paola-dialog').hidden=true;window.dispatchEvent(new Event('astralia:ui-open'));this.panel.hidden=false;this.render();this.panel.querySelector('#telemetry-close').focus({preventScroll:true});}
  close(){this.playing=false;if(this.panel){this.panel.hidden=true;document.querySelector('#game')?.focus({preventScroll:true});}}
  drawPortrait(){RPGCast.portrait(this.panel.querySelector('canvas'),this.portrait,false,0);if(this.praise)RPGCast.portrait(this.praise.querySelector('canvas'),this.portrait,false,0);}
  select(name,label,options){return `<label class="telemetry-select" data-field="${name}">${label}<select name="${name}"><option value="">Elige…</option>${options.map(([v,t])=>`<option value="${v}">${t}</option>`).join('')}</select></label>`;}
  plot(kind,label,mini=false){return `<figure class="telemetry-plot${mini?' mini':''}"><figcaption>${label}</figcaption><canvas data-plot="${kind}" role="img" aria-label="${label}"></canvas></figure>`;}
  choices(name,label,options){return `<fieldset class="telemetry-choice" data-field="${name}"><legend>${label}</legend><div class="telemetry-cards">${options.map(([value,text,kind])=>`<button type="button" data-choice="${name}" data-value="${value}" aria-pressed="false">${this.plot(kind,text,true)}</button>`).join('')}</div></fieldset>`;}
  render(){
   this.panel.dataset.stage=this.done?'review':String(this.stage);
   const c=this.panel.querySelector('#telemetry-content');
   this.panel.querySelector('#telemetry-progress').textContent=this.done?'Tres ejercicios completados':`Ejercicio ${this.stage+1} de 3 · ${['Calcula la pendiente','Relaciona las gráficas','El motor deja de funcionar'][this.stage]}`;
   this.panel.querySelector('#telemetry-intro').textContent=this.done?'Ya sabes leer su movimiento. Ahora podemos calcular cómo alcanzarlo.':['Observa la velocidad del cohete durante los primeros 4 segundos. Elige dos puntos de la recta y calcula su pendiente.','Estas gráficas representan el mismo vuelo, entre 0 y 4 segundos. Elige una gráfica de altura y otra de aceleración que correspondan a la velocidad mostrada.','Cuatro segundos después del despegue, el motor falla. El cohete está a 40 m de altura y sube a 20 m/s. Desde ese instante solo actúa la gravedad; desprecia la resistencia del aire.'][this.stage];
   if(this.done)c.innerHTML=`<div class="telemetry-synced">${this.plot('full-a','Aceleración aᵧ(t)')}${this.plot('full-v','Velocidad vᵧ(t)')}${this.plot('full-y','Altura y(t)')}</div>${this.transport()}<p class="telemetry-recap">El motor falla a los 4.00 s · Alcanza su altura máxima a los ${M.peak.toFixed(2)} s · Regresa a la plataforma a los ${M.impact.toFixed(2)} s. El tiempo se mide desde el despegue.</p>`;
   else if(this.stage===0)c.innerHTML=`<div class="telemetry-workspace"><div>${this.plot('velocity','Velocidad vertical · Selecciona dos puntos')}<div class="telemetry-points">${[0,2,4].map(t=>`<button type="button" data-point="${t}" aria-pressed="${this.points.includes(t)}">(${t} s, ${5*t} m/s)</button>`).join('')}</div><output id="telemetry-delta"></output></div><div class="telemetry-fields">${this.select('meaning','¿Qué representa la pendiente?',[['position','Posición'],['velocity','Velocidad'],['acceleration','Aceleración']])}${this.select('sign','¿Cuál es el signo de la pendiente?',[['positive','Positivo'],['zero','Cero'],['negative','Negativo']])}<label class="telemetry-select">Valor de la pendiente<input name="value" type="text" inputmode="decimal" autocomplete="off" placeholder="Tu cálculo"></label>${this.select('unit','Unidades',[['velocity','m/s'],['acceleration','m/s²'],['position','m']])}${this.select('trend','¿Cómo cambia la aceleración?',[['increasing','Aumenta'],['constant','Permanece constante'],['decreasing','Disminuye']])}</div></div>`;
   else if(this.stage===1)c.innerHTML=`${this.plot('velocity','Registro conocido: velocidad vertical')}${this.choices('position','1 · ¿Qué gráfica muestra la altura y(t)? El cohete parte de y₀ = 0.',[['line','A · Recta creciente','candidate-y-line'],['curved','B · Cada vez más inclinada','candidate-y-up'],['flat','C · Se va aplanando','candidate-y-flat']])}${this.choices('acceleration','2 · ¿Qué gráfica muestra la aceleración aᵧ(t) durante esos mismos 4 segundos?',[['rising','A · Creciente','candidate-a-up'],['zero','B · Cero','candidate-a-zero'],['constant','C · Constante positiva','candidate-a-constant']])}`;
   else c.innerHTML=`${this.plot('full-v','Registro completo · Fallo del motor en t = 4 s')}${this.transport()}<div class="telemetry-fields two"><label class="telemetry-select">¿Cuántos segundos después del despegue alcanza su altura máxima?<input name="peak" type="text" inputmode="decimal" autocomplete="off" placeholder="Respuesta en segundos"></label><button type="button" id="telemetry-mark">Usar el tiempo seleccionado</button>${this.select('motion','Después de que falla el motor y antes de alcanzar su altura máxima, ¿cómo se mueve el cohete?',[['down','Ya está bajando'],['up-slow','Sube cada vez más despacio'],['stopped','Está detenido']])}${this.select('gravity','¿Cuál es su aceleración cuando alcanza la altura máxima?',[['zero','Es cero'],['positive','Es positiva'],['negative','Es −9.81 m/s²']])}</div>${this.choices('position','¿Qué gráfica describe la altura del cohete después de que falla el motor?',[['drop','A · La altura disminuye desde el fallo','candidate-fall'],['coast','B · La altura aumenta hasta un máximo y luego disminuye','candidate-coast'],['linear','C · La altura aumenta a un ritmo constante','candidate-rise']])}`;
   this.panel.querySelectorAll('[name]').forEach(n=>n.value=this.answers[this.stage][n.name]??'');
   this.panel.querySelector('#telemetry-feedback').textContent=this.passed?success[this.stage]:'';
   this.panel.querySelector('#telemetry-feedback').dataset.ok=String(this.passed);
   this.panel.querySelector('#telemetry-help').hidden=true;
   this.syncControls();this.drawPortrait();this.drawGraphs();this.updateTime();
  }
  transport(){return `<div class="telemetry-transport"><button type="button" id="telemetry-play">Reproducir registro</button><label for="telemetry-time">Tiempo desde el despegue <output id="telemetry-time-value"></output></label><input id="telemetry-time" type="range" min="0" max="${M.impact}" step="0.01" value="${this.seek}" aria-label="Tiempo desde el despegue"><output id="telemetry-reading" aria-live="off"></output></div>`;}
  syncControls(){
   this.panel.querySelectorAll('[data-choice]').forEach(b=>{b.setAttribute('aria-pressed',String(this.answers[this.stage][b.dataset.choice]===b.dataset.value));b.disabled=this.passed;});
   this.panel.querySelectorAll('[name]').forEach(n=>n.disabled=this.passed);
   this.panel.querySelector('#telemetry-check').hidden=this.passed||this.done;
   const next=this.panel.querySelector('#telemetry-next');next.hidden=true;
   this.panel.querySelector('#telemetry-hint').hidden=this.done;
   const palma=this.panel.querySelector('#telemetry-palma');palma.hidden=this.done;palma.disabled=this.failures[this.stage]<3||this.passed;palma.textContent=this.failures[this.stage]<3?'Palma IA · tras 3 errores':'Palma IA · paso final';
   const mark=this.panel.querySelector('#telemetry-mark');if(mark)mark.disabled=this.passed;
   const delta=this.panel.querySelector('#telemetry-delta');if(delta){const p=[...this.points].sort((a,b)=>a-b);delta.textContent=p.length===2?`P₁ = (${p[0]} s, ${p[0]*5} m/s) · P₂ = (${p[1]} s, ${p[1]*5} m/s)`:'Selecciona dos puntos para calcular la pendiente.';}
  }
  input(e){if(e.target.id==='telemetry-time'){this.playing=false;this.seek=Number(e.target.value);this.updateTime();this.drawGraphs();}else if(e.target.name&&!this.passed){this.answers[this.stage][e.target.name]=e.target.value;this.onProgress?.();}}
  click(e){const choice=e.target.closest('[data-choice]'),point=e.target.closest('[data-point]');
   if(choice&&!this.passed){this.answers[this.stage][choice.dataset.choice]=choice.dataset.value;this.syncControls();this.onProgress?.();}
   if(point){const t=Number(point.dataset.point);this.points=this.points.includes(t)?this.points.filter(n=>n!==t):[...this.points,t].slice(-2);this.panel.querySelectorAll('[data-point]').forEach(b=>b.setAttribute('aria-pressed',String(this.points.includes(Number(b.dataset.point)))));this.syncControls();this.drawGraphs();}
   if(e.target.id==='telemetry-mark'&&!this.passed){this.answers[2].peak=this.seek.toFixed(2);this.panel.querySelector('[name=peak]').value=this.answers[2].peak;this.onProgress?.();}
   if(e.target.id==='telemetry-play'){if(this.seek>=M.impact)this.seek=0;this.playing=!this.playing;this.updateTime();}
   if(e.target.matches('canvas[data-plot=velocity]')&&this.stage===0){const r=e.target.getBoundingClientRect(),t=(e.clientX-r.left-56)/(r.width-74)*4;const nearest=[0,2,4].reduce((a,b)=>Math.abs(b-t)<Math.abs(a-t)?b:a);this.panel.querySelector(`[data-point="${nearest}"]`).click();}
  }
  submit(){if(this.done||this.passed)return;clearTimeout(this.praiseTimer);this.praise.hidden=true;const output=this.panel.querySelector('#telemetry-feedback');if(this.stage===0&&this.points.length!==2){output.textContent='Selecciona primero dos puntos de la gráfica.';output.dataset.ok='false';return;}
   const answer={...this.answers[this.stage]},errors=M.issues(this.stage,answer);this.onAttempt?.(this.stage,answer,!errors.length);this.markErrors(errors);
   if(errors.length){this.failures[this.stage]++;output.textContent=errors.length===1?'Paola: «Revisa el inciso marcado en rojo. Tu otra información se conserva».':`Paola: «Revisa los ${errors.length} incisos marcados en rojo. Debajo de cada uno encontrarás qué debes revisar».`;output.dataset.ok='false';}else{this.passed=true;this.playing=false;output.textContent=success[this.stage];output.dataset.ok='true';Sound.click();}
   if(this.passed){
    const words=['¡Felicidades, está todo correcto! Ya sabes interpretar la pendiente. ¡Vamos por el siguiente reto!','¡Felicidades, está todo correcto! Has conectado las gráficas con muy buen razonamiento. ¡Sigue así!','¡Felicidades, está todo correcto! Tu razonamiento nos acerca a Eric. ¡Confía en lo que has aprendido!'];
    this.praise.querySelector('p').textContent='Paola: «'+words[this.stage]+'»';this.praise.hidden=false;
    clearTimeout(this.praiseTimer);this.praiseTimer=setTimeout(()=>{this.praise.hidden=true;},6500);
    this.next();return;
   }
   this.syncControls();this.onProgress?.();const first=this.panel.querySelector('.telemetry-invalid');if(first){first.scrollIntoView({block:'nearest'});first.querySelector('input,select,button')?.focus({preventScroll:true});}else output.scrollIntoView({block:'nearest'});
  }
  markErrors(errors){
   this.panel.querySelectorAll('.telemetry-invalid').forEach(n=>n.classList.remove('telemetry-invalid'));
   this.panel.querySelectorAll('.telemetry-field-error').forEach(n=>n.remove());
   this.panel.querySelectorAll('[aria-invalid]').forEach(n=>{n.removeAttribute('aria-invalid');n.removeAttribute('aria-describedby');});
   for(const {field,message} of errors){const control=this.panel.querySelector(`[name="${field}"]`),box=this.panel.querySelector(`[data-field="${field}"]`)||control?.closest('label');if(!box)continue;
    box.classList.add('telemetry-invalid');const note=document.createElement('span');note.className='telemetry-field-error';note.id='telemetry-error-'+field;note.textContent='Revisa este inciso: '+message;box.append(note);
    for(const n of control?[control]:[box,...box.querySelectorAll('button')]){n.setAttribute('aria-invalid','true');n.setAttribute('aria-describedby',note.id);}
   }
  }
  next(){if(this.done){this.close();return;}if(!this.passed)return;if(this.stage===2){this.done=true;this.seek=0;this.close();this.onProgress?.();return;}this.stage++;this.passed=false;this.seek=0;this.render();this.panel.scrollTop=0;this.panel.querySelector('[name], [data-choice]')?.focus({preventScroll:true});this.onProgress?.();}
  help(palma){if(this.done)return;if(palma){if(this.failures[this.stage]<3||this.onPalma?.()===false)return;}else this.onHint?.();const p=this.panel.querySelector('#telemetry-help');p.hidden=false;p.textContent=(palma?'Palma IA: ':'Paola: ')+hints[this.stage][palma?1:0]+(palma?' El uso de Palma IA queda registrado como ayuda.':'');this.onProgress?.();p.scrollIntoView({block:'nearest'});}
  tick(dt){if(!this.visible||!this.playing||document.hidden)return;this.seek=Math.min(M.impact,this.seek+dt);if(this.seek===M.impact)this.playing=false;this.updateTime();this.drawGraphs();}
  updateTime(){const range=this.panel.querySelector('#telemetry-time');if(!range)return;range.value=this.seek;this.panel.querySelector('#telemetry-time-value').textContent=this.seek.toFixed(2)+' s';this.panel.querySelector('#telemetry-play').textContent=this.playing?'Pausar registro':'Reproducir registro';const d=M.at(this.seek);this.panel.querySelector('#telemetry-reading').textContent=`vᵧ = ${d.v.toFixed(2)} m/s`+(this.done?` · y = ${d.y.toFixed(2)} m · aᵧ = ${d.a.toFixed(2)} m/s²`:'');}
  drawGraphs(){if(!this.visible)return;this.panel.querySelectorAll('canvas[data-plot]').forEach(canvas=>this.graph(canvas,canvas.dataset.plot));}
  graph(canvas,kind){
   const box=canvas.getBoundingClientRect(),width=box.width;if(width<20)return;const mini=canvas.closest('.mini'),height=box.height||210,dpr=Math.min(devicePixelRatio||1,2);
   if(canvas.width!==Math.round(width*dpr)||canvas.height!==height*dpr){canvas.width=Math.round(width*dpr);canvas.height=height*dpr;}const c=canvas.getContext('2d');c.setTransform(dpr,0,0,dpr,0,0);c.clearRect(0,0,width,height);
   const full=kind.startsWith('full'),fall=['candidate-fall','candidate-coast','candidate-rise'].includes(kind),accel=kind.includes('-a-')||kind==='full-a',velocity=kind==='velocity'||kind==='full-v';
   const xmin=fall?4:0,xmax=full||fall?M.impact:4,ymin=full?(accel?-12:velocity?-40:0):0,ymax=full?(accel?10:velocity?25:70):fall?160:accel?10:velocity?25:50;
   const l=mini?43:56,r=width-18,top=12,b=height-42,X=t=>l+(t-xmin)/(xmax-xmin)*(r-l),Y=v=>b-(v-ymin)/(ymax-ymin)*(b-top);
   c.fillStyle='#061d22';c.fillRect(0,0,width,height);c.font=`${mini?11:12}px "EPIK Text",sans-serif`;c.lineWidth=1;c.textAlign='right';c.textBaseline='middle';
   const yticks=full?(accel?[-9.81,0,5]:velocity?[-40,-20,0,20]:[0,20,40,60]):fall?[0,80,160]:accel?[0,5,10]:velocity?[0,10,20]:[0,20,40];
   for(const y of yticks){c.strokeStyle=y===0?'#7b9f99':'#234841';c.beginPath();c.moveTo(l,Y(y));c.lineTo(r,Y(y));c.stroke();c.fillStyle='#d9e8dc';c.fillText(String(y),l-7,Y(y));}
   const xticks=full?(width<350?[0,4,8]:[0,2,4,6,8]):fall?[4,6,8]:[0,2,4];c.textBaseline='top';
   for(const t of xticks){c.strokeStyle='#234841';c.beginPath();c.moveTo(X(t),top);c.lineTo(X(t),b);c.stroke();c.fillStyle='#d9e8dc';c.textAlign=t===xmin?'left':'center';c.fillText(String(t),X(t),b+6);}
   c.textAlign='center';c.fillText('t (s)',(l+r)/2,height-16);c.save();c.translate(12,(top+b)/2);c.rotate(-Math.PI/2);c.fillText(accel?'aᵧ (m/s²)':velocity?'vᵧ (m/s)':'y (m)',0,0);c.restore();
   const value=t=>{if(full)return M.at(t)[accel?'a':velocity?'v':'y'];if(velocity)return 5*t;if(kind==='candidate-y-line')return 10*t;if(kind==='candidate-y-up')return 2.5*t*t;if(kind==='candidate-y-flat')return 20*t-2.5*t*t;if(kind==='candidate-a-up')return 2*t;if(kind==='candidate-a-zero')return 0;if(kind==='candidate-a-constant')return 5;if(kind==='candidate-fall')return Math.max(0,40-.5*M.g*(t-4)**2);if(kind==='candidate-rise')return 40+20*(t-4);return M.at(t).y;};
   c.save();c.beginPath();c.rect(l-2,top-2,r-l+4,b-top+4);c.clip();c.strokeStyle='#8af0bd';c.lineWidth=2.3;c.beginPath();
   if(kind==='full-a'){c.moveTo(X(0),Y(5));c.lineTo(X(4),Y(5));c.moveTo(X(4),Y(-M.g));c.lineTo(X(M.impact),Y(-M.g));}
   else{const times=full?[...Array.from({length:81},(_,i)=>4*i/80),...Array.from({length:111},(_,i)=>4+(M.impact-4)*i/110)]:Array.from({length:101},(_,i)=>xmin+(xmax-xmin)*i/100);times.forEach((t,i)=>i?c.lineTo(X(t),Y(value(t))):c.moveTo(X(t),Y(value(t))));}c.stroke();
   if(full){c.strokeStyle='#a89870';c.setLineDash([4,4]);c.beginPath();c.moveTo(X(4),top);c.lineTo(X(4),b);c.stroke();c.setLineDash([]);c.strokeStyle='#f2d28a';c.beginPath();c.moveTo(X(this.seek),top);c.lineTo(X(this.seek),b);c.stroke();c.fillStyle='#ffe1a1';c.beginPath();c.arc(X(this.seek),Y(value(this.seek)),4,0,Math.PI*2);c.fill();}
   if(kind==='velocity'&&this.stage===0){const pts=[...this.points].sort((a,b)=>a-b);if(pts.length===2){c.strokeStyle='#e2bd74';c.setLineDash([4,4]);c.beginPath();c.moveTo(X(pts[0]),Y(pts[0]*5));c.lineTo(X(pts[1]),Y(pts[0]*5));c.lineTo(X(pts[1]),Y(pts[1]*5));c.stroke();c.setLineDash([]);}for(const t of [0,2,4]){c.fillStyle=this.points.includes(t)?'#ffe1a1':'#8af0bd';c.beginPath();c.arc(X(t),Y(t*5),5,0,Math.PI*2);c.fill();}}
   c.restore();canvas.setAttribute('aria-label',canvas.closest('figure').querySelector('figcaption').textContent+(full?' · Fallo del motor en t = 4 s.':''));
  }
  drawWorld(r,p,actors,time){if(!this.enabled||this.owner.mode!=='idle')return;const texture=RPGCast.texture(this.body,'idle',time);if(texture)WorldBillboard(r,p,actors,texture,7.4,7.3,-.0585,.9425,1.183,true);
   const anchor=actors.project(r,p,7.4,7.3,1.30);if(!anchor||anchor.depth>12||anchor.depth>(r.depths[Math.round(anchor.x)]??Infinity)+.1)return;
   const c=r.ctx;c.save();c.font='16px "EPIK Text",sans-serif';c.textAlign='center';const text=this.done?'Paola · Análisis completado':'Paola · Habla conmigo primero',w=c.measureText(text).width+24,x=Math.max(w/2+8,Math.min(r.canvas.width-w/2-8,anchor.x)),y=Math.max(30,anchor.y);c.fillStyle='#152537dc';c.strokeStyle='#c5b183';c.lineWidth=1;c.beginPath();c.roundRect(x-w/2,y-26,w,34,5);c.fill();c.stroke();c.beginPath();c.moveTo(x-5,y+8);c.lineTo(x,y+15);c.lineTo(x+5,y+8);c.stroke();c.fillStyle='#ffe8ae';c.fillText(text,x,y-4);c.restore();
  }
 };
 const Original=window.IgnitiaMission;
 window.IgnitiaMission=class extends Original{
  constructor(...args){super(...args);this.telemetry=new PaolaTelemetry(this);const canRun=this.simulator.canRun;this.simulator.canRun=()=>!this.telemetry.pending&&canRun();}
  speak(text,speaker='jose'){return super.speak(text.replace('Aquí José Luis. Camisa de rayas, cohete listo: solo falta tu trayectoria.','¡Aquí José Luis, líder de Ignitia! El cohete está listo; solo falta calcular la trayectoria.'),speaker);}
  get blocking(){return super.blocking||!!this.telemetry?.visible;}
  reset(room,options={}){super.reset(room,options);this.telemetry.reset(room,options.preserveTelemetry);if(room.rocket&&!this.telemetry.done)this.speak('¡Aquí José Luis, líder de Ignitia! El cohete está listo. Antes de usar la consola, habla con Paola: te espera a un lado para revisar tres ejercicios de movimiento en su tablet. Cuando termines, podrás programar la trayectoria.');}
  open(p){if(this.telemetry.pending){if(this.blocking)return false;if(this.telemetry.near(p)){this.telemetry.open();return true;}if(super.near(p)){this.speak('Primero habla con Paola. Está a un lado de la consola y necesita revisar contigo los registros del vuelo.');return true;}return false;}return super.open(p);}
  startLaunch(){if(this.telemetry.pending)return;super.startLaunch();}
  closeConsole(){super.closeConsole();this.telemetry?.close();}
  updatePursuit(){if(this.telemetry?.pending&&this.scene?.rocket&&this.mode==='idle'){this.headstart.hidden=false;const label=I18n.t('Análisis con Paola · Ventaja de Eric en pausa');if(this.headstart.textContent!==label)this.headstart.textContent=label;}else super.updatePursuit();}
  tick(dt){super.tick(dt);this.telemetry.tick(dt);this.headstart.classList.toggle('telemetry-pause',this.telemetry.pending);}
  draw(r,p,a){super.draw(r,p,a);this.telemetry.drawWorld(r,p,a,this.time);}
 };
})();
