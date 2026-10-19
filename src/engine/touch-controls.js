/* Independent pointer IDs let movement, camera and jump work simultaneously.
   Touch axes never write into the keyboard's Set; cancelling one cannot stop the other. */
window.TouchControls = class {
 constructor(canvas,{canUse,jump,interact,releaseCamera}) {
  this.canvas=canvas;this.canUse=canUse;this.releaseCamera=releaseCamera;
  this.forward=0;this.strafe=0;this.sprinting=false;this.pointer=null;this.enabled=false;this.active=false;
  this.media=matchMedia('(any-pointer: coarse)');
  const toolbar=document.querySelector('.controls');
  toolbar.insertAdjacentHTML('beforeend',`<label class="touch-mode-label" data-no-translate> <span>Controles</span> <select id="touch-mode" aria-label="Modo de controles"><option value="auto">Automático</option><option value="touch">Táctil</option><option value="desktop">Teclado / ratón</option></select></label>`);
  this.mode=document.querySelector('#touch-mode');
  try{const saved=localStorage.getItem('epik-controls');if(['auto','touch','desktop'].includes(saved))this.mode.value=saved;}catch{}
  document.querySelector('.scene-view').insertAdjacentHTML('beforeend',`<div id="touch-controls" hidden data-no-translate>
   <div id="touch-stick" role="group" aria-label="Joystick de movimiento"><span class="stick-ring"></span><span class="stick-knob"></span><small>Mover</small></div>
   <span class="touch-look-hint">Desliza a la derecha para mirar</span>
   <div class="touch-actions"><button id="touch-run" type="button" aria-pressed="false">Correr</button><button id="touch-use" type="button">Usar</button><button id="touch-jump" type="button">↟ Saltar</button></div>
  </div>`);
  this.root=document.querySelector('#touch-controls');this.stick=document.querySelector('#touch-stick');this.knob=this.stick.querySelector('.stick-knob');this.run=document.querySelector('#touch-run');
  const usable=()=>this.enabled&&this.active&&this.canUse();
  this.stick.addEventListener('pointerdown',e=>{
   if(!usable()||this.pointer!==null||e.button!==0)return;
   e.preventDefault();this.pointer=e.pointerId;this.stick.setPointerCapture(e.pointerId);this.move(e);
  });
  this.stick.addEventListener('pointermove',e=>{if(e.pointerId===this.pointer){if(usable())this.move(e);else this.reset();}});
  for(const event of ['pointerup','pointercancel','lostpointercapture'])this.stick.addEventListener(event,e=>{if(e.pointerId===this.pointer)this.stopStick();});
  const bind=(id,action)=>{
   const button=document.querySelector(id);
   button.addEventListener('pointerdown',e=>{if(e.button!==0||!usable())return;e.preventDefault();button.setPointerCapture(e.pointerId);action();});
   // Keyboard/assistive activation still works; pointer-generated clicks do not repeat actions.
   button.addEventListener('click',e=>{if(e.detail===0&&!e.pointerType&&usable())action();});
  };
  bind('#touch-jump',jump);bind('#touch-use',interact);
  bind('#touch-run',()=>{this.sprinting=!this.sprinting;this.run.setAttribute('aria-pressed',String(this.sprinting));});
  this.mode.addEventListener('change',()=>{try{localStorage.setItem('epik-controls',this.mode.value);}catch{}this.releaseCamera();this.detect();});
  this.media.addEventListener('change',()=>this.detect());
  window.addEventListener('blur',()=>this.reset());
  window.addEventListener('resize',()=>this.reset());
  document.addEventListener('visibilitychange',()=>this.reset());
  window.addEventListener('astralia:ui-open',()=>this.reset());
  window.addEventListener('astralia:language',()=>this.translate());
  this.translate();this.detect();
 }
 detect(){
  this.enabled=this.mode.value==='touch'||(this.mode.value==='auto'&&(this.media.matches||navigator.maxTouchPoints>0));
  document.documentElement.classList.toggle('touch-mode',this.enabled);this.reset();this.sync();
 }
 translate(){
  const en=window.I18n?.lang==='en';
  this.mode.previousElementSibling.textContent=en?'Controls':'Controles';
  ['Auto',en?'Touch':'Táctil',en?'Keyboard / mouse':'Teclado / ratón'].forEach((s,i)=>this.mode.options[i].textContent=s);
  this.mode.setAttribute('aria-label',en?'Control mode':'Modo de controles');
  this.stick.setAttribute('aria-label',en?'Movement joystick':'Joystick de movimiento');
  this.stick.querySelector('small').textContent=en?'Move':'Mover';
  this.root.querySelector('.touch-look-hint').textContent=en?'Swipe on the right to look':'Desliza a la derecha para mirar';
  this.run.textContent=en?'Run':'Correr';document.querySelector('#touch-use').textContent=en?'Use':'Usar';document.querySelector('#touch-jump').textContent=en?'↟ Jump':'↟ Saltar';
 }
 move(e){
  const r=this.stick.getBoundingClientRect(),radius=r.width*.32;
  let x=(e.clientX-r.left-r.width/2)/radius,y=(e.clientY-r.top-r.height/2)/radius;
  const length=Math.hypot(x,y);if(length>1){x/=length;y/=length;}
  const amount=Math.max(0,(Math.min(length,1)-.12)/.88),scale=length?amount/Math.min(length,1):0;
  this.strafe=x*scale;this.forward=-y*scale;this.knob.style.transform=`translate(${x*radius}px,${y*radius}px)`;
 }
 stopStick(){const id=this.pointer;this.pointer=null;this.forward=0;this.strafe=0;this.knob.style.transform='';if(id!==null&&this.stick.hasPointerCapture(id))this.stick.releasePointerCapture(id);}
 reset(){this.stopStick();this.sprinting=false;this.run.setAttribute('aria-pressed','false');}
 sync(){const active=this.enabled&&this.canUse();if(this.active!==active){this.active=active;this.root.hidden=!active;if(!active)this.reset();}return active;}
};
