/**
 * 🏛️ DASHBOARD SECTIONS GENERATOR (UI-UX-PRO-MAX)
 * Creates ultra-modern dashboard sections with Glassmorphism
 */

class DashboardSections {
    constructor(dashboardApp) {
        this.dashboard = dashboardApp;
        this.sections = {};
    }

    generateSections() {
        this.createNavigation();
        this.createInicioSection();
        this.createSolicitudesSection();
        this.createCasillaSection();
        this.createExpedientesSection();
        this.createMesaPartesSection();
        this.createConfiguracionSection();
    }

    createNavigation() {
        const navMenu = document.querySelector('.nav-menu');
        if (!navMenu) return;

        const sections = DashboardConfig.sections;

        navMenu.innerHTML = Object.values(sections).map(section => `
            <a href="#" class="nav-item ${section.default ? 'active' : ''}" data-section="${section.id}" onclick="showSection('${section.id}', event)">
                ${section.icon}
                <span class="nav-text">${section.title}</span>
            </a>
        `).join('') + `
            <a href="#" class="nav-item logout-item" onclick="logout()" style="margin-top: auto; color: var(--color-error);">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z"/></svg>
                <span class="nav-text">Cerrar sesión</span>
            </a>
        `;
    }

    createInicioSection() {
        const section = document.getElementById('inicio') || this.createSection('inicio');

        section.innerHTML = `
            <div class="header fade-in">
                <h1 class="text-gold">Panel de Control Institutional</h1>
                <p class="text-muted">Bienvenido, gestione sus trámites judiciales con seguridad y eficiencia.</p>
            </div>

            <div class="stats-grid fade-in">
                <div class="card stat-card">
                    <span class="stat-label">Solicitudes</span>
                    <span class="stat-value" id="inicio-solicitudes">0</span>
                    <div class="badge badge-success">En Línea</div>
                </div>
                <div class="card stat-card">
                    <span class="stat-label">Expedientes</span>
                    <span class="stat-value" id="inicio-expedientes">0</span>
                    <div class="badge badge-warning">Activos</div>
                </div>
                <div class="card stat-card">
                    <span class="stat-label">Notificaciones</span>
                    <span class="stat-value" id="inicio-documentos">0</span>
                    <div class="badge badge-error">Pendientes</div>
                </div>
            </div>

            <div class="table-container fade-in" style="margin-top: var(--space-5);">
                <div class="card">
                    <h3 class="card-title text-gold">📅 Actividad Reciente</h3>
                    <div class="table-wrapper">
                        <table class="table">
                            <thead>
                                <tr>
                                    <th>Fecha</th>
                                    <th>Actividad</th>
                                    <th>Estado</th>
                                </tr>
                            </thead>
                            <tbody id="actividades-tbody">
                                <tr>
                                    <td colspan="3" class="text-center text-muted">Sincronizando actividades...</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        `;
    }

    createSolicitudesSection() {
        const section = document.getElementById('solicitudes') || this.createSection('solicitudes');

        section.innerHTML = `
            <div class="header fade-in">
                <h1 class="text-gold">Gestión de Solicitudes</h1>
                <p class="text-muted">Administración centralizada de trámites y procesos.</p>
            </div>

            <div class="stats-grid fade-in">
                <div class="card" style="grid-column: span 2;">
                    <h3 class="card-title text-gold">🚀 Nueva Gestión</h3>
                    <p class="text-muted" style="margin-bottom: var(--space-4);">Inicie una nueva solicitud procesal en el sistema virtual.</p>
                    <button class="btn btn-primary" onclick="window.dashboardApp.modules.solicitudes?.crearNuevaSolicitud()">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right: 8px;"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                        Crear Nueva Solicitud
                    </button>
                </div>
                <div class="card stat-card">
                    <span class="stat-label">Total Aprobadas</span>
                    <span class="stat-value" id="solicitudes-aprobadas">0</span>
                </div>
            </div>

            <div class="table-container fade-in" style="margin-top: var(--space-5);">
                <div class="card">
                    <h3 class="card-title text-gold">📋 Historial de Solicitudes</h3>
                    <div class="table-wrapper">
                        <table class="table">
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Fecha</th>
                                    <th>Tipo</th>
                                    <th>Estado</th>
                                    <th>Acciones</th>
                                </tr>
                            </thead>
                            <tbody id="solicitudes-tbody">
                                <tr><td colspan="5" class="text-center text-muted">Cargando datos...</td></tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        `;
    }

    createCasillaSection() {
        const section = document.getElementById('casilla') || this.createSection('casilla');

        section.innerHTML = `
            <div class="header fade-in">
                <h1 class="text-gold">Casilla Electrónica Judicial</h1>
                <p class="text-muted">Sistema de notificaciones procesales garantizado.</p>
            </div>

            <div class="stats-grid fade-in">
                <div class="card stat-card">
                    <span class="stat-label">No Leídos</span>
                    <span class="stat-value text-gold" id="casilla-no-leidos">0</span>
                </div>
                <div class="card stat-card">
                    <span class="stat-label">Total Mensajes</span>
                    <span class="stat-value" id="casilla-total">0</span>
                </div>
            </div>

            <div class="table-container fade-in" style="margin-top: var(--space-5);">
                <div class="card">
                    <h3 class="card-title text-gold">📥 Buzón de Notificaciones</h3>
                    <div class="table-wrapper">
                        <table class="table">
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
                                <tr><td colspan="5" class="text-center text-muted">Accediendo a la casilla...</td></tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        `;
    }

    createExpedientesSection() {
        const section = document.getElementById('expedientes') || this.createSection('expedientes');

        section.innerHTML = `
            <div class="header fade-in">
                <h1 class="text-gold">Expedientes Virtuales</h1>
                <p class="text-muted">Consulta y seguimiento de procesos en tiempo real.</p>
            </div>

            <div class="stats-grid fade-in">
                <div class="card" style="grid-column: span 2;">
                    <h3 class="card-title text-gold">📂 Registro Procesal</h3>
                    <p class="text-muted" style="margin-bottom: var(--space-4);">Incorpore un nuevo expediente para su seguimiento administrativo.</p>
                    <button class="btn btn-primary" onclick="window.dashboardApp.modules.expedientes?.crearNuevoExpediente()">Registrar Expediente</button>
                </div>
                <div class="card stat-card">
                    <span class="stat-label">En Trámite</span>
                    <span class="stat-value" id="expedientes-activos">0</span>
                </div>
            </div>

            <div class="table-container fade-in" style="margin-top: var(--space-5);">
                <div class="card">
                    <h3 class="card-title text-gold">🔍 Listado de Expedientes</h3>
                    <div class="table-wrapper">
                        <table class="table">
                            <thead>
                                <tr>
                                    <th>Expediente Nº</th>
                                    <th>Asunto</th>
                                    <th>Apertura</th>
                                    <th>Estado</th>
                                    <th>Acciones</th>
                                </tr>
                            </thead>
                            <tbody id="expedientes-tbody">
                                <tr><td colspan="5" class="text-center text-muted">Sincronizando expedientes...</td></tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        `;
    }

    createMesaPartesSection() {
        const section = document.getElementById('mesa') || this.createSection('mesa');

        section.innerHTML = `
            <div class="header fade-in">
                <h1 class="text-gold">Mesa de Partes Virtual</h1>
                <p class="text-muted">Presentación de escritos y documentos con firma digital.</p>
            </div>

            <div class="stats-grid fade-in">
                <div class="card" style="grid-column: span 2;">
                    <h3 class="card-title text-gold">📤 Ingreso de Documentos</h3>
                    <p class="text-muted" style="margin-bottom: var(--space-4);">Suba escritos, demandas o anexos de forma segura.</p>
                    <button class="btn btn-primary" onclick="window.dashboardApp.modules.mesaPartes?.presentarDocumento()">Nueva Presentación</button>
                </div>
                <div class="card stat-card">
                    <span class="stat-label">Presentados</span>
                    <span class="stat-value" id="mesa-presentados">0</span>
                </div>
            </div>

            <div class="table-container fade-in" style="margin-top: var(--space-5);">
                <div class="card">
                    <h3 class="card-title text-gold">📜 Mis Presentaciones</h3>
                    <div class="table-wrapper">
                        <table class="table">
                            <thead>
                                <tr>
                                    <th>Registro</th>
                                    <th>Materia</th>
                                    <th>Fecha</th>
                                    <th>Estado</th>
                                    <th>Cargo</th>
                                </tr>
                            </thead>
                            <tbody id="mesa-tbody">
                                <tr><td colspan="5" class="text-center text-muted">Cargando registros...</td></tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        `;
    }

    createConfiguracionSection() {
        const section = document.getElementById('configuracion') || this.createSection('configuracion');

        section.innerHTML = `
            <div class="header fade-in">
                <h1 class="text-gold">Configuración del Sistema</h1>
                <p class="text-muted">Gestione su perfil y preferencias de seguridad.</p>
            </div>

            <div class="stats-grid fade-in" style="grid-template-columns: 1fr 1fr;">
                <div class="card">
                    <h3 class="card-title text-gold">👤 Perfil Institucional</h3>
                    <form id="profileForm" style="display: flex; flex-direction: column; gap: 16px;">
                        <div class="form-group">
                            <label class="stat-label">Nombre Completo</label>
                            <input type="text" id="profile-nombre" class="form-input" name="nombre" readonly>
                        </div>
                        <div class="form-group">
                            <label class="stat-label">Email de Contacto</label>
                            <input type="email" id="profile-email" class="form-input" name="email">
                        </div>
                        <button type="submit" class="btn btn-primary">Actualizar Perfil</button>
                    </form>
                </div>

                <div class="card">
                    <h3 class="card-title text-gold">🔐 Seguridad</h3>
                    <form id="securityForm" style="display: flex; flex-direction: column; gap: 16px;">
                        <div class="form-group">
                            <label class="stat-label">Nueva Contraseña</label>
                            <input type="password" class="form-input" name="newPassword" placeholder="••••••••">
                        </div>
                        <button type="submit" class="btn btn-secondary">Cambiar Contraseña</button>
                    </form>
                </div>
            </div>
        `;
    }

    createSection(sectionId) {
        const section = document.createElement('div');
        section.className = 'content-section';
        section.id = sectionId;

        if (sectionId === 'inicio') {
            section.classList.add('active');
        }

        const mainContent = document.querySelector('.main-content');
        if (mainContent) {
            mainContent.appendChild(section);
        }

        return section;
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = DashboardSections;
}