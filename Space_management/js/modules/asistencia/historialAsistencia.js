// js/modules/asistencia/historialAsistencia.js
// Versión 2.0 - CORREGIDA

console.log('🔄 Cargando módulo historialAsistencia.js...');

const HistorialAsistencia = (function() {
    
    /**
     * Renderiza la tabla de historial
     */
    function renderizarHistorial() {
        console.log('📋 Renderizando historial de asistencias...');
        
        const tbody = document.getElementById('cuerpoTablaHistorial');
        if (!tbody) {
            console.warn('⚠️ Tabla de historial no encontrada');
            return;
        }
        
        // USAR LA FUNCIÓN CORRECTA: filtrarAsistencias (AHORA SÍ EXISTE)
        const asistencias = typeof AsistenciaData !== 'undefined' ? 
            AsistenciaData.filtrarAsistencias() : [];
        
        console.log(`📊 ${asistencias.length} asistencias encontradas`);
        
        if (asistencias.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" class="text-center">No hay asistencias registradas</td></tr>';
            return;
        }
        
        let html = '';
        asistencias.forEach(asist => {
            const presentes = asist.registros?.filter(r => r.asistio).length || 0;
            const ausentes = (asist.registros?.length || 0) - presentes;
            const porcentaje = (asist.registros?.length || 0) > 0 ? 
                Math.round((presentes / asist.registros.length) * 100) : 0;
            
            html += `
                <tr>
                    <td>${asist.fecha}</td>
                    <td>${asist.curso}</td>
                    <td>${asist.docente?.nombre || 'N/A'}</td>
                    <td>${asist.registros?.length || 0}</td>
                    <td>
                        <span class="badge bg-success">${presentes} presentes</span>
                        <span class="badge bg-danger">${ausentes} ausentes</span>
                        <span class="badge bg-info">${porcentaje}%</span>
                    </td>
                    <td>
                        <button class="btn btn-sm btn-primary" onclick="HistorialAsistencia.verDetalle('${asist.id}')">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="btn btn-sm btn-danger" onclick="HistorialAsistencia.eliminar('${asist.id}')">
                            <i class="fas fa-trash"></i>
                        </button>
                    </td>
                </tr>
            `;
        });
        
        tbody.innerHTML = html;
    }

    /**
     * Muestra detalle de una asistencia
     */
    function verDetalle(id) {
        const asistencias = AsistenciaData.obtenerTodasAsistencias();
        const asist = asistencias.find(a => a.id == id);
        
        if (!asist) {
            Swal.fire('Error', 'Registro no encontrado', 'error');
            return;
        }
        
        let html = `
            <div style="max-height: 400px; overflow-y: auto;">
                <h6>📅 Fecha: ${asist.fecha} - Curso ${asist.curso}</h6>
                <p>👨‍🏫 Docente: ${asist.docente?.nombre || 'N/A'} (${asist.docente?.materia || 'N/A'})</p>
                <table class="table table-sm table-striped">
                    <thead>
                        <tr>
                            <th>Estudiante</th>
                            <th>Asistió</th>
                            <th>Uniforme</th>
                            <th>Observaciones</th>
                        </tr>
                    </thead>
                    <tbody>
        `;
        
        asist.registros?.forEach(r => {
            html += `
                <tr>
                    <td>${r.nombre}</td>
                    <td class="text-center">${r.asistio ? '✅' : '❌'}</td>
                    <td class="text-center">${r.uniforme ? '✅' : '❌'}</td>
                    <td>${r.observaciones || ''}</td>
                </tr>
            `;
        });
        
        html += '</tbody></table></div>';
        
        Swal.fire({
            title: 'Detalle de Asistencia',
            html: html,
            width: '800px',
            confirmButtonText: 'Cerrar'
        });
    }

    /**
     * Elimina un registro de asistencia
     */
    function eliminar(id) {
        Swal.fire({
            title: '¿Eliminar registro?',
            text: 'Esta acción no se puede deshacer',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar'
        }).then((result) => {
            if (result.isConfirmed) {
                if (AsistenciaData.eliminarAsistencia(id)) {
                    renderizarHistorial();
                    Swal.fire({
                        icon: 'success',
                        title: 'Eliminado',
                        text: 'El registro ha sido eliminado',
                        timer: 1500,
                        showConfirmButton: false
                    });
                }
            }
        });
    }

    // API pública
    return {
        renderizarHistorial,
        verDetalle,
        eliminar
    };
})();

console.log('✅ Módulo HistorialAsistencia v2.0 cargado');
window.HistorialAsistencia = HistorialAsistencia;