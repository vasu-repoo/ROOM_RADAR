@echo off
title RoomRadar Launcher
cd /d "C:\Users\vasu\Documents\RoomRadar-secure-source-code"

echo ===================================================
echo   Starting RoomRadar - Classroom Availability Finder
echo ===================================================
echo.
echo Launching your browser at http://localhost:5173/ ...
timeout /t 2 /nobreak >nul
start "" http://localhost:5173/

echo Starting dev server... (Keep this window open while using RoomRadar)
echo Press Ctrl+C anytime to stop the server.
echo.
call npm.cmd run dev
pause
