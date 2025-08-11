class ProbabilityTower {
    constructor() {
        // Wait for DOM to be fully loaded
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                this.init();
            });
        } else {
            this.init();
        }
    }
    
    init() {
        this.components = {
            A: { probability: 1, working: true },
            B: { probability: 1, working: true },
            C: { probability: 1, working: true },
            D: { probability: 1, working: true }
        };
        
        this.isInitialized = false;
        
        // Wait for all other systems to be ready
        setTimeout(() => {
            this.initializeEventListeners();
            this.setupInitialState();
            this.isInitialized = true;
            
            // Show welcome message
            if (window.visualEffects) {
                window.visualEffects.showNotification(
                    'Welcome to the Probability Tower! Try dragging components or using the control buttons.',
                    'info',
                    5000
                );
            }
        }, 100);
    }
    
    initializeEventListeners() {
        try {
            // System control buttons
            this.bindSystemControls();
            
            // Component controls
            this.bindComponentControls();
            
            // View controls
            this.bindViewControls();
            
            // Keyboard shortcuts
            this.bindKeyboardShortcuts();
            
            // Window events
            this.bindWindowEvents();
            
        } catch (error) {
            console.error('Error initializing event listeners:', error);
            // Fallback initialization
            setTimeout(() => {
                this.initializeEventListeners();
            }, 500);
        }
    }
    
    bindSystemControls() {
        const resetBtn = document.getElementById('resetSystem');
        const randomBtn = document.getElementById('randomFail');
        
        if (resetBtn) {
            resetBtn.addEventListener('click', () => {
                this.resetAllComponents();
            });
        } else {
            console.warn('Reset button not found');
        }
        
        if (randomBtn) {
            randomBtn.addEventListener('click', () => {
                this.triggerRandomFailure();
            });
        } else {
            console.warn('Random fail button not found');
        }
    }
    
    bindComponentControls() {
        // Fail buttons
        document.querySelectorAll('.fail-btn').forEach(btn => {
            const component = btn.dataset.component;
            if (component) {
                btn.addEventListener('click', (e) => {
                    e.preventDefault();
                    this.failComponent(component);
                });
            }
        });
        
        // Restore buttons
        document.querySelectorAll('.restore-btn').forEach(btn => {
            const component = btn.dataset.component;
            if (component) {
                btn.addEventListener('click', (e) => {
                    e.preventDefault();
                    this.restoreComponent(component);
                });
            }
        });
    }
    
    bindViewControls() {
        const viewControls = {
            'resetView': 'default',
            'topView': 'top',
            'sideView': 'side',
            'frontView': 'front'
        };
        
        Object.entries(viewControls).forEach(([buttonId, view]) => {
            const button = document.getElementById(buttonId);
            if (button) {
                button.addEventListener('click', () => {
                    this.setTowerView(view);
                });
            }
        });
    }
    
    bindKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Only handle shortcuts if not typing in input
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
                return;
            }
            
            switch(e.key.toLowerCase()) {
                case 'r':
                    if (e.ctrlKey || e.metaKey) {
                        e.preventDefault();
                        this.resetAllComponents();
                    }
                    break;
                case 'f':
                    if (e.ctrlKey || e.metaKey) {
                        e.preventDefault();
                        this.triggerRandomFailure();
                    }
                    break;
                case '1':
                case '2':
                case '3':
                case '4':
                    const componentMap = { '1': 'A', '2': 'B', '3': 'C', '4': 'D' };
                    const component = componentMap[e.key];
                    if (component) {
                        if (this.components[component].working) {
                            this.failComponent(component);
                        } else {
                            this.restoreComponent(component);
                        }
                    }
                    break;
                case 'escape':
                    if (window.visualEffects) {
                        window.visualEffects.hideModal();
                    }
                    break;
            }
        });
    }
    
    bindWindowEvents() {
        // Handle window resize
        window.addEventListener('resize', this.debounce(() => {
            this.handleResize();
        }, 250));
        
        // Handle visibility change
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.pauseAnimations();
            } else {
                this.resumeAnimations();
            }
        });
    }
    
    setupInitialState() {
        this.updateAllDisplays();
        this.setTowerView('default');
        
        // Add helpful tooltips
        this.addTooltips();
        
        // Start system monitoring
        this.startMonitoring();
    }
    
    addTooltips() {
        const tooltips = {
            'columnA': 'Component A - Drag to remove or click Fail button',
            'columnB': 'Component B - Drag to remove or click Fail button', 
            'columnC': 'Component C - Drag to remove or click Fail button',
            'columnD': 'Component D - Drag to remove or click Fail button',
            'systemLED': 'System Status LED - ON = System Working, OFF = System Failed',
            'systemBattery': '3V Coin Cell Battery - Powers the entire system',
            'resetSystem': 'Reset all components to working state (Ctrl+R)',
            'randomFail': 'Trigger a random component failure (Ctrl+F)'
        };
        
        Object.entries(tooltips).forEach(([id, tooltip]) => {
            const element = document.getElementById(id);
            if (element) {
                element.title = tooltip;
            }
        });
    }
    
    failComponent(component) {
        if (!this.components[component] || !this.components[component].working) {
            return;
        }
        
        this.components[component].probability = 0;
        this.components[component].working = false;
        
        // Visual updates
        this.updateComponentDisplay(component);
        this.updateSystemDisplay();
        
        // Notify other systems
        if (window.probabilityEngine) {
            // Let the engine handle its own logic
        } else if (window.visualEffects) {
            window.visualEffects.showNotification(
                `Component ${component} failed! System probability is now ${this.calculateSystemProbability().toFixed(2)}`,
                'error'
            );
        }
        
        // Visual effects
        this.triggerFailureEffects(component);
    }
    
    restoreComponent(component) {
        if (!this.components[component] || this.components[component].working) {
            return;
        }
        
        this.components[component].probability = 1;
        this.components[component].working = true;
        
        // Visual updates
        this.updateComponentDisplay(component);
        this.updateSystemDisplay();
        
        // Notify other systems
        if (window.visualEffects) {
            window.visualEffects.showNotification(
                `Component ${component} restored! System probability is now ${this.calculateSystemProbability().toFixed(2)}`,
                'success'
            );
        }
        
        // Visual effects
        this.triggerRestoreEffects(component);
    }
    
    resetAllComponents() {
        Object.keys(this.components).forEach(component => {
            this.components[component].probability = 1;
            this.components[component].working = true;
            this.updateComponentDisplay(component);
        });
        
        this.updateSystemDisplay();
        
        if (window.visualEffects) {
            window.visualEffects.showNotification('All components restored! System is fully operational.', 'success');
            window.visualEffects.createConfetti();
        }
    }
    
    triggerRandomFailure() {
        const workingComponents = Object.keys(this.components).filter(
            key => this.components[key].working
        );
        
        if (workingComponents.length === 0) {
            if (window.visualEffects) {
                window.visualEffects.showNotification('No working components to fail!', 'info');
            }
            return;
        }
        
        const randomComponent = workingComponents[Math.floor(Math.random() * workingComponents.length)];
        this.failComponent(randomComponent);
        
        if (window.visualEffects) {
            window.visualEffects.showNotification(`Random failure in Component ${randomComponent}!`, 'warning');
        }
    }
    
    updateComponentDisplay(component) {
        const probElement = document.getElementById(`prob${component}`);
        const barElement = document.getElementById(`bar${component}`);
        const controlElement = document.querySelector(`[data-component="${component}"].component-control`);
        const failBtn = document.querySelector(`[data-component="${component}"].fail-btn`);
        const restoreBtn = document.querySelector(`[data-component="${component}"].restore-btn`);
        
        if (probElement) {
            probElement.textContent = this.components[component].probability.toFixed(2);
            probElement.classList.toggle('failed', !this.components[component].working);
        }
        
        if (barElement) {
            const percentage = this.components[component].probability * 100;
            barElement.style.width = percentage + '%';
            barElement.classList.toggle('failed', !this.components[component].working);
        }
        
        if (controlElement) {
            controlElement.classList.toggle('failed', !this.components[component].working);
        }
        
        // Toggle button visibility
        if (failBtn && restoreBtn) {
            if (this.components[component].working) {
                failBtn.style.display = 'flex';
                restoreBtn.style.display = 'none';
            } else {
                failBtn.style.display = 'none';
                restoreBtn.style.display = 'flex';
            }
        }
    }
    
    updateSystemDisplay() {
        const systemProb = this.calculateSystemProbability();
        const systemProbElement = document.getElementById('systemProb');
        const equationElement = document.getElementById('equation');
        const statusLight = document.getElementById('statusLight');
        const statusText = document.getElementById('statusText');
        
        if (systemProbElement) {
            systemProbElement.textContent = systemProb.toFixed(2);
            systemProbElement.classList.toggle('failed', systemProb === 0);
        }
        
        if (equationElement) {
            const probValues = Object.keys(this.components).map(
                key => this.components[key].probability.toFixed(2)
            );
            equationElement.textContent = 
                `P(System) = ${probValues.join(' × ')} = ${systemProb.toFixed(2)}`;
        }
        
        if (statusLight) {
            statusLight.classList.toggle('failed', systemProb === 0);
        }
        
        if (statusText) {
            statusText.textContent = systemProb > 0 ? 'System Operational' : 'System Failed';
        }
        
        // Update LED
        this.updateLED(systemProb > 0);
    }
    
    updateLED(isOn) {
        const ledElement = document.getElementById('systemLED');
        if (ledElement) {
            if (isOn) {
                ledElement.classList.remove('off');
                ledElement.classList.add('on');
            } else {
                ledElement.classList.remove('on');
                ledElement.classList.add('off');
            }
        }
    }
    
    updateAllDisplays() {
        Object.keys(this.components).forEach(component => {
            this.updateComponentDisplay(component);
        });
        this.updateSystemDisplay();
    }
    
    calculateSystemProbability() {
        return Object.values(this.components).reduce(
            (total, component) => total * component.probability, 1
        );
    }
    
    setTowerView(view) {
        const tower = document.querySelector('.tower-structure');
        if (!tower) return;
        
        const transforms = {
            default: 'rotateX(-15deg) rotateY(20deg) rotateZ(2deg)',
            top: 'rotateX(-60deg) rotateY(0deg) rotateZ(0deg)',
            side: 'rotateX(0deg) rotateY(90deg) rotateZ(0deg)',
            front: 'rotateX(0deg) rotateY(0deg) rotateZ(0deg)'
        };
        
        tower.style.transform = transforms[view] || transforms.default;
        
        // Update active button
        document.querySelectorAll('.view-controls button').forEach(btn => {
            btn.classList.remove('active');
        });
        
        const activeBtn = document.getElementById(view + 'View') || document.getElementById('resetView');
        if (activeBtn) {
            activeBtn.classList.add('active');
        }
    }
    
    triggerFailureEffects(component) {
        const columnElement = document.getElementById(`column${component}`);
        
        if (columnElement && window.visualEffects) {
            window.visualEffects.createParticleEffect(columnElement, 'error');
            window.visualEffects.shakeScreen('light');
        }
    }
    
    triggerRestoreEffects(component) {
        const columnElement = document.getElementById(`column${component}`);
        
        if (columnElement && window.visualEffects) {
            window.visualEffects.createParticleEffect(columnElement, 'success');
            window.visualEffects.highlightElement(columnElement, '#28a745', 1500);
        }
    }
    
    handleResize() {
        // Update any size-dependent calculations
        if (window.dragHandler) {
            window.dragHandler.updateDropZoneBounds();
        }
    }
    
    pauseAnimations() {
        document.body.classList.add('paused');
    }
    
    resumeAnimations() {
        document.body.classList.remove('paused');
    }
    
    startMonitoring() {
        // Monitor system state every second
        setInterval(() => {
            if (this.isInitialized) {
                this.checkSystemHealth();
            }
        }, 1000);
    }
    
    checkSystemHealth() {
        const failedCount = Object.values(this.components).filter(c => !c.working).length;
        const totalCount = Object.keys(this.components).length;
        
        if (failedCount === totalCount && window.visualEffects) {
            // All components failed - this is rare, show special effect
            const now = Date.now();
            if (!this.lastCompleteFailureTime || now - this.lastCompleteFailureTime > 5000) {
                window.visualEffects.shakeScreen('heavy');
                this.lastCompleteFailureTime = now;
            }
        }
    }
    
    // Utility function for debouncing
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
    
    // Public API for external control
    getSystemState() {
        return {
            components: { ...this.components },
            systemProbability: this.calculateSystemProbability(),
            isOperational: this.calculateSystemProbability() > 0
        };
    }
    
    setComponentState(component, working) {
        if (working) {
            this.restoreComponent(component);
        } else {
            this.failComponent(component);
        }
    }
}

// Initialize the application
let probabilityTower;

// Ensure DOM is ready before initializing
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        probabilityTower = new ProbabilityTower();
        
        // Make it globally accessible
        window.probabilityTower = probabilityTower;
    });
} else {
    probabilityTower = new ProbabilityTower();
    window.probabilityTower = probabilityTower;
}

// Add some developer conveniences
if (typeof window !== 'undefined') {
    window.debugTower = {
        failAll: () => ['A', 'B', 'C', 'D'].forEach(c => probabilityTower?.failComponent(c)),
        restoreAll: () => probabilityTower?.resetAllComponents(),
        getState: () => probabilityTower?.getSystemState(),
        randomFail: () => probabilityTower?.triggerRandomFailure()
    };
}
