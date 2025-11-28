import './style.css';
import { Scene } from './core/Scene';
import { DisplayStand } from './models/DisplayStand';
import { InteractionManager } from './core/InteractionManager';
// import { ModelLoader } from './utils/ModelLoader';
import { CharacterController } from './models/CharacterController';
import { CameraFollower } from './utils/CameraFollower';
import { PhysicsSystem } from './core/PhysicsSystem';
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
    <button id="reset-camera">Reset Camera</button>
  </div>
  <div id="loading" class="loading">
    <div class="loading-spinner"></div>
    <p>Loading Three.js Scene...</p>
  </div>
  


  <!-- Project Modal -->
  <div id="project-modal">
    <div class="modal-content">
      <div class="modal-header">
        <h2 id="project-title">Project Title</h2>
        <button class="close-btn">&times;</button>
      </div>
      <div class="modal-body">
        <img id="project-image" src="" alt="Project Image">
        <p id="project-desc">Project description goes here.</p>
      </div>
      <div class="modal-footer">
        <a id="project-link" href="#" target="_blank" class="project-link-btn">View Project</a>
      </div>
    </div>
  </div>
`;

// Get container element
const container = document.querySelector<HTMLDivElement>('#canvas-container')!;
const loadingElement = document.querySelector<HTMLDivElement>('#loading')!;
const resetBtn = document.querySelector<HTMLButtonElement>('#reset-camera')!;

// Initialize scene
const scene = new Scene(container);
const physicsSystem = new PhysicsSystem();

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
// Add character to physics (Kinematic)
physicsSystem.addObject(characterMesh, 100, 0.5, false, true);

// Create 4 Physics Balls
const ballColors = [0xff4444, 0x44ff44, 0x4444ff, 0xffff44];
const ballGeometry = new THREE.SphereGeometry(0.5, 32, 32);

for (let i = 0; i < 4; i++) {
  const ballMaterial = new THREE.MeshStandardMaterial({
    color: ballColors[i],
    roughness: 0.4,
    metalness: 0.2
  });
  const ballMesh = new THREE.Mesh(ballGeometry, ballMaterial);

  // Position in a circle
  const angle = (i / 4) * Math.PI * 2;
  const radius = 3;
  ballMesh.position.set(
    Math.cos(angle) * radius,
    5, // Drop from height
    Math.sin(angle) * radius
  );

  ballMesh.castShadow = true;
  ballMesh.receiveShadow = true;
  scene.add(ballMesh);
  physicsSystem.addObject(ballMesh, 1, 0.5);
}

// Initialize character controller
const characterController = new CharacterController(characterMesh, scene.getCamera(), 5, 5);

// Initialize Interaction Manager
const interactionManager = new InteractionManager(scene.getCamera(), characterMesh);

// Create Display Stands
const projects = [
  {
    id: 'p1',
    title: 'Project Alpha',
    description: 'A revolutionary AI assistant that helps you code faster.',
    imageUrl: 'https://via.placeholder.com/400x200/4a90e2/ffffff?text=Project+Alpha',
    projectUrl: '#'
  },
  {
    id: 'p2',
    title: 'Neon City',
    description: 'A cyberpunk-themed 3D experience built with Three.js.',
    imageUrl: 'https://via.placeholder.com/400x200/e94560/ffffff?text=Neon+City',
    projectUrl: '#'
  },
  {
    id: 'p3',
    title: 'Eco Tracker',
    description: 'Mobile app for tracking your carbon footprint.',
    imageUrl: 'https://via.placeholder.com/400x200/44ff44/ffffff?text=Eco+Tracker',
    projectUrl: '#'
  }
];

projects.forEach((proj, index) => {
  const stand = new DisplayStand(proj);
  const angle = (index / projects.length) * Math.PI * 2;
  const radius = 8;
  stand.setPosition(
    Math.cos(angle) * radius,
    0,
    Math.sin(angle) * radius
  );
  stand.setRotation(-angle + Math.PI / 2); // Face center

  scene.add(stand.getMesh());
  interactionManager.addStand(stand);

  // Add to physics system as static object
  physicsSystem.addObject(stand.getMesh(), 0, 0.8, true);
});

const hint = document.createElement('div');
hint.id = 'interaction-hint';
hint.innerHTML = '<span class="hint-text">Click to View</span>';
document.body.appendChild(hint);

// Modal Close Logic
const modal = document.getElementById('project-modal')!;
const closeBtn = document.querySelector('.close-btn')!;

if (closeBtn) {
  closeBtn.addEventListener('click', () => {
    modal.classList.remove('active');
    setTimeout(() => {
      modal.style.display = 'none';
    }, 300);
  });
}

window.addEventListener('click', (e) => {
  if (e.target === modal) {
    modal.classList.remove('active');
    setTimeout(() => {
      modal.style.display = 'none';
    }, 300);
  }
});

// Initialize camera follower
const cameraFollower = new CameraFollower(
  scene.getCamera(),
  characterMesh,
  scene.getControls()
);

// Reset camera button
resetBtn.addEventListener('click', () => {
  cameraFollower.resetCamera();
  // Remove focus from button so spacebar doesn't trigger it again
  resetBtn.blur();
});

let lastCharPos = characterMesh.position.clone();

// Update character in animation loop
scene.onAnimate((delta) => {
  characterController.update(delta);

  // Update character physics velocity (Kinematic)
  const charPhysObj = physicsSystem.getObject(characterMesh);
  if (charPhysObj && delta > 0) {
    const displacement = characterMesh.position.clone().sub(lastCharPos);
    charPhysObj.velocity.copy(displacement.divideScalar(delta));
  }
  lastCharPos.copy(characterMesh.position);

  physicsSystem.update(delta);
  cameraFollower.update();
  interactionManager.update();
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
