// reportes.js - Módulo profesional de reportes v0.5
// CON GENERACIÓN DE PDF Y TABLAS ESTILIZADAS

const Reportes = (function() {
    
    /**
     * Genera un reporte profesional con tablas estilizadas
     */
    function generarReporteProfesional() {
        console.log('🔄 Generando reporte profesional...');
        
        try {
            const datos = DataManager.exportarDatos ? DataManager.exportarDatos() : null;
            
            if (!datos) {
                Swal.fire({
                    icon: 'warning',
                    title: 'Sin datos',
                    text: 'No hay datos para generar el reporte'
                });
                return;
            }

            const fechaActual = new Date().toLocaleString();
            const titulo = `📊 REPORTE DE GESTIÓN DE SALONES - ${fechaActual}`;

            // Crear contenido HTML profesional
            const contenidoHTML = `
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="UTF-8">
                    <title>Reporte Gestión de Salones</title>
                    <style>
                        body { 
                            font-family: 'Segoe UI', Arial, sans-serif; 
                            margin: 40px; 
                            color: #333;
                            background: #fff;
                        }
                        h1 { 
                            color: #0d6efd; 
                            border-bottom: 3px solid #0d6efd; 
                            padding-bottom: 10px;
                            text-align: center;
                        }
                        h2 { 
                            color: #0d6efd; 
                            margin-top: 30px;
                            border-left: 4px solid #0d6efd;
                            padding-left: 10px;
                        }
                        .fecha { 
                            text-align: center; 
                            color: #6c757d; 
                            margin-bottom: 30px;
                        }
                        .stats-grid {
                            display: grid;
                            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                            gap: 20px;
                            margin: 30px 0;
                        }
                        .stat-card {
                            background: #f8f9fa;
                            border-radius: 10px;
                            padding: 20px;
                            text-align: center;
                            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                            border-left: 4px solid #0d6efd;
                        }
                        .stat-card h3 {
                            font-size: 2rem;
                            margin: 0;
                            color: #0d6efd;
                        }
                        .stat-card p {
                            margin: 5px 0 0;
                            color: #6c757d;
                        }
                        table {
                            width: 100%;
                            border-collapse: collapse;
                            margin: 20px 0;
                            font-size: 14px;
                        }
                        th {
                            background: #343a40;
                            color: white;
                            padding: 12px;
                            text-align: left;
                        }
                        td {
                            padding: 10px;
                            border-bottom: 1px solid #dee2e6;
                        }
                        tr:hover {
                            background: #f8f9fa;
                        }
                        .badge {
                            padding: 4px 8px;
                            border-radius: 4px;
                            font-size: 12px;
                            font-weight: bold;
                        }
                        .badge-excelente { background: #198754; color: white; }
                        .badge-bueno { background: #0dcaf0; color: black; }
                        .badge-regular { background: #ffc107; color: black; }
                        .badge-danado { background: #dc3545; color: white; }
                        .footer {
                            text-align: center;
                            margin-top: 50px;
                            color: #6c757d;
                            font-size: 12px;
                            border-top: 1px solid #dee2e6;
                            padding-top: 20px;
                        }
                    </style>
                </head>
                <body>
                    <h1>📊 GESTIÓN DE SALONES DE CLASE</h1>
                    <div class="fecha">Reporte generado: ${fechaActual}</div>
                    
                    ${generarResumenProfesional(datos)}
                    ${generarTablaResponsables(datos)}
                    ${generarTablaPuestosDocentes(datos)}
                    ${generarTablaMesas(datos)}
                    ${generarTablaSillas(datos)}
                    ${generarTablaEquipos(datos)}
                    ${generarTablaAsistencia(datos)}
                    
                    <div class="footer">
                        Reporte generado automáticamente - Sistema de Gestión de Salones v0.5<br>
                        Total de registros: ${calcularTotalRegistros(datos)}
                    </div>
                </body>
                </html>
            `;

            // Abrir en nueva ventana para impresión/PDF
            const ventana = window.open('', '_blank');
            ventana.document.write(contenidoHTML);
            ventana.document.close();
            ventana.focus();
            
            // Ofrecer guardar como PDF
            setTimeout(() => {
                if (confirm('¿Desea guardar este reporte como PDF?')) {
                    ventana.print();
                }
            }, 500);

            console.log('✅ Reporte profesional generado');

        } catch (error) {
            console.error('❌ Error:', error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'No se pudo generar el reporte'
            });
        }
    }

    function generarResumenProfesional(datos) {
        const totalCursos = datos.cursos?.length || 0;
        const totalResponsables = datos.responsables?.length || 0;
        const totalPuestos = datos.puestosDocentes?.length || 0;
        const totalMesas = datos.mesas?.length || 0;
        const totalSillas = datos.sillas?.length || 0;
        const totalEquipos = datos.equipos?.length || 0;

        let totalPCs = 0;
        let PCsAsignados = 0;
        datos.mesas?.forEach(m => {
            totalPCs += m.pcs?.length || 0;
            PCsAsignados += m.pcs?.filter(p => p.estudiante).length || 0;
        });

        const sillasOcupadas = datos.sillas?.filter(s => s.documento).length || 0;

        return `
            <div class="stats-grid">
                <div class="stat-card">
                    <h3>${totalCursos}</h3>
                    <p>Cursos</p>
                </div>
                <div class="stat-card">
                    <h3>${totalResponsables}</h3>
                    <p>Responsables</p>
                </div>
                <div class="stat-card">
                    <h3>${totalPuestos}</h3>
                    <p>Puestos Docentes</p>
                </div>
                <div class="stat-card">
                    <h3>${totalPCs}</h3>
                    <p>Total PCs</p>
                </div>
                <div class="stat-card">
                    <h3>${PCsAsignados}</h3>
                    <p>PCs Asignados</p>
                </div>
                <div class="stat-card">
                    <h3>${totalSillas}</h3>
                    <p>Total Sillas</p>
                </div>
                <div class="stat-card">
                    <h3>${sillasOcupadas}</h3>
                    <p>Sillas Ocupadas</p>
                </div>
                <div class="stat-card">
                    <h3>${totalEquipos}</h3>
                    <p>Equipos</p>
                </div>
            </div>
        `;
    }

    function generarTablaResponsables(datos) {
        if (!datos.responsables?.length) return '';

        let html = '<h2>👤 Responsables Registrados</h2>';
        html += '<table><thead><tr><th>Curso</th><th>Nombre</th><th>Documento</th><th>Salón</th><th>Fecha</th><th>Horario</th></tr></thead><tbody>';

        datos.responsables.forEach(r => {
            html += `
                <tr>
                    <td>${r.numeroCurso || ''}</td>
                    <td>${r.nombre || ''}</td>
                    <td>${r.documento || ''}</td>
                    <td>${r.numeroSalon || ''}</td>
                    <td>${r.fecha || ''}</td>
                    <td>${r.horarioInicio || ''} - ${r.horarioFin || ''}</td>
                </tr>
            `;
        });

        html += '</tbody></table>';
        return html;
    }

    function generarTablaPuestosDocentes(datos) {
        if (!datos.puestosDocentes?.length) return '';

        let html = '<h2>👨‍🏫 Puestos Docentes</h2>';
        html += '<table><thead><tr><th>Nombre</th><th>Documento</th><th>Serial PC</th><th>Estado PC</th><th>Mouse</th><th>Teclado</th></tr></thead><tbody>';

        datos.puestosDocentes.forEach(p => {
            html += `
                <tr>
                    <td>${p.nombre || ''}</td>
                    <td>${p.documento || ''}</td>
                    <td>${p.serial || ''}</td>
                    <td><span class="badge badge-${p.estado?.toLowerCase()}">${p.estado || ''}</span></td>
                    <td><span class="badge badge-${p.mouse?.toLowerCase()}">${p.mouse || ''}</span></td>
                    <td><span class="badge badge-${p.teclado?.toLowerCase()}">${p.teclado || ''}</span></td>
                </tr>
            `;
        });

        html += '</tbody></table>';
        return html;
    }

    function generarTablaMesas(datos) {
        if (!datos.mesas?.length) return '';

        let html = '<h2>🖥️ Configuración de Mesas</h2>';
        
        datos.mesas.forEach((mesa, idx) => {
            html += `<h3>Mesa ${idx + 1} - Curso ${mesa.curso}</h3>`;
            html += '<table><thead><tr><th>PC</th><th>Serial</th><th>Estudiante</th><th>Estado</th></tr></thead><tbody>';

            mesa.pcs?.forEach((pc, i) => {
                html += `
                    <tr>
                        <td>PC ${i + 1}</td>
                        <td>${pc.serial || ''}</td>
                        <td>${pc.estudiante || 'Sin asignar'}</td>
                        <td><span class="badge badge-${pc.estado?.toLowerCase()}">${pc.estado || ''}</span></td>
                    </tr>
                `;
            });

            html += '</tbody></table>';
        });

        return html;
    }

    function generarTablaSillas(datos) {
        if (!datos.sillas?.length) return '';

        let html = '<h2>🪑 Asignación de Sillas</h2>';
        html += '<table><thead><tr><th>Curso</th><th>Silla</th><th>Serial</th><th>Estudiante</th><th>Documento</th><th>Estado</th></tr></thead><tbody>';

        datos.sillas.forEach(s => {
            html += `
                <tr>
                    <td>${s.curso || ''}</td>
                    <td>${s.numero || ''}</td>
                    <td>${s.serial || ''}</td>
                    <td>${s.nombreEstudiante || 'Disponible'}</td>
                    <td>${s.documento || ''}</td>
                    <td><span class="badge badge-${s.estado?.toLowerCase()}">${s.estado || ''}</span></td>
                </tr>
            `;
        });

        html += '</tbody></table>';
        return html;
    }

    function generarTablaEquipos(datos) {
        if (!datos.equipos?.length) return '';

        let html = '<h2>📺 TV y Proyectores</h2>';
        html += '<table><thead><tr><th>Tipo</th><th>Serial</th><th>Estado</th><th>Limpieza</th><th>Observaciones</th></tr></thead><tbody>';

        datos.equipos.forEach(e => {
            html += `
                <tr>
                    <td>${e.tipo || ''}</td>
                    <td>${e.serial || ''}</td>
                    <td><span class="badge badge-${e.estado?.toLowerCase()}">${e.estado || ''}</span></td>
                    <td><span class="badge badge-${e.estadoLimpieza?.toLowerCase()}">${e.estadoLimpieza || ''}</span></td>
                    <td>${e.observaciones || ''}</td>
                </tr>
            `;
        });

        html += '</tbody></table>';
        return html;
    }

    function generarTablaAsistencia(datos) {
        if (!datos.asistencia?.length) return '';

        // Ordenar por fecha descendente
        const asistencias = [...datos.asistencia].sort((a, b) => new Date(b.fecha) - new Date(a.fecha));

        let html = '<h2>📅 Registro de Asistencia</h2>';
        
        asistencias.slice(0, 5).forEach(asist => {
            html += `<h3>Fecha: ${new Date(asist.fecha).toLocaleDateString()} - Curso ${asist.curso}</h3>`;
            html += '<table><thead><tr><th>Documento</th><th>Estudiante</th><th>Asistencia</th><th>Uniforme</th><th>Observaciones</th></tr></thead><tbody>';

            asist.registros?.forEach(r => {
                html += `
                    <tr>
                        <td>${r.documento || ''}</td>
                        <td>${r.nombre || ''}</td>
                        <td>${r.asistio ? '✅ Presente' : '❌ Ausente'}</td>
                        <td>${r.uniforme ? '👕 Sí' : '👕 No'}</td>
                        <td>${r.observaciones || ''}</td>
                    </tr>
                `;
            });

            html += '</tbody></table>';
        });

        if (asistencias.length > 5) {
            html += `<p>... y ${asistencias.length - 5} registros más</p>`;
        }

        return html;
    }

    function calcularTotalRegistros(datos) {
        let total = 0;
        total += datos.responsables?.length || 0;
        total += datos.puestosDocentes?.length || 0;
        total += datos.equipos?.length || 0;
        total += datos.sillas?.length || 0;
        
        datos.mesas?.forEach(m => total += m.pcs?.length || 0);
        datos.asistencia?.forEach(a => total += a.registros?.length || 0);
        
        return total;
    }

    // ===== FUNCIONES DE HISTORIAL =====

    /**
     * Muestra el historial de snapshots guardados
     */
    function mostrarHistorial() {
        const historial = DataManager.getHistorial ? DataManager.getHistorial() : [];
        
        if (historial.length === 0) {
            Swal.fire({
                icon: 'info',
                title: 'Sin historial',
                text: 'No hay snapshots guardados'
            });
            return;
        }

        let html = '<div style="max-height: 400px; overflow-y: auto;">';
        html += '<table style="width: 100%; border-collapse: collapse;">';
        html += '<thead><tr style="background: #343a40; color: white;"><th>Fecha</th><th>Hora</th><th>Acciones</th></tr></thead><tbody>';

        historial.slice().reverse().forEach(h => {
            html += `
                <tr style="border-bottom: 1px solid #dee2e6;">
                    <td style="padding: 10px;">${h.fecha}</td>
                    <td style="padding: 10px;">${h.hora}</td>
                    <td style="padding: 10px;">
                        <button class="btn btn-sm btn-primary" onclick="cargarSnapshot(${h.id})">
                            <i class="fas fa-upload"></i> Cargar
                        </button>
                        <button class="btn btn-sm btn-info" onclick="verSnapshot(${h.id})">
                            <i class="fas fa-eye"></i> Ver
                        </button>
                    </td>
                </tr>
            `;
        });

        html += '</tbody></table></div>';

        Swal.fire({
            title: '📚 Historial de Snapshots',
            html: html,
            width: '800px',
            showConfirmButton: true,
            confirmButtonText: 'Cerrar'
        });
    }

    /**
     * Guarda un snapshot con la fecha actual
     */
    function guardarSnapshot() {
        const snapshot = DataManager.guardarSnapshot ? DataManager.guardarSnapshot() : null;
        
        if (snapshot) {
            Swal.fire({
                icon: 'success',
                title: 'Snapshot guardado',
                text: `Fecha: ${snapshot.fecha} - ${snapshot.hora}`,
                timer: 2000,
                showConfirmButton: false
            });
        } else {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'No se pudo guardar el snapshot'
            });
        }
    }

    /**
     * Carga un snapshot específico
     */
    window.cargarSnapshot = function(id) {
        Swal.fire({
            title: '¿Cargar snapshot?',
            text: 'Los datos actuales serán reemplazados',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            confirmButtonText: 'Sí, cargar',
            cancelButtonText: 'Cancelar'
        }).then((result) => {
            if (result.isConfirmed) {
                const cargado = DataManager.cargarSnapshot ? DataManager.cargarSnapshot(id) : false;
                
                if (cargado) {
                    Swal.fire({
                        icon: 'success',
                        title: 'Snapshot cargado',
                        text: 'Recargando página...',
                        timer: 1500,
                        showConfirmButton: false
                    }).then(() => {
                        location.reload();
                    });
                } else {
                    Swal.fire({
                        icon: 'error',
                        title: 'Error',
                        text: 'No se pudo cargar el snapshot'
                    });
                }
            }
        });
    };

    /**
     * Ver un snapshot sin cargarlo
     */
    window.verSnapshot = function(id) {
        const historial = DataManager.getHistorial ? DataManager.getHistorial() : [];
        const snapshot = historial.find(h => h.id === id);
        
        if (snapshot) {
            const datos = snapshot.datos;
            const totalRegistros = calcularTotalRegistros(datos);
            
            Swal.fire({
                title: `Snapshot ${snapshot.fecha} ${snapshot.hora}`,
                html: `
                    <p><strong>Total registros:</strong> ${totalRegistros}</p>
                    <p><strong>Responsables:</strong> ${datos.responsables?.length || 0}</p>
                    <p><strong>Puestos Docentes:</strong> ${datos.puestosDocentes?.length || 0}</p>
                    <p><strong>Mesas:</strong> ${datos.mesas?.length || 0}</p>
                    <p><strong>Sillas:</strong> ${datos.sillas?.length || 0}</p>
                    <p><strong>Equipos:</strong> ${datos.equipos?.length || 0}</p>
                    <p><strong>Asistencias:</strong> ${datos.asistencia?.length || 0}</p>
                `,
                icon: 'info',
                confirmButtonText: 'Cerrar'
            });
        }
    };

    /**
     * Exporta todo el historial a JSON
     */
    function exportarHistorialCompleto() {
        const datos = DataManager.exportarHistorialCompleto ? DataManager.exportarHistorialCompleto() : null;
        
        if (!datos) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'No se pudo exportar el historial'
            });
            return;
        }

        const fecha = new Date().toISOString().split('T')[0];
        const blob = new Blob([JSON.stringify(datos, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `historial-completo-${fecha}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        Swal.fire({
            icon: 'success',
            title: 'Historial exportado',
            text: `Archivo: historial-completo-${fecha}.json`,
            timer: 2000,
            showConfirmButton: false
        });
    }

    // ===== API PÚBLICA =====
    return {
        generarReporteProfesional,
        mostrarHistorial,
        guardarSnapshot,
        exportarHistorialCompleto
    };
})();

// Verificar carga
if (typeof Reportes !== 'undefined') {
    console.log('✅ Reportes Profesional v0.5 cargado correctamente');
}

// Exponer funciones globalmente
window.generarReporteCompleto = () => Reportes.generarReporteProfesional();
window.mostrarHistorial = () => Reportes.mostrarHistorial();
window.guardarSnapshot = () => Reportes.guardarSnapshot();
window.exportarHistorialCompleto = () => Reportes.exportarHistorialCompleto();