/* Short-lived, device-local recovery. No account, server or downloaded CSV.
 * savedAt is refreshed only by an active game, never by the recovery prompt.
 * This is resilience against accidental closure, not an anti-cheat boundary.
 */
window.EpikRecovery = class {
  static key = 'epik.developer.recovery.v1';
  static ttl = 7 * 60 * 1000;
  static version = 1;
  constructor({capture, restore, reset, now = () => Date.now(), storage}) {
    this.capture = capture; this.restore = restore; this.reset = reset; this.now = now;
    try { this.storage = storage ?? sessionStorage; } catch { this.storage = null; }
    this.pending = null; this.enabled = false; this.busy = false;
    document.body.insertAdjacentHTML('beforeend', '<dialog id="recovery-dialog"><h2 id="recovery-title"></h2><p id="recovery-detail"></p><p id="recovery-status" role="status"></p><div class="recovery-actions"><button id="recovery-yes" class="primary"></button><button id="recovery-no"></button></div></dialog>');
    this.dialog = document.querySelector('#recovery-dialog');
    this.dialog.addEventListener('cancel', event => event.preventDefault());
    document.querySelector('#recovery-yes').onclick = () => this.accept();
    document.querySelector('#recovery-no').onclick = () => this.decline();
    window.addEventListener('pagehide', () => this.save());
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) this.save();
    });
    window.addEventListener('astralia:language', () => this.render());
    this.timer = setInterval(() => {
      if (this.pending) this.render();
      else if (!document.hidden) this.save();
    }, 2000);
  }
  remove() { try { this.storage?.removeItem(EpikRecovery.key); } catch {} }
  valid(data) {
    const age = this.now() - data?.savedAt;
    return data?.version === EpikRecovery.version && Number.isFinite(age)
      && age >= 0 && age < EpikRecovery.ttl && data.world && data.session
      && typeof data.session.id === 'string' && Array.isArray(data.session.states)
      && Array.isArray(data.session.events) && Number.isFinite(data.session.at)
      && Number.isFinite(data.remaining) && data.remaining >= 0
      && !data.session.preview;
  }
  offer() {
    let saved;
    try { saved = JSON.parse(this.storage?.getItem(EpikRecovery.key) || 'null'); } catch {}
    if (!this.valid(saved)) { this.remove(); return false; }
    this.pending = saved;
    document.querySelector('#adventure-intro').close();
    this.render(); this.dialog.showModal(); return true;
  }
  render() {
    if (!this.pending) return;
    const en = window.I18n?.lang === 'en';
    const seconds = Math.max(0, Math.ceil((EpikRecovery.ttl - (this.now() - this.pending.savedAt)) / 1000));
    document.querySelector('#recovery-title').textContent = en ? 'Return to your last save?' : '¿Quieres regresar a tu último guardado?';
    document.querySelector('#recovery-detail').textContent = en
      ? 'Resume at a safe point with your progress, attempts and penalties. Time away is deducted from the game clock.'
      : 'Retoma desde un punto seguro con tus avances, intentos y penalizaciones. El tiempo fuera se descuenta del reloj.';
    document.querySelector('#recovery-status').textContent = seconds
      ? (en ? 'Recovery available for ' : 'Puedes recuperarlo durante ') + Math.floor(seconds / 60) + ':' + String(seconds % 60).padStart(2, '0')
      : (en ? 'The 7-minute recovery period has expired.' : 'El plazo de recuperación de 7 minutos terminó.');
    const yes = document.querySelector('#recovery-yes');
    yes.textContent = en ? 'Recover game' : 'Recuperar partida'; yes.disabled = !seconds || this.busy;
    document.querySelector('#recovery-no').textContent = en ? 'Start a new game' : 'Comenzar de nuevo';
    if (!seconds) this.remove();
  }
  accept() {
    if (this.busy || !this.pending) return;
    if (!this.valid(this.pending)) { this.render(); return; }
    this.busy = true;
    const data = this.pending, away = this.now() - data.savedAt;
    try {
      this.restore(data, away);
      this.pending = null; this.dialog.close(); this.enabled = true;
      this.save();
    } catch (error) {
      console.warn('Recovery rejected:', error.message);
      this.remove(); this.reset?.();
      document.querySelector('#recovery-status').textContent = window.I18n?.lang === 'en'
        ? 'This save cannot be recovered. Start a new game.'
        : 'No se pudo recuperar este guardado. Comienza una partida nueva.';
      document.querySelector('#recovery-yes').disabled = true;
      this.pending = null;
    } finally { this.busy = false; }
  }
  decline() {
    if (this.busy) return;
    this.pending = null; this.enabled = false; this.remove(); this.dialog.close();
    document.querySelector('#adventure-intro').showModal();
  }
  save() {
    if (!this.enabled || this.pending) return;
    const data = this.capture();
    if (!data) return;
    if (data.expired) { this.remove(); return; }
    try { this.storage?.setItem(EpikRecovery.key, JSON.stringify({
      ...data, version: EpikRecovery.version, savedAt: this.now()
    })); } catch { /* Storage disabled/full: gameplay still works. */ }
  }
};
