import sqlite3

conn = sqlite3.connect("database/trustcv.db")
cursor = conn.cursor()

print("=== USERS ===")
for row in cursor.execute("SELECT username, role FROM users"):
    print(row)

print("\n=== MODELS ===")
for row in cursor.execute("SELECT model_id, name, sha256, status FROM models"):
    print(row)

print("\n=== INFERENCE RUNS ===")
for row in cursor.execute("SELECT inference_id, input_hash, output_hash, user FROM inference_runs"):
    print(row)

conn.close()