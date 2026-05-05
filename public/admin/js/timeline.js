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
        this.currentFuente = fuente;
        this.currentId = id;
        await this.cargar();
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
    renderMovimientos() {
        if (!this.movimientos.length) {
            return `<div style="text-align: center; padding: 100px 0; color: #ccc;">
                <p style="font-size: 15px; font-weight: 500;">No hay historial de movimientos disponible.</p>
            </div>`;
        }

        const colores = { 'Resolución':'#e74c3c', 'Decreto':'#3498db', 'Carta':'#2ecc71', 'Escrito':'#9b59b6', 'Oficio':'#e67e22', 'Acta':'#1abc9c', 'Auto':'#34495e', 'Cédula':'#f39c12' };

        return this.movimientos.map((m, i) => {
            const color = colores[m.tipo_documento] || '#d4af37';
            const fecha = m.fecha_documento ? new Date(m.fecha_documento).toLocaleDateString('es-PE', { day:'2-digit', month:'short', year:'numeric' }) : '—';

            return `
            <div style="display: flex; gap: 35px; position: relative; margin-bottom: 0;">
                <!-- Eje de Diferenciación Visual -->
                <div style="display: flex; flex-direction: column; align-items: center; width: 24px; position: relative;">
                    <!-- Punto de Unión con Sombra -->
                    <div style="width: 12px; height: 12px; border-radius: 50%; background: #fff; border: 3px solid ${color}; margin-top: 6px; z-index: 3; box-shadow: 0 0 0 4px #fff;"></div>
                    
                    <!-- Línea Conectora Dinámica -->
                    ${i < this.movimientos.length-1 ? `
                        <div style="width: 2px; flex: 1; background: linear-gradient(to bottom, ${color} 0%, #f0f0f0 100%); z-index: 1; opacity: 0.6; margin: 5px 0;"></div>
                    ` : ''}
                </div>

                <!-- Contenedor de Movimiento con Acento Lateral -->
                <div style="flex: 1; padding-bottom: 50px; position: relative;">
                    <!-- Barra de acento lateral sutil para agrupar el movimiento -->
                    <div style="position: absolute; left: -35px; top: 25px; bottom: 50px; width: 2px; background: ${color}; opacity: 0.08; border-radius: 2px;"></div>

                    <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px;">
                        <div style="display: flex; align-items: center; gap: 15px;">
                            <span style="font-size: 11px; font-weight: 800; color: ${color}; text-transform: uppercase; letter-spacing: 1.2px; background: ${color}08; padding: 4px 12px; border-radius: 6px; border: 1px solid ${color}15;">${m.tipo_documento}</span>
                            <span style="font-size: 13px; color: #999; font-weight: 500;">${fecha}</span>
                            ${m.numero_documento ? `<span style="font-size: 13px; color: #1a1a1a; font-weight: 800; font-family: 'JetBrains Mono', monospace;"># ${m.numero_documento}</span>` : ''}
                        </div>
                        <div style="display: flex; gap: 8px;">
                            <!-- Botones de Acción Visibles y Profesionales -->
                            <button onclick="TimelineManager.mostrarFormulario(${m.id})" 
                                    style="background: #f8f9fa; border: 1px solid #e9ecef; padding: 6px 12px; border-radius: 8px; cursor: pointer; color: #495057; font-size: 11px; font-weight: 700; display: flex; align-items: center; gap: 6px; transition: all 0.2s;"
                                    onmouseover="this.style.background='#fff'; this.style.borderColor='#dee2e6'; this.style.boxShadow='0 2px 5px rgba(0,0,0,0.05)';" onmouseout="this.style.background='#f8f9fa'; this.style.borderColor='#e9ecef'; this.style.boxShadow='none';">
                                <span>✏️</span> EDITAR
                            </button>
                            <button onclick="TimelineManager.eliminar(${m.id})" 
                                    style="background: #fff5f5; border: 1px solid #ffe3e3; padding: 6px 12px; border-radius: 8px; cursor: pointer; color: #e03131; font-size: 11px; font-weight: 700; display: flex; align-items: center; gap: 6px; transition: all 0.2s;"
                                    onmouseover="this.style.background='#fff'; this.style.borderColor='#ffc9c9'; this.style.boxShadow='0 2px 5px rgba(224, 49, 49, 0.1)';" onmouseout="this.style.background='#fff5f5'; this.style.borderColor='#ffe3e3'; this.style.boxShadow='none';">
                                <span>🗑️</span> ELIMINAR
                            </button>
                        </div>
                    </div>

                    <div style="padding-left: 2px;">
                        ${m.asunto ? `<h4 style="font-size: 17px; font-weight: 800; color: #1a1a1a; margin: 0 0 6px 0; letter-spacing: -0.3px;">${m.asunto}</h4>` : ''}
                        ${m.sumilla ? `<p style="font-size: 14px; color: #555; line-height: 1.6; margin: 0 0 15px 0; font-weight: 400;">${m.sumilla}</p>` : ''}
                        
                        <div style="display: flex; flex-wrap: wrap; gap: 20px; font-size: 12px; color: #777; align-items: center;">
                            ${m.presentado_por ? `<span style="display: flex; align-items: center; gap: 8px;"><span style="color: #ccc;">•</span> 👤 <strong style="color: #444;">${m.presentado_por}</strong> <small style="color: #aaa;">(${m.tipo_parte || 'Parte'})</small></span>` : ''}
                            ${m.tiene_documento ? `<a href="${m.documento_ruta}" target="_blank" style="color: var(--color-gold); text-decoration: none; font-weight: 800; display: flex; align-items: center; gap: 8px; background: #fffdf2; padding: 4px 12px; border-radius: 8px; border: 1px solid rgba(212, 175, 55, 0.1);">📎 VER ANEXO</a>` : ''}
                        </div>

                        ${(m.fecha_notificacion_virtual || m.fecha_notificacion_fisica || m.destinatario_notificacion) ? `
                        <div style="margin-top: 20px; padding: 15px 20px; background: #fcfcfc; border-radius: 12px; border-left: 3px solid #eee; font-size: 12px; color: #666; display: flex; flex-direction: column; gap: 5px;">
                            <span style="font-weight: 800; color: #000; text-transform: uppercase; font-size: 10px; letter-spacing: 1px; margin-bottom: 2px;">Notificación Procesal</span>
                            <div style="display: flex; gap: 15px; flex-wrap: wrap;">
                                ${m.fecha_notificacion_virtual ? `<span><strong>Virtual:</strong> ${new Date(m.fecha_notificacion_virtual).toLocaleDateString('es-PE')}</span>` : ''}
                                ${m.fecha_notificacion_fisica ? `<span><strong>Física:</strong> ${new Date(m.fecha_notificacion_fisica).toLocaleDateString('es-PE')}</span>` : ''}
                                ${m.destinatario_notificacion ? `<span><strong>Destinatario:</strong> ${m.destinatario_notificacion}</span>` : ''}
                            </div>
                        </div>` : ''}
                    </div>
                    
                    ${i < this.movimientos.length - 1 ? `<div style="margin-top: 40px; height: 1px; background: linear-gradient(to right, #f0f0f0, transparent); width: 100%;"></div>` : ''}
                </div>
            </div>`;
        }).join('');
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
