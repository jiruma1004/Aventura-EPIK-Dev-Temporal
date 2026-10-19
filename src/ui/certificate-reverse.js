/* One reversible diploma, shared by both ceremony routes. No progress mutations. */
window.CertificateReverse = class {
  constructor() {
    const certificate = this.el = document.querySelector('#ceremony-certificate');
    this.front = document.createElement('div');this.front.id = 'certificate-front';
    const buttons = [...certificate.querySelectorAll('button')];
    for (const child of [...certificate.children])
      if (!buttons.includes(child) && child.id !== 'ceremony-preview') this.front.append(child);
    certificate.append(this.front);
    this.back = document.createElement('section');this.back.id = 'certificate-back';this.back.hidden = true;
    certificate.append(this.back);
    const actions = document.createElement('div');actions.className = 'certificate-actions';
    this.flip = document.createElement('button');this.flip.id = 'certificate-flip';this.flip.type = 'button';
    this.flip.setAttribute('aria-controls', 'certificate-front certificate-back');
    this.flip.onclick = () => {this.back.hidden = !this.back.hidden;this.front.hidden = !this.back.hidden;this.updateButton();certificate.scrollTop = 0;};
    this.pdf=document.createElement('button');this.pdf.id='certificate-pdf';this.pdf.type='button';
    this.pdf.onclick=()=>{if(this.verified&&this.performance)CertificatePDF.download(this.front,this.performance,I18n.lang==='en');};
    actions.append(this.flip, this.pdf, ...buttons);certificate.append(actions);
    this.sheet=document.createElement('div');this.sheet.className='certificate-sheet';
    this.sheet.append(...certificate.children);certificate.append(this.sheet);
    this.page=0;
    this.fit=()=>{
      if(certificate.hidden||!certificate.clientHeight)return;
      const scale=Math.min(1,(certificate.clientHeight-24)/Math.max(1,this.sheet.offsetHeight));
      this.sheet.style.setProperty('--sheet-scale',String(scale));
    };
    new ResizeObserver(()=>this.fit()).observe(certificate);
    new ResizeObserver(()=>this.fit()).observe(this.sheet);
    let visible=false;
    new MutationObserver(()=>{
      const next=!certificate.hidden;
      if(next!==visible){visible=next;if(visible)this.fit();}
    }).observe(certificate,{attributes:true,attributeFilter:['hidden']});
    window.addEventListener('resize',()=>{this.page=0;this.render();});

    window.addEventListener('astralia:language', () => this.render());
  }
  reset(performance, verified) {
    this.performance = performance;this.verified = verified;this.page=0;
    this.front.hidden = false;this.back.hidden = true;this.el.scrollTop = 0;this.render();
  }
  updateButton() {
    const en = I18n.lang === 'en';
    this.pdf.textContent=en?'Download certificate PDF':'Descargar certificado PDF';this.pdf.hidden=!this.verified;
    this.flip.textContent = this.back.hidden ? (en ? 'View stars and titles ↻' : 'Ver estrellas y títulos ↻') : (en ? 'Return to certificate ↺' : 'Volver al certificado ↺');
    this.flip.setAttribute('aria-pressed', String(!this.back.hidden));
    this.el.classList.toggle('showing-ranks', !this.back.hidden);
  }
  stars(parent, count) {
    const group=document.createElement('span');group.className='rating-stars';group.dataset.stars=String(count);
    group.setAttribute('role','img');group.setAttribute('aria-label',I18n.lang==='en'?`${count} out of 5 stars`:`${count} de 5 estrellas`);
    for(let i=0;i<5;i++){
      const star=document.createElement('span');star.className='star '+(i<count?'filled':'empty');star.textContent=i<count?'★':'☆';star.setAttribute('aria-hidden','true');star.style.setProperty('--star-index',i);group.append(star);
    }
    parent.append(group);return group;
  }
  render() {
    this.updateButton();this.back.replaceChildren();
    const en = I18n.lang === 'en', say = (es, english) => en ? english : es;
    const add = (parent, tag, text, className) => {const el = document.createElement(tag);el.textContent = text;if(className)el.className = className;parent.append(el);return el;};
    add(this.back, 'small', 'AVENTURA EPIK · IGNITIA', 'rank-eyebrow');
    add(this.back, 'h2', say('Tu leyenda, sala por sala', 'Your legend, room by room'));
    if (!this.verified || !this.performance) {
      add(this.back, 'p', say('Vista previa · Completa la aventura para conocer tus estrellas y títulos.', 'Preview · Complete the adventure to reveal your stars and titles.'));
      return;
    }
    const {rooms, score, stars} = this.performance;
    const total=add(this.back,'p','','rank-total');this.stars(total,stars);add(total,'span',` · ${score} / 100`);
    add(this.back, 'p', say('Puntaje de aventura · Los retos de cálculo tienen doble peso.', 'Adventure score · Calculation challenges carry double weight.'), 'rank-caption');
    const list = add(this.back, 'ol', '', 'rank-list');
    const pageSize=innerWidth<650?2:4,pages=Math.ceil(rooms.length/pageSize);
    this.page=Math.min(this.page,pages-1);
    rooms.slice(this.page*pageSize,(this.page+1)*pageSize).forEach((r, offset) => {
      const index=this.page*pageSize+offset;
      const item = add(list, 'li', '', 'rank-card');item.dataset.room = r.id;
      add(item, 'small', `${index + 1} · ${I18n.t(r.name)}`, 'rank-room');
      const rating = add(item, 'span', '', 'rank-stars');this.stars(rating,r.stars||0);
      rating.setAttribute('aria-label', say(`${r.stars} de 5 estrellas`, `${r.stars} out of 5 stars`));
      add(item, 'strong', r.titles ? r.titles[en?1:0] : say('Pendiente', 'Pending'), 'rank-title');
      add(item, 'span', `${r.score} / 100`, 'rank-score');
      add(item, 'p', say(`Intentos: ${r.attempts} · Errores: ${r.errors} · Muertes: ${r.deaths}`, `Attempts: ${r.attempts} · Errors: ${r.errors} · Deaths: ${r.deaths}`), 'rank-metrics');
      add(item, 'p', say(`Pistas: ${r.hints?'sí':'no'} · IA: ${r.assisted?'sí':'no'}`, `Hints: ${r.hints?'yes':'no'} · AI: ${r.assisted?'yes':'no'}`), 'rank-metrics');
    });
    const pager=add(this.back,'nav','','rank-pagination');
    const previous=add(pager,'button',say('◂ Anterior','◂ Previous'));previous.disabled=this.page===0;
    add(pager,'span',say(`Salas · página ${this.page+1} / ${pages}`,`Rooms · page ${this.page+1} / ${pages}`));
    const next=add(pager,'button',say('Siguiente ▸','Next ▸'));next.disabled=this.page===pages-1;
    previous.onclick=()=>{this.page--;this.render();};next.onclick=()=>{this.page++;this.render();};
    const details = document.createElement('details');details.className = 'rank-rules';this.back.append(details);
    add(details, 'summary', say('Cómo se obtienen las estrellas', 'How stars are earned'));
    add(details, 'p', say('5★: 100 · 4★: 80–99 · 3★: 60–79 · 2★: 40–59 · 1★: 0–39.', '5★: 100 · 4★: 80–99 · 3★: 60–79 · 2★: 40–59 · 1★: 0–39.'));
    add(details, 'p', say('Cinco estrellas requieren cero errores y cero muertes. Resolución: 100 puntos menos 20 por respuesta incorrecta, mínimo 0. Supervivencia: 100 menos 10 por muerte, mínimo 0. La sala combina 80 % resolución y 20 % supervivencia. En el corredor solo cuentan las muertes: cada una resta 15 puntos.', 'Five stars require zero errors and zero deaths. Problem solving: 100 points minus 20 per incorrect answer, minimum 0. Survival: 100 minus 10 per death, minimum 0. Rooms combine 80% problem solving and 20% survival. The corridor counts deaths only: each deducts 15 points.'));
    add(details, 'p', say('Palma IA: una estrella y 20 puntos al completar la sala. Los intentos correctos, las pistas y el tiempo no restan. Las estrellas son logros del juego, no una calificación oficial.', 'Palma IA: one star and 20 points on completing the room. Correct attempts, hints and time do not deduct points. Stars are game achievements, not an official grade.'));
    queueMicrotask(()=>this.fit());

  }
};
