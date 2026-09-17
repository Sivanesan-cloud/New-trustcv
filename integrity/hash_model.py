import hashlib
import json
import os
from datetime import datetime, timezone

MODEL_PATH = r"C:\TRUSTCV\New-trustcv\models\helmet_final\weights\best.pt"
REGISTRY_PATH = r"C:\TRUSTCV\New-trustcv\models\model_registry.json"

def compute_sha256(filepath):
    sha256 = hashlib.sha256()
    with open(filepath, "rb") as f:
        while True:
            chunk = f.read(8192)
            if not chunk:
                break
            sha256.update(chunk)
    return sha256.hexdigest()

file_hash = compute_sha256(MODEL_PATH)
file_size = os.path.getsize(MODEL_PATH)

entry = {
    "model_id": "MODEL-001",
    "name": "Helmet YOLO",
    "version": "V1",
    "sha256": file_hash,
    "file_size_bytes": file_size,
    "created_by": "ML_ENGINEER_01",
    "created_at": datetime.now(timezone.utc).isoformat(),
    "status": "APPROVED"
}

registry = {"models": [entry]}
with open(REGISTRY_PATH, "w") as f:
    json.dump(registry, f, indent=4)

print("SHA-256:", file_hash)
print("Saved to:", REGISTRY_PATH)