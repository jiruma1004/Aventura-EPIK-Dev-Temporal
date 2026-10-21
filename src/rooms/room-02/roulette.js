window.ProblemRoulette=class {
 constructor(onSolve){this.onSolve=onSolve;this.reset();window.addEventListener('astralia:language',()=>{if(this.resetState)this.syncReset(this.resetState);});document.querySelector('#answer-form').onsubmit=e=>{e.preventDefault();this.check();};}
 reset(){this.angle=0;this.spinning=false;this.current=null;this.remaining=PHYSICS_PROBLEMS.map((_,i)=>i);this.solved=new Set();this.elapsed=0;this.tickSector=-1;document.querySelector('#problem-card').hidden=true;document.querySelector('#roulette-status').textContent='Pulsa el botón de la mesa para invocar un desafío.';document.querySelector('#answer-feedback').textContent='';}
 // Dos giros totales: cristal y botón comparten la misma oportunidad extra.
 // Contador y selección viven en la sesión, incluso si se cierra durante el giro.
 syncReset(state){
  // Keep stable problem IDs across bank revisions and preserve the two-spin limit.
  if(state.rouletteBankVersion!==2){
   if(Number.isInteger(state.rouletteSelected)){
    const id=state.rouletteProblemId??state.rouletteSelected+1;
    const found=PHYSICS_PROBLEMS.findIndex(q=>q.id===id);
    state.rouletteSelected=found>=0?found:PHYSICS_PROBLEMS.findIndex(q=>q.id===9);
    state.rouletteProblemId=PHYSICS_PROBLEMS[state.rouletteSelected].id;
   }
   state.rouletteBankVersion=2;
  }
  this.resetState=state;
  state.rouletteSpins??=(state.rouletteResets??0)>0?2:0;
  const used=state.rouletteSpins>=2,button=document.querySelector('#reset-roulette');
  button.disabled=this.spinning||!!this.solved.size||state.solved||state.rouletteSpins!==1;
  button.textContent=I18n.lang==='en'?(used?'Extra spin already used':'Spin again · 1 available'):(used?'Giro extra ya utilizado':'Volver a girar · 1 disponible');
 }
 resumeSelection(){const i=this.resetState?.rouletteSelected;if(Number.isInteger(i)&&PHYSICS_PROBLEMS[i]){this.remaining=this.remaining.filter(n=>n!==i);this.present(i);}}
 restore(saved){
  const id=saved.current??(Number.isInteger(saved.selected)?(saved.bankVersion===2?PHYSICS_PROBLEMS[saved.selected]?.id:saved.selected+1):null);
  this.solved=new Set(saved.solved||[]);
  if(id!=null){const found=PHYSICS_PROBLEMS.findIndex(q=>q.id===id);this.present(found>=0?found:PHYSICS_PROBLEMS.findIndex(q=>q.id===9));}
  else this.resumeSelection();
  this.remaining=PHYSICS_PROBLEMS.map((_,i)=>i).filter(i=>PHYSICS_PROBLEMS[i]!==this.current);
 }
 requestReset(){if(this.resetState?.rouletteSpins!==1)return false;return this.spin();}
 spin(){
  const state=this.resetState;
  if(this.spinning||this.solved.size||state?.solved)return false;
  if(!state||state.rouletteSpins>=2){document.querySelector('#roulette-status').textContent=I18n.lang==='en'?'You have used both spins. Solve the selected challenge to continue.':'Ya usaste los dos giros. Resuelve el desafío seleccionado para continuar.';return false;}
  if(!this.remaining.length)return false;
  Sound.click();state.rouletteSpins++;if(state.rouletteSpins===2)state.rouletteResets=1;
 const random=new Uint32Array(1);crypto.getRandomValues(random);const chosen=random[0]%this.remaining.length;this.selected=this.remaining.splice(chosen,1)[0];this.startAngle=this.angle;const sector=Math.PI*2/PHYSICS_PROBLEMS.length,target=-Math.PI/2-(this.selected+.5)*sector;this.endAngle=this.angle+Math.PI*2*5+((target-this.angle)%(Math.PI*2)+Math.PI*2)%(Math.PI*2);this.elapsed=0;this.spinning=true;this.current=null;document.querySelector('#problem-card').hidden=true;document.querySelector('#roulette-status').textContent='La rueda gira…';state.rouletteSelected=this.selected;state.rouletteProblemId=PHYSICS_PROBLEMS[this.selected].id;this.syncReset(state);this.onSpin?.();return true;}
 tick(dt){if(!this.spinning)return;this.elapsed+=dt;const u=Math.min(1,this.elapsed/3.8);this.angle=this.startAngle+(this.endAngle-this.startAngle)*(1-(1-u)**3);const sector=Math.floor(this.angle/(Math.PI*2/PHYSICS_PROBLEMS.length));if(sector!==this.tickSector){Sound.tick();this.tickSector=sector;}if(u===1){this.spinning=false;this.present(this.selected);Sound.click();}}
 present(i){if(!PHYSICS_PROBLEMS[i])return;this.selected=i;this.angle=-Math.PI/2-(i+.5)*Math.PI*2/PHYSICS_PROBLEMS.length;if(this.resetState){this.resetState.rouletteProblemId=PHYSICS_PROBLEMS[i].id;this.resetState.rouletteSelected=i;this.resetState.rouletteSpins=Math.max(1,this.resetState.rouletteSpins||0);}this.current=PHYSICS_PROBLEMS[i];const q=this.current;document.querySelector('#problem-card').hidden=false;document.querySelector('#problem-level').textContent=`${String(i+1).padStart(2,'0')} / ${q.topic}`;document.querySelector('#problem-level').classList.toggle('hard',!!q.hard);document.querySelector('#problem-title').textContent=q.title;document.querySelector('#problem-text').textContent=q.text;document.querySelector('#problem-solution').textContent='';document.querySelector('#solution-details').open=false;document.querySelector('#answer-feedback').textContent='';const fields=document.querySelector('#answer-fields');fields.replaceChildren();q.fields.forEach(([name,unit],j)=>{const label=document.createElement('label');label.textContent=`${name} (${unit})`;const input=document.createElement('input');input.id=`answer-${j}`;input.type='text';input.inputMode='decimal';input.autocomplete='off';input.required=true;label.append(input);fields.append(label);});document.querySelector('#roulette-status').textContent=(I18n.lang==='en'?`Challenge ${i+1} selected · ${Math.max(0,2-(this.resetState?.rouletteSpins||1))} extra spin available`:`Desafío ${i+1} seleccionado · ${Math.max(0,2-(this.resetState?.rouletteSpins||1))} giro extra disponible`);if(this.resetState)this.syncReset(this.resetState);}
 check(){if(!this.current||this.spinning||this.solved.size)return;if(this.canAnswer&&!this.canAnswer()){document.querySelector('#answer-feedback').textContent='Acércate al sello de la puerta y míralo para responder.';return;}const q=this.current,values=q.fields.map((_,j)=>{const raw=document.querySelector(`#answer-${j}`).value.trim().replace(',','.');return raw!==''&&/^[-+]?(?:\d+(?:\.\d*)?|\.\d+)(?:e[-+]?\d+)?$/i.test(raw)?Number(raw):NaN;});if(values.some(v=>!Number.isFinite(v))){document.querySelector('#answer-feedback').textContent='Introduce números válidos, sin unidades. Puedes usar coma o punto decimal.';return;}
 const correct=q.fields.map((f,i)=>Math.abs(values[i]-f[2])<=Math.max(.02,Math.abs(f[2])*.01));this.onAnswer?.(values,correct.every(Boolean));if(correct.every(Boolean)){this.solved.add(q.id);if(this.resetState)this.syncReset(this.resetState);document.querySelector('#answer-feedback').textContent='✦ Respuesta correcta. El sello de la puerta se ha abierto. Puedes continuar.';Sound.success();this.onSolve();}else{document.querySelector('#answer-feedback').textContent=correct.map((ok,i)=>`${q.fields[i][0]}: ${ok?'correcto':'revisa el planteamiento y las unidades'}`).join(' · ');Sound.tone(180,.2,'triangle',.15);}}
};
