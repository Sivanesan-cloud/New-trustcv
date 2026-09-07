from pathlib import Path
import hashlib
import json

DATASET = Path(r"E:\TrustCV\dataset\helmet")
MANIFEST = Path(r"E:\TrustCV\manifests\dataset_manifest.json")


def calculate_sha256(file_path):
    sha256 = hashlib.sha256()

    with open(file_path, "rb") as file:
        while chunk := file.read(1024 * 1024):
            sha256.update(chunk)

    return sha256.hexdigest()


# Load trusted manifest
with open(MANIFEST, "r", encoding="utf-8") as file:
    manifest = json.load(file)


trusted_files = {
    item["path"]: item["sha256"]
    for item in manifest["files"]
}

current_files = {}

# Scan current dataset
for split in ["train", "valid", "test"]:
    split_path = DATASET / split

    for file_path in split_path.rglob("*"):
        if file_path.is_file() and file_path.suffix.lower() != ".cache":

            relative_path = str(
                file_path.relative_to(DATASET)
            ).replace("\\", "/")

            current_files[relative_path] = calculate_sha256(file_path)


unchanged = []
modified = []
added = []
deleted = []

# Check current files
for path, current_hash in current_files.items():

    if path not in trusted_files:
        added.append(path)

    elif current_hash != trusted_files[path]:
        modified.append(path)

    else:
        unchanged.append(path)


# Check deleted files
for path in trusted_files:
    if path not in current_files:
        deleted.append(path)


# Report
print("\n==============================")
print("TRUSTCV DATASET INTEGRITY REPORT")
print("==============================")

print(f"Unchanged : {len(unchanged)}")
print(f"Modified  : {len(modified)}")
print(f"Added     : {len(added)}")
print(f"Deleted   : {len(deleted)}")

print("\n------------------------------")

if modified:
    print("\nMODIFIED FILES:")
    for path in modified[:20]:
        print(f"  🔴 {path}")

if added:
    print("\nADDED FILES:")
    for path in added[:20]:
        print(f"  🟠 {path}")

if deleted:
    print("\nDELETED FILES:")
    for path in deleted[:20]:
        print(f"  🔵 {path}")

print("\n==============================")

if not modified and not added and not deleted:
    print("STATUS: ✅ DATASET INTEGRITY VERIFIED")
else:
    print("STATUS: ⚠️ DATASET INTEGRITY VIOLATION")

print("==============================")