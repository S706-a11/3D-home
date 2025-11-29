import './style.css';
import { Scene } from './core/Scene';
import { InteractionManager } from './core/InteractionManager';
import { ModelLoader } from './utils/ModelLoader';
import { CharacterController } from './models/CharacterController';
import { CameraFollower } from './utils/CameraFollower';
import { PhysicsSystem } from './core/PhysicsSystem';
import { AudioManager } from './core/AudioManager';
import { EnvironmentManager } from './core/EnvironmentManager';
import { UIManager } from './ui/UIManager';
import { WorldManager } from './world/WorldManager';
import * as THREE from 'three';

// Initialize the app
const app = document.querySelector<HTMLDivElement>('#app')!;

// Initialize UI
const uiManager = new UIManager(app);
uiManager.injectHTML();

// Get container element (now available after injectHTML)
const container = document.querySelector<HTMLDivElement>('#canvas-container')!;

// Initialize ModelLoader
const modelLoader = new ModelLoader((progress) => {
  console.log('Loading progress:', progress);
});

// Initialize scene and physics
const physicsSystem = new PhysicsSystem();
const scene = new Scene(container, physicsSystem);
const audioManager = new AudioManager(scene.getCamera());
const environmentManager = new EnvironmentManager(scene.getScene());

// Load background audio
audioManager.load('/sounds/Dandelion_dreams.mp3');

// Load environment
environmentManager.load('/textures/sky.hdr');

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

// Initialize character controller
let characterController = new CharacterController(characterMesh, scene.getCamera(), 5, 5);

// Initialize Interaction Manager
const interactionManager = new InteractionManager(scene.getCamera(), characterMesh);

// Initialize World Manager
const worldManager = new WorldManager(scene, physicsSystem, interactionManager, modelLoader);
worldManager.setupGround();
worldManager.setupDecorations();
worldManager.setupDisplayStands();

// Setup UI Callbacks
uiManager.setCallbacks({
  onMuteToggle: () => {
    return audioManager.toggleMute();
  },
  onVolumeChange: (volume) => {
    audioManager.setVolume(volume);
  },
  onResetCamera: () => {
    cameraFollower.resetCamera();
  },
  onAvatarSelect: (filename) => {
    loadCharacter(filename);
  }
});

// Initialize camera follower
const cameraFollower = new CameraFollower(
  scene.getCamera(),
  characterMesh,
  scene.getControls()
);

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

// Hide loading screen
uiManager.hideLoading();

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
    uiManager.showLoading();
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
    uiManager.hideLoading();
  });
};

// Initial Load
loadCharacter('character-male-a.glb');

console.log('🎮 Three.js scene initialized!');
console.log('📦 Use WASD or Arrow keys to move the character');
console.log('🖱️ Drag with mouse to rotate camera, scroll to zoom');
