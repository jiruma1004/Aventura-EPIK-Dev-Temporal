/* Membership checks for the supplied class lists. Not server authentication. */
(()=>{'use strict';
const key='epik.enrollment.access.v1';
const masterHash='ec9f8ee21e32525fded7c6035697249ceefafeee3110674248208f008f769851';
const sha=async text=>Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(text))),b=>b.toString(16).padStart(2,'0')).join('');
const member=(group,hash)=>window.EpikStudentRoster?.groups[group]?.includes(hash)===true;
window.EpikGroupAccess={group:null,studentId:null,teacher:false,
 mountTeacherControls(){
  if(!this.teacher&&!this.studentId)return;
  const button=document.createElement('button');button.type='button';button.id='teacher-sign-out';
  button.textContent=this.teacher?'Docente · Cerrar acceso':`Grupo ${this.group} · Cambiar acceso`;
  button.onclick=()=>{sessionStorage.removeItem(key);location.reload();};
  document.querySelector('.controls').append(button);
  const intro=button.cloneNode(true);intro.id='teacher-sign-out-intro';intro.onclick=button.onclick;document.querySelector('#adventure-intro').append(intro);
 },
 async enter(){
  try{const saved=JSON.parse(sessionStorage.getItem(key));
   if(saved?.teacher===masterHash){this.teacher=true;return;}
   if(saved&&member(saved.group,saved.studentId)){this.group=saved.group;this.studentId=saved.studentId;return;}
   sessionStorage.removeItem(key);sessionStorage.removeItem('epik.group.access.v1');
  }catch{}
  const panel=document.createElement('dialog');panel.id='group-access';panel.setAttribute('aria-labelledby','group-access-title');
  const options=Array.from({length:17},(_,i)=>String(501+i)).map(group=>`<option value="${group}" ${window.EpikStudentRoster?.groups[group]?'':'disabled'}>${group}${window.EpikStudentRoster?.groups[group]?'':' · Lista pendiente'}</option>`).join('');
  panel.innerHTML=`<form><span>✦ REINO DE EPITHEA</span><h1 id="group-access-title">Tu aventura comienza aquí</h1><p>Elige tu grupo y escribe tu matrícula para entrar.</p><label>Grupo<select name="group" required><option value="">Elige tu grupo</option>${options}<option value="teacher">Docente · clave maestra</option></select></label><label><span id="access-field-label">Matrícula</span><input name="credential" type="text" autocomplete="off" autocapitalize="characters" spellcheck="false" maxlength="64" required placeholder="A01234567" aria-describedby="access-note group-access-status"></label><small id="access-note">Incluye la letra A y los ocho números de tu matrícula.</small><p role="status" id="group-access-status"></p><button class="primary">Entrar a la aventura</button></form>`;
  document.body.append(panel);panel.addEventListener('cancel',e=>e.preventDefault());panel.showModal();
  const form=panel.querySelector('form'),input=form.elements.credential,status=panel.querySelector('[role=status]');
  form.elements.group.onchange=()=>{
   const teacher=form.elements.group.value==='teacher';input.value='';input.type=teacher?'password':'text';input.placeholder=teacher?'Clave maestra':'A01234567';
   panel.querySelector('#access-field-label').textContent=teacher?'Clave maestra':'Matrícula';
   panel.querySelector('#access-note').textContent=teacher?'Acceso docente para realizar partidas de prueba.':'Incluye la letra A y los ocho números de tu matrícula.';status.textContent='';
  };
  await new Promise(resolve=>{form.onsubmit=async e=>{
   e.preventDefault();const button=form.querySelector('button');button.disabled=true;status.textContent='';
   try{
    const group=form.elements.group.value,teacher=group==='teacher',value=input.value.normalize('NFKC').trim();
    if(!teacher&&!/^A\d{8}$/i.test(value)){status.textContent='Escribe tu matrícula completa: letra A y ocho números.';input.focus();return;}
    const hash=await sha(teacher?`epik-groups-oct2026-v1:teacher:${value.toLowerCase()}`:`${EpikStudentRoster.salt}:${group}:${value.toUpperCase()}`);
    if(teacher?hash!==masterHash:!member(group,hash)){status.textContent=teacher?'La clave docente no es correcta.':'La matrícula no está registrada en este grupo. Revisa ambos datos o consulta a tu profesor.';input.focus();return;}
    this.teacher=teacher;this.group=teacher?null:group;this.studentId=teacher?null:hash;
    try{sessionStorage.setItem(key,JSON.stringify(teacher?{teacher:masterHash}:{group,studentId:hash}));}catch{}
    input.value='';panel.close();panel.remove();resolve();
   }catch{status.textContent='No se pudo verificar el acceso. Abre el juego con HTTPS o en localhost.';}finally{button.disabled=false;}
  };});
 }
};
})();
