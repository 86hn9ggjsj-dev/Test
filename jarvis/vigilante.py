"""Modo vigilancia: revisa el mercado y el correo cada cierto tiempo y avisa al usuario.

- Alerta de precio disparada  -> mensaje de Telegram.
- Correo nuevo                -> Claude lo clasifica; si es importante o urgente,
                                 mensaje de Telegram con el resumen.
"""

from __future__ import annotations

import datetime as dt
import json
import time

import anthropic

from . import almacen, avisos, correo, mercado
from .config import MODEL, NotConfigured

TRIAGE_SCHEMA = {
    "type": "object",
    "properties": {
        "correos": {
            "type": "array",
            "items": {
                "type": "object",
                "properties": {
                    "uid": {"type": "integer"},
                    "nivel": {"type": "string", "enum": ["ignorar", "importante", "urgente"]},
                    "resumen": {"type": "string"},
                },
                "required": ["uid", "nivel", "resumen"],
                "additionalProperties": False,
            },
        }
    },
    "required": ["correos"],
    "additionalProperties": False,
}

TRIAGE_PROMPT = """Eres Jarvis, el asistente personal del usuario. Clasifica cada correo nuevo:
- "urgente": requiere atención inmediata (seguridad de cuentas, pagos o cargos inesperados, \
familia o salud, citas de hoy, algo que caduca en horas).
- "importante": personal o de trabajo y merece que lo sepa pronto.
- "ignorar": publicidad, newsletters, notificaciones automáticas rutinarias.
Para cada uno escribe un resumen de una frase, en español, pensado para leerse en voz alta."""


def _log(msg: str) -> None:
    print(f"[{dt.datetime.now():%H:%M:%S}] {msg}", flush=True)


def _notify(texto: str) -> None:
    try:
        avisos.telegram(texto)
        _log("Aviso enviado por Telegram.")
    except NotConfigured as e:
        _log(f"(sin Telegram) {e}")
    except Exception as e:  # un fallo de Telegram no debe parar la vigilancia
        _log(f"Error enviando por Telegram: {e}")


def _check_market() -> None:
    for alerta, c in mercado.revisar_alertas():
        signo = "por encima de" if alerta["condicion"] == "mayor" else "por debajo de"
        texto = (
            f"📈 Alerta de mercado: {c['simbolo']} está a {c['precio']} {c['moneda']}, "
            f"{signo} {alerta['precio']}. Variación del día: {c['variacion_pct']}%."
        )
        _log(texto)
        _notify(texto)


def _triage(client: anthropic.Anthropic, correos: list[dict]) -> list[dict]:
    response = client.messages.create(
        model=MODEL,
        max_tokens=16000,
        system=TRIAGE_PROMPT,
        output_config={"effort": "low", "format": {"type": "json_schema", "schema": TRIAGE_SCHEMA}},
        messages=[{"role": "user", "content": json.dumps(correos, ensure_ascii=False)}],
    )
    if response.stop_reason in ("refusal", "max_tokens"):
        return []
    text = next((b.text for b in response.content if b.type == "text"), "{}")
    return json.loads(text).get("correos", [])


def _check_email(client: anthropic.Anthropic) -> None:
    estado = almacen.load("vigilante", {})
    if "ultimo_uid" not in estado:
        # Primera vez: empezamos desde ahora, sin avisar de todo lo antiguo.
        estado["ultimo_uid"] = correo.ultimo_uid()
        almacen.save("vigilante", estado)
        _log("Correo conectado. Avisaré de los correos que lleguen a partir de ahora.")
        return

    nuevos = correo.leer(solo_no_leidos=False, maximo=20, desde_uid=estado["ultimo_uid"])
    if not nuevos:
        return
    _log(f"{len(nuevos)} correo(s) nuevo(s).")
    clasificados = _triage(client, nuevos)
    estado["ultimo_uid"] = max(c["uid"] for c in nuevos)
    almacen.save("vigilante", estado)

    relevantes = [c for c in clasificados if c["nivel"] != "ignorar"]
    if not relevantes:
        return
    lineas = [f"{'🚨' if c['nivel'] == 'urgente' else '•'} {c['resumen']}" for c in relevantes]
    texto = "📧 Correo nuevo:\n" + "\n".join(lineas)
    _log(texto)
    _notify(texto)


def vigilar(minutos: float = 5) -> None:
    client = anthropic.Anthropic()
    _log(f"Modo vigilancia activo: reviso mercado y correo cada {minutos:g} min. Ctrl+C para salir.")
    email_activo = True
    while True:
        try:
            _check_market()
        except Exception as e:
            _log(f"Error revisando el mercado: {e}")
        if email_activo:
            try:
                _check_email(client)
            except NotConfigured as e:
                _log(f"Correo desactivado: {e}")
                email_activo = False
            except Exception as e:
                _log(f"Error revisando el correo: {e}")
        time.sleep(minutos * 60)
