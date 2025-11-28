import * as THREE from 'three';

interface PhysicsObject {
    mesh: THREE.Object3D;
    velocity: THREE.Vector3;
    mass: number;
    radius: number; // Simplified collision shape (sphere)
    isStatic: boolean;
    isKinematic: boolean; // New flag for objects moved by code (Character)
    friction: number;
    restitution: number; // Bounciness
}

export class PhysicsSystem {
    private objects: PhysicsObject[] = [];
    private gravity: number = 9.8;

    constructor() { }

    /**
     * Add an object to the physics system
     */
    public addObject(mesh: THREE.Object3D, mass: number, radius: number, isStatic: boolean = false, isKinematic: boolean = false): void {
        this.objects.push({
            mesh,
            velocity: new THREE.Vector3(0, 0, 0),
            mass,
            radius,
            isStatic,
            isKinematic,
            friction: 0.98, // Air resistance / ground friction
            restitution: 0.7
        });
    }

    /**
     * Update physics simulation
     */
    public update(delta: number): void {
        for (let i = 0; i < this.objects.length; i++) {
            const obj = this.objects[i];

            // Skip integration for static and kinematic objects
            if (obj.isStatic || obj.isKinematic) continue;

            // Apply gravity (simple ground collision)
            // Assuming ground is at y=0
            if (obj.mesh.position.y > obj.radius) {
                obj.velocity.y -= this.gravity * delta;
            } else {
                // Ground collision
                if (obj.velocity.y < 0) {
                    obj.velocity.y = -obj.velocity.y * obj.restitution;

                    // Stop bouncing if velocity is low
                    if (Math.abs(obj.velocity.y) < 0.5) {
                        obj.velocity.y = 0;
                        obj.mesh.position.y = obj.radius;
                    }
                }
            }

            // Apply friction
            obj.velocity.x *= obj.friction;
            obj.velocity.z *= obj.friction;

            // Update position
            obj.mesh.position.add(obj.velocity.clone().multiplyScalar(delta));

            // Ground constraint
            if (obj.mesh.position.y < obj.radius) {
                obj.mesh.position.y = obj.radius;
            }
        }

        // Collision detection
        for (let i = 0; i < this.objects.length; i++) {
            for (let j = i + 1; j < this.objects.length; j++) {
                this.checkCollision(this.objects[i], this.objects[j]);
            }
        }
    }

    /**
     * Check and resolve collision between two objects
     */
    private checkCollision(obj1: PhysicsObject, obj2: PhysicsObject): void {
        const dist = obj1.mesh.position.distanceTo(obj2.mesh.position);
        const minDist = obj1.radius + obj2.radius;

        if (dist < minDist) {
            // Collision detected
            const collisionNormal = obj1.mesh.position.clone().sub(obj2.mesh.position).normalize();

            // Separate objects
            const overlap = minDist - dist;
            const separation = collisionNormal.clone().multiplyScalar(overlap / 2);

            if (!obj1.isStatic && !obj1.isKinematic) obj1.mesh.position.add(separation);
            if (!obj2.isStatic && !obj2.isKinematic) obj2.mesh.position.sub(separation);

            // Special case: Kinematic vs Static
            // If Kinematic hits Static, move Kinematic fully out
            if (obj1.isKinematic && obj2.isStatic) {
                obj1.mesh.position.add(collisionNormal.clone().multiplyScalar(overlap));
            }
            else if (obj2.isKinematic && obj1.isStatic) {
                obj2.mesh.position.sub(collisionNormal.clone().multiplyScalar(overlap));
            }

            // Impulse response

            // Case 1: Kinematic pushes Dynamic
            if (obj1.isKinematic && !obj2.isStatic && !obj2.isKinematic) {
                // Transfer kinematic velocity to dynamic object
                // Simple push: add kinematic velocity projected on normal
                // Only push if moving towards
                // Simplified: Just add a portion of the kinematic velocity to the dynamic object
                obj2.velocity.add(obj1.velocity.clone().multiplyScalar(0.8)); // 0.8 transfer rate

                // Also add a minimum "kick" to prevent sticking
                obj2.velocity.add(collisionNormal.clone().multiplyScalar(-2));
            }
            else if (obj2.isKinematic && !obj1.isStatic && !obj1.isKinematic) {
                // Obj2 (Kinematic) pushes Obj1 (Dynamic)
                obj1.velocity.add(obj2.velocity.clone().multiplyScalar(0.8));
                obj1.velocity.add(collisionNormal.clone().multiplyScalar(2));
            }
            // Case 2: Dynamic vs Dynamic (Elastic)
            else if (!obj1.isStatic && !obj1.isKinematic && !obj2.isStatic && !obj2.isKinematic) {
                const relativeVelocity = obj1.velocity.clone().sub(obj2.velocity);
                const velAlongNormal = relativeVelocity.dot(collisionNormal);

                if (velAlongNormal > 0) return; // Moving apart

                const j = -(1 + 0.5) * velAlongNormal; // 0.5 restitution
                const impulse = collisionNormal.clone().multiplyScalar(j);

                obj1.velocity.add(impulse.clone().divideScalar(obj1.mass));
                obj2.velocity.sub(impulse.clone().divideScalar(obj2.mass));
            }
        }
    }

    /**
     * Get object by mesh
     */
    public getObject(mesh: THREE.Object3D): PhysicsObject | undefined {
        return this.objects.find(o => o.mesh === mesh);
    }
}
