import json
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

USERS_PATH = r"C:\TRUSTCV\New-trustcv\backend\users.json"

users = [
    {"username": "admin", "password": "admin123", "role": "ADMIN"},
    {"username": "operator1", "password": "operator123", "role": "OPERATOR"}
]

output = {"users": []}
for u in users:
    output["users"].append({
        "username": u["username"],
        "password_hash": pwd_context.hash(u["password"]),
        "role": u["role"]
    })

with open(USERS_PATH, "w") as f:
    json.dump(output, f, indent=4)

print("Users created with hashed passwords.")