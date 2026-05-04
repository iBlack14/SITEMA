/**
 * Dashboard Core Module
 * Main functionality for the user dashboard
 */

class DashboardApp {
    constructor() {
        this.currentSection = 'inicio';
        this.user = null;
        this.notifications = [];
        this.solicitudes = [];
        this.expedientes = [];
        this.modules = {};

        this.init();
    }

    /**
     * Initialize the dashboard
     */
    async init() {
        // Verificar autenticación antes de inicializar
        if (!this.isAuthenticated()) {
            this.redirectToLogin();
            return;
        }

        this.loadModules();
        this.generateSections();
        this.setupEventListeners();
        this.processUrlParameters();
        await this.loadUserData();
        await this.loadDashboardData();
        
        // Mostrar sección Inicio por defecto
        this.showSection('inicio');
        
        this.startPolling();
    }

    /**
     * Check if user is authenticated
     */
    isAuthenticated() {
        const userId = sessionStorage.getItem('userId');
        const authToken = sessionStorage.getItem('authToken');
        
        return userId && authToken;
    }

    /**
     * Get current user ID
     */
    getCurrentUserId() {
        const userId = sessionStorage.getItem('userId');
        
        if (!userId) {
            console.error('No user ID found in session');
            this.redirectToLogin();
            return null;
        }
        
        return userId;
    }

    /**
     * Redirect to login page
     */
    redirectToLogin() {
        console.warn('No authenticated user found, redirecting to login...');
        window.location.href = '/login.html';
    }

    /**
     * Process URL parameters
     */
    processUrlParameters() {
        const urlParams = new URLSearchParams(window.location.search);

        const currentPassword = urlParams.get('currentPassword');
        const newPassword = urlParams.get('newPassword');
        const confirmPassword = urlParams.get('confirmPassword');

        if (currentPassword && newPassword && confirmPassword) {
            // Auto-fill password change form and submit
            setTimeout(() => {
                this.autoChangePassword(currentPassword, newPassword, confirmPassword);
            }, 1000);
        }
    }

    /**
     * Auto change password from URL parameters
     */
    async autoChangePassword(currentPassword, newPassword, confirmPassword) {
        try {
            const usuarioId = this.getCurrentUserId();
            
            if (!usuarioId) {
                this.showError('No se pudo identificar al usuario');
                return;
            }

            // First verify current password
            const verifyResponse = await fetch(`/api/usuarios/${usuarioId}/verify-password`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    password: currentPassword
                })
            });

            const verifyData = await verifyResponse.json();

            if (verifyData.success && verifyData.data.valida) {
                // Change password
                const changeResponse = await fetch(`/api/usuarios/${usuarioId}/password`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        currentPassword: currentPassword,
                        newPassword: newPassword
                    })
                });

                const changeData = await changeResponse.json();

                if (changeData.success) {
                    this.showSuccess('Contraseña cambiada automáticamente desde parámetros URL');
                    // Clean URL
                    this.cleanUrl();
                } else {
                    this.showError('Error cambiando contraseña: ' + changeData.error);
                }
            } else {
                this.showError('Contraseña actual incorrecta');
            }
        } catch (error) {
            console.error('Error auto-changing password:', error);
            this.showError('Error procesando cambio de contraseña automático');
        }
    }

    /**
     * Clean URL parameters
     */
    cleanUrl() {
        const url = new URL(window.location);
        url.search = '';
        window.history.replaceState({}, document.title, url);
    }


    /**
     * Generate dashboard sections
     */
    generateSections() {
        if (typeof DashboardSections !== 'undefined') {
            this.sectionsGenerator = new DashboardSections(this);
            this.sectionsGenerator.generateSections();
        }
    }

    /**
     * Load all modules
     */
    loadModules() {
        try {
            // Load solicitudes module
            if (typeof SolicitudesModule !== 'undefined') {
                this.modules.solicitudes = new SolicitudesModule(this);
                // Make globally available for onclick handlers
                window.solicitudesModule = this.modules.solicitudes;
            }

            // Load notificaciones module
            if (typeof NotificacionesModule !== 'undefined') {
                this.modules.notificaciones = new NotificacionesModule(this);
                window.notificacionesModule = this.modules.notificaciones; // Export globally
            }

            // Load expedientes module
            if (typeof ExpedientesModule !== 'undefined') {
                this.modules.expedientes = new ExpedientesModule(this);
                window.expedientesModule = this.modules.expedientes;
            }

            // Load configuracion module
            if (typeof ConfiguracionModule !== 'undefined') {
                this.modules.configuracion = new ConfiguracionModule(this);
            }

            // Load mesa de partes module
            if (typeof MesaPartesModule !== 'undefined') {
                this.modules.mesaPartes = new MesaPartesModule(this);
                window.mesaPartesModule = this.modules.mesaPartes; // Export globally
            }

            console.log('✅ All modules loaded successfully');
        } catch (error) {
            console.error('❌ Error loading modules:', error);
        }
    }

    /**
     * Setup event listeners
     */
    setupEventListeners() {
        // Sidebar toggle
        const toggleBtn = document.getElementById('sidebar-toggle') || document.querySelector('.toggle-btn');
        if (toggleBtn) {
            toggleBtn.addEventListener('click', () => this.toggleSidebar());
        }

        // Navigation
        const navItems = document.querySelectorAll('.nav-item');
        navItems.forEach(item => {
            item.addEventListener('click', (e) => {
                const section = item.getAttribute('data-section');
                if (section) {
                    this.showSection(section, e);
                }
            });
        });

        // Modals
        this.setupModalListeners();
    }

    /**
     * Setup modal event listeners
     */
    setupModalListeners() {
        // Close modals when clicking outside
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal-overlay')) {
                this.closeAllModals();
            }
        });

        // Escape key to close modals
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeAllModals();
            }
        });
    }

    /**
     * Toggle sidebar collapsed/expanded state
     */
    toggleSidebar() {
        const sidebar = document.getElementById('sidebar');
        const mainContent = document.querySelector('.main-content');

        if (sidebar && mainContent) {
            sidebar.classList.toggle('collapsed');
            if (sidebar.classList.contains('collapsed')) {
                mainContent.style.marginLeft = '70px';
            } else {
                mainContent.style.marginLeft = '220px';
            }
        }
    }

/**
 * Generate dashboard sections
 */
generateSections() {
    if (typeof DashboardSections !== 'undefined') {
        this.sectionsGenerator = new DashboardSections(this);
        this.sectionsGenerator.generateSections();
    }
}

/**
 * Load all modules
 */
loadModules() {
    try {
        // Load solicitudes module
        if (typeof SolicitudesModule !== 'undefined') {
            this.modules.solicitudes = new SolicitudesModule(this);
            // Make globally available for onclick handlers
            window.solicitudesModule = this.modules.solicitudes;
        }

        // Load notificaciones module
        if (typeof NotificacionesModule !== 'undefined') {
            this.modules.notificaciones = new NotificacionesModule(this);
            window.notificacionesModule = this.modules.notificaciones; // Export globally
        }

        // Load expedientes module
        if (typeof ExpedientesModule !== 'undefined') {
            this.modules.expedientes = new ExpedientesModule(this);
            window.expedientesModule = this.modules.expedientes;
        }

        // Load configuracion module
        if (typeof ConfiguracionModule !== 'undefined') {
            this.modules.configuracion = new ConfiguracionModule(this);
        }

        // Load mesa de partes module
        if (typeof MesaPartesModule !== 'undefined') {
            this.modules.mesaPartes = new MesaPartesModule(this);
            window.mesaPartesModule = this.modules.mesaPartes; // Export globally
        }

        console.log('✅ All modules loaded successfully');
    } catch (error) {
        console.error('❌ Error loading modules:', error);
    }
}

/**
 * Setup event listeners
 */
setupEventListeners() {
    // Sidebar toggle
    const toggleBtn = document.getElementById('sidebar-toggle') || document.querySelector('.toggle-btn');
    if (toggleBtn) {
        toggleBtn.addEventListener('click', () => this.toggleSidebar());
    }

    // Navigation
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            const section = item.getAttribute('data-section');
            if (section) {
                this.showSection(section, e);
            }
        });
    });

    // Modals
    this.setupModalListeners();
}

/**
 * Setup modal event listeners
 */
setupModalListeners() {
    // Close modals when clicking outside
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal-overlay')) {
            this.closeAllModals();
        }
    });

    // Escape key to close modals
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            this.closeAllModals();
        }
    });
}

/**
 * Toggle sidebar collapsed/expanded state
 */
toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    const mainContent = document.querySelector('.main-content');

    if (sidebar && mainContent) {
        sidebar.classList.toggle('collapsed');
        if (sidebar.classList.contains('collapsed')) {
            mainContent.style.marginLeft = '70px';
        } else {
            mainContent.style.marginLeft = '220px';
        }
    }
}

/**
 * Show a specific section
 */
showSection(sectionId, event) {
    // Update active nav item
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
    });
    
    if (event && event.currentTarget) {
        event.currentTarget.classList.add('active');
    }

    // Hide all sections
    document.querySelectorAll('.content-section').forEach(section => {
        section.classList.remove('active');
    });

    // Show selected section
    const section = document.getElementById(sectionId);
    if (section) {
        section.classList.add('active');
        
        // Load section-specific data
        this.loadSectionData(sectionId);
    }
}

/**
 * Load user data
 */
async loadUserData() {
        try {
            const usuarioId = this.getCurrentUserId();
            
            if (!usuarioId) {
                console.error('No user ID available');
                this.redirectToLogin();
                return;
            }

            // Try to get user data from session storage first
            const storedUser = sessionStorage.getItem('user');
            if (storedUser) {
                this.user = JSON.parse(storedUser);
                
                // Verificar que el ID del usuario almacenado coincida
                if (this.user.id.toString() === usuarioId) {
                    this.updateUserProfile();
                    await this.loadUserStats(); // Cargar estadísticas
                    return;
                }
            }

            // If no stored user or ID mismatch, get from API
            const response = await fetch(`/api/auth/me?usuario_id=${usuarioId}`);
            
            if (!response.ok) {
                throw new Error('Failed to fetch user data');
            }
            
            const data = await response.json();
            
            if (data.success && data.data) {
                this.user = data.data;
                sessionStorage.setItem('user', JSON.stringify(this.user));
                
                // Verificar que el ID coincida
                if (this.user.id.toString() !== usuarioId) {
                    console.error('User ID mismatch!');
                    this.redirectToLogin();
                    return;
                }
                
                this.updateUserProfile();
                await this.loadUserStats(); // Cargar estadísticas
            } else {
                throw new Error('Invalid user data received');
            }
        } catch (error) {
            console.error('Error loading user data:', error);
            this.showError('Error al cargar datos del usuario');
            
            // En caso de error, redirigir al login
            setTimeout(() => {
                this.redirectToLogin();
            }, 2000);
        }
    }

    /**
     * Update user profile display
     */
    updateUserProfile() {
        if (!this.user) return;

        const userName = document.querySelector('.user-name');
        const userAvatar = document.querySelector('.user-avatar');

        if (userName) {
            userName.textContent = this.user.nombre || 'Usuario';
        }

        if (userAvatar) {
            // Update avatar if needed
            const avatarText = this.user.nombre ? this.user.nombre.charAt(0).toUpperCase() : 'U';
            userAvatar.textContent = avatarText;
        }
    }

    /**
     * Load dashboard data
     */
    async loadDashboardData() {
        try {
            // Verificar que tengamos un usuario válido
            if (!this.user || !this.user.id) {
                console.warn('No user data available for loading dashboard');
                return;
            }

            // Load initial data for all sections
            await Promise.all([
                this.loadSectionData('inicio'),
                this.loadSectionData('solicitudes'),
                this.loadSectionData('casilla'),
                this.loadSectionData('expedientes')
            ]);
        } catch (error) {
            console.error('Error loading dashboard data:', error);
        }
    }

    /**
     * Load section-specific data
     */
    async loadSectionData(sectionId) {
        switch (sectionId) {
            case 'inicio':
                await this.loadInicioData();
                break;
            case 'solicitudes':
                if (this.modules.solicitudes) {
                    await this.modules.solicitudes.loadSolicitudesUsuario();
                }
                break;
            case 'casilla':
                if (this.modules.notificaciones) {
                    await this.modules.notificaciones.loadNotificacionesUsuario();
                }
                break;
            case 'expedientes':
                if (this.modules.expedientes) {
                    await this.modules.expedientes.loadExpedientesUsuario();
                }
                break;
            case 'configuracion':
                if (this.modules.configuracion) {
                    await this.modules.configuracion.loadUserProfile();
                    await this.modules.configuracion.loadSMTPConfig();
                }
                break;
            case 'mesa':
                if (this.modules.mesaPartes) {
                    await this.modules.mesaPartes.loadMesaPartesData();
                }
                break;
        }
    }

    /**
     * Load inicio (home) data
     */
    async loadInicioData() {
        // No hacer nada aquí - las estadísticas y actividades se cargan en loadUserStats()
        console.log('📊 Sección inicio cargada');
    }

    /**
     * Update inicio statistics
     */
    updateInicioStats(stats) {
        if (!stats) return;

        // Update stat cards
        const statCards = document.querySelectorAll('#inicio .stat-value');
        if (statCards.length >= 3) {
            statCards[0].textContent = stats.solicitudes?.pendientes || 0;
            statCards[1].textContent = stats.expedientes?.activos || 0;
            statCards[2].textContent = stats.documentos?.recibidos || 0;
        }
    }

    /**
     * Load solicitudes data
     */
    async loadSolicitudesData() {
        await this.loadSolicitudesUsuario();
    }

    /**
     * Load casilla data
     */
    async loadCasillaData() {
        await this.loadNotificacionesUsuario();
    }

    /**
     * Load expedientes data
     */
    async loadExpedientesData() {
        // Implementation for expedientes data loading
        console.log('Loading expedientes data...');
    }

    /**
     * Load configuracion data
     */
    async loadConfiguracionData() {
        // Implementation for configuracion data loading
        console.log('Loading configuracion data...');
    }

    /**
     * Start polling for real-time updates
     */
    startPolling() {
        // Poll every 30 seconds
        setInterval(() => {
            this.pollForUpdates();
        }, 30000);
    }

    /**
     * Poll for updates
     */
    async pollForUpdates() {
        try {
            // Verificar que el usuario esté autenticado
            if (!this.isAuthenticated()) {
                console.warn('User not authenticated, stopping polling');
                return;
            }

            const updatePromises = [];

            // Update notifications if module is loaded
            if (this.modules.notificaciones) {
                updatePromises.push(this.modules.notificaciones.loadNotificacionesUsuario());
            }

            // Update solicitudes if module is loaded
            if (this.modules.solicitudes) {
                updatePromises.push(this.modules.solicitudes.loadSolicitudesUsuario());
            }

            // Update expedientes if module is loaded
            if (this.modules.expedientes) {
                updatePromises.push(this.modules.expedientes.loadExpedientesUsuario());
            }

            // Update mesa de partes if module is loaded
            if (this.modules.mesaPartes) {
                updatePromises.push(this.modules.mesaPartes.loadMesaPartesData());
            }

            if (updatePromises.length > 0) {
                await Promise.all(updatePromises);
            }
        } catch (error) {
            console.error('Error polling for updates:', error);
        }
    }

    /**
     * Close all modals
     */
    closeAllModals() {
        const modals = document.querySelectorAll('.modal-overlay');
        modals.forEach(modal => {
            modal.classList.remove('active');
        });
        document.body.style.overflow = '';
    }

    /**
     * Show loading state
     */
    showLoading(elementId) {
        const element = document.getElementById(elementId);
        if (element) {
            element.style.display = 'block';
        }
    }

    /**
     * Hide loading state
     */
    hideLoading(elementId) {
        const element = document.getElementById(elementId);
        if (element) {
            element.style.display = 'none';
        }
    }

    /**
     * Show error message
     */
    showError(message, elementId = null) {
        console.error(message);

        if (elementId) {
            const element = document.getElementById(elementId);
            if (element) {
                element.innerHTML = `<div style="color: var(--error);">${message}</div>`;
            }
        } else {
            // Show global error notification
            this.showNotification(message, 'error');
        }
    }

    /**
     * Show success message
     */
    showSuccess(message) {
        this.showNotification(message, 'success');
    }

    /**
     * Show notification
     */
    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <span>${message}</span>
            <button onclick="this.parentElement.remove()">×</button>
        `;

        // Add to DOM
        const container = document.querySelector('.notifications-container') || this.createNotificationsContainer();
        container.appendChild(notification);

        // Auto remove after 5 seconds
        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
        }, 5000);
    }

    /**
     * Create notifications container
     */
    createNotificationsContainer() {
        const container = document.createElement('div');
        container.className = 'notifications-container';
        container.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 10001;
            display: flex;
            flex-direction: column;
            gap: 10px;
        `;
        document.body.appendChild(container);
        return container;
    }

    /**
     * Get status CSS class
     */
    getStatusClass(status) {
        switch (status?.toLowerCase()) {
            case 'aprobado':
            case 'aprobada':
            case 'activo':
            case 'activa':
                return 'status-approved';
            case 'rechazado':
            case 'rechazada':
                return 'status-rejected';
            case 'pendiente':
            default:
                return 'status-pending';
        }
    }

    /**
     * Logout user
     */
    async logout() {
        const result = await Swal.fire({
            title: '🚪 Cerrar Sesión',
            text: '¿Está seguro que desea cerrar sesión?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Aceptar',
            cancelButtonText: 'Cancelar',
            confirmButtonColor: '#D4AF37',
            cancelButtonColor: '#C0C0C0',
            reverseButtons: true,
            customClass: {
                popup: 'swal2-popup-custom',
                confirmButton: 'swal2-confirm-custom',
                cancelButton: 'swal2-cancel-custom'
            }
        });

        if (result.isConfirmed) {
            // Clear session data
            sessionStorage.removeItem('authToken');
            sessionStorage.removeItem('user');
            sessionStorage.removeItem('userId');
            sessionStorage.removeItem('usuarioActual');

            // Redirect to login
            window.location.href = '/login.html';
        }
    }

    /**
     * Load user statistics
     */
    async loadUserStats() {
        try {
            const usuarioId = this.getCurrentUserId();
            if (!usuarioId) return;

            console.log('📊 Cargando estadísticas del usuario...');

            const response = await fetch(`/api/estadisticas/usuario/${usuarioId}`);
            const data = await response.json();

            if (data.success && data.data) {
                this.updateDashboardStats(data.data);
            }

            // Cargar actividades del usuario
            await this.loadUserActivities();
        } catch (error) {
            console.error('Error cargando estadísticas:', error);
        }
    }

    /**
     * Load user activities
     */
    async loadUserActivities() {
        try {
            const usuarioId = this.getCurrentUserId();
            if (!usuarioId) return;

            console.log('📋 Cargando actividades del usuario...');

            const response = await fetch(`/api/estadisticas/usuario/${usuarioId}/actividades?limite=10`);
            const data = await response.json();

            if (data.success && data.data) {
                this.updateActivitiesTable(data.data);
            }
        } catch (error) {
            console.error('Error cargando actividades:', error);
        }
    }

    /**
     * Update activities table
     */
    updateActivitiesTable(actividades) {
        const tbody = document.getElementById('actividades-tbody');
        if (!tbody) return;

        if (!actividades || actividades.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="3" style="text-align: center; color: #666; padding: 20px;">
                        No tienes actividades recientes
                    </td>
                </tr>
            `;
            return;
        }

        tbody.innerHTML = actividades.map(act => {
            const fecha = new Date(act.fecha).toLocaleString('es-ES', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit'
            });

            const estadoClass = this.getStatusClass(act.estado);

            return `
                <tr>
                    <td>${fecha}</td>
                    <td>${act.actividad}</td>
                    <td><span class="status-badge ${estadoClass}">${act.estado}</span></td>
                </tr>
            `;
        }).join('');

        console.log(`✅ ${actividades.length} actividades mostradas`);
    }

    /**
     * Update dashboard statistics
     */
    updateDashboardStats(stats) {
        // Actualizar tarjetas del inicio
        const solicitudesEl = document.getElementById('inicio-solicitudes');
        const expedientesEl = document.getElementById('inicio-expedientes');
        const documentosEl = document.getElementById('inicio-documentos');

        if (solicitudesEl && stats.solicitudes) {
            solicitudesEl.textContent = stats.solicitudes.pendientes;
        }

        if (expedientesEl && stats.expedientes) {
            expedientesEl.textContent = stats.expedientes.activos;
        }

        if (documentosEl && stats.documentos) {
            documentosEl.textContent = stats.documentos.total;
        }

        console.log('✅ Estadísticas actualizadas:', stats);
    }
}

// Initialize dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.dashboardApp = new DashboardApp();
});

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DashboardApp;
}