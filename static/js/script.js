class ProbabilityTower {
    constructor() {
        this.components = {
            A: { probability: 1, working: true },
            B: { probability: 1, working: true },
            C: { probability: 1, working: true },
            D: { probability: 1, working: true }
        };
        
        this.draggedElement = null;
        this.dragOffset = { x: 0, y: 0 };
        
        this.initializeEventListeners();
        this.updateDisplay();
        
        // Show initial explanation
        setTimeout(() => {
            this.showNotification('Welcome! Drag components to remove them, or use fail buttons. Watch how the system probability changes!', 'info', 5000);
        }, 1000);
    }
    
    initializeEventListeners() {
        // Fail/Restore buttons
        document.querySelectorAll('.fail-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const component = e.target.dataset.component;
                this.failComponent(component);
            });
        });
        
        document.querySelectorAll('.restore-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const component = e.target.dataset.component;
                this.restoreComponent(component);
            });
        });
        
        // Reset and random buttons
        document.getElementById('resetSystem').addEventListener('click', () => {
            this.resetAllComponents();
        });
        
        document.getElementById('randomFail').addEventListener('click', () => {
            this.randomFailure();
        });
        
        // Drag and drop functionality
        this.initializeDragDrop();
        
        // Popup close
        document.querySelector('.close-popup').addEventListener('click', () => {
            this.hidePopup();
        });
        
        // Click outside popup to close
        document.getElementById('probabilityPopup').addEventListener('click', (e) => {
            if (e.target.id === 'probabilityPopup') {
                this.hidePopup();
            }
        });
    }
    
    initializeDragDrop() {
        const columns = document.querySelectorAll('.column');
        const dropZones = document.querySelectorAll('.drop-zone');
        
        columns.forEach(column => {
            column.addEventListener('dragstart', (e) => {
                this.handleDragStart(e);
            });
            
            column.addEventListener('drag', (e) => {
                this.handleDrag(e);
            });
            
            column.addEventListener('dragend', (e) => {
                this.handleDragEnd(e);
            });
            
            // Mouse events for better control
            column.addEventListener('mousedown', (e) => {
                this.handleMouseDown(e);
            });
        });
        
        // Document level mouse events
        document.addEventListener('mousemove', (e) => {
            this.handleMouseMove(e);
        });
        
        document.addEventListener('mouseup', (e) => {
            this.handleMouseUp(e);
        });
        
        // Drop zone events
        dropZones.forEach(zone => {
            zone.addEventListener('dragover', (e) => {
                e.preventDefault();
                zone.classList.add('drag-over');
            });
            
            zone.addEventListener('dragleave', (e) => {
                zone.classList.remove('drag-over');
            });
            
            zone.addEventListener('drop', (e) => {
                e.preventDefault();
                this.handleDrop(e, zone);
            });
        });
    }
    
    handleDragStart(e) {
        this.draggedElement = e.target;
        e.target.classList.add('dragging');
        
        const rect = e.target.getBoundingClientRect();
        this.dragOffset.x = e.clientX - rect.left;
        this.dragOffset.y = e.clientY - rect.top;
        
        // Create drag image
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/html', e.target.outerHTML);
        
        this.showNotification('Dragging component - watch the system probability!', 'info', 2000);
    }
    
    handleMouseDown(e) {
        if (e.button === 0) { // Left mouse button
            this.draggedElement = e.target.closest('.column');
            if (this.draggedElement) {
                this.draggedElement.classList.add('dragging');
                
                const rect = this.draggedElement.getBoundingClientRect();
                this.dragOffset.x = e.clientX - rect.left;
                this.dragOffset.y = e.clientY - rect.top;
                
                e.preventDefault();
            }
        }
    }
    
    handleMouseMove(e) {
        if (this.draggedElement && e.buttons === 1) {
            const x = e.clientX - this.dragOffset.x;
            const y = e.clientY - this.dragOffset.y;
            
            this.draggedElement.style.position = 'fixed';
            this.draggedElement.style.left = x + 'px';
            this.draggedElement.style.top = y + 'px';
            this.draggedElement.style.zIndex = '1000';
            
            // Check if over drop zone
            this.checkDropZones(e.clientX, e.clientY);
        }
    }
    
    handleMouseUp(e) {
        if (this.draggedElement) {
            const dropZone = this.getDropZoneUnderPoint(e.clientX, e.clientY);
            
            if (dropZone && dropZone.dataset.component === this.draggedElement.dataset.component) {
                // Restore to original position
                this.restoreComponent(this.draggedElement.dataset.component);
                this.resetColumnPosition(this.draggedElement);
            } else {
                // Fail the component if dropped outside its zone
                if (this.components[this.draggedElement.dataset.component].working) {
                    this.failComponent(this.draggedElement.dataset.component);
                }
                this.resetColumnPosition(this.draggedElement);
            }
            
            this.draggedElement.classList.remove('dragging');
            this.clearDropZoneHighlights();
            this.draggedElement = null;
        }
    }
    
    handleDragEnd(e) {
        e.target.classList.remove('dragging');
        this.clearDropZoneHighlights();
        
        // If not dropped properly, fail the component
        if (!this.isInCorrectPosition(e.target)) {
            this.failComponent(e.target.dataset.component);
        }
    }
    
    handleDrop(e, zone) {
        zone.classList.remove('drag-over');
        
        if (this.draggedElement && zone.dataset.component === this.draggedElement.dataset.component) {
            this.restoreComponent(zone.dataset.component);
            this.showNotification(`Component ${zone.dataset.component} restored! System probability updated.`, 'success', 3000);
        }
    }
    
    checkDropZones(x, y) {
        document.querySelectorAll('.drop-zone').forEach(zone => {
            const rect = zone.getBoundingClientRect();
            if (x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom) {
                zone.classList.add('drag-over');
            } else {
                zone.classList.remove('drag-over');
            }
        });
    }
    
    getDropZoneUnderPoint(x, y) {
        const elements = document.elementsFromPoint(x, y);
        return elements.find(el => el.classList.contains('drop-zone'));
    }
    
    resetColumnPosition(column) {
        column.style.position = '';
        column.style.left = '';
        column.style.top = '';
        column.style.zIndex = '';
    }
    
    clearDropZoneHighlights() {
        document.querySelectorAll('.drop-zone').forEach(zone => {
            zone.classList.remove('drag-over');
        });
    }
    
    isInCorrectPosition(element) {
        // Simple check - in real app, you'd check actual coordinates
        return !element.classList.contains('dragging');
    }
    
    failComponent(component) {
        if (!this.components[component].working) return;
        
        this.components[component].probability = 0;
        this.components[component].working = false;
        
        // Visual feedback
        const column = document.getElementById(`column${component}`);
        column.classList.add('failing');
        
        setTimeout(() => {
            column.classList.remove('failing');
            column.classList.add('failed');
        }, 500);
        
        // Update UI
        this.updateComponentDisplay(component);
        this.updateSystemDisplay();
        
        // Show explanation
        this.showProbabilityExplanation('failure', component);
        
        // Update buttons
        document.querySelector(`[data-component="${component}"].fail-btn`).style.display = 'none';
        document.querySelector(`[data-component="${component}"].restore-btn`).style.display = 'inline-block';
        
        this.showNotification(`Component ${component} failed! System probability is now 0.`, 'error', 4000);
    }
    
    restoreComponent(component) {
        if (this.components[component].working) return;
        
        this.components[component].probability = 1;
        this.components[component].working = true;
        
        // Visual feedback
        const column = document.getElementById(`column${component}`);
        column.classList.remove('failed');
        
        // Update UI
        this.updateComponentDisplay(component);
        this.updateSystemDisplay();
        
        // Show explanation
        this.showProbabilityExplanation('restore', component);
        
        // Update buttons
        document.querySelector(`[data-component="${component}"].fail-btn`).style.display = 'inline-block';
        document.querySelector(`[data-component="${component}"].restore-btn`).style.display = 'none';
        
        this.showNotification(`Component ${component} restored! System probability updated.`, 'success', 3000);
    }
    
    resetAllComponents() {
        Object.keys(this.components).forEach(component => {
            this.restoreComponent(component);
        });
        
        this.showNotification('All components restored! System is fully operational.', 'success', 3000);
        this.showProbabilityExplanation('reset');
    }
    
    randomFailure() {
        const workingComponents = Object.keys(this.components).filter(
            key => this.components[key].working
        );
        
        if (workingComponents.length === 0) {
            this.showNotification('No working components to fail!', 'info', 2000);
            return;
        }
        
        const randomComponent = workingComponents[Math.floor(Math.random() * workingComponents.length)];
        this.failComponent(randomComponent);
        
        this.showNotification(`Random failure occurred in Component ${randomComponent}!`, 'error', 3000);
    }
    
    updateComponentDisplay(component) {
        const probElement = document.getElementById(`prob${component}`);
        const controlElement = document.querySelector(`[data-component="${component}"]`);
        
        probElement.textContent = this.components[component].probability.toFixed(2);
        
        if (this.components[component].working) {
            probElement.classList.remove('failed');
            controlElement.classList.remove('failed');
        } else {
            probElement.classList.add('failed');
            controlElement.classList.add('failed');
        }
    }
    
    updateSystemDisplay() {
        const systemProb = this.calculateSystemProbability();
        const systemProbElement = document.getElementById('systemProb');
        const equationElement = document.getElementById('equation');
        const ledElement = document.getElementById('systemLED');
        const probabilityDisplay = document.querySelector('.system-probability');
        
        // Update probability display
        systemProbElement.textContent = systemProb.toFixed(2);
        
        // Update equation
        const probValues = Object.keys(this.components).map(
            key => this.components[key].probability
        );
        equationElement.textContent = 
            `P(System) = ${probValues.join(' × ')} = ${systemProb.toFixed(2)}`;
        
        // Update LED
        if (systemProb > 0) {
            ledElement.classList.remove('off');
            ledElement.classList.add('on');
            probabilityDisplay.classList.remove('failed');
        } else {
            ledElement.classList.remove('on');
            ledElement.classList.add('off');
            probabilityDisplay.classList.add('failed');
        }
    }
    
    updateDisplay() {
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
    
    showProbabilityExplanation(type, component = null) {
        let content = '';
        const systemProb = this.calculateSystemProbability();
        const probValues = Object.keys(this.components).map(
            key => this.components[key].probability
        );
        
        switch(type) {
            case 'failure':
                content = `
                    <h4>Component ${component} Failed!</h4>
                    <p><strong>What happened:</strong></p>
                    <p>Component ${component}'s probability changed from <span style="color: #27ae60">1.00</span> to <span style="color: #e74c3c">0.00</span></p>
                    
                    <p><strong>Mathematical Impact:</strong></p>
                    <p>System Probability = ${probValues.join(' × ')}</p>
                    <p>Since one component = 0, the entire system = <span style="color: #e74c3c">${systemProb.toFixed(2)}</span></p>
                    
                    <p><strong>Key Insight:</strong></p>
                    <p style="background: #fff3cd; padding: 10px; border-radius: 5px; border-left: 4px solid #ffc107;">
                        Any number multiplied by zero equals zero. This demonstrates the "weakest link" principle in series systems.
                    </p>
                `;
                break;
                
            case 'restore':
                content = `
                    <h4>Component ${component} Restored!</h4>
                    <p><strong>What happened:</strong></p>
                    <p>Component ${component}'s probability changed from <span style="color: #e74c3c">0.00</span> to <span style="color: #27ae60">1.00</span></p>
                    
                    <p><strong>Mathematical Impact:</strong></p>
                    <p>System Probability = ${probValues.join(' × ')}</p>
                    <p>System probability is now: <span style="color: #27ae60">${systemProb.toFixed(2)}</span></p>
                    
                    <p><strong>Key Insight:</strong></p>
                    <p style="background: #d1ecf1; padding: 10px; border-radius: 5px; border-left: 4px solid #bee5eb;">
                        ${systemProb === 1 ? 'All components working = 100% system reliability!' : 'System restored, but other components still need attention.'}
                    </p>
                `;
                break;
                
            case 'reset':
                content = `
                    <h4>System Reset Complete!</h4>
                    <p><strong>Current State:</strong></p>
                    <p>All components: A=1, B=1, C=1, D=1</p>
                    
                    <p><strong>Mathematical Result:</strong></p>
                    <p>System Probability = 1 × 1 × 1 × 1 = <span style="color: #27ae60">1.00</span></p>
                    
                    <p><strong>Key Insight:</strong></p>
                    <p style="background: #d4edda; padding: 10px; border-radius: 5px; border-left: 4px solid #c3e6cb;">
                        Perfect reliability achieved! All components working at 100% efficiency.
                    </p>
                `;
                break;
        }
        
        document.getElementById('popupContent').innerHTML = content;
        document.getElementById('probabilityPopup').style.display = 'flex';
        
        // Auto-hide after 8 seconds
        setTimeout(() => {
            this.hidePopup();
        }, 8000);
    }
    
    hidePopup() {
        document.getElementById('probabilityPopup').style.display = 'none';
    }
    
    showNotification(message, type = 'info', duration = 3000) {
        const notification = document.getElementById('notification');
        
        notification.textContent = message;
        notification.className = `notification ${type}`;
        notification.classList.add('show');
        
        setTimeout(() => {
            notification.classList.remove('show');
        }, duration);
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const tower = new ProbabilityTower();
    
    // Add some interactive hints
    const columns = document.querySelectorAll('.column');
    columns.forEach(column => {
        column.addEventListener('mouseenter', () => {
            const component = column.dataset.component;
            const working = tower.components[component].working;
            
            if (working) {
                column.title = `Component ${component} (Working) - Drag to remove or click Fail button`;
            } else {
                column.title = `Component ${component} (Failed) - Drag back to restore or click Restore button`;
            }
        });
    });
    
    // Add keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        switch(e.key.toLowerCase()) {
            case 'r':
                if (e.ctrlKey) {
                    e.preventDefault();
                    tower.resetAllComponents();
                }
                break;
            case 'f':
                if (e.ctrlKey) {
                    e.preventDefault();
                    tower.randomFailure();
                }
                break;
            case 'escape':
                tower.hidePopup();
                break;
        }
    });
    
    // Add helpful tooltips
    setTimeout(() => {
        tower.showNotification('💡 Tip: Use Ctrl+R to reset, Ctrl+F for random failure, ESC to close popups', 'info', 5000);
    }, 3000);
});
