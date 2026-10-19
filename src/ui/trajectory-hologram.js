/* Ventana de telemetría: usa la misma física y el mismo reloj que el proyectil. */
window.TrajectoryHologram=class {
 constructor(lab){
  this.lab=lab;this.panel=document.querySelector('#trajectory-hologram');this.canvas=document.querySelector('#hologram-graph');this.ctx=this.canvas.getContext('2d');this.readout=document.querySelector('#hologram-readout');this.toggle=document.querySelector('#trajectory-toggle');this.preview=document.querySelector('#hologram-prediction');
  this.toggle.onclick=()=>this.panel.hidden?this.open():this.hide();document.querySelector('#hologram-close').onclick=()=>this.hide();
  this.preview.onchange=()=>{lab.prediction.checked=this.preview.checked;lab.draw();};lab.prediction.addEventListener('change',()=>{this.preview.checked=lab.prediction.checked;this.draw();});
 }
 open(){this.closeAfter=null;this.panel.hidden=false;this.toggle.setAttribute('aria-expanded','true');this.preview.checked=this.lab.prediction.checked;this.draw();}
 hide(){this.closeAfter=null;this.panel.hidden=true;this.toggle.setAttribute('aria-expanded','false');}
 // Cuenta tiempo de juego; un disparo nuevo o el cierre manual cancela el anterior.
 complete(){if(!this.panel.hidden)this.closeAfter=3;}
 tick(dt){if(this.closeAfter!==null&&this.closeAfter!==undefined){this.closeAfter-=dt;if(this.closeAfter<=0)this.hide();}}
 draw(){
  if(this.panel.hidden||!this.lab.room)return;
  const lab=this.lab,p=lab.room.physics,s=lab.shot,c=this.ctx,w=this.canvas.width,h=this.canvas.height,predict=!lab.room.calculationMode&&this.preview.checked;
  const models=[];if(s)models.push({v:s.v,angle:s.angle,azimuth:s.azimuth,result:s.result});if(predict)models.push({v:lab.v0,angle:lab.angle,azimuth:lab.azimuth,result:lab.result});
  const stop=r=>r.hit?r.targetTime:r.endTime;
  const maxX=Math.max(22,(p.targetX-p.originX)*p.metersPerCell,...models.map(m=>Projectile.sample(m.v,m.angle,stop(m.result),p,m.azimuth).x))*1.08;
  const maxY=Math.max(4,p.targetHeight+p.tolerance,...models.map(m=>Projectile.sample(m.v,m.angle,Math.max(0,Math.min(stop(m.result),m.result.vy/p.gravity)),p,m.azimuth).y))*1.2;
  const compact=this.panel.clientWidth<260,left=compact?53:43,right=w-18,top=compact?38:28,bottom=h-(compact?42:34),X=x=>left+x/maxX*(right-left),Y=y=>bottom-y/maxY*(bottom-top);
  c.clearRect(0,0,w,h);c.font=`${compact?28:17}px Trebuchet MS, sans-serif`;c.lineWidth=1;c.textAlign='left';
  c.fillStyle='#b0ffd3';c.fillText('altura (m)',left,compact?25:18);
  for(let i=0;i<=4;i++){const x=maxX*i/4,y=maxY*i/4;c.strokeStyle='#91ffc221';c.beginPath();c.moveTo(X(x),top);c.lineTo(X(x),bottom);c.moveTo(left,Y(y));c.lineTo(right,Y(y));c.stroke();c.fillStyle='#9bddb7';c.fillText(y.toFixed(0),8,Y(y)+5);c.textAlign='center';c.fillText(x.toFixed(0),X(x),h-11);c.textAlign='left';}
  const curve=(v,a,az,t,dashed)=>{c.save();c.beginPath();c.rect(left,top,right-left,bottom-top);c.clip();c.strokeStyle=dashed?'#a8e9bf99':'#78ffa8';c.lineWidth=dashed?2.5:4;c.setLineDash(dashed?[7,7]:[]);c.shadowColor='#48ff92';c.shadowBlur=dashed?0:9;c.beginPath();for(let i=0;i<=100;i++){const q=Projectile.sample(v,a,t*i/100,p,az);if(i===0)c.moveTo(X(q.x),Y(q.y));else c.lineTo(X(q.x),Y(q.y));}c.stroke();c.restore();};
  if(predict)curve(lab.v0,lab.angle,lab.azimuth,stop(lab.result),true);
  if(s){curve(s.v,s.angle,s.azimuth,s.t,false);const q=Projectile.sample(s.v,s.angle,s.t,p,s.azimuth);c.fillStyle='#e0ffe7';c.strokeStyle='#63ff9d';c.lineWidth=3;c.shadowColor='#73ffaa';c.shadowBlur=14;c.beginPath();c.arc(X(q.x),Y(Math.max(0,q.y)),7,0,Math.PI*2);c.fill();c.stroke();c.shadowBlur=0;this.readout.textContent=`${s.done?(s.result.hit?'¡Botón activado!':'Último intento'):'En vuelo'} · ${s.t.toFixed(1)} s · lateral ${q.z.toFixed(1)} m`;}
  else this.readout.textContent=predict?'Línea punteada: predicción de tus ajustes':'Dispara para ver el recorrido del orbe.';
  const target=(p.targetX-p.originX)*p.metersPerCell,tx=X(target),ty=Y(p.targetHeight);c.strokeStyle='#f5e8a5';c.fillStyle='#f5e8a5';c.lineWidth=2;c.strokeRect(tx-6,ty-6,12,12);c.textAlign='center';c.font=`${compact?27:16}px Trebuchet MS, sans-serif`;c.fillText('botón',tx,ty-14);c.textAlign='right';c.fillStyle='#b0ffd3';c.fillText('distancia (m)',right,compact?25:18);c.textAlign='left';
 }
};
