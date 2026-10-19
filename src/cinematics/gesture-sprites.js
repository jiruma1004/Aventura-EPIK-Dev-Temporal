/* Rectángulos y anclajes medidos del atlas; pies fijos al gesticular. */
window.CinematicSpriteData={"ivanCabin":{"bodyHeight":759,"frames":[{"sx":0,"sy":0,"w":887,"h":887,"anchorX":570.5,"anchorY":837,"top":78},{"sx":887,"sy":0,"w":887,"h":887,"anchorX":328.0,"anchorY":837,"top":78}]},"angelicaGesture":{"bodyHeight":983,"frames":[{"sx":0,"sy":0,"w":512,"h":1024,"anchorX":260.0,"anchorY":998,"top":17},{"sx":512,"sy":0,"w":512,"h":1024,"anchorX":255.0,"anchorY":999,"top":16},{"sx":1024,"sy":0,"w":512,"h":1024,"anchorX":254.0,"anchorY":999,"top":16}]},"paolaGesture":{"bodyHeight":964,"frames":[{"sx":0,"sy":0,"w":512,"h":1024,"anchorX":339,"anchorY":995,"top":31},{"sx":512,"sy":0,"w":512,"h":1024,"anchorX":307,"anchorY":995,"top":31},{"sx":1024,"sy":0,"w":512,"h":1024,"anchorX":244,"anchorY":995,"top":31}]}};
CinematicSpriteData.karlaGesture={bodyHeight:964,mouth:[[271,176],[750,176],[1227,176]],frames:[{sx:0,sy:0,w:512,h:1024,anchorX:330,anchorY:995},{sx:512,sy:0,w:512,h:1024,anchorX:296,anchorY:995},{sx:1024,sy:0,w:512,h:1024,anchorX:262,anchorY:995}]};
// El gesto de Angélica ocupa algunos píxeles a la izquierda de su tercera celda.
CinematicSpriteData.angelicaGesture.frames[1].w=480;
Object.assign(CinematicSpriteData.angelicaGesture.frames[2],{sx:992,w:544,anchorX:286});
window.CinematicSpriteMotion={
 gestureFrame(t){const u=((t%3.8)+3.8)%3.8;return u<.6?0:u<.85?1:u<1.65?2:u<1.9?1:0;},
 idleFrame(t){return t%4.2>3.95?1:0;},
 draw(c,image,key,frame,x,feet,height,{speaking=false,time=0}={}){
  if(!image?.complete||!image.naturalWidth)return;
  const data=CinematicSpriteData[key],r=data.frames[frame],scale=height/data.bodyHeight;
  c.save();c.imageSmoothingEnabled=false;c.drawImage(image,r.sx,r.sy,r.w,r.h,x-r.anchorX*scale,feet-r.anchorY*scale,r.w*scale,r.h*scale);
  if(speaking&&Math.floor(time*8)%2&&key!=='ivanCabin'){
   const mouth=data.mouth?.[frame] || (key==='angelicaGesture'?[[269,184],[779,184],[1285,184]][frame]:[[278,174],[755,174],[1206,174]][frame]);
   const mx=x+(mouth[0]-r.sx-r.anchorX)*scale,my=feet+(mouth[1]-r.anchorY)*scale;c.fillStyle='#692c38';c.beginPath();c.ellipse(mx,my,10*scale,4*scale,0,0,Math.PI*2);c.fill();c.fillStyle='#fff0d7';c.fillRect(mx-6*scale,my-3*scale,12*scale,1.5*scale);
  }
  c.restore();
 }
};
