"""J.A.R.V.I.S. — asistente personal impulsado por Claude.

Uso:
    python -m jarvis              # conversar por texto
    python -m jarvis --voz        # conversar por voz
    python -m jarvis --vigilar    # vigilar mercado y correo, y avisar por llamada/WhatsApp
"""

from __future__ import annotations

import argparse
import sys

import anthropic


def conversar(usar_voz: bool) -> None:
    from .nucleo import Jarvis

    voz = None
    if usar_voz:
        from .voz import Voz

        voz = Voz()
    jarvis = Jarvis()

    def responder(texto: str) -> None:
        print(f"\nJarvis: {texto}\n")
        if voz:
            voz.decir(texto)

    responder("A su servicio, señor. ¿En qué puedo ayudarle?  (diga 'salir' para terminar)")
    while True:
        try:
            entrada = voz.escuchar() if voz else input("Tú: ")
        except (EOFError, KeyboardInterrupt):
            print()
            break
        if not entrada.strip():
            continue
        if entrada.strip().lower().strip(".!") in ("salir", "adiós", "adios", "exit", "quit"):
            break
        try:
            responder(jarvis.ask(entrada))
        except anthropic.AuthenticationError:
            sys.exit("Error: configura ANTHROPIC_API_KEY en el archivo .env.")
        except anthropic.RateLimitError:
            responder("Estamos saturados, señor. Inténtelo de nuevo en unos segundos.")
        except anthropic.APIStatusError as e:
            responder(f"Error de la API ({e.status_code}): {e.message}")
        except anthropic.APIConnectionError:
            responder("No consigo conectar con mis servidores, señor. Revise la conexión.")
    responder("Hasta luego, señor.")


def main() -> None:
    parser = argparse.ArgumentParser(prog="jarvis", description="J.A.R.V.I.S. con Claude")
    parser.add_argument("--voz", action="store_true", help="conversar por voz")
    parser.add_argument("--vigilar", action="store_true",
                        help="vigilar mercado y correo y avisar por llamada/WhatsApp")
    parser.add_argument("--minutos", type=float, default=5,
                        help="intervalo de la vigilancia en minutos (por defecto 5)")
    args = parser.parse_args()

    if args.vigilar:
        from .vigilante import vigilar

        try:
            vigilar(args.minutos)
        except KeyboardInterrupt:
            print("\nVigilancia detenida.")
    else:
        conversar(args.voz)


if __name__ == "__main__":
    main()
