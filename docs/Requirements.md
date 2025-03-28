# Requirements

## Project background

### Discuss problems

In traditional classroom teaching, teachers rely primarily on observing students’ hands, expressions, or questions to determine students’ level of understanding and engagement. However, this approach has obvious limitations in large classes or online teaching environments. It is difficult for teachers to get real-time feedback from each student, and they may ignore students who are not good at expressing themselves or are introverted, resulting in poor classroom interactions and reduced student engagement and motivation.

To solve this problem, we developed HandsUp, a computer vision-based classroom interaction system that automatically detects students’ hand gestures and recognizes the color of the cards in their hands to help teachers understand students’ feedback in real time. Through the visualization of data, teachers can quickly identify which students have questions and which students have already mastered the knowledge, thus effectively improved the quality of classroom interactions and enhanced students’ engagement and learning outcomes.

---

## Partner introduction

| Partner | Website |
|--------|---------|
| ![](/img/NAS_logo.png)<br/>**National Autistic Society** | [NAS](https://www.autism.org.uk/) |
| ![](/img/intel.jpg)<br/>**Intel** | [Intel](https://www.intel.com/content/www/us/en/homepage.html) |
| ![](/img/ucl.png)<br/>**UCL Computer Science** | [UCL Computer Science](https://www.ucl.ac.uk/computer-science/) |


---

## Project goals

### Increase inclusivity

One of the primary goals of our project is to increase inclusivity in classroom environments by supporting non-verbal communication methods. Traditional classroom settings often rely heavily on verbal interactions, which can unintentionally exclude students who face challenges in expressing themselves verbally, such as those with speech impairments, social anxiety, or autism spectrum disorder (ASD).

Our system, HandsUp, addresses this issue by enabling students to participate through simple, intuitive non-verbal cues, such as hand gestures and colored cards. This approach ensures that all students, regardless of their communication preferences or abilities, have an equal opportunity to express their understanding, opinions, and questions during lessons. This allows educators to better recognize and respond to every student’s needs, fostering a more inclusive, engaging, and supportive learning environment.

### Tech-free learning

Our goal is to create a technology-free solution for students, minimizing the need for personal devices like tablets or smartphones. By relying on simple physical cues (e.g., hand gestures and colored cards) and computer technology on the teacher’s side, we ensure that students can engage without distractions or digital barriers. This method promotes accessibility, ease of use while maintaining a natural learning environment.

---

## Process of gathering requirements

### Semi-structured interviews with clients

We conducted meetings and interviews with our clients to understand their specific needs and challenges. These semi-structured interviews allowed us to ask open-ended questions while also gathering specific requirements for the system. Through direct discussions, we gained valuable feedback into how the system could best support teachers and students in real classroom settings.

### Iterative method

Our development process followed an iterative method, where we collected feedback every Friday during our meetings. This continuous feedback loop enabled us to improve our design and the product based on real user needs. By incorporating regular feedback, we ensured that our system developed towards a more effective and user-friendly solution.

---

## Personas

<div class="persona-container">

  <div class="persona-card">
    <h3>Daniel Carter</h3>
    <p><em>Role:</em> Teacher at a Special Education School<br/>
    <em>Type:</em> Male, 40 years old</p>
    <blockquote>
      "I want every student in my class, verbal or non-verbal, to have an equal chance to participate and engage."
    </blockquote>

    <h4>Motivations</h4>
    <ul>
      <li>Ensure all students, including ASD students, can participate in classroom activities.</li>
      <li>Reduce classroom distractions and make learning more engaging.</li>
      <li>Find interactive teaching methods that do not solely rely on verbal communication.</li>
      <li>Use data-driven insights to tailor teaching strategies to students' needs.</li>
    </ul>

    <h4>Ideal Features</h4>
    <ul>
      <li>A system that allows non-verbal students to express themselves easily.</li>
      <li>A visually engaging and distraction-free interface that suits neurodiverse learners.</li>
      <li>Real-time analytics to track student engagement and participation.</li>
      <li>AI-generated voice options for students who struggle with reading or verbalizing their thoughts.</li>
    </ul>

    <h4>Pain Points</h4>
    <ul>
      <li>Traditional classroom engagement methods do not cater to ASD students effectively.</li>
      <li>Many interactive tools are too complex and overwhelming for neurodiverse learners.</li>
      <li>Some students have difficulty staying focused when using screens for learning.</li>
      <li>Limited tools available that offer meaningful interaction without requiring verbal input.</li>
    </ul>
  </div>

  <div class="persona-card">
    <h3>Alex Johnson</h3>
    <p><em>Role:</em> Primary School Student with ASD<br/>
    <em>Type:</em> Male, 9 years old</p>
    <blockquote>
      "I like answering questions, but sometimes I don't know how to say it. I like using colors to show my answers."
    </blockquote>

    <h4>Motivations</h4>
    <ul>
      <li>Enjoys interactive and visual learning over traditional verbal instruction.</li>
      <li>Prefers structured and predictable ways to communicate answers.</li>
      <li>Likes hands-on activities but struggles with open-ended verbal discussions.</li>
      <li>Finds comfort in using symbols, colors, and gestures for communication.</li>
    </ul>

    <h4>Ideal Features</h4>
    <ul>
      <li>A non-verbal way to answer questions using colors, icons, or hand gestures.</li>
      <li>Simple and minimal UI to reduce cognitive overload.</li>
      <li>A predictable and structured interaction model to provide comfort.</li>
      <li>Options for visual cues rather than only text-based questions.</li>
    </ul>

    <h4>Pain Points</h4>
    <ul>
      <li>Struggles with verbal expression and prefers structured communication.</li>
      <li>Gets overwhelmed by too much screen interaction or complex interfaces.</li>
      <li>Finds waiting time frustrating when setting up digital tools.</li>
      <li>Easily distracted by too much movement or noise in the classroom.</li>
    </ul>
  </div>

</div>

---

## Use-case diagrams

**Teacher leading in classroom with non-verbally communicating students**

![Use Case Diagram](/img/use-case-diagram.png)

---

## MoSCoW requirements



### Functional Requirements

<div class="moscow-container">
  <div class="moscow-card">
    <h4>Must Have</h4>
    <ul>
      <li>The system should be able to recognize if a student raises his/her hand</li>
      <li>Ensure that the system is able to correctly recognize card colors such as red, blue, yellow and green</li>
      <li>Ensure that the system can recognised a student's choice on table-top mode</li>
      <li>Ensure that the app can cumulatively count choices made by the students, with the use of a pause/start feature controlled by the teacher</li>
      <li>Teachers can immediately see students’ hands up or color feedback to adjust teaching strategies</li>
      <li>Ensure that the system is fully offline</li>
      <li>Ensure that the app works on, and is optimsed for all Intel devices, by using OpenVINO for inference</li>
      <li>Ensure that it works on Window systems</li>
    </ul>
  </div>
  <div class="moscow-card">
    <h4>Should Have</h4>
    <ul>
      <li>Provide statistics on student interactions at the end of class</li>
      <li>Introduce a "First hands raised" feature which highlights the card which was the first to be raised or detected</li>
    </ul>
  </div>
  <div class="moscow-card">
    <h4>Could Have</h4>
    <ul>
      <li>The system can reduce the need for teachers to check the screen frequently by broadcasting feedback via voice</li>
      <li>Interaction data from multiple classrooms can be stored for teachers to analyze over time</li>
      <li>Supports integration with distance learning tools such as Zoom, Google Meet, etc</li>
    </ul>
  </div>
  <div class="moscow-card">
    <h4>Won’t Have</h4>
    <ul>
      <li>The current system focuses only on hand raising and simple color recognition, no complex sign language recognition</li>
      <li>A standalone mobile app will not be developed in the short term, but will be used as a desktop or web-based tool</li>
      <li>Individual student performance will not be tracked over time, only anonymous stats to avoid privacy concerns</li>
    </ul>
  </div>
</div>

---

### Non-functional Requirements

  <h4>Must Have</h4>
  <ul>
    <li>At least 95% accuracy in gesture and color recognition to ensure reliable feedback</li>
    <li>Process and display student feedback within 1 second to keep class flowing</li>
    <li>Can be run in a normal camera environment without additional hardware</li>
  </ul>

  <h4>Should Have</h4>
  <ul>
    <li>UI design is simple and intuitive for teachers to understand and operate quickly</li>
    <li>Include an LLM chat bot capable of producing multiple choice questions from a given input text</li>
  </ul>


  <h4>Could Have</h4>
  <ul>
    <li>Can be run offline without relying on the network, suitable for unstable networks</li>
    <li>Gesture and color detection accuracy can be improved through AI training in the future</li>
    <li>Provides a dark color theme to reduce screen impact on the teacher’s vision</li>
  </ul>

  <h4>Won’t Have</h4>
  <ul>
    <li>Won’t rely on cloud computing, data processed locally whenever possible to ensure low latency</li>
    <li>Won’t develop specialized hardware devices, but remain compatible with existing computers/cameras</li>
    <li>Does not consider VR/AR features, focusing on realistic classroom environments</li>
  </ul>

