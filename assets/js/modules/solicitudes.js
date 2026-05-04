/**
 * Solicitudes Module
 * Handles all solicitud-related functionality
 */

class SolicitudesModule {
    constructor(dashboardApp) {
        this.dashboard = dashboardApp;
        this.solicitudes = [];
        this.currentFilters = {};

        this.init();
    }

    /**
     * Initialize solicitudes module
     */
    init() {
        this.setupEventListeners();
        this.setupRealTimeValidation();
    }

    /**
     * Setup event listeners for solicitudes
     */
    setupEventListeners() {
        // Nueva solicitud button
        const nuevaSolicitudBtn = document.querySelector('[onclick="crearNuevaSolicitud()"]');
        if (nuevaSolicitudBtn) {
            nuevaSolicitudBtn.addEventListener('click', () => this.crearNuevaSolicitud());
        }

        // Form submission
        const formSolicitud = document.getElementById('formSolicitud');
        if (formSolicitud) {
            formSolicitud.addEventListener('submit', (e) => this.handleNuevaSolicitud(e));
        }

        // Tipo de solicitud change
        const tipoSolicitud = document.getElementById('tipoSolicitud');
        if (tipoSolicitud) {
            tipoSolicitud.addEventListener('change', (e) => this.handleTipoSolicitudChange(e));
        }

        // Character counter for asunto
        const asuntoSolicitud = document.getElementById('asuntoSolicitud');
        if (asuntoSolicitud) {
            asuntoSolicitud.addEventListener('input', (e) => this.updateCharacterCount(e));
        }

        // Documento principal file input
        const documentoPrincipal = document.getElementById('documentoPrincipal');
        if (documentoPrincipal) {
            documentoPrincipal.addEventListener('change', (e) => this.handleDocumentoPrincipalChange(e));
        }

        // Anexos file input
        const anexosFiles = document.getElementById('anexosFiles');
        if (anexosFiles) {
            anexosFiles.addEventListener('change', (e) => this.handleAnexosChange(e));
        }

        // Checkbox for anexos
        const tieneAnexos = document.getElementById('tieneAnexos');
        if (tieneAnexos) {
            tieneAnexos.addEventListener('change', (e) => this.toggleAnexosContainer(e));
        }

        // Auto-fill user data if available
        this.autoFillUserData();
    }

    /**
     * Load solicitudes for current user
     */
    async loadSolicitudesUsuario() {
        try {
            this.dashboard.showLoading('solicitudes-loading');

            const usuarioId = sessionStorage.getItem('userId') || sessionStorage.getItem('usuarioActual') || '1';

            const response = await fetch(`/api/solicitudes/usuario/${usuarioId}`);
            const data = await response.json();

            if (data.success) {
                this.solicitudes = data.data || [];
                this.mostrarSolicitudes(this.solicitudes);
            } else {
                throw new Error(data.error || 'Error loading solicitudes');
            }
        } catch (error) {
            console.error('Error loading solicitudes:', error);
            this.dashboard.showError('Error cargando solicitudes: ' + error.message, 'solicitudes-loading');
            this.mostrarSolicitudes([]);
        } finally {
            this.dashboard.hideLoading('solicitudes-loading');
        }
    }

    /**
     * Display solicitudes in table
     */
    mostrarSolicitudes(solicitudes) {
        const tbody = document.getElementById('solicitudes-tbody');
        const table = document.getElementById('solicitudes-table');
        const noSolicitudes = document.getElementById('no-solicitudes');

        if (!solicitudes || solicitudes.length === 0) {
            if (table) table.style.display = 'none';
            if (noSolicitudes) noSolicitudes.style.display = 'block';
            return;
        }

        // Show table and hide empty message
        if (table) table.style.display = 'table';
        if (noSolicitudes) noSolicitudes.style.display = 'none';

        // Generate table rows with enhanced information
        if (tbody) {
            tbody.innerHTML = solicitudes.map(solicitud => {
                const fecha = new Date(solicitud.fecha).toLocaleDateString('es-ES', {
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit'
                });
                const estadoClass = this.dashboard.getStatusClass(solicitud.estado);

                return `
                    <tr class="solicitud-row" data-id="${solicitud.id}">
                        <td>${solicitud.id}</td>
                        <td>${fecha}</td>
                        <td>${solicitud.tipo || 'No especificado'}</td>
                        <td><span class="status-badge ${estadoClass}">${solicitud.estado}</span></td>
                        <td>
                            <button class="btn btn-secondary" onclick="event.stopPropagation(); verDetalleSolicitud('${solicitud.id}')" style="padding: 4px 8px; font-size: 12px;">
                                Ver Detalle
                            </button>
                        </td>
                    </tr>
                `;
            }).join('');
        }
    }

    /**
     * Create new solicitud modal
     */
    crearNuevaSolicitud() {
        const modal = document.getElementById('modalSolicitud');
        if (modal) {
            modal.classList.add('active');
            document.body.style.overflow = 'hidden';
            this.resetFormSolicitud();

            // Focus on first field
            setTimeout(() => {
                const firstField = document.getElementById('solicitanteNombre');
                if (firstField) {
                    firstField.focus();
                }
            }, 100);
        }
    }

    /**
     * Handle new solicitud form submission
     */
    async handleNuevaSolicitud(e) {
        e.preventDefault();

        // Get form data
        const form = e.target;
        const formData = new FormData();

        // Basic information
        const solicitudData = {
            nombre: document.getElementById('solicitanteNombre').value,
            email: document.getElementById('solicitanteEmail').value,
            telefono: document.getElementById('solicitanteTelefono').value || null,
            dni: document.getElementById('solicitanteDni').value,
            tipo: document.getElementById('tipoSolicitud').value === 'otros' ?
                  document.getElementById('otrosTipo').value :
                  document.getElementById('tipoSolicitud').value,
            asunto: document.getElementById('asuntoSolicitud').value,
            descripcion: document.getElementById('descripcionSolicitud').value,
            prioridad: document.getElementById('prioridadSolicitud').value || 'normal',
            casilla_electronica: document.getElementById('casillaElectronica').value || '53099',
            usuario_id: this.dashboard.getCurrentUserId()
        };

        // Comprehensive validation
        const validation = this.validateSolicitudData(solicitudData);
        if (!validation.valid) {
            alert('Errores de validación:\n' + validation.errors.join('\n'));
            return;
        }

        const submitBtn = form.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;

        try {
            submitBtn.disabled = true;
            submitBtn.textContent = 'Enviando Solicitud...';

            // Add documento principal
            const documentoPrincipal = document.getElementById('documentoPrincipal');
            if (documentoPrincipal && documentoPrincipal.files.length > 0) {
                formData.append('documentos_principales', documentoPrincipal.files[0]);
            }

            // Add anexos if any
            const anexosFiles = document.getElementById('anexosFiles');
            if (anexosFiles && anexosFiles.files.length > 0) {
                Array.from(anexosFiles.files).forEach(file => {
                    formData.append('anexos', file);
                });
            }

            // Add solicitud data to FormData
            Object.keys(solicitudData).forEach(key => {
                if (solicitudData[key] !== null && solicitudData[key] !== undefined) {
                    formData.append(key, solicitudData[key]);
                }
            });

            console.log('📤 Enviando solicitud:', {
                ...solicitudData,
                documento_principal: documentoPrincipal?.files[0]?.name || 'Ninguno',
                anexos_count: anexosFiles?.files.length || 0
            });

            const response = await fetch('/api/solicitudes', {
                method: 'POST',
                body: formData
            });

            const result = await response.json();

            if (result.success) {
                this.dashboard.showSuccess('✅ Solicitud enviada correctamente');

                // Reset form and close modal
                this.resetFormSolicitud();
                this.dashboard.closeAllModals();

                // Reload solicitudes list
                await this.loadSolicitudesUsuario();

                // Show success message with details
                setTimeout(() => {
                    alert(`🎉 Solicitud Registrada

Número de Solicitud: ${result.data?.id || 'Generado automáticamente'}
Tipo: ${solicitudData.tipo}
Estado: Pendiente

Su solicitud ha sido registrada exitosamente y está siendo procesada.`);
                }, 500);

            } else {
                throw new Error(result.error || 'Error enviando solicitud');
            }

        } catch (error) {
            console.error('❌ Error enviando solicitud:', error);
            this.dashboard.showError('Error enviando solicitud: ' + error.message);
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = originalText;
        }
    }

    /**
     * Validate solicitud data
     */
    validateSolicitudData(data) {
        const errors = [];

        if (!data.nombre || data.nombre.trim().length < 3) {
            errors.push('El nombre debe tener al menos 3 caracteres');
        }

        if (!data.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
            errors.push('Debe ingresar un correo electrónico válido');
        }

        if (!data.dni || data.dni.trim().length < 8) {
            errors.push('El DNI debe tener al menos 8 caracteres');
        }

        if (!data.tipo || data.tipo.trim() === '') {
            errors.push('Debe seleccionar un tipo de solicitud');
        }

        if (!data.asunto || data.asunto.trim().length < 10) {
            errors.push('El asunto debe tener al menos 10 caracteres');
        }

        if (!data.descripcion || data.descripcion.trim().length < 20) {
            errors.push('La descripción debe tener al menos 20 caracteres');
        }

        // Check for documento principal
        const documentoPrincipal = document.getElementById('documentoPrincipal');
        if (!documentoPrincipal || documentoPrincipal.files.length === 0) {
            errors.push('Debe adjuntar el documento principal en formato PDF');
        }

        return {
            valid: errors.length === 0,
            errors: errors
        };
    }

    /**
     * Handle tipo de documento change
     */
    handleTipoDocumentoChange(e) {
        const otrosContainer = document.getElementById('otrosContainer');
        if (e.target.value === 'otros') {
            otrosContainer.style.display = 'block';
        } else {
            otrosContainer.style.display = 'none';
            document.getElementById('otrosText').value = '';
        }
    }

    /**
     * Update character count for asunto field
     */
    updateCharacterCount(e) {
        const charCount = document.getElementById('charCount');
        if (charCount) {
            charCount.textContent = e.target.value.length;
        }
    }

    /**
     * Reset solicitud form
     */
    resetFormSolicitud() {
        const form = document.getElementById('formSolicitud');
        if (form) {
            form.reset();
            document.getElementById('charCount').textContent = '0';
            document.getElementById('fileNamePrincipal').textContent = 'Ningún archivo seleccionado';
            document.getElementById('fileNameAnexos').textContent = 'Ningún archivo seleccionado';
            document.getElementById('otrosContainer').style.display = 'none';
            document.getElementById('anexosContainer').style.display = 'none';
            document.getElementById('anexosList').innerHTML = '';

            // Clear file inputs
            document.getElementById('documentoPrincipal').value = '';
            document.getElementById('anexosFiles').value = '';

            // Auto-fill user data again
            this.autoFillUserData();
        }
    }

    /**
     * Close solicitud modal
     */
    closeModalSolicitud() {
        const modal = document.getElementById('modalSolicitud');
        if (modal) {
            modal.classList.remove('active');
            document.body.style.overflow = '';
        }
    }

    /**
     * Enhanced form validation with real-time feedback
     */
    setupRealTimeValidation() {
        const fieldsToValidate = [
            { id: 'solicitanteNombre', minLength: 3, required: true },
            { id: 'solicitanteEmail', email: true, required: true },
            { id: 'solicitanteDni', minLength: 8, required: true },
            { id: 'tipoSolicitud', required: true },
            { id: 'asuntoSolicitud', minLength: 10, required: true },
            { id: 'descripcionSolicitud', minLength: 20, required: true }
        ];

        fieldsToValidate.forEach(field => {
            const element = document.getElementById(field.id);
            if (element) {
                element.addEventListener('blur', () => this.validateField(field));
                element.addEventListener('input', () => this.clearFieldError(field.id));
            }
        });
    }

    /**
     * Validate individual field
     */
    validateField(fieldConfig) {
        const element = document.getElementById(fieldConfig.id);
        if (!element) return true;

        const value = element.value.trim();
        let isValid = true;
        let errorMessage = '';

        // Required validation
        if (fieldConfig.required && !value) {
            isValid = false;
            errorMessage = 'Este campo es requerido';
        }
        // Email validation
        else if (fieldConfig.email && value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
            isValid = false;
            errorMessage = 'Debe ingresar un correo electrónico válido';
        }
        // Minimum length validation
        else if (fieldConfig.minLength && value.length < fieldConfig.minLength) {
            isValid = false;
            errorMessage = `Debe tener al menos ${fieldConfig.minLength} caracteres`;
        }

        if (!isValid) {
            this.showFieldError(fieldConfig.id, errorMessage);
        } else {
            this.clearFieldError(fieldConfig.id);
        }

        return isValid;
    }

    /**
     * Show field error
     */
    showFieldError(fieldId, message) {
        const field = document.getElementById(fieldId);
        if (!field) return;

        // Remove existing error
        this.clearFieldError(fieldId);

        // Add error class
        field.classList.add('field-error');

        // Create error message element
        const errorDiv = document.createElement('div');
        errorDiv.className = 'field-error-message';
        errorDiv.textContent = message;
        errorDiv.style.cssText = `
            color: #ff4444;
            font-size: 0.8em;
            margin-top: 4px;
            display: block;
        `;

        field.parentNode.appendChild(errorDiv);
    }

    /**
     * Clear field error
     */
    clearFieldError(fieldId) {
        const field = document.getElementById(fieldId);
        if (!field) return;

        field.classList.remove('field-error');

        const errorMessage = field.parentNode.querySelector('.field-error-message');
        if (errorMessage) {
            errorMessage.remove();
        }
    }

    /**
     * Handle tipo de solicitud change
     */
    handleTipoSolicitudChange(e) {
        const otrosContainer = document.getElementById('otrosContainer');
        if (e.target.value === 'otros') {
            otrosContainer.style.display = 'block';
        } else {
            otrosContainer.style.display = 'none';
            document.getElementById('otrosTipo').value = '';
        }
    }

    /**
     * Update character count for asunto field
     */
    updateCharacterCount(e) {
        const charCount = document.getElementById('charCount');
        if (charCount) {
            charCount.textContent = e.target.value.length;
        }
    }

    /**
     * Handle documento principal file change
     */
    handleDocumentoPrincipalChange(e) {
        const fileNameSpan = document.getElementById('fileNamePrincipal');
        const file = e.target.files[0];

        if (file) {
            if (file.type !== 'application/pdf') {
                alert('Solo se permiten archivos PDF');
                e.target.value = '';
                fileNameSpan.textContent = 'Ningún archivo seleccionado';
                return;
            }

            if (file.size > 40 * 1024 * 1024) {
                alert('El archivo no debe exceder 40 MB');
                e.target.value = '';
                fileNameSpan.textContent = 'Ningún archivo seleccionado';
                return;
            }

            fileNameSpan.textContent = file.name;
        } else {
            fileNameSpan.textContent = 'Ningún archivo seleccionado';
        }
    }

    /**
     * Handle anexos files change
     */
    handleAnexosChange(e) {
        const files = Array.from(e.target.files);
        const anexosList = document.getElementById('anexosList');
        const fileNameSpan = document.getElementById('fileNameAnexos');

        // Validate files
        const invalidFiles = files.filter(file => file.type !== 'application/pdf');
        if (invalidFiles.length > 0) {
            alert('Solo se permiten archivos PDF en los anexos');
            e.target.value = '';
            return;
        }

        const oversizedFiles = files.filter(file => file.size > 40 * 1024 * 1024);
        if (oversizedFiles.length > 0) {
            alert('Los archivos no deben exceder 40 MB cada uno');
            e.target.value = '';
            return;
        }

        // Update file name display
        if (files.length > 0) {
            fileNameSpan.textContent = `${files.length} archivo(s) seleccionado(s)`;
        } else {
            fileNameSpan.textContent = 'Ningún archivo seleccionado';
        }

        // Display files list
        this.displayAnexosList(files);
    }

    /**
     * Display anexos list
     */
    displayAnexosList(files) {
        const anexosList = document.getElementById('anexosList');

        if (files.length === 0) {
            anexosList.innerHTML = '';
            return;
        }

        anexosList.innerHTML = files.map((file, index) => `
            <div class="anexo-item" data-index="${index}">
                <div class="anexo-info">
                    <div class="anexo-name">${file.name}</div>
                    <div class="anexo-size">${(file.size / 1024 / 1024).toFixed(2)} MB</div>
                </div>
                <button type="button" class="btn-remove-anexo" onclick="window.solicitudesModule.removeAnexo(${index})">×</button>
            </div>
        `).join('');
    }

    /**
     * Remove anexo from list
     */
    removeAnexo(index) {
        // This would need to be implemented with proper file management
        console.log('Removing anexo at index:', index);
        // For now, just clear the input
        document.getElementById('anexosFiles').value = '';
        document.getElementById('fileNameAnexos').textContent = 'Ningún archivo seleccionado';
        document.getElementById('anexosList').innerHTML = '';
    }

    /**
     * Toggle anexos container
     */
    toggleAnexosContainer(e) {
        const anexosContainer = document.getElementById('anexosContainer');
        if (e.target.checked) {
            anexosContainer.style.display = 'block';
        } else {
            anexosContainer.style.display = 'none';
            // Clear anexos
            document.getElementById('anexosFiles').value = '';
            document.getElementById('fileNameAnexos').textContent = 'Ningún archivo seleccionado';
            document.getElementById('anexosList').innerHTML = '';
        }
    }

    /**
     * Auto-fill user data if available
     */
    autoFillUserData() {
        if (this.dashboard.user) {
            const nombreField = document.getElementById('solicitanteNombre');
            const emailField = document.getElementById('solicitanteEmail');

            if (nombreField && this.dashboard.user.nombre) {
                nombreField.value = this.dashboard.user.nombre;
            }

            if (emailField && this.dashboard.user.email) {
                emailField.value = this.dashboard.user.email;
            }
        }
    }

    /**
     * Reset solicitud form
     */
    resetFormSolicitud() {
        const form = document.getElementById('formSolicitud');
        if (form) {
            form.reset();
            document.getElementById('charCount').textContent = '0';
            document.getElementById('fileNamePrincipal').textContent = 'Ningún archivo seleccionado';
            document.getElementById('fileNameAnexos').textContent = 'Ningún archivo seleccionado';
            document.getElementById('otrosContainer').style.display = 'none';
            document.getElementById('anexosContainer').style.display = 'none';
            document.getElementById('anexosList').innerHTML = '';

            // Clear file inputs
            document.getElementById('documentoPrincipal').value = '';
            document.getElementById('anexosFiles').value = '';
        }
    }

    /**
     * Remove anexo from list (global function for onclick)
     */
    removeAnexo(index) {
        // This would need proper file management implementation
        // For now, just clear the input and reset display
        document.getElementById('anexosFiles').value = '';
        document.getElementById('fileNameAnexos').textContent = 'Ningún archivo seleccionado';
        document.getElementById('anexosList').innerHTML = '';
    }

    /**
     * Formatear tamaño de archivo
     */
    formatearTamano(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    /**
     * Descargar archivo
     */
    descargarArchivo(url, nombreOriginal) {
        if (!url) {
            alert('URL del archivo no disponible');
            return;
        }

        // Crear enlace temporal para descarga
        const link = document.createElement('a');
        link.href = url;
        link.download = nombreOriginal || 'archivo';
        link.target = '_blank';
        
        // Agregar al DOM, hacer clic y eliminar
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        console.log(`📥 Descargando archivo: ${nombreOriginal}`);
    }

    /**
     * Ver detalle de solicitud
     */
    async verDetalleSolicitud(solicitudId) {
    const solicitud = this.solicitudes.find(s => s.id === solicitudId);
    if (!solicitud) {
        this.dashboard.showError('Solicitud no encontrada');
        return;
    }
    
    console.log('📋 Datos de la solicitud:', solicitud);

    // Obtener archivos desde la API
    let archivos = [];
    try {
        console.log('🔍 Obteniendo archivos para solicitud:', solicitudId);
        const response = await fetch(`/api/solicitudes/${solicitudId}/archivos`);
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
                    const tamano = this.formatearTamano(archivo.tamano);
                    return `
                        <div style="background: rgba(0,0,0,0.3); padding: 12px; border-radius: 8px; display: flex; justify-content: space-between; align-items: center;">
                            <div style="flex: 1;">
                                <span style="font-size: 20px; margin-right: 10px;">${icono}</span>
                                <span style="color: #fff; font-weight: 500;">${archivo.nombre_original}</span>
                                <br>
                                <span style="color: #999; font-size: 12px; margin-left: 30px;">
                                    ${archivo.tipo === 'principal' ? 'Documento Principal' : 'Anexo'} • ${tamano}
                                </span>
                            </div>
                            <button class="btn-modal btn-modal-primary" 
                                    onclick="window.solicitudesModule.descargarArchivo('/uploads/${archivo.nombre_archivo}', '${archivo.nombre_original}')"
                                    style="padding: 6px 12px; font-size: 12px;">
                                ⬇️ Descargar
                            </button>
                        </div>
                    `;
                }).join('')}
            </div>
        </div>
    ` : '';

    // Show detailed modal with solicitud information
    const detalleHTML = `
        <div style="text-align: left;">
            <h3 style="color: #C0C0C0; margin-bottom: 20px;">Detalle de Solicitud</h3>

            <div style="background: rgba(255,255,255,0.05); padding: 20px; border-radius: 10px; margin-bottom: 20px;">
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 15px;">
                    <div>
                        <strong style="color: #C0C0C0;">ID Solicitud:</strong><br>
                        <span style="color: #fff;">${solicitud.id || 'No disponible'}</span>
                    </div>
                    <div>
                        <strong style="color: #C0C0C0;">Fecha:</strong><br>
                        <span style="color: #fff;">${solicitud.fecha ? new Date(solicitud.fecha).toLocaleString('es-ES') : 'No disponible'}</span>
                    </div>
                    <div>
                        <strong style="color: #C0C0C0;">Tipo:</strong><br>
                        <span style="color: #fff;">${solicitud.tipo || 'No especificado'}</span>
                    </div>
                    <div>
                        <strong style="color: #C0C0C0;">Estado:</strong><br>
                        <span class="status-badge ${this.dashboard.getStatusClass(solicitud.estado)}">${solicitud.estado || 'Pendiente'}</span>
                    </div>
                </div>

                <div style="margin-bottom: 20px;">
                    <strong style="color: #C0C0C0;">Asunto:</strong><br>
                    <span style="color: #fff;">${solicitud.asunto || 'No especificado'}</span>
                </div>

                ${archivosHTML || '<div style="color: #999; font-style: italic;">No hay archivos adjuntos</div>'}
            </div>

            <div style="text-align: center;">
                <button class="btn-modal btn-modal-secondary" onclick="window.dashboardApp.closeAllModals()">Cerrar</button>
            </div>
        </div>
    `;

        // Create or update detail modal
        let detailModal = document.getElementById('modalDetalleSolicitud');
        if (!detailModal) {
            detailModal = document.createElement('div');
            detailModal.id = 'modalDetalleSolicitud';
            detailModal.className = 'modal-overlay';
            detailModal.innerHTML = `
                <div class="modal-content" style="max-width: 700px;">
                    <div class="modal-header">
                        <span>Detalle de Solicitud</span>
                        <button class="modal-close" onclick="window.dashboardApp.closeAllModals()">×</button>
                    </div>
                    <div class="modal-body" id="detalleContent">
                    </div>
                </div>
            `;
            document.body.appendChild(detailModal);
        }

        document.getElementById('detalleContent').innerHTML = detalleHTML;
        detailModal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    /**
     * Get solicitudes statistics
     */
    getSolicitudesStats() {
        const total = this.solicitudes.length;
        const pendientes = this.solicitudes.filter(s => s.estado === 'Pendiente').length;
        const aprobadas = this.solicitudes.filter(s => s.estado === 'Aprobado').length;
        const rechazadas = this.solicitudes.filter(s => s.estado === 'Rechazado').length;

        return { total, pendientes, aprobadas, rechazadas };
    }
}

// Make functions globally available for onclick handlers
window.removeAnexo = function(index) {
    if (window.solicitudesModule) {
        window.solicitudesModule.removeAnexo(index);
    }
};

window.verDetalleSolicitud = function(solicitudId) {
    if (window.solicitudesModule) {
        window.solicitudesModule.verDetalleSolicitud(solicitudId);
    }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SolicitudesModule;
}