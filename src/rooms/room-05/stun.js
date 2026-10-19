/* Independent random 20–40 s intervals average 2 sparks/minute. Pickups persist
   on the floor; collecting resets, never adds to, the 15-second stun. */
window.EricSpark=class {
 static minInterval=20;
 static maxInterval=40;
 static flight=1.2;
 static duration=15;
 static legacyLanding={x:14.4,y:7.5,z:.38};
 static safeLanding(p){
  return p&&Number.isFinite(p.x)&&Number.isFinite(p.y)&&p.x>=2&&p.x<=16&&p.y>=2&&p.y<=13
   &&[2.2,12.8].every(y=>Math.hypot(p.x-11.5,p.y-y)>=1.35);
 }
 constructor(onCollect,random=Math.random){
  this.onCollect=onCollect;this.random=random;this.landing={...EricSpark.legacyLanding};this.age=0;this.cycle=0;this.interval=this.rollInterval();this.sparks=[];this.left=0;this.beam=0;this.beamLanding={...this.landing};
  this.sprite=new Image();this.sprite.src='assets/cast/divergence-spark-v1.webp';
  this.eric=new Image();this.eric.src='assets/cast/eric-stunned-v1.webp';
 }
 rollInterval(){const value=this.random();return EricSpark.minInterval+(EricSpark.maxInterval-EricSpark.minInterval)*(Number.isFinite(value)?Math.max(0,Math.min(1,value)):.5);}
 chooseLanding(player){
  const suitable=p=>EricSpark.safeLanding(p)&&Math.hypot(p.x-this.landing.x,p.y-this.landing.y)>=2
   &&Math.hypot(p.x-player.x,p.y-player.y)>=1.5;
  for(let i=0;i<48;i++){
   const p={x:2+this.random()*14,y:2+this.random()*11,z:.38};
   if(suitable(p)){this.landing=p;return;}
  }
  // Bounded fallback for unusual RNG output, still on accessible floor.
  for(const x of [3,7,15])for(const y of [3,7.5,12]){
   const p={x,y,z:.38};if(suitable(p)){this.landing=p;return;}
  }
 }
 get ready(){return this.sparks.some(s=>s.flightAge>=EricSpark.flight);}
 get active(){return this.left>0;}
 tick(dt,player){
  const paused=Math.min(dt,this.left);this.left=Math.max(0,this.left-dt);this.beam=Math.max(0,this.beam-dt);this.age+=dt;
  for(const spark of this.sparks)spark.flightAge+=dt;
  this.cycle+=dt;
  while(this.cycle>=this.interval){
   this.cycle-=this.interval;this.chooseLanding(player);
   this.sparks.push({landing:{...this.landing},flightAge:this.cycle});this.interval=this.rollInterval();
  }
  const pickup=this.sparks.findIndex(s=>s.flightAge>=EricSpark.flight&&Math.hypot(player.x-s.landing.x,player.y-s.landing.y)<.65&&(player.jumpHeight||0)<.65);
  if(pickup>=0){
   this.beamLanding={...this.sparks[pickup].landing};this.sparks.splice(pickup,1);
   this.left=EricSpark.duration;this.beam=.85;this.onCollect();return 0;
  }
  return dt-paused;
 }
 cancel(){this.left=0;this.beam=0;}
 snapshot(){return {version:6,landing:{...this.landing},age:this.age,cycle:this.cycle,interval:this.interval,sparks:this.sparks.map(s=>({landing:{...s.landing},flightAge:s.flightAge})),left:this.left};}
 restore(data,away=0){
  if(!data)return;
  if(!Number.isFinite(data.age)||data.age<0||!Number.isFinite(data.left)||data.left<0||data.left>EricSpark.duration)throw Error('Invalid spark checkpoint');
  let cycle=0,interval=this.rollInterval(),sparks=[];
  const landing=data.version>=4?data.landing:EricSpark.legacyLanding;
  if(!EricSpark.safeLanding(landing))throw Error('Invalid spark landing');
  if(data.version===5||data.version===6){
   cycle=data.cycle;interval=data.interval;sparks=data.sparks;
   const legacy=data.version===5;
   if(!Number.isFinite(interval)||interval<(legacy?30:EricSpark.minInterval)||interval>(legacy?50:EricSpark.maxInterval)||!Array.isArray(sparks))throw Error('Invalid spark interval');
   // Preserve progress through an old 30–50 s interval when adopting 20–40 s.
   if(legacy){cycle*=((interval-10)/interval);interval-=10;}
  }else{
   let flightAge=-1;
   if([4,3,2].includes(data.version)){
    cycle=data.version>=3?data.cycle:0;flightAge=data.flightAge;
    if(!Number.isFinite(cycle)||cycle<0||cycle>=20||!Number.isFinite(flightAge)||(flightAge<0&&flightAge!==-1))throw Error('Invalid legacy spark cycle');
   }else{
    if(typeof data.used!=='boolean'||data.left>0&&!data.used)throw Error('Invalid legacy spark checkpoint');
    if(!data.used&&data.age>=12)flightAge=data.age-12;
   }
   if(flightAge>=0)sparks=[{landing,flightAge}];
  }
  if(!Number.isFinite(cycle)||cycle<0||cycle>=interval||sparks.some(s=>!s||!EricSpark.safeLanding(s.landing)||!Number.isFinite(s.flightAge)||s.flightAge<0))throw Error('Invalid spark cycle');
  this.landing={x:landing.x,y:landing.y,z:.38};this.beamLanding={...this.landing};
  this.sparks=sparks.map(s=>({landing:{x:s.landing.x,y:s.landing.y,z:.38},flightAge:s.flightAge}));
  this.age=data.age;this.cycle=cycle;this.interval=interval;this.left=Math.max(0,data.left-Math.max(0,away));this.beam=0;
 }
 frame(){return [0,1,2,1,0,3][Math.floor(this.age*6)%6];}
 position(spark){const t=Math.max(0,Math.min(1,spark.flightAge/EricSpark.flight)),p=spark.landing;return {x:23.5+(p.x-23.5)*t,y:7.5+(p.y-7.5)*t,z:2.6+(p.z-2.6)*t+Math.sin(t*Math.PI)*1.2};}
 draw(r,player,actors,head){
  const c=r.ctx;
  const art=RPGCast.textureFrame(this.sprite,Math.floor(this.age*7)%4,{w:128,h:128});
  const visible=this.sparks.map(s=>({spark:s,p:this.position(s)}));
  const distance=p=>Math.hypot(p.x-player.x,p.y-player.y);
  visible.sort((a,b)=>distance(b.p)-distance(a.p));
  for(const {p} of visible)if(art)WorldBillboard(r,player,actors,art,p.x,p.y,p.z+Math.sin(this.age*3)*.06,.65,.65);
  // Only the nearest grounded pickup needs a label; the others remain visible.
  const nearest=visible.findLast(v=>v.spark.flightAge>=EricSpark.flight&&distance(v.p)<6);
  if(nearest)this.label(r,player,actors,nearest.p,I18n.lang==='en'?'Spark · walk closer':'Chispa · acércate',.9);
  if(this.active)this.label(r,player,actors,head,(I18n.lang==='en'?'STUNNED':'ATURDIDO')+' · '+Math.ceil(this.left)+' s',.25);
  if(this.beam<=0)return;
  const a=actors.project(r,player,this.beamLanding.x,this.beamLanding.y,.55)||{x:r.canvas.width*.5,y:r.canvas.height*1.03},b=actors.project(r,player,head.x,head.y,head.z-.7);if(!a||!b)return;
  c.save();c.globalAlpha=Math.min(1,this.beam*3);c.lineJoin='round';
  const reduced=window.matchMedia?.('(prefers-reduced-motion: reduce)').matches,phase=reduced?0:Math.floor(this.age*12);
  for(const [width,color] of [[9,'#4bcbd990'],[4,'#98ffff'],[1.5,'#ffffff']]){
   c.lineWidth=width;c.strokeStyle=color;c.beginPath();c.moveTo(a.x,a.y);
   for(let i=1;i<=12;i++){const t=i/12,j=i===12?0:Math.sin(i*12.7+phase)*15;c.lineTo(a.x+(b.x-a.x)*t+j,a.y+(b.y-a.y)*t+j*.6);}c.stroke();
  }c.restore();
 }
 label(r,player,actors,p,text,offset){
  const q=actors.project(r,player,p.x,p.y,p.z+offset);if(!q||q.depth<.2||q.depth>(r.depths[Math.floor(q.x/3)*3]??Infinity)+.1)return;
  const c=r.ctx;c.save();c.font='bold 15px "Astralia RPG", Georgia';c.textAlign='center';const width=c.measureText(text).width+20,x=Math.max(width/2+5,Math.min(r.canvas.width-width/2-5,q.x)),y=Math.max(26,Math.min(r.canvas.height-8,q.y));
  c.fillStyle='#102c39cc';c.strokeStyle='#a6ecda';c.lineWidth=1;c.beginPath();c.roundRect(x-width/2,y-22,width,29,7);c.fill();c.stroke();c.fillStyle='#ddfff2';c.fillText(text,x,y-2);c.restore();
 }
};
