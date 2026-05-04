/**
 * Utilidades Generales
 * Funciones auxiliares compartidas por todos los módulos
 */

// Función para obtener icono de archivo
function obtenerIconoArchivo(tipo) {
    if (tipo.includes('pdf')) return '📄';
    if (tipo.includes('image')) return '🖼️';
    if (tipo.includes('word') || tipo.includes('document')) return '📝';
    if (tipo.includes('excel') || tipo.includes('spreadsheet')) return '📊';
    if (tipo.includes('powerpoint') || tipo.includes('presentation')) return '📋';
    if (tipo.includes('zip') || tipo.includes('rar')) return '🗜️';
    if (tipo.includes('video')) return '🎥';
    if (tipo.includes('audio')) return '🎵';
    return '📎';
}

// Función para obtener tipo de archivo
function obtenerTipoArchivo(tipo) {
    if (tipo.includes('pdf')) return 'PDF';
    if (tipo.includes('jpeg') || tipo.includes('jpg')) return 'JPEG';
    if (tipo.includes('png')) return 'PNG';
    if (tipo.includes('gif')) return 'GIF';
    if (tipo.includes('word')) return 'Word';
    if (tipo.includes('excel')) return 'Excel';
    if (tipo.includes('powerpoint')) return 'PowerPoint';
    if (tipo.includes('zip')) return 'ZIP';
    if (tipo.includes('rar')) return 'RAR';
    return 'Archivo';
}

// Función para formatear tamaño de archivo
function formatearTamano(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Función para mostrar imagen en modal
function mostrarImagenModal(nombreImagen) {
    alert(`🖼️ Visualizador de imágenes\n\nMostrando: ${nombreImagen}\n\nEn un sistema real, aquí se mostraría la imagen en un visor especializado.`);
}

// Función para obtener clase de estado
function getStatusClass(estado) {
    switch(estado?.toLowerCase()) {
        case 'activo':
        case 'aprobado':
        case 'completado':
            return 'status-active';
        case 'pendiente':
        case 'en proceso':
            return 'status-pending';
        case 'inactivo':
        case 'rechazado':
        case 'cancelado':
            return 'status-inactive';
        default:
            return 'status-pending';
    }
}

// Función para cambiar sección
function showSection(sectionId, el) {
    // Alternar secciones
    document.querySelectorAll('.content-section').forEach(s => s.classList.remove('active'));
    const target = document.getElementById(sectionId);
    if (target) target.classList.add('active');

    // Marcar item activo del menú
    document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
    if (el) el.classList.add('active');

    // Cargas perezosas
    if (sectionId === 'solicitudes') {
        if (typeof window.cargarTablaSolicitudes === 'function') {
            window.cargarTablaSolicitudes();
        } else if (typeof window.refreshSolicitudesTable === 'function') {
            window.refreshSolicitudesTable();
        }
    } else if (sectionId === 'expedientes') {
        if (typeof window.cargarExpedientesTabla === 'function') {
            window.cargarExpedientesTabla();
        }
    } else if (sectionId === 'casilla' && typeof window.cargarCasillaElectronicaAdmin === 'function') {
        window.cargarCasillaElectronicaAdmin();
    }
}

// Función para cerrar modal genérico
function closeModal() {
    const modals = document.querySelectorAll('.modal, .modal-overlay, .expediente-modal');
    modals.forEach(modal => {
        modal.style.display = 'none';
        modal.classList.remove('show');
    });
}

// Función para logout
function logout() {
    if (confirm('¿Está seguro de cerrar sesión?')) {
        sessionStorage.removeItem('authToken');
        sessionStorage.removeItem('userData');
        window.location.href = 'login.html';
    }
}

// Función para toggle del menú de usuario
function toggleUserMenu() {
    // Implementar menú desplegable de usuario si es necesario
    console.log('Toggle user menu');
}

// Exportar funciones para uso global
if (typeof window !== 'undefined') {
    window.obtenerIconoArchivo = obtenerIconoArchivo;
    window.obtenerTipoArchivo = obtenerTipoArchivo;
    window.formatearTamano = formatearTamano;
    window.mostrarImagenModal = mostrarImagenModal;
    window.getStatusClass = getStatusClass;
    window.showSection = showSection;
    window.closeModal = closeModal;
    window.logout = logout;
    window.toggleUserMenu = toggleUserMenu;
}
