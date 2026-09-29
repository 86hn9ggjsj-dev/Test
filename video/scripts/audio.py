"""Edita la voz (hook + jump cuts), genera música y SFX sintetizados y mezcla a -14 LUFS.

Uso: python scripts/audio.py <ffmpeg>
Entrada: input/voz.mp3, input/palabras.json (Whisper, timestamps por palabra)
Salida:  public/gen/mezcla.wav, src/gen/timeline.json
"""
import json
import subprocess
import sys
from pathlib import Path

import numpy as np
import soundfile as sf
from scipy.signal import butter, sosfilt

FF = sys.argv[1]
RAIZ = Path(__file__).resolve().parent.parent
GEN_AUDIO = RAIZ / "public/gen"
GEN_SRC = RAIZ / "src/gen"
GEN_AUDIO.mkdir(parents=True, exist_ok=True)
GEN_SRC.mkdir(parents=True, exist_ok=True)
SR = 48000
rng = np.random.default_rng(7)

# ---------------------------------------------------------------- voz
subprocess.run([FF, "-y", "-loglevel", "error", "-i", str(RAIZ / "input/voz.mp3"),
                "-ac", "1", "-ar", str(SR), "-c:a", "pcm_f32le", str(GEN_AUDIO / "voz.wav")], check=True)
voz, _ = sf.read(GEN_AUDIO / "voz.wav")
palabras = json.load(open(RAIZ / "input/palabras.json"))

# Correcciones de Whisper verificadas contra la energía de la señal
for p in palabras:
    if p["w"] == "mañana":
        p["e"] = 19.54
    if p["w"] == "probablemente":
        p["s"] = 20.05


def silencios(x, umbral_rel=38, minimo=0.15):
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


# Pausas dramáticas que se conservan más largas (inicio de la frase siguiente -> hueco)
PAUSAS_DRAMATICAS = {11.08: 0.40, 13.68: 0.36}
HUECO = 0.20

cortes = []
for a, b in silencios(voz):
    if b - a <= 0.3 or b >= len(voz) / SR - 0.05:
        continue
    siguiente = min((p["s"] for p in palabras if p["s"] >= a), default=b)
    g = next((v for k, v in PAUSAS_DRAMATICAS.items() if abs(k - siguiente) < 0.1), HUECO)
    if b - a > g:
        cortes.append((a + g / 2, b - g / 2))

fin_voz = silencios(voz)[-1][0] + 0.12
tramos, t = [], 0.0
for a, b in cortes:
    tramos.append((t, a))
    t = b
tramos.append((t, fin_voz))

# Hook: "Y ahí empieza el problema." al principio
HOOK = (13.64, 15.45)
PAUSA_HOOK = 0.30
secuencia = [HOOK, None] + tramos  # None = silencio tras el hook

# Mapa de tiempos fuente -> salida
piezas, salida = [], 0.0
audio = []
fade = int(0.008 * SR)
for tr in secuencia:
    if tr is None:
        audio.append(np.zeros(int(PAUSA_HOOK * SR)))
        salida += PAUSA_HOOK
        continue
    seg = voz[int(tr[0] * SR): int(tr[1] * SR)].copy()
    seg[:fade] *= np.linspace(0, 1, fade)
    seg[-fade:] *= np.linspace(1, 0, fade)
    audio.append(seg)
    piezas.append({"src": tr, "out": salida, "hook": tr is HOOK})
    salida += len(seg) / SR
voz_ed = np.concatenate(audio)
DUR = len(voz_ed) / SR + 0.9  # cola para el loop


def mapear(t, hook):
    for p in piezas:
        if p["hook"] != hook:
            continue
        a, b = p["src"]
        if a - 0.05 <= t <= b + 0.05:
            return p["out"] + min(max(t - a, 0), b - a)
    return None


pal_out = []
for i, p in enumerate(palabras):
    for hook in (True, False):
        if hook and not (34 <= i <= 38):
            continue
        s, e = mapear(p["s"], hook), mapear(p["e"], hook)
        if s is None:
            continue
        pal_out.append({"w": p["w"], "s": round(s, 3), "e": round(e, 3), "i": i, "hook": hook})
pal_out.sort(key=lambda p: p["s"])

# Escenas: (id, primer índice de palabra, usa la copia del hook)
ESCENAS = [("hook", 34, True), ("calma", 0, False), ("entrada", 4, False), ("contra", 13, False),
           ("stop", 23, False), ("vuelve", 30, False), ("beneficio", 31, False), ("problema", 34, False),
           ("estrategia", 39, False), ("emociones", 45, False), ("manana", 49, False)]
escenas = []
for nombre, idx, hook in ESCENAS:
    w = next(p for p in pal_out if p["i"] == idx and p["hook"] == hook)
    escenas.append({"id": nombre, "s": 0.0 if not escenas else round(w["s"] - 0.08, 3)})
for a, b in zip(escenas, escenas[1:]):
    a["e"] = b["s"]
escenas[-1]["e"] = round(DUR, 3)


def t_pal(idx, hook=False):
    return next(p["s"] for p in pal_out if p["i"] == idx and p["hook"] == hook)


esc = {e["id"]: e for e in escenas}

# ---------------------------------------------------------------- SFX sintetizados
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


sfx_pista = np.zeros(int(DUR * SR) + SR * 2)


def poner(x, t, g=1.0):
    i = max(int(t * SR), 0)
    sfx_pista[i:i + len(x)] += x[: len(sfx_pista) - i] * g


poner(impacto(), 0.0, 1.0)
poner(glitch(0.28), t_pal(38, True) - 0.02, 0.9)          # "problema" en el hook
poner(whoosh(0.5), esc["calma"]["s"] - 0.25, 0.9)          # transición al inicio de la historia
poner(pop(), t_pal(10), 0.9)                                # "estrategia" -> check
poner(click(), t_pal(12), 1.2)                              # "entras" -> BUY
poner(whoosh(0.4, subida=False), esc["contra"]["s"] - 0.15, 0.7)
poner(whoosh(0.35, subida=False), t_pal(19) - 0.1, 0.6)     # "contra"
poner(dudas(), t_pal(22), 1.0)                              # "dudas"
poner(whoosh(0.3), t_pal(25) - 0.1, 0.8)                    # "stop" arrastrado
poner(riser(0.9), esc["vuelve"]["s"] - 0.9, 0.6)
poner(impacto(0.9), esc["vuelve"]["s"] + 0.05, 0.7)
poner(ding(), t_pal(33), 1.0)                               # "beneficio"
poner(riser(0.8), esc["problema"]["s"] - 0.8, 0.8)
poner(impacto(), esc["problema"]["s"] + 0.05, 1.0)
poner(glitch(0.25), t_pal(38) - 0.02, 0.8)
poner(whoosh(0.4), esc["estrategia"]["s"] - 0.2, 0.8)
poner(pop(), t_pal(44), 0.8)                                # "estrategia,"
poner(glitch(0.3), t_pal(48) - 0.05, 0.9)                   # "emociones"
poner(whoosh(0.5), esc["manana"]["s"] - 0.2, 0.8)
poner(pop(), t_pal(50), 0.7)                                # "mañana"
poner(whoosh(0.6), DUR - 0.5, 0.9)                          # vuelta al inicio (loop)

# ---------------------------------------------------------------- música sintetizada
N = len(sfx_pista)
musica = np.zeros(N)
BEAT = 60 / 100
nota = lambda m: 440 * 2 ** ((m - 69) / 12)
ACORDES = [[45, 57, 60, 64], [41, 53, 57, 60], [38, 50, 53, 57], [40, 52, 56, 59]]  # Am F Dm E


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


def poner_m(x, t, g=1.0):
    i = int(t * SR)
    if 0 <= i < N:
        musica[i:i + len(x)] += x[: N - i] * g


# Intensidad por escena: (pad, kick, hats, bajo)
INT = {"hook": (1, 0, 0, 0), "calma": (1, 0, 1, 0), "entrada": (1, 1, 1, 0), "contra": (1, 1, 1, 1),
       "stop": (1, 1, 1, 1), "vuelve": (1, 1, 1, 1), "beneficio": (1, 1, 1, 1), "problema": (0, 0, 0, 0),
       "estrategia": (1, 1, 1, 1), "emociones": (1, 1, 1, 1), "manana": (1, 0, 1, 1)}
K = kick()
H = hat()
for k, e in enumerate(escenas):
    p, kk, hh, bb = INT[e["id"]]
    acorde = ACORDES[k % 4]
    d = e["e"] - e["s"]
    if p:
        poner_m(pad([nota(m) for m in acorde], d + 0.3), e["s"])
    t = e["s"]
    while t < e["e"] - 0.05:  # rejilla re-fasada en cada corte: el corte cae en el beat
        if kk:
            poner_m(K, t)
        if hh:
            poner_m(H, t + BEAT / 2)
        if bb:
            n = int(BEAT * 0.9 * SR)
            tt = np.arange(n) / SR
            poner_m(np.sin(2 * np.pi * nota(acorde[0] - 12) * tt) * env(n, 0.01, 0.2) * 0.22, t)
        t += BEAT
musica = lp(musica, 9000)

# ---------------------------------------------------------------- mezcla con ducking
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
duck_db = -18 * suave  # -18 dB bajo la voz
gan = np.repeat(10 ** (duck_db / 20), hop)
gan = np.pad(gan, (0, N - len(gan)), mode="edge")
musica *= 0.55 * gan
mezcla = voz_p + musica + sfx_pista * 0.5
mezcla = mezcla[: int(DUR * SR)]
mezcla[-int(0.3 * SR):] *= np.linspace(1, 0, int(0.3 * SR))
sf.write(GEN_AUDIO / "premezcla.wav", np.stack([mezcla, mezcla], 1).astype(np.float32), SR, subtype="FLOAT")

# Normalización a -14 LUFS (dos pasadas)
r = subprocess.run([FF, "-hide_banner", "-i", str(GEN_AUDIO / "premezcla.wav"), "-af",
                    "loudnorm=I=-14:TP=-1:LRA=11:print_format=json", "-f", "null", "-"],
                   capture_output=True, text=True)
m = json.loads(r.stderr[r.stderr.rindex("{"): r.stderr.rindex("}") + 1])
subprocess.run([FF, "-y", "-loglevel", "error", "-i", str(GEN_AUDIO / "premezcla.wav"), "-af",
                f"loudnorm=I=-14:TP=-1:LRA=11:measured_I={m['input_i']}:measured_TP={m['input_tp']}:"
                f"measured_LRA={m['input_lra']}:measured_thresh={m['input_thresh']}:offset={m['target_offset']}:linear=true",
                "-ar", str(SR), "-c:a", "pcm_s16le", str(GEN_AUDIO / "mezcla.wav")], check=True)

json.dump({"duracion": round(DUR, 3), "palabras": pal_out, "escenas": escenas},
          open(GEN_SRC / "timeline.json", "w"), ensure_ascii=False, indent=1)
print(f"duración {DUR:.2f}s, {len(cortes)} jump cuts, {len(escenas)} escenas")
for e in escenas:
    print(f"  {e['id']:<11} {e['s']:6.2f} - {e['e']:6.2f}")
