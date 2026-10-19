/* Cached console artwork on projected world surfaces: no external image load. */
window.IgnitiaOperationsConsole={
 screen(){
  if(this.texture)return this.texture;
  const a=this.texture=document.createElement('canvas');a.width=640;a.height=360;
  const c=a.getContext('2d');
  c.fillStyle='#102c39';c.fillRect(0,0,640,360);
  c.strokeStyle='#478878';c.lineWidth=1;
  for(let x=0;x<640;x+=32){c.beginPath();c.moveTo(x,0);c.lineTo(x,360);c.stroke();}
  for(let y=0;y<360;y+=30){c.beginPath();c.moveTo(0,y);c.lineTo(640,y);c.stroke();}
  c.fillStyle='#e3ecd3';c.beginPath();c.arc(536,80,37,0,7);c.fill();
  c.fillStyle='#9eb8ab';for(const [x,y,r] of [[520,65,9],[548,91,12],[540,54,6]]){c.beginPath();c.arc(x,y,r,0,7);c.fill();}
  c.strokeStyle='#83ffd2';c.lineWidth=5;c.beginPath();c.moveTo(45,310);c.quadraticCurveTo(240,40,490,90);c.stroke();
  c.setLineDash([9,9]);c.strokeStyle='#ffb76c';c.beginPath();c.moveTo(300,215);c.lineTo(530,84);c.stroke();c.setLineDash([]);
  c.fillStyle='#ffb76c';c.beginPath();c.moveTo(310,185);c.lineTo(335,215);c.lineTo(297,224);c.closePath();c.fill();
  c.fillStyle='#d6ffed';c.font='bold 29px sans-serif';c.fillText('IGNITIA',22,40);
  return a;
 },
 draw(r,player,actors,time){
  const c=r.ctx;
  // Two successive 40% reductions (36% of original size) about the console's ground anchor; interaction stays put.
  const project=(x,y,z)=>{
   const p=actors.project(r,player,7.5+(x-7.5)*.36,5.5+(y-5.5)*.36,z*.36);
   return p?{...p,scale:p.scale*.36}:null;
  };
  const poly=(points,fill,stroke='#77939e')=>{
   const p=points.map(v=>project(...v));if(p.some(v=>!v))return;
   c.beginPath();p.forEach((v,i)=>i?c.lineTo(v.x,v.y):c.moveTo(v.x,v.y));c.closePath();c.fillStyle=fill;c.fill();c.strokeStyle=stroke;c.lineWidth=2;c.stroke();
  };
  // A retro mission-control desk: open knee space, drawer pedestals,
  // pale worktop and a single sloping instrument bank (no floating monitors).
  c.save();
  poly([[6.9,4,.01],[6.9,7,.01],[8.5,7,.01],[8.5,4,.01]],'#07131866','#07131833');
  const box=(x1,x2,y1,y2,z1,z2)=>{
   poly([[x2,y1,z1],[x2,y2,z1],[x2,y2,z2],[x2,y1,z2]],'#586c62');
   poly([[x1,y2,z1],[x2,y2,z1],[x2,y2,z2],[x1,y2,z2]],'#536a60');
   poly([[x1,y1,z1],[x1,y2,z1],[x1,y2,z2],[x1,y1,z2]],'#738a79');
  };
  for(const [a,b] of [[4.15,4.65],[6.35,6.85]]){
   box(7.1,8.25,a,b,.06,.75);
   for(const z of [.28,.50,.70]){
    poly([[7.08,a+.035,z-.17],[7.08,b-.035,z-.17],[7.08,b-.035,z],[7.08,a+.035,z]],'#698372','#40594e');
    poly([[7.065,a+.16,z-.06],[7.065,b-.16,z-.06],[7.065,b-.16,z-.035],[7.065,a+.16,z-.035]],'#c5c8af','#c5c8af');
   }
  }
  // Slim work surface and its front lip.
  poly([[6.85,4.05,.79],[6.85,6.95,.79],[8.4,6.95,.89],[8.4,4.05,.89]],'#d5d5bb','#a3b5a1');
  poly([[6.85,4.05,.73],[6.85,6.95,.73],[6.85,6.95,.79],[6.85,4.05,.79]],'#859b85');
  poly([[7.75,4.05,.87],[7.75,6.95,.87],[8.1,6.95,1.72],[8.1,4.05,1.72]],'#b4c3a6','#687b69');
  poly([[8.1,4.05,1.72],[8.1,6.95,1.72],[8.4,6.95,1.72],[8.4,4.05,1.72]],'#728d79');
  poly([[7.75,6.95,.87],[8.4,6.95,.89],[8.4,6.95,1.72],[8.1,6.95,1.72]],'#4e6a5b');
  // Screens lie in the instrument bank. Map the texture into its projected
  // parallelogram, rather than drawing a camera-facing rectangle.
  const surface=(y,z)=>[7.75+(z-.87)*.35/.85-.018,y,z];
  for(const center of [4.68,5.5,6.32]){
   const corners=[[center-.31,1.54],[center+.31,1.54],[center+.31,1.04],[center-.31,1.04]].map(([y,z])=>surface(y,z));
   poly(corners,'#162b2a','#526d5b');
   const [a,b,,d]=corners.map(v=>project(...v));if(!a||!b||!d)continue;
   c.save();c.transform((b.x-a.x)/640,(b.y-a.y)/640,(d.x-a.x)/360,(d.y-a.y)/360,a.x,a.y);
   c.drawImage(this.screen(),30,24,580,312);c.restore();
  }
  // Physical buttons, selector knobs and a small keyboard on the desk.
  for(let i=0;i<15;i++){
   const y=4.25+i*.17;
   poly([surface(y,.96),surface(y+.07,.96),surface(y+.07,1.01),surface(y,1.01)],i%4===0?'#bd7656':i%3===0?'#f1d378':'#4d7159','#405d4d');
  }
  for(let row=0;row<3;row++)for(let k=0;k<9;k++){
   const x=7.04+row*.11,y=5.14+k*.08;
   poly([[x,y,.81],[x,y+.06,.81],[x+.07,y+.06,.82],[x+.07,y,.82]],'#475c54','#899986');
  }
  // A clipped flight checklist and a cup echo the reference desks.
  poly([[7,4.35,.81],[7,4.85,.81],[7.58,4.85,.85],[7.58,4.35,.85]],'#eee3ba','#928f75');
  for(let i=0;i<4;i++){
   const x=7.12+i*.09;poly([[x,4.41,.825],[x,4.76,.825],[x+.014,4.76,.83],[x+.014,4.41,.83]],'#8c9580','#8c9580');
  }
  const cup=project(7.18,6.68,.94);
  if(cup){c.fillStyle='#a87853';c.fillRect(cup.x-cup.scale*.06,cup.y,cup.scale*.12,cup.scale*.13);c.fillStyle='#e1cda4';c.beginPath();c.ellipse(cup.x,cup.y,cup.scale*.065,cup.scale*.027,0,0,7);c.fill();}
  const label=project(8.04,5.85,1.65);
  if(label){
   c.font=Math.max(10,Math.min(15,label.scale*.12))+'px "Astralia RPG",sans-serif';c.textAlign='center';
   const text='IGNITIA · '+(I18n.lang==='en'?'FLIGHT CONTROL':'CONTROL DE VUELO'),w=c.measureText(text).width+16;
   c.fillStyle='#244e48';c.fillRect(label.x-w/2,label.y-12,w,18);c.fillStyle='#ddf0ca';c.fillText(text,label.x,label.y);
  }
  c.restore();
 }
};
