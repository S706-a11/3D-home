# Architecture Overview

This document explains how the Three.js application is structured and how the core systems work together.

## System Architecture

```
┌─────────────────────────────────────────────────┐
│                   main.ts                       │
│          (Application Entry Point)              │
└─────────────────┬───────────────────────────────┘
                  │
        ┌─────────┴─────────┐
        │                   │
        ▼                   ▼
┌──────────────┐    ┌──────────────────┐
│   Scene.ts   │    │  ModelLoader.ts  │
│   (Core)     │    │    (Utils)       │
└──────┬───────┘    └────────┬─────────┘
       │                     │
       │            ┌────────┘
       │            │
       ▼            ▼
┌─────────────────────────────┐
│   CharacterController.ts    │
│        (Models)             │
└─────────────────────────────┘
```

## Core Components

### 1. Scene Manager (`src/core/Scene.ts`)

**Purpose**: Central manager for the entire 3D scene

**Key Responsibilities**:
- WebGL renderer initialization and configuration
- Camera setup and management
- Lighting system (ambient, directional, hemisphere, point)
- Orbit controls for user interaction
- Animation loop coordination

**How It Works**:

1. **Initialization**: When instantiated, it creates:
   - A `THREE.Scene` with background color and fog
   - A `PerspectiveCamera` positioned at (0, 2, 5)
   - A `WebGLRenderer` with shadow mapping and tone mapping
   - `OrbitControls` for camera manipulation

2. **Lighting Setup**: Adds 4 types of lights:
   - **Ambient Light** (0.5 intensity): Base illumination
   - **Directional Light** (1.0 intensity): Main light source with shadows
   - **Hemisphere Light** (0.6 intensity): Sky/ground ambient
   - **Point Light** (0.8 intensity): Accent lighting

3. **Animation Loop**: Uses `requestAnimationFrame` to:
   - Calculate delta time with `THREE.Clock`
   - Update orbit controls
   - Execute registered animation callbacks
   - Render the frame

**API**:
```typescript
const scene = new Scene(containerElement);

// Add objects to scene
scene.add(mesh);

// Register animation callbacks
scene.onAnimate((delta) => {
  // Update logic runs every frame
});

// Access Three.js objects
scene.getScene();
scene.getCamera();
scene.getRenderer();
scene.getControls();
```

---

### 2. Model Loader (`src/utils/ModelLoader.ts`)

**Purpose**: Load and manage 3D models in GLTF/GLB format

**Key Responsibilities**:
- GLTF/GLB file loading
- Draco decompression support
- Loading progress tracking
- Automatic shadow configuration

**How It Works**:

1. **Setup**: Initializes three main components:
   - `LoadingManager`: Tracks overall loading state
   - `DRACOLoader`: Handles compressed geometry (uses Google CDN decoder)
   - `GLTFLoader`: Loads GLTF/GLB files with Draco support

2. **Loading Process**:
   ```
   load(url) → GLTFLoader → DRACOLoader (if compressed)
                ↓
           Parse GLTF
                ↓
       Enable shadows on meshes
                ↓
           Return GLTF object
   ```

3. **Progress Tracking**: 
   - `LoadingManager` reports progress (0-100%)
   - Callback function receives progress updates
   - Can track individual and batch loads

**API**:
```typescript
const loader = new ModelLoader((progress) => {
  console.log(`Loading: ${progress}%`);
});

// Load single model
const gltf = await loader.load('/models/character.glb');

// Load multiple models
const models = await loader.loadMultiple([
  '/models/character.glb',
  '/models/environment.glb'
]);
```

---

### 3. Character Controller (`src/models/CharacterController.ts`)

**Purpose**: Handle player character movement and animations

**Key Responsibilities**:
- Keyboard input handling (WASD/Arrow keys)
- Character movement and rotation
- Animation playback and blending
- State management (idle, walking)

**How It Works**:

1. **Input System**:
   - Listens to `keydown` and `keyup` events
   - Stores key states in `keys` object
   - Supports both WASD and arrow keys

2. **Movement Calculation** (every frame):
   ```
   1. Read key states
   2. Calculate velocity vector (x, z)
   3. Normalize for consistent diagonal speed
   4. Apply movement speed × delta time
   5. Transform by character rotation
   6. Update character position
   ```

3. **Rotation System**:
   - Calculates target angle from movement direction
   - Smoothly interpolates rotation using `slerp`
   - Rotation speed controls how fast character turns

4. **Animation System**:
   - Uses `AnimationMixer` from Three.js
   - Stores animations in a `Map<string, AnimationAction>`
   - Auto-switches between idle/walk based on movement
   - Crossfades between animations with configurable fade time

**State Machine**:
```
┌──────────┐
│   Idle   │ ←──── No input
└────┬─────┘
     │
     │ Input detected
     ▼
┌──────────┐
│   Walk   │ ←──── Movement keys pressed
└────┬─────┘
     │
     │ Input released
     │
   (back to Idle)
```

**API**:
```typescript
const controller = new CharacterController(
  characterObject,
  moveSpeed: 5,      // Units per second
  rotationSpeed: 3   // Radians per second
);

// Setup animations from GLTF
controller.setupAnimations(gltf.animations);

// Play specific animation
controller.playAnimation('idle', fadeTime: 0.2);

// Update every frame
scene.onAnimate((delta) => {
  controller.update(delta);
});
```

---

## Data Flow

### Initialization Flow

```
1. main.ts creates container element
   ↓
2. Scene instance created
   → Renderer, Camera, Lights initialized
   → Animation loop started
   ↓
3. ModelLoader created
   ↓
4. Ground plane and decorative objects added
   ↓
5. Character object created (or loaded from GLTF)
   ↓
6. CharacterController created with character object
   ↓
7. Controller update registered with scene.onAnimate()
```

### Runtime Update Flow (every frame)

```
requestAnimationFrame
   ↓
Scene.animate()
   ↓
1. Calculate delta time
2. Update orbit controls
3. Execute animation callbacks
   ├─→ CharacterController.update(delta)
   │     ├─→ Read keyboard input
   │     ├─→ Calculate movement
   │     ├─→ Update position & rotation
   │     └─→ Update animations
   └─→ Other custom updates
4. Render scene
```

### Model Loading Flow

```
ModelLoader.load(url)
   ↓
GLTFLoader starts loading
   ↓
(optional) DRACOLoader decompresses geometry
   ↓
Parse complete GLTF structure
   ├─→ Meshes
   ├─→ Materials
   ├─→ Animations
   └─→ Scene hierarchy
   ↓
Enable shadows on all meshes
   ↓
Return GLTF object
   ↓
main.ts adds to scene
```

---

## Configuration Details

### Renderer Settings

```typescript
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = PCFSoftShadowMap;  // Soft shadows
renderer.outputColorSpace = SRGBColorSpace;  // Correct colors
renderer.toneMapping = ACESFilmicToneMapping; // Filmic look
renderer.toneMappingExposure = 1;            // Brightness
renderer.setPixelRatio(min(devicePixelRatio, 2)); // Crisp on retina
```

### Shadow System

- **Shadow Map Size**: 2048×2048 for high quality
- **Shadow Camera**: Orthographic projection covering 20×20 units
- **Shadow Type**: PCF Soft Shadows for smooth edges
- **Objects**: All meshes cast and receive shadows (configurable)

### Camera Controls

- **Damping**: Enabled with factor 0.05 (smooth inertia)
- **Polar Angle**: Limited to π/2 (prevents going under ground)
- **Distance**: Min 2, Max 20 units from target
- **Target**: Orbits around (0, 0, 0) by default

### Animation System

- **Delta Time**: Used for frame-rate independent movement
- **Fade Duration**: 0.2 seconds default for animation transitions
- **Auto-Switching**: Idle ↔ Walk based on input
- **Animation Names**: Case-sensitive ('idle', 'walk', etc.)

---

## File Organization

```
src/
├── core/              # Core engine systems
│   └── Scene.ts       # Scene management
├── utils/             # Utility functions & helpers
│   └── ModelLoader.ts # Asset loading
├── models/            # Game logic & entities
│   └── CharacterController.ts
├── main.ts            # Entry point
└── style.css          # UI styling
```

---

## Performance Considerations

### Optimization Strategies

1. **Renderer**:
   - Pixel ratio capped at 2 (prevents excessive resolution on high-DPI displays)
   - Shadow maps reused across frames
   - Frustum culling automatic (Three.js)

2. **Animation Loop**:
   - Single `requestAnimationFrame` loop
   - Delta time prevents FPS dependency
   - Callbacks execute only when needed

3. **Model Loading**:
   - Draco compression reduces file sizes by ~70%
   - Async loading prevents blocking
   - Loading manager reuses instances

4. **Movement**:
   - Vector operations optimized
   - SLERP for smooth rotation (quaternions)
   - No unnecessary matrix calculations

### Future Optimizations

- **InstancingMesh** for repeated objects
- **LOD (Level of Detail)** for distant objects
- **Object pooling** for frequently created/destroyed objects
- **Frustum culling** optimization for large scenes

---

## Extension Points

### Adding New Controllers

Create new controller classes following the pattern:

```typescript
export class CustomController {
  constructor(object: THREE.Object3D) {
    // Setup
  }
  
  update(delta: number): void {
    // Update logic
  }
  
  dispose(): void {
    // Cleanup
  }
}
```

Register with scene:
```typescript
scene.onAnimate((delta) => controller.update(delta));
```

### Adding Post-Processing

```typescript
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass';

const composer = new EffectComposer(renderer);
composer.addPass(new RenderPass(scene, camera));
// Add more passes (bloom, SSAO, etc.)
```

### Custom Lighting Setups

Modify `Scene.setupLights()` or add lights dynamically:

```typescript
const light = new THREE.SpotLight(0xffffff, 1);
light.castShadow = true;
scene.add(light);
```

---

## Common Patterns

### Loading and Using Models

```typescript
// 1. Load model
const gltf = await modelLoader.load('/models/character.glb');

// 2. Add to scene
scene.add(gltf.scene);

// 3. Setup controller
const controller = new CharacterController(gltf.scene);
controller.setupAnimations(gltf.animations);

// 4. Register update
scene.onAnimate((delta) => controller.update(delta));
```

### Creating Interactive Objects

```typescript
const mesh = new THREE.Mesh(geometry, material);
mesh.userData.interactive = true;

// Raycasting for clicks
const raycaster = new THREE.Raycaster();
window.addEventListener('click', (event) => {
  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObjects(scene.children);
  // Handle intersections
});
```

---

This architecture provides a solid foundation for 3D web applications with clean separation of concerns and extensible design patterns.
