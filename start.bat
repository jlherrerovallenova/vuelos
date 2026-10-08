@echo off
chcp 65001 > nul
echo ========================================================
echo   VUELA BARATO - Buscador de Vuelos Low-Cost (0€ APIs)
echo ========================================================
echo.

echo [1/2] Iniciando Backend FastAPI (http://127.0.0.1:8000)...
start "Backend - FastAPI FlightFinder" cmd /k "cd backend && python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload"

echo [2/2] Iniciando Frontend React Vite (http://localhost:3000)...
start "Frontend - Vite React FlightFinder" cmd /k "cd frontend && npm run dev"

echo.
echo Todo listo. Abre en tu navegador:
echo    http://localhost:3000
echo.
pause
