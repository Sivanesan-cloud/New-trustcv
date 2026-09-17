import sqlite3
import json
import hashlib
from datetime import datetime, timezone

DB_PATH = r"C:\TRUSTCV\New-trustcv\database\trustcv.db"
USERS_JSON = r"C:\TRUSTCV\New-trustcv\backend\users.json"
MODEL_REGISTRY_JSON = r"C:\TRUSTCV\New-trustcv\models\model_registry.json"
INFERENCE_LOG_JSON = r"C:\TRUSTCV\New-trustcv\models\inference_log.json"


def migrate_users(cursor):
    try:
        with open(USERS_JSON) as f:
            data = json.load(f)
        for user in data["users"]:
            cursor.execute("""
                INSERT OR IGNORE INTO users (username, password_hash, role)
                VALUES (?, ?, ?)
            """, (user["username"], user["password_hash"], user["role"]))
        print(f"Migrated {len(data['users'])} users.")
    except FileNotFoundError:
        print("No users.json found, skipping.")


def migrate_models(cursor):
    try:
        with open(MODEL_REGISTRY_JSON) as f:
            data = json.load(f)
        for m in data["models"]:
            cursor.execute("""
                INSERT OR IGNORE INTO models
                (model_id, name, version, framework, file_path, sha256,
                 file_size_bytes, created_by, created_at, status, metrics_json)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                m["model_id"], m["name"], m["version"],
                m.get("framework", "YOLO"), m.get("file_path", ""),
                m["sha256"], m.get("file_size_bytes", 0),
                m.get("created_by", ""), m.get("created_at", ""),
                m.get("status", "APPROVED"),
                json.dumps(m.get("metrics", {}))
            ))
        print(f"Migrated {len(data['models'])} models.")
    except FileNotFoundError:
        print("No model_registry.json found, skipping.")


def migrate_inference_runs(cursor):
    try:
        with open(INFERENCE_LOG_JSON) as f:
            data = json.load(f)
        for run in data["inferences"]:
            cursor.execute("""
                INSERT OR IGNORE INTO inference_runs
                (inference_id, input_image, input_hash, model_hash,
                 output_hash, predictions_json, user, timestamp)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                run["inference_id"], run["input_image"], run["input_hash"],
                run["model_hash"], run["output_hash"],
                json.dumps(run.get("predictions", [])),
                run.get("user", ""), run.get("timestamp", "")
            ))
        print(f"Migrated {len(data['inferences'])} inference runs.")
    except FileNotFoundError:
        print("No inference_log.json found, skipping.")


def main():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    migrate_users(cursor)
    migrate_models(cursor)
    migrate_inference_runs(cursor)

    conn.commit()
    conn.close()
    print("Migration complete.")


if __name__ == "__main__":
    main()