/**
 * Tower Renderer - Handles 3D visualization and synchronization with engine
 */
class TowerRenderer {
    constructor() {
        this.scene = null;
        this.components = new Map();
        this.currentView = 'default';
        this.isAnimating = false;
        
        this.viewTransforms = {
            default: 'rotateX(-10deg) rotateY(15deg)',
            top: 'rotateX(-60deg) rotateY(0deg)',
            side: 'rotateX(0deg) rotateY(90deg)',
            front: 'rotateX(0deg) rotateY(0deg)'
        };
        
        this.init();
    }
    
    async init() {
        try {
            await this.waitForEngine();
            this.setupScene();
            this.bindEvents();
            this.setupComponents();
            
            console.log('🎨 Tower Renderer initialized');
            
        } catch (error) {
            console.error('❌ Failed to initialize Tower Renderer:', error);
        }
    }
    
    waitForEngine() {
        return new Promise((resolve, reject) => {
            if (window.probabilityEngine?.isInitialized) {
                resolve();
            } else {
                let attempts = 0;
                const checkInterval = setInterval(() => {
                    attempts++;
                    if (window.probabilityEngine?.isInitialized) {
                        clearInterval(checkInterval);
                        resolve();
                    } else if (attempts > 50) { // 5 seconds max wait
                        clearInterval(checkInterval);
                        reject(new Error('Probability Engine not available'));
                    }
                }, 100);
            }
        });
    }
    
    setupScene() {
        this.scene = document.getElementById('towerScene');
        if (!this.scene) {
            throw new Error('Tower scene element not found');
        }
        
        const container = this.scene.querySelector('.scene-container');
        if (container) {
            // Remove any existing movement animations
            container.style.animation = 'none';
            container.style.transform = this.viewTransforms.default;
        }
    }
    
    bindEvents() {
        // Engine events
        window.probabilityEngine.on('component:failed', (data) => {
            this.animateComponentFailure(data.component);
            this.updateWireConnections();
            this.updateLED();
        });
        
        window.probabilityEngine.on('component:restored', (data) => {
            this.animateComponentRestore(data.component);
            this.updateWireConnections();
            this.updateLED();
        });
        
        window.probabilityEngine.on('system:reset', () => {
            this.animateSystemReset();
            this.updateWireConnections();
            this.updateLED();
        });
        
        // View controls
        document.querySelectorAll('.view-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const view = e.target.closest('.view-btn').dataset.view;
                this.setView(view);
            });
        });
        
        // Window resize
        window.addEventListener('resize', this.debounce(() => {
            this.handleResize();
        }, 250));
    }
    
    setupComponents() {
        ['A', 'B', 'C', 'D'].forEach(component => {
            const element = document.getElementById(`stick${component}`);
            if (element) {
                this.components.set(component, {
                    element: element,
                    originalPosition: this.getElementPosition(element),
                    isAnimating: false
                });
            }
        });
        
        // Initial state sync
        this.updateAllComponents();
        this.updateWireConnections();
        this.updateLED();
    }
    
    // ===== COMPONENT ANIMATIONS =====
    
    animateComponentFailure(component) {
        const comp = this.components.get(component);
        if (!comp || comp.isAnimating) return;
        
        comp.isAnimating = true;
        const element = comp.element;
        
        // Failure animation sequence
        element.classList.add('failing');
        
        // Shake effect
        element.style.animation = 'componentShake 0.5s ease-in-out';
        
        setTimeout(() => {
            element.classList.remove('failing');
            element.classList.add('failed');
            element.style.animation = '';
            comp.isAnimating = false;
        }, 500);
        
        // Particle effect
        this.createFailureParticles(element);
    }
    
    animateComponentRestore(component) {
        const comp = this.components.get(component);
        if (!comp || comp.isAnimating) return;
        
        comp.isAnimating = true;
        const element = comp.element;
        
        // Restore animation sequence
        element.classList.add('restoring');
        element.classList.remove('failed');
        
        // Restore position
        element.style.animation = 'componentRestore 0.8s ease-out';
        
        setTimeout(() => {
            element.classList.remove('restoring');
            element.style.animation = '';
            comp.isAnimating = false;
        }, 800);
        
        // Success particle effect
        this.createSuccessParticles(element);
    }
    
    animateSystemReset() {
        this.isAnimating = true;
        
        // Reset all components
        this.components.forEach((comp, component) => {
            if (comp.element.classList.contains('failed')) {
                this.animateComponentRestore(component);
            }
        });
        
        // System-wide effect
        const scene = this.scene.querySelector('.scene-container');
        if (scene) {
            scene.style.animation = 'systemReset 1s ease-out';
            setTimeout(() => {
                scene.style.animation = '';
                this.isAnimating = false;
            }, 1000);
        }
        
        // Celebration particles
        this.createCelebrationParticles();
    }
    
    // ===== VISUAL UPDATES =====
    
    updateAllComponents() {
        ['A', 'B', 'C', 'D'].forEach(component => {
            this.updateComponent(component);
        });
    }
    
    updateComponent(component) {
        const comp = this.components.get(component);
        const engineState = window.probabilityEngine.getComponent(component);
        
        if (!comp || !engineState) return;
        
        const element = comp.element;
        
        if (engineState.working) {
            element.classList.remove('failed');
        } else {
            element.classList.add('failed');
        }
    }
    
    updateWireConnections() {
        const isSystemWorking = window.probabilityEngine.getSystemState().operational;
        
        // Update all wire connections
        document.querySelectorAll('.wire').forEach(wire => {
            if (isSystemWorking) {
                wire.classList.add('active');
                wire.classList.remove('failed');
            } else {
                wire.classList.remove('active');
                wire.classList.add('failed');
            }
        });
        
        // Update connection points
        document.querySelectorAll('.connection-point').forEach(point => {
            if (isSystemWorking) {
                point.classList.add('active');
            } else {
                point.classList.remove('active');
            }
        });
        
        // Update wire terminals
        document.querySelectorAll('.wire-terminal').forEach(terminal => {
            if (isSystemWorking) {
                terminal.style.boxShadow = '0 0 8px rgba(255, 215, 0, 0.8)';
            } else {
                terminal.style.boxShadow = '0 0 3px rgba(255, 215, 0, 0.3)';
            }
        });
    }
    
    updateLED() {
        const ledLens = document.getElementById('ledLens');
        const isSystemWorking = window.probabilityEngine.getSystemState().operational;
        
        if (ledLens) {
            if (isSystemWorking) {
                ledLens.classList.remove('off');
                ledLens.classList.add('on');
            } else {
                ledLens.classList.remove('on');
                ledLens.classList.add('off');
            }
        }
    }
    
    // ===== VIEW MANAGEMENT =====
    
    setView(view) {
        if (this.currentView === view || this.isAnimating) return;
        
        this.currentView = view;
        const container = this.scene.querySelector('.scene-container');
        
        if (container && this.viewTransforms[view]) {
            container.style.transition = 'transform 0.8s cubic-bezier(0.4, 0, 0.2, 1)';
            container.style.transform = this.viewTransforms[view];
            
            setTimeout(() => {
                container.style.transition = '';
            }, 800);
        }
        
        // Update view button states
        document.querySelectorAll('.view-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.view === view);
        });
        
        console.log(`🎯 View changed to: ${view}`);
    }
    
    // ===== PARTICLE EFFECTS =====
    
    createFailureParticles(element) {
        const rect = element.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        
        for (let i = 0; i < 10; i++) {
            this.createParticle(centerX, centerY, 'error');
        }
    }
    
    createSuccessParticles(element) {
        const rect = element.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        
        for (let i = 0; i < 8; i++) {
            this.createParticle(centerX, centerY, 'success');
        }
    }
    
    createCelebrationParticles() {
        const scene = this.scene.getBoundingClientRect();
        const centerX = scene.left + scene.width / 2;
        const centerY = scene.top + scene.height / 2;
        
        for (let i = 0; i < 20; i++) {
            setTimeout(() => {
                this.createParticle(centerX, centerY, 'success');
            }, i * 100);
        }
    }
    
    createParticle(x, y, type) {
        const particle = document.createElement('div');
        particle.className = `particle ${type}`;
        
        const size = Math.random() * 8 + 4;
        particle.style.width = size + 'px';
        particle.style.height = size + 'px';
        particle.style.left = x + 'px';
        particle.style.top = y + 'px';
        
        // Random direction
        const angle = Math.random() * Math.PI * 2;
        const velocity = Math.random() * 100 + 50;
        const deltaX = Math.cos(angle) * velocity;
        const deltaY = Math.sin(angle) * velocity - 30; // Slight upward bias
        
        particle.style.setProperty('--particle-x', deltaX + 'px');
        particle.style.setProperty('--particle-y', deltaY + 'px');
        
        document.body.appendChild(particle);
        
        // Remove after animation
        setTimeout(() => {
            particle.remove();
        }, 2000);
    }
    
    // ===== UTILITY METHODS =====
    
    getElementPosition(element) {
        const rect = element.getBoundingClientRect();
        return {
            x: rect.left,
            y: rect.top,
            width: rect.width,
            height: rect.height
        };
    }
    
    handleResize() {
        // Recalculate positions after resize
        this.components.forEach((comp, component) => {
            comp.originalPosition = this.getElementPosition(comp.element);
        });
    }
    
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
    
    // ===== PUBLIC API =====
    
    getComponent(component) {
        return this.components.get(component);
    }
    
    getCurrentView() {
        return this.currentView;
    }
    
    isSceneAnimating() {
        return this.isAnimating;
    }
}

// CSS animations for components (injected dynamically)
const componentAnimations = `
@keyframes componentShake {
    0%, 100% { transform: translate(-50%, -50%) rotate(0deg); }
    25% { transform: translate(-45%, -50%) rotate(-2deg); }
    75% { transform: translate(-55%, -50%) rotate(2deg); }
}

@keyframes componentRestore {
    0% {
        transform: translate(100px, 50px) rotate(25deg);
        opacity: 0.3;
        filter: grayscale(0.8);
    }
    50% {
        transform: translate(-40%, -40%) rotate(-5deg);
        opacity: 0.8;
        filter: grayscale(0.3);
    }
    100% {
        transform: translate(-50%, -50%) rotate(0deg);
        opacity: 1;
        filter: grayscale(0);
    }
}

@keyframes systemReset {
    0% { transform: rotateX(-10deg) rotateY(15deg) scale(1); }
    50% { transform: rotateX(-5deg) rotateY(25deg) scale(1.05); }
    100% { transform: rotateX(-10deg) rotateY(15deg) scale(1); }
}
`;

// Inject animations
const styleSheet = document.createElement('style');
styleSheet.textContent = componentAnimations;
document.head.appendChild(styleSheet);

// Initialize renderer
window.towerRenderer = new TowerRenderer();
