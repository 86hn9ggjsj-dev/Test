"""Utilidades de sonido compartidas: detección de silencios, SFX y música sintetizados, mezcla.

Todo se genera por síntesis (sin samples externos) a 48 kHz mono.
"""
import json
import subprocess

import numpy as np
import soundfile as sf
from scipy.signal import butter, sosfilt

SR = 48000
rng = np.random.default_rng(7)
nota = lambda m: 440 * 2 ** ((m - 69) / 12)

def silencios(x, umbral_rel=38, minimo=0.15):
    """Tramos (inicio, fin) en segundos más de umbral_rel dB por debajo del pico."""
    hop = SR // 100
    n = len(x) // hop
    db = 20 * np.log10(np.sqrt(np.mean(x[: n * hop].reshape(n, hop) ** 2, axis=1)) + 1e-9)
    mudo = db < db.max() - umbral_rel
    res, i = [], 0
    while i < n:
        if mudo[i]:
            j = i
            while j < n and mudo[j]:
                j += 1
            if (j - i) / 100 >= minimo:
                res.append((i / 100, j / 100))
            i = j
        else:
            i += 1
    return res



def env(n, att, rel):
    e = np.ones(n)
    a, r = int(att * SR), int(rel * SR)
    if a:
        e[:a] = np.linspace(0, 1, a) ** 2
    if r:
        e[-r:] *= np.linspace(1, 0, r) ** 2
    return e


def bp(x, lo, hi):
    return sosfilt(butter(2, [lo, hi], "band", fs=SR, output="sos"), x)


def lp(x, f):
    return sosfilt(butter(2, f, "low", fs=SR, output="sos"), x)


def hp(x, f):
    return sosfilt(butter(2, f, "high", fs=SR, output="sos"), x)


def whoosh(d=0.45, subida=True):
    n = int(d * SR)
    ruido = rng.standard_normal(n)
    bloques = 24
    out = np.zeros(n)
    for k in range(bloques):
        c = 400 + 3600 * ((k / bloques) if subida else 1 - k / bloques)
        seg = bp(ruido, c * 0.6, min(c * 1.6, 20000))
        v = np.zeros(n)
        a, b = k * n // bloques, (k + 1) * n // bloques
        v[a:b] = 1
        out += seg * v
    curva = np.sin(np.linspace(0, np.pi, n)) ** 1.5
    return out * curva * 0.5


def pop():
    n = int(0.09 * SR)
    t = np.arange(n) / SR
    f = 950 * np.exp(-t * 28) + 260
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 45) * 0.55


def click():
    n = int(0.03 * SR)
    t = np.arange(n) / SR
    return (np.sin(2 * np.pi * 2300 * t) * np.exp(-t * 180) + hp(rng.standard_normal(n), 3000) * np.exp(-t * 400)) * 0.35


def impacto(d=1.2):
    n = int(d * SR)
    t = np.arange(n) / SR
    f = 32 + 70 * np.exp(-t * 9)
    sub = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 3.2)
    golpe = lp(rng.standard_normal(n), 900) * np.exp(-t * 25)
    return np.tanh((sub * 1.4 + golpe * 0.9) * 1.6) * 0.8


def riser(d=1.0):
    n = int(d * SR)
    t = np.arange(n) / SR
    f = 180 * (8 ** (t / d))
    tono = np.sin(2 * np.pi * np.cumsum(f) / SR) * 0.25
    ruido = hp(rng.standard_normal(n), 2500) * 0.35
    return (tono + ruido) * (t / d) ** 2.2


def ding():
    n = int(0.9 * SR)
    t = np.arange(n) / SR
    x = sum(a * np.sin(2 * np.pi * f * t) for f, a in ((1568, 0.5), (3136, 0.2), (2349, 0.15))) * np.exp(-t * 6)
    d = int(0.085 * SR)
    y = np.zeros(n)
    y[d:] = (np.sin(2 * np.pi * 2093 * t[: n - d]) * 0.5) * np.exp(-t[: n - d] * 5)
    return (x + y) * 0.35


def glitch(d=0.3):
    n = int(d * SR)
    out = np.zeros(n)
    k = 0
    while k < n:
        m = int(rng.uniform(0.012, 0.035) * SR)
        t = np.arange(min(m, n - k)) / SR
        if rng.random() < 0.7:
            out[k:k + len(t)] = np.sign(np.sin(2 * np.pi * rng.uniform(120, 1800) * t)) * 0.18
        k += m
    return out


def dudas():
    n = int(0.5 * SR)
    t = np.arange(n) / SR
    f = 520 + 90 * np.sin(2 * np.pi * 9 * t) - 180 * t
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * env(n, 0.02, 0.2) * 0.18


def pad(freqs, d):
    n = int(d * SR)
    t = np.arange(n) / SR
    x = np.zeros(n)
    for f in freqs:
        for det in (-0.12, 0.0, 0.13):
            for h in range(1, 6):
                x += np.sin(2 * np.pi * f * 2 ** (det / 12) * h * t + rng.uniform(0, 6)) / h
    return lp(x, 1300) * env(n, 0.25, 0.3) * 0.035


def kick():
    n = int(0.35 * SR)
    t = np.arange(n) / SR
    f = 48 + 110 * np.exp(-t * 30)
    return np.tanh(np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 9) * 2.2) * 0.7


def hat():
    n = int(0.05 * SR)
    return hp(rng.standard_normal(n), 7000) * np.exp(-np.arange(n) / SR * 90) * 0.18



def mezclar(voz_ed, musica, sfx_pista, dur, destino, ff, duck=-18, nivel_musica=0.55, nivel_sfx=0.5):
    """Ducking de la música bajo la voz y normalización a -14 LUFS (dos pasadas). Escribe destino (wav)."""
    N = len(musica)
    pre = str(destino).replace(".wav", "_pre.wav")
    voz_p = np.zeros(N)
    voz_p[: len(voz_ed)] = voz_ed
    voz_p *= 10 ** (-3 / 20) / np.max(np.abs(voz_p))
    hop = SR // 100
    nb = N // hop
    rms = np.sqrt(np.mean(voz_p[: nb * hop].reshape(nb, hop) ** 2, axis=1))
    activo = (rms > 0.01).astype(float)
    suave = np.zeros(nb)
    for i in range(1, nb):  # ataque rápido, release lento
        c = 0.5 if activo[i] > suave[i - 1] else 0.06
        suave[i] = suave[i - 1] + c * (activo[i] - suave[i - 1])
    duck_db = duck * suave  # dB bajo la voz
    gan = np.repeat(10 ** (duck_db / 20), hop)
    gan = np.pad(gan, (0, N - len(gan)), mode="edge")
    musica = musica * nivel_musica * gan
    mezcla = voz_p + musica + sfx_pista[:N] * nivel_sfx
    mezcla = mezcla[: int(dur * SR)]
    mezcla[-int(0.3 * SR):] *= np.linspace(1, 0, int(0.3 * SR))
    sf.write(pre, np.stack([mezcla, mezcla], 1).astype(np.float32), SR, subtype="FLOAT")

    # Normalización a -14 LUFS (dos pasadas)
    r = subprocess.run([ff, "-hide_banner", "-i", str(pre), "-af",
                        "loudnorm=I=-14:TP=-1:LRA=11:print_format=json", "-f", "null", "-"],
                       capture_output=True, text=True)
    m = json.loads(r.stderr[r.stderr.rindex("{"): r.stderr.rindex("}") + 1])
    subprocess.run([ff, "-y", "-loglevel", "error", "-i", str(pre), "-af",
                    f"loudnorm=I=-14:TP=-1:LRA=11:measured_I={m['input_i']}:measured_TP={m['input_tp']}:"
                    f"measured_LRA={m['input_lra']}:measured_thresh={m['input_thresh']}:offset={m['target_offset']}:linear=true",
                    "-ar", str(SR), "-c:a", "pcm_s16le", str(destino)], check=True)


# ---------------------------------------------------------------- SFX suaves (estilo premium)
def toque():
    """Toque de interfaz corto y limpio, sin el 'pop' de dibujo animado."""
    n = int(0.08 * SR)
    t = np.arange(n) / SR
    x = (np.sin(2 * np.pi * 1400 * t) + 0.35 * np.sin(2 * np.pi * 2800 * t)) * np.exp(-t * 60)
    x += lp(rng.standard_normal(n), 3000) * np.exp(-t * 300) * 0.15
    return x * env(n, 0.002, 0.01) * 0.25


def campana():
    """Campanilleo tenue con cola de aire (ecos cortos), para los momentos clave."""
    n = int(1.4 * SR)
    t = np.arange(n) / SR
    x = sum(a * np.sin(2 * np.pi * f * t) for f, a in ((1318.5, 0.5), (1975.5, 0.3), (2637.0, 0.12))) * np.exp(-t * 3.5)
    x *= env(n, 0.005, 0.2)
    y = x.copy()
    for ms, g in ((60, 0.35), (130, 0.2), (210, 0.1)):
        d = int(ms / 1000 * SR)
        y[d:] += x[:-d] * g
    return lp(y, 7000) * 0.18


def soplo(d=0.5):
    """Soplido de aire suave para transiciones (whoosh sin agudos)."""
    n = int(d * SR)
    ruido = lp(rng.standard_normal(n), 1800)
    return bp(ruido, 150, 1800) * np.sin(np.linspace(0, np.pi, n)) ** 2 * 0.35
