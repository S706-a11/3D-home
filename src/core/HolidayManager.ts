import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { PhysicsSystem } from './PhysicsSystem';

export class HolidayManager {
    private scene: THREE.Scene;
    private physicsSystem: PhysicsSystem | null;
    private loader: GLTFLoader;
    private assetsPath: string = 'models/holiday/';

    constructor(scene: THREE.Scene, physicsSystem?: PhysicsSystem) {
        this.scene = scene;
        this.physicsSystem = physicsSystem || null;
        this.loader = new GLTFLoader();
    }

    public loadAssets(): void {
        const assets = [
            // Main Christmas Trees
            { file: 'tree-decorated-snow.glb', position: new THREE.Vector3(-8, 0, -8), scale: 2.5, rotation: new THREE.Euler(0, Math.PI / 4, 0) },
            { file: 'tree-snow-a.glb', position: new THREE.Vector3(8, 0, -8), scale: 2.0, rotation: new THREE.Euler(0, -Math.PI / 6, 0) },
            { file: 'tree-snow-b.glb', position: new THREE.Vector3(-9, 0, 6), scale: 1.8, rotation: new THREE.Euler(0, Math.random(), 0) },
            { file: 'tree-snow-c.glb', position: new THREE.Vector3(7, 0, 7), scale: 1.5, rotation: new THREE.Euler(0, Math.random(), 0) },
            { file: 'tree-decorated.glb', position: new THREE.Vector3(0, 0, -10), scale: 2.2, rotation: new THREE.Euler(0, 0, 0) },

            // Snowman Family
            { file: 'snowman-hat.glb', position: new THREE.Vector3(5, 0, 5), scale: 1.3, rotation: new THREE.Euler(0, -Math.PI / 4, 0) },
            { file: 'snowman.glb', position: new THREE.Vector3(6.5, 0, 4.5), scale: 1.0, rotation: new THREE.Euler(0, -Math.PI / 3, 0) },

            // Random Snowmen scattered around
            { file: 'snowman-hat.glb', position: new THREE.Vector3(-8.5, 0, 3), scale: 1.1, rotation: new THREE.Euler(0, Math.random() * Math.PI * 2, 0) },
            { file: 'snowman.glb', position: new THREE.Vector3(8, 0, 2), scale: 0.9, rotation: new THREE.Euler(0, Math.random() * Math.PI * 2, 0) },
            { file: 'snowman-hat.glb', position: new THREE.Vector3(-4, 0, -5), scale: 1.2, rotation: new THREE.Euler(0, Math.random() * Math.PI * 2, 0) },
            { file: 'snowman.glb', position: new THREE.Vector3(5, 0, -3), scale: 0.8, rotation: new THREE.Euler(0, Math.random() * Math.PI * 2, 0) },
            { file: 'snowman-hat.glb', position: new THREE.Vector3(2, 0, 8), scale: 1.0, rotation: new THREE.Euler(0, Math.random() * Math.PI * 2, 0) },
            { file: 'snowman.glb', position: new THREE.Vector3(-2.5, 0, 9), scale: 0.95, rotation: new THREE.Euler(0, Math.random() * Math.PI * 2, 0) },

            // Random Snow Piles for terrain variation
            { file: 'snow-pile.glb', position: new THREE.Vector3(6, 0, 1), scale: 1.5, rotation: new THREE.Euler(0, Math.random() * Math.PI * 2, 0) },
            { file: 'snow-pile.glb', position: new THREE.Vector3(-7, 0, -2), scale: 1.3, rotation: new THREE.Euler(0, Math.random() * Math.PI * 2, 0) },
            { file: 'snow-pile.glb', position: new THREE.Vector3(3, 0, -6), scale: 1.4, rotation: new THREE.Euler(0, Math.random() * Math.PI * 2, 0) },
            { file: 'snow-pile.glb', position: new THREE.Vector3(-5, 0, 7), scale: 1.2, rotation: new THREE.Euler(0, Math.random() * Math.PI * 2, 0) },
            { file: 'snow-pile.glb', position: new THREE.Vector3(9, 0, -4), scale: 1.6, rotation: new THREE.Euler(0, Math.random() * Math.PI * 2, 0) },
            { file: 'snow-pile.glb', position: new THREE.Vector3(-9, 0, 8), scale: 1.4, rotation: new THREE.Euler(0, Math.random() * Math.PI * 2, 0) },
            { file: 'snow-pile.glb', position: new THREE.Vector3(4.5, 0, 5), scale: 1.1, rotation: new THREE.Euler(0, Math.random() * Math.PI * 2, 0) },
            { file: 'snow-pile.glb', position: new THREE.Vector3(-3.5, 0, -4), scale: 1.3, rotation: new THREE.Euler(0, Math.random() * Math.PI * 2, 0) },

            // Christmas Train Set
            { file: 'train-locomotive.glb', position: new THREE.Vector3(-6, 0, 8), scale: 1.0, rotation: new THREE.Euler(0, Math.PI / 2, 0) },
            { file: 'train-tender.glb', position: new THREE.Vector3(-4.5, 0, 8), scale: 1.0, rotation: new THREE.Euler(0, Math.PI / 2, 0) },
            { file: 'train-wagon-logs.glb', position: new THREE.Vector3(-3, 0, 8), scale: 1.0, rotation: new THREE.Euler(0, Math.PI / 2, 0) },
            { file: 'train-wagon.glb', position: new THREE.Vector3(-1.5, 0, 8), scale: 1.0, rotation: new THREE.Euler(0, Math.PI / 2, 0) },

            // Train Rails
            { file: 'trainset-rail-straight.glb', position: new THREE.Vector3(-6, 0, 8), scale: 1.0, rotation: new THREE.Euler(0, Math.PI / 2, 0) },
            { file: 'trainset-rail-straight.glb', position: new THREE.Vector3(-4.5, 0, 8), scale: 1.0, rotation: new THREE.Euler(0, Math.PI / 2, 0) },
            { file: 'trainset-rail-straight.glb', position: new THREE.Vector3(-3, 0, 8), scale: 1.0, rotation: new THREE.Euler(0, Math.PI / 2, 0) },

            // Reindeer
            { file: 'reindeer.glb', position: new THREE.Vector3(-7, 0, -6), scale: 1.2, rotation: new THREE.Euler(0, Math.PI / 6, 0) },
            { file: 'reindeer.glb', position: new THREE.Vector3(7, 0, -7), scale: 1.1, rotation: new THREE.Euler(0, -Math.PI / 4, 0) },

            // Nutcrackers (Guards)
            { file: 'nutcracker.glb', position: new THREE.Vector3(-3, 0, -9), scale: 1.5, rotation: new THREE.Euler(0, 0, 0) },
            { file: 'nutcracker.glb', position: new THREE.Vector3(3, 0, -9), scale: 1.5, rotation: new THREE.Euler(0, 0, 0) },

            // Gingerbread People
            { file: 'gingerbread-man.glb', position: new THREE.Vector3(-4, 0, 6), scale: 1.2, rotation: new THREE.Euler(0, Math.PI / 4, 0) },
            { file: 'gingerbread-woman.glb', position: new THREE.Vector3(-3, 0, 6.5), scale: 1.2, rotation: new THREE.Euler(0, -Math.PI / 6, 0) },

            // Presents around main tree
            { file: 'present-a-round.glb', position: new THREE.Vector3(-7.5, 0, -7.5), scale: 1.0, rotation: new THREE.Euler(0, Math.random(), 0) },
            { file: 'present-b-cube.glb', position: new THREE.Vector3(-8.5, 0, -7), scale: 0.8, rotation: new THREE.Euler(0, Math.random(), 0) },
            { file: 'present-a-rectangle.glb', position: new THREE.Vector3(-7, 0, -8.5), scale: 0.9, rotation: new THREE.Euler(0, Math.random(), 0) },
            { file: 'present-b-round.glb', position: new THREE.Vector3(-6.5, 0, -7), scale: 0.7, rotation: new THREE.Euler(0, Math.random(), 0) },
            { file: 'present-a-cube.glb', position: new THREE.Vector3(-7.5, 0, -6.5), scale: 0.8, rotation: new THREE.Euler(0, Math.random(), 0) },
            { file: 'present-b-rectangle.glb', position: new THREE.Vector3(-8, 0, -6), scale: 0.9, rotation: new THREE.Euler(0, Math.random(), 0) },

            // More scattered presents
            { file: 'present-a-round.glb', position: new THREE.Vector3(7.5, 0, -7), scale: 0.8, rotation: new THREE.Euler(0, Math.random(), 0) },
            { file: 'present-b-cube.glb', position: new THREE.Vector3(8, 0, -6.5), scale: 0.7, rotation: new THREE.Euler(0, Math.random(), 0) },
            { file: 'present-a-cube.glb', position: new THREE.Vector3(-8, 0, 5), scale: 0.9, rotation: new THREE.Euler(0, Math.random(), 0) },

            { file: 'present-b-cube.glb', position: new THREE.Vector3(8, 0, -6.5), scale: 0.7, rotation: new THREE.Euler(0, Math.random(), 0) },
            { file: 'present-a-cube.glb', position: new THREE.Vector3(-8, 0, 5), scale: 0.9, rotation: new THREE.Euler(0, Math.random(), 0) },

            // Candy Canes pathway
            { file: 'candy-cane-red.glb', position: new THREE.Vector3(-3, 0, -3), scale: 1.5, rotation: new THREE.Euler(0, 0, 0) },
            { file: 'candy-cane-green.glb', position: new THREE.Vector3(3, 0, -3), scale: 1.5, rotation: new THREE.Euler(0, 0, 0) },
            { file: 'candy-cane-red.glb', position: new THREE.Vector3(-3, 0, 3), scale: 1.5, rotation: new THREE.Euler(0, 0, 0) },
            { file: 'candy-cane-green.glb', position: new THREE.Vector3(3, 0, 3), scale: 1.5, rotation: new THREE.Euler(0, 0, 0) },
            { file: 'candy-cane-red.glb', position: new THREE.Vector3(-4, 0, 0), scale: 1.5, rotation: new THREE.Euler(0, 0, 0) },
            { file: 'candy-cane-green.glb', position: new THREE.Vector3(4, 0, 0), scale: 1.5, rotation: new THREE.Euler(0, 0, 0) },

            // Colored String Lights - Between Billboards forming a canopy
            { file: 'lights-colored.glb', position: new THREE.Vector3(9, 3.5, 5), scale: 5.0, rotation: new THREE.Euler(0, Math.PI / 3, 0) },
            { file: 'lights-red.glb', position: new THREE.Vector3(0, 3.5, 10), scale: 5.0, rotation: new THREE.Euler(0, 0, 0) },
            { file: 'lights-green.glb', position: new THREE.Vector3(-8.66, 3.5, 5), scale: 5.0, rotation: new THREE.Euler(0, Math.PI / 1.5, 0) },
            { file: 'lights-colored.glb', position: new THREE.Vector3(-8.66, 3.5, -5), scale: 5.0, rotation: new THREE.Euler(0, 7 * Math.PI / 5.3, 0) },
            { file: 'lights-red.glb', position: new THREE.Vector3(0, 3.5, -10), scale: 5.0, rotation: new THREE.Euler(0, 3 * Math.PI, 0) },
            { file: 'lights-green.glb', position: new THREE.Vector3(8.66, 3.5, -5), scale: 5.0, rotation: new THREE.Euler(0, 11 * Math.PI / 6.6, 0) },

            // Lanterns for Atmosphere
            { file: 'lantern.glb', position: new THREE.Vector3(-6, 0, 0), scale: 1.2, rotation: new THREE.Euler(0, 0, 0) },
            { file: 'lantern.glb', position: new THREE.Vector3(6, 0, 0), scale: 1.2, rotation: new THREE.Euler(0, 0, 0) },
            { file: 'lantern.glb', position: new THREE.Vector3(0, 0, -6), scale: 1.2, rotation: new THREE.Euler(0, 0, 0) },
            { file: 'lantern.glb', position: new THREE.Vector3(0, 0, 6), scale: 1.2, rotation: new THREE.Euler(0, 0, 0) },

            // Christmas Socks
            { file: 'sock-red.glb', position: new THREE.Vector3(-1, 1.5, -9.5), scale: 1.0, rotation: new THREE.Euler(0, 0, 0) },
            { file: 'sock-green.glb', position: new THREE.Vector3(1, 1.5, -9.5), scale: 1.0, rotation: new THREE.Euler(0, 0, 0) },
            { file: 'sock-red-cane.glb', position: new THREE.Vector3(0, 1.5, -9.5), scale: 1.0, rotation: new THREE.Euler(0, 0, 0) },

            // Wreath
            { file: 'wreath-decorated.glb', position: new THREE.Vector3(0, 3.5, -10.5), scale: 2.5, rotation: new THREE.Euler(0, 0, 0) },

            // Bench and Sled
            { file: 'bench.glb', position: new THREE.Vector3(-2, 0, 7), scale: 1.5, rotation: new THREE.Euler(0, Math.PI / 4, 0) },
            { file: 'sled.glb', position: new THREE.Vector3(3.5, 0, 7), scale: 1.3, rotation: new THREE.Euler(0, -Math.PI / 6, 0) },
            { file: 'sled-long.glb', position: new THREE.Vector3(-5, 0, 3), scale: 1.2, rotation: new THREE.Euler(0, Math.PI / 3, 0) },

            // Snowflakes scattered around
            { file: 'snowflake-a.glb', position: new THREE.Vector3(-5, 0.5, -2), scale: 0.5, rotation: new THREE.Euler(0, 0, 0) },
            { file: 'snowflake-b.glb', position: new THREE.Vector3(4, 0.5, -4), scale: 0.6, rotation: new THREE.Euler(0, Math.PI / 4, 0) },
            { file: 'snowflake-c.glb', position: new THREE.Vector3(-3, 0.5, 4), scale: 0.4, rotation: new THREE.Euler(0, Math.PI / 2, 0) },

            // Snow piles for terrain variation
            { file: 'snow-pile.glb', position: new THREE.Vector3(5, 0, 2), scale: 1.5, rotation: new THREE.Euler(0, Math.random(), 0) },
            { file: 'snow-pile.glb', position: new THREE.Vector3(-6, 0, -3), scale: 1.3, rotation: new THREE.Euler(0, Math.random(), 0) },

            // Rocks around border for natural boundaries
            // North border
            { file: 'rocks-large.glb', position: new THREE.Vector3(-10, 0, -11), scale: 1.2, rotation: new THREE.Euler(0, Math.random() * Math.PI * 2, 0) },
            { file: 'rocks-medium.glb', position: new THREE.Vector3(-5, 0, -11.5), scale: 1.0, rotation: new THREE.Euler(0, Math.random() * Math.PI * 2, 0) },
            { file: 'rocks-small.glb', position: new THREE.Vector3(-2, 0, -11), scale: 0.8, rotation: new THREE.Euler(0, Math.random() * Math.PI * 2, 0) },
            { file: 'rocks-large.glb', position: new THREE.Vector3(2, 0, -11.5), scale: 1.1, rotation: new THREE.Euler(0, Math.random() * Math.PI * 2, 0) },
            { file: 'rocks-medium.glb', position: new THREE.Vector3(6, 0, -11), scale: 0.9, rotation: new THREE.Euler(0, Math.random() * Math.PI * 2, 0) },
            { file: 'rocks-small.glb', position: new THREE.Vector3(10, 0, -11.5), scale: 0.7, rotation: new THREE.Euler(0, Math.random() * Math.PI * 2, 0) },

            // South border
            { file: 'rocks-medium.glb', position: new THREE.Vector3(-9, 0, 11), scale: 1.0, rotation: new THREE.Euler(0, Math.random() * Math.PI * 2, 0) },
            { file: 'rocks-large.glb', position: new THREE.Vector3(-4, 0, 11.5), scale: 1.3, rotation: new THREE.Euler(0, Math.random() * Math.PI * 2, 0) },
            { file: 'rocks-small.glb', position: new THREE.Vector3(0, 0, 11), scale: 0.8, rotation: new THREE.Euler(0, Math.random() * Math.PI * 2, 0) },
            { file: 'rocks-medium.glb', position: new THREE.Vector3(5, 0, 11.5), scale: 0.9, rotation: new THREE.Euler(0, Math.random() * Math.PI * 2, 0) },
            { file: 'rocks-large.glb', position: new THREE.Vector3(9, 0, 11), scale: 1.1, rotation: new THREE.Euler(0, Math.random() * Math.PI * 2, 0) },

            // West border
            { file: 'rocks-small.glb', position: new THREE.Vector3(-11, 0, -8), scale: 0.7, rotation: new THREE.Euler(0, Math.random() * Math.PI * 2, 0) },
            { file: 'rocks-large.glb', position: new THREE.Vector3(-11.5, 0, -4), scale: 1.2, rotation: new THREE.Euler(0, Math.random() * Math.PI * 2, 0) },
            { file: 'rocks-medium.glb', position: new THREE.Vector3(-11, 0, 0), scale: 1.0, rotation: new THREE.Euler(0, Math.random() * Math.PI * 2, 0) },
            { file: 'rocks-small.glb', position: new THREE.Vector3(-11.5, 0, 4), scale: 0.8, rotation: new THREE.Euler(0, Math.random() * Math.PI * 2, 0) },
            { file: 'rocks-large.glb', position: new THREE.Vector3(-11, 0, 8), scale: 1.1, rotation: new THREE.Euler(0, Math.random() * Math.PI * 2, 0) },

            // East border
            { file: 'rocks-medium.glb', position: new THREE.Vector3(11, 0, -9), scale: 0.9, rotation: new THREE.Euler(0, Math.random() * Math.PI * 2, 0) },
            { file: 'rocks-large.glb', position: new THREE.Vector3(11.5, 0, -5), scale: 1.3, rotation: new THREE.Euler(0, Math.random() * Math.PI * 2, 0) },
            { file: 'rocks-small.glb', position: new THREE.Vector3(11, 0, -1), scale: 0.7, rotation: new THREE.Euler(0, Math.random() * Math.PI * 2, 0) },
            { file: 'rocks-medium.glb', position: new THREE.Vector3(11.5, 0, 3), scale: 1.0, rotation: new THREE.Euler(0, Math.random() * Math.PI * 2, 0) },
            { file: 'rocks-large.glb', position: new THREE.Vector3(11, 0, 7), scale: 1.2, rotation: new THREE.Euler(0, Math.random() * Math.PI * 2, 0) },
            { file: 'rocks-small.glb', position: new THREE.Vector3(11.5, 0, 10), scale: 0.8, rotation: new THREE.Euler(0, Math.random() * Math.PI * 2, 0) }
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

                    // Add collision to rocks (static objects)
                    if (asset.file.includes('rocks-') && this.physicsSystem) {
                        const radius = asset.scale * 1.5; // Approximate collision radius
                        this.physicsSystem.addObject(model, 0, radius, true);
                    }

                    // Add point lights to lanterns for glow effect
                    if (asset.file === 'lantern.glb') {
                        const light = new THREE.PointLight(0xffaa66, 0.8, 5);
                        light.position.copy(asset.position);
                        light.position.y += 0.5;
                        this.scene.add(light);
                    }
                },
                undefined,
                () => {
                    console.warn(`Could not load holiday asset: ${asset.file}`);
                }
            );
        });
    }
}
