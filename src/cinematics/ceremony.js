/* Una escena de celebración independiente; la galería nunca concede progreso. */
window.IgnitiaCeremony={
 duration:46,certificateAt:38,
 lines:[
  {at:0,until:8,speaker:'Angélica',text:'Acércate. En nombre del Departamento de Ciencias, hoy reconocemos algo más que una misión cumplida: tu ingenio y tu perseverancia.'},
  {at:8,until:16,speaker:'EPI Paola',text:'Te vi detenerte, hacer cuentas y volver a intentarlo. Así se aprende. Fue un gusto acompañarte por estos siete desafíos. ¡Este aplauso es para ti!'},
  {at:16,until:24,speaker:'Angélica',text:'La máquina de divergencia está a salvo y Eric, bajo custodia. Gracias por proteger el tiempo y el espacio. Ignitia pudo construir el cohete; tus decisiones hicieron posible la misión.'},
  {at:24,until:33,speaker:'EPI Paola',text:'Esperemos que no pase nada por poner a un químico en una celda de aluminio y óxido…'},
  {at:33,until:38,speaker:'Angélica',text:'Por ahora, celebremos. Este certificado guarda el resultado de tu aventura. ¡Felicidades por completar las siete pruebas!'}
 ],
 lineAt(t){return this.lines.find(line=>t>=line.at&&t<line.until)||null;},
 star(c,x,y,size){c.save();c.translate(x-size/2,y-size/2);c.scale(size/100,size/100);c.fillStyle='#f1e8c9';c.beginPath();for(const [i,p] of [[51,0],[60,45],[99,29],[69,56],[74,68],[60,65],[34,100],[43,63],[0,52],[45,55]].entries())i?c.lineTo(...p):c.moveTo(...p);c.closePath();c.fill();c.restore();}
};
window.CeremonyScene=class {
 constructor(library,{karla=false}={}){this.karla=karla;this.lines=IgnitiaCeremony.lines.map(line=>karla&&line.speaker==='EPI Paola'?{...line,speaker:'Karla',text:line.at===8?'Soy Karla, coordinadora académica del área de ciencias. Vi cómo defendiste tus ideas con cálculos. Ese esfuerzo merece ser reconocido. ¡Felicidades!':'Espero que no pase nada por tener a un químico en una celda de aluminio y óxido…'}:line);this.lib=library;this.verified=!!library.isComplete?.();this.lastSpeaker=null;
  document.querySelector('#ceremony-certificate footer span:last-child').innerHTML=karla?'Karla<br><small>Coordinadora académica del área de ciencias</small>':'EPI Paola<br><small>Tu guía en Aventura EPIK</small>';
  document.querySelector('#ceremony-preview').hidden=this.verified;
  const result=library.resultSummary?.()||{completed:0,stars:0,assisted:0};
  document.querySelector('#certificate-student').textContent=result.studentName||'';
  library.certificateReverse.reset(result.performance,this.verified);
  document.querySelector('.certificate-score').textContent=(this.verified?result.stars:0)+' / 7';
  document.querySelector('#certificate-results').textContent='';
  document.querySelector('#certificate-csv').hidden=!this.verified;
  document.querySelector('#certificate-instruction').textContent=this.verified?'Descarga tu certificado en PDF y súbelo a la actividad junto con los procedimientos de tus ejercicios.':'Vista previa: completa las siete pruebas para obtener tu certificado de la actividad.';
 }
 draw(t){
  const lib=this.lib,c=lib.ctx,w=lib.canvas.width,h=lib.canvas.height,image=lib.images.ceremonyHall;
  if(image.complete&&image.naturalWidth){const s=Math.max(w/image.naturalWidth,h/image.naturalHeight),iw=image.naturalWidth*s,ih=image.naturalHeight*s;c.drawImage(image,(w-iw)/2,(h-ih)*.7,iw,ih);}
  // El emblema se añade como trazado nítido, separado de la ilustración de fondo.
  c.fillStyle='#102442dd';c.fillRect(w*.37,h*.025,w*.26,h*.24);IgnitiaCeremony.star(c,w*.5,h*.10,Math.min(w*.12,h*.15));c.fillStyle='#f4dfaa';c.font=`${Math.min(w*.04,h*.052)}px Georgia`;c.textAlign='center';c.fillText('IGNITIA',w*.5,h*.23);
  const motion=lib.visualTime??t;
  const line=this.lines.find(line=>t>=line.at&&t<line.until),body=Math.min(h*.64,w*.68),feet=h*.83;
  for(let row=0;row<2;row++){
   const key=row?(this.karla?'castKarla':'castPaola'):'castAngelica',name=row?(this.karla?'Karla':'EPI Paola'):'Angélica';
   const speaking=!!line&&line.speaker===name&&(t-line.at)*38<I18n.t(line.text).length;
   const age=line?t-line.at:0,pose=t>=33?'clap':speaking?(age<1.2?'greet':motion%4<.8?'explain':'talk'):line?.at===24?'think':'idle';
   c.save();c.globalAlpha=1;
   if(row&&this.karla)RPGCast.action(c,lib.images.karlaCeremony,SceneActing.ceremony(t,motion,speaking,true),w*.75,feet,body);
   else if(row)RPGCast.ceremonyPaola(c,lib.images.paolaCeremony,SceneActing.paolaCeremony(t,motion,speaking),w*.75,feet,body);
   else RPGCast.draw(c,lib.images[key],pose,motion,w*.25,feet,body);c.restore();
  }
  const confettiTime=motion;c.save();for(let i=0;i<100;i++){const x=((i*.618033+Math.sin(motion*.8+i)*.014)%1+1)%1*w,y=((i*.137+confettiTime*(.035+i%4*.004))%1)*h;c.fillStyle=['#edcf83','#cf97dd','#89d9c5','#a9c6fa'][i%4];c.save();c.translate(x,y);c.rotate(motion+i);c.fillRect(-2,-4,3+i%3,7);c.restore();}c.restore();
  const box=document.querySelector('#ceremony-dialogue'),cert=document.querySelector('#ceremony-certificate');box.hidden=!line;cert.hidden=t<IgnitiaCeremony.certificateAt;
  if(line){const title=document.querySelector('#ceremony-speaker'),words=document.querySelector('#ceremony-words');title.textContent=line.speaker==='Angélica'?'ANGÉLICA · DIRECTORA DE CIENCIAS':this.karla?'KARLA · COORDINADORA ACADÉMICA DEL ÁREA DE CIENCIAS':'EPI PAOLA';const full=I18n.t(line.text),chars=Math.min(full.length,Math.floor((t-line.at)*38));words.textContent=full.slice(0,chars);if(!lib.paused&&chars>0&&chars<full.length&&this.lastChar!==chars&&chars%3===0)Sound.dialogueBlip(chars);this.lastChar=chars;}
  return t<38?'Ceremonia de reconocimiento · Departamento de Ciencias':'Gracias por formar parte de Ignitia.';
 }
};
