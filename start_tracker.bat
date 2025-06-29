@echo off
echo Starting Gesture-Controlled CAD Model System...
echo.
echo Installing Python dependencies...
pip install -r requirements.txt
echo.
echo Starting gesture tracker...
echo Press Ctrl+C to stop
echo.
python gesture_tracker.py
pause
