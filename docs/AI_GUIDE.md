# AI Development Guide

This guide helps AI assistants understand how to work with this Three.js codebase, maintain consistency, and add new features.

## Project Overview

**Tech Stack**: Vite + TypeScript + Bun + Three.js  
**Purpose**: 3D web application with character movement and model loading  
**Architecture**: Component-based with clear separation of concerns

---

## Context7 Integration

> [!IMPORTANT]
> **Always use Context7 MCP tools** when working on this codebase for:
> - **Code generation**: Use Context7 to fetch up-to-date API references and examples
> - **Setup/configuration steps**: Query Context7 for library-specific setup instructions
> - **Library/API documentation**: Automatically resolve library IDs and retrieve docs
>
> **How it works**:
> 1. Use `mcp0_resolve-library-id` to find the correct Context7-compatible library ID (e.g., `/reactjs/react.dev`, `/threejs/three.js`)
> 2. Use `mcp0_get-library-docs` with the resolved ID and specific topic to fetch relevant documentation
> 3. Apply the documentation to generate accurate, up-to-date code
>
> **You do NOT need to wait for explicit requests** - proactively use Context7 whenever you need:
> - Three.js API documentation or examples
> - TypeScript configuration guidance
> - Vite setup instructions
> - Any library-specific implementation details
>
> This ensures code follows current best practices and uses the latest API patterns.

---

## Code Style & Conventions

### File Organization

```
src/
├── core/       # Engine systems (Scene, Renderer, etc.)
├── utils/      # Helper functions (ModelLoader, etc.)
├── models/     # Game entities & controllers
├── main.ts     # Application entry point
└── style.css   # UI styling
```

**Rule**: Place files in appropriate directories based on their purpose:
- **core/**: Engine/framework level code that manages the 3D environment
- **utils/**: Reusable utilities and helpers
- **models/**: Game logic, entities, controllers

### Naming Conventions

- **Classes**: PascalCase (`Scene`, `ModelLoader`, `CharacterController`)
- **Files**: PascalCase matching class name (`Scene.ts`, `ModelLoader.ts`)
- **Methods**: camelCase (`setupLights()`, `playAnimation()`)
- **Private methods**: prefix with underscore... wait, no — use TypeScript `private` keyword
- **Constants**: UPPER_SNAKE_CASE for true constants

### TypeScript Standards

```typescript
// ✅ GOOD: Explicit types, clear JSDoc
/**
 * Load a GLTF model from URL
 * @param url Path to the model file
 * @param enableShadows Enable shadow casting
 * @returns Promise resolving to GLTF object
 */
public async load(
  url: string,
  onLoad?: (gltf: GLTF) => void,
  enableShadows: boolean = true
): Promise<GLTF> {
  // Implementation
}

// ❌ BAD: No types, unclear purpose
public async load(url, callback, shadows) {
  // Implementation
}
```

**Rules**:
- Always use explicit types (no `any` unless absolutely necessary)
- Add JSDoc comments for public methods
- Use optional parameters with default values when appropriate
- Export only what's needed (prefer single class per file)

### Three.js Patterns

#### Creating Objects

```typescript
// ✅ GOOD: Clear setup with configuration
const mesh = new THREE.Mesh(geometry, material);
mesh.position.set(x, y, z);
mesh.castShadow = true;
mesh.receiveShadow = true;
scene.add(mesh);

// ❌ BAD: Incomplete configuration
const mesh = new THREE.Mesh(geometry, material);
scene.add(mesh); // Missing shadow setup
```

#### Cleanup

```typescript
// ✅ GOOD: Proper disposal
public dispose(): void {
  this.renderer.dispose();
  this.controls.dispose();
  window.removeEventListener('resize', this.handleResize);
}

// ❌ BAD: Memory leaks
public dispose(): void {
  // Nothing - memory leak!
}
```

---

## Adding New Features

### 1. Adding a New Controller

**Example**: Adding a jump mechanic to CharacterController

```typescript
// In CharacterController.ts

private isJumping: boolean = false;
private jumpVelocity: number = 0;
private gravity: number = -9.8;

private setupKeyboardControls(): void {
  window.addEventListener('keydown', (e) => {
    this.keys[e.key.toLowerCase()] = true;
    
    // Add jump on spacebar
    if (e.key === ' ' && !this.isJumping) {
      this.jump();
    }
  });
}

public jump(): void {
  this.isJumping = true;
  this.jumpVelocity = 5; // Initial upward velocity
}

public update(delta: number): void {
  // Existing movement code...
  
  // Add gravity and jumping
  if (this.isJumping) {
    this.jumpVelocity += this.gravity * delta;
    this.character.position.y += this.jumpVelocity * delta;
    
    // Land on ground
    if (this.character.position.y <= 0.5) {
      this.character.position.y = 0.5;
      this.isJumping = false;
      this.jumpVelocity = 0;
    }
  }
}
```

**Checklist**:
- [ ] Add state variables (private)
- [ ] Update input handling
- [ ] Add logic to `update()` method
- [ ] Update JSDoc comments
- [ ] Test with dev server

### 2. Adding a New Utility

**Example**: Creating a TextureLoader utility

```typescript
// src/utils/TextureLoader.ts

import * as THREE from 'three';

/**
 * Utility class for loading and caching textures
 */
export class TextureLoader {
  private textureLoader: THREE.TextureLoader;
  private cache: Map<string, THREE.Texture> = new Map();

  constructor() {
    this.textureLoader = new THREE.TextureLoader();
  }

  /**
   * Load a texture from URL with caching
   * @param url Path to texture file
   * @returns Promise resolving to texture
   */
  public async load(url: string): Promise<THREE.Texture> {
    // Check cache first
    if (this.cache.has(url)) {
      return this.cache.get(url)!;
    }

    return new Promise((resolve, reject) => {
      this.textureLoader.load(
        url,
        (texture) => {
          this.cache.set(url, texture);
          resolve(texture);
        },
        undefined,
        reject
      );
    });
  }

  /**
   * Clear texture cache
   */
  public clearCache(): void {
    this.cache.forEach(texture => texture.dispose());
    this.cache.clear();
  }
}
```

**Checklist**:
- [ ] Create file in appropriate directory (`utils/`)
- [ ] Export class/function
- [ ] Add JSDoc comments
- [ ] Include dispose/cleanup methods if needed
- [ ] Update usage examples in README

### 3. Adding Post-Processing Effects

**Example**: Adding bloom effect

```typescript
// Install dependencies first:
// bun add three

// In Scene.ts or new PostProcessing.ts

import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass';

// Add to Scene class:
private composer?: EffectComposer;

public enableBloom(strength: number = 1.5): void {
  this.composer = new EffectComposer(this.renderer);
  
  const renderPass = new RenderPass(this.scene, this.camera);
  this.composer.addPass(renderPass);
  
  const bloomPass = new UnrealBloomPass(
    new THREE.Vector2(window.innerWidth, window.innerHeight),
    strength,  // strength
    0.4,       // radius
    0.85       // threshold
  );
  this.composer.addPass(bloomPass);
}

// Update render call in animate():
private animate(): void {
  requestAnimationFrame(this.animate.bind(this));
  
  const delta = this.clock.getDelta();
  this.controls.update();
  this.animationCallbacks.forEach(callback => callback(delta));
  
  // Use composer if available, otherwise regular render
  if (this.composer) {
    this.composer.render();
  } else {
    this.renderer.render(this.scene, this.camera);
  }
}
```

---

## Common Tasks

### Adding a New 3D Model

1. **Place model file**: `public/models/character.glb`

2. **Load in main.ts**:
```typescript
const modelLoader = new ModelLoader();
const gltf = await modelLoader.load('/models/character.glb');

// Replace demo cube
scene.remove(characterMesh);
scene.add(gltf.scene);

// Setup controller with model
const controller = new CharacterController(gltf.scene);
if (gltf.animations.length > 0) {
  controller.setupAnimations(gltf.animations);
}
```

3. **Update in animation loop**:
```typescript
scene.onAnimate((delta) => {
  controller.update(delta);
});
```

### Creating Custom Lighting

```typescript
// In Scene.ts setupLights() or dynamically:

// Spotlight following character
const spotlight = new THREE.SpotLight(0xffffff, 1);
spotlight.position.set(0, 10, 0);
spotlight.target = characterMesh;
spotlight.angle = Math.PI / 6;
spotlight.penumbra = 0.2;
spotlight.castShadow = true;
scene.add(spotlight);
scene.add(spotlight.target);
```

### Adding UI Elements

```typescript
// In main.ts after app.innerHTML:

const statsPanel = document.createElement('div');
statsPanel.id = 'stats';
statsPanel.innerHTML = `
  <p>FPS: <span id="fps">60</span></p>
  <p>Position: <span id="position">0, 0, 0</span></p>
`;
app.appendChild(statsPanel);

// Update in animation loop
let frameCount = 0;
let lastTime = performance.now();

scene.onAnimate((delta) => {
  frameCount++;
  const now = performance.now();
  
  if (now - lastTime >= 1000) {
    document.getElementById('fps')!.textContent = frameCount.toString();
    frameCount = 0;
    lastTime = now;
  }
  
  const pos = controller.getPosition();
  document.getElementById('position')!.textContent = 
    `${pos.x.toFixed(1)}, ${pos.y.toFixed(1)}, ${pos.z.toFixed(1)}`;
});
```

---

## Debugging Tips

### Common Issues

**1. Black screen / Nothing renders**
- Check browser console for errors
- Verify camera position isn't inside objects
- Check if lights are added to scene
- Ensure renderer is appended to DOM

**2. Models don't load**
- Check file path (must be in `public/` folder)
- Verify GLTF file is valid (test in https://gltf-viewer.donmccurdy.com/)
- Check browser network tab for 404 errors
- Ensure ModelLoader is instantiated

**3. Shadows not appearing**
- Enable shadows on renderer: `renderer.shadowMap.enabled = true`
- Enable on lights: `light.castShadow = true`
- Enable on meshes: `mesh.castShadow = true` and `mesh.receiveShadow = true`
- Check shadow camera settings

**4. Poor performance**
- Check poly count of models (keep under 100k triangles)
- Reduce shadow map size if needed
- Limit pixel ratio to 2
- Use Draco compression for models

### Debug Helpers

```typescript
// Add to Scene.ts for debugging:

public enableDebugMode(): void {
  // Axes helper
  const axesHelper = new THREE.AxesHelper(5);
  this.scene.add(axesHelper);
  
  // Shadow camera helper
  const directionalLight = this.scene.children.find(
    c => c instanceof THREE.DirectionalLight
  ) as THREE.DirectionalLight;
  
  if (directionalLight) {
    const helper = new THREE.CameraHelper(directionalLight.shadow.camera);
    this.scene.add(helper);
  }
  
  // Bounding box helper
  const box = new THREE.BoxHelper(object, 0xffff00);
  this.scene.add(box);
}
```

---

## Testing Checklist

Before committing changes:

- [ ] **TypeScript compiles**: No errors or `any` types
- [ ] **Dev server runs**: `bun run dev` works
- [ ] **Scene renders**: 3D environment displays correctly
- [ ] **Controls work**: WASD movement, mouse camera control
- [ ] **Hot reload works**: Changes reflect without full refresh
- [ ] **Performance**: Maintains 60 FPS
- [ ] **No console errors**: Browser console is clean
- [ ] **Documentation**: Update README or ARCHITECTURE if needed

---

## Build & Deploy

### Development
```bash
bun run dev      # Start dev server at localhost:5173
```

### Production Build
```bash
bun run build    # Creates dist/ folder
bun run preview  # Preview production build
```

### Optimization Tips

1. **Compress models**: Use Draco compression when exporting GLB files
2. **Optimize textures**: Use compressed formats (KTX2, Basis)
3. **Code splitting**: Vite handles this automatically
4. **Tree shaking**: Import only what you need from Three.js
5. **Lazy loading**: Load heavy models on demand, not at startup

---

## Extension Examples

### Example: Adding Third-Person Camera

```typescript
// src/utils/ThirdPersonCamera.ts

import * as THREE from 'three';

export class ThirdPersonCamera {
  private camera: THREE.PerspectiveCamera;
  private target: THREE.Object3D;
  private offset: THREE.Vector3;
  private currentPosition: THREE.Vector3;
  
  constructor(
    camera: THREE.PerspectiveCamera,
    target: THREE.Object3D,
    offset = new THREE.Vector3(0, 2, 5)
  ) {
    this.camera = camera;
    this.target = target;
    this.offset = offset;
    this.currentPosition = new THREE.Vector3();
  }
  
  public update(delta: number): void {
    // Calculate ideal position behind character
    const idealOffset = this.offset.clone();
    idealOffset.applyQuaternion(this.target.quaternion);
    idealOffset.add(this.target.position);
    
    // Smooth camera movement
    this.currentPosition.lerp(idealOffset, 1 - Math.exp(-5 * delta));
    this.camera.position.copy(this.currentPosition);
    
    // Look at character
    const lookAt = this.target.position.clone();
    lookAt.y += 1; // Look at character's head
    this.camera.lookAt(lookAt);
  }
}

// Usage in main.ts:
const thirdPersonCam = new ThirdPersonCamera(
  scene.getCamera(),
  characterController.getCharacter()
);

scene.onAnimate((delta) => {
  characterController.update(delta);
  thirdPersonCam.update(delta);
});
```

### Example: Adding Collision Detection

```typescript
// In CharacterController.ts

private raycaster = new THREE.Raycaster();
private collisionDistance = 0.5;

private checkCollision(direction: THREE.Vector3, obstacles: THREE.Object3D[]): boolean {
  this.raycaster.set(this.character.position, direction.normalize());
  const intersects = this.raycaster.intersectObjects(obstacles, true);
  
  return intersects.length > 0 && intersects[0].distance < this.collisionDistance;
}

public update(delta: number, obstacles: THREE.Object3D[] = []): void {
  // Calculate movement...
  
  // Check collision before applying movement
  if (!this.checkCollision(movement.normalize(), obstacles)) {
    this.character.position.add(movement);
  }
}
```

---

## File Templates

### New Controller Template

```typescript
import * as THREE from 'three';

/**
 * [Description of what this controller does]
 */
export class CustomController {
  private object: THREE.Object3D;
  private state: string = 'idle';
  
  constructor(object: THREE.Object3D) {
    this.object = object;
    this.initialize();
  }
  
  private initialize(): void {
    // Setup code
  }
  
  /**
   * Update controller state
   * @param delta Time since last frame in seconds
   */
  public update(delta: number): void {
    // Update logic
  }
  
  /**
   * Cleanup resources
   */
  public dispose(): void {
    // Cleanup code
  }
}
```

### New Utility Template

```typescript
import * as THREE from 'three';

/**
 * [Description of what this utility does]
 */
export class CustomUtility {
  private cache: Map<string, any> = new Map();
  
  constructor() {
    this.initialize();
  }
  
  private initialize(): void {
    // Setup
  }
  
  /**
   * [Method description]
   * @param param Description
   * @returns Description
   */
  public async process(param: string): Promise<any> {
    // Implementation
  }
  
  public dispose(): void {
    this.cache.clear();
  }
}
```

---

## Quick Reference

### Scene Management
- Add objects: `scene.add(object)`
- Remove objects: `scene.remove(object)`
- Register updates: `scene.onAnimate((delta) => {})`

### Model Loading
- Load GLTF: `const gltf = await modelLoader.load('/path/to/model.glb')`
- Access mesh: `gltf.scene`
- Access animations: `gltf.animations`

### Character Control
- Create: `new CharacterController(object, moveSpeed, rotSpeed)`
- Setup animations: `controller.setupAnimations(animations)`
- Update: Call `controller.update(delta)` in animation loop

### Vite Commands
- Dev: `bun run dev`
- Build: `bun run build`
- Preview: `bun run preview`

---

This guide should help you maintain consistency and understand the patterns used in this Three.js application. When in doubt, follow the existing code style and architecture patterns described above.
