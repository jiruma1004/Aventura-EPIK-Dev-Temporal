/* La escena principal se representa con la misma sala y motor que la partida. */
window.MissionEnding={
 duration:62,launchAt:8.5,releaseAt:19,orbitAt:25,impactAt:36,
 phase(t){return t<4?'warning':t<7.5?'walk':t<8.5?'tangle':t<19?'ascent':t<25?'release':SpaceInterception.phase(t-19);},
 state(t){
  // Conserva íntegro el ascenso anterior; después del desprendimiento sigue recto.
  const rise=Math.max(0,t-8.5),rocketZ=.16*rise*rise;
  return {x:16,y:7.5,rocketZ,rotation:0,visible:true,attached:t<19,
   pitch:.10+Math.max(0,rocketZ-1.5)/13};
 }
};
window.MissionEndingScene=class {
 constructor(library){
  this.lib=library;this.space=new SpaceCinematic(library);
  // Copia visual: comparte los recursos y la sala, nunca los eventos de misión.
  this.world=Object.create(library.legacySource);this.world.scene=ESCAPE_ROOMS.find(room=>room.rocket);
  this.world.mode='launch';this.world.flightModel=MissionEnding;
  this.renderer=new EscapeRenderer(library.canvas);this.renderer.actors=new RoomActors();this.renderer.outdoor=new CastleExterior();
 }
 draw(t){
  if(t>=MissionEnding.orbitAt){const result=this.space.draw(t-19);this.fade(Math.max(0,1-(t-25)/.55));return result;}
  const flight=MissionEnding.state(t),player={x:3,y:7.5,angle:0,pitch:flight.pitch,jumpHeight:0},r=this.renderer;
  this.world.time=t;r.draw(this.world.scene,player,false,0,t*1000,null,null);
  r.outdoor.draw(r,this.world.scene,player,r.actors,t*1000);
  // Misma plataforma, cable, cohete, pasos, giro por el tobillo y grito ya aprobados.
  this.world.draw(r,player,r.actors);
  const caption=t<4?'Paola: ¡Espera! Veo a alguien detrás del cohete… ¡Iván, aléjate de los cables!':t<7.5?'Iván: ¿Eric? ¿Dónde te metiste? Juraría que te vi por aquí…':t<8.5?'Iván: Un momento… ¿por qué este cable no me suelta?':t<19?'Ignitia despega. Iván queda enganchado por accidente.':'José Luis: Iván se ha soltado… Pero la trayectoria sigue estable. ¡Mantengan el rumbo!';
  this.fade(Math.max(0,(t-24.45)/.55));return {caption,speech:''};
 }
 fade(alpha){if(alpha<=0)return;const l=this.lib;l.ctx.save();l.ctx.fillStyle=`rgba(8,19,34,${Math.min(1,alpha)})`;l.ctx.fillRect(0,0,l.canvas.width,l.canvas.height);l.ctx.restore();}
};
