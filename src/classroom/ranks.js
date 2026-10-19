/* Display-only RPG ratings. Accreditation and the teacher CSV remain separate. */
window.EpikRanks = {
  thresholds: [0, 40, 60, 80, 100],
  titles: {
    trial: [
      ['Catador de Tablones', 'Plank Taster'],
      ['Duende de la Duda Razonable', 'Goblin of Reasonable Doubt'],
      ['Pequeño Mapache Fanfarrón', 'Little Boastful Raccoon'],
      ['Caballero del Buen Juicio', 'Knight of Sound Judgment'],
      ['Guardián de la Verdad', 'Guardian of Truth']
    ],
    physics: [
      ['Alquimista del Casi Sale', 'Alchemist of Almost Worked'],
      ['Escudero del Ángulo Equivocado', 'Squire of the Wrong Angle'],
      ['Hechicero del Despeje Dudoso', 'Wizard of Dubious Algebra'],
      ['Hay talento, solo falta apoyarlo', 'The talent is there; it just needs support'],
      ['Artillero de Galileo', 'Galileo’s Gunner']
    ],
    roulette: [
      ['Invocador del Número al Azar', 'Summoner of Random Numbers'],
      ['Goblin de las Unidades Perdidas', 'Goblin of Lost Units'],
      ['Caballero de la Calculadora Prestada', 'Knight of the Borrowed Calculator'],
      ['Sabio de la Aceleración', 'Sage of Acceleration'],
      ['Oráculo del Movimiento', 'Oracle of Motion']
    ],
    conceptual: [
      ['Explorador de la Misma Puerta', 'Explorer of the Same Door'],
      ['Duende del Razonamiento Circular', 'Goblin of Circular Reasoning'],
      ['Detective de las Hipótesis', 'Detective of Hypotheses'],
      ['Guardián de las Leyes', 'Guardian of the Laws'],
      ['Maestro de la Teoría', 'Master of Theory']
    ],
    corridor: [
      ['Hay apoyo, solo falta talento', 'The support is there; it just needs talent'],
      ['Caballero del Tropiezo Heroico', 'Knight of the Heroic Stumble'],
      ['Ninja de las Rodillas Temblorosas', 'Ninja of Shaky Knees'],
      ['Guardián del Salto Preciso', 'Guardian of the Perfect Jump'],
      ['Caminante del Imposible', 'Walker of the Impossible']
    ],
    boss: [
      ['Catador de Pociones Ajenas', 'Taster of Other People’s Potions'],
      ['Escudero del Signo Equivocado', 'Squire of the Wrong Sign'],
      ['Alquimista del Despeje Creativo', 'Alchemist of Creative Algebra'],
      ['Rompedor de Parábolas', 'Parabola Breaker'],
      ['Archimago de las Intersecciones', 'Archmage of Intersections']
    ],
    rocket: [
      ['Astronauta del «¿Y el Freno?»', 'Astronaut of “Where Are the Brakes?”'],
      ['Ingeniero del Tornillo Sobrante', 'Engineer of the Spare Screw'],
      ['Piloto del Plan Improvisado', 'Pilot of the Improvised Plan'],
      ['Estratega de la Intercepción', 'Interception Strategist'],
      ['Comandante de las Estrellas', 'Commander of the Stars']
    ]
  },
  kind(room) { return Object.keys(this.titles).find(key => room[key]); },
  stars(score) { return this.thresholds.filter(threshold => score >= threshold).length; },
  academicValue(errors) { return Math.max(0, 100 - 20 * errors); },
  room(session, room) {
    const state = session.state(room.id), kind = this.kind(room);
    const events = session.events.filter(e => e.room_id === room.id);
    const objectives = new Map();
    // Only judged academic answers count here. Falls, cancelled shots and
    // corridor movement are already represented by the death component.
    for (const e of events) {
      if (e.event_type !== 'attempt_result' || e.submitted_answer === 'movement'
          || !['correct', 'incorrect'].includes(e.result)) continue;
      const key = e.objective_id || 'main';
      if (!objectives.has(key)) objectives.set(key, {errors: 0});
      if (e.result === 'incorrect') objectives.get(key).errors++;
    }
    const errors = [...objectives.values()].reduce((sum,o)=>sum+o.errors,0);
    const academic = this.academicValue(errors);
    const survival = Math.max(0, 100 - (kind === 'corridor' ? 15 : 10) * state.deaths);
    const eligible = state.solved;
    const calculation = kind !== 'corridor' || events.some(e => e.objective_id?.startsWith('guardian-'));
    const score = eligible ? state.assisted ? 20 : Math.round(!calculation ? survival : academic * .8 + survival * .2) : 0;
    return {
      id: room.id, name: room.name, kind, solved: state.solved, assisted: state.assisted,
      score, stars: eligible ? this.stars(score) : 0,
      titles: eligible ? this.titles[kind][this.stars(score) - 1] : null,
      attempts: state.passedAttempt ?? state.attempts, errors: state.incorrect,
      deaths: state.deaths, hints: events.some(e => e.event_type === 'normal_help'),
      academic: Math.round(academic), survival,
      // Calculation challenges carry twice the weight in the overall score.
      weight: ['physics', 'roulette', 'boss', 'rocket'].includes(kind) ? 2 : 1
    };
  },
  summary(session) {
    const rooms = session.rooms.map(room => this.room(session, room));
    const score = Math.floor(rooms.reduce((sum, r) => sum + r.score * r.weight, 0) / rooms.reduce((sum, r) => sum + r.weight, 0));
    return {rooms, score, stars: this.stars(score)};
  }
};
