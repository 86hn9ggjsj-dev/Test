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
| Todo (oficina + minería 24/7 + paper trading + macro) | doble clic en `trading.bat` | `./trading.sh` |
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
2. **Minería** (`mineria.py`). Una estrategia es "entra en largo o en corto cuando se cumplan
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
4. **Banco** (`banco.py`). Guarda las supervivientes que no se parecen demasiado a otra del
   banco (máximo 4 por activo: 6 activos × 4 = las 24 mesas de la sala de trading).
5. **Paper trading** (`papel.py`). Cada estrategia del banco opera desde que llega, con precios
   reales y las mismas reglas que el backtest (`backtest.py`). Las posiciones se valoran a
   precio de mercado vela a vela, de ahí salen el resultado total, el de hoy y el de cada día.
   Además calcula el **radar de señales** de cada trader: cuántas de sus condiciones se cumplen
   ahora mismo, cuál falta, cuándo cierra la próxima vela, soporte, resistencia y ATR.
6. **Control de riesgos** (`riesgo.py`). Encima del paper trading:
   - **Tamaño de cada operación**: arriesga como mucho el 1 % del capital de su trader si salta el
     stop (con un stop lejano se invierte menos; nunca más del 100 %).
   - **Vetos**: una entrada nueva se veta si ya hay 10 posiciones abiertas, o 3 iguales (mismo
     símbolo y dirección), o si está activado un freno.
   - **Frenos**: si el día pierde un 2 % del capital, no se abren más posiciones hasta mañana; si el
     resultado cae un 6 % del capital desde su máximo, se pausan las entradas.
7. **Holding** (`holding.py`). Carteras de largo plazo (por defecto 5.000 $ en BTC, 3.000 $ en ETH y
   2.000 $ en SOL, ficticios): compra inicial del 25 %, tres zonas de compra por debajo (−10, −20 y
   −30 %), tres zonas de venta parcial por encima (+30, +60 y +100 %) y un stop de catástrofe al
   −50 %. Las zonas funcionan como órdenes límite sobre precios reales. Puedes poner las tuyas:

   ```bash
   ./trading.sh holding --nuevo BTCUSDT --presupuesto 5000 --compras 75000,68000,60000 --ventas 110000,130000,160000 --stop 45000
   ```
8. **Macro** (`macro.py`). S&P 500, Nasdaq, VIX, dólar, EUR/USD, oro, petróleo, bono a 10 años
   (Yahoo Finance) y el Fear & Greed de cripto (alternative.me). Con ellos se calcula un régimen
   RISK-ON / RISK-OFF. Es contexto para el comité: **las estrategias no usan estos datos**.

Un ejemplo real de embudo (2.000 estrategias de BTC): 362 parecían rentables, 17 aguantaron
fuera de muestra y 3 entraron en el banco. Así es esto: casi todo es ruido.

## La oficina

Todo lo que pasa en la oficina sale del estado real: los cubos de la cinta son estrategias
pasando pruebas, los lingotes de la cámara son las estrategias del banco, las pantallas de los
traders muestran su posición y su resultado, y el videowall los precios en vivo. Los personajes
comentan en el chat lo que ocurre (aprobaciones, descartes, operaciones, vetos, holding, datos
macro, radar de señales), a veces dirigiéndose a alguien ("Rocío → Jana"). El chat se puede filtrar
por canal: operaciones, riesgos, minería, análisis, macro, holding, comité y charla. El comité se
reúne cada 15 minutos (con cuenta atrás arriba), y cuando no hay trabajo se van a la sala de
descanso, a la terraza o al gimnasio.

- **Supervisión**: cada sala tiene su supervisor, que la patrulla y conoce sus números; la
  supervisión general hace rondas preguntándoles y acude corriendo si una sala se pone en rojo.
  La pestaña «Salas» muestra el semáforo de cada una.
- **Ranking**: podio y clasificación de traders por resultado total, de hoy, de la semana o por
  acierto (en papel), o por cómo lo hizo su estrategia en el backtest. El número 1 lleva corona.
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
| `banco.py`, `almacen.py` | Banco de estrategias y almacén JSON en `~/.trading_floor/` |
| `papel.py` | Paper trading, curva de resultados y resultado diario |
| `riesgo.py` | Tamaño de las operaciones, límites, vetos y frenos |
| `holding.py` | Carteras de largo plazo con zonas de compra y de venta |
| `macro.py` | Datos macroeconómicos y régimen de mercado |
| `web.py`, `web/index.html` | Servidor local y la oficina isométrica (canvas, sin librerías) |
