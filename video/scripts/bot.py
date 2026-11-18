"""Prepara el video "bot" (3 ventajas de un bot de trading): EDL, grading, voz, música/SFX y timeline.

Uso: python scripts/bot.py <ffmpeg>
Entrada: input/bot.mp4, input/bot_palabras.json (Whisper, timestamps por palabra)
Salida:  public/gen/bot_base.mp4, public/gen/bot_mezcla.wav, src/gen/bot.json
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
FUENTE = RAIZ / "input/bot.mp4"

# ---------------------------------------------------------------- transcripción corregida
CORRECCIONES = {"considere": "considero", "tanula": "te anula", "cierra,": "cierras,", "mueve": "mueves",
                "toples": "stops", "escríbete": "escribidme"}
palabras = []
for p in json.load(open(RAIZ / "input/bot_palabras.json")):
    if p["w"] == "%" and palabras:
        palabras[-1].update(w=palabras[-1]["w"] + "%", e=p["e"])
        continue
    palabras.append({**p, "w": CORRECCIONES.get(p["w"], p["w"])})

# ---------------------------------------------------------------- EDL: silencios > 0.3 s recortados a ~0.16 s
# (se respeta la pausa de 35.1 s: mantiene la captura de rentabilidad en pantalla)
TRAMOS = [(0.1, 4.52), (4.81, 6.80), (7.32, 12.44), (12.76, 14.50), (15.06, 19.53), (19.82, 30.99),
          (31.15, 40.29), (40.45, 47.17), (47.69, 50.72)]
PLANOS = [(0, 34.133, "medio"), (34.133, 35.633, "captura"), (35.633, 40.4, "medio"), (40.4, 45.5, "tabla"),
          (45.5, 99, "medio")]

m = Montaje(TRAMOS, PLANOS)
# Whisper coloca alguna palabra dentro de un silencio recortado: se lleva al inicio del tramo siguiente
for p in palabras:
    if m.mapear(p["s"]) is None:
        sig = next((a for a, _ in m.edl if a > p["s"]), None)
        if sig is not None:
            p["e"] = max(p["e"], sig + 0.12)
            p["s"] = sig
m.cargar_palabras(palabras)
t_pal = m.t_pal

escenas = escenas_desde([("intro", t_pal("Hoy")), ("v1", t_pal("La", 0)), ("v2", t_pal("La", 1)),
                         ("v3", t_pal("Y")), ("cta", t_pal("Así"))], m.dur)
escenas[0]["s"] = 0.0
esc = {e["id"]: e for e in escenas}

ev = {
    "tres": t_pal("tres"),
    "libertad": t_pal("libertad"),
    "auto1": t_pal("100%", 0),
    "anula": t_pal("te anula", 0),
    "n99": t_pal("99%"),
    "psicologica": t_pal("psicológica"),
    "gestiona": t_pal("gestiona"),
    "operacion": t_pal("operación"),
    "cierras": t_pal("cierras"),
    "stops": t_pal("stops"),
    "capital": t_pal("capital"),
    "rentabilidad": t_pal("rentabilidad"),
    "captura": m.primer_plano("captura"),
    "proporcional": t_pal("proporcional"),
    "tablaPlano": m.primer_plano("tabla"),
    "tablaFin": next(p["e"] for p in m.planos if p["tipo"] == "tabla" and p["e"] > m.primer_plano("tabla") + 1),
    "cantidades": t_pal("cantidades"),
    "generado": t_pal("generado"),
    "informacion": t_pal("información"),
    "privado": t_pal("privado"),
}

# Pantallas de motion graphics a pantalla completa (el video queda detrás, desenfocado)
PANTALLAS = {
    "intro": (0.0, 2.45),
    "reloj": (t_pal("Puedes") - 0.08, t_pal("nada") + 0.45),
    "auto": (t_pal("Opera") - 0.08, t_pal("automático", 0) + 0.5),
    "noventa": (ev["n99"] - 0.45, ev["psicologica"] + 0.7),
    "gestion": (ev["gestiona"] - 0.25, esc["v3"]["s"] - 0.05),
    "prop": (ev["proporcional"] - 0.45, ev["tablaPlano"] - 0.1),
    "cta": (esc["cta"]["s"], m.dur),
}
for k, (a, b) in PANTALLAS.items():
    ev[f"p_{k}_s"], ev[f"p_{k}_e"] = a, b
ev.update(grafico=t_pal("gráfico"), pendiente=t_pal("pendiente", 0), mueves=t_pal("mueves"))

m.video_base(FF, FUENTE, GEN / "bot_base.mp4")
voz_ed = m.voz(FF, FUENTE, GEN / "bot_voz.wav")

# ---------------------------------------------------------------- SFX suaves
sfx = m.pista()
poner(sfx, campana(), ev["tres"], 0.9)
for id_ in ("v1", "v2", "v3", "cta"):
    poner(sfx, soplo(0.5), esc[id_]["s"] - 0.25, 0.7)
    poner(sfx, toque(), esc[id_]["s"] + 0.05, 0.8)
poner(sfx, toque(), ev["auto1"], 0.8)
poner(sfx, campana(), ev["n99"], 0.7)
poner(sfx, toque(), ev["gestiona"], 0.8)
for k in ("operacion", "cierras", "stops"):
    poner(sfx, toque(), ev[k], 0.6)
poner(sfx, campana(), ev["captura"] + 0.1, 0.8)
poner(sfx, toque(), ev["proporcional"], 0.8)
poner(sfx, soplo(0.5), ev["tablaPlano"] - 0.25, 0.7)
for k in range(3):
    poner(sfx, toque(), ev["cantidades"] + 0.15 * k, 0.6)
poner(sfx, campana(), ev["cantidades"] + 0.9, 0.8)  # resaltado del beneficio en la tabla
poner(sfx, toque(), ev["privado"], 0.9)
for k, (a, b) in PANTALLAS.items():
    if a > 0:
        poner(sfx, soplo(0.6), a - 0.3, 0.8)
poner(sfx, campana(), 0.25, 0.7)                        # "3" de la intro
poner(sfx, campana(), ev["auto1"] + 0.6, 0.8)           # anillo al 100 %
poner(sfx, campana(), ev["n99"] + 0.9, 0.7)             # el punto dorado entre 100
poner(sfx, toque(), ev["mueves"], 0.8)                  # stop a breakeven
poner(sfx, campana(), PANTALLAS["prop"][0] + 1.4, 0.7)  # barra de 100.000 €

INTENSIDAD = {"intro": (1, 0, 1, 0), "v1": (1, 1, 1, 1), "v2": (1, 1, 1, 1), "v3": (1, 1, 1, 1), "cta": (1, 1, 1, 1)}
musica = musica_energetica(len(sfx), escenas, INTENSIDAD)

mezclar(voz_ed, musica, sfx, m.dur, GEN / "bot_mezcla.wav", FF, duck=-17, nivel_musica=0.5, nivel_sfx=0.28)
m.exportar(GEN_SRC / "bot.json", escenas, ev)

print(f"duración {m.dur:.2f}s (original 50.80s), {len(m.edl)} piezas")
for e in escenas:
    print(f"  {e['id']:<6} {e['s']:6.2f} - {e['e']:6.2f}")
for p in m.planos:
    if p["tipo"] != "medio":
        print(f"  plano {p['tipo']:<8} {p['s']:6.2f} - {p['e']:6.2f}")
