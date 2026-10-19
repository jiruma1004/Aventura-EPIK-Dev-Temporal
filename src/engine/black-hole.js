/* Viñeta fantástica en tercera persona. Se mueve el avatar, no el elemento canvas. */
window.drawBlackHoleFall=function(c,w,h,time){
 const u=Math.min(1,time/2.6),cx=w*.53,cy=h*.65,r=Math.min(w,h)*.22;
 c.save();c.fillStyle='#040611';c.fillRect(0,0,w,h);
 for(let i=0;i<85;i++){const a=i*2.399,rr=((i*37)%100)/100*Math.max(w,h)*.7;c.fillStyle=i%4?'#b8c5e0':'#dcc6fa';c.globalAlpha=.25+.4*Math.sin(i+time)**2;c.fillRect(cx+Math.cos(a+time*.015)*rr,cy+Math.sin(a+time*.015)*rr*.7,2,2);}c.globalAlpha=1;
 c.fillStyle='#283241';c.beginPath();c.moveTo(0,h*.26);c.lineTo(w*.26,h*.3);c.lineTo(w*.34,h*.38);c.lineTo(0,h*.45);c.fill();c.strokeStyle='#687e9c';c.lineWidth=3;c.stroke();
 const glow=c.createRadialGradient(cx,cy,r*.3,cx,cy,r*2);glow.addColorStop(0,'#d79bf166');glow.addColorStop(.5,'#8a6dea88');glow.addColorStop(1,'#33295000');c.fillStyle=glow;c.fillRect(cx-r*2,cy-r*2,r*4,r*4);
 for(let i=0;i<19;i++){c.strokeStyle=i%3===0?'#ffd0a1':i%2?'#c093ee':'#786bc2';c.globalAlpha=.25+i/30;c.lineWidth=2+(i%3);c.beginPath();c.ellipse(cx,cy,r*(.7+i*.035),r*(.25+i*.012),-.18,time*.6+i*.2,time*.6+i*.2+Math.PI*1.7);c.stroke();}c.globalAlpha=1;
 c.fillStyle='#000008';c.beginPath();c.ellipse(cx,cy,r*.72,r*.55,-.18,0,Math.PI*2);c.fill();
 // Explorador de cuerpo entero que cae desde el borde, gira y se pierde en el horizonte oscuro.
 if(u<.93){const fall=1-(1-u)**2,x=w*.24+(cx-w*.24)*fall,y=h*.3+(cy-h*.3)*fall,scale=Math.min(w,h)/500*Math.max(.025,(1-u)**1.6);
  c.save();c.translate(x,y);c.rotate(u*4.7);c.scale(scale,scale*(1+u*.6));c.fillStyle='#e2bc93';c.fillRect(-12,-40,24,23);c.fillStyle='#8bbfc8';c.fillRect(-15,-47,30,10);c.fillStyle='#28465c';c.fillRect(-15,-15,30,38);c.fillStyle='#d6b679';c.fillRect(-11,-10,22,7);c.fillStyle='#799db9';c.fillRect(-30,-13,13,31);c.fillRect(17,-30,13,39);c.fillStyle='#e2bc93';c.fillRect(-30,18,13,8);c.fillRect(17,-38,13,8);c.fillStyle='#384158';c.fillRect(-16,24,12,36);c.fillRect(5,24,12,30);c.fillStyle='#a4b5ba';c.fillRect(-20,57,17,9);c.fillRect(5,52,20,9);c.restore();
 }
 c.textAlign='center';c.fillStyle='#e5d9f4';c.font=`${Math.max(15,Math.min(23,w*.035))}px Georgia`;c.fillText(u<.45?'El borde cede bajo tus pies…':'El vacío era un agujero negro.',w/2,h*.12);c.font=`${Math.max(11,Math.min(15,w*.022))}px Trebuchet MS`;c.fillStyle='#acbad6';c.fillText('La singularidad te atrae.',w/2,h*.91);
 c.fillStyle=`rgba(0,0,5,${Math.max(0,(u-.85)/.15)*.85})`;c.fillRect(0,0,w,h);c.restore();
};
