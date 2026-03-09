// reportes.js - Módulo profesional de reportes v0.7
// VERSIÓN CON LOGO Y DISEÑO MEJORADO

console.log('🔄 Iniciando carga de reportes.js...');

// Verificar dependencias
if (typeof DataManager === 'undefined') {
    console.error('❌ reportes.js: DataManager NO DISPONIBLE');
} else {
    console.log('✅ reportes.js: DataManager disponible');
}

const Reportes = (function () {
    console.log('📦 Ejecutando IIFE de Reportes...');

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
     * Genera el header con logo para los reportes
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
     * Genera un reporte profesional completo con todos los datos
     */
    async function generarReporteProfesional() {
        console.log('📊 Generando reporte profesional...');

        try {
            const datos = DataManager.exportarDatos ? DataManager.exportarDatos() : null;
            const logoBase64 = await cargarLogo();

            if (!datos) {
                if (typeof Swal !== 'undefined') {
                    Swal.fire({
                        icon: 'warning',
                        title: 'Sin datos',
                        text: 'No hay datos para generar el reporte'
                    });
                } else {
                    alert('No hay datos');
                }
                return;
            }

            // Obtener curso actual
            let cursoActual = sessionStorage.getItem('cursoMesasSeleccionado') ||
                document.getElementById('cursoSillas')?.value ||
                document.getElementById('cursoAsistencia')?.value;

            // Si no hay curso seleccionado, tomar el primer curso con datos
            if (!cursoActual || cursoActual === '') {
                if (datos.mesas && datos.mesas.length > 0) {
                    cursoActual = datos.mesas[0].curso;
                } else if (datos.sillas && datos.sillas.length > 0) {
                    cursoActual = datos.sillas[0].curso;
                } else {
                    cursoActual = 'TODOS';
                }
            }

            console.log(`📌 Curso seleccionado para reporte: ${cursoActual}`);

            // Obtener responsable del curso
            let responsable = null;
            if (cursoActual !== 'TODOS') {
                responsable = datos.responsables?.find(r => r.numeroCurso === cursoActual);
            }
            if (!responsable && datos.responsables && datos.responsables.length > 0) {
                responsable = datos.responsables[0];
            }

            // Obtener horario de la clase
            const horarioClase = responsable ?
                `${responsable.horarioInicio || 'N/A'} - ${responsable.horarioFin || 'N/A'}` :
                'No registrado';

            // Filtrar datos por curso
            let datosFiltrados = { ...datos };

            if (cursoActual !== 'TODOS') {
                datosFiltrados = {
                    ...datos,
                    responsables: datos.responsables?.filter(r => r.numeroCurso === cursoActual) || [],
                    mesas: datos.mesas?.filter(m => m.curso === cursoActual) || [],
                    sillas: datos.sillas?.filter(s => s.curso === cursoActual) || [],
                    asistencia: datos.asistencia?.filter(a => a.curso === cursoActual) || []
                };
            }

            const fechaActual = new Date();
            const fechaReporte = fechaActual.toLocaleDateString();
            const horaReporte = fechaActual.toLocaleTimeString();

            const titulo = cursoActual !== 'TODOS' ?
                `REPORTE DEL CURSO ${cursoActual}` :
                `REPORTE GENERAL`;

            // Calcular estadísticas de mesas y PCs
            const totalMesas = datosFiltrados.mesas?.length || 0;
            let totalPCs = 0;
            let PCsAsignados = 0;
            let PCsExcelente = 0;
            let PCsBueno = 0;
            let PCsRegular = 0;
            let PCsDanado = 0;

            datosFiltrados.mesas?.forEach(mesa => {
                totalPCs += mesa.pcs?.length || 0;
                PCsAsignados += mesa.pcs?.filter(pc => pc.estudiante).length || 0;

                mesa.pcs?.forEach(pc => {
                    switch (pc.estado?.toLowerCase()) {
                        case 'excelente': PCsExcelente++; break;
                        case 'bueno': PCsBueno++; break;
                        case 'regular': PCsRegular++; break;
                        case 'dañado': PCsDanado++; break;
                    }
                });
            });

            // Calcular estadísticas de sillas
            const totalSillas = datosFiltrados.sillas?.length || 0;
            const sillasOcupadas = datosFiltrados.sillas?.filter(s => s.documento).length || 0;

            // Calcular estadísticas de equipos
            const totalEquipos = datosFiltrados.equipos?.length || 0;
            let equiposExcelente = 0, equiposBueno = 0, equiposRegular = 0, equiposDanado = 0;

            datosFiltrados.equipos?.forEach(e => {
                switch (e.estado?.toLowerCase()) {
                    case 'excelente': equiposExcelente++; break;
                    case 'bueno': equiposBueno++; break;
                    case 'regular': equiposRegular++; break;
                    case 'dañado': equiposDanado++; break;
                }
            });

            // Generar el HTML con los datos calculados
            const contenidoHTML = `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <title>Reporte ${cursoActual !== 'TODOS' ? `Curso ${cursoActual}` : 'General'}</title>
                <style>
                    body { 
                        font-family: 'Times New Roman', Times, serif;
                        margin: 2.5cm 2cm;
                        font-size: 12pt;
                        line-height: 1.5;
                        color: #333;
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
                    .info-grid {
                        display: grid;
                        grid-template-columns: repeat(4, 1fr);
                        gap: 10px;
                        margin: 20px 0;
                        background: #f8f9fa;
                        padding: 15px;
                        border-radius: 8px;
                        border: 1px solid #003366;
                    }
                    .info-item {
                        text-align: center;
                    }
                    .info-label {
                        font-weight: bold;
                        color: #003366;
                        margin-bottom: 3px;
                        font-size: 10pt;
                    }
                    .info-value {
                        font-size: 11pt;
                    }
                    .observaciones-box {
                        grid-column: span 4;
                        background: #e9ecef;
                        padding: 10px;
                        border-radius: 5px;
                        margin-top: 10px;
                        border-left: 4px solid #003366;
                    }
                    .stats-grid {
                        display: grid;
                        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                        gap: 15px;
                        margin: 25px 0;
                    }
                    .stat-card {
                        background: #f8f9fa;
                        border-radius: 8px;
                        padding: 15px;
                        text-align: center;
                        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                        border-left: 4px solid #003366;
                        border: 1px solid #003366;
                    }
                    .stat-card h3 { 
                        font-size: 24pt; 
                        margin: 0; 
                        color: #003366; 
                    }
                    .stat-card p { 
                        margin: 5px 0 0; 
                        color: #666;
                        font-weight: bold;
                    }
                    .stat-card .sub-stats {
                        margin-top: 8px;
                        font-size: 10pt;
                        color: #666;
                        border-top: 1px dashed #ccc;
                        padding-top: 5px;
                    }
                    .indicador-estado {
                        display: flex;
                        justify-content: space-around;
                        margin: 20px 0;
                        padding: 15px;
                        background: white;
                        border-radius: 8px;
                        border: 1px solid #003366;
                    }
                    .indicador-item {
                        text-align: center;
                    }
                    .indicador-color {
                        width: 20px;
                        height: 20px;
                        border-radius: 50%;
                        margin: 0 auto 5px;
                    }
                    .color-excelente { background-color: #28a745; }
                    .color-bueno { background-color: #17a2b8; }
                    .color-regular { background-color: #ffc107; }
                    .color-danado { background-color: #dc3545; }
                    .section-title {
                        color: #003366;
                        font-size: 16pt;
                        margin: 30px 0 15px;
                        padding-bottom: 5px;
                        border-bottom: 2px solid #003366;
                        font-weight: bold;
                    }
                    table {
                        width: 100%;
                        border-collapse: collapse;
                        margin: 15px 0;
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
                        vertical-align: top;
                    }
                    tr:nth-child(even) {
                        background: #f8f9fa;
                    }
                    .badge {
                        display: inline-block;
                        padding: 3px 8px;
                        border-radius: 4px;
                        font-size: 10pt;
                        font-weight: bold;
                    }
                    .badge-excelente { background: #28a745; color: white; }
                    .badge-bueno { background: #17a2b8; color: white; }
                    .badge-regular { background: #ffc107; color: black; }
                    .badge-danado { background: #dc3545; color: white; }
                    .badge-success { background: #28a745; color: white; }
                    .badge-warning { background: #ffc107; color: black; }
                    .badge-danger { background: #dc3545; color: white; }
                    .badge-info { background: #17a2b8; color: white; }
                    .resumen-tabla {
                        margin: 20px 0;
                        background: #f8f9fa;
                        padding: 15px;
                        border-radius: 8px;
                        border: 1px solid #003366;
                    }
                    .resumen-tabla h3 {
                        color: #003366;
                        margin-top: 0;
                    }
                    .footer {
                        text-align: center;
                        margin-top: 50px;
                        color: #666;
                        font-size: 10pt;
                        border-top: 1px solid #003366;
                        padding-top: 20px;
                    }
                    @media print {
                        body { margin: 2cm; }
                        .no-print { display: none; }
                    }
                    .print-button {
                        text-align: center;
                        margin: 20px 0;
                    }
                    .print-button button {
                        background: #003366;
                        color: white;
                        border: none;
                        padding: 12px 30px;
                        border-radius: 5px;
                        font-size: 14px;
                        cursor: pointer;
                        box-shadow: 0 2px 5px rgba(0,0,0,0.2);
                    }
                    .print-button button:hover {
                        background: #004499;
                    }
                </style>
            </head>
            <body>
                ${generarHeaderConLogo(logoBase64, titulo, `Generado: ${fechaReporte} - ${horaReporte}`)}

                <!-- Información del Reporte y Responsable -->
                <div class="info-grid">
                    <div class="info-item">
                        <div class="info-label">Fecha del Reporte</div>
                        <div class="info-value">${fechaReporte}</div>
                    </div>
                    <div class="info-item">
                        <div class="info-label">Hora</div>
                        <div class="info-value">${horaReporte}</div>
                    </div>
                    <div class="info-item">
                        <div class="info-label">Responsable</div>
                        <div class="info-value">${responsable?.nombre || 'No asignado'}</div>
                    </div>
                    <div class="info-item">
                        <div class="info-label">Documento</div>
                        <div class="info-value">${responsable?.documento || 'N/A'}</div>
                    </div>
                    <div class="info-item">
                        <div class="info-label">Salón</div>
                        <div class="info-value">${responsable?.numeroSalon || 'No asignado'}</div>
                    </div>
                    <div class="info-item">
                        <div class="info-label">Horario</div>
                        <div class="info-value">${horarioClase}</div>
                    </div>
                    <div class="info-item">
                        <div class="info-label">Fecha Clase</div>
                        <div class="info-value">${responsable?.fecha || 'N/A'}</div>
                    </div>
                    <div class="info-item">
                        <div class="info-label">Estado Salón</div>
                        <div class="info-value">
                            <span class="badge badge-${(responsable?.estadoEquipo || '').toLowerCase()}">
                                ${responsable?.estadoEquipo || 'N/A'}
                            </span>
                        </div>
                    </div>
                    ${responsable?.observaciones ? `
                    <div class="observaciones-box">
                        <div class="info-label">Observaciones</div>
                        <div class="info-value">${responsable.observaciones}</div>
                    </div>
                    ` : ''}
                </div>

                <!-- Estadísticas Generales -->
                <div class="stats-grid">
                    <div class="stat-card">
                        <h3>${totalMesas}</h3>
                        <p>Total Mesas</p>
                        <div class="sub-stats">Configuración del salón</div>
                    </div>
                    <div class="stat-card">
                        <h3>${totalPCs}</h3>
                        <p>Total PCs</p>
                        <div class="sub-stats">Asignados: ${PCsAsignados} | Libres: ${totalPCs - PCsAsignados}</div>
                    </div>
                    <div class="stat-card">
                        <h3>${datosFiltrados.puestosDocentes?.length || 0}</h3>
                        <p>Puestos Docentes</p>
                        <div class="sub-stats">Equipos de cómputo docente</div>
                    </div>
                    <div class="stat-card">
                        <h3>${totalSillas}</h3>
                        <p>Total Sillas</p>
                        <div class="sub-stats">Ocupadas: ${sillasOcupadas} | Libres: ${totalSillas - sillasOcupadas}</div>
                    </div>
                    <div class="stat-card">
                        <h3>${totalEquipos}</h3>
                        <p>Equipos Audiovisuales</p>
                        <div class="sub-stats">TV, Proyectores, etc.</div>
                    </div>
                </div>

                <!-- Indicador de Estado de PCs -->
                <div class="indicador-estado">
                    <div class="indicador-item">
                        <div class="indicador-color color-excelente"></div>
                        <div>Excelente: ${PCsExcelente}</div>
                    </div>
                    <div class="indicador-item">
                        <div class="indicador-color color-bueno"></div>
                        <div>Bueno: ${PCsBueno}</div>
                    </div>
                    <div class="indicador-item">
                        <div class="indicador-color color-regular"></div>
                        <div>Regular: ${PCsRegular}</div>
                    </div>
                    <div class="indicador-item">
                        <div class="indicador-color color-danado"></div>
                        <div>Dañado: ${PCsDanado}</div>
                    </div>
                </div>

                ${generarTablaPuestosDocentes(datosFiltrados.puestosDocentes)}
                ${generarTablaMesas(datosFiltrados.mesas)}
                ${generarTablaSillas(datosFiltrados.sillas)}
                ${generarTablaEquipos(datosFiltrados.equipos)}
                
                <!-- Resumen de Asignaciones -->
                <div class="resumen-tabla">
                    <h3>📋 Resumen de Asignaciones</h3>
                    <table>
                        <thead>
                            <tr>
                                <th>Tipo</th>
                                <th>Total</th>
                                <th>Asignados</th>
                                <th>Disponibles</th>
                                <th>% Ocupación</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>PCs</td>
                                <td>${totalPCs}</td>
                                <td>${PCsAsignados}</td>
                                <td>${totalPCs - PCsAsignados}</td>
                                <td>${totalPCs > 0 ? Math.round((PCsAsignados / totalPCs) * 100) : 0}%</td>
                            </tr>
                            <tr>
                                <td>Sillas</td>
                                <td>${totalSillas}</td>
                                <td>${sillasOcupadas}</td>
                                <td>${totalSillas - sillasOcupadas}</td>
                                <td>${totalSillas > 0 ? Math.round((sillasOcupadas / totalSillas) * 100) : 0}%</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                
                <div class="footer">
                    <p>Reporte generado por el Sistema de Gestión de Salones - SENA CEET</p>
                    <p>Total de registros: ${calcularTotalRegistros(datosFiltrados)}</p>
                </div>

                <!-- Botón para imprimir -->
                <div class="no-print print-button">
                    <button onclick="window.print()">
                        <i class="fas fa-print"></i> Imprimir / Guardar PDF
                    </button>
                </div>
            </body>
            </html>
        `;

            const ventana = window.open('', '_blank');
            ventana.document.write(contenidoHTML);
            ventana.document.close();
            ventana.focus();

            console.log('✅ Reporte generado');

        } catch (error) {
            console.error('❌ Error:', error);
            if (typeof Swal !== 'undefined') {
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'No se pudo generar el reporte'
                });
            }
        }
    }

    function generarTablaPuestosDocentes(puestos) {
        if (!puestos || puestos.length === 0) return '';

        let html = '<div class="section-title">👨‍🏫 Puestos Docentes</div>';
        html += '<table><thead><tr><th>Nombre</th><th>Documento</th><th>Serial PC</th><th>Estado PC</th><th>Mouse</th><th>Teclado</th><th>Pantalla</th><th>Internet</th><th>Limpieza</th></tr></thead><tbody>';

        puestos.forEach(p => {
            html += `
                <tr>
                    <td>${p.nombre || ''}</td>
                    <td>${p.documento || ''}</td>
                    <td>${p.serial || ''}</td>
                    <td><span class="badge badge-${(p.estado || '').toLowerCase()}">${p.estado || ''}</span></td>
                    <td><span class="badge badge-${(p.mouse || '').toLowerCase()}">${p.mouse || ''}</span></td>
                    <td><span class="badge badge-${(p.teclado || '').toLowerCase()}">${p.teclado || ''}</span></td>
                    <td><span class="badge badge-${(p.pantalla || '').toLowerCase()}">${p.pantalla || ''}</span></td>
                    <td><span class="badge badge-${(p.internet || '').toLowerCase()}">${p.internet || ''}</span></td>
                    <td><span class="badge badge-${(p.estadoLimpieza || '').toLowerCase()}">${p.estadoLimpieza || ''}</span></td>
                </tr>
            `;
        });

        html += '</tbody></table>';
        return html;
    }

    function generarTablaMesas(mesas) {
        if (!mesas || mesas.length === 0) return '';

        let html = '<div class="section-title">🖥️ Mesas y Equipos de Cómputo</div>';

        mesas.forEach((mesa, idx) => {
            const PCsMesa = mesa.pcs?.length || 0;
            const PCsAsignadosMesa = mesa.pcs?.filter(pc => pc.estudiante).length || 0;

            html += `<h3>Mesa ${idx + 1} (Fila ${mesa.fila + 1}, Columna ${mesa.columna + 1}) - ${PCsMesa} PCs (${PCsAsignadosMesa} asignados)</h3>`;
            html += '<table><thead><tr><th>PC</th><th>Serial</th><th>Estudiante</th><th>Documento</th><th>Estado PC</th><th>Mouse</th><th>Teclado</th><th>Pantalla</th><th>Internet</th><th>Limpieza</th></tr></thead><tbody>';

            mesa.pcs?.forEach((pc, i) => {
                html += `
                    <tr>
                        <td>PC ${i + 1}</td>
                        <td>${pc.serial || ''}</td>
                        <td>${pc.estudiante || 'Sin asignar'}</td>
                        <td>${pc.documento || ''}</td>
                        <td><span class="badge badge-${(pc.estado || '').toLowerCase()}">${pc.estado || ''}</span></td>
                        <td><span class="badge badge-${(pc.mouse || '').toLowerCase()}">${pc.mouse || ''}</span></td>
                        <td><span class="badge badge-${(pc.teclado || '').toLowerCase()}">${pc.teclado || ''}</span></td>
                        <td><span class="badge badge-${(pc.pantalla || '').toLowerCase()}">${pc.pantalla || ''}</span></td>
                        <td><span class="badge badge-${(pc.internet || '').toLowerCase()}">${pc.internet || ''}</span></td>
                        <td><span class="badge badge-${(pc.estadoLimpieza || '').toLowerCase()}">${pc.estadoLimpieza || ''}</span></td>
                    </tr>
                `;
            });

            html += '</tbody></table>';
        });

        return html;
    }

    function generarTablaSillas(sillas) {
        if (!sillas || sillas.length === 0) return '';

        let html = '<div class="section-title">🪑 Asignación de Sillas</div>';
        html += '<table><thead><tr><th>Silla</th><th>Serial</th><th>Estudiante</th><th>Documento</th><th>Estado</th></tr></thead><tbody>';

        sillas.forEach(s => {
            html += `
                <tr>
                    <td>Silla ${s.numero || ''}</td>
                    <td>${s.serial || ''}</td>
                    <td>${s.nombreEstudiante || 'Disponible'}</td>
                    <td>${s.documento || ''}</td>
                    <td><span class="badge badge-${(s.estado || '').toLowerCase()}">${s.estado || ''}</span></td>
                </tr>
            `;
        });

        html += '</tbody></table>';
        return html;
    }

    function generarTablaEquipos(equipos) {
        if (!equipos || equipos.length === 0) return '';

        let html = '<div class="section-title">📺 TV y Proyectores</div>';
        html += '<table><thead><tr><th>Tipo</th><th>Serial</th><th>Estado</th><th>Limpieza</th><th>Observaciones</th></tr></thead><tbody>';

        equipos.forEach(e => {
            html += `
                <tr>
                    <td>${e.tipo || ''}</td>
                    <td>${e.serial || ''}</td>
                    <td><span class="badge badge-${(e.estado || '').toLowerCase()}">${e.estado || ''}</span></td>
                    <td><span class="badge badge-${(e.estadoLimpieza || '').toLowerCase()}">${e.estadoLimpieza || ''}</span></td>
                    <td>${e.observaciones || ''}</td>
                </tr>
            `;
        });

        html += '</tbody></table>';
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
    function mostrarHistorial() {
        const historial = DataManager.getHistorial ? DataManager.getHistorial() : [];

        if (historial.length === 0) {
            if (typeof Swal !== 'undefined') {
                Swal.fire({
                    icon: 'info',
                    title: 'Sin historial',
                    text: 'No hay snapshots guardados'
                });
            }
            return;
        }

        let html = '<div style="max-height: 400px; overflow-y: auto;">';
        html += '<table style="width: 100%; border-collapse: collapse;">';
        html += '<thead><tr style="background: #003366; color: white;"><th>Fecha</th><th>Hora</th><th>Acciones</th></tr></thead><tbody>';

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

        if (typeof Swal !== 'undefined') {
            Swal.fire({
                title: '📚 Historial de Snapshots',
                html: html,
                width: '800px',
                showConfirmButton: true,
                confirmButtonText: 'Cerrar'
            });
        }
    }

    function guardarSnapshot() {
        const snapshot = DataManager.guardarSnapshot ? DataManager.guardarSnapshot() : null;

        if (snapshot && typeof Swal !== 'undefined') {
            Swal.fire({
                icon: 'success',
                title: 'Snapshot guardado',
                text: `Fecha: ${snapshot.fecha} - ${snapshot.hora}`,
                timer: 2000,
                showConfirmButton: false
            });
        } else if (typeof Swal !== 'undefined') {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'No se pudo guardar el snapshot'
            });
        }
    }

    window.cargarSnapshot = function (id) {
        if (typeof Swal !== 'undefined') {
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
        }
    };

    window.verSnapshot = function (id) {
        const historial = DataManager.getHistorial ? DataManager.getHistorial() : [];
        const snapshot = historial.find(h => h.id === id);

        if (snapshot && typeof Swal !== 'undefined') {
            Swal.fire({
                title: `Snapshot ${snapshot.fecha} ${snapshot.hora}`,
                html: `
                    <p><strong>Responsables:</strong> ${snapshot.datos.responsables?.length || 0}</p>
                    <p><strong>Puestos Docentes:</strong> ${snapshot.datos.puestosDocentes?.length || 0}</p>
                    <p><strong>Mesas:</strong> ${snapshot.datos.mesas?.length || 0}</p>
                    <p><strong>Sillas:</strong> ${snapshot.datos.sillas?.length || 0}</p>
                    <p><strong>Equipos:</strong> ${snapshot.datos.equipos?.length || 0}</p>
                    <p><strong>Asistencias:</strong> ${snapshot.datos.asistencia?.length || 0}</p>
                `,
                icon: 'info',
                confirmButtonText: 'Cerrar'
            });
        }
    };

    function exportarHistorialCompleto() {
        const datos = DataManager.exportarHistorialCompleto ? DataManager.exportarHistorialCompleto() : null;

        if (!datos) {
            if (typeof Swal !== 'undefined') {
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'No se pudo exportar el historial'
                });
            }
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

        if (typeof Swal !== 'undefined') {
            Swal.fire({
                icon: 'success',
                title: 'Historial exportado',
                text: `Archivo: historial-completo-${fecha}.json`,
                timer: 2000,
                showConfirmButton: false
            });
        }
    }

    // API pública
    const api = {
        generarReporteProfesional,
        mostrarHistorial,
        guardarSnapshot,
        exportarHistorialCompleto
    };

    console.log('✅ Reportes v0.7: API creada');
    return api;
})();

if (typeof Reportes !== 'undefined') {
    console.log('✅ Reportes v0.7 cargado correctamente');
} else {
    console.error('❌ Error cargando Reportes');
}

window.Reportes = Reportes;
window.generarReporteCompleto = () => Reportes.generarReporteProfesional();