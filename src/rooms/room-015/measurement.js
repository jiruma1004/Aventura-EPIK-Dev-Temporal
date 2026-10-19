window.MeasurementPuzzle={
 height:243,width:126.4,uHeight:.5,uWidth:.05,
 number(text){const s=String(text).trim().replace(',','.');return /^[+]?\d+(?:\.\d+)?(?:e[+-]?\d+)?$/i.test(s)?Number(s):NaN;},
 place(text){const s=String(text).trim().replace(',','.').toLowerCase(),[m,e='0']=s.split('e');if(!Number.isFinite(this.number(s)))return NaN;return Number(e)-(m.includes('.')?m.split('.')[1].length:-(m.match(/0+$/)?.[0].length||0));},
 get area(){return this.height*this.width;},
 get uncertainty(){return Math.hypot(this.width*this.uHeight,this.height*this.uWidth);},
 evaluate({height,width,area,uncertainty}){
  if(this.number(height)!==this.height||this.number(width)!==this.width)return 'Lee las marcas rojas: mide solo la abertura útil, sin incluir el marco dorado.';
  const place=Math.floor(Math.log10(this.uncertainty)),step=10**place,u=Math.round(this.uncertainty/step)*step,a=Math.round(this.area/step)*step;
  if(this.number(area)!==a||this.number(uncertainty)!==u)return 'Revisa el producto y la propagación en cuadratura. Conserva los decimales intermedios y redondea solo al final.';
  if(this.place(area)!==place||this.place(uncertainty)!==place)return 'Expresa la incertidumbre con una cifra significativa y el área hasta la misma posición decimal. Puedes usar notación científica con e.';
  return null;
 }
};
// Arte vectorial propio: mismas medidas, ceros y extremos en la puerta y las ampliaciones.
window.MeasurementArt={
 svg(){
  const x=310,bottom=740,scale=2.6,top=bottom-243*scale,right=x+126.4*scale;
  let ticks='';for(let cm=0;cm<=250;cm++){const y=bottom-cm*scale;ticks+=`<path d="M260 ${y}h${cm%10===0?28:cm%5===0?19:10}"/>`;if(cm%10===0)ticks+=`<text x="250" y="${y+5}" text-anchor="end">${cm}</text>`;}
  for(let mm=0;mm<=1320;mm++){const px=x+mm*.26;ticks+=`<path d="M${px} 65v${mm%100===0?28:mm%10===0?18:7}"/>`;if(mm%100===0)ticks+=`<text x="${px}" y="51" text-anchor="middle">${mm/10}</text>`;}
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 800"><defs><linearGradient id="wood"><stop stop-color="#392021"/><stop offset=".5" stop-color="#794431"/><stop offset="1" stop-color="#321c22"/></linearGradient><linearGradient id="gold"><stop stop-color="#967039"/><stop offset=".5" stop-color="#f8dfa0"/><stop offset="1" stop-color="#9f7941"/></linearGradient></defs><rect width="900" height="800" fill="#20212c"/><path d="M120 0v800M760 0v800" stroke="#45434d" stroke-width="12"/><rect x="${x-24}" y="${top-25}" width="${right-x+48}" height="${bottom-top+35}" rx="10" fill="url(#gold)"/><rect x="${x}" y="${top}" width="${right-x}" height="${bottom-top}" fill="url(#wood)"/><path d="M${(x+right)/2} ${top}V${bottom}" stroke="#dbb967" stroke-width="3"/>
  ${[x+18,(x+right)/2+15].map(px=>`<rect x="${px}" y="${top+35}" width="${(right-x)/2-33}" height="225" rx="38" fill="#4a2728" stroke="#d6b771" stroke-width="5"/><rect x="${px}" y="${top+295}" width="${(right-x)/2-33}" height="280" rx="10" fill="#482725" stroke="#caa367" stroke-width="4"/>`).join('')}
  <path d="M430 305l-15-32 28 12 20-35 20 35 28-12-15 32z" fill="url(#gold)"/><circle cx="460" cy="480" r="10" fill="#efd18b"/><circle cx="488" cy="480" r="10" fill="#efd18b"/>
  <rect x="207" y="80" width="84" height="674" fill="#fff5d7"/><rect x="297" y="27" width="365" height="69" fill="#fff5d7"/><g fill="#152034" stroke="#152034" stroke-width="1" font-family="sans-serif" font-size="14">${ticks}</g>
  <g stroke="#ef6154" stroke-width="3"><path d="M253 ${top}H${x}"/><path d="M253 ${bottom}H${x}"/><path d="M${x} 63V${top}"/><path d="M${right} 63V${top}"/></g><text x="215" y="780" fill="#eee2ba" font-family="sans-serif" font-size="22">cm</text><text x="692" y="71" fill="#eee2ba" font-family="sans-serif" font-size="22">cm · mm</text></svg>`;
 },
 closeup(axis){
  const vertical=axis==='height',start=vertical?238:124,end=vertical?248:129,value=vertical?243:126.4;
  let marks='';const count=vertical?10:50;
  for(let i=0;i<=count;i++){const n=start+(end-start)*i/count,pos=50+i*500/count,major=vertical||i%10===0;
   marks+=vertical?`<path d="M115 ${550-i*50}h${major?45:25}"/><text x="98" y="${557-i*50}" text-anchor="end">${n}</text>`:`<path d="M${pos} 80v${major?45:i%5===0?32:20}"/>${major?`<text x="${pos}" y="65" text-anchor="middle">${n}</text>`:''}`;
  }
  const p=Math.round((50+(value-start)*500/(end-start))*1000)/1000;
  const pointer=vertical?`<path d="M172 ${600-p}h115"/><path d="M172 ${600-p}l18-9v18z"/><text x="230" y="${580-p}">h</text>`:`<path d="M${p} 130v65"/><path d="M${p} 130l-9 18h18z"/><text x="${p+14}" y="182">b</text>`;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${vertical?'320 610':'610 220'}" role="img" aria-label="${vertical?'Regla vertical, centímetros':'Regla horizontal, centímetros y milímetros'}"><rect width="100%" height="100%" rx="12" fill="#fff5d7"/><g fill="#152034" stroke="#152034" stroke-width="2" font-family="sans-serif" font-size="24">${marks}</g><g fill="#b82722" stroke="#b82722" stroke-width="3" font-family="sans-serif" font-size="25">${pointer}</g><text x="${vertical?210:552}" y="${vertical?48:185}" font-family="sans-serif" fill="#152034" font-size="22">cm</text></svg>`;
 },
 texture(){const canvas=document.createElement('canvas');canvas.width=900;canvas.height=800;const img=new Image();img.onload=()=>canvas.getContext('2d').drawImage(img,0,0);img.src='data:image/svg+xml;charset=utf-8,'+encodeURIComponent(this.svg());return canvas;}
};
window.MeasurementRoom=class{
 constructor(onSolve,onReturn){
  this.onSolve=onSolve;this.onReturn=onReturn;this.active=false;this.solved=false;this.art=MeasurementArt.texture();
  const view=document.querySelector('.scene-view');view.insertAdjacentHTML('beforeend',`<section id="measurement-panel" class="world-console" hidden aria-label="Medición de la puerta"><button id="measurement-close" class="bubble-fold" aria-label="Cerrar panel">×</button><p class="eyebrow">SALA 1.5 · RETO OPCIONAL</p><h2>La medida del rey</h2><p>El sello acepta el área de la abertura y su incertidumbre. Las marcas rojas señalan los extremos; el cero coincide con la base y el borde izquierdo. No incluyas el marco.</p><div class="measurement-layout"><div><div id="measurement-door"></div><details open><summary>Ampliar las reglas</summary><p>Altura: divisiones de 1 cm. Anchura: divisiones de 1 mm.</p><div class="measurement-rulers"><div>${MeasurementArt.closeup('height')}</div><div>${MeasurementArt.closeup('width')}</div></div></details></div><div><details open><summary>Modelo y redondeo</summary><p>Usa incertidumbres estándar independientes: u(h) = 0.5 cm y u(b) = 0.05 cm. Son datos del instrumento para esta actividad.</p><p class="formula">A = bh<br>u(A) = √[(h·u(b))² + (b·u(h))²]</p><p>Conserva los decimales durante el cálculo. Al final, expresa u(A) con una cifra significativa y redondea A hasta la misma posición decimal. Usa cm². Se acepta notación científica con e.</p></details><form id="measurement-form"><label>Altura h (cm)<input id="measure-height" inputmode="decimal" required autocomplete="off"></label><label>Anchura b (cm)<input id="measure-width" inputmode="decimal" required autocomplete="off"></label><label>Área A (cm²)<input id="measure-area" inputmode="decimal" required autocomplete="off"></label><label>Incertidumbre u(A) (cm²)<input id="measure-uncertainty" inputmode="decimal" required autocomplete="off"></label><button class="primary">Validar el sello</button></form><p id="measurement-feedback" role="status"></p><button id="measurement-return">Volver al bosque</button></div></div></section>`);
  document.querySelector('#measurement-door').innerHTML=MeasurementArt.svg();
  document.querySelector('#measurement-close').onclick=()=>this.close();document.querySelector('#measurement-return').onclick=()=>{this.close();this.onReturn();};
  document.querySelector('#measurement-form').onsubmit=e=>{e.preventDefault();if(!this.canSubmit?.())return;const values=Object.fromEntries(['height','width','area','uncertainty'].map(k=>[k,document.querySelector('#measure-'+k).value]));const error=MeasurementPuzzle.evaluate(values);if(error){document.querySelector('#measurement-feedback').textContent=error;Sound.tone(190,.15,'triangle',.06);return;}this.solved=true;this.close();this.onSolve();};
 }
 get isOpen(){return !document.querySelector('#measurement-panel').hidden;}
 reset(room){this.close();this.active=!!room.measurement;this.solved=false;document.querySelector('#measurement-form').reset();document.querySelector('#measurement-feedback').textContent='';}
 near(player){return this.active&&Math.hypot(player.x-7,player.y-3.5)<2.3&&Math.cos(Math.atan2(3.5-player.y,7-player.x)-player.angle)>.9;}
 open(player){if(!this.near(player)||this.solved)return false;document.querySelector('#measurement-panel').hidden=false;window.dispatchEvent(new Event('astralia:ui-open'));document.querySelector('#measure-height').focus({preventScroll:true});return true;}
 close(){const panel=document.querySelector('#measurement-panel'),hadFocus=panel.contains(document.activeElement);panel.hidden=true;if(hadFocus)document.querySelector('#game').focus({preventScroll:true});}
};
