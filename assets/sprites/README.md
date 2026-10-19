# Personajes de Astralia

`dr-eric.png`: dos gestos enfadados con cejas fruncidas, derivados de la fotografía aportada. Generado con la herramienta integrada de imágenes; fondo transparente y dos columnas para el prólogo de Paola. Se eliminaron el marco circular y el icono de la captura.

## Eric de cuerpo completo · sala V

Archivo: `dr-eric-standing.png`. Generado con la herramienta integrada de imágenes a partir del retrato aprobado con bata; el retrato del prólogo se conserva.

Prompt: Use case: identity-preserve. Reference image: existing two portraits of Dr. Eric from our pixel RPG. Create a SINGLE full-body standing sprite of this exact recognizable professor, front-facing, arms folded, stern angry eyebrows. Keep his round face, short brown hair, black glasses, white chemistry lab coat, pale blue shirt and dark tie. Add dark trousers and shoes. Dignified chemistry professor as fantasy game antagonist, polished chunky 16-bit pixel art, crisp pixel clusters. Entire body visible head to shoes, centered with margin. Transparent background, one character, no text, no frame, no scene, no duplicates. Square output, portrait-shaped character occupies height.

## Actualización de Eric con bata

Archivo: `dr-eric.png`. Editado con la herramienta integrada de imágenes, conservando dos cuadros de animación y la identidad del retrato.

Prompt final: Edit target: the attached two-frame pixel-art Dr. Eric sprite sheet. Preserve this man's recognizable face, light brown short hair, round black glasses and angry eyebrows. Stylize him as a respected chemistry professor: white laboratory coat with broad lapels, pale blue shirt, tasteful dark tie, small pens in breast pocket. Show upper torso so the lab coat is unmistakable. Refine the proportions into polished 16-bit RPG pixel art, dignified and stern rather than caricature. Exactly TWO equal square frames side by side, identical pose and scale: left closed mouth, right slightly open speaking mouth. Transparent background, no text, no labels, no extra frames. Keep crisp pixels and comfortable transparent margins. Output 2:1 sprite sheet.

## Prompt original usado para Eric

Use case: identity-preserve and style-transfer. Edit the supplied photo into a chunky retro pixel-art character portrait sprite sheet for Dr. Eric, the fictional villain in a playful educational fantasy game. Preserve the recognizable round face, light skin, short light brown hair and black round eyeglasses from the photo. Remove the circular photo frame, outdoor background, grey app background and X close icon entirely. Head and shoulders wearing a dark shirt. Strong visibly furrowed angular eyebrows above and behind the glasses, narrowed eyes and an irritated frown: he is comically angry that students never put titles on their graphs. EXACTLY TWO equally sized square cells side by side on a transparent alpha background, with identical head scale and alignment, ample padding around hair and shoulders. LEFT: angry frown, mouth closed. RIGHT: same pose, eyebrows slightly more furrowed and mouth slightly open as if grumbling. Pixel art matching classic RPG dialogue portraits: crisp square pixel clusters, limited warm palette, dark outlines, no photographic texture or antialias blur. No text, no numbers, no symbols, no additional character, no scene. Keep both faces centered in their half of the sheet and consistent between frames.

`epi-ivan.png`: sprite sheet de dos columnas, reposo y mordida. Generado con la herramienta integrada de imágenes a partir de la foto proporcionada por el usuario; sin API externa ni clave. La animación recorta cada mitad al dibujar en canvas, con suavizado desactivado.

`epi-paola.png`: retrato basado en la foto aportada de Epi Paola, generado con la herramienta integrada de imágenes. Tiene dos columnas iguales: boca cerrada y hablando, con fondo transparente. `RoomCompanions` alterna los cuadros mientras escribe el diálogo y vuelve al reposo al terminar. No usa servicios externos durante el juego.

## Prompt usado para Paola

Use case: identity-preserve and style-transfer. Edit the supplied photograph of Epi Paola into a retro pixel-art dialogue portrait sprite sheet for a fantasy educational game. Preserve her recognizable face, skin tone, dark straight hair, facial proportions and magenta shirt neckline from the photograph. Exactly TWO equal-width square cells arranged horizontally, aligned with identical head size, shoulders and eye positions. Each cell shows head and shoulders with complete hair silhouette and ample transparent padding. LEFT FRAME: friendly attentive expression, mouth gently closed. RIGHT FRAME: same face and pose, mouth slightly open speaking, subtle warm smile. Only the mouth and tiny expression change; do not shift or scale her head between frames. Chunky crisp pixel art, visible square pixel clusters, limited warm palette, dark pixel outline, matching a classic RPG conversation portrait. No photoreal texture, no antialias blur. True transparent alpha background in both cells. No letters, no labels, no scene, no extra figures or frames. This sheet will animate her speaking by alternating the two equal halves.

## Prompt usado para Ivan

Edit the supplied photograph into a playful retro video game enemy sprite sheet. Preserve the recognizable identity, hairstyle, facial hair, facial proportions and pale pink shirt of this adult man. Output a transparent PNG sprite sheet with EXACTLY TWO equally sized cells arranged side by side horizontally, no margins between cells, identical fixed camera scale and identical position in each cell. Each cell shows the same floating bust portrait from top of head to upper chest, centered within that cell with generous transparent padding. LEFT FRAME: mischievous expression, mouth closed. RIGHT FRAME: same face, comically wide open mouth showing simple blocky teeth, as if taking a cartoon bite. Friendly humorous monster chase, no blood, no gore, no weapons. Strong chunky pixel art with visible square pixel clusters, limited palette, crisp hard edges, no smoothing, no photographic textures, dark pixel outline, readable at tiny game scale. Both busts must have equal heights and be aligned at the eyes and shoulders. Transparent alpha background, no scene, no labels, no text, no extra frames. This will be animated by alternating left and right frames in a first-person educational dungeon game.

## EPI Paola · opción A con lentes (6 de octubre)

Diseño A aprobado a partir de la nueva foto con lentes. `epi-paola-glasses-a-talk.webp` contiene boca cerrada/abierta y se usa en el prólogo, ayuda H y diálogos de Ignitia. Conserva la animación por sílabas de `PaolaPortrait`. `epi-paola-glasses-a-talk.gif` es una exportación independiente a 12 fps del mismo código.

La ceremonia utiliza `../cinematics/paola-glasses-a-gesture.webp` y su exportación `.gif`: sostiene la tablet, levanta el brazo hacia la derecha y vuelve al reposo. Sus anclajes y boca están registrados en `gesture-sprites.js`.

Generados con la herramienta integrada `image_gen`; prompts y refinamientos en `paola-glasses-a-prompts.json`. Las versiones anteriores permanecen archivadas y no están conectadas a las apariciones actuales del juego.

Angélica por comunicador: `angelica-radio-talk.webp`, dos fotogramas horizontales de boca cerrada/abierta generados con image_gen a partir de su sprite de ceremonia. Prompt: `angelica-radio-prompt.json`. Se anima durante la revelación del texto y descansa al terminar.
