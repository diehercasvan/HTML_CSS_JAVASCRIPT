// js/modules/asistencia/historialAsistencia.js
// Versión 2.1 - CON BOTÓN PDF

console.log('🔄 Cargando módulo historialAsistencia.js...');

const HistorialAsistencia = (function () {



    /**
     * Renderiza la tabla de historial (VERSIÓN CORREGIDA)
     */
    function renderizarHistorial() {
        console.log('📋 ===== RENDERIZANDO HISTORIAL =====');

        const tbody = document.getElementById('cuerpoTablaHistorial');
        if (!tbody) {
            console.error('❌ Tabla de historial no encontrada');
            return;
        }

        // FORZAR OBTENER DATOS FRESCOS
        console.log('🔄 Obteniendo datos actualizados...');
        const asistencias = AsistenciaData.obtenerTodasAsistencias();

        console.log(`📊 Asistencias encontradas: ${asistencias.length}`);
        console.log('📋 Datos:', asistencias);

        if (asistencias.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" class="text-center">No hay asistencias registradas</td></tr>';
            console.log('✅ Tabla actualizada (vacía)');
            return;
        }

        let html = '';
        asistencias.forEach(asist => {
            const total = asist.registros?.length || 0;
            const presentes = asist.registros?.filter(r => r.asistio).length || 0;
            const ausentes = total - presentes;
            const porcentaje = total > 0 ? Math.round((presentes / total) * 100) : 0;

            html += `
            <tr>
                <td>${asist.fecha}</td>
                <td>${asist.curso}</td>
                <td>${asist.docente?.nombre || 'N/A'}</td>
                <td>${total}</td>
                <td>
                    <span class="badge bg-success">${presentes} presentes</span>
                    <span class="badge bg-danger">${ausentes} ausentes</span>
                    <span class="badge bg-info">${porcentaje}%</span>
                </td>
                <td>
                    <div class="btn-group" role="group">
                        <button class="btn btn-sm btn-primary" onclick="HistorialAsistencia.verDetalle('${asist.id}')" title="Ver detalle">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="btn btn-sm btn-danger" onclick="HistorialAsistencia.generarPDF('${asist.id}')" title="Generar PDF">
                            <i class="fas fa-file-pdf"></i>
                        </button>
                        <button class="btn btn-sm btn-warning" onclick="HistorialAsistencia.eliminar('${asist.id}')" title="Eliminar">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `;
        });

        tbody.innerHTML = html;
        console.log(`✅ Tabla actualizada con ${asistencias.length} registros`);
    }

    // Exponer función globalmente para pruebas
    window.recargarHistorial = function () {
        console.log('🔄 Recargando historial manualmente...');
        renderizarHistorial();
    };

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
     * Genera PDF a partir de un registro del historial
     */
    function generarPDF(id) {
        console.log('📄 Generando PDF desde historial:', id);

        const asistencias = AsistenciaData.obtenerTodasAsistencias();
        const asist = asistencias.find(a => a.id == id);

        if (!asist) {
            Swal.fire('Error', 'Registro no encontrado', 'error');
            return;
        }

        // Usar la función del reporte pasando los datos directamente
        if (typeof ReporteAsistenciaPDF !== 'undefined') {
            ReporteAsistenciaPDF.generarReporteDesdeHistorial(asist);
        } else {
            Swal.fire('Error', 'Módulo de reportes no disponible', 'error');
        }
    }

    /**
  * Eliminar un registro (VERSIÓN CORREGIDA CON RECARGA AUTOMÁTICA)
  */
    function eliminar(id) {
        console.log('🗑️ Eliminando asistencia:', id);

        const asistencias = AsistenciaData.obtenerTodasAsistencias();
        const asistencia = asistencias.find(a => a.id == id);

        if (!asistencia) {
            Swal.fire('Error', 'Registro no encontrado', 'error');
            return;
        }

        Swal.fire({
            title: '¿Eliminar registro?',
            html: `
            <p><strong>Fecha:</strong> ${asistencia.fecha}</p>
            <p><strong>Curso:</strong> ${asistencia.curso}</p>
            <p><strong>Docente:</strong> ${asistencia.docente?.nombre || 'N/A'}</p>
        `,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar'
        }).then((result) => {
            if (result.isConfirmed) {
                // Mostrar carga
                Swal.fire({
                    title: 'Eliminando...',
                    allowOutsideClick: false,
                    didOpen: () => Swal.showLoading()
                });

                const eliminado = AsistenciaData.eliminarAsistencia(id);

                if (eliminado) {
                    console.log('✅ Registro eliminado, recargando tabla...');

                    // Cerrar modal de carga
                    Swal.close();

                    // RECARGAR TABLA INMEDIATAMENTE
                    renderizarHistorial();

                    // Mostrar éxito
                    Swal.fire({
                        icon: 'success',
                        title: 'Eliminado',
                        text: 'El registro ha sido eliminado',
                        timer: 1500,
                        showConfirmButton: false
                    });
                } else {
                    Swal.fire({
                        icon: 'error',
                        title: 'Error',
                        text: 'No se pudo eliminar'
                    });
                }
            }
        });
    }

    return {
        renderizarHistorial,
        verDetalle,
        generarPDF,
        eliminar
    };
})();

console.log('✅ Módulo HistorialAsistencia v2.1 cargado');
window.HistorialAsistencia = HistorialAsistencia;
// Ejecutar en consola para diagnosticar
window.diagnosticarEliminacion = function () {
    console.log('=== DIAGNÓSTICO DE ELIMINACIÓN ===');

    // 1. Verificar función eliminarAsistencia
    console.log('eliminarAsistencia existe:', typeof AsistenciaData.eliminarAsistencia === 'function');

    // 2. Verificar asistencias actuales
    const asistencias = AsistenciaData.obtenerTodasAsistencias();
    console.log('Total asistencias:', asistencias.length);
    console.log('IDs disponibles:', asistencias.map(a => ({ id: a.id, fecha: a.fecha })));

    // 3. Probar eliminación manual (comentado por seguridad)
    // if (asistencias.length > 0) {
    //     const idPrueba = asistencias[0].id;
    //     console.log('Probando eliminar ID:', idPrueba);
    //     const resultado = AsistenciaData.eliminarAsistencia(idPrueba);
    //     console.log('Resultado:', resultado);
    // }

    return 'Diagnóstico completado';
};
// Ejecutar en consola para forzar actualización manual
window.forzarActualizacionHistorial = function () {
    console.log('🔄 Forzando actualización del historial...');
    HistorialAsistencia.renderizarHistorial();
};

// Verificar datos actuales
window.verificarDatosHistorial = function () {
    console.log('=== DATOS EN MEMORIA ===');
    const asistencias = AsistenciaData.obtenerTodasAsistencias();
    console.log(asistencias);

    console.log('=== DATOS EN LOCALSTORAGE ===');
    const saved = localStorage.getItem('gestionSalones');
    if (saved) {
        const parsed = JSON.parse(saved);
        console.log(parsed.asistencia);
    }
};

// Ejecutar en consola para diagnosticar
window.diagnosticarHistorial = function () {
    console.log('=== DIAGNÓSTICO DEL HISTORIAL ===');

    // 1. Verificar funciones
    console.log('1. HistorialAsistencia.renderizarHistorial:', typeof HistorialAsistencia?.renderizarHistorial);
    console.log('2. AsistenciaData.obtenerTodasAsistencias:', typeof AsistenciaData?.obtenerTodasAsistencias);
    console.log('3. AsistenciaData.exportarAsistencias:', typeof AsistenciaData?.exportarAsistencias);

    // 2. Verificar datos
    if (AsistenciaData) {
        const asistencias = AsistenciaData.obtenerTodasAsistencias();
        console.log('4. Total asistencias:', asistencias.length);
    }

    // 3. Probar recarga manual
    console.log('5. Recargando manualmente...');
    if (HistorialAsistencia) {
        HistorialAsistencia.renderizarHistorial();
    }

    return '✅ Diagnóstico completado';
};