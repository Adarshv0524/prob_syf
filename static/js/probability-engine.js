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
        const resetBtn = document.getElementById('resetSystem');
        const randomBtn = document.getElementById('randomFail');
        
        if (resetBtn) {
            resetBtn.addEventListener('click', () => {
                this.resetSystem();
            });
        }
        
        if (randomBtn) {
            randomBtn.addEventListener('click', () => {
                this.triggerRandomFailure();
            });
        }
        
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
            const btn = document.getElementById(id);
            if (btn) {
                btn.addEventListener('click', handler);
            }
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
        
        if (!systemProbElement) return;
        
        // Add changing animation
        systemProbElement.classList.add('changing');
        if (probabilityDisplay) probabilityDisplay.classList.add('changing');
        
        setTimeout(() => {
            systemProbElement.textContent = this.systemReliability.toFixed(2);
            
            if (statusLight) {
                statusLight.classList.toggle('failed', !this.isSystemOperational);
            }
            
            if (statusText) {
                statusText.textContent = this.isSystemOperational ? 'System Operational' : 'System Failed';
            }
            
            systemProbElement.classList.remove('changing');
            if (probabilityDisplay) probabilityDisplay.classList.remove('changing');
        }, 200);
    }
    
    updateComponentDisplays() {
        Object.keys(this.components).forEach(component => {
            this.updateComponentDisplay(component);
        });
    }
    
    updateComponentDisplay(component) {
        const probElement = document.getElementById(`prob${component}`);
        const barElement = document.getElementById(`bar${component}`);
        const controlElement = document.querySelector(`[data-component="${component}"]`);
        const failBtn = document.querySelector(`[data-component="${component}"].fail-btn`);
        const restoreBtn = document.querySelector(`[data-component="${component}"].restore-btn`);
        
        if (probElement) {
            probElement.textContent = this.components[component].probability.toFixed(2);
            probElement.classList.toggle('failed', !this.components[component].working);
        }
        
        if (barElement) {
            barElement.style.width = (this.components[component].probability * 100) + '%';
            barElement.classList.toggle('failed', !this.components[component].working);
        }
        
        if (controlElement) {
            controlElement.classList.toggle('failed', !this.components[component].working);
        }
        
        // Toggle buttons
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
    
    updateEquationDisplay() {
        const equationElement = document.getElementById('equation');
        if (!equationElement) return;
        
        const probValues = Object.keys(this.components).map(
            key => this.components[key].probability.toFixed(2)
        );
        
        equationElement.textContent = 
            `P(System) = ${probValues.join(' × ')} = ${this.systemReliability.toFixed(2)}`;
    }
    
    updateLEDStatus() {
        const ledElement = document.getElementById('systemLED');
        if (!ledElement) return;
        
        if (this.isSystemOperational) {
            ledElement.classList.remove('off');
            ledElement.classList.add('on');
        } else {
            ledElement.classList.remove('on');
            ledElement.classList.add('off');
        }
    }
    
    updateBatteryStatus() {
        const batteryElement = document.getElementById('systemBattery');
        if (!batteryElement) return;
        
        if (this.isSystemOperational) {
            batteryElement.classList.add('active');
            batteryElement.classList.remove('depleted');
        } else {
            batteryElement.classList.remove('active');
            batteryElement.classList.add('depleted');
        }
    }
    
    updateReliabilityBars() {
        Object.keys(this.components).forEach(component => {
            const barElement = document.getElementById(`bar${component}`);
            if (barElement) {
                barElement.classList.add('updating');
                setTimeout(() => {
                    barElement.classList.remove('updating');
                }, 500);
            }
        });
    }
    
    updatePowerFlow() {
        document.querySelectorAll('.wire-connection').forEach(wire => {
            if (this.isSystemOperational) {
                wire.classList.add('active');
                wire.classList.remove('failed');
            } else {
                wire.classList.remove('active');
                wire.classList.add('failed');
            }
        });
    }
    
    animateComponentFailure(component) {
        if (window.dragHandler) {
            window.dragHandler.forceFail(component);
        }
        
        // Add stress to cardboard
        const level = this.getComponentLevel(component);
        const floor = document.querySelector(`.level-${level} .cardboard-floor`);
        if (floor) {
            floor.classList.add('stressed');
            setTimeout(() => {
                floor.classList.remove('stressed');
            }, 500);
        }
    }
    
    animateComponentRestore(component) {
        if (window.dragHandler) {
            window.dragHandler.forceRestore(component);
        }
    }
    
    getComponentLevel(component) {
        const levels = { A: 1, B: 2, C: 3, D: 4 };
        return levels[component] || 1;
    }
    
    resetSystem() {
        Object.keys(this.components).forEach(component => {
            this.restoreComponent(component, 'reset');
        });
        
        this.failureHistory = [];
        
        if (window.visualEffects) {
            window.visualEffects.showNotification('System Reset Complete!', 'success');
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
        this.failComponent(randomComponent, 'random');
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
    
    checkSystemStatus() {
        const failedCount = Object.values(this.components).filter(c => !c.working).length;
        const totalCount = Object.keys(this.components).length;
        
        if (failedCount === totalCount) {
            if (window.visualEffects) {
                window.visualEffects.showNotification('Complete System Failure!', 'error');
            }
        } else if (failedCount > 0) {
            if (window.visualEffects) {
                window.visualEffects.showNotification(`${failedCount}/${totalCount} components failed`, 'warning');
            }
        }
    }
    
    startSystemMonitoring() {
        setInterval(() => {
            this.totalOperationTime += 1;
            // Could add more monitoring logic here
        }, 1000);
    }
    
    showProbabilityExplanation(type, component = null, data = null) {
        if (!window.visualEffects) return;
        
        let title = '';
        let content = '';
        
        switch(type) {
            case 'welcome':
                title = 'Welcome to Probability Tower!';
                content = `
                    <p><strong>This model demonstrates series system reliability:</strong></p>
                    <ul>
                        <li>🔧 Each popsicle stick represents a system component</li>
                        <li>⚡ Components can fail independently</li>
                        <li>📊 System probability = P(A) × P(B) × P(C) × P(D)</li>
                        <li>💡 LED shows system status (ON = working, OFF = failed)</li>
                    </ul>
                    <p><em>Try failing components to see how the system responds!</em></p>
                `;
                break;
                
            case 'failure':
                title = `Component ${component} Failed!`;
                content = `
                    <h4>📉 Probability Impact:</h4>
                    <p>Component ${component}: <span style="color: #28a745;">1.00</span> → <span style="color: #dc3545;">0.00</span></p>
                    <p>System Probability: <span style="color: #dc3545;">${this.systemReliability.toFixed(2)}</span></p>
                    
                    <h4>🔢 Mathematical Explanation:</h4>
                    <p>Since we multiply probabilities in series systems:</p>
                    <p><code>P(System) = P(A) × P(B) × P(C) × P(D)</code></p>
                    <p>Any component with probability 0 makes the entire system probability 0.</p>
                    
                    <div style="background: #fff3cd; padding: 10px; border-radius: 5px; border-left: 4px solid #ffc107; margin: 10px 0;">
                        <strong>Key Insight:</strong> This demonstrates the "weakest link" principle in series systems.
                    </div>
                `;
                break;
                
            case 'restore':
                title = `Component ${component} Restored!`;
                content = `
                    <h4>📈 Probability Impact:</h4>
                    <p>Component ${component}: <span style="color: #dc3545;">0.00</span> → <span style="color: #28a745;">1.00</span></p>
                    <p>System Probability: <span style="color: #28a745;">${this.systemReliability.toFixed(2)}</span></p>
                    
                    <h4>🔢 Current Calculation:</h4>
                    <p><code>${Object.keys(this.components).map(k => this.components[k].probability.toFixed(2)).join(' × ')} = ${this.systemReliability.toFixed(2)}</code></p>
                    
                    ${this.systemReliability === 1 ? 
                        '<div style="background: #d4edda; padding: 10px; border-radius: 5px; border-left: 4px solid #28a745; margin: 10px 0;"><strong>Excellent!</strong> System is now 100% reliable.</div>' :
                        '<div style="background: #d1ecf1; padding: 10px; border-radius: 5px; border-left: 4px solid #17a2b8; margin: 10px 0;"><strong>Progress!</strong> System partially restored, but other failures still affect reliability.</div>'
                    }
                `;
                break;
        }
        
        window.visualEffects.showModal(title, content);
    }
    
    // Drag event handlers
    onDragStart(component) {
        if (window.visualEffects) {
            window.visualEffects.showNotification(`Dragging Component ${component}...`, 'info', 2000);
        }
    }
    
    onDragEnd(component, success) {
        if (success) {
            this.restoreComponent(component, 'drag');
        } else {
            this.failComponent(component, 'drag');
        }
    }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.probabilityEngine = new ProbabilityEngine();
    });
} else {
    window.probabilityEngine = new ProbabilityEngine();
}
