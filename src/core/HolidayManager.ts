import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

export class HolidayManager {
    private scene: THREE.Scene;
    private loader: GLTFLoader;
    private assetsPath: string = 'models/holiday/';

    constructor(scene: THREE.Scene) {
        this.scene = scene;
        this.loader = new GLTFLoader();
    }

    public loadAssets(): void {
        // List of assets to load with their transforms
        const assets = [
            {
                file: 'tree.glb',
                position: new THREE.Vector3(-4, 0, -4),
                scale: 1.5,
                rotation: new THREE.Euler(0, Math.PI / 4, 0)
            },
            {
                file: 'snowman.glb',
                position: new THREE.Vector3(4, 0, -4),
                scale: 1.2,
                rotation: new THREE.Euler(0, -Math.PI / 4, 0)
            },
            {
                file: 'wreath.glb',
                position: new THREE.Vector3(0, 2.5, -4.8), // On the back wall
                scale: 1.0,
                rotation: new THREE.Euler(0, 0, 0)
            },
            {
                file: 'present.glb',
                position: new THREE.Vector3(-3.5, 0, -3.5),
                scale: 0.8,
                rotation: new THREE.Euler(0, Math.random() * Math.PI, 0)
            },
            {
                file: 'present.glb',
                position: new THREE.Vector3(-4.5, 0, -3.2),
                scale: 0.6,
                rotation: new THREE.Euler(0, Math.random() * Math.PI, 0)
            }
        ];

        assets.forEach(asset => {
            this.loader.load(
                this.assetsPath + asset.file,
                (gltf) => {
                    const model = gltf.scene;
                    model.position.copy(asset.position);
                    model.scale.set(asset.scale, asset.scale, asset.scale);
                    if (asset.rotation) {
                        model.rotation.copy(asset.rotation);
                    }

                    // Add shadows
                    model.traverse((child) => {
                        if ((child as THREE.Mesh).isMesh) {
                            child.castShadow = true;
                            child.receiveShadow = true;
                        }
                    });

                    this.scene.add(model);
                    console.log(`🎄 Loaded holiday asset: ${asset.file}`);
                },
                undefined,
                (error) => {
                    // It's okay if files are missing, just log a warning
                    console.warn(`Could not load holiday asset: ${asset.file}. Make sure it's in public/${this.assetsPath}`);
                }
            );
        });
    }
}
