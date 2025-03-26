## Research Section

### Related Projects Review

When building the initial requirements list at the beginning of the project, we began researching online for academic papers and previous projects that could inform our design and implementation. We discovered several similar projects — one of which directly influenced our solution — and we were able to gain valuable insights that helped shape and improve our approach. The main projects we focused on were:

#### Real-Time Application for Detection of Raised Hands and Personal Identification by Deep Learning Algorithms for Camera Images by Atsushi Ogino and Masahiro Tanaka

**1.1 Main Features**
- Detects raised hands  
- Applies facial recognition on the person that raises their hand  
- Automatically calls on students that have raised their hand  

**1.2 What We Can Learn**
- This project was our introduction to the YOLO (You Only Look Once) model and its limitations, prompting us to explore the improved YOLOv4 for better performance.
- The idea of creating a region of interest (ROI) relative to the raised hand to locate the face inspired our approach for card detection, where we detect cards relative to the hand’s bounding box.

#### YOLO-Hand-Detection by Florian Bruggisser

**2.1 Main Features**
- Real-time hand detection using YOLO

**2.2 What We Can Learn**
- Bruggisser’s hand detection model demonstrated impressive accuracy and is open-source. It includes a version using YOLOv4-Tiny, which is lightweight and ideal for school-grade computers. The project served as a solid foundation and meant that we didn’t need to train a model from scratch.
- However, it was not a perfect fit for our project. Since Intel is one of our clients, we were required to use OpenVINO which required converting Bruggisser’s darknet model to ONNX, and then into OpenVINO’s IR format using Intel’s documentation. This posed a large issue throughout the majority of our development cycle.
- Although Bruggisser used multiple datasets to train his model, the training data consisted mostly of hands in awkward angles and the hands of marathon runners. This meant that in certain positions, the model had trouble recognizing a user’s hand. To counter this, we reduced the confidence threshold for our model to 20%, which was low enough to avoid picking up false positives while still correctly identifying hands in a frame.
- We further developed the code to include bounding box visualization and write hand count data to text files for our application’s backend to process.

---

### Technology Review

#### Data Pipeline

**Advantages**

| Solution     | Advantages                                                                                     |
|--------------|-----------------------------------------------------------------------------------------------|
| Text Files   | - Simple implementation  ; - No networking required ; - OS Compatibility without setup ; - Good for decoupling; enables async communication between Python and MFC |
| Sockets      | - Bi-directional ; - Better synchronization ; - Lower latency                           |

**Disadvantages**

| Solution     | Disadvantages                                                                                  |
|--------------|-----------------------------------------------------------------------------------------------|
| Text Files   | - Higher latency, slower file I/O ; - Not scalable; becomes cumbersome with frequent data exchange |
| Sockets      | - More complex setup ; - Requires networking code ; - Harder to debug due to opacity    |

We decided to use reading and writing to text files as our data pipeline. This is because our application should be designed to work on any Intel-based computer without the need for any additional configuration. Using sockets meant that in some cases there were port conflicts with other apps and added unnecessary overhead for our use case.

Furthermore, using text files meant that we were easily able to manage multiple data streams with ease which was essential as our application works with multiple modes, running states, and both card and hand counting. Text files were a practical and low-maintenance solution. Although text files have a higher latency than sockets, the latency is negligible for our application since in practice the count values don’t change rapidly enough to cause noticeable issues.

---

#### Card Detection

**Advantages**

| Solution                                                   | Advantages                                                                 |
|------------------------------------------------------------|-----------------------------------------------------------------------------|
| HSV detection in ROI above detected hand                   | - Simple implementation ; - Accurate color detection when card is held above the hand |
| Segment Anything Meta to extract rectangular objects       | - Improved accuracy over first method                                      |
| Integration of Uno Card Detection in ROI above the hand    | - Most accurate detection of Uno cards ; - Already implemented program  |

**Disadvantages**

| Solution                                                   | Disadvantages                                                               |
|------------------------------------------------------------|------------------------------------------------------------------------------|
| HSV detection in ROI above detected hand                   | - Requires cards to be held above hand ; - Can be inaccurate in colorful environments |
| Segment Anything Meta to extract rectangular objects       | - High resource usage ; - Causes freezing on low-end machines            |
| Integration of Uno Card Detection in ROI above the hand    | - Less effective at distance ; - Higher latency ; - Difficult to customize ; - Limited to Uno cards |

We chose HSV detection with a region of interest (ROI) above the detected hand due to its low resource requirements and responsive performance. After calibrating the ROI scaling and applying Gaussian blur, erosion, and dilation, the detection accuracy improved significantly. This solution avoided frame freezing on low-end systems and maintained a clean, responsive UI.

---

### Language & Frameworks Review

| Category           | Solutions Considered   | Decision             | Reasoning                                                                 |
|--------------------|------------------------|----------------------|---------------------------------------------------------------------------|
| Frontend UI        | Tkinter, MFC           | MFC                  | Chosen for legacy system support (e.g., Windows XP), school compatibility |
| Model Format       | ONNX, Darknet          | ONNX (converted to IR) | Required for compatibility with OpenVINO                                  |
| Image Processing   | OpenCV                 | OpenCV               | Well-documented, supports webcam input, efficient image handling          |
| Programming Language | Python, C++          | Python & C++         | Python for core logic; C++ (with MFC) for frontend and system integration |
| Compilation Tool   | Nuitka, PyInstaller    | PyInstaller          | Nuitka was used initially, but OpenVINO integration required PyInstaller  |

---

### Summary of Technical Decisions

| Technical Problem           | Our Decision                                                  |
|----------------------------|----------------------------------------------------------------|
| Languages                  | C++ (with MFC) and Python 3                                    |
| Inference Engine           | OpenVINO                                                       |
| Hand Detection Framework   | YOLOv4 Tiny                                                    |
| Video Processing           | OpenCV                                                         |
| Colour Detection           | HSV filtering with Gaussian blur, erosion and dilation         |
| Data Pipeline              | Text files                                                     |
| Packaging                  | PyInstaller                                                    |
