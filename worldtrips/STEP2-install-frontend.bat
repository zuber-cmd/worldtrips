@echo off
title WorldTrips - Install Frontend
color 0A
echo.
echo ====================================================
echo   WorldTrips - Step 2: Install Frontend
echo ====================================================
echo.
cd /d "%~dp0frontend"
echo Installing frontend packages...
call npm install
if %ERRORLEVEL% NEQ 0 (
  color 0C
  echo.
  echo [ERROR] npm install failed!
  pause
  exit /b 1
)
echo.
echo [OK] Frontend packages installed!
echo.
echo ====================================================
echo   Now run STEP3-setup-database.bat
echo ====================================================
echo.
pause
