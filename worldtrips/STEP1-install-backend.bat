@echo off
title WorldTrips - Install Backend
color 0A
echo.
echo ====================================================
echo   WorldTrips - Step 1: Install Backend
echo ====================================================
echo.
cd /d "%~dp0backend"
echo Installing backend packages...
call npm install
if %ERRORLEVEL% NEQ 0 (
  color 0C
  echo.
  echo [ERROR] npm install failed!
  echo Make sure Node.js is installed: https://nodejs.org
  pause
  exit /b 1
)
echo.
echo [OK] Backend packages installed!
echo.
echo ====================================================
echo   Now edit backend\.env
echo   Change: YOUR_POSTGRES_PASSWORD_HERE
echo   to your actual PostgreSQL password
echo ====================================================
echo.
echo Opening .env file in Notepad...
start notepad "%~dp0backend\.env"
echo.
echo After saving .env, run STEP2-install-frontend.bat
echo.
pause
