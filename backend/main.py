import sys
import subprocess
import json
import sqlite3
import os

from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordRequestForm

from backend.db import insert_inference_run, get_all_inference_runs, get_all_models, log_action, get_all_audit_logs
from backend.auth import authenticate_user, create_access_token, require_role, get_current_user

app = FastAPI(title="TRUSTCV API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

DB_PATH      = r"C:\TRUSTCV\New-trustcv\database\trustcv.db"
REGISTRY_PATH = r"C:\TRUSTCV\New-trustcv\models\model_registry.json"


def _db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


# ── Health ──────────────────────────────────────────────────────────────────
@app.get("/")
def root():
    return {"message": "TRUSTCV API is running", "status": "ok"}


# ── Auth ─────────────────────────────────────────────────────────────────────
@app.post("/login")
def login(form_data: OAuth2PasswordRequestForm = Depends()):
    user = authenticate_user(form_data.username, form_data.password)
    if not user:
        raise HTTPException(status_code=401, detail="Incorrect username or password")
    token = create_access_token({"sub": user["username"], "role": user["role"]})
    return {"access_token": token, "token_type": "bearer", "role": user["role"]}


# ── Dashboard Summary ────────────────────────────────────────────────────────
@app.get("/dashboard/summary")
def dashboard_summary():
    """Returns aggregated DB stats for the Overview page."""
    conn = _db()
    c = conn.cursor()

    c.execute("SELECT COUNT(*) as cnt FROM models")
    model_count = c.fetchone()["cnt"]

    c.execute("SELECT COUNT(*) as cnt FROM models WHERE status='APPROVED'")
    approved_models = c.fetchone()["cnt"]

    c.execute("SELECT COUNT(*) as cnt FROM inference_runs")
    inference_count = c.fetchone()["cnt"]

    c.execute("SELECT COUNT(*) as cnt FROM audit_logs")
    audit_count = c.fetchone()["cnt"]

    c.execute("SELECT COUNT(*) as cnt FROM dataset_versions")
    dataset_count = c.fetchone()["cnt"]

    c.execute("SELECT COUNT(*) as cnt FROM dataset_versions WHERE status='VERIFIED'")
    verified_datasets = c.fetchone()["cnt"]

    c.execute("SELECT COUNT(*) as cnt FROM audit_logs WHERE action LIKE '%BLOCK%' OR action LIKE '%FAIL%'")
    violations = c.fetchone()["cnt"]

    c.execute("SELECT COUNT(*) as cnt FROM users")
    user_count = c.fetchone()["cnt"]

    # DB file size
    db_size_mb = round(os.path.getsize(DB_PATH) / (1024 * 1024), 2)

    # Latest audit hash (chain tip)
    c.execute("SELECT entry_hash, timestamp FROM audit_logs ORDER BY id DESC LIMIT 1")
    row = c.fetchone()
    chain_tip = {"hash": row["entry_hash"][:16] + "...", "timestamp": row["timestamp"]} if row else {}

    # Recent audit actions
    c.execute("SELECT action FROM audit_logs ORDER BY id DESC LIMIT 20")
    recent_actions = [r["action"] for r in c.fetchall()]

    conn.close()
    return {
        "models":           {"total": model_count,     "approved": approved_models},
        "inferences":       {"total": inference_count},
        "audit_logs":       {"total": audit_count,     "violations": violations},
        "datasets":         {"total": dataset_count,   "verified": verified_datasets},
        "users":            {"total": user_count},
        "db_size_mb":       db_size_mb,
        "chain_tip":        chain_tip,
        "recent_actions":   recent_actions,
    }


# ── Dataset Versions ─────────────────────────────────────────────────────────
@app.get("/dataset/versions")
def get_dataset_versions():
    conn = _db()
    c = conn.cursor()
    c.execute("SELECT * FROM dataset_versions ORDER BY id DESC")
    rows = [dict(r) for r in c.fetchall()]
    conn.close()
    return {"datasets": rows}


@app.get("/dataset/verify")
def verify_dataset():
    result = subprocess.run(
        [sys.executable, "integrity/verify_dataset.py"],
        capture_output=True, text=True
    )
    return {"output": result.stdout, "errors": result.stderr}


# ── Models ───────────────────────────────────────────────────────────────────
@app.get("/model/registry")
def get_registry():
    return {"models": get_all_models()}


@app.get("/model/verify")
def verify_model():
    result = subprocess.run(
        [sys.executable, "integrity/verify_model.py"],
        capture_output=True, text=True
    )
    return {"output": result.stdout, "errors": result.stderr}


# ── Inference ────────────────────────────────────────────────────────────────
@app.get("/inference/logs")
def get_inference_logs():
    return {"inferences": get_all_inference_runs()}


@app.post("/inference/run")
def run_inference(image_path: str, user=Depends(require_role(["ADMIN", "OPERATOR"]))):
    result = subprocess.run(
        [sys.executable, "inference/predict.py", image_path],
        capture_output=True, text=True
    )
    if result.returncode != 0:
        log_action(user["username"], "INFERENCE_FAILED", "inference", image_path, result.stderr[:200])
        return {"status": "error", "details": result.stderr}
    try:
        record = json.loads(result.stdout)
        insert_inference_run(record)
        log_action(user["username"], "INFERENCE_COMPLETED", "inference", record["inference_id"], record["output_hash"])
        return {"status": "success", "result": record, "run_by": user["username"]}
    except json.JSONDecodeError:
        return {"status": "success", "raw_output": result.stdout}


# ── Audit Logs ───────────────────────────────────────────────────────────────
@app.get("/audit/logs")
def get_audit_logs():
    return {"audit_logs": get_all_audit_logs()}


# ── Users (admin only) ───────────────────────────────────────────────────────
@app.get("/users")
def get_users(user=Depends(require_role(["ADMIN"]))):
    conn = _db()
    c = conn.cursor()
    c.execute("SELECT id, username, role, created_at FROM users ORDER BY id")
    rows = [dict(r) for r in c.fetchall()]
    conn.close()
    return {"users": rows}


# ── DB Raw Stats (admin) ─────────────────────────────────────────────────────
@app.get("/db/stats")
def db_stats():
    conn = _db()
    c = conn.cursor()
    tables = ["users", "models", "dataset_versions", "inference_runs", "audit_logs"]
    stats = {}
    for t in tables:
        c.execute(f"SELECT COUNT(*) as cnt FROM {t}")
        stats[t] = c.fetchone()["cnt"]
    stats["db_size_mb"] = round(os.path.getsize(DB_PATH) / (1024 * 1024), 2)
    stats["db_path"] = DB_PATH
    conn.close()
    return {"db_stats": stats}