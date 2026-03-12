// js/modules/llamados/generadorPDF.js
// Versión 2.0 - CON DISEÑO IGUAL A PLANES DE MEJORAMIENTO

console.log('🔄 Cargando generadorPDF.js...');

const GeneradorPDF = (function () {

    async function generarPDFLlamado(llamadoId) {
        console.log('📄 Generando PDF para llamado:', llamadoId);

        const llamado = LlamadosData.getLlamadoPorId(llamadoId);
        if (!llamado) {
            Swal.fire('Error', 'Llamado no encontrado', 'error');
            return;
        }

        // Cargar logo
        let logoBase64 = null;
        if (typeof LogoUtils !== 'undefined') {
            logoBase64 = await LogoUtils.cargarLogoDesdeArchivo();
        }

        const contenido = generarHTMLLlamado(llamado, logoBase64);

        const ventana = window.open('', '_blank');
        ventana.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <title>Llamado de Atención - ${llamado.estudiante.nombre}</title>
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
                        font-size: 20pt;
                    }
                    .titulo h2 {
                        color: #003366;
                        margin: 5px 0 0;
                        font-size: 16pt;
                        font-weight: normal;
                    }
                    h2 {
                        color: #003366;
                        font-size: 16pt;
                        margin-top: 25px;
                        border-bottom: 1px solid #003366;
                        padding-bottom: 5px;
                    }
                    table {
                        width: 100%;
                        border-collapse: collapse;
                        margin: 15px 0;
                    }
                    th {
                        background: #003366;
                        color: white;
                        padding: 8px;
                        text-align: left;
                    }
                    td {
                        padding: 8px;
                        border: 1px solid #999;
                    }
                    .info-table td:first-child {
                        width: 200px;
                        font-weight: bold;
                        background: #f0f0f0;
                    }
                    .compromiso-item {
                        background: #f8f9fa;
                        padding: 10px;
                        margin: 5px 0;
                        border-left: 4px solid #dc3545;
                    }
                    .firmas {
                        margin-top: 60px;
                        display: flex;
                        justify-content: space-between;
                    }
                    .firma {
                        text-align: center;
                        width: 30%;
                    }
                    .linea-firma {
                        border-top: 1px solid black;
                        margin-top: 40px;
                        padding-top: 5px;
                    }
                    .footer {
                        margin-top: 50px;
                        text-align: center;
                        font-size: 10pt;
                        color: #666;
                    }
                    @media print {
                        .no-print { display: none; }
                    }
                </style>
            </head>
            <body>
                ${contenido}
                
                <div class="no-print" style="text-align: center; margin-top: 30px;">
                    <button onclick="window.print()" style="padding: 10px 30px; background: #003366; color: white; border: none; border-radius: 5px; cursor: pointer; margin-right: 10px;">
                        🖨️ GUARDAR PDF
                    </button>
                    <button onclick="window.close()" style="padding: 10px 30px; background: #6c757d; color: white; border: none; border-radius: 5px; cursor: pointer;">
                        ❌ CERRAR
                    </button>
                </div>
            </body>
            </html>
        `);
        ventana.document.close();
    }

    function generarHTMLLlamado(llamado, logoBase64) {
        const logoHtml = logoBase64 ?
            `<div class="logo"><img src="${logoBase64}" alt="Logo"></div>` :
            `<div class="logo" style="background: #003366; color: white; display: flex; align-items: center; justify-content: center;">SENA</div>`;

        const compromisosHtml = llamado.compromisos?.map(c => `
            <div class="compromiso-item">
                <p><strong>• ${c.descripcion}</strong> - 
                   <span style="color: ${c.estado === 'cumplido' ? '#28a745' : '#dc3545'};">
                       ${c.estado === 'cumplido' ? '✓ Cumplido' : '⏳ Pendiente'}
                   </span>
                </p>
            </div>
        `).join('') || '<p>No hay compromisos registrados</p>';

        return `
            <div class="header">
                ${logoHtml}
                <div class="titulo">
                    <h1>SERVICIO NACIONAL DE APRENDIZAJE - SENA</h1>
                    <h2>LLAMADO DE ATENCIÓN ${llamado.tipo === 'academico' ? 'ACADÉMICO' : 'DISCIPLINARIO'}</h2>
                </div>
            </div>

            <h2>INFORMACIÓN DEL ESTUDIANTE</h2>
            <table class="info-table">
                <tr><td>Nombres y Apellidos:</td><td>${llamado.estudiante.nombre}</td></tr>
                <tr><td>Documento de Identidad:</td><td>${llamado.estudiante.documento}</td></tr>
                <tr><td>Curso / Grupo:</td><td>${llamado.curso}</td></tr>
                <tr><td>Fecha del Llamado:</td><td>${llamado.fecha}</td></tr>
                <tr><td>Tipo de Llamado:</td><td>${llamado.tipo === 'academico' ? '📚 Académico' : '⚠️ Disciplinario'}</td></tr>
                <tr><td>Nivel / Número:</td><td>${llamado.nivel || 1}</td></tr>
                <tr><td>Docente que reporta:</td><td>${llamado.docente?.nombre || 'No especificado'}</td></tr>
            </table>

            <h2>MOTIVO DEL LLAMADO</h2>
            <p style="background: #f8f9fa; padding: 15px; border-left: 4px solid #dc3545;">
                ${llamado.motivo}
            </p>

            <h2>COMPROMISOS</h2>
            ${compromisosHtml}

            ${llamado.observaciones ? `
                <h2>OBSERVACIONES</h2>
                <p style="background: #f8f9fa; padding: 15px;">${llamado.observaciones}</p>
            ` : ''}

            <h2>COMPROMISOS DEL ESTUDIANTE</h2>
            <ul>
                <li>Cumplir con los compromisos establecidos en las fechas acordadas.</li>
                <li>Asistir a las citaciones programadas por Coordinación.</li>
                <li>Presentar excusas médicas o justificaciones cuando corresponda.</li>
                <li>Comunicar oportunamente cualquier situación que afecte su rendimiento.</li>
            </ul>

            <div class="firmas">
                <div class="firma">
                    <p>_________________________</p>
                    <p><strong>ESTUDIANTE</strong></p>
                    <p>${llamado.estudiante.nombre}</p>
                </div>
                <div class="firma">
                    <p>_________________________</p>
                    <p><strong>DOCENTE</strong></p>
                    <p>${llamado.docente?.nombre || '_________________'}</p>
                </div>
                <div class="firma">
                    <p>_________________________</p>
                    <p><strong>COORDINADOR</strong></p>
                </div>
            </div>

            <div class="footer">
                <p>Documento generado por el Sistema de Gestión de Salones - SENA CEET</p>
                <p>Acuerdo 009 de 2024 - Reglamento del Aprendiz</p>
            </div>
        `;
    }

    return {
        generarPDFLlamado
    };
})();

console.log('✅ GeneradorPDF v2.0 cargado');
window.GeneradorPDF = GeneradorPDF;