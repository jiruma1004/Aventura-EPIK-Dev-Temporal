(()=>{
'use strict';
const canvas=document.querySelector('#game'),renderer=new EscapeRenderer(canvas),keys=new Set(),rooms=window.ESCAPE_ROOMS,lab=new ProjectileLab();
let index=0,player,opened=false,flash=0,last=0,completed=false,death=null,checkpoint=null;
let gravityFalls=0,potionDeaths=0;
const chemistryQuotes=['Esa reacción fue demasiado exotérmica para ti.','Otra dosis… Tu estrategia necesita menos ensayo y más química.','Eric ya te considera parte de los reactivos. ¡Cambia el procedimiento!'];
const gravityQuotes=['La gravedad funciona. Tu estrategia necesita ajustes.','Definitivamente, tú y la gravedad no os lleváis.','La gravedad ya te reconoce. Quizá sea hora de negociar con el puente.'];
lab.hologram=new TrajectoryHologram(lab);
lab.onFeedback=text=>companions.toast(text);
const advancePrompt=new AdvancePrompt();
const cannon=new CannonConsole(lab),companions=new RoomCompanions(),actors=new RoomActors();renderer.actors=actors;renderer.outdoor=new CastleExterior();let maze=null,corridor=null,boss=null,trial=null;
const spawnPlayer=room=>({...room.spawn,pitch:0,jumpHeight:0,jumpVelocity:0});
const message=document.querySelector('#message');
let classroom;
let recovery;
let touch=null;
let controlTutorial=null;
const development=['localhost','127.0.0.1'].includes(location.hostname)&&new URLSearchParams(location.search).get('dev')==='1';
const mission=new AdventureClock({onChange:updateCountdown,onExpire:expireAdventure});
const ignitia=new IgnitiaMission(ignitiaEvent);
const cinematics=new CinematicLibrary();cinematics.legacySource=ignitia;cinematics.isComplete=()=>completed&&classroom.session.totals().valid;cinematics.resultSummary=()=>classroom.certificate();ignitia.cinematics=cinematics;
const measurement=new MeasurementRoom(()=>{opened=true;Sound.success();document.querySelector('#door-status').textContent='MEDICIÓN ACEPTADA';companions.toast('¡Medición aceptada! Cruza la puerta real para llegar a la sala II.');},returnFromMeasurement);
const canPlay=()=>!trial?.zipline?.active&&!arrival.active&&!cinematics.active&&!measurement.isOpen&&!ignitia.blocking&&(mission.state==='running'||controlTutorial?.active)&&!completed&&!death&&!document.querySelector('#eric-ready').open&&document.querySelector('#maze-notice').hidden;
const camera=new FirstPersonControls(canvas,{canPlay,look:(dx,dy)=>{player.angle+=dx*.0035;player.pitch=Math.max(-.24,Math.min(.24,player.pitch-dy*.0015));},click:worldClick,clearKeys:()=>{keys.clear();touch?.reset();}});
window.addEventListener('astralia:ui-open',()=>camera.release());
cinematics.onToggle=active=>{keys.clear();camera.release();if(active){mission.pause();cannon.close();companions.closeHelp();companions.closeConsole();ignitia.closeConsole();}else mission.resume();};
cinematics.canOpen=()=>!death&&!['escape','briefing','launch','sequence','ceremony','debrief','epilogue','applause','credits','ending'].includes(ignitia.mode);

function updateCountdown({state,remaining,phase,phaseChanged,musicCue}){
 const timer=document.querySelector('#adventure-timer');timer.dataset.phase=phase;
 document.querySelector('#timer-value').textContent=String(Math.floor(remaining/60)).padStart(2,'0')+':'+String(remaining%60).padStart(2,'0');
 document.querySelector('#timer-label').textContent=state==='complete'?'IGNITIA EN VUELO':'LA DIVERGENCIA';
 const hint=state==='ready'?'Esperando tu entrada':state==='complete'?'Lo lograste':phase==='expired'?'El Dr. Eric llegó primero':phase==='danger'?'¡Apresúrate!':phase==='warning'?'El experimento se acerca':'Tiempo restante';
 document.querySelector('#timer-hint').textContent=hint;
 if(phaseChanged){window.dispatchEvent(new CustomEvent('astralia:urgency',{detail:{phase,remainingSeconds:remaining,musicCue}}));if(phase==='warning'||phase==='danger')document.querySelector('#timer-announcement').textContent='Quedan '+Math.ceil(remaining/60)+' minutos. '+hint;}
}
function expireAdventure(){
 recovery?.remove();
 measurement.close();ignitia.reset(rooms[index]);document.querySelector('#ignitia-dialog').hidden=true;
 document.querySelector('#eric-ready').close();boss?.close();
 keys.clear();clearDeath();boss?.stopAttacks();classroom.aid.close();classroom.session.interrupt('timeout');cannon.close();companions.closeHelp();companions.closeConsole();lab.hologram.hide();lab.dead=true;lab.lock(true);if(lab.shot)lab.shot.done=true;Sound.failure('timeout');
 document.querySelector('#door-status').textContent='TIEMPO AGOTADO';message.textContent='El Dr. Eric ha completado la divergencia.';
 document.querySelector('#adventure-expired').showModal();
}
function beginFirstChallenge(saved){
 Object.assign(player,saved||spawnPlayer(rooms[index]));keys.clear();companions.showRoomNotice(rooms[index]);companions.updateTrial();mission.start();classroom.session.start();canvas.focus({preventScroll:true});
}
const arrival=new CartArrival(saved=>{Object.assign(player,saved);keys.clear();controlTutorial.offer(player);});
function enterAdventure(skipArrival=false){
 classroom.session.studentName=prologue.studentName||'';classroom.session.difficulty=EpikDifficulty.mode;companions.showRoomNotice(rooms[index]);companions.updateTrial();if(recovery)recovery.enabled=true;
 const intro=document.querySelector('#adventure-intro');if(intro.open)intro.close();keys.clear();if(skipArrival)beginFirstChallenge(player);else arrival.start(player);canvas.focus({preventScroll:true});canvas.scrollIntoView({block:'center'});
}
const prologue=new AdventurePrologue(enterAdventure);
document.querySelector('#adventure-expired').addEventListener('cancel',e=>e.preventDefault());
document.querySelector('#adventure-restart').onclick=()=>{recovery?.remove();gravityFalls=0;potionDeaths=0;document.querySelector('#adventure-expired').close();StoryRoute.reset();companions.chaseAnnounced=false;classroom.newSession();load(rooms.findIndex(r=>r.trial),'new');mission.restart();classroom.session.start();canvas.focus({preventScroll:true});};
document.addEventListener('visibilitychange',()=>{keys.clear();classroom?.session.clock(false);mission.tick();});
setInterval(()=>mission.tick(),250);
new ResizeObserver(entries=>{const r=entries[0].contentRect;if(r.width&&r.height){canvas.width=960;canvas.height=Math.round(960*r.height/r.width);}}).observe(canvas);
const roulette=new ProblemRoulette(()=>{if(!rooms[index].roulette)return;opened=rooms[index].canUnlock({problemSolved:true});classroom?.solve();companions.closeConsole();document.querySelector('#door-status').textContent='SELLO ABIERTO';message.textContent='¡Sello roto! Rodea la mesa y atraviesa el portal luminoso.';});
roulette.canAnswer=()=>canPlay()&&rooms[index].roulette&&companions.consoleOpen&&companions.facing(player,rooms[index].answerSeal,renderer,opened);

function returnFromMeasurement(){load(0);opened=true;Object.assign(player,{x:18.5,y:1.8,angle:Math.PI/2});document.querySelector('#door-status').textContent='PUENTE ACTIVADO';}
function bonusInteraction(angle=player.angle){const room=rooms[index],target=room.measurementEntrance||(room.measurement?{x:.99,y:3.5}:null);if(!target||Math.hypot(player.x-target.x,player.y-target.y)>1.8||Math.cos(Math.atan2(target.y-player.y,target.x-player.x)-angle)<.9)return false;if(room.measurement)returnFromMeasurement();else load(rooms.findIndex(r=>r.measurement));return true;}
function load(i,reason='transition'){
 if(!rooms[i])return false;
 // A local preview may start midway through the adventure. Still require the
 // current challenge and exit to be complete before entering its next room.
 const previewNext=development&&classroom?.session.preview&&reason==='transition'
  &&ADVENTURE_ORDER[ADVENTURE_ORDER.indexOf(rooms[index])+1]===rooms[i]
  &&classroom.solved()&&opened&&!death;
 if(classroom&&reason!=='preview'&&!previewNext&&!classroom.session.canEnter(rooms[i].id))return false;
 if(classroom?.session.current&&classroom.session.current!==rooms[i].id&&reason==='transition'&&classroom.session.started!==null){if(!classroom.solved()||!opened||death)return false;classroom.session.interrupt('room_exit');classroom.session.leave();}
 if(classroom)classroom.session.interrupt('room_reload');
 if(reason==='preview')classroom.session.preview=true;
const gardenState=index===i&&reason==='transition'?corridor?.guardian.snapshot():null;corridor?.guardian.close();
if(arrival.active)arrival.finish();cinematics.close();measurement.reset(rooms[i]);ignitia.reset(rooms[i],{preservePursuit:reason==='transition'&&!!rooms[index]?.boss&&!!rooms[i].rocket});document.querySelector('.scene-view').classList.toggle('has-rocket',!!rooms[i].rocket);document.querySelector('.scene-view').classList.toggle('has-measurement',!!rooms[i].measurement);Sound.stop('laugh');boss?.supernova.reset();boss?.close();for(const id of ['boss-mission','boss-panel'])if(document.getElementById(id))document.getElementById(id).hidden=true;document.querySelector('#eric-ready').close();clearDeath();Sound.selectBackground(rooms[i].trial?'grassland':rooms[i].roulette?'seal':rooms[i].conceptual?'maze':rooms[i].corridor?'corridor':rooms[i].boss?'stand':rooms[i].rocket?'phase':'music');Sound.recover(true);index=i;player=spawnPlayer(rooms[i]);opened=false;advancePrompt.update({opened:false,maze:null,playing:false});completed=false;keys.clear();flash=0;const room=rooms[i];cinematics.assets.prepare(room);document.querySelector('#fire-shortcut').hidden=!!(room.rocket||room.measurement||room.trial);document.querySelector('#station-fire').disabled=!!(room.rocket||room.measurement||room.trial);
 document.querySelector('#room-title').textContent=`UMBRAL ${room.label||['I','II','III','IV','V','VI'][i]} / ${room.name.toUpperCase()}`;
 document.querySelector('#door-status').textContent=room.trial?'SALTO 1 / 5':room.measurement?'SELLO DE MEDICIÓN':room.physics?'PUENTE DESACTIVADO':room.roulette?'SELLO CERRADO':room.conceptual?'LABERINTO · 1 / 4':room.corridor?'CAMINO A LA SALA PRINCIPAL':'PUERTA BLOQUEADA';
 message.textContent=room.trial?'Lee la afirmación y salta a Verdadero o Falso. Shift corre · Espacio salta. Cada acierto guarda tu avance.':room.measurement?'Mide la abertura de la puerta real. Acércate y pulsa E para examinar las reglas.':room.physics?'Mira el cañón y pulsa E o haz clic para preparar tu disparo.':room.roulette?'Gira la rueda. Responde interactuando con el sello de la puerta.':room.conceptual?'Explora las puertas: clic o E cerca de ellas. Las puertas equivocadas esconden portales al calabozo.':room.corridor?'Esquiva los símbolos. En el tramo central, salta entre las plataformas sobre la lava. Shift corre · Espacio salta.':room.boss?'Calcula los dos puntos de corte y programa los láseres laterales.':'Acércate a la puerta y ábrela con clic o E.';
 cannon.load(room);document.querySelector('#trajectory-toggle').hidden=!room.physics;lab.hologram.hide();document.querySelector('#roulette-panel').hidden=true;
 document.querySelector('.scene-layout').classList.remove('has-station');document.querySelector('#equipment').textContent=room.trial?'VERDADERO O FALSO':room.measurement?'REGLAS · ÁREA E INCERTIDUMBRE':room.physics?'CAÑÓN ASTRAL':room.roulette?'MESA DEL DESTINO':room.conceptual?'LABERINTO CONCEPTUAL':room.corridor?'SALTO Y SPRINT':room.boss?'DOS LÁSERES · DOS RAÍCES':'CONTROL DE VUELO';

 if(room.physics)lab.reset(room);if(room.roulette){roulette.reset();roulette.syncReset(classroom.session.state(room.id));roulette.resumeSelection();}
 boss=room.boss?new EricEncounter(bossEvent):null;if(boss){boss.canFire=()=>canPlay()&&boss.active===boss.near(player,renderer,rooms[index],opened);boss.canAutoOpen=()=>canPlay()&&document.querySelector('#paola-dialog').hidden&&document.querySelector('#extra-help-panel').hidden;boss.onAutoOpen=()=>{keys.clear();touch?.reset();};}
 trial=room.trial?new ApproachTrial(room,trialEvent):null;room.approach=trial;
 corridor=room.corridor?new RelaxCorridor(corridorEvent):null;room.guardian=corridor?.guardian;
 if(corridor){const g=corridor.guardian;g.canUse=canPlay;g.canAnswer=()=>g.near(player);g.onPaola=()=>companions.help();g.onPalma=()=>classroom.aid.open();g.canPalma=()=>classroom.aid.eligible()&&classroom.session.available(classroom.context().objective_id)&&canPlay();if(gardenState)g.restore(gardenState);}
 maze=room.conceptual?new ConceptMaze(room,mazeEvent):null;room.maze=maze;companions.load(room,roulette,maze);companions.guardian=corridor?.guardian;if(room.corridor)companions.toast('Cuidado, el Dr. Eric te está lanzando ecuaciones desde el otro lado');checkpoint={room:index,stage:0,position:spawnPlayer(room)};if(corridor?.guardian.arrived){checkpoint={room:index,stage:1,position:{...spawnPlayer(room),...GUARDIAN_GARDEN.checkpoint}};player={...checkpoint.position};}
 classroom?.enter();return true;
}
function trialEvent(type,position){
 if(type==='zipline-start'){document.querySelector('#question-bubble').hidden=true;document.querySelector('#world-toast').hidden=true;keys.clear();touch?.reset();camera.release();companions.closeHelp();Sound.load();message.textContent=I18n.t('Ayuda IA · Cruzando en tirolesa');return;}
 if(type==='zipline-end'){opened=true;checkpoint={room:index,stage:5,position:{...position,pitch:0,jumpHeight:0,jumpVelocity:0}};classroom.solve();document.querySelector('#door-status').textContent=I18n.t('CRUCE COMPLETADO');document.querySelector('#question-bubble').hidden=true;companions.toast(I18n.t('Has cruzado en tirolesa. Esta sala se completa con una estrella.'));Sound.click();canvas.focus({preventScroll:true});return;}

 if(type==='fall'||type==='break'){die('pit',type==='break'?'wood':null);return;}
 checkpoint={room:index,stage:trial.stage,position:EpikDifficulty.profile.platformCheckpoint?{...position,pitch:0,jumpHeight:0,jumpVelocity:0}:spawnPlayer(rooms[index])};opened=trial.finished;if(opened)classroom.solve();
 document.querySelector('#door-status').textContent=opened?'SENDERO SUPERADO':`SALTO ${trial.stage+1} / 5`;
 companions.updateTrial();Sound.click();if(opened)Sound.success();
 companions.toast(opened?'¡Cinco aciertos! Sigue el camino hacia el bosque.':'Respuesta correcta. Punto seguro guardado.');
}
function mazeEvent(type,text){
 if(type==='caught'){die('ivan');return;}
 if(type==='return'){player=spawnPlayer(rooms[index]);checkpoint={room:index,stage:0,position:spawnPlayer(rooms[index])};keys.clear();}
 if(type==='dungeon'||type==='return'){keys.clear();companions.closeHelp();camera.release();}
 if(type==='presence')Sound.tone(85,.6,'sine',.11);
 else if(type==='wrong')Sound.tone(180,.25,'triangle',.15);
 else if(type==='correct')Sound.click();
 else if(type==='advance'){checkpoint={room:index,stage:maze.stage,position:maze.checkpointPosition()};}
 else if(type==='complete'){opened=true;Sound.success();text='¡Laberinto superado! Sigue por la salida que elegiste.';}
 classroom.route();if(maze.finished)classroom.solve();companions.updateConcept();companions.revealQuestion();if(maze.finished)document.querySelector('#question-bubble').hidden=true;companions.toast(text);message.textContent=text;
 document.querySelector('#door-status').textContent=maze.dungeon?'CALABOZO · RESUELVE EL SELLO':maze.finished?'LABERINTO SUPERADO':`LABERINTO · ${maze.stage+1} / 4`;
}
function openNearbyDoor(angle=player.angle,screenY=null){
 const room=rooms[index];if(room.physics||room.roulette)return false;
 const hit=renderer.cast(room,player.x,player.y,angle,opened);if(hit.tile!==2||hit.distance>1.8)return false;
 if(screenY!==null){const height=canvas.height/(hit.distance*Math.cos(angle-player.angle)),top=canvas.height*(.5+(player.pitch||0))-(.5-(player.jumpHeight||0))*height;if(screenY<top||screenY>top+height)return false;}
 if(room.oakDoor&&hit.cx===room.oakDoor.x&&hit.cy===room.oakDoor.y){
  if(room.corridor){corridorEvent('ready');return true;}
  if(room.boss){if(!boss.puzzle.solved)companions.toast('Primero corta los dos soportes de la parábola.');return true;}
  if(maze?.finished){opened=room.canUnlock({mazeSolved:true});Sound.click();companions.toast('La puerta de roble se abre. Continúa hacia el corredor.');return true;}
  return false;
 }
 if(maze){const door=maze.doorAt(hit.cx,hit.cy);if(door?.stage!==maze.stage)return false;maze.choose(door,player);return true;}
 opened=room.canUnlock({prototypeMode:true});if(opened){Sound.click();document.querySelector('#door-status').textContent='PUERTA ABIERTA';message.textContent='Cruza la puerta para continuar.';}return opened;
}
function bossEvent(type){if(type==='stun'){companions.toast('¡Descarga! Eric queda aturdido durante 15 segundos. Aprovecha los láseres.');recovery?.save();return;}if(type==='flame'){die('flame');return;}if(type==='potion'){die('potion');return;}if(type!=='solved')return;classroom.solve();boss.resetAttacks();Sound.stop('laugh');companions.closeHelp();document.querySelector('#ask-paola').hidden=true;ignitia.startEscape(player);keys.clear();return;}
function ignitiaEvent(type){
 if(type==='moon'){ignitia.closeConsole();ignitia.speaking=false;document.querySelector('#ignitia-dialog').hidden=true;die('moon');return;}
 if(type==='launch'){classroom.solve();classroom.session.finish();mission.finish();keys.clear();camera.release();companions.closeHelp();Object.assign(player,{x:3,y:7.5,angle:0,pitch:.10,jumpHeight:0,jumpVelocity:0});return;}
 if(type==='complete'){if(mission.state==='complete'||mission.finish()){completed=true;keys.clear();document.querySelector('#door-status').textContent='SIETE PRUEBAS COMPLETADAS';message.textContent='Entrega tu captura y tus apuntes con los procedimientos de los ejercicios.';}return;}
 if(type!=='escapeDone')return;opened=rooms[index].canUnlock({parabolaCut:true});companions.toast('Eric escapó. Cruza el puente central hacia el cohete de Ignitia.');document.querySelector('#door-status').textContent='SOPORTE CORTADO · PASO ABIERTO';}
function corridorEvent(type,text){
 if(type==='hit'){die('symbol');return;}
 if(type==='garden'){checkpoint={room:index,stage:1,position:{...spawnPlayer(rooms[index]),...GUARDIAN_GARDEN.checkpoint}};document.querySelector('#door-status').textContent=I18n.t('EL GUARDIÁN DE EPITHEA');classroom.session.event('checkpoint',classroom.context());companions.toast('Has llegado al jardín. Punto seguro guardado. Pisa la baldosa de piedra frente a las dos estatuas.');recovery?.save();return;}
 if(type==='guardian-speaking'){keys.clear();camera.release();companions.closeHelp();Object.assign(player,{angle:0,pitch:.24});checkpoint={room:index,stage:1,position:{...spawnPlayer(rooms[index]),...GUARDIAN_GARDEN.tile,angle:0,pitch:.24}};recovery?.save();return;}
 if(type==='guardian-progress'){classroom.aid.close();recovery?.save();return;}
 if(type==='guardian-answer'){classroom.aid.close();companions.closeHelp();recovery?.save();return;}
 if(type==='guardian-gate-open'){opened=rooms[index].canUnlock({ready:true,guardianSolved:corridor.guardian.solved,gateOpened:corridor.guardian.gateOpened});classroom.solve();document.querySelector('#door-status').textContent=I18n.t('PUERTA ABIERTA · TRES SELLOS');companions.toast('«El pacto se ha cumplido. Cruza el umbral, viajero.»');recovery?.save();return;}
 if(type==='guardian-solved'){classroom.aid.close();Sound.click();document.querySelector('#door-status').textContent=I18n.t('ACERTIJO RESUELTO');keys.clear();companions.toast('Tres sellos encendidos. Las puertas de Epithea se están abriendo…');recovery?.save();return;}
 if(type==='guardian-reminder'){companions.toast('«Has ganado el paso. La puerta está detrás de mí, viajero.»');return;}
 if(type==='ready'){if(!opened)companions.toast(corridor.guardian.solved?'Espera a que termine de abrirse la puerta.':'Pisa la baldosa de piedra. Los guardianes esperan tus tres respuestas.');return;}
 companions.toast(text);Sound.tone(310,.08,'triangle',.06);
}
document.querySelector('#eric-ready-yes').onclick=()=>{document.querySelector('#eric-ready').close();if(!corridor||opened||death||!canPlay()||!corridor.nearExit(player)||!corridor.guardian.gateOpened)return;opened=rooms[index].canUnlock({ready:true,guardianSolved:corridor.guardian.solved,gateOpened:corridor.guardian.gateOpened});classroom.solve();Sound.click();document.querySelector('#door-status').textContent='PUERTA DE ROBLE ABIERTA';companions.toast('Respira hondo. La sala principal te espera.');canvas.focus({preventScroll:true});};
document.querySelector('#eric-ready-wait').onclick=()=>{document.querySelector('#eric-ready').close();canvas.focus({preventScroll:true});};
async function interact(){
 if(!canPlay())return;
 if(controlTutorial?.active){controlTutorial.mark('interact');return;}
 if(bonusInteraction())return;
 if(rooms[index].measurement){if(!measurement.open(player))companions.toast('Acércate a la puerta real y pulsa E.');return;}
 if(rooms[index].rocket){if(!ignitia.open(player))companions.toast('Acércate a la consola de operaciones de Ignitia y pulsa E.');return;}
 if(rooms[index].physics){if(!cannon.open(player,renderer,opened))companions.toast('Acércate al cañón y míralo para abrir sus controles.');return;}
 if(maze?.activateFreeze(player,renderer))return;
 if(corridor?.guardian.open(player)){keys.clear();return;}
 if(openNearbyDoor())return;
 if(boss){if(boss.open(player,renderer,rooms[index],opened))keys.clear();else companions.toast('Acércate a uno de los láseres laterales y mira su panel.');return;}
 if(maze){companions.toast('Acércate a una puerta. Ábrela con clic o E para explorar su respuesta.');return;}
 if(!rooms[index].roulette)return;
 if(companions.nearConsole){if(companions.openConsole())keys.clear();else companions.toast('Primero pulsa el cristal de la mesa para seleccionar un problema.');return;}
 if(Math.hypot(player.x-rooms[index].table.x,player.y-rooms[index].table.y)>2.4){companions.toast('Acércate a la ruleta o mira el sello de la puerta.');return;}
 companions.closeConsole();roulette.spin();
}
function worldClick(x,y){
 if(!canPlay())return false;
 companions.closeHelp();
 if(bonusInteraction(player.angle+Math.atan((x/canvas.width*2-1)*.66)))return true;
 if(corridor?.guardian.open(player)){keys.clear();return true;}
 if(rooms[index].measurement)return measurement.open(player);
 if(rooms[index].rocket)return ignitia.open(player);
 const contains=b=>b&&x>b.x&&x<b.x+b.w&&y>b.y&&y<b.y+b.h;
 if(maze&&contains(actors.freezeButtonBounds)&&maze.activateFreeze({...player,angle:player.angle+Math.atan((x/canvas.width*2-1)*.66)},renderer))return true;
 if(openNearbyDoor(player.angle+Math.atan((x/canvas.width*2-1)*.66),y))return false;
 if(boss&&boss.open(player,renderer,rooms[index],opened)){keys.clear();return true;}
 if(rooms[index].roulette){
  if(companions.nearConsole){if(companions.openConsole())return true;companions.toast('Acércate y mira el sello de la puerta. Primero necesitas un problema de la ruleta.');}
  if(renderer.tableButton&&Math.hypot(x-renderer.tableButton.x,y-renderer.tableButton.y)<renderer.tableButton.r+15)interact();
 }
 if(rooms[index].physics){if(contains(renderer.cannonBounds)&&cannon.open(player,renderer,opened))return true;cannon.close();}
 return false;
}
async function shoot(){if(!canPlay()||rooms[index].rocket||rooms[index].measurement||rooms[index].trial)return;if(rooms[index].roulette||rooms[index].conceptual){await interact();return;}if(rooms[index].physics){if(!cannon.near(player,renderer,opened)){companions.toast('Vuelve al cañón para preparar el disparo.');return;}if(!cannon.isOpen&&(!lab.loaded||!lab.valid)){cannon.open(player,renderer,opened);return;}if(cannon.isOpen&&document.querySelector('#cannon-settings').hidden)cannon.showTab('settings');if(opened){message.textContent='El puente está activo. Cruza por el centro.';return;}const launched=lab.launch(()=>{opened=rooms[index].canUnlock({targetHit:true});classroom.solve();document.querySelector('#door-status').textContent='PUENTE ACTIVADO';message.textContent='¡Acertaste! Rodea la torreta y cruza por el centro del puente.';},()=>die('explosion'));if(launched)cannon.close();else if(!death){if(cannon.isOpen)cannon.notify(document.querySelector('#feedback').textContent);else companions.toast(document.querySelector('#feedback').textContent);}return;}
 interact();
}
function jump(){if(!canPlay()||player.jumpHeight>0||player.jumpVelocity!==0||!supported(player.x,player.y))return;player.jumpVelocity=2.1;controlTutorial?.mark('jump');}
window.addEventListener('keydown',e=>{if(!canPlay()||e.target.closest('button,a,input,select,textarea,summary'))return;const key=e.key.toLowerCase();if(['w','a','s','d','arrowleft','arrowright',' ','e','f','h','shift'].includes(key)){e.preventDefault();keys.add(key);if(key===' '&&!e.repeat)jump();if(key==='f'&&!e.repeat)shoot();if(key==='e'&&!e.repeat)interact();if(key==='h'&&!e.repeat)companions.help();}});
window.addEventListener('keyup',e=>keys.delete(e.key.toLowerCase()));
window.addEventListener('keydown',e=>{if(e.key==='Escape'){corridor?.guardian.close();camera.release();classroom.aid.close();measurement.close();ignitia.closeConsole();cannon.close();boss?.close();companions.closeHelp();companions.closeConsole();}});
document.querySelector('#station-fire').onclick=()=>shoot();
document.querySelector('#jump').onclick=()=>{jump();canvas.focus({preventScroll:true});};
// Input panels own touch gestures; nonblocking guide dialogue keeps movement available.
const touchPanels=['#guardian-panel','#guardian-reply','#answer-console','#boss-panel','#rocket-console','#extra-help-panel'];
const canTouchPlay=()=>canPlay()&&!cannon.isOpen&&!touchPanels.some(id=>{const p=document.querySelector(id);return p&&!p.hidden;});
touch=new TouchControls(canvas,{canUse:canTouchPlay,jump,interact,releaseCamera:()=>camera.release()});
controlTutorial=new ControlTutorial({isTouch:()=>touch.enabled,onDone:({saved})=>beginFirstChallenge(saved)});
function walkable(x,y){const room=rooms[index];if(opened&&room.bridge){const b=room.bridge;if(x>b.start-.18&&x<b.end+.18&&[b.y+.03,b.y+.97].some(edge=>Math.abs(y-edge)<.20))return false;}if(room.bounds&&(y-.18<room.bounds.minY||y+.18>room.bounds.maxY))return false;if(rooms[index].rocket&&Math.hypot(x-7.5,y-5.5)<.6)return false;if(boss?.lasers.some(l=>Math.hypot(x-l.x,y-l.y)<.45))return false;if(corridor?.blocks(x,y,player.jumpHeight))return false;if(room.answerDesk&&Math.hypot(x-room.answerDesk.x,y-room.answerDesk.y)<.65)return false;if(room.table&&Math.hypot(x-room.table.x,y-room.table.y)<.8)return false;if(room.physics&&Math.hypot(x-room.physics.originX,y-room.physics.originY)<.38)return false;return [[-.18,-.18],[.18,-.18],[-.18,.18],[.18,.18]].every(([dx,dy])=>{const tile=room.map[Math.floor(y+dy)]?.[Math.floor(x+dx)]??1;return tile===0||(tile===2&&opened)||tile===3;});}
// El abismo permite caminar: perder el suelo inicia la caída.
function supported(x,y){const room=rooms[index];if(room.trial)return trial.supports(x,y);if(room.lava)return room.lava.supports(x,y);const tile=room.floorTile?room.floorTile(x,y):room.map[Math.floor(y)]?.[Math.floor(x)];return tile!==3||(opened&&Math.floor(y)===(rooms[index].boss?7:3));}
function clearDeath(){death=null;camera.release();canvas.style.transform='';canvas.style.opacity='';const dialog=document.querySelector('#death-dialog');if(dialog.open)dialog.close();}
function die(type,soundKind=null){corridor?.guardian.close();if(death)return;classroom.death(type,soundKind==='wood');boss?.stopAttacks();if(type==='fall'||type==='pit')gravityFalls++;if(type==='potion'||type==='flame')potionDeaths++;cannon.close();boss?.close();death={type,t:0,shown:false,startedAt:performance.now()};camera.release();companions.closeHelp();companions.closeConsole();lab.hologram.hide();keys.clear();lab.dead=true;lab.lock(true);if(lab.shot&&!lab.shot.done){lab.shot.done=true;lab.history.push('Lanzamiento interrumpido por el fin del intento.');lab.renderHistory();}Sound.failure(soundKind||type);message.textContent=type==='moon'?'Eric ha llegado a la Luna.':type==='lava'?'¡Has tocado la lava!':type==='fall'?'Has perdido pie…':type==='ivan'?'¡EPI Ivan te alcanzó!':type==='symbol'?'¡Un símbolo te alcanzó!':type==='flame'?'¡La onda verde te alcanzó!':type==='potion'?'¡La poción de Eric te alcanzó!':type==='pit'?'Has caído en la fosa.':'¡Sobrecarga de la torreta!';}
function checkpointLabel(){return rooms[checkpoint.room].name+(rooms[checkpoint.room].conceptual?` · tramo ${checkpoint.stage+1}`:rooms[checkpoint.room].corridor&&checkpoint.stage===1?' · jardín del guardián':'');}
function animateDeath(dt){if(!death)return;death.t=(performance.now()-death.startedAt)/1000;const t=death.t,c=renderer.ctx,w=canvas.width,h=canvas.height;
 if(death.type==='moon'){c.fillStyle=`rgba(5,15,30,${Math.min(.95,t)})`;c.fillRect(0,0,w,h);c.save();c.translate(w/2,h/2);c.scale(4,4);ignitia.simulator.drawMoon.call({ctx:c},{x:0,y:0});c.restore();}
 else if(death.type==='potion'||death.type==='flame'){
  c.fillStyle=`rgba(14,45,13,${Math.min(.87,t*.65)})`;c.fillRect(0,0,w,h);
  if(t<1.2){c.save();c.globalAlpha=Math.max(0,1-t/1.2);for(let i=0;i<18;i++){const x=w*i/17,base=h*(1+.12*Math.sin(i)),rise=h*(.18+.16*Math.sin(i*7)**2)*(1+t);c.fillStyle=i%2?'#b5ff60':'#39d946';c.beginPath();c.moveTo(x-w*.055,base);c.quadraticCurveTo(x-w*.09,base-rise*.5,x+Math.sin(t*11+i)*w*.024,base-rise);c.quadraticCurveTo(x+w*.07,base-rise*.5,x+w*.055,base);c.fill();}c.restore();}
 }
 else if(death.type==='fall')drawBlackHoleFall(c,w,h,t);
 else if(death.type==='symbol'||death.type==='pit'||death.type==='potion'||death.type==='lava'){c.fillStyle=death.type==='lava'?`rgba(125,31,8,${Math.min(.92,t)})`:`rgba(12,16,30,${Math.min(.9,t)})`;c.fillRect(0,0,w,h);c.fillStyle='#ddadcb';c.textAlign='center';c.font='bold 130px Georgia';c.fillText(death.type==='lava'?'♨':death.type==='symbol'?'∑':death.type==='potion'?'☣':'↓',w/2,h/2);}
 else if(death.type==='ivan'){c.fillStyle=`rgba(85,9,28,${Math.min(.7,t*.5)})`;c.fillRect(0,0,w,h);actors.drawIvanCapture(c,w,h,t);}
 else{c.save();const fade=Math.max(0,1-t/1.5);c.fillStyle=`rgba(255,130,60,${fade*.3})`;c.fillRect(0,0,w,h);c.translate(w*.44,h*.6);for(let i=0;i<16;i++){const a=i*Math.PI/8,r=t*230+i%3*12;c.fillStyle=i%2?'#ffbf76':'#9eb8da';c.save();c.translate(Math.cos(a)*r,Math.sin(a)*r+t*t*85);c.rotate(t*3+i);c.globalAlpha=fade;c.fillRect(-7,-7,14,14);c.restore();}c.restore();}
 if(t>=(death.type==='fall'?2.6:1.5)&&!death.shown){
  death.shown=true;const explosion=death.type==='explosion',ivan=death.type==='ivan';
  document.querySelector('#death-kind').textContent='GAME OVER · '+(death.type==='moon'?'LUNA':death.type==='lava'?'LAVA':explosion?'SOBRECARGA':ivan?'EPI IVAN':death.type==='symbol'?'IMPACTO':death.type==='flame'?'ONDA VERDE':death.type==='potion'?'POCIÓN':death.type==='pit'?'LA FOSA':'AGUJERO NEGRO');
  document.querySelector('#death-title').textContent=death.type==='moon'?'Eric llegó primero.':death.type==='lava'?'El suelo estaba demasiado caliente.':explosion?'La torreta se sobrecargó.':ivan?'Ivan te atrapó.':death.type==='symbol'?'Una idea te pasó por encima.':death.type==='flame'?'Te faltó elevarte.':death.type==='potion'?'Una reacción inesperada.':death.type==='pit'?'Cuidado con el borde.':'La singularidad ganó esta ronda.';
  document.querySelector('#death-quote').textContent=death.type==='moon'?'La divergencia ha alcanzado la Luna.':death.type==='lava'?'La lava no cuenta como plataforma.':explosion?'en papel nada se quema':ivan?'Confundiste una salida con la hora de la comida.':death.type==='symbol'?'Las matemáticas también pueden ser un deporte de contacto.':death.type==='flame'?'La química pasó a ras del suelo. La próxima vez, salta.':death.type==='potion'?chemistryQuotes[Math.min(2,potionDeaths-1)]:gravityQuotes[(death.type==='fall'||death.type==='pit')?Math.min(2,Math.max(0,gravityFalls-1)):0];
  document.querySelector('#death-detail').textContent=(death.type==='moon'?'Vuelve a la plataforma de Ignitia y prepara otra intercepción. ':death.type==='lava'?'Salta entre las plataformas de piedra. Usa Shift para tomar impulso y Espacio para saltar. ':explosion?'Prueba con una bala más ligera o reduce la rapidez. ':ivan?'La persecución terminó aquí. ':death.type==='symbol'?'Esquiva los carriles o salta sobre los símbolos. ':death.type==='flame'?'Salta sobre el frente verde cuando se acerque. ':death.type==='potion'?'Evita los charcos verdes: desaparecen en dos segundos. ':death.type==='pit'?(trial?'Elige la respuesta correcta y salta a su plataforma. Conservas los aciertos anteriores. ':'Corta el soporte para activar el puente central. '):'Has caído en el agujero negro. ')+`Volverás a tu último punto seguro: ${checkpointLabel()}. El reloj sigue corriendo.`;
  document.querySelector('#death-dialog').showModal();Sound.gameOver();
 }
}
function respawn(){
 if(!death)return;clearDeath();player={...checkpoint.position,pitch:0,jumpHeight:0,jumpVelocity:0};keys.clear();
 if(trial)trial.restore();if(rooms[index].rocket)ignitia.reset(rooms[index]);
 if(corridor)corridor.resetHazards();if(boss)boss.resetAttacks();
 if(maze){player={...maze.restoreCheckpoint(checkpoint.stage),pitch:0,jumpHeight:0,jumpVelocity:0};opened=false;companions.updateConcept();companions.revealQuestion();document.querySelector('#door-status').textContent=`LABERINTO · ${maze.stage+1} / 4`;}
 lab.dead=false;lab.destroyed=false;if(rooms[index].physics){lab.lock(false);lab.update();document.querySelector('#loaded-status').textContent=lab.loaded?`● Cargada: ${lab.loaded.name} · ${lab.loaded.mass} kg`:'Recámara vacía. Elige una bala y cárgala.';document.querySelector('#feedback').textContent='Nuevo intento: conservas el registro. Revisa el aviso de carga antes de disparar.';}
 classroom.respawn();Sound.recover();message.textContent=`Punto seguro: ${checkpointLabel()}. `+(trial?(trial.finished?'Sigue el camino hacia el bosque.':'Lee la afirmación y prepara el siguiente salto.'):maze?'Una presencia sigue recorriendo las galerías.':opened?'El puente sigue activo.':'Tienes otro intento.');companions.toast(message.textContent);canvas.focus({preventScroll:true});
}
document.querySelector('#respawn').onclick=respawn;
document.querySelector('#death-dialog').addEventListener('cancel',e=>{e.preventDefault();respawn();});

companions.canHelp=()=>canPlay();
window.addEventListener('astralia:help-open',()=>{classroom.session.event('normal_help',classroom.context());if(rooms[index].rocket){ignitia.speaking=false;document.querySelector('#ignitia-dialog').hidden=true;ignitia.closeConsole();}});
ignitia.canLaunch=()=>canPlay()&&ignitia.near(player);
ignitia.canPursue=()=>mission.state==='running'&&!death&&!cinematics.active;
ignitia.simulator.canAdvance=()=>mission.state==='running'&&!death&&rooms[index].rocket&&ignitia.mode==='idle'&&!cinematics.active;
measurement.canSubmit=()=>mission.state==='running'&&!death&&rooms[index].measurement&&measurement.near(player);
function tick(time){const simulationActive=ignitia.simulator.running&&ignitia.simulator.canAdvance();classroom.tick(Math.min((time-last)/1000,.04),mission.state==='running'&&(canPlay()||simulationActive||!!trial?.zipline?.active)&&!document.hidden&&mission.pausedAt===null);const dt=Math.min((time-last)/1000,.04);last=time;flash=Math.max(0,flash-dt);Sound.mix(dt);prologue.tick(dt);arrival.tick(dt,player);mission.tick();ignitia.tick(dt);
 if(trial?.zipline?.active&&!death&&!document.hidden&&mission.state==='running'&&mission.pausedAt===null)trial.tickZipline(dt,player);
 touch.sync();
 if(canPlay()){player.angle+=((keys.has('arrowright')?1:0)-(keys.has('arrowleft')?1:0))*dt*1.8;const f=(keys.has('w')?1:0)-(keys.has('s')?1:0)+touch.forward,s=(keys.has('d')?1:0)-(keys.has('a')?1:0)+touch.strafe,speed=(boss?.supernova.blind?0:dt)*2.3*((keys.has('shift')||touch.sprinting)?1.55:1)/Math.max(1,Math.hypot(f,s));const nx=player.x+(Math.cos(player.angle)*f-Math.sin(player.angle)*s)*speed,ny=player.y+(Math.sin(player.angle)*f+Math.cos(player.angle)*s)*speed;
 if(walkable(nx,player.y))player.x=nx;if(walkable(player.x,ny))player.y=ny;
 controlTutorial?.tick(player,keys.has('shift')||touch.sprinting);
 // Altura en celdas (2 m en Galileo): salto corto, sin doble salto ni apoyo sobre el vacío.
 if(player.jumpHeight>0||player.jumpVelocity>0){player.jumpVelocity-=4.905*dt;player.jumpHeight=Math.max(0,player.jumpHeight+player.jumpVelocity*dt);if(player.jumpHeight===0)player.jumpVelocity=0;}
 if(trial&&player.jumpHeight===0)trial.land(player);
 if(player.jumpHeight===0&&!supported(player.x,player.y))die(rooms[index].lava?'lava':(rooms[index].boss||rooms[index].trial)?'pit':'fall');
 if(!death&&opened&&player.x>(rooms[index].exitX??7.6)){if(rooms[index].measurement)load(1);else if(ADVENTURE_ORDER.indexOf(rooms[index])<ADVENTURE_ORDER.length-1)load(rooms.indexOf(ADVENTURE_ORDER[ADVENTURE_ORDER.indexOf(rooms[index])+1]));else if(mission.finish()){completed=true;message.textContent='Has cruzado los siete umbrales. ¡Has detenido al Dr. Eric!';document.querySelector('#door-status').textContent='SALIDA ALCANZADA';keys.clear();}}
 }
 if(canPlay()&&maze){maze.tick(dt,player);if(maze.chasing&&!maze.caught&&maze.freezeLeft<=0)Sound.pursuit(dt,Math.hypot(maze.enemy.x-player.x,maze.enemy.y-player.y));}
 if(canPlay()&&corridor)corridor.tick(dt,player);
 if((canPlay()||ignitia.mode==='escape')&&boss)boss.tick(dt,player,renderer,rooms[index],opened);
 advancePrompt.update({opened,maze,playing:canPlay()});
 companions.tick(dt,player,renderer,opened,canPlay());cannon.tick(player,renderer,opened,canPlay());
 if(rooms[index].physics){const hint=document.querySelector('#interaction-hint');hint.hidden=!canPlay()||cannon.isOpen;hint.textContent=cannon.near(player,renderer,opened)?'Clic o E · Usar el cañón':'Acércate al cañón para configurar el disparo';}
 if(maze)document.querySelector('#chase-indicator').classList.toggle('frozen',maze.freezeLeft>0);
 if(rooms[index].rocket){const hint=document.querySelector('#interaction-hint');hint.hidden=!canPlay()||!document.querySelector('#rocket-console').hidden;hint.textContent=ignitia.near(player)?'Clic o E · Programar el cohete':'Acércate a la consola de operaciones de Ignitia';if(!ignitia.near(player)&&!document.querySelector('#rocket-console').hidden)ignitia.closeConsole();}
 if(rooms[index].measurement){const h=document.querySelector('#interaction-hint');h.hidden=!canPlay();h.textContent=opened?'Cruza la puerta real para continuar.':'Clic o E junto a la puerta · Medir';}
 if(rooms[index].measurementEntrance&&opened){const h=document.querySelector('#interaction-hint');h.hidden=!canPlay();h.textContent='Puerta lateral al norte · Sala 1.5 opcional';}
 if(boss)document.querySelector('#interaction-hint').textContent=boss.near(player,renderer,rooms[index],opened)>=0?'Clic o E · Programar láser':'Busca los láseres a ambos lados';
 if(trial){const h=document.querySelector('#interaction-hint');h.hidden=!canPlay();h.textContent='Salta a tu respuesta · Shift corre · Espacio salta · H pista';}
 if(touch.enabled){const h=document.querySelector('#interaction-hint'),en=I18n.lang==='en';h.textContent=I18n.t(h.textContent).replace(/Clic o E|Click or E/g,en?'Use':'Usar').replace(/Shift corre|Shift to sprint/g,en?'Run':'Correr').replace(/Espacio salta|Space to jump/g,en?'Jump':'Saltar');}
 if(canPlay()&&rooms[index].physics)lab.tick(dt);if(canPlay()&&rooms[index].roulette)roulette.tick(dt);
 ignitia.updateCamera(player);renderer.draw(rooms[index],player,opened,flash,time,rooms[index].physics?lab:null,rooms[index].roulette?roulette:null);InteriorAtmosphere.draw(renderer,rooms[index],player,time);actors.draw(renderer,rooms[index],player,opened,time,maze);if(trial){drawArrivalCart(renderer,rooms[index],player);trial.draw(renderer,player,actors);}if(corridor)corridor.draw(renderer,player,actors);if(boss)boss.draw(renderer,player,actors);if(rooms[index].environment.kind==='courtyard')renderer.outdoor.draw(renderer,rooms[index],player,actors,time);ignitia.draw(renderer,player,actors);animateDeath(dt);cinematics.tick(dt);requestAnimationFrame(tick);
}
// Recovery stores stable puzzle state, never DOM, renderer caches or callbacks.
const mazeRecoveryFields = ['stage','finished','chasing','enemy','dungeon','dungeonVisit',
 'dungeonQuestion','questionPool','lastDungeonQuestion','savedWorld','routeChoice',
 'freezeLeft','grace','returnGrace'];
const pick = (object, fields) => Object.fromEntries(fields.map(key => [key, object[key]]));
function captureRecovery() {
 if(classroom.session.preview||classroom.session.started===null)return null;
 if(mission.state==='expired')return {expired:true};
 classroom.session.clock(!document.hidden&&canPlay());
 const room=rooms[index], world={room:room.id,opened,checkpoint,gravityFalls,potionDeaths,chaseAnnounced:!!companions.chaseAnnounced};
 if(corridor)world.corridor=corridor.guardian.snapshot();
 if(trial)world.trial={stage:trial.stage,finished:trial.finished,broken:[...trial.broken]};
 if(room.physics)world.cannon={target:pick(lab.target,['index','misses']),physics:{...room.physics},
  values:[lab.v.value,lab.a.value,lab.az.value],history:lab.history,selected:lab.selected,loaded:lab.loaded,
  shot:lab.shot?.done&&lab.shot.result.hit?lab.shot:null};
 if(room.roulette)world.roulette={current:roulette.current?.id,selected:roulette.selected,remaining:roulette.remaining,solved:[...roulette.solved],angle:roulette.angle};
 if(maze)world.maze={...pick(maze,mazeRecoveryFields),map:room.map,environment:room.environment,doors:maze.doors,
  passed:[...maze.passed],openDoors:[...maze.openDoors],usedFreezeButtons:[...maze.usedFreezeButtons]};
 if(boss)world.boss={support:boss.puzzle.support.id,cuts:boss.puzzle.cuts,stun:boss.stun.snapshot(),escapeTime:ignitia.ignited?ignitia.simulator.missionTime:null};
 if(room.rocket)world.rocket={...pick(ignitia.simulator,['params','missionTime','attempts','launchEpoch','ready']),ending:classroom.session.finished!==null};
 return {world,session:classroom.session.recoverySnapshot(),remaining:mission.remaining,
  clockComplete:mission.state==='complete',language:I18n.lang};
}
function restoreRecovery(saved,away) {
 const w=saved.world,i=rooms.findIndex(room=>room.id===w.room);
 if(i<0||!ADVENTURE_ORDER.includes(rooms[i]))throw Error('Unknown room');
 if(saved.session.states.some(([id,state])=>!ADVENTURE_ORDER.some(room=>room.id===id)||!state||!Number.isFinite(state.active)))throw Error('Invalid metrics');
 classroom.newSession();classroom.session.restoreSnapshot(saved.session,away);
 if(!classroom.session.canEnter(w.room))throw Error('Invalid progression');
 EpikDifficulty.select(saved.session.difficulty);
 if(saved.language==='en'||saved.language==='es')I18n.set(saved.language);
 StoryRoute.reset();if(saved.session.route)StoryRoute.choose(saved.session.route);
 companions.chaseAnnounced=!!saved.world.chaseAnnounced;
 prologue.done=true;prologue.speaking=false;prologue.studentName=classroom.session.studentName;
 if(!load(i,'recovery'))throw Error('Cannot restore room');
 opened=!!w.opened;gravityFalls=w.gravityFalls||0;potionDeaths=w.potionDeaths||0;
 checkpoint=w.checkpoint||checkpoint;
 player={...checkpoint.position,pitch:0,jumpHeight:0,jumpVelocity:0};
 if(corridor){if(w.corridor)corridor.guardian.restore(w.corridor);if(corridor.guardian.arrived)corridor.symbols=[];opened=corridor.guardian.gateOpened;if(opened)classroom.solve();}
 if(trial&&w.trial){Object.assign(trial,{stage:w.trial.stage,finished:w.trial.finished,broken:new Set(w.trial.broken)});companions.updateTrial();}
 if(rooms[i].physics&&w.cannon){
  Object.assign(rooms[i].physics,w.cannon.physics);Object.assign(lab.target,w.cannon.target);
  [lab.v.value,lab.a.value,lab.az.value]=w.cannon.values;
  if(!CANNON_ANGLES.includes(Number(lab.a.value)))lab.a.value='45';
  Object.assign(lab,{history:w.cannon.history,loaded:w.cannon.loaded,selected:w.cannon.selected,shot:w.cannon.shot});
  lab.renderHistory();lab.update();
 }
 if(rooms[i].roulette&&w.roulette){
  Object.assign(roulette,{remaining:w.roulette.remaining,solved:new Set(w.roulette.solved),angle:w.roulette.angle});
  const q=PHYSICS_PROBLEMS.findIndex(q=>q.id===w.roulette.current);
  if(q>=0)roulette.present(q);
  else if(Number.isInteger(w.roulette.selected))roulette.present(w.roulette.selected);
 }
 if(maze&&w.maze){
  const m=w.maze;Object.assign(maze,pick(m,mazeRecoveryFields));
  Object.assign(maze,{doors:m.doors,passed:new Set(m.passed),openDoors:new Set(m.openDoors),usedFreezeButtons:new Set(m.usedFreezeButtons),
   caught:false,path:[],pathClock:0,grace:Math.max(3,m.grace||0),freezeLeft:Math.max(0,m.freezeLeft-away/1000)});
  rooms[i].map=m.map;rooms[i].environment=m.environment;
  if(maze.dungeon)player={x:6.5,y:6.5,angle:0,pitch:0,jumpHeight:0,jumpVelocity:0};
  else if(maze.finished)player={...maze.checkpointPosition(3),pitch:0,jumpHeight:0,jumpVelocity:0};
  maze.enemy=maze.dungeon?{x:2.5,y:6.5}:{x:maze.stage*12+1.5,y:8.5};
  companions.updateConcept();
 }
 if(boss&&w.boss){
  const support=EricVariants.bank.find(v=>v.id===w.boss.support);if(!support)throw Error('Unknown puzzle');
  boss.puzzle=new ParabolaPuzzle(support);boss.puzzle.cuts=w.boss.cuts;boss.stun.restore(w.boss.stun,away/1000);
  document.querySelector('#boss-parabola').textContent='y = '+support.parabolaText;
  document.querySelector('#boss-line').textContent='y = '+support.lineText;
  document.querySelector('#boss-equality').textContent=support.parabolaText+' = '+support.lineText;
  document.querySelector('#boss-progress').textContent=w.boss.cuts.filter(Boolean).length+' / 2 cortes';
  if(boss.puzzle.solved){boss.fall=2;opened=true;ignitia.ignited=true;ignitia.simulator.missionTime=Math.min(InterceptionPhysics.moonTime,Math.max(0,Number.isFinite(w.boss.escapeTime)?w.boss.escapeTime:0)+away/1000);}
 }
 if(rooms[i].rocket&&w.rocket){
  Object.assign(ignitia.simulator,pick(w.rocket,['params','missionTime','attempts','launchEpoch','ready']));
  if(!w.rocket.ending)ignitia.simulator.missionTime+=away/1000;
  ignitia.simulator.sync();ignitia.simulator.draw();
 }
 mission.pausedAt=null;mission.remaining=Math.max(0,saved.remaining-(saved.clockComplete?0:Math.ceil(away/1000)));
 mission.state=saved.clockComplete?'complete':'running';mission.deadline=Date.now()+mission.remaining*1000;mission.lastDisplay=null;
 document.querySelector('#adventure-intro').close();
 document.querySelector('#maze-notice').hidden=true;document.querySelector('#ignitia-dialog').hidden=true;ignitia.speaking=false;
 classroom.aid.update();mission.notify();keys.clear();canvas.focus({preventScroll:true});
 if(w.rocket?.ending){
  // The completed assessment is preserved even if power failed during the ending.
  // Resume at the ceremony so the student can retrieve the named diploma and CSV.
  ignitia.mode='sequence';ignitia.beginCeremony();
 }else{
  mission.tick();
  if(mission.state==='running'&&rooms[i].rocket&&ignitia.simulator.missionTime>=InterceptionPhysics.moonTime)die('moon');
 }
}

classroom=new EpikClassroom(ADVENTURE_ORDER,()=>({room:rooms[index],lab,maze,roulette,boss,trial,corridor,ignitia,opened}),()=>canPlay());
roulette.onSpin=()=>recovery?.save();
document.querySelector('#reset-lab').onclick=()=>load(index);document.querySelector('#reset-roulette').onclick=()=>{if(!rooms[index].roulette||!roulette.requestReset())return;classroom.session.event('roulette_reset');companions.closeConsole();recovery?.save();};load(rooms.findIndex(r=>r.trial),'new');mission.notify();document.querySelector('#adventure-intro').showModal();Sound.enable({automatic:true});requestAnimationFrame(tick);
recovery=new EpikRecovery({capture:captureRecovery,restore:restoreRecovery,reset:()=>{
 StoryRoute.reset();companions.chaseAnnounced=false;classroom.newSession();classroom.session.studentName='';
 mission.state='ready';mission.remaining=ADVENTURE_CONFIG.durationSeconds;mission.deadline=null;mission.pausedAt=null;
 prologue.done=false;prologue.started=false;prologue.step=0;prologue.studentName='';
 document.querySelector('#story-name-box').hidden=false;document.querySelector('#story-student-name').value='';
 load(rooms.findIndex(r=>r.trial),'new');prologue.renderPage();mission.notify();
}});recovery.offer();

window.addEventListener('astralia:language',()=>{
 if(rooms[index].physics)lab.targetReadout();
 Object.assign(renderer.art,makeWallArt(),makeScenery());boss?.art.clear();actors.doorArt.clear();
 if(!prologue.done)prologue.renderPage();
 if(companions.dialogue){const d=companions.dialogue;d.text=I18n.t(d.source);d.chars=[...d.text];companions.finishDialogue();}
 if(ignitia.source&&!document.querySelector('#ignitia-dialog').hidden){ignitia.text=I18n.t(ignitia.source);ignitia.reveal();}
});

// Fullscreen keeps the HUD and all response panels inside the same document.
(()=>{
 const root=document.documentElement,button=document.createElement('button');button.id='fullscreen-toggle';button.type='button';button.setAttribute('aria-pressed','false');document.querySelector('.controls').append(button);
 const active=()=>!!document.fullscreenElement||root.classList.contains('expanded-game');
 const sync=()=>{const on=active();button.textContent=I18n.t(on?'⛶ Salir de pantalla completa':'⛶ Pantalla completa');button.setAttribute('aria-pressed',String(on));};
 button.onclick=async()=>{keys.clear();camera.release();if(document.fullscreenElement){try{await document.exitFullscreen();}catch{};}else if(root.classList.contains('expanded-game'))root.classList.remove('expanded-game');else{root.classList.add('expanded-game');sync();if(root.requestFullscreen&&document.fullscreenEnabled){try{await root.requestFullscreen();}catch{/* The expanded layout remains available when native fullscreen is denied. */}}}sync();canvas.focus({preventScroll:true});};
 document.addEventListener('fullscreenchange',()=>{if(document.fullscreenElement)root.classList.remove('expanded-game');keys.clear();sync();});window.addEventListener('astralia:language',sync);window.addEventListener('keydown',e=>{if(e.key==='Escape'&&root.classList.contains('expanded-game')){root.classList.remove('expanded-game');sync();}});sync();
})();

// Public toolbar: development navigation is never inserted into the shipped UI.
const controls=document.querySelector('.controls');controls.append(document.querySelector('.audio-controls'),document.querySelector('.language-corner'));
for(const el of controls.querySelectorAll('button,summary,input'))el.addEventListener('pointerdown',()=>camera.release());
if(!development){for(const id of ['story-skip','cinematics-open','cinema-skip','cinema-replay','cinema-close'])document.getElementById(id)?.remove();document.querySelector('[data-arrival-skip]')?.remove();}
if(development){const getters={player:()=>player,index:()=>index,opened:()=>opened,death:()=>death,trial:()=>trial,maze:()=>maze,boss:()=>boss,corridor:()=>corridor,last:()=>last,completed:()=>completed};for(const [k,get] of Object.entries(getters))Object.defineProperty(window,k,{get,configurable:true});Object.assign(window,{rooms,lab,roulette,companions,cinematics,ignitia,mission,camera,cannon,touch,controlTutorial,keys,renderer,prologue,arrival,classroom,recovery,tick,jump,shoot,interact,die,respawn,canPlay,load:(i)=>load(i,'preview'),advanceRoom:(i)=>load(i),newClassroomGame:()=>{StoryRoute.reset();companions.chaseAnnounced=false;classroom.newSession();load(rooms.findIndex(r=>r.trial),'new');mission.restart();classroom.session.start();}});}
})();
