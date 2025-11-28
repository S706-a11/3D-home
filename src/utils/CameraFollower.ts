import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

/**
 * Handles camera following logic for third-person perspective
 * Keeps the camera focused on a target while allowing orbit controls
 */
export class CameraFollower {
    private camera: THREE.Camera;
    private target: THREE.Object3D;
    private controls: OrbitControls;
    private lastTargetPosition: THREE.Vector3;

    constructor(
        camera: THREE.Camera,
        target: THREE.Object3D,
        controls: OrbitControls
    ) {
        this.camera = camera;
        this.target = target;
        this.controls = controls;
        this.lastTargetPosition = this.target.position.clone();
    }

    /**
     * Update camera position to follow target
     */
    public update(): void {
        // Calculate how much the target has moved
        const targetDisplacement = this.target.position.clone().sub(this.lastTargetPosition);

        // Move camera by the same amount to maintain relative position
        if (targetDisplacement.lengthSq() > 0) {
            this.camera.position.add(targetDisplacement);
            this.controls.target.add(targetDisplacement);
        }

        // Update last target position
        this.lastTargetPosition.copy(this.target.position);

        // Update controls
        this.controls.update();
    }

    /**
     * Set new target to follow
     */
    public setTarget(target: THREE.Object3D): void {
        this.target = target;
        this.lastTargetPosition.copy(this.target.position);
    }

    /**
     * Reset camera to default position behind target
     */
    public resetCamera(): void {
        // Default offset: 2 units up, 4 units back
        const defaultOffset = new THREE.Vector3(0, 2, 4);

        // Apply rotation of target to offset if needed, but for now fixed relative to world is fine
        // or relative to character facing? Let's stick to world-relative "behind" for consistency with WASD
        // Actually, "behind" usually means behind the character's back.
        // Since our controls are camera-relative, "behind" is relative to the camera... wait.
        // If controls are camera relative, resetting camera to a fixed world position (e.g. South of character)
        // is a good "reset".

        const newPos = this.target.position.clone().add(defaultOffset);
        this.camera.position.copy(newPos);
        this.camera.lookAt(this.target.position);

        // Reset controls target
        this.controls.target.copy(this.target.position);
        this.controls.update();
    }
}
