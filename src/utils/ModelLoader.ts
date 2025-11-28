import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import type { GLTF } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';

/**
 * Utility class for loading 3D models (GLTF/GLB)
 * Supports Draco compression for optimized model loading
 */
export class ModelLoader {
    private gltfLoader: GLTFLoader;
    private dracoLoader: DRACOLoader;
    private loadingManager: THREE.LoadingManager;
    private onProgress?: (progress: number) => void;

    constructor(onProgress?: (progress: number) => void) {
        this.onProgress = onProgress;

        // Setup loading manager
        this.loadingManager = new THREE.LoadingManager();

        this.loadingManager.onStart = (url) => {
            console.log(`Started loading: ${url}`);
        };

        this.loadingManager.onProgress = (_url, itemsLoaded, itemsTotal) => {
            const progress = (itemsLoaded / itemsTotal) * 100;
            console.log(`Loading progress: ${progress.toFixed(2)}%`);
            if (this.onProgress) {
                this.onProgress(progress);
            }
        };

        this.loadingManager.onLoad = () => {
            console.log('All assets loaded');
        };

        this.loadingManager.onError = (url) => {
            console.error(`Error loading: ${url}`);
        };

        // Setup DRACO loader for compressed models
        this.dracoLoader = new DRACOLoader(this.loadingManager);
        this.dracoLoader.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.6/');

        // Setup GLTF loader
        this.gltfLoader = new GLTFLoader(this.loadingManager);
        this.gltfLoader.setDRACOLoader(this.dracoLoader);
    }

    /**
     * Load a GLTF/GLB model from a URL
     * @param url Path to the model file
     * @param onLoad Optional callback when model loads successfully
     * @param enableShadows Enable shadow casting/receiving for the model
     * @returns Promise resolving to the loaded GLTF object
     */
    public async load(
        url: string,
        onLoad?: (gltf: GLTF) => void,
        enableShadows: boolean = true
    ): Promise<GLTF> {
        return new Promise((resolve, reject) => {
            this.gltfLoader.load(
                url,
                (gltf) => {
                    // Enable shadows on all meshes if requested
                    if (enableShadows) {
                        gltf.scene.traverse((child) => {
                            if (child instanceof THREE.Mesh) {
                                child.castShadow = true;
                                child.receiveShadow = true;
                            }
                        });
                    }

                    if (onLoad) {
                        onLoad(gltf);
                    }

                    resolve(gltf);
                },
                (progress) => {
                    // Progress callback
                    const percentComplete = (progress.loaded / progress.total) * 100;
                    console.log(`Model loading: ${percentComplete.toFixed(2)}%`);
                },
                (error) => {
                    console.error('Error loading model:', error);
                    reject(error);
                }
            );
        });
    }

    /**
     * Load multiple models concurrently
     * @param urls Array of model URLs to load
     * @returns Promise resolving to array of loaded GLTF objects
     */
    public async loadMultiple(urls: string[]): Promise<GLTF[]> {
        const promises = urls.map(url => this.load(url));
        return Promise.all(promises);
    }

    /**
     * Get the GLTF loader instance for advanced usage
     */
    public getLoader(): GLTFLoader {
        return this.gltfLoader;
    }

    /**
     * Dispose of resources
     */
    public dispose(): void {
        this.dracoLoader.dispose();
    }
}
