"""Asistente de configuración: guía paso a paso, comprueba cada clave y la guarda en .env."""

from __future__ import annotations

import getpass
import os
import time
import webbrowser

from .config import ENV_FILE


def _leer_env() -> dict[str, str]:
    valores: dict[str, str] = {}
    if ENV_FILE.exists():
        for linea in ENV_FILE.read_text(encoding="utf-8").splitlines():
            if "=" in linea and not linea.lstrip().startswith("#"):
                k, v = linea.split("=", 1)
                valores[k.strip()] = v.strip()
    return valores


def _guardar_env(valores: dict[str, str]) -> None:
    lineas = ["# Configuración de Jarvis (generada por el asistente). No la compartas con nadie."]
    lineas += [f"{k}={v}" for k, v in valores.items() if v]
    ENV_FILE.write_text("\n".join(lineas) + "\n", encoding="utf-8")
    try:
        ENV_FILE.chmod(0o600)
    except OSError:
        pass
    for k, v in valores.items():
        if v:
            os.environ[k] = v


def _si(pregunta: str, por_defecto: bool = True) -> bool:
    opciones = "[S/n]" if por_defecto else "[s/N]"
    r = input(f"{pregunta} {opciones} ").strip().lower()
    return por_defecto if not r else r in ("s", "si", "sí", "y", "yes")


def _abrir(url: str) -> None:
    print(f"   Abriendo {url}")
    try:
        webbrowser.open(url)
    except Exception:
        pass


def _titulo(texto: str) -> None:
    print(f"\n{'─' * 60}\n{texto}\n{'─' * 60}")


# ---------------------------------------------------------------- pasos --

def _paso_anthropic(env: dict[str, str]) -> None:
    import anthropic

    _titulo("1/3  Cerebro de Jarvis (Claude) — obligatorio")
    if env.get("ANTHROPIC_API_KEY") and not _si("Ya hay una clave guardada. ¿Cambiarla?", False):
        return
    print("""
   Necesitas una clave de la API de Claude:
     1. Inicia sesión (o crea una cuenta) en la página que se va a abrir.
     2. Añade saldo en "Billing" (es de pago por uso; con 5 € tienes para empezar).
     3. Pulsa "Create Key", ponle de nombre "Jarvis" y copia la clave (empieza por sk-ant-).""")
    _abrir("https://console.anthropic.com/settings/keys")
    while True:
        clave = getpass.getpass("\n   Pega aquí la clave (no se verá al pegar) y pulsa Enter: ").strip()
        if not clave:
            continue
        print("   Comprobando…")
        try:
            anthropic.Anthropic(api_key=clave).models.list(limit=1)
        except anthropic.AuthenticationError:
            print("   ✗ Esa clave no es válida. Cópiala de nuevo.")
            continue
        except anthropic.APIConnectionError:
            print("   ✗ No hay conexión a internet. Revísala y vuelve a pegar la clave.")
            continue
        except anthropic.APIStatusError as e:
            print(f"   (Aviso: la API respondió {e.status_code}, la guardo igualmente.)")
        env["ANTHROPIC_API_KEY"] = clave
        _guardar_env(env)
        print("   ✓ Clave correcta y guardada.")
        return


def _paso_correo(env: dict[str, str]) -> None:
    import imaplib

    _titulo("2/3  Correo (Gmail) — opcional")
    if not _si("¿Quieres que Jarvis lea y envíe tu correo de Gmail?"):
        return
    print("""
   Google exige una "contraseña de aplicación" (no es tu contraseña normal):
     1. En la página que se va a abrir, si te lo pide, activa la verificación en dos pasos.
     2. Escribe "Jarvis" como nombre de la aplicación y pulsa "Crear".
     3. Copia la contraseña de 16 letras que aparece.""")
    _abrir("https://myaccount.google.com/apppasswords")
    while True:
        usuario = input("\n   Tu dirección de Gmail: ").strip()
        password = getpass.getpass("   Contraseña de aplicación (no se verá al pegar): ").replace(" ", "")
        print("   Comprobando…")
        try:
            conn = imaplib.IMAP4_SSL(env.get("EMAIL_IMAP") or "imap.gmail.com", timeout=30)
            conn.login(usuario, password)
            conn.logout()
        except imaplib.IMAP4.error:
            print("   ✗ Google no acepta ese usuario o contraseña.")
            if not _si("   ¿Probar otra vez?"):
                return
            continue
        except OSError as e:
            print(f"   ✗ No pude conectar con Gmail ({e}).")
            if not _si("   ¿Probar otra vez?"):
                return
            continue
        env["EMAIL_USUARIO"], env["EMAIL_PASSWORD"] = usuario, password
        _guardar_env(env)
        print("   ✓ Correo conectado y guardado.")
        return


def _paso_telegram(env: dict[str, str]) -> None:
    from . import avisos

    _titulo("3/3  Avisos al móvil (Telegram) — opcional")
    if not _si("¿Quieres que Jarvis te avise al móvil por Telegram?"):
        return
    print("""
   Vas a crear tu propio bot de Telegram (gratis, 1 minuto):
     1. Instala Telegram en el móvil si no lo tienes.
     2. Se abrirá un chat con @BotFather: pulsa "Iniciar" y envíale /newbot
     3. Te pedirá un nombre (p. ej. Jarvis) y un usuario que acabe en "bot" (p. ej. jarvis_casa_bot).
     4. Te responderá con un token largo (algo como 123456:ABC-DEF...). Cópialo.""")
    _abrir("https://t.me/BotFather")
    while True:
        token = getpass.getpass("\n   Pega aquí el token del bot (no se verá al pegar): ").strip()
        os.environ["TELEGRAM_TOKEN"] = token
        try:
            bot = avisos._api("getMe")
            break
        except Exception:
            print("   ✗ Ese token no es válido.")
            if not _si("   ¿Probar otra vez?"):
                return
    env["TELEGRAM_TOKEN"] = token
    _guardar_env(env)
    print(f"   ✓ Bot @{bot['username']} conectado.")
    print("\n   Ahora abre tu bot en Telegram, pulsa \"Iniciar\" y escríbele cualquier cosa (p. ej. hola).")
    _abrir(f"https://t.me/{bot['username']}")
    print("   Esperando tu mensaje (hasta 3 minutos)…")
    fin = time.time() + 180
    while time.time() < fin:
        try:
            chats = avisos.buscar_chat_id()
        except Exception:
            chats = []
        if chats:
            chat_id, nombre = chats[-1]
            env["TELEGRAM_CHAT_ID"] = str(chat_id)
            _guardar_env(env)
            avisos.telegram(f"Hola {nombre}, soy Jarvis. A partir de ahora te avisaré por aquí. 🤖")
            print("   ✓ ¡Recibido! Te acabo de mandar un mensaje de prueba a Telegram.")
            return
        time.sleep(3)
    print("   ✗ No llegó ningún mensaje. Puedes repetir este paso con: python -m jarvis --configurar")


def configurar() -> None:
    print("\n🤖  Bienvenido. Vamos a dejar a Jarvis listo en unos minutos.")
    print("    Las claves se guardan solo en tu ordenador, en:", ENV_FILE)
    env = _leer_env()
    try:
        _paso_anthropic(env)
        _paso_correo(env)
        _paso_telegram(env)
    except (KeyboardInterrupt, EOFError):
        print("\n\nConfiguración interrumpida. Lo guardado hasta ahora se conserva.")
        return
    print(f"""
{'═' * 60}
✅  ¡Listo! Jarvis está configurado.

   Hablar con Jarvis:      iniciar  (o: python -m jarvis)
   Hablarle con la voz:    iniciar --voz
   Modo vigilancia:        iniciar --vigilar
   Cambiar la configuración: iniciar --configurar
{'═' * 60}""")
