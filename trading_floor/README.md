# Trading Floor

Una versión propia del "fondo gestionado con IA" de los vídeos de Instagram, pero honesta:
una **minería de estrategias** de verdad, un **embudo de pruebas de robustez**, **paper trading**
con precios reales y dinero ficticio, **control de riesgos**, una sala de **holding** a largo plazo,
otra de **macroeconomía**, y todo ello visto como una **oficina isométrica** animada en el navegador.

> Nunca envía órdenes a ningún exchange ni usa dinero real. Los buenos resultados en datos
> pasados (backtest) no garantizan nada sobre el futuro.

## Arrancarlo

| | Windows | Mac / Linux |
|---|---|---|
| Todo (oficina + paper trading + macro; la minería espera a tu botón) | doble clic en `trading.bat` | `./trading.sh` |
| Todo, pero minando por rondas sin parar | `trading.bat --minar-siempre` | `./trading.sh --minar-siempre` |
| Solo una ronda de minería | `trading.bat minar` | `./trading.sh minar` |
| Ver las estrategias aprobadas | `trading.bat banco` | `./trading.sh banco` |
| Resumen macro en la terminal | `trading.bat macro` | `./trading.sh macro` |
| Ver las carteras de holding | `trading.bat holding` | `./trading.sh holding` |
| Oficina + paper trading, sin minar | `trading.bat --sin-minar` | `./trading.sh --sin-minar` |

La primera vez instala lo necesario solo (hace falta Python 3). La oficina se abre en
http://127.0.0.1:8050. Con `--telegram` avisa de cada operación al móvil usando el bot de
Telegram de Jarvis, si lo tienes configurado.

## Cómo funciona

```
 Minería ──► Laboratorio (6 pruebas) ──► Banco ──► Sala de trading (papel)
 miles de       la mayoría cae aquí        las que      cada estrategia es un
 estrategias                               sobreviven   trader con 1.000 $ ficticios
```

1. **Datos.** Velas de 30 minutos de los últimos 3 años de Binance (API pública, sin claves) de BTC,
   ETH, SOL, BNB, XRP y DOGE, guardadas en `~/.trading_floor/datos/`.
2. **Minería** (`mineria.py`). **Solo busca cuando pulsas «🔍 Buscar estrategias»** (arriba en la
   oficina, eligiendo todos los activos con sitio en el banco o uno en concreto) o se lo pides por el chat; al
   terminar la búsqueda se queda en espera. La única excepción: si el supervisor retira una estrategia y no
   queda ninguna en la reserva, pide él un ciclo de búsqueda (uno solo) para tener recambio. Una estrategia es "entra en largo o en corto cuando se cumplan
   1-3 condiciones" (RSI, medias, cruces, rupturas, Bollinger, MACD, momento, volatilidad) más
   una salida por stop, objetivo o tiempo. Se generan al azar y con un algoritmo genético, y se
   prueban **solo en el 70 % inicial** de los datos.
3. **Laboratorio** (`robustez.py`). Las que parecen rentables pasan, en orden, por:
   - **Fuera de muestra**: ¿gana en el 30 % final, que la minería nunca vio?
   - **Costes x2**: ¿aguanta el doble de comisiones y deslizamiento?
   - **Consistencia**: ¿gana en la mayoría de los 6 tramos del histórico?
   - **Monte Carlo**: barajando 1.000 veces sus operaciones, ¿el peor 5 % sigue en positivo?
   - **Estabilidad**: ¿siguen ganando las variantes con parámetros vecinos?
   - **Test del mono**: en datos no vistos, ¿gana al 90 % de "monos" que entran al azar?
4. **Banco** (`banco.py`). Guarda las supervivientes (máximo 14 por activo en trading y 7 en scalping,
   contando las que están en la incubadora o en el banquillo) **sin repetidas**: no entra una estrategia que sea la
   misma idea que otra del banco (mismas condiciones con otros números; se mira antes de las pruebas), que
   entre casi en los mismos momentos (más del 30 % de sus entradas) o que esté dentro del mercado a la
   vez la mayor parte del tiempo. Tampoco si se parece a una que ya se retiró (las retiradas se guardan
   en `descartadas.json`). Las repetidas de versiones anteriores se quitan con «quita las repetidas» en el
   chat o `trading banco --limpiar-repetidas` (se queda la mejor fuera de muestra de cada idea).
5. **Incubadora** (`papel.py`, `config.INCUBADORA`). Toda estrategia nueva opera primero en la
   incubadora (planta 1) con **1.000 $ de prueba que no cuentan en tu fondo** y sin vetos de sala. Su
   examen: en trading, 10 operaciones y 7 días como mínimo, ganando y con un factor de beneficio de 1,1 o
   más (en scalping, 30 operaciones y 2 días); suspende si pierde un 4 % (3 % en scalping) o si en 60
   días (14 en scalping) no da la talla. Las aprobadas suben a una mesa libre con dinero del fondo, la de
   mejor nota primero (la nota mide lo clara que es su ventaja: media entre dispersión por la raíz del
   número de operaciones). Si la incubadora está llena (24 plazas de trading y 8 de scalping), esperan en
   el banquillo. Las suspendidas se descartan con su post mortem sin haber tocado tu dinero.
6. **Paper trading** (`papel.py`). Cada trader tiene su mesa (48 en trading, 12 en scalping) y el
   capital ficticio que le toca según tu reparto. Al cerrar cada vela comprueba si se cumplen
   **todas** sus condiciones: si falta alguna, espera; si se cumplen, pide permiso a Riesgos y entra;
   después sale sola por stop, objetivo o tiempo máximo. Son reglas exigentes: cada estrategia opera de
   media una vez cada pocos días (su ficha dice cada cuánto), así que es normal ver a muchos traders
   esperando. Usa precios reales y las mismas reglas que el backtest (`backtest.py`). Las posiciones se valoran a
   precio de mercado vela a vela, de ahí salen el resultado total, el de hoy y el de cada día.
   Además calcula el **radar de señales** de cada trader: cuántas de sus condiciones se cumplen
   ahora mismo, cuál falta, cuándo cierra la próxima vela, soporte, resistencia y ATR.
   - **Supervisor y periodo de prueba** (`config.PRUEBA`). Clara (trading) y Álex (scalping) vigilan
     a cada trader con su estrategia: en trading, 14 días y 6 operaciones cerradas; en scalping, 3 días
     y 20 operaciones. Si al acabar la prueba va en pérdidas, o si antes pierde un 5 % de su capital (un
     4 % en scalping), el supervisor le retira la estrategia **cuando no tiene nada abierto** y le da la
     mejor aprobada de la incubadora, en la misma mesa y con un periodo de prueba nuevo. Pasada la prueba
     sigue vigilando: si vuelve a pérdidas, se repite. Si no hay ninguna aprobada y la incubadora está
     vacía, la mesa espera y el supervisor pide un ciclo de búsqueda.
   - **Kelly prudente** (`config.KELLY_*`). Con 30 operaciones reales o más (contando las del examen), el
     riesgo de cada operación sale de la fórmula de Kelly, f = A − (1 − A) / R, con el acierto A rebajado
     en un error estándar (por si ha tenido suerte) y R = ganancia media / pérdida media. Se usa una cuarta
     parte, entre un 0,25 % y 1,5 veces tu riesgo por operación. Antes de las 30, el riesgo de siempre.
   - **Post mortem** (`postmortem.py`). Cada estrategia que se retira (por el supervisor, al suspender o
     a mano) lleva un informe: lo que prometía el backtest frente a lo que hizo en real (acierto, media por
     operación, factor de beneficio, operaciones al mes) y las causas: comisiones que se comen la ventaja,
     mercado en contra, acierto mucho más bajo, casi todo en stop, volatilidad distinta, frecuencia muy
     diferente o, simplemente, muy pocas operaciones para saber nada.
   - **Academia** (`academia.py`). Junta lo aprendido en real: qué tipos de condición y qué dirección
     tienen las estrategias que funcionan (aprobadas o rentables en su mesa) y las que fallan. La minería
     genera más a menudo lo que funciona y menos lo que falla (pesos entre ×0,4 y ×2,5), pero un 30 %
     sigue siendo al azar y todo pasa igualmente las pruebas y el examen. Una estrategia nunca se cambia
     sola según sus últimos resultados: eso sería adaptarse a la casualidad.
   - **Kill switch, pausar todo y reabrir** (`control.py`). «Pausar todo» es el freno manual (nadie abre
     posiciones nuevas; las abiertas siguen con su stop). «Kill switch» cierra además todas las
     posiciones abiertas del fondo al cierre de la última vela; la incubadora sigue porque no usa dinero
     del fondo. «Reabrir» quita el freno.
   - **Lo retirado sigue contando.** Cuando una estrategia sale del banco (la retira el supervisor, tú
     con «retira E-XXXXXX» o por repetida), su resultado queda congelado y sigue sumando en la sala y en
     tu fondo: quitar una estrategia que pierde no borra lo perdido. Si tenía algo abierto, se cierra al
     precio del momento.
7. **Control de riesgos** (`riesgo.py`). Encima del paper trading:
   - **Tamaño de cada operación**: arriesga como mucho el 1 % del capital de su trader si salta el
     stop (con un stop lejano se invierte menos; nunca más del 100 %).
   - **Vetos**: una entrada nueva se veta si ya había 16 posiciones abiertas en la sala de trading (12 en
     la de scalping, una por mesa: cada sala tiene su propio límite) o 3 iguales (mismo símbolo y
     dirección, también por sala) en ese momento, o si está activado un freno (los frenos son comunes).
     Se evalúa con las posiciones que estaban abiertas justo cuando llega la señal.
   - **Frenos**: si el día pierde un 2 % del capital, no se abren más posiciones hasta mañana; si el
     resultado cae un 6 % del capital desde su máximo, se pausan las entradas.
8. **Holding** (`holding.py`). Carteras de largo plazo (por defecto 5.000 $ en BTC, 3.000 $ en ETH y
   2.000 $ en SOL, ficticios) con un plan adaptativo y **sin stop loss**:
   - **Compra inicial** del 25 % del presupuesto.
   - **Promediar a la baja**: cada vez que el precio cae un 8 % desde la última compra, compra otro
     12,5 % del presupuesto, y así baja el coste medio. Si se acaba el presupuesto, mete capital de una
     **reserva** (un 50 % extra); nunca vende por miedo.
   - **Puntos de salida sobre el coste medio**: a +30, +60 y +100 % por encima del coste medio vende un
     20, 25 y 25 % de lo que tenga. Como se miden sobre el coste medio, se mueven solos al promediar.
     Siempre se queda una parte (el núcleo). Si después vuelve a bajar, promedia otra vez con lo cobrado
     y las salidas se rearman.

   Se simula con velas reales de 1 hora desde que se crea el plan. Puedes pedir otro plan por el chat o:

   ```bash
   ./trading.sh holding --nuevo BTCUSDT --presupuesto 5000 --paso 10 --tramo 15 --reserva 50 --salidas 30,60,100
   ```
9. **Scalping** (misma minería y paper trading, con velas de 5 minutos). Una sala aparte con 12 mesas
   (4 para BTC, 4 para ETH y 4 para SOL, los más líquidos). Se mina con 120 días de velas de 5 minutos y
   el mismo embudo de seis pruebas. Como los scalpers trabajan con órdenes límite, pagan comisión de
   «maker» (0,02 % por lado en Binance Futures) más un poco de deslizamiento: 0,06 % ida y vuelta, frente
   al 0,14 % de la sala de trading. Con la comisión de «taker» casi ninguna estrategia de 5 minutos
   sobrevive; con la de «maker» sí algunas. La sala enseña cuánto se paga en comisiones.
10. **Tu fondo** (`fondo.py`). Todo junto funciona como un fondo de inversión, con dinero ficticio:
   aportas capital (100.000 $ al empezar) y recibes participaciones a 10 $. El **valor liquidativo**
   (patrimonio / participaciones) solo sube o baja con los resultados de trading, scalping y holding;
   aportar o retirar dinero no lo cambia. Así la cabecera muestra tu patrimonio de verdad y un trader
   nuevo ya no «suma» 1.000 $. Calcula rentabilidad (hoy, 7 y 30 días, año, anualizada), volatilidad,
   Sharpe, caída máxima, mejor y peor día, rentabilidad mensual, la comparación con haber comprado BTC,
   el reparto del dinero por área, la liquidez y la exposición por activo. Puedes aportar o retirar
   (como mucho la liquidez) desde el dashboard o por el chat («aporta 5000», «retira 2000»).

   **Tu reparto**: eliges qué % del fondo va a cada área (al principio, trading 48 %, scalping 12 %,
   holding 10 % y liquidez 30 %). En trading y scalping el % se divide entre sus mesas (48 y 12), así que
   marca el capital de cada trader; en holding es el presupuesto de las carteras, repartido según su peso.
   Al cambiarlo, cada área opera con su capital nuevo **desde ese momento** y lo ganado antes se conserva
   (el resultado de cada trader se calcula por tramos de capital; las carteras de holding reciben o
   devuelven capital, y si les falta efectivo venden lo justo). Al aportar o retirar dinero se reajusta
   solo para mantener tus %. Se cambia en «Mi fondo» → «Cambiar el reparto» o por el chat («dedica un
   20 % al holding»).
11. **Macro** (`macro.py`). S&P 500, Nasdaq, VIX, dólar, EUR/USD, oro, petróleo, bono a 10 años
   (Yahoo Finance) y el Fear & Greed de cripto (alternative.me). Con ellos se calcula un régimen
   RISK-ON / RISK-OFF. Es contexto para el comité: **las estrategias no usan estos datos**.

Un ejemplo real de embudo (2.000 estrategias de BTC): 362 parecían rentables, 17 aguantaron
fuera de muestra y 3 entraron en el banco. Así es esto: casi todo es ruido.

## La oficina

Arriba a la izquierda eliges la vista: **🏢 Oficina** o **📊 Mi fondo**, tu dashboard personal con
todas las gráficas y los datos del fondo (rentabilidad frente a BTC, caída desde el máximo, resultado
por área, rentabilidad de cada día y de cada mes, dónde está tu dinero, exposición por activo,
operaciones, posiciones abiertas, mejores y peores estrategias, últimas operaciones y aportaciones).
Cada gráfica tiene su «tabla de datos» y el filtro de periodo (7, 30, 90 días o todo) está encima.

Todo lo que pasa en la oficina sale del estado real: los cubos de la cinta son estrategias
pasando pruebas, los lingotes de la cámara son las estrategias del banco, las pantallas de los
traders muestran su posición y su resultado, y el videowall los precios en vivo. Los personajes
comentan en el chat lo que ocurre (aprobaciones, descartes, operaciones, vetos, holding, datos
macro, radar de señales), a veces dirigiéndose a alguien ("Rocío → Jana"). El chat se puede filtrar
por canal: operaciones, riesgos, minería, análisis, macro, holding, comité y charla. El comité se
reúne cada 15 minutos (con cuenta atrás arriba), y cuando no hay trabajo se van a la sala de
descanso, al patio, al gimnasio o arriba, a la cafetería, la sala de juegos o la terraza.

- **Dos plantas** (botones arriba a la izquierda o teclas Re Pág / Av Pág). La **planta baja**: minería,
  laboratorio, cámara del banco, macro, holding, sala de trading, scalping, riesgos, comité, descanso y
  patio. La **planta 1**, que se ve encima del edificio de la planta baja:
  - **Incubadora**: 32 mesas de examen, el tablón de exámenes en la pared y Lorena, su supervisora.
  - **Equipo Quant**: Ainara (Kelly), Bernat (Monte Carlo) y Yago (post mortem), con una gran pantalla del
    Monte Carlo del fondo, Sharpe, Sortino, Calmar y el Kelly de cada trader.
  - **Academia**: Begoña da clase con lo aprendido en real (la pizarra lo muestra).
  - **Comunicación**: Rebeca y Gorka escriben el informe del día (pestaña «Informe»), con plató de TF News.
  - **Sistemas**: Néstor y los servidores; un panel enseña la salud del sistema (errores, duración del ciclo).
  - **Cafetería** con Chema el barista, **sala de juegos** (futbolín, recreativas, dardos y pufs) y una
    **terraza al aire libre** con pérgola y mesa larga, sombrillas, piscina con tumbonas, fogata con sofás,
    barbacoa, césped, árboles, telescopio y luces por la noche.
  La gente sube y baja en **ascensor**. Cuando una estrategia aprueba en la incubadora, su trader baja a
  entregarla a la mesa. **Satoshi, el gato**, se pasea por las dos plantas: duerme en el sofá o en una
  tumbona, se sienta junto a la fogata o se sube a la mesa de algún trader. Su ficha dice dónde está.
- **Botonera** (abajo): Comité, Megáfono (dices algo a toda la oficina), A trabajar, Descanso, Pausar todo
  o Reabrir, y Kill switch (con confirmación). En la cabecera, junto al patrimonio, está la caída del fondo
  desde su máximo.
- **Pestañas nuevas**: «Incubadora» (exámenes, banquillo y suspendidas con su post mortem), «Informe»
  (resultado por equipos, informe del día, Monte Carlo y sistemas) y «Academia» (lecciones, tipos de
  condición que funcionan o fallan, Kelly de cada trader y todos los post mortem).

- **Supervisión**: cada sala tiene su supervisor, que la patrulla y conoce sus números; la
  supervisión general hace rondas preguntándoles y acude corriendo si una sala se pone en rojo.
  La pestaña «Salas» muestra el semáforo de cada una. Cuando Clara o Álex retiran una estrategia que no
  funciona, van a la mesa y se lo explican al trader (qué le quitan, por qué y cuál le dan); el trader es
  el mismo y sigue en su mesa. Cada trader lleva en la lista su periodo de prueba («prueba 5/14 días»,
  «✓ prueba» o «⚠ a cambiar») y en su ficha las barras de días y operaciones, su examen de la incubadora y su
  Kelly. En la ficha de Clara y de Álex están las aprobadas que esperan mesa y las últimas estrategias retiradas.
- **Ranking**: podio y clasificación de traders por resultado total, de hoy, de la semana o por
  acierto (en papel), o por cómo lo hizo su estrategia en el backtest. El número 1 lleva corona.
- **Chat contigo (tú eres el jefe)**: escribe en la caja del chat a toda la oficina, o a alguien
  con `@Nombre`. Te contestan con los datos del momento, y si pides un cambio te lo **proponen**
  con botones de Aprobar / Rechazar: nada cambia hasta que lo apruebas. Decisiones posibles:
  buscar estrategias (o parar la búsqueda), activar o quitar un freno manual, pausar, reanudar o retirar a
  un trader, cambiar los límites de riesgo, rehacer un plan de holding y convocar el comité.
  - **Modo básico (gratis)**: entiende órdenes sencillas («busca estrategias de SOL», «para la búsqueda»,
    «pausa todo», «reabre», «kill switch», «pausa a E-XXXXXX», «cambia la estrategia de E-XXXXXX»,
    «¿cómo va la supervisión?», «¿cómo va la incubadora?», «informe del día», «¿qué ha aprendido la academia?»,
    «riesgo 0,5», «¿cómo va el holding?», «¿cómo vamos?»,
    «¿quién es el mejor?»).
  - **Con Claude (opcional, de pago)**: si pones `ANTHROPIC_API_KEY=...` en el archivo `.env` de la
    raíz del proyecto, contestan de verdad a cualquier cosa. Cada mensaje cuesta unos céntimos de tu
    saldo de la API (console.anthropic.com), que va aparte de la suscripción de la app de Claude. Por
    defecto usa Claude Opus 5.5; con `TRADING_FLOOR_MODELO=claude-sonnet-5-5` en el `.env` sale más barato.
- Cada trabajador tiene su cara, peinado y ropa de su puesto, y se le nota el ánimo: los traders sonríen si
  su posición va ganando y sudan si va perdiendo. Entre tarea y tarea beben café, hablan por teléfono o se
  estiran. Las mesas libres muestran un salvapantallas «LIBRE» hasta que llega un trader nuevo.
- En la pestaña «Salas», «Ir a una sala» lleva la cámara a cada sala; las flechas ‹ › del panel pasan de
  pestaña y de canal.
- Arrastra para moverte, rueda o pellizca para hacer zoom, haz clic en cualquiera para ver su ficha.
- 🎬 activa el **modo cine**: la cámara recorre las salas y persigue lo que va pasando.
- ◐ cambia entre día, noche y automático (según tu hora).

## Archivos

| Archivo | Qué hace |
|---|---|
| `datos.py` | Descarga y cachea velas de Binance |
| `indicadores.py`, `mercado.py` | Indicadores técnicos, calculados una sola vez por mercado |
| `estrategia.py` | Vocabulario de reglas, generación al azar, mutaciones y cruces |
| `backtest.py` | Simulador de operaciones y métricas (retorno, caída, Sharpe, factor de beneficio…) |
| `robustez.py` | Las seis pruebas del laboratorio |
| `mineria.py` | Algoritmo genético y embudo; minería continua por rondas |
| `banco.py`, `almacen.py` | Banco de estrategias, descartadas y almacén JSON en `~/.trading_floor/` |
| `postmortem.py` | Por qué falló cada estrategia retirada: backtest frente a real y causas |
| `academia.py` | Lo aprendido en real y los pesos que usa la minería |
| `informe.py` | Informe del día (departamento de Comunicación) |
| `papel.py` | Paper trading, curva de resultados, resultado diario y resumen de cada sala |
| `fondo.py` | Tu fondo: participaciones, valor liquidativo, aportaciones, métricas (Sharpe, Sortino, Calmar), Monte Carlo y comparación con BTC |
| `riesgo.py` | Tamaño de las operaciones, límites, vetos y frenos |
| `holding.py` | Carteras de largo plazo sin stop: promedian a la baja y salen por partes sobre el coste medio |
| `macro.py` | Datos macroeconómicos y régimen de mercado |
| `control.py` | Tus decisiones: búsqueda de estrategias, pausar todo, reabrir, kill switch, traders, límites de riesgo |
| `chat.py` | Chat con la oficina: modo básico o con Claude, y propuestas de decisiones |
| `web.py`, `web/index.html` | Servidor local y la oficina isométrica (canvas, sin librerías) |
