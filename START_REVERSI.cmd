@echo off
setlocal enabledelayedexpansion

echo.
echo ==================================================
echo   REVERSI — Startup Script
echo ==================================================
echo.

:: Kill old processes
taskkill /F /IM dotnet.exe >nul 2>&1
taskkill /F /IM cloudflared.exe >nul 2>&1
timeout /t 2 /nobreak

:: Start Backend API
echo [1/3] Starting Backend API on port 5210...
start "Reversi Backend" /MIN cmd /c "_RunBackendReversi.cmd"
timeout /t 5 /nobreak

:: Test if API is running
for /L %%i in (1,1,5) do (
  powershell -NoProfile -Command "try { $r = Invoke-WebRequest -Uri 'http://localhost:5210/api/version' -TimeoutSec 2 -ErrorAction Stop; Write-Host '✓ API Online'; exit 0 } catch { exit 1 }" >nul 2>&1
  if !errorlevel! equ 0 goto api_ok
  timeout /t 2 /nobreak
)
echo ⚠ API may still be booting...

:api_ok
echo.
echo [2/3] Starting Cloudflare Tunnel...
echo.
echo === IMPORTANT: Copy the tunnel URL below and paste it into vercel.json ===
echo.
start "Cloudflare Tunnel" cmd /k ""C:\Program Files (x86)\cloudflared\cloudflared.exe" tunnel run --url http://localhost:5210"
timeout /t 3 /nobreak

echo.
echo [3/3] Setup Complete!
echo.
echo Your app is running:
echo   Frontend: https://reversi-psi-two.vercel.app
echo   Backend (local): http://localhost:5210
echo   API version: http://localhost:5210/api/version
echo.
echo NEXT STEP:
echo 1. Copy the tunnel URL from the Cloudflare window above
echo 2. Update Front/vercel.json with the new tunnel URL
echo 3. Commit and push: git add Front/vercel.json && git commit -m "Update tunnel URL" && git push
echo 4. Refresh https://reversi-psi-two.vercel.app
echo.
echo ==================================================
pause
