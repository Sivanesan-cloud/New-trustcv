import sqlite3
import hashlib

DB_PATH = r"C:\TRUSTCV\New-trustcv\database\trustcv.db"


def compute_entry_hash(username, action, asset_type, asset_id, details, prev_hash):
    raw = f"{username}|{action}|{asset_type}|{asset_id}|{details}|{prev_hash}"
    return hashlib.sha256(raw.encode()).hexdigest()


def verify_chain():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM audit_logs ORDER BY id ASC")
    rows = cursor.fetchall()
    conn.close()

    if not rows:
        print("No audit log entries found.")
        return

    expected_prev = "GENESIS"
    for row in rows:
        recomputed = compute_entry_hash(
            row["username"], row["action"], row["asset_type"],
            row["asset_id"], row["details"], row["prev_hash"]
        )
        if row["prev_hash"] != expected_prev:
            print(f"BROKEN CHAIN at entry {row['id']}: prev_hash mismatch")
            print(f"  Expected prev_hash: {expected_prev}")
            print(f"  Found prev_hash   : {row['prev_hash']}")
            return
        if recomputed != row["entry_hash"]:
            print(f"TAMPERING DETECTED at entry {row['id']}: entry_hash mismatch")
            print(f"  Stored entry_hash    : {row['entry_hash']}")
            print(f"  Recomputed entry_hash: {recomputed}")
            return
        expected_prev = row["entry_hash"]

    print(f"AUDIT CHAIN VERIFIED - {len(rows)} entries, all intact.")


if __name__ == "__main__":
    verify_chain()