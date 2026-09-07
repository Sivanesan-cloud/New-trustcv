from ultralytics import YOLO

# Dataset configuration
DATASET = r"E:\TrustCV\dataset\helmet\data.yaml"

# Load pretrained YOLO model
model = YOLO("yolo11n.pt")

# Train the model
results = model.train(
    data=DATASET,
    epochs=3,
    imgsz=640,
    batch=8,
    project=r"E:\TrustCV\models",
    name="helmet_test",
    workers=2
)

print("Training completed successfully!")