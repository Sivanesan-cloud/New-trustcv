import sqlite3

DB_PATH = r"C:\TRUSTCV\New-trustcv\database\trustcv.db"

conn = sqlite3.connect(DB_PATH)
cursor = conn.cursor()

# Restore original username
cursor.execute("UPDATE audit_logs SET username = 'admin' WHERE id = 2")

conn.commit()
conn.close()
print("Audit log entry 2 restored.")