/* Créditos editoriales: aportaciones declaradas por el autor, independientes de la nota. */
window.EpikCredits=class {
 constructor(){
  this.entries=[
   ['Idea original, diseño y dirección del proyecto','Original concept, design and project direction',['Jesús Iván Ruiz Martínez']],
   ['Diseño de la aventura y aportación de ideas','Adventure design and idea development',['Eric Fransico Chavez']],
   ['Colaboración creativa y seguimiento del desarrollo','Creative collaboration and development follow-up',['Leidy Paola Quiroga']],
   ['Comunidad estudiantil Ignitia','Ignitia student community',['José Luis Henriquez Mercado · Líder del grupo estudiantil Ignitia','Grupo estudiantil Ignitia']],
   ['Coordinación de la unidad de formación y agradecimiento','Course unit coordination and acknowledgement',['Luis Manuel Rico Gutiérrez · Coordinador de la unidad de formación'], 'Por permitir incorporar esta aventura como actividad de aprendizaje.','For making this adventure part of the learning activities.'],
   ['Agradecimiento por su visto bueno','Acknowledgement for her approval',['Angélica Sanchez · Directora del Departamento de Ciencias'],'Por dar su visto bueno a esta iniciativa educativa.','For approving this educational initiative.'],
   ['Coordinación del área de Ciencias y pruebas del juego','Sciences area coordination and game testing',['Karla Lucia · Coordinadora del Área de Ciencias']],
   ['Pruebas y retroalimentación','Testing and feedback',['Rodrigo Gamboa Goñi']],
   ['Aportación musical','Music contribution',['Pablo Alejandro']],
   ['Herramientas de apoyo al desarrollo','Development tools',['Codex · OpenAI'],'Asistencia en programación, iteración y pruebas, bajo la dirección del creador del proyecto.','Assistance with programming, iteration and testing, under the direction of the project creator.']
  ];
  document.querySelector('.scene-view').insertAdjacentHTML('beforeend',`<section id="epik-credits" hidden aria-labelledby="credits-title"><figure><img id="credits-photo" alt="EPI Centro" decoding="async"><figcaption>EPI Centro</figcaption></figure><div id="credits-bloopers" hidden></div><div class="credits-panel"><header><small>AVENTURA EPIK · IGNITIA</small><h2 id="credits-title" tabindex="-1"></h2></header><article id="credits-card" aria-live="polite" aria-atomic="true"><div class="credits-ornament" aria-hidden="true">✦</div><div id="credits-list"></div><p id="credits-player"></p></article><nav class="credits-navigation" aria-label="Créditos"><span id="credits-progress"></span><button id="credits-close" class="primary" hidden></button></nav></div></section>`);
  this.el=document.querySelector('#epik-credits');this.step=0;this.inputAfter=0;
  document.querySelector('#credits-close').onclick=()=>{if(this.step===this.entries.length+1&&performance.now()>=this.inputAfter)this.close(true)};
  window.addEventListener('astralia:language',()=>{if(!this.el.hidden)this.render()});
 }
 // One clock controls cards and bloopers. Hidden tabs and asset loading pause the reel.
 tick(dt){
  if(this.el.hidden||document.hidden||this.phase==='final')return;
  if(this.phase==='intro'){
   this.introTime+=Math.max(0,dt);
   if(this.introTime<5)return;
   this.phase='reel';this.step=1;this.el.classList.add('with-bloopers');
   const host=document.querySelector('#credits-bloopers');host.hidden=false;
   this.bloopers??=new EpikBloopers();this.bloopers.open(()=>{
    if(this.el.hidden||this.phase!=='reel')return;
    this.phase='final';this.step=this.entries.length+1;host.hidden=true;this.el.classList.remove('with-bloopers');this.inputAfter=performance.now()+500;this.render();
   },{host});this.render();return;
  }
  this.bloopers.tick(dt);
  if(this.phase!=='reel')return;
  const next=1+this.bloopers.index*2+(this.bloopers.time>=7?1:0);
  if(next!==this.step){this.step=next;this.render();}
 }
 render(){
  const en=I18n.lang==='en',say=(es,english)=>en?english:es,final=this.step===this.entries.length+1;
  document.querySelector('#credits-title').textContent=say('Agradecimientos','Acknowledgements');
  const list=document.querySelector('#credits-list');list.replaceChildren();
  const section=document.createElement('section'),title=document.createElement('h3');section.append(title);
  if(this.step===0){
   title.textContent=say('Gracias por hacer posible esta aventura','Thank you for making this adventure possible');
   const p=document.createElement('p');p.className='credits-note';p.textContent=say('Una idea que creció entre conversaciones, creatividad y ganas de enseñar de otra manera.','An idea that grew through conversation, creativity and a desire to teach differently.');section.append(p);
  }else if(!final){
   const [es,english,names,note,noteEn]=this.entries[this.step-1];title.textContent=say(es,english);
   for(const name of names){
    const translated=en?name.replace('Responsable del grupo estudiantil','Student group lead,').replace('Coordinador de la unidad de formación','Course unit coordinator').replace('Directora del Departamento de Ciencias','Director of the Sciences Department').replace('Coordinadora del Área de Ciencias','Sciences Area Coordinator').replace('Grupo estudiantil Ignitia','Ignitia student group'):name;
    const [person,...role]=translated.split(' · '),p=document.createElement('p');p.className='credits-name';p.textContent=person;section.append(p);
    if(role.length){const small=document.createElement('small');small.textContent=role.join(' · ');section.append(small);}
   }
   if(note){const p=document.createElement('small');p.className='credits-note';p.textContent=say(note,noteEn);section.append(p);}
  }
  if(!final)list.append(section);
  const player=document.querySelector('#credits-player');player.hidden=!final;player.textContent=say('Y a ti, por jugar, aprender y seguir intentando.','And to you, for playing, learning and trying again.');
  const close=document.querySelector('#credits-close');close.hidden=!final;close.textContent=say('Finalizar','Finish');
  document.querySelector('#credits-progress').textContent=`${this.step+1} / ${this.entries.length+2}`;
  const card=document.querySelector('#credits-card');card.getAnimations().forEach(a=>a.cancel());
  if(!matchMedia('(prefers-reduced-motion: reduce)').matches)card.animate([{opacity:0,transform:'translateY(10px)'},{opacity:1,transform:'translateY(0)'}],{duration:450,easing:'ease-out'});
  card.scrollTop=0;
  if(final)close.focus({preventScroll:true});
 }
 open(onClose){
  if(!this.el.hidden)return;
  this.onClose=onClose;this.phase='intro';this.introTime=0;this.step=0;this.el.classList.remove('with-bloopers');document.querySelector('#credits-bloopers').hidden=true;this.inputAfter=performance.now()+450;this.render();
  const photo=document.querySelector('#credits-photo');if(!photo.getAttribute('src'))photo.src='assets/cinematics/epi-centro-credits.webp';
  this.el.hidden=false;this.last=performance.now();
  const frame=now=>{if(this.el.hidden)return;this.tick(Math.min(.05,(now-this.last)/1000));this.last=now;if(!this.el.hidden)this.raf=requestAnimationFrame(frame)};this.raf=requestAnimationFrame(frame);
  window.dispatchEvent(new Event('astralia:ui-open'));Sound.selectBackground('ceremony');document.querySelector('#credits-title').focus({preventScroll:true});
 }
 close(notify=false){
  const callback=notify&&!this.el.hidden?this.onClose:null;
  this.onClose=null;this.el.hidden=true;cancelAnimationFrame(this.raf);this.bloopers?.close();
  document.querySelector('#credits-card').getAnimations().forEach(a=>a.cancel());callback?.();
 }
};
