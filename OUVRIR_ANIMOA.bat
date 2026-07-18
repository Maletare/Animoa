@echo off
setlocal
cd /d "%~dp0"

set "PORT=3001"
powershell -NoProfile -Command "try { $c = New-Object Net.Sockets.TcpClient('127.0.0.1', %PORT%); $c.Close(); exit 0 } catch { exit 1 }"
if errorlevel 1 (
  where py >nul 2>nul
  if not errorlevel 1 (
    start "Serveur Animoa" /min cmd /c "cd /d ""%~dp0"" && py -3 -m http.server %PORT% --bind 127.0.0.1"
  ) else (
    start "Serveur Animoa" /min cmd /c "cd /d ""%~dp0"" && python -m http.server %PORT% --bind 127.0.0.1"
  )
  timeout /t 2 /nobreak >nul
)
start "Animoa" "http://127.0.0.1:%PORT%"
exit /b 0
