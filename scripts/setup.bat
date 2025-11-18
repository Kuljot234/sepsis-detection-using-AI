@echo off
REM Sepsis Detection App - Setup Script for Windows

echo ==========================================
echo Sepsis Detection App - Setup Script
echo ==========================================
echo.

REM Check Python version
echo Checking Python version...
python --version
echo.

REM Check Node version
echo Checking Node.js version...
node --version
echo.

REM Install frontend dependencies
echo Installing frontend dependencies...
call npm install
echo Frontend dependencies installed!
echo.

REM Generate ML models
echo Generating ML models...
pip install -r scripts/requirements.txt
python scripts/generate_models.py
echo ML models generated!
echo.

REM Setup backend
echo Setting up backend...
cd backend

REM Create virtual environment if it doesn't exist
if not exist "venv" (
    echo Creating Python virtual environment...
    python -m venv venv
)

REM Activate virtual environment
call venv\Scripts\activate.bat

REM Install backend dependencies
echo Installing backend dependencies...
pip install -r requirements.txt
echo Backend dependencies installed!

cd ..
echo.

echo ==========================================
echo Setup Complete!
echo ==========================================
echo.
echo Next steps:
echo.
echo 1. Start the backend (in one terminal):
echo    cd backend
echo    venv\Scripts\activate.bat
echo    python app.py
echo.
echo 2. Start the frontend (in another terminal):
echo    set NEXT_PUBLIC_BACKEND_URL=http://localhost:5000
echo    npm run dev
echo.
echo 3. Open http://localhost:3000 in your browser
echo.
