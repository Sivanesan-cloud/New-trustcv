"""
TRUSTCV – Seed demo data into the SQLite database.
Run from project root: python database/seed_demo.py
"""
import sqlite3, hashlib, json, datetime, uuid

DB_PATH = r"C:\TRUSTCV\New-trustcv\database\trustcv.db"

def sha256(text):
    return hashlib.sha256(text.encode()).hexdigest()

def now():
    return datetime.datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S")

conn = sqlite3.connect(DB_PATH)
c    = conn.cursor()

# ── Clear existing demo data (keep schema) ─────────────────────────────────
c.execute("DELETE FROM models WHERE model_id LIKE 'DEMO-%'")
c.execute("DELETE FROM dataset_versions WHERE dataset_name LIKE 'DEMO-%'")
c.execute("DELETE FROM inference_runs WHERE inference_id LIKE 'DEMO-%'")
c.execute("DELETE FROM audit_logs WHERE username IN ('alex.mercer','system-watchdog','ci-runner','elena.rostova','kiran.patel')")

# ── Dataset versions ───────────────────────────────────────────────────────
datasets = [
    ("DEMO-Autonomous-Vision-HQ-2025", "v4.2", sha256("av-hq-2025-v4.2"), 55403, "alex.mercer", "VERIFIED"),
    ("DEMO-COCO-Val", "v3.2", sha256("coco-val-v3.2"), 5000, "elena.rostova", "VERIFIED"),
]

for d in datasets:
    c.execute("""
        INSERT OR IGNORE INTO dataset_versions (dataset_name, version, manifest_hash, total_files, created_by, status)
        VALUES (?, ?, ?, ?, ?, ?)
    """, d)

c.execute("SELECT id FROM dataset_versions WHERE dataset_name='DEMO-Autonomous-Vision-HQ-2025'")
ds_id = c.fetchone()[0]

# ── Models ─────────────────────────────────────────────────────────────────
models = [
    ("DEMO-M001", "YOLOv8-Security-Perimeter-Detection.pt", "v2.4.0",
     "PyTorch Darknet", sha256("yolov8-perimeter-v2.4.0"), 91_614_208, "alex.mercer", "APPROVED",
     json.dumps({"mAP50": 0.94, "latency_ms": 9.4})),
    ("DEMO-M002", "ResNet50-Biometrics.onnx", "v1.9.2",
     "ONNX Runtime",   sha256("resnet50-biometrics-v1.9.2"), 98_000_000, "elena.rostova", "APPROVED",
     json.dumps({"mAP50": 0.91, "latency_ms": 16.1})),
    ("DEMO-M003", "DETR-ObjectDetector-Edge.engine", "v3.1.0",
     "TensorRT Engine", sha256("detr-obj-v3.1.0-TAMPERED"), 120_000_000, "ci-runner", "APPROVED",
     json.dumps({"mAP50": 0.88, "latency_ms": 22.8})),
    ("DEMO-M004", "ViT-Base-Classifier.safetensors", "v1.2.0",
     "Vision Transformer", sha256("vit-base-v1.2.0"), 330_000_000, "elena.rostova", "APPROVED",
     json.dumps({"mAP50": 0.96, "latency_ms": 5.0})),
    ("DEMO-M005", "EfficientNet-Surveillance.pt", "v2.0.1",
     "PyTorch Backbone", sha256("efficientnet-surv-v2.0.1"), 55_000_000, "alex.mercer", "APPROVED",
     json.dumps({"mAP50": 0.93, "latency_ms": 11.0})),
]
for m in models:
    c.execute("""
        INSERT OR IGNORE INTO models (model_id, name, version, framework, sha256, file_size_bytes, created_by, status, metrics_json, dataset_version_id)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (*m, ds_id))

# ── Inference runs ─────────────────────────────────────────────────────────
inf_records = [
    ("DEMO-INF-001", "frame_surveillance_091.jpg", sha256("frame-091"), sha256("yolov8-perimeter-v2.4.0"), sha256("out-frame-091"), "alex.mercer"),
    ("DEMO-INF-002", "pedestrian_cross_004.png",   sha256("ped-004"),   sha256("yolov8-perimeter-v2.4.0"), sha256("out-ped-004"),   "operator1"),
    ("DEMO-INF-003", "night_fog_sensor_091.jpg",   sha256("night-091"), sha256("efficientnet-surv-v2.0.1"), sha256("out-night-091"), "alex.mercer"),
    ("DEMO-INF-004", "cam01_frame_04921.png",      sha256("cam-04921"), sha256("yolov8-perimeter-v2.4.0"), sha256("out-cam-04921"), "operator1"),
    ("DEMO-INF-005", "test_batch_007.jpg",         sha256("batch-007"), sha256("resnet50-biometrics-v1.9.2"), sha256("out-batch-007"), "alex.mercer"),
]
preds = json.dumps([{"class": "Pedestrian & Vehicle Incursion", "confidence": 0.984, "bbox": [120, 200, 300, 480]}])
for r in inf_records:
    c.execute("""
        INSERT OR IGNORE INTO inference_runs (inference_id, input_image, input_hash, model_hash, output_hash, predictions_json, user, timestamp)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    """, (*r, preds, datetime.datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S")))

# ── Audit logs (immutable chain) ───────────────────────────────────────────
prev_hash = "GENESIS"

audit_entries = [
    ("alex.mercer",   "MODEL_WEIGHTS_ATTESTATION",      "model",    "DEMO-M001", "Model weights hash verified — SHA256 match confirmed"),
    ("ci-runner",     "INFERENCE_REQUEST_AUTHORIZED",   "inference","DEMO-INF-001","Inference authorized for frame_surveillance_091.jpg"),
    ("elena.rostova", "DATASET_MERKLE_ROOT_CHECK",      "dataset",  "DEMO-Autonomous-Vision-HQ-2025","Merkle root recomputed — no changes detected"),
    ("system-watchdog","INFERENCE_BLOCKED_HASH_MISMATCH","inference","DEMO-INF-FAIL","Payload digest differed from hardware root — blocked"),
    ("kiran.patel",   "API_KEY_SECRET_ROTATION",        "api_key",  "kmv-key-acc-4516","API key rotated via DevOps console"),
    ("alex.mercer",   "WEIGHTS_BASELINE_SIGNED",        "model",    "DEMO-M002", "ResNet50 baseline weights signed by SecOps enclave"),
    ("system-watchdog","AUDIT_LOG_CHECKPOINT_SEALED",   "ledger",   "ledger-block-14886","Audit checkpoint sealed — Merkle root anchored"),
    ("elena.rostova", "MODEL_WEIGHTS_ATTESTATION",      "model",    "DEMO-M001", "Periodic re-attestation — weights unchanged"),
    ("alex.mercer",   "DATASET_VERIFY_COMPLETED",       "dataset",  "DEMO-COCO-Val","COCO-Val-v3.2 verified — 5000 files intact"),
    ("ci-runner",     "INFERENCE_COMPLETED",            "inference","DEMO-INF-002","pedestrian_cross_004.png — inference completed"),
]

for username, action, asset_type, asset_id, details in audit_entries:
    entry_hash = sha256(f"{username}|{action}|{asset_type}|{asset_id}|{details}|{prev_hash}")
    c.execute("""
        INSERT INTO audit_logs (username, action, asset_type, asset_id, details, prev_hash, entry_hash, timestamp)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    """, (username, action, asset_type, asset_id, details, prev_hash, entry_hash, now()))
    prev_hash = entry_hash

conn.commit()
conn.close()
print("[SUCCESS] Demo data seeded successfully!")
print("   - 5 models registered")
print("   - 2 dataset versions")
print("   - 5 inference runs")
print("   - 10 chained audit log entries")
