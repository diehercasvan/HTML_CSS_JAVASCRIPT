// js/modules/asistencia/reporteAsistenciaPDF.js
// Versión 4.0 - CON LOGO Y DISEÑO PROFESIONAL

console.log('🔄 Cargando reporteAsistenciaPDF.js...');

const ReporteAsistenciaPDF = (function() {
    
    /**
     * Carga el logo para los reportes
     */
    async function cargarLogo() {
        let logoBase64 = null;
        if (typeof LogoUtils !== 'undefined') {
            logoBase64 = await LogoUtils.cargarLogoDesdeArchivo();
        }
        return logoBase64;
    }

    /**
     * Genera el header con logo
     */
    function generarHeaderConLogo(logoBase64, titulo, subtitulo = '') {
        const logoHtml = logoBase64 ? 
            `<div class="logo"><img src="${logoBase64}" alt="Logo SENA"></div>` : 
            `<div class="logo" style="background: #003366; color: white; display: flex; align-items: center; justify-content: center; border-radius: 10px; font-size: 24px; font-weight: bold;">
                SENA
            </div>`;

        return `
            <div class="header">
                ${logoHtml}
                <div class="titulo">
                    <h1>SERVICIO NACIONAL DE APRENDIZAJE - SENA</h1>
                    <h2>CENTRO DE ELECTRICIDAD, ELECTRÓNICA Y TELECOMUNICACIONES - CEET</h2>
                    <h3>${titulo}</h3>
                    ${subtitulo ? `<p>${subtitulo}</p>` : ''}
                </div>
            </div>
        `;
    }

    /**
     * Genera reporte PDF desde datos del historial
     */
    async function generarReporteDesdeHistorial(datosAsistencia) {
        console.log('📄 Generando reporte desde historial...');
        
        const logoBase64 = await cargarLogo();
        
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
        
        generarHTMLReporte(datos, logoBase64);
    }

    /**
     * Genera reporte PDF de asistencia diaria
     */
    async function generarReporteDiario() {
        console.log('📄 Generando reporte diario de asistencia...');
        
        const logoBase64 = await cargarLogo();
        
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
        
        generarHTMLReporte(datos, logoBase64);
    }

    /**
     * Genera reporte PDF de asistencia semanal
     */
    async function generarReporteSemanal() {
        console.log('📄 Generando reporte semanal de asistencia...');
        
        const logoBase64 = await cargarLogo();
        
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
        while (fechaInicio.getDay() !== 1) {
            fechaInicio.setDate(fechaInicio.getDate() + 1);
        }
        const fechaFin = new Date(fechaInicio);
        fechaFin.setDate(fechaFin.getDate() + 4);
        
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
        }, logoBase64);
    }

    /**
     * Genera el HTML del reporte y abre ventana para PDF
     */
    function generarHTMLReporte(datos, logoBase64) {
        const fechaActual = new Date().toLocaleString();
        const titulo = datos.tipo === 'diario' ? 
            `REPORTE DIARIO DE ASISTENCIA` :
            `REPORTE SEMANAL DE ASISTENCIA`;
        
        const subtitulo = datos.tipo === 'diario' ?
            `${datos.fecha} - Curso ${datos.curso}` :
            `Semana ${datos.semana} (${datos.fechaInicio} al ${datos.fechaFin}) - Curso ${datos.curso}`;
        
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
                <title>${titulo} - ${datos.curso}</title>
                <style>
                    body {
                        font-family: 'Times New Roman', Times, serif;
                        margin: 2.5cm 2cm;
                        font-size: 12pt;
                        line-height: 1.5;
                    }
                    .header {
                        display: flex;
                        align-items: center;
                        margin-bottom: 30px;
                        border-bottom: 2px solid #003366;
                        padding-bottom: 15px;
                    }
                    .logo {
                        width: 100px;
                        height: 100px;
                        margin-right: 20px;
                    }
                    .logo img {
                        max-width: 100%;
                        max-height: 100%;
                    }
                    .titulo {
                        flex: 1;
                        text-align: center;
                    }
                    .titulo h1 {
                        color: #003366;
                        margin: 0;
                        font-size: 18pt;
                        font-weight: bold;
                    }
                    .titulo h2 {
                        color: #003366;
                        margin: 5px 0;
                        font-size: 14pt;
                        font-weight: normal;
                    }
                    .titulo h3 {
                        color: #003366;
                        margin: 10px 0 0;
                        font-size: 16pt;
                        font-weight: bold;
                    }
                    .info-box {
                        background: #f8f9fa;
                        padding: 15px;
                        border-radius: 8px;
                        margin: 20px 0;
                        border-left: 4px solid #003366;
                        border: 1px solid #003366;
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
                        border: 1px solid #003366;
                    }
                    .stat-card h3 {
                        margin: 0;
                        color: #003366;
                        font-size: 24px;
                        font-weight: bold;
                    }
                    .stat-card p {
                        margin: 5px 0 0;
                        font-weight: bold;
                    }
                    table {
                        width: 100%;
                        border-collapse: collapse;
                        margin: 20px 0;
                        font-size: 11pt;
                    }
                    th {
                        background: #003366;
                        color: white;
                        padding: 10px;
                        text-align: left;
                        font-weight: bold;
                    }
                    td {
                        padding: 8px;
                        border: 1px solid #999;
                    }
                    tr:nth-child(even) {
                        background: #f8f9fa;
                    }
                    .presente {
                        color: #28a745;
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
                        border: 1px solid #003366;
                    }
                    .dia-card {
                        background: white;
                        border: 1px solid #003366;
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
                        border-bottom: 1px solid #003366;
                    }
                    .footer {
                        text-align: center;
                        margin-top: 50px;
                        color: #666;
                        font-size: 10pt;
                        border-top: 1px solid #003366;
                        padding-top: 20px;
                    }
                    .print-button {
                        text-align: center;
                        margin: 30px 0;
                    }
                    .print-button button {
                        background: #003366;
                        color: white;
                        border: none;
                        padding: 12px 30px;
                        border-radius: 5px;
                        font-size: 14px;
                        cursor: pointer;
                        margin-right: 10px;
                    }
                    .print-button button:hover {
                        background: #004499;
                    }
                    @media print {
                        body { margin: 2cm; }
                        .no-print { display: none; }
                    }
                </style>
            </head>
            <body>
                ${generarHeaderConLogo(logoBase64, titulo, subtitulo)}
                
                ${contenido}
                
                <div class="footer">
                    <p>Reporte generado por el Sistema de Gestión de Salones - SENA CEET</p>
                    <p>Fecha de generación: ${fechaActual}</p>
                </div>
                
                <div class="no-print print-button">
                    <button onclick="window.print()">
                        🖨️ GUARDAR PDF
                    </button>
                    <button onclick="window.close()">
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
                        <span style="color: ${registro.asistio ? '#28a745' : '#dc3545'}; font-weight: bold;">
                            ${registro.asistio ? '✅' : '❌'}
                        </span>
                        ${registro.uniforme ? '<br><small style="color: #003366;">👕</small>' : ''}
                    </td>`;
                } else {
                    fila += `<td style="text-align: center; color: #666;">—</td>`;
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
                <table style="font-size: 11px;">
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
                        <div style="background: #e9ecef; height: 20px; border-radius: 10px; overflow: hidden; margin-top: 5px; border: 1px solid #003366;">
                            <div style="background: #28a745; width: ${dia.porcentaje}%; height: 100%; text-align: center; color: white; font-size: 11px;">
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

console.log('✅ ReporteAsistenciaPDF v4.0 cargado');
window.ReporteAsistenciaPDF = ReporteAsistenciaPDF;