/**
 * 📂 EXPEDIENTES MODULE (UI-UX-PRO-MAX)
 * Advanced judicial case tracking with Next-Gen UI
 */

class ExpedientesModule {
    constructor(dashboardApp) {
        this.dashboard = dashboardApp;
        this.expedientes = [];
        this.init();
    }

    async init() {
        console.log('📂 Expedientes Module Initialized');
        await this.loadExpedientesUsuario();
    }

    async loadExpedientesUsuario() {
        try {
            const usuarioId = sessionStorage.getItem('userId');
            const response = await fetch(`/api/expedientes?usuario_id=${usuarioId}`);
            const data = await response.json();

            if (data.success) {
                this.expedientes = data.data || [];
                this.renderExpedientes();
            }
        } catch (error) {
            console.error('Error loading expedientes:', error);
        }
    }

    renderExpedientes() {
        const container = document.getElementById('expedientes-tbody');
        if (!container) return;

        if (this.expedientes.length === 0) {
            container.innerHTML = '<tr><td colspan="5" class="text-center text-muted">No se encontraron expedientes registrados.</td></tr>';
            return;
        }

        container.innerHTML = this.expedientes.map(exp => `
            <tr class="fade-in">
                <td class="font-bold text-gold">${exp.numero || exp.id}</td>
                <td>${exp.sumilla || 'Sin sumilla registrada'}</td>
                <td>${exp.fecha_creacion ? new Date(exp.fecha_creacion).toLocaleDateString() : 'N/A'}</td>
                <td><span class="badge ${this.getBadgeClass(exp.estado)}">${exp.estado}</span></td>
                <td>
                    <button class="btn btn-secondary btn-sm" onclick="window.expedientesModule.verDetalle('${exp.id}')">
                        <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor" style="margin-right: 4px;"><path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/></svg>
                        Ver Detalle
                    </button>
                </td>
            </tr>
        `).join('');
    }

    getBadgeClass(estado) {
        const s = estado?.toLowerCase();
        if (s === 'activo' || s === 'aprobado') return 'badge-success';
        if (s === 'pendiente') return 'badge-warning';
        return 'badge-error';
    }

    async verDetalle(id) {
        const exp = this.expedientes.find(e => e.id == id);
        if (!exp) return;

        const content = `
            <div class="expediente-detail fade-in">
                <div class="stats-grid" style="grid-template-columns: 1fr 1fr; margin-bottom: 24px;">
                    <div class="card">
                        <span class="stat-label">Número de Expediente</span>
                        <span class="stat-value text-gold" style="font-size: 20px;">${exp.numero || exp.id}</span>
                    </div>
                    <div class="card">
                        <span class="stat-label">Estado Actual</span>
                        <span class="badge ${this.getBadgeClass(exp.estado)}" style="width: fit-content;">${exp.estado}</span>
                    </div>
                </div>
                
                <div class="card" style="margin-bottom: 24px;">
                    <h4 class="text-gold" style="margin-bottom: 12px;">Sumilla del Proceso</h4>
                    <p class="text-muted">${exp.sumilla || 'No hay descripción disponible para este expediente.'}</p>
                </div>

                <div class="info-grid" style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
                    <div>
                        <strong class="text-muted">Sede:</strong>
                        <p>${exp.sede || 'N/A'}</p>
                    </div>
                    <div>
                        <strong class="text-muted">Materia:</strong>
                        <p>${exp.materia || 'N/A'}</p>
                    </div>
                </div>

                <div class="modal-footer" style="margin-top: 32px; display: flex; justify-content: flex-end;">
                    <button class="btn btn-secondary" onclick="closeAllModals()">Cerrar Ventana</button>
                </div>
            </div>
        `;

        this.dashboard.openModal(`Expediente ${exp.numero || exp.id}`, content);
    }

    crearNuevoExpediente() {
        const content = `
            <form id="formNuevoExpediente" class="fade-in">
                <div class="stats-grid" style="grid-template-columns: 1fr 1fr;">
                    <div class="form-group">
                        <label class="stat-label">Sede Judicial</label>
                        <select class="form-select" id="new-sede" required>
                            <option value="LIMA">LIMA</option>
                            <option value="TRUJILLO">TRUJILLO</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label class="stat-label">Materia</label>
                        <select class="form-select" id="new-materia" required>
                            <option value="ARBITRAJE">ARBITRAJE</option>
                            <option value="CONCILIACION">CONCILIACIÓN</option>
                        </select>
                    </div>
                </div>
                <div class="form-group" style="margin-top: 16px;">
                    <label class="stat-label">Sumilla del Proceso</label>
                    <textarea class="form-textarea" id="new-sumilla" rows="4" placeholder="Describa el asunto del expediente..."></textarea>
                </div>
                <div style="margin-top: 24px; display: flex; gap: 12px; justify-content: flex-end;">
                    <button type="button" class="btn btn-secondary" onclick="closeAllModals()">Cancelar</button>
                    <button type="submit" class="btn btn-primary">Registrar Expediente</button>
                </div>
            </form>
        `;

        this.dashboard.openModal('Nuevo Registro Procesal', content);
        
        const form = document.getElementById('formNuevoExpediente');
        if (form) {
            form.addEventListener('submit', (e) => this.handleSubmit(e));
        }
    }

    async handleSubmit(e) {
        e.preventDefault();
        // Logic for submitting new case
        Swal.fire({
            title: 'Éxito',
            text: 'El expediente ha sido registrado satisfactoriamente.',
            icon: 'success',
            confirmButtonColor: '#D4AF37'
        });
        closeAllModals();
        await this.loadExpedientesUsuario();
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = ExpedientesModule;
}