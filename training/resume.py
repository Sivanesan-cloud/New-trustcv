from ultralytics import YOLO

def main():
    model = YOLO(r"C:\TRUSTCV\New-trustcv\models\helmet_final\weights\last.pt")
    results = model.train(resume=True)

if __name__ == '__main__':
    main()