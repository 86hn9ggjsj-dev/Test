"""Lectura (IMAP) y envío (SMTP) de correo. Funciona con Gmail usando una contraseña de aplicación."""

from __future__ import annotations

import email
import email.policy
import imaplib
import re
import smtplib
from email.header import decode_header, make_header
from email.message import EmailMessage
from email.utils import parseaddr

from .config import env, require


def _imap() -> imaplib.IMAP4_SSL:
    user, password = require("EMAIL_USUARIO", "EMAIL_PASSWORD")
    conn = imaplib.IMAP4_SSL(env("EMAIL_IMAP") or "imap.gmail.com")
    conn.login(user, password)
    conn.select("INBOX", readonly=True)  # solo lectura: no marca nada como leído
    return conn


def _decode(value: str | None) -> str:
    return str(make_header(decode_header(value))) if value else ""


def _body(msg: email.message.EmailMessage, limit: int = 1500) -> str:
    part = msg.get_body(preferencelist=("plain", "html"))
    if part is None:
        return ""
    try:
        text = part.get_content()
    except (LookupError, UnicodeDecodeError):
        return ""
    if part.get_content_type() == "text/html":
        text = re.sub(r"<[^>]+>", " ", text)
    text = " ".join(text.split())
    return text[:limit] + ("…" if len(text) > limit else "")


def leer(solo_no_leidos: bool = True, maximo: int = 10, desde_uid: int = 0) -> list[dict]:
    """Devuelve los correos más recientes de la bandeja de entrada (más nuevo primero)."""
    conn = _imap()
    try:
        criterio = "UNSEEN" if solo_no_leidos else "ALL"
        if desde_uid:
            criterio = f"(UID {desde_uid + 1}:* {criterio})"
        _, data = conn.uid("search", None, criterio)
        uids = [int(u) for u in data[0].split() if int(u) > desde_uid][-maximo:]
        correos = []
        for uid in reversed(uids):
            _, msg_data = conn.uid("fetch", str(uid), "(BODY.PEEK[])")
            raw = next((p[1] for p in msg_data if isinstance(p, tuple)), None)
            if raw is None:
                continue
            msg = email.message_from_bytes(raw, policy=email.policy.default)
            correos.append({
                "uid": uid,
                "de": _decode(msg["From"]),
                "asunto": _decode(msg["Subject"]),
                "fecha": msg["Date"],
                "texto": _body(msg),
            })
        return correos
    finally:
        conn.logout()


def ultimo_uid() -> int:
    conn = _imap()
    try:
        _, data = conn.uid("search", None, "ALL")
        uids = data[0].split()
        return int(uids[-1]) if uids else 0
    finally:
        conn.logout()


def enviar(para: str, asunto: str, cuerpo: str) -> None:
    user, password = require("EMAIL_USUARIO", "EMAIL_PASSWORD")
    if "@" not in parseaddr(para)[1]:
        raise ValueError(f"Dirección no válida: {para}")
    msg = EmailMessage()
    msg["From"], msg["To"], msg["Subject"] = user, para, asunto
    msg.set_content(cuerpo)
    with smtplib.SMTP_SSL(env("EMAIL_SMTP") or "smtp.gmail.com", 465) as smtp:
        smtp.login(user, password)
        smtp.send_message(msg)

