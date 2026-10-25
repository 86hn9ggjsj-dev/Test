"""Video "Qué hace de verdad un bot de trading": guion, voz, música, SFX, mezcla y timeline. Todo desde cero.

Uso: python scripts/explica.py <ffmpeg>
Voz: si existe input/explica_voz.(mp3|wav) (grabada, o generada con scripts/voz_elevenlabs.py) se usa esa;
si no, se sintetiza con Kokoro (voz femenina española ef_dora, fonemas castellanos). En ambos casos los tiempos por palabra salen de Whisper,
alineados contra el guion para que los subtítulos muestren el texto exacto.
Salida: public/gen/explica_mezcla.wav, src/gen/explica.json, guiones/que_hace_un_bot.md
"""
import difflib
import json
import os
import re
import subprocess
import sys
from pathlib import Path

import numpy as np
import soundfile as sf
from scipy.signal import resample_poly

from guion_explica import GESTOS, GUION, TITULO
from montaje import escenas_desde, musica_energetica, poner
from sonido import SR, campana, mezclar, silencios, soplo, toque

FF = sys.argv[1]
RAIZ = Path(__file__).resolve().parent.parent
GEN = RAIZ / "public/gen"
GEN_SRC = RAIZ / "src/gen"
GEN.mkdir(parents=True, exist_ok=True)
GEN_SRC.mkdir(parents=True, exist_ok=True)

# Voz: femenina, española y cálida; un poco más pausada que una locución comercial
VOZ = "ef_dora"
VELOCIDAD = 1.04
PAUSA_FRASE = 0.06
PAUSA_ESCENA = 0.14

(RAIZ / "guiones").mkdir(exist_ok=True)
with open(RAIZ / "guiones/que_hace_un_bot.md", "w") as f:
    f.write(f"# {TITULO}\n\nGuion de voz en off (~50 s, 1080x1920). Cada bloque es una pantalla de motion graphics.\n\n")
    for id_, frases in GUION:
        f.write(f"**{id_}**  \n{' '.join(frases)}\n\n")
    f.write("## Versión con gestos (ElevenLabs, modelo Eleven v3)\n\nLas etiquetas entre corchetes no se leen: "
            "marcan entonación, risas, suspiros, susurros y pausas. Pegar con una línea en blanco entre párrafos.\n\n")
    for id_, _ in GUION:
        f.write(f"{GESTOS[id_]}\n\n")


# ---------------------------------------------------------------- voz
def recorta(x, umbral=0.012):
    """Quita el silencio inicial y final de una frase sintetizada."""
    activo = np.where(np.abs(x) > umbral)[0]
    if not len(activo):
        return x
    a = max(activo[0] - int(0.02 * SR), 0)
    b = min(activo[-1] + int(0.06 * SR), len(x))
    return x[a:b]


externa = next((p for p in (RAIZ / "input/explica_voz.mp3", RAIZ / "input/explica_voz.wav") if p.exists()), None)
bruta = GEN / "explica_voz_bruta.wav"
# Ningún silencio de la locución pasa de aquí (las respiraciones se conservan). Con una locución con gestos
# ([short pause], suspiros…) conviene subirlo para respetar las pausas buscadas: PAUSA_MAX=0.45
MAX_PAUSA = float(os.environ.get("PAUSA_MAX", 0.24))
if externa:
    subprocess.run([FF, "-y", "-loglevel", "error", "-i", str(externa), "-ac", "1", "-ar", str(SR), str(bruta)], check=True)
    x, _ = sf.read(bruta)
    trozos, prev = [], 0
    for a, b in silencios(x, umbral_rel=32, minimo=MAX_PAUSA):
        ia, ib = int(a * SR), int(b * SR)
        # Se conserva el principio y el final del silencio (cola de la frase y respiración previa) y se quita el centro
        if a < 0.05:
            prev = max(ib - int(0.12 * SR), 0)
            continue
        cola, ataque = int(0.12 * SR), int((MAX_PAUSA - 0.12) * SR)
        trozos.append(x[prev: ia + cola])
        prev = max(ib - ataque, ia + cola)
    trozos.append(x[prev:])
    fade = int(0.008 * SR)
    for tz in trozos:
        if len(tz) > 2 * fade:
            tz[:fade] *= np.linspace(0, 1, fade)
            tz[-fade:] *= np.linspace(1, 0, fade)
    sf.write(bruta, np.concatenate(trozos), SR)
else:
    from kokoro import KPipeline

    kp = KPipeline(lang_code="e", repo_id="hexgrad/Kokoro-82M")
    trozos = []
    for k, (_, frases) in enumerate(GUION):
        for j, frase in enumerate(frases):
            audio = np.concatenate([a.numpy() if hasattr(a, "numpy") else a for _, _, a in kp(frase, voice=VOZ, speed=VELOCIDAD)])
            trozos.append(recorta(resample_poly(audio, 2, 1)))  # 24 kHz -> 48 kHz
            fin_escena = j == len(frases) - 1
            trozos.append(np.zeros(int((PAUSA_ESCENA if fin_escena else PAUSA_FRASE) * SR)))
    sf.write(bruta, np.concatenate([np.zeros(int(0.12 * SR))] + trozos), SR)

# Tratamiento: la voz local se calienta y suaviza; una locución de estudio (ElevenLabs) solo se limpia y se comprime poco
voz_wav = GEN / "explica_voz.wav"
FILTRO_LOCAL = ("highpass=f=90,equalizer=f=260:t=q:w=1:g=1.5,equalizer=f=3200:t=q:w=1.2:g=1.2,"
                "equalizer=f=7500:t=q:w=1.5:g=-2,acompressor=threshold=-20dB:ratio=2.2:attack=10:release=140:makeup=2")
FILTRO_ESTUDIO = "highpass=f=70,acompressor=threshold=-18dB:ratio=1.8:attack=12:release=160:makeup=1.5"
subprocess.run([FF, "-y", "-loglevel", "error", "-i", str(bruta), "-af", FILTRO_ESTUDIO if externa else FILTRO_LOCAL,
                "-ar", str(SR), "-c:a", "pcm_f32le", str(voz_wav)], check=True)
voz, _ = sf.read(voz_wav)
dur = round(len(voz) / SR + 0.6, 3)

# ---------------------------------------------------------------- tiempos por palabra (Whisper) alineados al guion
from faster_whisper import WhisperModel  # noqa: E402

modelo = WhisperModel("small", device="cpu", compute_type="int8")
segs, _ = modelo.transcribe(str(voz_wav), language="es", word_timestamps=True)
oidas = [{"w": w.word.strip(), "s": w.start, "e": w.end} for s in segs for w in s.words]

norm = lambda w: re.sub(r"[^\wáéíóúñü%]", "", w.lower())  # noqa: E731
tokens = []  # (texto tal cual en el guion, escena, índice de frase)
for id_, frases in GUION:
    for j, frase in enumerate(frases):
        for w in frase.split():
            tokens.append((w, id_, j))
a = [norm(w) for w, _, _ in tokens]
b = [norm(o["w"]) for o in oidas]
tiempos: list = [None] * len(tokens)
for bloque in difflib.SequenceMatcher(None, a, b, autojunk=False).get_matching_blocks():
    for k in range(bloque.size):
        o = oidas[bloque.b + k]
        tiempos[bloque.a + k] = (o["s"], o["e"])
# Palabras no reconocidas: se reparten entre sus vecinas
conocidas = [i for i, x in enumerate(tiempos) if x]
for i in range(len(tokens)):
    if tiempos[i]:
        continue
    prev = max([k for k in conocidas if k < i], default=None)
    sig = min([k for k in conocidas if k > i], default=None)
    t0 = tiempos[prev][1] if prev is not None else 0.1
    t1 = tiempos[sig][0] if sig is not None else t0 + 0.4
    huecos = (sig if sig is not None else i + 1) - (prev if prev is not None else i - 1) - 1
    paso = (t1 - t0) / max(huecos, 1)
    pos = i - (prev if prev is not None else i - 1) - 1
    tiempos[i] = (t0 + pos * paso, t0 + (pos + 1) * paso)
palabras = [{"w": w, "s": round(s, 3), "e": round(e, 3), "i": i, "hook": False, "escena": id_}
            for i, ((w, id_, _), (s, e)) in enumerate(zip(tokens, tiempos))]
print(f"alineadas {len(conocidas)}/{len(tokens)} palabras")

inicio = {}
for p in palabras:
    inicio.setdefault(p["escena"], p["s"])
escenas = escenas_desde([(id_, inicio[id_]) for id_, _ in GUION], dur)
escenas[0]["s"] = 0.0


def t_pal(w, escena=None):
    for p in palabras:
        if norm(p["w"]) == norm(w) and (escena is None or p["escena"] == escena):
            return p["s"]
    raise KeyError(w)


ev = {
    "futuro": t_pal("futuro"), "aburrido": t_pal("aburrido"), "util": t_pal("útil"),
    "mercado": t_pal("mercado"), "precio": t_pal("precio", "lee"), "volumen": t_pal("volumen", "lee"),
    "spread": t_pal("spread"), "miles": t_pal("Miles"),
    "reglas": t_pal("reglas"), "rompe": t_pal("rompe"), "volumen2": t_pal("volumen", "decide"),
    "entra": t_pal("entra"), "espera": t_pal("espera"),
    "perder": t_pal("perder"), "stop": t_pal("stop"), "tamano": t_pal("tamaño"), "calculados": t_pal("calculados"),
    "milisegundos": t_pal("milisegundos"), "tres": t_pal("tres"), "noticia": t_pal("noticia"),
    "miedo": t_pal("miedo"), "avaricia": t_pal("avaricia"), "programado": t_pal("programado"), "menos": t_pal("menos"),
    "magia": t_pal("magia"), "disciplina": t_pal("disciplina"), "codigo": t_pal("código"),
    "prueba": t_pal("prueba"), "euro": t_pal("euro"),
}

# ---------------------------------------------------------------- SFX y música
n = int(dur * SR) + SR * 2
sfx = np.zeros(n)
for e in escenas[1:]:
    poner(sfx, soplo(0.5), e["s"] - 0.25, 0.7)
    poner(sfx, toque(), e["s"] + 0.05, 0.8)
for k in ("futuro", "rompe", "volumen2", "stop", "tamano", "milisegundos", "miedo", "avaricia"):
    poner(sfx, toque(), ev[k], 0.6)
for k in ("util", "entra", "calculados", "codigo", "euro"):
    poner(sfx, campana(), ev[k], 0.8)
INTENSIDAD = {"hook": (1, 0, 1, 0), "lee": (1, 1, 1, 1), "decide": (1, 1, 1, 1), "protege": (1, 1, 1, 1),
              "ejecuta": (1, 1, 1, 1), "emocion": (1, 0, 1, 1), "codigo": (1, 1, 1, 1), "cta": (1, 1, 1, 1)}
musica = musica_energetica(n, escenas, INTENSIDAD)
mezclar(voz, musica, sfx, dur, GEN / "explica_mezcla.wav", FF, duck=-17, nivel_musica=0.5, nivel_sfx=0.3)

json.dump({"titulo": TITULO, "duracion": dur, "fps": 30, "palabras": palabras, "escenas": escenas,
           "eventos": {k: round(v, 3) for k, v in ev.items()}},
          open(GEN_SRC / "explica.json", "w"), ensure_ascii=False, indent=1)
print(f"duración {dur:.2f}s")
for e in escenas:
    print(f"  {e['id']:<8} {e['s']:6.2f} - {e['e']:6.2f}")
