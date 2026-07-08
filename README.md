# 🌌 APHELION: Deep Learning Celestial Extraction
### Neural Oracle & Astrophysical Anomaly Classifier // v4.2

[![Live Deployment](https://img.shields.io/badge/Vercel-Deployed-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://aphelion-space-cnn.vercel.app/)
[![Backend Status](https://img.shields.io/badge/Render-Online-46E3B7?style=for-the-badge&logo=render&logoColor=white)]()
[![TensorFlow](https://img.shields.io/badge/TensorFlow-FF6F00?style=for-the-badge&logo=tensorflow&logoColor=white)]()
[![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white)]()
[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)]()

An advanced, fully-decoupled Convolutional Neural Network pipeline utilizing a fine-tuned MobileNetV2 engine and Explainable AI (Grad-CAM) to classify multi-class deep space phenomena.

[**Launch the Command Center**](https://aphelion-space-cnn.vercel.app/) • [**Report an Anomaly**](https://github.com/Symbiote07/Aphelion-Space-CNN/issues)

</div>

---

## 🛰️ System Architecture Overview

Aphelion is not a monolithic script; it is a production-grade, decoupled full-stack machine learning architecture. It separates the heavy tensor computations from the client-side rendering, bridging them via a high-speed REST API.

* **The Client (Frontend):** A glassmorphic, sci-fi inspired HUD built with React, Vite, and Tailwind CSS. It handles terminal animations, state management, and telemetry uploads without blocking the main thread.
* **The Oracle (Backend):** A lightweight FastAPI server running a custom-trained TensorFlow `MobileNetV2` model. It catches telemetry data, processes the prediction matrix, and applies Gradient-weighted Class Activation Mapping (Grad-CAM) in real-time.
* **The Bridge:** Cross-Origin Resource Sharing (CORS) enabled endpoints passing `multipart/form-data` and returning encoded Base64 thermal heatmaps.

## 🧠 Neural Architecture & Features

- **12-Class Astrophysical Taxonomy:** Trained to identify specific celestial bodies including Black Holes, Pulsars, Quasars, Interacting Galaxies, and Dark Matter Anomalies.
- **Explainable AI (xAI):** Integrates Grad-CAM to generate thermal heatmaps over the original telemetry, visually highlighting the exact spatial tensors the neural network prioritized to make its consensus.
- **MobileNetV2 Backbone:** Utilizes depthwise separable convolutions to maintain high accuracy while keeping the parameter count strictly optimized for cloud deployment.
- **Dynamic Resizing Pipeline:** Built-in OpenCV processing to strictly enforce `(128, 128, 3)` tensor shapes regardless of raw input dimensions.

## 🛠️ Tech Stack

**Frontend Engine**
- `React.js` + `Vite`
- `Tailwind CSS v4`
- `Lucide React` (HUD Iconography)
- Hosted on **Vercel**

**Backend Neural Server**
- `Python 3.11.8`
- `TensorFlow 2.16.1` + `Keras`
- `FastAPI` + `Uvicorn`
- `OpenCV-Headless`
- Hosted on **Render**

---

## ⚙️ Local Ignition Sequence (Installation)

To run the Aphelion Command Center on your local machine, you must spin up both the Neural Oracle (Backend) and the HUD (Frontend) on separate ports.

### 1. Initialize the Backend
```bash
# Navigate to the backend directory
cd backend

# Create and activate a Python virtual environment
python -m venv .venv
.\.venv\Scripts\activate  # Windows
# source .venv/bin/activate  # Mac/Linux

# Install strictly versioned dependencies
pip install -r requirements.txt

# Launch the FastAPI server (Runs on port 8000)
uvicorn aphelion_backend:app --reload

```

### 2. Initialize the Frontend

```bash
# Open a new terminal and navigate to the frontend directory
cd frontend

# Install Node modules
npm install

# Launch the Vite development server
npm run dev

```

Navigate to `http://localhost:5173` in your browser. Upload celestial telemetry to initiate the scan.

---

## 📸 System Telemetry (Screenshots)

<div align="center">
  <img src="Screenshot%202026-07-09%20004516.png" alt="Aphelion HUD Black Hole Classification" width="800"/>
  <p><i>Aphelion Interface actively classifying a Black Hole anomaly with 98.48% confidence.</i></p>
  
  <br>

  <img src="Screenshot%202026-07-09%20004559.png" alt="Aphelion HUD Grad-CAM Heatmap" width="800"/>
  <p><i>Live Grad-CAM thermal heatmap generation isolating spatial tensor anomalies.</i></p>

  <br>
  
  <img src="Screenshot%202026-07-08%20151753.png" alt="Aphelion Local Environment" width="800"/>
  <p><i>Command Center locking onto interacting galaxies during local environment testing.</i></p>
</div>
