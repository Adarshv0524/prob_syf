class AdvancedDragHandler {
    constructor() {
        this.draggedElement = null;
        this.dragOffset = { x: 0, y: 0 };
        this.originalPosition = { x: 0, y: 0 };
        this.isDragging = false;
        this.dropZones = new Map();
        this.dragStartTime = 0;
        this.dragThreshold = 5; // pixels
        this.snapDistance = 60; // pixels for auto-snap
        
        this.initializeDragSystem();
    }
    
    initializeDragSystem() {
        this.setupDragElements();
        this.setupDropZones();
        this.bindEvents();
        this.createDragGhost();
    }
    
    setupDragElements() {
        const columns = document.querySelectorAll('.popsicle-column');
        columns.forEach(column => {
            column.setAttribute('draggable', 'false'); // Use custom drag
            column.style.touchAction = 'none'; // Prevent touch scrolling
            
            // Store original position
            const rect = column.getBoundingClientRect();
            const parentRect = column.parentElement.getBoundingClientRect();
            
            this.storeOriginalPosition(column, {
                x: rect.left - parentRect.left,
                y: rect.top - parentRect.top
            });
        });
    }
    
    setupDropZones() {
        const zones = document.querySelectorAll('.drop-zone');
        zones.forEach(zone => {
            const component = zone.dataset.component;
            const rect = zone.getBoundingClientRect();
            this.dropZones.set(component, {
                element: zone,
                bounds: rect,
                component: component
            });
        });
        
        // Update drop zone positions on window resize
        window.addEventListener('resize', this.debounce(() => {
            this.updateDropZoneBounds();
        }, 250));
    }
    
    storeOriginalPosition(element, position) {
        element.dataset.originalX = position.x;
        element.dataset.originalY = position.y;
    }
    
    bindEvents() {
        document.addEventListener('mousedown', this.handleMouseDown.bind(this));
        document.addEventListener('mousemove', this.handleMouseMove.bind(this));
        document.addEventListener('mouseup', this.handleMouseUp.bind(this));
        
        // Touch events for mobile support
        document.addEventListener('touchstart', this.handleTouchStart.bind(this), { passive: false });
        document.addEventListener('touchmove', this.handleTouchMove.bind(this), { passive: false });
        document.addEventListener('touchend', this.handleTouchEnd.bind(this));
        
        // Prevent context menu during drag
        document.addEventListener('contextmenu', (e) => {
            if (this.isDragging) {
                e.preventDefault();
            }
        });
    }
    
    createDragGhost() {
        this.dragGhost = document.createElement('div');
        this.dragGhost.className = 'drag-ghost';
        this.dragGhost.style.cssText = `
            position: fixed;
            pointer-events: none;
            z-index: 10000;
            opacity: 0.8;
            transform: scale(1.1);
            filter: brightness(1.2);
            transition: none;
            display: none;
        `;
        document.body.appendChild(this.dragGhost);
    }
    
    handleMouseDown(e) {
        const column = e.target.closest('.popsicle-column');
        if (!column || column.classList.contains('failed')) return;
        
        e.preventDefault();
        this.startDrag(column, { x: e.clientX, y: e.clientY });
    }
    
    handleTouchStart(e) {
        const column = e.target.closest('.popsicle-column');
        if (!column || column.classList.contains('failed')) return;
        
        e.preventDefault();
        const touch = e.touches[0];
        this.startDrag(column, { x: touch.clientX, y: touch.clientY });
    }
    
    startDrag(element, pointer) {
        this.draggedElement = element;
        this.dragStartTime = Date.now();
        this.isDragging = false; // Will become true after threshold
        
        const rect = element.getBoundingClientRect();
        this.dragOffset = {
            x: pointer.x - rect.left,
            y: pointer.y - rect.top
        };
        
        this.originalPosition = {
            x: rect.left,
            y: rect.top
        };
        
        // Visual feedback
        element.classList.add('drag-ready');
        document.body.style.cursor = 'grabbing';
        
        // Clone element for ghost
        this.updateDragGhost(element, pointer);
    }
    
    handleMouseMove(e) {
        if (!this.draggedElement) return;
        
        e.preventDefault();
        this.updateDrag({ x: e.clientX, y: e.clientY });
    }
    
    handleTouchMove(e) {
        if (!this.draggedElement) return;
        
        e.preventDefault();
        const touch = e.touches[0];
        this.updateDrag({ x: touch.clientX, y: touch.clientY });
    }
    
    updateDrag(pointer) {
        if (!this.isDragging) {
            // Check if we've moved beyond threshold
            const distance = Math.sqrt(
                Math.pow(pointer.x - (this.originalPosition.x + this.dragOffset.x), 2) +
                Math.pow(pointer.y - (this.originalPosition.y + this.dragOffset.y), 2)
            );
            
            if (distance > this.dragThreshold) {
                this.startActualDrag();
            } else {
                return;
            }
        }
        
        // Update positions
        const x = pointer.x - this.dragOffset.x;
        const y = pointer.y - this.dragOffset.y;
        
        this.updateElementPosition(this.draggedElement, x, y);
        this.updateDragGhost(this.draggedElement, pointer);
        
        // Check drop zones
        this.checkDropZones(pointer);
    }
    
    startActualDrag() {
        this.isDragging = true;
        
        // Make element semi-transparent and show ghost
        this.draggedElement.classList.remove('drag-ready');
        this.draggedElement.classList.add('dragging');
        this.draggedElement.style.opacity = '0.3';
        
        this.dragGhost.style.display = 'block';
        
        // Activate all drop zones
        this.activateDropZones();
        
        // Notify system
        if (window.probabilityEngine) {
            window.probabilityEngine.onDragStart(this.draggedElement.dataset.component);
        }
    }
    
    updateElementPosition(element, x, y) {
        // Use transform for better performance
        element.style.position = 'fixed';
        element.style.left = '0';
        element.style.top = '0';
        element.style.transform = `translate(${x}px, ${y}px)`;
        element.style.zIndex = '1000';
    }
    
    updateDragGhost(element, pointer) {
        if (!this.isDragging) return;
        
        // Clone the element appearance
        if (this.dragGhost.innerHTML !== element.outerHTML) {
            this.dragGhost.innerHTML = element.outerHTML;
            const ghostColumn = this.dragGhost.firstChild;
            if (ghostColumn) {
                ghostColumn.style.position = 'relative';
                ghostColumn.style.transform = 'none';
                ghostColumn.style.opacity = '1';
            }
        }
        
        this.dragGhost.style.left = (pointer.x - this.dragOffset.x) + 'px';
        this.dragGhost.style.top = (pointer.y - this.dragOffset.y) + 'px';
    }
    
    checkDropZones(pointer) {
        let activeZone = null;
        let minDistance = Infinity;
        
        this.dropZones.forEach((zone, componentId) => {
            if (componentId !== this.draggedElement.dataset.component) return;
            
            // Update bounds (they might have changed)
            const rect = zone.element.getBoundingClientRect();
            
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;
            
            const distance = Math.sqrt(
                Math.pow(pointer.x - centerX, 2) +
                Math.pow(pointer.y - centerY, 2)
            );
            
            if (distance < this.snapDistance && distance < minDistance) {
                activeZone = zone;
                minDistance = distance;
            }
        });
        
        // Update zone states
        this.dropZones.forEach((zone) => {
            if (zone === activeZone) {
                zone.element.classList.add('active');
            } else {
                zone.element.classList.remove('active');
            }
        });
        
        this.currentDropZone = activeZone;
    }
    
    activateDropZones() {
        const component = this.draggedElement.dataset.component;
        const zone = this.dropZones.get(component);
        
        if (zone) {
            zone.element.classList.add('activating');
            setTimeout(() => {
                zone.element.classList.remove('activating');
            }, 400);
        }
    }
    
    deactivateDropZones() {
        this.dropZones.forEach((zone) => {
            zone.element.classList.remove('active', 'activating');
        });
    }
    
    handleMouseUp(e) {
        if (!this.draggedElement) return;
        this.finishDrag({ x: e.clientX, y: e.clientY });
    }
    
    handleTouchEnd(e) {
        if (!this.draggedElement) return;
        const touch = e.changedTouches[0];
        this.finishDrag({ x: touch.clientX, y: touch.clientY });
    }
    
    finishDrag(pointer) {
        const element = this.draggedElement;
        const component = element.dataset.component;
        const wasActuallyDragging = this.isDragging;
        
        // Check if we're in a valid drop zone
        const shouldRestore = this.currentDropZone && wasActuallyDragging;
        const shouldFail = wasActuallyDragging && !shouldRestore;
        
        // Clean up drag state
        this.cleanup();
        
        // Handle the result
        if (shouldRestore) {
            this.restoreToDropZone(element, component);
        } else if (shouldFail) {
            this.failComponent(element, component);
        } else {
            // Just a click or minimal drag - restore to original position
            this.restoreToOriginalPosition(element);
        }
    }
    
    restoreToDropZone(element, component) {
        // Animate back to original position
        this.restoreToOriginalPosition(element);
        
        // Notify system to restore component
        setTimeout(() => {
            if (window.probabilityEngine) {
                window.probabilityEngine.restoreComponent(component);
            }
        }, 100);
        
        this.showFeedback('Component ' + component + ' restored successfully!', 'success');
    }
    
    failComponent(element, component) {
        // Animate to failed position
        element.classList.add('failing');
        
        setTimeout(() => {
            element.classList.remove('failing');
            element.classList.add('failed');
            this.restoreToOriginalPosition(element);
            
            // Notify system
            if (window.probabilityEngine) {
                window.probabilityEngine.failComponent(component);
            }
        }, 1000);
        
        this.showFeedback('Component ' + component + ' failed!', 'error');
    }
    
    restoreToOriginalPosition(element) {
        // Get stored original position
        const originalX = parseFloat(element.dataset.originalX) || 0;
        const originalY = parseFloat(element.dataset.originalY) || 0;
        
        // Animate back
        element.style.transition = 'all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)';
        element.style.position = '';
        element.style.left = '';
        element.style.top = '';
        element.style.transform = '';
        element.style.zIndex = '';
        element.style.opacity = '';
        
        // Clean up after animation
        setTimeout(() => {
            element.style.transition = '';
            element.classList.remove('dragging', 'drag-ready');
        }, 500);
    }
    
    cleanup() {
        if (this.draggedElement) {
            this.draggedElement.classList.remove('drag-ready');
        }
        
        this.draggedElement = null;
        this.isDragging = false;
        this.currentDropZone = null;
        
        this.dragGhost.style.display = 'none';
        document.body.style.cursor = '';
        
        this.deactivateDropZones();
    }
    
    showFeedback(message, type) {
        if (window.visualEffects) {
            window.visualEffects.showNotification(message, type);
        }
    }
    
    updateDropZoneBounds() {
        this.dropZones.forEach((zone, componentId) => {
            const rect = zone.element.getBoundingClientRect();
            zone.bounds = rect;
        });
    }
    
    // Utility function
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
    
    // Public methods for external control
    enableDrag(component) {
        const element = document.getElementById(`column${component}`);
        if (element) {
            element.classList.remove('failed');
            element.style.pointerEvents = 'auto';
        }
    }
    
    disableDrag(component) {
        const element = document.getElementById(`column${component}`);
        if (element) {
            element.style.pointerEvents = 'none';
        }
    }
    
    forceRestore(component) {
        const element = document.getElementById(`column${component}`);
        if (element) {
            element.classList.remove('failed', 'failing', 'dragging', 'drag-ready');
            element.classList.add('restoring');
            this.restoreToOriginalPosition(element);
            
            setTimeout(() => {
                element.classList.remove('restoring');
            }, 800);
        }
    }
    
    forceFail(component) {
        const element = document.getElementById(`column${component}`);
        if (element && !element.classList.contains('failed')) {
            element.classList.add('failing');
            
            setTimeout(() => {
                element.classList.remove('failing');
                element.classList.add('failed');
            }, 1000);
        }
    }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.dragHandler = new AdvancedDragHandler();
    });
} else {
    window.dragHandler = new AdvancedDragHandler();
}
