@echo off
title WorldTrips - Setup Database
color 0A
echo.
echo ====================================================
echo   WorldTrips - Step 3: Setup PostgreSQL Database
echo ====================================================
echo.
set PG_PASS=Zubka145$
set PGPASSWORD=%PG_PASS%
echo.
echo Creating database...
psql -U postgres -c "CREATE DATABASE worldtrips;" 2>nul
echo.
echo Applying schema and seed data...
psql -U postgres -d worldtrips -f "%~dp0database\schema.sql"
if %ERRORLEVEL% EQU 0 (
  echo.
  echo [OK] Database ready!
  echo.
  echo Demo accounts created:
  echo   Admin:    admin@worldtrips.ke  / Admin@1234
  echo   Customer: sarah@example.com   / Admin@1234
) else (
  color 0C
  echo.
  echo [ERROR] Database setup failed.
  echo Check that PostgreSQL is running and password is correct.
)
echo.
echo ====================================================
echo   Database setup complete!
echo   Now run START-BACKEND.bat and START-FRONTEND.bat
echo ====================================================
echo.
pause