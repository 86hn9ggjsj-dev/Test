"""Voz en off del guion con ElevenLabs: voz femenina española con tono de asistente virtual -> input/explica_voz.mp3

Uso:  ELEVENLABS_API_KEY=... python scripts/voz_elevenlabs.py [--voz VOICE_ID] [--modelo eleven_multilingual_v2]
Después: python scripts/explica.py <ffmpeg>  (detecta el mp3 y resincroniza subtítulos, animaciones y mezcla)

Sin --voz (ni ELEVENLABS_VOICE_ID) busca en la biblioteca de voces compartidas una voz femenina en español de
España, conversacional y cercana (como una asistente: amable, clara y tranquila), la añade a tu cuenta y la usa.
El guion se envía entero en una sola petición (un párrafo por pantalla) para que la entonación fluya entre frases;
los ajustes priorizan un tono estable y natural, con algo de calidez, sin dramatizar.
"""
import argparse
import json
import os
import ssl
import sys
import urllib.parse
import urllib.request
from pathlib import Path

from guion_explica import GUION

API = "https://api.elevenlabs.io/v1"
RAIZ = Path(__file__).resolve().parent.parent
CLAVE = os.environ.get("ELEVENLABS_API_KEY", "")
CTX = ssl.create_default_context(cafile=os.environ.get("SSL_CERT_FILE") or None)

# Palabras que delatan una voz de España y un timbre suave en la ficha de la voz
ESPANA = ("spain", "spanish (spain)", "castilian", "peninsular", "españa", "european spanish", "madrid")
SUAVE = ("soft", "calm", "warm", "gentle", "sweet", "soothing", "suave", "dulce", "cálida", "tranquila", "natural")
ASISTENTE = ("assistant", "asistente", "conversational", "friendly", "clear", "helpful", "cercana", "amable", "clara")


def pide(metodo, ruta, cuerpo=None, binario=False):
    datos = json.dumps(cuerpo).encode() if cuerpo is not None else None
    req = urllib.request.Request(f"{API}{ruta}", data=datos, method=metodo,
                                 headers={"xi-api-key": CLAVE, "Content-Type": "application/json", "Accept": "*/*"})
    with urllib.request.urlopen(req, context=CTX, timeout=120) as r:
        contenido = r.read()
    return contenido if binario else json.loads(contenido)


def busca_voz():
    base = {"page_size": 100, "gender": "female", "language": "es", "sort": "trending"}
    # Primero las voces pensadas para conversación (asistentes); si no hay, cualquier voz femenina en español
    voces = pide("GET", "/shared-voices?" + urllib.parse.urlencode({**base, "use_cases": "conversational"})).get("voices", [])
    if not voces:
        voces = pide("GET", "/shared-voices?" + urllib.parse.urlencode(base)).get("voices", [])

    def puntos(v):
        ficha = " ".join(str(v.get(k, "")) for k in ("name", "accent", "description", "descriptive", "use_case", "locale")).lower()
        return 3 * any(p in ficha for p in ESPANA) + 2 * sum(p in ficha for p in ASISTENTE) + sum(p in ficha for p in SUAVE)

    voces.sort(key=puntos, reverse=True)
    if not voces:
        sys.exit("No encontré voces femeninas en español en la biblioteca; pasa una con --voz VOICE_ID")
    v = voces[0]
    print(f"voz elegida: {v.get('name')} · {v.get('accent')} · {v.get('description', '')[:80]}")
    nueva = pide("POST", f"/voices/add/{v['public_owner_id']}/{v['voice_id']}", {"new_name": f"Asistente · {v.get('name')}"})
    return nueva["voice_id"]


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--voz", default=os.environ.get("ELEVENLABS_VOICE_ID"))
    ap.add_argument("--modelo", default="eleven_multilingual_v2")
    args = ap.parse_args()
    if not CLAVE:
        sys.exit("Falta ELEVENLABS_API_KEY en el entorno")
    voz = args.voz or busca_voz()
    texto = "\n\n".join(" ".join(frases) for _, frases in GUION)
    audio = pide("POST", f"/text-to-speech/{voz}?output_format=mp3_44100_192", {
        "text": texto,
        "model_id": args.modelo,
        "language_code": "es",
        "voice_settings": {"stability": 0.55, "similarity_boost": 0.8, "style": 0.15, "use_speaker_boost": True, "speed": 1.0},
    }, binario=True)
    destino = RAIZ / "input/explica_voz.mp3"
    destino.parent.mkdir(exist_ok=True)
    destino.write_bytes(audio)
    print(f"voz guardada en {destino} ({len(audio) // 1024} KB) con la voz {voz}")


if __name__ == "__main__":
    main()
