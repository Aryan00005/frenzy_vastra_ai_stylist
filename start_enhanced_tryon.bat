@echo off
echo Starting Enhanced Virtual Try-On Backend...
echo.

cd /d "%~dp0backend"

echo Installing Python dependencies...
pip install flask flask-cors opencv-python pillow numpy requests mediapipe

echo.
echo Starting Enhanced Virtual Try-On API on port 3001...
echo Backend will be available at: http://localhost:3001
echo.

python virtual_tryon_api.py

pause