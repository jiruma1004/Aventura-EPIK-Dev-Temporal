# Sala 1.5 · La medida del rey

**Archivada y desactivada.** Para recuperarla, cambia `window.MEASUREMENT_ENABLED` a `true` en `room.js`. Se conservan el escenario, las reglas, la validación y las pruebas.

Sala opcional entre Galileo y la ruleta. Entrada por la puerta lateral norte del bosque, después del puente; también figura como I.5 en el selector. Volver al bosque conserva el puente abierto. Al resolver el sello y atravesar la puerta real, se llega a la sala II. No cambia los índices ni la culminación 6/6 del recorrido principal.

Para retirarla, poner `window.MEASUREMENT_ENABLED=false` en `room.js`. La puerta lateral y la entrada del selector desaparecen al recargar.

Las reglas SVG originales tienen cero en los bordes de la abertura. Altura: 243 cm, graduación 1 cm. Anchura: 126.4 cm, graduación 1 mm. Las ampliaciones muestran las mismas marcas, sin escalar ni alterar las lecturas.

Modelo: incertidumbres estándar independientes suministradas por el ejercicio, u(h)=0.5 cm y u(b)=0.05 cm. No se deducen de una distribución rectangular ni se presentan como límites máximos. Propagación de primer orden: u(A)=sqrt((b*u(h))²+(h*u(b))²). Área sin redondeo: 30715.2 cm²; incertidumbre aproximada: 64.36 cm². Criterio declarado: incertidumbre a una cifra significativa, área al mismo orden decimal. Respuesta: (30720 ± 60) cm²; se aceptan 3.072e4 y 6e1. El validador comprueba valores y posición del último dígito, rechazando precisión falsa como 30720.0 y 60.0.

Arte vectorial local en `measurement.js`, sin dependencias ni imágenes externas. Pruebas: `node tests/measurement.cjs`.
