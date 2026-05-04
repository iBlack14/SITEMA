/**
 * Dashboard Sections Generator
 * Creates all dashboard sections dynamically
 */

class DashboardSections {
    constructor(dashboardApp) {
        this.dashboard = dashboardApp;
        this.sections = {};
    }

    /**
     * Generate all dashboard sections
     */
    generateSections() {
        this.createNavigation();
        this.createInicioSection();
        this.createSolicitudesSection();
        this.createCasillaSection();
        this.createExpedientesSection();
        this.createMesaPartesSection();
        this.createConfiguracionSection();
    }

    /**
     * Create navigation menu
     */
    createNavigation() {
        const navMenu = document.querySelector('.nav-menu');
        if (!navMenu) return;

        const sections = DashboardConfig.sections;

        navMenu.innerHTML = Object.values(sections).map(section => `
            <div class="nav-item ${section.default ? 'active' : ''}" data-section="${section.id}" onclick="showSection('${section.id}', event)">
                <div class="nav-icon">
                    ${section.icon}
                </div>
                <span class="nav-text">${section.title}</span>
            </div>
        `).join('') + `
            <div class="nav-item" onclick="logout()">
                <div class="nav-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z"/></svg>
                </div>
                <span class="nav-text">Cerrar sesión</span>
            </div>
        `;
    }

    /**
     * Create inicio section
     */
    createInicioSection() {
        const section = document.getElementById('inicio') || this.createSection('inicio');

        section.innerHTML = `
            <div class="header">
                <h1>
                    <span class="header-icon">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/></svg>
                    </span>
                    Inicio
                </h1>
                <p class="subtitle">Bienvenido a tu panel de control</p>
            </div>

            <div class="cards-container">
                <div class="stat-card">
                    <div class="stat-label">Solicitudes Pendientes</div>
                    <div class="stat-value" id="inicio-solicitudes">0</div>
                </div>
                <div class="stat-card">
                    <div class="stat-label">Expedientes Activos</div>
                    <div class="stat-value" id="inicio-expedientes">0</div>
                </div>
                <div class="stat-card">
                    <div class="stat-label">Documentos Recibidos</div>
                    <div class="stat-value" id="inicio-documentos">0</div>
                </div>
            </div>

            <div class="table-container" style="margin-top: 40px;">
                <h3 style="color: #000000; margin-bottom: 20px;">Últimas Actividades</h3>
                <table id="actividades-table">
                    <thead>
                        <tr>
                            <th>Fecha</th>
                            <th>Actividad</th>
                            <th>Estado</th>
                        </tr>
                    </thead>
                    <tbody id="actividades-tbody">
                        <tr>
                            <td colspan="3" style="text-align: center; color: #666;">Cargando actividades...</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        `;
    }

    /**
     * Create solicitudes section
     */
    createSolicitudesSection() {
        const section = document.getElementById('solicitudes') || this.createSection('solicitudes');

        section.innerHTML = `
            <div class="header">
                <h1>
                    <span class="header-icon">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M19 3h-4.18C14.4 1.84 13.3 1 12 1c-1.3 0-2.4.84-2.82 2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 0c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm2 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/></svg>
                    </span>
                    Solicitudes
                </h1>
                <p class="subtitle">Gestiona todas tus solicitudes</p>
            </div>

            <div class="cards-container">
                <div class="card">
                    <div class="card-header">
                        <span class="card-icon">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>
                        </span>
                        <span class="card-title">Nueva Solicitud</span>
                    </div>
                    <p style="color: #333333; margin-bottom: 20px;">Crea una nueva solicitud en el sistema</p>
                    <button class="btn btn-primary" onclick="window.dashboardApp.modules.solicitudes?.crearNuevaSolicitud()">Crear Solicitud</button>
                </div>

                <div class="card">
                    <div class="card-header">
                        <span class="card-icon">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14zm-5.04-6.71l-2.75 3.54-1.3-1.54c-.2-.24-.58-.27-.85-.07-.27.2-.3.58-.1.85l1.48 1.77c.15.18.37.28.61.28.25 0 .48-.1.64-.29l2.93-3.76c.21-.28.15-.67-.12-.88-.28-.21-.67-.15-.88.12z"/></svg>
                        </span>
                        <span class="card-title">Solicitudes Aprobadas</span>
                    </div>
                    <div class="stat-value" style="font-size: 48px; margin: 20px 0;" id="solicitudes-aprobadas">0</div>
                    <button class="btn btn-secondary">Ver Detalles</button>
                </div>

                <div class="card">
                    <div class="card-header">
                        <span class="card-icon">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"/></svg>
                        </span>
                        <span class="card-title">Solicitudes Pendientes</span>
                    </div>
                    <div class="stat-value" style="font-size: 48px; margin: 20px 0;" id="solicitudes-pendientes">0</div>
                    <button class="btn btn-secondary">Ver Detalles</button>
                </div>
            </div>

            <div class="table-container" style="margin-top: 30px;">
                <h3 style="color: #000000; margin-bottom: 20px;">Historial de Solicitudes</h3>
                <div id="solicitudes-loading" style="text-align: center; padding: 20px; color: #666;">
                    Cargando solicitudes...
                </div>
                <table id="solicitudes-table" style="display: none;">
                    <thead>
                        <tr>
                            <th>ID Solicitud</th>
                            <th>Fecha</th>
                            <th>Tipo</th>
                            <th>Estado</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody id="solicitudes-tbody">
                    </tbody>
                </table>
                <div id="no-solicitudes" style="display: none; text-align: center; padding: 40px; color: #666;">
                    <p>No tienes solicitudes registradas en este momento.</p>
                </div>
            </div>
        `;
    }

    /**
     * Create casilla section
     */
    createCasillaSection() {
        const section = document.getElementById('casilla') || this.createSection('casilla');

        section.innerHTML = `
            <div class="header">
                <h1>
                    <span class="header-icon">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/></svg>
                    </span>
                    Casilla Electrónica
                </h1>
                <p class="subtitle">Recibe y gestiona tus correos y notificaciones</p>
            </div>

            <div class="cards-container">
                <div class="stat-card">
                    <div class="stat-label">Mensajes Nuevos</div>
                    <div class="stat-value" id="casilla-nuevos">0</div>
                </div>
                <div class="stat-card">
                    <div class="stat-label">No Leídos</div>
                    <div class="stat-value" id="casilla-no-leidos">0</div>
                </div>
                <div class="stat-card">
                    <div class="stat-label">Archivados</div>
                    <div class="stat-value" id="casilla-archivados">0</div>
                </div>
            </div>

            <div class="table-container" style="margin-top: 40px;">
                <h3 style="color: #000000; margin-bottom: 20px;">Buzón de Entrada</h3>
                <div id="notificaciones-loading" style="text-align: center; padding: 20px; color: #666;">
                    Cargando notificaciones...
                </div>
                <table id="notificaciones-table" style="display: none;">
                    <thead>
                        <tr>
                            <th>Remitente</th>
                            <th>Asunto</th>
                            <th>Fecha</th>
                            <th>Estado</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody id="notificaciones-tbody">
                    </tbody>
                </table>
                <div id="no-notificaciones" style="display: none; text-align: center; padding: 40px; color: #666;">
                    <p>No tienes notificaciones en este momento.</p>
                </div>
            </div>
        `;
    }

    /**
     * Create expedientes section
     */
    createExpedientesSection() {
        const section = document.getElementById('expedientes') || this.createSection('expedientes');

        section.innerHTML = `
            <div class="header">
                <h1>
                    <span class="header-icon">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M20 6h-8l-2-2H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm0 12H4V8h16v10z"/></svg>
                    </span>
                    Expedientes
                </h1>
                <p class="subtitle">Administra tus expedientes y documentos</p>
            </div>

            <div class="cards-container">
                <div class="card">
                    <div class="card-header">
                        <span class="card-icon">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/></svg>
                        </span>
                        <span class="card-title">Nuevo Expediente</span>
                    </div>
                    <p style="color: #333333; margin-bottom: 20px;">Registra un nuevo expediente en el sistema</p>
                    <button class="btn btn-primary" onclick="window.dashboardApp.modules.expedientes?.crearNuevoExpediente()">Crear Expediente</button>
                </div>

                <div class="stat-card">
                    <div class="stat-label">Expedientes Activos</div>
                    <div class="stat-value" id="expedientes-activos">0</div>
                </div>

                <div class="stat-card">
                    <div class="stat-label">Expedientes Cerrados</div>
                    <div class="stat-value" id="expedientes-cerrados">0</div>
                </div>
            </div>

            <div class="table-container" style="margin-top: 40px;">
                <h3 style="color: #000000; margin-bottom: 20px;">Listado de Expedientes</h3>
                <table id="expedientes-table">
                    <thead>
                        <tr>
                            <th>Número</th>
                            <th>Asunto</th>
                            <th>Fecha Creación</th>
                            <th>Estado</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody id="expedientes-tbody">
                        <tr>
                            <td colspan="5" style="text-align: center; color: #666;">Cargando expedientes...</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        `;
    }

    /**
     * Create mesa de partes section
     */
    createMesaPartesSection() {
        const section = document.getElementById('mesa') || this.createSection('mesa');

        section.innerHTML = `
            <div class="header">
                <h1>
                    <span class="header-icon">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M4 6h18V4H4c-1.1 0-2 .9-2 2v11H0v3h14v-3H4V6zm19 2h-6c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h6c.55 0 1-.45 1-1V9c0-.55-.45-1-1-1zm-1 9h-4v-7h4v7z"/></svg>
                    </span>
                    Mesa de Partes Virtual
                </h1>
                <p class="subtitle">Presenta documentos de forma electrónica</p>
            </div>

            <div class="cards-container">
                <div class="card">
                    <div class="card-header">
                        <span class="card-icon">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/></svg>
                        </span>
                        <span class="card-title">Presentar Documento</span>
                    </div>
                    <p style="color: #333333; margin-bottom: 20px;">Sube y presenta tus documentos</p>
                    <button class="btn btn-primary" onclick="window.dashboardApp.modules.mesaPartes?.presentarDocumento()">Subir Documento</button>
                </div>

                <div class="stat-card">
                    <div class="stat-label">Documentos Presentados</div>
                    <div class="stat-value" id="mesa-presentados">0</div>
                </div>

                <div class="stat-card">
                    <div class="stat-label">Documentos Recibidos</div>
                    <div class="stat-value" id="mesa-recibidos">0</div>
                </div>
            </div>

            <div class="table-container" style="margin-top: 40px;">
                <h3 style="color: #000000; margin-bottom: 20px;">Mis Presentaciones</h3>
                <table id="mesa-table">
                    <thead>
                        <tr>
                            <th>Número Registro</th>
                            <th>Materia</th>
                            <th>Fecha Presentación</th>
                            <th>Estado</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody id="mesa-tbody">
                        <tr>
                            <td colspan="5" style="text-align: center; color: #666;">Cargando presentaciones...</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        `;
    }

    /**
     * Create configuracion section
     */
    createConfiguracionSection() {
        const section = document.getElementById('configuracion') || this.createSection('configuracion');

        section.innerHTML = `
            <div class="header">
                <h1>
                    <span class="header-icon">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94L14.4 2.81c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z"/></svg>
                    </span>
                    Configuración
                </h1>
                <p class="subtitle">Gestiona tu perfil y configuración de cuenta</p>
            </div>

            <div class="cards-container">
                <div class="card">
                    <div class="card-header">
                        <span class="card-icon">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M12 5.9c1.16 0 2.1.94 2.1 2.1s-.94 2.1-2.1 2.1S9.9 9.16 9.9 8s.94-2.1 2.1-2.1m0 9c2.97 0 6.1 1.46 6.1 2.1v1.1H5.9V17c0-.64 3.13-2.1 6.1-2.1M12 4C9.79 4 8 5.79 8 8s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm0 9c-2.67 0-8 1.34-8 4v3h16v-3c0-2.66-5.33-4-8-4z"/></svg>
                        </span>
                        <span class="card-title">Datos Personales</span>
                    </div>
                    <form id="profileForm">
                        <div class="form-group">
                            <label class="form-label">Nombre completo</label>
                            <input type="text" id="profile-nombre" class="form-input" name="nombre" placeholder="Cargando...">
                        </div>
                        <div class="form-group">
                            <label class="form-label">Email</label>
                            <input type="email" id="profile-email" class="form-input" name="email" placeholder="Cargando...">
                        </div>
                        <div class="form-group">
                            <label class="form-label">Teléfono</label>
                            <input type="tel" id="profile-telefono" class="form-input" name="telefono" placeholder="Cargando...">
                        </div>
                        <button type="submit" class="btn btn-primary">💾 Guardar Cambios</button>
                    </form>
                </div>

                <div class="card">
                    <div class="card-header">
                        <span class="card-icon">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"/></svg>
                        </span>
                        <span class="card-title">Seguridad</span>
                    </div>
                    <form id="securityForm">
                        <div class="form-group">
                            <label class="form-label">Contraseña actual</label>
                            <input type="password" class="form-input" name="currentPassword" placeholder="••••••••">
                        </div>
                        <div class="form-group">
                            <label class="form-label">Nueva contraseña</label>
                            <input type="password" class="form-input" name="newPassword" placeholder="••••••••">
                        </div>
                        <div class="form-group">
                            <label class="form-label">Confirmar contraseña</label>
                            <input type="password" class="form-input" name="confirmPassword" placeholder="••••••••">
                        </div>
                        <button type="submit" class="btn btn-primary">Cambiar Contraseña</button>
                    </form>
                </div>

                <div class="card">
                    <div class="card-header">
                        <span class="card-icon">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.89 2 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z"/></svg>
                        </span>
                        <span class="card-title">Notificaciones</span>
                    </div>
                    <div class="checkbox-group">
                        <input type="checkbox" class="checkbox" id="email-notif" checked>
                        <label for="email-notif" class="checkbox-label">Notificaciones por email</label>
                    </div>
                    <div class="checkbox-group">
                        <input type="checkbox" class="checkbox" id="sms-notif" checked>
                        <label for="sms-notif" class="checkbox-label">Notificaciones por SMS</label>
                    </div>
                    <div class="checkbox-group">
                        <input type="checkbox" class="checkbox" id="push-notif" checked>
                        <label for="push-notif" class="checkbox-label">Notificaciones push</label>
                    </div>
                    <div class="form-group" style="margin-top: 20px;">
                        <label class="form-label">Idioma</label>
                        <select id="language-select" class="form-input">
                            <option>Español</option>
                            <option>English</option>
                            <option>Português</option>
                        </select>
                    </div>
                    <button class="btn btn-primary" style="margin-top: 15px;">Guardar Preferencias</button>
                </div>
            </div>
        `;
    }

    /**
     * Create a section element
     */
    createSection(sectionId) {
        const section = document.createElement('div');
        section.className = 'content-section';
        section.id = sectionId;

        // Agregar clase active a la sección inicio por defecto
        if (sectionId === 'inicio') {
            section.classList.add('active');
        }

        const mainContent = document.querySelector('.main-content');
        if (mainContent) {
            mainContent.appendChild(section);
        }

        return section;
    }

    /**
     * Update section statistics
     */
    updateSectionStats() {
        // Update inicio stats
        const solicitudesStats = this.dashboard.modules.solicitudes?.getSolicitudesStats();
        if (solicitudesStats) {
            const solicitudesPendientes = document.getElementById('inicio-solicitudes');
            if (solicitudesPendientes) solicitudesPendientes.textContent = solicitudesStats.pendientes;
        }

        // Update casilla stats
        const notificacionesStats = this.dashboard.modules.notificaciones?.getNotificacionesStats();
        if (notificacionesStats) {
            const nuevos = document.getElementById('casilla-nuevos');
            const noLeidos = document.getElementById('casilla-no-leidos');
            if (nuevos) nuevos.textContent = notificacionesStats.no_leidas;
            if (noLeidos) noLeidos.textContent = notificacionesStats.no_leidas;
        }
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DashboardSections;
}