import sqlite3

DB_PATH = r"C:\TRUSTCV\New-trustcv\database\trustcv.db"

conn = sqlite3.connect(DB_PATH)
cursor = conn.cursor()

# Simulate tampering: change the username on entry id=2
cursor.execute("UPDATE audit_logs SET username = 'hacker' WHERE id = 2")

conn.commit()
conn.close()
print("Audit log entry 2 has been tampered with (username changed).")