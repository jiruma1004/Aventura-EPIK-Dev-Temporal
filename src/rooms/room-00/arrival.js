/* La llegada usa el mismo sendero y cámara que el juego. */
window.CartArrival=class {
 constructor(onDone){this.onDone=onDone;this.active=false;this.time=0;this.beat=0;
  this.el=document.createElement('div');this.el.id='cart-arrival';this.el.hidden=true;this.el.style.cssText='position:absolute;inset:0;z-index:35;display:none;flex-direction:column;justify-content:space-between;padding:24px;background:linear-gradient(#060c1899,transparent 35%,transparent 65%,#060c18aa);pointer-events:auto';
  this.el.innerHTML='<div style="display:flex;justify-content:space-between;align-items:start"><h2 data-arrival-title style="font-size:24px;color:#f6e6be;text-shadow:2px 2px #000"></h2><button data-arrival-skip>Omitir llegada</button></div><div data-arrival-dialog style="display:flex;align-items:center;gap:16px;background:linear-gradient(120deg,#142351ee,#080d27ee);border:2px solid #cabd91;border-radius:8px;padding:12px;max-width:780px;align-self:center"><canvas width="150" height="150" style="width:clamp(64px,12vw,130px);height:auto;image-rendering:pixelated"></canvas><div><strong>Epi Paola</strong><p data-arrival-text style="font-size:clamp(16px,2vw,22px);line-height:1.5;margin:8px 0"></p><button data-arrival-next>Comenzar el sendero</button></div></div>';
  document.querySelector('.scene-view').append(this.el);const style=document.createElement('style');style.textContent='.cart-arriving #question-bubble,.cart-arriving #ask-paola,.cart-arriving #interaction-hint{visibility:hidden!important}';document.head.append(style);this.el.querySelector('[data-arrival-skip]').onclick=()=>this.finish();this.el.querySelector('[data-arrival-next]').onclick=()=>this.finish();
  this.face=new Image();this.face.src='assets/cast/paola-b-v2-portrait.webp';
  this.line='Hasta aquí llega la carreta. Ese cráter no estaba en el camino… El Dr. Eric no nos lo ha puesto fácil. Bajemos: mira cada afirmación y elige dónde saltar. Yo iré contigo, paso a paso.';
 }
 start(player){if(this.active)return;this.active=true;this.time=0;this.beat=0;this.saved={...player};this.notice=document.querySelector('#maze-notice');this.noticeHidden=this.notice.hidden;this.notice.hidden=true;this.el.hidden=false;document.querySelector('.scene-view').classList.add('cart-arriving');this.el.style.display='flex';this.render();}
 finish(){if(!this.active)return;this.active=false;this.el.hidden=true;this.el.style.display='none';document.querySelector('.scene-view').classList.remove('cart-arriving');this.notice.hidden=this.noticeHidden;this.onDone(this.saved);}
 render(){this.el.querySelector('[data-arrival-title]').textContent=I18n.t(this.time<4?'En las afueras del castillo…':'El sendero de las decisiones');const panel=this.el.querySelector('[data-arrival-dialog]');panel.style.visibility=this.time<4?'hidden':'visible';const text=I18n.t(this.line),count=Math.floor(Math.max(0,this.time-4)*38);this.el.querySelector('[data-arrival-text]').textContent=text.slice(0,count);this.el.querySelector('[data-arrival-next]').hidden=count<text.length;
  RPGCast.portrait(this.el.querySelector('canvas'),this.face,this.time>=4&&count<text.length,this.time);
 }
 tick(dt,player){if(!this.active||document.hidden)return;this.time+=dt;
  // Miramos la carreta detenida y giramos hacia el puente, sin tocar el cráter.
  const t=Math.max(0,Math.min(1,(this.time-1.6)/2.5)),ease=t*t*(3-2*t);
  player.angle=1.93*(1-ease);player.pitch=.025+Math.sin(this.time*15)*.003*Math.max(0,1-this.time/2);player.x=this.saved.x;player.y=this.saved.y;
  this.beat-=dt;if(this.time<2.8&&this.beat<=0){Sound.cartStep(this.time/2.8);this.beat=.18+this.time*.08;}this.render();
 }
};
window.drawArrivalCart=function(r,room,player){if(!room.trial)return;const c=r.ctx,P=(x,y,z)=>r.actors.project(r,player,1.85+x,5.6+y,z);
 const poly=(pts,color)=>{const q=pts.map(p=>P(...p));if(q.some(p=>!p))return;c.fillStyle=color;c.beginPath();q.forEach((p,i)=>i?c.lineTo(p.x,p.y):c.moveTo(p.x,p.y));c.closePath();c.fill();};
 const line=(a,b,color,width=.025)=>{const p=P(...a),q=P(...b);if(!p||!q)return;c.strokeStyle=color;c.lineWidth=Math.max(1,p.scale*width);c.beginPath();c.moveTo(p.x,p.y);c.lineTo(q.x,q.y);c.stroke();};
 // Rails, wooden body and iron-rimmed spoked wheels.
 for(const y of [-.27,.27])line([.45,y,.27],[1.1,y,.14],'#705035',.055);
 poly([[-.6,-.42,.34],[.6,-.42,.34],[.6,.42,.34],[-.6,.42,.34]],'#745135');
 for(const y of [.42,-.42]){poly([[-.6,y,.34],[.6,y,.34],[.6,y,.88],[-.6,y,.88]],y<0?'#91643b':'#63432e');for(const z of [.5,.67,.84])line([-.6,y,z],[.6,y,z],'#bd9158',.022);for(const x of [-.55,.55])line([x,y,.31],[x,y,.96],'#443424',.055);}
 poly([[-.6,-.42,.34],[-.6,.42,.34],[-.6,.42,.88],[-.6,-.42,.88]],'#60412f');
 for(const y of [player.y<5.6?-.49:.49])for(const x of [-.43,.43]){for(let i=0;i<24;i++){const a=i*Math.PI/12,b=(i+1)*Math.PI/12;line([x+Math.cos(a)*.3,y,.31+Math.sin(a)*.3],[x+Math.cos(b)*.3,y,.31+Math.sin(b)*.3],'#292a29',.045);if(i%3===0)line([x,y,.31],[x+Math.cos(a)*.27,y,.31+Math.sin(a)*.27],'#b48a54',.025);}}
};
