# J.A.R.V.I.S.

Asistente personal al estilo del de Tony Stark, hecho con la API de Claude (`claude-opus-5`).
Hablas con él por texto o por voz, y en modo vigilancia está atento al mercado y a tu correo
y **te avisa al móvil por Telegram** cuando pasa algo.

## Cómo funciona

```
 Tú (texto o voz) ──► Jarvis ──► Claude (el "cerebro", en internet)
                        │            │
                        │            └─ decide qué herramienta usar
                        ▼
      Herramientas en tu ordenador: mercado, correo, memoria, web,
      comandos, avisos por Telegram
```

1. Le escribes o le hablas.
2. Jarvis manda tu mensaje a Claude, que decide si necesita alguna herramienta
   (mirar un precio, leer tu correo, buscar en internet…).
3. Jarvis ejecuta esa herramienta **en tu ordenador** y le pasa el resultado a Claude.
4. Claude redacta la respuesta y Jarvis te la muestra (o te la dice en voz alta).

El **modo vigilancia** es un segundo programa que se queda en marcha y, cada 5 minutos,
revisa tus alertas de precio y tus correos nuevos. Si algo importa, te manda un Telegram.

## Qué sabe hacer

| Función | Coste |
|---|---|
| Conversar, fecha y hora, buscar en internet, abrir webs | API de Claude (de pago por uso) |
| Memoria entre sesiones ("Jarvis, recuerda que…") | Gratis |
| Ejecutar comandos en tu equipo (siempre te pide permiso) | Gratis |
| **Mercado**: acciones, índices, cripto y divisas; alertas de precio | Gratis (Yahoo Finance) |
| **Correo**: leer tu bandeja, resumirla, enviar correos (con tu confirmación) | Gratis (Gmail) |
| **Avisos al móvil** por Telegram | Gratis |
| Hablar y escucharte | Gratis |

### Modo vigilancia

Arráncalo con `iniciar --vigilar`. Cada 5 minutos (ajustable con `--minutos`):

- **Alertas de precio**: si se cumple una ("avísame si el Bitcoin baja de 80.000"), te llega un Telegram.
- **Correo nuevo**: Claude lo lee y lo clasifica. Si es importante te llega un Telegram con el resumen;
  si es urgente (seguridad, pagos, familia, algo que caduca hoy…) va marcado con 🚨. La publicidad la ignora.

Déjalo corriendo en un ordenador que esté siempre encendido.

### Lo que no puede hacer

- **Llamarte ni enviarte WhatsApps**: requiere servicios de pago, así que se ha dejado fuera.
- **Leer tus chats de Instagram o WhatsApp**: Meta no lo permite para cuentas personales, y las
  herramientas no oficiales pueden hacer que te bloqueen la cuenta.

## Instalación (fácil)

1. Instala **Python 3** desde https://www.python.org/downloads/
   (en Windows, marca la casilla **"Add Python to PATH"**).
2. Descarga este proyecto (botón verde **Code → Download ZIP** en GitHub) y descomprímelo.
3. Ejecuta el instalador:
   - **Windows**: doble clic en `instalar.bat`
   - **Mac / Linux**: abre una terminal en la carpeta y escribe `bash instalar.sh`

El instalador lo prepara todo y abre un **asistente** que te guía paso a paso: abre cada página
que hace falta, te pide que pegues la clave, comprueba que funciona y la guarda. Solo la clave
de Claude es obligatoria; el correo y Telegram puedes saltártelos y configurarlos más tarde con
`iniciar --configurar`.

<details>
<summary>Instalación manual</summary>

```bash
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
python -m jarvis --configurar      # o copia .env.example como .env y rellénalo a mano
```
</details>

## Uso

| | Windows | Mac / Linux |
|---|---|---|
| Hablar con Jarvis | doble clic en `iniciar.bat` | `./iniciar.sh` |
| Hablarle con la voz | `iniciar.bat --voz` | `./iniciar.sh --voz` |
| Modo vigilancia | `iniciar.bat --vigilar` | `./iniciar.sh --vigilar` |
| Cambiar la configuración | `iniciar.bat --configurar` | `./iniciar.sh --configurar` |

Ejemplos de cosas que puedes pedirle:

- "¿Cómo va el IBEX hoy? ¿Y Tesla y el Bitcoin?"
- "Avísame si Apple sube por encima de 350 dólares."
- "¿Tengo correos importantes sin leer? Resúmemelos."
- "Contesta a Laura diciéndole que el jueves me va bien."
- "Recuerda que el seguro del coche vence el 15 de marzo."
- "Mándame al móvil el resumen de mis correos."

Para el modo voz: `pip install -r requirements-voz.txt`. En Linux puede que necesites antes
`sudo apt install portaudio19-dev espeak`; en macOS, `brew install portaudio`.

## Notas

- Tus datos (memoria, alertas, estado de la vigilancia) se guardan en `~/.jarvis/`.
- Jarvis nunca envía correos ni ejecuta comandos sin preguntarte antes.
- Si el modelo principal rechaza una petición, la API reintenta automáticamente con un modelo alternativo.

## Vídeos con Remotion

En la carpeta `video/` hay un proyecto de [Remotion](https://www.remotion.dev/) para crear
vídeos con React. Necesita **Node.js 18 o superior**.

```bash
cd video
npm install        # solo la primera vez
npm run dev        # abre Remotion Studio en el navegador
npm run render     # genera out/intro.mp4
```

Las composiciones se registran en `video/src/Root.tsx`.
