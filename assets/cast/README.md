## Pulido de expresiones · 13 de octubre de 2026

Nuevos recursos de ceremonia de Karla, té hacia la izquierda, alumnos, choque de Eric, pánico/captura de Iván y retrato cercano de Paola. Carrera con hojas mediante piezas articuladas y fases opuestas; `ivan-run.js` mantiene la orientación de la cara. El primer plano de captura recorta un único cuadro y el actor del mundo se oculta al ser atrapado.

Fuentes, GIFs y prompts del generador integrado image_gen: `../../../astralia-animation-library/actions/README.md`. Respaldo local `../../../backups/before-expression-polish/`.

# Poses específicas · revisión local

José Luis e Iván ahora llevan túnicas medievales. Se añadieron seis hojas de acciones y un torso de persecución. La caminata del lanzamiento sigue la dirección proyectada de la ruta. El martillo, las tazas, las hojas y los gestos ya forman parte de las ilustraciones. [Repertorio, scripts y prompts](../../../astralia-animation-library/actions/README.md). Respaldo: `outputs/backups/before-scene-specific-poses/`.

# Reparto RPG · integración local

Actualización del 12 de octubre de 2026. José Luis conserva su camisa azul con rayas blancas verticales, sin chaleco que las oculte. El resto del reparto utiliza los diseños medievales aprobados: Angélica mostaza/azul, Paola café/crema, Karla marfil/carbón, Eric alquimista e Iván con camisa negra y pantalón beige.

## Recursos

- Seis hojas WebP transparentes de 1024 × 1280: 16 poses por personaje, celdas de 256 × 320 y ancla de pies (128, 304).
- Seis tiras de retratos de 768 × 192: reposo, parpadeo y dos estados de boca. Se usan en prólogo, ayuda y comunicaciones.
- `eric-cockpit.webp`: nuevo Eric detrás del cristal de su cohete.
- `wanted.webp`: retratos actuales de Karla y Eric en los carteles; las letras siguen siendo texto traducible.
- Prompts de esta revisión en `prompts.json`. Originales, GIFs, fuentes y prompts del reparto en `outputs/astralia-animation-library/`, relativos a la raíz del workspace.

Las ilustraciones y la edición del cohete se hicieron con image_gen. FFmpeg normaliza los atlas y exporta retratos/GIFs; Canvas compone los carteles. Los scripts reproducibles están en `scripts/build-cast-portraits.cjs` y `scripts/build-wanted.browser.cjs`.

## Uso en el juego

`src/cinematics/rpg-cast.js` centraliza poses, anclas, retratos y accesorios. Cambiar de gesto reutiliza una imagen ya decodificada; no descarga un GIF nuevo. Las texturas del mundo se recortan una vez por fotograma y se guardan en caché. La carga de ceremonias y epílogos sigue dependiendo de la ruta seleccionada.

Se actualizaron el prólogo, la llegada en carreta, la ayuda, los personajes del laberinto y de la parábola, el escape de Eric, la sala de Ignitia, el lanzamiento con Iván, la intercepción, ambas ceremonias, ambos epílogos y los cinco bloopers. La escena archivada de aplausos también usa el reparto nuevo, pero no se reincorporó al recorrido principal.

Los mensajes principales y las réplicas de los bloopers se revisaron en español e inglés. El lanzamiento incorpora retratos por radio sin añadir pausas. Las ceremonias conservan avance por clic, diploma, rutas y protección contra doble activación. Quien escucha puede reaccionar mientras habla la otra persona. Caminata, sorpresa, caída, saludo, explicación, reflexión, risa y aplauso se seleccionan según la escena.

Las ecuaciones, respuestas, dificultad, puntuación, guardado y tiempos de las secuencias no cambiaron. La animación de boca es por estados visuales, no sincronización fonética.

## Verificación

- `tests/classroom.browser.cjs`: recorrido y validaciones de las siete pruebas, ayudas, métricas, diplomas y epílogos de ambas rutas.
- `tests/final-polish.browser.cjs`: cámara, consola, intercepción, diplomas adaptables, una estrella por IA, epílogo automático y continuación única.
- `tests/cinema-loading.browser.cjs`: descarga por ruta, 500 dibujos a opacidad completa, espera de decodificación, cancelación y recuperación tras un fallo de recurso.
- `tests/rpg-cast.browser.cjs`: ocho variantes de escenas, 96 fotogramas transparentes con contenido, boca/reposo, cinco bloopers, métricas intactas en galería, radio en móvil, traducción y ausencia de errores del navegador.
- Biblioteca: `tests/validate.cjs` verifica los seis atlas y 90 GIFs, incluidas las nuevas rayas de José Luis.
- Inspección visual de introducción, mensajes, ceremonias, cohete, prisión, cabaña y bloopers.

Para las pruebas de navegador se necesitan Playwright y Chrome. Admiten `PLAYWRIGHT_MODULE`; las nuevas pruebas permiten `BASE_URL` (por defecto http://127.0.0.1:8767).

## Respaldo y publicación

Respaldo previo en `outputs/backups/before-rpg-cast-local/`: código anterior y anterior José Luis de la biblioteca. Los recursos originales del juego se conservan en sus carpetas existentes.

Esta versión está aplicada solo en local. No se realizó commit, push ni publicación en GitHub.
