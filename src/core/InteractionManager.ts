import * as THREE from 'three';
import { DisplayStand } from '../models/DisplayStand';

export class InteractionManager {
    private raycaster: THREE.Raycaster;
    private mouse: THREE.Vector2;
    private camera: THREE.Camera;
    private character: THREE.Object3D;
    private stands: DisplayStand[] = [];
    private interactionDistance: number = 3.0;

    constructor(camera: THREE.Camera, character: THREE.Object3D) {
        this.raycaster = new THREE.Raycaster();
        this.mouse = new THREE.Vector2();
        this.camera = camera;
        this.character = character;

        window.addEventListener('click', this.handleClick.bind(this));
    }

    public addStand(stand: DisplayStand): void {
        this.stands.push(stand);
    }

    public update(): void {
        let closestDist = Infinity;

        for (const stand of this.stands) {
            const dist = this.character.position.distanceTo(stand.getMesh().position);
            if (dist < closestDist) {
                closestDist = dist;
            }
        }

        const hintEl = document.getElementById('interaction-hint');
        if (hintEl) {
            if (closestDist <= this.interactionDistance) {
                hintEl.classList.add('visible');
            } else {
                hintEl.classList.remove('visible');
            }
        }
    }

    private handleClick(event: MouseEvent): void {
        // Calculate mouse position in normalized device coordinates
        // (-1 to +1) for both components
        this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

        this.raycaster.setFromCamera(this.mouse, this.camera);

        // Get all interactable meshes
        const interactables = this.stands.map(s => s.getInteractable());

        const intersects = this.raycaster.intersectObjects(interactables);

        if (intersects.length > 0) {
            const object = intersects[0].object;

            // Find which stand this object belongs to
            const stand = this.stands.find(s => s.getInteractable() === object);

            if (stand) {
                // Check distance
                const dist = this.character.position.distanceTo(stand.getMesh().position);

                if (dist <= this.interactionDistance) {
                    this.showProjectModal(stand.getData());
                } else {
                    console.log("Too far to interact!");
                    // Optional: Show a "Too far" toast
                }
            }
        }
    }

    private showProjectModal(data: any): void {
        const modal = document.getElementById('project-modal');
        const title = document.getElementById('project-title');
        const desc = document.getElementById('project-desc');
        const img = document.getElementById('project-image') as HTMLImageElement;
        const link = document.getElementById('project-link') as HTMLAnchorElement;

        if (modal && title && desc && img && link) {
            title.textContent = data.title;
            desc.textContent = data.description;
            img.src = data.imageUrl;
            img.alt = data.title;
            link.href = data.projectUrl;

            modal.style.display = 'flex';

            // Trigger animation
            setTimeout(() => {
                modal.classList.add('active');
            }, 10);
        }
    }
}
