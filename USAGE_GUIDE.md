# 🎮 Gesture-Controlled CAD Model System

## 🚀 Quick Start

1. **Setup** (run once):
   ```bash
   setup.bat
   ```

2. **Start the system**:
   - Run `start_tracker.bat` (keep this running)
   - Run `start_web.bat` (or open `index.html`)
   - Open http://localhost:8000 in your browser

3. **Use gesture controls**:
   - Hold your hand in front of the camera
   - Tilt your hand to rotate the model
   - Move your hand to translate the model
   - Pinch fingers to zoom
   - Make a fist to reset

## 📁 Project Structure

```
Gesture/
├── 📄 index.html              # Main web interface
├── 📄 gesture_tracker.py      # Python hand tracking backend
├── 📄 config.json            # Configuration settings
├── 📄 requirements.txt       # Python dependencies
├── 📄 setup.bat              # One-time setup script
├── 📄 start_tracker.bat      # Start gesture tracking
├── 📄 start_web.bat          # Start web server
├── 📄 test_system.py         # System testing
├── 📁 js/
│   ├── 📄 app.js             # Main 3D application
│   └── 📄 model-loader.js    # External model loader
├── 📁 models/                # Place your CAD models here
├── 📄 README.md              # Documentation
└── 📄 TROUBLESHOOTING.md     # Help guide
```

## 🎯 Gesture Controls

| Gesture | Action | Description |
|---------|--------|-------------|
| ✋ **Open Hand** | Rotate & Move | Tilt hand to rotate model, move hand to translate |
| 🤏 **Pinch** | Zoom | Pinch thumb and index finger together |
| ✊ **Fist** | Reset | Make a fist to reset model to center |

## ⚙️ Configuration

Edit `config.json` to adjust:
- **Sensitivity**: How responsive gestures are
- **Camera settings**: Resolution and frame rate
- **Hand tracking**: Detection thresholds
- **Model behavior**: Scaling and rotation limits

## 🔧 Advanced Features

### Loading Your Own CAD Models

1. Place `.gltf`, `.glb`, or `.stl` files in the `models/` folder
2. Modify `js/app.js` to load your model:
   ```javascript
   // Replace the createModel() function call with:
   const modelLoader = new ModelLoader(this.scene);
   modelLoader.loadModel('models/your-model.gltf', (model) => {
       this.model = model;
   });
   ```

### Customizing Gestures

Modify `gesture_tracker.py` to add new gestures:
- Add detection functions (e.g., `detect_peace_sign()`)
- Update `process_frame()` to handle new gestures
- Add corresponding actions in the web interface

### Performance Optimization

For better performance:
1. Lower camera resolution in `config.json`
2. Reduce FPS settings
3. Close other applications
4. Use good lighting conditions

## 🚨 Troubleshooting

### Quick Fixes
- **No hand detected**: Improve lighting, clean camera
- **WebSocket error**: Restart `start_tracker.bat`
- **Poor performance**: Lower resolution in `config.json`
- **Model not moving**: Check browser console (F12)

### Getting Help
1. Run `python test_system.py` to check system status
2. See `TROUBLESHOOTING.md` for detailed solutions
3. Check camera permissions in browser and Windows

## 📋 Requirements

- **Python 3.8+** with packages: opencv-python, mediapipe, numpy, websockets
- **Modern web browser** with WebGL support
- **Camera/webcam** (built-in or USB)
- **Windows 10/11** (or adapt scripts for Mac/Linux)

## 🎨 Features

- **Real-time hand tracking** using MediaPipe
- **Smooth 3D rendering** with Three.js
- **Configurable sensitivity** for all gestures
- **Visual feedback** in camera window
- **Modern web interface** with status indicators
- **Support for external CAD models**
- **Cross-platform compatible** (with minor script changes)

## 🔄 Updates and Extensions

The system is designed to be extensible:
- Add new gesture types
- Support multiple hands
- Integrate with CAD software APIs
- Add voice commands
- Support VR/AR displays
- Machine learning gesture recognition

Enjoy controlling your CAD models with natural hand gestures! 🚀
