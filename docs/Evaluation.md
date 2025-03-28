---
id: Evaluation
title: Evaluation
---

# Evaluation

### MoSCoW Achievement List

|  ID  |     Description     |  Priority  | State | Contributors |
|------|---------------------|------------|-------|--------------|
|  01  |The system should be able to recognise a student's raised hand |     Must Have|✓| Krish, William|   
|  02  |The app should be able to correctly identify a single, coloured card raised by a student|Must Have|✓| Aishani, Krish, William|
|  03  |The app should be able to correctly identify a student’s choice when on table-top mode|Must Have|✓| Aishani, Krish|
|  04  |The app should be able to cumulatively count the number of cards raised, using a pause / resume feature|Must Have|✓| Aishani|
|  05  |The app should instantaneously react to the card chosen / hand raised, for the teacher to immediately see the feedback|Must Have|✓| Aishani, Krish|
|  06  |Must utilise fully offline AI models|Must Have|✓| Aishani, Krish, Misha, William|
|  07  |Must work on windows systems|Must Have|✓|Aishani, Krish, Misha|
|  08  |Must work on and be optimised for intel CPUs and NPUs|Must Have|✓| Aishani, Krish, Misha, William |
|  09  |Provide statistics on student interactions at the end of class in the form of card count data|Should Have|✓| Aishani|
|  10  |Add an LLM chat bot capable of producing multiple choice questions from a given input text|Should Have|X| Misha |
|  11  |Introduce a “First hands raids” feature which highlights the card which was the first to be raised or detected|Could Have|X| Aishani|
|  12  |Support integration with distance learning tools such as zoom or teams|Could Have|X| Aishani, Krish, Misha, William|



### Individual Contribution Table For System Artefacts

| Work packages              | Aishani | Krish | Misha | William |
|---------------------------|------|-----|-----|---------|
| Research and Experiments  | 25 %  | 25 % | 25 % | 25 %     |
| UI Design (if applicable) | 90 %  | 10 % | 0 % | 0 %      |
| Coding                    | 45 %  | 35% | 10 % | 10 %     |
| Testing                   | 20 %  | 30 %  | 30 % | 20 %    |
| **Overall contribution**  | 35%  | 30% | 15 % | 20 % |

### Individual Contribution Table For Website
| Work packages                | Aishani | Krish | Misha | William |
|-----------------------------|------|-----|-----|---------|
| Website Template and Setup  | 0 %   | 0 % | 0 % |    100%     |
| Home                        | 30 %  | % | % |   70 %   |
| Video                       | 5 %  | 85 % | 5 % |    5 %     |
| Requirement                 | 25 %  | 25 % | 25 % |    25 %     |
| Research                    | 0 %  | 100 %  | 0 % |    0 %     |
| UI Design (if applicable)   | 100 %  | 0 %  | 0 % |   0 %      |
| System Design               | 100 %  | 0 %  | 0 % |    0 %     |
| Implementation              |  25 %  | 25 % | 25 % |   25 %     |
| Testing                     | 0 %   | 5 %  | 95 %|   0 %      |
| Evaluation and Future Work  | 0 %  | 0 % | 100 % |     0 %    |
| User and Deployment Manuals | 50 %  | 50 %  | 0 % |    0 %     |
| Legal Issues                | 0 % | 0 %  | 100 %  |   0 %     |
| Blog and Monthly Video      | 35 %  | 35 % | 20 % |    10 %     |
| **Overall contribution**    | 30 %  | 15 % | 20 % | 35 % |

### Critical Evaluation

**User Experience**: Over the project, we have always kept in mind to make the user experience as smooth as possible, via the user interface, ensuring it’s simple and easy to navigate. We have a simple window which opens upon running the app, with a few different options. We first have a drop down menu which makes it very clear and easy to navigate between the different game modes, which are then activated upon clicking the “Begin” button. We also have an “Options” setting where users can very easily enable things like camera control, and a path to where they want to save the counts of the cards. 

**Functionality**: Our app achieves flawless functionality of the different game modes, and offers seamless switching between them. We have successfully designed an app which can detect coloured cards, hands raised, coloured cards from a top-down perspective, and finally a cumulative card counting feature, which allows teachers to pause and save a snapshot of the classroom’s answers at any given moment. The responses are saved within a text file, with a timestamp and count of cards, at a location in the users Documents which they can specify.

**Stability**: The models which we decided to use have fixed weights and do not rely on a random seed to be generated. As a result, our app is very stable and will function in the exact same way every time it is compiled. Since this app is run fully locally, it does not require constant support and updates from package managers, and will continue to function in the same way forever. 

**Efficiency**: Our app can be run instantly from the executable file. Originally, when launching the game alongside the camera and the detection features, it was also able to run with almost no delay. However, upon switching our model to an OpenVINO based one, we started to experience around 10 second delays when starting up the camera for the main game. Once the camera has launched, the game continues to execute flawlessly.

**Compatibility**: Our app was designed in collaboration with Intel, and hence due to the OpenVINO models we used, it is optimised for intel based systems, but will also run on other CPUs but not as efficiently. As for operating systems, we have tested this app on windows, mac and ubuntu based systems and we can confirm that this app can only be run on windows systems. The main point about this app's compatability, is that you do not need to install anything. This app executable works as a standalone file, and can run on any system, no matter if Python is installed or not, it simply needs to be a windows intel system.

**Maintainability**: The structure and codebase of our project is easy to understand and maintain. It is all well documented on our GitHub, and it is simple to change the functionality and use case of our primary AI model, to whatever functionality a developer sees fit. 

**Project Management**: Overall, we have managed our project well. At the beginning of the project we created some base plans for what we wanted to achieve, made a Gantt chart to outline deadlines and tasks which we would like to complete. We also created and consistently managed a GitHub repository where we documented all changed to the codebase and created branches for any extra features in development, which we could then send pull requests for and review them as a team. 

We also organised a lot of our progress checks on Teams and WhatsApp groups, in addition to the weekly Tuesday labs, which was our main time together to review any code and features and talk about plans for the week ahead. While the workload at times could’ve been more evenly distributed, the project was managed effectively in the given time.

### Future Work

Given more time, we could have included more features than we included in the final build, the main one being the LLM quiz generator. We got very close to fully integrating this OpenVINO based text to quiz generator, having gone as far as managing to compile it with pyinstaller. 

Unfortunately, due to time management and time constraints, we were unable to fully integrate this part of the project into the app, and currently sits separated from the rest of the game. For the future of the LLM, if more time was allocated, we could put more resources into properly training larger models to improve its functionality. We had plans to host AWS servers in order to gain access to much more capable GPUs with totals of 40GB VRAM in order to train and fine tune the larger models with billions more parameters than the model we ended up using. However, due to hardware limitations of 16GB VRAM, we were only able to use and quantise model around 10GB in size.

On the card and hand detection side of things, given more time, we could have definitely allocated more resources into testing all kinds of boundary conditions, such as intense background colours, and similar colours to the cards which we are detecting. We had ideas floating around about potentially using green screens to simulate any background we desire, and thoroughly test the detection with all kinds of noise. However due to time and budget constraints we were unable to fully realise this plan, but this would be a good way forward given a lot more time. 
