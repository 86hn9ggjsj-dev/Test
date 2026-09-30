"""Trading Floor: minería de estrategias + paper trading (dinero ficticio) + oficina isométrica.

Uso:
    python -m trading_floor                 # todo: oficina en el navegador, paper trading y minería (con el botón)
    python -m trading_floor minar           # una ronda de minería desde la terminal
    python -m trading_floor banco           # ver las estrategias aprobadas
    python -m trading_floor papel           # solo el paper trading
    python -m trading_floor macro           # resumen macroeconómico
    python -m trading_floor holding         # carteras de largo plazo: promedian a la baja, sin stop
    python -m trading_floor web             # solo la oficina
"""

from __future__ import annotations

import argparse
import sys
import threading

from .config import DIAS_HISTORICO, INTERVALO, SIMBOLOS
from .datos import MINUTOS


def _simbolos(texto: str) -> list[str]:
    return [s.strip().upper() for s in texto.split(",") if s.strip()]


def _es(x: float, decimales: int = 2) -> str:
    """Número en formato español: 12.345,67."""
    return f"{x:,.{decimales}f}".replace(",", "_").replace(".", ",").replace("_", ".")


def _numeros(texto: str) -> list[float]:
    return [float(x) for x in texto.replace(" ", "").split(",") if x]


def _ver_holding(args) -> None:
    from . import holding

    if args.borrar:
        print("Plan borrado." if holding.borrar(args.borrar) else f"No hay plan de {args.borrar.upper()}.")
        return
    if args.nuevo:
        simbolo = args.nuevo.upper()
        holding.crear(simbolo if simbolo.endswith("USDT") else simbolo + "USDT", args.presupuesto, args.paso,
                      args.tramo, args.reserva, args.salidas)
    else:
        holding.actualizar()
    from . import almacen

    estado = almacen.cargar("holding", {})
    for p in estado.get("planes", {}).values():
        print(f"\n{p['simbolo']}  aportado {_es(p['aportado'], 0)} $ · valor {_es(p['valor'])} $ "
              f"({_es(p['resultado_pct'])} %) · precio {_es(p['precio'])}")
        medio = _es(p["coste_medio"]) if p.get("coste_medio") else "—"
        print(f"   coste medio {medio} · reserva usada {_es(p['reserva_usada'], 0)} de {_es(p['reserva'], 0)} $ · "
              f"efectivo {_es(p['efectivo'])} $ · sin stop")
        compras = [z for z in p["compras"] if not z.get("sin_dinero")]
        print(f"   próximas compras (cada −{_es(p['paso_pct'], 1)} %): "
              + (" · ".join(_es(z["precio"]) for z in compras) or "sin dinero ni reserva"))
        print("   puntos de salida: " + " · ".join(
            f"+{_es(z['sobre_coste_pct'], 0)} % → {_es(z['precio']) if z['precio'] else '—'} (vende {_es(z['pct'], 0)} %)"
            f"{' ✓' if z['llena'] else ''}" for z in p["ventas"]))
    r = estado.get("resumen")
    if r:
        print(f"\nTotal: {_es(r['valor'])} $ de {_es(r['aportado'], 0)} $ aportados ({_es(r['resultado_pct'])} %). "
              "Dinero ficticio.")


def _opciones_mineria(p: argparse.ArgumentParser) -> None:
    p.add_argument("--simbolos", type=_simbolos, default=SIMBOLOS,
                   help=f"pares de Binance separados por comas (por defecto {','.join(SIMBOLOS)})")
    p.add_argument("--intervalo", default=INTERVALO, choices=list(MINUTOS), help=f"tamaño de vela (por defecto {INTERVALO})")
    p.add_argument("--estrategias", type=int, default=2000, help="estrategias a probar por símbolo (por defecto 2000)")
    p.add_argument("--generaciones", type=int, default=10, help="generaciones del algoritmo genético (por defecto 10)")
    p.add_argument("--dias", type=int, default=DIAS_HISTORICO, help="días de histórico (por defecto 3 años)")


def _ver_banco(borrar: str | None, limpiar: bool = False) -> None:
    from . import banco

    if borrar:
        print("Retirada (lo que ganó o perdió sigue contando en tu fondo)." if banco.borrar(borrar) else f"No hay ninguna estrategia {borrar}.")
        return
    if limpiar:
        from .control import aplicar

        try:
            print(aplicar({"accion": "limpiar_repetidas"}))
        except ValueError as e:
            print(e)
        return
    repetidas = banco.repetidas()
    items = banco.cargar()
    if not items:
        print("El banco está vacío. Mina estrategias con:  python -m trading_floor minar")
        return
    for b in items:
        mu, fu = b["muestra"], b["fuera"]
        print(f"\n{b['id']}  {b['descripcion']}")
        print(f"   minería:          {_es(mu['retorno_pct'], 1)} %  · {mu['operaciones']} ops · "
              f"FB {_es(mu['factor_beneficio'])} · caída máx. {_es(mu['max_dd_pct'], 1)} %")
        print(f"   fuera de muestra: {_es(fu['retorno_pct'], 1)} %  · {fu['operaciones']} ops · "
              f"FB {_es(fu['factor_beneficio'])} · caída máx. {_es(fu['max_dd_pct'], 1)} %")
    print(f"\n{len(items)} estrategias. Recuerda: son resultados sobre datos pasados, no promesas.")
    if repetidas:
        sobran = sum(len(r) for _, r in repetidas)
        print(f"Hay {sobran} repetidas (misma idea con otros números). Quítalas con:  python -m trading_floor banco --limpiar-repetidas")


def main() -> None:
    parser = argparse.ArgumentParser(
        prog="trading_floor",
        description="Minería de estrategias y paper trading con dinero ficticio. Nunca opera dinero real.",
    )
    parser.add_argument("--puerto", type=int, default=8050, help="puerto de la oficina web (por defecto 8050)")
    parser.add_argument("--sin-minar", action="store_true", help="no minar; solo oficina y paper trading")
    parser.add_argument("--minar-siempre", action="store_true",
                        help="minar por rondas sin parar (por defecto solo busca cuando pulsas «Buscar estrategias»)")
    parser.add_argument("--pausa", type=float, default=15, help="minutos de descanso entre rondas (con --minar-siempre)")
    parser.add_argument("--telegram", action="store_true", help="avisar de cada operación por Telegram (bot de Jarvis)")
    _opciones_mineria(parser)
    sub = parser.add_subparsers(dest="orden")

    p_minar = sub.add_parser("minar", help="buscar estrategias nuevas")
    _opciones_mineria(p_minar)
    p_minar.add_argument("--siempre", action="store_true", help="minar por rondas sin parar")
    p_minar.add_argument("--pausa", type=float, default=15, help="minutos de descanso entre rondas (con --siempre)")

    p_banco = sub.add_parser("banco", help="ver o borrar estrategias aprobadas")
    p_banco.add_argument("--borrar", metavar="ID", help="borra una estrategia del banco")
    p_banco.add_argument("--vaciar", action="store_true", help="vacía el banco entero (sus traders dejan la sala)")
    p_banco.add_argument("--limpiar-repetidas", action="store_true",
                         help="retira las estrategias repetidas (misma idea con otros números) y deja la mejor de cada grupo")

    p_papel = sub.add_parser("papel", help="paper trading con las estrategias del banco")
    p_papel.add_argument("--segundos", type=float, default=20, help="cada cuánto revisar el mercado (por defecto 20 s)")
    p_papel.add_argument("--telegram", action="store_true", help="avisar de cada operación por Telegram")

    sub.add_parser("macro", help="resumen macroeconómico (bolsa, VIX, dólar, oro, Fear & Greed...)")

    p_hold = sub.add_parser("holding", help="carteras de largo plazo: promedian a la baja y salen por partes, sin stop")
    p_hold.add_argument("--nuevo", metavar="SIMBOLO", help="crea (o rehace) el plan de un símbolo, p. ej. BTCUSDT")
    p_hold.add_argument("--presupuesto", type=float, default=5000, help="dinero ficticio del plan (por defecto 5000)")
    p_hold.add_argument("--paso", type=float, help="%% de caída desde la última compra para volver a comprar (por defecto 8)")
    p_hold.add_argument("--tramo", type=float, help="tamaño de cada compra, en %% del presupuesto (por defecto 12,5)")
    p_hold.add_argument("--reserva", type=float, help="capital extra si se acaba el presupuesto, en %% (por defecto 50)")
    p_hold.add_argument("--salidas", type=_numeros,
                        help="puntos de salida en %% sobre el coste medio, separados por comas (por defecto 30,60,100)")
    p_hold.add_argument("--borrar", metavar="SIMBOLO", help="borra el plan de un símbolo")

    p_web = sub.add_parser("web", help="abrir solo la oficina")
    p_web.add_argument("--puerto", type=int, default=8050)
    p_web.add_argument("--no-abrir", action="store_true", help="no abrir el navegador")

    args = parser.parse_args()
    parar = threading.Event()
    try:
        if args.orden == "minar":
            from .mineria import minar, minar_continuo

            if args.siempre:
                minar_continuo(args.simbolos, args.intervalo, args.estrategias, args.generaciones,
                               args.dias, args.pausa, parar)
            else:
                for simbolo in args.simbolos:
                    minar(simbolo, args.intervalo, args.estrategias, args.generaciones, args.dias)
                print("\nListo. Mira las aprobadas con:  python -m trading_floor banco")
        elif args.orden == "banco":
            if args.vaciar:
                from . import banco

                for b in banco.cargar():   # como retiradas: lo que ganaron o perdieron sigue contando en el fondo
                    banco.descartar(b["id"], "banco vaciado desde la terminal")
                print("Banco vaciado. Lo que ganaron o perdieron sus traders sigue contando en tu fondo.")
            else:
                _ver_banco(args.borrar, args.limpiar_repetidas)
        elif args.orden == "papel":
            from .papel import operar

            operar(args.segundos, args.telegram, parar)
        elif args.orden == "macro":
            from .macro import actualizar

            e = actualizar()
            print(f"\nRégimen: {e['regimen']}. {e['explicacion']}")
            if e["fear_greed"]:
                print(f"Fear & Greed (cripto): {e['fear_greed']['valor']} · {e['fear_greed']['clase']}")
            for i in e["indicadores"].values():
                print(f"  {i['nombre']:<26} {_es(i['valor']):>12}   día {_es(i['dia_pct'])} %   semana {_es(i['semana_pct'])} %")
        elif args.orden == "holding":
            _ver_holding(args)
        elif args.orden == "web":
            from .web import servir

            servir(args.puerto, abrir=not args.no_abrir)
            print("Ctrl+C para cerrar.")
            parar.wait()
        else:
            from .macro import vigilar
            from .mineria import minar_a_demanda, minar_continuo
            from .papel import operar
            from .web import servir

            servir(args.puerto)
            threading.Thread(target=operar, args=(20, args.telegram, parar), daemon=True).start()
            threading.Thread(target=vigilar, args=(15, parar), daemon=True).start()
            if args.sin_minar:
                parar.wait()
            elif args.minar_siempre:
                minar_continuo(args.simbolos, args.intervalo, args.estrategias, args.generaciones,
                               args.dias, args.pausa, parar)
            else:
                minar_a_demanda(args.simbolos, args.intervalo, args.estrategias, args.generaciones, args.dias, parar)
    except KeyboardInterrupt:
        parar.set()
        print("\nTrading Floor detenido.")
    except OSError as e:
        sys.exit(f"Error: {e}")


if __name__ == "__main__":
    main()
