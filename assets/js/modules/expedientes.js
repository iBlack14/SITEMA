/**
 * Expedientes Module
 * Handles all expediente-related functionality
 */

class ExpedientesModule {
    constructor(dashboardApp) {
        this.dashboard = dashboardApp;
        this.expedientes = [];
        this.currentFilters = {};

        this.init();
    }

    /**
     * Initialize expedientes module
     */
    init() {
        this.setupEventListeners();
    }

    /**
     * Setup event listeners for expedientes
     */
    setupEventListeners() {
        // Nuevo expediente button
        const nuevoExpedienteBtn = document.querySelector('[onclick="crearNuevoExpediente()"]');
        if (nuevoExpedienteBtn) {
            nuevoExpedienteBtn.addEventListener('click', () => this.crearNuevoExpediente());
        }

        // Form submission
        const formExpediente = document.getElementById('formExpediente');
        if (formExpediente) {
            formExpediente.addEventListener('submit', (e) => this.handleNuevoExpediente(e));
        }

        // Character counter for sumilla
        const sumilla = document.getElementById('sumilla');
        if (sumilla) {
            sumilla.addEventListener('input', (e) => this.updateSumillaCounter(e));
        }

        // File upload handlers
        this.setupFileUploadHandlers();
    }

    /**
     * Setup file upload event handlers
     */
    setupFileUploadHandlers() {
        const uploadDocumento = document.getElementById('uploadDocumento');
        const uploadAnexo = document.getElementById('uploadAnexo');

        if (uploadDocumento) {
            uploadDocumento.addEventListener('change', (e) => this.handleFileUpload(e, 'documentos'));
        }

        if (uploadAnexo) {
            uploadAnexo.addEventListener('change', (e) => this.handleFileUpload(e, 'anexos'));
        }
    }

    /**
     * Load expedientes for current user
     */
    async loadExpedientesUsuario() {
        try {
            this.dashboard.showLoading('expedientes-loading');

            const usuarioId = sessionStorage.getItem('userId');
            console.log('📂 Cargando expedientes para usuario:', usuarioId);

            const response = await fetch(`/api/expedientes?usuario_id=${usuarioId}`);
            const data = await response.json();

            console.log('📦 Expedientes recibidos:', data);

            if (data.success) {
                this.expedientes = data.data || [];
                this.mostrarExpedientes(this.expedientes);
            } else {
                throw new Error(data.error || 'Error loading expedientes');
            }
        } catch (error) {
            console.error('Error loading expedientes:', error);
            this.dashboard.showError('Error cargando expedientes: ' + error.message);
            this.mostrarExpedientes([]);
        } finally {
            this.dashboard.hideLoading('expedientes-loading');
        }
    }

    /**
     * Display expedientes in table
     */
    mostrarExpedientes(expedientes) {
        console.log('Mostrando expedientes:', expedientes.length);
        
        const container = document.getElementById('expedientes-tbody');
        if (!container) {
            console.error('No se encontró el contenedor de expedientes');
            return;
        }

        if (!expedientes || expedientes.length === 0) {
            container.innerHTML = `
                <tr>
                    <td colspan="5" style="text-align: center; padding: 40px; color: #999;">
                        No tienes expedientes registrados
                    </td>
                </tr>
            `;
            return;
        }

        container.innerHTML = expedientes.map(exp => `
            <tr style="transition: background 0.2s;" 
                onmouseover="this.style.background='rgba(192,192,192,0.05)'" 
                onmouseout="this.style.background='transparent'">
                <td>${exp.numero || exp.id || 'N/A'}</td>
                <td>${exp.sumilla || exp.materia || 'Sin asunto'}</td>
                <td>${exp.fecha_creacion ? new Date(exp.fecha_creacion).toLocaleDateString('es-ES') : 'N/A'}</td>
                <td>
                    <span class="status-badge ${this.dashboard.getStatusClass(exp.estado)}">${exp.estado || 'Nuevo'}</span>
                </td>
                <td style="text-align: center;">
                    <button onclick="window.expedientesModule.verDetalleExpediente('${exp.id || exp.numero}')" 
                            class="btn-modal btn-modal-primary" 
                            style="padding: 6px 12px; font-size: 12px;">
                        👁️ Ver Detalle
                    </button>
                </td>
            </tr>
        `).join('');
    }

    /**
     * Create new expediente modal
     */
    crearNuevoExpediente() {
        const modal = document.getElementById('modalExpediente');
        if (modal) {
            modal.classList.add('active');
            document.body.style.overflow = 'hidden';
            this.resetFormExpediente();
        }
    }

    /**
     * Handle new expediente form submission
     */
    async handleNuevoExpediente(e) {
        e.preventDefault();

        const formData = new FormData();
        
        // Obtener valores directamente de los campos
        const expedienteData = {
            numero_expediente: this.generateExpedienteNumber(),
            sede: document.getElementById('sede')?.value,
            especialidad: document.getElementById('especialidad')?.value,
            motivo_ingreso: document.getElementById('motivoIngreso')?.value,
            proceso: document.getElementById('proceso')?.value,
            materia: document.getElementById('materia')?.value,
            cuantia: document.getElementById('cuantia')?.value,
            moneda: 'PEN', // Por defecto soles
            indeterminado: document.getElementById('indeterminado')?.checked || false,
            sumilla: document.getElementById('sumilla')?.value,
            tipo_presentante: document.getElementById('tipoPresentante')?.value,
            presentante: document.getElementById('presentante')?.value,
            colegiatura: document.getElementById('colegiatura')?.value,
            colegio_abogados: document.getElementById('colegioAbogados')?.value,
            casilla_fisica: document.getElementById('casillaFisica')?.value,
            oficina_casilla: document.getElementById('oficinaCasilla')?.value,
            casilla_electronica: document.getElementById('casillaElectronica')?.value,
            estado: 'Nuevo',
            usuario_id: sessionStorage.getItem('userId') || this.dashboard.getCurrentUserId() || '1'
        };

        // Validation
        if (!expedienteData.sede || !expedienteData.especialidad) {
            alert('Por favor, complete los campos obligatorios (Sede y Especialidad).');
            return;
        }

        const submitBtn = e.target.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;

        try {
            submitBtn.disabled = true;
            submitBtn.textContent = 'Presentando...';

            console.log('📤 Enviando expediente:', expedienteData);

            // Agregar archivos al FormData
            const uploadDocumento = document.getElementById('uploadDocumento');
            if (uploadDocumento && uploadDocumento.files.length > 0) {
                Array.from(uploadDocumento.files).forEach(file => {
                    formData.append('documentos_principales', file);
                    console.log('📄 Documento principal:', file.name);
                });
            }

            const uploadAnexo = document.getElementById('uploadAnexo');
            if (uploadAnexo && uploadAnexo.files.length > 0) {
                Array.from(uploadAnexo.files).forEach(file => {
                    formData.append('anexos', file);
                    console.log('📎 Anexo:', file.name);
                });
            }

            // Agregar datos del expediente al FormData
            Object.keys(expedienteData).forEach(key => {
                if (expedienteData[key] !== null && expedienteData[key] !== undefined) {
                    formData.append(key, expedienteData[key]);
                }
            });

            const response = await fetch('/api/expedientes', {
                method: 'POST',
                body: formData
            });

            const result = await response.json();

            if (result.success) {
                this.dashboard.showSuccess('Expediente presentado correctamente');
                this.closeModalExpediente();
                await this.loadExpedientesUsuario(); // Reload list
            } else {
                throw new Error(result.error || 'Error creando expediente');
            }

        } catch (error) {
            console.error('Error creando expediente:', error);
            this.dashboard.showError('Error creando expediente: ' + error.message);
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = originalText;
        }
    }

    /**
     * Generate unique expediente number
     */
    generateExpedienteNumber() {
        const year = new Date().getFullYear();
        const random = Math.floor(Math.random() * 9999).toString().padStart(4, '0');
        return `EXP-${year}-${random}`;
    }

    /**
     * Collect uploaded files information
     */
    collectUploadedFiles() {
        const documentos = [];

        // Collect main documents
        const mainFiles = document.getElementById('uploadDocumento');
        if (mainFiles && mainFiles.files.length > 0) {
            Array.from(mainFiles.files).forEach(file => {
                documentos.push({
                    tipo: 'principal',
                    nombre_original: file.name,
                    nombre_archivo: file.name,
                    tamano: file.size,
                    tipo_mime: file.type
                });
            });
        }

        // Collect attachments
        const attachmentFiles = document.getElementById('uploadAnexo');
        if (attachmentFiles && attachmentFiles.files.length > 0) {
            Array.from(attachmentFiles.files).forEach(file => {
                documentos.push({
                    tipo: 'anexo',
                    nombre_original: file.name,
                    nombre_archivo: file.name,
                    tamano: file.size,
                    tipo_mime: file.type
                });
            });
        }

        return documentos;
    }

    /**
     * Handle file upload
     */
    handleFileUpload(e, type) {
        const files = e.target.files;
        const container = document.getElementById(type === 'documentos' ? 'listaDocumentos' : 'listaAnexos');

        if (files.length > 0) {
            let fileList = '';
            Array.from(files).forEach(file => {
                fileList += `
                    <div class="file-item">
                        <span>${file.name}</span>
                        <span>(${this.formatFileSize(file.size)})</span>
                        <button onclick="this.parentElement.remove()">×</button>
                    </div>
                `;
            });
            container.innerHTML = fileList;
        } else {
            container.innerHTML = '<div style="color: #666;">No se encontraron registros</div>';
        }
    }

    /**
     * Format file size
     */
    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    /**
     * Update sumilla character counter
     */
    updateSumillaCounter(e) {
        const contadorCaracteres = document.getElementById('contadorCaracteres');
        if (contadorCaracteres) {
            const remaining = 255 - e.target.value.length;
            contadorCaracteres.textContent = remaining;
        }
    }

    /**
     * Reset expediente form
     */
    resetFormExpediente() {
        const form = document.getElementById('formExpediente');
        if (form) {
            form.reset();
            document.getElementById('contadorCaracteres').textContent = '255';
            document.getElementById('listaDocumentos').innerHTML = '<div style="color: #666;">No se encontraron registros</div>';
            document.getElementById('listaAnexos').innerHTML = '<div style="color: #666;">No se encontraron registros</div>';
        }
    }

    /**
     * Close expediente modal
     */
    closeModalExpediente() {
        const modal = document.getElementById('modalExpediente');
        if (modal) {
            modal.classList.remove('active');
            document.body.style.overflow = '';
        }
    }

    /**
     * Ver detalle de expediente
     */
    async verDetalleExpediente(expedienteId) {
        const expediente = this.expedientes.find(e => e.id === expedienteId || e.numero === expedienteId);
        if (!expediente) {
            this.dashboard.showError('Expediente no encontrado');
            return;
        }
        
        console.log('📋 Datos del expediente:', expediente);

        // Obtener archivos desde la API
        let archivos = [];
        try {
            console.log('🔍 Obteniendo archivos para expediente:', expedienteId);
            const response = await fetch(`/api/expedientes/${expedienteId}/archivos`);
            const data = await response.json();
            console.log('📦 Respuesta de archivos:', data);
            
            if (data.success && data.data) {
                archivos = data.data;
                console.log('✅ Archivos encontrados:', archivos.length);
            } else {
                console.warn('⚠️ No se encontraron archivos o respuesta inválida');
            }
        } catch (error) {
            console.error('❌ Error obteniendo archivos:', error);
        }

        // Generar HTML de archivos
        const archivosHTML = archivos.length > 0 ? `
            <div style="margin-bottom: 15px;">
                <strong style="color: #C0C0C0;">Documentos Adjuntos (${archivos.length}):</strong><br>
                <div style="margin-top: 10px; display: grid; gap: 10px;">
                    ${archivos.map(archivo => {
                        const icono = archivo.tipo === 'principal' ? '📄' : '📎';
                        const tamano = this.formatFileSize(archivo.tamano || archivo.size || 0);
                        return `
                            <div style="background: rgba(0,0,0,0.3); padding: 12px; border-radius: 8px; display: flex; justify-content: space-between; align-items: center;">
                                <div style="flex: 1;">
                                    <span style="font-size: 20px; margin-right: 10px;">${icono}</span>
                                    <span style="color: #fff; font-weight: 500;">${archivo.nombre_original || archivo.nombre}</span>
                                    <br>
                                    <span style="color: #999; font-size: 12px; margin-left: 30px;">
                                        ${archivo.tipo === 'principal' ? 'Documento Principal' : 'Anexo'} • ${tamano}
                                    </span>
                                </div>
                                <button class="btn-modal btn-modal-primary" 
                                        onclick="window.expedientesModule.descargarArchivo('${archivo.ruta_archivo || archivo.url || `/uploads/${archivo.nombre_archivo}`}', '${archivo.nombre_original || archivo.nombre}')"
                                        style="padding: 6px 12px; font-size: 12px;">
                                    ⬇️ Descargar
                                </button>
                            </div>
                        `;
                    }).join('')}
                </div>
            </div>
        ` : '';

        // Show detailed modal with expediente information
        const detalleHTML = `
            <div style="text-align: left;">
                <h3 style="color: #C0C0C0; margin-bottom: 20px;">Detalle de Expediente</h3>

                <div style="background: rgba(255,255,255,0.05); padding: 20px; border-radius: 10px; margin-bottom: 20px;">
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 15px;">
                        <div>
                            <strong style="color: #C0C0C0;">N° Expediente:</strong><br>
                            <span style="color: #fff;">${expediente.numero || expediente.numero_expediente || 'No disponible'}</span>
                        </div>
                        <div>
                            <strong style="color: #C0C0C0;">Fecha:</strong><br>
                            <span style="color: #fff;">${expediente.fecha_registro ? new Date(expediente.fecha_registro).toLocaleString('es-ES') : 'No disponible'}</span>
                        </div>
                        <div>
                            <strong style="color: #C0C0C0;">Sede:</strong><br>
                            <span style="color: #fff;">${expediente.sede || 'No especificado'}</span>
                        </div>
                        <div>
                            <strong style="color: #C0C0C0;">Estado:</strong><br>
                            <span class="status-badge ${this.dashboard.getStatusClass(expediente.estado)}">${expediente.estado || 'Nuevo'}</span>
                        </div>
                    </div>

                    <div style="margin-bottom: 15px;">
                        <strong style="color: #C0C0C0;">Proceso/Materia:</strong><br>
                        <span style="color: #fff;">${expediente.proceso || 'No especificado'} / ${expediente.materia || 'No especificado'}</span>
                    </div>

                    <div style="margin-bottom: 20px;">
                        <strong style="color: #C0C0C0;">Sumilla:</strong><br>
                        <span style="color: #fff;">${expediente.sumilla || 'No especificada'}</span>
                    </div>

                    ${archivosHTML || '<div style="color: #999; font-style: italic;">No hay archivos adjuntos</div>'}
                </div>

                <div style="text-align: center;">
                    <button class="btn-modal btn-modal-secondary" onclick="window.dashboardApp.closeAllModals()">Cerrar</button>
                </div>
            </div>
        `;

        // Create or update detail modal
        let detailModal = document.getElementById('modalDetalleExpediente');
        if (!detailModal) {
            detailModal = document.createElement('div');
            detailModal.id = 'modalDetalleExpediente';
            detailModal.className = 'modal-overlay';
            detailModal.innerHTML = `
                <div class="modal-content" style="max-width: 700px;">
                    <div class="modal-header">
                        <span>Detalle de Expediente</span>
                        <button class="modal-close" onclick="window.dashboardApp.closeAllModals()">×</button>
                    </div>
                    <div class="modal-body" id="detalleExpedienteContent">
                    </div>
                </div>
            `;
            document.body.appendChild(detailModal);
        } 

        document.getElementById('detalleExpedienteContent').innerHTML = detalleHTML;
        detailModal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    /**
     * Descargar archivo usando ruta segura
     */
    async descargarArchivo(url, nombreOriginal) {
        if (!url) {
            alert('URL del archivo no disponible');
            console.error('❌ URL no disponible para descarga');
            return;
        }

        console.log(`📥 Intentando descargar archivo:`);
        console.log(`   URL original: ${url}`);
        console.log(`   Nombre: ${nombreOriginal}`);

        try {
            // Extraer nombre de archivo de la URL
            const filename = url.split('/').pop();
            
            // Usar nueva ruta segura de descarga
            const downloadUrl = `/api/download/archivo/${filename}`;
            console.log(`   URL de descarga: ${downloadUrl}`);

            // Crear enlace temporal para descarga
            const link = document.createElement('a');
            link.href = downloadUrl;
            link.download = nombreOriginal || 'documento';
            link.target = '_blank';
            
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            console.log('✅ Descarga iniciada');
            if (this.dashboard && typeof this.dashboard.showSuccess === 'function') {
                this.dashboard.showSuccess('Descarga iniciada');
            }

        } catch (error) {
            console.error('❌ Error al descargar archivo:', error);
            alert(`Error al descargar el archivo: ${error.message}`);
            if (this.dashboard && typeof this.dashboard.showError === 'function') {
                this.dashboard.showError('Error al descargar el archivo');
            }
        }
    }

    /**
     * Get expedientes statistics
     */
    getExpedientesStats() {
        const total = this.expedientes.length;
        const activos = this.expedientes.filter(e => e.estado === 'Activo').length;
        const cerrados = this.expedientes.filter(e => e.estado === 'Cerrado').length;

        return { total, activos, cerrados };
    }
}

// Make functions globally available for onclick handlers
window.verDetalleExpediente = function(expedienteId) {
    if (window.expedientesModule) {
        window.expedientesModule.verDetalleExpediente(expedienteId);
    }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ExpedientesModule;
}