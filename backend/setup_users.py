import json
import bcrypt

USERS_PATH = r"C:\TRUSTCV\New-trustcv\backend\users.json"

users = [
    {"username": "admin", "password": "admin123", "role": "ADMIN"},
    {"username": "operator1", "password": "operator123", "role": "OPERATOR"}
]

output = {"users": []}
for u in users:
    hashed = bcrypt.hashpw(u["password"].encode("utf-8"), bcrypt.gensalt()).decode("utf-8")
    output["users"].append({
        "username": u["username"],
        "password_hash": hashed,
        "role": u["role"]
    })

with open(USERS_PATH, "w") as f:
    json.dump(output, f, indent=4)

print("Users created with hashed passwords successfully!")