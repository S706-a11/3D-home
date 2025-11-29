import * as THREE from 'three';
import { Scene } from '../core/Scene';
import { PhysicsSystem } from '../core/PhysicsSystem';
import { InteractionManager } from '../core/InteractionManager';
import { DisplayStand } from '../models/DisplayStand';
import { ModelLoader } from '../utils/ModelLoader';
import type { GLTF } from 'three/examples/jsm/loaders/GLTFLoader.js';

export class WorldManager {
    private scene: Scene;
    private physicsSystem: PhysicsSystem;
    private interactionManager: InteractionManager;
    private modelLoader: ModelLoader;

    constructor(
        scene: Scene,
        physicsSystem: PhysicsSystem,
        interactionManager: InteractionManager,
        modelLoader: ModelLoader
    ) {
        this.scene = scene;
        this.physicsSystem = physicsSystem;
        this.interactionManager = interactionManager;
        this.modelLoader = modelLoader;
    }

    public setupGround(): void {
        // Load Snow Ground
        this.modelLoader.load('/models/holiday/snow-flat-large.glb', (gltf: GLTF) => {
            const snowTile = gltf.scene;
            snowTile.traverse((child) => {
                if (child instanceof THREE.Mesh) {
                    child.receiveShadow = true;
                }
            });

            // Calculate tile size
            const box = new THREE.Box3().setFromObject(snowTile);
            const size = box.getSize(new THREE.Vector3());

            // Safety check to prevent infinite loops
            if (size.x < 0.1 || size.z < 0.1) {
                console.warn('Snow tile size is too small, using default size');
                size.set(1, 1, 1);
            }

            // Create grid to cover 20x20 area
            const gridSize = 24; // Slightly larger to be safe
            const tilesX = Math.ceil(gridSize / size.x);
            const tilesZ = Math.ceil(gridSize / size.z);

            const startX = -gridSize / 2;
            const startZ = -gridSize / 2;

            for (let x = 0; x < tilesX; x++) {
                for (let z = 0; z < tilesZ; z++) {
                    const tile = snowTile.clone();
                    tile.position.set(
                        startX + x * size.x + size.x / 2,
                        0,
                        startZ + z * size.z + size.z / 2
                    );
                    this.scene.add(tile);
                }
            }
        });
    }

    public setupDecorations(): void {
        // Add some cubes around the scene
        const cubeGeometry = new THREE.BoxGeometry(0.5, 0.5, 0.5);
        const cubeMaterial = new THREE.MeshStandardMaterial({
            color: 0xe94560,
            roughness: 0.5,
            metalness: 0.3
        });

        for (let i = 0; i < 5; i++) {
            const cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
            const angle = (i / 5) * Math.PI * 2;
            const radius = 5;
            cube.position.set(
                Math.cos(angle) * radius,
                0.25,
                Math.sin(angle) * radius
            );
            cube.castShadow = true;
            cube.receiveShadow = true;
            this.scene.add(cube);
        }

        // Create 4 Physics Balls
        const ballColors = [0xff4444, 0x44ff44, 0x4444ff, 0xffff44];
        const ballGeometry = new THREE.SphereGeometry(0.5, 32, 32);

        for (let i = 0; i < 4; i++) {
            const ballMaterial = new THREE.MeshStandardMaterial({
                color: ballColors[i],
                roughness: 0.4,
                metalness: 0.2
            });
            const ballMesh = new THREE.Mesh(ballGeometry, ballMaterial);

            // Position in a circle
            const angle = (i / 4) * Math.PI * 2;
            const radius = 3;
            ballMesh.position.set(
                Math.cos(angle) * radius,
                5, // Drop from height
                Math.sin(angle) * radius
            );

            ballMesh.castShadow = true;
            ballMesh.receiveShadow = true;
            this.scene.add(ballMesh);
            this.physicsSystem.addObject(ballMesh, 1, 0.5);
        }
    }

    public setupDisplayStands(): void {
        const projects = [
            {
                id: 'p1',
                title: 'Project Alpha',
                description: 'A revolutionary AI assistant that helps you code faster.',
                imageUrl: 'https://via.placeholder.com/400x200/4a90e2/ffffff?text=Project+Alpha',
                projectUrl: '#'
            },
            {
                id: 'p2',
                title: 'Neon City',
                description: 'A cyberpunk-themed 3D experience built with Three.js.',
                imageUrl: 'https://via.placeholder.com/400x200/e94560/ffffff?text=Neon+City',
                projectUrl: '#'
            },
            {
                id: 'p3',
                title: 'Eco Tracker',
                description: 'Mobile app for tracking your carbon footprint.',
                imageUrl: 'https://via.placeholder.com/400x200/44ff44/ffffff?text=Eco+Tracker',
                projectUrl: '#'
            }
        ];

        projects.forEach((proj, index) => {
            const stand = new DisplayStand(proj);
            const angle = (index / projects.length) * Math.PI * 2;
            const radius = 10; // At the border
            stand.setPosition(
                Math.cos(angle) * radius,
                2, // In the sky
                Math.sin(angle) * radius
            );
            stand.setRotation(-angle - Math.PI / 2); // Face center

            this.scene.add(stand.getMesh());
            this.interactionManager.addStand(stand);

            // Add to physics system as static object
            this.physicsSystem.addObject(stand.getMesh(), 0, 0.8, true);
        });
    }
}
