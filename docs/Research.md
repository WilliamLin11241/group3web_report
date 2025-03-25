---
id: Research
title: Research
---

# Research

## Research Section

### Related Projects Review


- [YOLO-Hand-Detection by cansik](https://github.com/cansik/yolo-hand-detection?tab=readme-ov-file)  
  *(UNO card detection)*


When building the initial requirements list at the beginning of the project, we began researching online for academic papers and previous projects that could inform our design and implementation. We discovered several similar projects—one of which directly influenced our solution—and we were able to gain valuable insights that helped shape and improve our approach. The main projects we focused on were:

---

## Real-Time Application for Detection of Raised Hands and Personal Identification by Deep Learning Algorithms for Camera Images  
*(by Atsushi Ogino and Masahiro Tanaka)*

### 1.1 Main Features
- **Detects hand raised**
- **Applies facial recognition** on the person that raises their hand
- **Automatic calling** on students that have raised their hand

### 1.2 What We Can Learn

This project was our first introduction to the **YOLO (You Only Look Once)** model. We learned about the shortcomings of the YOLO model and were directed to use **YOLOv4** for our project. This project made us aware of the practical limitations of earlier YOLO versions and guided us towards adopting a more accurate and efficient object detection model.

The concept of creating an **ROI (Region of Interest)** in an estimated area relative to the raised hand to find the face is what we applied to do our card detection.

---

## YOLO-Hand-Detection by Florian Bruggisser

### 2.1 Main Features
- **Hand detection**

### 2.2 What We Can Learn

The accuracy of **Bruggisser's hand detection model** is very good and the program is open source. He also had a version of his model that utilized **Tiny YOLOv4**, which had a lot less overhead and was lighter — perfect for our target demographic of school-grade computers. It was a great starting point for our project and meant that we did not have to train the model ourselves.

Even though it was a great start, it was not a perfect fit for our project. As **Intel** is also one of our clients, we had the requirement of integrating **OpenVINO** into our project. In order to do so, the models needed to be in an **OpenVINO IR format**, which could only be generated if the original model was in **ONNX format**. The issue was that Bruggisser's work used the **darknet configuration**. Following the instructions on Intel's website, we were able to convert the darknet models to ONNX format, and then convert them to IR format for OpenVINO to use.

We also expanded on the original code so that it displays **bounding boxes** around the hands and writes the **counts** of these to a text file.

---

## Technology Review

— Please compare the possible solutions, describe what you choose, and explain why. 

---

## Data pipeline

| **Solution**  | **Advantages**                                                                                                                                         | **Disadvantages**                                                                                                             |
|---------------|--------------------------------------------------------------------------------------------------------------------------------------------------------|-------------------------------------------------------------------------------------------------------------------------------|
| **Text Files** | - Simple implementation <br/> - No networking required <br/> - OS Compatibility without extra setup <br/> - Good for decoupling (Python app & MFC UI communicate asynchronously) | - Higher latency, file I/O is slower and not real time <br/> - Not scalable, becomes cumbersome for more frequent data exchange |
| **Sockets**    | - BiDirectional <br/> - Better synchronization <br/> - Less latency                                                                                   | - More complex setup <br/> - Need to implement networking code, harder to debug since less transparent                                                            |

We decided to use reading and writing to text files as our data pipeline. This is because our application should be designed to work on any Intel based computer without the need for any additional configuration. Using sockets meant that in some cases the ports that were being used in our program were being used by other applications on a computer which meant that the data would not be correctly transferred between the frontend and backend of the application.  

Furthermore, using text files meant that we were able to set up multiple data pipelines with ease which was important as our application works with different modes, different running states, and two types of counts. Text files were a practical and low maintenance solution.  

Although text files have a higher latency than sockets, it is not as noticeable for our application as the use cases of our application cannot change hand or card counts on a large scale quickly enough to cause the issue to arise.  

---

## Card Detection

### Advantages

| **Solution**                                                 | **Advantages**                                                                                                                                         |
|--------------------------------------------------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------|
| **HSV detection in ROI above detected hand**                 | - Simple implementation, accurate color detection when card is mostly held above the hand.<br/>              |
| **Segment Anything Meta**<br/>(to extract rectangular objects in the ROI above the hand) | - Improved accuracy over the first method.<br/>- Works well if you have enough GPU power.                                                              |
| **Integration of [Uno Card Detection](https://github.com/cansik/yolo-hand-detection)**<br/>in ROI above the hand | - Most accurate detection of UNO cards that are being held up.<br/>- Program has been partially written already.                                        |

---

### Disadvantages

| **Solution**                                                 | **Disadvantages**                                                                                                                        |
|--------------------------------------------------------------|------------------------------------------------------------------------------------------------------------------------------------------|
| **HSV detection in ROI above detected hand**                 | - Requires students to hold the cards above the hand.<br/>- Potential for slight inaccuracy in rooms with extremely colorful backgrounds
| **Segment Anything Meta**<br/>(to extract rectangular objects in the ROI above the hand) | - Very large overhead on lower-grade computers; frames drop a lot and the program freezes up.<br/>- Hard to maintain real-time performance. |
| **Integration of [Uno Card Detection](https://github.com/cansik/yolo-hand-detection)**<br/>in ROI above the hand | - The program does not work as well when users hold the card and a distance.<br/>- Slightly more latency when running in the main program.<br/>- Existing code is difficult to change to meet our requirements. |

For the implementation of card detection, we decided to use HSV detection in ROI above detected hand. This method ensured that the program would be able to run without the application freezing  

 

- Please compare the possible programming languages, frameworks, libraries, APIs, describe what you choose, and explain why. 

 

- TKINTER VS MFC  

- TINY YOLO VS YOLO  

- ONNX VS DARKNET 

- OPENCV  

- PYTHON\ 

---

## Summary of Technical Decisions

| **Technical Problem**        | **Our Decision**                                       |
|------------------------------|--------------------------------------------------------|
| **Languages**                | C++ (with MFC) and Python 3                            |
| **Inference Engine**         | OpenVINO                                               |
| **Hand Detection Framework** | YOLOv4 Tiny                                            |
| **Video Processing**         | OpenCV                                                 |
| **Colour Detection**         | HSV filtering with Gaussian blur, erosion, and dilation |
| **Data Pipeline**            | Text files                                             |
| **Packaging**                | Nuitka and PyInstaller                                 |
