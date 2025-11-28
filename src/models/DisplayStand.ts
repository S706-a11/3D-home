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
    private interactableMesh!: THREE.Mesh; // The specific part to click

    constructor(data: ProjectData) {
        this.data = data;
        this.mesh = new THREE.Group();
        this.createGeometry();
    }

    private createGeometry(): void {
        // 1. Base Pedestal
        const baseGeo = new THREE.BoxGeometry(0.8, 1.2, 0.8);
        const baseMat = new THREE.MeshStandardMaterial({
            color: 0x2c3e50,
            roughness: 0.2,
            metalness: 0.8
        });
        const base = new THREE.Mesh(baseGeo, baseMat);
        base.position.y = 0.6; // Half height
        base.castShadow = true;
        base.receiveShadow = true;
        this.mesh.add(base);

        // 2. Angled Display Surface
        const displayGeo = new THREE.BoxGeometry(1.0, 0.1, 0.8);
        const displayMat = new THREE.MeshStandardMaterial({
            color: 0x34495e,
            roughness: 0.2,
            metalness: 0.5
        });
        const display = new THREE.Mesh(displayGeo, displayMat);
        display.position.set(0, 1.25, 0);
        display.rotation.x = Math.PI / 6; // 30 degrees tilt
        display.castShadow = true;
        this.mesh.add(display);

        // 3. "Screen" or "Paper" (The interactable part)
        const screenGeo = new THREE.PlaneGeometry(0.9, 0.7);
        const screenMat = new THREE.MeshStandardMaterial({
            color: 0xecf0f1, // Paper white
            emissive: 0xbdc3c7,
            emissiveIntensity: 0.2,
            roughness: 0.8,
            metalness: 0.1,
            side: THREE.DoubleSide
        });
        this.interactableMesh = new THREE.Mesh(screenGeo, screenMat);
        // Position slightly above the display surface to avoid z-fighting
        this.interactableMesh.position.set(0, 0.06, 0);
        this.interactableMesh.rotation.x = -Math.PI / 2; // Lay flat on the box

        // Add screen to display group so it rotates with it
        display.add(this.interactableMesh);

        // Add a simple text label (optional, or just color code)
        // For now, the screen color indicates it's active
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
}
