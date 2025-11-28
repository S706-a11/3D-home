import './style.css';
import { Scene } from './core/Scene';
// import { ModelLoader } from './utils/ModelLoader';
import { CharacterController } from './models/CharacterController';
import * as THREE from 'three';

// Initialize the app
const app = document.querySelector<HTMLDivElement>('#app')!;

app.innerHTML = `
  <div id="canvas-container"></div>
  <div id="controls-info">
    <h2>Controls</h2>
    <p><strong>WASD</strong> or <strong>Arrow Keys</strong> - Move character</p>
    <p><strong>Shift</strong> - Sprint</p>
    <p><strong>Mouse</strong> - Rotate camera (drag)</p>
    <p><strong>Scroll</strong> - Zoom in/out</p>
  </div>
  <div id="loading" class="loading">
    <div class="loading-spinner"></div>
    <p>Loading Three.js Scene...</p>
  </div>
`;

// Get container element
const container = document.querySelector<HTMLDivElement>('#canvas-container')!;
const loadingElement = document.querySelector<HTMLDivElement>('#loading')!;

// Initialize scene
const scene = new Scene(container);

// Create a simple ground plane
const groundGeometry = new THREE.PlaneGeometry(20, 20);
const groundMaterial = new THREE.MeshStandardMaterial({
  color: 0x2d4a3e,
  roughness: 0.8,
  metalness: 0.2
});
const ground = new THREE.Mesh(groundGeometry, groundMaterial);
ground.rotation.x = -Math.PI / 2;
ground.receiveShadow = true;
scene.add(ground);

// Add a grid helper
const gridHelper = new THREE.GridHelper(20, 20, 0x444444, 0x222222);
scene.add(gridHelper);

// Create a simple character (cube for demonstration)
const characterGeometry = new THREE.BoxGeometry(0.5, 1, 0.5);
const characterMaterial = new THREE.MeshStandardMaterial({
  color: 0x4a90e2,
  roughness: 0.4,
  metalness: 0.6
});
const characterMesh = new THREE.Mesh(characterGeometry, characterMaterial);
characterMesh.position.y = 0.5;
characterMesh.castShadow = true;

// Add character to scene
scene.add(characterMesh);

// Initialize character controller
const characterController = new CharacterController(characterMesh, 5, 5);

// Update character in animation loop
scene.onAnimate((delta) => {
  characterController.update(delta);
});

// Add some decorative objects
const addDecorations = () => {
  // Add some cubes around the scene
  const cubeGeometry = new THREE.BoxGeometry(0.5, 0.5, 0.5);
  const cubeMaterial = new THREE.MeshStandardMaterial({
    color: 0xe94560,
    roughness: 0.5,
    metalness: 0.3
  });

  for (let i = 0; i < 5; i++) {
    const cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
    const angle = (i / 5) * Math.PI * 2;
    const radius = 5;
    cube.position.set(
      Math.cos(angle) * radius,
      0.25,
      Math.sin(angle) * radius
    );
    cube.castShadow = true;
    cube.receiveShadow = true;
    scene.add(cube);
  }

  // Add spheres
  const sphereGeometry = new THREE.SphereGeometry(0.3, 32, 32);
  const sphereMaterial = new THREE.MeshStandardMaterial({
    color: 0xf4a261,
    roughness: 0.3,
    metalness: 0.7
  });

  for (let i = 0; i < 3; i++) {
    const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
    sphere.position.set(
      (Math.random() - 0.5) * 8,
      0.3,
      (Math.random() - 0.5) * 8
    );
    sphere.castShadow = true;
    sphere.receiveShadow = true;
    scene.add(sphere);
  }
};

addDecorations();

// Hide loading screen
setTimeout(() => {
  loadingElement.style.opacity = '0';
  setTimeout(() => {
    loadingElement.style.display = 'none';
  }, 500);
}, 1000);

// Example of how to load a GLTF model (commented out - uncomment when you have a model)
/*
const modelLoader = new ModelLoader((progress) => {
  console.log('Loading progress:', progress);
});

modelLoader.load('/models/your-model.glb')
  .then((gltf) => {
    const model = gltf.scene;
    model.position.set(0, 0, 0);
    scene.add(model);
    
    // If the model has animations
    if (gltf.animations.length > 0) {
      characterController.setupAnimations(gltf.animations);
      characterController.playAnimation('idle');
    }
    
    // Replace the cube with the loaded model
    scene.remove(characterMesh);
    const newController = new CharacterController(model, 5, 5);
    
    scene.onAnimate((delta) => {
      newController.update(delta);
    });
  })
  .catch((error) => {
    console.error('Failed to load model:', error);
  });
*/

console.log('🎮 Three.js scene initialized!');
console.log('📦 Use WASD or Arrow keys to move the character');
console.log('🖱️ Drag with mouse to rotate camera, scroll to zoom');
