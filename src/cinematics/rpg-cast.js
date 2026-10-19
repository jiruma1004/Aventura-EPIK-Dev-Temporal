/* Shared, anchored frames. This renderer never downloads in a draw call.
   Scenes own loading, and pass decoded atlases; portraits use small strips. */
window.RPGCast={
 cell:{w:256,h:320,body:284,foot:304,x:128},
 actionCell:{w:384,h:320,body:284,foot:304,x:192},
 clips:{idle:[0,0,0,0,0,0,0,0,1,0,0,0],talk:[0,2,3,2,0,2,3,0],walk:[4,5,6,7],greet:[0,8,9,8,9,8,0],explain:[0,10,10,10,0],think:[11],clap:[12,13],surprise:[14],laugh:[15,3,15,15]},
 frame(pose,t=0){const frames=this.clips[pose]||this.clips.idle,fps=pose==='idle'?3:pose==='walk'?7:pose==='greet'?5:pose==='clap'?6:pose==='explain'?2:8;return frames[Math.floor(Math.max(0,t)*fps)%frames.length];},
 draw(c,image,pose,t,x,feet,height,{rotation=0,flip=false,frame=null,cell=this.cell,sourceBounds=null}={}){
  if(!image?.complete||!image.naturalWidth)return false;
  const f=frame??this.frame(pose,t),k=height/cell.body;
  c.save();c.translate(x,feet);c.rotate(rotation);c.scale(flip?-k:k,k);c.imageSmoothingEnabled=false;
  const [sx,sy,sw,sh]=sourceBounds||[0,0,cell.w,cell.h];
  c.drawImage(image,f%4*cell.w+sx,Math.floor(f/4)*cell.h+sy,sw,sh,-cell.x+sx,-cell.foot+sy,sw,sh);c.restore();return true;
 },
 action(c,image,frame,x,feet,height,options={}){return this.draw(c,image,'idle',0,x,feet,height,{...options,frame,cell:this.actionCell});},
 portrait(canvas,image,speaking,time=0){
  const c=canvas.getContext('2d'),w=canvas.width,h=canvas.height;c.clearRect(0,0,w,h);
  if(!image?.complete||!image.naturalWidth)return;
  const frame=speaking?this.frame('talk',time):this.frame('idle',time),fw=image.naturalWidth/4;
  canvas.dataset.frame=String(frame);canvas.dataset.speaking=String(!!speaking);
  c.imageSmoothingEnabled=false;c.drawImage(image,frame*fw,0,fw,image.naturalHeight,0,0,w,h);
 },
 /* Cached frame crops are CanvasImageSources for the existing world renderer.
    Their getters match the Image checks without allocating a new image each tick. */
 textures:new WeakMap(),
 texture(image,pose,t=0,cell=this.cell){
  const f=pose==='chase'?[0,1,0,1,2,0,3,0][Math.floor(t*6)%8]:pose==='catch'?2:this.frame(pose,t);
  return this.textureFrame(image,f,cell);
 },
 textureFrame(image,f,cell=this.cell){
  if(!image?.complete||!image.naturalWidth)return null;
  let frames=this.textures.get(image);if(!frames){frames=new Map();this.textures.set(image,frames);}
  if(!frames.has(f)){const a=document.createElement('canvas');a.width=cell.w;a.height=cell.h;a.complete=true;a.naturalWidth=cell.w;a.naturalHeight=cell.h;a.getContext('2d').drawImage(image,f%4*cell.w,Math.floor(f/4)*cell.h,cell.w,cell.h,0,0,cell.w,cell.h);frames.set(f,a);}return frames.get(f);
 },
 /* Accessories stay attached to the new bodies and inherit rotation. */
 leaves(c,x,feet,h,rotation=0){c.save();c.translate(x,feet);c.rotate(rotation);for(const [a,b,r] of [[-.15,-.78,.3],[.13,-.46,-.4],[-.12,-.23,.7],[.08,-.96,-.7]]){c.save();c.translate(a*h,b*h);c.rotate(r);c.fillStyle='#607849';c.beginPath();c.ellipse(0,0,h*.03,h*.012,0,0,7);c.fill();c.restore();}c.restore();},
 helmet(c,x,feet,h,lit){const y=feet-h*.94;c.save();c.fillStyle='#a28549';c.beginPath();c.ellipse(x+6,y,h*.15,h*.07,0,Math.PI,Math.PI*2);c.fill();c.fillRect(x-h*.14,y-2,h*.32,5);c.fillStyle=lit?'#fff0b3':'#343941';c.beginPath();c.arc(x+h*.15,y-6,h*.035,0,7);c.fill();c.restore();},
 tea(c,x,y,lift=0){c.save();c.translate(x,y-lift);c.fillStyle='#f2e8cb';c.fillRect(-11,-8,22,14);c.strokeStyle='#f2e8cb';c.lineWidth=3;c.beginPath();c.arc(13,-2,6,-Math.PI/2,Math.PI/2);c.stroke();c.fillStyle='#78583a';c.fillRect(-9,-8,18,3);c.restore();}
};
