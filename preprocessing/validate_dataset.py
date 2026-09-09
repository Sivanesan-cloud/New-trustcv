from pathlib import Path
# pyrefly: ignore [missing-import]
from PIL import Image

DATASET = Path(r"C:\TRUSTCV\New-trustcv\DATASET")

splits = ["train", "valid", "test"]

valid_classes = {0, 1, 2}

total_images = 0
total_labels = 0
problems = []

for split in splits:
    image_dir = DATASET / split / "images"
    label_dir = DATASET / split / "labels"

    print(f"\nChecking {split.upper()}...")

    images = list(image_dir.glob("*"))
    labels = list(label_dir.glob("*.txt"))

    image_stems = {x.stem for x in images}
    label_stems = {x.stem for x in labels}

    # Check missing labels
    for image in images:
        if image.stem not in label_stems:
            problems.append(
                f"MISSING LABEL: {split}/{image.name}"
            )

    # Check missing images
    for label in labels:
        if label.stem not in image_stems:
            problems.append(
                f"MISSING IMAGE: {split}/{label.name}"
            )

    # Check images
    for image_path in images:
        try:
            with Image.open(image_path) as img:
                img.verify()
            total_images += 1
        except Exception:
            problems.append(
                f"CORRUPT IMAGE: {split}/{image_path.name}"
            )

    # Check labels
    for label_path in labels:
        total_labels += 1

        try:
            lines = label_path.read_text().strip().splitlines()

            for line_number, line in enumerate(lines, start=1):

                if not line.strip():
                    continue

                values = line.split()

                if len(values) != 5:
                    problems.append(
                        f"INVALID FORMAT: {split}/{label_path.name} "
                        f"line {line_number}"
                    )
                    continue

                class_id = int(values[0])
                x, y, width, height = map(float, values[1:])

                if class_id not in valid_classes:
                    problems.append(
                        f"INVALID CLASS: {split}/{label_path.name} "
                        f"class={class_id}"
                    )

                if not (0 <= x <= 1):
                    problems.append(
                        f"INVALID X: {split}/{label_path.name}"
                    )

                if not (0 <= y <= 1):
                    problems.append(
                        f"INVALID Y: {split}/{label_path.name}"
                    )

                if not (0 < width <= 1):
                    problems.append(
                        f"INVALID WIDTH: {split}/{label_path.name}"
                    )

                if not (0 < height <= 1):
                    problems.append(
                        f"INVALID HEIGHT: {split}/{label_path.name}"
                    )

        except Exception as e:
            problems.append(
                f"INVALID LABEL: {split}/{label_path.name} - {e}"
            )

print("\n==============================")
print("DATASET VALIDATION REPORT")
print("==============================")

print(f"Valid images checked : {total_images}")
print(f"Labels checked       : {total_labels}")
print(f"Problems found       : {len(problems)}")

if problems:
    print("\nPROBLEMS:")
    for problem in problems[:100]:
        print(problem)

    if len(problems) > 100:
        print(f"\n... and {len(problems) - 100} more")

    print("\nDataset needs attention.")
else:
    print("\n✓ Dataset validation PASSED")
    print("✓ Images are readable")
    print("✓ Labels have valid YOLO format")
    print("✓ Class IDs are valid")
    print("✓ Bounding boxes are valid")