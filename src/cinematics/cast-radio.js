/* In-scene conversations share the scene clock; they never add a new pause. */
window.CastRadio={
 keys:{Paola:'radioPaola','José Luis':'radioJose','Iván':'radioIvan',Eric:'radioEric'},
 mount(lib){
  if(document.querySelector('#cast-radio'))return;
  lib.canvas.parentElement.insertAdjacentHTML('beforeend','<aside id="cast-radio" hidden><canvas width="128" height="128" aria-label="Retrato del interlocutor"></canvas><div><strong></strong><p></p></div></aside>');
 },
 draw(lib,caption){
  this.mount(lib);const box=document.querySelector('#cast-radio');
  const match=/^(Paola|José Luis|Iván|Eric):\s*(.*)$/.exec(caption);
  const key=match&&this.keys[match[1]],image=key&&lib.images[key];
  const enabled=['ignitia-intercepcion','ignitia-launch','intercepcion-espacial','ivan-descenso'].includes(lib.item?.id);
  box.hidden=!enabled||!image?.complete||!image?.naturalWidth;
  document.querySelector('#cinema-caption').classList.toggle('cast-radio-active',!box.hidden);
  if(box.hidden)return;
  if(lib.item.id==='ivan-descenso')document.querySelector('#cinema-ivan-line').hidden=true;
  const source=lib.item.id+caption;if(lib.radioSource!==source){lib.radioSource=source;lib.radioAt=lib.time;}
  const text=I18n.t(match[2]),count=Math.min(text.length,Math.floor(Math.max(0,lib.time-lib.radioAt)*42));
  box.querySelector('strong').textContent=match[1];box.querySelector('p').textContent=text.slice(0,count);
  RPGCast.portrait(box.querySelector('canvas'),image,count<text.length,lib.visualTime??lib.time);
 }
};
