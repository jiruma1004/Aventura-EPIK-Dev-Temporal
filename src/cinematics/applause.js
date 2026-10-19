/* Despedida común a las dos rutas. Atlas propio de dos poses, pies anclados;
   solo se carga tras el diploma, junto con el epílogo elegido. */
window.FinalApplause={joseBounds:[[110,26,326,523],[32,26,246,523]],delay:3,duration:18,names:['Dr. Eric','EPI Iván','Karla','EPI Paola','Angélica','José Luis'],
 // Bounding boxes of the opaque figures within each 1/5 × 1/2 atlas cell.
 bounds:[[[54,14,296,507],[54,15,246,507],[43,16,257,507],[37,15,252,507],[22,17,237,507]],[[58,7,292,498],[56,11,245,498],[49,10,250,498],[40,10,251,498],[25,12,234,498]]]
};
window.ApplauseScene=class {
 constructor(lib){this.lib=lib;this.motion=0;this.lastClap=-1;}
 tick(dt){if(this.lib.paused&&!this.lib.finished)return;this.motion+=dt;const beat=Math.floor(this.motion/.65);if(beat!==this.lastClap){this.lastClap=beat;Sound.applause();}}
 draw(t){
  const l=this.lib,c=l.ctx,w=l.canvas.width,h=l.canvas.height,bg=l.images.applauseSky,cast=l.images.applauseCast;
  const s=Math.max(w/bg.naturalWidth,h/bg.naturalHeight);c.drawImage(bg,(w-bg.naturalWidth*s)/2,(h-bg.naturalHeight*s)/2,bg.naturalWidth*s,bg.naturalHeight*s);
  // Back-to-front arc: the middle pair stands farther away, the ends closer.
  // José Luis has his own two-frame sheet, loaded only for this final scene.
  const arrangement=[0,1,3,4,5,2].map((index,slot)=>{
   const a=(-80+slot*32)*Math.PI/180,depth=1-Math.cos(a);
   return {index,x:w*(.5+.425*Math.sin(a)),feet:h*(.69+.21*depth),body:Math.min(h*(.39+.13*depth),w*(w/h>1.2?.27:.34))};
  }).sort((a,b)=>a.feet-b.feet);
  for(const {index:i,x,feet,body} of arrangement){
   const phase=(this.motion+i*.09)%.65,frame=phase>.29&&phase<.45?1:0;
   c.save();c.globalAlpha=Math.min(1,t/1.1);c.fillStyle='#1b355733';c.beginPath();c.ellipse(x,feet,body*.18,body*.026,0,0,Math.PI*2);c.fill();
   RPGCast.draw(c,l.images[['castEric','castIvan','castKarla','castPaola','castAngelica','castJose'][i]],'clap',this.motion+i*.09,x,feet,body);
   c.fillStyle='#172943';c.textAlign='center';c.font=`bold ${(w/h>1.2?Math.max(11,Math.min(18,body*.07)):26)}px Georgia`;c.fillText(FinalApplause.names[i],x,feet+body*.07);c.restore();
  }
  for(let i=0;i<45;i++){const x=(i*.618+Math.sin(this.motion+i)*.006)%1*w,y=(i*.17+this.motion*.037)%1*h;c.fillStyle=['#eaca72','#c692cf','#89d9c5'][i%3];c.fillRect(x,y,3,6);}
  const en=I18n.lang==='en',messages=en?['Congratulations!','You kept trying. You learned. You made it.','From all of us: congratulations!']:['¡Felicidades!','Lo intentaste. Aprendiste. Lo lograste.','De parte de todos: ¡felicidades!'];
  c.textAlign='center';c.font=`bold ${Math.min(w*.06,h*.075)}px Georgia`;c.lineWidth=5;c.strokeStyle='#142c4c';c.fillStyle='#fff5d9';const title=messages[Math.min(2,Math.floor(t/6))];
  // Fit the longer line on phones as well as landscape tablets.
  if(c.measureText(title).width>w*.9)c.font=`bold ${Math.min(w*.06,h*.075)*w*.9/c.measureText(title).width}px Georgia`;
  c.strokeText(title,w*.5,h*.16);c.fillText(title,w*.5,h*.16);
  c.font=`${Math.min(w*.04,h*.032)}px Georgia`;c.fillStyle='#223653';c.fillText('AVENTURA EPIK · IGNITIA',w*.5,h*.23);
  if(t<.7){c.fillStyle=`rgba(8,19,34,${1-t/.7})`;c.fillRect(0,0,w,h);}
  return en?'A final round of applause for your effort.':'Un último aplauso para reconocer tu esfuerzo.';
 }
};
