import * as THREE from 'three';

/**
 * Character controller for handling player/character movement
 * Supports keyboard input, smooth movement, and animation integration
 */
export class CharacterController {
    private character: THREE.Object3D;
    private camera: THREE.Camera;
    private velocity: THREE.Vector3;
    private moveSpeed: number;
    private runSpeed: number;
    private rotationSpeed: number;
    private keys: { [key: string]: boolean } = {};
    private mixer?: THREE.AnimationMixer;
    private animations: Map<string, THREE.AnimationAction> = new Map();
    private currentAnimation?: THREE.AnimationAction;
    private boundKeyDown: (e: KeyboardEvent) => void;
    private boundKeyUp: (e: KeyboardEvent) => void;

    constructor(
        character: THREE.Object3D,
        camera: THREE.Camera,
        moveSpeed: number = 5,
        rotationSpeed: number = 3
    ) {
        this.character = character;
        this.camera = camera;
        this.velocity = new THREE.Vector3();
        this.moveSpeed = moveSpeed;
        this.runSpeed = moveSpeed * 2; // Run 2x faster
        this.rotationSpeed = rotationSpeed;

        // Bind methods to preserve 'this' context and allow removal
        this.boundKeyDown = this.handleKeyDown.bind(this);
        this.boundKeyUp = this.handleKeyUp.bind(this);

        this.setupKeyboardControls();
    }

    /**
     * Setup keyboard event listeners
     */
    private setupKeyboardControls(): void {
        window.addEventListener('keydown', this.boundKeyDown);
        window.addEventListener('keyup', this.boundKeyUp);
    }

    private handleKeyDown(e: KeyboardEvent): void {
        this.keys[e.key.toLowerCase()] = true;

        // Prevent default scrolling for arrow keys and space
        if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
            e.preventDefault();
        }
    }

    private handleKeyUp(e: KeyboardEvent): void {
        this.keys[e.key.toLowerCase()] = false;
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
        let isRunning = this.keys['shift'];

        // Get camera forward and right vectors projected to XZ plane
        const forward = new THREE.Vector3();
        this.camera.getWorldDirection(forward);
        forward.y = 0;
        forward.normalize();

        const right = new THREE.Vector3();
        right.crossVectors(forward, new THREE.Vector3(0, 1, 0));
        right.normalize();

        // Forward/Backward movement
        if (this.keys['w'] || this.keys['arrowup']) {
            this.velocity.add(forward);
            isMoving = true;
        }
        if (this.keys['s'] || this.keys['arrowdown']) {
            this.velocity.sub(forward);
            isMoving = true;
        }

        // Left/Right movement (strafing)
        if (this.keys['a'] || this.keys['arrowleft']) {
            this.velocity.sub(right);
            isMoving = true;
        }
        if (this.keys['d'] || this.keys['arrowright']) {
            this.velocity.add(right);
            isMoving = true;
        }

        // Normalize velocity for consistent diagonal movement
        if (this.velocity.length() > 0) {
            this.velocity.normalize();
        }

        // Apply movement
        const currentSpeed = isRunning ? this.runSpeed : this.moveSpeed;
        const movement = this.velocity.clone().multiplyScalar(currentSpeed * delta);

        // Apply movement (world-relative)
        this.character.position.add(movement);

        // Rotate character to face movement direction
        if (isMoving && this.velocity.length() > 0) {
            const targetQuaternion = new THREE.Quaternion();
            // Velocity is now world-relative, so we use it directly for rotation target
            const targetDirection = this.velocity.clone();
            const targetAngle = Math.atan2(targetDirection.x, targetDirection.z);
            targetQuaternion.setFromAxisAngle(new THREE.Vector3(0, 1, 0), targetAngle);

            this.character.quaternion.slerp(targetQuaternion, this.rotationSpeed * delta);
        }

        // Auto-switch between idle, walk, and run animations if available
        if (this.animations.size > 0) {
            if (isMoving) {
                const animName = isRunning ? 'run' : 'walk';
                // Fallback to walk if run doesn't exist
                const targetAnimName = (isRunning && !this.animations.has('run') && !this.animations.has('Run')) ? 'walk' : animName;

                // Try to find animation with various casing
                let targetAnim = this.animations.get(targetAnimName) ||
                    this.animations.get(targetAnimName.charAt(0).toUpperCase() + targetAnimName.slice(1));

                if (targetAnim && this.currentAnimation !== targetAnim) {
                    this.playAnimation(targetAnimName);
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
        this.runSpeed = speed * 2;
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
        window.removeEventListener('keydown', this.boundKeyDown);
        window.removeEventListener('keyup', this.boundKeyUp);
        if (this.mixer) {
            this.mixer.stopAllAction();
        }
    }
}
