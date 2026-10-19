/* A swept plane: collision depends on relative crossing and jump height, not FPS. */
window.EricFlameWave = class {
  static config = {
    first: 15 * 1.2 / 1.1,
    interval: 19 * 1.2 / 1.1,
    warning: 2.2,
    speed: 4,
    startX: 16.6,
    endX: 1.1,
    height: .24,
    cooldown: 5
  };
  constructor(onEvent) {
    this.onEvent = onEvent;
    this.enabled = EpikDifficulty.profile.flameEnabled;
    this.reset();
  }
  reset() {
    this.phase = 'idle';
    this.timer = EricFlameWave.config.first;
    this.x = EricFlameWave.config.startX;
    this.previousPlayer = null;
    this.caught = false;
  }
  get blocksPotions() {
    return this.phase !== 'idle';
  }
  tick(dt, player, hazardsClear = true) {
    const p = {
        x: player.x,
        z: player.jumpHeight || 0
      },
      cfg = EricFlameWave.config;
    this.previousPlayer ??= p;
    if (!this.enabled || this.caught) return;
    let remaining = Math.max(0, dt);
    while (remaining > 1e-8 && !this.caught) {
      if (this.phase === 'idle') {
        if (!hazardsClear) {
          this.timer = Math.max(0, this.timer - remaining);
          break;
        }
        const step = Math.min(remaining, this.timer);
        this.timer -= step;
        remaining -= step;
        if (this.timer <= 1e-8) {
          this.phase = 'warning';
          this.timer = cfg.warning;
          this.onEvent('warning');
        } else break;
      } else if (this.phase === 'warning') {
        const step = Math.min(remaining, this.timer);
        this.timer -= step;
        remaining -= step;
        if (this.timer <= 1e-8) {
          this.phase = 'wave';
          this.x = cfg.startX;
          this.onEvent('launch');
        } else break;
      } else if (this.phase === 'wave') {
        const step = Math.min(remaining, (this.x - cfg.endX) / cfg.speed),
          old = this.x;
        this.x -= step * cfg.speed;
        remaining -= step;
        const a = old - this.previousPlayer.x,
          b = this.x - p.x,
          crossed = a >= 0 && b <= 0 || Math.min(Math.abs(a), Math.abs(b)) < .12;
        if (crossed) {
          const f = a === b ? 1 : Math.max(0, Math.min(1, a / (a - b))),
            z = this.previousPlayer.z + (p.z - this.previousPlayer.z) * f;
          if (z < cfg.height) {
            this.caught = true;
            this.onEvent('hit');
            break;
          }
        }
        if (this.x <= cfg.endX + 1e-8) {
          this.phase = 'cooldown';
          this.timer = cfg.cooldown;
          this.onEvent('end');
        } else break;
      } else {
        const step = Math.min(remaining, this.timer);
        this.timer -= step;
        remaining -= step;
        if (this.timer <= 1e-8) {
          this.phase = 'idle';
          this.timer = cfg.interval;
          this.onEvent('resume');
        } else break;
      }
    }
    this.previousPlayer = p;
  }
  draw(r, player, actors, time) {
    if (!['warning', 'wave'].includes(this.phase) || this.caught) return;
    const c = r.ctx,
      x = this.phase === 'wave' ? this.x : EricFlameWave.config.startX;
    c.save();
    for (let y = 1.2; y < 13.8; y += .32) {
      const a = actors.project(r, player, x, y, .03),
        b = actors.project(r, player, x, y + .34, .03),
        tip = actors.project(r, player, x, y + .16, this.phase === 'wave' ? .30 + Math.sin(y * 10 + time * 14) ** 2 * .14 : .1);
      if (!a || !b || !tip || a.depth > (r.depths[Math.floor(a.x / 3) * 3] ?? Infinity) + .1) continue;
      c.globalAlpha = this.phase === 'warning' ? .4 + .25 * Math.sin(time * 12) : .85;
      c.fillStyle = Math.floor(y * 3) % 2 ? '#caff69' : '#3fe56d';
      c.beginPath();
      c.moveTo(a.x, a.y);
      c.lineTo(tip.x, tip.y);
      c.lineTo(b.x, b.y);
      c.closePath();
      c.fill();
    }
    c.restore();
  }
};
