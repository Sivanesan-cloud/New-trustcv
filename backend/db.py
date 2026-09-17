import sqlite3
import json
import hashlib

DB_PATH = r"C:\TRUSTCV\New-trustcv\database\trustcv.db"


def get_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def get_user_by_username(username):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM users WHERE username = ?", (username,))
    row = cursor.fetchone()
    conn.close()
    return dict(row) if row else None


def get_latest_model():
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM models ORDER BY id DESC LIMIT 1")
    row = cursor.fetchone()
    conn.close()
    return dict(row) if row else None


def insert_inference_run(record):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("""
        INSERT INTO inference_runs
        (inference_id, input_image, input_hash, model_hash, output_hash,
         predictions_json, user, timestamp)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        record["inference_id"], record["input_image"], record["input_hash"],
        record["model_hash"], record["output_hash"],
        json.dumps(record["predictions"]), record["user"], record["timestamp"]
    ))
    conn.commit()
    conn.close()


def get_all_inference_runs():
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM inference_runs ORDER BY id DESC")
    rows = cursor.fetchall()
    conn.close()
    return [dict(r) for r in rows]


def insert_audit_log(username, action, asset_type, asset_id, details, prev_hash, entry_hash):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("""
        INSERT INTO audit_logs (username, action, asset_type, asset_id, details, prev_hash, entry_hash)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    """, (username, action, asset_type, asset_id, details, prev_hash, entry_hash))
    conn.commit()
    conn.close()


def get_last_audit_hash():
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT entry_hash FROM audit_logs ORDER BY id DESC LIMIT 1")
    row = cursor.fetchone()
    conn.close()
    return row["entry_hash"] if row else "GENESIS"


def get_all_audit_logs():
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM audit_logs ORDER BY id DESC")
    rows = cursor.fetchall()
    conn.close()
    return [dict(r) for r in rows]
def get_all_models():
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM models ORDER BY id DESC")
    rows = cursor.fetchall()
    conn.close()
    return [dict(r) for r in rows]

def compute_entry_hash(username, action, asset_type, asset_id, details, prev_hash):
    raw = f"{username}|{action}|{asset_type}|{asset_id}|{details}|{prev_hash}"
    return hashlib.sha256(raw.encode()).hexdigest()


def log_action(username, action, asset_type, asset_id, details):
    prev_hash = get_last_audit_hash()
    entry_hash = compute_entry_hash(username, action, asset_type, asset_id, details, prev_hash)
    insert_audit_log(username, action, asset_type, asset_id, details, prev_hash, entry_hash)
    return entry_hash
