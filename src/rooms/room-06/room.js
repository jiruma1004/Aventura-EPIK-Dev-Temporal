window.ESCAPE_ROOMS=window.ESCAPE_ROOMS||[];
window.ESCAPE_ROOMS.push({
 id:'room-06',name:'La plataforma de Ignitia',color:[105,126,146],rocket:true,
 environment:{kind:'courtyard',label:'Base de lanzamiento Ignitia',tint:'#243b48',ceilingHeight:2.6,portraits:[]},
 spawn:{x:3,y:7.5,angle:0},exitX:100,
 challenge:{id:'challenge-06',title:'Rumbo a la Luna',implemented:true},
 canUnlock(context){return context.launchReady===true;},
 map:Array.from({length:15},(_,y)=>Array.from({length:25},(_,x)=>x===0||x===24||y===0||y===14?1:0))
});
