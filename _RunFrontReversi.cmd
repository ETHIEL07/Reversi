@echo off
:: Window title differs from the target window title so this script never kills itself.
title RunFront-Helper
echo [Reversi] Killing old front instances...

taskkill /F /FI "WINDOWTITLE eq Front-Reversi*" >nul 2>nul

for /f "tokens=5" %%a in ('netstat -aon ^| findstr "LISTENING" ^| findstr ":5213 "') do (
    taskkill /F /PID %%a >nul 2>nul
)

timeout /t 2 /nobreak >nul

if not exist "%~dp0Front\node_modules" (
    echo [Reversi] Installing front dependencies...
    cd /d "%~dp0Front"
    call npm install
)

echo [Reversi] Type check...
cd /d "%~dp0Front"
call npx tsc -b
if errorlevel 1 (
    echo [Reversi] TypeScript errors, front not started.
    pause
    exit /b 1
)

echo [Reversi] Starting Vite on port 5213...
start "Front-Reversi" cmd /k "cd /d %~dp0Front && npm run dev"

echo [Reversi] Opening browser in 6 seconds...
timeout /t 6 /nobreak >nul
start http://localhost:5213
echo [Reversi] Done!
