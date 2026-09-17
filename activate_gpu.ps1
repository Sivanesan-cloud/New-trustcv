# TRUSTCV - PowerShell GPU Environment Activation Script
# Usage: . .\activate_gpu.ps1

$VenvPath = "c:\TRUSTCV\New-trustcv\.venv_gpu"
$ActivateScript = Join-Path $VenvPath "Scripts\Activate.ps1"

if (-not (Test-Path $ActivateScript)) {
    Write-Host "[ERROR] Virtual environment not found at $VenvPath" -ForegroundColor Red
    Write-Host "Please run setup_gpu_env.ps1 first." -ForegroundColor Yellow
    return
}

# Set execution policy for the current process if needed
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope Process -Force

# Activate environment
& $ActivateScript

Write-Host "`n========================================================" -ForegroundColor Cyan
Write-Host "  TRUSTCV GPU Environment Activated (.venv_gpu)        " -ForegroundColor Green
Write-Host "========================================================" -ForegroundColor Cyan

& "$VenvPath\Scripts\python.exe" -c "import torch; print(f'PyTorch: {torch.__version__} | CUDA: {torch.cuda.is_available()} | GPU: {torch.cuda.get_device_name(0) if torch.cuda.is_available() else ''}')"

Write-Host "`nReady to train! Run:" -ForegroundColor Yellow
Write-Host "  python training\train.py`n" -ForegroundColor White
