@echo off
title RunSeed-Helper
setlocal
cd /d "%~dp0"

echo [Reversi] Seed: creating demo games through the public API...
echo [Reversi] The backend must already be running on port 5210.
echo.

dotnet run --project Seed\Reversi.Seed -- http://localhost:5210 12

echo.
pause
