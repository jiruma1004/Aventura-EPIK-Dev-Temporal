/* Paola narra. El retrato central cambia sin revelar el encuentro del laberinto. */
window.AdventurePrologue=class {
 constructor(onEnter){
  this.onEnter=onEnter;this.step=0;this.started=false;this.done=false;this.elapsed=0;this.clock=0;this.count=0;this.speaking=false;
  this.pages=[
   {portrait:'paola',name:'Epi Paola',cue:'grassland',title:'Antes de cruzar el bosque…',text:'Bienvenido al reino de Epithea. Soy EPI Paola y voy a acompañarte. Antes de cruzar las puertas, hay algo que debes saber: todo empezó con el Dr. Eric… y unas gráficas sin título.'},
   {portrait:'eric',name:'Dr. Eric',cue:'villain',title:'El origen de un villano',text:'El Dr. Eric era un químico respetado. Hasta que se cansó de corregir gráficas sin título. Ahora ha tomado el castillo y prepara una máquina capaz de distorsionar el tiempo y el espacio. Sí… se lo tomó bastante mal.'},
   {portrait:'paola',name:'Epi Paola',cue:'villain',title:'120 minutos para detenerlo',text:'Tenemos 120 minutos para detenerlo. El reloj empezará cuando entres al mundo. Lleva tus apuntes contigo: observar, calcular y volver a intentar será más útil que correr sin mirar.'},
   {portrait:'ivan',name:'EPI Iván · desaparecido',cue:'missing',title:'Una desaparición sin resolver',text:'El EPI Iván también está desaparecido desde que Eric se fue. Nadie sabe dónde se encuentra. Se dice que se perdió en un bosque… pero nadie ha podido confirmar esa historia.'},
   {portrait:'paola',name:'Epi Paola',cue:'grassland',title:'No estarás solo',text:'Si te atoras, pulsa H o toca mi globo de ayuda. Te daré una pista para empezar. Respira, revisa tus cálculos y confía en lo que sabes. Ah… esta vez sí ponles título a tus gráficas.'}
  ];
  this.images={};for(const [name,file] of Object.entries({paola:'paola-b-v1-portrait.webp',eric:'eric-b-v1-portrait.webp',ivan:'ivan-newspaper-approved-b.webp'})){const img=new Image();img.src='assets/cast/'+file;this.images[name]=img;}
  const dialog=document.querySelector('#adventure-intro');dialog.classList.add('prologue');dialog.setAttribute('aria-describedby','story-text');
  dialog.innerHTML=`<button id="story-language" class="story-language" data-no-translate>English / Español</button><p class="eyebrow">AVENTURA EPIK · EPI PAOLA TE CUENTA</p><h2 id="adventure-title"></h2><div class="story-stage"><div class="story-portrait"><div class="missing-headline" hidden><span>LA GACETA DE AVENTURA EPIK</span><strong>DESAPARECIDO</strong><small>EDICIÓN ESPECIAL · MISTERIO EN EL BOSQUE</small></div><canvas id="story-face" width="224" height="224" aria-label="Retrato de la historia"></canvas><span id="story-person"></span><p class="missing-caption" hidden>Último rastro: el bosque.<br>Su paradero sigue siendo un misterio.</p></div><div class="story-dialogue"><span class="story-speaker">EPI PAOLA</span><p id="story-text" aria-live="off"></p><p id="story-announcement" class="sr-only" role="status"></p></div></div><div id="story-name-box"><label for="story-student-name">Antes de empezar, ¿cómo te llamas?</label><input id="story-student-name" type="text" maxlength="80" autocomplete="name" required placeholder="Nombre para tu certificado"><small>Tu nombre aparecerá en el certificado y se guardará solo en este navegador.</small><fieldset id="story-experience"><legend>¿Acostumbras jugar videojuegos?</legend><label><input type="radio" name="experience" value="normal" required> Sí · Modo normal</label><label><input type="radio" name="experience" value="easy" required> No · Modo fácil</label><small>El modo fácil te da más margen para saltar y esquivar. Los ejercicios son los mismos.</small></fieldset></div><div class="story-footer"><span id="story-progress">PRÓLOGO · 1 / 5</span><span>El reloj aún no corre</span></div><button id="adventure-start" class="primary" autofocus>Escuchar a Paola</button><button id="story-skip" class="story-skip">Saltar relato y entrar</button>`;
  document.querySelector('#story-language').onclick=()=>I18n.set(I18n.lang==='es'?'en':'es');
  document.querySelector('#adventure-start').onclick=()=>this.advance();document.querySelector('#story-skip').onclick=()=>{if(this.acceptName())this.finish(true);};dialog.addEventListener('cancel',e=>{e.preventDefault();});this.renderPage();
 }
 renderPage(){const p=this.pages[this.step];this.chars=[...I18n.t(p.text)];this.count=0;this.clock=0;this.elapsed=0;this.speaking=this.started;
  this.posterDrawn=false;const face=document.querySelector('#story-face');face.width=face.height=224;document.querySelector('.story-portrait').classList.remove('full-body');
  const missing=p.portrait==='ivan';document.querySelector('.story-portrait').classList.toggle('missing-newspaper',missing);document.querySelector('.missing-headline').hidden=!missing;document.querySelector('.missing-caption').hidden=!missing;document.querySelector('#story-person').hidden=false;
  document.querySelector('#adventure-title').textContent=p.title;document.querySelector('#story-person').textContent=p.name;document.querySelector('#story-face').setAttribute('aria-label',missing?'La Gaceta de Aventura EPIK. Desaparecido: EPI Iván. Último rastro: el bosque. Su paradero sigue siendo un misterio.':p.name);document.querySelector('#story-text').textContent=this.started?'':'Una historia antes de la aventura. Pulsa «Escuchar a Paola» para comenzar.';document.querySelector('#story-announcement').textContent=this.started?p.text:'';
  document.querySelector('#story-progress').textContent=`PRÓLOGO · ${this.step+1} / ${this.pages.length}`;document.querySelector('#adventure-start').textContent=this.started?'Mostrar todo':'Escuchar a Paola';Sound.selectBackground(p.cue);this.drawFace();
 }
 acceptName(){const input=document.querySelector('#story-student-name');input.value=input.value.trim().replace(/\s+/g,' ');if(!input.reportValidity())return false;const selected=document.querySelector('input[name=experience]:checked');if(!selected){document.querySelector('input[name=experience]').reportValidity();return false;}EpikDifficulty.select(selected.value);this.studentName=input.value;document.querySelector('#story-name-box').hidden=true;return true;}
 advance(){if(this.done)return;if(!this.started&&!this.acceptName())return;if(!this.started){this.started=true;this.renderPage();return;}if(this.speaking){this.reveal();return;}if(this.step===this.pages.length-1){this.finish();return;}this.step++;this.renderPage();}
 reveal(){this.speaking=false;this.count=this.chars.length;document.querySelector('#story-text').textContent=I18n.t(this.pages[this.step].text);document.querySelector('#adventure-start').textContent=this.step===this.pages.length-1?'Entrar al mundo · 120 minutos':'Continuar';this.drawFace();}
 tick(dt){if(this.done)return;this.elapsed+=dt;this.clock-=dt;if(this.speaking&&this.clock<=0){const ch=this.chars[this.count++];document.querySelector('#story-text').textContent=this.chars.slice(0,this.count).join('');if(/[^\s.,…!?¿¡:;]/u.test(ch)&&this.count%2===0)Sound.dialogueBlip(this.count);this.clock=/[.!?…]/.test(ch)?.23:/[,;:]/.test(ch)?.1:.028;if(this.count>=this.chars.length)this.reveal();}this.drawFace();}
 drawFace(){
  const p=this.pages[this.step],canvas=document.querySelector('#story-face');
  if(p.portrait==='ivan'){
   // El cartel aprobado es estático: dibujarlo una vez evita repintarlo a 60 Hz.
   const image=this.images.ivan;if(this.posterDrawn||!image.complete||!image.naturalWidth)return;
   const c=canvas.getContext('2d'),scale=image.naturalWidth/1254;
   c.clearRect(0,0,canvas.width,canvas.height);c.imageSmoothingEnabled=true;
   // Preserve the approved face; the newspaper frame and headings are native HTML.
   c.drawImage(image,390*scale,478*scale,480*scale,452*scale,0,0,canvas.width,canvas.height);
   this.posterDrawn=true;return;
  }
  RPGCast.portrait(canvas,this.images[p.portrait],this.speaking,this.elapsed);
 }
 finish(skipArrival=false){if(this.done)return;this.done=true;this.speaking=false;Sound.selectBackground('grassland');this.onEnter(skipArrival);}
};
