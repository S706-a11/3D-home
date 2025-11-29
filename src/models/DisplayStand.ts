import * as THREE from 'three';

export interface ProjectData {
    id: string;
    title: string;
    description: string;
    imageUrl: string;
    projectUrl: string;
}

export class DisplayStand {
    private mesh: THREE.Group;
    private data: ProjectData;
    private interactableMesh!: THREE.Mesh;

    constructor(data: ProjectData) {
        this.data = data;
        this.mesh = new THREE.Group();
        this.createGeometry();
    }

    private createGeometry(): void {
        // 1. Glass Backing (Floating Billboard) - Larger size
        const glassGeo = new THREE.BoxGeometry(6.2, 4.2, 0.1);
        const glassMat = new THREE.MeshPhysicalMaterial({
            color: 0x88ccff,
            metalness: 0.1,
            roughness: 0.1,
            transmission: 1, // Glass-like
            thickness: 0.5,
            transparent: true,
            opacity: 1
        });
        const glassPanel = new THREE.Mesh(glassGeo, glassMat);
        glassPanel.castShadow = true;
        this.mesh.add(glassPanel);

        // 2. Screen with Project Image
        const screenGeo = new THREE.PlaneGeometry(6, 4);

        // Load actual project image
        const textureLoader = new THREE.TextureLoader();
        const imageTexture = textureLoader.load(
            this.data.imageUrl,
            // onLoad callback
            () => {
                console.log(`Loaded image: ${this.data.title}`);
            },
            // onProgress callback
            undefined,
            // onError callback
            (error) => {
                console.error(`Error loading image for ${this.data.title}:`, error);
            }
        );

        const screenMat = new THREE.MeshStandardMaterial({
            map: imageTexture,
            roughness: 0.4,
            metalness: 0.1,
            side: THREE.FrontSide,
            emissive: 0x000000,
            emissiveIntensity: 0
        });
        this.interactableMesh = new THREE.Mesh(screenGeo, screenMat);
        this.interactableMesh.position.set(0, 0, 0.06); // Slightly in front of glass

        this.mesh.add(this.interactableMesh);
    }

    public getMesh(): THREE.Group {
        return this.mesh;
    }

    public getInteractable(): THREE.Mesh {
        return this.interactableMesh;
    }

    public getData(): ProjectData {
        return this.data;
    }

    public setPosition(x: number, y: number, z: number): void {
        this.mesh.position.set(x, y, z);
    }

    public setRotation(y: number): void {
        this.mesh.rotation.y = y;
    }

    public setHighlight(active: boolean): void {
        const mat = this.interactableMesh.material as THREE.MeshStandardMaterial;
        if (active) {
            mat.emissive.setHex(0x3498db); // Blue glow
            mat.emissiveIntensity = 0.5;
        } else {
            mat.emissive.setHex(0x000000);
            mat.emissiveIntensity = 0;
        }
    }
}
