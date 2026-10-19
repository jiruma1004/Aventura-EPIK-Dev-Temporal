/* Motor visual compartido: raycasting de una cuadrícula, sin dependencias. */
window.EscapeRenderer = class {
  constructor(canvas) { this.canvas=canvas; this.ctx=canvas.getContext('2d'); this.castleGate=new CastleGate();this.choiceMeme=null;const memeSource=new Image();memeSource.onload=()=>{const texture=document.createElement('canvas'),scale=Math.min(1,256/Math.max(memeSource.naturalWidth,memeSource.naturalHeight));texture.width=Math.max(1,Math.round(memeSource.naturalWidth*scale));texture.height=Math.max(1,Math.round(memeSource.naturalHeight*scale));const context=texture.getContext('2d');context.imageSmoothingEnabled=true;context.imageSmoothingQuality='low';context.drawImage(memeSource,0,0,texture.width,texture.height);this.choiceMeme=texture;};memeSource.src='assets/cinematics/electron-choice-meme-hd.webp'; this.art={...makeWallArt(),...makeScenery(),...makeInteriorArt(),oak:makeOakDoor()};
    const moss=document.createElement('canvas');moss.width=moss.height=512;const m=moss.getContext('2d');m.drawImage(this.art.brick,0,0,512,512);m.fillStyle='#22362688';m.fillRect(0,0,512,512);
    for(let i=0;i<900;i++){const x=(i*173)%512,y=(i*97+Math.floor(i/7)*31)%512;m.fillStyle=['#42613a99','#67804c88','#1a3026aa'][i%3];m.fillRect(x,y,3+i%13,5+i%27);}this.art.moss=moss; }
  decorate(room,hit,x,top,height,player){
    RoomDetails.wall(this,room,hit,x,top,height,player);
    if(room.boss)EricArena.wall(this,room,hit,x,top,height);
    if(room.rocket){IgnitiaLaunchpad.wall(this,hit,x,top,height);return;}
    if(room.conceptual&&!room.maze?.dungeon&&hit.axis==='x'&&hit.cx===44&&hit.py>=7.95&&hit.py<8.95&&this.choiceMeme){
      // Cache pequeña creada una sola vez. Una tira por rayo, igual que los muros.
      const art=this.choiceMeme,u=hit.py-7.95,sourceX=Math.min(art.width-1,Math.floor(u*art.width));
      this.ctx.drawImage(art,sourceX,0,1,art.height,x,top-height*.45,3,height*1.45);return;
    }
    if(room.environment?.shop)return;
    if(room.environment?.kind==='forest'){
      if(hit.axis==='x'&&hit.cx===0&&hit.py>=2.5&&hit.py<=5.5){const art=this.art.chalkWall,u=(5.5-hit.py)/3;this.ctx.drawImage(art,Math.min(art.width-1,Math.max(0,u*art.width)),0,1,art.height,x,top+height*.08,3,height*.84);}
      return;
    }
    if(hit.tile!==1||room.environment?.moss)return;
    const south=hit.axis==='y'&&hit.cy===6,north=hit.axis==='y'&&hit.cy===0;
    if(!south&&!north)return;
    let art,start,end;
    const portraitWidth=(320/380)*.76*this.canvas.height*1.32/this.canvas.width;
    if(room.environment?.portraits?.length&&Math.abs(hit.px-4.5)<=portraitWidth/2){art=this.art[room.environment.portraits[south?0:1]];start=4.5-portraitWidth/2;end=4.5+portraitWidth/2;}
    else if(south&&room.environment?.kind!=='gateway'&&Math.abs(hit.px-5.9)<=portraitWidth/2){art=this.art.portrait;start=5.9-portraitWidth/2;end=5.9+portraitWidth/2;}
    else if(north&&hit.px>=4.2&&hit.px<=7.4){art=this.art.equations;start=4.2;end=7.4;}
    else if(hit.px%4>1.65&&hit.px%4<2.15){art=this.art.crest;start=Math.floor(hit.px/4)*4+1.65;end=start+.5;}
    if(!art)return;
    const u=south?(end-hit.px)/(end-start):(hit.px-start)/(end-start);
    this.ctx.save();this.ctx.globalAlpha=Math.max(.35,1/(1+hit.distance*.055));this.ctx.drawImage(art,Math.min(art.width-1,Math.max(0,u*art.width)),0,1,art.height,x,top+height*.12,3,height*.76);this.ctx.restore();
  }
  cast(room,x,y,angle,opened) {
    // Cruces exactos de cuadrícula: las juntas permanecen fijas al mirar alrededor.
    const dx=Math.cos(angle),dy=Math.sin(angle),stepX=dx<0?-1:1,stepY=dy<0?-1:1;
    const deltaX=Math.abs(dx)>1e-10?Math.abs(1/dx):Infinity,deltaY=Math.abs(dy)>1e-10?Math.abs(1/dy):Infinity;
    let cx=Math.floor(x),cy=Math.floor(y),sideX=deltaX===Infinity?Infinity:(dx<0?x-cx:cx+1-x)*deltaX,sideY=deltaY===Infinity?Infinity:(dy<0?y-cy:cy+1-y)*deltaY;
    const by=room.bounds?(dy>0?room.bounds.maxY:room.bounds.minY):null,bd=by!==null&&Math.abs(dy)>1e-8?(by-y)/dy:Infinity;
    for(let step=0;step<128;step++){
      let distance,axis;if(sideX<sideY){distance=sideX;sideX+=deltaX;cx+=stepX;axis='x';}else{distance=sideY;sideY+=deltaY;cy+=stepY;axis='y';}
      if(bd>0&&bd<distance)return {distance:bd,tile:1,px:x+dx*bd,py:by,cx:Math.floor(x+dx*bd),cy:Math.floor(by),axis:'y'};
      if(distance>80)break;const tile=room.map[cy]?.[cx]??1;
      if(tile===1||tile===4||(tile===2&&!opened))return {distance,tile,px:x+dx*distance,py:y+dy*distance,cx,cy,axis};
    }
    return {distance:80,tile:0,px:0,py:0};
  }
  draw(room,player,opened,flash,time,lab,roulette){
    this.tableButton=null;this.cannonBounds=null;
    // Reuse the wall-depth buffer; every sampled column is overwritten below.
    this.depths??=[];this.depths.length=this.canvas.width;
    const cosAngle=Math.cos(player.angle),sinAngle=Math.sin(player.angle);
    const c=this.ctx,w=this.canvas.width,h=this.canvas.height,horizon=h*(.5+(player.pitch||0)),eye=.5+(player.jumpHeight||0);
    const sky=c.createLinearGradient(0,0,0,horizon);sky.addColorStop(0,'#080e29');sky.addColorStop(1,'#25345c');c.fillStyle=sky;c.fillRect(0,0,w,horizon);if(room.environment?.kind!=='interior')for(let i=0;i<45;i++){c.fillStyle='rgba(190,215,255,'+(.2+.3*Math.sin(time/2200+i)**2)+')';c.fillRect((i*137.5)%w,(i*53.8)%(horizon*.86),1.8,1.8);}
    const floor=c.createLinearGradient(0,horizon,0,h);floor.addColorStop(0,'#17213f');floor.addColorStop(1,'#465477');c.fillStyle=floor;c.fillRect(0,horizon,w,h-horizon);
    if(room.trial)room.approach.background(this,player,time);
    if(room.environment?.kind==='courtyard')this.outdoor.background(this,room,player,this.actors);
    if(room.environment?.kind==='interior')this.drawCeiling(room,player,horizon,eye);
    if(room.trial||room.physics||room.environment?.kind==='interior'||room.environment?.kind==='courtyard'){
      // Proyección del suelo: el abismo y el puente ocupan las mismas casillas que las colisiones.
      for(let sy=Math.max(0,horizon+2);sy<h;sy+=4){const depth=(h*eye)/(sy-horizon);let runX=0,runColor=null;
        for(let sx=0;sx<w;sx+=6){const lateral=(sx/w*2-1)*.66;
          const rayX=cosAngle-sinAngle*lateral,rayY=sinAngle+cosAngle*lateral;
          const wx=player.x+depth*rayX,wy=player.y+depth*rayY;
          let floorColor;
          const tile=room.floorTile?room.floorTile(wx,wy):room.map[Math.floor(wy)]?.[Math.floor(wx)];
          if(room.trial){floorColor=room.approach.color(wx,wy);}
          else if(room.lava?.contains(wx,wy)){floorColor=room.lava.rayColor(player,rayX,rayY,depth,eye,time);}
          else if(tile===3&&room.boss){floorColor=EricArena.pitColor(player,rayX,rayY,depth,eye,time,opened);}
          else if(tile===3){const bridge=opened&&Math.floor(wy)===3;if(bridge)floorColor=wx%1<.08?'#a6d6f8':'#4b6586';else{const bx=(wx-(room.bridge.start+room.bridge.end)/2)/((room.bridge.end-room.bridge.start)*.367),by=(wy-3.5)/1.65,r=Math.hypot(bx,by),swirl=Math.sin(Math.atan2(by,bx)*3-r*25+time*.001);floorColor=r<.53?'#010208':r<.62?'#c1a2e1':r<1.05&&swirl>.3?(r<.8?'#895d9c':'#504775'):'#070b18';}}
          else if(room.boss)floorColor=EricArena.floor(wx,wy);
          else if(room.rocket)floorColor=IgnitiaLaunchpad.floor(wx,wy);
          else if(room.environment?.shop)floorColor=InteriorAtmosphere.shopFloor(wx,wy);
          else if(room.environment?.kind==='forest'){const noise=Math.sin(Math.floor(wx*9)*12.9898+Math.floor(wy*9)*78.233)*43758.5453,grain=noise-Math.floor(noise);floorColor=grain>.85?'#405435':grain>.4?'#344a30':'#293f2c';}
          else if(room.guardian&&wx>=GUARDIAN_GARDEN.start)floorColor=room.guardian.floor(wx,wy);
          else if(room.environment?.kind==='courtyard'){const center=room.corridor?4.5:7.5,onPath=Math.abs(wy-center)<1.05,seam=((wx%0.55)+.55)%.55<.04||((wy%0.45)+.45)%.45<.035;floorColor=onPath?(seam?'#776445':'#b19b75'):(seam?'#29313b':'#495052');}
          else {const seam=wx%1<.035||wy%1<.035;floorColor=seam?'#151b25':(Math.floor(wx)+Math.floor(wy))%2?'#3b3c40':'#303339';}
          // Adjacent samples with the same color share a draw call. This is
          // pixel-identical to the individual 6px rectangles, including depth.
          if(floorColor!==runColor){
            if(runColor!==null){c.fillStyle=runColor;c.fillRect(runX,sy,sx-runX,4);}
            runX=sx;runColor=floorColor;
          }
        }
        if(runColor!==null){c.fillStyle=runColor;c.fillRect(runX,sy,w-runX,4);}
      }
    }
    if(room.trial)room.approach.drawCrater(this,player);
    if(room.lava)room.lava.drawSupports(this,player);
    for(let x=0;x<w;x+=3){
      const angle=player.angle+Math.atan((x/w*2-1)*.66);
      const hit=this.cast(room,player.x,player.y,angle,opened);
      const d=Math.max(.02,hit.distance*Math.cos(angle-player.angle)),height=h/d,top=horizon-(1-eye)*height;
      this.depths[x]=d;
      const side=hit.axis==='x';
      const shade=Math.max(.15,1/(1+d*.15))*(side?.7:1);
      if(hit.tile===1&&room.trial){
        // Cada celda equivale a unos 2 m: .25 de altura forma un murete de medio metro.
        if(hit.cy===0||hit.cy===7){const wallTop=horizon-(.25-eye)*height,u=((hit.px%1)+1)%1;c.drawImage(this.art.brick,Math.floor(u*511),0,1,256,x,wallTop,3,height*.25);c.fillStyle=`rgba(8,12,17,${1-shade})`;c.fillRect(x,wallTop,3,height*.25);c.fillStyle='#b0aaa0';c.fillRect(x,wallTop,3,Math.max(1,height*.025));}
        continue;
      }
      if(hit.tile===1){
        const along=side?hit.py:hit.px,u=((along%1)+1)%1,texture=room.environment?.kind==='forest'&&hit.cx!==0&&!(room.castleGate&&hit.cx>=room.castleGate.x)?this.art.forest:room.environment?.shop?((hit.cx+hit.cy)%3===0?this.art.shopWall:this.art.shopShelf):room.environment?.moss||(room.environment?.abandoned&&(hit.cx*3+hit.cy)%4!==0)?this.art.moss:this.art.brick;
        const castleEnd=room.castleGate&&hit.cx>=room.castleGate.x;const forest=room.environment?.kind==='forest'&&hit.cx!==0&&!(room.castleGate&&hit.cx>=room.castleGate.x),wallTop=castleEnd?horizon-(2.8-eye)*height:forest?horizon-(2.6-eye)*height:room.corridor?horizon-(.65-eye)*height:room.boss?horizon-(3-eye)*height:room.environment?.ceilingHeight?horizon-(room.environment.ceilingHeight-eye)*height:top,wallHeight=castleEnd?height*2.8:forest?height*2.6:room.corridor?height*.65:room.boss?height*3:height*(room.environment?.ceilingHeight||1);
        c.drawImage(texture,Math.min(texture.width-1,Math.floor(u*texture.width)),0,1,texture.height,x,wallTop,3,wallHeight);
        if(room.environment?.tint){c.fillStyle=room.environment.tint;c.globalAlpha=.2;c.fillRect(x,wallTop,3,wallHeight);c.globalAlpha=1;}
        c.fillStyle=`rgba(4,8,17,${1-shade})`;c.fillRect(x,wallTop,3,wallHeight);if(room.environment?.abandoned&&(hit.cx*7+hit.cy*3)%4===0)c.drawImage(this.art.vines,u*511,0,1,512,x,wallTop,3,wallHeight);this.decorate(room,hit,x,top,height,player);continue;
      }
      if(hit.tile===2&&room.environment?.ceilingHeight>1){const u=(((hit.axis==='x'?hit.py:hit.px)%1)+1)%1,art=room.environment.shop?this.art.shopWall:this.art.moss;c.drawImage(art,u*511,0,1,170,x,horizon-(room.environment.ceilingHeight-eye)*height,3,(room.environment.ceilingHeight-1)*height);}
      if(hit.tile===2&&room.castleGate){c.fillStyle='#15212a';c.fillRect(x,horizon-(2.8-eye)*height,3,height*2.8);continue;}
      if(hit.tile===4||(hit.tile===2&&room.measurement)){const along=side?hit.py:hit.px,u=((along%1)+1)%1,art=this.measurementArt||(this.measurementArt=MeasurementArt.texture());c.drawImage(art,Math.min(899,Math.floor(u*900)),0,1,800,x,top,3,height);continue;}
      if(hit.tile===2&&room.guardian)continue;
      if(hit.tile===2&&room.oakDoor&&hit.cx===room.oakDoor.x&&hit.cy===room.oakDoor.y){const u=((hit.py%1)+1)%1;c.drawImage(this.art.oak,Math.min(511,Math.floor(u*512)),0,1,512,x,top,3,height);continue;}
      if(hit.tile===2&&room.maze){const door=room.maze.doorAt(hit.cx,hit.cy);if(door){const art=this.actors.doorTexture(door),u=((hit.py%1)+1)%1;c.drawImage(art,Math.min(511,Math.floor(u*512)),0,1,512,x,top,3,height);continue;}}
      if(hit.tile===2&&room.environment?.portal){const u=hit.py-Math.floor(hit.py);c.drawImage(this.art.portalSealed,Math.min(511,Math.floor(u*512)),0,1,512,x,top,3,height);continue;}
      const base=hit.tile===2?[174,105,54]:room.color;
      c.fillStyle=`rgb(${base.map(v=>Math.round(v*shade)).join(',')})`;c.fillRect(x,top,3,height);
      const u=Math.max(Math.abs(hit.px-Math.round(hit.px)),Math.abs(hit.py-Math.round(hit.py)));
      c.fillStyle='rgba(0,0,0,.25)';
      for(let k=1;k<5;k++)c.fillRect(x,top+height*k/5,3,Math.max(1,height*.009));
      if(u<.025)c.fillRect(x,top,3,height);
      if(hit.tile===2 && u>.28){c.fillStyle='#ffcb78';c.fillRect(x,top+height*.43,3,height*.14);}
      this.decorate(room,hit,x,top,height,player);
    }
    for(const portal of this.exitPortals(room,opened))this.drawPortal(room,player,time,horizon,eye,portal,opened);
    if(room.castleGate)this.castleGate.draw(this,room,player,time,opened);
    if(room.physics){
      const p=room.physics;
      const project=(x,y,z)=>{const dx=x-player.x,dy=y-player.y,depth=dx*Math.cos(player.angle)+dy*Math.sin(player.angle),side=-dx*Math.sin(player.angle)+dy*Math.cos(player.angle);if(depth<.15)return null;
        const obstruction=this.cast(room,player.x,player.y,Math.atan2(dy,dx),opened);
        if(obstruction.distance+.1<Math.hypot(dx,dy))return null;
        return {x:w/2+side/depth*w/1.32,y:horizon-(z-eye)*h/depth,scale:h/depth};};
      const target=project(p.targetX,p.originY,p.targetHeight/p.metersPerCell);
      if(target){const r=Math.max(6,target.scale*p.tolerance/p.metersPerCell);c.fillStyle=opened?'#c2ee86':'#ffa95a';c.shadowColor=c.fillStyle;c.shadowBlur=18;c.beginPath();c.arc(target.x,target.y,r,0,Math.PI*2);c.fill();c.shadowBlur=0;c.strokeStyle='#f7edca';c.lineWidth=2;c.strokeRect(target.x-r-5,target.y-r-5,2*r+10,2*r+10);c.fillStyle='#eef3d8';c.font='12px Arial';c.textAlign='center';c.fillText(opened?'PUENTE ACTIVO':'SELLO DE LA VERJA',target.x,target.y-r-18);c.textAlign='left';}
      if(lab?.shot){const shot=lab.shot;const q=Projectile.sample(shot.v,shot.angle,shot.t,p,shot.azimuth),pos=project(p.originX+q.x/p.metersPerCell,p.originY+q.z/p.metersPerCell,q.y/p.metersPerCell);if(pos&&q.y>=0){c.fillStyle=shot.ammo.color;c.beginPath();c.arc(pos.x,pos.y,Math.max(3,pos.scale*.07),0,Math.PI*2);c.fill();}}
      const cannon=project(p.originX,p.originY,.22);
      if(cannon){const scale=Math.min(1.5,cannon.scale/300),cx=cannon.x,cy=cannon.y;
        c.save();c.translate(cx,cy);c.scale(scale,scale);c.strokeStyle='#b7c5db';c.lineWidth=2;
        const poly=(points,fill)=>{c.fillStyle=fill;c.beginPath();points.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.closePath();c.fill();c.stroke();};
        // Plataforma hexagonal y patas estabilizadoras. Silueta baja y ancha.
        poly([[-104,12],[-67,-14],[65,-14],[104,12],[78,41],[-78,41]],'#17243c');
        for(const x of [-82,82]){poly([[x-18,0],[x+18,0],[x+26,34],[x-26,34]],'#3b4d69');c.fillStyle='#e1c38c';c.fillRect(x-18,27,36,5);}
        poly([[-57,0],[-44,-48],[44,-48],[57,0]],'#263a56');
        if(lab.destroyed){poly([[-50,-6],[-31,-37],[-5,-14],[15,-45],[47,-12]],'#282634');c.fillStyle='#ff9762';c.fillRect(-16,-12,32,4);}
        else{
          const recoil=lab.shot&&!lab.shot.done&&lab.shot.t<.2?9:0;
          c.save();c.translate(Math.sin(lab.azimuth*Math.PI/180-player.angle)*24,-52+recoil);c.rotate(lab.azimuth*Math.PI/180*.22);
          const lift=Math.sin(lab.angle*Math.PI/180)*22;
          poly([[-65,17],[-78,-20-lift],[-50,-42-lift],[50,-42-lift],[78,-20-lift],[65,17]],'#496284');
          poly([[-54,6],[-62,-22-lift],[-42,-32-lift],[-33,6]],'#9cbed3');
          poly([[54,6],[62,-22-lift],[42,-32-lift],[33,6]],'#9cbed3');
          poly([[-30,7],[-32,-31-lift],[32,-31-lift],[30,7]],'#101e39');
          const color=lab.loaded?.color??'#8acced';c.strokeStyle='#d3f4ff';c.shadowColor=color;c.shadowBlur=lab.loaded?22:8;
          poly([[0,-56-lift],[22,-25-lift],[0,1],[-22,-25-lift]],color);c.shadowBlur=0;c.strokeStyle='#b7c5db';
          c.fillStyle='#dfcb95';for(const x of [-72,62])c.fillRect(x,-12-lift,10,22);
          if(recoil){c.strokeStyle='#fff1b1';c.lineWidth=4;c.beginPath();c.arc(0,-42-lift,35,0,Math.PI*2);c.stroke();}c.restore();
        }
        c.fillStyle='#c4d7ef';c.font='10px Georgia';c.textAlign='center';c.fillText(lab.destroyed?'SOBRECARGA':'TORRETA PRISMA',0,59);c.restore();
        this.cannonBounds={x:cx-115*scale,y:cy-165*scale,w:230*scale,h:225*scale};
        if(!opened&&!lab.destroyed){
          const label=I18n.t('Acércate y pulsa E'),font=Math.max(12,Math.min(19,scale*16)),pad=12;
          c.save();c.font=`bold ${font}px Georgia`;c.textAlign='center';
          const bw=Math.max(150,c.measureText(label).width+pad*2),bh=font+pad*1.45,bx=cx-bw/2,by=cy-175*scale-bh;
          c.fillStyle='rgba(12,24,52,.72)';c.strokeStyle='#e5c27a';c.lineWidth=2;c.beginPath();c.roundRect(bx,by,bw,bh,9);c.fill();c.stroke();
          c.beginPath();c.moveTo(cx-9,by+bh);c.lineTo(cx,by+bh+10);c.lineTo(cx+9,by+bh);c.closePath();c.fill();c.stroke();
          c.fillStyle='#fff2c2';c.fillText(label,cx,by+font+pad*.45);c.restore();
        }
      }
      const screen=project(p.originX+.3,p.originY+.7,.75);if(screen){const sc=Math.min(1.1,screen.scale/320);c.save();c.translate(screen.x,screen.y);c.scale(sc,sc);c.fillStyle='#111d3bea';c.strokeStyle='#96b7db';c.lineWidth=2;c.fillRect(-75,-55,150,110);c.strokeRect(-75,-55,150,110);c.font='13px Georgia';c.fillStyle='#e4d3a0';c.fillText('ASTROLABIO',-57,-30);c.fillStyle='#bce6ff';c.fillText('Elevación  '+lab.angle+'°',-57,-6);c.fillText(lab.loaded?lab.loaded.mass+' kg · CARGADO':'RECÁMARA VACÍA',-57,38);c.restore();}
      c.fillStyle='rgba(9,17,35,.8)';c.fillRect(20,h-64,315,42);c.fillStyle='#cce099';c.font='12px Arial';c.fillText(opened?'PUENTE DESPLEGADO · AVANZA POR EL CENTRO':'SINGULARIDAD · ACTIVA EL BOTÓN PARA CRUZAR',32,h-39);
      return;
    }
    if(room.roulette){this.drawTable(room,player,opened,roulette,time);return;}
    if(room.trial||room.conceptual||room.corridor||room.boss||room.rocket||room.measurement)return;
    // Retícula y silueta del cañón; sustituibles por sprites en assets/.
    c.strokeStyle='#dbe8c3';c.lineWidth=2;c.beginPath();c.moveTo(w/2-10,h/2);c.lineTo(w/2-4,h/2);c.moveTo(w/2+4,h/2);c.lineTo(w/2+10,h/2);c.moveTo(w/2,h/2-10);c.lineTo(w/2,h/2-4);c.stroke();
    const recoil=flash>0?18:0;
    c.save();c.translate(w/2,h+recoil);c.fillStyle='#101713';c.beginPath();c.moveTo(-95,0);c.lineTo(-46,-120);c.lineTo(-31,-166);c.lineTo(31,-166);c.lineTo(46,-120);c.lineTo(95,0);c.fill();c.fillStyle='#657061';c.fillRect(-26,-157,52,127);c.fillStyle='#303e32';c.fillRect(-17,-149,34,112);c.fillStyle='#d0e690';c.fillRect(-12,-76,24,8);
    if(flash>0){c.fillStyle='#ffe2a1';c.beginPath();c.moveTo(-32,-166);c.lineTo(-46,-220);c.lineTo(-12,-203);c.lineTo(0,-264);c.lineTo(15,-201);c.lineTo(44,-225);c.lineTo(28,-166);c.fill();}c.restore();
    c.fillStyle='rgba(0,0,0,.10)';for(let y=0;y<h;y+=4)c.fillRect(0,y,w,1);
  }
  drawCeiling(room,player,horizon,eye){
    const c=this.ctx,w=this.canvas.width,h=this.canvas.height;
    c.fillStyle='#151922';c.fillRect(0,0,w,horizon);
    for(let sy=0;sy<horizon-1;sy+=5){const depth=h*((room.environment.ceilingHeight||1)-eye)/(horizon-sy);
      for(let sx=0;sx<w;sx+=7){const lateral=(sx/w*2-1)*.66,wx=player.x+depth*(Math.cos(player.angle)-Math.sin(player.angle)*lateral),wy=player.y+depth*(Math.sin(player.angle)+Math.cos(player.angle)*lateral);
        const beam=((wx%2)+2)%2<.16||((wy%2)+2)%2<.12;
        c.fillStyle=beam?'#161b23':(Math.floor(wx*2)+Math.floor(wy*2))%2?'#30333c':'#2a2c34';c.fillRect(sx,sy,7,5);
      }
    }
    c.fillStyle=room.environment.tint;c.globalAlpha=.13;c.fillRect(0,0,w,horizon);c.globalAlpha=1;
  }
  exitPortals(room,opened){
    if(room.maze&&!room.maze.dungeon){
      return room.maze.doors.filter(d=>d.branch&&room.maze.openDoors.has(d.stage+':'+d.choice)).map(d=>({x:room.exitX,y:d.y}));
    }
    if(!opened)return [];
    if(room.corridor)return [{x:room.exitX,y:room.oakDoor.y}];
    if(room.boss)return [{x:room.oakDoor.x+.02,y:room.oakDoor.y}];
    return room.environment?.portal?[{x:7,y:3}]:[];
  }
  drawPortal(room,player,time,horizon,eye,portal={x:7,y:3},opened=true){
    const c=this.ctx,w=this.canvas.width,h=this.canvas.height;
    // Match the physical passage, and keep wall occlusion from either side.
    for(let x=0;x<w;x+=3){const angle=player.angle+Math.atan((x/w*2-1)*.66),dx=Math.cos(angle);if(Math.abs(dx)<1e-7)continue;
      const distance=(portal.x-player.x)/dx;if(distance<=.03)continue;const y=player.y+Math.sin(angle)*distance;if(y<portal.y||y>=portal.y+1)continue;
      const hit=this.cast(room,player.x,player.y,angle,opened);if(hit.distance<distance-.01)continue;
      const height=h/(distance*Math.cos(angle-player.angle)),top=horizon-(1-eye)*height;c.globalAlpha=.88+.12*Math.sin(time/650);c.drawImage(this.art.portalOpen,Math.floor((y-portal.y)*512),0,1,512,x,top,3,height);c.globalAlpha=1;
    }
  }
  drawTable(room,player,opened,roulette,time){
    const c=this.ctx,w=this.canvas.width,h=this.canvas.height,dx=room.table.x-player.x,dy=room.table.y-player.y,depth=dx*Math.cos(player.angle)+dy*Math.sin(player.angle),side=-dx*Math.sin(player.angle)+dy*Math.cos(player.angle);if(depth<.25)return;
    const obstruction=this.cast(room,player.x,player.y,Math.atan2(dy,dx),opened);if(obstruction.distance+.1<Math.hypot(dx,dy))return;
    const x=w/2+side/depth*w/1.32,scale=Math.min(1.7,2/depth),y=h*(.5+(player.pitch||0))+(player.jumpHeight||0)*h/depth+50*scale;
    c.save();c.translate(x,y);c.scale(scale,scale);c.fillStyle='#101936';c.strokeStyle='#b4a071';c.lineWidth=3;c.fillRect(-105,18,22,130);c.strokeRect(-105,18,22,130);c.fillRect(83,18,22,130);c.strokeRect(83,18,22,130);c.fillStyle='#273654';c.beginPath();c.ellipse(0,10,147,49,0,0,Math.PI*2);c.fill();c.stroke();
    c.save();c.translate(0,-96);c.shadowColor='#8ab9ff';c.shadowBlur=20;for(let i=0;i<10;i++){const start=roulette.angle+i*Math.PI/5,end=start+Math.PI/5;c.fillStyle=i%2?'#293c79':'#435595';c.beginPath();c.moveTo(0,0);c.arc(0,0,94,start,end);c.closePath();c.fill();c.strokeStyle='#b0bfe5';c.lineWidth=1;c.stroke();const a=(start+end)/2;c.save();c.translate(Math.cos(a)*67,Math.sin(a)*67);c.rotate(a+Math.PI/2);c.fillStyle='#fff1d0';c.font='bold 19px Georgia';c.textAlign='center';c.fillText(String(i+1).padStart(2,'0'),0,6);c.restore();}c.shadowBlur=0;c.fillStyle='#c9eaff';c.beginPath();c.arc(0,0,20,0,Math.PI*2);c.fill();c.fillStyle='#e2cc92';c.beginPath();c.moveTo(-12,-112);c.lineTo(12,-112);c.lineTo(0,-86);c.fill();c.restore();
    c.fillStyle=roulette.spinning?'#786882':'#a9e8ff';c.shadowColor='#96daff';c.shadowBlur=15;c.beginPath();c.ellipse(0,31,27,12,0,0,Math.PI*2);c.fill();c.shadowBlur=0;c.fillStyle='#ece1b9';c.font='14px Georgia';c.textAlign='center';c.fillText(roulette.spinning?'EL DESTINO GIRA…':'PULSA EL CRISTAL',0,81);c.restore();this.tableButton={x,y:y+31*scale,r:30*scale};
  }

};
