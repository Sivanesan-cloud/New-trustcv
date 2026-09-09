from ultralytics import YOLO
import torch

def main():
    DATASET = r"C:\TRUSTCV\New-trustcv\DATASET\data.yaml"
    PROJECT = r"C:\TRUSTCV\New-trustcv\models"
    RUN_NAME = "helmet_final"

    assert torch.cuda.is_available(), "CUDA not available — check torch install"
    print(f"Training on: {torch.cuda.get_device_name(0)}")

    model = YOLO("yolo11n.pt")

    results = model.train(
        data=DATASET,
        epochs=30,
        imgsz=640,
        batch=8,           # reduced from 16 — 4GB VRAM is limited, avoid OOM
        device=0,
        project=PROJECT,
        name=RUN_NAME,
        workers=4,
        patience=10,
        save=True,
        save_period=1,
        exist_ok=True,
    )

    print("Training completed successfully!")
    print(f"Best weights at: {PROJECT}\\{RUN_NAME}\\weights\\best.pt")

if __name__ == '__main__':
    main()