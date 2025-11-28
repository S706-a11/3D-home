# Three.js Professional Development Environment

A professional-grade Three.js development environment built with Vite, TypeScript, and Bun for creating 3D web applications with character movement and model loading capabilities.

## 🚀 Features

- **Modern Build Tools**: Vite for lightning-fast HMR and optimized builds
- **Type Safety**: Full TypeScript support with Three.js type definitions
- **Fast Package Manager**: Bun for quick dependency installation
- **Professional Scene Management**: Comprehensive scene setup with proper lighting, shadows, and post-processing ready
- **3D Model Loading**: GLTF/GLB loader with Draco compression support
- **Character Controller**: WASD/Arrow key movement system with animation support
- **Camera Controls**: Orbit controls with smooth damping
- **Optimized Rendering**: Shadow mapping, tone mapping, and anti-aliasing configured

## 📦 Tech Stack

- **Three.js** - 3D graphics library
- **Vite** - Build tool and dev server
- **TypeScript** - Type-safe JavaScript
- **Bun** - Fast JavaScript runtime and package manager

## 🎮 Controls

- **WASD** or **Arrow Keys** - Move character
- **Mouse Drag** - Rotate camera
- **Mouse Scroll** - Zoom in/out

## 🏗️ Project Structure

```
src/
├── core/
│   └── Scene.ts           # Main scene manager with renderer, camera, and lighting
├── utils/
│   └── ModelLoader.ts     # GLTF/GLB model loader with Draco support
├── models/
│   └── CharacterController.ts  # Character movement and animation controller
├── main.ts                # Application entry point
└── style.css              # Styling and UI
```

## 🚦 Getting Started

### Install Dependencies

```bash
bun install
```

### Run Development Server

```bash
bun run dev
```

The app will open at `http://localhost:5173/`

### Build for Production

```bash
bun run build
```

### Preview Production Build

```bash
bun run preview
```

## 🎨 Using the Environment

### Loading 3D Models

Place your GLTF/GLB models in the `public/models/` directory and load them:

```typescript
import { ModelLoader } from './utils/ModelLoader';

const modelLoader = new ModelLoader((progress) => {
  console.log('Loading:', progress + '%');
});

const gltf = await modelLoader.load('/models/your-model.glb');
scene.add(gltf.scene);
```

### Character Movement with Animations

```typescript
import { CharacterController } from './models/CharacterController';

// Create controller
const controller = new CharacterController(characterModel, 5, 5);

// Setup animations from GLTF
controller.setupAnimations(gltf.animations);
controller.playAnimation('idle');

// Update in animation loop
scene.onAnimate((delta) => {
  controller.update(delta);
});
```

### Adding Objects to Scene

```typescript
import { Scene } from './core/Scene';

const scene = new Scene(container);

// Add any Three.js object
const mesh = new THREE.Mesh(geometry, material);
scene.add(mesh);

// Register animation callback
scene.onAnimate((delta) => {
  // Update logic here
});
```

## 🎯 Key Classes

### Scene
Main scene manager handling:
- Renderer configuration with shadows and tone mapping
- Camera setup with responsive aspect ratio
- Comprehensive lighting (ambient, directional, hemisphere, point)
- Orbit controls with damping
- Animation loop management

### ModelLoader
GLTF/GLB model loading with:
- Draco compression support
- Progress tracking
- Automatic shadow configuration
- Batch loading capabilities

### CharacterController
Character movement system featuring:
- WASD/Arrow key controls
- Smooth rotation and movement
- Animation system integration
- Auto-switching between idle/walk animations
- Customizable movement parameters

## 📝 Configuration

### Vite Configuration
The `vite.config.ts` is optimized for Three.js with:
- GLTF/GLB asset handling
- Code splitting for Three.js
- Production build optimization

### TypeScript Configuration
Strict type checking enabled with ES2022 target for modern JavaScript features.

## 🎓 Next Steps

1. **Add Your Models**: Place 3D models in `public/models/`
2. **Customize Scene**: Modify lighting, camera position in `Scene.ts`
3. **Extend Controls**: Add jump, run, or custom actions to `CharacterController.ts`
4. **Add UI**: Create HUD, health bars, inventory using HTML/CSS overlay
5. **Post-Processing**: Add effects like bloom, SSAO using Three.js EffectComposer

## 📚 Resources

- [Three.js Documentation](https://threejs.org/docs/)
- [Three.js Examples](https://threejs.org/examples/)
- [Vite Guide](https://vitejs.dev/guide/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

## 🤝 Tips

- Use compressed GLTF files (.glb) for better performance
- Enable Draco compression when exporting models for smaller file sizes
- Keep poly counts reasonable for web performance
- Test on different devices and browsers
- Use the browser's performance profiler to optimize

---

Built with ❤️ using Three.js, Vite, TypeScript, and Bun
