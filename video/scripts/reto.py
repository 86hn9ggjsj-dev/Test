"""Prepara el video "reto": EDL (jump cuts), grading, voz tratada, música/SFX y timeline.

Uso: python scripts/reto.py <ffmpeg>
Entrada: input/reto.mp4, input/reto_palabras.json (Whisper, timestamps por palabra)
Salida:  public/gen/reto_base.mp4 (video montado sin audio), public/gen/reto_mezcla.wav, src/gen/reto.json
"""
import json
import sys
from pathlib import Path

from montaje import Montaje, escenas_desde, musica_energetica, poner
from sonido import campana, mezclar, soplo, toque

FF = sys.argv[1]
RAIZ = Path(__file__).resolve().parent.parent
GEN = RAIZ / "public/gen"
GEN_SRC = RAIZ / "src/gen"
GEN.mkdir(parents=True, exist_ok=True)
GEN_SRC.mkdir(parents=True, exist_ok=True)
FUENTE = RAIZ / "input/reto.mp4"

# ---------------------------------------------------------------- transcripción corregida
crudo = json.load(open(RAIZ / "input/reto_palabras.json"))
palabras = []
for p in crudo:
    if p["w"] == "%" and palabras and palabras[-1]["w"] == "85":
        palabras[-1].update(w="85%", e=p["e"])
        continue
    w = {"¿Osotros": "¿Vosotros", "Dejadmelo": "Dejádmelo"}.get(p["w"], p["w"])
    palabras.append({**p, "w": w})

# ---------------------------------------------------------------- EDL y planos (tiempos del original)
TRAMOS = [(0.1, 3.0), (3.167, 6.933), (7.0, 9.5), (9.667, 11.933), (12.167, 14.467), (14.6, 15.867)]
# Planos del original: deciden dónde van los subtítulos
PLANOS = [(0, 3.133, "primer"), (3.133, 4.9, "medio"), (4.9, 6.967, "captura"), (6.967, 10.733, "medio"),
          (10.733, 12.3, "tabla"), (12.3, 99, "medio")]

m = Montaje(TRAMOS, PLANOS)
m.cargar_palabras(palabras)
t_pal = m.t_pal

escenas = escenas_desde([("bienvenida", t_pal("Bienvenidos")), ("hoy", t_pal("Hoy")), ("eso", t_pal("Eso")),
                         ("tabla", t_pal("Estamos")), ("casilla", t_pal("Vosotros")), ("cta", t_pal("Dejádmelo"))],
                        m.dur)
esc = {e["id"]: e for e in escenas}

ev = {
    "dia": t_pal("1"),
    "segundo": t_pal("segundo"),
    "t85": t_pal("85%"),
    "cuatro": t_pal("4"),
    "veis": t_pal("veis"),
    "dos": t_pal("dos"),
    "pasos": t_pal("pasos"),
    "tabla": t_pal("tabla"),
    "casilla": t_pal("casilla"),
    "treintayuno": t_pal("31"),
    "comentarios": t_pal("comentarios"),
    "captura": m.primer_plano("captura"),
    "tablaPlano": m.primer_plano("tabla"),
}

m.video_base(FF, FUENTE, GEN / "reto_base.mp4")
voz_ed = m.voz(FF, FUENTE, GEN / "reto_voz.wav")

# ---------------------------------------------------------------- SFX suaves
sfx = m.pista()
poner(sfx, toque(), ev["dia"], 1.0)
poner(sfx, toque(), ev["segundo"], 0.7)
poner(sfx, campana(), ev["t85"], 1.0)
poner(sfx, soplo(0.5), ev["captura"] - 0.25, 0.8)
for k in range(4):
    poner(sfx, toque(), ev["cuatro"] + 0.12 * k, 0.6)
poner(sfx, campana(), ev["veis"], 0.8)
poner(sfx, soplo(0.5), esc["eso"]["s"] - 0.25, 0.7)
poner(sfx, toque(), ev["dos"], 0.8)
poner(sfx, toque(), ev["dos"] + 0.25, 0.8)
poner(sfx, soplo(0.5), ev["tablaPlano"] - 0.25, 0.7)
poner(sfx, toque(), ev["tabla"], 0.8)
poner(sfx, soplo(0.8), ev["treintayuno"] - 0.7, 0.6)
poner(sfx, campana(), ev["treintayuno"], 1.0)
poner(sfx, soplo(0.5), esc["cta"]["s"] - 0.25, 0.7)
poner(sfx, toque(), ev["comentarios"], 0.9)

INTENSIDAD = {"bienvenida": (1, 1, 1, 1), "hoy": (1, 1, 1, 1), "eso": (1, 1, 1, 1),
              "tabla": (1, 1, 1, 1), "casilla": (1, 0, 1, 1), "cta": (1, 1, 1, 1)}
musica = musica_energetica(len(sfx), escenas, INTENSIDAD)

mezclar(voz_ed, musica, sfx, m.dur, GEN / "reto_mezcla.wav", FF, duck=-17, nivel_musica=0.5, nivel_sfx=0.28)
m.exportar(GEN_SRC / "reto.json", escenas, ev)

print(f"duración {m.dur:.2f}s (original 16.13s), {len(m.edl)} piezas")
for e in escenas:
    print(f"  {e['id']:<11} {e['s']:6.2f} - {e['e']:6.2f}")
