"""Pipeline común de los videos de motion graphics con voz en off: guion, voz, tiempos por palabra, música, SFX y mezcla.

Voz: si existe input/<nombre>_voz.(mp3|wav) (grabada, generada con scripts/voz_elevenlabs.py o descargada de la web de
ElevenLabs) se usa esa; si no, se sintetiza con Kokoro (voz femenina española ef_dora, fonemas castellanos). En ambos
casos los tiempos por palabra salen de Whisper, alineados contra el guion para que los subtítulos muestren el texto exacto.
Salida: public/gen/<nombre>_mezcla.wav, src/gen/<nombre>.json y el guion en guiones/<md>.md
"""
import difflib
import json
import os
import re
import subprocess
from pathlib import Path

import numpy as np
import soundfile as sf
from scipy.signal import resample_poly

from montaje import escenas_desde, musica_energetica, poner
from sonido import SR, campana, mezclar, silencios, soplo, toque

RAIZ = Path(__file__).resolve().parent.parent
GEN = RAIZ / "public/gen"
GEN_SRC = RAIZ / "src/gen"

# Voz local: femenina, española y cálida; un poco más pausada que una locución comercial
VOZ = "ef_dora"
VELOCIDAD = 1.04
PAUSA_FRASE = 0.06
PAUSA_ESCENA = 0.14
# Ningún silencio de la locución pasa de aquí (las respiraciones se conservan). Con una locución con gestos
# ([short pause], suspiros…) conviene respetar las pausas buscadas
# y las respiraciones: PAUSA_MAX=0.6 PAUSA_UMBRAL=42 (solo se recorta el silencio real, no las respiraciones)
MAX_PAUSA = float(os.environ.get("PAUSA_MAX", "0.24"))
UMBRAL_PAUSA = float(os.environ.get("PAUSA_UMBRAL", "32"))

# Tratamiento: la voz local se calienta y suaviza; una locución de estudio (ElevenLabs) solo se limpia y se comprime poco
FILTRO_LOCAL = ("highpass=f=90,equalizer=f=260:t=q:w=1:g=1.5,equalizer=f=3200:t=q:w=1.2:g=1.2,"
                "equalizer=f=7500:t=q:w=1.5:g=-2,acompressor=threshold=-20dB:ratio=2.2:attack=10:release=140:makeup=2")
FILTRO_ESTUDIO = "highpass=f=70,acompressor=threshold=-18dB:ratio=1.8:attack=12:release=160:makeup=1.5"

norm = lambda w: re.sub(r"[^\wáéíóúñü%]", "", w.lower())  # noqa: E731
NUMEROS = {"1": "uno", "2": "dos", "3": "tres", "4": "cuatro", "5": "cinco", "6": "seis", "7": "siete", "8": "ocho", "9": "nueve", "10": "diez",
           "20": "veinte", "30": "treinta", "100": "cien", "1000": "mil"}
NUMEROS_INV = {v: k for k, v in NUMEROS.items()}


def escribir_guion(md, titulo, intro, guion, gestos, pantallas=None):
    (RAIZ / "guiones").mkdir(exist_ok=True)
    with open(RAIZ / f"guiones/{md}.md", "w") as f:
        f.write(f"# {titulo}\n\n{intro}\n\n")
        for id_, frases in guion:
            f.write(f"**{id_}**  \n{' '.join(frases)}\n\n")
        f.write("## Versión con gestos (ElevenLabs, modelo Eleven v3)\n\nLas etiquetas entre corchetes no se leen: "
                "marcan respiraciones, pausas y tono. Las palabras son las mismas que arriba, así el vídeo se sincroniza solo. "
                "Pegar con una línea en blanco entre párrafos.\n\n")
        for id_, _ in guion:
            f.write(f"{gestos[id_]}\n\n")
        if pantallas:
            f.write("## Pantallas\n\n| Bloque | Titular | Motivo |\n|---|---|---|\n")
            for id_, titular, motivo in pantallas:
                f.write(f"| {id_} | {titular} | {motivo} |\n")


def recorta(x, umbral=0.012):
    """Quita el silencio inicial y final de una frase sintetizada."""
    activo = np.where(np.abs(x) > umbral)[0]
    if not len(activo):
        return x
    a = max(activo[0] - int(0.02 * SR), 0)
    b = min(activo[-1] + int(0.06 * SR), len(x))
    return x[a:b]


def voz_externa(ff, fuente, bruta):
    """Locución externa: a 48 kHz mono y con los silencios largos acortados."""
    subprocess.run([ff, "-y", "-loglevel", "error", "-i", str(fuente), "-ac", "1", "-ar", str(SR), str(bruta)], check=True)
    x, _ = sf.read(bruta)
    trozos, prev = [], 0
    for a, b in silencios(x, umbral_rel=UMBRAL_PAUSA, minimo=MAX_PAUSA):
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


def voz_local(guion, bruta):
    from kokoro import KPipeline

    kp = KPipeline(lang_code="e", repo_id="hexgrad/Kokoro-82M")
    trozos = []
    for _, frases in guion:
        for j, frase in enumerate(frases):
            audio = np.concatenate([a.numpy() if hasattr(a, "numpy") else a for _, _, a in kp(frase, voice=VOZ, speed=VELOCIDAD)])
            trozos.append(recorta(resample_poly(audio, 2, 1)))  # 24 kHz -> 48 kHz
            fin_escena = j == len(frases) - 1
            trozos.append(np.zeros(int((PAUSA_ESCENA if fin_escena else PAUSA_FRASE) * SR)))
    sf.write(bruta, np.concatenate([np.zeros(int(0.12 * SR))] + trozos), SR)


def alinear(voz_wav, guion):
    """Tiempos por palabra del guion a partir de Whisper."""
    from faster_whisper import WhisperModel

    modelo = WhisperModel("small", device="cpu", compute_type="int8")
    segs, _ = modelo.transcribe(str(voz_wav), language="es", word_timestamps=True)
    oidas = [{"w": w.word.strip(), "s": w.start, "e": w.end} for s in segs for w in s.words]

    tokens = []  # (texto tal cual en el guion, escena)
    for id_, frases in guion:
        for frase in frases:
            for w in frase.split():
                tokens.append((w, id_))
    a = [norm(w) for w, _ in tokens]
    b = [norm(o["w"]) for o in oidas]
    tiempos: list = [None] * len(tokens)
    for op, i1, i2, j1, j2 in difflib.SequenceMatcher(None, a, b, autojunk=False).get_opcodes():
        if op == "equal":
            for k in range(i2 - i1):
                tiempos[i1 + k] = (oidas[j1 + k]["s"], oidas[j1 + k]["e"])
        # Una palabra del guion que Whisper parte en dos ("sobreoptimizado" -> "sobre optimizado")
        elif op == "replace" and i2 - i1 == 1 and "".join(b[j1:j2]) == a[i1]:
            tiempos[i1] = (oidas[j1]["s"], oidas[j2 - 1]["e"])
        # Mismo número de palabras con erratas de Whisper ("bactest", "provar") o cifras ("1" por "uno")
        elif op == "replace" and i2 - i1 == j2 - j1:
            for k in range(i2 - i1):
                x, y = a[i1 + k], b[j1 + k]
                if x in (NUMEROS.get(y), NUMEROS_INV.get(y)) or difflib.SequenceMatcher(None, x, y).ratio() >= 0.75:
                    tiempos[i1 + k] = (oidas[j1 + k]["s"], oidas[j1 + k]["e"])
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
    print(f"alineadas {len(conocidas)}/{len(tokens)} palabras")
    return [{"w": w, "s": round(s, 3), "e": round(e, 3), "i": i, "hook": False, "escena": id_}
            for i, ((w, id_), (s, e)) in enumerate(zip(tokens, tiempos))]


def generar(ff, nombre, titulo, guion, eventos, toques, campanas, intensidad):
    """eventos: nombre -> palabra o (palabra, escena) cuyo inicio marca una animación.
    toques / campanas: eventos que llevan ese SFX. intensidad: escena -> (pad, kick, hats, bajo)."""
    GEN.mkdir(parents=True, exist_ok=True)
    GEN_SRC.mkdir(parents=True, exist_ok=True)
    externa = next((p for p in (RAIZ / f"input/{nombre}_voz.mp3", RAIZ / f"input/{nombre}_voz.wav") if p.exists()), None)
    bruta = GEN / f"{nombre}_voz_bruta.wav"
    if externa:
        voz_externa(ff, externa, bruta)
    else:
        voz_local(guion, bruta)
    voz_wav = GEN / f"{nombre}_voz.wav"
    subprocess.run([ff, "-y", "-loglevel", "error", "-i", str(bruta), "-af", FILTRO_ESTUDIO if externa else FILTRO_LOCAL,
                    "-ar", str(SR), "-c:a", "pcm_f32le", str(voz_wav)], check=True)
    voz, _ = sf.read(voz_wav)
    dur = round(len(voz) / SR + 0.6, 3)

    palabras = alinear(voz_wav, guion)
    inicio = {}
    for p in palabras:
        inicio.setdefault(p["escena"], p["s"])
    escenas = escenas_desde([(id_, inicio[id_]) for id_, _ in guion], dur)
    escenas[0]["s"] = 0.0

    def t_pal(w, escena=None):
        for p in palabras:
            if norm(p["w"]) == norm(w) and (escena is None or p["escena"] == escena):
                return p["s"]
        raise KeyError(w)

    ev = {k: t_pal(*v) if isinstance(v, tuple) else t_pal(v) for k, v in eventos.items()}

    n = int(dur * SR) + SR * 2
    sfx = np.zeros(n)
    for e in escenas[1:]:
        poner(sfx, soplo(0.5), e["s"] - 0.25, 0.7)
        poner(sfx, toque(), e["s"] + 0.05, 0.8)
    for k in toques:
        poner(sfx, toque(), ev[k], 0.6)
    for k in campanas:
        poner(sfx, campana(), ev[k], 0.8)
    musica = musica_energetica(n, escenas, intensidad)
    mezclar(voz, musica, sfx, dur, GEN / f"{nombre}_mezcla.wav", ff, duck=-17, nivel_musica=0.5, nivel_sfx=0.3)

    json.dump({"titulo": titulo, "duracion": dur, "fps": 30, "palabras": palabras, "escenas": escenas,
               "eventos": {k: round(v, 3) for k, v in ev.items()}},
              open(GEN_SRC / f"{nombre}.json", "w"), ensure_ascii=False, indent=1)
    print(f"duración {dur:.2f}s")
    for e in escenas:
        print(f"  {e['id']:<8} {e['s']:6.2f} - {e['e']:6.2f}")
