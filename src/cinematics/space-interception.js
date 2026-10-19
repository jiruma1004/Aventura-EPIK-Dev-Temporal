/* Final alternativo visual. Una copia de la ruta evita modificar el simulador. */
window.SpaceInterception={
 duration:43,impactAt:17,
 // Accelerate only the approach in space. Animation and audio share this clock.
 advance(time,dt,start=6,end=17){
  if(time<start){const before=Math.min(dt,start-time);time+=before;dt-=before;}
  if(time<end&&dt>0){const flight=Math.min(dt,(end-time)/1.3);time+=flight*1.3;dt-=flight;}
  return time+dt;
 },
 phase(t){return t<6?'launch':t<17?'flight':t<20?'impact':t<27?'parachute':t<31?'cell-entry':t<34?'bars':'captured';},
 plan(simulator){
  if(simulator?.ready&&InterceptionPhysics.evaluate(simulator.params,simulator.launchEpoch).hit)
   return {params:{...simulator.params},epoch:simulator.launchEpoch,selected:true};
  const params={...InterceptionPhysics.initial,delay:0,duration:100};
  const target=InterceptionPhysics.eric(params.duration);
  return {params:InterceptionPhysics.aimAt(params,target.x,target.y),epoch:0,selected:false};
 },
 position(plan,progress){
  const p=plan.params,elapsed=(p.delay+p.duration)*Math.max(0,Math.min(1,progress)),flight=Math.max(0,elapsed-p.delay);
  return {ours:InterceptionPhysics.rocket(p,flight),eric:InterceptionPhysics.eric(plan.epoch+elapsed),flight,
   rotation:Math.PI/2-Math.atan2(p.speed*Math.sin(p.angle*Math.PI/180)-InterceptionPhysics.g*flight,p.speed*Math.cos(p.angle*Math.PI/180))};
 }
};

window.SpaceCinematic=class {
 constructor(library){this.library=library;this.plan=SpaceInterception.plan(library.legacySource?.simulator);}
 sprite(key,x,y,height,rotation=0,alpha=1){
  if(key==='ericBody'){
   const c=this.library.ctx,t=this.currentTime||0;
   // The ejection, landing and prison speech have distinct villain poses.
   const frame=t<20?6:t<32.4?3:Math.floor(t*6)%3===1?5:4;
   c.save();c.globalAlpha*=alpha;this.drawEric(frame,x,y+height/2,height,{rotation});c.restore();return;
  }
  const {ctx:c,images}=this.library,image=images[key];if(!image?.complete||!image.naturalWidth)return;
  const width=height*image.naturalWidth/image.naturalHeight;c.save();c.globalAlpha*=alpha;c.translate(x,y);c.rotate(rotation);c.drawImage(image,-width/2,-height/2,width,height);c.restore();
 }
 // Content bounds exclude detached scraps of adjacent poses without changing
 // the shared foot/head anchor or rescaling a speaking frame.
 drawEric(frame,x,feet,height,options={}){
  const bounds={2:[76,0,203,320],4:[85,0,196,320],5:[85,0,192,320]};
  RPGCast.action(this.library.ctx,this.library.images.ericAir,frame,x,feet,height,{...options,sourceBounds:bounds[frame]});
 }
 parachute(x,feet,height,opening=1){
  const c=this.library.ctx,t=this.currentTime||0;
  const frame=t>21.2&&Math.floor(t*6)%4===2?2:Math.floor(t*3)%2;
  this.drawEric(frame,x,feet,height);
  const top=feet-height*1.9,radius=height*.83*opening;
  c.save();c.strokeStyle='#dce3d6';c.lineWidth=Math.max(1,height*.014);
  for(const k of [-1,-.5,.5,1]){c.beginPath();c.moveTo(x+radius*k,top);c.lineTo(x+Math.sign(k)*height*.22,feet-height*.88);c.stroke();}
  c.fillStyle='#e2cd92';c.strokeStyle='#43384b';c.lineWidth=3;c.beginPath();c.ellipse(x,top,radius,height*.59*opening,0,Math.PI,Math.PI*2);c.closePath();c.fill();c.stroke();
  c.strokeStyle='#8d5966';for(const k of [-.5,0,.5]){c.beginPath();c.moveTo(x+radius*k,top);c.quadraticCurveTo(x+radius*k*.5,top-height*.5*opening,x,top-height*.59*opening);c.stroke();}c.restore();
 }
 explosion(x,y,age,size){
  const {ctx:c,images}=this.library,image=images.burst;if(!image?.complete||!image.naturalWidth)return;
  const frame=Math.min(3,Math.floor(Math.max(0,age)*1.8)),sw=image.naturalWidth/2,sh=image.naturalHeight/2;
  c.save();c.globalAlpha=age<1.6?1:Math.max(0,1-(age-1.6)/1.4);c.drawImage(image,(frame%2)*sw,Math.floor(frame/2)*sh,sw,sh,x-size/2,y-size/2,size,size);c.restore();
 }
 path(transform,color,sample,maxTime,dashed=false){
  const c=this.library.ctx;c.save();c.strokeStyle=color;c.lineWidth=2.5;c.setLineDash(dashed?[5,9]:[]);c.beginPath();
  for(let i=0;i<=100;i++){const p=transform(sample(maxTime*i/100));if(i)c.lineTo(p.x,p.y);else c.moveTo(p.x,p.y);}c.stroke();c.restore();
 }
 prison(cell){
  const {ctx:c,images,canvas}=this.library,image=images.prisonAtlas;if(!image.complete||!image.naturalWidth)return;
  const sw=image.naturalWidth/2,sh=image.naturalHeight,scale=Math.max(canvas.width/sw,canvas.height/sh),width=sw*scale,height=sh*scale;
  c.drawImage(image,cell*sw,0,sw,sh,(canvas.width-width)/2,(canvas.height-height)*(cell===1?.9:.5),width,height);
 }
 draw(t){
  this.currentTime=t;
  const lib=this.library,c=lib.ctx,w=lib.canvas.width,h=lib.canvas.height,size=Math.min(w,h),phase=SpaceInterception.phase(t);
  lib.player.dataset.phase=phase;let caption='',speech='';
  const bg=cell=>lib.background(cell,1,lib.images.spaceAtlas);
  if(t<6){
   bg(0);const u=Math.max(0,(t-1)/5),x=w*(.5+.11*u*u),y=h*(.70-.95*u*u);
   c.fillStyle='#182234';c.fillRect(w*.37,h*.86,w*.28,h*.035);
   this.sprite('ignitiaRocket',x,y,size*.44,Math.max(0,u-.55)*.45);
   if(t<1.8){c.fillStyle='#c1c5bf77';for(let i=0;i<6;i++){c.beginPath();c.ellipse(w*.5+Math.sin(i*3)*size*.05*t,h*.86,size*.045*(t+.1),size*.018,0,0,Math.PI*2);c.fill();}}
   caption='José Luis: Trayectoria confirmada. Zona de lanzamiento despejada. Ignitia, ¡adelante!';
  }else if(t<20){
   bg(1);const p=this.plan.params,end=InterceptionPhysics.evaluate(p,this.plan.epoch),peak=p.speed**2*Math.sin(p.angle*Math.PI/180)**2/(2*InterceptionPhysics.g),maxX=Math.max(end.target.x,end.ours.x)+35,maxY=Math.max(end.target.y,peak)+30;
   const map=q=>({x:w*.08+q.x/maxX*w*.81,y:h*.84-q.y/maxY*h*.67});
   this.path(map,'#91f2bd',tau=>InterceptionPhysics.rocket(p,tau),p.duration,true);
   this.path(map,'#dcacff',tau=>InterceptionPhysics.eric(this.plan.epoch+tau),p.delay+p.duration,true);
   const state=SpaceInterception.position(this.plan,(Math.min(t,17)-6)/11),a=map(state.ours),b=map(state.eric),impact={x:(a.x+b.x)/2,y:(a.y+b.y)/2};
   if(t<17){this.sprite('ericRocket',b.x,b.y,size*.20,Math.PI/2-Math.atan2(.10,.22));this.sprite('ignitiaRocket',a.x,a.y,size*.21,state.rotation);
    c.fillStyle='#c4f5d8';c.font=`${Math.max(14,size*.026)}px sans-serif`;c.textAlign='left';c.fillText(window.I18n?.t(this.plan.selected?'Tu ruta confirmada':'Ruta de demostración')||'Ignitia',w*.06,h*.09);
    caption='José Luis: Ahí está Eric. El cohete sigue tus cálculos… Nos acercamos al punto de encuentro.';
   }else{const age=t-17;this.explosion(impact.x,impact.y,age,size*.58);
    if(age>.4){const u=(age-.4)/2.6;this.sprite('ericBody',impact.x+size*.11*u,impact.y+size*.25*u*u,size*.11,.8*u);}
    caption='¡Intercepción! El cohete de Eric estalla. El científico consigue salir a tiempo.';speech='¡Mi máquina de divergencia!';
   }
  }else if(t<27){
   this.prison(0);const u=(t-20)/7,scale=1-.55*u,body=size*.20*scale,x=w*.5+Math.sin(u*6)*size*.065*(1-u),feet=h*(.38+.23*u);
   c.save();if(u>.78)c.globalAlpha=Math.max(0,1-(u-.78)/.22);this.parachute(x,feet,body,Math.min(1,.5+u*4));c.restore();
   caption='El viento que calculaste dirige a Eric hacia el patio de la prisión.';speech=t>21.2?'¡Esto no termina aquí!':'';
  }else{
   this.prison(1);const u=Math.min(1,(t-27)/4),body=Math.min(h*.62,w*.72),feet=-body*.3+(h*.85+body*.3)*(1-(1-u)**2),x=w*.5;
   if(t<32)this.parachute(x,feet,body,Math.max(0,Math.min(1,(32-t)/1.2))); else this.sprite('ericBody',x,h*.85-body/2,body);
   // La reja cae por delante del personaje, sin cambiar la imagen de la celda.
   if(t>=31){const closed=Math.min(1,(t-31)/1.1),top=-h*(1-closed);c.save();c.translate(0,top);const bar=Math.max(5,size*.012),gap=w*.095;
    for(let bx=w*.12,n=0;bx<w*.92;bx+=gap,n++){c.fillStyle='#3a302b';c.fillRect(bx,0,bar,h);c.fillStyle='#8b7260';c.fillRect(bx+1,0,2,h);
     for(let k=0;k<15;k++){const ry=((k*71+n*47)%521)/521*h;c.fillStyle=k%2?'#b86831':'#76371e';c.fillRect(bx+(k%2)*bar*.3,ry,bar*.7,h*.012+(k%3)*2);}}
    for(const by of [h*.13,h*.91]){c.fillStyle='#514034';c.fillRect(w*.09,by,w*.84,bar*1.5);c.fillStyle='#a8582c';for(let i=0;i<12;i++)c.fillRect(w*(.12+i*.063),by+(i%3),bar*(1+i%3),bar*.7);}c.restore();
   }
   caption=t<31?'Eric termina su descenso en la prisión.':t<35?'La reja se cierra. Eric queda bajo custodia.':'La divergencia está a salvo… por ahora.';
   speech=t<31?'¿Una celda? ¡Esto no estaba en mis cálculos!':t<37?'¡Saldré de aquí! ¡No han visto mi último experimento!':'¡Me vengaré, Ignitia!';
  }
  return {caption,speech};
 }
};
