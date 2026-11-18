"""Tiempos estimados, sin locución, para montar las pantallas de un reel antes de tener la voz.

Uso: python scripts/estimar.py <video>   (p. ej. nueve; el módulo scripts/<video>.py define GUION, EVENTOS, NOMBRE…)
Escribe src/gen/<nombre>.json con ~2,6 palabras/s y pausas en la puntuación, y un audio en silencio de esa duración.
Cuando llega el MP3, `python scripts/<video>.py <ffmpeg>` lo sustituye por los tiempos reales.
"""
import importlib
import json
import sys

import numpy as np
import soundfile as sf

from locucion import GEN, GEN_SRC, norm
from montaje import escenas_desde
from sonido import SR

v = importlib.import_module(sys.argv[1])
palabras, t, inicio = [], 0.05, {}
for id_, frases in v.GUION:
    inicio[id_] = t
    for frase in frases:
        for w in frase.split():
            dur = 0.12 + 0.05 * len(norm(w))
            palabras.append({"w": w, "s": round(t, 3), "e": round(t + dur, 3), "i": len(palabras), "hook": False, "escena": id_})
            t += dur + 0.05 + (0.35 if w[-1] in ".?" else 0.15 if w[-1] in ",:" else 0)
    t += 0.2
dur = round(t + 0.4, 3)
escenas = escenas_desde([(id_, inicio[id_]) for id_, _ in v.GUION], dur)
escenas[0]["s"] = 0.0


def t_pal(w, escena=None):
    return next(p["s"] for p in palabras if norm(p["w"]) == norm(w) and (escena is None or p["escena"] == escena))


ev = {k: t_pal(*x) if isinstance(x, tuple) else t_pal(x) for k, x in v.EVENTOS.items()}
GEN.mkdir(parents=True, exist_ok=True)
GEN_SRC.mkdir(parents=True, exist_ok=True)
sf.write(GEN / f"{v.NOMBRE}_mezcla.wav", np.zeros((int(dur * SR), 2), dtype=np.float32), SR)
json.dump({"titulo": v.TITULO, "duracion": dur, "fps": 30, "palabras": palabras, "escenas": escenas,
           "eventos": {k: round(x, 3) for k, x in ev.items()}}, open(GEN_SRC / f"{v.NOMBRE}.json", "w"), ensure_ascii=False, indent=1)
print(f"{v.NOMBRE}: {dur:.1f}s estimados", {e["id"]: e["s"] for e in escenas})
