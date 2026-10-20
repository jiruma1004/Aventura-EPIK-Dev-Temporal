# Los tres sellos del jardín

El jardín sigue dentro de room-04; no aumenta las siete salas del certificado.
La fuente está en (56,4.5), la baldosa en (61.5,4.5), el guardián del libro
Luis a la izquierda en (66.15,3.15), Rodrigo a la derecha en (66.15,5.85) y la puerta en x=67.
Bancos, jardineras, esferas armilares y antorchas ornamentan el parque.
El castillo del fondo utiliza arte pixelado de 480x320 y carga al entrar al corredor.

## Interacción y lógica

Al pisar la baldosa con ambos pies en el suelo, se orienta la cámara hacia la
puerta, se liberan los controles y aparecen dos globos anclados a las estatuas.
Solo se puede responder desde esa baldosa. Los tres retos son de elección múltiple:

1. Reposo instantáneo: velocidad cero no implica aceleración cero. Elegir la
   afirmación justificada, sin atribuir un papel permanente a la estatua.
2. Un inciso de cálculo de uno de los tres ejercicios originales:
   - Trigonométrico: velocidad a t=0, con ω=1 rad/s. (-5,0) m/s.
   - Polinómico: velocidad media de t=2 a t=4, con a,b,c,d numéricos. (1,.75) m/s.
   - Dron: velocidad a t=3. (6,-2) m/s.
3. Otro inciso del mismo ejercicio que se resolvió en el sello anterior:
   - Trigonométrico: aceleración a t=0. (0,5) m/s².
   - Polinómico: rapidez instantánea a t=2. √1.25 ≈ 1.12 m/s.
   - Dron: posición a t=3, con r₀=(2,1) m. (15.5,4) m.

Un error cambia a otro ejercicio dentro del sello actual; el siguiente acierto
no reutiliza la misma pregunta. Cada sello numérico tiene su propia bolsa de tres
variantes. Al pasar al tercer sello se conserva la familia de ejercicio, con un
inciso distinto. Solo el primer sello es teórico.

Las voces se sortean independientemente para cada sello y se guardan: una
estatua puede acertar o engañar en cualquier prueba. Al fallar se elige otra pregunta y se asignan de nuevo las voces; reabrir o
recuperar no las cambia. La inscripción advierte que hay que juzgar
cada afirmación, sin anunciar quién es confiable. Los datos y la respuesta siguen
siendo inequívocos; la ambigüedad está en la intención de los guardianes. Los errores mantienen los sellos previos.
Tras un acierto, un botón separado presenta la siguiente pregunta; doble envío no
puede saltar una prueba. La tercera respuesta inicia una apertura de 2.8 segundos,
con sonido y hojas animadas desde las bisagras. El bloqueo físico se retira solo
al terminar la animación. El antiguo botón de preparación no permite saltarse el reto.

## Ayudas, registro y recuperación

Paola solo ofrece una observación breve en el acertijo conceptual, sin
identificar al guardián ni revelar la relación física. En los dos sellos de cálculo conserva
la orientación completa para el ejercicio. Palma se ofrece después de tres errores en el sello
actual; en el cálculo deja la sustitución sin evaluar. Su uso mantiene la penalización
existente de una estrella para el corredor. Intentos y errores se registran por sello;
los cálculos y respuestas pesan 80%, las muertes 20%. Una sola fila en el CSV.

Guardado local existente de siete minutos: al entrar al jardín, pisar la baldosa,
responder y abrir la puerta. Guarda sellos, asignación de voces por pregunta, variantes, bolsas restantes, selección actual y avance
de apertura. Una recuperación a mitad de apertura continúa desde allí, sin repetir
respuestas. Compatibilidad con el guardado anterior: quien ya había completado el
antiguo acertijo conserva el acceso; quien aún no lo hizo inicia los tres sellos.

## Arte y pruebas

assets/garden: luis-monument-v2.webp, rodrigo-monument.webp, fountain.webp, gate-frame.webp,
gate-leaves.webp, castle-16bit.webp. Todas son imágenes locales con alpha.
Fuentes y prompts ImageGen en outputs/guardian-garden-2026-10-16/twin-guardians
(del workspace). Puerta separada en marco y hojas mediante recorte técnico FFmpeg;
el movimiento, ornamentos, baldosa y globos se dibujan en el juego.

Pruebas: twin-guardians.browser.cjs cubre ambas asignaciones iniciales y las tres variantes,
respuestas desde la baldosa, errores, doble clic, recuperación, Palma, apertura,
salida física a Eric, móvil y el periódico restaurado. corridor.cjs, lava.cjs,
local-transitions.browser.cjs y recovery.browser.cjs cubren las regresiones relevantes.

Ambas estatuas levantan la palma izquierda hacia delante, como los Argonath. Se acercaron 0.95 unidades al plano de
la puerta y 0.60 al centro; conservan libre el paso central y sus colisiones usan
las mismas coordenadas que el dibujo. Sprites WebP 384x576 con transparencia.

Volumen visual: estatuas de 3.3294 unidades sobre un basamento de 0.16: altura
total 3.4894: figura reducida un 7% respecto a la versión monumental;
sigue siendo más alta que la puerta (3.25). Escala proporcional, caras del basamento
proyectadas en perspectiva y sombra de contacto.
Globos con letra de 18px (15px en móvil) y mayor anchura. Se anclan a la nueva altura y al iniciar el diálogo la cámara mira
ligeramente hacia arriba (pitch 0.24). El halo verde de divergencia es una
textura Canvas de 384x320 creada una vez y dibujada detrás del castillo; no modifica
el arte aprobado ni añade descargas.

## Banco por sello
Cada sello tiene tres preguntas: tres de juicio conceptual, tres sobre magnitudes
y movimiento, y las tres variantes de cálculo originales. Un error selecciona
una distinta de la bolsa restante, limpia la respuesta y conserva los sellos.
El identificador de objetivo es estable por sello; las variantes se registran
por separado, sin reiniciar el conteo de fallos ni el umbral de Palma. Guardado v4
preserva la bolsa; v1–v3 conservan el avance y reciben bolsas compatibles.

Guardado v5: conserva el orden teoría/cálculo/cálculo. Los guardados anteriores
conservan los sellos ganados; se descarta su selección pendiente para no aplicarla
a un inciso distinto.
