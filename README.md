# 3D Probability Tower

An interactive educational tool for learning probability and series system reliability through a hands-on, 3D visualization. This project brings abstract concepts to life, demonstrating the "weakest link" principle in a fun and engaging way.

<br>

> **Note:** You would replace the link above with an actual screen recording or GIF of your project.

<br>

## Table of Contents
- [Features](#-features)
- [Educational Concepts](#-educational-concepts)
- [The Math Behind It](#-the-math-behind-it)
- [Tech Stack](#-tech-stack)
- [Getting Started](#-getting-started)
- [How to Use](#-how-to-use)
- [Contributing](#-contributing)
- [License](#-license)
- [Support](#-support)

---

## ✨ Features
- ✅ **Realistic 3D Visualization:** A system built from virtual popsicle sticks, an LED, wires, and a battery.
- ✅ **Interactive Learning:** Drag components to simulate failure, use control buttons, and see instant results.
- ✅ **Real-time Calculations:** Watch the system reliability formula update with every action you take.
- ✅ **Guided Explanations:** Pop-up modals provide detailed explanations to reinforce learning.
- ✅ **Fully Responsive:** Works seamlessly on desktop, tablet, and mobile devices.

---

## 🎓 Educational Concepts
This tool is designed to provide an intuitive understanding of several key concepts in probability and reliability engineering:

- **Series System Reliability:** The probability of the entire system working is the product of individual component probabilities:  
    $P(\text{System}) = P(A) \times P(B) \times P(C) \times P(D)$
- **The Weakest Link Principle:** A single component failure causes the entire system to fail.
- **Multiplication Rule for Independent Events:** See how probabilities compound in a series configuration.
- **Real-world Applications:** Understand the relevance of these concepts in everything from holiday lights to aerospace engineering.

---

## 📊 The Math Behind It
The core of this simulation is the formula for the reliability of a series system. The system functions only if all of its components function.

The probability of the entire system working is the product of the reliabilities of its individual components:

$$
P(\text{System Working}) = \prod_{i=1}^{n} P(\text{Component}_i)
$$

For our four-component system, this is:

$$
P(\text{System}) = P(A) \times P(B) \times P(C) \times P(D)
$$

This demonstrates that system reliability can never be higher than the reliability of its least reliable component.

---

## 🛠️ Tech Stack
This project is built with modern web technologies and follows a modular design.

- **Frontend:** HTML5, CSS3 (with Custom Properties), and vanilla JavaScript (ES6+).
- **Core Engine (`core-engine.js`):** Manages application state, component data, and all reliability calculations.
- **3D Renderer (`tower-renderer.js`):** Uses pure CSS transforms to create the 3D environment and handle all rendering and visual effects.
- **Architecture:** Built on a modular, event-driven architecture to keep concerns separated and code maintainable.
- **No external frameworks or libraries** are required, making it lightweight and easy to study.

---

## ⚙️ Getting Started

To run this project on your local machine, follow these simple steps.

### Prerequisites
You need to have Python 3 installed on your system to use its built-in web server.

### Installation

**Clone the repository:**
```bash
git clone https://github.com/your-username/3D-Probability-Tower.git
```

**Navigate to the project directory:**
```bash
cd 3D-Probability-Tower
```

**Start a local web server:**  
The project must be served by a web server due to browser security policies (CORS).
```bash
python -m http.server 8000
```

**Open in your browser:**  
Navigate to [http://localhost:8000](http://localhost:8000) to view the application.

---

## 🎮 How to Use

### Interactive Controls
- **Drag & Drop:** Click and drag any popsicle stick to remove it (fail) or drop it back to its place (restore).
- **Buttons:** Use the Fail and Fix buttons for precise control over each component.
- **System Controls:** Use Reset All to fix the entire system or Random Fail to introduce a surprise failure.

### Keyboard Shortcuts
- `Ctrl+R`: Reset all components.
- `Ctrl+F`: Trigger a random failure.
- `1-4` Keys: Toggle the state of components A through D.
- `ESC`: Close any open modal or notification.

---

## 🤝 Contributing

Contributions are what make the open-source community such an amazing place to learn, inspire, and create. Any contributions you make are greatly appreciated.

If you have a suggestion that would make this better, please fork the repo and create a pull request. You can also simply open an issue with the tag "enhancement".

1. **Fork the Project**
2. **Create your Feature Branch**  
     `git checkout -b feature/AmazingFeature`
3. **Commit your Changes**  
     `git commit -m 'Add some AmazingFeature'`
4. **Push to the Branch**  
     `git push origin feature/AmazingFeature`
5. **Open a Pull Request**

---

## 📄 License

Distributed under the MIT License. See [LICENSE](LICENSE) for more information.

---

## 🙋 Support

If you encounter any issues or have a question:

- Check the browser's developer console for errors.
- Ensure you are running the project from a local server.
- Feel free to open an issue on GitHub.


```Made By Adarsh```