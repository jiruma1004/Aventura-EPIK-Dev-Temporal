/* Integration boundary: each game system emits an attempt exactly where it commits it. */
window.EpikClassroom = class {
  constructor(rooms, getGame, canUse) {
    this.rooms = rooms;
    this.game = getGame;
    this.canUse = canUse;
    this.newSession();
    this.aid = new EpikAssistance(this.session, () => ({
      ...this.game(),
      snapshot: () => this.snapshot()
    }), () => this.context());
    this.aid.canUse = canUse;
    this.session.onChange = () => this.aid.update();
  }
  newSession() {
    const studentName = this.session?.studentName || '';
    let storage = null;
    try {
      storage = localStorage;
    } catch {}
    this.session = new EpikSession(this.rooms, {
      storage
    });
    this.session.studentName = studentName;
    if (this.aid) {
      this.aid.session = this.session;
      this.session.onChange = () => this.aid.update();
      this.aid.close();
    }
  }
  context() {
    const g = this.game(),
      r = g.room;
    let objective = 'main',
      question = '',
      variant = '';
    if (r.trial) {
      objective = 'plank-' + g.trial.stage;
      question = objective;
    } else if (r.physics) {
      objective = 'target';
      variant = String(g.lab.room.physics.targetX);
    } else if (r.roulette) {
      question = String(g.roulette.current?.id || '');
      objective = 'roulette-' + question;
    } else if (r.conceptual) {
      objective = g.maze.dungeon ? 'dungeon-' + g.maze.question.title : 'gallery-' + g.maze.stage;
      question = g.maze.question.title;
      variant = g.maze.dungeon ? 'visit-' + g.maze.dungeonVisit : objective;
    } else if (r.corridor && g.corridor.guardian.arrived) {
      question=g.corridor.guardian.question.id;objective='guardian-seal-'+Math.min(g.corridor.guardian.stage,2);
    } else if (r.boss) {
      objective = 'cut-' + (g.boss.active < 0 ? g.boss.puzzle.cuts[0] ? 1 : 0 : g.boss.active);
      variant = String(g.boss.puzzle.support.id);
    } else if (r.rocket) objective = 'intercept';
    return {
      objective_id: objective,
      question_id: question,
      variant_id: variant
    };
  }
  snapshot() {
    const g = this.game(),
      r = g.room;
    if (r.trial) return {
      ...g.trial.question,
      stage: g.trial.stage
    };
    if (r.physics) return {
      ...r.physics
    };
    if (r.roulette) return g.roulette.current || {};
    if (r.conceptual) return {
      ...g.maze.question,
      stage: g.maze.stage,
      dungeon: g.maze.dungeon
    };
    if(r.corridor&&g.corridor.guardian.arrived)return {id:g.corridor.guardian.question.id,text:g.corridor.guardian.question.text};
    if (r.boss) {
      const s = g.boss.puzzle.support;
      return {
        id: s.id,
        parabola: s.parabolaText,
        line: s.lineText,
        intersections: s.intersections
      };
    }
    if (r.rocket) return {
      ericSpeed: InterceptionPhysics.ericSpeed,
      gravity: InterceptionPhysics.g,
      epoch: g.ignitia.simulator.missionTime,
      limits: InterceptionPhysics.limits
    };
    return {
      lava: r.lava
    };
  }
  enter() {
    const g = this.game();
    this.aid.close();
    this.session.enter(g.room.id);
    const attempt = (answer, correct, reason = '') => {
      this.session.attempt(this.context(), answer, this.snapshot(), correct, reason);
      if (correct) this.session.event('objective_completed', this.context());
    };
    if(g.corridor)g.corridor.guardian.onAnswer=(values,ok)=>attempt(values,ok,ok?'':'wrong_vector');
    if (g.trial) g.trial.onAnswer = (answer, ok) => attempt(answer, ok, ok ? '' : 'wrong_platform');
    if (g.maze) g.maze.onAnswer = door => attempt(door.text, door.correct, door.correct ? '' : 'wrong_door');
    if (g.boss) g.boss.onAnswer = q => attempt({
      x: q.x,
      y: q.y
    }, q.correct, q.correct ? '' : 'wrong_intersection');
    if (g.room.roulette) g.roulette.onAnswer = (values, ok) => attempt(values, ok, ok ? '' : 'wrong_answer');
    g.lab.onAttemptStart = values => {
      this.cannonAttempt = this.session.begin(this.context(), values, {
        ...this.snapshot(),
        ...values
      });
    };
    g.lab.onAttemptEnd = (ok, reason) => this.session.resolve(this.cannonAttempt, ok ? 'correct' : 'incorrect', reason);
    g.ignitia.simulator.onAttemptStart = params => {
      this.rocketAttempt = this.session.begin(this.context(), params, {
        ...this.snapshot(),
        ...params
      });
    };
    g.ignitia.simulator.onAttemptEnd = (result, reason) => this.session.resolve(this.rocketAttempt, result, reason);
    this.aid.update();
  }
  solved() {
    const g = this.game(),
      r = g.room;
    return r.trial ? g.trial.finished : r.physics ? !!g.lab.shot?.result.hit && !!g.lab.shot?.done : r.roulette ? g.roulette.solved.size > 0 : r.conceptual ? g.maze.finished : r.corridor ? g.opened && g.corridor.guardian.solved : r.boss ? g.boss.puzzle.solved : r.rocket ? g.ignitia.simulator.ready : false;
  }
  solve() {
    if (this.solved()) this.session.solve();
  }
  death(type, alreadyAttempt = false) {
    this.aid.close();
    this.session.interrupt('death');
    const s = this.session.state(this.game().room.id);
    s.deaths++;
    this.session.event('death', {
      failure_reason: type
    });
    const r = this.game().room;
    if (!alreadyAttempt && !s.solved && (r.trial || r.corridor)) this.session.attempt(this.context(), 'movement', this.snapshot(), false, type);
  }
  respawn() {
    this.session.event('respawn', this.context());
    this.aid.update();
  }
  route() {
    const choice = StoryRoute.choice;
    if (StoryRoute.chosen && this.session.route !== choice) {
      this.session.route = choice;
      this.session.event('route_selected', {
        final_route: choice
      });
    }
  }
  tick(dt, active) {
    this.session.clock(active);
    this.aid.tick(dt);
  }
  certificate() {
    const totals = this.session.totals();
    return {
      ...totals,
      studentName: this.session.studentName,
      performance: EpikRanks.summary(this.session),
      download: () => this.session.download()
    };
  }
};
