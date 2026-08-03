@echo off
title Kill-Reversi
echo [Reversi] Stopping everything...

taskkill /F /FI "WINDOWTITLE eq Backend-Reversi*" >nul 2>nul
taskkill /F /FI "WINDOWTITLE eq Front-Reversi*" >nul 2>nul
taskkill /F /IM Reversi.Api.exe >nul 2>nul

powershell -NoProfile -Command "Get-CimInstance Win32_Process -Filter \"Name='dotnet.exe'\" | Where-Object { $_.CommandLine -like '*Reversi.Api*' } | ForEach-Object { Stop-Process -Id $_.ProcessId -Force -ErrorAction SilentlyContinue }" >nul 2>nul

:: Reserved port range for this project: 5210-5219
for %%p in (5210 5211 5213 5215) do (
    for /f "tokens=5" %%a in ('netstat -aon ^| findstr "LISTENING" ^| findstr ":%%p "') do (
        taskkill /F /PID %%a >nul 2>nul
    )
)

echo [Reversi] Stopped.
timeout /t 2 /nobreak >nul
