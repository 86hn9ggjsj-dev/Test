# J.A.R.V.I.S.

Asistente personal de terminal al estilo del de Tony Stark, hecho con la API de Claude (`claude-opus-5`).

## Qué sabe hacer

- Conversar (recuerda el hilo de la sesión)
- Decir la fecha y la hora
- **Memoria persistente** entre sesiones (`~/.jarvis_memoria.json`): "Jarvis, recuerda que…"
- **Buscar en internet** información actual
- Abrir páginas web en tu navegador
- Ejecutar comandos en tu equipo (**siempre te pide confirmación antes**)
- Modo voz opcional: te escucha por el micro y te responde hablando

## Instalación

```bash
python -m venv .venv && source .venv/bin/activate   # opcional
pip install -r requirements.txt
export ANTHROPIC_API_KEY="tu-clave"                  # https://console.anthropic.com
```

## Uso

```bash
python jarvis.py          # modo texto
python jarvis.py --voz    # modo voz
```

Para el modo voz: `pip install -r requirements-voz.txt`.
En Linux puede que necesites antes `sudo apt install portaudio19-dev espeak`; en macOS, `brew install portaudio`.

Escribe (o di) `salir` para terminar.

## Notas

- Si el modelo principal rechaza una petición, la API reintenta automáticamente con un modelo alternativo (`fallbacks: "default"`).
- El reconocimiento de voz usa el servicio gratuito de Google a través de `SpeechRecognition`.
