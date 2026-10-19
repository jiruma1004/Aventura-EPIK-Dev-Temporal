// Cinemática ilustrativa: no modifica el modelo ni las respuestas del ejercicio.
// El control queda desajustado por la carga descentrada y su desprendimiento.
window.RocketFinaleScene={
 releaseAt:19,
 diveAt:27,
 impactAt:30.5,
 dialogueAt:33,
 state(time){
  if(time>=this.diveAt){
   const start=this.state(this.diveAt-.000001),t=Math.min(time,this.dialogueAt)-this.diveAt;
   const progress=Math.min(1,t/(this.impactAt-this.diveAt));
   return {...start,phase:time<this.impactAt?'dive':'impact',attached:false,
    rocketZ:start.rocketZ*(1-progress*progress),rotation:start.rotation+t*2,
    y:start.y+Math.sin(t)*.5,visible:time<this.impactAt,
    // Conserva la mirada al cielo mientras el cohete cae fuera de cuadro.
    pitch:start.pitch,caption:''};
  }
  const t=Math.min(time,this.dialogueAt),rise=Math.max(0,t-8.5);
  const loose=Math.max(0,t-this.releaseAt),spin=Math.max(0,loose-.7);
  const blend=Math.min(1,spin/1.5),drift=Math.max(0,spin-4);
  const rocketZ=.16*rise*rise+Math.sin(spin*2.1)*blend;
  const x=16+drift*1.6,y=7.5+Math.sin(spin*1.45)*2.8*blend;
  return {
   phase:loose===0?'ascent':spin===0?'release':'unstable',
   attached:t<this.releaseAt,
   x,y,rocketZ,rotation:spin*spin*.5,
   // La cámara mira progresivamente hacia arriba; la plataforma sale del encuadre.
   pitch:.10+Math.max(0,.16*rise*rise-1.5)/(x-3),
   caption:loose===0?'¡Pasajero inesperado! Iván va rumbo a las estrellas.':spin===0?'¡Iván se ha soltado!':'¡Centro de masa alterado! El control de vuelo está desajustado.'
  };
 },
 fall(time,release){
  const t=Math.max(0,time-this.releaseAt);
  // Conserva la velocidad ascendente al soltarse antes de caer por gravedad.
  return {...release,phase:'fall',frame:3,x:release.x+.15*t,y:release.y+.3*t,
   footZ:release.footZ+.32*(this.releaseAt-8.5)*t-.5*4.905*t*t,
   rotation:release.rotation+.55*t,visible:t<5,scream:t<4};
 }
};
