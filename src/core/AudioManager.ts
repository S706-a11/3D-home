import * as THREE from 'three';

export class AudioManager {
    private listener: THREE.AudioListener;
    private sound: THREE.Audio;
    private audioLoader: THREE.AudioLoader;
    private isMuted: boolean = true;
    private volume: number = 0.5;

    constructor(camera: THREE.Camera) {
        this.listener = new THREE.AudioListener();
        camera.add(this.listener);

        this.sound = new THREE.Audio(this.listener);
        this.audioLoader = new THREE.AudioLoader();
    }

    public load(path: string): void {
        this.audioLoader.load(path, (buffer) => {
            this.sound.setBuffer(buffer);
            this.sound.setLoop(true);
            this.sound.setVolume(this.volume);
            // Don't play automatically to respect browser policies
            // Wait for user interaction
        });
    }

    public toggleMute(): boolean {
        this.isMuted = !this.isMuted;

        if (this.isMuted) {
            this.sound.pause();
        } else {
            // Resume context if suspended (common in browsers)
            if (this.listener.context.state === 'suspended') {
                this.listener.context.resume();
            }
            // If not playing, play
            if (!this.sound.isPlaying) {
                this.sound.play();
            }
        }

        return this.isMuted;
    }

    public setVolume(volume: number): void {
        this.volume = volume;
        this.sound.setVolume(volume);
    }

    public getIsMuted(): boolean {
        return this.isMuted;
    }
}
