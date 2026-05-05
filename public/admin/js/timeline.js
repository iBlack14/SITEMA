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

    // ── Render del modal completo ──
    renderModal(titulo) {
        let overlay = document.getElementById('timeline-overlay');
        if (overlay) overlay.remove();

        overlay = document.createElement('div');
        overlay.id = 'timeline-overlay';
        overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.6);z-index:30000;display:flex;align-items:center;justify-content:center;backdrop-filter:blur(4px);animation:fadeIn .2s ease';
        overlay.onclick = (e) => { if (e.target === overlay) overlay.remove(); };

        const count = this.movimientos.length;
        overlay.innerHTML = `
        <div style="background:#fff;border-radius:20px;width:95%;max-width:900px;max-height:90vh;display:flex;flex-direction:column;box-shadow:0 30px 80px rgba(0,0,0,0.3);overflow:hidden">
            <div style="padding:28px 35px;background:linear-gradient(135deg,#1a1a1a,#2a2a2a);color:#fff;display:flex;justify-content:space-between;align-items:center">
                <div>
                    <h2 style="font-size:20px;font-weight:700;margin:0">📋 ${titulo}</h2>
                    <p style="font-size:13px;color:#aaa;margin-top:4px">${count} movimiento${count!==1?'s':''} registrado${count!==1?'s':''}</p>
                </div>
                <div style="display:flex;gap:10px">
                    <button onclick="TimelineManager.mostrarFormulario()" style="background:linear-gradient(135deg,#d4af37,#f1d582);color:#1a1a1a;border:none;padding:10px 20px;border-radius:10px;font-weight:700;cursor:pointer;font-size:13px">+ Agregar Movimiento</button>
                    <button onclick="document.getElementById('timeline-overlay').remove()" style="background:rgba(255,255,255,0.1);color:#fff;border:1px solid rgba(255,255,255,0.2);padding:10px 18px;border-radius:10px;cursor:pointer;font-size:13px">✕ Cerrar</button>
                </div>
            </div>
            <div id="timeline-body" style="padding:25px 35px;overflow-y:auto;flex:1">
                ${this.renderMovimientos()}
            </div>
        </div>`;

        document.body.appendChild(overlay);
    },

    // ── Render de la lista de movimientos ──
    renderMovimientos() {
        if (!this.movimientos.length) {
            return `<div style="text-align:center;padding:60px 20px;color:#999">
                <div style="font-size:48px;margin-bottom:15px">📭</div>
                <p style="font-size:16px;font-weight:600">No hay movimientos registrados</p>
                <p style="font-size:13px;margin-top:8px">Haz click en "+ Agregar Movimiento" para crear el primero.</p>
            </div>`;
        }

        const colores = { 'Resolución':'#e74c3c', 'Decreto':'#3498db', 'Carta':'#2ecc71', 'Escrito':'#9b59b6', 'Oficio':'#e67e22', 'Acta':'#1abc9c', 'Auto':'#34495e', 'Cédula':'#f39c12' };

        return this.movimientos.map((m, i) => {
            const color = colores[m.tipo_documento] || '#d4af37';
            const fecha = m.fecha_documento ? new Date(m.fecha_documento).toLocaleDateString('es-PE', { day:'2-digit', month:'short', year:'numeric' }) : '—';
            const notifV = m.fecha_notificacion_virtual ? new Date(m.fecha_notificacion_virtual).toLocaleDateString('es-PE',{day:'2-digit',month:'short'}) : null;
            const notifF = m.fecha_notificacion_fisica ? new Date(m.fecha_notificacion_fisica).toLocaleDateString('es-PE',{day:'2-digit',month:'short'}) : null;

            return `
            <div style="display:flex;gap:20px;margin-bottom:${i<this.movimientos.length-1?'0':'0'}px;position:relative">
                <div style="display:flex;flex-direction:column;align-items:center;min-width:40px">
                    <div style="width:14px;height:14px;border-radius:50%;background:${color};border:3px solid ${color}33;flex-shrink:0;z-index:1"></div>
                    ${i < this.movimientos.length-1 ? '<div style="width:2px;flex:1;background:linear-gradient(to bottom,'+color+'44,#eee);min-height:30px"></div>' : ''}
                </div>
                <div style="flex:1;background:#fafafa;border:1px solid #eee;border-radius:14px;padding:18px 22px;margin-bottom:16px;transition:all .2s;border-left:4px solid ${color}" onmouseover="this.style.boxShadow='0 4px 15px rgba(0,0,0,0.08)'" onmouseout="this.style.boxShadow='none'">
                    <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:8px">
                        <div>
                            <span style="background:${color}18;color:${color};padding:3px 10px;border-radius:6px;font-size:11px;font-weight:700;text-transform:uppercase">${m.tipo_documento}</span>
                            <span style="color:#999;font-size:12px;margin-left:10px">${fecha}</span>
                            ${m.numero_documento ? `<span style="color:#666;font-size:12px;margin-left:8px;font-weight:600">${m.numero_documento}</span>` : ''}
                        </div>
                        <div style="display:flex;gap:6px">
                            <button onclick="TimelineManager.mostrarFormulario(${m.id})" style="background:#f0f0f0;border:none;padding:5px 10px;border-radius:6px;cursor:pointer;font-size:11px" title="Editar">✏️</button>
                            <button onclick="TimelineManager.eliminar(${m.id})" style="background:#fee;border:none;padding:5px 10px;border-radius:6px;cursor:pointer;font-size:11px" title="Eliminar">🗑️</button>
                        </div>
                    </div>
                    ${m.asunto ? `<p style="font-weight:600;font-size:14px;color:#1a1a1a;margin-bottom:6px">${m.asunto}</p>` : ''}
                    ${m.sumilla ? `<p style="font-size:13px;color:#555;margin-bottom:8px">${m.sumilla}</p>` : ''}
                    <div style="display:flex;flex-wrap:wrap;gap:12px;font-size:12px;color:#777">
                        ${m.presentado_por ? `<span>👤 ${m.presentado_por}${m.tipo_parte ? ' <em>('+m.tipo_parte+')</em>' : ''}</span>` : ''}
                        ${m.tiene_documento ? `<a href="${m.documento_ruta}" target="_blank" style="color:#d4af37;text-decoration:none;font-weight:600">📎 ${m.documento_nombre || 'Documento'}</a>` : ''}
                    </div>
                    ${(notifV || notifF || m.destinatario_notificacion) ? `
                    <div style="margin-top:10px;padding-top:10px;border-top:1px dashed #ddd;font-size:12px;color:#888;display:flex;flex-wrap:wrap;gap:12px">
                        📬 <strong>Notificación:</strong>
                        ${notifV ? `Virtual: ${notifV}` : ''} ${notifF ? `| Física: ${notifF}` : ''}
                        ${m.forma_entrega ? `| ${m.forma_entrega}` : ''}
                        ${m.destinatario_notificacion ? `→ ${m.destinatario_notificacion}` : ''}
                    </div>` : ''}
                    ${m.observaciones ? `<p style="margin-top:8px;font-size:12px;color:#999;font-style:italic">💬 ${m.observaciones}</p>` : ''}
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
