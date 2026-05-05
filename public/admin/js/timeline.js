/**
 * Timeline Universal — Componente reutilizable
 * Funciona para Expedientes, Mesa de Partes y Solicitudes
 */

const TimelineManager = {
    currentFuente: null,
    currentId: null,
    movimientos: [],

    // ── Abrir panel de timeline para cualquier fuente ──
    async abrir(fuente, id, titulo) {
        showLoader('ESTABLECIENDO CONEXIÓN CRONOLÓGICA');
        this.currentFuente = fuente;
        this.currentId = id;
        await this.cargar();
        hideLoader();
        this.renderModal(titulo || `Timeline — ${id}`);
    },

    // ── Cargar movimientos desde la API ──
    async cargar() {
        try {
            const headers = typeof getAuthHeaders === 'function' ? await getAuthHeaders() : { 'Content-Type': 'application/json' };
            const res = await fetch(`/api/${this.currentFuente}/${this.currentId}/timeline`, { headers });
            const data = await res.json();
            this.movimientos = data.success ? data.data : [];
        } catch (e) {
            console.error('Error cargando timeline:', e);
            this.movimientos = [];
        }
    },

    // ── Render del modal completo con Eje Cronológico Definido ──
    renderModal(titulo) {
        let overlay = document.getElementById('timeline-overlay');
        if (overlay) overlay.remove();

        overlay = document.createElement('div');
        overlay.id = 'timeline-overlay';
        overlay.style.cssText = `
            position: fixed; inset: 0; 
            background: rgba(0,0,0,0.45); 
            z-index: 30000; 
            display: flex; align-items: center; justify-content: center; 
            backdrop-filter: blur(10px); -webkit-backdrop-filter: blur(10px);
            animation: fadeIn 0.3s ease;
        `;
        overlay.onclick = (e) => { if (e.target === overlay) overlay.remove(); };

        const count = this.movimientos.length;
        overlay.innerHTML = `
        <div style="background: #ffffff; border-radius: 24px; width: 95%; max-width: 880px; max-height: 88vh; display: flex; flex-direction: column; box-shadow: 0 40px 120px rgba(0,0,0,0.2); overflow: hidden; border: 1px solid rgba(0,0,0,0.08);">
            <!-- Header Corporativo -->
            <div style="padding: 30px 45px; background: #ffffff; border-bottom: 1px solid #f0f0f0; display: flex; justify-content: space-between; align-items: center;">
                <div>
                    <h2 style="font-size: 20px; font-weight: 800; color: #1a1a1a; margin: 0; font-family: 'Outfit', sans-serif; display: flex; align-items: center; gap: 12px;">
                        <span style="width: 10px; height: 10px; background: var(--color-gold); border-radius: 50%; box-shadow: 0 0 10px rgba(212, 175, 55, 0.5);"></span>
                        ${titulo}
                    </h2>
                    <p style="font-size: 13px; color: #888; margin-top: 4px; font-weight: 500; letter-spacing: 0.2px;">${count} movimientos cronológicos registrados</p>
                </div>
                <div style="display: flex; gap: 15px;">
                    <button onclick="TimelineManager.mostrarFormulario()" style="background: #000; color: #fff; border: none; padding: 12px 24px; border-radius: 12px; font-weight: 700; cursor: pointer; font-size: 13px; transition: all 0.3s; box-shadow: 0 4px 12px rgba(0,0,0,0.1);" onmouseover="this.style.transform='translateY(-2px)';" onmouseout="this.style.transform='translateY(0)';">+ Nuevo Movimiento</button>
                    <button onclick="document.getElementById('timeline-overlay').remove()" style="background: #f8f9fa; color: #adb5bd; border: none; width: 42px; height: 42px; border-radius: 12px; cursor: pointer; font-size: 18px; display: flex; align-items: center; justify-content: center; transition: all 0.3s;" onmouseover="this.style.background='#fff0f0'; this.style.color='#e74c3c';">✕</button>
                </div>
            </div>
            <!-- Cuerpo con Diferenciación de Línea -->
            <div id="timeline-body" style="padding: 40px 50px; overflow-y: auto; flex: 1; background: #ffffff;">
                ${this.renderMovimientos()}
            </div>
        </div>`;

        document.body.appendChild(overlay);
    },

    // ── Render de movimientos con diferenciación clara ──
    // ── Render de movimientos con diferenciación clara (Pro Max) ──
    renderMovimientos() {
        if (!this.movimientos.length) {
            return `<div style="text-align: center; padding: 80px 0; color: #ccc;">
                <div style="font-size: 50px; margin-bottom: 20px; opacity: 0.2;">📂</div>
                <p style="font-size: 15px; font-weight: 500; letter-spacing: 0.5px;">Sin movimientos registrados</p>
            </div>`;
        }

        const colores = { 
            'Resolución':'#e74c3c', 'Decreto':'#3498db', 'Carta':'#2ecc71', 
            'Escrito':'#9b59b6', 'Oficio':'#e67e22', 'Acta':'#1abc9c', 
            'Auto':'#34495e', 'Cédula':'#f39c12', 'Respuesta':'#d4af37' 
        };

        const iconos = {
            'Resolución':'⚖️', 'Decreto':'📜', 'Carta':'✉️', 
            'Escrito':'✍️', 'Oficio':'🏢', 'Acta':'📝', 
            'Auto':'📂', 'Cédula':'📇', 'Respuesta':'✅'
        };

        return `
        <div style="position: relative; padding-left: 20px;">
            <!-- Eje Vertical -->
            <div style="position: absolute; left: 31px; top: 0; bottom: 0; width: 2px; background: linear-gradient(to bottom, var(--color-gold) 0%, #f0f0f0 100%); opacity: 0.3;"></div>
            
            ${this.movimientos.map((m, i) => {
                const color = colores[m.tipo_documento] || '#d4af37';
                const icono = iconos[m.tipo_documento] || '📄';
                const fecha = m.fecha_documento ? new Date(m.fecha_documento).toLocaleDateString('es-PE', { day:'2-digit', month:'short', year:'numeric' }) : '—';
                const hora = m.fecha_documento ? new Date(m.fecha_documento).toLocaleTimeString('es-PE', { hour:'2-digit', minute:'2-digit' }) : '';

                return `
                <div style="display: flex; gap: 40px; margin-bottom: 45px; position: relative;">
                    <!-- Nodo Milenario -->
                    <div style="position: relative; z-index: 2; flex-shrink: 0;">
                        <div style="width: 24px; height: 24px; background: #fff; border: 3px solid ${color}; border-radius: 50%; box-shadow: 0 0 0 5px #fff, 0 8px 15px ${color}22; display: flex; align-items: center; justify-content: center;">
                            <div style="width: 6px; height: 6px; background: ${color}; border-radius: 50%;"></div>
                        </div>
                    </div>

                    <!-- Tarjeta Corporativa -->
                    <div style="flex: 1; background: #fff; border: 1px solid rgba(0,0,0,0.06); border-radius: 20px; padding: 25px 30px; box-shadow: 0 5px 25px rgba(0,0,0,0.02); transition: all 0.3s; position: relative;" 
                         onmouseover="this.style.transform='translateX(8px)'; this.style.borderColor='${color}33'; this.style.boxShadow='0 15px 40px rgba(0,0,0,0.06)';" 
                         onmouseout="this.style.transform='translateX(0)'; this.style.borderColor='rgba(0,0,0,0.06)'; this.style.boxShadow='0 5px 25px rgba(0,0,0,0.02)';">
                        
                        <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px;">
                            <div>
                                <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 8px;">
                                    <span style="padding: 4px 10px; background: ${color}11; color: ${color}; border-radius: 6px; font-size: 10px; font-weight: 800; letter-spacing: 1px; text-transform: uppercase;">${icono} ${m.tipo_documento}</span>
                                    ${m.numero_documento ? `<span style="font-family: 'JetBrains Mono', monospace; font-size: 12px; font-weight: 700; color: #aaa;"># ${m.numero_documento}</span>` : ''}
                                </div>
                                <h4 style="margin: 0; font-size: 17px; font-weight: 800; color: #1a1a1a; letter-spacing: -0.4px;">${m.asunto || m.sumilla || 'Movimiento Procesal'}</h4>
                            </div>
                            <div style="text-align: right;">
                                <div style="font-family: 'JetBrains Mono', monospace; font-size: 12px; font-weight: 700; color: #000;">${fecha}</div>
                                <div style="font-size: 11px; color: #999; font-weight: 500;">${hora}</div>
                            </div>
                        </div>

                        ${m.descripcion ? `
                        <p style="font-size: 14px; color: #555; line-height: 1.6; margin: 15px 0; padding: 15px; background: #f9f9f9; border-radius: 12px; border-left: 3px solid ${color}33;">${m.descripcion}</p>
                        ` : ''}

                        <div style="display: flex; align-items: center; justify-content: space-between; margin-top: 15px; padding-top: 15px; border-top: 1px dashed #eee;">
                            <div style="display: flex; align-items: center; gap: 12px;">
                                <div style="width: 28px; height: 28px; border-radius: 50%; background: #f5f5f5; display: flex; align-items: center; justify-content: center; font-size: 14px; border: 1px solid #eee;">👤</div>
                                <div style="display: flex; flex-direction: column;">
                                    <span style="font-size: 12px; font-weight: 700; color: #333;">${m.presentado_por || m.usuario_nombre || 'Sistema'}</span>
                                    <span style="font-size: 10px; color: #999; text-transform: uppercase; letter-spacing: 0.5px;">${m.tipo_parte || 'Administrador'}</span>
                                </div>
                            </div>

                            <div style="display: flex; gap: 8px;">
                                <button onclick="TimelineManager.mostrarFormulario(${m.id})" style="background:none; border:none; color:#777; cursor:pointer; font-size:14px; padding:5px; transition:color 0.2s;" onmouseover="this.style.color='#d4af37'" onmouseout="this.style.color='#777'">✏️</button>
                                <button onclick="TimelineManager.eliminar(${m.id})" style="background:none; border:none; color:#777; cursor:pointer; font-size:14px; padding:5px; transition:color 0.2s;" onmouseover="this.style.color='#e74c3c'" onmouseout="this.style.color='#777'">🗑️</button>
                                ${m.tiene_documento || m.documento_archivo ? `
                                <a href="${m.documento_ruta || m.documento_archivo}" target="_blank" style="margin-left: 10px; display: flex; align-items: center; gap: 6px; color: var(--color-gold); text-decoration: none; font-size: 11px; font-weight: 800; padding: 6px 14px; background: #fffdf2; border: 1px solid rgba(212, 175, 55, 0.2); border-radius: 8px; transition: all 0.3s;" onmouseover="this.style.background='#d4af37'; this.style.color='#fff';" onmouseout="this.style.background='#fffdf2'; this.style.color='var(--color-gold)';">
                                    VER ANEXO
                                </a>
                                ` : ''}
                            </div>
                        </div>
                    </div>
                </div>`;
            }).join('')}
        </div>`;
    },


    // ── Formulario para crear/editar movimiento ──
    async mostrarFormulario(editId) {
        let data = {};
        if (editId) {
            const m = this.movimientos.find(x => x.id === editId);
            if (m) data = m;
        }

        const fmtDate = (d) => d ? new Date(d).toISOString().split('T')[0] : '';

        Swal.fire({
            title: editId ? '✏️ Editar Movimiento' : '📋 Nuevo Movimiento',
            width: 700,
            html: `
            <div style="text-align:left;font-size:13px">
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:14px">
                    <div>
                        <label style="font-weight:600;display:block;margin-bottom:4px">Tipo de Documento *</label>
                        <select id="tl_tipo_documento" class="swal2-input" style="width:100%;margin:0;font-size:13px">
                            <option value="">Seleccionar...</option>
                            ${['Resolución','Decreto','Carta','Escrito','Oficio','Acta','Auto','Cédula','Otro'].map(t => `<option value="${t}" ${data.tipo_documento===t?'selected':''}>${t}</option>`).join('')}
                        </select>
                    </div>
                    <div>
                        <label style="font-weight:600;display:block;margin-bottom:4px">Número Documento</label>
                        <input id="tl_numero_documento" class="swal2-input" style="width:100%;margin:0;font-size:13px" value="${data.numero_documento||''}" placeholder="Ej: RES N° 001-2026">
                    </div>
                </div>
                <div style="margin-bottom:14px">
                    <label style="font-weight:600;display:block;margin-bottom:4px">Asunto</label>
                    <input id="tl_asunto" class="swal2-input" style="width:100%;margin:0;font-size:13px" value="${data.asunto||''}" placeholder="Descripción breve del movimiento">
                </div>
                <div style="margin-bottom:14px">
                    <label style="font-weight:600;display:block;margin-bottom:4px">Sumilla</label>
                    <textarea id="tl_sumilla" class="swal2-textarea" style="width:100%;margin:0;font-size:13px;height:60px" placeholder="Detalle adicional">${data.sumilla||''}</textarea>
                </div>
                <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:12px;margin-bottom:14px">
                    <div>
                        <label style="font-weight:600;display:block;margin-bottom:4px">Fecha Documento *</label>
                        <input type="date" id="tl_fecha_documento" class="swal2-input" style="width:100%;margin:0;font-size:13px" value="${fmtDate(data.fecha_documento)}">
                    </div>
                    <div>
                        <label style="font-weight:600;display:block;margin-bottom:4px">Fecha Presentación</label>
                        <input type="date" id="tl_fecha_presentacion" class="swal2-input" style="width:100%;margin:0;font-size:13px" value="${fmtDate(data.fecha_presentacion)}">
                    </div>
                    <div>
                        <label style="font-weight:600;display:block;margin-bottom:4px">Fecha Emisión</label>
                        <input type="date" id="tl_fecha_emision" class="swal2-input" style="width:100%;margin:0;font-size:13px" value="${fmtDate(data.fecha_emision)}">
                    </div>
                </div>
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:14px">
                    <div>
                        <label style="font-weight:600;display:block;margin-bottom:4px">Presentado por</label>
                        <input id="tl_presentado_por" class="swal2-input" style="width:100%;margin:0;font-size:13px" value="${data.presentado_por||''}" placeholder="Nombre de la parte">
                    </div>
                    <div>
                        <label style="font-weight:600;display:block;margin-bottom:4px">Tipo Parte</label>
                        <select id="tl_tipo_parte" class="swal2-input" style="width:100%;margin:0;font-size:13px">
                            <option value="">Seleccionar...</option>
                            ${['demandante','demandado','tribunal','secretaria','perito','otro'].map(t => `<option value="${t}" ${data.tipo_parte===t?'selected':''}>${t.charAt(0).toUpperCase()+t.slice(1)}</option>`).join('')}
                        </select>
                    </div>
                </div>
                <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:12px;margin-bottom:14px">
                    <div>
                        <label style="font-weight:600;display:block;margin-bottom:4px">Notif. Virtual</label>
                        <input type="date" id="tl_notif_virtual" class="swal2-input" style="width:100%;margin:0;font-size:13px" value="${fmtDate(data.fecha_notificacion_virtual)}">
                    </div>
                    <div>
                        <label style="font-weight:600;display:block;margin-bottom:4px">Notif. Física</label>
                        <input type="date" id="tl_notif_fisica" class="swal2-input" style="width:100%;margin:0;font-size:13px" value="${fmtDate(data.fecha_notificacion_fisica)}">
                    </div>
                    <div>
                        <label style="font-weight:600;display:block;margin-bottom:4px">Forma Entrega</label>
                        <select id="tl_forma_entrega" class="swal2-input" style="width:100%;margin:0;font-size:13px">
                            <option value="">Seleccionar...</option>
                            ${['Electrónica','Física','Mixta','Edicto'].map(t => `<option value="${t}" ${data.forma_entrega===t?'selected':''}>${t}</option>`).join('')}
                        </select>
                    </div>
                </div>
                <div style="margin-bottom:14px">
                    <label style="font-weight:600;display:block;margin-bottom:4px">Destinatario Notificación</label>
                    <input id="tl_destinatario" class="swal2-input" style="width:100%;margin:0;font-size:13px" value="${data.destinatario_notificacion||''}" placeholder="A quién se notifica">
                </div>
                ${!editId ? `<div style="margin-bottom:14px">
                    <label style="font-weight:600;display:block;margin-bottom:4px">📎 Documento Adjunto (PDF/DOC)</label>
                    <input type="file" id="tl_documento" accept=".pdf,.doc,.docx,.jpg,.jpeg,.png" style="font-size:13px">
                </div>` : ''}
                <div>
                    <label style="font-weight:600;display:block;margin-bottom:4px">Observaciones</label>
                    <textarea id="tl_observaciones" class="swal2-textarea" style="width:100%;margin:0;font-size:13px;height:50px">${data.observaciones||''}</textarea>
                </div>
            </div>`,
            showCancelButton: true,
            confirmButtonText: editId ? '💾 Guardar Cambios' : '💾 Crear Movimiento',
            cancelButtonText: 'Cancelar',
            confirmButtonColor: '#d4af37',
            preConfirm: () => {
                const tipo = document.getElementById('tl_tipo_documento').value;
                const fecha = document.getElementById('tl_fecha_documento').value;
                if (!tipo || !fecha) { Swal.showValidationMessage('Tipo de documento y fecha son obligatorios'); return false; }
                return true;
            }
        }).then(async (result) => {
            if (!result.isConfirmed) return;
            await this.guardar(editId);
        });
    },

    // ── Guardar (crear o editar) ──
    async guardar(editId) {
        try {
            const formData = new FormData();
            formData.append('tipo_documento', document.getElementById('tl_tipo_documento').value);
            formData.append('numero_documento', document.getElementById('tl_numero_documento').value);
            formData.append('asunto', document.getElementById('tl_asunto').value);
            formData.append('sumilla', document.getElementById('tl_sumilla').value);
            formData.append('fecha_documento', document.getElementById('tl_fecha_documento').value);
            formData.append('fecha_presentacion', document.getElementById('tl_fecha_presentacion').value);
            formData.append('fecha_emision', document.getElementById('tl_fecha_emision').value);
            formData.append('presentado_por', document.getElementById('tl_presentado_por').value);
            formData.append('tipo_parte', document.getElementById('tl_tipo_parte').value);
            formData.append('fecha_notificacion_virtual', document.getElementById('tl_notif_virtual').value);
            formData.append('fecha_notificacion_fisica', document.getElementById('tl_notif_fisica').value);
            formData.append('forma_entrega', document.getElementById('tl_forma_entrega').value);
            formData.append('destinatario_notificacion', document.getElementById('tl_destinatario').value);
            formData.append('observaciones', document.getElementById('tl_observaciones').value);

            const userData = await getSecureItem('userData');
            if (userData?.id) formData.append(editId ? 'actualizado_por' : 'creado_por', userData.id);

            const fileInput = document.getElementById('tl_documento');
            if (fileInput?.files?.[0]) formData.append('documento', fileInput.files[0]);

            const token = await getSecureItem('authToken');
            const url = editId ? `/api/timeline/${editId}` : `/api/${this.currentFuente}/${this.currentId}/timeline`;
            const method = editId ? 'PUT' : 'POST';

            const res = await fetch(url, { method, headers: { 'Authorization': `Bearer ${token}` }, body: formData });
            const data = await res.json();

            if (data.success) {
                Swal.fire({ icon:'success', title: editId ? 'Actualizado' : 'Creado', text: data.message, timer:1500, showConfirmButton:false, background:'#fff', confirmButtonColor:'#d4af37' });
                await this.cargar();
                const body = document.getElementById('timeline-body');
                if (body) body.innerHTML = this.renderMovimientos();
            } else {
                Swal.fire({ icon:'error', title:'Error', text: data.error || 'No se pudo guardar' });
            }
        } catch (e) {
            console.error('Error guardando timeline:', e);
            Swal.fire({ icon:'error', title:'Error', text:'Error de conexión' });
        }
    },

    // ── Eliminar movimiento ──
    async eliminar(id) {
        const confirm = await Swal.fire({
            title: '¿Eliminar movimiento?',
            text: 'Esta acción no se puede deshacer.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#e74c3c',
            cancelButtonText: 'Cancelar',
            confirmButtonText: 'Sí, eliminar'
        });

        if (!confirm.isConfirmed) return;

        try {
            const token = await getSecureItem('authToken');
            const res = await fetch(`/api/timeline/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({ usuario_id: (await getSecureItem('userData'))?.id })
            });
            const data = await res.json();
            if (data.success) {
                await this.cargar();
                const body = document.getElementById('timeline-body');
                if (body) body.innerHTML = this.renderMovimientos();
                Swal.fire({ icon:'success', title:'Eliminado', timer:1200, showConfirmButton:false });
            }
        } catch (e) {
            console.error('Error eliminando:', e);
        }
    }
};

// Exponer globalmente
window.TimelineManager = TimelineManager;
