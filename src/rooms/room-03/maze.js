/* Puertas físicas y persecución sobre la misma cuadrícula que las colisiones. */
window.IVAN_CHASE_SPEED=.8751645; // Antes: .83349 celdas/s; incremento del 5 %.
window.CONCEPT_QUESTIONS=[
 {title:'El carro encantado',text:'Un carro se mueve en línea recta con velocidad constante sobre un suelo horizontal. ¿Cuál es la fuerza neta sobre él?',answers:['Hacia delante','Es cero','Hacia atrás'],correct:1,hint:'Piensa qué mide la aceleración. Una velocidad constante no implica que no existan fuerzas.',explanation:'Velocidad constante significa aceleración cero: la suma de fuerzas es cero.'},
 {title:'Un instante en lo alto',text:'Lanzas una pelota verticalmente hacia arriba. Sin resistencia del aire, ¿qué aceleración tiene justo en su punto más alto?',answers:['Cero','g hacia arriba','g hacia abajo'],correct:2,hint:'Distingue velocidad de aceleración. ¿La gravedad desaparece cuando la pelota se detiene un instante?',explanation:'En la cima la velocidad es cero, pero la aceleración sigue siendo g hacia abajo.'},
 {title:'Dos esferas, un vacío',text:'Dejas caer dos esferas de masas distintas, desde la misma altura y al mismo tiempo, en el vacío. ¿Cuál llega primero al suelo?',answers:['La más pesada','La más ligera','Llegan juntas'],correct:2,hint:'Relaciona el peso mg con F = ma. ¿Qué pasa con la masa al despejar la aceleración?',explanation:'Sin aire, ambas tienen la misma aceleración g y llegan juntas.'},
 {title:'La elección',text:'¿Cómo se comporta el electrón?',answers:['Partícula','Onda'],correct:[0,1],branch:true,hint:'Recuerda qué observas al estudiar electrones. La puerta azul o la roja: tú decides hasta dónde llega esta historia.',explanation:'La dualidad onda-partícula describe dos aspectos del comportamiento cuántico; esta elección cambia tu historia.'}
];
window.DUNGEON_QUESTIONS=[
 {title:'El sello de inercia',text:'Si la fuerza neta sobre un cuerpo es cero, ¿qué ocurre con su velocidad?',answers:['Permanece constante','Siempre se hace cero'],correct:0,hint:'F = ma: sin fuerza neta no hay aceleración. Puede estar en reposo o seguir moviéndose.'},
 {title:'El sello de gravedad',text:'En el punto más alto de un lanzamiento vertical, sin aire, ¿cuál afirmación es correcta?',answers:['Velocidad y aceleración son cero','v = 0; a apunta hacia abajo'],correct:1,hint:'La gravedad sigue actuando incluso cuando la pelota se detiene por un instante.'},
 {title:'El sello del vacío',text:'En caída libre sin aire, al duplicar la masa de un objeto, su aceleración…',answers:['No cambia','Se duplica'],correct:0,hint:'Escribe mg = ma y cancela la masa en ambos lados.'},
 {title:'El sello del giro',text:'En movimiento circular uniforme, ¿por qué hay aceleración?',answers:['Porque aumenta la rapidez','Porque cambia la dirección'],correct:1,hint:'La velocidad es un vector: importa tanto su magnitud como su dirección.'},
 {title:'El sello del proyectil',text:'Un proyectil vuela sin resistencia del aire. ¿Cómo cambia su velocidad horizontal?',answers:['Permanece constante','Disminuye por la gravedad'],correct:0,hint:'La gravedad apunta verticalmente. No hay fuerza horizontal ni aceleración horizontal.'},
 {title:'El sello del impulso',text:'La misma fuerza neta constante actúa sobre dos cuerpos. El de mayor masa tiene…',answers:['Mayor aceleración','Menor aceleración'],correct:1,hint:'Despeja a = F/m. Mantén F fija y compara las masas.'},
 {title:'El sello de la pendiente',text:'En una gráfica de velocidad contra tiempo, ¿qué representa la pendiente?',answers:['La aceleración','El desplazamiento'],correct:0,hint:'La pendiente es cambio de velocidad dividido entre cambio de tiempo.'},
 {title:'El sello del área',text:'En una gráfica de velocidad contra tiempo, el área con signo representa…',answers:['La aceleración','El desplazamiento'],correct:1,hint:'Multiplica las unidades: (m/s) por s. Conserva el signo de cada área.'},
 {title:'El sello de la cima',text:'En un tiro parabólico oblicuo sin aire, con velocidad horizontal no nula, en la cima la rapidez…',answers:['Es cero','No es cero'],correct:1,hint:'Se anula la componente vertical, pero permanece la componente horizontal.'},
 {title:'El sello del frenado',text:'Un móvil avanza hacia la derecha y reduce su rapidez. Su aceleración apunta…',answers:['Hacia la izquierda','Hacia la derecha'],correct:0,hint:'Para reducir la rapidez, la aceleración debe oponerse a la velocidad.'},
 {title:'El sello de la altura',text:'Sin aire y desde el mismo nivel, dos lanzamientos verticales con igual rapidez inicial y distinta masa alcanzan…',answers:['La misma altura máxima','Más altura con mayor masa'],correct:0,hint:'En v² = v₀² − 2gΔy no aparece la masa. En la cima v = 0.'},
 {title:'El sello de las fuerzas',text:'Las fuerzas de acción y reacción de la tercera ley de Newton actúan…',answers:['Sobre el mismo cuerpo','Sobre cuerpos distintos'],correct:1,hint:'Identifica quién ejerce cada fuerza y quién la recibe: son dos cuerpos diferentes.'}

];
window.ConceptMaze=class {
 constructor(room,onEvent){this.room=room;this.onEvent=onEvent;this.speed=EpikDifficulty.profile.ivanSpeed;this.questionPool=[];this.lastDungeonQuestion=null;this.reset();}
 reset(){
  this.speech=null;this.speechLeft=0;this.tauntClock=0;this.tauntIndex=0;
  this.freezeLeft=0;this.usedFreezeButtons=new Set();this.dungeonVisit=0;this.returnGrace=false;this.dungeon=false;this.room.environment=this.baseEnvironment||this.room.environment;this.baseEnvironment=this.room.environment;this.routeChoice=null;this.stage=0;this.passed=new Set();this.finished=false;this.chasing=false;this.caught=false;this.bite=0;this.path=[];this.pathClock=0;this.doors=[];this.openDoors=new Set();this.grace=0;
  this.enemy={x:1.5,y:8.5};
  // Solo la respuesta correcta tiene un pasaje. Las incorrectas son portales sin cuarto detrás.
  this.room.map=Array.from({length:17},()=>Array(51).fill(1));
  CONCEPT_QUESTIONS.forEach((q,stage)=>{
   const base=stage*12;
   for(let y=1;y<=15;y++)for(let x=base+1;x<=base+7;x++)this.room.map[y][x]=0;
   for(const y of [1,2,3,13,14,15])this.room.map[y][base+4]=1;
   const rows=q.branch?[6,10]:[3,8,13];
   q.answers.forEach((text,choice)=>{
    const door={branch:!!q.branch,x:base+8,y:rows[choice],stage,choice,text,letter:'ABC'[choice],correct:Array.isArray(q.correct)?q.correct.includes(choice):choice===q.correct};this.doors.push(door);this.room.map[door.y][door.x]=2;
    if(door.correct)for(let y=door.y-1;y<=door.y+1;y++)for(let x=base+9;x<=base+11;x++)this.room.map[y][x]=0;
    if(door.correct){this.room.map[door.y][base+12]=0;if(stage===3){this.room.map[door.y][49]=0;this.room.oakDoor=null;this.room.exitX=48.25;}}
   });
  });
 }
 get question(){return this.dungeon?this.dungeonQuestion:CONCEPT_QUESTIONS[Math.min(this.stage,3)];}
 get freezeButton(){if(this.finished)return null;if(this.dungeon)return {id:'dungeon-'+this.dungeonVisit,x:8.5,y:1.02};return this.stage>=1&&this.stage<=3?{id:'stage-'+this.stage,x:this.stage*12+6.5,y:1.02}:null;}
 get freezeUsed(){const b=this.freezeButton;return !!b&&this.usedFreezeButtons.has(b.id);}
 nearFreezeButton(player,renderer){const b=this.freezeButton;if(!b||this.caught)return false;const dx=b.x-player.x,dy=b.y-player.y,d=Math.hypot(dx,dy),angle=Math.atan2(dy,dx);return d<2&&Math.cos(angle-player.angle)>.94&&renderer.cast(this.room,player.x,player.y,angle,false).distance+.08>=d;}
 activateFreeze(player,renderer){if(!this.nearFreezeButton(player,renderer))return false;if(this.freezeUsed){this.onEvent('freeze','Este botón ya se usó. Busca otro en la siguiente galería.');return true;}this.usedFreezeButtons.add(this.freezeButton.id);this.freezeLeft=8;this.onEvent('freeze','Botón azul activado. Iván queda congelado durante 8 segundos.');return true;}
 nextDungeonQuestion(){
  // Bolsa barajada: agotar el banco antes de repetir, incluso después de morir.
  if(!this.questionPool.length){
   this.questionPool=DUNGEON_QUESTIONS.map((_,i)=>i);
   for(let i=this.questionPool.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[this.questionPool[i],this.questionPool[j]]=[this.questionPool[j],this.questionPool[i]];}
   const last=this.questionPool.length-1;
   if(this.questionPool[last]===this.lastDungeonQuestion&&last>0)[this.questionPool[0],this.questionPool[last]]=[this.questionPool[last],this.questionPool[0]];
  }
  this.lastDungeonQuestion=this.questionPool.pop();return DUNGEON_QUESTIONS[this.lastDungeonQuestion];
 }
 enterDungeon(player,door){
  this.savedWorld={map:this.room.map,doors:this.doors};this.dungeon=true;this.dungeonVisit++;this.freezeLeft=0;this.dungeonQuestion=this.nextDungeonQuestion();this.returnGrace=false;
  this.room.environment={kind:'interior',label:'Calabozo del error',tint:'#395338',moss:true,abandoned:true,ceilingHeight:1.5,portraits:[]};
  this.room.map=Array.from({length:13},(_,y)=>Array.from({length:15},(_,x)=>x===0||x===14||y===0||y===12?1:0));
  this.doors=this.dungeonQuestion.answers.map((text,choice)=>({x:13,y:choice===0?3:9,stage:this.stage,choice,text,letter:'AB'[choice],correct:choice===this.dungeonQuestion.correct,dungeon:true}));
  for(const d of this.doors)this.room.map[d.y][d.x]=2;
  Object.assign(player,{x:6.5,y:6.5,angle:0,pitch:0,jumpHeight:0,jumpVelocity:0});
  this.chasing=true;this.enemy={x:2.5,y:6.5};this.path=[];this.pathClock=0;this.grace=10;
  this.onEvent('dungeon',EpikDifficulty.easy?'El portal te arrastra al calabozo. Resuelve el sello para volver a la última prueba alcanzada. Cuidado, alguien te persigue.':'El portal te arrastra al calabozo. Resuelve el sello de dos puertas para volver al inicio. Cuidado, alguien te persigue.');
 }
 leaveDungeon(){
  this.room.map=this.savedWorld.map;this.doors=this.savedWorld.doors;this.room.environment=this.baseEnvironment;this.dungeon=false;this.freezeLeft=0;this.stage=EpikDifficulty.easy?this.stage:0;this.savedWorld=null;
  this.enemy={x:this.stage*12+1.5,y:8.5};this.path=[];this.pathClock=0;this.grace=10;this.returnGrace=true;
  this.onEvent('return',EpikDifficulty.easy?'Sello resuelto. Regresas a la última prueba alcanzada. Iván esperará 10 segundos.':'Sello resuelto. Regresas al inicio del laberinto; las puertas que abriste siguen abiertas. Iván esperará 10 segundos: aprovecha para alejarte.');
 }
 doorAt(x,y){return this.doors.find(d=>d.x===x&&d.y===y);}
 choose(door,player={}){
  if(this.dungeon){
   if(!door||!this.doors.includes(door)||this.caught)return null;
   this.onAnswer?.(door);if(door.correct){this.leaveDungeon();return true;}
   this.onEvent('wrong','Ese sello no responde. '+this.dungeonQuestion.hint+' ¡Iván sigue acercándose!');return false;
  }
  if(!door||door.stage!==this.stage||this.finished||this.caught||this.openDoors.has(door.stage+':'+door.choice))return null;
  this.onAnswer?.(door);if(CONCEPT_QUESTIONS[this.stage].branch){if(this.routeChoice!==null)return null;this.routeChoice=door.choice;StoryRoute.choose(door.choice===0?'particle':'wave');}
  this.room.map[door.y][door.x]=0;this.openDoors.add(door.stage+':'+door.choice);
  if(!door.correct||this.openDoors.size>=2)this.awaken();
  if(door.correct){this.passed.add(this.stage);this.onEvent('correct','La puerta se abre. Explora el pasaje y cruza hasta la siguiente galería.');return true;}
  this.enterDungeon(player,door);
  return false;
 }
 awaken(silent=false){if(this.chasing)return;this.chasing=true;this.enemy={x:this.stage*12+1.5,y:8.5};this.path=[];this.pathClock=0;this.grace=silent?10:2.5;if(!silent)this.onEvent('presence','Oyes pasos entre los muros. No estás solo.');}
 checkpointPosition(stage=this.stage){if(stage===0)return {...this.room.spawn};const previous=this.doors.find(d=>d.stage===stage-1&&d.correct);return {x:stage*12+1.5,y:previous.y+.5,angle:0};}
 restoreCheckpoint(stage){this.reset();this.stage=Math.max(0,Math.min(3,stage));for(const door of this.doors)if(door.stage<this.stage&&door.correct){this.room.map[door.y][door.x]=0;this.passed.add(door.stage);this.openDoors.add(door.stage+':'+door.choice);}if(this.openDoors.size>=2)this.awaken(true);return this.checkpointPosition();}
 routeTo(player){
  const start=[Math.floor(this.enemy.x),Math.floor(this.enemy.y)],goal=[Math.floor(player.x),Math.floor(player.y)],key=(x,y)=>x+','+y,queue=[start],parents=new Map([[key(...start),null]]);
  for(let i=0;i<queue.length;i++){const [x,y]=queue[i];if(x===goal[0]&&y===goal[1])break;for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){const nx=x+dx,ny=y+dy,k=key(nx,ny);if(this.room.map[ny]?.[nx]===0&&!parents.has(k)){parents.set(k,[x,y]);queue.push([nx,ny]);}}}
  if(!parents.has(key(...goal)))return [];
  const path=[];let cell=goal;while(cell){path.unshift({x:cell[0]+.5,y:cell[1]+.5});cell=parents.get(key(...cell));}
  // Recentrar antes de doblar evita cortar las esquinas de los muros.
  if(path.length===1)return [{x:player.x,y:player.y}];
  return path.slice(1);
 }
 tick(dt,player){
  this.speechLeft=Math.max(0,this.speechLeft-dt);
  this.bite=Math.max(0,this.bite-dt);
  const pursuitDt=Math.max(0,dt-this.freezeLeft);
  this.freezeLeft=Math.max(0,this.freezeLeft-dt);
  if(!this.dungeon&&!this.caught){
   const portal=this.doors.find(d=>!d.correct&&this.openDoors.has(d.stage+':'+d.choice)&&player.x>=d.x&&player.x<d.x+4&&Math.abs(player.y-(d.y+.5))<1.5);
   if(portal){this.enterDungeon(player,portal);return;}
  }
  if(!this.dungeon&&this.passed.has(this.stage)&&player.x>(this.stage===3?this.room.exitX:(this.stage+1)*12+1)){this.stage++;if(this.stage===CONCEPT_QUESTIONS.length){this.finished=true;this.onEvent('complete','¡Superaste el laberinto!');return;}this.onEvent('advance','Punto seguro guardado. Nueva galería: lee la pregunta y elige una puerta.');}
  if(!this.chasing||this.finished||this.caught||this.freezeLeft>0)return;
  dt=pursuitDt;if(dt<=0)return;
  this.grace=Math.max(0,this.grace-dt);if(this.grace>0)return;this.returnGrace=false;
  this.tauntClock-=dt;if(this.tauntClock<=0){const lines=['Soy inevitable','¡Todavía falta justificar tu respuesta!','Puedes correr, pero no saltarte los pasos.','¡Te alcanzaré antes de que termine el examen!'];this.speech=lines[this.tauntIndex++%lines.length];this.speechLeft=3.5;this.tauntClock=10;}
  this.pathClock-=dt;
  const atCenter=Math.hypot(this.enemy.x-Math.floor(this.enemy.x)-.5,this.enemy.y-Math.floor(this.enemy.y)-.5)<.001;
  if(!this.path.length||(this.pathClock<=0&&atCenter)){this.path=this.routeTo(player);this.pathClock=.6;}
  const target=this.path[0];if(target){const dx=target.x-this.enemy.x,dy=target.y-this.enemy.y,d=Math.hypot(dx,dy),step=Math.min(d,dt*this.speed);if(d>0){this.enemy.x+=dx/d*step;this.enemy.y+=dy/d*step;}if(d<=step+.00001){this.enemy.x=target.x;this.enemy.y=target.y;this.path.shift();}}
  if(Math.hypot(this.enemy.x-player.x,this.enemy.y-player.y)<.6){this.caught=true;this.bite=1.2;this.onEvent('caught','¡Ñam! EPI Ivan te alcanzó.');}
 }
};
