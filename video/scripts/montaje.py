"""Montaje común para videos grabados a cámara: EDL, mapa de tiempos, planos, video base, voz y música.

Lo usan reto.py y bot.py; cada script define su EDL, sus planos, sus escenas y sus SFX.
"""
import json
import subprocess

import numpy as np
import soundfile as sf

from sonido import SR, env, hat, kick, lp, nota, pad

# Grading premium: contraste suave, poca saturación, sombras frías y altas luces cálidas, nitidez leve
GRADING = ("eq=contrast=1.06:saturation=1.04:brightness=0.005:gamma=1.02,"
           "colorbalance=rs=-0.03:bs=0.03:rh=0.03:bh=-0.03,"
           "unsharp=5:5:0.55:5:5:0")
# Voz de móvil: fuera graves y ruido, compresión suave
VOZ = ("highpass=f=85,lowpass=f=14000,afftdn=nf=-40,"
       "acompressor=threshold=-22dB:ratio=3:attack=6:release=90:makeup=3")


def rejilla(t, fps):
    """Ajusta un tiempo a la rejilla de fotogramas para que video y audio corten en el mismo punto."""
    return round(t * fps) / fps


class Montaje:
    def __init__(self, edl, planos_def, fps=30):
        self.fps = fps
        self.edl = [(rejilla(a, fps), rejilla(b, fps)) for a, b in edl]
        self.piezas, out = [], 0.0
        for a, b in self.edl:
            self.piezas.append({"src": (a, b), "out": out})
            out += b - a
        self.dur = round(out, 4)
        self.planos = []
        for k, p in enumerate(self.piezas):
            a, b = p["src"]
            for pa, pb, tipo in planos_def:
                ia, ib = max(a, pa), min(b, pb)
                if ib - ia > 1e-3:
                    self.planos.append({"s": round(p["out"] + ia - a, 3), "e": round(p["out"] + ib - a, 3),
                                        "tipo": tipo, "pieza": k})
        self.palabras = []

    def mapear(self, t):
        """Tiempo del original -> tiempo del montaje (None si cae en un tramo cortado)."""
        for p in self.piezas:
            a, b = p["src"]
            if a - 0.12 <= t <= b + 0.04:
                return p["out"] + min(max(t - a, 0), b - a)
        return None

    def cargar_palabras(self, palabras):
        for i, p in enumerate(palabras):
            s = self.mapear(p["s"])
            if s is not None:
                self.palabras.append({"w": p["w"], "s": round(s, 3), "e": round(self.mapear(p["e"]), 3), "i": i,
                                      "hook": False})
        self.palabras.sort(key=lambda p: p["s"])

    def t_pal(self, w, n=0):
        return [p["s"] for p in self.palabras if p["w"].strip("¿?.,") == w][n]

    def primer_plano(self, tipo):
        return next(p["s"] for p in self.planos if p["tipo"] == tipo)

    def video_base(self, ff, fuente, destino):
        filtros, etiquetas = [], []
        for k, (a, b) in enumerate(self.edl):
            filtros.append(f"[0:v]trim=start={a:.4f}:end={b:.4f},setpts=PTS-STARTPTS[v{k}]")
            etiquetas.append(f"[v{k}]")
        filtros.append("".join(etiquetas) + f"concat=n={len(self.edl)}:v=1:a=0,fps={self.fps},"
                       "scale=1080:1920:flags=lanczos:in_range=full:out_range=tv," + GRADING + ",format=yuv420p[v]")
        subprocess.run([ff, "-y", "-loglevel", "error", "-i", str(fuente), "-filter_complex", ";".join(filtros),
                        "-map", "[v]", "-an", "-c:v", "libx264", "-preset", "medium", "-crf", "14", "-g", "15",
                        "-colorspace", "bt709", "-color_primaries", "bt709", "-color_trc", "bt709",
                        "-color_range", "tv", str(destino)], check=True)

    def voz(self, ff, fuente, destino):
        subprocess.run([ff, "-y", "-loglevel", "error", "-i", str(fuente), "-vn", "-ac", "1", "-ar", str(SR),
                        "-af", VOZ, "-c:a", "pcm_f32le", str(destino)], check=True)
        voz, _ = sf.read(destino)
        fade = int(0.008 * SR)
        trozos = []
        for a, b in self.edl:
            seg = voz[int(round(a * SR)): int(round(b * SR))].copy()
            seg[:fade] *= np.linspace(0, 1, fade)
            seg[-fade:] *= np.linspace(1, 0, fade)
            trozos.append(seg)
        return np.concatenate(trozos)

    def pista(self):
        return np.zeros(int(self.dur * SR) + SR * 2)

    def exportar(self, destino, escenas, eventos):
        json.dump({"duracion": self.dur, "fps": self.fps, "palabras": self.palabras, "escenas": escenas,
                   "planos": self.planos, "eventos": {k: round(v, 3) for k, v in eventos.items()},
                   "piezas": [{"s": round(p["out"], 3)} for p in self.piezas]},
                  open(destino, "w"), ensure_ascii=False, indent=1)


def poner(pista, x, t, g=1.0):
    i = max(int(t * SR), 0)
    if i < len(pista):
        pista[i:i + len(x)] += x[: len(pista) - i] * g


def escenas_desde(inicios, dur):
    """[(id, tiempo de la primera palabra)] -> escenas con s/e, arrancando un pelín antes de la palabra."""
    escenas = [{"id": n, "s": round(max(s - 0.05, 0), 3)} for n, s in inicios]
    for a, b in zip(escenas, escenas[1:]):
        a["e"] = b["s"]
    escenas[-1]["e"] = dur
    return escenas


# Música energética en tono mayor (C G Am F); la rejilla se re-fasa en cada escena para que el corte caiga en el beat
ACORDES = [[48, 60, 64, 67], [43, 55, 59, 62], [45, 57, 60, 64], [41, 53, 57, 60]]


def musica_energetica(n, escenas, intensidad, beat=0.5):
    """intensidad: id de escena -> (pad, kick, hats, bajo)."""
    musica = np.zeros(n)
    K, H = kick(), hat()
    for k, e in enumerate(escenas):
        p_, kk, hh, bb = intensidad[e["id"]]
        acorde = ACORDES[k % 4]
        if p_:
            poner(musica, pad([nota(m) for m in acorde], e["e"] - e["s"] + 0.3), e["s"])
        t = e["s"]
        while t < e["e"] - 0.05:
            if kk:
                poner(musica, K, t)
            if hh:
                poner(musica, H, t + beat / 2)
                poner(musica, H, t + beat * 0.75, 0.5)
            if bb:
                m = int(beat * 0.85 * SR)
                tt = np.arange(m) / SR
                poner(musica, np.sin(2 * np.pi * nota(acorde[0] - 12) * tt) * env(m, 0.01, 0.15) * 0.2, t)
            t += beat
    return lp(musica, 10000)
