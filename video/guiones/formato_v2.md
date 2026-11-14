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

## Escenarios que se entienden (desde el 10 nov, petición del usuario: «currate más los escenarios»)

Cada escena tiene que leerse en 1 segundo, sin sonido y en el móvil. Mismo estilo (alambre blanco, toques de verde y
rojo), pero con decorados reales en vez de cajas abstractas:

- **Un lugar reconocible por escena** con sus objetos típicos: metro (pasillo, bancos, asas, barras, ventanas, luces
  del túnel), baño (váter con cisterna y cadena, papel, lavabo, espejo, puerta «WC»), cena (mesa con mantel, platos,
  copas, vela, ventana con ciudad, lámpara, sillas)… Piezas reutilizables en `src/Bot/decorados.tsx`; añadir ahí las
  nuevas (oficina, dormitorio, calle, banco, bolsa, casino…).
- **Personajes haciendo algo concreto** con un objeto en la mano (móvil, billete, botón) y, si ayuda, un bocadillo
  corto («¿EN SERIO?»).
- **Gráficos con velas grandes** dentro de una pantalla y rótulos en el propio gráfico («CERRÓ AQUÍ», «OBJETIVO ✓»),
  nunca una línea fina sola.
- **Decorado nítido**: `apertura` baja (6–8) en escenas con decorado; el desenfoque fuerte solo para el polvo.
- Píldora arriba con el lugar o el dato («EN EL METRO», «VEZ Nº 120») cuando cambia la escena.
- Nada importante cortado por los bordes (revisar los fotogramas sueltos antes de renderizar).

## Guion: regla 5-30-10 (desde el 11 nov; referencia que pasó el usuario el 10 nov)

El vídeo se piensa como una línea de tiempo en tres partes (~115–130 palabras → 40–45 s con la voz al 1,12):

**0–5 s · Gancho (≤ 14 palabras).** Una afirmación que incomode o una promesa con prueba (cifra, caso real, resultado).
Nada de «Hola», «hoy te voy a enseñar», fechas, lugares o nombres desconocidos al principio: si no engancha en 5 s, deslizan.
- Afirmación que incomoda: «Si miras el gráfico más de 10 veces al día, estás regalando dinero».
- Promesa con prueba: «Este hombre perdió 20.000 millones en 2 días. Y lo que le hundió te puede pasar con 500 €».
- Dos datos que chocan: «En demo hizo un 300 %. Con dinero real duró 11 días».

**5–35 s · Una sola idea (≈ 30 s).** Desarrollar UNA idea alrededor de la promesa del gancho (no el sistema completo ni
la solución perfecta): historia → **«sígueme» a mitad (obligatorio)** en el momento de suspense → giro → la regla en una
línea, concreta y con número (para guardar y enviar). Frases cortas (≤ 12 palabras), una imagen por frase.

**Últimos ~10 s · Conversión.** Aquí solo llega la gente más interesada: se la lleva al sistema de conversión orgánica
(palabra clave en comentarios → mensaje directo). Plantilla, igual que el comentario fijado:
«Si has llegado hasta aquí, [frase que reconoce que es de los interesados]. Comenta BOT y te explico por privado cómo lo
hago yo, y te paso la cuenta auditada de mi bot.» (como en la referencia: palabra en comentarios → mensaje directo que
explica cómo aplicarlo). ~28 palabras = 10 s. En la parte de 30 s no van «etiqueta / mándaselo»: solo la idea.
Sin cifras ni promesas sobre el bot. Visual: caja de comentario que escribe «BOT», se envía, llega el mensaje directo y
la tarjeta «CUENTA AUDITADA ✓». La pregunta + «etiqueta / mándaselo» pasa a ser opcional y, si va, al final de la parte
de 30 s (una línea).

Recursos visuales de la referencia que encajan con nuestro estilo: un fotograma 0 raro o en plena acción (interrumpe el
scroll), «pruebas» que entran como tarjetas (cifras, titulares, recortes), números grandes en fichas cuando se enumera
y cambio de escenario cada 5–8 s.

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

## Estilo limpio (desde el 12 nov, petición del usuario: «hay mucho ruido visual, mantenlo simple, limpio pero currado»)

- **Un elemento principal por escena** (personaje + un objeto + una cifra como mucho). Mucho espacio negro.
- **Un solo texto a la vez** además de los subtítulos (una ficha o un título pequeño, nunca píldora + ficha + rótulo).
  Nada que repita lo que ya dicen los subtítulos.
- **Escenario mínimo y bien hecho**: línea del suelo (`horizonte`), `escritorioLimpio` (mesa y monitor; ventana o reloj solo
  si la escena los necesita), sin partículas (`polvo`), sin rejillas de suelo, sin objetos de relleno (tazas, cuadros, teclados).
- **Luz**: `Foco` (charco de luz suave bajo el personaje u objeto) en vez de decorado.
- Gráficos 2D grandes y limpios (pocas velas, una línea) y tipografía grande para las cifras.
- Empujes de cámara suaves (`empujes={0.035}`), temblor y fogonazos solo en el momento clave.

## Formato v3 «dopamina» (propuesto el 13 nov: los reels no pasan de 1.000 visitas)

Diagnóstico: con 40–45 s y un primer segundo poco visual, casi nadie llega al final y el algoritmo deja de enseñarlo.
- **Mezcla diaria**: 2 cortos de alcance (15–25 s, una idea, «sígueme» a mitad, final «etiqueta / mándaselo» que se
  comparte) + 1 historia de 30–35 s con el cierre «comenta BOT». El comentario fijado lleva el BOT en todos.
- **Primer segundo**: algo moviéndose ya (contador, vela, billetes volando), una cifra o emoción enorme y un golpe de sonido.
- **Ritmo**: un cambio visual cada 1–1,5 s (golpe de zoom, corte, cifra nueva); nada quieto más de 2 s.
- **Recompensas**: fogonazo de color y golpe en cada cifra clave; contadores que corren; temblor en el impacto.
- **Final en bucle**: el último plano enlaza con el primero para que se vuelva a ver.
- **Audio**: al publicar, añadir un audio en tendencia de Instagram muy bajo (5–10 %) debajo de la voz.
- **Medir**: tasa de salto (los que se van en los 3 primeros segundos), tiempo medio visto y envíos de cada reel.
- **Cómo se hace (desde el 14 nov)**: sin personajes; piezas en `src/Bot/v3.tsx` (cifras que corren, marcas ✓/✗ que se
  dibujan, tickets, botones que se pulsan, iconos de guardar y enviar, ancla) y `golpes={[[t, color?], …]}` en el `Montaje`
  (golpe de zoom seco y fogonazo de color en los bordes en cada palabra clave). Golpe de sonido en la primera palabra
  (evento de la primera palabra en `golpes` del script de Python). Referencias: Proceso, Anclaje y Roi.

## 14 nov: todo en 5-30-10 + dopamina de la referencia (el usuario: «tienen que generar dopamina y respeta lo del vídeo»)

Los cortos de 15-25 s del v3 quedan descartados: TODOS los vídeos siguen la 5-30-10 de la referencia (~40-45 s,
115-130 palabras): gancho ≤ 14 palabras (≤ 5 s), una sola idea con el «sígueme» a mitad y la regla, y los últimos ~10 s
de conversión con palabra clave → mensaje directo («Si has llegado hasta aquí, … Comenta BOT y te explico por privado
cómo lo hago yo, y te paso la cuenta auditada de mi bot»). En fondeo, la palabra es RIESGO (nada del bot).

Recursos de dopamina sacados de la referencia (igexport-DcOvTIOx0Yr, 63 s), traducidos a nuestro estilo sin cara:
- **Fotograma 0 raro** que obliga a mirar + una pregunta de curiosidad escrita («¿Qué coño está haciendo? 😅»): en la
  referencia, un tío agachado encima de un Cybertruck. Para nosotros: algo imposible en plena acción (un móvil con el
  bróker que cae hacia la cámara, una vela que rompe la pantalla…).
- **Transición física** del gancho a la idea (el móvil que lanza y cae a la cámara → plano cenital).
- **Pruebas que saltan como tarjetas**: miniaturas con cifras (vistas 3.281 → 1,2 M). Para nosotros: la ficha del
  estudio (revista, año, nº de cuentas) y cada cifra en tarjeta.
- **Cifras en fichas 3D grandes** («5», «30», «10») que entran de golpe con sonido.
- **Barra de tiempo** roja-amarilla-verde con un marcador que avanza (dónde estás en la idea).
- **Cambio de escenario cada ~5 s** (cortes en 9,7 · 14,5 · 17,7 · 23,4 · 29 · 35 · 41,7 · 45 · 56,8 s).
- **Iconos que orbitan** alrededor de la idea (bombilla con iconos girando).
- **Notificaciones apiladas** («Pago recibido +X €») como prueba de resultado.
- **Cierre en el móvil**: el comentario con la palabra y el mensaje directo que llega.
