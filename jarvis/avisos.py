"""Avisos al usuario por llamada telefónica y WhatsApp, a través de Twilio."""

from __future__ import annotations

from xml.sax.saxutils import escape

from .config import env, require


def _client():
    from twilio.rest import Client

    return Client(env("TWILIO_ACCOUNT_SID"), env("TWILIO_AUTH_TOKEN"))


def llamar(mensaje: str) -> str:
    """Llama al teléfono del usuario y le lee el mensaje en voz alta (dos veces)."""
    _, _, origen, destino = require(
        "TWILIO_ACCOUNT_SID", "TWILIO_AUTH_TOKEN", "TWILIO_NUMERO", "MI_TELEFONO"
    )
    texto = escape(mensaje)
    twiml = (
        "<Response>"
        f'<Say language="es-ES" voice="Polly.Lucia">Hola, soy Jarvis. {texto}</Say>'
        '<Pause length="1"/>'
        f'<Say language="es-ES" voice="Polly.Lucia">Repito. {texto}</Say>'
        "</Response>"
    )
    call = _client().calls.create(twiml=twiml, to=destino, from_=origen)
    return call.sid


def whatsapp(mensaje: str) -> str:
    """Envía un WhatsApp al usuario."""
    *_, destino = require("TWILIO_ACCOUNT_SID", "TWILIO_AUTH_TOKEN", "MI_TELEFONO")
    origen = env("TWILIO_WHATSAPP") or "+14155238886"  # número del sandbox de Twilio
    msg = _client().messages.create(
        from_=f"whatsapp:{origen.removeprefix('whatsapp:')}",
        to=f"whatsapp:{destino}",
        body=mensaje[:1500],
    )
    return msg.sid
