@echo off
title Calculator (React)
cd /d "%~dp0"
echo Installing dependencies (first run only)...
call npm install
if errorlevel 1 (
  echo npm install failed.
  pause
  exit /b 1
)
echo.
echo Starting React calculator...
echo Open: http://localhost:3456
echo Keep this window open. Press Ctrl+C to stop.
echo.
npm run dev
