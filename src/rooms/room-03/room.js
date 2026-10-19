// Laberinto conceptual: el mapa y los reinicios viven en maze.js.
window.ESCAPE_ROOMS = window.ESCAPE_ROOMS || [];
window.ESCAPE_ROOMS.push({
  id: 'room-03', name: 'El laberinto de los ecos', color: [133, 116, 91],
  environment:{kind:'interior',label:'Galería de los inadores',tint:'#3b493d',abandoned:true,ceilingHeight:1.5,portraits:['doof','planck']},
  spawn: { x: 2.5, y: 8.5, angle: 0 },exitX:49.65,conceptual:true,
  challenge: { id: 'challenge-03', title: 'Cuatro decisiones de física', implemented: true },
  canUnlock(context) { return context.mazeSolved === true; },
  map: [] // ConceptMaze construye las cuatro galerías y sus puertas.
});
