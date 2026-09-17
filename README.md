# TRUSTCV: Safety Helmet & Worker Detection Pipeline

An end-to-end computer vision pipeline for industrial safety compliance, powered by **Ultralytics YOLO11** and **PyTorch CUDA**.

---

## 📋 Table of Contents
- [Hardware & Software Requirements](#hardware--software-requirements)
- [Quick Start: Environment Setup](#quick-start-environment-setup)
- [How to Activate the Environment](#how-to-activate-the-environment)
- [Project Architecture](#project-architecture)
- [Dataset & Data Integrity](#dataset--data-integrity)
- [Model Training](#model-training)
- [Troubleshooting & FAQs](#troubleshooting--faqs)

---

## ⚙️ Hardware & Software Requirements

- **Operating System:** Windows 10 / 11 (64-bit)
- **GPU:** NVIDIA GPU with CUDA support (e.g., NVIDIA GeForce RTX 3050 Laptop GPU, 4GB VRAM)
- **NVIDIA Driver:** Version 550+ (CUDA 12.x / 13.0 compatible)
- **Python Version:** **Python 3.11**
  > **Note:** PyTorch official CUDA binaries are currently supported on Python 3.11 and 3.12. Do not use Python 3.14 for the GPU environment as PyTorch CUDA wheels are not yet available for 3.14.

---

## 🚀 Quick Start: Environment Setup

A dedicated setup script is provided to automatically create a virtual environment, upgrade `pip`, install PyTorch with CUDA 12.1 acceleration, and configure `ultralytics`.

### Option A: Using PowerShell (Recommended)
Open PowerShell in `C:\TRUSTCV\New-trustcv` and run:
```powershell
powershell -ExecutionPolicy Bypass -File .\setup_gpu_env.ps1
```

### Option B: Using Command Prompt
Open CMD or double-click:
```cmd
setup_gpu_env.bat
```

---

## 🔌 How to Activate the Environment

Once the environment is created, activate it using any of the methods below:

### Method 1: Using the 1-Click Activation Scripts

- **In PowerShell:**
  ```powershell
  . .\activate_gpu.ps1
  ```
- **In Command Prompt (or Double-Click):**
  ```cmd
  activate_gpu.bat
  ```

### Method 2: Standard Activation Command

- **PowerShell:**
  ```powershell
  & "C:\TRUSTCV\New-trustcv\.venv_gpu\Scripts\Activate.ps1"
  ```
  *(If you see an execution policy error, run `Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope Process` first)*

- **Command Prompt (CMD):**
  ```cmd
  C:\TRUSTCV\New-trustcv\.venv_gpu\Scripts\activate.bat
  ```

### Method 3: Run Directly Without Activating
You can execute scripts directly using the virtual environment's Python executable without activating:
```powershell
& "C:\TRUSTCV\New-trustcv\.venv_gpu\Scripts\python.exe" training\train.py
```

---

## 📁 Project Architecture

```
TRUSTCV/
└── New-trustcv/
    ├── .venv_gpu/                  # GPU-enabled Virtual Environment (Python 3.11 + CUDA 12.1)
    ├── DATASET/                    # YOLO formatted dataset
    │   ├── train/                  # Training images & labels
    │   ├── valid/                  # Validation images & labels
    │   ├── test/                   # Test images & labels
    │   └── data.yaml               # Class definitions and paths
    ├── integrity/                  # Dataset verification & cryptographic hashing
    │   ├── manifest.py             # Generates SHA-256 checksum manifest
    │   └── verify_dataset.py       # Verifies dataset against manifest
    ├── manifests/                  # Generated JSON dataset manifests
    │   └── dataset_manifest.json
    ├── models/                     # Saved training runs and weights
    │   └── helmet_final/
    ├── preprocessing/              # Dataset sanitation & validation
    │   └── validate_dataset.py
    ├── training/                   # Model training and inference scripts
    │   ├── train.py                # Main YOLO11 training script (CUDA enabled)
    │   └── resume.py               # Resume interrupted training
    ├── weights/                    # Pre-trained and exported model weights
    ├── activate_gpu.bat            # Quick activator for CMD
    ├── activate_gpu.ps1            # Quick activator for PowerShell
    ├── setup_gpu_env.bat           # GPU setup script for CMD
    ├── setup_gpu_env.ps1           # GPU setup script for PowerShell
    ├── yolo11n.pt                  # YOLO11 Nano baseline model
    └── README.md                   # Project documentation
```

---

## 📊 Dataset & Data Integrity

The dataset uses YOLO format with 3 labeled classes defined in `DATASET/data.yaml`:
1. `Helmet`
2. `No Helmet`
3. `Worker`

### 1. Generate Dataset Manifest
To record cryptographic SHA-256 hashes of all images and annotations:
```powershell
python integrity\manifest.py
```

### 2. Verify Dataset Integrity
To check if any dataset images or labels have been altered or corrupted:
```powershell
python integrity\verify_dataset.py
```

### 3. Validate Dataset Format
To ensure bounding boxes and label indices are valid before training:
```powershell
python preprocessing\validate_dataset.py
```

---

## 🏋️ Model Training

### Start Training on GPU
Run the training script with GPU acceleration:
```powershell
python training\train.py
```

#### Training Configuration:
- **Base Model:** `yolo11n.pt`
- **Image Size (`imgsz`):** 640
- **Batch Size (`batch`):** 8 *(optimized for 4GB VRAM to prevent Out-Of-Memory errors)*
- **Workers (`workers`):** 4
- **Epochs:** 30 (with early stopping patience = 10)
- **Device (`device`):** `0` (NVIDIA CUDA)

### Resume an Interrupted Run
If training is interrupted, resume from the last saved checkpoint:
```powershell
python training\resume.py
```

---

## ❓ Troubleshooting & FAQs

### Q1: `The term '...\.venv' is not recognized`
**Cause:** Attempting to execute the folder path rather than the script.  
**Fix:** Run `& ".\.venv_gpu\Scripts\Activate.ps1"` or use `. .\activate_gpu.ps1`.

### Q2: `File ... Activate.ps1 cannot be loaded because running scripts is disabled`
**Cause:** Windows PowerShell script execution policy restriction.  
**Fix:** Run this once in your PowerShell terminal:
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope Process
```

### Q3: `CUDA not available — check torch install`
**Cause:** Standard `pip install torch` installs the CPU-only version, or Python 3.14 is being used.  
**Fix:** Ensure you are using Python 3.11 and installed with the CUDA 12.1 index:
```cmd
pip install torch torchvision --index-url https://download.pytorch.org/whl/cu121
```

### Q4: CUDA Out of Memory (OOM) during training
**Fix:** In `training/train.py`, decrease the batch size:
```python
batch=4  # or batch=2 if running other GPU applications simultaneously
```
