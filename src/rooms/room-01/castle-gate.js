/* El GIF de archivo y la verja del mundo se dibujan con los mismos fotogramas. */
window.CastleGate=class {
 constructor(){this.art=new Image();this.art.src='assets/cinematics/castle-arch.webp';this.canvas=document.createElement('canvas');this.canvas.width=this.canvas.height=512;this.lastFrame=-1;this.wasOpen=false;this.start=0;}
 render(progress,preview=false){
  const c=this.canvas.getContext('2d'),s=512;c.clearRect(0,0,s,s);c.imageSmoothingEnabled=false;
  c.save();c.beginPath();c.moveTo(158,512);c.lineTo(158,275);c.quadraticCurveTo(161,214,256,180);c.quadraticCurveTo(347,214,355,275);c.lineTo(355,512);c.closePath();c.clip();
  const glow=c.createLinearGradient(0,180,0,512);glow.addColorStop(0,'#132536');glow.addColorStop(1,progress>.8?'#6b5637':'#132126');c.fillStyle=glow;c.fillRect(130,175,250,340);
  c.translate(0,-progress*345);c.fillStyle='#10191e';c.strokeStyle='#829291';c.lineWidth=2;
  for(let x=162;x<360;x+=25){c.fillRect(x,170,10,332);c.strokeRect(x,170,10,320);c.beginPath();c.moveTo(x,500);c.lineTo(x+5,514);c.lineTo(x+10,500);c.fill();}
  for(let y=215;y<500;y+=64){c.fillStyle='#39494a';c.fillRect(150,y,218,12);c.fillStyle='#bec4a9';for(let x=166;x<356;x+=25)c.fillRect(x,y+3,3,3);}c.restore();
  if(this.art.complete&&this.art.naturalWidth)c.drawImage(this.art,0,0,s,s);
  if(preview){c.fillStyle=progress>0?'#b9ed90':'#ffb468';c.shadowColor=c.fillStyle;c.shadowBlur=15;c.beginPath();c.arc(256,101,12,0,Math.PI*2);c.fill();c.shadowBlur=0;}
  return this.canvas;
 }
 frame(opened,time){if(opened&&!this.wasOpen)this.start=time;if(!opened)this.start=0;this.wasOpen=opened;const progress=opened?Math.min(1,(time-this.start)/1400):0,frame=Math.floor(progress*30);if(frame!==this.lastFrame||!this.loaded&&this.art.complete){this.loaded=this.art.complete&&this.art.naturalWidth;this.render(progress);this.lastFrame=frame;}return this.canvas;}
 draw(renderer,room,player,time,opened){if(!room.castleGate)return;WorldBillboard(renderer,player,renderer.actors,this.frame(opened,time),room.castleGate.x-.025,3.5,0,2.8,2.8,true);}
};
