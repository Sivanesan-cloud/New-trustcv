from pathlib import Path
import hashlib
import json
from datetime import datetime

DATASET = Path(r"E:\TrustCV\dataset\helmet")
OUTPUT = Path(r"E:\TrustCV\manifests\dataset_manifest.json")


def calculate_sha256(file_path):
    sha256 = hashlib.sha256()

    with open(file_path, "rb") as file:
        while chunk := file.read(1024 * 1024):
            sha256.update(chunk)

    return sha256.hexdigest()


manifest = {
    "dataset": "Safety Helmet Detection",
    "created_at": datetime.now().isoformat(),
    "files": []
}

for split in ["train", "valid", "test"]:
    split_path = DATASET / split

    for file_path in split_path.rglob("*"):
       if file_path.is_file() and file_path.suffix.lower() != ".cache":

            file_hash = calculate_sha256(file_path)

            relative_path = file_path.relative_to(DATASET)

            manifest["files"].append({
                "path": str(relative_path).replace("\\", "/"),
                "sha256": file_hash,
                "size": file_path.stat().st_size
            })

            print(f"Hashed: {relative_path}")


with open(OUTPUT, "w", encoding="utf-8") as file:
    json.dump(manifest, file, indent=4)

print("\n==============================")
print("DATASET MANIFEST CREATED")
print("==============================")
print(f"Total files: {len(manifest['files'])}")
print(f"Manifest: {OUTPUT}")