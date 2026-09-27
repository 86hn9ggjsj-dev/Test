# J.A.R.V.I.S.

Asistente personal al estilo del de Tony Stark, hecho con la API de Claude (`claude-opus-5`).
Hablas con él por texto o por voz, y en modo vigilancia está atento al mercado y a tu correo
y **te llama o te escribe por WhatsApp** cuando pasa algo.

## Qué sabe hacer

| Función | Qué necesita |
|---|---|
| Conversar, fecha y hora, buscar en internet, abrir webs | Solo la clave de Anthropic |
| Memoria entre sesiones ("Jarvis, recuerda que…") | Nada más |
| Ejecutar comandos en tu equipo (siempre te pide permiso) | Nada más |
| **Mercado**: cotizaciones de acciones, índices, cripto y divisas; alertas de precio | Nada más (Yahoo Finance, gratis) |
| **Correo**: leer tu bandeja, resumirla, enviar correos (con tu confirmación) | Gmail + contraseña de aplicación |
| **Llamarte** por teléfono | Cuenta de Twilio |
| **Escribirte por WhatsApp** | Cuenta de Twilio |
| Hablar y escucharte | Dependencias de voz |

### Modo vigilancia

```bash
python -m jarvis --vigilar
```

Cada 5 minutos (ajustable con `--minutos`):

- **Alertas de precio**: si se cumple una ("avísame si el Bitcoin baja de 80.000"), te **llama** y te manda un **WhatsApp**.
- **Correo nuevo**: Claude lo lee y lo clasifica. Si es importante, te llega un WhatsApp con el resumen. Si es urgente (seguridad, pagos, familia, algo que caduca hoy…), además **te llama**. La publicidad la ignora.

Déjalo corriendo en un ordenador que esté siempre encendido (o en un servidor/Raspberry Pi).

### ¿Y los mensajes de Instagram y WhatsApp?

Jarvis **no puede leer tus chats privados** de Instagram ni de WhatsApp: Meta no ofrece ninguna
forma oficial de hacerlo para cuentas personales, y las herramientas no oficiales incumplen sus
condiciones y pueden hacer que te bloqueen la cuenta. Lo que sí hace es **enviarte** WhatsApps a ti.
Si tienes una cuenta de empresa (Instagram Business o WhatsApp Business), esto sí se podría
conectar con las APIs oficiales de Meta.

## Instalación

```bash
python -m venv .venv && source .venv/bin/activate   # opcional
pip install -r requirements.txt
cp .env.example .env                                # y rellénalo
```

### Configuración (`.env`)

1. **Anthropic** (obligatorio): crea una clave en https://console.anthropic.com y ponla en `ANTHROPIC_API_KEY`.
2. **Correo (Gmail)**: activa la verificación en dos pasos y crea una contraseña de aplicación en
   https://myaccount.google.com/apppasswords. Pon tu correo en `EMAIL_USUARIO` y esa contraseña en `EMAIL_PASSWORD`.
3. **Llamadas y WhatsApp (Twilio)**:
   - Crea una cuenta en https://www.twilio.com y copia `Account SID` y `Auth Token`.
   - Compra un número con voz (unos 1–2 €/mes) y ponlo en `TWILIO_NUMERO`.
   - Pon tu móvil en `MI_TELEFONO` con prefijo internacional (p. ej. `+34600123456`).
   - WhatsApp: en la consola de Twilio entra en *Messaging → Try it out → Send a WhatsApp message*
     y envía desde tu móvil el código `join …` que te indique al número del sandbox.
   - En cuentas de prueba de Twilio, verifica tu móvil en *Verified Caller IDs*.

## Uso

```bash
python -m jarvis              # conversar por texto
python -m jarvis --voz        # conversar por voz
python -m jarvis --vigilar    # modo vigilancia
```

Ejemplos de cosas que puedes pedirle:

- "¿Cómo va el IBEX hoy? ¿Y Tesla y el Bitcoin?"
- "Avísame si Apple sube por encima de 350 dólares."
- "¿Tengo correos importantes sin leer? Resúmemelos."
- "Contesta a Laura diciéndole que el jueves me va bien."
- "Recuerda que el seguro del coche vence el 15 de marzo."
- "Llámame y dime la lista de la compra." / "Mándame por WhatsApp el resumen de mis correos."

Para el modo voz: `pip install -r requirements-voz.txt`. En Linux puede que necesites antes
`sudo apt install portaudio19-dev espeak`; en macOS, `brew install portaudio`.

## Notas

- Tus datos (memoria, alertas, estado de la vigilancia) se guardan en `~/.jarvis/`.
- Jarvis nunca envía correos ni ejecuta comandos sin preguntarte antes.
- Si el modelo principal rechaza una petición, la API reintenta automáticamente con un modelo alternativo.
- Costes aproximados: la API de Claude se paga por uso; Twilio cobra el número y cada llamada/mensaje.
