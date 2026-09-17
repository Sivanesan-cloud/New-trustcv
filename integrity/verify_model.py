import hashlib
import json

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

with open(REGISTRY_PATH, "r") as f:
    registry = json.load(f)

expected_hash = registry["models"][0]["sha256"]
current_hash = compute_sha256(MODEL_PATH)

print("Expected:", expected_hash)
print("Current :", current_hash)

if expected_hash == current_hash:
    print("STATUS: VERIFIED - Model integrity intact")
else:
    print("STATUS: MODEL TAMPERING DETECTED")