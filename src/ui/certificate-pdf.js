/* Local-only PDF export. JPEG pages keep the game's Unicode lettering without
   downloading fonts or a PDF library. No student data leaves the browser. */
window.CertificatePDF = {
  pages(front, performance, en) {
    const pages=[],say=(es,english)=>en?english:es;
    const page=()=>{
      const canvas=document.createElement('canvas');canvas.width=1600;canvas.height=1132;
      const c=canvas.getContext('2d');c.fillStyle='#f8f0dc';c.fillRect(0,0,1600,1132);
      c.strokeStyle='#977740';c.lineWidth=5;c.strokeRect(38,38,1524,1056);c.lineWidth=1;c.strokeRect(51,51,1498,1030);
      c.fillStyle='#263448';c.textAlign='center';pages.push(canvas);return c;
    };
    const text=(c,value,y,size=32,maxWidth=1400)=>{
      c.font=`${size}px Georgia`;const words=String(value).split(/\s+/);let line='';
      for(const word of words){const next=line?line+' '+word:word;if(c.measureText(next).width>maxWidth&&line){c.fillText(line,800,y,maxWidth);y+=size*1.35;line=word;}else line=next;}
      c.fillText(line,800,y,maxWidth);return y+size*1.35;
    };
    const get=selector=>front.querySelector(selector)?.textContent.trim()||'';
    const name=get('#certificate-student');let c=page();
    text(c,'AVENTURA EPIK · IGNITIA',135,36);c.fillStyle='#263448';c.beginPath();c.arc(800,225,65,0,Math.PI*2);c.fill();IgnitiaCeremony.star(c,800,225,90);
    text(c,say('Certificado de aventura','Certificate of adventure'),365,65);
    text(c,say('Otorgado a','Awarded to'),440,28);text(c,name||say('Estudiante','Student'),520,48);
    text(c,get('.certificate-score')+' '+say('RETOS COMPLETADOS','CHALLENGES COMPLETED'),680,38);
    text(c,say('Por tu ingenio, perseverancia y por proteger el tiempo y el espacio.','For your ingenuity, perseverance and for protecting time and space.'),765,29);
    const signatures=[...front.querySelectorAll('footer span')].map(el=>[...el.childNodes].map(node=>node.nodeName==='BR'?' · ':node.textContent).join(''));
    signatures.forEach((value,i)=>text(c,value,890+i*53,24));
    const rooms=performance.rooms,perPage=4,totalPages=1+Math.ceil(rooms.length/perPage);
    for(let start=0;start<rooms.length;start+=perPage){
      c=page();text(c,say('Tu leyenda, sala por sala','Your legend, room by room'),115,45);
      text(c,name,172,28);text(c,`${performance.score} / 100 · ${'★'.repeat(performance.stars)}${'☆'.repeat(5-performance.stars)}`,225,32);
      rooms.slice(start,start+perPage).forEach((r,i)=>{
        const y=275+i*176;c.fillStyle='#efe3c7';c.fillRect(92,y,1416,164);c.fillStyle='#263448';
        text(c,`${start+i+1}. ${I18n.t(r.name)}`,y+30,25);
        c.fillStyle=r.stars===1?'#b12d32':r.stars<4?'#24743e':'#9a7010';
        text(c,`${'★'.repeat(r.stars)}${'☆'.repeat(5-r.stars)} · ${r.score} / 100`,y+66,28);c.fillStyle='#263448';
        text(c,r.titles?.[en?1:0]||'',y+103,27);
        text(c,say(`Intentos: ${r.attempts} · Errores: ${r.errors} · Muertes: ${r.deaths} · Pistas: ${r.hints?'sí':'no'} · IA: ${r.assisted?'sí':'no'}`,`Attempts: ${r.attempts} · Errors: ${r.errors} · Deaths: ${r.deaths} · Hints: ${r.hints?'yes':'no'} · AI: ${r.assisted?'yes':'no'}`),y+139,22);
      });
      text(c,say('Las estrellas son logros del juego, no una calificación oficial.','Stars are game achievements, not an official grade.'),1020,21);
    }
    pages.forEach((canvas,i)=>text(canvas.getContext('2d'),`${i+1} / ${totalPages}`,1060,18));return pages;
  },
  encode(canvases) {
    const enc=new TextEncoder(),objects=[];
    const bytes=s=>enc.encode(s),join=parts=>{const out=new Uint8Array(parts.reduce((n,p)=>n+p.length,0));let offset=0;for(const p of parts){out.set(p,offset);offset+=p.length;}return out;};
    objects.push(bytes('<< /Type /Catalog /Pages 2 0 R >>'));
    objects.push(bytes(`<< /Type /Pages /Count ${canvases.length} /Kids [${canvases.map((_,i)=>`${3+i*3} 0 R`).join(' ')}] >>`));
    canvases.forEach((canvas,i)=>{
      const id=3+i*3,jpeg=Uint8Array.from(atob(canvas.toDataURL('image/jpeg',.94).split(',')[1]),ch=>ch.charCodeAt(0));
      objects.push(bytes(`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 842 595.73] /Resources << /XObject << /Image ${id+1} 0 R >> >> /Contents ${id+2} 0 R >>`));
      objects.push(join([bytes(`<< /Type /XObject /Subtype /Image /Width ${canvas.width} /Height ${canvas.height} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${jpeg.length} >>\nstream\n`),jpeg,bytes('\nendstream')]));
      const stream='q 842 0 0 595.73 0 0 cm /Image Do Q';objects.push(bytes(`<< /Length ${stream.length} >>\nstream\n${stream}\nendstream`));
    });
    const parts=[bytes('%PDF-1.4\n')],offsets=[0];let position=parts[0].length;
    objects.forEach((object,i)=>{offsets.push(position);const part=join([bytes(`${i+1} 0 obj\n`),object,bytes('\nendobj\n')]);parts.push(part);position+=part.length;});
    parts.push(bytes(`xref\n0 ${objects.length+1}\n0000000000 65535 f \n${offsets.slice(1).map(n=>String(n).padStart(10,'0')+' 00000 n \n').join('')}trailer\n<< /Size ${objects.length+1} /Root 1 0 R >>\nstartxref\n${position}\n%%EOF`));
    return new Blob(parts,{type:'application/pdf'});
  },
  download(front,performance,en){
    const pdf=this.encode(this.pages(front,performance,en));const url=URL.createObjectURL(pdf),link=document.createElement('a');
    const name=(front.querySelector('#certificate-student').textContent||'estudiante').normalize('NFKD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-zA-Z0-9_-]+/g,'-').slice(0,80);
    link.href=url;link.download=`Aventura-EPIK-certificado-${name}.pdf`;document.body.append(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(url),60000);
  }
};
