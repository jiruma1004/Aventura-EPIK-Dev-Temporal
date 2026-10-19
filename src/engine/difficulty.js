/* Only motor difficulty changes. Equations, answers and scoring stay identical.
 * Read the selected profile when entering a room; recovery restores it first. */
window.EpikDifficulty = {
  mode: 'normal',
  select(mode) { this.mode = mode === 'easy' ? 'easy' : 'normal'; },
  get easy() { return this.mode === 'easy'; },
  get profile() {
    return this.profiles[this.mode];
  },
  profiles: Object.freeze({
    normal: Object.freeze({
      platformCheckpoint: false, ivanSpeed: .8751645,
      symbolSpeed: 1.6, symbolInterval: (28.5 - 1.8) / 1.6 / 3 / 2 / 1.4 / 1.5,
      potionFirst: 8 * 1.2 / 1.1, potionInterval: 9 * 1.2 / 1.1, flameEnabled: true
    }),
    easy: Object.freeze({
      platformCheckpoint: true, ivanSpeed: .8751645 * .8,
      symbolSpeed: 1.6 * .8, symbolInterval: (28.5 - 1.8) / 1.6 / 3 / 2 / 1.4 / 1.5 * 1.5625,
      potionFirst: 8 * 1.2 * 1.2 / 1.1, potionInterval: 9 * 1.2 * 1.2 * 1.25 / 1.1, flameEnabled: false
    })
  })
};
