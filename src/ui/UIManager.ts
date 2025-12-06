export class UIManager {
    private app: HTMLElement;
    private onAvatarSelect?: (filename: string) => void;
    private onMuteToggle?: () => boolean;
    private onVolumeChange?: (volume: number) => void;
    private onResetCamera?: () => void;

    constructor(app: HTMLElement) {
        this.app = app;
    }

    public setCallbacks(callbacks: {
        onAvatarSelect?: (filename: string) => void;
        onMuteToggle?: () => boolean;
        onVolumeChange?: (volume: number) => void;
        onResetCamera?: () => void;
    }): void {
        this.onAvatarSelect = callbacks.onAvatarSelect;
        this.onMuteToggle = callbacks.onMuteToggle;
        this.onVolumeChange = callbacks.onVolumeChange;
        this.onResetCamera = callbacks.onResetCamera;
    }

    public injectHTML(): void {
        this.app.innerHTML = `
  <div id="canvas-container"></div>
  <div id="controls-info">
    <h2>Controls</h2>
    
    <div class="control-row">
      <div class="key-group">
        <div class="key-cap" data-key="w">W</div>
        <div class="key-cap" data-key="a">A</div>
        <div class="key-cap" data-key="s">S</div>
        <div class="key-cap" data-key="d">D</div>
      </div>
      <span class="control-desc">Move</span>
    </div>

    <div class="control-row">
      <div class="key-cap wide" data-key="shift">Shift</div>
      <span class="control-desc">Sprint</span>
    </div>

    <div class="control-row">
      <svg class="icon-control" data-action="rotate" viewBox="0 0 24 24">
        <path d="M13,1.07V9H7C6.45,9 6,9.45 6,10V21H13V1.07M15,1.07V21H18C19.1,21 20,20.1 20,19V5C20,3.9 19.1,3 18,3H15M13,23H8C6.9,23 6,22.1 6,21V10C6,9.45 6.45,9 7,9H13V23Z" />
      </svg>
      <span class="control-desc">Rotate Camera</span>
    </div>

    <div class="control-row">
      <svg class="icon-control" data-action="zoom" viewBox="0 0 24 24">
        <path d="M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M12,4C13.11,4 14,4.89 14,6V10H10V6C10,4.89 10.89,4 12,4M12,20C9.79,20 8,18.21 8,16V12H16V16C16,18.21 14.21,20 12,20Z" />
      </svg>
      <span class="control-desc">Zoom</span>
    </div>

    <button id="reset-camera">Reset Camera</button>
  </div>
  
  <div id="audio-controls">
    <button id="mute-btn" title="Toggle Sound">🔇</button>
    <input type="range" id="volume-slider" min="0" max="1" step="0.01" value="0.5" title="Volume">
  </div>
  
  <div id="avatar-container">
    <button id="avatar-icon-btn" title="Choose Avatar">👤</button>
    <div id="avatar-dropdown">
      <div class="avatar-category">Male</div>
      <button class="avatar-option" data-model="character-male-a.glb">Male A</button>
      <button class="avatar-option" data-model="character-male-b.glb">Male B</button>
      <button class="avatar-option" data-model="character-male-c.glb">Male C</button>
      <button class="avatar-option" data-model="character-male-d.glb">Male D</button>
      <button class="avatar-option" data-model="character-male-e.glb">Male E</button>
      <button class="avatar-option" data-model="character-male-f.glb">Male F</button>
      
      <div class="avatar-category">Female</div>
      <button class="avatar-option" data-model="character-female-a.glb">Female A</button>
      <button class="avatar-option" data-model="character-female-b.glb">Female B</button>
      <button class="avatar-option" data-model="character-female-c.glb">Female C</button>
      <button class="avatar-option" data-model="character-female-d.glb">Female D</button>
      <button class="avatar-option" data-model="character-female-e.glb">Female E</button>
      <button class="avatar-option" data-model="character-female-f.glb">Female F</button>
      
      <div class="avatar-category">Other</div>
      <button class="avatar-option" data-model="wheelchair.glb">Wheelchair</button>
      <button class="avatar-option" data-model="wheelchair-power-deluxe.glb">Wheelchair Power Deluxe</button>
      <button class="avatar-option" data-model="wheelchair-power.glb">Wheelchair Power</button>
      <button class="avatar-option" data-model="wheelchair-deluxe.glb">Wheelchair Deluxe</button>
    </div>
  </div>

  <div id="loading" class="loading">
    <div class="loading-spinner"></div>
    <p>Loading Three.js Scene...</p>
  </div>
  
  <div id="interaction-hint"><span class="hint-text">Click to View</span></div>

  <!-- Project Modal -->
  <div id="project-modal">
    <div class="modal-content">
      <div class="modal-header">
        <h2 id="project-title">Project Title</h2>
        <button id="close-modal" class="close-btn">&times;</button>
      </div>
      <div class="modal-body">
        <img id="project-image" src="" alt="Project Image">
        <p id="project-desc">Project description goes here.</p>
      </div>
      <div class="modal-footer">
        <a id="project-link" href="#" target="_blank" class="project-link-btn">View Project</a>
      </div>
    </div>
  </div>
`;

        // Create credits element dynamically to ensure visibility
        const credits = document.createElement('div');
        credits.id = 'credits';
        credits.innerHTML = 'Made by <a href="https://github.com/S706-a11" target="_blank">@Got</a> • Assets by <a href="https://kenney.nl" target="_blank">Kenney</a> • Skybox by <a href="https://polyhaven.com" target="_blank">Poly Haven</a>';
        document.body.appendChild(credits);

        this.setupEventListeners();
    }

    private setupEventListeners(): void {
        // Audio Controls
        const muteBtn = document.querySelector<HTMLButtonElement>('#mute-btn');
        const volumeSlider = document.querySelector<HTMLInputElement>('#volume-slider');

        if (muteBtn) {
            muteBtn.addEventListener('click', () => {
                if (this.onMuteToggle) {
                    const isMuted = this.onMuteToggle();
                    muteBtn.textContent = isMuted ? '🔇' : '🔊';
                }
            });
        }

        if (volumeSlider) {
            volumeSlider.addEventListener('input', (e) => {
                const volume = parseFloat((e.target as HTMLInputElement).value);
                if (this.onVolumeChange) {
                    this.onVolumeChange(volume);
                }
            });
        }

        // Reset Camera
        const resetBtn = document.querySelector<HTMLButtonElement>('#reset-camera');
        if (resetBtn) {
            resetBtn.addEventListener('click', () => {
                if (this.onResetCamera) {
                    this.onResetCamera();
                }
                resetBtn.blur();
            });
        }

        // Avatar Selection
        const avatarBtn = document.querySelector<HTMLButtonElement>('#avatar-icon-btn');
        const avatarDropdown = document.querySelector<HTMLDivElement>('#avatar-dropdown');

        if (avatarBtn && avatarDropdown) {
            avatarBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                avatarDropdown.classList.toggle('active');
            });

            window.addEventListener('click', () => {
                avatarDropdown.classList.remove('active');
            });
        }

        document.querySelectorAll('.avatar-option').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const filename = (e.target as HTMLElement).dataset.model;
                if (filename && this.onAvatarSelect) {
                    this.onAvatarSelect(filename);
                    if (avatarDropdown) avatarDropdown.classList.remove('active');
                }
            });
        });

        // Modal Close Logic
        const modal = document.getElementById('project-modal');
        const closeBtn = document.querySelector('.close-btn');
        const projectLink = document.getElementById('project-link');

        const closeModal = () => {
            if (modal) {
                modal.classList.remove('active');
                setTimeout(() => {
                    modal.style.display = 'none';
                }, 300);
            }
        };

        if (modal && closeBtn) {
            // Close button - click and touch
            closeBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                closeModal();
            });

            closeBtn.addEventListener('touchend', (e) => {
                e.preventDefault();
                e.stopPropagation();
                closeModal();
            });

            // Click on backdrop to close
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    closeModal();
                }
            });

            // Touch on backdrop to close
            modal.addEventListener('touchend', (e) => {
                if (e.target === modal) {
                    e.preventDefault();
                    closeModal();
                }
            });
        }

        // Make project link work on mobile
        if (projectLink) {
            projectLink.addEventListener('touchend', (e) => {
                e.stopPropagation();
                // Let the default link behavior work
                const href = projectLink.getAttribute('href');
                if (href && href !== '#') {
                    window.open(href, '_blank');
                }
            });
        }

        // Input Highlighting
        this.setupInputHighlighting();
    }

    private setupInputHighlighting(): void {
        window.addEventListener('keydown', (e) => {
            const key = e.key.toLowerCase();
            const el = document.querySelector(`.key-cap[data-key="${key}"]`);
            if (el) el.classList.add('active');
        });

        window.addEventListener('keyup', (e) => {
            const key = e.key.toLowerCase();
            const el = document.querySelector(`.key-cap[data-key="${key}"]`);
            if (el) el.classList.remove('active');
        });

        window.addEventListener('mousedown', () => {
            const el = document.querySelector('.icon-control[data-action="rotate"]');
            if (el) el.classList.add('active');
        });

        window.addEventListener('mouseup', () => {
            const el = document.querySelector('.icon-control[data-action="rotate"]');
            if (el) el.classList.remove('active');
        });

        window.addEventListener('wheel', () => {
            const el = document.querySelector('.icon-control[data-action="zoom"]');
            if (el) {
                el.classList.add('active');
                setTimeout(() => el.classList.remove('active'), 200);
            }
        });
    }

    public showLoading(): void {
        const loadingElement = document.querySelector<HTMLDivElement>('#loading');
        if (loadingElement) {
            loadingElement.style.display = 'flex';
            loadingElement.style.opacity = '1';
        }
    }

    public hideLoading(): void {
        const loadingElement = document.querySelector<HTMLDivElement>('#loading');
        if (loadingElement) {
            loadingElement.style.opacity = '0';
            setTimeout(() => {
                loadingElement.style.display = 'none';
            }, 500);
        }
    }
}
