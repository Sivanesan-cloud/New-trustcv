import hashlib
import json
import os
import sys
from datetime import datetime, timezone
from ultralytics import YOLO

MODEL_PATH = r"C:\TRUSTCV\New-trustcv\models\helmet_final\weights\best.pt"
REGISTRY_PATH = r"C:\TRUSTCV\New-trustcv\models\model_registry.json"
INFERENCE_LOG = r"C:\TRUSTCV\New-trustcv\models\inference_log.json"

# Annotated output images are saved OUTSIDE the trusted dataset folder
# so they never trigger false "ADDED FILE" integrity violations.
ANNOTATED_DIR = r"C:\TRUSTCV\New-trustcv\inference\annotated_outputs"
os.makedirs(ANNOTATED_DIR, exist_ok=True)


def sha256_file(path):
    h = hashlib.sha256()
    with open(path, "rb") as f:
        while True:
            chunk = f.read(8192)
            if not chunk:
                break
            h.update(chunk)
    return h.hexdigest()


def sha256_bytes(data):
    return hashlib.sha256(data).hexdigest()


def verify_model():
    with open(REGISTRY_PATH) as f:
        registry = json.load(f)
    expected = registry["models"][0]["sha256"]
    current = sha256_file(MODEL_PATH)
    if expected != current:
        raise RuntimeError("MODEL TAMPERING DETECTED - inference aborted")
    return expected


def run_inference(image_path):
    model_hash = verify_model()
    input_hash = sha256_file(image_path)

    model = YOLO(MODEL_PATH)
    results = model.predict(image_path, verbose=False)

    # Build annotated output filename from just the base image name,
    # saved into ANNOTATED_DIR instead of alongside the source image.
    base_name = os.path.basename(image_path).rsplit(".", 1)[0]
    annotated_path = os.path.join(ANNOTATED_DIR, f"{base_name}_annotated.jpg")
    results[0].save(filename=annotated_path)

    boxes = results[0].boxes
    predictions = []
    for box in boxes:
        predictions.append({
            "class": int(box.cls[0]),
            "confidence": round(float(box.conf[0]), 4),
            "bbox": [round(x, 2) for x in box.xyxy[0].tolist()]
        })

    output_str = json.dumps(predictions, sort_keys=True)
    output_hash = sha256_bytes(output_str.encode())

    record = {
        "inference_id": f"INF-{int(datetime.now().timestamp())}",
        "input_image": image_path,
        "annotated_image": annotated_path,
        "input_hash": input_hash,
        "model_hash": model_hash,
        "output_hash": output_hash,
        "predictions": predictions,
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "user": "OPERATOR_01"
    }

    try:
        with open(INFERENCE_LOG) as f:
            log = json.load(f)
    except FileNotFoundError:
        log = {"inferences": []}

    log["inferences"].append(record)
    with open(INFERENCE_LOG, "w") as f:
        json.dump(log, f, indent=4)

    print(json.dumps(record, indent=4))
    return record


if __name__ == "__main__":
    if len(sys.argv) > 1:
        image_path = sys.argv[1]
    else:
        image_path = input("Image path: ")
    run_inference(image_path)