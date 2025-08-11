class ProbabilityEngine {
    constructor() {
        this.components = {
            A: { probability: 1, working: true, reliability: 1 },
            B: { probability: 1, working: true, reliability: 1 },
            C: { probability: 1, working: true, reliability: 1 },
            D: { probability: 1, working: true, reliability: 1 }
        };
        
        this.systemReliability = 1;
        this.totalOperationTime = 0;
        this.failureHistory = [];
        this.isSystemOperational = true;
        
        this.initializeEngine();
    }
    
    initializeEngine() {
        this.bindControlEvents();
        this.updateAllDisplays();
        this.startSystemMonitoring();
        
        // Show welcome message
        setTimeout(() => {
            this.showProbabilityExplanation('welcome');
        }, 1500);
    }
    
    bindControlEvents() {
        // Component control buttons
        document.querySelectorAll('.fail-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const component = e.target.dataset.component;
                this.failComponent(component, 'manual');
            });
        });
        
        document.querySelectorAll('.restore-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const component = e.target.dataset.component;
                this.restoreComponent(component, 'manual');
            });
        });
        
        // System controls
        document.getElementById('resetSystem').addEventListener('click', () => {
            this.resetSystem();
        });
        
        document.getElementById('randomFail').addEventListener('click', () => {
            this.triggerRandomFailure();
        });
        
        // View controls
        this.bindViewControls();
    }
    
    bindViewControls() {
        const viewButtons = {
            resetView: () => this.setTowerView('default'),
            topView: () => this.setTowerView('top'),
            sideView: () => this.setTowerView('side'),
            frontView: () => this.setTowerView('front')
        };
        
        Object.entries(viewButtons).forEach(([id, handler]) => {
            document.getElementById(id).addEventListener('click', handler);
        });
    }
    
    failComponent(component, source = 'system') {
        if (!this.components[component].working) return;
        
        // Record failure
        const failureData = {
            component,
            timestamp: Date.now(),
            source,
            previousReliability: this.components[component].probability
        };
        
        this.failureHistory.push(failureData);
        
        // Update component state
        this.components[component].probability = 0;
        this.components[component].working = false;
        this.components[component].reliability = 0;
        
        // Visual feedback
        this.animateComponentFailure(component);
        
        // Update system state
        this.recalculateSystemReliability();
        this.updateAllDisplays();
        
        // Show detailed explanation
        this.showProbabilityExplanation('failure', component, failureData);
        
        // Update drag handler
        if (window.dragHandler) {
            window.dragHandler.disableDrag(component);
        }
        
        // System-wide effects
        this.checkSystemStatus();
    }
    
    restoreComponent(component, source = 'system') {
        if (this.components[component].working) return;
        
        // Update component state
        const previousState = this.components[component].probability;
        this.components[component].probability = 1;
        this.components[component].working = true;
        this.components[component].reliability = 1;
        
        // Visual feedback
        this.animateComponentRestore(component);
        
        // Update system state
        this.recalculateSystemReliability();
        this.updateAllDisplays();
        
        // Show detailed explanation
        const restoreData = {
            component,
            timestamp: Date.now(),
            source,
            previousReliability: previousState
        };
        
        this.showProbabilityExplanation('restore', component, restoreData);
        
        // Update drag handler
        if (window.dragHandler) {
            window.dragHandler.enableDrag(component);
        }
        
        // System-wide effects
        this.checkSystemStatus();
    }
    
    recalculateSystemReliability() {
        this.systemReliability = Object.values(this.components)
            .reduce((total, comp) => total * comp.probability, 1);
        this.isSystemOperational = this.systemReliability > 0;
        
        // Update power flow animation
        this.updatePowerFlow();
    }
    
    updateAllDisplays() {
        this.updateSystemDisplay();
        this.updateComponentDisplays();
        this.updateEquationDisplay();
        this.updateLEDStatus();
        this.updateBatteryStatus();
        this.updateReliabilityBars();
    }
    
    updateSystemDisplay() {
        const systemProbElement = document.getElementById('systemProb');
        const statusLight = document.getElementById('statusLight');
        const statusText = document.getElementById('statusText');
        const probabilityDisplay = document.querySelector('.system-probability');
        
        // Add changing animation
        systemProbElement.classList.add('changing');
        probabilityDisplay.classList.add('changing');
        
        setTimeout(() => {
            systemProbElement.textContent = this.systemReliability.toFixed(2);
