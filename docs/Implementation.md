---
id: Implementation
title: Implementation
---
# Implementation

## Main Tools and Dependencies

## Pictures will show in html

**OpenVINO** – Intel’s framework used for running neural network models efficiently.  
**Python** – Primary language for implementing detection logic.  
**MFC (Microsoft Foundation Class)** – Used for UI integration and system interaction.  
**OpenCV** – Used for image processing and visualization.

---

## Python


### Hand Detection

The basis of our hand detection is built upon an open-source pre-trained **YOLO-based hand detection** implementation by [Florian Bruggisser](https://github.com/cansik/yolo-hand-detection?tab=readme-ov-file) [1]. We extended this implementation to better suit our needs, converting his models to a **YOLOv4 Tiny ONNX** model before converting it to **OpenVINO IR format** to generate a `.xml` and `.bin` version of the files. By converting it into this format, it ensures efficient hand detection in real-time environments as the inferences are made much faster.

#### Key Components

- **Model**: `cross-hands-yolov4-tiny.xml` (IR format for OpenVINO)
- **YOLO OpenVINO Inference**: Implemented in `yolo.py` to load and run detections on frames.
- **Confidence Filtering**: Detections are filtered using a confidence threshold of `0.2` and **Non-Maximum Suppression (NMS)** to refine the results.
- **Integration with OpenCV**: OpenCV allows the program to access the webcam and passes frames to the YOLO model to return the coordinates of the bounding boxes around the hands.

#### Process Flow

1. **Model Initialization**: OpenVINO loads the model and compiles it for CPU inference.
2. **Frame Capture**: Webcam frames are streamed using OpenCV.
3. **Preprocessing**: Frames are resized and normalized into input blobs.
4. **YOLO Inference**: Blobs are passed to OpenVINO for inference.
5. **Post-processing**: Apply confidence filtering and NMS to keep valid hand detections.
6. **Bounding Box Drawing**: Visual feedback drawn with OpenCV rectangles.

#### Inference Breakdown

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

### Card Detection

To implement this feature, we used a clever workaround where once we detect a hand in frame, we then search for the card in a **Region of Interest (ROI)** above the middle of the hand. The program then checks the pixels in said region and picks the most dominant colour. These values are then written to a .txt file which is read by the program to display on the frontend to the user.

#### Key Components

- **HSV Color Ranges**: Defined for red, yellow, green, and blue.
- **Gaussian Blur**: Applied to smooth the image before processing.
- **Thresholding**: Used to create masks for each color.
- **Color Area Filtering**: Ensures detected color occupies a minimum percentage of the object’s area.
- **Morphological Processing**: Erosion and dilation on the image improve detection accuracy.

#### Process Flow

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
### Modes

The various modes avaialable in the app have been detailed below. During initialisation, the Python script reads the `mode.txt` file to determine the current mode of the app, corresponding to one of the below, with the value modifying the functionality of the script:

#### Card Counting Mode

The **card counting** mode is designed to display the number of cards of each colour detected in a live setting. For example, if a green card was to be lifted in view of the camera, the corresponding green count would be incremented by 1. As soon as a card drops out of the visible frame, the associated count would then be decremented, in live time.

The results of the inference on the latest frame of the inference are saved to `card_counts.txt`, with throttling applied. This throttle is set to `0.1 seconds`, to prevent being overly sensitive to dropouts in the detection results and avoiding excessive writes, whilst still being very responsive to real-time movements:

```Python
if (time.time() - last_write_time >= 0.1) and state == 0:
      with open(CARD_COUNTS_FILE, "w") as file:
          file.write(f"{color_counts['red']} {color_counts['green']} {color_counts['yellow']} {color_counts['blue']}")
```

The Python side utilises multithreading. One thread is responsible for running the detection inference, whereas another thread serves the purpose of monitoring the current state, by tracking the contents of the `state.txt` file. This file is updated via the C++ component, and contains 3 possible values, 0 for running, -1 for freezing, and 1 for exit. 

Respectively, if a 0 is detected, the `running` state is set to `True`, and the app continues to loop performing frame-by-frame inference. If the state transitions to a `1`, triggered by closing the most recently opened window on the C++ side, the script exits gracefully. Lastly, if the state is a -1, triggered by the user pressing the spacebar key with the C++ app in focus, the app is frozen. In the card counting mode, once the state becomes -1, the current frame is held in memory, with the last inference run and relevant bounding boxes displayed on the screen:

```Python
if state == -1:
    if current_frame is not None:
        frame = current_frame.copy()
        if boxes_drawn:
            cv2.imshow("HandsUp", frame)
            ...
        continue
```

Card count writing is also temporarily disabled, leaving the `card_counts.txt` file unmodified. Upon a return to the running mode (i.e., `state=0`), again triggered by the same user key press, the frame is free to update, with new inference results being displayed and persisted to the text files:

#### Cumulative Card Counting Mode

The **cumulative card counting** mode is similar to the above mode, but instead, allows for accumulation of the cards to support users with limited mobility and response times. Much of the functionality is the same. However, as an accumulation of cards is required, when the space key is pressed, the previous counts are preserved, and the new counts in the most recent frame are added to the previous counts. This has been implemented by maintaining a seen, delta, and cumulative state, i.e.,

> cumulative (displayed on screen) = seen + delta

To provide the above functionality, the logic is partitioned into three files:

- `cumulative_delta_card_counts.txt`: The current detected card counts (i.e., counts since the last freeze).
- `cumulative_seen_card_counts.txt`: The total accumulated counts before the current freeze.
- `card_counts.txt`: The value displayed in the GUI (combined total of the above two). _Note, this is different to the purpose as in the **card counting** mode, in which this file contains the results only of the latest inference frame_

The same code is reused to persist the outputs, with throttling applied. Resetting of the values back to 0 is handled by the C++ component.

When the user presses the space key, transitioning the app to a paused state (state = -1), accumulation of the most recent set of detections onto the previous cumulative sum is performed. The changes in colour counts, as detected in the most recent frame, are read in from the `cumulative_delta_card_counts.txt` file, and the last cumulative sum values are loaded from the `cumulative_seen_card_counts.txt` file. The sum of the changes and the last cumulative sum are then considered as the new cumulative sum and these values are now written to the `cumulative_seen_card_counts.txt` file.

```Python
    # Handle state transitions
    if previous_state == 0 and state == -1 and mode == "Cumulative Counting":
        # Load current card counts
        r, g, y, b = 0, 0, 0, 0
        if os.path.exists(CUMULATIVE_DELTA_COUNTS_FILE):
            with open(CUMULATIVE_DELTA_COUNTS_FILE, "r") as f:
                try:
                    r, g, y, b = map(int, f.read().strip().split())
                except:
                    pass

        # Load existing cumulative
        cr, cg, cy, cb = 0, 0, 0, 0
        if os.path.exists(CUMULATIVE_SEEN_COUNTS_FILE):
            with open(CUMULATIVE_SEEN_COUNTS_FILE, "r") as f:
                try:
                    cr, cg, cy, cb = map(int, f.read().strip().split())
                except:
                    pass

        # Add and save
        with open(CUMULATIVE_SEEN_COUNTS_FILE, "w") as f:
            f.write(f"{cr + r} {cg + g} {cy + y} {cb + b}")
```

When the app is running in normal operation (i.e., a state of 0), the `card_counts.txt` saves the 'potential' next sum by adding the most recent inference results to the current frame's results. The deltas are also updated, as per the below code:

```Python
with open(CUMULATIVE_DELTA_COUNTS_FILE, "w") as file:
            file.write(f"{color_counts['red']} {color_counts['green']} {color_counts['yellow']} {color_counts['blue']}")
with open(CUMULATIVE_SEEN_COUNTS_FILE, "r") as file:
    r, g, y, b = map(int, file.read().strip().split())
with open(CARD_COUNTS_FILE, "w") as file:
    file.write(f"{r + color_counts['red']} {g + color_counts['green']} {y + color_counts['yellow']} {b + color_counts['blue']}")
```

#### Tabletop Mode

The **tabletop mode** is designed for users with reduced motor functions. Rather than holding a card up, the user would move their hand near or on their selected card on the table. This feature greatly increased the usability of our application and helps drive engagement in scenarios that we had not initially considered.

This feature was implemented by changing the relative direction of the region of interest (ROI) in the frame that is passed to the YOLO model. The ROI is now located below the detected hand, rather than above it. This is achieved by modifying the `SHIFT_UP_FACTOR` variable in the `yolo.py` file, which is used to determine the position of the ROI. The value of this variable is set to `0.8` by default, but when the mode is set to tabletop, it is changed to `-1`, accounting for different finger positions. Alongside this, the confidence threshold for classifying a hand was decreased to 0.2, as the training dataset contained a limited number of samples of hands in a tabletop position:

```Python
SHIFT_UP_FACTOR = 0.8
if mode == "Table Top Card Counting":
    SHIFT_UP_FACTOR = -1
    yolo.confidence = 0.2

EXPAND_LR_FACTOR = 0.2
```

The rest of the colour detection logic remains unchanged to the standard **card counting** mode, including file writing and the pausing functionality.

#### Hands Raised Mode

The **hands raised mode** does not feature any colour detection, and instead, identifies the number of hands raised. The same throttling logic is applied on the outputs, but the results are now persisted to `hands_raised.txt` rather than `colour_counts.txt`. To calculate the number of hands raised, the sum of the length of the inference results is used:

```
boxes, confidences = yolo.inference(frame)
numHands = len(boxes)
```

As with the standard **card counting** and **tabletop** modes, pausing here freezes the frame and results, _without_ accumulation.

#### First Hand Raised Mode

The **first hand raised mode** is similar to the hands raised mode. However, the first detected hand is labelled with a bounding box in a separate, distinct colour, and provides a useful view for reaction based or turn-taking based games.  To achieve this functionality, the first detected hand in the array of detection results, `boxes`, is flagged as being the first hand, for which a separate colour is used.

```Python 
if first_hand:
    cv2.rectangle(frame, (x, y), ((x + w//2), (y + h//2)), color_first_hand, 2)
    cv2.putText(frame, "First Hand", (x, y - 5),
                cv2.FONT_HERSHEY_SIMPLEX, 0.5, color_first_hand, 2)
    first_hand = False
```

As with the hands raised mode, the overall counts are persisted to `hands_raised.txt`, and pausing here freezes both the frame and results with no accumulation.

## C++

### MFC Application

The HandsUp application is built using the Microsoft Foundation Classes (MFC) C++ library. This library provides various classes and utilites to assist with the development of Windows-based GUI applications.

A core component of an MFC application is the dialog - a window which provides the ability for a user to interact with the underlying application in an event-driven environment. This event-driven environment is powered by MFC's message mapping mechanism, which connects user actions, such as button clicks or mouse movements, to member functions. These mappings are connected via macros like `BEGIN_MESSAGE_MAP` and `ON_BN_CLICKED`, which define how the incoming Windows messages are routed to the functions in each dialog. 

Each dialog encapsulates its own logic and interface, with further detail provided below. Alongside this, key general functionalities have been detailed following the discussion of each dialog. Note, the below provides relevant code snippets, and is not an exhaustive list of all of the implementation techniques used for this app - further detail can be found within the accompanying code.

### Main Menu Dialog

This dialogs acts as the central hub where the user has the ability to select the desired mode as detailed above, configure the app settings, or exit the app.

On initialization, various communication files as detailed in the **System Design** page are created, including:

- **state.txt** for controlling Python state machine
- **mode.txt** to inform Python of the selected mode

Within the initialization function of this dialog, various start-up functionality takes place, including rendering images to display on the app, configuring the styling, populating the dropdown box, and most notably, extracting the embedded Python executable. This is done once during start-up, with no repeats of this process during the lifetime of a single app run to avoid redundant extractions:

```C++
void ExtractPythonExeOnce()
{
    if (g_bPythonExtracted) return; // Prevent redundant extractions

    // Get temp directory
    TCHAR tempPath[MAX_PATH];
    GetTempPath(MAX_PATH, tempPath);
    CString exePath = CString(tempPath) + _T("colour_write.exe");

    // Delete the old EXE if it exists
    if (GetFileAttributes(exePath) != INVALID_FILE_ATTRIBUTES)
    {
        DeleteFile(exePath);
    }

    // Load resource
    HRSRC hResource = FindResource(NULL, MAKEINTRESOURCE(IDR_BIN1), _T("BIN"));
    if (!hResource) return;

    HGLOBAL hLoadedResource = LoadResource(NULL, hResource);
    if (!hLoadedResource) return;

    LPVOID pResourceData = LockResource(hLoadedResource);
    DWORD resourceSize = SizeofResource(NULL, hResource);
    if (!pResourceData || resourceSize == 0) return;

    std::ofstream outFile(exePath, std::ios::binary);
    if (outFile.is_open()) {
        outFile.write((char*)pResourceData, resourceSize);
        outFile.close();
    }

    g_bPythonExtracted = true;
}
```

Upon selecting a mode, and pressing the `OnBnClickedBegin` function, the Python executable is launched asynchronously using `ShellExecuteEx`:

```C++
ShellExecuteEx(&sei);
```

Additionally, a new modal dialog, dependent on the selected mode, is then launched via:

```C++
dlg.DoModal();
```

This ensures that the window remains open until the user manually closes the dialog, at which point, the Main Menu dialog is redisplayed. This functionality is controlled via the `SW_HIDE` and `SW_SHOW` methods respectively.

Resetting of the contents of the `state.txt` to 0 is also conducted, to ensure that a fresh inference cycle can be correctly launched from Python:

```C++
std::ofstream stateFile("C:\\Users\\Public\\Documents\\HandsUp\\state.txt");
if (stateFile.is_open()) {
    stateFile << "0";
    stateFile.close();
}
```

### Card Counting Dialog

This dialog displays and logs the number of cards detected per color in real-time, using the live camera feed. For all of the following modes, this dialog will be launched, with the exact functionality of this screen varying with the intended functionalites as explained above:

1. Card Counting
2. Cumulative Card Counting
3. Table Top Card Counting

Regardless of the selected mode, the dialog operates by periodically reading the latest value from `card_counts.txt`. A timer is set via `SetTimer` which triggers a `WM_TIMER` message to be posted to the message queue at the specified frequency, 1000ms. This value has been chosen to ensure timely, but not an unnecessarily excessive, rate of updates.  By overriding the `OnTimer` method, custom functionality can be introduced:

```C++
void CCardCountingDlg::OnTimer(UINT_PTR nIDEvent)
{
    if (nIDEvent == 1)
        UpdateCounts();
}
```

In this case, the timer is set to call `UpdateCounts`, responsible for loading the latest set of colour counts, updating the text fields, and handling camera disconnects:

```C++
void CCardCountingDlg::UpdateCounts()
{
    std::ifstream file("C:\\Users\\Public\\Documents\\HandsUp\\card_counts.txt");

    if (!file) return;

    int red = 0, green = 0, yellow = 0, blue = 0;
    if (!(file >> red >> green >> yellow >> blue)) return;

    CString redText, greenText, yellowText, blueText;

    if (red < 0) {
        KillTimer(1);
        AfxMessageBox(_T("Error: Check your camera! Please restart your app."));
        std::ofstream cardWriteFile("C:\\Users\\Public\\Documents\\HandsUp\\card_counts.txt");
        if (cardWriteFile.is_open()) {
            cardWriteFile << 0 << ' ' << 0 << ' ' << 0 << ' ' << 0;
            cardWriteFile.close();
        }
        OnBnClickedClose();
    }

    redText.Format(_T("Red: %d"), red);
    greenText.Format(_T("Green: %d"), green);
    yellowText.Format(_T("Yellow: %d"), yellow);
    blueText.Format(_T("Blue: %d"), blue);

    m_RedCount.SetWindowTextW(redText);
    m_GreenCount.SetWindowTextW(greenText);
    m_YellowCount.SetWindowTextW(yellowText);
    m_BlueCount.SetWindowTextW(blueText);
}
```

These text fields are formatted with custom fonts and styling such that they match the colours of the cards, via overriding of the `OnCtlColor` function, with the colours set depending on the `ID` of the static text fields:

```C++
HBRUSH CCardCountingDlg::OnCtlColor(CDC* pDC, CWnd* pWnd, UINT nCtlColor)
{
    switch (pWnd->GetDlgCtrlID())
    {
        case IDC_RED_COUNT: pDC->SetTextColor(RGB(255, 0, 0)); break;
        case IDC_GREEN_COUNT: pDC->SetTextColor(RGB(0, 255, 0)); break;
        case IDC_BLUE_COUNT: pDC->SetTextColor(RGB(0, 0, 255)); break;
        case IDC_YELLOW_COUNT: pDC->SetTextColor(RGB(255, 255, 0)); break;
    }
    return m_BgBrush;
}
```

Alongside the above text fields, four checkboxes and a save button are present. The value of the checkboxes is maintained in a variable.

Lastly, a close button is present, which sets the contents of `state.txt` to 1. As detailed earlier, this file is continuously monitored in a separate thread, and once a 1 is detected, the Python script is gracefully terminated, and due to the nature of the `DoModal` implementation, the Main Menu dialog is redisplayed.

### Hands Raised Dialog

This dialog is responsible for displaying the number of hands detected in real-time, and has a similar structure to the Card Counting dialog. The key difference here, however, is that a different file, `hands_counts.txt` is used as the reference source, with only one text field to show the number of hands being periodically updated. Additionally, rather than having checkboxes to flag the correct answer, when saving, simply the count of the number of hands is persisted.

### Settings Dialog

This dialog allows the user to configure their settings for the app, including:

1. Whether the webcam feed should be displayed to the user or not
2. Where the output files should be saved

```C++
void CSettingsDlg::OnBnClickedSaveSettings()
{
    UpdateData(TRUE);

    GetDlgItemText(IDC_EDIT_BROWSE_FOLDER, m_SaveFolderPath);

    std::string filePath = "C:\\Users\\Public\\Documents\\HandsUp\\settings.txt";
    std::ofstream file(filePath);

    if (file.is_open()) {
        file << "LiveCamera=" << (m_bLiveCamera ? "1" : "0") << std::endl;
        file << "Username=Case" << std::endl;
        file << "SaveFolderPath=" << CT2A(m_SaveFolderPath) << std::endl; // Save folder path
        file.close();

        AfxMessageBox(_T("Settings saved successfully!"));
    }
    else {
        AfxMessageBox(_T("Failed to save settings!"));
    }
}
```

### General Functionality

#### Always On Top

The HandsUp app is designed to be run in parallel with other software, such as a PowerPoint presentation within which questions are being displayed. As a result of this, a key requirement of this app was to ensure that it would always be visible on top of other software. The following line was added to the dialogs to ensure that this requirement was satisfied by forcing the dialog to always be the top-most app.

```C++
SetWindowPos(&wndTopMost, 0, 0, 0, 0, SWP_NOMOVE | SWP_NOSIZE);
```

#### Dynamic Resizing

Screen sizes vary across environment, particularly in a classroom setting. The HandsUp app, for example, may be run on a small laptop, or alternatively, on a large whiteboard, each of which may have different resolutions and aspect ratios.

To ensure a seamless user experience across devices, the dialogs were designed to respond dynamically to DPI scaling and resolution differences. All controls, including buttons, text, checkboxes and so forth are adjusted relative to the display dimensions, creating a consistent appearance.

The below snippet aggregates all coordinates of the existing controls, and stores these for later adjustment. Additionally, the overall dialog size is adjusted based on the width and height of the screen.

```C++
GetClientRect(&m_OriginalDialogRect);

CWnd* pWnd = GetWindow(GW_CHILD);
while (pWnd)
{
    CRect rect;
    pWnd->GetWindowRect(&rect);
    ScreenToClient(&rect);
    m_ControlRects.push_back(rect);
    pWnd = pWnd->GetNextWindow();
}

int screenWidth = GetSystemMetrics(SM_CXSCREEN);
int screenHeight = GetSystemMetrics(SM_CYSCREEN);

int dialogWidth = screenWidth * 0.6;
int dialogHeight = screenHeight * 0.5;

int posX = (screenWidth - dialogWidth) / 2;
int posY = (screenHeight - dialogHeight) / 2;
```

Having aggregated all controls into a member variable, each child control would be looper over and resized, handled by the `ResizeControls` function provided below. This itself is placed with the `OnSize` macro, handling sizing of the dialogs:

```C++
void CCardCountingDlg::ResizeControls()
{
    if (m_ControlRects.empty()) return; // If no controls were captured, exit

    CRect currentDialogRect;
    GetClientRect(&currentDialogRect);

    float xRatio = (float)currentDialogRect.Width() / (float)m_OriginalDialogRect.Width();
    float yRatio = (float)currentDialogRect.Height() / (float)m_OriginalDialogRect.Height();

    int index = 0;
    CWnd* pWnd = GetWindow(GW_CHILD);
    while (pWnd)
    {
        if (index >= m_ControlRects.size()) break;

        // Get the original control rect and scale it
        CRect newRect = m_ControlRects[index];
        newRect.left = (int)(newRect.left * xRatio);
        newRect.top = (int)(newRect.top * yRatio);
        newRect.right = (int)(newRect.right * xRatio);
        newRect.bottom = (int)(newRect.bottom * yRatio);

        // Move and resize the control
        pWnd->MoveWindow(&newRect);

        pWnd = pWnd->GetNextWindow();
        index++;
    }
}
```

#### Multiple Monitor Support

As mentioned in the dynamic resizing, classrooms differ greatly from one environment to the next. A common situation encountered in many classrooms is a multi-monitor setup. For example, a teacher may plug their laptop into a whiteboard, thereby providing 2 screens. To ensure the app always appeared in focus, the following was added, which centered the dialog on the user's primary monitor:

```C++
CenterWindow();
```

A design choice was also taken to remove the title bar from the MFC dialogs, to provide a more polished, modern and complete app. As part of this change, as the title bar was removed, drag-and-drop functionality was also lost. This was manually reimplemented by monitoring left-button click or touch-based input presses on the dialog. Once such a press was detected, the OnMouseMove handled the drag-and-drop ability across monitors by computing the new location of the dialog.

```C++
void CSettingsDlg::OnLButtonDown(UINT nFlags, CPoint point)
{
    SetCapture();
    m_bDragging = true;
    m_ptOffset = point;

    CDialogEx::OnLButtonDown(nFlags, point);
}

void CSettingsDlg::OnLButtonUp(UINT nFlags, CPoint point)
{
    if (m_bDragging)
    {
        ReleaseCapture();
        m_bDragging = false;
    }

    CDialogEx::OnLButtonUp(nFlags, point);
}

void CSettingsDlg::OnMouseMove(UINT nFlags, CPoint point)
{
    if (m_bDragging)
    {
        CRect rectWindow;
        GetWindowRect(rectWindow);

        int dx = point.x - m_ptOffset.x;
        int dy = point.y - m_ptOffset.y;

        int newX = rectWindow.left + dx;
        int newY = rectWindow.top + dy;

        CRect screenRect;
        SystemParametersInfo(SPI_GETWORKAREA, 0, &screenRect, 0);

        newX = max(screenRect.left, min(newX, screenRect.right - rectWindow.Width()));
        newY = max(screenRect.top, min(newY, screenRect.bottom - rectWindow.Height()));

        MoveWindow(newX, newY, rectWindow.Width(), rectWindow.Height());
    }

    CDialogEx::OnMouseMove(nFlags, point);
}
```

#### Styling

MFC by default provides visual GUI components. However, these can appear dated and can be viewed as lacking the required visual appeal to keep users engaged with the app. A significant overhaul of the styling was conducted, with the target audience in mind, to provide an enjoyable, whilst simple and interpretable, app layout. Design choices have been further elaborated upon in the `UI Design` section.

The `ON_WM_CTLCOLOR()` and `ON_WM_DRAWITEM()` macros were used to override the default drawing of controls, allowing for custom styling of buttons, static text, and other components. Custom brushes, for both the background and controls in the foreground, as well as font modifications for text, and other general changes for components were applied via the `OnDrawItem` and the `OnCtlColor` methods. 

For example, buttons were customised using `ModifyStyle(... BS_OWNERDRAW)` in combination with `OnDrawItem`:

```C++
CButton* closeButton = (CButton*)GetDlgItem(IDC_BUTTON_CLOSE);
if (closeButton) {
    closeButton->ModifyStyle(0, BS_OWNERDRAW);
}
```

```C++
void CCardCountingDlg::OnDrawItem(int nIDCtl, LPDRAWITEMSTRUCT lpDrawItemStruct)
{
    if (nIDCtl == IDC_BUTTON_SAVE_COUNTS) {
        CDC* pDC = CDC::FromHandle(lpDrawItemStruct->hDC);
        CRect rect = lpDrawItemStruct->rcItem;

        pDC->FillSolidRect(&rect, RGB(60, 90, 150)); // Blue button
        pDC->SetTextColor(RGB(255, 255, 255));       // White text
        pDC->SetBkMode(TRANSPARENT);

        CString text;
        GetDlgItem(nIDCtl)->GetWindowText(text);
        pDC->DrawText(text, &rect, DT_CENTER | DT_VCENTER | DT_SINGLELINE);
    }
    else if (nIDCtl == IDC_BUTTON_CLOSE) {
        if (!lpDrawItemStruct) return;

        CDC dc;
        dc.Attach(lpDrawItemStruct->hDC);

        CRect rect = lpDrawItemStruct->rcItem;
        dc.FillSolidRect(&rect, RGB(255, 0, 0));  // Red button
        dc.SetTextColor(RGB(255, 255, 255));  // White text

        CString text;
        GetDlgItem(nIDCtl)->GetWindowText(text);
        dc.DrawText(text, &rect, DT_CENTER | DT_VCENTER | DT_SINGLELINE);

        dc.Detach();
    }
    else {
        CDialogEx::OnDrawItem(nIDCtl, lpDrawItemStruct);
    }
}
```

Alongside the above, a `CustomComboBox` was introduced with custom `OnCtlColor` and `CtlColor` methods to ensure that the dropdown box component (which was not as easily modifiable as other components) was styled to fit in with the overall theme of the app.

#### Keyboard Inputs

As mentioned throughout the page, keyboard input is used to alter the state of the app to provide functionality like pausing and resetting.

This is conducted by defining an `OnKeyDown` method, which takes in a character press, and depending on the character pressed, has a different effect.

For example, for the spacebar key being pressed, the following snippet handles the state transition. Notably, the previous state is read-in, inverted, then re-written.

``` C++
if (nChar == VK_SPACE)
{
    std::ifstream stateFileRead("C:\\Users\\Public\\Documents\\HandsUp\\state.txt");
    int currentState = 0;
    if (stateFileRead.is_open()) {
        stateFileRead >> currentState;
        stateFileRead.close();
    }

    int newState = (currentState == -1) ? 0 : -1;

    std::ofstream stateFileWrite("C:\\Users\\Public\\Documents\\HandsUp\\state.txt");
    if (stateFileWrite.is_open()) {
        stateFileWrite << newState;
        stateFileWrite.close();
    }
}
```

Likewise, for the **cumulative card counting** mode, when the enter (also known as return) key is pressed, the values are reset to 0 within the card `counts`, `delta`, and `seen` text files:

```C++
if (nChar == VK_RETURN)
{
    std::ofstream cardWriteFile("C:\\Users\\Public\\Documents\\HandsUp\\card_counts.txt");
    if (cardWriteFile.is_open()) {
        cardWriteFile << 0 << ' ' << 0 << ' ' << 0 << ' ' << 0;
        cardWriteFile.close();
    }
}
```

## Compilation


### ONNX Conversion


#### Implementation – Darknet to ONNX Conversion Pipeline

The conversion from Darknet YOLO to ONNX format is aiming to integrate the hand detection model into a more flexible inference pipeline. However, the process proved to be non-trivial due to configuration nuances and dependency compatibility issues.

##### The toolchain and dependencies used are summarized below:
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

##### Environment Setup

We used *Miniconda* to manage Python environments for better control over dependency versions. The specific environment was created as follows:

bash
conda create -n pytorch16_env python=3.8 -y
conda activate pytorch16_env
pip install torch==1.8.0 torchvision==0.9.0 torchaudio==0.8.0 -f https://download.pytorch.org/whl/torch_stable.html
pip install onnx onnxruntime opencv-python numpy


#### Files Required for Conversion

Before conversion, the following files are required:

- cross-hands-yolov4-tiny.cfg: YOLO configuration file
- cross-hands-yolov4-tiny.weights: Pretrained weights
- cross-hands-yolov4-tiny.names: Class names (e.g. hand)
- A sample input image (e.g. hand.jpg)
- Batch size parameter

> *Note:*  
> If batch size > 0, the exported ONNX model will have *static* batch size.  
> If batch size ≤ 0, it will be *dynamic*.

#### Modifications to Configuration File

One of the major challenges was ensuring the correct scaling behavior in the YOLO .cfg file. The original file contained:

ini
scales=.1,.1


This aggressive scaling caused the model to underperform or even fail to export. We modified the following parameters for better performance and compatibility:

ini
scales=0.5,0.5
scale_x_y = 1.1   ; added to avoid KeyError during export
resize = 1.5    ; improves bounding box size consistency


#### Model Conversion Process

After several iterations, we successfully exported a functional ONNX model and verified its correctness using ONNX Runtime and visual inspection of bounding boxes.

We leveraged the official [pytorch-YOLOv4 repository](https://github.com/Tianxiaomo/pytorch-YOLOv4) for the conversion, particularly the tool folder and the demo_darknet2onnx.py script, which greatly facilitated the Darknet-to-ONNX transformation.

After ensuring the configuration was correct, we cloned the demo_darknet2onnx.py conversion scripts and tool folder, then ran the export script:

```bash
python demo_darknet2onnx.py <cfgFile> <namesFile> <weightFile> <imageFile> <batchSize>
```

#### Common Issues Encountered During Conversion

During the conversion, heres are some common several issues that may encountered:

- **Missing scale_x_y in the configuration file**  
  This caused a KeyError during export. It was resolved by manually adding the scale_x_y parameter.

- *ONNX export failure*  
  This was fixed by explicitly setting the opset_version to 11 during the export process.

- *NaN values in the model outputs*  
  We discovered this issue after exporting. It was resolved by checking the model weights and re-exporting from a clean .weights file.

- *Incorrect bounding boxes in prediction results*  
  This was addressed by tuning parameters such as scale_x_y and resize in the configuration file to improve prediction quality.

After iterating through these fixes, we successfully exported a working ONNX model and validated its functionality using ONNX Runtime and visual inspection of the prediction results.


####  ONNX Model Inference and Postprocessing

Once the model was successfully converted, we built an inference script using *ONNX Runtime*. The input image is:

- Resized to the expected input shape [1, 3, 416, 416]
- Normalized to the range [0, 1]
- Passed into the ONNX model for inference

The model outputs two arrays:

- **boxes**: containing bounding box coordinates  
- **confs**: containing objectness scores

We apply *post-processing*, including:

- *Confidence thresholding*
- *Non-Maximum Suppression (NMS)*

These steps filter out low-confidence or overlapping predictions. The final detection results are visualized and saved as predictions_onnx.jpg.
 
 ---

### Overall Compilation

Compilation of the app required careful thought, due to the nature of the files and modules used on both the Python and C++ side. In particular, effort was placed to ensure that OpenVINO and all of its associated dependencies were properly included within the final executable. 

PyInstaller was used to compile the python script that was embedded into the C++, with custom modifications made to the `.spec` file, provided below

```spec
# -*- mode: python ; coding: utf-8 -*-

from PyInstaller.utils.hooks import collect_data_files, collect_submodules, collect_dynamic_libs

datas = [('models', 'models')]
datas += collect_data_files('openvino')

binaries = collect_dynamic_libs('openvino')

hiddenimports = collect_submodules('openvino')

a = Analysis(
    ['colour_write.py'],
    pathex=[],
    binaries=binaries,
    datas=datas,
    hiddenimports=hiddenimports,
    hookspath=[],
    hooksconfig={},
    runtime_hooks=[],
    excludes=[],
    noarchive=False,
    optimize=0,
)
pyz = PYZ(a.pure)

exe = EXE(
    pyz,
    a.scripts,
    a.binaries,
    a.datas,
    [],
    name='colour_write',
    debug=False,
    bootloader_ignore_signals=False,
    strip=False,
    upx=True,
    upx_exclude=[],
    runtime_tmpdir=None,
    console=False,
    disable_windowed_traceback=False,
    argv_emulation=False,
    target_arch=None,
    codesign_identity=None,
    entitlements_file=None,
)
```

Compilation of the Python executable was conducted via:

```
pyinstaller colour_write.spec
```

# STATIC LINKING OF DLLS

By default, the application generated by Visual Studio in `Release` mode for `x64` systems will dynamically link to Micrsosft's runtime libraries (like MSVCP140.dll, VCRUNTIME140.dll, etc.). These are all part of the CV++ Redistributable, wand if they are missing on the end user's PC, 'DLL not found' errors are experienced.

Given that our primary requirement is that our app executable can be run on any Windows PC without the need to install any extra dependencies, we statically these additional libraries within our `.exe` to ensure that no additional requirements to install VS++ Redistributables are needed, ideal for deployment of our app on school desktops.

In order to generate the app executable, The 'Build Solution' from within Visual Studio was used, in `Release` mode for `x64` systems. As mentioned above, during initialisation, the C++ app extracts the Python executable from the resource and writes it to a temporary folder, with this extraction only occurring once for each app run. However, for each new app run, the previous Python executable is deleted, and a new executable is extracted. This function was chosen as if the Python executable was to be updated post-deployment, the app would always run the latest version of the Python exe for the intended functionalities, without the user needing to manually replace the old executable from their temporary folder.

---

## Experimental Areas

### Quiz Generator

One feature of the app we decided to include was an *LLM (Large Language Model)* which generates multiple choice quizzes based on a given input text, such as one found in a textbook describing either a scientific concept, or fact of some kind. 

The first main step of this was to decide where to begin. We looked towards the HuggingFace model library to find a suitable model for this task. The model needed to have a wide breadth of knowledge across multiple topics to properly generate the quizzes. We switched between models a lot, depending on which would perform better given a series of prompts, and eventually settled on *google/flan-t5-base* for its low file size, large parameter counts and hence extensive knowledge.

However, one major problem we encountered with testing these models on inputs ranging different lengths and topics was *inconsistencies within the output*. Outputs would range from generating blank outputs, nonsense, correct quizzes but in strange formats. All of these made post processing of the quiz output extremely frustrating due to the unpredictability of the output, and hence inconsistent writing to files and improper frontend backend interaction.

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
After testing this new fine-tuned model, we realised that while the output is consistent in format, the quizzes often have *repeated options, and **incorrect answers*. 

To fix this, we decided to switch to *flan-t5-large* due to its increased parameter count over its base model, hoping that it would be able to draw more information from a wider range of topics.

## References
[1] F. Bruggisser, "YOLO-Hand-Detection," GitHub Repository, 2020. [Online]. Available: https://github.com/cansik/yolo-hand-detection