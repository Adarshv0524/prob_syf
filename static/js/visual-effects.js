class VisualEffects {
    constructor() {
        this.notifications = [];
        this.notificationContainer = null;
        this.modal = null;
        this.initializeEffects();
    }
    
    initializeEffects() {
        this.createNotificationSystem();
        this.setupModal();
        this.bindEvents();
    }
    
    createNotificationSystem() {
        // Enhanced notification system is already in HTML
        this.notificationContainer = document.getElementById('notification');
        
        if (!this.notificationContainer) {
            this.createNotificationElement();
        }
    }
    
    createNotificationElement() {
        this.notificationContainer = document.createElement('div');
        this.notificationContainer.id = 'notification';
        this.notificationContainer.className = 'notification';
        this.notificationContainer.innerHTML = `
            <div class="notification-icon"></div>
            <div class="notification-content">
                <div class="notification-title"></div>
                <div class="notification-message"></div>
            </div>
            <button class="notification-close">&times;</button>
        `;
        document.body.appendChild(this.notificationContainer);
    }
    
    setupModal() {
        this.modal = document.getElementById('probabilityModal');
        
        if (!this.modal) {
            this.createModalElement();
        }
    }
    
    createModalElement() {
        this.modal = document.createElement('div');
        this.modal.id = 'probabilityModal';
        this.modal.className = 'modal';
        this.modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3 id="modalTitle">Information</h3>
                    <button class="modal-close">&times;</button>
                </div>
                <div class="modal-body" id="modalContent"></div>
                <div class="modal-footer">
                    <button id="modalClose" class="modal-btn">Got it!</button>
                </div>
            </div>
        `;
        document.body.appendChild(this.modal);
    }
    
    bindEvents() {
        // Notification close button
        if (this.notificationContainer) {
            const closeBtn = this.notificationContainer.querySelector('.notification-close');
            if (closeBtn) {
                closeBtn.addEventListener('click', () => {
                    this.hideNotification();
                });
            }
        }
        
        // Modal events
        if (this.modal) {
            const closeBtn = this.modal.querySelector('.modal-close');
            const modalCloseBtn = this.modal.querySelector('#modalClose');
            
            if (closeBtn) {
                closeBtn.addEventListener('click', () => {
                    this.hideModal();
                });
            }
            
            if (modalCloseBtn) {
                modalCloseBtn.addEventListener('click', () => {
                    this.hideModal();
                });
            }
            
            // Click outside to close
            this.modal.addEventListener('click', (e) => {
                if (e.target === this.modal) {
                    this.hideModal();
                }
            });
            
            // ESC key to close
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape' && this.modal.style.display === 'flex') {
                    this.hideModal();
                }
            });
        }
    }
    
    showNotification(message, type = 'info', duration = 4000) {
        if (!this.notificationContainer) return;
        
        const icons = {
            success: '✅',
            error: '❌',
            warning: '⚠️',
            info: 'ℹ️'
        };
        
        const titles = {
            success: 'Success',
            error: 'Error',
            warning: 'Warning',
            info: 'Information'
        };
        
        // Clear any existing notification
        this.hideNotification();
        
        // Set content
        const iconElement = this.notificationContainer.querySelector('.notification-icon');
        const titleElement = this.notificationContainer.querySelector('.notification-title');
        const messageElement = this.notificationContainer.querySelector('.notification-message');
        
        if (iconElement) iconElement.textContent = icons[type] || icons.info;
        if (titleElement) titleElement.textContent = titles[type] || titles.info;
        if (messageElement) messageElement.textContent = message;
        
        // Set style
        this.notificationContainer.className = `notification ${type}`;
        
        // Show with animation
        this.notificationContainer.classList.add('show', 'slide-in');
        
        // Auto-hide after duration
        if (duration > 0) {
            setTimeout(() => {
                this.hideNotification();
            }, duration);
        }
        
        // Store notification
        const notification = {
            message,
            type,
            timestamp: Date.now()
        };
        this.notifications.push(notification);
        
        // Keep only last 10 notifications
        if (this.notifications.length > 10) {
            this.notifications.shift();
        }
    }
    
    hideNotification() {
        if (!this.notificationContainer) return;
        
        this.notificationContainer.classList.add('slide-out');
        this.notificationContainer.classList.remove('show');
        
        setTimeout(() => {
            this.notificationContainer.classList.remove('slide-in', 'slide-out');
        }, 300);
    }
    
    showModal(title, content) {
        if (!this.modal) return;
        
        const titleElement = this.modal.querySelector('#modalTitle');
        const contentElement = this.modal.querySelector('#modalContent');
        
        if (titleElement) titleElement.textContent = title;
        if (contentElement) contentElement.innerHTML = content;
        
        // Show modal with animation
        this.modal.style.display = 'flex';
        this.modal.classList.add('fade-in');
        
        const modalContent = this.modal.querySelector('.modal-content');
        if (modalContent) {
            modalContent.classList.add('scale-in');
        }
        
        // Auto-hide after 8 seconds
        setTimeout(() => {
            if (this.modal.style.display === 'flex') {
                this.hideModal();
            }
        }, 8000);
    }
    
    hideModal() {
        if (!this.modal) return;
        
        this.modal.classList.add('fade-out');
        this.modal.classList.remove('fade-in');
        
        const modalContent = this.modal.querySelector('.modal-content');
        if (modalContent) {
            modalContent.classList.remove('scale-in');
        }
        
        setTimeout(() => {
            this.modal.style.display = 'none';
            this.modal.classList.remove('fade-out');
        }, 200);
    }
    
    // Particle effects for dramatic moments
    createParticleEffect(element, type = 'success') {
        const particles = [];
        const particleCount = 20;
        const colors = {
            success: ['#28a745', '#20c997', '#17a2b8'],
            error: ['#dc3545', '#fd7e14', '#ffc107'],
            warning: ['#ffc107', '#fd7e14', '#e83e8c']
        };
        
        const rect = element.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        
        for (let i = 0; i < particleCount; i++) {
            this.createParticle(centerX, centerY, colors[type] || colors.success);
        }
    }
    
    createParticle(x, y, colors) {
        const particle = document.createElement('div');
        particle.style.cssText = `
            position: fixed;
            width: 6px;
            height: 6px;
            background: ${colors[Math.floor(Math.random() * colors.length)]};
            border-radius: 50%;
            pointer-events: none;
            z-index: 9999;
            left: ${x}px;
            top: ${y}px;
        `;
        
        document.body.appendChild(particle);
        
        // Animate particle
        const angle = Math.random() * Math.PI * 2;
        const velocity = 100 + Math.random() * 100;
        const life = 1000 + Math.random() * 1000;
        
        const deltaX = Math.cos(angle) * velocity;
        const deltaY = Math.sin(angle) * velocity - 50; // Add upward bias
        
        particle.animate([
            {
                transform: 'translate(0, 0) scale(1)',
                opacity: 1
            },
            {
                transform: `translate(${deltaX}px, ${deltaY}px) scale(0.1)`,
                opacity: 0
            }
        ], {
            duration: life,
            easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)'
        }).onfinish = () => {
            particle.remove();
        };
    }
    
    // Screen shake effect for dramatic failures
    shakeScreen(intensity = 'medium') {
        const intensities = {
            light: { distance: 2, duration: 200 },
            medium: { distance: 5, duration: 400 },
            heavy: { distance: 10, duration: 600 }
        };
        
        const config = intensities[intensity] || intensities.medium;
        const body = document.body;
        
        const keyframes = [];
        const steps = 10;
        
        for (let i = 0; i <= steps; i++) {
            const x = (Math.random() - 0.5) * config.distance;
            const y = (Math.random() - 0.5) * config.distance;
            keyframes.push({
                transform: `translate(${x}px, ${y}px)`
            });
        }
        
        keyframes.push({ transform: 'translate(0, 0)' });
        
        body.animate(keyframes, {
            duration: config.duration,
            easing: 'ease-out'
        });
    }
    
    // Highlight effect for important elements
    highlightElement(element, color = '#ffc107', duration = 2000) {
        if (!element) return;
        
        const originalBoxShadow = element.style.boxShadow;
        const highlightShadow = `0 0 20px ${color}, 0 0 40px ${color}`;
        
        element.style.transition = 'box-shadow 0.3s ease';
        element.style.boxShadow = highlightShadow;
        
        setTimeout(() => {
            element.style.boxShadow = originalBoxShadow;
            setTimeout(() => {
                element.style.transition = '';
            }, 300);
        }, duration);
    }
    
    // Pulse effect for attention
    pulseElement(element, scale = 1.1, duration = 600) {
        if (!element) return;
        
        element.animate([
            { transform: 'scale(1)' },
            { transform: `scale(${scale})` },
            { transform: 'scale(1)' }
        ], {
            duration: duration,
            easing: 'ease-in-out'
        });
    }
    
    // Create success confetti
    createConfetti() {
        const confettiCount = 50;
        const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#ffeaa7', '#fab1a0'];
        
        for (let i = 0; i < confettiCount; i++) {
            setTimeout(() => {
                this.createConfettiPiece(colors);
            }, i * 50);
        }
    }
    
    createConfettiPiece(colors) {
        const confetti = document.createElement('div');
        const size = Math.random() * 8 + 4;
        
        confetti.style.cssText = `
            position: fixed;
            width: ${size}px;
            height: ${size}px;
            background: ${colors[Math.floor(Math.random() * colors.length)]};
            top: -10px;
            left: ${Math.random() * 100}vw;
            pointer-events: none;
            z-index: 9999;
            border-radius: ${Math.random() > 0.5 ? '50%' : '0'};
        `;
        
        document.body.appendChild(confetti);
        
        const fallDuration = Math.random() * 3000 + 2000;
        const rotation = Math.random() * 720 - 360;
        const sway = Math.random() * 100 - 50;
        
        confetti.animate([
            {
                transform: 'translateY(0) rotate(0deg) translateX(0)',
                opacity: 1
            },
            {
                transform: `translateY(100vh) rotate(${rotation}deg) translateX(${sway}px)`,
                opacity: 0
            }
        ], {
            duration: fallDuration,
            easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)'
        }).onfinish = () => {
            confetti.remove();
        };
    }
    
    // Get notification history
    getNotificationHistory() {
        return [...this.notifications];
    }
    
    // Clear all notifications
    clearNotifications() {
        this.notifications = [];
        this.hideNotification();
    }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.visualEffects = new VisualEffects();
    });
} else {
    window.visualEffects = new VisualEffects();
}
