#!/usr/bin/env python3
"""Generador de claves de 12 caracteres con mayúsculas y números.

Uso:
    python generador_claves.py          # genera 1 clave
    python generador_claves.py -n 5     # genera 5 claves
"""
import argparse
import secrets
import string

LONGITUD = 12
ALFABETO = string.ascii_uppercase + string.digits


def generar_clave(longitud: int = LONGITUD) -> str:
    """Genera una clave aleatoria segura con al menos una letra y un número."""
    while True:
        clave = "".join(secrets.choice(ALFABETO) for _ in range(longitud))
        if any(c.isalpha() for c in clave) and any(c.isdigit() for c in clave):
            return clave


def main() -> None:
    parser = argparse.ArgumentParser(description="Generador de claves de 12 caracteres (A-Z, 0-9)")
    parser.add_argument("-n", "--cantidad", type=int, default=1, help="número de claves a generar")
    args = parser.parse_args()
    for _ in range(args.cantidad):
        print(generar_clave())


if __name__ == "__main__":
    main()
