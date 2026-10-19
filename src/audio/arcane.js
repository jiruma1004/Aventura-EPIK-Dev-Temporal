/* Small procedural effects: no downloads. All layers pass through the effects
   mixer. Charge and impact are separate so interrupted novas cannot explode later. */
Object.assign(Sound,{
 arcaneLayer({from,to,duration,volume,type='sine',noise=false,delay=0,attack=.012,charge=false}){
  if(!this.enabled||!this.ctx||document.hidden)return;
  const ctx=this.ctx,t=ctx.currentTime+delay,g=ctx.createGain();let source,filter;
  if(noise){
   if(this.arcaneNoiseContext!==ctx){
    this.arcaneNoiseContext=ctx;this.arcaneNoise=ctx.createBuffer(1,ctx.sampleRate,ctx.sampleRate);
    const data=this.arcaneNoise.getChannelData(0);let seed=74321;
    for(let i=0;i<data.length;i++){seed=(Math.imul(seed,1664525)+1013904223)>>>0;data[i]=seed/2147483648-1;}
   }
   source=ctx.createBufferSource();source.buffer=this.arcaneNoise;source.loop=true;
   filter=ctx.createBiquadFilter();filter.type='bandpass';filter.Q.value=.8;
   filter.frequency.setValueAtTime(from,t);filter.frequency.exponentialRampToValueAtTime(to,t+duration);
   source.connect(filter).connect(g);
  }else{
   source=ctx.createOscillator();source.type=type;source.frequency.setValueAtTime(from,t);
   source.frequency.exponentialRampToValueAtTime(to,t+duration);source.connect(g);
  }
  g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(volume,t+attack);
  g.gain.exponentialRampToValueAtTime(.0001,t+duration);g.connect(this.master);
  if(charge)(this.arcaneCharges??=new Set()).add(source);
  source.onended=()=>{source.disconnect();filter?.disconnect();g.disconnect();this.arcaneCharges?.delete(source);};
  source.start(t);source.stop(t+duration+.02);
 },
 stopArcaneCharge(){for(const source of this.arcaneCharges||[]){try{source.stop();}catch{}}this.arcaneCharges?.clear();},
 arcaneStun(){
  this.stopArcaneCharge();
  this.arcaneLayer({from:2600,to:650,duration:.2,volume:.17,noise:true});
  for(const delay of [.04,.14,.25])this.arcaneLayer({from:950,to:180,duration:.13,volume:.045,type:'sawtooth',delay});
  this.arcaneLayer({from:170,to:48,duration:1.1,volume:.15,type:'triangle',delay:.1,attack:.04});
  this.arcaneLayer({from:620,to:140,duration:.7,volume:.045,noise:true,delay:.25});
 },
 arcaneNovaCharge(){
  this.stopArcaneCharge();
  this.arcaneLayer({from:55,to:220,duration:2,volume:.13,attack:1.85,charge:true});
  this.arcaneLayer({from:180,to:1050,duration:2,volume:.065,type:'triangle',attack:1.85,charge:true});
  this.arcaneLayer({from:160,to:1800,duration:2,volume:.09,noise:true,attack:1.9,charge:true});
 },
 arcaneNovaImpact(){
  this.stopArcaneCharge();
  this.arcaneLayer({from:120,to:36,duration:1.4,volume:.3});
  this.arcaneLayer({from:1600,to:90,duration:1.3,volume:.24,noise:true});
  for(const [delay,volume] of [[.18,.06],[.42,.035],[.7,.02]])this.arcaneLayer({from:420,to:110,duration:1.5,volume,type:'triangle',delay,attack:.03});
 }
});
