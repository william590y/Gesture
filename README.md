# Gesture-Controlled CAD Model Manipulation

A real-time gesture control system that allows you to manipulate 3D CAD models using hand gestures captured through your camera.

## Features

- **Hand Tracking**: Real-time hand detection and tracking using MediaPipe
- **Gesture Recognition**: Recognizes hand rotations and movements
- **3D Model Control**: 
  - Rotate model by tilting your hand
  - Move model by moving your hand around the screen
  - Zoom in/out with pinch gestures
- **Real-time Rendering**: Smooth 3D rendering using Three.js

## Setup

### Python Backend (Hand Tracking)
```bash
pip install -r requirements.txt
python gesture_tracker.py
```

### Web Interface (3D Rendering)
```bash
# Open index.html in your browser
# Or use a local server:
python -m http.server 8000
```

## Usage

1. Run the Python gesture tracker
2. Open the web interface
3. Allow camera access
4. Hold your hand in front of the camera
5. Tilt your hand to rotate the model
6. Move your hand to translate the model
7. Pinch fingers to zoom

## Controls

- **Rotation**: Tilt your hand left/right, up/down
- **Translation**: Move your hand around the screen
- **Zoom**: Pinch fingers together/apart
- **Reset**: Make a fist gesture

## Requirements

- Python 3.8+
- Modern web browser with WebGL support
- Camera/webcam
