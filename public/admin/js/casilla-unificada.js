/**
 * Casilla Electrónica Unificada - Admin
 * Inbox centralizado: Registros, Mesa de Partes, Expedientes, Solicitudes
 * Arquitectura modular y escalable
 */

const CasillaUnificada = {
    // Estado
    data: [],
    stats: {},
    filtroActual: 'todos',
    
    // Configuración de tipos
    tipos: {
        registro: {
            icon: '📝',
            nombre: 'Registro',
            color: '#4CAF50'
        },
        mesa_partes: {
            icon: '📨',
            nombre: 'Mesa de Partes',
            color: '#2196F3'
        },
        expediente: {
            icon: '📁',
            nombre: 'Expediente',
            color: '#FF9800'
        },
        solicitud: {
            icon: '📋',
            nombre: 'Solicitud',
            color: '#9C27B0'
        }
    },

    /**
     * Inicializar módulo
     */
    async init() {
        console.log('🚀 Inicializando Casilla Unificada...');
        await this.cargar();
        this.setupEventListeners();
    },

    /**
     * Configurar event listeners
     */
    setupEventListeners() {
        // Filtros por tipo
        document.querySelectorAll('[data-filtro-tipo]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const tipo = e.target.dataset.filtroTipo;
                this.filtrar(tipo);
            });
        });

        // Búsqueda
        const searchInput = document.getElementById('casilla-search');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.buscar(e.target.value);
            });
        }
    },

    /**
     * Cargar datos del servidor
     */
    async cargar(filtros = {}) {
        try {
            console.log('📥 Cargando casilla electrónica...');

            const params = new URLSearchParams(filtros);
            const response = await fetch(`/api/casilla-electronica?${params}`);
            const data = await response.json();

            if (data.success) {
                this.data = data.data || [];
                this.stats = data.estadisticas || {};
                
                this.actualizarEstadisticas();
                this.renderizar();
                
                console.log(`✅ ${this.data.length} items cargados`);
            } else {
                throw new Error(data.error || 'Error cargando datos');
            }
        } catch (error) {
            console.error('❌ Error cargando casilla:', error);
            this.mostrarError('Error cargando datos de la casilla electrónica');
            this.renderizar([]);
        }
    },

    /**
     * Actualizar estadísticas en UI
     */
    actualizarEstadisticas() {
        if (!this.stats.por_tipo) return;

        // Actualizar badges de contadores
        Object.keys(this.stats.por_tipo).forEach(tipo => {
            const badge = document.querySelector(`[data-badge-tipo="${tipo}"]`);
            if (badge) {
                badge.textContent = this.stats.por_tipo[tipo];
            }
        });

        // Actualizar totales
        const totalBadge = document.querySelector('[data-badge-tipo="todos"]');
        if (totalBadge) {
            totalBadge.textContent = this.stats.total || 0;
        }

        console.log('📊 Estadísticas:', this.stats);
    },

    /**
     * Renderizar tabla
     */
    renderizar(items = null) {
        const tbody = document.querySelector('#casilla table tbody');
        if (!tbody) {
            console.warn('⚠️ No se encontró tbody de casilla');
            return;
        }

        // Estilos iniciales para la transición si no existen
        if (!tbody.style.transition) {
            tbody.style.transition = 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
        }

        // Usar items filtrados o todos
        const itemsToRender = items !== null ? items : this.obtenerItemsFiltrados();

        if (itemsToRender.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="6" style="text-align: center; padding: 60px; color: #666; animation: fadeIn 0.5s ease-out;">
                        <div style="font-size: 64px; margin-bottom: 20px; filter: grayscale(1); opacity: 0.5;">📭</div>
                        <div style="font-weight: 500; letter-spacing: 1px;">No hay items en esta categoría</div>
                    </td>
                </tr>
            `;
            return;
        }

        // Renderizado con efecto stagger (opcional, aquí lo hacemos directo pero con la transición del tbody)
        tbody.innerHTML = itemsToRender.map((item, index) => this.renderizarFila(item, index)).join('');
        
        // Aplicar micro-animación a las nuevas filas
        const rows = tbody.querySelectorAll('tr');
        rows.forEach((row, i) => {
            row.style.opacity = '0';
            row.style.transform = 'translateX(-10px)';
            row.style.transition = `all 0.3s ease-out ${i * 0.03}s`;
            
            setTimeout(() => {
                row.style.opacity = '1';
                row.style.transform = 'translateX(0)';
            }, 10);
        });

        console.log(`📋 ${itemsToRender.length} items renderizados`);
    },

    /**
     * Renderizar una fila
     */
    renderizarFila(item, index) {
        const tipo = this.tipos[item.tipo] || { icon: '📄', nombre: item.tipo };
        const fecha = new Date(item.fecha).toLocaleString('es-ES', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
        const estadoClass = this.getEstadoClass(item.estado);

        return `
            <tr style="transition: background 0.2s;" 
                onmouseover="this.style.background='rgba(192,192,192,0.05)'" 
                onmouseout="this.style.background='transparent'">
                <td style="text-align: center;">${index + 1}</td>
                <td>
                    <div style="display: flex; align-items: center; gap: 10px;">
                        <span style="font-size: 24px;">${tipo.icon}</span>
                        <div>
                            <strong style="color: ${tipo.color};">${tipo.nombre}</strong>
                        </div>
                    </div>
                </td>
                <td>
                    <div>
                        <strong>${this.escaparHTML(item.titulo || 'N/A')}</strong>
                        ${item.subtitulo ? `<br><small style="color: #666;">${this.escaparHTML(item.subtitulo)}</small>` : ''}
                    </div>
                </td>
                <td>${fecha}</td>
                <td>
                    <span class="status-badge ${estadoClass}">${item.estado || 'Nuevo'}</span>
                </td>
                <td style="text-align: center;">
                    <button class="btn btn-primary" 
                            style="padding: 6px 12px; font-size: 12px;" 
                            onclick="CasillaUnificada.verDetalle('${item.tipo}', '${item.referencia_id}')"
                            title="Ver detalles">
                        👁️ Ver
                    </button>
                </td>
            </tr>
        `;
    },

    /**
     * Obtener items filtrados
     */
    obtenerItemsFiltrados() {
        if (this.filtroActual === 'todos') {
            return this.data;
        }
        return this.data.filter(item => item.tipo === this.filtroActual);
    },

    /**
     * Filtrar por tipo
     */
    filtrar(tipo) {
        if (this.filtroActual === tipo) return;
        
        const tbody = document.querySelector('#casilla table tbody');
        if (tbody) {
            tbody.style.opacity = '0';
            tbody.style.transform = 'translateY(10px)';
        }

        setTimeout(() => {
            this.filtroActual = tipo;
            
            // Actualizar UI de botones
            document.querySelectorAll('[data-filtro-tipo]').forEach(btn => {
                const isActive = btn.dataset.filtroTipo === tipo;
                btn.classList.toggle('active', isActive);
                btn.classList.toggle('btn-primary', isActive);
                btn.classList.toggle('btn-secondary', !isActive);
                
                // Efecto de pulso en el badge activo
                const badge = btn.querySelector('.filter-badge');
                if (badge) {
                    badge.style.transform = isActive ? 'scale(1.2)' : 'scale(1)';
                    badge.style.boxShadow = isActive ? '0 0 10px rgba(255,255,255,0.5)' : 'none';
                }
            });

            this.renderizar();
            
            if (tbody) {
                setTimeout(() => {
                    tbody.style.opacity = '1';
                    tbody.style.transform = 'translateY(0)';
                }, 50);
            }
        }, 150);

        console.log(`🔍 Filtrado por: ${tipo}`);
    },

    /**
     * Buscar en items
     */
    buscar(query) {
        if (!query) {
            this.renderizar();
            return;
        }

        const queryLower = query.toLowerCase();
        const resultados = this.data.filter(item => {
            return (
                (item.titulo && item.titulo.toLowerCase().includes(queryLower)) ||
                (item.subtitulo && item.subtitulo.toLowerCase().includes(queryLower)) ||
                (item.estado && item.estado.toLowerCase().includes(queryLower))
            );
        });

        this.renderizar(resultados);
        console.log(`🔍 Búsqueda "${query}": ${resultados.length} resultados`);
    },

    /**
     * Ver detalle según tipo
     */
    async verDetalle(tipo, id) {
        try {
            console.log(`🔍 Cargando detalle: ${tipo} - ${id}`);

            const response = await fetch(`/api/casilla-electronica/${tipo}/${id}`);
            const data = await response.json();

            if (data.success) {
                this.mostrarModal(tipo, data.data);
            } else {
                // Mostrar error específico
                const mensaje = data.error || 'Error obteniendo detalles';
                
                if (mensaje.includes('no existe')) {
                    this.mostrarError(`⚠️ La tabla "${tipo}" no existe en la base de datos. Por favor, créala primero.`);
                } else {
                    this.mostrarError(mensaje);
                }
            }
        } catch (error) {
            console.error('❌ Error:', error);
            this.mostrarError('Error de conexión al obtener detalles');
        }
    },

    /**
     * Mostrar modal según tipo
     */
    mostrarModal(tipo, datos) {
        let contenido;

        switch (tipo) {
            case 'registro':
                contenido = this.modalRegistro(datos);
                break;
            case 'mesa_partes':
                contenido = this.modalMesaPartes(datos);
                break;
            case 'expediente':
                contenido = this.modalExpediente(datos);
                break;
            case 'solicitud':
                contenido = this.modalSolicitud(datos);
                break;
            default:
                contenido = this.modalGenerico(datos);
        }

        this.insertarModal(contenido);
    },

    /**
     * Modal para Registro de Usuario
     */
    modalRegistro(usuario) {
        return `
            <div class="modal" id="casillaModal" style="display: block;">
                <div class="modal-content" style="max-width: 700px;">
                    <div class="modal-header">
                        <h2>📝 Registro de Usuario</h2>
                        <button class="expediente-close" onclick="CasillaUnificada.cerrarModal()">&times;</button>
                    </div>
                    <div class="modal-body">
                        <div class="expediente-info-grid">
                            <div class="expediente-info-card">
                                <h3>👤 Información del Usuario</h3>
                                ${this.renderizarCampo('Nombre', usuario.nombre)}
                                ${this.renderizarCampo('Email', usuario.email)}
                                ${this.renderizarCampo('Teléfono', usuario.telefono)}
                                ${this.renderizarCampo('Tipo', usuario.tipo)}
                                ${this.renderizarCampo('Estado', usuario.activo ? 'Activo' : 'Inactivo')}
                                ${this.renderizarCampo('Fecha Registro', new Date(usuario.fecha_registro).toLocaleString('es-ES'))}
                            </div>
                            <div class="expediente-info-card">
                                <h3>📊 Actividad</h3>
                                ${this.renderizarCampo('Presentaciones', usuario.presentaciones_count || 0)}
                                ${this.renderizarCampo('Expedientes', usuario.expedientes_count || 0)}
                            </div>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button class="btn-close" onclick="CasillaUnificada.cerrarModal()">Cerrar</button>
                    </div>
                </div>
            </div>
        `;
    },

    /**
     * Modal para Mesa de Partes
     */
    modalMesaPartes(presentacion) {
        const demandante = presentacion.demandante || {};
        const demandado = presentacion.demandado || {};
        const documentos = presentacion.documentos || [];

        return `
            <div class="modal" id="casillaModal" style="display: block;">
                <div class="modal-content" style="max-width: 900px;">
                    <div class="modal-header">
                        <h2>📨 Mesa de Partes - ${presentacion.numero_registro}</h2>
                        <button class="expediente-close" onclick="CasillaUnificada.cerrarModal()">&times;</button>
                    </div>
                    <div class="modal-body">
                        <div class="expediente-info-grid">
                            <div class="expediente-info-card">
                                <h3>📋 Información General</h3>
                                ${this.renderizarCampo('Número', presentacion.numero_registro)}
                                ${this.renderizarCampo('Tipo', presentacion.tipo_presentacion)}
                                ${this.renderizarCampo('Materia', presentacion.materia)}
                                ${this.renderizarCampo('Estado', `<span class="status-badge ${this.getEstadoClass(presentacion.estado)}">${presentacion.estado}</span>`)}
                                ${this.renderizarCampo('Fecha', new Date(presentacion.fecha_presentacion).toLocaleString('es-ES'))}
                            </div>
                            <div class="expediente-info-card">
                                <h3>👤 Demandante</h3>
                                ${this.renderizarCampo('Nombre', demandante.nombre)}
                                ${this.renderizarCampo('Documento', `${demandante.documento_tipo || ''} ${demandante.documento_numero || ''}`)}
                                ${this.renderizarCampo('Correo', demandante.correo)}
                                ${this.renderizarCampo('Teléfono', demandante.telefono)}
                            </div>
                            <div class="expediente-info-card">
                                <h3>⚖️ Demandado</h3>
                                ${this.renderizarCampo('Nombre', demandado.nombre)}
                                ${this.renderizarCampo('Documento', `${demandado.documento_tipo || ''} ${demandado.documento_numero || ''}`)}
                            </div>
                        </div>
                        ${documentos.length > 0 ? `
                        <div class="expediente-info-card">
                            <h3>📎 Documentos (${documentos.length})</h3>
                            ${documentos.map((doc, idx) => `
                                <div style="padding: 10px; background: #f5f5f5; border-radius: 5px; margin-bottom: 10px; display: flex; justify-content: space-between; align-items: center;">
                                    <div>
                                        <strong>${idx + 1}. ${this.escaparHTML(doc.nombre_original || 'Documento')}</strong><br>
                                        <small>${(doc.tamano / 1024).toFixed(2)} KB</small>
                                    </div>
                                    <button class="btn btn-primary" 
                                            style="padding: 6px 12px; font-size: 12px;" 
                                            onclick="window.open('/uploads/mesa-partes/${doc.nombre_archivo}', '_blank')">
                                        📥 Descargar
                                    </button>
                                </div>
                            `).join('')}
                        </div>
                        ` : ''}
                        <div class="expediente-info-card">
                            <h3>⚙️ Acciones</h3>
                            <button class="btn btn-primary" 
                                    style="background:#4CAF50; margin-right: 10px;"
                                    onclick="CasillaUnificada.responderMesaPartes('${presentacion.id}', '${presentacion.usuario_id}', '${presentacion.numero_registro}')">
                                💬 Responder
                            </button>
                            <button class="btn btn-primary" 
                                    onclick="CasillaUnificada.cambiarEstado('mesa_partes', '${presentacion.id}', 'Aprobado')">
                                ✅ Aprobar
                            </button>
                            <button class="btn btn-secondary" 
                                    onclick="CasillaUnificada.cambiarEstado('mesa_partes', '${presentacion.id}', 'Rechazado')" 
                                    style="margin-left: 10px;">
                                ❌ Rechazar
                            </button>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button class="btn-close" onclick="CasillaUnificada.cerrarModal()">Cerrar</button>
                    </div>
                </div>
            </div>
        `;
    },

    /**
     * Modal para Expediente
     */
    modalExpediente(expediente) {
        return `
            <div class="modal" id="casillaModal" style="display: block;">
                <div class="modal-content" style="max-width: 700px;">
                    <div class="modal-header">
                        <h2>📁 Expediente - ${expediente.numero_expediente}</h2>
                        <button class="expediente-close" onclick="CasillaUnificada.cerrarModal()">&times;</button>
                    </div>
                    <div class="modal-body">
                        <div class="expediente-info-card">
                            <h3>📋 Información</h3>
                            ${this.renderizarCampo('Número', expediente.numero_expediente)}
                            ${this.renderizarCampo('Sede', expediente.sede)}
                            ${this.renderizarCampo('Especialidad', expediente.especialidad)}
                            ${this.renderizarCampo('Proceso', expediente.proceso)}
                            ${this.renderizarCampo('Materia', expediente.materia)}
                            ${this.renderizarCampo('Estado', `<span class="status-badge ${this.getEstadoClass(expediente.estado)}">${expediente.estado}</span>`)}
                            ${this.renderizarCampo('Usuario', expediente.usuario_nombre)}
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button class="btn-close" onclick="CasillaUnificada.cerrarModal()">Cerrar</button>
                    </div>
                </div>
            </div>
        `;
    },

    /**
     * Modal para Solicitud
     */
    modalSolicitud(solicitud) {
        return `
            <div class="modal" id="casillaModal" style="display: block;">
                <div class="modal-content" style="max-width: 700px;">
                    <div class="modal-header">
                        <h2>📋 Solicitud - ${this.escaparHTML(solicitud.asunto)}</h2>
                        <button class="expediente-close" onclick="CasillaUnificada.cerrarModal()">&times;</button>
                    </div>
                    <div class="modal-body">
                        <div class="expediente-info-card">
                            <h3>📋 Información</h3>
                            ${this.renderizarCampo('Asunto', solicitud.asunto)}
                            ${this.renderizarCampo('Tipo', solicitud.tipo)}
                            ${this.renderizarCampo('Nombre', solicitud.nombre)}
                            ${this.renderizarCampo('Email', solicitud.email)}
                            ${this.renderizarCampo('Estado', `<span class="status-badge ${this.getEstadoClass(solicitud.estado)}">${solicitud.estado}</span>`)}
                            ${this.renderizarCampo('Fecha', new Date(solicitud.fecha).toLocaleString('es-ES'))}
                        </div>
                        <div class="expediente-info-card">
                            <h3>📝 Descripción</h3>
                            <p style="line-height: 1.6; color: #333;">${this.escaparHTML(solicitud.descripcion || 'Sin descripción')}</p>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button class="btn-close" onclick="CasillaUnificada.cerrarModal()">Cerrar</button>
                    </div>
                </div>
            </div>
        `;
    },

    /**
     * Modal genérico
     */
    modalGenerico(datos) {
        return `
            <div class="modal" id="casillaModal" style="display: block;">
                <div class="modal-content">
                    <div class="modal-header">
                        <h2>📄 Detalles</h2>
                        <button class="expediente-close" onclick="CasillaUnificada.cerrarModal()">&times;</button>
                    </div>
                    <div class="modal-body">
                        <pre>${JSON.stringify(datos, null, 2)}</pre>
                    </div>
                    <div class="modal-footer">
                        <button class="btn-close" onclick="CasillaUnificada.cerrarModal()">Cerrar</button>
                    </div>
                </div>
            </div>
        `;
    },

    /**
     * Renderizar campo de información
     */
    renderizarCampo(label, value) {
        if (!value || value === 'null' || value === 'undefined') {
            value = 'N/A';
        }
        return `
            <div class="expediente-info-item">
                <span class="expediente-info-label">${label}:</span>
                <span class="expediente-info-value">${value}</span>
            </div>
        `;
    },

    /**
     * Cambiar estado de un item
     */
    async cambiarEstado(tipo, id, nuevoEstado) {
        try {
            const observaciones = prompt(`Observaciones para ${nuevoEstado}:`) || '';

            let endpoint;
            switch (tipo) {
                case 'mesa_partes':
                    endpoint = `/api/mesa-partes/${id}/estado`;
                    break;
                default:
                    throw new Error('Tipo no soportado para cambio de estado');
            }

            const response = await fetch(endpoint, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ estado: nuevoEstado, observaciones })
            });

            const data = await response.json();

            if (data.success) {
                this.mostrarExito(`Estado cambiado a: ${nuevoEstado}`);
                this.cerrarModal();
                await this.cargar();
            } else {
                throw new Error(data.error || 'Error cambiando estado');
            }
        } catch (error) {
            console.error('❌ Error:', error);
            this.mostrarError('Error cambiando estado: ' + error.message);
        }
    },

    /**
     * Insertar modal en DOM
     */
    insertarModal(contenido) {
        this.cerrarModal(); // Cerrar modal existente
        document.body.insertAdjacentHTML('beforeend', contenido);
        document.body.style.overflow = 'hidden';
    },

    /**
     * Cerrar modal
     */
    cerrarModal() {
        const modal = document.getElementById('casillaModal');
        if (modal) {
            modal.remove();
            document.body.style.overflow = '';
        }
    },

    /**
     * Obtener clase de estado
     */
    getEstadoClass(estado) {
        if (!estado) return 'status-pending';
        const estadoLower = estado.toLowerCase();
        if (estadoLower.includes('pendiente')) return 'status-pending';
        if (estadoLower.includes('aprobado')) return 'status-approved';
        if (estadoLower.includes('rechazado')) return 'status-rejected';
        if (estadoLower.includes('revisión')) return 'status-in-progress';
        return 'status-pending';
    },

    /**
     * Escapar HTML para prevenir XSS
     */
    escaparHTML(texto) {
        if (!texto) return '';
        const div = document.createElement('div');
        div.textContent = texto;
        return div.innerHTML;
    },

    /**
     * Mostrar error
     */
    mostrarError(mensaje) {
        if (window.conexionDatos && window.conexionDatos.mostrarNotificacion) {
            window.conexionDatos.mostrarNotificacion(mensaje, 'error');
        } else {
            alert('❌ ' + mensaje);
        }
    },

    /**
     * Mostrar éxito
     */
    mostrarExito(mensaje) {
        if (window.conexionDatos && window.conexionDatos.mostrarNotificacion) {
            window.conexionDatos.mostrarNotificacion(mensaje, 'success');
        } else {
            alert('✅ ' + mensaje);
        }
    },

    /**
     * Responder a Mesa de Partes
     */
    async responderMesaPartes(presentacionId, usuarioId, numeroRegistro) {
        try {
            // Obtener datos de la presentación
            const response = await fetch(`/api/mesa-partes/${presentacionId}`);
            const data = await response.json();

            if (!data.success) {
                alert('Error obteniendo datos de la presentación');
                return;
            }

            const presentacion = data.data;
            const demandante = presentacion.demandante || {};

            // Ocultar el modal de detalle mientras se responde
            const casillaModal = document.getElementById('casillaModal');
            if (casillaModal) casillaModal.style.display = 'none';

            // Crear modal de respuesta
            const modalHTML = `
                <div id="modalResponderMesaPartes" style="display:block;position:fixed;z-index:30000;left:0;top:0;width:100%;height:100%;background:rgba(0,0,0,0.7);">
                    <div style="background:#fff;margin:5% auto;padding:30px;width:90%;max-width:600px;border-radius:12px;box-shadow:0 4px 20px rgba(0,0,0,0.3);">
                        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px;border-bottom:2px solid #f0f0f0;padding-bottom:15px;">
                            <h2 style="margin:0;color:#000;font-size:22px;">💬 Responder Mesa de Partes</h2>
                            <button onclick="CasillaUnificada.cerrarModalRespuesta()" style="background:none;border:none;font-size:28px;cursor:pointer;color:#666;">&times;</button>
                        </div>
                        
                        <div style="background:#f8f9fa;padding:15px;border-radius:8px;margin-bottom:20px;">
                            <p style="margin:5px 0;color:#333;"><strong>Número:</strong> ${numeroRegistro}</p>
                            <p style="margin:5px 0;color:#333;"><strong>Solicitante:</strong> ${demandante.nombre || 'No especificado'}</p>
                            <p style="margin:5px 0;color:#333;"><strong>Tipo:</strong> ${presentacion.tipo_presentacion || 'No especificado'}</p>
                        </div>

                        <form id="formResponderMesaPartes" onsubmit="CasillaUnificada.enviarRespuestaMesaPartes(event, '${presentacionId}', '${usuarioId}')">
                            <div style="margin-bottom:20px;">
                                <label style="display:block;margin-bottom:8px;color:#333;font-weight:600;">Asunto de la respuesta:</label>
                                <input type="text" id="respuesta-mp-asunto" required 
                                    style="width:100%;padding:12px;border:1px solid #ddd;border-radius:8px;font-size:14px;"
                                    placeholder="Ej: Respuesta a su presentación ${numeroRegistro}">
                            </div>

                            <div style="margin-bottom:20px;">
                                <label style="display:block;margin-bottom:8px;color:#333;font-weight:600;">Mensaje:</label>
                                <textarea id="respuesta-mp-mensaje" required rows="6"
                                    style="width:100%;padding:12px;border:1px solid #ddd;border-radius:8px;font-size:14px;resize:vertical;"
                                    placeholder="Escriba su respuesta aquí..."></textarea>
                            </div>

                            <div style="margin-bottom:20px;">
                                <label style="display:block;margin-bottom:8px;color:#333;font-weight:600;">📎 Adjuntar archivo (opcional):</label>
                                <input type="file" id="respuesta-mp-archivo" 
                                    style="width:100%;padding:12px;border:1px solid #ddd;border-radius:8px;font-size:14px;"
                                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png">
                                <small style="color:#666;font-size:12px;">Formatos permitidos: PDF, Word, Imágenes (máx. 10MB)</small>
                            </div>

                            <div style="display:flex;gap:10px;justify-content:flex-end;">
                                <button type="button" onclick="CasillaUnificada.cerrarModalRespuesta()" 
                                    style="padding:12px 24px;background:#6c757d;color:#fff;border:none;border-radius:8px;cursor:pointer;font-size:14px;">
                                    Cancelar
                                </button>
                                <button type="submit" 
                                    style="padding:12px 24px;background:#4CAF50;color:#fff;border:none;border-radius:8px;cursor:pointer;font-size:14px;">
                                    📤 Enviar Respuesta
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            `;

            // Agregar modal al body
            const modalDiv = document.createElement('div');
            modalDiv.innerHTML = modalHTML;
            document.body.appendChild(modalDiv);

        } catch (error) {
            console.error('Error abriendo modal de respuesta:', error);
            alert('Error al abrir el formulario de respuesta');
        }
    },

    /**
     * Cerrar modal de respuesta
     */
    cerrarModalRespuesta() {
        const modal = document.getElementById('modalResponderMesaPartes');
        if (modal) {
            modal.parentElement.remove();
        }
        // Restaurar modal de detalle si existe
        const casillaModal = document.getElementById('casillaModal');
        if (casillaModal) casillaModal.style.display = 'block';
    },

    /**
     * Enviar respuesta de Mesa de Partes
     */
    async enviarRespuestaMesaPartes(event, presentacionId, usuarioId) {
        event.preventDefault();

        const asunto = document.getElementById('respuesta-mp-asunto').value;
        const mensaje = document.getElementById('respuesta-mp-mensaje').value;
        const archivoInput = document.getElementById('respuesta-mp-archivo');
        const archivo = archivoInput?.files[0];

        if (!asunto || !mensaje) {
            alert('Por favor, complete todos los campos obligatorios');
            return;
        }

        // Validar tamaño del archivo (10MB máximo)
        if (archivo && archivo.size > 10 * 1024 * 1024) {
            alert('El archivo es demasiado grande. Máximo 10MB.');
            return;
        }

        try {
            console.log('📤 Enviando respuesta a Mesa de Partes:', presentacionId);

            const formData = new FormData();
            formData.append('usuario_id', usuarioId);
            formData.append('tipo', 'respuesta_admin');
            formData.append('titulo', asunto);
            formData.append('mensaje', mensaje);
            formData.append('referencia_tipo', 'mesa_partes');
            formData.append('referencia_id', presentacionId);
            
            // Agregar archivo si existe
            if (archivo) {
                formData.append('archivo', archivo);
                console.log('📎 Archivo adjunto:', archivo.name);
            }

            // Crear notificación con archivo en la casilla del usuario
            const response = await fetch('/api/notificaciones', {
                method: 'POST',
                body: formData
            });

            const data = await response.json();

            if (data.success) {
                const mensajeExito = archivo 
                    ? '✅ Respuesta enviada correctamente con archivo adjunto. El usuario la verá en su Casilla Electrónica.'
                    : '✅ Respuesta enviada correctamente. El usuario la verá en su Casilla Electrónica.';
                
                alert(mensajeExito);
                this.cerrarModalRespuesta();
                this.cerrarModal();
                
                // Refrescar casilla
                await this.cargar();
            } else {
                throw new Error(data.error || 'Error enviando respuesta');
            }
        } catch (error) {
            console.error('❌ Error enviando respuesta:', error);
            alert('❌ Error al enviar la respuesta: ' + error.message);
        }
    },

    /**
     * Refrescar datos
     */
    async refrescar() {
        const btn = event?.target;
        if (btn) {
            btn.disabled = true;
            btn.textContent = '🔄 Actualizando...';
        }

        await this.cargar();

        if (btn) {
            btn.disabled = false;
            btn.textContent = '🔄 Refrescar';
        }

        this.mostrarExito('Casilla actualizada');
    }
};

// Exportar para uso global
if (typeof window !== 'undefined') {
    window.CasillaUnificada = CasillaUnificada;
    
    // Funciones legacy para compatibilidad
    window.cargarCasillaElectronicaAdmin = () => CasillaUnificada.init();
    window.refrescarCasillaElectronica = () => CasillaUnificada.refrescar();
}

console.log('✅ Módulo CasillaUnificada cargado');
