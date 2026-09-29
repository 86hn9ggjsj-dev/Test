"""Prepara el video "reto": EDL (teaser + jump cuts), grading, voz tratada, música/SFX y timeline.

Uso: python scripts/reto.py <ffmpeg>
Entrada: input/reto.mp4, input/reto_palabras.json (Whisper, timestamps por palabra)
Salida:  public/gen/reto_base.mp4 (video montado sin audio), public/gen/reto_mezcla.wav, src/gen/reto.json
"""
import json
import subprocess
import sys
from pathlib import Path

import numpy as np
import soundfile as sf

from sonido import SR, click, ding, env, hat, impacto, kick, lp, mezclar, nota, pad, pop, riser, whoosh

FF = sys.argv[1]
RAIZ = Path(__file__).resolve().parent.parent
GEN = RAIZ / "public/gen"
GEN_SRC = RAIZ / "src/gen"
GEN.mkdir(parents=True, exist_ok=True)
GEN_SRC.mkdir(parents=True, exist_ok=True)
FUENTE = RAIZ / "input/reto.mp4"
FPS = 30

# ---------------------------------------------------------------- transcripción corregida
crudo = json.load(open(RAIZ / "input/reto_palabras.json"))
palabras = []
for p in crudo:
    if p["w"] == "%" and palabras and palabras[-1]["w"] == "85":
        palabras[-1].update(w="85%", e=p["e"])
        continue
    w = {"¿Osotros": "¿Vosotros", "Dejadmelo": "Dejádmelo"}.get(p["w"], p["w"])
    palabras.append({**p, "w": w})

# ---------------------------------------------------------------- EDL (tiempos del original)
f = lambda t: round(t * FPS) / FPS  # todo ajustado a la rejilla de fotogramas
TEASER = (f(3.167), f(5.333))
TRAMOS = [(0.1, 3.0), (3.167, 6.933), (7.0, 9.5), (9.667, 11.933), (12.167, 14.467), (14.6, 15.867)]
EDL = [TEASER] + [(f(a), f(b)) for a, b in TRAMOS]

# Planos del original: decide dónde van los subtítulos
PLANOS = [(0, 3.133, "primer"), (3.133, 4.9, "medio"), (4.9, 6.967, "captura"), (6.967, 10.733, "medio"),
          (10.733, 12.3, "tabla"), (12.3, 99, "medio")]

piezas, out = [], 0.0
for k, (a, b) in enumerate(EDL):
    piezas.append({"src": (a, b), "out": out, "teaser": k == 0})
    out += b - a
DUR = round(out, 4)


def mapear(t, teaser=False):
    for p in piezas:
        a, b = p["src"]
        if p["teaser"] == teaser and a - 0.12 <= t <= b + 0.04:
            return p["out"] + min(max(t - a, 0), b - a)
    return None


pal_out = []
for i, p in enumerate(palabras):
    for teaser in (True, False):
        s = mapear(p["s"], teaser)
        if s is None or (teaser and not (TEASER[0] <= p["s"] < TEASER[1] - 0.05)):
            continue
        e = mapear(min(p["e"], TEASER[1]) if teaser else p["e"], teaser)
        pal_out.append({"w": p["w"], "s": round(s, 3), "e": round(e, 3), "i": i, "hook": teaser})
pal_out.sort(key=lambda p: p["s"])


def t_pal(w, teaser=False, n=0):
    return [p["s"] for p in pal_out if p["w"].strip("¿?.,") == w and p["hook"] == teaser][n]


planos = []
for p in piezas:
    a, b = p["src"]
    for pa, pb, tipo in PLANOS:
        ia, ib = max(a, pa), min(b, pb)
        if ib - ia > 1e-3:
            planos.append({"s": round(p["out"] + ia - a, 3), "e": round(p["out"] + ib - a, 3), "tipo": tipo,
                           "pieza": piezas.index(p)})

ESCENAS = [("teaser", 0.0), ("bienvenida", t_pal("Bienvenidos")), ("hoy", t_pal("Hoy")), ("eso", t_pal("Eso")),
           ("tabla", t_pal("Estamos")), ("casilla", t_pal("Vosotros")), ("cta", t_pal("Dejádmelo"))]
escenas = [{"id": n, "s": round(max(s - 0.05, 0), 3)} for n, s in ESCENAS]
escenas[1]["s"] = round(piezas[1]["out"], 3)  # el corte del teaser manda
for a, b in zip(escenas, escenas[1:]):
    a["e"] = b["s"]
escenas[-1]["e"] = DUR
esc = {e["id"]: e for e in escenas}

ev = {
    "t85teaser": t_pal("85%", True),
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
    "captura": next(p["s"] for p in planos if p["tipo"] == "captura" and not piezas[p["pieza"]]["teaser"]),
    "tablaPlano": next(p["s"] for p in planos if p["tipo"] == "tabla"),
}

# ---------------------------------------------------------------- video base: montaje + grading
filtros, etiquetas = [], []
for k, (a, b) in enumerate(EDL):
    filtros.append(f"[0:v]trim=start={a:.4f}:end={b:.4f},setpts=PTS-STARTPTS[v{k}]")
    etiquetas.append(f"[v{k}]")
filtros.append(
    "".join(etiquetas) + f"concat=n={len(EDL)}:v=1:a=0,fps={FPS},"
    "scale=1080:1920:flags=lanczos:in_range=full:out_range=tv,"
    "eq=contrast=1.08:saturation=1.12:brightness=0.01:gamma=1.03,"
    "unsharp=5:5:0.55:5:5:0,format=yuv420p[v]"
)
subprocess.run([FF, "-y", "-loglevel", "error", "-i", str(FUENTE), "-filter_complex", ";".join(filtros),
                "-map", "[v]", "-an", "-c:v", "libx264", "-preset", "medium", "-crf", "14", "-g", "15",
                "-colorspace", "bt709", "-color_primaries", "bt709", "-color_trc", "bt709", "-color_range", "tv",
                str(GEN / "reto_base.mp4")], check=True)

# ---------------------------------------------------------------- voz: limpieza + compresión + montaje
subprocess.run([FF, "-y", "-loglevel", "error", "-i", str(FUENTE), "-vn", "-ac", "1", "-ar", str(SR), "-af",
                "highpass=f=85,lowpass=f=14000,afftdn=nf=-40,"
                "acompressor=threshold=-22dB:ratio=3:attack=6:release=90:makeup=3",
                "-c:a", "pcm_f32le", str(GEN / "reto_voz.wav")], check=True)
voz, _ = sf.read(GEN / "reto_voz.wav")
fade = int(0.008 * SR)
trozos = []
for a, b in EDL:
    seg = voz[int(round(a * SR)): int(round(b * SR))].copy()
    seg[:fade] *= np.linspace(0, 1, fade)
    seg[-fade:] *= np.linspace(1, 0, fade)
    trozos.append(seg)
voz_ed = np.concatenate(trozos)

# ---------------------------------------------------------------- SFX
N = int(DUR * SR) + SR * 2
sfx = np.zeros(N)


def poner(x, t, g=1.0, pista=sfx):
    i = max(int(t * SR), 0)
    if i < len(pista):
        pista[i:i + len(x)] += x[: len(pista) - i] * g


poner(impacto(), 0.0, 0.8)
poner(pop(), ev["t85teaser"], 0.9)
poner(ding(), ev["t85teaser"] + 0.25, 0.6)
poner(riser(0.7), esc["bienvenida"]["s"] - 0.7, 0.6)
poner(whoosh(0.5), esc["bienvenida"]["s"] - 0.25, 0.9)
poner(pop(), ev["dia"], 0.8)
poner(pop(), ev["segundo"], 0.6)
poner(pop(), ev["t85"], 0.8)
poner(whoosh(0.35), ev["captura"] - 0.15, 0.6)
for k in range(4):
    poner(click(), ev["cuatro"] + 0.12 * k, 1.1)
poner(ding(), ev["veis"], 0.8)
poner(whoosh(0.4), esc["eso"]["s"] - 0.2, 0.6)
poner(pop(), ev["dos"], 0.8)
poner(pop(), ev["dos"] + 0.25, 0.8)
poner(whoosh(0.35), ev["tablaPlano"] - 0.15, 0.6)
poner(pop(), ev["tabla"], 0.8)
poner(riser(0.6), ev["treintayuno"] - 0.6, 0.5)
poner(impacto(0.8), ev["treintayuno"], 0.6)
poner(ding(), ev["treintayuno"] + 0.05, 0.7)
poner(whoosh(0.4), esc["cta"]["s"] - 0.2, 0.6)
poner(pop(), ev["comentarios"], 0.9)

# ---------------------------------------------------------------- música (energética, mayor, 120 BPM)
musica = np.zeros(N)
BEAT = 0.5
ACORDES = [[48, 60, 64, 67], [43, 55, 59, 62], [45, 57, 60, 64], [41, 53, 57, 60]]  # C G Am F
INT = {"teaser": (1, 0, 1, 0), "bienvenida": (1, 1, 1, 1), "hoy": (1, 1, 1, 1), "eso": (1, 1, 1, 1),
       "tabla": (1, 1, 1, 1), "casilla": (1, 0, 1, 1), "cta": (1, 1, 1, 1)}
K, H = kick(), hat()
for k, e in enumerate(escenas):
    p_, kk, hh, bb = INT[e["id"]]
    acorde = ACORDES[k % 4]
    if p_:
        poner(pad([nota(m) for m in acorde], e["e"] - e["s"] + 0.3), e["s"], 1.0, musica)
    t = e["s"]
    while t < e["e"] - 0.05:  # rejilla re-fasada en cada cambio de escena: el corte cae en el beat
        if kk:
            poner(K, t, 1.0, musica)
        if hh:
            poner(H, t + BEAT / 2, 1.0, musica)
            poner(H, t + BEAT * 0.75, 0.5, musica)
        if bb:
            n = int(BEAT * 0.85 * SR)
            tt = np.arange(n) / SR
            poner(np.sin(2 * np.pi * nota(acorde[0] - 12) * tt) * env(n, 0.01, 0.15) * 0.2, t, 1.0, musica)
        t += BEAT
musica = lp(musica, 10000)

mezclar(voz_ed, musica, sfx, DUR, GEN / "reto_mezcla.wav", FF, duck=-17, nivel_musica=0.5)

json.dump({"duracion": DUR, "fps": FPS, "palabras": pal_out, "escenas": escenas, "planos": planos,
           "eventos": {k: round(v, 3) for k, v in ev.items()},
           "piezas": [{"s": round(p["out"], 3), "teaser": p["teaser"]} for p in piezas]},
          open(GEN_SRC / "reto.json", "w"), ensure_ascii=False, indent=1)
print(f"duración {DUR:.2f}s (original 16.13s), {len(EDL)} piezas")
for e in escenas:
    print(f"  {e['id']:<11} {e['s']:6.2f} - {e['e']:6.2f}")
for p in planos:
    print(f"  plano {p['tipo']:<8} {p['s']:6.2f} - {p['e']:6.2f}")
