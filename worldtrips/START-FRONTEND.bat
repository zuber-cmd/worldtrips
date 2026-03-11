@echo off
title WorldTrips Frontend (Port 5173)
color 0D
echo.
echo ====================================================
echo   WorldTrips Frontend
echo   http://localhost:5173
echo ====================================================
echo.
echo Keep this window open while using the app.
echo The browser will open automatically.
echo Press Ctrl+C to stop.
echo.
cd /d "%~dp0frontend"
call npm run dev -- --host --open
pause