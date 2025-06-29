// Model loader utility for loading external CAD models
class ModelLoader {
    constructor(scene) {
        this.scene = scene;
        this.loader = new THREE.GLTFLoader();
    }
    
    loadModel(url, onLoad, onProgress, onError) {
        this.loader.load(
            url,
            (gltf) => {
                const model = gltf.scene;
                
                // Center the model
                const box = new THREE.Box3().setFromObject(model);
                const center = box.getCenter(new THREE.Vector3());
                model.position.sub(center);
                
                // Scale the model to fit in the scene
                const size = box.getSize(new THREE.Vector3());
                const maxSize = Math.max(size.x, size.y, size.z);
                const scale = 2 / maxSize;
                model.scale.setScalar(scale);
                
                // Enable shadows
                model.traverse((child) => {
                    if (child.isMesh) {
                        child.castShadow = true;
                        child.receiveShadow = true;
                    }
                });
                
                this.scene.add(model);
                
                if (onLoad) onLoad(model);
            },
            onProgress,
            onError
        );
    }
    
    loadSTLModel(url, material, onLoad, onProgress, onError) {
        const stlLoader = new THREE.STLLoader();
        
        stlLoader.load(
            url,
            (geometry) => {
                const model = new THREE.Mesh(geometry, material);
                
                // Center and scale the model
                geometry.computeBoundingBox();
                const center = geometry.boundingBox.getCenter(new THREE.Vector3());
                geometry.translate(-center.x, -center.y, -center.z);
                
                const size = geometry.boundingBox.getSize(new THREE.Vector3());
                const maxSize = Math.max(size.x, size.y, size.z);
                const scale = 2 / maxSize;
                model.scale.setScalar(scale);
                
                model.castShadow = true;
                model.receiveShadow = true;
                
                this.scene.add(model);
                
                if (onLoad) onLoad(model);
            },
            onProgress,
            onError
        );
    }
}

// Example usage (add this to your main app.js if you want to load external models):
/*
// In your setupModel function, replace the procedural model creation with:
const modelLoader = new ModelLoader(this.scene);

// Load a GLTF model
modelLoader.loadModel(
    'models/your-model.gltf',
    (model) => {
        this.model = model;
        console.log('Model loaded successfully');
    },
    (progress) => {
        console.log('Loading progress:', progress);
    },
    (error) => {
        console.error('Error loading model:', error);
        // Fallback to procedural model
        this.createModel();
    }
);
*/
