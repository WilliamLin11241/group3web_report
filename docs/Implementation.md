---
id: Implementation
title: Implementation
---
# Implementation

## Main Tools and Dependencies

## Main Tools and Dependencies

## Pictures will show in html

**OpenVINO** – Intel’s framework used for running neural network models efficiently.  
**Python** – Primary language for implementing detection logic.  
**MFC (Microsoft Foundation Class)** – Used for UI integration and system interaction.  
**C++** – Provides low-level system control where needed.  
**OpenCV** – Used for image processing and visualization.

---

### Hand Detection

The basis of our hand detection is built upon an open-source pre-trained **YOLO-based hand detection** implementation by [Florian Bruggisser](https://github.com/cansik/yolo-hand-detection?tab=readme-ov-file). We extended this implementation to better suit our needs, converting his models to a **YOLOv4 Tiny ONNX** model before converting it to **OpenVINO IR format** to generate a `.xml` and `.bin` version of the files. By converting it into this format, it ensures efficient hand detection in real-time environments as the inferences are made much faster.

### Key Components

- **Model**: `cross-hands-yolov4-tiny.xml` (IR format for OpenVINO)
- **YOLO OpenVINO Inference**: Implemented in `yolo.py` to load and run detections on frames.
- **Confidence Filtering**: Detections are filtered using a confidence threshold of `0.2` and **Non-Maximum Suppression (NMS)** to refine the results.
- **Integration with OpenCV**: OpenCV allows the program to access the webcam and passes frames to the YOLO model to return the coordinates of the bounding boxes around the hands.

### Process Flow

1. **Model Initialization**: OpenVINO loads the model and compiles it for CPU inference.
2. **Frame Capture**: Webcam frames are streamed using OpenCV.
3. **Preprocessing**: Frames are resized and normalized into input blobs.
4. **YOLO Inference**: Blobs are passed to OpenVINO for inference.
5. **Post-processing**: Apply confidence filtering and NMS to keep valid hand detections.
6. **Bounding Box Drawing**: Visual feedback drawn with OpenCV rectangles.

### Inference Breakdown

- **Model Conversion**: Darknet → ONNX → OpenVINO IR (via Model Optimizer).
- **OpenVINO Compiling**: `Core().read_model()` and `compile_model()` are used.
- **Input Shape**: Resized to `416x416` via `cv2.dnn.blobFromImage()`.
- **Execution**: Outputs are raw bounding boxes and confidence scores.
- **NMS Filtering**: Keep top bounding boxes using OpenCV’s `NMSBoxes`.

### Code Snippet: YOLO Inference and Hand Detection

```python
def inference(self, image):
    ih, iw = image.shape[:2]
 
    # Preprocess the image
    blob = cv2.dnn.blobFromImage(image, 1 / 255.0, (self.size, self.size), swapRB=True, crop=False)
    input_tensor = np.array(blob, dtype=np.float32)
 
    # Run inference
    results = self.compiled_model([input_tensor])
 
 
    boxes, confidences = self.process_output(results, iw, ih)
    return boxes, confidences
 
def process_output(self, results, iw, ih):
    boxes_output = results[0].reshape(-1, 4)  # Bounding box coordinates
    confidences_output = results[1].reshape(-1)  # Confidence scores
 
    # Convert bounding boxes back to original image size
    boxes_output[:, [0, 2]] *= iw
    boxes_output[:, [1, 3]] *= ih
    boxes_output = boxes_output.astype(int)
 
    # Apply confidence filtering
    indices = np.where(confidences_output > self.confidence)[0]
    boxes = boxes_output[indices]
    confidences = confidences_output[indices]
 
    # Apply Non-Maximum Suppression (NMS)
    if len(boxes) > 0:
        indices = cv2.dnn.NMSBoxes(boxes.tolist(), confidences.tolist(), self.confidence, self.threshold)
        if len(indices) > 0:
            indices = indices.flatten()
            boxes = boxes[indices]
            confidences = confidences[indices]
 
    return boxes, confidences
```

To enable efficient hand detection in real time, we use the YOLOv4 Tiny model, optimized for speed and lower computational load. This model is converted into OpenVINO IR (Intermediate Representation) format, which includes a .xml and .bin file that OpenVINO can parse and optimize for Intel CPUs.

### Inference Process Breakdown:
 **Model Conversion**: The original YOLOv4 Tiny weights (Darknet format) are converted to ONNX, then to OpenVINO IR format using the mo (Model Optimizer) tool from OpenVINO.

 **Model Loading**: OpenVINO's Core() API reads and compiles the IR model for CPU execution. This compilation process optimizes the inference graph for faster runtime.

**Image Preprocessing**: Frames are resized and normalized using OpenCV’s cv2.dnn.blobFromImage to produce a 416x416 input blob. Pixel values are scaled to [0,1] and the channel order is adjusted to match the model’s training configuration.

**Inference Execution**: The preprocessed image blob is passed to OpenVINO’s compiled model. The result is a pair of tensors: Bounding boxes for detected objects and Confidence scores for each detection

**Post-Processing**: We reshape the output tensors, rescale the coordinates to match the original frame, and apply a confidence filter (> 0.2). Finally, we use OpenCV’s NMSBoxes function to perform Non-Maximum Suppression, keeping only distinct hand detections.

This allows our application to run detection reliably at high speed, even on school-grade Intel hardware.

---

## Card Detection

To implement this feature, we used a clever workaround where once we detect a hand in frame, we then search for the card in a **Region of Interest (ROI)** above the middle of the hand. The program then checks the pixels in said region and picks the most dominant colour. These values are then written to a .txt file which is read by the program to display on the frontend to the user.

### Key Components

- **HSV Color Ranges**: Defined for red, yellow, green, and blue.
- **Gaussian Blur**: Applied to smooth the image before processing.
- **Thresholding**: Used to create masks for each color.
- **Color Area Filtering**: Ensures detected color occupies a minimum percentage of the object’s area.
- **Morphological Processing**: Erosion and dilation on the image improve detection accuracy.


### Process Flow 

- **Detection from YOLO**: A detected hand’s bounding box is extracted from the YOLO output.
- **Region Cropping**: The card’s region is cropped from the original frame by searching above the hand.
- **HSV Conversion**: The cropped region is converted from BGR to HSV color space.
- **Preprocessing**: Gaussian blur is applied to reduce noise.
- **Color Masking**: Predefined HSV thresholds for red, yellow, green, and blue are applied to create binary masks.
- **Pixel Count Analysis**: The number of pixels matching each color is counted.
- **Classification**: The color with the highest count is assigned as the detected card color if it exceeds the minimum threshold.
- **Logging**: Detected colors are written to the .txt file for tracking purposes.
- **Visualization**: Detected cards are labeled with a bounding box in their color.

```python
# HSV Color Ranges
COLOR_RANGES = {
    "red": [((0, 100, 100), (10, 255, 255)), ((160, 100, 100), (179, 255, 255))],
    "yellow": [((20, 100, 100), (30, 255, 255))],
    "green": [((35, 50, 50), (85, 255, 255))],
    "blue": [((90, 50, 50), (140, 255, 255))]
}

def detect_card_color(hsv_region, min_area_ratio=0.05):
    hsv_blur = cv2.GaussianBlur(hsv_region, (5, 5), 0)
    total_area = hsv_region.shape[0] * hsv_region.shape[1]
    color_counts = {c: 0 for c in COLOR_RANGES.keys()}

    for color, ranges in COLOR_RANGES.items():
        combined_mask = np.zeros(hsv_region.shape[:2], dtype=np.uint8)

        # Applying morphological operations
        for lower, upper in ranges:
            mask = cv2.inRange(hsv_blur, np.array(lower), np.array(upper))
            mask = cv2.erode(mask, None, iterations=1)
            mask = cv2.dilate(mask, None, iterations=1)
            combined_mask = cv2.bitwise_or(combined_mask, mask)
        color_counts[color] = cv2.countNonZero(combined_mask)

    best_color = max(color_counts, key=color_counts.get)
    max_pixels = color_counts[best_color]
    return best_color if max_pixels >= min_area_ratio * total_area else None
```
- This function takes an HSV image region and determines which of the predefined color ranges is most dominant. 

- The region is blurred using a Gaussian filter to reduce noise, and binary masks are generated for each color range using`cv2.inRange`. 

- Morphological operations (erosion and dilation) help clean the mask, enhancing accuracy. 

- The number of non-zero pixels is counted for each color mask, and the color with the highest pixel count is selected—provided it exceeds a minimum area threshold. 

This allows the system to classify card colors accurately in real time, even under varying lighting conditions.



---

### Tabletop Mode

The **tabletop mode** is designed for users with reduced motor functions. Rather than holding a card up, the user would move their hand near or on their selected card on the table. This feature greatly increased the usability of our application and helps drive engagement in scenarios that we had not initially considered.

*** [DEMO VIDEO, DOESNT WORK IN DOCUSAURUS ] ***

We implemented this feature by changing the relative direction of the region of interest (ROI) in the frame that is passed to the YOLO model. It only required **one line of code** to be modified.
```python
SHIFT_UP_FACTOR = 0.8
if mode == "Table Top Card Counting":
    SHIFT_UP_FACTOR *= -1
```


When the user selects the tabletop option, the application writes the value of **–1** to the `mode` file. This is checked in `colour_write`, and if so, it changes the direction of where the region of interest would be situated in the image. The rest of the colour detection logic remains **unchanged**.

---

## Saving Results

---
## State Monitoring and System Control

---

### Output Logging and File Management

- Card Colors: `card_counts.txt`
- Hand Counts: `hand_counts.txt`

The system writes results to the output files every **0.5 seconds**.

**Code Snippet:** _[Insert logic that checks last write time]_

---

### Quiz Generator

One feature of the app we decided to include was an **LLM (Large Language Model)** which generates multiple choice quizzes based on a given input text, such as one found in a textbook describing either a scientific concept, or fact of some kind. 

The first main step of this was to decide where to begin. We looked towards the HuggingFace model library to find a suitable model for this task. The model needed to have a wide breadth of knowledge across multiple topics to properly generate the quizzes. We switched between models a lot, depending on which would perform better given a series of prompts, and eventually settled on **google/flan-t5-base** for its low file size, large parameter counts and hence extensive knowledge.

However, one major problem we encountered with testing these models on inputs ranging different lengths and topics was **inconsistencies within the output**. Outputs would range from generating blank outputs, nonsense, correct quizzes but in strange formats. All of these made post processing of the quiz output extremely frustrating due to the unpredictability of the output, and hence inconsistent writing to files and improper frontend backend interaction.

A fix we thought of to combat this, was to gather hundreds of input and output data in the form we wanted it to be, and fine tune the model on this input data, leaving some for validation data, so that the model can then learn on the precise information we want it to know. The following code demonstrates how this was achieved.

- [Explain Code]  
- [imports]  
- [load datasets, show example of data]  
- [load model]  
- [preprocessing function]  
- [training]  
- [save model]  

Having fine tuned it, we could then run the model inference and test the output.

- [show inference code]

After testing this new fine-tuned model, we realised that while the output is consistent in format, the quizzes often have **repeated options**, and **incorrect answers**. 

To fix this, we decided to switch to **flan-t5-large** due to its increased parameter count over its base model, hoping that it would be able to draw more information from a wider range of topics.


