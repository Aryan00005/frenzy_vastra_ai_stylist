@echo off
echo Starting Simple Python Backend...
echo.

cd /d "%~dp0backend"

echo Installing basic dependencies...
pip install flask flask-cors pillow opencv-python requests numpy

echo.
echo Starting backend on port 3001...
python simple_backend.py

pause