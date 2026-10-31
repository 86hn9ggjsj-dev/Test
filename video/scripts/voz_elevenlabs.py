"""Voz en off del guion con ElevenLabs -> input/<video>_voz.mp3

Uso:  ELEVENLABS_API_KEY=... python scripts/voz_elevenlabs.py [--video explica|prueba] [--voz VOICE_ID|matilda|sarah|…] [--modelo eleven_v3]

Por defecto: voz George (masculina, suave y cálida) con el modelo eleven_v3 y la indicación de acento castellano
en cada párrafo. Medido con palabras de c/z frente a s, distinguen como en España George y Matilda (voz femenina);
con eleven_multilingual_v2 o sin la indicación, las voces predeterminadas sesean.
Después: python scripts/<video>.py <ffmpeg>  (detecta el mp3 y resincroniza subtítulos, animaciones y mezcla)

Sin --voz (ni ELEVENLABS_VOICE_ID) busca en la biblioteca de voces compartidas una voz femenina en español de
España, conversacional y cercana (como una asistente: amable, clara y tranquila), la añade a tu cuenta y la usa.
El guion se envía entero en una sola petición (un párrafo por pantalla) para que la entonación fluya entre frases;
los ajustes priorizan un tono estable y natural, con algo de calidez, sin dramatizar.
"""
import argparse
import hashlib
import importlib
import json
import os
import ssl
import sys
import urllib.error
import urllib.parse
import urllib.request
from pathlib import Path

API = "https://api.elevenlabs.io/v1"
RAIZ = Path(__file__).resolve().parent.parent
CLAVE = os.environ.get("ELEVENLABS_API_KEY", "")
CTX = ssl.create_default_context(cafile=os.environ.get("SSL_CERT_FILE") or None)

# Palabras que delatan una voz de España y un timbre suave en la ficha de la voz
ESPANA = ("spain", "spanish (spain)", "castilian", "peninsular", "españa", "european spanish", "madrid")
SUAVE = ("soft", "calm", "warm", "gentle", "sweet", "soothing", "suave", "dulce", "cálida", "tranquila", "natural")
# Voces predeterminadas de ElevenLabs (las únicas que el plan gratuito permite usar por API)
PREDETERMINADAS = {"sarah": "EXAVITQu4vr4xnSDxMaL", "matilda": "XrExE9yKIg1WjnnlVkGX", "jessica": "cgSgspJ2msm6clMCkdW9",
                   "alice": "Xb7hH8MSUJpSbSDYk0k2", "lily": "pFZP5JQG7iQjIQuC4Bku", "laura": "FGY2WhTYpPnrIDTdsKH5",
                   "george": "JBFqnCBsd6RMkjVDRZzb", "daniel": "onwK4e9ZLuTAKqWW03F9", "eric": "cjVigY5qzO86Huf0OWal",
                   "will": "bIHbv24MWmeRgasZH58o", "brian": "nPczCjzI2devNBz1zQrb", "river": "SAz9YHcvj6GT2YYXdXww"}
ASISTENTE = ("assistant", "asistente", "conversational", "friendly", "clear", "helpful", "cercana", "amable", "clara")


def pide(metodo, ruta, cuerpo=None, binario=False):
    datos = json.dumps(cuerpo).encode() if cuerpo is not None else None
    req = urllib.request.Request(f"{API}{ruta}", data=datos, method=metodo,
                                 headers={"xi-api-key": CLAVE, "Content-Type": "application/json", "Accept": "*/*"})
    try:
        with urllib.request.urlopen(req, context=CTX, timeout=120) as r:
            contenido = r.read()
    except urllib.error.HTTPError as e:
        print(f"ElevenLabs {e.code} en {ruta.split('?')[0]}: {e.read().decode(errors='replace')[:300]}", file=sys.stderr)
        raise
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
    ap.add_argument("--video", default="explica", choices=("explica", "prueba", "errores", "cifras", "estafa", "newton", "perdidas", "tortugas", "acierto", "unoporciento", "stop", "apalancamiento", "cincuenta", "cazastop", "venganza", "tamano", "ganapierde", "nueve", "broker", "unodiario", "rachas", "regla72", "media", "ahorro", "promediar", "miedo"), help="guion a locutar (scripts/guion_<video>.py)")
    ap.add_argument("--voz", default=os.environ.get("ELEVENLABS_VOICE_ID") or "george")
    ap.add_argument("--modelo", default="eleven_v3")
    ap.add_argument("--velocidad", type=float, default=1.08)
    ap.add_argument("--sin-gestos", action="store_true", help="con eleven_v3, guion sin gestos entre corchetes")
    ap.add_argument("--forzar", action="store_true", help="genera aunque no haya cambios (gasta créditos)")
    ap.add_argument("--acento", default="con acento castellano de España, voz masculina suave, cálida y cercana")
    args = ap.parse_args()
    guion = importlib.import_module(f"guion_{args.video}")
    if not CLAVE:
        sys.exit("Falta ELEVENLABS_API_KEY en el entorno")
    voz = PREDETERMINADAS.get((args.voz or "").lower(), args.voz)
    if not voz:
        try:
            voz = busca_voz()
        except urllib.error.HTTPError as e:
            # Clave sin permiso para la biblioteca (o plan gratuito): voz predeterminada cálida y tranquila
            print(f"sin acceso a la biblioteca de voces ({e.code}); uso la voz predeterminada Sarah")
            voz = PREDETERMINADAS["sarah"]
    # El modelo v3 acepta indicaciones entre corchetes (no se leen): se repite en cada párrafo para que el
    # acento castellano (distinción de c/z y s) no se diluya a lo largo de la locución
    v3 = args.modelo == "eleven_v3"
    etiqueta = f"[{args.acento}] " if v3 and args.acento else ""
    # Con v3, cada párrafo lleva sus gestos (risas, suspiros, pausas, susurros); v2 leería las etiquetas
    parrafo = (lambda id_, frases: guion.GESTOS[id_]) if v3 and not args.sin_gestos else (lambda id_, frases: " ".join(frases))
    texto = "\n\n".join(etiqueta + parrafo(id_, frases) for id_, frases in guion.GUION)
    # v3 solo admite estabilidad 0 (creativa), 0,5 (natural) o 1 (robusta)
    ajustes = ({"stability": 0.5, "similarity_boost": 0.8, "use_speaker_boost": True, "speed": args.velocidad} if args.modelo == "eleven_v3"
               else {"stability": 0.55, "similarity_boost": 0.8, "style": 0.15, "use_speaker_boost": True, "speed": args.velocidad})
    peticion = {"text": texto, "model_id": args.modelo, "voice_settings": ajustes}
    # Para no gastar créditos: si ya existe una locución de este mismo guion, voz y ajustes, se reutiliza
    destino = RAIZ / f"input/{args.video}_voz.mp3"
    firma_ruta = destino.with_suffix(".firma")
    firma = hashlib.sha256(json.dumps({"voz": voz, **peticion}, sort_keys=True).encode()).hexdigest()
    if destino.exists() and firma_ruta.exists() and firma_ruta.read_text() == firma and not args.forzar:
        print(f"sin cambios en guion, voz ni ajustes: reutilizo {destino} (0 créditos)")
        return
    audio = pide("POST", f"/text-to-speech/{voz}?output_format=mp3_44100_128", peticion, binario=True)
    destino.parent.mkdir(exist_ok=True)
    destino.write_bytes(audio)
    firma_ruta.write_text(firma)
    print(f"voz guardada en {destino} ({len(audio) // 1024} KB) con la voz {voz}")


if __name__ == "__main__":
    main()
