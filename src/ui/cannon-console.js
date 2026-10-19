/* La torreta contiene sus controles y su cuaderno; no hay paneles bajo la escena. */
window.CannonConsole=class {
 constructor(lab){this.lab=lab;this.room=null;this.isOpen=false;this.panel=document.querySelector('#station');const view=document.querySelector('.scene-view'),notes=document.querySelector('#lab');
  const settings=document.createElement('div');settings.id='cannon-settings';while(this.panel.firstChild)settings.append(this.panel.firstChild);
  settings.querySelector('.eyebrow')?.remove();settings.querySelector('h2')?.remove();
  this.panel.classList.add('cannon-console');this.panel.setAttribute('role','dialog');this.panel.setAttribute('aria-label','Controles de la torreta Prisma');this.panel.hidden=true;
  this.panel.innerHTML='<div class="cannon-heading"><div><p class="eyebrow">TORRETA PRISMA</p><h2>Prepara tu disparo</h2><p id="cannon-target-live" class="cannon-target-live"></p></div><button id="cannon-close" aria-label="Cerrar controles del cañón">×</button></div><div class="cannon-tabs" role="tablist" aria-label="Panel del cañón"><button id="cannon-settings-tab" role="tab" aria-controls="cannon-settings" aria-selected="true">Ajustes y orbes</button><button id="cannon-notes-tab" role="tab" aria-controls="lab" aria-selected="false">Datos y registro</button></div>';
  this.panel.append(settings,notes);view.append(this.panel);notes.hidden=true;settings.setAttribute('role','tabpanel');settings.setAttribute('aria-labelledby','cannon-settings-tab');notes.setAttribute('role','tabpanel');notes.setAttribute('aria-labelledby','cannon-notes-tab');
  const actions=document.createElement('div');actions.className='cannon-actions';actions.innerHTML='<p id="cannon-feedback" role="status" hidden></p><div class="cannon-action-buttons"></div>';actions.lastElementChild.append(settings.querySelector('#load-ammo'),settings.querySelector('#station-fire'));settings.append(actions);notes.append(settings.querySelector('.station-guide'));
  document.querySelector('#load-ammo').addEventListener('click',()=>{if(this.lab.loaded)this.notify('');});
  const hint=settings.querySelector('.calculation-hint');if(hint)notes.prepend(hint);
  document.querySelector('#cannon-close').onclick=()=>this.close();document.querySelector('#cannon-settings-tab').onclick=()=>this.showTab('settings');document.querySelector('#cannon-notes-tab').onclick=()=>this.showTab('notes');
 }
 load(room){this.close();this.room=room;document.querySelector('.scene-view').classList.toggle('has-cannon',!!room.physics);}
 near(player,renderer,opened){const p=this.room?.physics;if(!p)return false;const dx=p.originX-player.x,dy=p.originY-player.y,d=Math.hypot(dx,dy),a=Math.atan2(dy,dx);return d<2.8&&Math.cos(a-player.angle)>.85&&renderer.cast(this.room,player.x,player.y,a,opened).distance+.1>=d;}
 open(player,renderer,opened){if(!this.near(player,renderer,opened))return false;this.isOpen=true;this.panel.hidden=false;this.notify('');document.querySelector('#world-toast').hidden=true;this.showTab('settings');window.dispatchEvent(new Event('astralia:ui-open'));document.querySelector('#velocity').focus({preventScroll:true});return true;}
 notify(text){const note=document.querySelector('#cannon-feedback');note.textContent=text;note.hidden=!text;}
 showTab(tab){const settings=tab==='settings';document.querySelector('#cannon-settings').hidden=!settings;document.querySelector('#lab').hidden=settings;document.querySelector('#cannon-settings-tab').setAttribute('aria-selected',String(settings));document.querySelector('#cannon-notes-tab').setAttribute('aria-selected',String(!settings));this.panel.scrollTop=0;if(!settings)this.lab.draw();}
 close(){const focused=this.panel.contains(document.activeElement);this.isOpen=false;this.panel.hidden=true;if(focused)document.querySelector('#game').focus({preventScroll:true});}
 tick(player,renderer,opened,playing){if(this.isOpen&&(!playing||!this.near(player,renderer,opened)))this.close();}
};
