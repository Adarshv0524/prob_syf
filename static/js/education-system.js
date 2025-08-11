/**
 * Education System - Manages educational content and modals
 */
class EducationSystem {
    constructor() {
        this.modal = null;
        this.isModalOpen = false;
        this.educationHistory = [];
        
        this.init();
    }
    
    async init() {
        try {
            await this.waitForEngine();
            this.setupModal();
            this.bindEvents();
            this.scheduleWelcomeMessage();
            
            console.log('📚 Education System initialized');
            
        } catch (error) {
            console.error('❌ Failed to initialize Education System:', error);
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
                    } else if (attempts > 50) {
                        clearInterval(checkInterval);
                        reject(new Error('Probability Engine not available'));
                    }
                }, 100);
            }
        });
    }
    
    setupModal() {
        this.modal = document.getElementById('modalOverlay');
        if (!this.modal) {
            this.createModal();
        }
    }
    
    createModal() {
        this.modal = document.createElement('div');
        this.modal.className = 'modal-overlay';
        this.modal.id = 'modalOverlay';
        this.modal.innerHTML = `
            <div class="educational-modal" id="educationalModal">
                <div class="modal-header">
                    <h3 class="modal-title" id="modalTitle">Educational Content</h3>
                    <button class="modal-close" id="modalClose">&times;</button>
                </div>
                <div class="modal-body" id="modalBody"></div>
                <div class="modal-footer">
                    <button class="modal-action-btn" id="modalActionBtn">Continue Learning</button>
                </div>
            </div>
        `;
        document.body.appendChild(this.modal);
    }
    
    bindEvents() {
        // Engine events for educational content
        window.probabilityEngine.on('education:show', (data) => {
            this.showModal(data.title, data.content);
        });
        
        // Education button
        const educationBtn = document.getElementById('educationBtn');
        if (educationBtn) {
            educationBtn.addEventListener('click', () => {
                this.showGeneralEducation();
            });
        }
        
        // Modal events
        const closeBtn = this.modal?.querySelector('#modalClose');
        const actionBtn = this.modal?.querySelector('#modalActionBtn');
        
        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.hideModal());
        }
        
        if (actionBtn) {
            actionBtn.addEventListener('click', () => this.hideModal());
        }
        
        // Click outside to close
        this.modal?.addEventListener('click', (e) => {
            if (e.target === this.modal) {
                this.hideModal();
            }
        });
        
        // ESC key to close
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isModalOpen) {
                this.hideModal();
            }
        });
    }
    
    scheduleWelcomeMessage() {
        // Show welcome message after short delay
        setTimeout(() => {
            this.showWelcomeEducation();
        }, 2000);
    }
    
    // ===== MODAL MANAGEMENT =====
    
    showModal(title, content) {
        if (this.isModalOpen) return;
        
        const titleElement = this.modal.querySelector('#modalTitle');
        const bodyElement = this.modal.querySelector('#modalBody');
        
        if (titleElement) titleElement.textContent = title;
        if (bodyElement) bodyElement.innerHTML = content;
        
        this.modal.style.display = 'flex';
        this.modal.classList.add('show');
        this.isModalOpen = true;
        
        // Add to history
        this.educationHistory.push({
            title,
            content,
            timestamp: Date.now()
        });
        
        // Auto-close after 15 seconds
        setTimeout(() => {
            if (this.isModalOpen) {
                this.hideModal();
            }
        }, 15000);
    }
    
    hideModal() {
        if (!this.isModalOpen) return;
        
        this.modal.classList.remove('show');
        
        setTimeout(() => {
            this.modal.style.display = 'none';
            this.isModalOpen = false;
        }, 300);
    }
    
    // ===== EDUCATIONAL CONTENT GENERATORS =====
    
    showWelcomeEducation() {
        const content = `
            <div class="education-box">
                <h4>🎓 Welcome to the Interactive Probability Tower!</h4>
                <p>This simulation demonstrates <strong>series system reliability</strong> - a fundamental concept in engineering and probability theory.</p>
            </div>
            
            <div class="education-box success">
                <h4>🔧 What You'll Learn</h4>
                <ul>
                    <li><strong>Series Systems:</strong> How components work together in sequence</li>
                    <li><strong>Multiplication Rule:</strong> P(System) = P(A) × P(B) × P(C) × P(D)</li>
                    <li><strong>Weakest Link Principle:</strong> One failure affects the entire system</li>
                    <li><strong>Real-world Applications:</strong> From Christmas lights to nuclear reactors</li>
                </ul>
            </div>
            
            <div class="math-equation">
                Current State: 1 × 1 × 1 × 1 = 1.00 (100% Reliable)
            </div>
            
            <div class="education-box warning">
                <h4>🎮 Try These Experiments</h4>
                <ul>
                    <li><strong>Drag any component</strong> away to see instant failure</li>
                    <li><strong>Use fail buttons</strong> for controlled testing</li>
                    <li><strong>Try random failures</strong> to see unpredictable events</li>
                    <li><strong>Observe the mathematics</strong> change in real-time</li>
                </ul>
            </div>
        `;
        
        this.showModal('Welcome to Probability Tower Lab', content);
    }
    
    showGeneralEducation() {
        const systemState = window.probabilityEngine.getSystemState();
        const workingCount = window.probabilityEngine.getWorkingComponents().length;
        const failedCount = window.probabilityEngine.getFailedComponents().length;
        
        const content = `
            <div class="education-box">
                <h4>📊 Current System Analysis</h4>
                <p><strong>System Probability:</strong> ${systemState.probability.toFixed(2)} (${Math.round(systemState.probability * 100)}%)</p>
                <p><strong>Working Components:</strong> ${workingCount}/4</p>
                <p><strong>Failed Components:</strong> ${failedCount}/4</p>
                <p><strong>System Status:</strong> ${systemState.operational ? '✅ Operational' : '❌ Failed'}</p>
            </div>
            
            <div class="math-equation">
                ${Object.keys(window.probabilityEngine.components).map(k => 
                    window.probabilityEngine.components[k].probability.toFixed(2)
                ).join(' × ')} = ${systemState.probability.toFixed(2)}
            </div>
            
            <div class="education-box ${systemState.operational ? 'success' : 'error'}">
                <h4>🔬 Understanding Series Systems</h4>
                <p><strong>Key Principle:</strong> In a series system, ALL components must function for the system to work.</p>
                <p><strong>Mathematical Rule:</strong> System reliability equals the product of all component reliabilities.</p>
                <p><strong>Critical Insight:</strong> ${systemState.operational ? 
                    'When all components work (probability = 1), the system achieves 100% reliability.' :
                    'When ANY component fails (probability = 0), the entire system fails because 0 × anything = 0.'
                }</p>
            </div>
            
            <div class="education-box warning">
                <h4>🌍 Real-World Examples</h4>
                <ul>
                    <li><strong>Christmas Lights:</strong> Old-style lights wired in series - one bulb fails, all go dark</li>
                    <li><strong>Manufacturing:</strong> Assembly line where each station must complete its task</li>
                    <li><strong>Safety Systems:</strong> Nuclear plant safety where all barriers must hold</li>
                    <li><strong>Electronics:</strong> Simple circuits without redundancy or parallel paths</li>
                    <li><strong>Supply Chain:</strong> When every link in the chain is critical</li>
                </ul>
            </div>
            
            <div class="education-box">
                <h4>🎯 Advanced Concepts to Explore</h4>
                <ul>
                    <li><strong>Reliability Engineering:</strong> How engineers design robust systems</li>
                    <li><strong>Parallel Systems:</strong> Redundancy where backup components exist</li>
                    <li><strong>Fault Tolerance:</strong> Systems designed to continue working despite failures</li>
                    <li><strong>MTBF (Mean Time Between Failures):</strong> Predicting component lifespans</li>
                </ul>
            </div>
            
            ${failedCount > 0 ? `
                <div class="education-box error">
                    <h4>💡 Your Next Challenge</h4>
                    <p>You currently have ${failedCount} failed component${failedCount > 1 ? 's' : ''}. Try:</p>
                    <ul>
                        <li>Restoring them one by one and watching probability change</li>
                        <li>Predicting the system probability before restoring</li>
                        <li>Understanding why each restoration multiplies the reliability</li>
                    </ul>
                </div>
            ` : `
                <div class="education-box success">
                    <h4>🏆 Perfect System State!</h4>
                    <p>All components are working! Try experimenting with different failure scenarios:</p>
                    <ul>
                        <li>Fail just one component and see the dramatic effect</li>
                        <li>Fail multiple components and observe compound effects</li>
                        <li>Use the random failure button for surprises</li>
                    </ul>
                </div>
            `}
        `;
        
        this.showModal('Probability Tower - Deep Dive', content);
    }
    
    // ===== PUBLIC API =====
    
    isEducationModalOpen() {
        return this.isModalOpen;
    }
    
    getEducationHistory() {
        return [...this.educationHistory];
    }
    
    clearEducationHistory() {
        this.educationHistory = [];
    }
    
    showCustomEducation(title, content) {
        this.showModal(title, content);
    }
}

// Initialize education system
window.educationSystem = new EducationSystem();
