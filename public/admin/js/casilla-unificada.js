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
                            style="padding: 6px 12px; font-size: 12px; margin-right: 4px;" 
                            onclick="CasillaUnificada.verDetalle('${item.tipo}', '${item.referencia_id}')"
                            title="Ver detalles">
                        👁️ Ver
                    </button>
                    <button class="btn btn-primary" 
                            style="padding: 6px 12px; font-size: 12px; background:linear-gradient(135deg,#d4af37,#f1d582);color:#1a1a1a;" 
                            onclick="TimelineManager.abrir('${item.tipo === 'mesa_partes' ? 'mesa-partes' : item.tipo === 'expediente' ? 'expedientes' : 'solicitudes'}', '${item.referencia_id}', '${tipo.nombre}: ${item.referencia_id}')"
                            title="Ver Timeline">
                        📋
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
        const demandante = typeof presentacion.demandante === 'string' ? JSON.parse(presentacion.demandante) : (presentacion.demandante || {});
        const demandado = typeof presentacion.demandado === 'string' ? JSON.parse(presentacion.demandado) : (presentacion.demandado || {});
        const documentos = typeof presentacion.documentos === 'string' ? JSON.parse(presentacion.documentos) : (presentacion.documentos || []);
        const estadoClass = this.getEstadoClass(presentacion.estado);

        return `
            <style>
                @keyframes modalFadeIn { from { opacity: 0; } to { opacity: 1; } }
                @keyframes modalSlideUp { from { transform: translateY(40px) scale(0.95); opacity: 0; } to { transform: translateY(0) scale(1); opacity: 1; } }
                .expediente-info-card:hover { transform: translateY(-5px); box-shadow: 0 20px 60px rgba(0,0,0,0.08) !important; border-color: rgba(212, 175, 55, 0.2) !important; }
            </style>
            <div class="modal" id="casillaModal" style="display: block; background: rgba(0,0,0,0.9); backdrop-filter: blur(15px); -webkit-backdrop-filter: blur(15px); z-index: 99999; animation: modalFadeIn 0.4s ease-out;">
                <div class="modal-content" style="max-width: 1050px; border-radius: 35px; border: 1px solid rgba(212, 175, 55, 0.4); box-shadow: 0 50px 120px rgba(0,0,0,0.7); overflow: hidden; background: #ffffff; animation: modalSlideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1); margin-top: 2vh;">
                    <div class="modal-header" style="background: linear-gradient(135deg, #050505 0%, #151515 100%); padding: 35px 50px; border-bottom: 4px solid var(--color-gold); display: flex; justify-content: space-between; align-items: center; position: relative; overflow: hidden;">
                        <div style="position: absolute; top: 0; left: 0; right: 0; bottom: 0; background: url('https://www.transparenttextures.com/patterns/dark-matter.png'); opacity: 0.15; pointer-events: none;"></div>
                        
                        <div style="display: flex; align-items: center; gap: 25px; position: relative; z-index: 1;">
                            <div style="width: 65px; height: 65px; background: rgba(212, 175, 55, 0.15); border: 2px solid rgba(212, 175, 55, 0.4); border-radius: 20px; display: flex; align-items: center; justify-content: center; color: var(--color-gold); font-size: 32px; box-shadow: 0 15px 30px rgba(0,0,0,0.3);">📥</div>
                            <div>
                                <h2 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 800; letter-spacing: -0.8px; text-transform: uppercase; font-family: 'Outfit', sans-serif;">Mesa de Partes</h2>
                                <div style="display: flex; align-items: center; gap: 12px; margin-top: 6px;">
                                    <span style="background: linear-gradient(90deg, #d4af37, #f1d582); -webkit-background-clip: text; -webkit-text-fill-color: transparent; font-size: 11px; font-weight: 900; letter-spacing: 2px; text-transform: uppercase;">REGISTRO OFICIAL</span>
                                    <span style="color: rgba(255,255,255,0.8); font-size: 16px; font-family: 'JetBrains Mono', monospace; font-weight: 600;">${presentacion.numero_registro}</span>
                                </div>
                            </div>
                        </div>
                        <button class="expediente-close" onclick="CasillaUnificada.cerrarModal()" style="width: 50px; height: 50px; border-radius: 50%; background: rgba(255,255,255,0.08); color: #ffffff; border: 1px solid rgba(255,255,255,0.15); font-size: 32px; cursor: pointer; transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1); display: flex; align-items: center; justify-content: center; position: relative; z-index: 1;">&times;</button>
                    </div>
                    
                    <div class="modal-body" style="padding: 50px; background: #ffffff; max-height: 75vh; overflow-y: auto;">
                        <div style="display: grid; grid-template-columns: 1.35fr 0.65fr; gap: 40px; margin-bottom: 45px;">
                            <div style="display: flex; flex-direction: column; gap: 35px;">
                                <div class="expediente-info-card" style="background: #ffffff; border-radius: 28px; padding: 35px; box-shadow: 0 15px 50px rgba(0,0,0,0.05); border: 1px solid rgba(0,0,0,0.06); position: relative; overflow: hidden; transition: all 0.4s ease;">
                                    <div style="position: absolute; top: 0; left: 0; width: 6px; height: 100%; background: var(--color-gold);"></div>
                                    <h3 style="color: #000; font-size: 15px; font-weight: 800; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 30px; display: flex; align-items: center; gap: 12px;">
                                        <span style="font-size: 20px;">📜</span> Información Estratégica
                                    </h3>
                                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 30px;">
                                        ${this.renderizarCampoModerno('Tipo de Presentación', presentacion.tipo_presentacion)}
                                        ${this.renderizarCampoModerno('Materia / Asunto', presentacion.materia)}
                                        ${this.renderizarCampoModerno('Estado Actual', `<span class="status-badge ${estadoClass}" style="padding: 6px 16px; font-size: 11px; font-weight: 800; border-radius: 50px;">${presentacion.estado}</span>`)}
                                        ${this.renderizarCampoModerno('Fecha de Ingreso', new Date(presentacion.fecha_presentacion).toLocaleString('es-ES'))}
                                    </div>
                                </div>

                                <div class="expediente-info-card" style="background: #ffffff; border-radius: 28px; padding: 35px; box-shadow: 0 15px 50px rgba(0,0,0,0.05); border: 1px solid rgba(0,0,0,0.06); position: relative; overflow: hidden; transition: all 0.4s ease;">
                                    <div style="position: absolute; top: 0; left: 0; width: 6px; height: 100%; background: #3498db;"></div>
                                    <h3 style="color: #000; font-size: 15px; font-weight: 800; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 30px; display: flex; align-items: center; gap: 12px;">
                                        <span style="font-size: 20px;">👤</span> Datos del Demandante
                                    </h3>
                                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 30px;">
                                        ${this.renderizarCampoModerno('Nombre Completo', `<span style="font-weight: 800; font-size: 16px;">${demandante.nombre}</span>`)}
                                        ${this.renderizarCampoModerno('Documento Identidad', `${demandante.documento_tipo || ''} ${demandante.documento_numero || ''}`)}
                                        ${this.renderizarCampoModerno('Correo Electrónico', `<a href="mailto:${demandante.correo}" style="color: #3498db; text-decoration: none;">${demandante.correo}</a>`)}
                                        ${this.renderizarCampoModerno('Teléfono / WhatsApp', demandante.telefono)}
                                    </div>
                                </div>

                                <div class="expediente-info-card" style="background: #ffffff; border-radius: 28px; padding: 35px; box-shadow: 0 15px 50px rgba(0,0,0,0.05); border: 1px solid rgba(0,0,0,0.06); position: relative; overflow: hidden; transition: all 0.4s ease;">
                                    <div style="position: absolute; top: 0; left: 0; width: 6px; height: 100%; background: #e67e22;"></div>
                                    <h3 style="color: #000; font-size: 15px; font-weight: 800; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 30px; display: flex; align-items: center; gap: 12px;">
                                        <span style="font-size: 20px;">⚖️</span> Datos del Demandado
                                    </h3>
                                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 30px;">
                                        ${this.renderizarCampoModerno('Nombre / Razón Social', `<span style="font-weight: 800; font-size: 16px;">${demandado.nombre}</span>`)}
                                        ${this.renderizarCampoModerno('Documento / RUC', `${demandado.documento_tipo || ''} ${demandado.documento_numero || ''}`)}
                                    </div>
                                </div>
                            </div>

                            <div style="display: flex; flex-direction: column; gap: 35px;">
                                <div class="expediente-info-card" style="background: #f8f9fa; border-radius: 28px; padding: 35px; border: 1px solid rgba(0,0,0,0.05); height: 100%;">
                                    <h3 style="color: #000; font-size: 15px; font-weight: 800; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 30px; display: flex; align-items: center; gap: 12px;">
                                        <span style="font-size: 20px;">📎</span> Archivos <span style="background: #d4af37; color: #000; font-size: 12px; padding: 2px 10px; border-radius: 10px; margin-left: 5px;">${documentos.length}</span>
                                    </h3>
                                    <div style="display: flex; flex-direction: column; gap: 15px;">
                                        ${documentos.length > 0 ? documentos.map(doc => `
                                            <div style="padding: 18px; background: #ffffff; border: 1px solid rgba(0,0,0,0.08); border-radius: 20px; display: flex; justify-content: space-between; align-items: center; transition: all 0.3s; cursor: pointer; box-shadow: 0 4px 12px rgba(0,0,0,0.02);" onmouseover="this.style.borderColor='var(--color-gold)'; this.style.transform='translateX(5px)';" onmouseout="this.style.borderColor='rgba(0,0,0,0.08)'; this.style.transform='translateX(0)';" onclick="window.open('/uploads/mesa-partes/${doc.nombre_archivo}', '_blank')">
                                                <div style="display: flex; align-items: center; gap: 15px;">
                                                    <div style="width: 42px; height: 42px; background: #f0f0f0; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 20px; color: #d4af37;">📄</div>
                                                    <div style="overflow: hidden; max-width: 130px;">
                                                        <strong style="display: block; font-size: 13px; color: #1a1a1a; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${this.escaparHTML(doc.nombre_original || 'Documento')}</strong>
                                                        <small style="font-size: 10px; color: #999;">${(doc.tamano / 1024).toFixed(2)} KB</small>
                                                    </div>
                                                </div>
                                                <div style="width: 32px; height: 32px; background: var(--color-gold); color: #000; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 14px;">⬇️</div>
                                            </div>
                                        `).join('') : '<p style="text-align: center; color: #999; font-style: italic; padding: 20px;">Sin adjuntos</p>'}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Panel de Acción Compacto y Profesional -->
                        <div style="background: #fdfdfd; border: 1px solid rgba(0,0,0,0.06); border-radius: 24px; padding: 25px 35px; box-shadow: 0 10px 30px rgba(0,0,0,0.03); margin-top: 20px;">
                            <div style="display: flex; align-items: center; justify-content: space-between; gap: 20px;">
                                <div style="flex: 1;">
                                    <h3 style="color: #1a1a1a; font-size: 13px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 4px;">Acciones de Gestión</h3>
                                    <p style="color: #888; font-size: 11px; margin: 0;">Administración directa del expediente</p>
                                </div>
                                
                                <div style="display: flex; gap: 12px;">
                                    <!-- Botón Timeline -->
                                    <button class="btn" 
                                            style="background: #ffffff; color: #1a1a1a; border: 1px solid rgba(0,0,0,0.1); padding: 10px 18px; border-radius: 12px; font-weight: 700; font-size: 12px; display: flex; align-items: center; gap: 10px; transition: all 0.3s;"
                                            onmouseover="this.style.background='#f8f9fa'; this.style.borderColor='rgba(0,0,0,0.2)';" onmouseout="this.style.background='#ffffff'; this.style.borderColor='rgba(0,0,0,0.1)';"
                                            onclick="CasillaUnificada.cerrarModal(); TimelineManager.abrir('mesa-partes','${presentacion.id}','Mesa de Partes: ${presentacion.numero_registro}')">
                                        <span style="font-size: 16px;">📜</span> TIMELINE
                                    </button>

                                    <!-- Botón Responder -->
                                    <button class="btn" 
                                            style="background: #27ae60; color: #fff; border: none; padding: 10px 18px; border-radius: 12px; font-weight: 700; font-size: 12px; display: flex; align-items: center; gap: 10px; transition: all 0.3s; box-shadow: 0 4px 12px rgba(39, 174, 96, 0.2);"
                                            onmouseover="this.style.background='#219150'; this.style.transform='translateY(-2px)';" onmouseout="this.style.background='#27ae60'; this.style.transform='translateY(0)';"
                                            onclick="CasillaUnificada.responderMesaPartes('${presentacion.id}', '${presentacion.usuario_id}', '${presentacion.numero_registro}')">
                                        <span style="font-size: 16px;">💬</span> RESPONDER
                                    </button>

                                    <!-- Botón Aprobar -->
                                    <button class="btn" 
                                            style="background: var(--color-gold); color: #000; border: none; padding: 10px 18px; border-radius: 12px; font-weight: 800; font-size: 12px; display: flex; align-items: center; gap: 10px; transition: all 0.3s; box-shadow: 0 4px 12px rgba(212, 175, 55, 0.2);"
                                            onmouseover="this.style.background='#f1d582'; this.style.transform='translateY(-2px)';" onmouseout="this.style.background='var(--color-gold)'; this.style.transform='translateY(0)';"
                                            onclick="CasillaUnificada.confirmarCambioEstado('mesa_partes', '${presentacion.id}', 'Aprobado')">
                                        <span style="font-size: 16px;">✅</span> APROBAR
                                    </button>

                                    <!-- Botón Rechazar -->
                                    <button class="btn" 
                                            style="background: #e74c3c; color: #fff; border: none; padding: 10px 18px; border-radius: 12px; font-weight: 700; font-size: 12px; display: flex; align-items: center; gap: 10px; transition: all 0.3s; box-shadow: 0 4px 12px rgba(231, 76, 60, 0.2);"
                                            onmouseover="this.style.background='#c0392b'; this.style.transform='translateY(-2px)';" onmouseout="this.style.background='#e74c3c'; this.style.transform='translateY(0)';"
                                            onclick="CasillaUnificada.confirmarCambioEstado('mesa_partes', '${presentacion.id}', 'Rechazado')">
                                        <span style="font-size: 16px;">❌</span> RECHAZAR
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    },

    /**
     * Helper para renderizar campos con estilo moderno
     */
    renderizarCampoModerno(label, value) {
        return `
            <div style="display: flex; flex-direction: column; gap: 8px; padding: 12px; background: rgba(0,0,0,0.02); border-radius: 12px; border: 1px solid rgba(0,0,0,0.03); transition: all 0.3s;" onmouseover="this.style.background='rgba(212, 175, 55, 0.05)'; this.style.borderColor='rgba(212, 175, 55, 0.1)';" onmouseout="this.style.background='rgba(0,0,0,0.02)'; this.style.borderColor='rgba(0,0,0,0.03)';">
                <label style="margin: 0; color: #888; font-size: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: 1.5px; font-family: 'Outfit', sans-serif;">${label}</label>
                <div style="color: #1a1a1a; font-size: 15px; font-weight: 600; line-height: 1.4;">${value || '<span style="color: #ccc; font-style: italic;">No disponible</span>'}</div>
            </div>
        `;
    },

    /**
     * Modal para Expediente
     */
    modalExpediente(expediente) {
        const estadoClass = this.getEstadoClass(expediente.estado);
        return `
            <div class="modal" id="casillaModal" style="display: block; background: rgba(0,0,0,0.92); backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px); z-index: 99999; animation: fadeIn 0.3s ease-out;">
                <div class="modal-content" style="max-width: 900px; border-radius: 35px; border: 1px solid rgba(212, 175, 55, 0.4); box-shadow: 0 50px 120px rgba(0,0,0,0.7); overflow: hidden; background: #ffffff; animation: modalSlideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1); margin-top: 5vh;">
                    <div class="modal-header" style="background: linear-gradient(135deg, #050505 0%, #151515 100%); padding: 35px 50px; border-bottom: 4px solid var(--color-gold); display: flex; justify-content: space-between; align-items: center; position: relative; overflow: hidden;">
                        <div style="position: absolute; top: 0; left: 0; right: 0; bottom: 0; background: url('https://www.transparenttextures.com/patterns/dark-matter.png'); opacity: 0.15; pointer-events: none;"></div>
                        <div style="display: flex; align-items: center; gap: 25px; position: relative; z-index: 1;">
                            <div style="width: 65px; height: 65px; background: rgba(212, 175, 55, 0.15); border: 2px solid rgba(212, 175, 55, 0.4); border-radius: 20px; display: flex; align-items: center; justify-content: center; color: var(--color-gold); font-size: 32px; box-shadow: 0 15px 30px rgba(0,0,0,0.3); transform: rotate(-5deg);">📁</div>
                            <div>
                                <h2 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 800; letter-spacing: -0.8px; text-transform: uppercase; font-family: 'Outfit', sans-serif;">Expediente Judicial</h2>
                                <span style="color: var(--color-gold); font-size: 16px; font-family: 'JetBrains Mono', monospace; font-weight: 600; opacity: 0.9; letter-spacing: 1px;">ID: ${expediente.numero_expediente}</span>
                            </div>
                        </div>
                        <button class="expediente-close" onclick="CasillaUnificada.cerrarModal()" style="width: 50px; height: 50px; border-radius: 50%; background: rgba(255,255,255,0.08); color: #ffffff; border: 1px solid rgba(255,255,255,0.15); font-size: 32px; cursor: pointer; transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1); display: flex; align-items: center; justify-content: center;">&times;</button>
                    </div>
                    <div class="modal-body" style="padding: 50px; background: #ffffff;">
                        <div class="expediente-info-card" style="background: #ffffff; border-radius: 30px; padding: 40px; box-shadow: 0 20px 60px rgba(0,0,0,0.06); border: 1px solid rgba(0,0,0,0.08); position: relative; overflow: hidden; margin-bottom: 40px;">
                            <div style="position: absolute; top: 0; left: 0; width: 6px; height: 100%; background: var(--color-gold);"></div>
                            <h3 style="color: #000; font-size: 16px; font-weight: 800; text-transform: uppercase; letter-spacing: 2.5px; margin-bottom: 35px; display: flex; align-items: center; gap: 15px;">
                                <span style="font-size: 20px;">📋</span> RESUMEN DE EXPEDIENTE
                            </h3>
                            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 35px;">
                                ${this.renderizarCampoModerno('Número de Expediente', `<span style="color: #000; font-weight: 800; font-size: 18px;">${expediente.numero_expediente}</span>`)}
                                ${this.renderizarCampoModerno('Estado Actual', `<span class="status-badge ${estadoClass}" style="padding: 8px 20px; font-size: 12px; font-weight: 800; border-radius: 50px; border: 2px solid currentColor;">${expediente.estado}</span>`)}
                                ${this.renderizarCampoModerno('Sede Judicial', `<span style="font-weight: 700;">${expediente.sede}</span>`)}
                                ${this.renderizarCampoModerno('Especialidad', `<span style="font-weight: 700;">${expediente.especialidad}</span>`)}
                                ${this.renderizarCampoModerno('Tipo de Proceso', expediente.proceso)}
                                ${this.renderizarCampoModerno('Materia Jurídica', expediente.materia)}
                                ${this.renderizarCampoModerno('Usuario Propietario', `<span style="color: #3498db; font-weight: 800; display: flex; align-items: center; gap: 10px;">👤 ${expediente.usuario_nombre}</span>`)}
                            </div>
                        </div>
                        <div style="display: flex; justify-content: center; gap: 25px;">
                            <button class="btn" style="background: #1a1a1a; color: white; padding: 20px 50px; border-radius: 20px; font-weight: 700; font-size: 14px; min-width: 220px; transition: all 0.3s;" onmouseover="this.style.background='#000'; this.style.transform='translateY(-5px)';" onmouseout="this.style.background='#1a1a1a'; this.style.transform='translateY(0)';" onclick="CasillaUnificada.cerrarModal()">CERRAR VISTA</button>
                            <button class="btn" style="background: var(--color-gold); color: #000; padding: 20px 50px; border-radius: 20px; font-weight: 900; font-size: 14px; min-width: 220px; box-shadow: 0 15px 35px rgba(212, 175, 55, 0.3); transition: all 0.3s;" onmouseover="this.style.background='#f1d582'; this.style.transform='translateY(-5px)';" onmouseout="this.style.background='var(--color-gold)'; this.style.transform='translateY(0)';" onclick="showSection('expedientes'); CasillaUnificada.cerrarModal()">GESTIONAR EXPEDIENTE</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    },

    /**
     * Modal para Solicitud
     */
    modalSolicitud(solicitud) {
        const estadoClass = this.getEstadoClass(solicitud.estado);
        return `
            <div class="modal" id="casillaModal" style="display: block; background: rgba(0,0,0,0.92); backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px); z-index: 99999; animation: fadeIn 0.3s ease-out;">
                <div class="modal-content" style="max-width: 900px; border-radius: 35px; border: 1px solid rgba(212, 175, 55, 0.4); box-shadow: 0 50px 120px rgba(0,0,0,0.7); overflow: hidden; background: #ffffff; animation: modalSlideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1); margin-top: 5vh;">
                    <div class="modal-header" style="background: linear-gradient(135deg, #050505 0%, #151515 100%); padding: 35px 50px; border-bottom: 4px solid var(--color-gold); display: flex; justify-content: space-between; align-items: center; position: relative; overflow: hidden;">
                        <div style="position: absolute; top: 0; left: 0; right: 0; bottom: 0; background: url('https://www.transparenttextures.com/patterns/dark-matter.png'); opacity: 0.15; pointer-events: none;"></div>
                        <div style="display: flex; align-items: center; gap: 25px; position: relative; z-index: 1;">
                            <div style="width: 65px; height: 65px; background: rgba(212, 175, 55, 0.15); border: 2px solid rgba(212, 175, 55, 0.4); border-radius: 20px; display: flex; align-items: center; justify-content: center; color: var(--color-gold); font-size: 32px; box-shadow: 0 15px 30px rgba(0,0,0,0.3); transform: rotate(-5deg);">📄</div>
                            <div>
                                <h2 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 800; letter-spacing: -0.8px; text-transform: uppercase; font-family: 'Outfit', sans-serif;">Detalle de Solicitud</h2>
                                <span style="color: var(--color-gold); font-size: 16px; font-family: 'JetBrains Mono', monospace; font-weight: 600; opacity: 0.9;">ID: ${solicitud.id}</span>
                            </div>
                        </div>
                        <button class="expediente-close" onclick="CasillaUnificada.cerrarModal()" style="width: 50px; height: 50px; border-radius: 50%; background: rgba(255,255,255,0.08); color: #ffffff; border: 1px solid rgba(255,255,255,0.15); font-size: 32px; cursor: pointer; transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1); display: flex; align-items: center; justify-content: center;">&times;</button>
                    </div>
                    <div class="modal-body" style="padding: 50px; background: #ffffff;">
                        <div style="display: grid; grid-template-columns: 1fr; gap: 40px; margin-bottom: 45px;">
                            <div class="expediente-info-card" style="background: #ffffff; border-radius: 30px; padding: 40px; box-shadow: 0 20px 60px rgba(0,0,0,0.06); border: 1px solid rgba(0,0,0,0.08); position: relative; overflow: hidden;">
                                <div style="position: absolute; top: 0; left: 0; width: 6px; height: 100%; background: var(--color-gold);"></div>
                                <h3 style="color: #000; font-size: 16px; font-weight: 800; text-transform: uppercase; letter-spacing: 2.5px; margin-bottom: 35px; display: flex; align-items: center; gap: 15px;">
                                    <span style="font-size: 22px;">🔍</span> DATOS DE LA SOLICITUD
                                </h3>
                                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 35px;">
                                    ${this.renderizarCampoModerno('Asunto Principal', `<span style="color: #000; font-weight: 800; font-size: 18px;">${this.escaparHTML(solicitud.asunto)}</span>`)}
                                    ${this.renderizarCampoModerno('Estado Administrativo', `<span class="status-badge ${estadoClass}" style="padding: 8px 20px; font-size: 12px; font-weight: 800; border-radius: 50px; border: 2px solid currentColor;">${solicitud.estado}</span>`)}
                                    ${this.renderizarCampoModerno('Categoría / Tipo', `<span style="font-weight: 700;">${solicitud.tipo}</span>`)}
                                    ${this.renderizarCampoModerno('Usuario Solicitante', `<span style="font-weight: 800;">👤 ${solicitud.nombre}</span>`)}
                                    ${this.renderizarCampoModerno('Vínculo de Contacto', `<a href="mailto:${solicitud.email}" style="color: #3498db; font-weight: 600; text-decoration: none; border-bottom: 1px dashed #3498db;">${solicitud.email}</a>`)}
                                    ${this.renderizarCampoModerno('Fecha de Emisión', `<span style="font-weight: 700;">${new Date(solicitud.fecha).toLocaleString('es-ES', { dateStyle: 'long', timeStyle: 'short' })}</span>`)}
                                </div>
                            </div>
                            <div class="expediente-info-card" style="background: #fbfbfb; border-radius: 30px; padding: 40px; border: 1px solid rgba(0,0,0,0.05); position: relative;">
                                <h3 style="color: #000; font-size: 16px; font-weight: 800; text-transform: uppercase; letter-spacing: 2.5px; margin-bottom: 25px; display: flex; align-items: center; gap: 15px;">
                                    <span style="font-size: 22px;">📝</span> CONTENIDO DE LA SOLICITUD
                                </h3>
                                <p style="line-height: 2; color: #333; font-size: 15px; background: white; padding: 30px; border-radius: 24px; border: 1px solid rgba(0,0,0,0.05); box-shadow: inset 0 2px 10px rgba(0,0,0,0.02); white-space: pre-wrap; font-family: 'Outfit', sans-serif;">${this.escaparHTML(solicitud.descripcion || 'Sin descripción detallada')}</p>
                            </div>
                        </div>
                        <div style="display: flex; justify-content: center; gap: 25px;">
                            <button class="btn" style="background: #1a1a1a; color: white; padding: 20px 50px; border-radius: 20px; font-weight: 700; font-size: 14px; min-width: 220px; transition: all 0.3s;" onmouseover="this.style.background='#000'; this.style.transform='translateY(-5px)';" onmouseout="this.style.background='#1a1a1a'; this.style.transform='translateY(0)';" onclick="CasillaUnificada.cerrarModal()">CERRAR</button>
                            <button class="btn" style="background: #27ae60; color: white; padding: 20px 50px; border-radius: 20px; font-weight: 800; font-size: 14px; min-width: 220px; box-shadow: 0 15px 35px rgba(39, 174, 96, 0.3); transition: all 0.3s;" onmouseover="this.style.background='#2ecc71'; this.style.transform='translateY(-5px)';" onmouseout="this.style.background='#27ae60'; this.style.transform='translateY(0)';" onclick="CasillaUnificada.responderSolicitud('${solicitud.id}', '${solicitud.usuario_id}', '${solicitud.asunto}')">PROCEDER A RESPONDER</button>
                        </div>
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
     * NUEVO: Modal de Confirmación de Cambio de Estado (Pro-Max)
     */
    confirmarCambioEstado(tipo, id, nuevoEstado) {
        const modalId = 'modalConfirmarEstado';
        const color = nuevoEstado === 'Aprobado' ? '#27ae60' : '#e74c3c';
        const icono = nuevoEstado === 'Aprobado' ? '✅' : '❌';

        const modalHTML = `
            <div id="${modalId}" style="display:flex; position:fixed; z-index:40000; left:0; top:0; width:100%; height:100%; background:rgba(0,0,0,0.8); backdrop-filter: blur(10px); align-items:center; justify-content:center; animation: fadeIn 0.3s ease-out;">
                <div style="background:#ffffff; width:90%; max-width:500px; border-radius:30px; overflow:hidden; box-shadow:0 30px 70px rgba(0,0,0,0.5); border: 1px solid rgba(0,0,0,0.05); transform: translateY(20px); animation: modalSlideUp 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;">
                    <div style="background:${color}; padding:40px; text-align:center;">
                        <div style="font-size:60px; margin-bottom:15px; animation: scaleIn 0.5s ease-out;">${icono}</div>
                        <h2 style="color:white; margin:0; font-size:24px; font-weight:800; letter-spacing:-0.5px;">${nuevoEstado.toUpperCase()}</h2>
                        <p style="color:rgba(255,255,255,0.8); margin:10px 0 0 0; font-size:14px;">Confirmar procesamiento de documento</p>
                    </div>
                    
                    <div style="padding:40px;">
                        <label style="color:#666; font-size:11px; font-weight:800; text-transform:uppercase; letter-spacing:1px; margin-bottom:12px; display:block;">Observaciones Administrativas</label>
                        <textarea id="obs-cambio-estado" placeholder="Ingrese las observaciones para el usuario..." 
                                  style="width:100%; padding:20px; border:1px solid #eee; border-radius:18px; font-family:inherit; font-size:14px; background:#f9f9f9; resize:none; height:120px; transition:all 0.3s;"
                                  onfocus="this.style.borderColor='${color}'; this.style.background='white'; this.style.boxShadow='0 5px 15px rgba(0,0,0,0.03)';"></textarea>
                        
                        <div style="display:grid; grid-template-columns:1fr 1fr; gap:15px; margin-top:30px;">
                            <button onclick="document.getElementById('${modalId}').remove()" 
                                    style="padding:16px; background:#f5f5f5; color:#666; border:none; border-radius:15px; cursor:pointer; font-weight:700; font-size:13px; transition:all 0.2s;"
                                    onmouseover="this.style.background='#eee'" onmouseout="this.style.background='#f5f5f5'">
                                CANCELAR
                            </button>
                            <button onclick="CasillaUnificada.cambiarEstado('${tipo}', '${id}', '${nuevoEstado}', document.getElementById('obs-cambio-estado').value)" 
                                    style="padding:16px; background:${color}; color:white; border:none; border-radius:15px; cursor:pointer; font-weight:700; font-size:13px; box-shadow:0 10px 20px ${color}44; transition:all 0.2s;"
                                    onmouseover="this.style.transform='translateY(-2px)'; this.style.filter='brightness(1.1)'" onmouseout="this.style.transform='translateY(0)'; this.style.filter='none'">
                                CONFIRMAR
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            <style>
                @keyframes modalSlideUp { to { transform: translateY(0); } }
                @keyframes scaleIn { from { transform: scale(0); opacity: 0; } to { transform: scale(1); opacity: 1; } }
            </style>
        `;

        document.body.insertAdjacentHTML('beforeend', modalHTML);
        setTimeout(() => document.getElementById('obs-cambio-estado').focus(), 100);
    },

    /**
     * Cambiar estado de un item (Actualizado)
     */
    async cambiarEstado(tipo, id, nuevoEstado, observaciones = '') {
        try {
            // Cerrar el modal de confirmación si existe
            const modalConfirmar = document.getElementById('modalConfirmarEstado');
            if (modalConfirmar) modalConfirmar.remove();

            this.mostrarCargando('Actualizando estado...');

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
                this.mostrarExito(`Documento ${nuevoEstado} correctamente`);
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
     * NUEVO: Mostrar overlay de carga
     */
    mostrarCargando(mensaje) {
        this.cerrarCargando();
        const loadingHTML = `
            <div id="loading-overlay-admin" style="position:fixed; z-index:50000; left:0; top:0; width:100%; height:100%; background:rgba(255,255,255,0.8); backdrop-filter:blur(5px); display:flex; flex-direction:column; align-items:center; justify-content:center; gap:20px;">
                <div style="width:50px; height:50px; border:4px solid #eee; border-top:4px solid var(--color-gold); border-radius:50%; animation: spin 1s linear infinite;"></div>
                <div style="font-weight:700; color:var(--color-dark); letter-spacing:1px; font-size:12px; text-transform:uppercase;">${mensaje}</div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', loadingHTML);
    },

    /**
     * NUEVO: Cerrar overlay de carga
     */
    cerrarCargando() {
        const overlay = document.getElementById('loading-overlay-admin');
        if (overlay) overlay.remove();
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
     * Mostrar error (Mejorado con SweetAlert2)
     */
    mostrarError(mensaje) {
        this.cerrarCargando();

        if (typeof Swal !== 'undefined') {
            Swal.fire({
                icon: 'error',
                title: '¡Error!',
                text: mensaje,
                background: '#fff',
                confirmButtonColor: '#d4af37',
                confirmButtonText: 'Entendido',
                customClass: {
                    popup: 'premium-swal-popup',
                    title: 'premium-swal-title'
                }
            });
        } else if (window.conexionDatos && window.conexionDatos.mostrarNotificacion) {
            window.conexionDatos.mostrarNotificacion(mensaje, 'error');
        } else {
            alert('❌ ' + mensaje);
        }
    },

    /**
     * Mostrar éxito (Mejorado con SweetAlert2)
     */
    mostrarExito(mensaje) {
        this.cerrarCargando();

        if (typeof Swal !== 'undefined') {
            Swal.fire({
                icon: 'success',
                title: '¡Éxito!',
                text: mensaje,
                timer: 3000,
                timerProgressBar: true,
                showConfirmButton: false,
                background: '#fff',
                customClass: {
                    popup: 'premium-swal-popup-success'
                }
            });
        } else if (window.conexionDatos && window.conexionDatos.mostrarNotificacion) {
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
