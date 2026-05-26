/**
 * 🏛️ TMARC DASHBOARD INTERACTIONS - ENHANCED
 * Professional UI Interactions & User Experience
 */

class DashboardInteractions {
    constructor() {
        this.init();
    }

    init() {
        this.setupSidebarToggle();
        this.setupNotificationDropdown();
        this.setupUserDropdown();
        this.setupSearchFilters();
        this.setupGlobalSearch();
        this.setupTooltips();
        this.setupAnimations();
        this.setupKeyboardShortcuts();
        console.log('🎯 Dashboard Interactions initialized');
    }

    // Sidebar Toggle Enhancement
    setupSidebarToggle() {
        const sidebar = document.getElementById('sidebar');
        const toggleBtn = document.getElementById('sidebar-toggle');
        
        if (toggleBtn && sidebar) {
            toggleBtn.addEventListener('click', () => {
                sidebar.classList.toggle('collapsed');
                
                // Save state to localStorage
                const isCollapsed = sidebar.classList.contains('collapsed');
                localStorage.setItem('sidebarCollapsed', isCollapsed);
                
                // Animate toggle button
                toggleBtn.style.transform = 'scale(0.9)';
                setTimeout(() => {
                    toggleBtn.style.transform = 'scale(1)';
                }, 150);
            });

            // Restore sidebar state
            const savedState = localStorage.getItem('sidebarCollapsed');
            if (savedState === 'true') {
                sidebar.classList.add('collapsed');
            }
        }
    }

    // Enhanced Notification Dropdown
    setupNotificationDropdown() {
        const notificationBtn = document.getElementById('btn-notification-bell');
        const dropdown = document.getElementById('notification-dropdown');
        
        if (notificationBtn && dropdown) {
            notificationBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.toggleNotificationDropdown();
            });

            // Close dropdown when clicking outside
            document.addEventListener('click', (e) => {
                if (!dropdown.contains(e.target) && !notificationBtn.contains(e.target)) {
                    this.closeNotificationDropdown();
                }
            });

            // Close on escape key
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape') {
                    this.closeNotificationDropdown();
                }
            });
        }
    }

    toggleNotificationDropdown() {
        const dropdown = document.getElementById('notification-dropdown');
        if (dropdown) {
            dropdown.classList.toggle('active');
            
            if (dropdown.classList.contains('active')) {
                this.loadNotifications();
            }
        }
    }

    closeNotificationDropdown() {
        const dropdown = document.getElementById('notification-dropdown');
        if (dropdown) {
            dropdown.classList.remove('active');
        }
    }

    async loadNotifications() {
        const notificationList = document.getElementById('notification-list');
        if (!notificationList) return;

        // Show loading state
        notificationList.innerHTML = `
            <div class="notification-loading" style="padding: 40px; text-align: center;">
                <div class="spinner small"></div>
                <p style="margin-top: 12px; color: var(--color-text-muted); font-size: 14px;">Cargando notificaciones...</p>
            </div>
        `;

        try {
            // Simulate API call - replace with actual endpoint
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // Mock notifications data
            const notifications = [
                {
                    id: 1,
                    title: 'Nueva solicitud recibida',
                    message: 'Expediente EXP-2024-001 requiere revisión',
                    time: 'Hace 5 minutos',
                    unread: true,
                    type: 'info'
                },
                {
                    id: 2,
                    title: 'Documento procesado',
                    message: 'El documento DOC-2024-045 ha sido procesado exitosamente',
                    time: 'Hace 1 hora',
                    unread: true,
                    type: 'success'
                },
                {
                    id: 3,
                    title: 'Recordatorio de vencimiento',
                    message: 'El plazo para EXP-2024-002 vence mañana',
                    time: 'Hace 2 horas',
                    unread: false,
                    type: 'warning'
                }
            ];

            this.renderNotifications(notifications);
            this.updateNotificationBadge(notifications.filter(n => n.unread).length);
            
        } catch (error) {
            console.error('Error loading notifications:', error);
            notificationList.innerHTML = `
                <div class="notification-error" style="padding: 40px; text-align: center;">
                    <p style="color: var(--color-error); font-size: 14px;">Error al cargar notificaciones</p>
                </div>
            `;
        }
    }

    renderNotifications(notifications) {
        const notificationList = document.getElementById('notification-list');
        if (!notificationList) return;

        if (notifications.length === 0) {
            notificationList.innerHTML = `
                <div class="empty-state" style="padding: 40px; text-align: center;">
                    <svg class="empty-state-icon" viewBox="0 0 24 24" width="48" height="48" fill="currentColor">
                        <path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.89 2 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z"/>
                    </svg>
                    <p style="color: var(--color-text-muted); margin-top: 12px;">No hay notificaciones</p>
                </div>
            `;
            return;
        }

        const notificationHTML = notifications.map(notification => `
            <div class="notification-item ${notification.unread ? 'unread' : ''}" data-id="${notification.id}">
                <div class="notification-content">
                    <div class="notification-icon ${notification.type}">
                        ${this.getNotificationIcon(notification.type)}
                    </div>
                    <div class="notification-text">
                        <div class="notification-message">${notification.message}</div>
                        <div class="notification-time">${notification.time}</div>
                    </div>
                </div>
            </div>
        `).join('');

        notificationList.innerHTML = notificationHTML;

        // Add click handlers
        notificationList.querySelectorAll('.notification-item').forEach(item => {
            item.addEventListener('click', () => {
                const id = item.dataset.id;
                this.markNotificationAsRead(id);
                item.classList.remove('unread');
            });
        });
    }

    getNotificationIcon(type) {
        const icons = {
            info: '<svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/></svg>',
            success: '<svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>',
            warning: '<svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"/></svg>',
            error: '<svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>'
        };
        return icons[type] || icons.info;
    }

    updateNotificationBadge(count) {
        const badge = document.getElementById('notif-badge');
        if (badge) {
            if (count > 0) {
                badge.textContent = count > 99 ? '99+' : count;
                badge.style.display = 'flex';
            } else {
                badge.style.display = 'none';
            }
        }
    }

    markNotificationAsRead(id) {
        // Implement API call to mark notification as read
        console.log('Marking notification as read:', id);
    }

    // User Dropdown Menu
    setupUserDropdown() {
        const userBtn = document.getElementById('user-menu-btn');
        const dropdown = document.getElementById('user-dropdown');
        
        if (userBtn && dropdown) {
            userBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                dropdown.parentElement.classList.toggle('active');
            });

            // Close dropdown when clicking outside
            document.addEventListener('click', (e) => {
                if (!dropdown.contains(e.target) && !userBtn.contains(e.target)) {
                    dropdown.parentElement.classList.remove('active');
                }
            });
        }
    }

    // Search Filters
    setupSearchFilters() {
        const filterBtns = document.querySelectorAll('.filter-btn');
        
        filterBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                // Remove active class from all buttons
                filterBtns.forEach(b => b.classList.remove('active'));
                
                // Add active class to clicked button
                btn.classList.add('active');
                
                // Get filter value
                const filter = btn.dataset.filter;
                this.applySearchFilter(filter);
            });
        });
    }

    applySearchFilter(filter) {
        console.log('Applying filter:', filter);
        // Implement filter logic here
        
        // Show loading state
        this.showSearchLoading();
        
        // Simulate API call
        setTimeout(() => {
            this.hideSearchLoading();
            // Update results based on filter
        }, 500);
    }

    // Global Search Enhancement
    setupGlobalSearch() {
        const searchInput = document.getElementById('global-search');
        
        if (searchInput) {
            let searchTimeout;
            
            searchInput.addEventListener('input', (e) => {
                clearTimeout(searchTimeout);
                const query = e.target.value.trim();
                
                if (query.length >= 2) {
                    searchTimeout = setTimeout(() => {
                        this.performSearch(query);
                    }, 300);
                } else {
                    this.clearSearchResults();
                }
            });

            // Search on Enter key
            searchInput.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    const query = e.target.value.trim();
                    if (query.length >= 2) {
                        this.performSearch(query);
                    }
                }
            });
        }
    }

    async performSearch(query) {
        console.log('Searching for:', query);
        this.showSearchLoading();
        
        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 800));
            
            // Mock search results
            const results = [
                { type: 'expediente', title: `Expediente EXP-2024-${Math.floor(Math.random() * 100)}`, description: 'Resultado de búsqueda...' },
                { type: 'solicitud', title: `Solicitud SOL-2024-${Math.floor(Math.random() * 100)}`, description: 'Resultado de búsqueda...' }
            ];
            
            this.showSearchResults(results);
            
        } catch (error) {
            console.error('Search error:', error);
        } finally {
            this.hideSearchLoading();
        }
    }

    showSearchLoading() {
        // Add loading indicator to search bar
        const searchBar = document.querySelector('.search-bar');
        if (searchBar) {
            searchBar.classList.add('loading');
        }
    }

    hideSearchLoading() {
        const searchBar = document.querySelector('.search-bar');
        if (searchBar) {
            searchBar.classList.remove('loading');
        }
    }

    showSearchResults(results) {
        // Implement search results display
        console.log('Search results:', results);
    }

    clearSearchResults() {
        // Clear search results
        console.log('Clearing search results');
    }

    // Tooltips Enhancement
    setupTooltips() {
        const tooltipElements = document.querySelectorAll('[title]');
        
        tooltipElements.forEach(element => {
            const title = element.getAttribute('title');
            element.removeAttribute('title');
            
            const tooltip = document.createElement('div');
            tooltip.className = 'tooltip-content';
            tooltip.textContent = title;
            
            element.appendChild(tooltip);
            element.classList.add('tooltip');
        });
    }

    // Smooth Animations
    setupAnimations() {
        // Intersection Observer for fade-in animations
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('fade-in');
                }
            });
        }, observerOptions);

        // Observe elements that should animate
        document.querySelectorAll('.dashboard-card, .stat-card, .activity-item').forEach(el => {
            observer.observe(el);
        });
    }

    // Keyboard Shortcuts
    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Ctrl/Cmd + K for search focus
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                const searchInput = document.getElementById('global-search');
                if (searchInput) {
                    searchInput.focus();
                }
            }
            
            // Ctrl/Cmd + B for sidebar toggle
            if ((e.ctrlKey || e.metaKey) && e.key === 'b') {
                e.preventDefault();
                const toggleBtn = document.getElementById('sidebar-toggle');
                if (toggleBtn) {
                    toggleBtn.click();
                }
            }
        });
    }

    // Utility Methods
    showToast(message, type = 'info', duration = 3000) {
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.innerHTML = `
            <div class="toast-content">
                <span class="toast-message">${message}</span>
                <button class="toast-close" onclick="this.parentElement.parentElement.remove()">×</button>
            </div>
        `;
        
        document.body.appendChild(toast);
        
        // Auto remove after duration
        setTimeout(() => {
            if (toast.parentElement) {
                toast.remove();
            }
        }, duration);
        
        // Animate in
        setTimeout(() => {
            toast.classList.add('show');
        }, 100);
    }

    showModal(title, content, actions = []) {
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3 class="modal-title">${title}</h3>
                    <button class="modal-close" onclick="this.closest('.modal-overlay').remove()">×</button>
                </div>
                <div class="modal-body">
                    ${content}
                </div>
                <div class="modal-actions">
                    ${actions.map(action => `
                        <button class="btn ${action.class || 'btn-secondary'}" onclick="${action.onclick || ''}">
                            ${action.text}
                        </button>
                    `).join('')}
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Show modal
        setTimeout(() => {
            modal.classList.add('active');
        }, 100);
        
        // Close on overlay click
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });
        
        return modal;
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.dashboardInteractions = new DashboardInteractions();
});

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DashboardInteractions;
}