@echo off
title Reversi Tests
setlocal
cd /d "%~dp0"

echo.
echo ============================================
echo   Reversi - Tests
echo ============================================
echo.

echo [1/1] NUnit (engine + integration)...
echo --------------------------------------------
dotnet test Back\Reversi.Tests --nologo --logger "console;verbosity=normal"
set TEST_RESULT=%ERRORLEVEL%
echo.

echo ============================================
echo   RESULTS
echo ============================================
if %TEST_RESULT%==0 (
    echo   NUnit : OK
) else (
    echo   NUnit : FAILED
)
echo ============================================
echo.

if %TEST_RESULT% NEQ 0 exit /b 1

echo All tests passed.
pause
