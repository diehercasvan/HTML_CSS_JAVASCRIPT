// js/modules/asistencia/reporteAsistenciaPDF.js
// Versión 3.1 - CON SOPORTE PARA HISTORIAL

console.log('🔄 Cargando reporteAsistenciaPDF.js...');

const ReporteAsistenciaPDF = (function() {
    
    /**
     * Genera reporte PDF desde datos del historial
     */
    function generarReporteDesdeHistorial(datosAsistencia) {
        console.log('📄 Generando reporte desde historial...');
        
        // Obtener nombre del curso
        const cursos = DataManager.getCursos ? DataManager.getCursos() : [];
        const cursoInfo = cursos.find(c => c.id === datosAsistencia.curso);
        const nombreCurso = cursoInfo ? cursoInfo.nombre : datosAsistencia.curso;
        
        // Calcular estadísticas
        const total = datosAsistencia.registros.length;
        const presentes = datosAsistencia.registros.filter(r => r.asistio).length;
        const ausentes = total - presentes;
        const uniforme = datosAsistencia.registros.filter(r => r.uniforme).length;
        const porcentaje = total > 0 ? Math.round((presentes / total) * 100) : 0;
        
        const datos = {
            tipo: 'diario',
            curso: datosAsistencia.curso,
            nombreCurso: nombreCurso,
            fecha: datosAsistencia.fecha,
            docente: datosAsistencia.docente,
            registros: datosAsistencia.registros,
            estadisticas: {
                total, presentes, ausentes, uniforme, porcentaje
            }
        };
        
        generarHTMLReporte(datos);
    }

    /**
     * Genera reporte PDF de asistencia diaria
     */
    function generarReporteDiario() {
        console.log('📄 Generando reporte diario de asistencia...');
        
        const curso = document.getElementById('cursoAsistencia')?.value;
        const fecha = document.getElementById('fechaAsistencia')?.value;
        
        if (!curso) {
            Swal.fire({
                icon: 'warning',
                title: 'Curso requerido',
                text: 'Por favor seleccione un curso'
            });
            return;
        }
        
        if (!fecha) {
            Swal.fire({
                icon: 'warning',
                title: 'Fecha requerida',
                text: 'Por favor seleccione una fecha'
            });
            return;
        }
        
        const asistencia = AsistenciaData.obtenerAsistencia(curso, fecha);
        
        if (!asistencia) {
            Swal.fire({
                icon: 'info',
                title: 'Sin datos',
                text: 'No hay asistencia registrada para esta fecha'
            });
            return;
        }
        
        // Obtener nombre del curso
        const cursos = DataManager.getCursos ? DataManager.getCursos() : [];
        const cursoInfo = cursos.find(c => c.id === curso);
        const nombreCurso = cursoInfo ? cursoInfo.nombre : curso;
        
        // Calcular estadísticas
        const total = asistencia.registros.length;
        const presentes = asistencia.registros.filter(r => r.asistio).length;
        const ausentes = total - presentes;
        const uniforme = asistencia.registros.filter(r => r.uniforme).length;
        const porcentaje = total > 0 ? Math.round((presentes / total) * 100) : 0;
        
        const datos = {
            tipo: 'diario',
            curso: curso,
            nombreCurso: nombreCurso,
            fecha: fecha,
            docente: asistencia.docente,
            registros: asistencia.registros,
            estadisticas: {
                total, presentes, ausentes, uniforme, porcentaje
            }
        };
        
        generarHTMLReporte(datos);
    }

    /**
     * Genera reporte PDF de asistencia semanal
     */
    async function generarReporteSemanal() {
        console.log('📄 Generando reporte semanal de asistencia...');
        
        const curso = document.getElementById('cursoAsistencia')?.value;
        const semanaInput = document.getElementById('semanaAsistencia')?.value;
        
        if (!curso) {
            Swal.fire({
                icon: 'warning',
                title: 'Curso requerido',
                text: 'Por favor seleccione un curso'
            });
            return;
        }
        
        if (!semanaInput) {
            Swal.fire({
                icon: 'warning',
                title: 'Semana requerida',
                text: 'Por favor seleccione una semana en el campo "Semana"'
            });
            return;
        }
        
        // Calcular fechas de la semana
        const [year, week] = semanaInput.split('-W');
        const fechaInicio = new Date(year, 0, 1 + (week - 1) * 7);
        while (fechaInicio.getDay() !== 1) { // Buscar lunes
            fechaInicio.setDate(fechaInicio.getDate() + 1);
        }
        const fechaFin = new Date(fechaInicio);
        fechaFin.setDate(fechaFin.getDate() + 4); // Viernes
        
        const fechaInicioStr = fechaInicio.toISOString().split('T')[0];
        const fechaFinStr = fechaFin.toISOString().split('T')[0];
        
        // Obtener todas las asistencias de la semana
        const todasAsistencias = AsistenciaData.obtenerTodasAsistencias();
        const asistenciasSemana = todasAsistencias.filter(a => 
            a.curso === curso && 
            a.fecha >= fechaInicioStr && 
            a.fecha <= fechaFinStr
        );
        
        if (asistenciasSemana.length === 0) {
            Swal.fire({
                icon: 'info',
                title: 'Sin datos',
                text: `No hay asistencias registradas para la semana ${semanaInput} (${fechaInicioStr} al ${fechaFinStr})`
            });
            return;
        }
        
        // Obtener nombre del curso
        const cursos = DataManager.getCursos ? DataManager.getCursos() : [];
        const cursoInfo = cursos.find(c => c.id === curso);
        const nombreCurso = cursoInfo ? cursoInfo.nombre : curso;
        
        // Calcular estadísticas totales de la semana
        let totalRegistros = 0;
        let totalPresentes = 0;
        let totalUniforme = 0;
        
        asistenciasSemana.forEach(dia => {
            totalRegistros += dia.registros.length;
            totalPresentes += dia.registros.filter(r => r.asistio).length;
            totalUniforme += dia.registros.filter(r => r.uniforme).length;
        });
        
        const totalAusentes = totalRegistros - totalPresentes;
        const porcentajeSemana = totalRegistros > 0 ? Math.round((totalPresentes / totalRegistros) * 100) : 0;
        
        // Preparar datos por día
        const diasSemana = [];
        for (let d = new Date(fechaInicio); d <= fechaFin; d.setDate(d.getDate() + 1)) {
            const fechaStr = d.toISOString().split('T')[0];
            const dia = asistenciasSemana.find(a => a.fecha === fechaStr);
            
            if (dia) {
                const presentes = dia.registros.filter(r => r.asistio).length;
                const ausentes = dia.registros.length - presentes;
                const porcentajeDia = Math.round((presentes / dia.registros.length) * 100);
                
                diasSemana.push({
                    fecha: fechaStr,
                    existe: true,
                    registros: dia.registros.length,
                    presentes,
                    ausentes,
                    porcentaje: porcentajeDia,
                    docente: dia.docente
                });
            } else {
                diasSemana.push({
                    fecha: fechaStr,
                    existe: false,
                    registros: 0,
                    presentes: 0,
                    ausentes: 0,
                    porcentaje: 0
                });
            }
        }
        
        generarHTMLReporte({
            tipo: 'semanal',
            curso: curso,
            nombreCurso: nombreCurso,
            semana: semanaInput,
            fechaInicio: fechaInicioStr,
            fechaFin: fechaFinStr,
            dias: diasSemana,
            asistencias: asistenciasSemana,
            estadisticas: {
                totalRegistros,
                totalPresentes,
                totalAusentes,
                totalUniforme,
                porcentaje: porcentajeSemana
            }
        });
    }

    /**
     * Genera el HTML del reporte y abre ventana para PDF
     */
    function generarHTMLReporte(datos) {
        const fechaActual = new Date().toLocaleString();
        const titulo = datos.tipo === 'diario' ? 
            `REPORTE DIARIO DE ASISTENCIA - ${datos.fecha}` :
            `REPORTE SEMANAL DE ASISTENCIA - Semana ${datos.semana}`;
        
        let contenido = '';
        
        if (datos.tipo === 'diario') {
            contenido = generarHTMLDiario(datos);
        } else {
            contenido = generarHTMLSemanal(datos);
        }
        
        const ventana = window.open('', '_blank');
        ventana.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <title>${titulo}</title>
                <style>
                    body {
                        font-family: 'Segoe UI', Arial, sans-serif;
                        margin: 2cm;
                        font-size: 12pt;
                    }
                    h1 {
                        color: #0d6efd;
                        text-align: center;
                        border-bottom: 2px solid #0d6efd;
                        padding-bottom: 10px;
                    }
                    h2 {
                        color: #0d6efd;
                        margin-top: 25px;
                    }
                    .info-box {
                        background: #f8f9fa;
                        padding: 15px;
                        border-radius: 8px;
                        margin: 20px 0;
                        border-left: 4px solid #0d6efd;
                    }
                    .stats-grid {
                        display: grid;
                        grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
                        gap: 15px;
                        margin: 20px 0;
                    }
                    .stat-card {
                        background: #e9ecef;
                        padding: 15px;
                        border-radius: 8px;
                        text-align: center;
                    }
                    .stat-card h3 {
                        margin: 0;
                        color: #0d6efd;
                        font-size: 24px;
                    }
                    table {
                        width: 100%;
                        border-collapse: collapse;
                        margin: 20px 0;
                    }
                    th {
                        background: #343a40;
                        color: white;
                        padding: 10px;
                        text-align: left;
                    }
                    td {
                        padding: 8px;
                        border-bottom: 1px solid #dee2e6;
                    }
                    .presente {
                        color: #198754;
                        font-weight: bold;
                    }
                    .ausente {
                        color: #dc3545;
                        font-weight: bold;
                    }
                    .resumen-semana {
                        background: #f8f9fa;
                        padding: 20px;
                        border-radius: 8px;
                        margin: 20px 0;
                    }
                    .dia-card {
                        background: white;
                        border: 1px solid #dee2e6;
                        border-radius: 5px;
                        padding: 10px;
                        margin: 5px 0;
                    }
                    .dia-header {
                        background: #e9ecef;
                        padding: 5px 10px;
                        margin: -10px -10px 10px -10px;
                        border-radius: 5px 5px 0 0;
                        font-weight: bold;
                    }
                    .footer {
                        text-align: center;
                        margin-top: 50px;
                        color: #6c757d;
                        font-size: 10pt;
                    }
                    @media print {
                        .no-print { display: none; }
                    }
                </style>
            </head>
            <body>
                <h1>${titulo}</h1>
                <p style="text-align: center;">Generado: ${fechaActual}</p>
                
                ${contenido}
                
                <div class="no-print" style="text-align: center; margin-top: 30px;">
                    <button onclick="window.print()" style="padding: 10px 20px; background: #0d6efd; color: white; border: none; border-radius: 5px; cursor: pointer; margin-right: 10px;">
                        🖨️ GUARDAR PDF
                    </button>
                    <button onclick="window.close()" style="padding: 10px 20px; background: #6c757d; color: white; border: none; border-radius: 5px; cursor: pointer;">
                        ❌ CERRAR
                    </button>
                </div>
            </body>
            </html>
        `);
        ventana.document.close();
    }

    /**
     * Genera HTML para reporte diario
     */
    function generarHTMLDiario(datos) {
        const filas = datos.registros.map(r => `
            <tr>
                <td>${r.documento}</td>
                <td>${r.nombre}</td>
                <td class="${r.asistio ? 'presente' : 'ausente'}">
                    ${r.asistio ? '✅ Presente' : '❌ Ausente'}
                    ${r.observaciones ? `<br><small>${r.observaciones}</small>` : ''}
                </td>
                <td>${r.uniforme ? '✅ Sí' : '❌ No'}</td>
            </tr>
        `).join('');

        return `
            <div class="info-box">
                <p><strong>Curso:</strong> ${datos.curso} - ${datos.nombreCurso}</p>
                <p><strong>Fecha:</strong> ${datos.fecha}</p>
                <p><strong>Docente:</strong> ${datos.docente?.nombre || 'No especificado'}</p>
                <p><strong>Horario:</strong> ${datos.docente?.horarioInicio || 'N/A'} - ${datos.docente?.horarioFin || 'N/A'}</p>
            </div>

            <div class="stats-grid">
                <div class="stat-card">
                    <h3>${datos.estadisticas.total}</h3>
                    <p>Total Estudiantes</p>
                </div>
                <div class="stat-card">
                    <h3 class="presente">${datos.estadisticas.presentes}</h3>
                    <p>Presentes</p>
                </div>
                <div class="stat-card">
                    <h3 class="ausente">${datos.estadisticas.ausentes}</h3>
                    <p>Ausentes</p>
                </div>
                <div class="stat-card">
                    <h3>${datos.estadisticas.uniforme}</h3>
                    <p>Con Uniforme</p>
                </div>
                <div class="stat-card">
                    <h3>${datos.estadisticas.porcentaje}%</h3>
                    <p>Asistencia</p>
                </div>
            </div>

            <h2>Lista de Estudiantes</h2>
            <table>
                <thead>
                    <tr>
                        <th>Documento</th>
                        <th>Nombre</th>
                        <th>Asistencia</th>
                        <th>Uniforme</th>
                    </tr>
                </thead>
                <tbody>
                    ${filas}
                </tbody>
            </table>
            
            <div style="margin-top: 30px; font-style: italic;">
                <p><strong>Resumen:</strong> ${datos.estadisticas.presentes} presentes, ${datos.estadisticas.ausentes} ausentes, ${datos.estadisticas.uniforme} con uniforme.</p>
            </div>
        `;
    }

    /**
     * Genera HTML para reporte semanal
     */
    function generarHTMLSemanal(datos) {
        // Obtener todos los estudiantes únicos de la semana
        const estudiantesMap = new Map();
        
        datos.asistencias.forEach(dia => {
            dia.registros.forEach(r => {
                if (!estudiantesMap.has(r.documento)) {
                    estudiantesMap.set(r.documento, {
                        documento: r.documento,
                        nombre: r.nombre,
                        dias: {}
                    });
                }
                estudiantesMap.get(r.documento).dias[dia.fecha] = {
                    asistio: r.asistio,
                    uniforme: r.uniforme
                };
            });
        });
        
        const estudiantes = Array.from(estudiantesMap.values());
        
        // Crear cabecera de la tabla con los días de la semana
        const diasCabecera = datos.dias.map(dia => 
            `<th style="font-size: 11px; text-align: center;">${dia.fecha.split('-')[2]}/${dia.fecha.split('-')[1]}</th>`
        ).join('');
        
        // Crear filas de estudiantes
        const filasEstudiantes = estudiantes.map(est => {
            let fila = `<tr>
                <td>${est.documento}</td>
                <td>${est.nombre}</td>`;
            
            datos.dias.forEach(dia => {
                const registro = est.dias[dia.fecha];
                if (registro) {
                    fila += `<td style="text-align: center;">
                        <span style="color: ${registro.asistio ? '#198754' : '#dc3545'}; font-weight: bold;">
                            ${registro.asistio ? '✅' : '❌'}
                        </span>
                        ${registro.uniforme ? '<br><small style="color: #0d6efd;">👕</small>' : ''}
                    </td>`;
                } else {
                    fila += `<td style="text-align: center; color: #6c757d;">—</td>`;
                }
            });
            
            fila += '</tr>';
            return fila;
        }).join('');

        const resumenGeneral = `
            <div class="resumen-semana">
                <h3>Resumen de la Semana</h3>
                <div class="stats-grid">
                    <div class="stat-card">
                        <h3>${datos.estadisticas.totalRegistros}</h3>
                        <p>Total Registros</p>
                    </div>
                    <div class="stat-card">
                        <h3 class="presente">${datos.estadisticas.totalPresentes}</h3>
                        <p>Presentes</p>
                    </div>
                    <div class="stat-card">
                        <h3 class="ausente">${datos.estadisticas.totalAusentes}</h3>
                        <p>Ausentes</p>
                    </div>
                    <div class="stat-card">
                        <h3>${datos.estadisticas.porcentaje}%</h3>
                        <p>Asistencia</p>
                    </div>
                </div>
            </div>
        `;

        return `
            <div class="info-box">
                <p><strong>Curso:</strong> ${datos.curso} - ${datos.nombreCurso}</p>
                <p><strong>Semana:</strong> ${datos.semana} (${datos.fechaInicio} al ${datos.fechaFin})</p>
            </div>

            ${resumenGeneral}

            <h2>Detalle de Asistencia por Estudiante</h2>
            <div style="overflow-x: auto;">
                <table style="font-size: 12px;">
                    <thead>
                        <tr>
                            <th>Documento</th>
                            <th>Nombre</th>
                            ${diasCabecera}
                        </tr>
                    </thead>
                    <tbody>
                        ${filasEstudiantes}
                    </tbody>
                </table>
            </div>

            <h2 style="margin-top: 30px;">Resumen por Día</h2>
            ${datos.dias.map(dia => {
                if (!dia.existe) {
                    return `
                        <div class="dia-card">
                            <div class="dia-header">${dia.fecha}</div>
                            <p class="text-muted">Sin registro de asistencia</p>
                        </div>
                    `;
                }
                
                return `
                    <div class="dia-card">
                        <div class="dia-header">${dia.fecha} - Docente: ${dia.docente?.nombre || 'N/A'}</div>
                        <p><strong>Total:</strong> ${dia.registros} | 
                           <span class="presente">Presentes: ${dia.presentes}</span> | 
                           <span class="ausente">Ausentes: ${dia.ausentes}</span></p>
                        <div style="background: #e9ecef; height: 20px; border-radius: 10px; overflow: hidden; margin-top: 5px;">
                            <div style="background: #198754; width: ${dia.porcentaje}%; height: 100%; text-align: center; color: white; font-size: 12px;">
                                ${dia.porcentaje}%
                            </div>
                        </div>
                    </div>
                `;
            }).join('')}
        `;
    }

    // API pública
    return {
        generarReporteDiario,
        generarReporteSemanal,
        generarReporteDesdeHistorial
    };
})();

console.log('✅ ReporteAsistenciaPDF v3.1 cargado');
window.ReporteAsistenciaPDF = ReporteAsistenciaPDF;