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
        window.addEventListener('mousemove', this.handleMouseMove.bind(this));
    }

    public addStand(stand: DisplayStand): void {
        this.stands.push(stand);
    }

    public update(): void {
        let closestDist = Infinity;
        let closestStand: DisplayStand | null = null;

        for (const stand of this.stands) {
            const dist = this.character.position.distanceTo(stand.getMesh().position);
            if (dist < closestDist) {
                closestDist = dist;
                closestStand = stand;
            }
        }

        const hintEl = document.getElementById('interaction-hint');
        if (hintEl) {
            if (closestDist <= this.interactionDistance && closestStand) {
                // Calculate screen position
                const standPos = closestStand.getMesh().position.clone();
                standPos.y += 2.5; // Float above the stand

                // Project to screen
                standPos.project(this.camera);

                const x = (standPos.x * .5 + .5) * window.innerWidth;
                const y = (standPos.y * -.5 + .5) * window.innerHeight;

                // Only show if in front of camera (z < 1)
                if (standPos.z < 1) {
                    hintEl.style.left = '0px';
                    hintEl.style.top = '0px';
                    hintEl.style.transform = `translate(${x}px, ${y}px) translate(-50%, -50%)`;
                    hintEl.classList.add('visible');
                } else {
                    hintEl.classList.remove('visible');
                }
            } else {
                hintEl.classList.remove('visible');
            }
        }
    }

    private handleMouseMove(event: MouseEvent): void {
        this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

        this.checkHover();
    }

    private checkHover(): void {
        this.raycaster.setFromCamera(this.mouse, this.camera);
        const interactables = this.stands.map(s => s.getInteractable());
        const intersects = this.raycaster.intersectObjects(interactables);

        let hovering = false;

        if (intersects.length > 0) {
            const object = intersects[0].object;
            const stand = this.stands.find(s => s.getInteractable() === object);

            if (stand) {
                const dist = this.character.position.distanceTo(stand.getMesh().position);
                if (dist <= this.interactionDistance) {
                    hovering = true;
                }
            }
        }

        document.body.style.cursor = hovering ? 'pointer' : 'default';
    }

    private handleClick(event: MouseEvent): void {
        // Mouse position is already updated by handleMouseMove, but let's be safe
        this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

        this.raycaster.setFromCamera(this.mouse, this.camera);

        const interactables = this.stands.map(s => s.getInteractable());
        const intersects = this.raycaster.intersectObjects(interactables);

        if (intersects.length > 0) {
            const object = intersects[0].object;
            const stand = this.stands.find(s => s.getInteractable() === object);

            if (stand) {
                const dist = this.character.position.distanceTo(stand.getMesh().position);

                if (dist <= this.interactionDistance) {
                    this.showProjectModal(stand.getData());
                } else {
                    console.log("Too far to interact!");
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
            setTimeout(() => {
                modal.classList.add('active');
            }, 10);
        }
    }
}
