/**
 * Advanced Drag System - Handles component dragging with full synchronization
 */
class DragSystem {
    constructor() {
        this.draggedElement = null;
        this.dragHelper = null;
        this.isDragging = false;
        this.dragOffset = { x: 0, y: 0 };
        this.originalPositions = new Map();
        this.dropZones = new Map();
        this.dragThreshold = 10;
        this.snapDistance = 80;
        
        this.init();
    }
    
    async init() {
        try {
            await this.waitForDependencies();
            this.setupDragElements();
            this.setupDropZones();
            this.createDragHelper();
            this.bindEvents();
            
            console.log('🖱️ Drag System initialized');
            
        } catch (error) {
            console.error('❌ Failed to initialize Drag System:', error);
        }
    }
    
    waitForDependencies() {
        return new Promise((resolve, reject) => {
            let attempts = 0;
            const checkInterval = setInterval(() => {
                attempts++;
                if (window.probabilityEngine?.isInitialized && window.towerRenderer) {
                    clearInterval(checkInterval);
                    resolve();
                } else if (attempts > 50) {
                    clearInterval(checkInterval);
                    reject(new Error('Dependencies not available'));
                }
            }, 100);
        });
    }
    
    setupDragElements() {
        ['A', 'B', 'C', 'D'].forEach(component => {
            const element = document.getElementById(`stick${component}`);
            if (element) {
                element.style.touchAction = 'none';
                element.setAttribute('draggable', 'false');
                
                // Store original position
                const container = element.closest('.tower-component');
                this.originalPositions.set(component, {
                    element: element,
                    container: container,
                    initialTransform: element.style.transform || ''
                });
            }
        });
    }
    
    setupDropZones() {
        document.querySelectorAll('.drop-zone').forEach(zone => {
            const component = zone.dataset.component;
            if (component) {
                this.dropZones.set(component, {
                    element: zone,
                    component: component,
                    bounds: zone.getBoundingClientRect()
                });
            }
        });
        
        // Update bounds on resize
        window.addEventListener('resize', this.debounce(() => {
            this.updateDropZoneBounds();
        }, 250));
    }
    
    createDragHelper() {
        this.dragHelper = document.createElement('div');
        this.dragHelper.className = 'drag-helper';
        this.dragHelper.style.cssText = `
            position: fixed;
            pointer-events: none;
            z-index: 15000;
            opacity: 0;
            transform: scale(1.1);
            filter: brightness(1.2) drop-shadow(0 15px 35px rgba(0,0,0,0.5));
            transition: opacity 0.2s ease;
        `;
        document.body.appendChild(this.dragHelper);
    }
    
    bindEvents() {
        // Mouse events
        document.addEventListener('mousedown', this.handlePointerDown.bind(this));
        document.addEventListener('mousemove', this.handlePointerMove.bind(this));
        document.addEventListener('mouseup', this.handlePointerUp.bind(this));
        
        // Touch events
        document.addEventListener('touchstart', this.handlePointerDown.bind(this), { passive: false });
        document.addEventListener('touchmove', this.handlePointerMove.bind(this), { passive: false });
        document.addEventListener('touchend', this.handlePointerUp.bind(this));
        
        // Prevent context menu during drag
        document.addEventListener('contextmenu', (e) => {
            if (this.isDragging) e.preventDefault();
        });
    }
    
    // ===== DRAG HANDLERS =====
    
    handlePointerDown(e) {
        const element = e.target.closest('.popsicle-stick');
        if (!element || element.classList.contains('failed')) return;
        
        e.preventDefault();
        
        const pointer = this.getPointer(e);
        this.startDrag(element, pointer);
    }
    
    handlePointerMove(e) {
        if (!this.draggedElement) return;
        
        e.preventDefault();
        const pointer = this.getPointer(e);
        this.updateDrag(pointer);
    }
    
    handlePointerUp(e) {
        if (!this.draggedElement) return;
        
        const pointer = this.getPointer(e);
        this.finishDrag(pointer);
    }
    
    getPointer(e) {
        if (e.touches && e.touches.length > 0) {
            return { x: e.touches[0].clientX, y: e.touches[0].clientY };
        } else if (e.changedTouches && e.changedTouches.length > 0) {
            return { x: e.changedTouches[0].clientX, y: e.changedTouches[0].clientY };
        }
        return { x: e.clientX, y: e.clientY };
    }
    
    startDrag(element, pointer) {
        this.draggedElement = element;
        this.isDragging = false;
        
        const rect = element.getBoundingClientRect();
        this.dragOffset = {
            x: pointer.x - rect.left,
            y: pointer.y - rect.top
        };
        
        this.startPosition = { x: pointer.x, y: pointer.y };
        
        element.classList.add('drag-ready');
        document.body.style.cursor = 'grabbing';
        
        // Notify engine
        const component = element.id.replace('stick', '');
        window.probabilityEngine.onDragStart(component);
    }
    
    updateDrag(pointer) {
        if (!this.isDragging) {
            const distance = Math.sqrt(
                Math.pow(pointer.x - this.startPosition.x, 2) +
                Math.pow(pointer.y - this.startPosition.y, 2)
            );
            
            if (distance > this.dragThreshold) {
                this.startActualDrag(pointer);
            }
            return;
        }
        
        this.updateDragPosition(pointer);
        this.checkDropZones(pointer);
    }
    
    startActualDrag(pointer) {
        this.isDragging = true;
        
        const element = this.draggedElement;
        element.classList.remove('drag-ready');
        element.classList.add('dragging');
        
        // Create visual clone
        this.createDragClone();
        
        // Make original semi-transparent
        element.style.opacity = '0.4';
        
        // Show appropriate drop zone
        const component = element.id.replace('stick', '');
        this.showDropZone(component);
        
        // CRITICAL: Notify engine immediately about drag removal
        setTimeout(() => {
            window.probabilityEngine.failComponent(component, 'drag');
        }, 100);
    }
    
    createDragClone() {
        const element = this.draggedElement;
        this.dragHelper.innerHTML = element.outerHTML;
        this.dragHelper.style.opacity = '1';
        
        const clone = this.dragHelper.firstChild;
        if (clone) {
            clone.style.position = 'relative';
            clone.style.transform = 'none';
            clone.style.opacity = '1';
            clone.classList.remove('dragging', 'failed', 'drag-ready');
            clone.id = clone.id + '_clone'; // Prevent ID conflicts
        }
    }
    
    updateDragPosition(pointer) {
        const x = pointer.x - this.dragOffset.x;
        const y = pointer.y - this.dragOffset.y;
        
        this.dragHelper.style.left = x + 'px';
        this.dragHelper.style.top = y + 'px';
        
        this.currentPosition = { x, y };
    }
    
    checkDropZones(pointer) {
        const component = this.draggedElement.id.replace('stick', '');
        const zone = this.dropZones.get(component);
        
        if (!zone) return;
        
        const rect = zone.element.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        
        const distance = Math.sqrt(
            Math.pow(pointer.x - centerX, 2) +
            Math.pow(pointer.y - centerY, 2)
        );
        
        if (distance < this.snapDistance) {
            zone.element.classList.add('active');
            this.currentDropZone = zone;
        } else {
            zone.element.classList.remove('active');
            this.currentDropZone = null;
        }
    }
    
    showDropZone(component) {
        const zone = this.dropZones.get(component);
        if (zone) {
            zone.element.classList.add('active');
            zone.element.style.opacity = '1';
        }
    }
    
    hideDropZones() {
        this.dropZones.forEach(zone => {
            zone.element.classList.remove('active');
            zone.element.style.opacity = '0';
        });
    }
    
    finishDrag(pointer) {
        const element = this.draggedElement;
        const component = element.id.replace('stick', '');
        const wasActuallyDragging = this.isDragging;
        
        // Determine outcome
        const shouldRestore = this.currentDropZone && wasActuallyDragging;
        const wasRemoved = wasActuallyDragging && !shouldRestore;
        
        // Clean up drag state
        this.cleanup();
        
        if (shouldRestore) {
            // Component dropped back in zone - restore it
            this.restoreComponent(element, component);
        } else if (wasRemoved) {
            // Component dragged away - already failed in startActualDrag
            this.confirmRemoval(element, component);
        } else {
            // Just a click - restore to original position
            this.restoreToOriginal(element);
        }
    }
    
    restoreComponent(element, component) {
        // Animate back to original position
        this.restoreToOriginal(element);
        
        // CRITICAL: Restore component in engine with delay
        setTimeout(() => {
            window.probabilityEngine.restoreComponent(component, 'drag');
        }, 200);
        
        this.showFeedback(`Component ${component} restored!`, 'success');
    }
    
    confirmRemoval(element, component) {
        // Component was already failed in startActualDrag, just animate
        this.restoreToOriginal(element);
        this.showFeedback(`Component ${component} removed from circuit!`, 'error');
    }
    
    restoreToOriginal(element) {
        const component = element.id.replace('stick', '');
        const originalPos = this.originalPositions.get(component);
        
        if (!originalPos) return;
        
        // Smooth animation back
        element.style.transition = 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)';
        element.style.position = '';
        element.style.left = '';
        element.style.top = '';
        element.style.transform = originalPos.initialTransform;
        element.style.zIndex = '';
        element.style.opacity = '';
        
        setTimeout(() => {
            element.style.transition = '';
            element.classList.remove('dragging', 'drag-ready');
        }, 600);
    }
    
    cleanup() {
        if (this.draggedElement) {
            this.draggedElement.classList.remove('drag-ready');
        }
        
        this.draggedElement = null;
        this.isDragging = false;
        this.currentDropZone = null;
        
        this.dragHelper.style.opacity = '0';
        document.body.style.cursor = '';
        
        this.hideDropZones();
    }
    
    showFeedback(message, type) {
        window.probabilityEngine.emit('notification:show', {
            type: type,
            title: type === 'success' ? 'Component Restored' : 'Component Failed',
            message: message
        });
    }
    
    // ===== PUBLIC API FOR ENGINE INTEGRATION =====
    
    forceFailVisual(component) {
        const element = document.getElementById(`stick${component}`);
        if (element) {
            element.classList.add('failing');
            setTimeout(() => {
                element.classList.remove('failing');
                element.classList.add('failed');
            }, 500);
        }
    }
    
    forceRestoreVisual(component) {
        const element = document.getElementById(`stick${component}`);
        if (element) {
            element.classList.remove('failed', 'failing');
            element.classList.add('restoring');
            this.restoreToOriginal(element);
            
            setTimeout(() => {
                element.classList.remove('restoring');
            }, 600);
        }
    }
    
    updateDropZoneBounds() {
        this.dropZones.forEach((zone) => {
            zone.bounds = zone.element.getBoundingClientRect();
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
}

// Initialize drag system
window.dragSystem = new DragSystem();
