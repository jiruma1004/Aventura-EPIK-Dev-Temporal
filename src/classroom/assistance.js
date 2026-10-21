/* Local calculation hints and an explicit assisted crossing for the first trial. */
window.EpikSolutions = {
  cannon(lab) {
    const p = lab.room.physics,
      D = (p.targetX - p.originX) * p.metersPerCell,
      dy = p.targetHeight - p.height,
      a = 45 * Math.PI / 180,
      v = Math.sqrt(p.gravity * D * D / (2 * Math.cos(a) ** 2 * (D * Math.tan(a) - dy))),
      mass = lab.loaded?.mass ?? lab.ammo[lab.selected ?? 0].mass,
      energy = .5 * mass * v * v;
    return {
      distance: D,
      height: p.targetHeight,
      angle: 45,
      azimuth: 0,
      speed: v,
      mass,
      energy,
      overload: energy > p.maxEnergy
    };
  },
  intercept(sim) {
    for (let duration = 140; duration >= 40; duration--) {
      const epoch = sim.missionTime,
        target = InterceptionPhysics.eric(epoch + duration),
        p = InterceptionPhysics.aimAt({
          delay: 0,
          duration
        }, target.x, target.y);
      p.speed = Number(p.speed.toFixed(2));
      p.angle = Number(p.angle.toFixed(1));
      if (InterceptionPhysics.evaluate(p, epoch).hit) return {
        ...p,
        epoch
      };
    }
    return null;
  },
  // Despejes completos: el estudiante evalúa la última operación, sin respuestas numéricas.
  // Los coeficientes trigonométricos se conservan con seis decimales.
  rouletteSetups: {
    1: 'd = 17.55 + 364.5/4.5\nt = 0.65 + 27/4.5',
    2: 't = (−4 + √(16 + 144))/1.2\nx = 60 + 4t',
    3: 'v = 11.2152/0.40\nh = v²/19.62',
    4: 't = (11.658224 + √(11.658224² + 4·4.905·35))/9.81\nR = 18.657058t',
    5: 'y = 25.172989 − 12.036316\nv_y = 16.06969 − 15.367255',
    6: 'h_max = 20 + 100/19.62\nt = (10 + √(100 + 4·4.905·20))/9.81',
    7: 'D = 76.8 + 96 + 57.6\nv_media = D/19',
    8: 'θ₁ = arcsen(0.68125)/2\nθ₂ = 90° − θ₁',
    9: 'v = 2·6\nΔx = 2·18',
    10: 't = √(19.62/4.905)\nv = 9.81t'
  },
  text(g) {
    const {
        room,
        lab,
        maze,
        roulette,
        boss,
        trial,
        ignitia
      } = g,
      es = I18n.lang !== 'en',
      say = (a, b) => es ? a : b;
    if (room.trial) return say('La respuesta es ', 'The answer is ') + (trial.question.answer ? say('Verdadero.', 'True.') : say('Falso.', 'False.')) + ' ' + I18n.t(trial.question.hint) + say(' Salta tú a esa plataforma.', ' Jump onto that platform yourself.');
    if (room.physics) {
      const p=lab.room.physics,D=(p.targetX-p.originX)*p.metersPerCell,dy=p.targetHeight-p.height;
      return say(`Elige y fija tú un ángulo θ (30°, 45° o 60°). La rapidez inicial queda despejada así:
v₀ = √[(${p.gravity}·${D}²) / (2·cos²(θ)·(${D}·tan(θ) − (${dy})))]
Usa grados en tu calculadora.`, `Choose and fix an angle θ yourself (30°, 45° or 60°). The initial speed is isolated as follows:
v₀ = √[(${p.gravity}·${D}²) / (2·cos²(θ)·(${D}·tan(θ) − (${dy})))]
Set your calculator to degrees.`);
    }
    if (room.roulette) {
      const q = roulette.current;
      if(!q)return say('Primero gira la rueda.','Spin the wheel first.');
      const setup=this.rouletteSetups[q.id];
      return say('Ya dejé las ecuaciones despejadas y los datos sustituidos. Evalúa las operaciones en orden; si aparece una variable anterior, usa el valor que acabas de calcular. Conserva decimales hasta el final.\n', 'The equations are isolated and the data substituted. Evaluate the operations in order; use your previous result wherever that variable appears. Keep precision until the end.\n')+setup;
    }
    if (room.conceptual) {
      const q = maze.question;
      if (q.branch) return say('Ambas respuestas son válidas: el electrón presenta dualidad onda-partícula. Elige libremente la ruta.', 'Both answers are valid: the electron exhibits wave-particle duality. Choose either route.');
      const d = maze.doors.find(d => d.correct && (maze.dungeon || d.stage === maze.stage));
      return say('Elige la puerta: ', 'Choose the door: ') + I18n.t(d?.text || '') + '. ' + I18n.t(q.hint);
    }
    if(room.corridor&&g.corridor?.guardian.arrived)return I18n.t(g.corridor.guardian.question.setup);
    if (room.corridor) return say('En la lava puedes seguir los apoyos de la izquierda: primero el central izquierdo, luego los dos cercanos al muro izquierdo y después vuelve hacia el centro para salir. Corre con Shift, suelta el avance al aterrizar y salta con Espacio. Los símbolos avanzan rectos: cambia de carril.', 'Across the lava, follow the left supports: start on the middle-left stone, then the two near the left wall, then return towards the center to exit. Sprint with Shift, release forward movement on landing, and jump with Space. Symbols travel straight: change lanes.');
    if (room.boss) {
      const s = boss.puzzle.support;
      const sum=s.intersections[0][0]+s.intersections[1][0],constant=s.intersections[0][0]*s.intersections[1][0];
      const term=(n,variable='')=>(n<0?' − ':' + ')+Math.abs(n)+variable;
      const factors=s.intersections.map(([x])=>'('+ 'x'+term(-x)+')').join('');
      return say('Iguala las dos curvas: ', 'Set the two curves equal: ')+s.parabolaText+' = '+s.lineText+'\n'+say(`Multiplica por ${s.d} y reúne términos:
`, `Multiply by ${s.d} and collect terms:
`)+'x²'+term(-sum,'x')+term(constant)+' = 0\n'+say('Ya está factorizada: ', 'Already factored: ')+factors+' = 0\n'+say('Iguala cada factor a cero y despeja x. Sustituye cada raíz en y = ', 'Set each factor equal to zero and isolate x. Substitute each root into y = ')+s.lineText+'\n'+say('Calcula ambas coordenadas. La raíz negativa corresponde al láser izquierdo y la positiva al derecho.', 'Calculate both coordinates. The negative root belongs to the left laser and the positive root to the right laser.');
    }
    const q = this.intercept(ignitia.simulator);
    return q ? say(`Solución actualizada para t₀ = ${q.epoch.toFixed(1)} s: v₀ = ${q.speed} km/s, θ = ${q.angle}°, retraso = 0 s y vuelo = ${q.duration} s. Usa x = v₀ cosθ τ e y = v₀ senθ τ − ½gτ². Eric sigue avanzando: esta propuesta se recalcula mientras lees. Introduce los valores y ensaya de inmediato.`, `Updated solution for t₀ = ${q.epoch.toFixed(1)} s: v₀ = ${q.speed} km/s, θ = ${q.angle}°, delay = 0 s, flight = ${q.duration} s. Use x = v₀ cosθ τ and y = v₀ sinθ τ − ½gτ². Eric keeps moving: these values update while you read. Enter them and run the trial promptly.`) : say('Ya no queda tiempo para interceptarlo con los límites disponibles. Tras el game over, vuelve a intentarlo desde el punto seguro.', 'There is not enough time for an intercept within the available limits. After game over, try again from the checkpoint.');
  }
};
window.EpikAssistance = class {
  constructor(session, getGame, getContext) {
    this.session = session;
    this.game = getGame;
    this.context = getContext;
    this.revealed = false;
    this.elapsed = 0;
    document.querySelector('.controls').insertAdjacentHTML('beforeend', '<button id="extra-help" hidden title="Consultar el desarrollo limita esta sala a una estrella"><img src="assets/ui/palma-ia.webp" width="52" height="52" alt="" aria-hidden="true"><span><b>Palma IA</b><small>Máximo 1 estrella</small></span></button>');
    document.querySelector('.scene-view').insertAdjacentHTML('beforeend', '<section id="extra-help-panel" class="world-console" hidden aria-label="Desarrollo guiado"><header id="extra-help-handle" tabindex="0" aria-label="Mover desarrollo: arrastra o usa las flechas"><strong>Palma IA · Desarrollo guiado</strong><small>Arrastra para mover · Ajusta desde la esquina</small></header><button id="extra-help-close" class="bubble-fold" aria-label="Cerrar ayuda">×</button><p id="extra-help-copy"></p><pre id="extra-help-answer"></pre></section>');
    this.button = document.querySelector('#extra-help');
    this.panel = document.querySelector('#extra-help-panel');
    this.handle = document.querySelector('#extra-help-handle');
    this.button.onclick = () => this.open();
    document.querySelector('#extra-help-close').onclick = () => this.close();
    this.handle.onpointerdown = event => {
      if (event.button !== 0) return;
      event.preventDefault();
      window.dispatchEvent(new Event('astralia:ui-open'));
      this.drag = {id:event.pointerId, x:event.clientX, y:event.clientY, left:this.panel.offsetLeft, top:this.panel.offsetTop};
      this.handle.setPointerCapture(event.pointerId);
    };
    this.handle.onpointermove = event => {
      if (this.drag?.id !== event.pointerId) return;
      this.position(this.drag.left + event.clientX - this.drag.x, this.drag.top + event.clientY - this.drag.y);
    };
    this.handle.onpointerup = this.handle.onpointercancel = this.handle.onlostpointercapture = () => { this.drag = null; };
    this.handle.onkeydown = event => {
      const delta = {ArrowLeft:[-24,0],ArrowRight:[24,0],ArrowUp:[0,-24],ArrowDown:[0,24]}[event.key];
      if (!delta) return;
      event.preventDefault();event.stopPropagation();
      this.position(this.panel.offsetLeft + delta[0], this.panel.offsetTop + delta[1]);
    };
    // Keep the title and close control reachable after resize/fullscreen changes.
    this.boundsObserver = new ResizeObserver(() => this.keepInBounds());
    this.boundsObserver.observe(this.panel);
    this.boundsObserver.observe(this.panel.parentElement);
  }
  eligible() {
    const room = this.game().room;
    return !!(room.trial || room.physics || room.roulette || room.boss || room.corridor&&this.game().corridor?.guardian.arrived&&!this.game().corridor.guardian.solved);
  }
  position(left, top) {
    const scene = this.panel.parentElement;
    this.panel.style.left = Math.max(8, Math.min(left, scene.clientWidth-this.panel.offsetWidth-8))+'px';
    this.panel.style.top = Math.max(8, Math.min(top, scene.clientHeight-this.panel.offsetHeight-8))+'px';
    this.panel.style.right = this.panel.style.bottom = 'auto';
  }
  keepInBounds() {
    if (this.panel.hidden) return;
    const scene=this.panel.parentElement;
    if(this.panel.offsetLeft<8 || this.panel.offsetTop<8 || this.panel.offsetLeft+this.panel.offsetWidth>scene.clientWidth-8 || this.panel.offsetTop+this.panel.offsetHeight>scene.clientHeight-8) this.position(this.panel.offsetLeft,this.panel.offsetTop);
  }
  update() {
    const hidden = !this.eligible() || !this.session.available(this.context().objective_id) || !this.canUse?.();
    if (this.button.hidden !== hidden) this.button.hidden = hidden;
    if (!hidden) {
      const trial = this.game().room.trial;
      this.button.querySelector('b').textContent = I18n.t('Palma IA');
      this.button.title = I18n.t(trial ? 'Cruzar en tirolesa limita esta sala a una estrella' : 'Consultar el desarrollo limita esta sala a una estrella');
      const text = I18n.t(this.session.state(this.game().room.id).assisted ? '1 estrella · Palma IA' : 'Máximo 1 estrella');
      const label=this.button.querySelector('small');
      if(label.textContent!==text)label.textContent=text;
    }
  }
  open() {
    if (!this.eligible() || !this.canUse?.() || !this.session.available(this.context().objective_id)) return;
    const context=this.context();
    // The visible button states the penalty; one click reveals the setup, never the final numeric answer.
    // assist() is idempotent: reopening never deducts another point.
    if (!this.session.assist(context, this.game().snapshot())) return;
    if (this.game().room.trial) {
      this.close();
      window.dispatchEvent(new Event('astralia:ui-open'));
      this.game().trial.startZipline();
      this.update();
      return;
    }
    this.contextAtOpen = context.objective_id;
    this.revealed = true;
    this.panel.hidden = false;
    document.querySelector('#extra-help-copy').textContent = I18n.t('Esta sala tendrá una estrella al completarla. El juego continúa mientras lees.');
    this.render();this.keepInBounds();
    window.dispatchEvent(new Event('astralia:ui-open'));
    document.querySelector('#extra-help-close').focus({preventScroll:true});
  }
  render() {
    const el=document.querySelector('#extra-help-answer'), text=EpikSolutions.text(this.game());
    if(el.textContent!==text)el.textContent=text;
  }
  tick(dt) {
    this.update();
    if(this.panel.hidden)return;
    if(!this.eligible() || !this.canUse?.() || this.contextAtOpen!==this.context().objective_id){this.close();return;}
    this.elapsed+=dt;
    if(this.elapsed>=.25){this.elapsed=0;this.render();}
  }
  close() {
    if (this.panel.contains(document.activeElement)) document.querySelector('#game').focus({preventScroll:true});
    this.panel.hidden=true;this.revealed=false;this.drag=null;
  }
};
