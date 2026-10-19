window.ESCAPE_ROOMS = window.ESCAPE_ROOMS || [];
window.ESCAPE_ROOMS.push({
  id: 'room-01', name: 'El puente de Galileo', color: [77,92,148],
  environment:{kind:'forest',label:'Bosque del abismo',portraits:[]},
  calculationMode:true,
  spawn: {x:2.2,y:4.0,angle:0}, exitX:19.6, bridge:{start:6,end:17.25,y:3},castleGate:{x:19},
  floorTile(x,y){const tile=this.map[Math.floor(y)]?.[Math.floor(x)];return tile===3&&x>=this.bridge.end?0:tile;},
  challenge: {id:'challenge-01',title:'Tiro parabólico',implemented:true},
  physics: {maxDistance:35,maxEnergy:200,gravity:9.81,metersPerCell:2,originX:3.5,originY:3.5,height:1.2,targetX:19,targetHeight:4.5,tolerance:.5},
  canUnlock(context) {return context.targetHit===true;},
  map: Array.from({length:7},(_,y)=>Array.from({length:21},(_,x)=>{
    if(y===0||y===6||x===0||x===20)return 1;
    if(x===19)return y===3?2:1;
    if(x>=6&&x<18)return 3;
    return 0;
  }))
});
