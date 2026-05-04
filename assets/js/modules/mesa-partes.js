/**
 * Mesa de Partes Module
 * Handles all mesa de partes functionality
 */

class MesaPartesModule {
    constructor(dashboardApp) {
        this.dashboard = dashboardApp;
        this.documentos = [];
        this.currentFilters = {};

        this.init();
    }

    /**
     * Initialize mesa de partes module
     */
    init() {
        this.setupEventListeners();
    }

    /**
     * Setup event listeners for mesa de partes
     */
    setupEventListeners() {
        // Presentar documento button
        const presentarBtn = document.querySelector('#mesa [onclick*="Subir"]');
        if (presentarBtn) {
            presentarBtn.addEventListener('click', () => this.presentarDocumento());
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
        if (!tableBody) {
            console.warn('⚠️ No se encontró tbody de mesa de partes');
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
        const modal = document.createElement('div');
        modal.className = 'modal-overlay active';
        modal.id = 'modalDetalleMesaPartes';

        const demandante = presentacion.demandante || {};
        const demandado = presentacion.demandado || {};
        const documentos = presentacion.documentos || [];

        modal.innerHTML = `
            <div class="modal-content" style="max-width: 800px;">
                <div class="modal-header">
                    <span>Detalle de Presentación - ${presentacion.numero_registro}</span>
                    <button class="modal-close" onclick="this.closest('.modal-overlay').remove(); document.body.style.overflow = '';">&times;</button>
                </div>
                <div class="modal-body">
                    <div style="display: grid; gap: 20px;">
                        <div class="info-section">
                            <h3 style="color: #C0C0C0; margin-bottom: 10px;">📋 Información General</h3>
                            <div class="info-grid">
                                <div><strong>Número:</strong> ${presentacion.numero_registro}</div>
                                <div><strong>Tipo:</strong> ${presentacion.tipo_presentacion}</div>
                                <div><strong>Materia:</strong> ${presentacion.materia || 'N/A'}</div>
                                <div><strong>Estado:</strong> <span class="status-badge status-${(presentacion.estado || 'pendiente').toLowerCase()}">${presentacion.estado}</span></div>
                                <div><strong>Fecha:</strong> ${new Date(presentacion.fecha_presentacion).toLocaleString('es-ES')}</div>
                            </div>
                        </div>

                        <div class="info-section">
                            <h3 style="color: #C0C0C0; margin-bottom: 10px;">👤 Demandante</h3>
                            <div class="info-grid">
                                <div><strong>Nombre:</strong> ${demandante.nombre || 'N/A'}</div>
                                <div><strong>Documento:</strong> ${demandante.documento_tipo || ''} ${demandante.documento_numero || 'N/A'}</div>
                                <div><strong>Correo:</strong> ${demandante.correo || 'N/A'}</div>
                                <div><strong>Teléfono:</strong> ${demandante.telefono || 'N/A'}</div>
                            </div>
                        </div>

                        <div class="info-section">
                            <h3 style="color: #C0C0C0; margin-bottom: 10px;">⚖️ Demandado</h3>
                            <div class="info-grid">
                                <div><strong>Nombre:</strong> ${demandado.nombre || 'N/A'}</div>
                                <div><strong>Documento:</strong> ${demandado.documento_tipo || ''} ${demandado.documento_numero || 'N/A'}</div>
                            </div>
                        </div>

                        ${documentos.length > 0 ? `
                        <div class="info-section">
                            <h3 style="color: #C0C0C0; margin-bottom: 10px;">📎 Documentos Adjuntos (${documentos.length})</h3>
                            <div class="documentos-list">
                                ${documentos.map((doc, idx) => `
                                    <div class="documento-item" style="padding: 10px; border: 1px solid #ddd; border-radius: 5px; margin-bottom: 10px;">
                                        <div style="display: flex; justify-content: space-between; align-items: center;">
                                            <div>
                                                <strong>${idx + 1}. ${doc.nombre_original || 'Documento'}</strong>
                                                <div style="font-size: 12px; color: #666;">
                                                    ${(doc.tamano / 1024).toFixed(2)} KB
                                                </div>
                                            </div>
                                            <a href="/uploads/mesa-partes/${doc.nombre_archivo}" target="_blank" class="btn btn-sm btn-primary">
                                                📥 Descargar
                                            </a>
                                        </div>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                        ` : ''}

                        ${presentacion.observaciones ? `
                        <div class="info-section">
                            <h3 style="color: #C0C0C0; margin-bottom: 10px;">💬 Observaciones</h3>
                            <p style="padding: 10px; background: #f5f5f5; border-radius: 5px;">${presentacion.observaciones}</p>
                        </div>
                        ` : ''}
                    </div>
                </div>
                <div class="modal-footer" style="text-align: right; padding: 15px; border-top: 1px solid #ddd;">
                    <button class="btn btn-secondary" onclick="this.closest('.modal-overlay').remove(); document.body.style.overflow = '';">
                        Cerrar
                    </button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        document.body.style.overflow = 'hidden';
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
            <div class="modal-content">
                <div class="modal-header">
                    <span>Presentar Documento</span>
                    <button class="modal-close" onclick="this.closest('.modal-overlay').classList.remove('active'); document.body.style.overflow = '';">×</button>
                </div>
                <div class="modal-body">
                    <div class="form-group-modal">
                        <label>Tipo de Documento</label>
                        <select id="tipoDocumentoMesa" class="form-select-modal">
                            <option value="solicitud">Solicitud</option>
                            <option value="consulta">Consulta</option>
                            <option value="reclamo">Reclamo</option>
                            <option value="otro">Otro</option>
                        </select>
                    </div>

                    <div class="form-group-modal">
                        <label>Archivo PDF</label>
                        <div class="file-upload">
                            <label for="fileMesa" class="file-upload-label">Seleccionar archivo</label>
                            <input type="file" id="fileMesa" accept=".pdf" style="display: none;">
                            <span id="fileNameMesa" style="margin-left: 15px; color: #999;"></span>
                        </div>
                    </div>

                    <div class="form-group-modal">
                        <label>Descripción</label>
                        <textarea id="descripcionMesa" class="form-textarea-modal" placeholder="Descripción del documento..."></textarea>
                    </div>

                    <div class="modal-actions">
                        <button type="button" class="btn-modal btn-modal-secondary" onclick="this.closest('.modal-overlay').classList.remove('active'); document.body.style.overflow = '';">Cancelar</button>
                        <button type="button" class="btn-modal btn-modal-primary" onclick="mesaPartesModule.submitDocumento()">Presentar</button>
                    </div>
                </div>
            </div>
        `;

        // Setup file input handler
        const fileInput = modal.querySelector('#fileMesa');
        const fileName = modal.querySelector('#fileNameMesa');

        fileInput.addEventListener('change', (e) => {
            if (e.target.files.length > 0) {
                fileName.textContent = e.target.files[0].name;
            } else {
                fileName.textContent = '';
            }
        });

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