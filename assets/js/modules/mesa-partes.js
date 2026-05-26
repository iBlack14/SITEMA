/**
 * Mesa de Partes Module
 * Handles all mesa de partes functionality
 */

class MesaPartesModule {
    constructor(dashboardApp) {
        this.dashboard = dashboardApp;
        this.documentos = [];
        this.currentFilters = {};

        console.log('📂 Mesa de Partes Module Initialized');
        this.init();
    }

    /**
     * Initialize mesa de partes module
     */
    async init() {
        this.setupEventListeners();
    }

    /**
     * Setup event listeners for mesa de partes
     */
    setupEventListeners() {
        // Presentar documento button
        const presentarBtn = document.querySelector('[onclick*="presentarDocumento"]');
        if (presentarBtn) {
            presentarBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.presentarDocumento();
            });
        }

        // File upload for mesa de partes
        const fileInput = document.getElementById('mesa-file-upload');
        if (fileInput) {
            fileInput.addEventListener('change', (e) => this.handleFileUpload(e));
        }
    }

    /**
     * Load mesa de partes data
     */
    async loadMesaPartesData() {
        try {
            // Load documentos presentados
            await this.loadDocumentosPresentados();
        } catch (error) {
            console.error('Error loading mesa de partes data:', error);
        }
    }

    /**
     * Load documentos presentados (Mesa de Partes)
     */
    async loadDocumentosPresentados() {
        try {
            const usuarioId = sessionStorage.getItem('userId') || '1';

            console.log('📂 Cargando presentaciones de Mesa de Partes para usuario:', usuarioId);

            // Get presentaciones from mesa-partes
            const response = await fetch(`/api/mesa-partes?usuario_id=${usuarioId}`);
            const data = await response.json();

            console.log('📦 Presentaciones recibidas:', data);

            if (data.success) {
                this.documentos = data.data || [];
                this.mostrarDocumentosPresentados(this.documentos);
            } else {
                throw new Error(data.error || 'Error loading documentos');
            }
        } catch (error) {
            console.error('❌ Error loading documentos presentados:', error);
            this.mostrarDocumentosPresentados([]);
        }
    }

    /**
     * Display documentos presentados (Mesa de Partes)
     */
    mostrarDocumentosPresentados(documentos) {
        const tableBody = document.querySelector('#mesa-tbody');
        
        // Si el DOM no está listo (sucede durante la inicialización rápida), reintentar
        if (!tableBody) {
            console.log('⏳ DOM de Mesa de Partes no listo, reintentando renderizado...');
            setTimeout(() => this.mostrarDocumentosPresentados(documentos), 500);
            return;
        }

        if (!documentos || documentos.length === 0) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="5" style="text-align: center; color: #666; padding: 40px;">
                        No hay presentaciones registradas
                    </td>
                </tr>
            `;
            return;
        }

        console.log('📋 Mostrando', documentos.length, 'presentaciones');

        tableBody.innerHTML = documentos.map(doc => {
            const fecha = new Date(doc.fecha_presentacion).toLocaleDateString('es-ES');
            const estadoClass = `status-${(doc.estado || 'pendiente').toLowerCase().replace(' ', '-')}`;

            return `
                <tr style="transition: background 0.2s;" 
                    onmouseover="this.style.background='rgba(192,192,192,0.05)'" 
                    onmouseout="this.style.background='transparent'">
                    <td>${doc.numero_registro || 'N/A'}</td>
                    <td>${doc.materia || doc.tipo_presentacion || 'Documento'}</td>
                    <td>${fecha}</td>
                    <td><span class="status-badge ${estadoClass}">${doc.estado || 'Pendiente'}</span></td>
                    <td>
                        <button class="btn btn-primary btn-sm" onclick="mesaPartesModule.verDetalle('${doc.id}')" title="Ver detalles">
                            👁️ Ver Detalle
                        </button>
                    </td>
                </tr>
            `;
        }).join('');
    }

    /**
     * Ver detalle de presentación
     */
    async verDetalle(id) {
        try {
            console.log('🔍 Cargando detalle de presentación:', id);

            const response = await fetch(`/api/mesa-partes/${id}`);
            const data = await response.json();

            if (data.success) {
                this.mostrarModalDetalle(data.data);
            } else {
                throw new Error(data.error || 'Error cargando detalle');
            }
        } catch (error) {
            console.error('❌ Error cargando detalle:', error);
            alert('Error al cargar el detalle de la presentación');
        }
    }

    /**
     * Mostrar modal con detalle de presentación
     */
    mostrarModalDetalle(presentacion) {
        // Eliminar modal anterior si existe
        const anterior = document.getElementById('modalDetalleMesaPartes');
        if (anterior) anterior.remove();

        const modal = document.createElement('div');
        modal.className = 'modal-overlay active';
        modal.id = 'modalDetalleMesaPartes';

        const dem  = presentacion.demandante || {};
        const ddo  = presentacion.demandado  || {};
        const docs = presentacion.documentos || [];
        const cerrar = `this.closest('.modal-overlay').remove(); document.body.style.overflow='';`;

        const fmtFecha = (f) => f ? new Date(f).toLocaleDateString('es-PE', { day:'2-digit', month:'long', year:'numeric', hour:'2-digit', minute:'2-digit' }) : '—';
        const fmtSize  = (b) => b ? (b >= 1048576 ? (b/1048576).toFixed(1)+' MB' : (b/1024).toFixed(1)+' KB') : '';

        // Badge de estado
        const estadoColors = { pendiente:'#f59e0b', 'en revisión':'#3b82f6', aprobado:'#10b981', rechazado:'#ef4444' };
        const estadoKey = (presentacion.estado||'').toLowerCase();
        const estadoColor = estadoColors[estadoKey] || '#6b7280';

        // Fila de campo (solo si tiene valor)
        const campo = (label, val) => val && val !== 'N/A' ? `
            <div style="display:flex;flex-direction:column;gap:3px;">
                <span style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#9ca3af;">${label}</span>
                <span style="font-size:14px;font-weight:600;color:#111827;">${val}</span>
            </div>` : '';

        // Sección con título
        const seccion = (icono, titulo, contenido) => `
            <div style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:14px;padding:18px 20px;">
                <div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#6b7280;
                            margin-bottom:14px;padding-bottom:10px;border-bottom:1px solid #e5e7eb;display:flex;align-items:center;gap:8px;">
                    <span>${icono}</span><span>${titulo}</span>
                </div>
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">${contenido}</div>
            </div>`;

        modal.innerHTML = `
            <div class="modal-content" style="max-width:780px;border-radius:20px;overflow:hidden;">
                <!-- Header -->
                <div class="modal-header" style="padding:20px 24px;border-bottom:1px solid #e5e7eb;">
                    <div style="display:flex;flex-direction:column;gap:2px;">
                        <span style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#9ca3af;">Mesa de Partes Virtual</span>
                        <span style="font-size:16px;font-weight:800;color:#d97706;">${presentacion.numero_registro}</span>
                    </div>
                    <button class="modal-close" onclick="${cerrar}">&times;</button>
                </div>

                <div class="modal-body" style="padding:20px 24px;display:flex;flex-direction:column;gap:14px;max-height:70vh;overflow-y:auto;">

                    <!-- Resumen rápido -->
                    <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:12px;">
                        <div style="background:linear-gradient(135deg,#fffbeb,#fef3c7);border:1px solid #fde68a;border-radius:14px;padding:14px 16px;">
                            <div style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#92400e;margin-bottom:5px;">Tipo</div>
                            <div style="font-size:13px;font-weight:700;color:#b45309;">${presentacion.tipo_presentacion || '—'}</div>
                        </div>
                        <div style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:14px;padding:14px 16px;">
                            <div style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#6b7280;margin-bottom:5px;">Materia</div>
                            <div style="font-size:13px;font-weight:700;color:#111827;">${presentacion.materia || '—'}</div>
                        </div>
                        <div style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:14px;padding:14px 16px;">
                            <div style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#6b7280;margin-bottom:5px;">Estado</div>
                            <span style="display:inline-flex;align-items:center;gap:5px;padding:4px 10px;border-radius:20px;font-size:11px;font-weight:700;text-transform:uppercase;
                                         background:${estadoColor}18;color:${estadoColor};border:1px solid ${estadoColor}30;">
                                <span style="width:6px;height:6px;border-radius:50%;background:${estadoColor};display:inline-block;"></span>
                                ${presentacion.estado || 'Pendiente'}
                            </span>
                        </div>
                    </div>

                    <!-- Fecha -->
                    <div style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:12px;padding:12px 16px;
                                font-size:13px;color:#6b7280;display:flex;align-items:center;gap:8px;">
                        🕐 <strong style="color:#374151;">Fecha de presentación:</strong>&nbsp;${fmtFecha(presentacion.fecha_presentacion)}
                    </div>

                    <!-- Demandante -->
                    ${seccion('👤', 'Demandante',
                        campo('Nombre', dem.nombre || dem.razon_social) +
                        campo('Documento', dem.documento_tipo && dem.documento_numero ? `${dem.documento_tipo} ${dem.documento_numero}` : (dem.documento_numero || null)) +
                        campo('Correo', dem.correo) +
                        campo('Teléfono', dem.telefono)
                    )}

                    <!-- Demandado (solo si tiene datos reales) -->
                    ${(ddo.nombre || ddo.razon_social) ? seccion('⚖️', 'Demandado',
                        campo('Nombre', ddo.nombre || ddo.razon_social) +
                        campo('Documento', ddo.documento_tipo && ddo.documento_numero ? `${ddo.documento_tipo} ${ddo.documento_numero}` : (ddo.documento_numero || null)) +
                        campo('Correo', ddo.correo) +
                        campo('Teléfono', ddo.telefono)
                    ) : ''}

                    <!-- Sumilla -->
                    ${presentacion.sumilla ? `
                    <div style="background:#fffbeb;border:1px solid #fde68a;border-radius:14px;padding:16px 20px;">
                        <div style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#92400e;margin-bottom:8px;">📝 Sumilla</div>
                        <p style="font-size:14px;color:#1a1a1a;line-height:1.6;margin:0;">${presentacion.sumilla}</p>
                    </div>` : ''}

                    <!-- Documentos -->
                    ${docs.length > 0 ? `
                    <div style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:14px;padding:18px 20px;">
                        <div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#6b7280;
                                    margin-bottom:14px;padding-bottom:10px;border-bottom:1px solid #e5e7eb;">
                            📎 Documentos Adjuntos <span style="background:#e5e7eb;color:#374151;padding:2px 8px;border-radius:20px;font-size:11px;">${docs.length}</span>
                        </div>
                        <div style="display:flex;flex-direction:column;gap:8px;">
                            ${docs.map((doc, i) => `
                            <div style="display:flex;justify-content:space-between;align-items:center;
                                        background:#fff;border:1px solid #e5e7eb;border-radius:10px;padding:12px 16px;">
                                <div style="display:flex;align-items:center;gap:12px;">
                                    <div style="width:36px;height:36px;background:#fee2e2;border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:18px;">📄</div>
                                    <div>
                                        <div style="font-size:13px;font-weight:600;color:#111827;max-width:380px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">
                                            ${i+1}. ${doc.nombre_original || 'Documento'}
                                        </div>
                                        ${doc.tamano ? `<div style="font-size:11px;color:#9ca3af;margin-top:2px;">${fmtSize(doc.tamano)}</div>` : ''}
                                    </div>
                                </div>
                                <a href="/uploads/mesa-partes/${doc.nombre_archivo}" target="_blank"
                                   style="display:inline-flex;align-items:center;gap:6px;padding:8px 16px;
                                          background:linear-gradient(135deg,#d97706,#f59e0b);color:#fff;
                                          border-radius:8px;font-size:12px;font-weight:700;text-decoration:none;
                                          text-transform:uppercase;letter-spacing:0.5px;white-space:nowrap;">
                                    ⬇ Descargar
                                </a>
                            </div>`).join('')}
                        </div>
                    </div>` : ''}

                    <!-- Observaciones -->
                    ${presentacion.observaciones ? `
                    <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:14px;padding:16px 20px;">
                        <div style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#166534;margin-bottom:8px;">💬 Observaciones</div>
                        <p style="font-size:14px;color:#1a1a1a;line-height:1.6;margin:0;">${presentacion.observaciones}</p>
                    </div>` : ''}

                </div>

                <!-- Footer -->
                <div style="padding:16px 24px;border-top:1px solid #e5e7eb;display:flex;justify-content:flex-end;">
                    <button onclick="${cerrar}"
                        style="padding:10px 28px;background:#f3f4f6;border:1px solid #e5e7eb;border-radius:10px;
                               font-size:13px;font-weight:600;color:#374151;cursor:pointer;transition:all 0.2s;"
                        onmouseover="this.style.background='#e5e7eb'" onmouseout="this.style.background='#f3f4f6'">
                        Cerrar
                    </button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        document.body.style.overflow = 'hidden';

        // Cerrar al click en el overlay
        modal.addEventListener('click', (e) => {
            if (e.target === modal) { modal.remove(); document.body.style.overflow = ''; }
        });
    }

    /**
     * Presentar documento
     */
    presentarDocumento() {
        // Show file upload interface
        this.showDocumentoModal();
    }

    /**
     * Show documento modal
     */
    showDocumentoModal() {
        // Create or show modal for document presentation
        let modal = document.getElementById('modalPresentarDocumento');

        if (!modal) {
            modal = this.createDocumentoModal();
            document.body.appendChild(modal);
        }

        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    /**
     * Create documento modal
     */
    createDocumentoModal() {
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.id = 'modalPresentarDocumento';

        modal.innerHTML = `
            <div class="modal-content" style="max-width: 600px;">
                <div class="modal-header">
                    <span class="text-gold">📤 Nueva Presentación Procesal</span>
                    <button class="modal-close" onclick="closeAllModals()">
                        <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>
                    </button>
                </div>
                <div class="modal-body">
                    <p class="text-muted" style="margin-bottom: 24px;">Complete los datos para el registro oficial de su documento en la Mesa de Partes Virtual.</p>
                    
                    <div style="display: grid; gap: 24px;">
                        <div class="form-group">
                            <label class="stat-label" style="display: block; margin-bottom: 8px;">Tipo de Documento</label>
                            <select id="tipoDocumentoMesa" class="form-select">
                                <option value="ARBITRAJE">ARBITRAJE</option>
                                <option value="JUNTA DE PREVENCION">JUNTA DE PREVENCION Y RESOLUCION DE DISPUTAS</option>
                                <option value="CONCILIACION">CONCILIACION EXTRAJUDICIAL</option>
                                <option value="ARBITRAJE DE EMERGENCIA">ARBITRAJE DE EMERGENCIA</option>
                                <option value="ARBITRAJE EXPRESS">ARBITRAJE EXPRESS</option>
                                <option value="ARBITRAJE ENTRE PRIVADOS">ARBITRAJE ENTRE PRIVADOS</option>
                                <option value="CENTRO DE FORMACION">CENTRO DE FORMACION Y CAPACITACION</option>
                                <option value="OTRO">OTRO</option>
                            </select>
                        </div>

                        <div class="form-group">
                            <label class="stat-label" style="display: block; margin-bottom: 8px;">Descripción o Sumilla</label>
                            <textarea id="descripcionMesa" class="form-textarea" rows="3" placeholder="Breve descripción del contenido del documento..."></textarea>
                        </div>

                        <div class="form-group">
                            <label class="stat-label" style="display: block; margin-bottom: 8px;">Documento PDF (Firma Digital)</label>
                            <div class="file-upload-zone" style="border: 2px dashed var(--glass-border); border-radius: 16px; padding: 40px; text-align: center; cursor: pointer; transition: var(--transition-fast); background: rgba(212, 175, 55, 0.03);">
                                <input type="file" id="fileMesa" accept=".pdf" style="display: none;">
                                <div id="upload-ui">
                                    <svg viewBox="0 0 24 24" width="48" height="48" fill="var(--color-primary)" style="margin-bottom: 12px; opacity: 0.8;">
                                        <path d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96zM14 13v4h-4v-4H7l5-5 5 5h-3z"/>
                                    </svg>
                                    <p style="font-weight: 600; color: var(--color-text);">Haga clic para seleccionar archivo</p>
                                    <p style="font-size: 12px; color: var(--color-silver-muted);">Solo archivos PDF hasta 20MB</p>
                                </div>
                                <div id="file-selected-ui" style="display: none;">
                                    <div style="display: flex; align-items: center; justify-content: center; gap: 10px; color: var(--color-success);">
                                        <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>
                                        <span id="fileNameMesa" style="font-weight: 700;"></span>
                                    </div>
                                    <button type="button" class="btn btn-secondary btn-sm" style="margin-top: 10px;" onclick="document.getElementById('fileMesa').value=''; document.getElementById('upload-ui').style.display='block'; document.getElementById('file-selected-ui').style.display='none'; event.stopPropagation();">Cambiar archivo</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="modal-footer" style="display: flex; justify-content: flex-end; gap: 16px; padding: 24px 30px; margin-top: 10px;">
                    <button type="button" class="btn btn-secondary" onclick="closeAllModals()" style="padding: 12px 30px; font-weight: 600; font-size: 13px;">CANCELAR</button>
                    <button type="button" class="btn btn-primary" onclick="window.mesaPartesModule.submitDocumento()" id="btnSubmitMesa" style="padding: 12px 40px; font-weight: 700; font-size: 13px; text-transform: uppercase;">
                        Presentar Documento
                    </button>
                </div>
            </div>
        `;

        // Logic for file selection UI
        const zone = modal.querySelector('.file-upload-zone');
        const input = modal.querySelector('#fileMesa');
        const uiNormal = modal.querySelector('#upload-ui');
        const uiSelected = modal.querySelector('#file-selected-ui');
        const nameSpan = modal.querySelector('#fileNameMesa');

        zone.onclick = () => input.click();
        input.onchange = (e) => {
            if (e.target.files.length > 0) {
                nameSpan.textContent = e.target.files[0].name;
                uiNormal.style.display = 'none';
                uiSelected.style.display = 'block';
            }
        };

        return modal;
    }

    /**
     * Submit documento
     */
    async submitDocumento() {
        const tipo = document.getElementById('tipoDocumentoMesa')?.value;
        const fileInput = document.getElementById('fileMesa');
        const descripcion = document.getElementById('descripcionMesa')?.value;

        if (!tipo || !fileInput?.files[0]) {
            alert('Por favor, complete todos los campos.');
            return;
        }

        try {
            const usuarioId = sessionStorage.getItem('userId');
            
            if (!usuarioId) {
                alert('Error: No se encontró el ID de usuario');
                return;
            }

            const formData = new FormData();
            
            // Datos básicos para documento adicional
            formData.append('usuario_id', usuarioId);
            formData.append('tipo_presentacion', tipo);
            formData.append('materia', tipo); // Usar el tipo como materia
            formData.append('sumilla', descripcion || 'Documento adicional');
            
            // Datos mínimos del demandante (se pueden obtener del usuario actual)
            formData.append('demandante', JSON.stringify({
                nombre: sessionStorage.getItem('userName') || 'Usuario',
                correo: sessionStorage.getItem('userEmail') || '',
                telefono: '',
                documento_tipo: 'DNI',
                documento_numero: ''
            }));
            
            // Datos mínimos del demandado (vacío para documentos adicionales)
            formData.append('demandado', JSON.stringify({
                nombre: 'N/A',
                documento_tipo: 'DNI',
                documento_numero: ''
            }));
            
            // Documento adjunto
            formData.append('documentos', fileInput.files[0]);

            console.log('📤 Enviando documento adicional a Mesa de Partes...');

            const response = await fetch('/api/mesa-partes', {
                method: 'POST',
                body: formData
            });

            const result = await response.json();

            if (result.success) {
                this.dashboard.showSuccess('✅ Documento presentado correctamente. Llegará a la Casilla del Admin.');
                this.closeDocumentoModal();
                await this.loadDocumentosPresentados();
            } else {
                throw new Error(result.error || 'Error presentando documento');
            }
        } catch (error) {
            console.error('❌ Error presentando documento:', error);
            this.dashboard.showError('Error presentando documento: ' + error.message);
        }
    }

    /**
     * Close documento modal
     */
    closeDocumentoModal() {
        const modal = document.getElementById('modalPresentarDocumento');
        if (modal) {
            modal.classList.remove('active');
            document.body.style.overflow = '';
        }
    }

    /**
     * Get mesa de partes statistics
     */
    getMesaPartesStats() {
        const total = this.documentos.length;
        const recibidos = this.documentos.filter(d => d.estado === 'Recibido').length;

        return { total, recibidos };
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = MesaPartesModule;
}