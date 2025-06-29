class GestureControlledCAD {
    constructor() {
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.model = null;
        this.websocket = null;
        this.connected = false;
        
        // Gesture data
        this.gestureData = {
            detected: false,
            rotation: { x: 0, y: 0, z: 0 },
            translation: { x: 0, y: 0 },
            zoom: 1.0,
            action: 'none'
        };
        
        // Model transform state
        this.modelRotation = { x: 0, y: 0, z: 0 };
        this.modelPosition = { x: 0, y: 0, z: 0 };
        this.modelScale = 1.0;
        
        // Smoothing factors
        this.rotationSmoothness = 0.1;
        this.translationSmoothness = 0.1;
        this.scaleSmoothness = 0.05;
        
        this.init();
    }
    
    init() {
        this.setupThreeJS();
        this.createModel();
        this.setupLighting();
        this.setupWebSocket();
        this.animate();
        
        // Hide loading screen
        setTimeout(() => {
            document.getElementById('loading').style.display = 'none';
        }, 1000);
    }
    
    setupThreeJS() {
        // Scene
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x1a1a2e);
        
        // Camera
        this.camera = new THREE.PerspectiveCamera(
            75, 
            window.innerWidth / window.innerHeight, 
            0.1, 
            1000
        );
        this.camera.position.set(0, 0, 5);
        
        // Renderer
        this.renderer = new THREE.WebGLRenderer({ 
            antialias: true,
            alpha: true 
        });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setClearColor(0x000000, 0);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        
        // Add to DOM
        document.getElementById('canvas-container').appendChild(this.renderer.domElement);
        
        // Handle window resize
        window.addEventListener('resize', () => this.onWindowResize());
    }
    
    createModel() {
        // Create a complex geometric model (representing a CAD model)
        const group = new THREE.Group();
        
        // Main body (cylinder)
        const mainGeometry = new THREE.CylinderGeometry(0.8, 0.8, 2, 32);
        const mainMaterial = new THREE.MeshPhongMaterial({ 
            color: 0x4a90e2,
            shininess: 100,
            specular: 0x111111
        });
        const mainMesh = new THREE.Mesh(mainGeometry, mainMaterial);
        mainMesh.castShadow = true;
        mainMesh.receiveShadow = true;
        group.add(mainMesh);
        
        // Top cap (torus)
        const topGeometry = new THREE.TorusGeometry(0.6, 0.2, 16, 100);
        const topMaterial = new THREE.MeshPhongMaterial({ 
            color: 0xe74c3c,
            shininess: 100
        });
        const topMesh = new THREE.Mesh(topGeometry, topMaterial);
        topMesh.position.y = 1.2;
        topMesh.castShadow = true;
        group.add(topMesh);
        
        // Bottom base (box)
        const baseGeometry = new THREE.BoxGeometry(1.6, 0.3, 1.6);
        const baseMaterial = new THREE.MeshPhongMaterial({ 
            color: 0x2ecc71,
            shininess: 100
        });
        const baseMesh = new THREE.Mesh(baseGeometry, baseMaterial);
        baseMesh.position.y = -1.15;
        baseMesh.castShadow = true;
        baseMesh.receiveShadow = true;
        group.add(baseMesh);
        
        // Side details (smaller cylinders)
        for (let i = 0; i < 4; i++) {
            const angle = (i / 4) * Math.PI * 2;
            const detailGeometry = new THREE.CylinderGeometry(0.1, 0.1, 1.5, 8);
            const detailMaterial = new THREE.MeshPhongMaterial({ 
                color: 0xf39c12,
                shininess: 100
            });
            const detailMesh = new THREE.Mesh(detailGeometry, detailMaterial);
            detailMesh.position.x = Math.cos(angle) * 1.0;
            detailMesh.position.z = Math.sin(angle) * 1.0;
            detailMesh.castShadow = true;
            group.add(detailMesh);
        }
        
        this.model = group;
        this.scene.add(this.model);
    }
    
    setupLighting() {
        // Ambient light
        const ambientLight = new THREE.AmbientLight(0x404040, 0.4);
        this.scene.add(ambientLight);
        
        // Main directional light
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(5, 10, 5);
        directionalLight.castShadow = true;
        directionalLight.shadow.mapSize.width = 2048;
        directionalLight.shadow.mapSize.height = 2048;
        directionalLight.shadow.camera.near = 0.5;
        directionalLight.shadow.camera.far = 50;
        this.scene.add(directionalLight);
        
        // Point light for dynamic lighting
        const pointLight = new THREE.PointLight(0x4a90e2, 0.5, 10);
        pointLight.position.set(-5, 5, 2);
        this.scene.add(pointLight);
        
        // Spot light for dramatic effect
        const spotLight = new THREE.SpotLight(0xffffff, 0.3);
        spotLight.position.set(0, 10, 0);
        spotLight.target = this.model;
        spotLight.angle = Math.PI / 4;
        spotLight.penumbra = 0.1;
        spotLight.decay = 2;
        spotLight.distance = 20;
        this.scene.add(spotLight);
    }
    
    setupWebSocket() {
        const connectWebSocket = () => {
            try {
                this.websocket = new WebSocket('ws://localhost:8765');
                
                this.websocket.onopen = () => {
                    console.log('Connected to gesture tracker');
                    this.connected = true;
                    this.updateConnectionStatus(true);
                };
                
                this.websocket.onmessage = (event) => {
                    try {
                        this.gestureData = JSON.parse(event.data);
                        this.updateUI();
                    } catch (error) {
                        console.error('Error parsing gesture data:', error);
                    }
                };
                
                this.websocket.onclose = () => {
                    console.log('Disconnected from gesture tracker');
                    this.connected = false;
                    this.updateConnectionStatus(false);
                    
                    // Attempt to reconnect after 3 seconds
                    setTimeout(connectWebSocket, 3000);
                };
                
                this.websocket.onerror = (error) => {
                    console.error('WebSocket error:', error);
                    this.connected = false;
                    this.updateConnectionStatus(false);
                };
                
            } catch (error) {
                console.error('Failed to create WebSocket connection:', error);
                setTimeout(connectWebSocket, 3000);
            }
        };
        
        connectWebSocket();
    }
    
    updateConnectionStatus(connected) {
        const statusIndicator = document.getElementById('connection-status');
        const statusText = document.getElementById('connection-text');
        
        if (connected) {
            statusIndicator.className = 'status-indicator status-connected';
            statusText.textContent = 'Connected to gesture tracker';
        } else {
            statusIndicator.className = 'status-indicator status-disconnected';
            statusText.textContent = 'Connecting to gesture tracker...';
        }
    }
    
    updateUI() {
        document.getElementById('current-action').textContent = this.gestureData.action;
        document.getElementById('hand-detected').textContent = this.gestureData.detected;
    }
    
    updateModelTransform() {
        if (!this.model || !this.gestureData.detected) return;
        
        // Handle different gesture actions
        switch (this.gestureData.action) {
            case 'rotate':
                // Smooth rotation based on hand orientation
                const targetRotationX = THREE.MathUtils.degToRad(this.gestureData.rotation.x * 0.5);
                const targetRotationY = THREE.MathUtils.degToRad(this.gestureData.rotation.y * 0.5);
                const targetRotationZ = THREE.MathUtils.degToRad(this.gestureData.rotation.z * 0.5);
                
                this.modelRotation.x = THREE.MathUtils.lerp(
                    this.modelRotation.x, 
                    targetRotationX, 
                    this.rotationSmoothness
                );
                this.modelRotation.y = THREE.MathUtils.lerp(
                    this.modelRotation.y, 
                    targetRotationY, 
                    this.rotationSmoothness
                );
                this.modelRotation.z = THREE.MathUtils.lerp(
                    this.modelRotation.z, 
                    targetRotationZ, 
                    this.rotationSmoothness
                );
                
                // Smooth translation based on hand position
                const targetX = this.gestureData.translation.x * 3;
                const targetY = this.gestureData.translation.y * 3;
                
                this.modelPosition.x = THREE.MathUtils.lerp(
                    this.modelPosition.x,
                    targetX,
                    this.translationSmoothness
                );
                this.modelPosition.y = THREE.MathUtils.lerp(
                    this.modelPosition.y,
                    targetY,
                    this.translationSmoothness
                );
                break;
                
            case 'zoom':
                // Zoom based on pinch gesture
                const targetScale = this.gestureData.zoom * 1.5;
                this.modelScale = THREE.MathUtils.lerp(
                    this.modelScale,
                    targetScale,
                    this.scaleSmoothness
                );
                break;
                
            case 'reset':
                // Reset to default position
                this.modelRotation = { x: 0, y: 0, z: 0 };
                this.modelPosition = { x: 0, y: 0, z: 0 };
                this.modelScale = 1.0;
                break;
        }
        
        // Apply transformations to the model
        this.model.rotation.set(
            this.modelRotation.x,
            this.modelRotation.y,
            this.modelRotation.z
        );
        
        this.model.position.set(
            this.modelPosition.x,
            this.modelPosition.y,
            this.modelPosition.z
        );
        
        this.model.scale.setScalar(this.modelScale);
    }
    
    animate() {
        requestAnimationFrame(() => this.animate());
        
        // Update model based on gesture data
        this.updateModelTransform();
        
        // Add subtle rotation when no gestures are detected
        if (!this.gestureData.detected) {
            this.model.rotation.y += 0.005;
        }
        
        // Render the scene
        this.renderer.render(this.scene, this.camera);
    }
    
    onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }
}

// Initialize the application when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new GestureControlledCAD();
});
