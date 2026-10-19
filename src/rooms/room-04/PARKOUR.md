# Cruces sobre lava

La lava ocupa únicamente x=20…33. Hay dos rutas laterales, izquierda y derecha, y una isla intermedia en x=26.5 que permite cambiar de ruta. Las plataformas y el daño comparten exactamente la misma geometría en `CORRIDOR_LAVA`; los símbolos siguen avanzando en línea recta sobre esta zona.

Las colisiones de símbolos y cajas se reducen un 5 % del tamaño original en cada extremo (dimensión total al 90 %). El dibujo no cambia. Las cajas no ocupan las plataformas de aterrizaje. Se conservan el salto y la rapidez originales.

`tests/lava.cjs` recorre las tres rutas con integración del salto a 25, 30, 60 y 120 fps. `tests/corridor.cjs` comprueba los nuevos márgenes de contacto. Tocar la lava activa el game over y el reintento en el punto seguro de esta sala.
