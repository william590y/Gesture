@echo off
title Gesture Control CAD - Setup
color 0A

echo ============================================
echo   Gesture-Controlled CAD Model Setup
echo ============================================
echo.

echo [1/4] Checking Python installation...
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Python is not installed or not in PATH
    echo Please install Python 3.8+ from https://python.org
    pause
    exit /b 1
)
echo Python found!

echo.
echo [2/4] Installing Python packages...
pip install opencv-python==4.8.1.78 mediapipe==0.10.7 numpy==1.24.3 websockets==11.0.3
if %errorlevel% neq 0 (
    echo ERROR: Failed to install Python packages
    pause
    exit /b 1
)
echo Python packages installed successfully!

echo.
echo [3/4] Testing camera access...
python -c "import cv2; cap = cv2.VideoCapture(0); ret, frame = cap.read(); cap.release(); print('Camera OK' if ret else 'Camera ERROR')"

echo.
echo [4/4] Setup complete!
echo.
echo ============================================
echo   How to use:
echo ============================================
echo.
echo 1. Run 'start_tracker.bat' to start gesture tracking
echo 2. Run 'start_web.bat' to start the web interface
echo 3. Open http://localhost:8000 in your browser
echo 4. Allow camera access when prompted
echo 5. Hold your hand in front of the camera and:
echo    - Tilt your hand to rotate the model
echo    - Move your hand to translate the model
echo    - Pinch fingers to zoom
echo    - Make a fist to reset
echo.
echo Press any key to continue...
pause >nul

echo.
echo Would you like to start the system now? (Y/N)
set /p choice="Enter your choice: "
if /i "%choice%"=="Y" (
    echo Starting gesture tracker...
    start "" "start_tracker.bat"
    timeout /t 3 >nul
    echo Starting web server...
    start "" "start_web.bat"
    timeout /t 3 >nul
    echo Opening browser...
    start "" "http://localhost:8000"
)

echo.
echo Setup complete! Have fun with gesture control!
pause
