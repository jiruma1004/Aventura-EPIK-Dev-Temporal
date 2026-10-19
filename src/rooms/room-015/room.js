// Desactivar esta opción retira la sala experimental y su entrada del bosque.
window.MEASUREMENT_ENABLED=false;
if(window.MEASUREMENT_ENABLED){
 const first=window.ESCAPE_ROOMS[0];first.measurementEntrance={x:18.5,y:1.01};first.map[0][18]=4;
 window.ESCAPE_ROOMS.push({id:'room-015',name:'La medida del rey',label:'I.5',optional:true,measurement:true,
  color:[96,82,70],environment:{kind:'interior',label:'La antecámara real',portraits:[],tint:'#b7995320'},
  spawn:{x:2.5,y:3.5,angle:0},exitX:8.4,royalDoor:{x:7,y:3},returnDoor:{x:0,y:3},
  challenge:{id:'challenge-015',title:'Área e incertidumbre',implemented:true},
  canUnlock:context=>context.measured===true,
  map:Array.from({length:7},(_,y)=>Array.from({length:10},(_,x)=>x===0&&y===3?4:x===7?y===3?2:1:x===0||x===9||y===0||y===6?1:0))
 });
}
