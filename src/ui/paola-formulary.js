/* General reference only: no exercise values or evaluated answers. */
window.PaolaFormulary={
 sections:[
  ['Magnitudes y unidades','Quantities and units','Δx = x − x₀ · Δt = t − t₀\nv̄ = Δx / Δt\nrapidez media = distancia total / tiempo total','Usa metros, segundos y m/s. Para pasar de km/h a m/s, divide entre 3.6.','Use metres, seconds and m/s. Divide km/h by 3.6 to obtain m/s.'],
  ['Movimiento rectilíneo uniforme','Constant velocity','x = x₀ + v·t','La velocidad es constante y a = 0.','Velocity is constant and a = 0.'],
  ['Aceleración constante','Constant acceleration','v = v₀ + a·t\nx = x₀ + v₀·t + ½a·t²\nv² = v₀² + 2a·(x − x₀)','Estas ecuaciones requieren aceleración constante. Separa las etapas de reacción, aceleración y frenado.','These equations require constant acceleration. Separate reaction, acceleration and braking stages.'],
  ['Caída y lanzamiento vertical','Vertical motion','y = y₀ + v₀ᵧ·t − ½g·t²\nvᵧ = v₀ᵧ − g·t\ng = 9.81 m/s²','Aquí el eje positivo apunta hacia arriba. En la altura máxima vᵧ = 0. Si eliges otro eje, ajusta los signos.','Here the positive axis points upward. At maximum height vᵧ = 0. Adjust signs if you choose another axis.'],
  ['Encuentros y ecuaciones','Meetings and equations','xₐ(t) = xᵦ(t)\nAt² + Bt + C = 0\nt = [−B ± √(B² − 4AC)] / (2A)','En la fórmula cuadrática, A ≠ 0. Elige la raíz válida para el intervalo del problema. Si hay varias etapas, suma sus distancias y tiempos; no promedies velocidades sin ponderar.','The quadratic formula requires A ≠ 0. Choose the root within the problem’s time interval. Add distances and times across stages; do not average speeds without weighting.'],
  ['Velocidades relativas','Relative velocities','v respecto al suelo = v respecto a la plataforma + v de la plataforma','Suma por componentes y conserva los signos. Define tu sistema de referencia antes de sustituir.','Add components with their signs. Define the reference frame before substituting.']
 ],
 render(node){
  node.replaceChildren();const en=I18n.lang==='en';
  for(const [es,title,equations,note,noteEn] of this.sections){const section=document.createElement('section'),h=document.createElement('h3'),pre=document.createElement('pre'),p=document.createElement('p');h.textContent=en?title:es;pre.textContent=en?equations.replaceAll('sen','sin').replace('rapidez media = distancia total / tiempo total','average speed = total distance / total time').replace('v respecto al suelo = v respecto a la plataforma + v de la plataforma','v ground = v relative to platform + v platform'):equations;p.textContent=en?noteEn:note;section.append(h,pre,p);node.append(section);}
 }
};
