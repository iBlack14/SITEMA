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

        this.generateSections();
        this.loadModules();
        this.setupEventListeners();
        await this.loadUserData();
        
        // Final UI polish
        this.handleRouting();
        this.startHeartbeat();
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

        // Browser Routing Support
        window.addEventListener('popstate', () => this.handleRouting());

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
        if (event) event.preventDefault();
        
        // Mapeo de títulos Pro
        const titles = {
            'inicio': 'Panel Principal',
            'solicitudes': 'Gestión de Solicitudes',
            'casilla': 'Casilla Electrónica Judicial',
            'expedientes': 'Seguimiento de Expedientes',
            'mesa': 'Mesa de Partes Virtual',
            'configuracion': 'Configuración del Sistema'
        };

        this.currentSection = sectionId;
        
        // Actualizar URL sin recargar
        window.location.hash = sectionId;
        
        // Actualizar Título de Navegador
        document.title = `TMARC | ${titles[sectionId] || 'Dashboard'}`;

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

    handleRouting() {
        const hash = window.location.hash.replace('#', '') || 'inicio';
        this.showSection(hash);
    }

    async loadUserData() {
        try {
            const userId = this.getCurrentUserId();
            
            // Intento 1: Usar datos de sesión para carga instantánea
            const cachedName = sessionStorage.getItem('userName');
            if (cachedName) {
                const nameEl = document.getElementById('userName');
                if (nameEl) nameEl.textContent = cachedName;
            }

            // Intento 2: Sincronizar con la BD para datos frescos
            const response = await fetch(`/api/usuarios/${userId}`);
            const data = await response.json();

            if (data.success) {
                this.user = data.data;
                this.updateUserProfile();
                
                // Actualizar caché de sesión
                if (this.user.nombre) sessionStorage.setItem('userName', this.user.nombre);
            }
        } catch (error) {
            console.error('⚠️ Error sincronizando datos de perfil:', error);
        }
    }

    updateUserProfile() {
        if (!this.user) return;
        
        // Update Name
        const nameEl = document.getElementById('userName');
        if (nameEl) nameEl.textContent = this.user.nombre || 'Usuario';
        
        // Update Photo
        const photoImg = document.getElementById('userPhoto');
        const defaultAvatar = document.getElementById('userDefaultAvatar');
        
        if (this.user.foto_perfil && photoImg && defaultAvatar) {
            photoImg.src = this.user.foto_perfil;
            photoImg.style.display = 'block';
            defaultAvatar.style.display = 'none';
            
            // Handle broken image links
            photoImg.onerror = () => {
                photoImg.style.display = 'none';
                defaultAvatar.style.display = 'block';
            };
        } else if (photoImg && defaultAvatar) {
            photoImg.style.display = 'none';
            defaultAvatar.style.display = 'block';
        }
    }

    async loadSectionData(sectionId) {
        const module = this.modules[sectionId === 'casilla' ? 'notificaciones' : sectionId === 'mesa' ? 'mesaPartes' : sectionId];
        
        // Carga inteligente bajo demanda (Lazy Loading)
        if (module) {
            // Solo sincronizar si han pasado más de 30 segundos o si nunca se ha cargado
            const now = Date.now();
            if (!module.lastSync || (now - module.lastSync > 30000)) {
                
                // Mapear el nombre de la función de carga según el módulo
                const loadFn = module.loadSolicitudesUsuario || 
                             module.loadNotificacionesUsuario || 
                             module.loadExpedientesUsuario || 
                             module.loadMesaPartesData;

                if (typeof loadFn === 'function') {
                    await loadFn.call(module);
                    module.lastSync = now;
                }
            }
        } else if (sectionId === 'inicio') {
            await this.loadDashboardStats();
            await this.loadRecentActivity();
        }
    }

    showLoading() {
        const loader = document.getElementById('loading-overlay');
        if (loader) {
            loader.style.display = 'flex';
        }
    }

    hideLoading() {
        const loader = document.getElementById('loading-overlay');
        if (loader) {
            loader.style.display = 'none';
        }
    }

    async loadRecentActivity() {
        console.log('🏛️ Sincronizando actividad reciente...');
        const tbody = document.getElementById('actividades-tbody');
        if (!tbody) return;

        try {
            const usuarioId = this.getCurrentUserId();
            const response = await fetch(`/api/estadisticas/usuario/${usuarioId}/actividades?limite=5`);
            const data = await response.json();

            if (data.success && data.data && data.data.length > 0) {
                tbody.innerHTML = data.data.map(act => {
                    const date = new Date(act.fecha).toLocaleDateString('es-PE', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                    });
                    
                    let badgeClass = 'badge-info';
                    const estado = (act.estado || '').toLowerCase();
                    if (estado.includes('pendiente')) badgeClass = 'badge-warning';
                    if (estado.includes('aprobado') || estado.includes('leída')) badgeClass = 'badge-success';
                    if (estado.includes('rechazado')) badgeClass = 'badge-error';

                    return `
                        <tr>
                            <td>${date}</td>
                            <td>
                                <div style="display: flex; align-items: center; gap: 10px;">
                                    <div class="activity-icon" style="background: rgba(212,175,55,0.1); color: var(--color-primary); width: 32px; height: 32px; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 14px;">
                                        ${this.getActivityIcon(act.tipo)}
                                    </div>
                                    <span style="font-weight: 500;">${act.actividad || act.accion}</span>
                                </div>
                            </td>
                            <td><span class="badge ${badgeClass}">${act.estado || 'Procesado'}</span></td>
                        </tr>
                    `;
                }).join('');
            } else {
                tbody.innerHTML = '<tr><td colspan="3" class="text-center text-muted">No hay actividad reciente registrada.</td></tr>';
            }
        } catch (error) {
            console.warn('⚠️ Error sincronizando actividad reciente:', error);
            tbody.innerHTML = '<tr><td colspan="3" class="text-center text-error">Error al sincronizar actividad.</td></tr>';
        }
    }

    getActivityIcon(tipo) {
        const icons = {
            'solicitud': '📜',
            'expediente': '📂',
            'notificacion': '🔔',
            'registro': '👤'
        };
        return icons[tipo] || '⚡';
    }

    async loadDashboardStats() {
        console.log('🏛️ Sincronizando estadísticas globales...');
        try {
            const usuarioId = this.getCurrentUserId();
            
            // Cargar estadísticas básicas en paralelo para mayor velocidad
            const [solResp, expResp, notifResp] = await Promise.all([
                fetch(`/api/solicitudes/usuario/${usuarioId}`),
                fetch(`/api/expedientes?usuario_id=${usuarioId}`),
                fetch(`/api/notificaciones?usuario_id=${usuarioId}`)
            ]);

            const solData = await solResp.json();
            const expData = await expResp.json();
            const notifData = await notifResp.json();

            // Actualizar contadores en la UI (Inicio)
            const elSol = document.getElementById('inicio-solicitudes');
            const elExp = document.getElementById('inicio-expedientes');
            const elDoc = document.getElementById('inicio-documentos');

            if (elSol) elSol.textContent = solData.data?.length || 0;
            if (elExp) elExp.textContent = expData.data?.length || 0;
            if (elDoc) elDoc.textContent = notifData.estadisticas?.no_leidas || 0;

        } catch (error) {
            console.warn('⚠️ Error sincronizando estadísticas rápidas:', error);
        }
    }

    showToast(message, type = 'success') {
        const container = document.getElementById('toast-container');
        if (!container) return;

        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        
        const icons = {
            success: '✅',
            error: '❌',
            info: 'ℹ️'
        };

        toast.innerHTML = `
            <span class="toast-icon">${icons[type] || '🔔'}</span>
            <span class="toast-message">${message}</span>
        `;

        container.appendChild(toast);

        // Animate in
        setTimeout(() => toast.classList.add('active'), 10);

        // Remove after 5s
        setTimeout(() => {
            toast.classList.remove('active');
            setTimeout(() => toast.remove(), 400);
        }, 5000);
    }

    showError(message) {
        this.showToast(message, 'error');
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
        document.querySelectorAll('.modal-overlay').forEach(modal => {
            modal.classList.remove('active');
        });
        document.body.style.overflow = '';
    }



    startHeartbeat() {
        // Latido ultra-ligero cada 45 segundos
        this.heartbeatTimer = setInterval(() => this.checkRealTimeUpdates(), 45000);
    }

    async checkRealTimeUpdates() {
        try {
            const usuarioId = this.getCurrentUserId();
            const response = await fetch(`/api/notificaciones?usuario_id=${usuarioId}`);
            const data = await response.json();

            if (data.success && data.estadisticas) {
                const newUnread = data.estadisticas.no_leidas || 0;
                
                // Si hay cambios reales, disparar actualización
                if (this.lastUnreadCount !== undefined && newUnread > this.lastUnreadCount) {
                    console.log('🔔 ¡Nueva notificación detectada! Sincronizando...');
                    this.notifyUser('Nueva Notificación', 'Ha recibido una nueva notificación institucional.');
                    
                    // Si el usuario está en la sección de notificaciones, recargarla
                    if (this.currentSection === 'casilla') {
                        this.modules.notificaciones?.loadNotificacionesUsuario();
                    }
                    
                    // Actualizar estadísticas de inicio si es necesario
                    if (this.currentSection === 'inicio') {
                        this.loadDashboardStats();
                    }
                }
                
                this.lastUnreadCount = newUnread;
                this.updateNotificationBadge(newUnread);
            }
        } catch (error) {
            console.warn('⚠️ Fallo en el latido de tiempo real');
        }
    }

    updateNotificationBadge(count) {
        const badge = document.getElementById('notif-badge');
        if (badge) {
            badge.textContent = count > 0 ? count : '';
            badge.style.display = count > 0 ? 'flex' : 'none';
        }
    }

    notifyUser(title, text) {
        Swal.fire({
            title: title,
            text: text,
            icon: 'info',
            toast: true,
            position: 'top-end',
            showConfirmButton: false,
            timer: 4000,
            timerProgressBar: true,
            background: 'var(--color-surface)',
            color: 'var(--color-text)'
        });
    }

    async logout() {
        const result = await Swal.fire({
            title: '<span style="color: var(--color-primary); font-family: \'Outfit\', sans-serif; font-weight: 700; letter-spacing: -0.5px;">SEGURIDAD INSTITUCIONAL</span>',
            html: `
                <div style="margin: 20px 0; color: rgba(255,255,255,0.7); font-size: 15px;">
                    ¿Está seguro que desea finalizar su sesión en el portal <b>TMARC</b>?
                    <p style="font-size: 12px; margin-top: 10px; color: var(--color-silver-muted);">Se cerrarán todos los accesos activos de forma segura.</p>
                </div>
            `,
            icon: 'question',
            iconColor: '#D4AF37',
            showCancelButton: true,
            confirmButtonText: 'SALIR DEL SISTEMA',
            cancelButtonText: 'MANTENER SESIÓN',
            background: '#1a1a1a',
            color: '#ffffff',
            reverseButtons: true,
            customClass: {
                popup: 'premium-swal-popup',
                confirmButton: 'btn btn-primary',
                cancelButton: 'btn btn-secondary'
            },
            showClass: {
                popup: 'animate__animated animate__fadeInUp animate__faster'
            },
            hideClass: {
                popup: 'animate__animated animate__fadeOutDown animate__faster'
            }
        });

        if (result.isConfirmed) {
            // Animación de despedida
            Swal.fire({
                title: 'Finalizando Sesión...',
                timer: 1000,
                showConfirmButton: false,
                willOpen: () => { Swal.showLoading(); },
                background: '#1a1a1a',
                color: '#ffffff'
            });

            setTimeout(() => {
                sessionStorage.clear();
                window.location.href = 'login.html';
            }, 1000);
        }
    }
}

// Export for window scope
window.DashboardApp = DashboardApp;