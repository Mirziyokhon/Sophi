@echo off
echo Restarting Next.js Frontend...
echo.
echo Please close the existing "Sophi Frontend" terminal window first.
echo Then press any key to start the frontend with updated configuration...
pause >nul

cd /d "%~dp0"
start "Sophi Frontend" cmd /k "npm run dev"
echo.
echo Frontend restarted on http://localhost:3000
echo Backend API: http://localhost:8001
pause
