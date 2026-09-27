@echo off
REM Arranca Jarvis. Ejemplos: iniciar.bat   iniciar.bat --voz   iniciar.bat --vigilar
cd /d "%~dp0"
if not exist .venv\Scripts\python.exe (
  echo Primero ejecuta instalar.bat
  pause
  exit /b 1
)
.venv\Scripts\python -m jarvis %*
if errorlevel 1 pause
