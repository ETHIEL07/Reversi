@echo off
title DropDb-Reversi
setlocal

:: PostgreSQL 18 local install. psql is not on the PATH by default.
set PSQL="C:\Program Files\PostgreSQL\18\bin\psql.exe"
set PGUSER=jmp
set DBNAME=Reversi_dev

if not exist %PSQL% (
    echo [Reversi] psql not found at %PSQL%
    pause
    exit /b 1
)

echo [Reversi] Dropping database %DBNAME% (user %PGUSER%)...
%PSQL% -U %PGUSER% -d postgres -c "DROP DATABASE IF EXISTS \"%DBNAME%\" WITH (FORCE);"
if errorlevel 1 (
    echo [Reversi] Drop failed.
    pause
    exit /b 1
)

echo [Reversi] Dropped. The backend recreates it with EnsureCreated on next start.
pause
