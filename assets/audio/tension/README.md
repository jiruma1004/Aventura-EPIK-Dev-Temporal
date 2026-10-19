# Música futura del Dr. Eric

Esta carpeta queda reservada para pistas de tensión. Todavía no se reproduce ni se solicita ningún archivo adicional.

Puntos de entrada en `src/engine/adventure.js`:

- `ADVENTURE_CONFIG.musicCues.warning`: música para los últimos 10 minutos.
- `ADVENTURE_CONFIG.musicCues.danger`: música para los últimos 3 minutos.
- También hay reservas `calm`, `expired` y `complete`.

Los valores empiezan en `null`. Al cambiar de fase se emite en `window` el evento `astralia:urgency`, con `detail.phase`, `detail.remainingSeconds` y `detail.musicCue`. Cada fase se emite una vez por transición, no cada segundo.

Cuando tengamos los audios, guardar aquí las pistas, asignar sus rutas y conectar este evento al mezclador de `Sound`. Rellenar una ruta por sí solo no cambia la música. La integración deberá conservar los controles de volumen, silencio, las transiciones de victoria y la pausa al ocultar la pestaña.
