@echo off
:: Window title differs from the target window title so this script never kills itself.
title RunBackend-Helper
echo [Reversi] Killing old backend instances...

:: 1) cmd windows from previous runs
taskkill /F /FI "WINDOWTITLE eq Backend-Reversi*" >nul 2>nul

:: 2) self-hosted executable
taskkill /F /IM Reversi.Api.exe >nul 2>nul

:: 3) dotnet.exe hosting Reversi.Api (matched on its command line)
powershell -NoProfile -Command "Get-CimInstance Win32_Process -Filter \"Name='dotnet.exe'\" | Where-Object { $_.CommandLine -like '*Reversi.Api*' } | ForEach-Object { Stop-Process -Id $_.ProcessId -Force -ErrorAction SilentlyContinue }" >nul 2>nul

:: 4) anything still listening on 5210 / 5211
for %%p in (5210 5211) do (
    for /f "tokens=5" %%a in ('netstat -aon ^| findstr "LISTENING" ^| findstr ":%%p "') do (
        taskkill /F /PID %%a >nul 2>nul
    )
)

timeout /t 2 /nobreak >nul

echo [Reversi] Cleaning build output...
rd /s /q "%~dp0Back\Reversi.Api\bin" 2>nul
rd /s /q "%~dp0Back\Reversi.Api\obj" 2>nul
rd /s /q "%~dp0Back\Reversi.Core\bin" 2>nul
rd /s /q "%~dp0Back\Reversi.Core\obj" 2>nul
rd /s /q "%~dp0Back\Reversi.Data\bin" 2>nul
rd /s /q "%~dp0Back\Reversi.Data\obj" 2>nul
timeout /t 1 /nobreak >nul

echo [Reversi] dotnet run (build + run on port 5210)...
cd /d "%~dp0"
start "Backend-Reversi" cmd /k "dotnet run --project Back\Reversi.Api"

echo [Reversi] Opening Swagger in 15 seconds (first build takes ~10s)...
timeout /t 15 /nobreak >nul
start http://localhost:5210/swagger
echo [Reversi] Done!
