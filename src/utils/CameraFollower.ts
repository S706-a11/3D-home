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
}
