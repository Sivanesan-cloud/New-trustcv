# Setup GPU Environment for TRUSTCV (PyTorch + CUDA + Ultralytics)
# Note: Python 3.11 is required (Python 3.14 does not yet support PyTorch CUDA wheels).

Write-Host "=== 1. Checking Python 3.11 ===" -ForegroundColor Cyan
& py -3.11 -V
if ($LASTEXITCODE -ne 0) {
    Write-Error "Python 3.11 not found via py launcher. Please ensure Python 3.11 is installed."
    exit 1
}

$VENV_DIR = "c:\TRUSTCV\New-trustcv\.venv_gpu"

Write-Host "`n=== 2. Creating Virtual Environment at $VENV_DIR ===" -ForegroundColor Cyan
& py -3.11 -m venv $VENV_DIR

Write-Host "`n=== 3. Upgrading pip ===" -ForegroundColor Cyan
& "$VENV_DIR\Scripts\python.exe" -m pip install --upgrade pip

Write-Host "`n=== 4. Installing PyTorch with CUDA 12.1 ===" -ForegroundColor Cyan
& "$VENV_DIR\Scripts\pip.exe" install torch torchvision --index-url https://download.pytorch.org/whl/cu121

Write-Host "`n=== 5. Installing Ultralytics & OpenCV ===" -ForegroundColor Cyan
& "$VENV_DIR\Scripts\pip.exe" install ultralytics opencv-python

Write-Host "`n=== 6. Verifying GPU / CUDA Setup ===" -ForegroundColor Cyan
& "$VENV_DIR\Scripts\python.exe" -c "import torch; print('PyTorch Version:', torch.__version__); print('CUDA Available:', torch.cuda.is_available()); print('GPU Name:', torch.cuda.get_device_name(0) if torch.cuda.is_available() else 'None')"

Write-Host "`n=== Setup Complete! ===" -ForegroundColor Green
Write-Host "To activate this environment in PowerShell, run:" -ForegroundColor White
Write-Host "  . .\activate_gpu.ps1" -ForegroundColor Yellow
Write-Host "  OR" -ForegroundColor Gray
Write-Host "  & `"$VENV_DIR\Scripts\Activate.ps1`"" -ForegroundColor Yellow

