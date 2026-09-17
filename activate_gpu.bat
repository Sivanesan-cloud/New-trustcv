@echo off
title TRUSTCV - GPU Environment (PyTorch CUDA 12.1)
echo ========================================================
echo   Activating TRUSTCV GPU Environment (.venv_gpu)
echo ========================================================

set VENV_PATH=c:\TRUSTCV\New-trustcv\.venv_gpu

if not exist "%VENV_PATH%\Scripts\activate.bat" (
    echo [ERROR] Virtual environment not found at %VENV_PATH%
    echo Please run setup_gpu_env.bat first to create it.
    pause
    exit /b 1
)

call "%VENV_PATH%\Scripts\activate.bat"

echo.
echo Active Python:
where python
echo.
python -c "import torch; print('PyTorch Version:', torch.__version__); print('CUDA Available :', torch.cuda.is_available()); print('Device Name    :', torch.cuda.get_device_name(0) if torch.cuda.is_available() else 'None')"
echo.
echo --------------------------------------------------------
echo Environment is ready! You can now run training:
echo   python training\train.py
echo --------------------------------------------------------
echo.
cmd /k
