# Formato v2 de los reels (desde el 10 nov)

Objetivo: público con historias de trading (volumen de alcance) → seguidores → el bot (comentario fijado «Comenta BOT» y
píldora «cuenta auditada del bot en la bio» en el CTA). Los guiones NO hablan del bot ni afirman nada sobre él.

## Por qué se cambió (diagnóstico del 9 nov, mirando los vídeos fotograma a fotograma)

1. **Primer segundo flojo**: el fotograma 0 era casi negro, sin texto legible (el subtítulo entraba con fundido) y la
   animación empezaba «de cero» (vela enana, contador en 1). Quien hace scroll decide en menos de un segundo.
2. **Media pantalla vacía y trazo fino**: la escena ocupaba la mitad del encuadre; en el móvil se veía «poca cosa».
3. **Subtítulos pequeños** y bajos.
4. **El «sígueme» cortaba la historia**: 2,5–4 s de pantalla con solo el botón, justo en el momento de más interés.
5. **Final largo y estático** (5–7 s de pregunta con dos botones): la gente se va antes de acabar y baja la retención.
6. **Voz lenta** (~2,7 palabras/s) y vídeos de 37–41 s.
7. **Guiones**: ganchos que empezaban con fecha o nombre («En 1929…»), moralejas abstractas y sin serie reconocible.

## Vídeo (opciones del `Montaje`, todas opcionales)

- `gancho={{ lineas, hasta, color }}`: titular escrito en grande desde el fotograma 0 (sin fundido). Mientras está en
  pantalla no hay subtítulos (nunca dos textos a la vez). Dura lo que la primera frase (~2,5 s).
- `zoom={1.1}` + `empujes={0.05}`: encuadre más lleno y un acercamiento seco alterno en cada frase (cambio de plano cada 2–3 s).
- `tinta={1.3}`: trazos 3D más gruesos.
- `subs={{ y: 0.785, tamano: 108, ancho: 900 }}`: subtítulos más grandes.
- `bucle`: los últimos 0,4 s funden con el primer fotograma (enlaza al repetirse).
- «Sígueme» encima de la escena: la escena anterior sigue viva, desenfocada y atenuada, con `CtaSeguir sinFondo` encima.
  El «sígueme» grande, el botón y la píldora de la cuenta auditada se ven siempre.
- Empezar «en la acción»: en el fotograma 0 el personaje ya está en su emoción más fuerte y la cifra ya es grande.
- Con el zoom, nada importante a menos de ~90 px de los bordes laterales; personajes hacia el centro.
- Voz: `ATEMPO=1.12 PAUSA_MAX=0.22 PAUSA_UMBRAL=40`.

## Guion (85–98 palabras → 30–33 s con la voz al 1,12)

1. **Gancho (≤ 14 palabras)**: resultado o conflicto primero, en presente o pasado inmediato, con cifra. Nunca empezar
   por fecha, lugar o un nombre desconocido. Dos datos que chocan: «En demo hizo un 300 %. Con dinero real duró 11 días».
2. **Frases cortas** (≤ 12 palabras), una imagen por frase. Una sola idea por vídeo.
3. **«Sígueme» (≤ 8 palabras)** pegado al momento de suspense: «Sígueme, que ahora viene lo que duele».
4. **Giro / lo que pasó.**
5. **La regla en una línea**, concreta y con número si se puede (para guardar y enviar).
6. **Cierre (≤ 14 palabras)**: pregunta que se contesta con una palabra + «etiqueta / mándaselo a…».

## Serie y personajes

- **Marcos** (gorra): el impulsivo; comete todos los errores. **Lucía** (coleta): la que aprende y pone método.
  Se repiten para que la gente los reconozca y etiquete («tu Marcos», «la Lucía de tu grupo»).
- Mezcla diaria: 1 historia de Marcos, 1 historia real con cifra enorme (la de prueba de las 18:00, público amplio),
  1 de Marcos o Lucía con regla práctica.
- Historias reales: solo datos documentados; cifras redondeadas a la baja o con «más de».

## Qué medir (pedir capturas de Estadísticas)

- % que pasa de los 3 primeros segundos y gráfico de retención (dónde cae).
- Envíos y guardados por alcance (los envíos son lo que más empuja a no seguidores).
- Comparar siempre v1 frente a v2 en reels de prueba.
