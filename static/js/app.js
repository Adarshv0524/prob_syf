/**
 * Main Application - Coordinates all systems and handles notifications
 */
class ProbabilityTowerApp {
    constructor() {
        this.systems = new Map();
        this.notificationQueue = [];
        this.isNotificationShowing = false;
        
        this.init();
    }
    
    async init() {
        try {
            console.log('🚀 Initializing Probability Tower App...');
            
            await this.waitForSystems();
            this.setupNotificationSystem();
            this.setupGlobalEventHandlers();
            this.bindSystemEvents();
            this.startHealthMonitoring();
            
            console.log('✅ Probability Tower App fully initialized!');
            this.showWelcomeNotification();
            
        } catch (error) {
            console.error('❌ Failed to initialize app:', error);
            this.showErrorNotification('Failed to initialize application');
        }
    }
    
    async waitForSystems() {
        const requiredSystems = [
            'probabilityEngine',
            'towerRenderer', 
            'dragSystem',
            'educationSystem'
        ];
        
        return new Promise((resolve, reject) => {
            let attempts = 0;
            const checkInterval = setInterval(() => {
                attempts++;
                
                const allReady = requiredSystems.every(system => {
                    const sys = window[system];
                    return sys && (sys.isInitialized !== false);
                });
                
                if (allReady) {
                    clearInterval(checkInterval);
                    
                    // Store system references
                    requiredSystems.forEach(systemName => {
                        this.systems.set(systemName, window[systemName]);
                    });
                    
                    resolve();
                } else if (attempts > 100) { // 10 seconds max wait
                    clearInterval(checkInterval);
                    reject(new Error('Systems failed to initialize within timeout'));
                }
            }, 100);
        });
    }
    
    setupNotificationSystem() {
        this.notificationContainer = document.getElementById('notification');
        if (!this.notificationContainer) {
            this.createNotificationElement();
        }
        
        // Bind notification close button
        const closeBtn = this.notificationContainer.querySelector('#notificationClose');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.hideNotification());
        }
    }
    
    createNotificationElement() {
        const notificationHTML = `
            <div class="notification-system" id="notificationSystem">
                <div class="notification" id="notification">
                    <div class="notification-content">
                        <div class="notification-icon"></div>
                        <div class="notification-text">
                            <div class="notification-title"></div>
                            <div class="notification-message"></div>
                        </div>
                    </div>
                    <button class="notification-close" id="notificationClose">&times;</button>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', notificationHTML);
        this.notificationContainer = document.getElementById('notification');
    }
    
    bindSystemEvents() {
        const engine = this.systems.get('probabilityEngine');
        
        // Listen for notification requests
        engine.on('notification:show', (data) => {
            this.showNotification(data.message, data.type, data.title);
        });
        
        // Listen for component events for enhanced feedback
        engine.on('component:failed', (data) => {
            this.handleComponentFailure(data);
        });
        
        engine.on('component:restored', (data) => {
            this.handleComponentRestore(data);
        });
        
        engine.on('system:reset', (data) => {
            this.handleSystemReset(data);
        });
        
        // Listen for drag events
        engine.on('drag:start', (data) => {
            this.handleDragStart(data);
        });
        
        engine.on('drag:end', (data) => {
            this.handleDragEnd(data);
        });
    }
    
    setupGlobalEventHandlers() {
        // Global keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            this.handleGlobalKeyboard(e);
        });
        
        // Window visibility change
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.pauseNonCriticalSystems();
            } else {
                this.resumeNonCriticalSystems();
            }
        });
        
        // Global error handling
        window.addEventListener('error', (e) => {
            console.error('Global error:', e.error);
            this.showNotification('An unexpected error occurred', 'error');
        });
        
        // Unhandled promise rejections
        window.addEventListener('unhandledrejection', (e) => {
            console.error('Unhandled promise rejection:', e.reason);
            this.showNotification('A system error occurred', 'error');
        });
    }
    
    // ===== EVENT HANDLERS =====
    
    handleComponentFailure(data) {
        const { component, source, oldSystemProb, newSystemProb } = data;
        
        // Enhanced feedback based on source
        switch (source) {
            case 'drag':
                // Already handled by drag system
                break;
            case 'manual':
                this.createImpactParticles();
                break;
            case 'random':
                this.showNotification(
                    `Random event caused Component ${component} to fail!`,
                    'warning',
                    'Random Failure Event'
                );
                break;
        }
        
        // System-wide effects
        if (newSystemProb === 0 && oldSystemProb > 0) {
            this.handleTotalSystemFailure();
        }
    }
    
    handleComponentRestore(data) {
        const { component, source, newSystemProb } = data;
        
        if (newSystemProb === 1) {
            // Full system restoration
            this.handleFullSystemRestore();
        }
    }
    
    handleSystemReset(data) {
        this.showNotification(
            'All components restored to perfect working condition!',
            'success',
            'System Reset Complete'
        );
        this.createCelebrationEffect();
    }
    
    handleDragStart(data) {
        this.showNotification(
            `Dragging Component ${data.component}... Drop outside to remove, or drop back to restore.`,
            'info',
            'Component Drag Mode'
        );
    }
    
    handleDragEnd(data) {
        // Handled by individual drag system notifications
    }
    
    handleTotalSystemFailure() {
        this.showNotification(
            'TOTAL SYSTEM FAILURE! All circuits are broken.',
            'error',
            'Critical System Failure'
        );
        this.createFailureEffect();
    }
    
    handleFullSystemRestore() {
        this.showNotification(
            'Perfect reliability achieved! All components working at 100%.',
            'success',
            'System Fully Operational'
        );
        this.createSuccessEffect();
    }
    
    handleGlobalKeyboard(e) {
        // Don't interfere with modal input
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
            return;
        }
        
        const engine = this.systems.get('probabilityEngine');
        
        switch (e.key.toLowerCase()) {
            case 'r':
                if (e.ctrlKey || e.metaKey) {
                    e.preventDefault();
                    engine.resetSystem();
                    this.showNotification('System reset via keyboard shortcut', 'info');
                }
                break;
                
            case 'f':
                if (e.ctrlKey || e.metaKey) {
                    e.preventDefault();
                    engine.triggerRandomFailure();
                }
                break;
                
            case 'h':
                if (e.ctrlKey || e.metaKey) {
                    e.preventDefault();
                    this.showHelpNotification();
                }
                break;
                
            case '1':
            case '2':
            case '3':
            case '4':
                const componentMap = { '1': 'A', '2': 'B', '3': 'C', '4': 'D' };
                const component = componentMap[e.key];
                if (component) {
                    if (engine.isComponentWorking(component)) {
                        engine.failComponent(component, 'keyboard');
                    } else {
                        engine.restoreComponent(component, 'keyboard');
                    }
                }
                break;
                
            case 'escape':
                this.hideNotification();
                break;
        }
    }
    
    // ===== NOTIFICATION SYSTEM =====
    
    showNotification(message, type = 'info', title = null) {
        const notification = {
            message,
            type,
            title: title || this.getDefaultTitle(type),
            timestamp: Date.now()
        };
        
        if (this.isNotificationShowing) {
            this.notificationQueue.push(notification);
        } else {
            this.displayNotification(notification);
        }
    }
    
    displayNotification(notification) {
        const iconElement = this.notificationContainer.querySelector('.notification-icon');
        const titleElement = this.notificationContainer.querySelector('.notification-title');
        const messageElement = this.notificationContainer.querySelector('.notification-message');
        
        // Set content
        if (iconElement) iconElement.textContent = this.getNotificationIcon(notification.type);
        if (titleElement) titleElement.textContent = notification.title;
        if (messageElement) messageElement.textContent = notification.message;
        
        // Set style
        this.notificationContainer.className = `notification ${notification.type}`;
        this.notificationContainer.classList.add('show');
        this.isNotificationShowing = true;
        
        // Auto-hide after delay
        const duration = this.getNotificationDuration(notification.type);
        setTimeout(() => {
            this.hideNotification();
        }, duration);
    }
    
    hideNotification() {
        if (!this.isNotificationShowing) return;
        
        this.notificationContainer.classList.remove('show');
        this.isNotificationShowing = false;
        
        // Show next notification in queue
        setTimeout(() => {
            if (this.notificationQueue.length > 0) {
                const nextNotification = this.notificationQueue.shift();
                this.displayNotification(nextNotification);
            }
        }, 300);
    }
    
    getDefaultTitle(type) {
        const titles = {
            success: 'Success',
            error: 'System Error',
            warning: 'Warning',
            info: 'Information'
        };
        return titles[type] || 'Notification';
    }
    
    getNotificationIcon(type) {
        const icons = {
            success: '✅',
            error: '❌',
            warning: '⚠️',
            info: 'ℹ️'
        };
        return icons[type] || 'ℹ️';
    }
    
    getNotificationDuration(type) {
        const durations = {
            success: 3000,
            error: 5000,
            warning: 4000,
            info: 3000
        };
        return durations[type] || 3000;
    }
    
    // ===== VISUAL EFFECTS =====
    
    createImpactParticles() {
        // Create dramatic failure particles
        const scene = document.getElementById('towerScene');
        if (scene) {
            const rect = scene.getBoundingClientRect();
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;
            
            for (let i = 0; i < 15; i++) {
                this.createParticle(centerX, centerY, 'error');
            }
        }
    }
    
    createFailureEffect() {
        // Screen shake for dramatic effect
        document.body.style.animation = 'systemShake 0.5s ease-out';
        setTimeout(() => {
            document.body.style.animation = '';
        }, 500);
    }
    
    createSuccessEffect() {
        // Success particles
        const scene = document.getElementById('towerScene');
        if (scene) {
            const rect = scene.getBoundingClientRect();
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;
            
            for (let i = 0; i < 12; i++) {
                setTimeout(() => {
                    this.createParticle(centerX, centerY, 'success');
                }, i * 100);
            }
        }
    }
    
    createCelebrationEffect() {
        // Confetti-like effect
        for (let i = 0; i < 25; i++) {
            setTimeout(() => {
                const x = Math.random() * window.innerWidth;
                const y = -10;
                this.createParticle(x, y, 'success');
            }, i * 150);
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
        
        const angle = Math.random() * Math.PI * 2;
        const velocity = Math.random() * 120 + 60;
        const deltaX = Math.cos(angle) * velocity;
        const deltaY = Math.sin(angle) * velocity - 40;
        
        particle.style.setProperty('--particle-x', deltaX + 'px');
        particle.style.setProperty('--particle-y', deltaY + 'px');
        
        document.body.appendChild(particle);
        
        setTimeout(() => particle.remove(), 2000);
    }
    
    // ===== SYSTEM MONITORING =====
    
    startHealthMonitoring() {
        setInterval(() => {
            this.checkSystemHealth();
        }, 5000); // Check every 5 seconds
    }
    
    checkSystemHealth() {
        // Monitor for any system issues
        const systems = ['probabilityEngine', 'towerRenderer', 'dragSystem', 'educationSystem'];
        
        systems.forEach(systemName => {
            const system = this.systems.get(systemName);
            if (!system) {
                console.warn(`⚠️ System ${systemName} is not available`);
            }
        });
    }
    
    pauseNonCriticalSystems() {
        // Pause animations and reduce processing when tab is hidden
        document.body.classList.add('app-paused');
    }
    
    resumeNonCriticalSystems() {
        // Resume normal operation when tab becomes visible
        document.body.classList.remove('app-paused');
    }
    
    // ===== HELPER NOTIFICATIONS =====
    
    showWelcomeNotification() {
        this.showNotification(
            'Welcome! Try dragging components or using the control buttons to explore probability.',
            'info',
            'Welcome to Probability Tower'
        );
    }
    
    showErrorNotification(message) {
        this.showNotification(message, 'error', 'System Error');
    }
    
    showHelpNotification() {
        this.showNotification(
            'Keyboard shortcuts: Ctrl+R (reset), Ctrl+F (random fail), 1-4 (toggle components), H (help)',
            'info',
            'Keyboard Shortcuts'
        );
    }
    
    // ===== PUBLIC API =====
    
    getSystemStatus() {
        return {
            systems: Array.from(this.systems.keys()),
            notificationQueue: this.notificationQueue.length,
            isNotificationShowing: this.isNotificationShowing
        };
    }
    
    forceNotification(message, type, title) {
        // Force show notification, clearing queue
        this.notificationQueue = [];
        this.hideNotification();
        setTimeout(() => {
            this.showNotification(message, type, title);
        }, 100);
    }

}

// Add CSS animations for system effects
const systemAnimations = `
@keyframes systemShake {
    0%, 100% { transform: translate(0, 0); }
    25% { transform: translate(-5px, -2px); }
    75% { transform: translate(5px, 2px); }
}

.app-paused * {
    animation-play-state: paused !important;
}

.app-paused .notification {
    transition-duration: 0.1s !important;
}
`;

// Inject system animations
const systemStyleSheet = document.createElement('style');
systemStyleSheet.textContent = systemAnimations;
document.head.appendChild(systemStyleSheet);

// Initialize the main application
window.probabilityTowerApp = new ProbabilityTowerApp();

// Global debug utilities (development only)
if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    window.debug = {
        app: window.probabilityTowerApp,
        engine: window.probabilityEngine,
        renderer: window.towerRenderer,
        drag: window.dragSystem,
        education: window.educationSystem,
        
        // Quick test functions
        testFailure: () => window.probabilityEngine.failComponent('A', 'debug'),
        testRestore: () => window.probabilityEngine.restoreComponent('A', 'debug'),
        testReset: () => window.probabilityEngine.resetSystem(),
        testRandom: () => window.probabilityEngine.triggerRandomFailure(),
        
        // System status
        status: () => console.table(window.probabilityTowerApp.getSystemStatus()),
        state: () => console.table(window.probabilityEngine.getSystemState()),
        
        // Force effects
        shake: () => document.body.style.animation = 'systemShake 0.5s ease-out',
        particles: () => window.probabilityTowerApp.createCelebrationEffect(),
        
        // Notification test
        notify: (msg, type) => window.probabilityTowerApp.showNotification(msg, type || 'info')
    };
    
    console.log('🔧 Debug utilities available via window.debug');
    console.log('Try: debug.testFailure(), debug.shake(), debug.particles()');
}
