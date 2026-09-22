import sys
import subprocess
import json

from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordRequestForm

from backend.db import insert_inference_run, get_all_inference_runs, get_all_models, log_action
from backend.auth import authenticate_user, create_access_token, require_role, get_current_user

app = FastAPI(title="TRUSTCV API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

REGISTRY_PATH = r"C:\TRUSTCV\New-trustcv\models\model_registry.json"


@app.get("/")
def root():
    return {"message": "TRUSTCV API is running"}


@app.post("/login")
def login(form_data: OAuth2PasswordRequestForm = Depends()):
    user = authenticate_user(form_data.username, form_data.password)
    if not user:
        raise HTTPException(status_code=401, detail="Incorrect username or password")
    token = create_access_token({"sub": user["username"], "role": user["role"]})
    return {"access_token": token, "token_type": "bearer", "role": user["role"]}



@app.get("/dataset/verify")
def verify_dataset():
    result = subprocess.run(
        [sys.executable, "integrity/verify_dataset.py"],
        capture_output=True, text=True
    )
    return {"output": result.stdout, "errors": result.stderr}


@app.get("/model/verify")
def verify_model():
    result = subprocess.run(
        [sys.executable, "integrity/verify_model.py"],
        capture_output=True, text=True
    )
    return {"output": result.stdout, "errors": result.stderr}

@app.get("/model/registry")
def get_registry():
    return {"models": get_all_models()}

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

@app.get("/inference/logs")
def get_inference_logs():
    return {"inferences": get_all_inference_runs()}

from backend.db import get_all_audit_logs

@app.get("/audit/logs")
def get_audit_logs():
    return {"audit_logs": get_all_audit_logs()}