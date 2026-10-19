/* Acting is driven by scene time, not by draw count. No clip downloads mid-pose. */
window.SceneActing={
 // These actors have their own expression clocks; a new line never restarts a wave.
 ceremony(t,motion,speaking,karla=false){
  if(karla){if(t>=24&&t<33)return 3;return speaking?Math.floor(motion*6)%2:motion%5>4.7?2:0;}
  return speaking?[0,2,3,2][Math.floor(motion*7)%4]:motion%5<4.4?1:0;
 },
 panic(t,phase){return phase==='tangle'?(t<9?4:5):[5,6,7,6][Math.floor(t*5)%4];},
 students(t){return [t>=2&&t<8?3:0,t>=8?4:1,t>=4&&t<8&&Math.floor(t*5)%2?5:2];},
 impact(after){return after<.12?4:after<.4?5:after<1.3?6:Math.floor(after*4)%4===3?7:6;},
 walk(t){return Math.floor(Math.max(0,t)*8)%8;},
 ericRun(t){return Math.floor(Math.max(0,t)*10)%8;},
 step(t,fps=7){return Math.floor(Math.max(0,t)*fps)%4;},
 forest(t,fallAt=2.8){
  const age=t-fallAt;
  if(age<0)return {phase:'run',frame:this.step(t,9),slide:0};
  if(age<.2)return {phase:'trip',frame:4,slide:age/.2*15};
  if(age<.5)return {phase:'fall',frame:5,slide:15+(age-.2)/.3*35};
  return {phase:'ground',frame:age<1.4?6:7,slide:50};
 },
 hammer(t){return t<4.5?[0,1,2,3][Math.floor(t/.1625)%4]:t<5.2?4:t<5.6?5:Math.floor((t-5.6)*3)%4===3?7:6;},
 paola(t){
  if(t<.6)return 0;
  if(t<2)return Math.floor(t*7)%2;
  if(t<4)return 2+Math.floor(t*7)%2;
  if(t<8)return 4;
  if(t<10)return 4+Math.floor(t*7)%2;
  return t<12?6:7;
 },
 tea(t,karla=false){
  const speak=karla?t>=3.8&&t<5.5||t>=10&&t<12:t>=.6&&t<3.5||t>=6&&t<9;
  if(karla&&t>=7.2&&t<10)return t<8.4?6:7;
  if(speak)return Math.floor(t*7)%2?2:0;
  const sipAt=karla?1:4;
  if(t>=sipAt&&t<sipAt+1.7)return [3,4,4,5][Math.min(3,Math.floor((t-sipAt)/.425))];
  if(karla&&t>=12)return 7;
  return Math.floor(t*3)%12===10?1:0;
 }
};
