/* Conversaciones y paneles dentro de la vista del juego, sin desplazarse abajo. */
window.RoomCompanions=class {
 constructor(){
  const view=document.querySelector('.scene-view');
  view.insertAdjacentHTML('beforeend',`<aside id="question-bubble" class="world-bubble" hidden aria-label="Pregunta de la habitación"><button id="question-fold" class="bubble-fold" aria-expanded="true">−</button><p class="eyebrow" id="question-owner">LA RUEDA PREGUNTA</p><div id="question-content"></div></aside>
  <section id="answer-console" class="world-console" hidden aria-label="Panel de respuestas"><button id="console-close" class="bubble-fold" aria-label="Cerrar panel">×</button><p class="eyebrow">SELLO DE LA PUERTA</p><h2>Tu propuesta</h2><p class="console-note">Usa g = 9.81 m/s². Escribe números sin unidades.</p></section>
  <aside id="paola-dialog" class="paola-dialog" hidden aria-label="Ayuda de Epi Paola"><button id="paola-close" class="bubble-fold" aria-label="Cerrar ayuda">×</button><canvas id="paola-portrait" width="128" height="128" aria-label="Epi Paola hablando"></canvas><div class="paola-words"><p class="eyebrow">EPI PAOLA · TU GUÍA</p><p id="paola-text" aria-hidden="true"></p><span id="paola-announcement" class="sr-only" role="status"></span><button id="paola-skip">Mostrar todo</button></div></aside>
  <aside id="maze-notice" class="maze-notice" hidden role="status"><strong>El laberinto de los ecos</strong><p>Al cruzar el umbral sientes una presencia. El eco de tus pasos parece llegar un instante tarde…</p><p>Cuatro tramos: tres puertas en los primeros y dos puertas en el último. Abre una puerta con clic o E cuando estés cerca. Elegir una puerta equivocada te envía inmediatamente a un calabozo: resuelve otra pregunta para regresar al inicio, conservando las puertas abiertas. No te detengas más de lo necesario. Cada puerta correcta que cruces guarda un punto seguro.</p><button id="maze-understood">Entendido · A explorar</button></aside>
  <div id="chase-indicator" class="chase-indicator" hidden>CUIDADO, ALGUIEN TE PERSIGUE</div><p id="world-toast" class="world-toast" role="status" hidden></p><p id="interaction-hint" class="interaction-hint" hidden></p><small id="camera-hint">Clic en el mundo para mirar · Esc libera · H ayuda</small>`);
  document.querySelector('#question-content').insertAdjacentHTML('beforebegin','<button id="paola-formula-open" type="button" hidden>Paola · Formulario general</button>');
  document.querySelector('#paola-text').insertAdjacentHTML('afterend','<div id="paola-formula-content" hidden></div>');
  document.querySelector('#paola-formula-open').onclick=()=>this.help(true);
  window.addEventListener('astralia:language',()=>{const sheet=document.querySelector('#paola-formula-content');if(!sheet.hidden)PaolaFormulary.render(sheet);});
  const bubble=document.querySelector('#question-content');
  bubble.append(document.querySelector('#roulette-status'),document.querySelector('#problem-card'));
  const panel=document.querySelector('#answer-console');
  for(const id of ['answer-form','answer-feedback','solution-details'])panel.append(document.getElementById(id));
  panel.append(document.querySelector('.source-note'),document.querySelector('#reset-roulette'));
  const credits=document.createElement('details');credits.innerHTML='<summary>Acerca de estos problemas</summary>';credits.append(document.querySelector('.source-note'));panel.append(credits);
  document.querySelector('#question-fold').setAttribute('aria-label','Minimizar o mostrar la pregunta');
  document.querySelector('#roulette-panel').hidden=true;
  view.insertAdjacentHTML('beforeend','<button id="ask-paola" class="paola-bubble" aria-controls="paola-dialog" aria-expanded="false"><canvas id="helper-face" width="48" height="48" aria-hidden="true"></canvas> <b id="helper-name">Epi Paola</b> <small>Una pista · H</small></button>');
  this.paolaPortrait=new Image();this.paolaPortrait.src='assets/cast/paola-b-v1-help.webp';this.josePortrait=new Image();this.josePortrait.src='assets/cast/jose-medieval-portrait.webp';this.portrait=this.paolaPortrait;this.dialogue=null;this.paolaPortrait.onload=()=>this.drawHelpButton();this.josePortrait.onload=()=>this.drawHelpButton();
  document.querySelector('#ask-paola').onclick=()=>this.help();
  document.querySelector('#paola-close').onclick=()=>this.closeHelp();
  document.querySelector('#paola-skip').onclick=()=>{if(this.dialogue?.speaking)this.finishDialogue();else this.closeHelp();document.querySelector('#game').focus({preventScroll:true});};
  document.querySelector('#paola-text').onclick=()=>this.finishDialogue();
  document.querySelector('#console-close').onclick=()=>this.closeConsole();
  document.querySelector('#maze-understood').onclick=()=>{document.querySelector('#maze-notice').hidden=true;document.querySelector('#game').focus({preventScroll:true});};
  document.querySelector('#question-fold').onclick=e=>{const collapsed=bubble.hidden=!bubble.hidden;e.target.textContent=collapsed?'+':'−';e.target.setAttribute('aria-expanded',String(!collapsed));};
  bubble.insertAdjacentHTML('beforeend','<div id="concept-question" hidden><p class="badge" id="concept-level"></p><h3 id="concept-title"></h3><p id="concept-text"></p><p class="concept-instruction">Lee las respuestas en las puertas. Acércate y abre con clic o E.</p></div>');
 }
 load(room,roulette,maze){
  this.chaseIntroLeft=0;document.querySelector('#chase-indicator').classList.remove('chase-intro');
  document.querySelector('#paola-formula-open').hidden=!room.roulette;
  this.room=room;this.roulette=roulette;this.maze=maze;this.consoleOpen=false;this.nearConsole=false;this.toastTime=0;this.lastProblem=null;
  room.guide=null;this.closeHelp();this.portrait=room.rocket?this.josePortrait:this.paolaPortrait;
  document.querySelector('#helper-name').textContent=room.rocket?'José Luis':'Epi Paola';this.drawHelpButton();
  document.querySelector('#paola-dialog .eyebrow').textContent=room.rocket?'JOSÉ LUIS · LÍDER DE IGNITIA':'EPI PAOLA · TU GUÍA';
  document.querySelector('#paola-dialog').setAttribute('aria-label',room.rocket?'Ayuda de José Luis':'Ayuda de Epi Paola');
  document.querySelector('#paola-portrait').setAttribute('aria-label',room.rocket?'José Luis hablando':'Epi Paola hablando');
  for(const id of ['answer-console','paola-dialog','world-toast','chase-indicator'])document.getElementById(id).hidden=true;
  document.querySelector('.scene-view').classList.toggle('has-world-question',!!(room.trial||room.roulette||room.conceptual||room.boss));
  document.querySelector('#question-bubble').hidden=!(room.trial||room.roulette||room.conceptual);
  document.querySelector('#question-owner').textContent=room.conceptual?'EL LABERINTO PREGUNTA':'LA RUEDA PREGUNTA';
  document.querySelector('#roulette-status').hidden=!room.roulette;document.querySelector('#problem-card').hidden=true;
  document.querySelector('#concept-question').hidden=!(room.trial||room.conceptual);this.showRoomNotice(room);
  document.querySelector('#ask-paola').hidden=!(room.trial||room.physics||room.roulette||room.conceptual||room.corridor||room.boss||room.rocket);
  document.querySelector('#question-content').hidden=false;document.querySelector('#question-fold').textContent='−';document.querySelector('#question-fold').setAttribute('aria-expanded','true');
  this.updateConcept();this.updateTrial();
 }

 showRoomNotice(room){
  const notice=document.querySelector('#maze-notice');
  const texts=room.trial?['El puente viejo cruza un cráter. Cinco afirmaciones deciden qué tablones resistirán tu peso.','Lee la afirmación y salta a Verdadero o Falso. Shift para correr, Espacio para saltar. Un error rompe la plataforma; '+(EpikDifficulty.easy?'regresas al último tablón correcto':'regresas al inicio del puente')+' y conservas tus aciertos. Pulsa H si necesitas una pista.']
   :room.physics?['Un sello protege la entrada al bosque del castillo. Actívalo con un proyectil.','Acércate al cañón y pulsa E. Elige y carga una bala; elige 30°, 45° o 60° y calcula la rapidez con los datos del panel. Al acertar el botón se abrirá la verja y aparecerá el puente. H: pista.']
   :room.roulette?['La rueda de la sala elige tu problema de física.','Acércate a la mesa y pulsa el cristal con clic o E. Lee el problema; cuando tengas tu resultado, mira el sello de la puerta y pulsa E para escribirlo. H: pista.']
   :room.conceptual?['Al cruzar el umbral sientes una presencia. El eco de tus pasos parece llegar un instante tarde…','Tres galerías y una última elección: puerta azul o puerta roja. Abre con clic o E. Un error te envía al calabozo; resuélvelo para regresar. Conservas tus aciertos; si caes, vuelves al inicio del puente. Los botones azules congelan a Iván 8 segundos. H: pista.']
   :room.corridor?['Cuidado, el Dr. Eric te está lanzando ecuaciones desde el otro lado.','Esquiva los símbolos moviéndote a los lados. Usa Shift para correr y Espacio para saltar obstáculos y plataformas sobre la lava. Al fondo encontrarás un jardín: habla con el guardián para abrir el paso. H: pista.']
   :room.boss?['El Dr. Eric se sostiene sobre una parábola. Dos láseres pueden cortar sus soportes.','Observa las ecuaciones. Calcula los dos puntos donde se cruzan la recta y la parábola e introdúcelos en los paneles laterales. Evita las pociones y sus charcos. H: pista.']:null;
  notice.hidden=!texts;if(!texts)return;
  notice.querySelector('strong').textContent=room.name;const paragraphs=notice.querySelectorAll('p');paragraphs[0].textContent=texts[0];paragraphs[1].textContent=texts[1];
 }
 revealQuestion(){document.querySelector('#question-content').hidden=false;document.querySelector('#question-fold').textContent='−';document.querySelector('#question-fold').setAttribute('aria-expanded','true');}
 updateTrial(){if(!this.room.trial)return;const t=this.room.approach;document.querySelector('#question-owner').textContent='EL SENDERO PREGUNTA';document.querySelector('#concept-level').textContent=t.finished?'CINCO ACIERTOS':`SALTO ${t.stage+1} / 5`;document.querySelector('#concept-title').textContent='Verdadero o falso';document.querySelector('#concept-text').textContent=t.finished?'Ya puedes seguir el camino hacia el bosque.':t.question.text;document.querySelector('.concept-instruction').textContent='Salta a la plataforma con tu respuesta. Conservas tus aciertos; '+(EpikDifficulty.easy?'si caes, vuelves al último tablón correcto.':'si caes, vuelves al inicio del puente.');}
 updateConcept(){if(!this.maze)return;document.querySelector('.concept-instruction').textContent=this.maze.question.branch?'Puerta azul o puerta roja… la elección es tuya. Una vez que cruces, la historia habrá cambiado.':'Lee las respuestas en las puertas. Acércate y abre con clic o E.';const stage=Math.min(this.maze.stage,CONCEPT_QUESTIONS.length-1),q=this.maze.question;document.querySelector('#concept-level').textContent=this.maze.dungeon?'CALABOZO · DOS SELLOS':`TRAMO ${stage+1} / ${CONCEPT_QUESTIONS.length}`;document.querySelector('#concept-title').textContent=q.title;document.querySelector('#concept-text').textContent=q.text;}
 facing(player,target,renderer,opened,maxDistance=2.2){if(!target)return false;const dx=target.x-player.x,dy=target.y-player.y,d=Math.hypot(dx,dy),angle=Math.atan2(dy,dx);return d<maxDistance&&Math.cos(angle-player.angle)>.90&&renderer.cast(this.room,player.x,player.y,angle,opened).distance+.1>=d;}
 tick(dt,player,renderer,opened,playing){
  this.tickDialogue(dt);
  document.querySelector('#roulette-status').hidden=!this.room.roulette||!!this.roulette.current;
  if(this.room.roulette&&this.roulette.current!==this.lastProblem){this.lastProblem=this.roulette.current;this.revealQuestion();}
  this.nearConsole=!!(playing&&this.room.answerSeal&&this.facing(player,this.room.answerSeal,renderer,opened));
  if(this.consoleOpen&&(!this.nearConsole||!this.roulette.current))this.closeConsole();
  this.activeDoor=null;
  if(this.maze&&playing){const hit=renderer.cast(this.room,player.x,player.y,player.angle,false);if(hit.tile===2&&hit.distance<1.8){const d=this.maze.doorAt(hit.cx,hit.cy);if(d?.stage===this.maze.stage)this.activeDoor=d;}}
  const hint=document.querySelector('#interaction-hint');hint.hidden=!playing||!(this.room.roulette||this.room.conceptual||(!this.room.physics));
  hint.textContent=this.room.conceptual?(this.maze.finished?'Sigue por la salida elegida':this.activeDoor?`Clic o E · Abrir ${this.activeDoor.letter}: ${this.activeDoor.text}`:'Acércate a una puerta'):this.room.roulette?(this.nearConsole?(this.roulette.current?'Clic o E · Responder al sello':'Primero gira la rueda'):'Clic o E junto a la mesa · Girar la ruleta'):this.room.corridor&&this.guardian?.arrived?(this.guardian.solved?'La puerta se abre al completar los tres sellos':'Pisa la baldosa · Escucha y responde'):this.room.corridor&&player.x<35?'Salta entre las plataformas · Shift corre · Espacio salta':'Clic o E cerca de la puerta · Abrir';
  if(this.maze?.nearFreezeButton(player,renderer)&&playing){hint.hidden=false;hint.textContent=this.maze.freezeUsed?'BOTÓN AGOTADO':'Clic o E · Congelar a Iván · 8 s';}
  const chase=document.querySelector('#chase-indicator');
  if(this.maze?.chasing&&!this.maze.finished&&!this.maze.caught&&playing&&!this.chaseAnnounced){this.chaseAnnounced=true;this.chaseIntroLeft=3.5;chase.classList.add('chase-intro');}
  if(playing&&this.chaseIntroLeft>0){this.chaseIntroLeft=Math.max(0,this.chaseIntroLeft-dt);if(!this.chaseIntroLeft)chase.classList.remove('chase-intro');}
  chase.hidden=!this.maze?.chasing||this.maze.finished||this.maze.caught;chase.textContent=this.maze?.freezeLeft>0?`IVÁN CONGELADO · ${Math.ceil(this.maze.freezeLeft)} s`:this.maze?.returnGrace&&this.maze.grace>0?`IVÁN ESPERA · ${Math.ceil(this.maze.grace)} s PARA ALEJARTE`:'CUIDADO, ALGUIEN TE PERSIGUE';
  if(this.toastTime>0){this.toastTime-=dt;if(this.toastTime<=0)document.querySelector('#world-toast').hidden=true;}
 }
 openConsole(){if(!this.nearConsole||!this.roulette.current)return false;window.dispatchEvent(new Event('astralia:ui-open'));this.consoleOpen=true;document.querySelector('#answer-console').hidden=false;document.querySelector('#answer-fields input')?.focus({preventScroll:true});return true;}
 closeConsole(){this.consoleOpen=false;const panel=document.querySelector('#answer-console');if(panel.contains(document.activeElement)){document.activeElement.blur();document.querySelector('#game').focus({preventScroll:true});}panel.hidden=true;}
 help(formulas=false){
  if(formulas&&!this.room?.roulette)return;
  if(this.canHelp&&!this.canHelp())return;if(!this.room||!(this.room.trial||this.room.physics||this.room.roulette||this.room.conceptual||this.room.corridor||this.room.boss||this.room.rocket))return;window.dispatchEvent(new Event('astralia:help-open'));
  const q=this.roulette?.current,text=formulas?'Aquí tienes un formulario general. Identifica tus datos, elige las ecuaciones y despeja lo que te piden.':this.room.trial?this.room.approach.question.hint+' Mira las dos plataformas antes de saltar.':this.room.rocket?'Aquí José Luis. Prueba una trayectoria en la consola: ajusta rapidez y ángulo para acercarte a Eric. Después afina el retraso y el tiempo de vuelo. ¡Los dos cohetes deben llegar al mismo punto al mismo tiempo!':this.room.corridor&&this.guardian?.arrived?this.guardian.question.hint:this.room.corridor?'¡Ojo! Esquiva las ecuaciones y busca tu siguiente apoyo antes de saltar. ¡Tú puedes!':this.room.boss?'¡Vamos a cortar su soporte! Iguala las dos ecuaciones y resuelve para x. Sustituye cada raíz en la recta para hallar y. Programa el punto con x negativa en el láser izquierdo y el de x positiva en el derecho. Acércate a cada láser y pulsa E, o toca para interactuar. ¡No te quedes sobre los charcos! La máquina suelta chispas cada 20–40 segundos. Recoge una para aturdir a Eric 15 segundos; otra reinicia ese tiempo.':this.room.physics?cannonTargetHint(this.room.physics):this.room.roulette?(q?`${q.hint} Cuando tengas tu resultado, mira el sello de la puerta y pulsa E para escribir tu respuesta.`:'Pulsa el cristal de la mesa central para elegir un problema. Luego separa los datos de lo que te piden. La respuesta se escribe directamente en el sello de la puerta.'):this.maze.question.hint+' Elige la puerta que corresponda.';
  // Reading guide dialogue must not release the camera or clear held movement.
  this.dialogue={source:text,text:I18n.t(text),chars:[...I18n.t(text)],index:0,clock:0,elapsed:0,speaking:true};
  document.querySelector('#paola-dialog').classList.toggle('formulary-open',formulas);
  document.querySelector('#paola-formula-content').hidden=!formulas;
  if(formulas)PaolaFormulary.render(document.querySelector('#paola-formula-content'));
  document.querySelector('#paola-text').textContent='';document.querySelector('#paola-announcement').textContent=text;document.querySelector('#paola-skip').textContent='Mostrar todo';document.querySelector('#paola-dialog').hidden=false;document.querySelector('#ask-paola').setAttribute('aria-expanded','true');Sound.tone(420,.08,'triangle',.09);document.querySelector('#game').focus({preventScroll:true});
 }
 closeHelp(){if(document.querySelector('#paola-dialog').contains(document.activeElement))document.querySelector('#game').focus({preventScroll:true});document.querySelector('#paola-formula-content').hidden=true;document.querySelector('#paola-dialog').classList.remove('formulary-open');this.dialogue=null;document.querySelector('#paola-dialog').hidden=true;document.querySelector('#ask-paola')?.setAttribute('aria-expanded','false');}
 finishDialogue(){if(!this.dialogue)return;this.dialogue.index=this.dialogue.chars.length;this.dialogue.speaking=false;document.querySelector('#paola-text').textContent=this.dialogue.text;document.querySelector('#paola-skip').textContent='Cerrar diálogo';this.drawPortrait(0);}
 tickDialogue(dt){
  const d=this.dialogue;if(!d||document.querySelector('#paola-dialog').hidden)return;d.elapsed+=dt;d.clock-=dt;
  if(d.speaking&&d.clock<=0){const char=d.chars[d.index++];document.querySelector('#paola-text').textContent=d.chars.slice(0,d.index).join('');if(/[^\s.,…:;!?¿¡]/u.test(char)&&d.index%2===0)Sound.dialogueBlip(d.index);d.clock=/[.!?…]/.test(char)?.22:/[,;:]/.test(char)?.1:.028;if(d.index>=d.chars.length)this.finishDialogue();}
  this.drawPortrait(d.speaking?Math.floor(d.elapsed/.13)%2:0);
 }
 drawHelpButton(){const canvas=document.querySelector('#helper-face');if(canvas)RPGCast.portrait(canvas,this.portrait,false,0);}
 drawPortrait(frame){RPGCast.portrait(document.querySelector('#paola-portrait'),this.portrait,!!this.dialogue?.speaking,this.dialogue?.elapsed||0);}
 toast(text){document.querySelector('#world-toast').textContent=text;document.querySelector('#world-toast').hidden=false;this.toastTime=8;}
};
