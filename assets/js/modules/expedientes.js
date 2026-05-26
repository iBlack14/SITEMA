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
            <form id="formNuevoExpediente" class="fade-in cej-form" style="max-height: 85vh; overflow-y: auto; padding: 20px;">
                <!-- Sección 1: Datos Generales -->
                <div class="form-section" style="margin-bottom: 24px;">
                    <h4 style="color: var(--color-primary); border-bottom: 2px solid rgba(212, 175, 55, 0.2); padding-bottom: 8px; margin-bottom: 16px;">🏛️ Datos Generales</h4>
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
                        <div class="form-group">
                            <label class="stat-label">Sede</label>
                            <input type="text" id="exp-sede" class="form-input" placeholder="Escriba la sede..." required>
                        </div>
                        <div class="form-group">
                            <label class="stat-label">Especialidad</label>
                            <select id="exp-especialidad" class="form-select" required>
                                <option value="">(Seleccionar)</option>
                                <option value="ARBITRAJE">ARBITRAJE</option>
                                <option value="JUNTA DE PREVENCION">JUNTA DE PREVENCION Y RESOLUCION DE DISPUTAS</option>
                                <option value="CONCILIACION">CONCILIACION EXTRAJUDICIAL</option>
                                <option value="ARBITRAJE DE EMERGENCIA">ARBITRAJE DE EMERGENCIA</option>
                                <option value="ARBITRAJE EXPRESS">ARBITRAJE EXPRESS</option>
                                <option value="ARBITRAJE ENTRE PRIVADOS">ARBITRAJE ENTRE PRIVADOS</option>
                                <option value="CENTRO DE FORMACION">CENTRO DE FORMACION Y CAPACITACION</option>
                            </select>
                        </div>
                    </div>
                </div>

                <!-- Sección 2: Datos del Expediente -->
                <div class="form-section" style="margin-bottom: 24px;">
                    <h4 style="color: var(--color-primary); border-bottom: 2px solid rgba(212, 175, 55, 0.2); padding-bottom: 8px; margin-bottom: 16px;">📂 Datos del Expediente</h4>
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 16px;">
                        <div class="form-group">
                            <label class="stat-label">Motivo de Ingreso</label>
                            <input type="text" id="exp-motivo" class="form-input" value="DEMANDA" readonly>
                        </div>
                        <div class="form-group">
                            <label class="stat-label">Proceso</label>
                            <select id="exp-proceso" class="form-select" required onchange="document.getElementById('exp-proceso-otro-cont').style.display = this.value === 'Otros' ? 'block' : 'none'">
                                <option value="">(Seleccionar)</option>
                                <option value="Institucional">Institucional</option>
                                <option value="Express">Express</option>
                                <option value="Ad-hoc">Ad-hoc</option>
                                <option value="Emergencia">Emergencia</option>
                                <option value="Otros">Otros (Especificar)</option>
                            </select>
                            <div id="exp-proceso-otro-cont" style="display: none; margin-top: 8px;">
                                <input type="text" id="exp-proceso-otro" class="form-input" placeholder="Escriba el proceso...">
                            </div>
                        </div>
                    </div>
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 16px;">
                        <div class="form-group">
                            <label class="stat-label">Materia</label>
                            <select id="exp-materia" class="form-select" required onchange="document.getElementById('exp-materia-otro-cont').style.display = this.value === 'OTRO' ? 'block' : 'none'">
                                <option value="">(Seleccionar)</option>
                                <option value="ARBITRAJE">ARBITRAJE</option>
                                <option value="JUNTA DE PREVENCION">JUNTA DE PREVENCION Y RESOLUCION DE DISPUTAS</option>
                                <option value="CONCILIACION">CONCILIACION EXTRAJUDICIAL</option>
                                <option value="ARBITRAJE DE EMERGENCIA">ARBITRAJE DE EMERGENCIA</option>
                                <option value="ARBITRAJE EXPRESS">ARBITRAJE EXPRESS</option>
                                <option value="ARBITRAJE ENTRE PRIVADOS">ARBITRAJE ENTRE PRIVADOS</option>
                                <option value="CENTRO DE FORMACION">CENTRO DE FORMACION Y CAPACITACION</option>
                                <option value="OTRO">OTRO (ESPECIFICAR)</option>
                            </select>
                            <div id="exp-materia-otro-cont" style="display: none; margin-top: 8px;">
                                <input type="text" id="exp-materia-otro" class="form-input" placeholder="Escriba la materia...">
                            </div>
                        </div>
                        <div class="form-group">
                            <label class="stat-label">Cuantía (S/.)</label>
                            <div style="display: flex; gap: 10px; align-items: center;">
                                <input type="number" id="exp-cuantia" class="form-input" value="0.00" step="0.01">
                                <label style="font-size: 10px; white-space: nowrap; display: flex; align-items: center; gap: 4px; color: var(--text-muted);">
                                    <input type="checkbox" id="exp-indeterminado" onchange="document.getElementById('exp-cuantia').disabled = this.checked"> 
                                    INDETERMINADO
                                </label>
                            </div>
                        </div>
                    </div>
                    <div class="form-group">
                        <label class="stat-label" style="display: flex; justify-content: space-between;">
                            Sumilla 
                            <span style="font-size: 10px;">Caracteres restantes: <span id="sumilla-count">255</span></span>
                        </label>
                        <textarea id="exp-sumilla" class="form-input" rows="3" maxlength="255" placeholder="Ingrese la sumilla del expediente..." oninput="document.getElementById('sumilla-count').textContent = 255 - this.value.length"></textarea>
                    </div>
                </div>

                <!-- Sección 3: Datos de Presentante -->
                <div class="form-section" style="margin-bottom: 24px;">
                    <h4 style="color: var(--color-primary); border-bottom: 2px solid rgba(212, 175, 55, 0.2); padding-bottom: 8px; margin-bottom: 16px;">👤 Datos de Presentante</h4>
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 16px;">
                        <div class="form-group">
                            <label class="stat-label">Tipo de Presentante</label>
                            <select id="exp-tipo-pres" class="form-select">
                                <option value="ABOGADO">ABOGADO</option>
                                <option value="PARTICULAR">PARTICULAR</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label class="stat-label">Nombre del Presentante</label>
                            <input type="text" id="exp-presentante" class="form-input" placeholder="Nombre completo">
                        </div>
                    </div>
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 16px;">
                        <div class="form-group">
                            <label class="stat-label">Nº Colegiatura</label>
                            <input type="text" id="exp-colegiatura" class="form-input" placeholder="C.A.L. 00000">
                        </div>
                        <div class="form-group">
                            <label class="stat-label">Colegio de Abogados</label>
                            <select id="exp-colegio" class="form-select">
                                <option value="LA LIBERTAD">LA LIBERTAD</option>
                                <option value="LIMA">LIMA</option>
                                <option value="AREQUIPA">AREQUIPA</option>
                            </select>
                        </div>
                    </div>
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
                        <div class="form-group">
                            <label class="stat-label">Casilla Física / Oficina</label>
                            <input type="text" id="exp-casilla-f" class="form-input" placeholder="Oficina - Casilla">
                        </div>
                        <div class="form-group">
                            <label class="stat-label">Casilla Electrónica</label>
                            <input type="text" id="exp-casilla-e" class="form-input" placeholder="00000">
                        </div>
                    </div>
                </div>

                <!-- Sección 4: Documentos -->
                <div class="form-section" style="margin-bottom: 24px; padding: 15px; background: rgba(212, 175, 55, 0.05); border-radius: 12px; border: 1px dashed var(--color-primary);">
                    <h4 style="color: var(--color-primary); margin-bottom: 12px; font-size: 14px;">📄 Documentos Adjuntos (Máx 5MB - PDF Firmado)</h4>
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
                        <div>
                            <label class="stat-label">Documento Principal</label>
                            <input type="file" id="exp-file-p" class="form-input" accept=".pdf" required>
                        </div>
                        <div>
                            <label class="stat-label">Anexos</label>
                            <input type="file" id="exp-file-a" class="form-input" accept=".pdf" multiple>
                        </div>
                    </div>
                </div>

                <div style="display: flex; justify-content: flex-end; gap: 12px; margin-top: 20px;">
                    <button type="button" class="btn btn-secondary" onclick="closeAllModals()">Cancelar</button>
                    <button type="submit" id="btnSubmitExp" class="btn btn-primary" style="padding: 12px 32px;">Registrar Expediente</button>
                </div>
            </form>
        `;

        this.dashboard.openModal('🏛️ Nueva Presentación de Expediente', content);
        
        const form = document.getElementById('formNuevoExpediente');
        if (form) {
            form.addEventListener('submit', (e) => this.handleSubmit(e));
        }
    }

    async handleSubmit(e) {
        e.preventDefault();
        const btn = document.getElementById('btnSubmitExp');
        const originalText = btn.textContent;

        // Helper local por si closeAllModals no está en scope
        const cerrarModal = () => {
            if (typeof closeAllModals === 'function') closeAllModals();
            else if (window.dashboardApp) window.dashboardApp.closeAllModals();
        };

        try {
            btn.disabled = true;
            btn.textContent = 'Enviando...';

            const materiaSel = document.getElementById('exp-materia').value;
            const materia = materiaSel === 'OTRO' ? document.getElementById('exp-materia-otro').value : materiaSel;
            
            const procesoSel = document.getElementById('exp-proceso').value;
            const proceso = (procesoSel === 'Otros' || procesoSel === 'OTRO') ? document.getElementById('exp-proceso-otro').value : procesoSel;

            // Generar número de expediente dinámico para validación del servidor
            const numeroExpediente = 'EXP-' + new Date().getFullYear() + '-' + String(Date.now()).slice(-5);

            const formData = new FormData();
            formData.append('numero_expediente', numeroExpediente);
            formData.append('sede', document.getElementById('exp-sede').value);
            formData.append('especialidad', document.getElementById('exp-especialidad').value);
            formData.append('motivo_ingreso', document.getElementById('exp-motivo').value);
            formData.append('proceso', proceso);
            formData.append('materia', materia);
            formData.append('cuantia', document.getElementById('exp-indeterminado').checked ? 0 : document.getElementById('exp-cuantia').value);
            formData.append('indeterminado', document.getElementById('exp-indeterminado').checked ? 1 : 0);
            formData.append('sumilla', document.getElementById('exp-sumilla').value);
            formData.append('tipo_presentante', document.getElementById('exp-tipo-pres').value);
            formData.append('presentante', document.getElementById('exp-presentante').value);
            formData.append('colegiatura', document.getElementById('exp-colegiatura').value);
            formData.append('colegio_abogados', document.getElementById('exp-colegio').value);
            formData.append('casilla_fisica', document.getElementById('exp-casilla-f').value);
            formData.append('casilla_electronica', document.getElementById('exp-casilla-e').value);
            formData.append('usuario_id', sessionStorage.getItem('userId') || '2');

            // Files
            const fileP = document.getElementById('exp-file-p');
            if (fileP.files.length > 0) formData.append('documentos_principales', fileP.files[0]);
            
            const fileA = document.getElementById('exp-file-a');
            if (fileA.files.length > 0) {
                Array.from(fileA.files).forEach(f => formData.append('anexos', f));
            }

            const response = await fetch('/api/expedientes', {
                method: 'POST',
                body: formData
            });

            const result = await response.json();

            if (result.success) {
                cerrarModal();
                Swal.fire({
                    title: '¡Expediente Presentado!',
                    text: 'El registro se ha realizado con éxito en la Mesa de Partes Virtual.',
                    icon: 'success',
                    confirmButtonColor: '#D4AF37'
                });
                await this.loadExpedientesUsuario();
            } else {
                throw new Error(result.error || 'Error en el registro');
            }
        } catch (error) {
            console.error('❌ Error:', error);
            cerrarModal();
            Swal.fire({ title: 'Error', text: error.message, icon: 'error', confirmButtonColor: '#D4AF37' });
        } finally {
            btn.disabled = false;
            btn.textContent = originalText;
        }
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = ExpedientesModule;
}