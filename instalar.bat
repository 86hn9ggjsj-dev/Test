@echo off
REM Instalador de Jarvis para Windows. Uso: doble clic.
cd /d "%~dp0"
where py >nul 2>nul
if errorlevel 1 (
  echo Necesitas Python 3. Descargalo de https://www.python.org/downloads/ ^(marca "Add Python to PATH"^) y vuelve a ejecutar este instalador.
  pause
  exit /b 1
)
echo Instalando Jarvis...
py -3 -m venv .venv || goto error
.venv\Scripts\python -m pip install --quiet --upgrade pip || goto error
.venv\Scripts\python -m pip install --quiet -r requirements.txt || goto error
.venv\Scripts\python -m jarvis --configurar
echo.
echo Para abrir Jarvis cuando quieras: doble clic en iniciar.bat
pause
exit /b 0
:error
echo Algo ha fallado durante la instalacion.
pause
exit /b 1
