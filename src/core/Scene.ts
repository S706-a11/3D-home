import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { HolidayManager } from './HolidayManager';
import { PhysicsSystem } from './PhysicsSystem';

/**
 * Main scene manager for Three.js application
 * Handles scene initialization, camera setup, renderer, and animation loop
 */
export class Scene {
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private renderer: THREE.WebGLRenderer;
  private controls: OrbitControls;
  private animationCallbacks: Array<(delta: number) => void> = [];
  private clock: THREE.Clock;
  private physicsSystem: PhysicsSystem | null;

  constructor(container: HTMLElement, physicsSystem?: PhysicsSystem) {
    this.clock = new THREE.Clock();
    this.physicsSystem = physicsSystem || null;

    // Initialize scene
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x1a1a2e);
    this.scene.fog = new THREE.Fog(0x1a1a2e, 10, 50);

    // Setup camera
    this.camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    this.camera.position.set(0, 2, 5);

    // Setup renderer
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true
    });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1;

    container.appendChild(this.renderer.domElement);

    // Setup controls
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;
    this.controls.maxPolarAngle = Math.PI / 2;
    this.controls.minDistance = 2;
    this.controls.maxDistance = 20;
    this.controls.enablePan = false; // Disable right-click panning

    // Directional light (warm winter sun)
    const directionalLight = new THREE.DirectionalLight(0xfff4e6, 1.2);
    directionalLight.position.set(5, 10, 5);
    directionalLight.castShadow = true;
    directionalLight.shadow.camera.near = 0.1;
    directionalLight.shadow.camera.far = 50;
    directionalLight.shadow.camera.left = -15;
    directionalLight.shadow.camera.right = 15;
    directionalLight.shadow.camera.top = 15;
    directionalLight.shadow.camera.bottom = -15;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    this.scene.add(directionalLight);

    // Hemisphere light for winter twilight feel
    const hemisphereLight = new THREE.HemisphereLight(0xb8d4ff, 0xffecd1, 0.7);
    this.scene.add(hemisphereLight);

    // Ambient warm glow for cozy Christmas atmosphere
    const ambientLight = new THREE.AmbientLight(0xffeedd, 0.3);
    this.scene.add(ambientLight);

    // Initialize Holiday Manager with physics
    const holidayManager = new HolidayManager(this.scene, this.physicsSystem || undefined);
    holidayManager.loadAssets();

    // Handle window resize
    window.addEventListener('resize', this.handleResize.bind(this));

    // Start animation loop
    this.animate();
  }

  private handleResize(): void {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  private animate(): void {
    requestAnimationFrame(this.animate.bind(this));

    const delta = this.clock.getDelta();

    // Update controls
    this.controls.update();

    // Execute all registered animation callbacks
    this.animationCallbacks.forEach(callback => callback(delta));

    // Render
    this.renderer.render(this.scene, this.camera);
  }

  /**
   * Register a callback to be executed in the animation loop
   * @param callback Function to execute each frame with delta time
   */
  public onAnimate(callback: (delta: number) => void): void {
    this.animationCallbacks.push(callback);
  }

  /**
   * Add an object to the scene
   */
  public add(object: THREE.Object3D): void {
    this.scene.add(object);
  }

  /**
   * Remove an object from the scene
   */
  public remove(object: THREE.Object3D): void {
    this.scene.remove(object);
  }

  /**
   * Get the Three.js scene instance
   */
  public getScene(): THREE.Scene {
    return this.scene;
  }

  /**
   * Get the camera instance
   */
  public getCamera(): THREE.PerspectiveCamera {
    return this.camera;
  }

  /**
   * Get the renderer instance
   */
  public getRenderer(): THREE.WebGLRenderer {
    return this.renderer;
  }

  /**
   * Get the orbit controls instance
   */
  public getControls(): OrbitControls {
    return this.controls;
  }

  /**
   * Cleanup resources
   */
  public dispose(): void {
    window.removeEventListener('resize', this.handleResize.bind(this));
    this.controls.dispose();
    this.renderer.dispose();
  }
}
