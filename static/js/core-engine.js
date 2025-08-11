/**
 * Core Probability Engine - Handles all system state and calculations
 */
class ProbabilityEngine {
    constructor() {
        this.components = {
            A: { probability: 1, working: true, level: 1 },
            B: { probability: 1, working: true, level: 2 },
            C: { probability: 1, working: true, level: 3 },
            D: { probability: 1, working: true, level: 4 }
        };
        
        this.systemState = {
            probability: 1,
            operational: true,
            lastUpdate: Date.now()
        };
        
        this.eventListeners = new Map();
        this.isInitialized = false;
        
        this.init();
    }
    
    async init() {
        try {
            await this.waitForDOM();
            this.bindEvents();
            this.updateAllDisplays();
            this.isInitialized = true;
            
            this.emit('engine:ready');
            console.log('🔧 Probability Engine initialized');
            
        } catch (error) {
            console.error('❌ Failed to initialize Probability Engine:', error);
        }
    }
    
    waitForDOM() {
        return new Promise((resolve) => {
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', resolve);
            } else {
                resolve();
            }
        });
    }
    
    bindEvents() {
        // Component fail buttons
        document.querySelectorAll('.fail-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const component = e.target.closest('[data-component]').dataset.component;
                this.failComponent(component, 'manual');
            });
        });
        
        // Component restore buttons
        document.querySelectorAll('.restore-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const component = e.target.closest('[data-component]').dataset.component;
                this.restoreComponent(component, 'manual');
            });
        });
        
        // System controls
        const resetBtn = document.getElementById('resetAllBtn');
        const randomBtn = document.getElementById('randomFailBtn');
        
        if (resetBtn) {
            resetBtn.addEventListener('click', () => this.resetSystem());
        }
        
        if (randomBtn) {
            randomBtn.addEventListener('click', () => this.triggerRandomFailure());
        }
    }
    
    // ===== COMPONENT OPERATIONS =====
    
    failComponent(component, source = 'system') {
        if (!this.components[component] || !this.components[component].working) {
            return false;
        }
        
        const oldState = { ...this.components[component] };
        const oldSystemProb = this.systemState.probability;
        
        // Update component state
        this.components[component].probability = 0;
        this.components[component].working = false;
        
        // Recalculate system
        this.recalculateSystem();
        
        // Update displays
        this.updateAllDisplays();
        
        // Emit events
        this.emit('component:failed', {
            component,
            source,
            oldState,
            newState: { ...this.components[component] },
            oldSystemProb,
            newSystemProb: this.systemState.probability
        });
        
        // Show educational content
        if (source === 'manual') {
            this.showFailureEducation(component, oldSystemProb);
        }
        
        console.log(`⚡ Component ${component} failed (${source})`);
        return true;
    }
    
    restoreComponent(component, source = 'system') {
        if (!this.components[component] || this.components[component].working) {
            return false;
        }
        
        const oldSystemProb = this.systemState.probability;
        
        // Update component state
        this.components[component].probability = 1;
        this.components[component].working = true;
        
        // Recalculate system
        this.recalculateSystem();
        
        // Update displays
        this.updateAllDisplays();
        
        // Emit events
        this.emit('component:restored', {
            component,
            source,
            oldSystemProb,
            newSystemProb: this.systemState.probability
        });
        
        // Show educational content
        if (source === 'manual') {
            this.showRestoreEducation(component, oldSystemProb);
        }
        
        console.log(`🔧 Component ${component} restored (${source})`);
        return true;
    }
    
    resetSystem() {
        const oldSystemProb = this.systemState.probability;
        
        // Reset all components
        Object.keys(this.components).forEach(component => {
            this.components[component].probability = 1;
            this.components[component].working = true;
        });
        
        // Recalculate system
        this.recalculateSystem();
        
        // Update displays
        this.updateAllDisplays();
        
        // Emit events
        this.emit('system:reset', {
            oldSystemProb,
            newSystemProb: this.systemState.probability
        });
        
        // Show educational content
        this.showResetEducation();
        
        console.log('🔄 System reset completed');
    }
    
    triggerRandomFailure() {
        const workingComponents = Object.keys(this.components).filter(
            key => this.components[key].working
        );
        
        if (workingComponents.length === 0) {
            this.emit('notification:show', {
                type: 'info',
                title: 'No Components Available',
                message: 'All components are already failed!'
            });
            return;
        }
        
        // Select ONE random component
        const randomComponent = workingComponents[Math.floor(Math.random() * workingComponents.length)];
        
        // Show preview notification
        this.emit('notification:show', {
            type: 'warning',
            title: 'Random Failure Triggered',
            message: `Component ${randomComponent} will fail in 2 seconds...`
        });
        
        // Fail after delay
        setTimeout(() => {
            this.failComponent(randomComponent, 'random');
        }, 2000);
        
        console.log(`🎲 Random failure targeting Component ${randomComponent}`);
    }
    
    // ===== SYSTEM CALCULATIONS =====
    
    recalculateSystem() {
        // Series system: multiply all component probabilities
        this.systemState.probability = Object.values(this.components)
            .reduce((total, comp) => total * comp.probability, 1);
        
        this.systemState.operational = this.systemState.probability > 0;
        this.systemState.lastUpdate = Date.now();
    }
    
    // ===== DISPLAY UPDATES =====
    
    updateAllDisplays() {
        this.updateSystemDisplay();
        this.updateComponentDisplays();
        this.updateEquationDisplay();
        this.updateStatusDisplay();
    }
    
    updateSystemDisplay() {
        const probElement = document.getElementById('systemProbability');
        const percentElement = document.getElementById('systemPercentage');
        
        if (probElement) {
            probElement.textContent = this.systemState.probability.toFixed(2);
            probElement.classList.toggle('failed', !this.systemState.operational);
        }
        
        if (percentElement) {
            const percentage = Math.round(this.systemState.probability * 100);
            percentElement.textContent = `${percentage}%`;
        }
        
        // Trigger visual update animation
        const display = document.querySelector('.probability-display');
        if (display) {
            display.classList.add('changing');
            setTimeout(() => display.classList.remove('changing'), 800);
        }
    }
    
    updateComponentDisplays() {
        Object.keys(this.components).forEach(component => {
            this.updateComponentDisplay(component);
        });
    }
    
    updateComponentDisplay(component) {
        const comp = this.components[component];
        
        // Update probability value
        const probElement = document.getElementById(`prob${component}`);
        if (probElement) {
            probElement.textContent = comp.probability.toFixed(2);
            probElement.classList.toggle('failed', !comp.working);
        }
        
        // Update reliability bar
        const barElement = document.getElementById(`bar${component}`);
        if (barElement) {
            barElement.style.width = `${comp.probability * 100}%`;
            barElement.classList.toggle('failed', !comp.working);
        }
        
        // Update component card
        const cardElement = document.getElementById(`componentCard${component}`);
        if (cardElement) {
            cardElement.classList.toggle('failed', !comp.working);
            cardElement.classList.add('updating');
            setTimeout(() => cardElement.classList.remove('updating'), 600);
        }
        
        // Update buttons
        const failBtn = cardElement?.querySelector('.fail-btn');
        const restoreBtn = cardElement?.querySelector('.restore-btn');
        
        if (failBtn && restoreBtn) {
            if (comp.working) {
                failBtn.classList.remove('hidden');
                restoreBtn.classList.add('hidden');
            } else {
                failBtn.classList.add('hidden');
                restoreBtn.classList.remove('hidden');
            }
        }
    }
    
    updateEquationDisplay() {
        const equationElement = document.getElementById('probabilityEquation');
        if (equationElement) {
            const probValues = Object.keys(this.components).map(
                key => this.components[key].probability.toFixed(2)
            );
            
            equationElement.textContent = 
                `P(System) = ${probValues.join(' × ')} = ${this.systemState.probability.toFixed(2)}`;
        }
    }
    
    updateStatusDisplay() {
        const statusElement = document.getElementById('systemStatus');
        const statusDot = statusElement?.querySelector('.status-dot');
        const statusText = statusElement?.querySelector('.status-text');
        
        if (statusDot) {
            statusDot.classList.toggle('failed', !this.systemState.operational);
        }
        
        if (statusText) {
            statusText.textContent = this.systemState.operational 
                ? 'System Operational' 
                : 'System Failed';
        }
    }
    
    // ===== EDUCATIONAL CONTENT =====
    
    showFailureEducation(component, oldSystemProb) {
        const content = this.generateFailureEducationContent(component, oldSystemProb);
        this.emit('education:show', {
            title: `Component ${component} Failure Analysis`,
            content: content
        });
    }
    
    showRestoreEducation(component, oldSystemProb) {
        const content = this.generateRestoreEducationContent(component, oldSystemProb);
        this.emit('education:show', {
            title: `Component ${component} Restoration Analysis`,
            content: content
        });
    }
    
    showResetEducation() {
        const content = this.generateResetEducationContent();
        this.emit('education:show', {
            title: 'System Reset Complete - Learning Summary',
            content: content
        });
    }
    
    generateFailureEducationContent(component, oldSystemProb) {
        return `
            <div class="education-box error">
                <h4>📉 What Just Happened?</h4>
                <div class="probability-change">
                    <span class="prob-before">${oldSystemProb.toFixed(2)}</span>
                    <span class="prob-arrow">→</span>
                    <span class="prob-after">${this.systemState.probability.toFixed(2)}</span>
                </div>
                <p>Component ${component} changed from <strong>working (1.00)</strong> to <strong>failed (0.00)</strong></p>
            </div>
            
            <div class="math-equation">
                ${Object.keys(this.components).map(k => this.components[k].probability.toFixed(2)).join(' × ')} = ${this.systemState.probability.toFixed(2)}
            </div>
            
            <div class="education-box">
                <h4>🔢 Mathematical Principle</h4>
                <p>In <strong>series systems</strong>, all components must work for the system to function. This is calculated using the <strong>multiplication rule</strong>:</p>
                <p><code>P(System) = P(A) × P(B) × P(C) × P(D)</code></p>
                <p>Since any number multiplied by zero equals zero, <strong>one failed component causes total system failure</strong>.</p>
            </div>
            
            <div class="education-box warning">
                <h4>🌍 Real-World Applications</h4>
                <p>This principle applies to:</p>
                <ul>
                    <li><strong>Christmas lights</strong> wired in series</li>
                    <li><strong>Safety systems</strong> in nuclear plants</li>
                    <li><strong>Assembly lines</strong> in manufacturing</li>
                    <li><strong>Electronic circuits</strong> without redundancy</li>
                </ul>
            </div>
        `;
    }
    
    generateRestoreEducationContent(component, oldSystemProb) {
        const isFullyRestored = this.systemState.probability === 1;
        
        return `
            <div class="education-box success">
                <h4>📈 Component Restored!</h4>
                <div class="probability-change">
                    <span class="prob-before">${oldSystemProb.toFixed(2)}</span>
                    <span class="prob-arrow">→</span>
                    <span class="prob-after">${this.systemState.probability.toFixed(2)}</span>
                </div>
                <p>Component ${component} changed from <strong>failed (0.00)</strong> to <strong>working (1.00)</strong></p>
            </div>
            
            <div class="math-equation">
                ${Object.keys(this.components).map(k => this.components[k].probability.toFixed(2)).join(' × ')} = ${this.systemState.probability.toFixed(2)}
            </div>
            
            ${isFullyRestored ? `
                <div class="education-box success">
                    <h4>🎉 Perfect System Reliability!</h4>
                    <p>All components are now working, giving us <strong>100% system reliability</strong>. This is the ideal state for any series system.</p>
                </div>
            ` : `
                <div class="education-box warning">
                    <h4>⚠️ Partial System Recovery</h4>
                    <p>While Component ${component} is restored, other failed components still affect system reliability. Restore all components to achieve 100% reliability.</p>
                </div>
            `}
            
            <div class="education-box">
                <h4>💡 Key Insight</h4>
                <p>Restoring a failed component can improve system reliability, but in series systems, <strong>every component must work</strong> for optimal performance.</p>
            </div>
        `;
    }
    
    generateResetEducationContent() {
        return `
            <div class="education-box success">
                <h4>🔄 System Reset Complete!</h4>
                <p>All components have been restored to perfect working condition.</p>
                <div class="math-equation">1 × 1 × 1 × 1 = 1.00</div>
            </div>
            
            <div class="education-box">
                <h4>🎓 What You've Learned</h4>
                <ul>
                    <li><strong>Series System Reliability:</strong> All components must work for system success</li>
                    <li><strong>Multiplication Rule:</strong> System probability = product of component probabilities</li>
                    <li><strong>Weakest Link Principle:</strong> One failure can bring down the entire system</li>
                    <li><strong>Zero Effect:</strong> Any component with 0% reliability makes system reliability 0%</li>
                </ul>
            </div>
            
            <div class="education-box warning">
                <h4>🏆 Try This Next</h4>
                <p>Experiment with different failure combinations:</p>
                <ul>
                    <li>Fail multiple components and observe the effect</li>
                    <li>Try the random failure button</li>
                    <li>Practice predicting system probability before checking</li>
                    <li>Drag components to see real-time changes</li>
                </ul>
            </div>
        `;
    }
    
    // ===== EVENT SYSTEM =====
    
    on(event, callback) {
        if (!this.eventListeners.has(event)) {
            this.eventListeners.set(event, []);
        }
        this.eventListeners.get(event).push(callback);
    }
    
    off(event, callback) {
        if (this.eventListeners.has(event)) {
            const listeners = this.eventListeners.get(event);
            const index = listeners.indexOf(callback);
            if (index > -1) {
                listeners.splice(index, 1);
            }
        }
    }
    
    emit(event, data = null) {
        if (this.eventListeners.has(event)) {
            this.eventListeners.get(event).forEach(callback => {
                try {
                    callback(data);
                } catch (error) {
                    console.error(`Error in event listener for ${event}:`, error);
                }
            });
        }
    }
    
    // ===== PUBLIC API =====
    
    getSystemState() {
        return {
            ...this.systemState,
            components: { ...this.components }
        };
    }
    
    getComponent(component) {
        return this.components[component] ? { ...this.components[component] } : null;
    }
    
    isComponentWorking(component) {
        return this.components[component]?.working || false;
    }
    
    getWorkingComponents() {
        return Object.keys(this.components).filter(key => this.components[key].working);
    }
    
    getFailedComponents() {
        return Object.keys(this.components).filter(key => !this.components[key].working);
    }
    
    // ===== DRAG SYSTEM INTEGRATION =====
    
    onDragStart(component) {
        this.emit('drag:start', { component });
    }
    
    onDragEnd(component, success) {
        if (success) {
            // Component was dropped back in place
            if (!this.components[component].working) {
                this.restoreComponent(component, 'drag');
            }
        } else {
            // Component was dragged away
            if (this.components[component].working) {
                this.failComponent(component, 'drag');
            }
        }
        
        this.emit('drag:end', { component, success });
    }
}

// Initialize and expose globally
window.probabilityEngine = new ProbabilityEngine();

// Expose for debugging
if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    window.debugEngine = {
        failAll: () => ['A', 'B', 'C', 'D'].forEach(c => window.probabilityEngine.failComponent(c)),
        restoreAll: () => window.probabilityEngine.resetSystem(),
        getState: () => window.probabilityEngine.getSystemState(),
        randomFail: () => window.probabilityEngine.triggerRandomFailure()
    };
}
