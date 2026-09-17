@echo off
echo === 1. Checking Python 3.11 ===
py -3.11 -V
if %errorlevel% neq 0 (
    echo [ERROR] Python 3.11 is required. Python 3.14 does not support PyTorch CUDA wheels.
    pause
    exit /b 1
)

set VENV_DIR=c:\TRUSTCV\New-trustcv\.venv_gpu

echo.
echo === 2. Creating Virtual Environment at %VENV_DIR% ===
py -3.11 -m venv %VENV_DIR%

echo.
echo === 3. Upgrading pip ===
call "%VENV_DIR%\Scripts\python.exe" -m pip install --upgrade pip

echo.
echo === 4. Installing PyTorch with CUDA 12.1 ===
call "%VENV_DIR%\Scripts\pip.exe" install torch torchvision --index-url https://download.pytorch.org/whl/cu121

echo.
echo === 5. Installing Ultralytics & OpenCV ===
call "%VENV_DIR%\Scripts\pip.exe" install ultralytics opencv-python

echo.
echo === 6. Verifying GPU / CUDA Setup ===
call "%VENV_DIR%\Scripts\python.exe" -c "import torch; print('PyTorch Version:', torch.__version__); print('CUDA Available:', torch.cuda.is_available()); print('GPU Name:', torch.cuda.get_device_name(0) if torch.cuda.is_available() else 'None')"

echo.
echo === Setup Complete! ===
echo Activating GPU environment now...
call "%VENV_DIR%\Scripts\activate.bat"
echo.
echo Ready! You can now run: python training\train.py
echo.
cmd /k

