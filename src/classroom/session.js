/* Local classroom evidence. This is an auditable record, not a signed credential. */
window.EpikSession = class {
  static version = 'csv-simple-20261008';
  static columns = ['Sala', 'Tiempo total (minutos)', 'Muertes', 'Errores', 'Intentos hasta pasar', 'Usó pistas', 'Usó IA'];
  constructor(rooms, {
    now = () => performance.now(),
    wall = () => new Date().toISOString(),
    storage = null
  } = {}) {
    this.rooms = rooms;
    this.now = now;
    this.wall = wall;
    this.storage = storage;
    this.id = crypto.randomUUID();
    this.studentName = '';
    this.difficulty = window.EpikDifficulty?.mode || 'normal';
    this.events = [];
    this.states = new Map();
    this.pending = new Map();
    this.seq = 0;
    this.current = null;
    this.started = null;
    this.finished = null;
    this.previousTick = now();
    this.wasActive = false;
    this.preview = false;
    this.route = '';
    this.storageOK = true;
  }
  state(id) {
    if (!this.states.has(id)) this.states.set(id, {
      attempts: 0,
      correct: 0,
      incorrect: 0,
      deaths: 0,
      active: 0,
      assisted: false,
      solved: false,
      failures: {},
      attemptCounts: {},
      revealedObjectives: {},
      rouletteResets: 0,
      rouletteSpins: 0,
      rouletteSelected: null,
      entered: null,
      solvedAt: null,
      passedAttempt: null,
      exitAt: null
    });
    return this.states.get(id);
  }
  start() {
    if (this.started !== null) return;
    this.started = this.now();
    this.previousTick = this.started;
    this.enter(this.current || this.rooms[0].id);
  }
  clock(active) {
    const now = this.now();
    if (this.started !== null && this.finished === null && this.current && this.wasActive) this.state(this.current).active += Math.max(0, now - this.previousTick);
    this.previousTick = now;
    this.wasActive = !!active;
  }
  elapsed() {
    return this.started === null ? 0 : Math.max(0, (this.finished ?? this.now()) - this.started);
  }
  enter(id) {
    this.current = id;
    const s = this.state(id);
    if (this.started === null) return;
    if (s.entered === null) {
      s.entered = this.now();
      this.event('room_enter');
    }
  }
  canEnter(id) {
    const i = this.rooms.findIndex(r => r.id === id);
    return i === 0 || i > 0 && this.rooms.slice(0, i).every(r => this.state(r.id).solved);
  }
  event(type, detail = {}) {
    if (this.started === null || this.finished !== null && type !== 'session_complete') return null;
    const room = this.rooms.find(r => r.id === this.current),
      s = this.state(this.current),
      row = {
        schema_version: 1,
        game_version: EpikSession.version,
        session_id: this.id,
        record_type: 'event',
        event_id: this.id + ':' + ++this.seq,
        event_sequence: this.seq,
        timestamp_iso: this.wall(),
        elapsed_session_ms: Math.round(this.elapsed()),
        room_id: this.current,
        room_name: room?.name || '',
        challenge_type: room?.challenge?.id || '',
        event_type: type,
        assistance_used: s.assisted,
        room_active_ms: Math.round(s.active),
        room_elapsed_ms: s.entered === null ? 0 : Math.round((s.exitAt ?? this.now()) - s.entered),
        final_route: this.route,
        language: window.I18n?.lang || 'es',
        ...detail
      };
    this.events.push(row);
    this.persist();
    this.onChange?.();
    return row;
  }
  begin(context, answer, parameters) {
    if (this.started === null || this.finished !== null || this.state(this.current).solved) return null;
    const s = this.state(this.current),
      objective = context.objective_id || 'main',
      n = s.attemptCounts[objective] = (s.attemptCounts[objective] || 0) + 1;
    s.attempts++;
    const id = this.id + ':a' + s.attempts + ':' + this.current,
      detail = {
        ...context,
        objective_id: objective,
        attempt_id: id,
        attempt_number: n,
        submitted_answer: answer && typeof answer === 'object' ? JSON.stringify(answer) : answer ?? '',
        parameters_json: JSON.stringify(parameters ?? {})
      };
    this.pending.set(id, {
      room: this.current,
      detail
    });
    this.event('attempt_submitted', detail);
    return id;
  }
  resolve(id, result, reason = '') {
    const pending = this.pending.get(id);
    if (!pending || pending.room !== this.current) return false;
    this.pending.delete(id);
    const s = this.state(this.current),
      {
        detail
      } = pending;
    if (result === 'correct') s.correct++;
    if (result === 'incorrect') {
      s.incorrect++;
      s.failures[detail.objective_id] = (s.failures[detail.objective_id] || 0) + 1;
    }
    this.event('attempt_result', {
      ...detail,
      result,
      failure_reason: reason
    });
    return true;
  }
  attempt(context, answer, parameters, correct, reason = '') {
    const id = this.begin(context, answer, parameters);
    this.resolve(id, correct ? 'correct' : 'incorrect', reason);
    return id;
  }
  interrupt(reason) {
    for (const id of [...this.pending.keys()]) this.resolve(id, 'interrupted', reason);
  }
  available(objective) {
    return !this.state(this.current).solved && (this.state(this.current).failures[objective] || 0) >= 3;
  }
  assist(context, parameters) {
    if (!this.available(context.objective_id)) return false;
    const s = this.state(this.current);
    const key = context.objective_id + '|' + (context.variant_id || '');
    s.assisted = true;
    if (!s.revealedObjectives[key]) {
      s.revealedObjectives[key] = true;
      this.event('solution_revealed', {
        ...context,
        parameters_json: JSON.stringify(parameters),
        assistance_used: true
      });
    }
    return true;
  }
  solve() {
    const s = this.state(this.current);
    if (s.solved) return false;
    s.solved = true;
    s.solvedAt = this.now();
    s.passedAttempt = s.attempts;
    this.event('room_solved', {
      stars_earned: 1
    });
    return true;
  }
  leave() {
    const s = this.state(this.current);
    if (!s.solved) return false;
    if (s.exitAt === null) {
      s.exitAt = this.now();
      this.event('room_exit');
    }
    return true;
  }
  finish() {
    if (this.finished !== null || this.preview || !this.rooms.every(r => this.state(r.id).solved)) return false;
    this.leave();
    this.finished = this.now();
    this.wasActive = false;
    this.event('session_complete');
    return true;
  }
  totals() {
    const solved = [...this.states.values()].filter(s => s.solved);
    return {
      completed: solved.length,
      assisted: solved.filter(s => s.assisted).length,
      stars: solved.length,
      valid: !this.preview && this.finished !== null
    };
  }
  // Teacher-facing export: one stable row per room, no event log or JSON cells.
  rows() {
    return this.rooms.filter(room => this.state(room.id).entered !== null).map(room => {
      const state = this.state(room.id);
      const end = state.exitAt ?? this.finished ?? this.now();
      const usedHint = this.events.some(event => event.room_id === room.id && event.event_type === 'normal_help');
      return {
        'Sala': room.name,
        'Tiempo total (minutos)': Number((Math.max(0, end - state.entered) / 60000).toFixed(2)),
        'Muertes': state.deaths,
        'Errores': state.incorrect,
        'Intentos hasta pasar': state.solved ? state.passedAttempt : '',
        'Usó pistas': usedHint ? 'Sí' : 'No',
        'Usó IA': state.assisted ? 'Sí' : 'No'
      };
    });
  }
  static cell(value) {
    if (value == null) return '""';
    let text = String(value);
    if (typeof value === 'string' && /^[\s]*[=+\-@]/.test(text)) text = "'" + text;
    return '"' + text.replaceAll('"', '""') + '"';
  }
  csv() {
    return '\uFEFF' + EpikSession.columns.join(',') + '\r\n' + this.rows().map(row => EpikSession.columns.map(k => EpikSession.cell(row[k])).join(',')).join('\r\n');
  }
  download() {
    const url = URL.createObjectURL(new Blob([this.csv()], {
        type: 'text/csv;charset=utf-8'
      })),
      a = document.createElement('a');
    a.href = url;
    a.download = 'Aventura_EPIK_' + new Date().toISOString().slice(0, 10) + '_' + this.id + '.csv';
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  recoverySnapshot() {
    return {
      id:this.id, studentName:this.studentName, difficulty:this.difficulty, at:this.now(),
      started:this.started, finished:this.finished, seq:this.seq,
      events:this.events, states:[...this.states], pending:[...this.pending],
      current:this.current, route:this.route, preview:this.preview
    };
  }
  restoreSnapshot(saved, away) {
    // performance.now() starts over on reload. Rebase all absolute timestamps
    // while keeping durations, attempt IDs and the original session ID intact.
    const shift = this.now() - saved.at - away;
    this.difficulty = saved.difficulty === 'easy' ? 'easy' : 'normal';
    this.id = saved.id; this.studentName = String(saved.studentName || '').slice(0,80);
    this.events = saved.events; this.seq = saved.seq;
    this.states = new Map(saved.states);
    for (const state of this.states.values())
      for (const key of ['entered','solvedAt','exitAt'])
        if (state[key] !== null) state[key] += shift;
    this.started = saved.started === null ? null : saved.started + shift;
    this.finished = saved.finished === null ? null : saved.finished + shift;
    this.current = saved.current; this.route = saved.route; this.preview = false;
    this.pending = new Map(saved.pending || []);
    this.previousTick = this.now(); this.wasActive = false;
    this.interrupt('browser_closed');
  }
  persist() {
    try {
      this.storage?.setItem('epik.metrics.v1.latest', JSON.stringify({
        schema: 1,
        session: this.id,
        complete: this.finished !== null,
        preview: this.preview,
        events: this.events,
        rooms: [...this.states],
        route: this.route
      }));
    } catch {
      this.storageOK = false;
    }
  }
};
