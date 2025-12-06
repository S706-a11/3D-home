import * as THREE from 'three';

/**
 * Mobile touch controls with virtual joystick
 * Provides on-screen touch controls for mobile devices
 */
export class MobileControls {
    private canvas: HTMLCanvasElement;
    private joystickBase: HTMLDivElement;
    private joystickStick: HTMLDivElement;
    private jumpButton: HTMLDivElement;
    private runButton: HTMLDivElement;

    private touchId: number | null = null;
    private joystickActive: boolean = false;
    private joystickCenter: { x: number; y: number } = { x: 0, y: 0 };
    private joystickRadius: number = 50;

    public direction: THREE.Vector2 = new THREE.Vector2(0, 0);
    public isJumping: boolean = false;
    public isRunning: boolean = false;

    private boundTouchStart: (e: TouchEvent) => void;
    private boundTouchMove: (e: TouchEvent) => void;
    private boundTouchEnd: (e: TouchEvent) => void;

    constructor() {
        this.canvas = document.querySelector('canvas')!;

        // Create joystick UI
        this.joystickBase = this.createJoystickBase();
        this.joystickStick = this.createJoystickStick();
        this.jumpButton = this.createJumpButton();
        this.runButton = this.createRunButton();

        // Add to DOM
        document.body.appendChild(this.joystickBase);
        document.body.appendChild(this.joystickStick);
        document.body.appendChild(this.jumpButton);
        document.body.appendChild(this.runButton);

        // Bind touch events
        this.boundTouchStart = this.handleTouchStart.bind(this);
        this.boundTouchMove = this.handleTouchMove.bind(this);
        this.boundTouchEnd = this.handleTouchEnd.bind(this);

        this.setupTouchControls();
        this.hideControlsOnDesktop();
    }

    /**
     * Create joystick base (outer circle)
     */
    private createJoystickBase(): HTMLDivElement {
        const base = document.createElement('div');
        base.style.position = 'fixed';
        base.style.bottom = '80px';
        base.style.left = '80px';
        base.style.width = '100px';
        base.style.height = '100px';
        base.style.borderRadius = '50%';
        base.style.backgroundColor = 'rgba(255, 255, 255, 0.3)';
        base.style.border = '2px solid rgba(255, 255, 255, 0.5)';
        base.style.touchAction = 'none';
        base.style.pointerEvents = 'none';
        base.style.zIndex = '9999';
        base.id = 'joystick-base';
        return base;
    }

    /**
     * Create joystick stick (inner circle)
     */
    private createJoystickStick(): HTMLDivElement {
        const stick = document.createElement('div');
        stick.style.position = 'fixed';
        stick.style.bottom = '105px';
        stick.style.left = '105px';
        stick.style.width = '50px';
        stick.style.height = '50px';
        stick.style.borderRadius = '50%';
        stick.style.backgroundColor = 'rgba(255, 255, 255, 0.8)';
        stick.style.border = '2px solid rgba(255, 255, 255, 1)';
        stick.style.touchAction = 'none';
        stick.style.pointerEvents = 'none';
        stick.style.zIndex = '10000';
        stick.id = 'joystick-stick';
        return stick;
    }

    /**
     * Create jump button
     */
    private createJumpButton(): HTMLDivElement {
        const button = document.createElement('div');
        button.innerHTML = '↑';
        button.style.position = 'fixed';
        button.style.bottom = '140px';
        button.style.right = '80px';
        button.style.width = '60px';
        button.style.height = '60px';
        button.style.borderRadius = '50%';
        button.style.backgroundColor = 'rgba(255, 255, 255, 0.3)';
        button.style.border = '2px solid rgba(255, 255, 255, 0.5)';
        button.style.display = 'flex';
        button.style.alignItems = 'center';
        button.style.justifyContent = 'center';
        button.style.fontSize = '24px';
        button.style.color = 'white';
        button.style.touchAction = 'none';
        button.style.zIndex = '9999';
        button.id = 'jump-button';
        return button;
    }

    /**
     * Create run button
     */
    private createRunButton(): HTMLDivElement {
        const button = document.createElement('div');
        button.innerHTML = '⚡';
        button.style.position = 'fixed';
        button.style.bottom = '80px';
        button.style.right = '80px';
        button.style.width = '60px';
        button.style.height = '60px';
        button.style.borderRadius = '50%';
        button.style.backgroundColor = 'rgba(255, 255, 255, 0.3)';
        button.style.border = '2px solid rgba(255, 255, 255, 0.5)';
        button.style.display = 'flex';
        button.style.alignItems = 'center';
        button.style.justifyContent = 'center';
        button.style.fontSize = '24px';
        button.style.touchAction = 'none';
        button.style.zIndex = '9999';
        button.id = 'run-button';
        return button;
    }

    /**
     * Setup touch event listeners
     */
    private setupTouchControls(): void {
        // Prevent default scrolling on the canvas
        this.canvas.addEventListener('touchstart', (e) => e.preventDefault(), { passive: false });
        this.canvas.addEventListener('touchmove', (e) => e.preventDefault(), { passive: false });

        window.addEventListener('touchstart', this.boundTouchStart, { passive: false });
        window.addEventListener('touchmove', this.boundTouchMove, { passive: false });
        window.addEventListener('touchend', this.boundTouchEnd, { passive: false });
        window.addEventListener('touchcancel', this.boundTouchEnd, { passive: false });
    }

    /**
     * Handle touch start
     */
    private handleTouchStart(e: TouchEvent): void {
        e.preventDefault();

        for (let i = 0; i < e.changedTouches.length; i++) {
            const touch = e.changedTouches[i];
            const target = touch.target as HTMLElement;

            // Jump button
            if (target.id === 'jump-button') {
                this.isJumping = true;
                target.style.backgroundColor = 'rgba(255, 255, 255, 0.6)';
                continue;
            }

            // Run button
            if (target.id === 'run-button') {
                this.isRunning = true;
                target.style.backgroundColor = 'rgba(255, 255, 255, 0.6)';
                continue;
            }

            // Joystick area (left side of screen)
            if (touch.clientX < window.innerWidth / 2 && this.touchId === null) {
                this.touchId = touch.identifier;
                this.joystickActive = true;

                // Position joystick at touch point
                this.joystickCenter.x = touch.clientX;
                this.joystickCenter.y = touch.clientY;

                this.joystickBase.style.left = `${this.joystickCenter.x - 50}px`;
                this.joystickBase.style.bottom = `${window.innerHeight - this.joystickCenter.y - 50}px`;
                this.joystickStick.style.left = `${this.joystickCenter.x - 25}px`;
                this.joystickStick.style.bottom = `${window.innerHeight - this.joystickCenter.y - 25}px`;

                this.joystickBase.style.opacity = '1';
                this.joystickStick.style.opacity = '1';
            }
        }
    }

    /**
     * Handle touch move
     */
    private handleTouchMove(e: TouchEvent): void {
        if (!this.joystickActive || this.touchId === null) return;

        for (let i = 0; i < e.changedTouches.length; i++) {
            const touch = e.changedTouches[i];

            if (touch.identifier === this.touchId) {
                // Calculate joystick direction
                const dx = touch.clientX - this.joystickCenter.x;
                const dy = touch.clientY - this.joystickCenter.y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                // Limit stick movement to joystick radius
                const angle = Math.atan2(dy, dx);
                const limitedDistance = Math.min(distance, this.joystickRadius);

                // Update direction (normalized)
                this.direction.x = (limitedDistance / this.joystickRadius) * Math.cos(angle);
                this.direction.y = (limitedDistance / this.joystickRadius) * Math.sin(angle);

                // Update stick position
                const stickX = this.joystickCenter.x + limitedDistance * Math.cos(angle);
                const stickY = this.joystickCenter.y + limitedDistance * Math.sin(angle);

                this.joystickStick.style.left = `${stickX - 25}px`;
                this.joystickStick.style.bottom = `${window.innerHeight - stickY - 25}px`;

                break;
            }
        }
    }

    /**
     * Handle touch end
     */
    private handleTouchEnd(e: TouchEvent): void {
        for (let i = 0; i < e.changedTouches.length; i++) {
            const touch = e.changedTouches[i];
            const target = touch.target as HTMLElement;

            // Jump button
            if (target?.id === 'jump-button') {
                this.isJumping = false;
                target.style.backgroundColor = 'rgba(255, 255, 255, 0.3)';
                continue;
            }

            // Run button
            if (target?.id === 'run-button') {
                this.isRunning = false;
                target.style.backgroundColor = 'rgba(255, 255, 255, 0.3)';
                continue;
            }

            // Joystick release
            if (touch.identifier === this.touchId) {
                this.touchId = null;
                this.joystickActive = false;
                this.direction.set(0, 0);

                // Reset stick position
                this.joystickStick.style.left = `${this.joystickCenter.x - 25}px`;
                this.joystickStick.style.bottom = `${window.innerHeight - this.joystickCenter.y - 25}px`;

                // Fade out joystick
                this.joystickBase.style.opacity = '0.5';
                this.joystickStick.style.opacity = '0.5';
            }
        }
    }

    /**
     * Hide controls on desktop (auto-detect)
     * Uses pointer: coarse to detect touch devices (works for phones, tablets, iPad)
     */
    private hideControlsOnDesktop(): void {
        // Use pointer: coarse to detect touch-primary devices (more reliable than user agent)
        const isTouchDevice = window.matchMedia('(pointer: coarse)').matches;
        // Also check screen width as fallback
        const isSmallScreen = window.innerWidth <= 1024;
        // Check for touch support
        const hasTouchSupport = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

        const isMobile = isTouchDevice || (isSmallScreen && hasTouchSupport);

        if (!isMobile) {
            this.joystickBase.style.display = 'none';
            this.joystickStick.style.display = 'none';
            this.jumpButton.style.display = 'none';
            this.runButton.style.display = 'none';
        } else {
            // Ensure controls are visible on mobile
            this.joystickBase.style.display = 'block';
            this.joystickStick.style.display = 'block';
            this.jumpButton.style.display = 'flex';
            this.runButton.style.display = 'flex';
        }
    }

    /**
     * Get movement direction in world space
     * @param camera Camera to calculate relative movement
     */
    public getMovementDirection(camera: THREE.Camera): THREE.Vector3 {
        const forward = new THREE.Vector3();
        camera.getWorldDirection(forward);
        forward.y = 0;
        forward.normalize();

        const right = new THREE.Vector3();
        right.crossVectors(forward, new THREE.Vector3(0, 1, 0));
        right.normalize();

        const movement = new THREE.Vector3();
        movement.add(forward.multiplyScalar(-this.direction.y)); // Invert Y for forward/back
        movement.add(right.multiplyScalar(this.direction.x));

        return movement;
    }

    /**
     * Check if joystick is being used
     */
    public isMoving(): boolean {
        return this.direction.length() > 0.1;
    }

    /**
     * Consume jump input (for single-jump mechanics)
     */
    public consumeJump(): boolean {
        if (this.isJumping) {
            this.isJumping = false;
            return true;
        }
        return false;
    }

    /**
     * Cleanup resources
     */
    public dispose(): void {
        window.removeEventListener('touchstart', this.boundTouchStart);
        window.removeEventListener('touchmove', this.boundTouchMove);
        window.removeEventListener('touchend', this.boundTouchEnd);
        window.removeEventListener('touchcancel', this.boundTouchEnd);

        this.joystickBase.remove();
        this.joystickStick.remove();
        this.jumpButton.remove();
        this.runButton.remove();
    }
}
