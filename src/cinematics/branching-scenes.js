/* Diálogos por clic: la animación termina su gesto y espera al jugador. */
window.SceneDialogueStops={
 'ceremonia-ignitia':[7.95,15.95,23.95,32.95,37.95],
 'ceremonia-karla':[7.95,15.95,23.95,32.95,37.95],
 'eric-fuga':[5.9,12.9,19.9]
};
window.EricEscapeScene=class {
 constructor(lib){this.lib=lib;if(!document.querySelector('#angelica-radio-face'))document.querySelector('#ceremony-dialogue').insertAdjacentHTML('afterbegin','<canvas id="angelica-radio-face" width="160" height="160" aria-label="Angélica hablando por comunicador"></canvas>');this.lines=[
 {at:0,until:6,text:'Aquí Angélica. He vuelto a la prisión y… la celda está vacía. Eric debió escapar mientras estábamos en la ceremonia.'},
 {at:6,until:13,text:'El aluminio y el óxido de hierro… Esto parece el rastro de una reacción de termita. La reja está fundida.'},
 {at:13,until:20,text:'Hay un fósforo quemado. ¿Alguien se lo dio? No explica por sí solo lo ocurrido… Me temo que Eric recibió ayuda.'}
 ];}
 draw(t){const l=this.lib,c=l.ctx,w=l.canvas.width,h=l.canvas.height,img=l.images.escapedCell;
  if(img.complete&&img.naturalWidth){const s=Math.max(w/img.naturalWidth,h/img.naturalHeight);c.drawImage(img,(w-img.naturalWidth*s)/2,(h-img.naturalHeight*s)/2,img.naturalWidth*s,img.naturalHeight*s);}
  const line=this.lines.find(p=>t>=p.at&&t<p.until);
  const portrait=document.querySelector('#angelica-radio-face');RPGCast.portrait(portrait,l.images.angelicaTalk,!!line&&(t-line.at)*38<I18n.t(line.text).length,l.visualTime??t);

  document.querySelector('#ceremony-dialogue').hidden=!line;
  document.querySelector('#ceremony-speaker').textContent='ANGÉLICA · DIRECTORA DE CIENCIAS';
  if(line)document.querySelector('#ceremony-words').textContent=I18n.t(line.text).slice(0,Math.floor((t-line.at)*38));
  return 'Después de la ceremonia · Una ausencia inesperada';
 }
};
(()=>{
const P=CinematicLibrary.prototype,play=P.play,tick=P.tick,refresh=P.refresh,close=P.requestClose;
P.play=function(id,options){
 this.visualTime=0;this.dialogueStops=SceneDialogueStops[id]||null;this.dialogueIndex=0;this.dialogueWaiting=false;
 if(!document.querySelector('#scene-next')){
  this.player.insertAdjacentHTML('beforeend','<button id="scene-next" class="primary" hidden>Continuar ▸</button>');
  document.querySelector('#scene-next').onclick=()=>this.advanceDialogue();
  this.player.addEventListener('click',e=>{if(e.target.closest('#ceremony-dialogue')||e.target===this.canvas)this.advanceDialogue();});
 }
 const result=play.call(this,id,options);this.player.dataset.dialogues=this.dialogueStops?'click':'timed';
 if(id==='eric-fuga')this.draw();
 return result;
};
P.advanceDialogue=function(){
 if(!this.active||!this.item||!this.dialogueStops||!this.acceptInput()||this.finished)return;
 const gate=this.dialogueStops[this.dialogueIndex];if(gate===undefined)return;
 if(!this.dialogueWaiting){
  if(this.item.id.startsWith('ceremonia-')||this.item.id==='eric-fuga'){this.time=gate;this.dialogueWaiting=true;this.draw();this.inputAfter=performance.now()+450;}
  return;
 }
 this.inputAfter=performance.now()+450;this.dialogueWaiting=false;this.dialogueIndex++;
 if(this.dialogueIndex===this.dialogueStops.length&&!this.item.id.startsWith('ceremonia-')){this.finish();return;}
 this.time=gate+.11;this.refresh();this.draw();
};
P.tick=function(dt){
 if(!this.active||!this.item||this.loading||document.hidden)return;
 if(!this.paused&&!this.finished)this.visualTime=(this.visualTime||0)+dt;
 const gate=this.dialogueStops?.[this.dialogueIndex];
 if(gate!==undefined&&!this.paused&&!this.finished){
  if(this.time+dt>=gate){this.time=gate;this.dialogueWaiting=true;this.audio();this.draw();this.refresh();return;}
 }
 tick.call(this,dt);this.refreshDialogue();
};
P.refreshDialogue=function(){
 const b=document.querySelector('#scene-next');if(!b)return;
 const gate=this.dialogueStops?.[this.dialogueIndex];
 b.hidden=this.loading||!this.active||!this.item||gate===undefined||this.finished;
 b.disabled=!this.dialogueWaiting&&!this.item?.id.startsWith('ceremonia-')&&this.item?.id!=='eric-fuga';
 b.textContent=this.dialogueWaiting?'Continuar ▸':b.disabled?'La escena continúa…':'Mostrar todo';
};
P.refresh=function(){refresh.call(this);this.refreshDialogue();};
P.requestClose=function(){
 if(this.story&&this.dialogueStops&&this.dialogueIndex<this.dialogueStops.length){this.advanceDialogue();return;}
 close.call(this);
};
})();
