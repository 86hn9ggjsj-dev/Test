@echo off
REM Trading Floor: mineria de estrategias + paper trading (dinero ficticio) + oficina isometrica.
REM Ejemplos: trading.bat   trading.bat minar   trading.bat banco
cd /d "%~dp0"
if not exist .venv\Scripts\python.exe (
  where py >nul 2>nul
  if errorlevel 1 (
    echo Necesitas Python 3. Descargalo de https://www.python.org/downloads/ ^(marca "Add Python to PATH"^).
    pause
    exit /b 1
  )
  echo Preparando el Trading Floor ^(solo la primera vez^)...
  py -3 -m venv .venv || goto error
  .venv\Scripts\python -m pip install --quiet --upgrade pip || goto error
  .venv\Scripts\python -m pip install --quiet -r requirements.txt || goto error
)
.venv\Scripts\python -m trading_floor %*
if errorlevel 1 pause
exit /b 0
:error
echo Algo ha fallado preparando el Trading Floor.
pause
exit /b 1
