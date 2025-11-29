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
        // Base Snow Layer (to fill gaps)

        const baseGeometry = new THREE.PlaneGeometry(20, 20);
        const baseMaterial = new THREE.MeshStandardMaterial({
            color: 0xffffff,
            roughness: 1.0,
            metalness: 0.0,
            map: new THREE.TextureLoader().load('/textures/snow_floor_ao_1k.jpg'),
        });
        const baseGround = new THREE.Mesh(baseGeometry, baseMaterial);
        baseGround.rotation.x = -Math.PI / 2;
        baseGround.position.y = -0.05; // Slightly below tiles
        baseGround.receiveShadow = true;
        this.scene.add(baseGround);


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
                size.set(1, 1, 1);
            }

            // Create grid to cover 24x24 area with random placement
            const gridSize = 24;
            const tilesX = Math.ceil(gridSize / size.x);
            const tilesZ = Math.ceil(gridSize / size.z);

            const startX = -gridSize / 2;
            const startZ = -gridSize / 2;

            for (let x = 0; x < tilesX; x++) {
                for (let z = 0; z < tilesZ; z++) {
                    const tile = snowTile.clone();

                    // Add random offset for natural look (up to 50% of tile size)
                    const randomOffsetX = (Math.random() - 0.5) * size.x * 0.5;
                    const randomOffsetZ = (Math.random() - 0.5) * size.z * 0.5;

                    tile.position.set(
                        startX + x * size.x + size.x / 2 + randomOffsetX,
                        0,
                        startZ + z * size.z + size.z / 2 + randomOffsetZ
                    );

                    // Random rotation for variety
                    tile.rotation.y = Math.random() * Math.PI * 2;

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
                id: '1',
                title: "Getthawha",
                description: "Getthawha Thai Massage, featuring an online booking system, service menu, and location finder, all built with React, TypeScript, and a custom backend API. (frontend role)",
                imageUrl: '/images/projects/getthawha.jpg',
                projectUrl: "https://getthawha.com/"
            },
            {
                id: '2',
                title: "PokéBay",
                description: "A Pokémon-themed e-commerce application built as an educational project. It uses Laravel for all backend logic, user authentication, and route handling, with MySQL for data persistence to manage users, Pokémon (products), and orders. (Fullstack role)",
                imageUrl: '/images/projects/pokebay.jpg',
                projectUrl: "https://e-commerce.iamgot.com"
            },
            {
                id: '3',
                title: "Run, Little Hero!",
                description: "A cross-platform, real-time multiplayer endless runner inspired by Cookie Run. Players race against each other live, dodging obstacles and collecting items. The game client is built with LibGDX and is supported by a custom backend using Spring Boot and a Node.js (Socket.IO) server to handle the live multiplayer. (frontend role)",
                imageUrl: '/images/projects/RunLittleHero.jpg',
                projectUrl: "https://game.yungying.com/"
            },
            {
                id: '4',
                title: "Calendar",
                description: "A serverless(firebase) web application for modern event and schedule management. The frontend is built with React, responsive interface that allows users to toggle between Month, Week, and Day views.",
                imageUrl: '/images/projects/calendar.jpg',
                projectUrl: "https://calendar.iamgot.com/"
            },
            {
                id: '5',
                title: "Thira",
                description: "A serverless social media application built with React and Firebase. The project features a real-time feed, user profiles, and CRUD functionality for posts. It leverages Firebase Authentication for secure login and Cloud Firestore for all application data. **no server for uploads (Fullstack role)",
                imageUrl: '/images/projects/thira.jpg',
                projectUrl: "https://thira.iamgot.com/"
            },
            {
                id: '6',
                title: "Dog or Cat",
                description: "A web-based AI tool that can accurately classify an uploaded image as either a 'Dog' or a 'Cat.' This project is for learning purposes, utilizing a pre-trained machine learning model to perform image recognition tasks. (react,python)",
                imageUrl: '/images/projects/dogcat.jpg',
                projectUrl: "https://dog_or_cat.iamgot.com/"
            }
        ];

        projects.forEach((proj, index) => {
            const stand = new DisplayStand(proj);
            const angle = (index / projects.length) * Math.PI * 2;
            const radius = 10; // At the border
            stand.setPosition(
                Math.cos(angle) * radius,
                3, // Higher in the sky
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
