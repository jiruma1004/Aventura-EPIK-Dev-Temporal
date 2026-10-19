/* Práctica opcional antes del primer reto. El reloj permanece detenido. */
window.ControlTutorial=class {
 constructor({isTouch,onDone}){
  this.isTouch=isTouch;this.onDone=onDone;this.active=false;this.step=0;this.start=null;this.lookStart=null;
  this.steps=['move','run','look','jump','interact'];
  document.body.insertAdjacentHTML('beforeend',`<dialog id="control-tutorial-choice" class="control-tutorial-choice" aria-labelledby="control-tutorial-title">
   <div class="tutorial-paola"><canvas width="145" height="145" aria-label="Epi Paola"></canvas><span data-tutorial-guide-label>EPI PAOLA · PRÁCTICA OPCIONAL</span></div>
   <div><p class="eyebrow" data-tutorial-before>ANTES DEL PRIMER UMBRAL</p><h2 id="control-tutorial-title">¿Practicamos los controles?</h2><p data-tutorial-choice-copy></p><div class="tutorial-choice-actions"><button id="control-tutorial-start" class="primary">Practicar controles</button><button id="control-tutorial-skip">Comenzar aventura</button></div><small data-tutorial-clock>El reloj seguirá detenido durante la práctica.</small></div>
  </dialog>`);
  document.querySelector('.scene-view').insertAdjacentHTML('beforeend',`<aside id="control-tutorial" class="control-tutorial" hidden aria-live="polite">
   <div class="tutorial-progress"><span data-tutorial-counter></span><span class="tutorial-dots" aria-hidden="true"></span></div>
   <p class="eyebrow" data-tutorial-training>ENTRENAMIENTO DE PAOLA</p><h3 data-tutorial-title></h3><p data-tutorial-copy></p>
   <div class="tutorial-keys" aria-hidden="true"><span>W</span><span>A</span><span>S</span><span>D</span><span class="wide">Shift · correr</span></div>
   <div class="tutorial-status"><span class="tutorial-pulse" aria-hidden="true"></span><b data-tutorial-status>Hazlo una vez para continuar</b></div>
   <div class="tutorial-finish" hidden><p data-tutorial-help></p><button id="control-tutorial-finish" class="primary">Comenzar primer reto</button></div>
   <button id="control-tutorial-cancel" class="tutorial-cancel">Omitir tutorial</button>
  </aside>`);
  this.choice=document.querySelector('#control-tutorial-choice');this.panel=document.querySelector('#control-tutorial');
  this.paola=new Image();this.paola.onload=()=>RPGCast.portrait(this.choice.querySelector('canvas'),this.paola,false,0);this.paola.src='assets/cast/paola-b-v1-portrait.webp';
  document.querySelector('#control-tutorial-start').onclick=()=>this.begin();
  document.querySelector('#control-tutorial-skip').onclick=()=>this.finish(false);
  document.querySelector('#control-tutorial-cancel').onclick=()=>this.finish(false);
  document.querySelector('#control-tutorial-finish').onclick=()=>this.finish(true);
  this.choice.addEventListener('cancel',e=>e.preventDefault());
  window.addEventListener('astralia:language',()=>this.render());
  this.render();
 }
 get touch(){return !!this.isTouch();}
 copy(){
  const en=window.I18n?.lang==='en',touch=this.touch;
  if(en)return {
   choice:touch?'Try the on-screen joystick, camera gestures and action buttons before the first challenge.':'Try movement, mouse camera, jumping and interaction before the first challenge.',
   title:'Practice the controls?',guide:'EPI PAOLA · OPTIONAL PRACTICE',before:'BEFORE THE FIRST THRESHOLD',training:'PAOLA’S TRAINING',clock:'The clock will remain paused during practice.',run:'Shift · sprint',start:'Practice controls',skip:'Start adventure',cancel:'Skip tutorial',finish:'Start first challenge',waiting:'Do it once to continue',done:'Good! Control learned.',
   help:touch?'You are ready. Tap Paola whenever you need a hint. The adventure clock starts when you continue.':'You are ready. Press H to ask Paola for a hint; Esc releases the mouse. The adventure clock starts when you continue.',
   steps:touch?{
    move:['Move with the joystick','Move the small joystick on the left.'],run:['Try running','Tap Run, then move with the joystick. Tap Run again to return to walking.'],look:['Look around','Swipe on the right half of the scene to move the camera.'],jump:['Practice a jump','Tap ↟ Jump. You can keep moving with another finger.'],interact:['Use an object','Tap Use. This button opens doors, consoles and mechanisms.']
   }:{
    move:['Walk a few steps','Use W A S D to move.'],run:['Try running','Hold Shift while moving with W A S D. Release Shift to walk again.'],look:['Look around','Click the world and move the mouse. Press Esc to release the pointer.'],jump:['Practice a jump','Press Space. You cannot jump again until you land.'],interact:['Use an object','Press E. This key opens doors, consoles and mechanisms.']
   }
  };
  return {
   choice:touch?'Prueba la palanca de pantalla, el movimiento de cámara y los botones antes del primer reto.':'Prueba el movimiento, la cámara con ratón, el salto y la interacción antes del primer reto.',
   title:'¿Practicamos los controles?',guide:'EPI PAOLA · PRÁCTICA OPCIONAL',before:'ANTES DEL PRIMER UMBRAL',training:'ENTRENAMIENTO DE PAOLA',clock:'El reloj seguirá detenido durante la práctica.',run:'Shift · correr',start:'Practicar controles',skip:'Comenzar aventura',cancel:'Omitir tutorial',finish:'Comenzar primer reto',waiting:'Hazlo una vez para continuar',done:'¡Muy bien! Control aprendido.',
   help:touch?'Ya estás listo. Toca a Paola cuando necesites una pista. El reloj de la aventura comenzará al continuar.':'Ya estás listo. Pulsa H para pedirle una pista a Paola; Esc libera el ratón. El reloj de la aventura comenzará al continuar.',
   steps:touch?{
    move:['Muévete con la bolita','Mueve la palanca pequeña de la izquierda.'],run:['Prueba correr','Toca Correr y muévete con la bolita. Toca Correr otra vez para volver a caminar.'],look:['Mira a tu alrededor','Desliza un dedo en la mitad derecha de la escena para mover la cámara.'],jump:['Practica un salto','Toca ↟ Saltar. Puedes seguir moviéndote con otro dedo.'],interact:['Usa un objeto','Toca Usar. Este botón abre puertas, consolas y mecanismos.']
   }:{
    move:['Camina unos pasos','Usa W A S D para moverte.'],run:['Prueba correr','Mantén Shift mientras te mueves con W A S D. Suelta Shift para caminar otra vez.'],look:['Mira a tu alrededor','Haz clic en el mundo y mueve el ratón. Pulsa Esc para liberar el puntero.'],jump:['Practica un salto','Pulsa Espacio. No podrás volver a saltar hasta tocar el suelo.'],interact:['Usa un objeto','Pulsa E. Esta tecla abre puertas, consolas y mecanismos.']
   }
  };
 }
 offer(player){
  if(this.active||this.choice.open)return;this.saved={...player};this.notice=document.querySelector('#maze-notice');this.noticeWasHidden=this.notice.hidden;this.notice.hidden=true;
  document.querySelector('#question-bubble').hidden=true;this.render();this.choice.showModal();
 }
 begin(){
  if(this.choice.open)this.choice.close();this.active=true;this.step=0;this.start=null;this.lookStart=null;
  document.documentElement.classList.add('control-tutorial-active');this.panel.hidden=false;this.panel.classList.remove('step-complete');this.render();document.querySelector('#game').focus({preventScroll:true});
 }
 current(){return this.steps[this.step]||'finish';}
 mark(action){
  if(!this.active||this.current()!==action||this.panel.classList.contains('step-complete'))return false;
  this.panel.classList.add('step-complete');this.panel.querySelector('[data-tutorial-status]').textContent=this.copy().done;
  window.setTimeout(()=>{if(!this.active||this.current()!==action)return;this.step++;this.start=null;this.lookStart=null;this.panel.classList.remove('step-complete');if(this.step>=this.steps.length)window.dispatchEvent(new Event('astralia:ui-open'));this.render();},360);
  return true;
 }
 tick(player,sprinting=false){
  if(!this.active)return;
  // La práctica sucede en el terreno seguro, antes del cráter.
  player.x=Math.max(1.35,Math.min(3.85,player.x));player.y=Math.max(1.25,Math.min(6.6,player.y));
  const current=this.current();
  if(current==='move'){
   this.start??={x:player.x,y:player.y};if(Math.hypot(player.x-this.start.x,player.y-this.start.y)>.62)this.mark('move');
  }else if(current==='run'){
   this.start??={x:player.x,y:player.y};
   if(sprinting&&Math.hypot(player.x-this.start.x,player.y-this.start.y)>.15)this.mark('run');
   if(!sprinting)this.start={x:player.x,y:player.y};
  }else if(current==='look'){
   this.lookStart??={angle:player.angle,pitch:player.pitch||0};
   const turn=Math.atan2(Math.sin(player.angle-this.lookStart.angle),Math.cos(player.angle-this.lookStart.angle));
   if(Math.abs(turn)>.22||Math.abs((player.pitch||0)-this.lookStart.pitch)>.07)this.mark('look');
  }
 }
 finish(completed){
  if(this.choice.open)this.choice.close();this.active=false;this.panel.hidden=true;document.documentElement.classList.remove('control-tutorial-active');
  if(this.notice)this.notice.hidden=this.noticeWasHidden;document.querySelector('#question-bubble').hidden=false;
  this.onDone({completed,saved:this.saved});
 }
 render(){
  const c=this.copy(),touch=this.touch,finished=this.step>=this.steps.length;
  document.querySelector('#control-tutorial-title').textContent=c.title;document.querySelector('[data-tutorial-guide-label]').textContent=c.guide;document.querySelector('[data-tutorial-before]').textContent=c.before;document.querySelector('[data-tutorial-clock]').textContent=c.clock;document.querySelector('[data-tutorial-training]').textContent=c.training;this.panel.querySelector('.tutorial-keys .wide').textContent=c.run;
  document.querySelector('[data-tutorial-choice-copy]').textContent=c.choice;
  document.querySelector('#control-tutorial-start').textContent=c.start;document.querySelector('#control-tutorial-skip').textContent=c.skip;
  document.querySelector('#control-tutorial-cancel').textContent=c.cancel;document.querySelector('#control-tutorial-finish').textContent=c.finish;
  if(!this.panel)return;
  this.panel.dataset.step=this.current();this.panel.classList.toggle('touch-instructions',touch);this.panel.querySelector('.tutorial-keys').hidden=touch||!['move','run'].includes(this.current());
  this.panel.querySelector('[data-tutorial-counter]').textContent=finished?(window.I18n?.lang==='en'?'READY':'LISTO'):`${this.step+1} / ${this.steps.length}`;
  this.panel.querySelector('.tutorial-dots').textContent=this.steps.map((_,i)=>i<this.step?'◆':i===this.step?'◇':'·').join(' ');
  this.panel.querySelector('[data-tutorial-title]').textContent=finished?(window.I18n?.lang==='en'?'Training complete':'Tutorial completado'):c.steps[this.current()][0];
  this.panel.querySelector('[data-tutorial-copy]').textContent=finished?'':c.steps[this.current()][1];
  this.panel.querySelector('[data-tutorial-status]').textContent=c.waiting;
  this.panel.querySelector('.tutorial-status').hidden=finished;this.panel.querySelector('.tutorial-finish').hidden=!finished;this.panel.querySelector('[data-tutorial-help]').textContent=c.help;
  document.querySelector('#control-tutorial-cancel').hidden=finished;
 }
};
