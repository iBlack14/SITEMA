/**
 * 🏛️ DASHBOARD CORE ENGINE (UI-UX-PRO-MAX)
 * Central logic for the TMARC institutional portal
 */

class DashboardApp {
    constructor() {
        this.currentSection = 'inicio';
        this.user = null;
        this.modules = {};
        this.init();
    }

    async init() {
        if (!this.isAuthenticated()) {
            this.redirectToLogin();
            return;
        }

        this.loadModules();
        this.generateSections();
        this.setupEventListeners();
        await this.loadUserData();
        
        // Final UI polish
        this.showSection('inicio');
        this.startPolling();
        console.log('🏛️ TMARC Core Engine Initialized');
    }

    isAuthenticated() {
        return sessionStorage.getItem('userId') && sessionStorage.getItem('authToken');
    }

    getCurrentUserId() {
        return sessionStorage.getItem('userId');
    }

    redirectToLogin() {
        window.location.href = 'login.html';
    }

    loadModules() {
        const moduleMap = {
            'solicitudes': typeof SolicitudesModule !== 'undefined' ? SolicitudesModule : null,
            'notificaciones': typeof NotificacionesModule !== 'undefined' ? NotificacionesModule : null,
            'expedientes': typeof ExpedientesModule !== 'undefined' ? ExpedientesModule : null,
            'configuracion': typeof ConfiguracionModule !== 'undefined' ? ConfiguracionModule : null,
            'mesaPartes': typeof MesaPartesModule !== 'undefined' ? MesaPartesModule : null
        };

        for (const [key, ModuleClass] of Object.entries(moduleMap)) {
            if (ModuleClass) {
                this.modules[key] = new ModuleClass(this);
                window[`${key}Module`] = this.modules[key];
            }
        }
    }

    generateSections() {
        if (typeof DashboardSections !== 'undefined') {
            this.sectionsGenerator = new DashboardSections(this);
            this.sectionsGenerator.generateSections();
        }
    }

    setupEventListeners() {
        // Sidebar Toggle
        const toggleBtn = document.getElementById('sidebar-toggle');
        if (toggleBtn) {
            toggleBtn.addEventListener('click', () => this.toggleSidebar());
        }

        // Global Modal Listeners
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal-overlay')) this.closeAllModals();
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') this.closeAllModals();
        });
    }

    toggleSidebar() {
        const sidebar = document.getElementById('sidebar');
        if (sidebar) {
            sidebar.classList.toggle('collapsed');
            localStorage.setItem('sidebarCollapsed', sidebar.classList.contains('collapsed'));
        }
    }

    showSection(sectionId, event) {
        this.currentSection = sectionId;

        // Update Nav UI
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.toggle('active', item.getAttribute('data-section') === sectionId);
        });

        // Hide/Show Sections
        document.querySelectorAll('.content-section').forEach(section => {
            section.classList.toggle('active', section.id === sectionId);
        });

        this.loadSectionData(sectionId);
    }

    async loadUserData() {
        try {
            const userId = this.getCurrentUserId();
            const response = await fetch(`/api/auth/me?usuario_id=${userId}`);
            const data = await response.json();

            if (data.success) {
                this.user = data.data;
                this.updateUserProfile();
            }
        } catch (error) {
            console.error('Error loading user data:', error);
        }
    }

    updateUserProfile() {
        if (!this.user) return;
        const nameEl = document.getElementById('userName');
        if (nameEl) nameEl.textContent = this.user.nombre || 'Usuario';
    }

    async loadSectionData(sectionId) {
        const module = this.modules[sectionId === 'casilla' ? 'notificaciones' : sectionId === 'mesa' ? 'mesaPartes' : sectionId];
        if (module && typeof module.init === 'function') {
            await module.init();
        } else if (sectionId === 'inicio') {
            await this.loadDashboardStats();
        }
    }

    async loadDashboardStats() {
        // Logic to fetch global stats for the home section
        console.log('Syncing global statistics...');
    }

    openModal(title, contentHtml) {
        const modal = document.getElementById('modalGeneral');
        const titleEl = document.getElementById('modalTitle');
        const bodyEl = document.getElementById('modalBody');

        if (modal && titleEl && bodyEl) {
            titleEl.textContent = title;
            bodyEl.innerHTML = contentHtml;
            modal.classList.add('active');
            document.body.style.overflow = 'hidden';
        }
    }

    closeAllModals() {
        const modal = document.getElementById('modalGeneral');
        if (modal) {
            modal.classList.remove('active');
            document.body.style.overflow = '';
        }
    }

    startPolling() {
        setInterval(() => this.syncData(), 60000); // Sync every minute
    }

    async syncData() {
        if (this.currentSection === 'inicio') await this.loadDashboardStats();
    }

    async logout() {
        const result = await Swal.fire({
            title: '🚪 Cerrar Sesión',
            text: '¿Finalizar su sesión institucional?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Cerrar Sesión',
            cancelButtonText: 'Permanecer',
            confirmButtonColor: '#D4AF37',
            cancelButtonColor: '#1E1E1E'
        });

        if (result.isConfirmed) {
            sessionStorage.clear();
            window.location.href = 'login.html';
        }
    }
}

// Export for window scope
window.DashboardApp = DashboardApp;