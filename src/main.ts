import './style.css';
import { Scene } from './core/Scene';
import { DisplayStand } from './models/DisplayStand';
import { InteractionManager } from './core/InteractionManager';
import { ModelLoader } from './utils/ModelLoader';
import { CharacterController } from './models/CharacterController';
import { CameraFollower } from './utils/CameraFollower';
import { PhysicsSystem } from './core/PhysicsSystem';
import { AudioManager } from './core/AudioManager';
import { EnvironmentManager } from './core/EnvironmentManager';
import * as THREE from 'three';

// Initialize the app
const app = document.querySelector<HTMLDivElement>('#app')!;

app.innerHTML = `
  <div id="canvas-container"></div>
  <div id="controls-info">
    <h2>Controls</h2>
    
    <div class="control-row">
      <div class="key-group">
        <div class="key-cap" data-key="w">W</div>
        <div class="key-cap" data-key="a">A</div>
        <div class="key-cap" data-key="s">S</div>
        <div class="key-cap" data-key="d">D</div>
      </div>
      <span class="control-desc">Move</span>
    </div>

    <div class="control-row">
      <div class="key-cap wide" data-key="shift">Shift</div>
      <span class="control-desc">Sprint</span>
    </div>

    <div class="control-row">
      <svg class="icon-control" data-action="rotate" viewBox="0 0 24 24">
        <path d="M13,1.07V9H7C6.45,9 6,9.45 6,10V21H13V1.07M15,1.07V21H18C19.1,21 20,20.1 20,19V5C20,3.9 19.1,3 18,3H15M13,23H8C6.9,23 6,22.1 6,21V10C6,9.45 6.45,9 7,9H13V23Z" />
      </svg>
      <span class="control-desc">Rotate Camera</span>
    </div>

    <div class="control-row">
      <svg class="icon-control" data-action="zoom" viewBox="0 0 24 24">
        <path d="M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M12,4C13.11,4 14,4.89 14,6V10H10V6C10,4.89 10.89,4 12,4M12,20C9.79,20 8,18.21 8,16V12H16V16C16,18.21 14.21,20 12,20Z" />
      </svg>
      <span class="control-desc">Zoom</span>
    </div>

    <button id="reset-camera">Reset Camera</button>
  </div>
  
  <div id="audio-controls">
    <button id="mute-btn" title="Toggle Sound">🔇</button>
    <input type="range" id="volume-slider" min="0" max="1" step="0.01" value="0.5" title="Volume">
  </div>
  
  <div id="avatar-container">
    <button id="avatar-icon-btn" title="Choose Avatar">👤</button>
    <div id="avatar-dropdown">
      <div class="avatar-category">Male</div>
      <button class="avatar-option" data-model="character-male-a.glb">Male A</button>
      <button class="avatar-option" data-model="character-male-b.glb">Male B</button>
      <button class="avatar-option" data-model="character-male-c.glb">Male C</button>
      <button class="avatar-option" data-model="character-male-d.glb">Male D</button>
      <button class="avatar-option" data-model="character-male-e.glb">Male E</button>
      <button class="avatar-option" data-model="character-male-f.glb">Male F</button>
      
      <div class="avatar-category">Female</div>
      <button class="avatar-option" data-model="character-female-a.glb">Female A</button>
      <button class="avatar-option" data-model="character-female-b.glb">Female B</button>
      <button class="avatar-option" data-model="character-female-c.glb">Female C</button>
      <button class="avatar-option" data-model="character-female-d.glb">Female D</button>
      <button class="avatar-option" data-model="character-female-e.glb">Female E</button>
      <button class="avatar-option" data-model="character-female-f.glb">Female F</button>
      
      <div class="avatar-category">Other</div>
      <button class="avatar-option" data-model="wheelchair.glb">Wheelchair</button>
      <button class="avatar-option" data-model="wheelchair-power-deluxe.glb">Wheelchair Power Deluxe</button>
      <button class="avatar-option" data-model="wheelchair-power.glb">Wheelchair Power</button>
      <button class="avatar-option" data-model="wheelchair-deluxe.glb">Wheelchair Deluxe</button>
    </div>
  </div>

  <div id="loading" class="loading">
    <div class="loading-spinner"></div>
    <p>Loading Three.js Scene...</p>
  </div>
  
  <div id="interaction-hint"><span class="hint-text">Click to View</span></div>

  <!-- Project Modal -->
  <div id="project-modal">
    <div class="modal-content">
      <div class="modal-header">
        <h2 id="project-title">Project Title</h2>
        <button id="close-modal" class="close-btn">&times;</button>
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

// Create credits element dynamically to ensure visibility
const credits = document.createElement('div');
credits.id = 'credits';
credits.innerHTML = 'Assets by <a href="https://kenney.nl" target="_blank">Kenney</a> • Skybox by <a href="https://polyhaven.com" target="_blank">Poly Haven</a>';
document.body.appendChild(credits);

// Get container element
const container = document.querySelector<HTMLDivElement>('#canvas-container')!;
const loadingElement = document.querySelector<HTMLDivElement>('#loading')!;
const resetBtn = document.querySelector<HTMLButtonElement>('#reset-camera')!;
const muteBtn = document.querySelector<HTMLButtonElement>('#mute-btn')!;
const volumeSlider = document.querySelector<HTMLInputElement>('#volume-slider')!;

// Initialize scene
const scene = new Scene(container);
const physicsSystem = new PhysicsSystem();
const audioManager = new AudioManager(scene.getCamera());
const environmentManager = new EnvironmentManager(scene.getScene());

// Load background audio
audioManager.load('/sounds/Dandelion_dreams.mp3');

// Load environment
environmentManager.load('/textures/sky.hdr');

// Handle Mute Toggle
if (muteBtn) {
  muteBtn.addEventListener('click', () => {
    const isMuted = audioManager.toggleMute();
    muteBtn.textContent = isMuted ? '🔇' : '🔊';
  });
}

// Handle Volume Slider
if (volumeSlider) {
  volumeSlider.addEventListener('input', (e) => {
    const volume = parseFloat((e.target as HTMLInputElement).value);
    audioManager.setVolume(volume);
  });
}

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
let characterController = new CharacterController(characterMesh, scene.getCamera(), 5, 5);

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

// Example of how to load a GLTF model
const modelLoader = new ModelLoader((progress) => {
  console.log('Loading progress:', progress);
});

// Track current character group to remove it when switching
let currentCharacterGroup: THREE.Object3D | null = null;

const loadCharacter = (filename: string) => {
  const path = `/models/GLB format/${filename}`;

  // Determine settings based on model type
  let targetHeight = 1.2;
  let manualOffset = 0.2;

  if (filename.includes('character-female-a')) {
    manualOffset = 0.35;
  }

  // 'wheelchair-power' matches both 'wheelchair-power.glb' and 'wheelchair-power-deluxe.glb'
  if (filename.includes('wheelchair-power')) {
    manualOffset = 0.02;
  }

  // Show loading indicator if it's not the initial load (which has its own screen)
  if (currentCharacterGroup) {
    loadingElement.style.display = 'flex';
    loadingElement.style.opacity = '1';
  }

  modelLoader.load(path, (gltf) => {
    console.log(`Character loaded: ${filename}`);
    const model = gltf.scene;

    // Calculate bounding box to determine size
    const box = new THREE.Box3().setFromObject(model);
    const size = box.getSize(new THREE.Vector3());

    const scaleFactor = targetHeight / size.y;

    model.scale.set(scaleFactor, scaleFactor, scaleFactor);

    // Recalculate size and radius
    const scaledSize = size.clone().multiplyScalar(scaleFactor);
    const radius = Math.max(scaledSize.x, scaledSize.z) / 2;

    // Create a container group to handle offset
    const characterGroup = new THREE.Group();

    // Position at previous character position or default
    if (currentCharacterGroup) {
      characterGroup.position.copy(currentCharacterGroup.position);
    } else {
      characterGroup.position.copy(characterMesh.position);
    }

    // Offset model to align feet with ground
    model.position.y = -radius + manualOffset;

    characterGroup.add(model);

    // Enable shadows
    model.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });

    // Remove old character
    if (currentCharacterGroup) {
      scene.remove(currentCharacterGroup);
      physicsSystem.removeObject(currentCharacterGroup);
    } else {
      scene.remove(characterMesh);
      physicsSystem.removeObject(characterMesh);
    }

    currentCharacterGroup = characterGroup;

    // Add new character group
    scene.add(characterGroup);
    physicsSystem.addObject(characterGroup, 100, radius, false, true);

    // Update Controller
    if (characterController) characterController.dispose();
    characterController = new CharacterController(characterGroup, scene.getCamera(), 5, 5);

    // Setup Animations
    if (gltf.animations.length > 0) {
      characterController.setupAnimations(gltf.animations);
      characterController.playAnimation('idle');
    }

    // Update dependencies
    cameraFollower.setTarget(characterGroup);
    interactionManager.setCharacter(characterGroup);

    // Hide loading
    loadingElement.style.opacity = '0';
    setTimeout(() => {
      loadingElement.style.display = 'none';
    }, 500);
  });
};

// Initial Load
loadCharacter('character-male-a.glb');

// Handle Avatar Selection
const avatarBtn = document.querySelector<HTMLButtonElement>('#avatar-icon-btn');
const avatarDropdown = document.querySelector<HTMLDivElement>('#avatar-dropdown');

if (avatarBtn && avatarDropdown) {
  // Toggle menu on button click
  avatarBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    avatarDropdown.classList.toggle('active');
  });

  // Close menu when clicking outside
  window.addEventListener('click', () => {
    avatarDropdown.classList.remove('active');
  });
}

document.querySelectorAll('.avatar-option').forEach(btn => {
  btn.addEventListener('click', (e) => {
    const filename = (e.target as HTMLElement).dataset.model;
    if (filename) {
      loadCharacter(filename);
      // Close menu after selection
      if (avatarDropdown) avatarDropdown.classList.remove('active');
    }
  });
});

console.log('🎮 Three.js scene initialized!');
console.log('📦 Use WASD or Arrow keys to move the character');
console.log('🖱️ Drag with mouse to rotate camera, scroll to zoom');

// Input Highlighting
window.addEventListener('keydown', (e) => {
  const key = e.key.toLowerCase();
  const el = document.querySelector(`.key-cap[data-key="${key}"]`);
  if (el) el.classList.add('active');
});

window.addEventListener('keyup', (e) => {
  const key = e.key.toLowerCase();
  const el = document.querySelector(`.key-cap[data-key="${key}"]`);
  if (el) el.classList.remove('active');
});

window.addEventListener('mousedown', () => {
  const el = document.querySelector('.icon-control[data-action="rotate"]');
  if (el) el.classList.add('active');
});

window.addEventListener('mouseup', () => {
  const el = document.querySelector('.icon-control[data-action="rotate"]');
  if (el) el.classList.remove('active');
});

window.addEventListener('wheel', () => {
  const el = document.querySelector('.icon-control[data-action="zoom"]');
  if (el) {
    el.classList.add('active');
    setTimeout(() => el.classList.remove('active'), 200);
  }
});
