"""
TRUSTCV - Database Initialization Script
Creates trustcv.db with tables for users, models, inference_runs, and audit_logs.

Usage:
    python database\init_db.py
"""

import sqlite3
import os

DB_PATH = r"C:\TRUSTCV\New-trustcv\database\trustcv.db"


def init_db():
    os.makedirs(os.path.dirname(DB_PATH), exist_ok=True)
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            role TEXT NOT NULL,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP
        )
    """)

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS dataset_versions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            dataset_name TEXT NOT NULL,
            version TEXT NOT NULL,
            manifest_hash TEXT,
            total_files INTEGER,
            created_by TEXT,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP,
            status TEXT DEFAULT 'VERIFIED'
        )
    """)

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS models (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            model_id TEXT UNIQUE NOT NULL,
            name TEXT NOT NULL,
            version TEXT NOT NULL,
            framework TEXT,
            file_path TEXT,
            sha256 TEXT NOT NULL,
            file_size_bytes INTEGER,
            dataset_version_id INTEGER,
            created_by TEXT,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP,
            status TEXT DEFAULT 'APPROVED',
            metrics_json TEXT,
            FOREIGN KEY (dataset_version_id) REFERENCES dataset_versions(id)
        )
    """)

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS inference_runs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            inference_id TEXT UNIQUE NOT NULL,
            model_id INTEGER,
            input_image TEXT,
            input_hash TEXT,
            model_hash TEXT,
            output_hash TEXT,
            predictions_json TEXT,
            user TEXT,
            timestamp TEXT DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (model_id) REFERENCES models(id)
        )
    """)

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS audit_logs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT,
            action TEXT NOT NULL,
            asset_type TEXT,
            asset_id TEXT,
            details TEXT,
            timestamp TEXT DEFAULT CURRENT_TIMESTAMP,
            prev_hash TEXT,
            entry_hash TEXT NOT NULL
        )
    """)

    conn.commit()
    conn.close()
    print(f"Database initialized successfully at: {DB_PATH}")
    print("Tables created: users, dataset_versions, models, inference_runs, audit_logs")


if __name__ == "__main__":
    init_db()