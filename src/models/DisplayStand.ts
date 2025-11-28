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
        // 1. Base Pedestal
        const baseGeo = new THREE.BoxGeometry(0.8, 1.2, 0.8);
        const baseMat = new THREE.MeshStandardMaterial({
            color: 0x2c3e50,
            roughness: 0.2,
            metalness: 0.8
        });
        const base = new THREE.Mesh(baseGeo, baseMat);
        base.position.y = 0.6;
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
        display.rotation.x = Math.PI / 6;
        display.castShadow = true;
        this.mesh.add(display);

        // 3. Screen with Text Texture
        const screenGeo = new THREE.PlaneGeometry(0.9, 0.7);
        const texture = this.createTextTexture(this.data.title);

        const screenMat = new THREE.MeshStandardMaterial({
            map: texture,
            roughness: 0.8,
            metalness: 0.1,
            side: THREE.DoubleSide,
            emissive: 0x000000,
            emissiveIntensity: 0
        });
        this.interactableMesh = new THREE.Mesh(screenGeo, screenMat);
        this.interactableMesh.position.set(0, 0.06, 0);
        this.interactableMesh.rotation.x = -Math.PI / 2;

        display.add(this.interactableMesh);
    }

    private createTextTexture(text: string): THREE.CanvasTexture {
        const canvas = document.createElement('canvas');
        canvas.width = 512;
        canvas.height = 256;
        const context = canvas.getContext('2d');

        if (context) {
            context.fillStyle = '#ecf0f1';
            context.fillRect(0, 0, canvas.width, canvas.height);

            context.font = 'bold 60px Arial';
            context.fillStyle = '#2c3e50';
            context.textAlign = 'center';
            context.textBaseline = 'middle';
            context.fillText(text, canvas.width / 2, canvas.height / 2);

            context.strokeStyle = '#bdc3c7';
            context.lineWidth = 20;
            context.strokeRect(0, 0, canvas.width, canvas.height);
        }

        return new THREE.CanvasTexture(canvas);
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
