from ultralytics import YOLO

# Load model
model = YOLO('best.pt')

# Set model parameters
model.overrides['conf'] = 0.25  # NMS confidence threshold
model.overrides['iou'] = 0.45  # NMS IoU threshold
model.overrides['agnostic_nms'] = False  # NMS class-agnostic
model.overrides['max_det'] = 1000  # Maximum number of detections per image

# Set image
image = 'banana.png'

# Perform inference
results = model.predict(image)

# Get detected classes
detected_classes = [int(box.cls) for box in results[0].boxes]

# Define cotton class ID (change this to match your model's class index for cotton)
COTTON_CLASS_ID = 10  

# Check if cotton is detected
if COTTON_CLASS_ID in detected_classes:
    print(0)  # Output 0 if cotton is detected (even if other objects are present)
else:
    print(1)  # Output 1 if only non-cotton objects are detected

print("Detected Classes:", detected_classes)
