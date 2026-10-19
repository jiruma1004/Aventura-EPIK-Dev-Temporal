/* Ratón capturado en escritorio; arrastre solo para pantallas táctiles. */
window.FirstPersonControls=class {
 constructor(canvas,{canPlay,look,click,clearKeys}){
  this.canvas=canvas;this.canPlay=canPlay;this.look=look;this.click=click;this.clearKeys=clearKeys;this.drag=null;this.skipClick=false;this.fallback=false;
  document.addEventListener('pointerlockchange',()=>{this.clearKeys();this.updateHint();});
  document.addEventListener('pointerlockerror',()=>this.useFallback());
  document.addEventListener('mousemove',e=>{if(document.pointerLockElement===canvas&&this.canPlay())this.look(e.movementX,e.movementY);});
  canvas.addEventListener('pointerdown',e=>{
   if(!this.canPlay()||e.button!==0)return;canvas.focus({preventScroll:true});this.skipClick=false;
   if(e.pointerType==='touch'){if(this.drag)return;const r=canvas.getBoundingClientRect();if(document.documentElement.classList.contains('touch-mode')&&e.clientX<r.left+r.width/2)return;this.drag={id:e.pointerId,x:e.clientX,y:e.clientY,moved:0};canvas.setPointerCapture(e.pointerId);}
  });
  canvas.addEventListener('pointermove',e=>{
   if(!this.canPlay())return;
   if(this.drag&&e.pointerId===this.drag.id){const dx=e.clientX-this.drag.x,dy=e.clientY-this.drag.y;this.drag.moved+=Math.hypot(dx,dy);if(this.drag.moved>5){this.look(dx,dy);this.skipClick=true;}this.drag.x=e.clientX;this.drag.y=e.clientY;}
   else if(this.fallback&&e.pointerType==='mouse'&&document.activeElement===canvas&&document.pointerLockElement!==canvas)this.look(e.movementX,e.movementY);
  });
  for(const event of ['pointerup','pointercancel','lostpointercapture'])canvas.addEventListener(event,e=>{if(this.drag?.id===e.pointerId){this.drag=null;if(event!=='pointerup')this.skipClick=true;}});
  canvas.addEventListener('click',e=>{
   if(!this.canPlay()||this.skipClick)return;
   const locked=document.pointerLockElement===canvas,r=canvas.getBoundingClientRect();
   const x=locked?canvas.width/2:(e.clientX-r.left)*canvas.width/r.width,y=locked?canvas.height/2:(e.clientY-r.top)*canvas.height/r.height;
   canvas.focus({preventScroll:true});const handled=this.click(x,y);
   if(!handled&&!locked&&e.pointerType!=='touch')this.capture();
  });
  window.addEventListener('blur',()=>this.release());
  document.addEventListener('keydown',e=>{if(e.key==='Escape'&&this.fallback)this.release();});
 }
 capture(){
  if(!this.canPlay())return;
  if(!this.canvas.requestPointerLock){this.useFallback();return;}
  try{const request=this.canvas.requestPointerLock();request?.catch(()=>this.useFallback());}catch(e){this.useFallback();}
 }
 useFallback(){this.fallback=true;this.canvas.focus({preventScroll:true});this.updateHint();}
 release(){this.drag=null;this.fallback=false;this.clearKeys();if(document.pointerLockElement===this.canvas)document.exitPointerLock();this.updateHint();}
 updateHint(){const hint=document.querySelector('#camera-hint');if(hint)hint.textContent=document.pointerLockElement===this.canvas?'Mouse para mirar · Esc libera · H ayuda':this.fallback?'Mouse para mirar dentro de la escena · Esc libera':'Clic en el mundo para mirar · Esc libera · H ayuda';}
};
