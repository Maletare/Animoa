@echo off
cd /d "%~dp0"
title Animoa - serveur local
start "" powershell -NoProfile -WindowStyle Hidden -Command "Start-Sleep -Seconds 1; Start-Process 'http://localhost:8015/?v=3.9.2'"
py -m http.server 8015
if errorlevel 1 (
  echo.
  echo Python n'a pas pu demarrer le serveur local.
  echo Verifiez que Python est installe, puis relancez ce fichier.
  pause
)
