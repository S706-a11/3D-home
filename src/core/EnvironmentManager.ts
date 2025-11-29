import * as THREE from 'three';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js';

export class EnvironmentManager {
    private scene: THREE.Scene;
    private loader: RGBELoader;

    constructor(scene: THREE.Scene) {
        this.scene = scene;
        this.loader = new RGBELoader();
    }

    public load(path: string): void {
        this.loader.load(path, (texture) => {
            texture.mapping = THREE.EquirectangularReflectionMapping;
            this.scene.background = texture;
            this.scene.environment = texture;
            console.log('Environment loaded:', path);
        }, undefined, (error) => {
            console.error('An error occurred loading the environment:', error);
        });
    }
}
