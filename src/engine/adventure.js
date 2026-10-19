/* Un reloj para toda la aventura, independiente de la velocidad de renderizado. */
window.ADVENTURE_CONFIG={durationSeconds:100*60,warningSeconds:10*60,dangerSeconds:3*60,
  // Reservas para futuras pistas. Se entregan en el evento astralia:urgency.
  musicCues:{calm:null,warning:null,danger:null,expired:null,complete:null}
};
window.AdventureClock=class {
 constructor({now=()=>Date.now(),onChange=()=>{},onExpire=()=>{},config=window.ADVENTURE_CONFIG}={}){
  this.config=config;this.now=now;this.onChange=onChange;this.onExpire=onExpire;this.state='ready';this.remaining=config.durationSeconds;this.deadline=null;this.lastPhase=null;this.lastDisplay=null;this.pausedAt=null;
 }
 get phase(){if(this.state==='expired'||this.state==='complete')return this.state;return this.remaining<=this.config.dangerSeconds?'danger':this.remaining<=this.config.warningSeconds?'warning':'calm';}
 notify(){const key=this.state+':'+this.remaining;if(key===this.lastDisplay)return;this.lastDisplay=key;
  const phase=this.phase,changed=phase!==this.lastPhase;this.lastPhase=phase;this.onChange({state:this.state,remaining:this.remaining,phase,phaseChanged:changed,musicCue:this.config.musicCues[phase]??null});
 }
 start(){if(this.state!=='ready')return;this.deadline=this.now()+this.config.durationSeconds*1000;this.state='running';this.notify();}
 pause(){if(this.state==='running'&&this.pausedAt===null){this.tick();if(this.state==='running')this.pausedAt=this.now();}}
 resume(){if(this.pausedAt!==null){if(this.state==='running')this.deadline+=this.now()-this.pausedAt;this.pausedAt=null;}}
 restart(){this.pausedAt=null;this.state='ready';this.remaining=this.config.durationSeconds;this.lastDisplay=null;this.lastPhase=null;this.start();}
 tick(){if(this.state!=='running'||this.pausedAt!==null)return;this.remaining=Math.max(0,Math.ceil((this.deadline-this.now())/1000));if(this.remaining===0)this.state='expired';this.notify();if(this.state==='expired')this.onExpire();}
 finish(){this.tick();if(this.state!=='running')return false;this.state='complete';this.notify();return true;}
};
