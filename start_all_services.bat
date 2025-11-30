@echo off
echo ========================================
echo Starting Rusaldo Services
echo ========================================
echo.

echo [1/3] Starting Streamlit Backend...
cd /d "d:\Projects\Rusaldo"
start "Rusaldo Streamlit" cmd /k "streamlit run app.py --server.port 8000"
timeout /t 3 /nobreak >nul

echo [2/3] Starting Next.js Frontend...
cd /d "d:\Projects\Rusaldo\v0-design"
start "Rusaldo Frontend" cmd /k "npm run dev"
timeout /t 3 /nobreak >nul

echo [3/3] Services started!
echo.
echo Access URLs:
echo - Frontend: http://localhost:3000
echo - Backend/Streamlit: http://localhost:8000
echo.
echo Press any key to continue...
pause >nul
