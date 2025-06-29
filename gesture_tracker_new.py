import cv2
import mediapipe as mp
import numpy as np
import json
import math
import asyncio
import websockets
import threading
import time
import os

class GestureTracker:
    def __init__(self):
        # Load configuration
        self.config = self.load_config()
        
        # Initialize MediaPipe
        self.mp_hands = mp.solutions.hands
        self.mp_drawing = mp.solutions.drawing_utils
        self.hands = self.mp_hands.Hands(
            static_image_mode=False,
            max_num_hands=self.config['hand_tracking']['max_hands'],
            min_detection_confidence=self.config['hand_tracking']['detection_confidence'],
            min_tracking_confidence=self.config['hand_tracking']['tracking_confidence']
        )
        
        # Camera setup
        self.cap = cv2.VideoCapture(0)
        self.cap.set(cv2.CAP_PROP_FRAME_WIDTH, self.config['camera']['width'])
        self.cap.set(cv2.CAP_PROP_FRAME_HEIGHT, self.config['camera']['height'])
        
        # Gesture data
        self.current_gesture = {
            'detected': False,
            'rotation': {'x': 0, 'y': 0, 'z': 0},
            'translation': {'x': 0, 'y': 0},
            'zoom': 1.0,
            'action': 'none'  # none, rotate, translate, zoom, reset
        }
        
        # Reference points for gesture calculation
        self.reference_position = None
        self.reference_rotation = None
        
        # WebSocket clients
        self.clients = set()
        
    def load_config(self):
        """Load configuration from config.json"""
        try:
            config_path = os.path.join(os.path.dirname(__file__), 'config.json')
            with open(config_path, 'r') as f:
                return json.load(f)
        except FileNotFoundError:
            # Default configuration if file doesn't exist
            return {
                "camera": {"width": 640, "height": 480, "fps": 30},
                "hand_tracking": {"max_hands": 1, "detection_confidence": 0.7, "tracking_confidence": 0.5},
                "gesture_sensitivity": {
                    "rotation_multiplier": 0.5,
                    "translation_multiplier": 3.0,
                    "zoom_multiplier": 1.5,
                    "pinch_threshold": 0.05,
                    "smoothing": {"rotation": 0.1, "translation": 0.1, "scale": 0.05}
                },
                "websocket": {"host": "localhost", "port": 8765},
                "model": {"auto_rotate_speed": 0.005, "default_scale": 1.0, "max_scale": 3.0, "min_scale": 0.2}
            }
        
    def calculate_hand_rotation(self, landmarks):
        """Calculate hand rotation based on landmark positions"""
        # Get key landmarks
        wrist = landmarks[0]
        middle_mcp = landmarks[9]
        index_mcp = landmarks[5]
        pinky_mcp = landmarks[17]
        
        # Calculate vectors
        palm_vector = np.array([middle_mcp.x - wrist.x, middle_mcp.y - wrist.y])
        width_vector = np.array([index_mcp.x - pinky_mcp.x, index_mcp.y - pinky_mcp.y])
        
        # Calculate angles
        palm_angle = math.atan2(palm_vector[1], palm_vector[0])
        width_angle = math.atan2(width_vector[1], width_vector[0])
        
        # Convert to degrees
        rotation_z = math.degrees(palm_angle)
        rotation_x = math.degrees(width_angle)
        
        # Calculate Y rotation based on hand depth (approximation)
        thumb_tip = landmarks[4]
        pinky_tip = landmarks[20]
        depth_indicator = abs(thumb_tip.x - pinky_tip.x)
        rotation_y = (depth_indicator - 0.1) * 180  # Normalize and scale
        
        return {
            'x': rotation_x * self.config['gesture_sensitivity']['rotation_multiplier'],
            'y': rotation_y * self.config['gesture_sensitivity']['rotation_multiplier'],
            'z': rotation_z * self.config['gesture_sensitivity']['rotation_multiplier']
        }
    
    def calculate_hand_position(self, landmarks):
        """Calculate normalized hand position"""
        # Use wrist as reference point
        wrist = landmarks[0]
        return {
            'x': (wrist.x - 0.5) * 2,  # Normalize to -1 to 1
            'y': (0.5 - wrist.y) * 2   # Flip Y and normalize
        }
    
    def detect_pinch(self, landmarks):
        """Detect pinch gesture for zooming"""
        thumb_tip = landmarks[4]
        index_tip = landmarks[8]
        
        distance = math.sqrt(
            (thumb_tip.x - index_tip.x)**2 + 
            (thumb_tip.y - index_tip.y)**2
        )
        
        return distance < self.config['gesture_sensitivity']['pinch_threshold']
    
    def detect_fist(self, landmarks):
        """Detect fist gesture for reset"""
        # Check if fingertips are below their respective MCPs
        fingers_down = 0
        finger_tips = [8, 12, 16, 20]  # Index, middle, ring, pinky tips
        finger_mcps = [5, 9, 13, 17]   # Corresponding MCPs
        
        for tip, mcp in zip(finger_tips, finger_mcps):
            if landmarks[tip].y > landmarks[mcp].y:
                fingers_down += 1
        
        # Check thumb (different logic due to thumb orientation)
        if landmarks[4].x < landmarks[3].x:  # Thumb tip left of thumb IP
            fingers_down += 1
            
        return fingers_down >= 4
    
    def process_frame(self):
        """Process a single frame from the camera"""
        ret, frame = self.cap.read()
        if not ret:
            return None
            
        # Flip frame horizontally for mirror effect
        frame = cv2.flip(frame, 1)
        rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        
        # Process with MediaPipe
        results = self.hands.process(rgb_frame)
        
        if results.multi_hand_landmarks:
            for hand_landmarks in results.multi_hand_landmarks:
                # Draw landmarks
                self.mp_drawing.draw_landmarks(
                    frame, hand_landmarks, self.mp_hands.HAND_CONNECTIONS
                )
                
                # Extract gesture data
                landmarks = hand_landmarks.landmark
                
                # Calculate rotation
                rotation = self.calculate_hand_rotation(landmarks)
                
                # Calculate position
                position = self.calculate_hand_position(landmarks)
                
                # Detect gestures
                is_pinching = self.detect_pinch(landmarks)
                is_fist = self.detect_fist(landmarks)
                
                # Update gesture data
                self.current_gesture.update({
                    'detected': True,
                    'rotation': rotation,
                    'translation': position,
                    'zoom': 0.5 if is_pinching else 1.0,
                    'action': 'reset' if is_fist else ('zoom' if is_pinching else 'rotate')
                })
                
                # Add visual feedback
                cv2.putText(frame, f"Action: {self.current_gesture['action']}", 
                           (10, 30), cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 255, 0), 2)
                cv2.putText(frame, f"Rotation: {rotation['z']:.1f}°", 
                           (10, 70), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (255, 0, 0), 2)
                
        else:
            self.current_gesture['detected'] = False
            cv2.putText(frame, "No hand detected", 
                       (10, 30), cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 0, 255), 2)
        
        return frame
    
    async def websocket_handler(self, websocket, path):
        """Handle WebSocket connections"""
        self.clients.add(websocket)
        try:
            await websocket.wait_closed()
        finally:
            self.clients.remove(websocket)
    
    async def broadcast_gesture_data(self):
        """Broadcast gesture data to all connected clients"""
        while True:
            if self.clients:
                message = json.dumps(self.current_gesture)
                disconnected = set()
                
                for client in self.clients:
                    try:
                        await client.send(message)
                    except websockets.exceptions.ConnectionClosed:
                        disconnected.add(client)
                
                # Remove disconnected clients
                self.clients -= disconnected
            
            await asyncio.sleep(1/self.config['camera']['fps'])
    
    def run_camera_loop(self):
        """Run the camera processing loop"""
        print("Camera started. Press 'q' to quit.")
        while True:
            frame = self.process_frame()
            if frame is not None:
                cv2.imshow('Gesture Control - Press Q to quit', frame)
                
                if cv2.waitKey(1) & 0xFF == ord('q'):
                    break
        
        self.cap.release()
        cv2.destroyAllWindows()
    
    async def start_websocket_server(self):
        """Start the WebSocket server"""
        host = self.config['websocket']['host']
        port = self.config['websocket']['port']
        
        server = await websockets.serve(self.websocket_handler, host, port)
        print(f"WebSocket server started on ws://{host}:{port}")
        
        # Start broadcasting gesture data
        await asyncio.gather(
            server.wait_closed(),
            self.broadcast_gesture_data()
        )
    
    def run(self):
        """Run the gesture tracker"""
        # Start camera loop in separate thread
        camera_thread = threading.Thread(target=self.run_camera_loop)
        camera_thread.daemon = True
        camera_thread.start()
        
        # Start WebSocket server
        print("Starting Gesture Tracker...")
        print("WebSocket server will start after camera initialization...")
        print("Open the web interface and allow camera access")
        print("Hold your hand in front of the camera to start controlling the model")
        
        try:
            asyncio.run(self.start_websocket_server())
        except KeyboardInterrupt:
            print("\nShutting down gesture tracker...")

if __name__ == "__main__":
    tracker = GestureTracker()
    tracker.run()
