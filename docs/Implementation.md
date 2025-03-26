---
id: Implementation
title: Implementation
---
# Implementation

## Main Tools and Dependencies

- **OpenVINO** – Intel’s framework used for running neural network models efficiently.  
- **Python** – Primary language for implementing detection logic.  
- **MFC (Microsoft Foundation Class)** – Used for UI integration and system interaction.  
- **C++** – Provides low-level system control where needed.  
- **OpenCV** – Used for image processing and visualization.

---

### Hand Detection

The basis of our hand detection is built upon an open-source pre-trained **YOLO-based hand detection** implementation by [Florian Bruggisser](https://github.com/cansik/yolo-hand-detection?tab=readme-ov-file). We extended this implementation to better suit our needs, converting his models to a **YOLOv4 Tiny ONNX** model before converting it to **OpenVINO IR format** to generate a `.xml` and `.bin` version of the files. By converting it into this format, it ensures efficient hand detection in real-time environments as the inferences are made much faster.


### Key Components

- **Model**: `cross-hands-yolov4-tiny.xml` (IR format for OpenVINO)

- **YOLO OpenVINO Inference**: Implemented in `yolo.py` to load and run detections on frames.

- **Confidence Filtering**: Detections are filtered using a confidence threshold of `0.5` and **Non-Maximum Suppression (NMS)** to refine the results.

- **Integration with OpenCV**: OpenCV allows the program to access the webcam and passes frames to the YOLO model to return the coordinates of the bounding boxes around the hands.


### Process Flow (with diagram)

1. **Model Initialization**: OpenVINO loads the model and it is compiled for the CPU using OpenVINO’s inference engine.

2. **Frame Capture**: Frames are captured in real time from a webcam using OpenCV.

3. **YOLO Inference**: The frame is preprocessed and passed through the YOLO model for detection.

4. **Post-processing**: Detected hand regions are extracted, filtered using a confidence threshold, and processed using **Non-Maximum Suppression (NMS)** to remove redundant detections.

5. **Bounding Box Drawing**: Detected hands are visualized on the frame using OpenCV’s drawing functions.

6. **State Monitoring**: A background thread checks for a system shutdown command and stops the process if required by reading from `state.txt`.

 Code Implementation (YOLO Inference)

> _Snippet of code where YOLO inference is initialized will be shown here (e.g. from `yolo.py`)_

---

## Card Detection

To implement this feature, we used a clever workaround where once we detect a hand in frame, we then search for the card in a **Region of Interest (ROI)** above the middle of the hand. The program then checks the pixels in said region and picks the most dominant colour. These values are then written to a JSON file which is read by the program to display on the frontend to the user.

### Key Components

- **HSV Color Ranges**: Defined for red, yellow, green, and blue.
- **Gaussian Blur**: Applied to smooth the image before processing.
- **Thresholding**: Used to create masks for each color.
- **Color Area Filtering**: Ensures detected color occupies a minimum percentage of the object’s area.
- **Morphological Processing**: Erosion and dilation on the image improve detection accuracy.


### Process Flow (with diagram)

- **Detection from YOLO**: A detected hand’s bounding box is extracted from the YOLO output.
- **Region Cropping**: The card’s region is cropped from the original frame by searching above the hand.
- **HSV Conversion**: The cropped region is converted from BGR to HSV color space.
- **Preprocessing**: Gaussian blur is applied to reduce noise.
- **Color Masking**: Predefined HSV thresholds for red, yellow, green, and blue are applied to create binary masks.
- **Pixel Count Analysis**: The number of pixels matching each color is counted.
- **Classification**: The color with the highest count is assigned as the detected card color if it exceeds the minimum threshold.
- **Logging**: Detected colors are written to the JSON file for tracking purposes.
- **Visualization**: Detected cards are labeled with a bounding box in their color.

> *[Insert snippet of code with HSV ranges here]*

---

### Tabletop Mode

The **tabletop mode** is designed for users with reduced motor functions. Rather than holding a card up, the user would move their hand near or on their selected card on the table. This feature greatly increased the usability of our application and helps drive engagement in scenarios that we had not initially considered.

 *[Demo Video of Tabletop Mode]*

We implemented this feature by changing the relative direction of the region of interest (ROI) in the frame that is passed to the YOLO model. It only required **one line of code** to be modified.

 *[Insert snippet of code for tabletop mode]*

When the user selects the tabletop option, the application writes the value of **–1** to the `mode` file. This is checked in `colour_write`, and if so, it changes the direction of where the region of interest would be situated in the image. The rest of the colour detection logic remains **unchanged**.


---

### Keyboard Interactions

By integrating interactions between the keyboard and the application, we have expanded our project greatly. There are multiple features that have been added using keyboard inputs.

Firstly, by hitting the space bar the video input would freeze, and the current counts of the cards would be held regardless of whether or not the students drop the cards out of frame afterwards. This is held until the teacher hits the space bar again. This allows the teacher to control the pacing of the quiz and have ample time to save the counts to their device without the risk of students dropping their cards before the teacher saves the values.

[C CODE SNIPPET where it checks for space bar and writes to a file]

When the user presses the space bar, the program will write to the state file and change the state to –1. This will then freeze the image and hold the current state of each of the colour counts.


Another feature that was requested in the final few weeks of development was to modify our program so that people using switches were also able to take part in HandsUp!. After discussing it with our supervisor and teachers from the [FORGOT THE NAME OF THE SCHOOL], we were instructed to simply add a feature where the z,x,c,v keys are mapped to increment blue, red, green and yellow respectively [CORRECT THE ORDER]. This feature meant that teachers can map inputs from the students switches onto these keys to allow them to interact with the game alongside students that are able to utilise the cards.

[CODE SNIPPET]

To reset this counter the teacher



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

### Implementation – Darknet to ONNX Conversion Pipeline

The conversion from Darknet YOLO to ONNX format is aiming to integrate the hand detection model into a more flexible inference pipeline. However, the process proved to be non-trivial due to configuration nuances and dependency compatibility issues.

#### The toolchain and dependencies used are summarized below:
| Tool / Library     | Version               |
|--------------------|------------------------|
| Python             | 3.8 (via Miniconda)    |
| PyTorch            | 1.8.0                  |
| TorchVision        | 0.9.0                  |
| ONNX               | latest                 |
| ONNX Runtime       | latest                 |
| OpenCV             | latest                 |
| CUDA               | 10.2                   |
| cuDNN              | Compatible with CUDA 10.2 |

#### Environment Setup

We used **Miniconda** to manage Python environments for better control over dependency versions. The specific environment was created as follows:

```bash
conda create -n pytorch16_env python=3.8 -y
conda activate pytorch16_env
pip install torch==1.8.0 torchvision==0.9.0 torchaudio==0.8.0 -f https://download.pytorch.org/whl/torch_stable.html
pip install onnx onnxruntime opencv-python numpy
```

### Files Required for Conversion

Before conversion, the following files are required:

- `cross-hands-yolov4-tiny.cfg`: YOLO configuration file
- `cross-hands-yolov4-tiny.weights`: Pretrained weights
- `cross-hands-yolov4-tiny.names`: Class names (e.g. `hand`)
- A sample input image (e.g. `hand.jpg`)
- Batch size parameter

> **Note:**  
> If `batch size > 0`, the exported ONNX model will have **static** batch size.  
> If `batch size ≤ 0`, it will be **dynamic**.

### Modifications to Configuration File

One of the major challenges was ensuring the correct scaling behavior in the YOLO `.cfg` file. The original file contained:

```ini
scales=.1,.1
```

This aggressive scaling caused the model to underperform or even fail to export. We modified the following parameters for better performance and compatibility:

```ini
scales=0.5,0.5
scale_x_y = 1.1   ; added to avoid KeyError during export
resize = 1.5    ; improves bounding box size consistency
```

### Model Conversion Process

After several iterations, we successfully exported a functional ONNX model and verified its correctness using ONNX Runtime and visual inspection of bounding boxes.

We leveraged the official [pytorch-YOLOv4 repository](https://github.com/Tianxiaomo/pytorch-YOLOv4) for the conversion, particularly the `tool` folder and the `demo_darknet2onnx.py` script, which greatly facilitated the Darknet-to-ONNX transformation.

After ensuring the configuration was correct, we cloned the `demo_darknet2onnx.py` conversion scripts and `tool` folder, then ran the export script:

```bash
python demo_darknet2onnx.py <cfgFile> <namesFile> <weightFile> <imageFile> <batchSize>
```
### Common Issues Encountered During Conversion

During the conversion, heres are some common several issues that may encountered:

- **Missing `scale_x_y` in the configuration file**  
  This caused a `KeyError` during export. It was resolved by manually adding the `scale_x_y` parameter.

- **ONNX export failure**  
  This was fixed by explicitly setting the `opset_version` to 11 during the export process.

- **NaN values in the model outputs**  
  We discovered this issue after exporting. It was resolved by checking the model weights and re-exporting from a clean `.weights` file.

- **Incorrect bounding boxes in prediction results**  
  This was addressed by tuning parameters such as `scale_x_y` and `resize` in the configuration file to improve prediction quality.

After iterating through these fixes, we successfully exported a working ONNX model and validated its functionality using ONNX Runtime and visual inspection of the prediction results.


##  ONNX Model Inference and Postprocessing

Once the model was successfully converted, we built an inference script using **ONNX Runtime**. The input image is:

- Resized to the expected input shape `[1, 3, 416, 416]`
- Normalized to the range `[0, 1]`
- Passed into the ONNX model for inference

The model outputs two arrays:

- **`boxes`**: containing bounding box coordinates  
- **`confs`**: containing objectness scores

We apply **post-processing**, including:

- **Confidence thresholding**
- **Non-Maximum Suppression (NMS)**

These steps filter out low-confidence or overlapping predictions. The final detection results are visualized and saved as `predictions_onnx.jpg`.

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

