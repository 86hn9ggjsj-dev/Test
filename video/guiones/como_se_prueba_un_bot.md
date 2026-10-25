# Cómo se prueba un bot antes de arriesgar un euro

Parte 2 de «Qué hace de verdad un bot de trading». Guion de voz en off (~58 s, 1080x1920), mismo formato: 8 pantallas,
5 pasos («PASO 01 / 05»…). Cada bloque es una pantalla de motion graphics.

**hook**  
Que un bot gane en el pasado no significa nada. Lo que importa es cómo se ha probado.

**backtest**  
Primero: backtest. Pasas el bot por años de datos reales, vela a vela, como si estuviera operando en directo.

**costes**  
Segundo: costes reales. Comisiones, spread y deslizamiento. Un bot que gana sin costes... puede perder con ellos.

**fuera**  
Tercero: datos que no ha visto. Lo ajustas con unos años y lo pruebas con otros. Si solo funciona donde lo ajustaste, está sobreoptimizado.

**estres**  
Cuarto: estrés. Barajas sus operaciones mil veces y miras la peor racha. Si esa caída no la aguantarías... no está listo.

**demo**  
Quinto: demo. Semanas en tiempo real, con dinero ficticio. Y compruebas que hace lo mismo que en el backtest.

**real**  
Y solo entonces, dinero real. Poco. Y subiendo poco a poco, si los números lo confirman.

**cta**  
Sígueme, y en el próximo vídeo te enseño los tres errores que hacen que un backtest mienta.

## Versión con gestos (ElevenLabs, modelo Eleven v3)

Las etiquetas entre corchetes no se leen: marcan respiraciones, pausas y tono. Las palabras son las mismas que arriba,
así el vídeo se sincroniza solo. Pegar con una línea en blanco entre párrafos.

[inhales] Que un bot gane en el pasado... no significa nada. [short pause] Lo que importa es cómo se ha probado.

Primero: backtest. [inhales] Pasas el bot por años de datos reales, vela a vela... como si estuviera operando en directo.

Segundo: costes reales. Comisiones, spread y deslizamiento. [exhales] Un bot que gana sin costes... puede perder con ellos.

[inhales] Tercero: datos que no ha visto. Lo ajustas con unos años... y lo pruebas con otros. [short pause] Si solo funciona donde lo ajustaste... está sobreoptimizado.

Cuarto: estrés. Barajas sus operaciones mil veces y miras la peor racha. [exhales] Si esa caída no la aguantarías... no está listo.

[inhales] Quinto: demo. Semanas en tiempo real, con dinero ficticio. [short pause] Y compruebas que hace lo mismo que en el backtest.

[softly] Y solo entonces... dinero real. [short pause] Poco. [exhales] Y subiendo poco a poco, si los números lo confirman.

[warmly] Sígueme, y en el próximo vídeo te enseño los tres errores que hacen que un backtest mienta. [chuckles]

## Pantallas

| Bloque | Titular | Motivo |
|---|---|---|
| hook | un bot que gana *en el pasado* | curva de capital perfecta que llega a la línea AHORA y se agrieta |
| backtest | lo pasas por *años* de datos | cabezal que recorre 2019 → 2024 vela a vela; contador de operaciones |
| costes | gana *sin* costes | curva bruta y neta separándose; cada operación resta comisión, spread y deslizamiento |
| fuera | datos que *no ha visto* | línea temporal partida AJUSTE / PRUEBA: perfecta en una mitad, se desploma en la otra |
| estres | la *peor* racha | abanico de 1.000 curvas barajadas; la peor caída resaltada (MÁX. CAÍDA) |
| demo | lo mismo que en el *backtest* | curva de demo dibujándose encima de la del backtest, con la desviación medida |
| real | poco a *poco* | bloques de capital que crecen 1 → 2 → 4 solo cuando la curva lo confirma |
| cta | los tres *errores* | backtest bajo una lupa con 3 marcas; botón Siguiendo |
