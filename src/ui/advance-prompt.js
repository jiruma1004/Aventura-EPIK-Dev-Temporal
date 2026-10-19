/* A visual cue only: the existing room/door state still controls progression. */
window.AdvancePrompt=class {
 constructor(){
  this.el=document.createElement('div');this.el.id='advance-prompt';this.el.hidden=true;
  this.el.setAttribute('role','status');this.el.setAttribute('aria-live','polite');
  document.querySelector('.scene-view').append(this.el);
 }
 update({opened,maze,playing}){
  // Announce any door the player opened; never reveal which answer is correct.
  const doorOpen=maze&&!maze.dungeon&&maze.doors.some(d=>d.stage===maze.stage&&maze.openDoors.has(d.stage+':'+d.choice));
  const visible=!!playing&&!!(opened||doorOpen);
  const label=I18n.lang==='en'?'Go ahead':'Adelante';
  if(this.el.textContent!==label)this.el.textContent=label;
  if(this.el.hidden===visible)this.el.hidden=!visible;
 }
};
