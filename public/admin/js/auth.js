/**
 * Módulo de Autenticación
 * Maneja la autenticación y autorización del administrador
 */

// Sistema de autenticación para admin usando backend
class AdminAuthCheck {
    constructor() {
        this.usuarioActual = null;
        this.checkAuthentication();
    }

    async checkAuthentication() {
        const token = sessionStorage.getItem('authToken');
        const userData = sessionStorage.getItem('userData');

        if (!token || !userData) {
            this.redirectToLogin();
            return;
        }

        try {
            const user = JSON.parse(userData);

            // Verificar token con el backend
            const response = await fetch('/api/usuarios/' + user.id, {
                headers: {
                    'Authorization': 'Bearer ' + token
                }
            });

            if (!response.ok) {
                this.logout();
                return;
            }

            // Verificar que sea admin
            if (user.tipo !== 'admin') {
                window.location.href = 'dashboard-modular.html';
                return;
            }

            this.usuarioActual = user;
            this.mostrarInfoUsuario();
            this.cargarDatosDashboard();

        } catch (error) {
            console.error('Error verificando autenticación:', error);
            this.logout();
        }
    }

    mostrarInfoUsuario() {
        // Actualizar nombre de usuario en la interfaz
        const userNameElement = document.querySelector('.user-name');
        if (userNameElement && this.usuarioActual) {
            userNameElement.textContent = this.usuarioActual.nombre || 'Administrador';
        }
    }

    logout() {
        sessionStorage.removeItem('authToken');
        sessionStorage.removeItem('userData');
        this.redirectToLogin();
    }

    redirectToLogin() {
        window.location.href = 'login.html';
    }

    async cargarDatosDashboard() {
        try {
            const token = sessionStorage.getItem('authToken');

            // Cargar estadísticas del dashboard
            const response = await fetch('/api/estadisticas/dashboard', {
                headers: {
                    'Authorization': 'Bearer ' + token
                }
            });

            if (response.ok) {
                const data = await response.json();
                if (data.success) {
                    this.actualizarEstadisticas(data.data);
                }
            }

            // Cargar actividades recientes
            await this.cargarActividadesRecientes();
        } catch (error) {
            console.error('Error cargando datos del dashboard:', error);
        }
    }

    actualizarEstadisticas(data) {
        // Actualizar estadísticas en la interfaz
        const statValues = document.querySelectorAll('#dashboard .stat-value');
        if (statValues.length >= 4 && data) {
            statValues[0].textContent = data.usuarios?.total || 0;
            statValues[1].textContent = data.solicitudes?.pendientes || 0;
            statValues[2].textContent = data.expedientes?.total || 0;
            statValues[3].textContent = (data.tasa_completitud || 0) + '%';
        }
    }

    async cargarActividadesRecientes() {
        try {
            const token = sessionStorage.getItem('authToken');
            const response = await fetch('/api/actividades/recientes', {
                headers: {
                    'Authorization': 'Bearer ' + token
                }
            });

            if (response.ok) {
                const data = await response.json();
                if (data.success) {
                    this.mostrarActividadesRecientes(data.data);
                }
            }
        } catch (error) {
            console.error('Error cargando actividades recientes:', error);
        }
    }

    mostrarActividadesRecientes(actividades) {
        const tbody = document.querySelector('#actividades-recientes');
        if (!tbody) return;

        if (!actividades || actividades.length === 0) {
            tbody.innerHTML = '<tr><td colspan="4" style="text-align: center;">No hay actividades recientes</td></tr>';
            return;
        }

        tbody.innerHTML = actividades.map(actividad => `
            <tr>
                <td>${actividad.usuario || 'Sistema'}</td>
                <td>${actividad.accion || 'N/A'}</td>
                <td>${actividad.fecha ? new Date(actividad.fecha).toLocaleString('es-ES') : 'N/A'}</td>
                <td><span class="status-badge ${getStatusClass(actividad.estado)}">${actividad.estado || 'Completado'}</span></td>
            </tr>
        `).join('');
    }

    getToken() {
        return sessionStorage.getItem('authToken');
    }

    getUsuario() {
        return this.usuarioActual;
    }

    isAuthenticated() {
        return !!this.usuarioActual;
    }

    isAdmin() {
        return this.usuarioActual?.tipo === 'admin';
    }
}

// Función auxiliar para verificar permisos
function verificarPermiso(permiso) {
    if (!window.adminAuth || !window.adminAuth.isAuthenticated()) {
        alert('Debe iniciar sesión para realizar esta acción');
        return false;
    }

    if (!window.adminAuth.isAdmin()) {
        alert('No tiene permisos para realizar esta acción');
        return false;
    }

    return true;
}

// Función auxiliar para obtener headers con autenticación
function getAuthHeaders() {
    const token = sessionStorage.getItem('authToken');
    return {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : ''
    };
}

// Inicializar autenticación cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    // Crear instancia global de autenticación
    window.adminAuth = new AdminAuthCheck();
});

// Exportar funciones para uso global
if (typeof window !== 'undefined') {
    window.AdminAuthCheck = AdminAuthCheck;
    window.verificarPermiso = verificarPermiso;
    window.getAuthHeaders = getAuthHeaders;
}
