"""Trading Floor: minería de estrategias + paper trading (dinero ficticio) + oficina isométrica.

Uso:
    python -m trading_floor                 # todo: oficina en el navegador, minería 24/7 y paper trading
    python -m trading_floor minar           # una ronda de minería (BTC, ETH y SOL)
    python -m trading_floor banco           # ver las estrategias aprobadas
    python -m trading_floor papel           # solo el paper trading
    python -m trading_floor macro           # resumen macroeconómico
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


def _opciones_mineria(p: argparse.ArgumentParser) -> None:
    p.add_argument("--simbolos", type=_simbolos, default=SIMBOLOS,
                   help=f"pares de Binance separados por comas (por defecto {','.join(SIMBOLOS)})")
    p.add_argument("--intervalo", default=INTERVALO, choices=list(MINUTOS), help="tamaño de vela (por defecto 1h)")
    p.add_argument("--estrategias", type=int, default=2000, help="estrategias a probar por símbolo (por defecto 2000)")
    p.add_argument("--generaciones", type=int, default=10, help="generaciones del algoritmo genético (por defecto 10)")
    p.add_argument("--dias", type=int, default=DIAS_HISTORICO, help="días de histórico (por defecto 3 años)")


def _ver_banco(borrar: str | None) -> None:
    from . import banco

    if borrar:
        print("Borrada." if banco.borrar(borrar) else f"No hay ninguna estrategia {borrar}.")
        return
    items = banco.cargar()
    if not items:
        print("El banco está vacío. Mina estrategias con:  python -m trading_floor minar")
        return
    for b in items:
        mu, fu = b["muestra"], b["fuera"]
        print(f"\n{b['id']}  {b['descripcion']}")
        print(f"   minería:          {mu['retorno_pct']:+.1f} %  · {mu['operaciones']} ops · "
              f"FB {mu['factor_beneficio']:.2f} · caída máx. {mu['max_dd_pct']:.1f} %")
        print(f"   fuera de muestra: {fu['retorno_pct']:+.1f} %  · {fu['operaciones']} ops · "
              f"FB {fu['factor_beneficio']:.2f} · caída máx. {fu['max_dd_pct']:.1f} %")
    print(f"\n{len(items)} estrategias. Recuerda: son resultados sobre datos pasados, no promesas.")


def main() -> None:
    parser = argparse.ArgumentParser(
        prog="trading_floor",
        description="Minería de estrategias y paper trading con dinero ficticio. Nunca opera dinero real.",
    )
    parser.add_argument("--puerto", type=int, default=8050, help="puerto de la oficina web (por defecto 8050)")
    parser.add_argument("--sin-minar", action="store_true", help="no minar; solo oficina y paper trading")
    parser.add_argument("--pausa", type=float, default=15, help="minutos de descanso entre rondas de minería")
    parser.add_argument("--telegram", action="store_true", help="avisar de cada operación por Telegram (bot de Jarvis)")
    _opciones_mineria(parser)
    sub = parser.add_subparsers(dest="orden")

    p_minar = sub.add_parser("minar", help="buscar estrategias nuevas")
    _opciones_mineria(p_minar)
    p_minar.add_argument("--siempre", action="store_true", help="minar por rondas sin parar")
    p_minar.add_argument("--pausa", type=float, default=15, help="minutos de descanso entre rondas (con --siempre)")

    p_banco = sub.add_parser("banco", help="ver o borrar estrategias aprobadas")
    p_banco.add_argument("--borrar", metavar="ID", help="borra una estrategia del banco")

    p_papel = sub.add_parser("papel", help="paper trading con las estrategias del banco")
    p_papel.add_argument("--segundos", type=float, default=60, help="cada cuánto revisar el mercado")
    p_papel.add_argument("--telegram", action="store_true", help="avisar de cada operación por Telegram")

    sub.add_parser("macro", help="resumen macroeconómico (bolsa, VIX, dólar, oro, Fear & Greed...)")

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
            _ver_banco(args.borrar)
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
                print(f"  {i['nombre']:<26} {i['valor']:>12,.2f}   día {i['dia_pct']:+.2f} %   semana {i['semana_pct']:+.2f} %")
        elif args.orden == "web":
            from .web import servir

            servir(args.puerto, abrir=not args.no_abrir)
            print("Ctrl+C para cerrar.")
            parar.wait()
        else:
            from .macro import vigilar
            from .mineria import minar_continuo
            from .papel import operar
            from .web import servir

            servir(args.puerto)
            threading.Thread(target=operar, args=(60, args.telegram, parar), daemon=True).start()
            threading.Thread(target=vigilar, args=(15, parar), daemon=True).start()
            if args.sin_minar:
                parar.wait()
            else:
                minar_continuo(args.simbolos, args.intervalo, args.estrategias, args.generaciones,
                               args.dias, args.pausa, parar)
    except KeyboardInterrupt:
        parar.set()
        print("\nTrading Floor detenido.")
    except OSError as e:
        sys.exit(f"Error: {e}")


if __name__ == "__main__":
    main()
