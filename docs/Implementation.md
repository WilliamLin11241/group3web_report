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

Unfortunately, due to time constraints we were unable to fully integrate this part of the project into the app. Given another week, it would be more than feasible to accomplish. This part of the project was the LLM quiz generator. We managed to get a fully compiled version of it, but didn’t quite manage to integrate it in the front end. Below is how we implemented the LLM.

**Choosing an LLM model**

Due to this app already having many components to it, we were very limited on the size of the model we could use for the quiz generator. However problems we encountered with very small models, ~2GB in size, was that it simply didn’t have enough parameters, therefore knowledge to properly generate quizzes. Eventually we settled on an 11GB text2text generation model called google/flan-t5-xl.

**Testing and Training**

Once we chose the LLM, we tried prompt engineering to obtain the desired output. However, it was very inconsistent in its output and was very difficult to parse in order to be used with the front end. We eventually had the idea to fine tune the model, to more frequently achieve the correct format. To fine tune it, I obtained a specific set of json files using various resources such as Kahoot, and made them into the following format: 

```python
[
    {
        "text": """A coral reef is a colorful underwater habitat made by tiny animals called corals.
        These corals build hard skeletons that form reefs over many years.
        Coral reefs are home to many fish and sea creatures.
        They need clean, warm water and sunlight to stay healthy.""",

        "response": """Q: What are coral reefs made by?
        \nA) Giant sea turtles\nB) Small animals called corals
        \nC) Floating pieces of wood\nD) Electricity from eels\nAns) B"""
    }
]
```

This has a “text”, which is the input the teacher would give, and reference “response” in the form of a quiz, which specifies the question, 4 multiple choice answers, and the correct answer.

We gathered this training data, and set aside some more examples for validation data, and processed them in the code like so:

```python
dataset = load_dataset(
    'json',
    data_fils={
        'train': 'trainingdata.json',
        'validation: 'validationdata.json'
    }
)
```

Then I loaded the model from the HuggingFace website, and created a preprocess function which takes a given prompt, which includes the correct quiz format, and other information to generate the quiz, and then prepares it to be trained on. We create a tokenizer for the model, and use the Seq2Seq method since we are implementing a text to text generation LLM.

We then use the quiz format and the input prompt alongside the training data, to define targets in the form of the response. This clearly defines the input and target output for the model to learn from. The following code creates a list of inputs into the training of the LLM, which contain the prompt, and the text it needs to compute the quiz output.

```python
model_name = "google/flan-t5-xl"

tokenizer = AutoTokenizer.from_pretrained(
    model_name,
    use_fast=False
)
model = AutoModelForSeq2SeqLM.from_pretrained(model_name)

def preprocess_function(examples):
    # input, examples, is expecting a dictionary of our training data with two keys: "text" and "response"
    quizformat = "Q: [Question]\nA) [option 1]\nB) [option 2]\nC)" \
                 "[option 3]\nD) [option 4]\nAns) [answer]"
    inputs = examples["text"]
    inputs = [f"""You are a knowledgeable assistant with extensive knowledge on""" 
               """the given factual text. Generate a multiple choice quiz specifying the"""
               """question, 4 distinct options, and the true answer in this format: """
               """{quizformat}, ensuring the four options A) B) C) D) are all different, and""" 
               """ensuring Ans) gives the factually correct answer to the question Q, """
               """and ensuring there is only one correct option, for the following """
               """factual text: {inp}""" for inp in inputs]
```

Finally we define some arguments for training, ensuring the number of epochs we train on is enough to properly process the dataset.

```python
training_args = TrainingArguments(
    output_dir="quiz",
    eval_strategy="epoch",
    learning_rate=2e-5,
    per_device_train_batch_size=4,
    per_device_eval_batch_size=4,
    num_train_epochs=3,
    weight_decay=0.01,
    logging_steps=50,
    save_steps=200,
    save_total_limit=2,
)
```

And then we begin the process of training, specifying the training – testing data split, the model and tokenzier, the training arguments previously defined and a data collator.

```python
data_collator = DataCollatorForSeq2Seq(tokenizer, model=model)
trainer = Trainer(
    model=model,
    agrs=training_args,
    train_dataset=processed_dataset["train"],
    eval_dataset=processed_dataset["validation"],
    tokenzier=tokenizer,
    data_collator=data_collator,
)
trainer.train()
```

We train and save our new model under a name which makes it clear which model we fine-tuned, along with the version number of that model.

```python
version = 1
index = model_name.index("/")
model_name = model_name[:index] + "-" + model_name[index+1:]
trained_model_name = f"trainedmodel{version}-{model_name}"
trainer.save_model(trained_model_name)
tokenizer.save_pretrained(trained_model_name)
```

**Quantising and converting to OpenVINO**

We realised that the model is far too big to deploy in its current state, but since deciding on that large 11GB model, we already had plans to quantise it. OpenVINO has a very handy way to convert any model from HuggingFace to OpenVINO format, and in the process you can either 4bit or 8bit quantise. 
Using this command: 

optimum-cli export openvino --model MODEL_PATH --task text2text-generation --library transformers --weight-format int4 MODEL_NAME

we managed to convert the model to OpenVINO format, and quantise it in the process, getting the size down to 1.51GB, which is a much more manageable size than 10GB for distribution of a classroom app.

A side note on quantising, we tested both 8bit and 4bit quantisation as we did not know how much inference power would be lost when quantising. But as it turns out even when doing a 4bit quantisation, the inference stayed almost the exact same. It was slightly different on vague bits of texts which didnt clearly get any kind of message across, but the results for clear, precise and factually accurate texts were the same - the same quiz was generated from both the base OpenVINO model and the 4bit model.

**Compilation**

It was very tricky to compile the OpenVINO model. Due to all the dependencies that optimum needs, they may not all work well with each other in certain cases. I have documented a step-by-step instruction manual on how I managed to compile this model and get it into a single executable using pyinstaller. 

-	Create virtual environment
-	Due to dependencies not agreeing with each other, I was forced to modify a source code file: 

    - In “.venv\Lib\site-packages\optimum\exporters\tasks.py” in the function on line 1951, I had to force use transformers using 
        - inferred_library_name = "transformers"
        - return inferred_library_name

-	Then we installed pyinstaller
    - pip install pyinstaller

-	and finally run the following command to compile
    - pyinstaller --onefile --noconsole QuizGen.py --add-data "MODEL_NAME;MODEL_NAME " --hidden-import=optimum.intel.openvino --hidden-import=transformers --hidden-import=openvino --add-binary ".venv\Lib\site-packages\openvino\libs\*.dll;." --collect-submodules openvino --collect-binaries openvino --collect-data openvino

Finally, once compiled, it returns an executable file which runs the model, and allows text to be input, to produce a quiz output.

This executable also has a functionality to save the quiz, and allow it for easy storing for later. By writing to a text file, it saves this text file in the same directory as the executable is in, allowing for simple access to the quiz if the app is closed.