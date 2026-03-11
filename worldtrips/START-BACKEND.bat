@echo off
title WorldTrips Backend (Port 4000)
color 0B
echo.
echo ====================================================
echo   WorldTrips Backend API
echo   http://localhost:4000
echo ====================================================
echo.
echo Keep this window open while using the app.
echo Press Ctrl+C to stop.
echo.
cd /d "%~dp0backend"
if not exist ".env" (
  color 0C
  echo [ERROR] .env file not found!
  echo Run STEP1-install-backend.bat first.
  pause
  exit /b 1
)
call npm run dev
pause
