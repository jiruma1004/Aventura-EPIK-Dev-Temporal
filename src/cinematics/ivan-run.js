/* Hand-drawn gait frames replace the old rigid limb pivots. The render loop
   remains smooth; only the sprite pose advances at this deliberate cadence. */
window.IvanRun={
 frame(time,fps=12){return Math.floor(Math.max(0,time)*fps)%8;},
 draw(c,image,time,x,feet,height,{speed=2.25,flip=false}={}){
  if(!image?.complete||!image.naturalWidth)return false;
  // Existing scenes express speed as cycles: cabin 1.5 -> 8 fps, run 2.25 -> 12.
  const frame=this.frame(time,speed*16/3);
  RPGCast.action(c,image,frame,x,feet,height,{flip});
  // Leaves remain attached to the torso and trousers, also during the new stride.
  c.save();c.translate(x,feet);c.scale(flip?-1:1,1);
  for(const [a,b,angle] of [[-.08,-.86,.5],[.10,-.50,-.3],[-.04,-.23,.7],[.01,-.97,-.6]]){
    c.save();c.translate(a*height,b*height);c.rotate(angle);c.fillStyle='#657b40';c.beginPath();c.ellipse(0,0,height*.028,height*.012,0,0,Math.PI*2);c.fill();c.strokeStyle='#344d26';c.lineWidth=1;c.stroke();c.restore();
  }
  c.restore();return true;
 }
};
