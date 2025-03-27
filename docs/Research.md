---
id: Research
title: Research
---

### Related Projects Review

When building the initial requirements list at the beginning of the project, we began researching online for academic papers and previous projects that could inform our design and implementation. We discovered several similar projects — one of which directly influenced our solution — and we were able to gain valuable insights that helped shape and improve our approach. The main projects we focused on were:

#### [Real-Time Application for Detection of Raised Hands and Personal Identification by Deep Learning Algorithms for Camera Images by Atsushi Ogino and Masahiro Tanaka](https://www.jstage.jst.go.jp/article/sss/2022/0/2022_106/_pdf)

**1.1 Main Features**

**1.1 Main Features**
- Detects raised hands  
- Applies facial recognition on the person that raises their hand  
- Automatically calls on students that have raised their hand  

**1.2 What We Can Learn**
- This project introduced us to YOLO (You Only Look Once) and its limitations, prompting us to use YOLOv4 for improved performance.
- The idea of creating a region of interest (ROI) relative to the raised hand to locate the face inspired our approach for card detection, where we detect cards relative to the hand’s bounding box.  

#### [YOLO-Hand-Detection by Florian Bruggisser](https://github.com/cansik/yolo-hand-detection)


**2.1 Main Features**
- Real-time hand detection using YOLOv4 Tiny

**2.2 What We Can Learn**
- Bruggisser’s hand detection model demonstrated impressive accuracy and is open-source. It includes a version using YOLOv4-Tiny, which is lightweight and ideal for school-grade computers. The project served as a solid foundation and meant that we didn’t need to train a model from scratch. 

- However it was not a perfect fit for our project. Since Intel is one of our clients, we were required to use OpenVINO which required converting Bruggisser’s darknet model to ONNX, and then into OpenVINO’s IR format using Intel’s documentation. This posed a large issue throughout the majority of our development cycle.  

- Although Bruggisser used multiple datasets to train his model, the training data consisted mostly of hands in awkward angles and the hands of marathon runners. This meant that in certain positions, the model had trouble recognizing a user’s hand. To counter this, we reduced the confidence threshold for our model to 20%, this was low enough to avoid picking up false positives while still correctly identifying hands in a frame.  

- We further developed the code to include bounding box visualization and write hand count data to text files for our application’s backend to process.  

---

### Technology Review

#### Data Pipeline

**Advantages**

| Solution     | Advantages                                                                                     |
|--------------|------------------------------------------------------------------------------------------------|
| Text Files   | Simple implementation; No networking required; OS compatibility; Allows async communication    |
| Sockets      | Bi-directional; Better synchronization; Lower latency                                          |

**Disadvantages**

| Solution     | Disadvantages                                                                                     |
|--------------|---------------------------------------------------------------------------------------------------|
| Text Files   | Higher latency; File I/O is slower and not real-time; Not scalable for frequent data exchange     |
| Sockets      | More complex setup; Networking conflicts possible; Less transparent and harder to debug           |

We decided to use reading and writing to text files as our data pipeline. This is because our application should be designed to work on any Intel based computer without the need for any additional configuration. Using sockets meant that in some cases there were port conflicts with other apps and added unnecessary overhead for our use case. 

 

Furthermore, using text files meant that we were easily able to manage multiple data streams with ease which was essential as our application works with multiple modes, running states, and both card and hand counting. Text files were a practical and low maintenance solution. Although text files have a higher latency than sockets, the latency is negligible for our application since in practice the count values don’t change rapidly enough to cause noticeable issues.  

---

#### Card Detection

**Advantages**

| Solution                                       | Advantages                                                                 |
|-----------------------------------------------|----------------------------------------------------------------------------|
| HSV detection in ROI above detected hand      | Simple and fast; Accurate if card is mostly above hand                     |
| Segment Anything (Meta)                       | Higher accuracy; Better rectangular object extraction                      |
| Uno Card Detection (external integration)     | Most accurate for Uno cards; Already implemented code                      |

**Disadvantages**

| Solution                                       | Disadvantages                                                                 |
|-----------------------------------------------|------------------------------------------------------------------------------|
| HSV detection in ROI above detected hand      | Requires cards to be held above the hand; Can fail in colorful environments |
| Segment Anything (Meta)                       | Very high processing overhead; Freezes on low-end computers                 |
| Uno Card Detection (external integration)     | High latency; Poor accuracy at distance; Existing code was difficult to modify and restricts schools to only using the application with Uno cards               |

We chose HSV detection with a region of interest (ROI) above the detected hand due to its low resource requirements and responsive performance. After calibrating the ROI scaling and applying Gaussian blur, erosion, and dilation, the detection accuracy improved significantly. This solution avoided frame freezing on low-end systems and maintained a clean, responsive UI. 

---

### Language & Frameworks Review

| Category             | Solutions Considered | Final Decision       | Reasoning                                                                      |
|----------------------|----------------------|----------------------|---------------------------------------------------------------------------------|
| Frontend UI          | Tkinter, MFC         | MFC                  | Legacy system support, Windows XP compatibility, smooth C++/Python communication |
| Model Format         | Darknet, ONNX        | ONNX → OpenVINO IR   | Required for OpenVINO compatibility                                             |
| Image Processing     | OpenCV               | OpenCV               | Efficient frame manipulation, well-documented, webcam-ready                                        |
| Programming Language | Python, C++          | Python & C++         | Python for logic/model, C++ for MFC frontend and file handling                 |
| Packaging Tool       | Nuitka, PyInstaller  | PyInstaller          | Nuitka failed for OpenVINO; PyInstaller worked better with compiled IR model   |

---

### Summary of Technical Decisions

| Technical Problem        | Our Decision                                                 |
|--------------------------|--------------------------------------------------------------|
| Programming Languages    | C++ (with MFC) and Python 3                                  |
| Inference Engine         | OpenVINO                                                     |
| Hand Detection Framework | YOLOv4 Tiny                                                  |
| Video Processing         | OpenCV                                                       |
| Colour Detection         | HSV with Gaussian blur, erosion, and dilation                |
| Data Pipeline            | Text files                                                   |
| Packaging Tool           | PyInstaller                                                  |
