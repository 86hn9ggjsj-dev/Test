"""Herramientas que Claude puede usar como Jarvis."""

from __future__ import annotations

import datetime as dt
import functools
import json
import subprocess
import webbrowser

from anthropic import beta_tool

from . import almacen, avisos, correo, mercado
from .config import NotConfigured


def _confirm(accion: str) -> bool:
    print(f"\n⚠️  Jarvis quiere {accion}")
    return input("   ¿Permitir? [s/N] ").strip().lower() in ("s", "si", "sí", "y", "yes")


def _safe(fn):
    """Convierte errores en texto para que Claude pueda explicárselos al usuario."""

    @functools.wraps(fn)
    def wrapper(*args, **kwargs):
        try:
            return fn(*args, **kwargs)
        except NotConfigured as e:
            return f"No configurado: {e}"
        except Exception as e:
            return f"Error: {type(e).__name__}: {e}"

    return wrapper


# ------------------------------------------------------------------ básicas --

@beta_tool
def obtener_fecha_hora() -> str:
    """Devuelve la fecha y hora local actuales del equipo del usuario."""
    return dt.datetime.now().astimezone().strftime("%A %d/%m/%Y, %H:%M:%S (%Z)")


@beta_tool
def abrir_web(url: str) -> str:
    """Abre una URL en el navegador predeterminado del usuario.

    Args:
        url: URL completa, incluyendo http:// o https://.
    """
    if not url.startswith(("http://", "https://")):
        return "Error: la URL debe empezar por http:// o https://."
    return "Abierta en el navegador." if webbrowser.open(url) else "No hay navegador disponible."


@beta_tool
def ejecutar_comando(comando: str) -> str:
    """Ejecuta un comando de shell en el equipo del usuario, previa confirmación suya.

    Args:
        comando: El comando exacto a ejecutar.
    """
    if not _confirm(f"ejecutar: {comando}"):
        return "El usuario ha denegado la ejecución."
    try:
        proc = subprocess.run(comando, shell=True, capture_output=True, text=True, timeout=60)
    except subprocess.TimeoutExpired:
        return "Error: el comando superó el límite de 60 segundos."
    out = (proc.stdout + proc.stderr).strip() or "(sin salida)"
    if len(out) > 8000:
        out = out[:8000] + "\n...(salida recortada a 8000 caracteres)"
    return f"Código de salida {proc.returncode}\n{out}"


# ------------------------------------------------------------------ memoria --

@beta_tool
def recordar(dato: str) -> str:
    """Guarda un dato en la memoria persistente de Jarvis para futuras conversaciones.

    Args:
        dato: El dato a recordar, redactado de forma autocontenida.
    """
    items = almacen.load("memoria", [])
    nuevo_id = max((i["id"] for i in items), default=0) + 1
    items.append({"id": nuevo_id, "dato": dato,
                  "fecha": dt.datetime.now().isoformat(timespec="minutes")})
    almacen.save("memoria", items)
    return f"Guardado con id {nuevo_id}."


@beta_tool
def consultar_memoria() -> str:
    """Devuelve todos los datos guardados en la memoria persistente de Jarvis."""
    items = almacen.load("memoria", [])
    if not items:
        return "La memoria está vacía."
    return "\n".join(f"[{i['id']}] ({i['fecha']}) {i['dato']}" for i in items)


@beta_tool
def olvidar(id: int) -> str:
    """Borra un dato de la memoria persistente.

    Args:
        id: Identificador del dato, tal como aparece en consultar_memoria.
    """
    items = almacen.load("memoria", [])
    restantes = [i for i in items if i["id"] != id]
    if len(restantes) == len(items):
        return f"No existe ningún dato con id {id}."
    almacen.save("memoria", restantes)
    return f"Dato {id} olvidado."


# ------------------------------------------------------------------ mercado --

@beta_tool
@_safe
def cotizacion(simbolos: list[str]) -> str:
    """Precio actual y variación del día de acciones, índices, criptomonedas o divisas.

    Args:
        simbolos: Símbolos de Yahoo Finance, p. ej. AAPL, TSLA, SAN.MC, ^IBEX, ^GSPC, BTC-USD, EURUSD=X.
    """
    resultados = []
    for s in simbolos[:15]:
        try:
            resultados.append(mercado.cotizacion(s))
        except Exception as e:
            resultados.append({"simbolo": s, "error": str(e)})
    return json.dumps(resultados, ensure_ascii=False)


@beta_tool
@_safe
def crear_alerta_mercado(simbolo: str, condicion: str, precio: float) -> str:
    """Crea una alerta de precio. Con el modo vigilancia activo, Jarvis llamará al usuario
    y le enviará un WhatsApp cuando se cumpla.

    Args:
        simbolo: Símbolo de Yahoo Finance (p. ej. AAPL, BTC-USD, ^IBEX).
        condicion: "mayor" (avisar si sube hasta el precio) o "menor" (si baja hasta él).
        precio: Precio objetivo, en la moneda del activo.
    """
    a = mercado.crear_alerta(simbolo, condicion, precio)
    return f"Alerta {a['id']} creada: {a['simbolo']} {a['condicion']} que {a['precio']}."


@beta_tool
def ver_alertas_mercado() -> str:
    """Lista las alertas de precio activas."""
    items = mercado.alertas()
    if not items:
        return "No hay alertas activas."
    return "\n".join(f"[{a['id']}] {a['simbolo']} {a['condicion']} que {a['precio']}" for a in items)


@beta_tool
def borrar_alerta_mercado(id: int) -> str:
    """Borra una alerta de precio.

    Args:
        id: Identificador de la alerta, tal como aparece en ver_alertas_mercado.
    """
    return "Alerta borrada." if mercado.borrar_alerta(id) else f"No existe la alerta {id}."


# ------------------------------------------------------------------- correo --

@beta_tool
@_safe
def leer_correos(solo_no_leidos: bool = True, maximo: int = 10) -> str:
    """Lee los correos más recientes de la bandeja de entrada del usuario (sin marcarlos como leídos).

    Args:
        solo_no_leidos: Si es true, solo devuelve los no leídos.
        maximo: Número máximo de correos a devolver (1-30).
    """
    correos = correo.leer(solo_no_leidos=solo_no_leidos, maximo=max(1, min(maximo, 30)))
    if not correos:
        return "No hay correos que coincidan."
    return json.dumps(correos, ensure_ascii=False)


@beta_tool
@_safe
def enviar_correo(para: str, asunto: str, cuerpo: str) -> str:
    """Envía un correo desde la cuenta del usuario, previa confirmación suya.

    Args:
        para: Dirección de correo del destinatario.
        asunto: Asunto del correo.
        cuerpo: Texto del correo.
    """
    print(f"\n--- Para: {para}\n--- Asunto: {asunto}\n{cuerpo}\n---")
    if not _confirm("enviar este correo"):
        return "El usuario ha cancelado el envío."
    correo.enviar(para, asunto, cuerpo)
    return "Correo enviado."


# ------------------------------------------------------------------- avisos --

@beta_tool
@_safe
def llamarme(mensaje: str) -> str:
    """Llama por teléfono al usuario y le lee un mensaje en voz alta.
    Úsalo solo si el usuario lo pide expresamente.

    Args:
        mensaje: Lo que Jarvis dirá en la llamada, breve y en español.
    """
    return f"Llamada iniciada ({avisos.llamar(mensaje)})."


@beta_tool
@_safe
def enviarme_whatsapp(mensaje: str) -> str:
    """Envía un WhatsApp al móvil del usuario (p. ej. un recordatorio o un resumen).

    Args:
        mensaje: Texto del mensaje.
    """
    return f"WhatsApp enviado ({avisos.whatsapp(mensaje)})."


TOOLS = [
    obtener_fecha_hora,
    abrir_web,
    ejecutar_comando,
    recordar,
    consultar_memoria,
    olvidar,
    cotizacion,
    crear_alerta_mercado,
    ver_alertas_mercado,
    borrar_alerta_mercado,
    leer_correos,
    enviar_correo,
    llamarme,
    enviarme_whatsapp,
    {"type": "web_search_20260209", "name": "web_search", "max_uses": 5},
]
