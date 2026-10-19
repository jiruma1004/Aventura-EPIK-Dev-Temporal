# La parábola de Eric · veinte variantes

Al entrar se sortea un par de ecuaciones de una bolsa de 20, sin repetir hasta agotarla y sin repetir entre bolsas consecutivas. Morir conserva ecuaciones y cortes; reiniciar o volver a entrar sortea otra variante.

Cada configuración usa y = x²/d + c y una recta que corta en dos raíces de signo opuesto. Los pares de raíces combinan −2, −3, −4, −5 con 2, 3, 4, 5, 6; d alterna entre 3 y 4 y c varía entre 1 y 3. Las expresiones, puntos de corte, gráfica y validación salen del mismo objeto. La pista no presupone un denominador fijo.

Cada láser recibe el punto (x, y) de su rama, operando con clic o E. Se admiten coordenadas redondeadas a dos decimales (tolerancia vertical 0,04 en ambas ecuaciones). Dos cortes distintos desactivan la estructura y permiten continuar con la huida de Eric. Las respuestas incorrectas no causan daño.

`tests/boss.cjs` obtiene las raíces independientemente con la fórmula cuadrática y contrasta las 20 expresiones visibles. `tests/wood-variants.browser.cjs` resuelve ambas ramas de cada variante mediante el formulario, incluyendo muerte y reaparición entre cortes.

## Consolas y máquina
Los dos láseres muestran pantalla verde y un globo visible con profundidad y oclusión.
Al entrar en alcance mirando la consola se abre el panel holográfico; cerrar no
lo vuelve a abrir hasta alejarse 2.6 unidades y regresar. Clic/E siguen disponibles.
Las validaciones y ataques se mantienen. El panel oculta temporalmente el texto
del reto para evitar que se superponga, y lo restaura al cerrar.
La máquina usa texturas Canvas reutilizadas de metal y latón y arcos eléctricos
animados leves, sin filtros de desenfoque. Los efectos se detienen al resolver.
Prueba: tests/boss-machinery.browser.cjs.

## Fosa y ambientación
La fosa ocupa x ∈ [17,24), y ∈ [1,14): todo el ancho interior, sin franjas
laterales de suelo. El puente resuelto solo ocupa la fila y ∈ [7,8).
EricArena proyecta un fondo 2.4 unidades más abajo y muros de mampostería;
las mismas celdas gobiernan el dibujo y las caídas. Ventanales de Δ, incrustaciones
de latón y conductos verdes integran el laboratorio al patio medieval.
Prueba: guardian-pool-pit.browser.cjs recorre ambas orillas y comprueba el puente.
