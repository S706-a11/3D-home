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
        const assets = [
            // Trees
            { file: 'tree-decorated-snow.glb', position: new THREE.Vector3(-6, 0, -6), scale: 2.0, rotation: new THREE.Euler(0, Math.PI / 4, 0) },
            { file: 'tree-snow-a.glb', position: new THREE.Vector3(6, 0, -6), scale: 1.8, rotation: new THREE.Euler(0, -Math.PI / 6, 0) },
            { file: 'tree-snow-b.glb', position: new THREE.Vector3(-7, 0, 5), scale: 1.5, rotation: new THREE.Euler(0, Math.random(), 0) },

            // Snowman Family
            { file: 'snowman-hat.glb', position: new THREE.Vector3(4, 0, 4), scale: 1.2, rotation: new THREE.Euler(0, -Math.PI / 4, 0) },
            { file: 'snowman.glb', position: new THREE.Vector3(5.5, 0, 3.5), scale: 0.8, rotation: new THREE.Euler(0, -Math.PI / 3, 0) },

            // Presents around the main tree
            { file: 'present-a-round.glb', position: new THREE.Vector3(-5, 0, -5), scale: 0.8, rotation: new THREE.Euler(0, Math.random(), 0) },
            { file: 'present-b-cube.glb', position: new THREE.Vector3(-5.5, 0, -4.5), scale: 0.7, rotation: new THREE.Euler(0, Math.random(), 0) },
            { file: 'present-a-rectangle.glb', position: new THREE.Vector3(-4.5, 0, -5.5), scale: 0.9, rotation: new THREE.Euler(0, Math.random(), 0) },

            // Candy Canes lining the path
            { file: 'candy-cane-red.glb', position: new THREE.Vector3(-2, 0, -2), scale: 1.5, rotation: new THREE.Euler(0, Math.random(), 0) },
            { file: 'candy-cane-green.glb', position: new THREE.Vector3(2, 0, -2), scale: 1.5, rotation: new THREE.Euler(0, Math.random(), 0) },
            { file: 'candy-cane-red.glb', position: new THREE.Vector3(-2, 0, 2), scale: 1.5, rotation: new THREE.Euler(0, Math.random(), 0) },
            { file: 'candy-cane-green.glb', position: new THREE.Vector3(2, 0, 2), scale: 1.5, rotation: new THREE.Euler(0, Math.random(), 0) },

            // Wreath
            { file: 'wreath-decorated.glb', position: new THREE.Vector3(0, 3, -8), scale: 2.0, rotation: new THREE.Euler(0, 0, 0) },

            // Bench
            { file: 'bench.glb', position: new THREE.Vector3(0, 0, 6), scale: 1.5, rotation: new THREE.Euler(0, Math.PI, 0) },

            // Sled
            { file: 'sled.glb', position: new THREE.Vector3(3, 0, 6), scale: 1.2, rotation: new THREE.Euler(0, -Math.PI / 6, 0) }
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

                    model.traverse((child) => {
                        if ((child as THREE.Mesh).isMesh) {
                            child.castShadow = true;
                            child.receiveShadow = true;
                        }
                    });

                    this.scene.add(model);
                },
                undefined,
                (error) => {
                    console.warn(`Could not load holiday asset: ${asset.file}`);
                }
            );
        });
    }
}
