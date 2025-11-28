import * as THREE from 'three';

/**
 * Character controller for handling player/character movement
 * Supports keyboard input, smooth movement, and animation integration
 */
export class CharacterController {
    private character: THREE.Object3D;
    private velocity: THREE.Vector3;
    private moveSpeed: number;
    private rotationSpeed: number;
    private keys: { [key: string]: boolean } = {};
    private mixer?: THREE.AnimationMixer;
    private animations: Map<string, THREE.AnimationAction> = new Map();
    private currentAnimation?: THREE.AnimationAction;

    constructor(character: THREE.Object3D, moveSpeed: number = 5, rotationSpeed: number = 3) {
        this.character = character;
        this.velocity = new THREE.Vector3();
        this.moveSpeed = moveSpeed;
        this.rotationSpeed = rotationSpeed;

        this.setupKeyboardControls();
    }

    /**
     * Setup keyboard event listeners
     */
    private setupKeyboardControls(): void {
        window.addEventListener('keydown', (e) => {
            this.keys[e.key.toLowerCase()] = true;
        });

        window.addEventListener('keyup', (e) => {
            this.keys[e.key.toLowerCase()] = false;
        });
    }

    /**
     * Set up animation mixer with animations from GLTF
     * @param animations Array of animation clips
     */
    public setupAnimations(animations: THREE.AnimationClip[]): void {
        if (animations.length === 0) return;

        this.mixer = new THREE.AnimationMixer(this.character);

        animations.forEach((clip) => {
            const action = this.mixer!.clipAction(clip);
            this.animations.set(clip.name, action);
        });
    }

    /**
     * Play an animation by name
     * @param name Name of the animation to play
     * @param fadeTime Time to fade between animations (seconds)
     */
    public playAnimation(name: string, fadeTime: number = 0.2): void {
        if (!this.mixer) return;

        const action = this.animations.get(name);
        if (!action) {
            console.warn(`Animation "${name}" not found`);
            return;
        }

        if (this.currentAnimation && this.currentAnimation !== action) {
            this.currentAnimation.fadeOut(fadeTime);
        }

        action.reset().fadeIn(fadeTime).play();
        this.currentAnimation = action;
    }

    /**
     * Update character position and rotation based on input
     * @param delta Time since last frame in seconds
     */
    public update(delta: number): void {
        // Update animation mixer
        if (this.mixer) {
            this.mixer.update(delta);
        }

        // Reset velocity
        this.velocity.set(0, 0, 0);

        let isMoving = false;

        // Forward/Backward movement
        if (this.keys['w'] || this.keys['arrowup']) {
            this.velocity.z -= 1;
            isMoving = true;
        }
        if (this.keys['s'] || this.keys['arrowdown']) {
            this.velocity.z += 1;
            isMoving = true;
        }

        // Left/Right movement (strafing)
        if (this.keys['a'] || this.keys['arrowleft']) {
            this.velocity.x -= 1;
            isMoving = true;
        }
        if (this.keys['d'] || this.keys['arrowright']) {
            this.velocity.x += 1;
            isMoving = true;
        }

        // Normalize velocity for consistent diagonal movement
        if (this.velocity.length() > 0) {
            this.velocity.normalize();
        }

        // Apply movement
        const movement = this.velocity.clone().multiplyScalar(this.moveSpeed * delta);

        // Apply rotation to movement direction
        movement.applyQuaternion(this.character.quaternion);
        this.character.position.add(movement);

        // Rotate character to face movement direction
        if (isMoving && this.velocity.length() > 0) {
            const targetQuaternion = new THREE.Quaternion();
            const targetDirection = this.velocity.clone().applyQuaternion(this.character.quaternion);
            const targetAngle = Math.atan2(targetDirection.x, targetDirection.z);
            targetQuaternion.setFromAxisAngle(new THREE.Vector3(0, 1, 0), targetAngle);

            this.character.quaternion.slerp(targetQuaternion, this.rotationSpeed * delta);
        }

        // Auto-switch between idle and walk animations if available
        if (this.animations.size > 0) {
            if (isMoving) {
                if (this.animations.has('walk') || this.animations.has('Walk')) {
                    const walkAnim = this.animations.get('walk') || this.animations.get('Walk');
                    if (this.currentAnimation !== walkAnim) {
                        this.playAnimation('walk');
                    }
                }
            } else {
                if (this.animations.has('idle') || this.animations.has('Idle')) {
                    const idleAnim = this.animations.get('idle') || this.animations.get('Idle');
                    if (this.currentAnimation !== idleAnim) {
                        this.playAnimation('idle');
                    }
                }
            }
        }
    }

    /**
     * Get the character's current position
     */
    public getPosition(): THREE.Vector3 {
        return this.character.position.clone();
    }

    /**
     * Set the character's position
     */
    public setPosition(position: THREE.Vector3): void {
        this.character.position.copy(position);
    }

    /**
     * Get the character object
     */
    public getCharacter(): THREE.Object3D {
        return this.character;
    }

    /**
     * Set movement speed
     */
    public setMoveSpeed(speed: number): void {
        this.moveSpeed = speed;
    }

    /**
     * Set rotation speed
     */
    public setRotationSpeed(speed: number): void {
        this.rotationSpeed = speed;
    }

    /**
     * Cleanup resources
     */
    public dispose(): void {
        window.removeEventListener('keydown', () => { });
        window.removeEventListener('keyup', () => { });
        if (this.mixer) {
            this.mixer.stopAllAction();
        }
    }
}
