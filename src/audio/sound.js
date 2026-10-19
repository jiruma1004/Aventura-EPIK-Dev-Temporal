/* MP3 aportados por el usuario + efectos breves sintetizados. Compatible con file://. */
window.Sound={
 backgroundNames:['grassland','ceremony','music','maze','villain','missing','seal','corridor','stand','transformation','phase'],sceneTrack:'grassland',backgroundLevels:{grassland:1,ceremony:0,music:0,maze:0,villain:0,missing:0,seal:0,corridor:0,stand:0,transformation:0,phase:0},heartbeat:0,
 gameOverReady:false,enabled:false,ctx:null,master:null,dead:false,hiddenPlaying:new Set(),autoPending:true,userDisabled:false,duck:1,entryFade:0,victoryFade:1,playIds:{},
 loopFadeIn:1.2,loopFadeOut:1.8,
 sources:{grassland:'assets/audio/legende-du-royaume.mp3?v=128k-v1',ceremony:'assets/audio/royal-ceremony.mp3?v=128k-v1',bridge:'assets/audio/woodenbridge-2s.wav',corridor:'assets/audio/juanillo.mp3?v=128k-v1',stand:'assets/audio/final-stand.mp3?v=128k-v1',transformation:'assets/audio/transformation.mp3?v=128k-v1',phase:'assets/audio/final-phase.mp3?v=128k-v1',rocket:'assets/audio/rocket-ignition.mp3',seal:'assets/audio/desbloqueo-magico.mp3?v=128k-v1',laugh:'assets/audio/eric-laugh.mp3?v=short-1500',music:'assets/audio/ambiente.mp3?v=128k-v1',victory:'assets/audio/victoria.mp3',explosion:'assets/audio/explosion.mp3',gameover:'assets/audio/game-over.mp3',maze:'assets/audio/relentless-pursuit.mp3?v=128k-v1',villain:'assets/audio/dramatic-villain.mp3',missing:'assets/audio/missing-person.mp3'},tracks:{},
 // Asignar src solo cuando se necesita: las salas futuras no descargan música al inicio.
 prepare(name){const track=this.tracks[name];if(!track.getAttribute('src')){track.preload='auto';track.src=this.sources[name];}return track;},
 async enable({automatic=false}={}){if(automatic&&this.userDisabled)return;this.userDisabled=false;this.enabled=true;
  // No esperamos a resume(): algunos navegadores lo dejan pendiente hasta un gesto.
  if(!automatic){try{if(!this.ctx){this.ctx=new(window.AudioContext||window.webkitAudioContext)();this.master=this.ctx.createGain();this.master.connect(this.ctx.destination);}this.ctx.resume().catch(()=>{});}catch(e){/* Los MP3 aún pueden funcionar sin efectos Web Audio. */}}
  this.apply();this.ui();if(!this.dead)return this.play(this.sceneTrack);if(this.gameOverReady)return this.play('gameover');
 },
 async play(name,restart=false){if(!this.enabled||document.hidden)return false;const t=this.prepare(name),id=(this.playIds[name]??0)+1;this.playIds[name]=id;if(restart)t.currentTime=0;
  try{this.apply();await t.play();if(id!==this.playIds[name]||!this.enabled)return false;if(this.backgroundNames.includes(name)){this.autoPending=false;document.querySelector('#audio-status').textContent='El ambiente te acompaña. Ajusta cada canal a tu gusto.';}this.apply();this.ui();return true;}
  catch(e){if(id!==this.playIds[name])return false;if(this.backgroundNames.includes(name)&&e.name==='NotAllowedError'){this.autoPending=!this.userDisabled;this.enabled=false;this.apply();this.ui();document.querySelector('#audio-status').textContent='La música empezará con tu primer clic o tecla.';}else if(e.name!=='AbortError')document.querySelector('#audio-status').textContent='No se pudo reproducir '+name+'. Puedes reintentar con Activar sonido.';return false;}
 },
 gain(id){const control=this.controls[id];return control.mute.checked?0:Number(control.input.value);},
 loopGain(track){if(!Number.isFinite(track.duration)||track.duration<=0)return 1;const head=Math.max(0,Math.min(1,track.currentTime/this.loopFadeIn)),tail=Math.max(0,Math.min(1,(track.duration-track.currentTime)/this.loopFadeOut));return Math.min(head,tail);},
 mix(dt){if(document.hidden)return;const v=this.tracks.victory,end=Number.isFinite(v.duration)?Math.min(4.5,v.duration):4.5;if(!v.paused&&v.currentTime>=end)this.stop('victory');const playing=!v.paused&&!v.ended,tail=playing?Math.max(0,Math.min(1,(end-v.currentTime)/.7)):1;
  this.victoryFade=playing?Math.min(1,v.currentTime/.2,tail):0;
  const target=playing?1-.82*tail:1;this.duck+=(target-this.duck)*(1-Math.exp(-dt/(target<this.duck?.25:.45)));
  for(const name of this.backgroundNames){const target=name===this.sceneTrack&&!this.silence?1:0;this.backgroundLevels[name]+=(target-this.backgroundLevels[name])*(1-Math.exp(-dt/.45));if(target===0&&this.backgroundLevels[name]<.005&&!this.tracks[name].paused)this.stop(name);}
  if(!this.tracks[this.sceneTrack].paused)this.entryFade=Math.min(1,this.entryFade+dt/1.2);this.apply();
 },
 apply(){const main=this.enabled?this.gain('volume'):0,effects=main*this.gain('effects-volume'),music=main*this.gain('music-volume');
  if(this.master&&this.effectLevel!==effects){this.master.gain.setTargetAtTime(effects,this.ctx.currentTime,.03);this.effectLevel=effects;}
  // Cada pista baja suavemente antes de terminar y vuelve a entrar desde cero.
  // Conservamos loop nativo para que el retorno siga siendo fiable en móviles.
  for(const name of this.backgroundNames){const track=this.tracks[name];track.volume=music*this.duck*this.entryFade*this.backgroundLevels[name]*this.loopGain(track);}this.tracks.victory.volume=main*this.gain('victory-volume')*this.victoryFade;this.tracks.bridge.volume=effects;this.tracks.explosion.volume=effects;this.tracks.laugh.volume=effects;this.tracks.rocket.volume=effects;this.tracks.gameover.volume=main*this.gain('gameover-volume');
  for(const id of ['volume','music-volume','victory-volume','effects-volume','gameover-volume']){const {output,input}=this.controls[id],text=Math.round(Number(input.value)*100)+' %';if(output.textContent!==text)output.textContent=text;}
 },
 ui(){const b=document.querySelector('#sound-toggle');b.textContent=this.enabled?'♫ Sonido activado':'♫ Activar sonido';b.setAttribute('aria-pressed',String(this.enabled));},
 stop(name){this.playIds[name]=(this.playIds[name]??0)+1;this.tracks[name].pause();this.tracks[name].currentTime=0;this.hiddenPlaying.delete(name);},
 toggle(){if(!this.enabled)return this.enable();this.userDisabled=true;this.autoPending=false;this.enabled=false;for(const name of Object.keys(this.tracks))this.stop(name);this.entryFade=0;this.apply();this.ui();},
 laugh(){if(this.dead||!this.tracks.laugh.paused)return;this.play('laugh',true);},
 success(){if(this.dead)return;this.stop('laugh');this.victoryFade=0;this.play('victory',true);},
 failure(kind){this.stop('rocket');this.stop('laugh');this.dead=true;this.gameOverReady=false;this.stop('gameover');for(const name of this.backgroundNames)this.stop(name);this.stop('victory');this.stop('explosion');if(kind==='explosion')this.play('explosion',true);else if(kind==='wood')this.woodBreak();else if(kind==='potion')this.flare();else{this.tone(330,.35,'triangle',.24);this.tone(180,.7,'sine',.23,.15);}if(kind==='timeout')this.gameOver();},
 gameOver(){if(!this.dead)return;this.gameOverReady=true;this.stop('explosion');this.play('gameover',true);},
 recover(preserveVictory=false){const wasDead=this.dead;this.gameOverReady=false;this.stop('gameover');this.stop('bridge');this.dead=false;this.stop('explosion');if(!preserveVictory)this.stop('victory');if(wasDead)this.entryFade=0;this.apply();if(this.enabled)this.play(this.sceneTrack);},
 selectBackground(name){if(!this.backgroundNames.includes(name)||name===this.sceneTrack)return;this.sceneTrack=name;if(this.enabled&&!this.dead)this.play(name,true);this.apply();},
 pursuit(dt,distance){if(this.dead)return;this.heartbeat-=dt;if(this.heartbeat<=0){const near=Math.max(0,1-distance/10);this.tone(65,.13,'sine',.025+near*.12);this.tone(55,.12,'sine',.02+near*.08,.17);this.heartbeat=1.5-near*.8;}},
 tone(hz,duration=.18,type='sine',volume=.3,delay=0){if(!this.enabled||!this.ctx||document.hidden)return;const t=this.ctx.currentTime+delay,o=this.ctx.createOscillator(),g=this.ctx.createGain();o.type=type;o.frequency.setValueAtTime(hz,t);g.gain.setValueAtTime(.001,t);g.gain.exponentialRampToValueAtTime(volume,t+.012);g.gain.exponentialRampToValueAtTime(.001,t+duration);o.connect(g).connect(this.master);o.start(t);o.stop(t+duration+.02);},
 applause(){if(!this.enabled||!this.ctx||document.hidden)return;const ctx=this.ctx;if(!this.clapBuffer){this.clapBuffer=ctx.createBuffer(1,Math.ceil(ctx.sampleRate*.16),ctx.sampleRate);const d=this.clapBuffer.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=(Math.random()*2-1)*Math.exp(-i/d.length*8);}
  for(const delay of [0,.045,.10]){const source=ctx.createBufferSource(),filter=ctx.createBiquadFilter(),gain=ctx.createGain();source.buffer=this.clapBuffer;filter.type='bandpass';filter.frequency.value=1200+delay*5000;gain.gain.value=.16;source.connect(filter).connect(gain).connect(this.master);source.onended=()=>{source.disconnect();filter.disconnect();gain.disconnect();};source.start(ctx.currentTime+delay);}
 },
 woodBreak(){this.play('bridge',true);},
 flare(){if(!this.enabled||!this.ctx||document.hidden)return;const t=this.ctx.currentTime;if(t-(this.lastFlare??-10)<.15)return;this.lastFlare=t;
  const length=.5,buffer=this.ctx.createBuffer(1,Math.ceil(this.ctx.sampleRate*length),this.ctx.sampleRate),data=buffer.getChannelData(0);
  for(let i=0;i<data.length;i++){const x=i/this.ctx.sampleRate;data[i]=(Math.random()*2-1)*Math.min(1,x/.015)*Math.exp(-x*10);}
  const source=this.ctx.createBufferSource(),filter=this.ctx.createBiquadFilter(),gain=this.ctx.createGain();source.buffer=buffer;filter.type='lowpass';filter.frequency.setValueAtTime(2400,t);filter.frequency.exponentialRampToValueAtTime(180,t+length);gain.gain.value=.65;source.connect(filter).connect(gain).connect(this.master);source.onended=()=>{source.disconnect();filter.disconnect();gain.disconnect();};source.start(t);
 },
 cartStep(slow=0){
  this.tone(92-slow*20,.11,'triangle',.13);this.tone(165,.055,'triangle',.075,.065);
  if(!this.enabled||!this.ctx||document.hidden)return;
  const ctx=this.ctx,b=ctx.createBuffer(1,Math.ceil(ctx.sampleRate*.16),ctx.sampleRate),d=b.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=(Math.random()*2-1)*Math.exp(-i/d.length*7);
  const src=ctx.createBufferSource(),f=ctx.createBiquadFilter(),g=ctx.createGain();src.buffer=b;f.type='bandpass';f.frequency.value=480;g.gain.value=.17;src.connect(f).connect(g).connect(this.master);src.onended=()=>{src.disconnect();f.disconnect();g.disconnect();};src.start();
  this.tone(280-slow*90,.18,'sawtooth',.015);
 },
 dialogueBlip(index){this.tone([230,260,245,280][index%4],.045,'square',.055);},
 click(){this.tone(880,.12,'sine',.3);this.tone(1320,.2,'sine',.13,.04);},
 load(){this.tone(220,.12,'triangle',.3);this.tone(440,.22,'sine',.25,.1);},
 tick(){this.tone(640,.035,'triangle',.12);},
 fire(){if(!this.enabled||!this.ctx)return;const t=this.ctx.currentTime,o=this.ctx.createOscillator(),g=this.ctx.createGain();o.frequency.setValueAtTime(160,t);o.frequency.exponentialRampToValueAtTime(35,t+.35);g.gain.setValueAtTime(.65,t);g.gain.exponentialRampToValueAtTime(.001,t+.5);o.connect(g).connect(this.master);o.start();o.stop(t+.5);}
};
Sound.controls=Object.fromEntries(['volume','music-volume','victory-volume','effects-volume','gameover-volume'].map(id=>[id,{input:document.querySelector('#'+id),mute:document.querySelector('#'+id+'-mute'),output:document.querySelector('#'+id+'-value')}]));
for(const name of Object.keys(Sound.sources))Sound.tracks[name]=new Audio();
for(const name of Sound.backgroundNames)Sound.tracks[name].loop=true;
for(const [name,track] of Object.entries(Sound.tracks)){track.preload='none';track.addEventListener('error',()=>{document.querySelector('#audio-status').textContent='No se pudo cargar el archivo de '+name+'.';});}
Sound.tracks.victory.onended=()=>Sound.apply();
document.querySelector('#sound-toggle').onclick=()=>Sound.toggle();
for(const id of ['volume','music-volume','victory-volume','effects-volume','gameover-volume']){document.querySelector('#'+id).oninput=()=>Sound.apply();document.querySelector('#'+id+'-mute').onchange=()=>Sound.apply();}
document.addEventListener('visibilitychange',()=>{if(document.hidden){Sound.hiddenPlaying.clear();for(const [name,t] of Object.entries(Sound.tracks)){if(!t.paused){Sound.hiddenPlaying.add(name);t.pause();}}if(Sound.ctx)Sound.ctx.suspend();}else if(Sound.enabled){Sound.ctx?.resume().catch(()=>{});for(const name of Sound.hiddenPlaying){if(Sound.backgroundNames.includes(name)&&name!==Sound.sceneTrack)continue;if(!Sound.dead||name==='explosion'||name==='gameover')Sound.play(name);}if(!Sound.dead)Sound.play(Sound.sceneTrack);Sound.hiddenPlaying.clear();if(Sound.autoPending&&!Sound.dead)Sound.enable({automatic:true});}});
Sound.apply();
// Intenta entrar con música. Si se bloquea, el primer gesto vuelve a intentarlo.
for(const event of ['pointerdown','keydown'])document.addEventListener(event,e=>{if(e.target.closest('#sound-toggle')||Sound.userDisabled)return;if(Sound.autoPending||(Sound.enabled&&!Sound.ctx))Sound.enable();},{capture:true});
