import * as THREE from 'three';
import { DisplayStand } from '../models/DisplayStand';

export class InteractionManager {
    private raycaster: THREE.Raycaster;
    private mouse: THREE.Vector2;
    private camera: THREE.Camera;
    private character: THREE.Object3D;
    private stands: DisplayStand[] = [];
    private interactionDistance: number = 3.0;
    private hoveredStand: DisplayStand | null = null;
    private touchStartPos: { x: number; y: number } | null = null;

    constructor(camera: THREE.Camera, character: THREE.Object3D) {
        this.raycaster = new THREE.Raycaster();
        this.mouse = new THREE.Vector2();
        this.camera = camera;
        this.character = character;

        // Mouse events for desktop
        window.addEventListener('click', this.handleClick.bind(this));
        window.addEventListener('mousemove', this.handleMouseMove.bind(this));

        // Touch events for mobile
        window.addEventListener('touchstart', this.handleTouchStart.bind(this), { passive: false });
        window.addEventListener('touchend', this.handleTouchEnd.bind(this), { passive: false });
    }

    public addStand(stand: DisplayStand): void {
        this.stands.push(stand);
    }

    public setCharacter(character: THREE.Object3D): void {
        this.character = character;
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

                const canvas = document.querySelector('canvas');
                if (canvas) {
                    const rect = canvas.getBoundingClientRect();
                    const x = (standPos.x * .5 + .5) * rect.width;
                    const y = (standPos.y * -.5 + .5) * rect.height;

                    // Only show if in front of camera (z < 1)
                    if (standPos.z < 1) {
                        hintEl.style.left = '0px';
                        hintEl.style.top = '0px';
                        // Add canvas offset to position
                        hintEl.style.transform = `translate(${x + rect.left}px, ${y + rect.top}px) translate(-50%, -50%)`;
                        hintEl.classList.add('visible');
                    } else {
                        hintEl.classList.remove('visible');
                    }
                }
            } else {
                hintEl.classList.remove('visible');
            }
        }
    }

    private handleMouseMove(event: MouseEvent): void {
        const canvas = document.querySelector('canvas');
        if (canvas) {
            const rect = canvas.getBoundingClientRect();
            this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
            this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
        } else {
            this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
            this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
        }

        this.checkHover();
    }

    private checkHover(): void {
        this.raycaster.setFromCamera(this.mouse, this.camera);
        const interactables = this.stands.map(s => s.getInteractable());
        const intersects = this.raycaster.intersectObjects(interactables);

        let newHoveredStand: DisplayStand | null = null;

        if (intersects.length > 0) {
            const object = intersects[0].object;
            const stand = this.stands.find(s => s.getInteractable() === object);

            if (stand) {
                const dist = this.character.position.distanceTo(stand.getMesh().position);
                if (dist <= this.interactionDistance) {
                    newHoveredStand = stand;
                }
            }
        }

        // Handle highlight change
        if (this.hoveredStand !== newHoveredStand) {
            if (this.hoveredStand) {
                this.hoveredStand.setHighlight(false);
            }
            if (newHoveredStand) {
                newHoveredStand.setHighlight(true);
            }
            this.hoveredStand = newHoveredStand;
        }

        const canvas = document.querySelector('canvas');
        if (canvas) {
            if (this.hoveredStand) {
                canvas.classList.add('interactive');
            } else {
                canvas.classList.remove('interactive');
            }
        }
    }

    private handleClick(event: MouseEvent): void {
        const canvas = document.querySelector('canvas');
        if (canvas) {
            const rect = canvas.getBoundingClientRect();
            this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
            this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
        } else {
            this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
            this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
        }

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

    /**
     * Handle touch start - record initial touch position
     */
    private handleTouchStart(event: TouchEvent): void {
        if (event.touches.length === 1) {
            const touch = event.touches[0];
            this.touchStartPos = { x: touch.clientX, y: touch.clientY };
        }
    }

    /**
     * Handle touch end - check if it was a tap (not a drag) and interact with project
     */
    private handleTouchEnd(event: TouchEvent): void {
        if (!this.touchStartPos) return;

        const touch = event.changedTouches[0];
        const target = touch.target as HTMLElement;

        // Ignore taps on mobile control buttons
        if (target.id === 'jump-button' || target.id === 'run-button' ||
            target.id === 'joystick-base' || target.id === 'joystick-stick') {
            this.touchStartPos = null;
            return;
        }

        // Calculate distance moved
        const dx = touch.clientX - this.touchStartPos.x;
        const dy = touch.clientY - this.touchStartPos.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        // Only trigger if it was a tap (not a drag)
        const tapThreshold = 15; // pixels
        if (distance < tapThreshold) {
            // Convert touch position to normalized coordinates
            const canvas = document.querySelector('canvas');
            if (canvas) {
                const rect = canvas.getBoundingClientRect();
                this.mouse.x = ((touch.clientX - rect.left) / rect.width) * 2 - 1;
                this.mouse.y = -((touch.clientY - rect.top) / rect.height) * 2 + 1;
            } else {
                this.mouse.x = (touch.clientX / window.innerWidth) * 2 - 1;
                this.mouse.y = -(touch.clientY / window.innerHeight) * 2 + 1;
            }

            // Perform raycast
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

        this.touchStartPos = null;
    }
}
