window.ESCAPE_ROOMS=window.ESCAPE_ROOMS||[];
window.ESCAPE_ROOMS.push({
 id:'room-05',name:'La parábola de Eric',color:[113,119,131],boss:true,bridge:{start:17,end:24,y:7},
 environment:{kind:'courtyard',label:'Patio de la divergencia',tint:'#46536b',portraits:[]},
 spawn:{x:3,y:7.5,angle:0},oakDoor:{x:25,y:7},exitX:25.65,
 challenge:{id:'challenge-05',title:'Dos cortes, una parábola',implemented:true},
 canUnlock(context){return context.parabolaCut===true;},
 map:Array.from({length:15},(_,y)=>Array.from({length:28},(_,x)=>x===0||x===27||y===0||y===14||x===25?(x===25&&y===7?2:1):(x>=17&&x<=23?3:0)))
});
