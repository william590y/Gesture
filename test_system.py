import sys
import subprocess

def test_python_packages():
    """Test if required Python packages can be imported"""
    required_packages = ['cv2', 'mediapipe', 'numpy', 'websockets']
    
    print("Testing Python package imports...")
    for package in required_packages:
        try:
            __import__(package)
            print(f"✓ {package} - OK")
        except ImportError:
            print(f"✗ {package} - MISSING")
            return False
    return True

def test_camera():
    """Test camera access"""
    try:
        import cv2
        cap = cv2.VideoCapture(0)
        ret, frame = cap.read()
        cap.release()
        
        if ret:
            print("✓ Camera access - OK")
            return True
        else:
            print("✗ Camera access - FAILED")
            return False
    except Exception as e:
        print(f"✗ Camera test - ERROR: {e}")
        return False

def main():
    print("=" * 50)
    print("Gesture Control CAD - System Test")
    print("=" * 50)
    
    # Test Python packages
    packages_ok = test_python_packages()
    
    # Test camera
    camera_ok = test_camera()
    
    print("\n" + "=" * 50)
    if packages_ok and camera_ok:
        print("✓ All tests passed! System is ready.")
        print("\nNext steps:")
        print("1. Run start_tracker.bat")
        print("2. Run start_web.bat")
        print("3. Open http://localhost:8000 in your browser")
    else:
        print("✗ Some tests failed. Please run setup.bat first.")
    print("=" * 50)

if __name__ == "__main__":
    main()
