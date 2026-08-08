@echo off
chcp 65001 > nul
title Reversi Services
color 0A

echo ============================================
echo  REVERSI - API + TUNNEL
echo ============================================
echo.
echo Demarrage en cours...
echo.

REM Relance l'API
start "Reversi API" /d "C:\Users\amich\Dev\Test\Reversi\Back\Reversi.Api" cmd /k "set ASPNETCORE_ENVIRONMENT=Development && set ASPNETCORE_URLS=http://localhost:5210 && dotnet run"

REM Attends que l'API soit prete
timeout /t 8 /nobreak

REM Relance le tunnel
start "Reversi Tunnel" cmd /k "C:\Program Files (x86)\cloudflared\cloudflared.exe tunnel --url http://localhost:5210"

echo.
echo ============================================
echo  Services en cours de demarrage...
echo ============================================
echo.
echo API:      http://localhost:5210/swagger
echo Frontend: https://reversi-psi-two.vercel.app/
echo.
echo Les deux fenetres vont s'ouvrir automatiquement.
echo Garde ce terminal ouvert pour que ca fonctionne.
echo.
pause
