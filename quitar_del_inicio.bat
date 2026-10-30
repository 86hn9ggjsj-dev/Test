@echo off
REM Quita el Trading Floor y Jarvis del inicio de Windows: te ensena lo que encuentra y pregunta antes.
REM No borra nada (aparta los accesos directos y solo desactiva las tareas), asi que se puede deshacer.
cd /d "%~dp0"
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0quitar_del_inicio.ps1"
pause
