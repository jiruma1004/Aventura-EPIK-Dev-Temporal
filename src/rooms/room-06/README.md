# Sala VI · Intercepción de Eric

El terminal abre un radar horizontal. Los estudiantes controlan rapidez inicial, ángulo, retraso de lanzamiento y tiempo de vuelo. Pueden arrastrar el extremo verde de la trayectoria (equivale a ajustar rapidez y ángulo), observar las rutas previstas y ensayar sin perder vidas. El reloj táctico de Eric empieza al entrar a la sala y continúa mientras se planifica o se cierra la consola (×1); durante los ensayos ambos cohetes avanzan a ×20. Los intentos fallidos y el botón de restablecer controles no rebobinan el reloj. Eric llega al destino lunar a t≈517.84 s: activa game over, con el audio existente, y permite reintentar desde la plataforma. Solo reaparecer o volver a entrar a la sala reinicia esta persecución; el reloj general de la aventura conserva su comportamiento. Una intercepción lograda detiene el reloj e inicia automáticamente un único lanzamiento con una copia de la trayectoria confirmada. Iván queda enganchado, se suelta sin desviar el cohete y desaparece entre nubes. Continúan la intercepción, la prisión y la ceremonia. El diploma espera la interacción del estudiante; continuar o cerrar reproduce primero «Iván descenso» y después el cierre de capítulo.

Modelo local didáctico, **no una simulación orbital ni una misión lunar físicamente completa**. Coordenadas en km; tiempo en segundos. Cohete de Ignitia como partícula balística con rapidez inicial v₀, sin propulsión durante este tramo, sin aire, gravedad uniforme g=0.00981 km/s². Eric mantiene velocidad constante en este tramo gracias a su propio sistema de vuelo. La Luna es un destino narrativo fuera de escala.

- Ignitia: x=v₀ cos(θ)τ; y=v₀ sin(θ)τ−gτ²/2.
- Eric: xᴱ≈120+0.254903t; yᴱ≈60+0.115865t (coeficientes mostrados redondeados).
- Reloj común: t=t₀+d+τ, donde t₀ es el reloj táctico al comenzar el ensayo y d es el retraso de salida.
- Intercepción: distancia entre ambos ≤3 km en el instante elegido, sin haber caído antes al suelo y antes de t≈517.84 s.

El icono sólido es Eric en el instante actual; el icono tenue con círculo discontinuo indica su posición futura al encuentro. El extremo verde es la posición prevista de Ignitia. Los ejes se ajustan a las trayectorias; durante el arrastre conservan su escala para evitar saltos. Las líneas discontinuas son previsiones; las continuas son el vuelo simulado.

Referencia para docentes: con t₀=0 s, d=0 s y τ=80 s, el punto de encuentro es (137.6,68) km. Se obtiene vx=1.72 km/s, vy=1.2424 km/s; v₀≈2.1219 km/s y θ≈35.84°. No se muestra esta solución al estudiante. Se aceptan muchas combinaciones distintas.

`interception.js` contiene el modelo puro y el panel. `rocket.js` conserva diálogos, retratos y cinemática. Cerrar, cambiar de habitación o agotar el tiempo cancela el ensayo. Cambiar cualquier parámetro invalida la confirmación previa. Se mantienen traducciones ES/EN.

Pruebas del modelo: `node tests/interception.cjs`. La sala de propagación de errores sigue archivada bajo `room-015`, con su bandera desactivada.

La Luna pixelada se dibuja con bloques locales en Canvas en el extremo de la ruta de Eric: (252,120) en el mapa didáctico reducido. No representa la distancia astronómica real a la Luna. El icono sólido de Eric se mueve también durante la planificación, y el punto de encuentro previsto se recalcula con el tiempo actual.

El vuelo y la intercepción se reproducen continuos, sin detenerse en cada texto. La ceremonia espera clics; el diploma abre el epílogo de la ruta elegida, también por clic. El destino lunar permanece en (252, 120) km al cambiar la rapidez de Eric.

Rapidez actual de Eric: 0,28 km/s exactos. Se normaliza la dirección (11,5), conservando la Luna en (252,120) km; la llegada se calcula como distancia/rapidez. Las ecuaciones y el reloj visibles derivan de los mismos valores.

## Patio de lanzamiento (17 octubre 2026)

`launchpad.js` añade una plataforma circular empotrada en el pavimento, sendero
con ribetes de latón y guía turquesa hacia la consola, cuatro balizas,
estandartes y una estructura de servicio detrás del cohete. Conserva las
coordenadas de interacción, las colisiones y el diseño/tamaño de la consola.
El escudo del fuselaje continúa usando el arte de Ignitia existente.

Las tres texturas decorativas se generan al entrar y se reutilizan: 256 × 512
cada una, aproximadamente 1.5 MiB RGBA en total, sin descargas nuevas de imágenes.
No hay filtros de desenfoque animados ni partículas adicionales.

### Optimización del motor compartido

- Seno/coseno de la cámara calculados una vez por cuadro para las muestras del suelo.
- Muestras contiguas del mismo color agrupadas en un solo rectángulo.
- Búfer de profundidad de muros reutilizado, actualizado en todas las columnas utilizadas.
- Retrato de José Luis omitido cuando el diálogo está oculto; el aviso de vuelo
  deja de calcular texto de la secuencia cuando no se muestra.

En Chrome headless, vista 1280 × 800, una vista fija por sala con inclinación y
salto, las llamadas `fillRect` de `renderer.draw` fueron:

| Sala | Antes | Después |
| --- | ---: | ---: |
| Puente | 8843 | 2736 |
| Cañón | 8693 | 1975 |
| Ruleta | 16450 | 10106 |
| Laberinto | 16464 | 8815 |
| Corredor | 9001 | 1880 |
| Eric | 8985 | 1620 |

La comparación de los píxeles RGBA de esas seis vistas dio cero diferencias.
La reducción de llamadas no es una medición de FPS; el rendimiento final depende
del equipo, la resolución y la escena. El peso de audios/sprites no cambia.

Prueba: `tests/launchpad-performance.browser.cjs`. Para reproducir la comparación,
extraer `src/engine/renderer.js` del commit `1dcffa0` a un archivo temporal y pasar
su ruta mediante `BASELINE_RENDERER`. `PLAYWRIGHT_MODULE` puede apuntar al módulo
local de Playwright y `BASE_URL` al servidor de pruebas con `?dev=1` habilitado.
La prueba también comprueba escritorio/móvil, interacción de consola,
intercepción, caché de adornos y ausencia de dibujos del retrato oculto.
