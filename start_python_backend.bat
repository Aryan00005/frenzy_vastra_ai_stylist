@echo off
echo Starting Python Virtual Try-On Backend...
echo.

cd /d "%~dp0backend"

echo Installing Python dependencies...
pip install flask flask-cors opencv-python pillow numpy requests

echo.
echo Starting Python Backend on port 3001...
echo Backend API: http://localhost:3001/api/virtual-tryon
echo.

python virtual_tryon_api.py

pause