# Troubleshooting Guide

## Common Issues and Solutions

### 1. Python Packages Not Installing

**Problem**: `pip install` fails or packages don't import
**Solutions**:
- Ensure Python 3.8+ is installed
- Try: `python -m pip install --upgrade pip`
- Use: `pip install --user [package-name]`
- For Windows: `py -m pip install [package-name]`

### 2. Camera Not Working

**Problem**: Camera access denied or no video feed
**Solutions**:
- Check if camera is being used by another application
- Try different camera index: `cv2.VideoCapture(1)` instead of `cv2.VideoCapture(0)`
- Grant camera permissions to your browser and Python
- Restart your computer if camera is stuck

### 3. WebSocket Connection Failed

**Problem**: Browser shows "Connecting to gesture tracker..."
**Solutions**:
- Ensure `gesture_tracker.py` is running first
- Check if port 8765 is available
- Try restarting both the tracker and web server
- Check Windows Firewall settings

### 4. Hand Detection Not Working

**Problem**: "No hand detected" message persists
**Solutions**:
- Ensure good lighting
- Hold hand 1-2 feet from camera
- Try different hand positions and angles
- Clean camera lens
- Adjust `detection_confidence` in `config.json`

### 5. Model Not Responding to Gestures

**Problem**: Hand detected but model doesn't move
**Solutions**:
- Check browser console for errors (F12)
- Verify WebSocket connection status
- Try refreshing the web page
- Adjust sensitivity in `config.json`

### 6. Poor Performance/Lag

**Problem**: Slow response or low FPS
**Solutions**:
- Close other applications
- Reduce camera resolution in `config.json`
- Lower FPS in `config.json`
- Use a more powerful computer

## Configuration Adjustments

Edit `config.json` to fine-tune the system:

### Sensitivity Settings
```json
"gesture_sensitivity": {
  "rotation_multiplier": 0.5,    // Higher = more sensitive rotation
  "translation_multiplier": 3.0, // Higher = more sensitive movement
  "zoom_multiplier": 1.5,        // Higher = more sensitive zoom
  "pinch_threshold": 0.05,       // Lower = easier to trigger pinch
  "smoothing": {
    "rotation": 0.1,             // Higher = smoother but slower
    "translation": 0.1,
    "scale": 0.05
  }
}
```

### Camera Settings
```json
"camera": {
  "width": 640,    // Lower for better performance
  "height": 480,   // Lower for better performance
  "fps": 30        // Lower for better performance
}
```

### Hand Tracking Settings
```json
"hand_tracking": {
  "max_hands": 1,
  "detection_confidence": 0.7,   // Lower = more lenient detection
  "tracking_confidence": 0.5     // Lower = more lenient tracking
}
```

## Testing Commands

1. **Test System**: `python test_system.py`
2. **Test Camera**: `python -c "import cv2; cap = cv2.VideoCapture(0); ret, frame = cap.read(); cap.release(); print('OK' if ret else 'FAIL')"`
3. **Test Packages**: `python -c "import cv2, mediapipe, numpy, websockets; print('All packages OK')"`

## Performance Tips

1. **Close unnecessary applications** to free up CPU and memory
2. **Use good lighting** - natural light works best
3. **Position camera at eye level** for better hand tracking
4. **Keep hand movements smooth** for better tracking
5. **Use a plain background** to reduce tracking interference

## Getting Help

If you're still having issues:
1. Run `python test_system.py` and share the output
2. Check the error messages in the command prompt
3. Look at browser developer console (F12) for JavaScript errors
4. Try the basic examples first before advanced features

## Hardware Requirements

- **Camera**: Built-in webcam or USB camera
- **CPU**: Modern multi-core processor recommended
- **RAM**: 4GB minimum, 8GB recommended
- **GPU**: Not required but helpful for performance
- **OS**: Windows 10/11, macOS, or Linux
