/* Small non-canonical outtakes. Their state is independent of progress and results. */
Object.assign(CINEMA_ASSETS,{blooperIvan:'assets/cinematics/ivan-forest-leaves.webp',blooperForest:'assets/cinematics/blooper-cabin-trail.webp',bloopersAtlas:'assets/cinematics/bloopers-backgrounds.webp',blooperActors:'assets/cinematics/bloopers-actors.webp',blooperEric:'assets/cinematics/eric-walk-v2.webp',blooperClass:'assets/cinematics/classroom-v2.webp',blooperTea:'assets/cinematics/office-tea.webp',blooperJoseReaction:'assets/cinematics/jose-workshop-reaction.webp',blooperKarlaReaction:'assets/cinematics/karla-tea-reaction.webp'});
window.EpikBlooperScenes=[
 {id:'blooper-ivan',title:['Una rama inesperada','An unexpected branch'],assets:['blooperForest','ivanForest','ivanRun'],lines:[['Iván','¡Ahora sí, nada me detiene!','Nothing can stop me now!'],['Iván','Todos mis planes, arruinados por una rama.','All my plans, ruined by a branch.'],['Iván','La próxima vez, reviso también el suelo.','Next time, I’m checking the ground too.']],lineTimes:[.6,4,8]},
 {id:'blooper-eric',title:['La ruta secreta','The secret route'],assets:['bloopersAtlas','ericImpact','ericRun'],lines:[['Eric','Según mis cálculos, la salida está cerca.','According to my calculations, the exit is close.'],['Eric','¿Quién apagó el túnel?','Who turned off the tunnel?'],['Eric','Ay… la salida no era por aquí.','Ow… the exit wasn’t this way.']],lineTimes:[.6,2.4,7.4/2.4+.3]},
 {id:'blooper-jose',title:['Ingeniería de precisión','Precision engineering'],assets:['bloopersAtlas','joseHammer','ignitiaRocket'],lines:[['José Luis','Solo le falta un pequeño ajuste.','It only needs a small adjustment.'],['José Luis','Ese tornillo… seguro era de repuesto.','That screw… must have been a spare.'],['José Luis','¡No, no! ¡Por ahí no es!','No, no! Not that way!']],lineTimes:[.6,4,5.6]},
 {id:'blooper-paola',title:['La última advertencia','The final warning'],assets:['bloopersAtlas','studentsClass','paolaClass'],lines:[['Paola','¿Y las unidades de tu respuesta?','And the units for your answer?'],['Estudiante','Las dejé… en la otra dimensión.','I left them… in the other dimension.'],['Paola','Pues tráelas de vuelta. Los metros no se entregan por separado.','Then bring them back. Metres aren’t handed in separately.']],lineTimes:[.6,4,8]},
 {id:'blooper-office',title:['Todo bajo control','Everything under control'],assets:['bloopersAtlas','angelicaTea','karlaTea'],lines:[['Angélica','¿Todo tranquilo en el área de Ciencias?','Everything quiet in the Sciences area?'],['Karla','Todo tranquilo.','Everything is quiet.'],['Angélica','Solo falta encontrar al Dr. Eric.','We just need to find Dr. Eric.'],['Karla','Sí… ¿otro té?','Yes… more tea?']],lineTimes:[.6,3.8,6,10]}
];
for(const scene of EpikBlooperScenes)CINEMA_SCENE_ASSETS[scene.id]=scene.assets;
window.EpikBloopers=class {
 constructor(){
  if(EpikBloopers.instance)return EpikBloopers.instance;EpikBloopers.instance=this;
  this.assets=new CinemaAssetLoader();this.serial=0;this.active=false;
  document.querySelector('.scene-view').insertAdjacentHTML('beforeend',`<section id="epik-bloopers" hidden aria-label="Mini bloopers"><header><small>AVENTURA EPIK · EXTRAS</small><h2 id="blooper-title"></h2><span id="blooper-count"></span></header><div class="blooper-stage"><canvas id="blooper-canvas" width="960" height="540"></canvas><p id="blooper-loading" role="status"></p></div><aside class="blooper-dialogue" aria-live="polite"><strong id="blooper-speaker"></strong><p id="blooper-line"></p></aside><footer><span id="blooper-caption"></span><button id="blooper-next" class="primary"></button></footer></section>`);
  this.el=document.querySelector('#epik-bloopers');this.canvas=document.querySelector('#blooper-canvas');this.c=this.canvas.getContext('2d');this.next=document.querySelector('#blooper-next');
  this.next.onclick=()=>{if(this.active&&this.failed)this.show(this.index)};
  window.addEventListener('astralia:language',()=>{if(this.active)this.draw()});
  this.resizeObserver=new ResizeObserver(()=>{if(this.active&&!this.loading)this.draw()});this.resizeObserver.observe(this.canvas.parentElement);
 }
 // Embedded playback is clocked by credits; gallery playback owns its RAF.
 open(onClose,{host=null}={}){
  if(this.active)return;
  this.embedded=!!host;this.active=true;this.onClose=onClose;this.previousTrack=Sound.sceneTrack;
  (host||document.querySelector('.scene-view')).append(this.el);
  this.el.classList.toggle('embedded',this.embedded);this.el.hidden=false;this.show(0);
  window.dispatchEvent(new Event('astralia:ui-open'));
  if(!this.embedded){this.last=performance.now();
   const frame=now=>{if(!this.active)return;this.tick(Math.min(.05,(now-this.last)/1000));this.last=now;if(this.active)this.raf=requestAnimationFrame(frame)};
   this.raf=requestAnimationFrame(frame);
  }
 }
 show(index){
  this.index=index;this.time=0;this.lastBeat=-1;this.fell=false;this.lampFailed=false;this.wallHit=false;this.rocketLoose=false;this.loading=true;this.failed=false;this.next.disabled=true;this.inputAfter=performance.now()+500;this.c.clearRect(0,0,960,540);
  const serial=++this.serial;this.draw();
  this.ready=this.assets.ensure(EpikBlooperScenes[index].id,true).then(()=>{
   if(!this.active||serial!==this.serial)return;this.loading=false;if(!this.embedded)Sound.selectBackground(['grassland','missing','music','music','ceremony'][index]);this.draw();
   if(index<4)this.assets.preload(EpikBlooperScenes[index+1].id);
  }).catch(()=>{if(serial!==this.serial||!this.active)return;this.failed=true;this.loading=false;this.draw()});
 }
 tick(dt){if(!this.active||this.loading||this.failed||document.hidden)return;this.time=Math.min(14,this.time+Math.max(0,dt));
  if(this.index===0&&this.time>2.8&&!this.fell){this.fell=true;Sound.tone(90,.2,'triangle',.14);}
  if(this.index===1){
   if(this.time>=2.4&&!this.lampFailed){this.lampFailed=true;Sound.tone(220,.06,'triangle',.05);}
   if(this.ericPose(this.time).hit&&!this.wallHit){this.wallHit=true;Sound.tone(75,.18,'triangle',.18);}
  }
  if(this.index===2&&this.time>=5.2&&!this.rocketLoose){this.rocketLoose=true;Sound.tone(130,.5,'sawtooth',.07);Sound.tone(420,.3,'triangle',.07);}
  if(this.index===2&&this.time<4.5){const beat=Math.floor(this.time/.65);if(beat!==this.lastBeat&&this.time%.65>=.4875){this.lastBeat=beat;Sound.tone(950,.035,'triangle',.10);}}
  this.draw();
  if(this.time>=14){if(this.index===EpikBlooperScenes.length-1)this.close(true);else this.show(this.index+1);}
 }
 draw(){
  const en=I18n.lang==='en',scene=EpikBlooperScenes[this.index],say=(a,b)=>en?b:a,c=this.c,t=this.time,images=this.assets.images;
  document.querySelector('#blooper-title').textContent=scene.title[en?1:0];document.querySelector('#blooper-count').textContent=`${this.index+1} / 5`;
  const status=document.querySelector('#blooper-loading');status.hidden=!this.loading&&!this.failed;status.textContent=this.failed?say('No se pudo cargar la escena. Puedes reintentar.','Could not load this scene. You can retry.'):say('Preparando blooper…','Preparing outtake…');
  this.next.textContent=say('Reintentar','Retry');this.next.hidden=!this.failed;this.next.disabled=!this.failed;
  document.querySelector('#blooper-caption').textContent=say('Tomas falsas · Fuera de la historia principal','Outtakes · Outside the main story');
  if(this.loading||this.failed){document.querySelector('#blooper-speaker').textContent='';document.querySelector('#blooper-line').textContent='';return}
  // Shared 16:9 stage; credits sit in their own column.
  const height=540;if(this.canvas.height!==height)this.canvas.height=height;
  c.imageSmoothingEnabled=false;
  const bg=this.index===0?images.blooperForest:images.bloopersAtlas;
  const bw=this.index===0?bg.naturalWidth:bg.naturalWidth/3,bh=this.index===0?bg.naturalHeight:bg.naturalHeight/2;
  const bx=this.index===0?0:(this.index%3)*bw,by=this.index===0?0:Math.floor(this.index/3)*bh;
  c.drawImage(bg,bx,by,bw,bh,0,0,960,height);
  if(this.index===1){c.fillStyle=this.ericPose(t).lamp===0?'#02040be8':'#030714a0';c.fillRect(0,0,960,height);}
  if(this.index===0)this.ivan(c,images,t);
  if(this.index===1)this.eric(c,images,t);
  if(this.index===2)this.jose(c,images,t);
  if(this.index===3)this.paola(c,images,t);
  if(this.index===4)this.office(c,images,t);
  const times=scene.lineTimes||[.6,4];let lineIndex=0;
  for(let i=1;i<times.length;i++)if(t>=times[i])lineIndex=i;
  const line=scene.lines[lineIndex],start=times[lineIndex],count=Math.max(0,Math.floor((t-start)*36)),speaker=line[0]==='Estudiante'?say('Estudiante','Student'):line[0];
  document.querySelector('#blooper-speaker').textContent=speaker;const text=line[en?2:1].slice(0,count),el=document.querySelector('#blooper-line');if(el.textContent!==text)el.textContent=text;
  const fade=t<.5?1-t/.5:t>13.5?(t-13.5)/.5:0;if(fade){c.fillStyle=`rgba(8,16,34,${fade})`;c.fillRect(0,0,960,height)}
 }
 gesture(key,x,y,h,t,speaking){CinematicSpriteMotion.draw(this.c,this.assets.images[key],key,CinematicSpriteMotion.gestureFrame(t),x,y,h,{speaking,time:t})}
 actor(img,bounds,sx,sy,sw,sh,x,feet,height,rotation=0){
  const [left,top,right,bottom]=bounds,scale=height/(bottom-top),c=this.c;c.save();c.translate(x,feet);c.rotate(rotation);c.drawImage(img,sx,sy,sw,sh,-(left+right)/2*scale,-bottom*scale,sw*scale,sh*scale);c.restore();
 }
 ivan(c,im,t){
  const pose=SceneActing.forest(t),x=130+Math.min(t,2.8)*145+pose.slide;
  c.strokeStyle='#674424';c.lineWidth=12;c.beginPath();c.moveTo(535,463);c.lineTo(610,448);c.moveTo(570,456);c.lineTo(589,432);c.stroke();
  const feet=461+(pose.phase==='fall'?-25:0);
  if(pose.phase==='run')IvanRun.draw(c,im.ivanRun,t,x,feet,215);
  else RPGCast.action(c,im.ivanForest,pose.frame,x,feet,215);
  if(pose.phase==='ground'){c.fillStyle='#f8dd72';c.font='bold 25px serif';for(let i=0;i<3;i++)c.fillText('✦',x+76+Math.cos(t*3+i*2)*23,375+Math.sin(t*3+i*2)*13);}
 }
 blooperActor(index,frame,x,feet,height){
  const bounds=[[[128,18,440,504],[143,43,405,505],[125,31,360,505]],[[119,9,433,488],[141,25,397,486],[77,19,393,486]]];
  const img=this.assets.images.blooperActors,sw=img.naturalWidth/3,sh=img.naturalHeight/2;
  this.actor(img,bounds[frame][index],index*sw,frame*sh,sw,sh,x,feet,height);
 }
 // The lamp fails before the collision: walking remains independent of lighting.
 ericPose(t){
  const speed=180,hit=7.4/2.4,after=Math.max(0,t-hit),lamp=t<1.7?1:t<2?.12:t<2.15?.7:t<2.4?.06:0;
  const recoil=t<hit?0:Math.min(1,after/.22)*18;
  return {lamp,hit:t>=hit,x:180+Math.min(t,hit)*speed-recoil,frame:t<hit?SceneActing.ericRun(t):1,after};
 }
 eric(c,im,t){
  const pose=this.ericPose(t),{x,frame,lamp,hit,after}=pose,feet=478,h=270;
  // Uneven natural rock face instead of regular masonry blocks.
  c.fillStyle=lamp?'#303542':'#101722';c.beginPath();c.moveTo(871,25);c.lineTo(846,81);c.lineTo(827,142);c.lineTo(840,185);c.lineTo(813,239);c.lineTo(827,296);c.lineTo(815,353);c.lineTo(832,415);c.lineTo(820,506);c.lineTo(960,524);c.lineTo(960,20);c.closePath();c.fill();
  for(let i=0;i<9;i++){const y=51+i*50,xx=840+Math.sin(i*2.7)*15;c.fillStyle=lamp?(i%2?'#3a3d47':'#222936'):(i%2?'#19212d':'#0a111d');c.beginPath();c.moveTo(xx,y);c.lineTo(xx+54,y-17);c.lineTo(xx+96,y+19);c.lineTo(xx+58,y+47);c.lineTo(xx-8,y+30);c.closePath();c.fill();}
  const head=feet-h+29,light=x+47;
  if(lamp){c.fillStyle=`rgba(255,235,156,${.2*lamp})`;c.beginPath();c.moveTo(light,head);c.lineTo(815,head-90);c.lineTo(815,head+160);c.closePath();c.fill();}
  c.save();c.globalAlpha=lamp?1:.36;RPGCast.action(c,hit?im.ericImpact:im.ericRun,hit?SceneActing.impact(after):frame,x,feet,h);c.restore();
  if(hit&&after<1.1){c.fillStyle='#f6d28b';c.font='bold 29px serif';c.fillText('¡PUM!',756,179);
   for(let i=0;i<4;i++){const a=i*Math.PI/2+after*3;c.fillRect(801+Math.cos(a)*after*35,242+Math.sin(a)*after*30,5,5);}}
 }
 // A brief takeoff, one uncontrolled loop, then a fast exit out of frame.
 workshopRocketPose(t){
  const u=t-5.2;if(u<=0)return {x:575,y:370,angle:Math.PI/2,visible:true};
  if(u<.6)return {x:575+255*u/.6,y:370-125*(u/.6)**2,angle:Math.PI/2-u*2,visible:true};
  const q=u-.6;
  if(q<1.6){const a=q/1.6*Math.PI*2;return {x:745+85*Math.cos(a),y:245-135*Math.sin(a),angle:-a+.37,visible:true};}
  const exit=q-1.6;return {x:830+exit*750,y:245-exit*180,angle:.6+exit*8,visible:exit<1.3};
 }
 jose(c,im,t){
  const flight=this.workshopRocketPose(t);
  if(flight.visible){
   c.save();c.translate(flight.x,flight.y);c.rotate(flight.angle);
   if(t>=5.2){c.fillStyle='#ffbd4d';c.beginPath();c.moveTo(-12,78);c.lineTo(0,142+Math.sin(t*55)*20);c.lineTo(13,78);c.fill();}
   c.drawImage(im.ignitiaRocket,-110,-110,220,220);c.restore();
  }
  const frame=SceneActing.hammer(t);
  RPGCast.action(c,im.joseHammer,frame,390,480,275);
  if(t<4.5&&frame===3){c.fillStyle='#ffe789';c.fillRect(491,366,5,5);c.fillRect(498,351,4,4);}
  if(t>4){const u=Math.min(1,(t-4)/1);c.fillStyle='#bdcbd2';c.save();c.translate(610+u*38,390+u*u*100);c.rotate(t*4);c.fillRect(-9,-3,18,6);c.fillRect(-11,-7,5,14);c.restore();}
 }
 // Bounds exclude transparent margins. Shared anchors prevent pose changes from sliding feet.
 atlasActor(key,frame,x,feet,height){
  const atlases={
   blooperEric:{cols:2,rows:2,bounds:[[115,21,436,501],[80,21,392,501],[130,15,453,488],[92,15,343,491]],anchors:[270,230,270,230]},
   blooperClass:{cols:3,rows:2,bounds:[[154,13,417,502],[161,10,370,502],[126,23,341,505],[154,7,373,496],[107,4,393,496],[136,3,346,498]],anchors:[270,264,236,270,264,242]},
   blooperKarlaReaction:{cols:2,rows:2,bounds:[[0,0,1,1],[54,19,380,512],[0,0,1,1],[54,0,380,505]],anchors:[0,216,0,216]},
   blooperTea:{cols:2,rows:2,bounds:[[136,18,458,512],[55,20,377,512],[136,0,458,501],[55,0,377,503]],anchors:[297,216,297,216]}
  };
  const a=atlases[key],im=this.assets.images[key],sw=im.naturalWidth/a.cols,sh=im.naturalHeight/a.rows;
  const bounds=a.bounds[frame],scale=height/(bounds[3]-bounds[1]);
  this.c.drawImage(im,(frame%a.cols)*sw,Math.floor(frame/a.cols)*sh,sw,sh,x-a.anchors[frame]*scale,feet-bounds[3]*scale,sw*scale,sh*scale);
 }
 paola(c,im,t){
  RPGCast.action(c,im.paolaClass,SceneActing.paola(t),230,512,375);
  // Three distinct students, in a shallow row facing their teacher.
  const frames=SceneActing.students(t);
  RPGCast.action(c,im.studentsClass,frames[0],510,466,239);
  RPGCast.action(c,im.studentsClass,frames[1],808,466,250);
  RPGCast.action(c,im.studentsClass,frames[2],660,523,264);
 }
 office(c,im,t){
  RPGCast.action(c,im.angelicaTea,SceneActing.tea(t),277,520,330);
  RPGCast.action(c,im.karlaTea,SceneActing.tea(t,true),693,520,330,{flip:false});
  // This atlas already faces inward (left): torso, crossed knees and eyes toward Angélica.
  // Cups, hands and saucers stay attached in the same left-facing sprite.
  c.fillStyle='#3d271e';c.fillRect(446,417,13,111);c.fillRect(504,417,13,111);
  c.fillStyle='#a37649';c.beginPath();c.ellipse(481,413,72,17,0,0,Math.PI*2);c.fill();
  c.fillStyle='#f0e5d0';c.beginPath();c.ellipse(481,393,19,17,0,0,Math.PI*2);c.fill();c.fillRect(469,374,24,5);
  c.strokeStyle='#efe4c688';c.lineWidth=2;
  for(let i=0;i<3;i++){const y=368-((t*14+i*16)%42);c.beginPath();c.moveTo(479+Math.sin(t+i)*5,y);c.quadraticCurveTo(490,y-8,481,y-15);c.stroke();}
 }
 close(notify=false){
  const callback=notify&&this.active?this.onClose:null;this.onClose=null;this.active=false;this.serial++;cancelAnimationFrame(this.raf);this.el.hidden=true;
  if(!this.embedded&&this.previousTrack)Sound.selectBackground(this.previousTrack);callback?.();
 }
};
