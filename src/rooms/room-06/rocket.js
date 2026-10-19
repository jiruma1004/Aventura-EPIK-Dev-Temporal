// Timeline shared by rendering and tests; the cable pulls Iván by one ankle.
window.IvanLaunchScene={
 walkPose(t,angle=0){
  // The world path decreases Y. At the launch camera that means screen LEFT.
  const probe=Math.max(4,Math.min(7.45,t)),state=this.state(probe),next=this.state(probe+.02);
  const side=-(next.x-state.x)*Math.sin(angle)+(next.y-state.y)*Math.cos(angle);
  return {frame:SceneActing.walk(t-4),flip:side<0};
 },
 state(t){if(t>=RocketFinaleScene.releaseAt)return RocketFinaleScene.fall(t,this.state(RocketFinaleScene.releaseAt-.000001));const rise=Math.max(0,t-8.5),rocketZ=.16*rise*rise,turnStart=8.5+Math.sqrt(3.4/.16),u=Math.max(0,t-turnStart),turn=Math.min(1,u/1.2),ease=turn*turn*(3-2*turn),swing=.55*Math.cos(u*2.4)*Math.exp(-u*.22);
  const base={x:15.2,y:9.125,footZ:0,rotation:0,rocketZ,visible:true,scream:false};
  if(t<4)return {...base,phase:'warning',visible:false,frame:0,caption:''};
  if(t<7.5)return {...base,phase:'search',frame:Math.floor((t-4)/.28)%2,y:10.7-(t-4)*.45,caption:'Iván: «¿Eric? ¿Dónde te metiste?»'};
  return {...base,phase:u>0?'ascent':'tangle',frame:u>0?3:2,x:15.2+.5*ease,y:9.125+(7.8+2.4*Math.sin(swing)-9.125)*ease,footZ:Math.max(0,rocketZ+1.2-2.4*Math.cos(swing))*ease,rotation:Math.PI*ease+swing*ease,scream:u>0,caption:u>0?'¡Pasajero inesperado! Iván va rumbo a las estrellas.':'Iván: «Un momento… ¿qué es este cable?»'};
 }
};
window.IgnitiaMission=class {
 constructor(onEvent){
  this.onEvent=onEvent;this.mode='idle';this.time=0;this.scene=null;this.rocket=new Image();this.rocket.src='assets/cinematics/ignitia-star-rocket.webp';this.jose=new Image();this.jose.src='assets/cast/jose-medieval-portrait.webp';this.rider=new Image();this.rider.src='assets/cast/eric-cockpit-b-v1.webp';this.jose.onload=()=>this.drawPortrait();this.ivan=new Image();this.ivan.src='assets/cast/ivan-medieval.webp';this.launchIgnited=false;
  document.querySelector('.scene-view').insertAdjacentHTML('beforeend',`<aside id="ignitia-dialog" hidden><canvas id="ignitia-portrait" width="160" height="160" aria-label="José Luis hablando"></canvas><div><p class="eyebrow">JOSÉ LUIS · LÍDER DE IGNITIA</p><p id="ignitia-text"></p><button id="ignitia-next">Mostrar todo</button></div></aside><section id="rocket-console" class="world-console" hidden></section><div id="flight-banner" hidden role="status"></div>`);
  this.dialog=document.querySelector('#ignitia-dialog');this.banner=document.querySelector('#flight-banner');document.querySelector('.scene-view').insertAdjacentHTML('beforeend','<output id="eric-headstart" hidden data-no-translate aria-live="off"></output>');this.headstart=document.querySelector('#eric-headstart');
  this.simulator=new InterceptionConsole(document.querySelector('#rocket-console'),this.rider,this.rocket,()=>this.startLaunch());this.simulator.canRun=()=>this.canLaunch?.();this.simulator.onFail=()=>this.onEvent('moon');
  document.querySelector('#rocket-close').onclick=()=>this.closeConsole();
  this.panic=new Image();this.panic.src='assets/cast/ivan-action-v2.webp';this.walk=new Image();this.walk.src='assets/cast/ivan-gait-v4.webp';this.paola=new Image();this.paola.src='assets/cast/paola-b-v1-portrait.webp';this.speaker='jose';
  document.querySelector('.scene-view').insertAdjacentHTML('beforeend','<details id="completion-card" hidden><summary>AVENTURA EPIK · DESAFÍO COMPLETADO</summary><strong>7 / 7</strong><p>¡Muchas felicidades! Has completado todas las pruebas. Toma una captura de esta pantalla y súbela a la actividad junto con tus apuntes y los procedimientos de los ejercicios.</p><button id="completion-continue" class="primary">Continuar</button></details><section id="chapter-ending" hidden aria-label="Epílogo"><p id="chapter-ending-text" tabindex="-1">Continuará en semana 10…</p></section>');
  document.querySelector('#ignitia-next').onclick=()=>{if(this.speaking){this.reveal();return;}document.querySelector('#ignitia-dialog').hidden=true;if(this.mode==='debrief'){this.finishLaunch();}if(this.mode==='briefing'){this.mode='idle';this.onEvent('escapeDone');}document.querySelector('#game').focus({preventScroll:true});};
  document.querySelector('#completion-continue').onclick=()=>this.showEnding();
 }
 get blocking(){return this.simulator.running||['escape','briefing','launch','sequence','ceremony','debrief','complete','epilogue','applause','credits','ending'].includes(this.mode);}
 reset(room,{preservePursuit=false}={}){const elapsed=preservePursuit?this.simulator.missionTime:0;this.credits?.close();this.simulator.reset();this.simulator.missionTime=elapsed;this.ignited=false;this.headstart.hidden=true;this.simulator.active=!!room.rocket;this.scene=room;this.impactPlayed=false;this.launchIgnited=false;this.warningDone=false;this.mode='idle';this.time=0;this.speaking=false;Sound.silence=false;Sound.stop('rocket');for(const id of ['ignitia-dialog','rocket-console','flight-banner','completion-card','chapter-ending'])document.querySelector('#'+id).hidden=true;document.querySelector('#completion-card').open=false;if(room.rocket)this.speak('Aquí José Luis. Camisa de rayas, cohete listo: solo falta tu trayectoria. Acércate a la consola iluminada y pulsa E. Ajusta los controles o arrastra la curva para encontrarte con Eric en el mismo lugar y al mismo tiempo. Prueba tu rumbo antes de lanzar; su reloj sigue corriendo.');}
 speak(text,speaker='jose'){this.speaker=speaker;document.querySelector('#ignitia-dialog .eyebrow').textContent=speaker==='paola'?'EPI PAOLA':'JOSÉ LUIS · LÍDER DE IGNITIA';document.querySelector('#ignitia-portrait').setAttribute('aria-label',speaker==='paola'?'Epi Paola hablando':'José Luis hablando');this.source=text;this.text=window.I18n?I18n.t(text):text;this.count=0;this.clock=0;this.voiceTime=0;this.speaking=true;this.drawPortrait();document.querySelector('#ignitia-text').textContent='';document.querySelector('#ignitia-next').textContent='Mostrar todo';document.querySelector('#ignitia-dialog').hidden=false;window.dispatchEvent(new Event('astralia:ui-open'));}
 reveal(){this.count=this.text.length;this.speaking=false;this.drawPortrait();document.querySelector('#ignitia-text').textContent=this.text;document.querySelector('#ignitia-next').textContent=this.mode==='complete'?'Misión completada':'Continuar';}
 startEscape(player){this.simulator.reset();this.mode='escape';this.time=0;this.ignited=false;this.closeConsole();document.querySelector('#boss-mission').hidden=true;Object.assign(player,{x:11.5,y:7.5,angle:0,pitch:.02,jumpHeight:0,jumpVelocity:0});window.dispatchEvent(new Event('astralia:ui-open'));}
 near(player){return this.scene?.rocket&&Math.hypot(player.x-7.5,player.y-5.5)<3&&Math.cos(Math.atan2(5.5-player.y,7.5-player.x)-player.angle)>.8;}
 open(player){if(!this.near(player)||this.blocking)return false;document.querySelector('#rocket-console').hidden=false;document.querySelector('#ignitia-dialog').hidden=true;window.dispatchEvent(new Event('astralia:ui-open'));this.simulator.show();return true;}
 closeConsole(){this.simulator.cancel();document.querySelector('#rocket-console').hidden=true;document.querySelector('#game').focus({preventScroll:true});}
 startLaunch(){if(this.mode!=='idle'||!this.simulator.ready||!this.canLaunch?.())return;
  this.closeConsole();this.mode='sequence';this.time=0;this.speaking=false;document.querySelector('#ignitia-dialog').hidden=true;this.onEvent('launch');
  this.cinematics.play('ignitia-intercepcion',{story:true,onComplete:()=>this.beginCeremony()});
 }
 beginCeremony(){if(this.mode!=='sequence')return;this.mode='ceremony';this.onEvent('complete');
  this.cinematics.play(StoryRoute.choice==='particle'?'ceremonia-ignitia':'ceremonia-karla',{story:true,onComplete:()=>{if(this.mode!=='ceremony')return;this.mode='complete';this.showEnding();}});
 }
 finishLaunch(){if(this.mode!=='debrief')return;this.mode='complete';this.speaking=false;this.onEvent('complete');document.querySelector('#ignitia-dialog').hidden=true;const card=document.querySelector('#completion-card');card.hidden=false;card.open=true;document.querySelector('#completion-continue').focus({preventScroll:true});}
 showEnding(){if(this.mode!=='complete')return;this.mode='epilogue';document.querySelector('#completion-card').hidden=true;this.cinematics.play(StoryRoute.choice==='particle'?'eric-fuga':'ivan-descenso',{story:true,onComplete:()=>this.showChapterEnding()});}
 // Keep the applause scene in the gallery for the sequel; the adventure now
 // proceeds directly from either epilogue to the automatic credits reel.
 showChapterEnding(){this.beginCredits();}
 beginCredits(){
  if(this.mode!=='epilogue')return;
  this.mode='credits';document.querySelector('#chapter-ending').hidden=true;
  this.credits=this.cinematics.credits??=new EpikCredits();
  this.credits.open(()=>{if(this.mode!=='credits')return;this.mode='ending';document.querySelector('#chapter-ending-text').textContent=I18n.lang==='en'?'Thank you for playing · Aventura EPIK':'Gracias por jugar · Aventura EPIK';document.querySelector('#chapter-ending').hidden=false;});
 }
 updatePursuit(){
  const text=this.simulator.pursuitLabel();this.headstart.hidden=!(this.scene?.rocket&&this.mode==='idle'&&this.simulator.active&&!this.simulator.failed&&this.simulator.panel.hidden);
  if(this.headstart.textContent!==text)this.headstart.textContent=text;
 }
 updateCamera(player){if(this.scene?.rocket&&['launch','debrief','complete','epilogue','applause','credits','ending'].includes(this.mode))player.pitch=RocketFinaleScene.state(this.time).pitch;}
 tick(dt){if(document.hidden)return;if(this.scene?.boss&&this.ignited&&this.canPursue?.())this.simulator.missionTime=Math.min(InterceptionPhysics.moonTime,this.simulator.missionTime+dt);this.simulator.tick(dt);this.updatePursuit();if(!['sequence','ceremony','debrief','complete','epilogue','applause','credits','ending'].includes(this.mode))this.time+=dt;this.voiceTime=(this.voiceTime||0)+dt;if(!this.dialog.hidden)this.drawPortrait();
  if(this.speaking){this.clock-=dt;if(this.clock<=0){this.count=Math.min(this.text.length,this.count+2);document.querySelector('#ignitia-text').textContent=this.text.slice(0,this.count);Sound.dialogueBlip(this.count);this.clock=.035;if(this.count===this.text.length)this.reveal();}}
  if(this.mode==='escape'){
   if(this.time>=2.5)Sound.silence=true;
   if(this.time>=4&&!this.ignited){this.ignited=true;Sound.play('rocket',true);}
   if(this.time>=11){Sound.silence=false;Sound.stop('rocket');Sound.selectBackground('transformation');this.mode='briefing';this.speak('¡Aquí José Luis, de Ignitia! Buen trabajo con el soporte, pero Eric tenía un plan de escape. Va a llevar su máquina a la Luna. Ven a la plataforma: nosotros ponemos el cohete y tú, los cálculos. ¡Todavía podemos alcanzarlo!');}
  }
  if(this.mode==='launch'&&this.time>=4&&!this.warningDone){this.warningDone=true;this.speaking=false;document.querySelector('#ignitia-dialog').hidden=true;}
  if(this.mode==='launch'&&this.time>=8.5&&!this.launchIgnited){this.launchIgnited=true;Sound.play('rocket',true);}
  if(this.mode==='launch'&&this.time>=RocketFinaleScene.impactAt&&!this.impactPlayed){this.impactPlayed=true;Sound.stop('rocket');Sound.play('explosion',true);}
  if(this.mode==='launch'&&this.time>=RocketFinaleScene.dialogueAt){this.time=RocketFinaleScene.dialogueAt;Sound.stop('rocket');this.mode='debrief';this.speak('Ese era nuestro mejor cohete… La carga inesperada de Iván alteró el centro de masa y, al soltarse, dejó desajustado el control de vuelo. Sin querer, ha echado a perder nuestros planes. Tus cálculos eran correctos; ahora tendremos que diseñar un cohete nuevo. ¡Ignitia no se rinde!');}
  const banner=this.banner;banner.hidden=!(this.mode==='escape'||this.mode==='launch'&&this.time>=4&&this.time<RocketFinaleScene.diveAt&&(!IvanLaunchScene.state(this.time).scream||this.time>=RocketFinaleScene.releaseAt));if(!banner.hidden)banner.textContent=this.mode==='escape'?(this.time<4?'El soporte cede…':'¡Eric está escapando!'):this.time>=RocketFinaleScene.releaseAt?RocketFinaleScene.state(this.time).caption:window.IvanLaunchScene.state(this.time).caption;
 }
 draw(renderer,player,actors){
  if(this.mode==='escape'&&this.time>=4){const h=4.8,z=-h+(this.time-4)**2*.48;this.drawRocket(renderer,player,actors,21,7.5,z,h,true);}
  if(this.scene?.rocket&&!['sequence','ceremony','epilogue','applause','credits','ending'].includes(this.mode)){
   IgnitiaLaunchpad.draw(renderer,player,actors,this.time);
   const launching=['launch','debrief','complete','epilogue','applause','credits','ending'].includes(this.mode),flight=(this.flightModel||RocketFinaleScene).state(this.time),z=launching?flight.rocketZ:0;if(!launching||flight.visible!==false)this.drawRocket(renderer,player,actors,launching?flight.x:16,launching?flight.y:7.5,z,5,false,launching?flight.rotation:0);if(launching){this.drawIvanLaunch(renderer,player,actors);this.drawImpact(renderer);}else this.drawCable(renderer,player,actors,{x:15.2,y:9.125,z:.025},0,false);
   if(!launching)IgnitiaOperationsConsole.draw(renderer,player,actors,this.time);
  }
 }
 drawImpact(renderer){
  const age=this.time-RocketFinaleScene.impactAt;
  if(!this.scene?.rocket||age<0||age>2.2||!['launch','debrief','complete','epilogue','applause','credits','ending'].includes(this.mode))return;
  const c=renderer.ctx,w=renderer.canvas.width,h=renderer.canvas.height;
  const fade=Math.sin(Math.min(1,age/.18)*Math.PI/2)*Math.max(0,1-age/2.2);
  c.save();c.globalAlpha=fade;
  // Solo el borde superior del fogonazo entra desde debajo de la pantalla.
  const glow=c.createRadialGradient(w*.48,h*1.12,0,w*.48,h*1.12,h*.46);
  glow.addColorStop(0,'#fff4be');glow.addColorStop(.25,'#ffb347dd');glow.addColorStop(.6,'#ea531a80');glow.addColorStop(1,'#ea531a00');
  c.fillStyle=glow;c.fillRect(0,h*.64,w,h*.36);
  for(let i=0;i<9;i++){const x=w*(.3+i*.045),y=h*1.06-Math.sin(Math.min(1,age/1.3)*Math.PI)*(h*.07+(i%3)*h*.025),radius=h*(.035+age*.045);c.fillStyle=i%2?'#ffc46e99':'#f47a2b99';c.beginPath();c.arc(x,y,radius,0,Math.PI*2);c.fill();}
  c.restore();
 }
 drawCable(renderer,player,actors,foot,rocketZ,taut){
  const a=actors.project(renderer,player,16,7.8,rocketZ+1.2),b=actors.project(renderer,player,foot.x,foot.y,foot.z);if(!a||!b)return;const c=renderer.ctx;c.save();c.strokeStyle='#ddba75';c.lineWidth=Math.max(2,Math.min(5,b.scale*.025));c.beginPath();c.moveTo(a.x,a.y);const sag=b.scale*(taut?.07:.3);c.quadraticCurveTo((a.x+b.x)/2+Math.sin(this.time*2)*sag*.2,Math.max(a.y,b.y)+sag,b.x,b.y);c.stroke();c.restore();
 }
 drawIvanLaunch(renderer,player,actors){
  const state=IvanLaunchScene.state(this.time),foot={x:state.x,y:state.y,z:state.footZ},p=actors.project(renderer,player,foot.x,foot.y,foot.z);if(state.phase!=='fall')this.drawCable(renderer,player,actors,state.phase==='search'||!state.visible?{x:15.2,y:9.125,z:.025}:foot,state.rocketZ,state.phase==='ascent');if(!state.visible)return;
  if(!p||!this.ivan.complete||!this.ivan.naturalWidth)return;const c=renderer.ctx,height=p.scale*1.7,width=height*.56;
  if(state.phase==='search'){
   const gait=IvanLaunchScene.walkPose(this.time,player.angle);
   RPGCast.action(c,this.walk,gait.frame,p.x,p.y,height,{flip:gait.flip});
  }else RPGCast.action(c,this.panic,SceneActing.panic(this.time,state.phase),p.x,p.y,height,{rotation:state.rotation});
  if(state.phase!=='search'&&state.phase!=='fall'){c.save();c.translate(p.x,p.y);c.rotate(state.rotation);c.strokeStyle='#ddba75';c.lineWidth=3;c.beginPath();c.ellipse(0,0,width*.09,height*.025,0,0,Math.PI*2);c.stroke();c.restore();}
  if(state.scream){const headX=p.x+Math.sin(state.rotation)*height*.7,headY=p.y-Math.cos(state.rotation)*height*.7,w=188,h=44,left=Math.max(10,Math.min(renderer.canvas.width-w-10,headX+20)),top=headY-h/2;if(top>0&&top<renderer.canvas.height-h){c.save();c.fillStyle='#fff3d5';c.strokeStyle='#725047';c.lineWidth=2;c.beginPath();c.roundRect(left,top,w,h,10);c.fill();c.stroke();c.beginPath();c.moveTo(left+10,top+h);c.lineTo(headX,headY);c.lineTo(left+30,top+h);c.fill();c.stroke();c.fillStyle='#35213e';c.font='bold 22px sans-serif';c.textAlign='center';c.fillText('AAAAAAAAHHHH',left+w/2,top+29);c.restore();}}
 }
 drawPortrait(){const canvas=document.querySelector('#ignitia-portrait');if(canvas)RPGCast.portrait(canvas,this.speaker==='paola'?this.paola:this.jose,this.speaking,this.voiceTime||0);}

 drawRocket(renderer,player,actors,x,y,z,h,withEric,rotation=0){
  const art=withEric?this.rider:this.rocket;if(!art.complete||!art.naturalWidth)return;
  const c=renderer.ctx;c.save();
  if(!withEric&&this.time>=RocketFinaleScene.releaseAt&&['launch','debrief','complete','epilogue','applause','credits','ending'].includes(this.mode)){
   const p=actors.project(renderer,player,x,y,z+h/2);
   if(p){const height=h*p.scale,width=height*.7;c.translate(p.x,p.y);c.rotate(rotation);c.imageSmoothingEnabled=false;
    // El cabo suelto sigue unido al fuselaje, ya sin Iván.
    c.strokeStyle='#ddba75';c.lineWidth=Math.max(2,p.scale*.03);c.beginPath();c.moveTo(width*.08,height*.26);c.quadraticCurveTo(width*.55,height*.55,width*.2+Math.sin(this.time*4)*width*.2,height*.85);c.stroke();
    c.drawImage(art,-width/2,-height/2,width,height);
   }c.restore();return;
  }
  // La proyección del suelo tapa la parte del cohete que aún está bajo tierra.
  if(withEric){const ground=actors.project(renderer,player,x,y,0);if(!ground){c.restore();return;}c.beginPath();c.rect(0,0,renderer.canvas.width,Math.max(0,Math.min(renderer.canvas.height,ground.y)));c.clip();}
  WorldBillboard(renderer,player,actors,art,x,y,z,h*(withEric?art.naturalWidth/art.naturalHeight:.7),h,true);c.restore();
 }
};
