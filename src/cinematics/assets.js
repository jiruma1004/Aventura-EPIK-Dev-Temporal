/* Assets remain unrequested until their scene is needed. At most two downloads at once. */
window.CINEMA_ASSETS={applauseJose:'assets/cinematics/applause-jose-luis.webp',applauseSky:'assets/cinematics/applause-sky.webp',applauseCast:'assets/cinematics/applause-cast.webp',atlas:'assets/cinematics/ivan-descent-atlas.webp',wanted:'assets/cast/wanted-b-v1.webp',ivan:'assets/sprites/ivan-walk-v2.png',ivanRight:'assets/cinematics/ivan-walk-right.webp',ivanCabin:'assets/cinematics/ivan-cabin-idle.webp',angelicaGesture:'assets/cinematics/angelica-gesture.webp',karlaGesture:'assets/cinematics/karla-white-sweater.webp',paolaGesture:'assets/cinematics/paola-glasses-a-gesture.webp',angelicaTalk:'assets/sprites/angelica-radio-talk.webp',unknownWanted:'assets/cinematics/unknown-wanted-reference.png',escapedCell:'assets/cinematics/eric-escaped-cell.webp',spaceAtlas:'assets/cinematics/space-interception-atlas.webp',prisonAtlas:'assets/cinematics/modern-prison.webp',ceremonyHall:'assets/cinematics/ceremony-hall.webp',burst:'assets/cinematics/space-explosion.webp',ignitiaRocket:'assets/cinematics/ignitia-star-rocket.webp',ericRocket:'assets/cast/eric-cockpit-b-v1.webp',ericBody:'assets/sprites/dr-eric-standing.png'};
for(const [key,id] of Object.entries({castAngelica:'angelica',castPaola:'paola-b-v1',castKarla:'karla',castEric:'eric-b-v1',castIvan:'ivan-medieval',castJose:'jose-medieval'}))CINEMA_ASSETS[key]='assets/cast/'+id+'.webp';
for(const [key,id] of Object.entries({ivanRun:'ivan-gait-v4',ericRun:'eric-run-b-v1',ericAir:'eric-air-b-v1',karlaCeremony:'karla-ceremony-v2',ericImpact:'eric-impact-b-v1',ivanAction:'ivan-action-v2',studentsClass:'students-cutouts-v3',ivanForest:'ivan-forest',ivanWalk:'ivan-gait-v4',joseHammer:'jose-hammer',angelicaTea:'angelica-tea',karlaTea:'karla-tea-inward-v4',paolaClass:'paola-class-b-v1'}))CINEMA_ASSETS[key]='assets/cast/'+id+'.webp';
CINEMA_ASSETS.angelicaTalk='assets/cast/angelica-portrait.webp';
for(const [key,id] of Object.entries({radioPaola:'paola-b-v1',radioJose:'jose-medieval',radioIvan:'ivan-medieval',radioEric:'eric-b-v1'}))CINEMA_ASSETS[key]='assets/cast/'+id+'-portrait.webp';
CINEMA_ASSETS.paolaCeremony='assets/cast/paola-ceremony-matched-v2.png';
window.CINEMA_SCENE_ASSETS={
 'aplausos-finales':['applauseSky','castEric','castIvan','castKarla','castPaola','castAngelica','castJose'],
 'ignitia-launch':['ivanAction','ivanWalk','castIvan','radioPaola','radioJose','radioIvan'],
 'ignitia-intercepcion':['ivanAction','ivanWalk','spaceAtlas','prisonAtlas','burst','ignitiaRocket','ericRocket','ericAir','castEric','castIvan','radioPaola','radioJose','radioIvan','radioEric'],
 'intercepcion-espacial':['spaceAtlas','prisonAtlas','burst','ignitiaRocket','ericRocket','ericAir','castEric','castIvan','radioPaola','radioJose','radioIvan','radioEric'],
 'ceremonia-ignitia':['ceremonyHall','castAngelica','paolaCeremony'],
 'ceremonia-karla':['ceremonyHall','castAngelica','karlaCeremony'],
 'eric-fuga':['escapedCell','angelicaTalk'],
 'ivan-descenso':['ivanRun','ivanAction','ivanForest','atlas','wanted','castIvan','unknownWanted','radioIvan']
};
window.CinemaAssetLoader=class {
 constructor(){this.images={};this.jobs=new Map();this.queue=[];this.inFlight=0;this.decoded=new Set();for(const key of Object.keys(CINEMA_ASSETS))this.images[key]=new Image();}
 sceneReady(id){return (CINEMA_SCENE_ASSETS[id]||[]).every(key=>this.decoded.has(key));}
 request(key,urgent=false){
  if(this.jobs.has(key)){if(urgent){const i=this.queue.findIndex(j=>j.key===key);if(i>=0)this.queue.unshift(...this.queue.splice(i,1));}return this.jobs.get(key);}
  const promise=new Promise((resolve,reject)=>{const job={key,resolve,reject};urgent?this.queue.unshift(job):this.queue.push(job);});this.jobs.set(key,promise);this.pump();return promise;
 }
 pump(){while(this.inFlight<2&&this.queue.length){const job=this.queue.shift(),image=this.images[job.key];this.inFlight++;image.decoding='async';image.onload=async()=>{try{await image.decode();this.decoded.add(job.key);job.resolve(image);}catch(e){this.jobs.delete(job.key);job.reject(e);}finally{this.inFlight--;this.pump();}};image.onerror=()=>{this.jobs.delete(job.key);job.reject(new Error('Could not load '+job.key));this.inFlight--;this.pump();};image.src=CINEMA_ASSETS[job.key];}}
 ensure(id,urgent=false){return Promise.all((CINEMA_SCENE_ASSETS[id]||[]).map(key=>this.request(key,urgent)));}
 preload(id){return this.ensure(id).then(()=>true,()=>false);}
 prepare(room){
  if(room.corridor)this.preload('ignitia-intercepcion');
  if(!StoryRoute.chosen)return;
  if(room.boss)this.preload(StoryRoute.choice==='particle'?'ceremonia-ignitia':'ceremonia-karla');
  if(room.rocket){this.preload('ignitia-intercepcion');this.preload(StoryRoute.choice==='particle'?'ceremonia-ignitia':'ceremonia-karla');this.preload(StoryRoute.choice==='particle'?'eric-fuga':'ivan-descenso');}
 }
};
