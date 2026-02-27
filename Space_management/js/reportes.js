// reportes.js - Módulo para generar reportes detallados v0.4
// RECONSTRUIDO COMPLETAMENTE

const Reportes = (function() {
    
    // ===== FUNCIÓN PRINCIPAL =====
    
    /**
     * Genera un reporte completo de todos los datos
     */
    function generarReporteCompleto() {
        try {
            console.log('🔄 Generando reporte completo...');
            
            const datos = DataManager.exportarDatos ? DataManager.exportarDatos() : null;
            
            if (!datos) {
                console.error('No se pudieron obtener los datos para el reporte');
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'No se pudieron obtener los datos para el reporte'
                });
                return;
            }
            
            // Calcular estadísticas generales
            const stats = calcularEstadisticasGenerales(datos);
            
            // Generar HTML del reporte
            const reporteHTML = generarHTMLReporte(datos, stats);
            
            // Mostrar reporte en modal
            mostrarReporteModal(reporteHTML);
            
            console.log('✅ Reporte generado correctamente');
            
        } catch (error) {
            console.error('❌ Error generando reporte:', error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'No se pudo generar el reporte: ' + error.message
            });
        }
    }
    
    // ===== FUNCIONES DE CÁLCULO =====
    
    /**
     * Calcula estadísticas generales a partir de los datos
     */
    function calcularEstadisticasGenerales(datos) {
        try {
            // Total de cursos
            const totalCursos = datos.cursos?.length || 0;
            
            // Total de responsables
            const totalResponsables = datos.responsables?.length || 0;
            
            // Total de puestos docentes
            const totalPuestosDocentes = datos.puestosDocentes?.length || 0;
            
            // Total de PCs en mesas
            let totalPCs = 0;
            let pcsAsignados = 0;
            let pcsExcelente = 0;
            let pcsBueno = 0;
            let pcsRegular = 0;
            let pcsDanado = 0;
            
            if (datos.mesas) {
                datos.mesas.forEach(mesa => {
                    if (mesa.pcs) {
                        totalPCs += mesa.pcs.length;
                        pcsAsignados += mesa.pcs.filter(pc => pc.estudiante).length;
                        
                        mesa.pcs.forEach(pc => {
                            switch(pc.estado?.toLowerCase()) {
                                case 'excelente': pcsExcelente++; break;
                                case 'bueno': pcsBueno++; break;
                                case 'regular': pcsRegular++; break;
                                case 'dañado': pcsDanado++; break;
                            }
                        });
                    }
                });
            }
            
            // Total de equipos
            const totalEquipos = datos.equipos?.length || 0;
            
            // Total de sillas
            const totalSillas = datos.sillas?.length || 0;
            const sillasOcupadas = datos.sillas?.filter(s => s.documento).length || 0;
            
            // Total de registros de asistencia
            const totalAsistencias = datos.asistencia?.length || 0;
            
            return {
                totalCursos,
                totalResponsables,
                totalPuestosDocentes,
                totalPCs,
                pcsAsignados,
                pcsExcelente,
                pcsBueno,
                pcsRegular,
                pcsDanado,
                totalEquipos,
                totalSillas,
                sillasOcupadas,
                sillasDisponibles: totalSillas - sillasOcupadas,
                totalAsistencias
            };
            
        } catch (error) {
            console.error('Error calculando estadísticas:', error);
            return {};
        }
    }
    
    // ===== FUNCIONES DE GENERACIÓN DE HTML =====
    
    /**
     * Genera el HTML completo del reporte
     */
    function generarHTMLReporte(datos, stats) {
        const fechaActual = new Date().toLocaleString();
        
        return `
            <div class="reporte-container p-3" style="max-height: 70vh; overflow-y: auto;">
                <style>
                    .reporte-titulo { color: #0d6efd; border-bottom: 2px solid #0d6efd; padding-bottom: 10px; }
                    .reporte-subtitulo { color: #495057; margin-top: 20px; border-bottom: 1px solid #dee2e6; padding-bottom: 5px; }
                    .reporte-card { background: #f8f9fa; border-radius: 8px; padding: 15px; margin-bottom: 15px; border-left: 4px solid #0d6efd; }
                    .reporte-stat { text-align: center; padding: 10px; background: white; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
                    .reporte-stat h3 { margin: 0; color: #0d6efd; font-weight: bold; }
                    .reporte-stat p { margin: 0; color: #6c757d; }
                    .reporte-tabla { width: 100%; border-collapse: collapse; margin-top: 10px; }
                    .reporte-tabla th { background: #343a40; color: white; padding: 8px; text-align: left; }
                    .reporte-tabla td { padding: 8px; border-bottom: 1px solid #dee2e6; }
                    .reporte-tabla tr:hover { background: #f8f9fa; }
                    .badge-excelente { background: #198754; color: white; padding: 3px 8px; border-radius: 12px; }
                    .badge-bueno { background: #0dcaf0; color: black; padding: 3px 8px; border-radius: 12px; }
                    .badge-regular { background: #ffc107; color: black; padding: 3px 8px; border-radius: 12px; }
                    .badge-danado { background: #dc3545; color: white; padding: 3px 8px; border-radius: 12px; }
                </style>
                
                <h2 class="reporte-titulo text-center">
                    <i class="fas fa-chart-bar"></i> Reporte General de Gestión de Salones
                </h2>
                <p class="text-center text-muted">Generado el: ${fechaActual}</p>
                
                ${generarResumenGeneral(stats)}
                
                ${generarDetallePorCurso(datos)}
                
                ${generarEstadoPCs(datos)}
                
                ${generarAsignacionSillas(datos)}
                
                ${generarRegistroAsistencia(datos)}
                
                <div class="text-center text-muted mt-4">
                    <small>Reporte generado automáticamente - Versión 0.4</small>
                </div>
            </div>
        `;
    }
    
    /**
     * Genera el resumen general con tarjetas de estadísticas
     */
    function generarResumenGeneral(stats) {
        return `
            <div class="reporte-card">
                <h5><i class="fas fa-chart-pie"></i> Resumen General</h5>
                <div class="row mt-3">
                    <div class="col-md-3 col-6 mb-3">
                        <div class="reporte-stat">
                            <h3>${stats.totalCursos || 0}</h3>
                            <p>Cursos</p>
                        </div>
                    </div>
                    <div class="col-md-3 col-6 mb-3">
                        <div class="reporte-stat">
                            <h3>${stats.totalResponsables || 0}</h3>
                            <p>Responsables</p>
                        </div>
                    </div>
                    <div class="col-md-3 col-6 mb-3">
                        <div class="reporte-stat">
                            <h3>${stats.totalPuestosDocentes || 0}</h3>
                            <p>Puestos Docentes</p>
                        </div>
                    </div>
                    <div class="col-md-3 col-6 mb-3">
                        <div class="reporte-stat">
                            <h3>${stats.totalPCs || 0}</h3>
                            <p>Total PCs</p>
                        </div>
                    </div>
                </div>
                
                <div class="row">
                    <div class="col-md-4 col-6 mb-3">
                        <div class="reporte-stat">
                            <h3>${stats.pcsAsignados || 0}/${stats.totalPCs || 0}</h3>
                            <p>PCs Asignados</p>
                        </div>
                    </div>
                    <div class="col-md-4 col-6 mb-3">
                        <div class="reporte-stat">
                            <h3>${stats.totalSillas || 0}</h3>
                            <p>Total Sillas</p>
                        </div>
                    </div>
                    <div class="col-md-4 col-6 mb-3">
                        <div class="reporte-stat">
                            <h3>${stats.sillasOcupadas || 0}/${stats.totalSillas || 0}</h3>
                            <p>Sillas Ocupadas</p>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
    
    /**
     * Genera el detalle por curso
     */
    function generarDetallePorCurso(datos) {
        const cursos = datos.cursos || [];
        
        if (cursos.length === 0) {
            return '<p class="text-muted">No hay cursos registrados</p>';
        }
        
        let html = `
            <div class="reporte-card">
                <h5><i class="fas fa-users"></i> Detalle por Curso</h5>
                <div class="table-responsive">
                    <table class="reporte-tabla">
                        <thead>
                            <tr>
                                <th>Curso</th>
                                <th>Responsables</th>
                                <th>PCs</th>
                                <th>PCs Asignados</th>
                                <th>Sillas</th>
                                <th>Sillas Ocupadas</th>
                            </tr>
                        </thead>
                        <tbody>
        `;
        
        cursos.forEach(curso => {
            const cursoId = curso.id;
            
            // Contar responsables del curso
            const responsablesCurso = datos.responsables?.filter(r => r.numeroCurso === cursoId) || [];
            
            // Contar PCs del curso
            const mesasCurso = datos.mesas?.filter(m => m.curso === cursoId) || [];
            let pcsCurso = 0;
            let pcsAsignadosCurso = 0;
            
            mesasCurso.forEach(mesa => {
                pcsCurso += mesa.pcs?.length || 0;
                pcsAsignadosCurso += mesa.pcs?.filter(pc => pc.estudiante).length || 0;
            });
            
            // Contar sillas del curso
            const sillasCurso = datos.sillas?.filter(s => s.curso === cursoId) || [];
            const sillasOcupadasCurso = sillasCurso.filter(s => s.documento).length;
            
            html += `
                <tr>
                    <td><strong>${curso.id}</strong> - ${curso.nombre}</td>
                    <td>${responsablesCurso.length}</td>
                    <td>${pcsCurso}</td>
                    <td>${pcsAsignadosCurso}</td>
                    <td>${sillasCurso.length}</td>
                    <td>${sillasOcupadasCurso}</td>
                </tr>
            `;
        });
        
        html += `
                        </tbody>
                    </table>
                </div>
            </div>
        `;
        
        return html;
    }
    
    /**
     * Genera el estado de los PCs
     */
    function generarEstadoPCs(datos) {
        const cursos = datos.cursos || [];
        
        if (cursos.length === 0) {
            return '';
        }
        
        let html = `
            <div class="reporte-card">
                <h5><i class="fas fa-desktop"></i> Estado de PCs por Curso</h5>
                <div class="table-responsive">
                    <table class="reporte-tabla">
                        <thead>
                            <tr>
                                <th>Curso</th>
                                <th>Excelente</th>
                                <th>Bueno</th>
                                <th>Regular</th>
                                <th>Dañado</th>
                                <th>Total</th>
                            </tr>
                        </thead>
                        <tbody>
        `;
        
        cursos.forEach(curso => {
            const cursoId = curso.id;
            const mesasCurso = datos.mesas?.filter(m => m.curso === cursoId) || [];
            
            let excelente = 0, bueno = 0, regular = 0, danado = 0, total = 0;
            
            mesasCurso.forEach(mesa => {
                mesa.pcs?.forEach(pc => {
                    total++;
                    switch(pc.estado?.toLowerCase()) {
                        case 'excelente': excelente++; break;
                        case 'bueno': bueno++; break;
                        case 'regular': regular++; break;
                        case 'dañado': danado++; break;
                    }
                });
            });
            
            if (total > 0) {
                html += `
                    <tr>
                        <td>${curso.id}</td>
                        <td><span class="badge-excelente">${excelente}</span></td>
                        <td><span class="badge-bueno">${bueno}</span></td>
                        <td><span class="badge-regular">${regular}</span></td>
                        <td><span class="badge-danado">${danado}</span></td>
                        <td><strong>${total}</strong></td>
                    </tr>
                `;
            }
        });
        
        html += `
                        </tbody>
                    </table>
                </div>
            </div>
        `;
        
        return html;
    }
    
    /**
     * Genera la asignación de sillas
     */
    function generarAsignacionSillas(datos) {
        const cursos = datos.cursos || [];
        
        if (cursos.length === 0) {
            return '';
        }
        
        let html = `
            <div class="reporte-card">
                <h5><i class="fas fa-chair"></i> Asignación de Sillas por Curso</h5>
                <div class="table-responsive">
                    <table class="reporte-tabla">
                        <thead>
                            <tr>
                                <th>Curso</th>
                                <th>Total Sillas</th>
                                <th>Ocupadas</th>
                                <th>Disponibles</th>
                                <th>% Ocupación</th>
                            </tr>
                        </thead>
                        <tbody>
        `;
        
        cursos.forEach(curso => {
            const cursoId = curso.id;
            const sillasCurso = datos.sillas?.filter(s => s.curso === cursoId) || [];
            
            const total = sillasCurso.length;
            const ocupadas = sillasCurso.filter(s => s.documento).length;
            const disponibles = total - ocupadas;
            const porcentaje = total > 0 ? Math.round((ocupadas / total) * 100) : 0;
            
            if (total > 0) {
                html += `
                    <tr>
                        <td>${curso.id}</td>
                        <td>${total}</td>
                        <td>${ocupadas}</td>
                        <td>${disponibles}</td>
                        <td>
                            <div class="progress" style="height: 20px;">
                                <div class="progress-bar bg-success" role="progressbar" style="width: ${porcentaje}%;" 
                                     aria-valuenow="${porcentaje}" aria-valuemin="0" aria-valuemax="100">
                                    ${porcentaje}%
                                </div>
                            </div>
                        </td>
                    </tr>
                `;
            }
        });
        
        html += `
                        </tbody>
                    </table>
                </div>
            </div>
        `;
        
        return html;
    }
    
    /**
     * Genera el registro de asistencia
     */
    function generarRegistroAsistencia(datos) {
        const asistencias = datos.asistencia || [];
        
        if (asistencias.length === 0) {
            return `
                <div class="reporte-card">
                    <h5><i class="fas fa-calendar-check"></i> Registro de Asistencia</h5>
                    <p class="text-muted">No hay registros de asistencia</p>
                </div>
            `;
        }
        
        // Ordenar por fecha descendente
        asistencias.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
        
        let html = `
            <div class="reporte-card">
                <h5><i class="fas fa-calendar-check"></i> Últimos Registros de Asistencia</h5>
                <div class="table-responsive">
                    <table class="reporte-tabla">
                        <thead>
                            <tr>
                                <th>Fecha</th>
                                <th>Curso</th>
                                <th>Presentes</th>
                                <th>Ausentes</th>
                                <th>Total</th>
                                <th>% Asistencia</th>
                            </tr>
                        </thead>
                        <tbody>
        `;
        
        // Mostrar solo los últimos 10 registros
        asistencias.slice(0, 10).forEach(asist => {
            const total = asist.registros?.length || 0;
            const presentes = asist.registros?.filter(r => r.asistio).length || 0;
            const ausentes = total - presentes;
            const porcentaje = total > 0 ? Math.round((presentes / total) * 100) : 0;
            
            const fechaFormateada = new Date(asist.fecha).toLocaleDateString();
            
            html += `
                <tr>
                    <td>${fechaFormateada}</td>
                    <td>${asist.curso}</td>
                    <td>${presentes}</td>
                    <td>${ausentes}</td>
                    <td>${total}</td>
                    <td>
                        <div class="progress" style="height: 20px;">
                            <div class="progress-bar bg-success" role="progressbar" style="width: ${porcentaje}%;" 
                                 aria-valuenow="${porcentaje}" aria-valuemin="0" aria-valuemax="100">
                                ${porcentaje}%
                            </div>
                        </div>
                    </td>
                </tr>
            `;
        });
        
        html += `
                        </tbody>
                    </table>
                </div>
            </div>
        `;
        
        return html;
    }
    
    // ===== FUNCIONES DE VISUALIZACIÓN =====
    
    /**
     * Muestra el reporte en un modal de SweetAlert2
     */
    function mostrarReporteModal(contenidoHTML) {
        Swal.fire({
            title: '📊 Reporte General',
            html: contenidoHTML,
            width: '1200px',
            showConfirmButton: true,
            confirmButtonText: 'Cerrar',
            showCloseButton: true,
            showCancelButton: true,
            cancelButtonText: 'Imprimir',
            cancelButtonColor: '#3085d6',
            reverseButtons: true,
            customClass: {
                container: 'reporte-modal'
            }
        }).then((result) => {
            if (result.dismiss === Swal.DismissReason.cancel) {
                // Si el usuario hace clic en "Imprimir"
                imprimirReporte();
            }
        });
    }
    
    /**
     * Función para imprimir el reporte
     */
    function imprimirReporte() {
        window.print();
    }
    
    /**
     * Genera un reporte resumido (versión simplificada)
     */
    function generarReporteResumido() {
        try {
            const datos = DataManager.exportarDatos ? DataManager.exportarDatos() : null;
            
            if (!datos) {
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'No se pudieron obtener los datos'
                });
                return;
            }
            
            const stats = calcularEstadisticasGenerales(datos);
            
            let mensaje = `📊 REPORTE RESUMEN\n\n`;
            mensaje += `Total Cursos: ${stats.totalCursos}\n`;
            mensaje += `Total Responsables: ${stats.totalResponsables}\n`;
            mensaje += `Total Puestos Docentes: ${stats.totalPuestosDocentes}\n`;
            mensaje += `Total PCs: ${stats.totalPCs} (Asignados: ${stats.pcsAsignados})\n`;
            mensaje += `Total Sillas: ${stats.totalSillas} (Ocupadas: ${stats.sillasOcupadas})\n`;
            mensaje += `Total Equipos: ${stats.totalEquipos}\n`;
            mensaje += `Registros Asistencia: ${stats.totalAsistencias}\n\n`;
            mensaje += `Generado: ${new Date().toLocaleString()}`;
            
            Swal.fire({
                title: 'Reporte Resumen',
                text: mensaje,
                icon: 'info',
                confirmButtonText: 'Aceptar'
            });
            
        } catch (error) {
            console.error('Error generando reporte resumido:', error);
        }
    }
    
    // ===== FUNCIONES DE EXPORTACIÓN =====
    
    /**
     * Exporta el reporte a CSV
     */
    function exportarReporteCSV() {
        try {
            const datos = DataManager.exportarDatos ? DataManager.exportarDatos() : null;
            
            if (!datos) {
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'No se pudieron obtener los datos'
                });
                return;
            }
            
            // Crear contenido CSV
            let csv = "Tipo,Curso,Estudiante,Documento,Silla,Serial Silla,Estado,Observaciones\n";
            
            // Agregar datos de sillas
            if (datos.sillas) {
                datos.sillas.forEach(silla => {
                    const estudiante = silla.nombreEstudiante || 'Sin asignar';
                    const documento = silla.documento || 'N/A';
                    csv += `Silla,${silla.curso},${estudiante},${documento},${silla.numero},${silla.serial},${silla.estado},${silla.observaciones}\n`;
                });
            }
            
            // Agregar datos de PCs
            if (datos.mesas) {
                datos.mesas.forEach(mesa => {
                    if (mesa.pcs) {
                        mesa.pcs.forEach(pc => {
                            if (pc.estudiante) {
                                csv += `PC,${mesa.curso},${pc.estudiante},${pc.documento || 'N/A'},Mesa ${mesa.fila+1}-${mesa.columna+1},${pc.serial},${pc.estado},${pc.observaciones}\n`;
                            }
                        });
                    }
                });
            }
            
            // Descargar archivo
            const blob = new Blob([csv], { type: 'text/csv' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `reporte-${new Date().toISOString().split('T')[0]}.csv`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            Swal.fire({
                icon: 'success',
                title: 'Exportado',
                text: 'Reporte CSV descargado',
                timer: 1500,
                showConfirmButton: false
            });
            
        } catch (error) {
            console.error('Error exportando CSV:', error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'No se pudo exportar el reporte'
            });
        }
    }
    
    // ===== API PÚBLICA =====
    return {
        generarReporteCompleto,
        generarReporteResumido,
        imprimirReporte,
        exportarReporteCSV
    };
})();

// Verificar que Reportes se cargó correctamente
if (typeof Reportes !== 'undefined') {
    console.log('✅ Reportes v0.4 cargado correctamente');
    console.log('📋 Funciones disponibles:', Object.keys(Reportes));
} else {
    console.error('❌ Error cargando Reportes');
}