// js/modules/planes/generadorPlanPDF.js
// Versión 2.0 - CON LOGO Y DISEÑO MEJORADO

console.log('🔄 Cargando generadorPlanPDF.js...');

const GeneradorPlanPDF = (function() {
    
    /**
     * Genera PDF de un plan de mejoramiento
     */
    async function generarPDF(planId) {
        console.log('📄 Generando PDF para plan:', planId);
        
        const plan = PlanesData.getPlanPorId(planId);
        if (!plan) {
            Swal.fire('Error', 'Plan no encontrado', 'error');
            return;
        }
        
        // Cargar logo
        let logoBase64 = null;
        if (typeof LogoUtils !== 'undefined') {
            logoBase64 = await LogoUtils.cargarLogoDesdeArchivo();
        }
        
        // Calcular días restantes
        const hoy = new Date();
        const plazo = new Date(plan.plazoEjecucion);
        const diffTime = plazo - hoy;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        const estadoPlazo = diffDays > 0 ? `${diffDays} días restantes` : 'PLAZO VENCIDO';
        
        // Crear contenido HTML con logo
        const contenido = generarHTMLPlan(plan, diffDays, estadoPlazo, logoBase64);
        
        // Abrir ventana para impresión
        const ventana = window.open('', '_blank');
        ventana.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <title>Plan de Mejoramiento - ${plan.aprendiz.nombre}</title>
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
                        font-weight: bold;
                    }
                    .titulo h2 {
                        color: #003366;
                        margin: 5px 0 0;
                        font-size: 16pt;
                        font-weight: normal;
                    }
                    .titulo p {
                        color: #666;
                        margin: 5px 0 0;
                        font-size: 11pt;
                    }
                    h2 {
                        color: #003366;
                        font-size: 16pt;
                        margin-top: 25px;
                        border-bottom: 1px solid #003366;
                        padding-bottom: 5px;
                    }
                    h3 {
                        font-size: 14pt;
                        margin-top: 20px;
                        margin-bottom: 10px;
                        color: #003366;
                    }
                    h4 {
                        font-size: 12pt;
                        margin-top: 15px;
                        margin-bottom: 5px;
                        font-weight: bold;
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
                        font-weight: normal;
                    }
                    td {
                        padding: 8px;
                        border: 1px solid #999;
                        vertical-align: top;
                    }
                    .info-table {
                        width: 100%;
                        margin: 20px 0;
                        border: 1px solid #003366;
                    }
                    .info-table td {
                        border: 1px solid #003366;
                        padding: 8px;
                    }
                    .info-table td:first-child {
                        width: 200px;
                        font-weight: bold;
                        background: #e6f0ff;
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
                    .estado-vencido {
                        color: #dc3545;
                        font-weight: bold;
                    }
                    .estado-en-curso {
                        color: #28a745;
                        font-weight: bold;
                    }
                    .compromisos {
                        background: #f8f9fa;
                        padding: 10px;
                        border-left: 4px solid #003366;
                        margin: 15px 0;
                    }
                    .badge-estado {
                        display: inline-block;
                        padding: 3px 8px;
                        border-radius: 4px;
                        font-size: 10pt;
                        font-weight: bold;
                    }
                    .badge-activo { background: #ffc107; color: #000; }
                    .badge-completado { background: #28a745; color: #fff; }
                    .footer {
                        margin-top: 50px;
                        text-align: center;
                        font-size: 10pt;
                        color: #666;
                        border-top: 1px solid #ccc;
                        padding-top: 20px;
                    }
                    @media print {
                        .no-print { display: none; }
                        body { margin: 2cm; }
                    }
                </style>
            </head>
            <body>
                ${contenido}
                
                <div class="no-print" style="text-align: center; margin-top: 30px;">
                    <button onclick="window.print()" style="padding: 10px 30px; background: #003366; color: white; border: none; border-radius: 5px; cursor: pointer; font-size: 14px; margin-right: 10px;">
                        🖨️ GUARDAR PDF
                    </button>
                    <button onclick="window.close()" style="padding: 10px 30px; background: #6c757d; color: white; border: none; border-radius: 5px; cursor: pointer; font-size: 14px;">
                        ❌ CERRAR
                    </button>
                </div>
            </body>
            </html>
        `);
        ventana.document.close();
    }

    /**
     * Genera el HTML del plan con logo
     */
    function generarHTMLPlan(plan, diffDays, estadoPlazo, logoBase64) {
        const logoHtml = logoBase64 ? 
            `<div class="logo"><img src="${logoBase64}" alt="Logo SENA"></div>` : 
            `<div class="logo" style="background: #003366; color: white; display: flex; align-items: center; justify-content: center; border-radius: 10px; font-size: 18px; font-weight: bold;">
                SENA
            </div>`;

        const competenciasHtml = plan.competencias.map((comp, idx) => `
            <h3>${idx + 1}. COMPETENCIA: ${comp.nombre}</h3>
            
            <p><strong>RESULTADOS DE APRENDIZAJE NO SUPERADOS:</strong></p>
            <ul>
                ${comp.resultados.map(r => `<li>• ${r}</li>`).join('')}
            </ul>
            
            <h4>ACTIVIDADES DE MEJORAMIENTO:</h4>
            <table>
                <thead>
                    <tr>
                        <th style="width: 5%">No.</th>
                        <th style="width: 40%">ACTIVIDAD A REALIZAR</th>
                        <th style="width: 30%">EVIDENCIA A PRESENTAR</th>
                        <th style="width: 25%">FECHA DE ENTREGA</th>
                    </tr>
                </thead>
                <tbody>
                    ${comp.actividades && comp.actividades.length > 0 ? 
                        comp.actividades.map(a => `
                            <tr>
                                <td>${a.numero}</td>
                                <td>${a.descripcion}</td>
                                <td>${a.evidencia || 'N/A'}</td>
                                <td>${a.fechaEntrega || 'N/A'}</td>
                            </tr>
                        `).join('') : 
                        '<tr><td colspan="4" style="text-align: center;">No hay actividades registradas</td></tr>'
                    }
                </tbody>
            </table>
        `).join('');

        const estadoClase = diffDays > 0 ? 'estado-en-curso' : 'estado-vencido';
        const estadoTexto = diffDays > 0 ? `En curso (${estadoPlazo})` : '⚠️ PLAZO VENCIDO';

        return `
            <div class="header">
                ${logoHtml}
                <div class="titulo">
                    <h1>SERVICIO NACIONAL DE APRENDIZAJE - SENA</h1>
                    <h2>CENTRO DE ELECTRICIDAD, ELECTRÓNICA Y TELECOMUNICACIONES - CEET</h2>
                    <p>Acuerdo 009 de 2024 - Artículo 46</p>
                </div>
            </div>

            <h2>1. INFORMACIÓN GENERAL</h2>
            <table class="info-table">
                <tr><td>PROGRAMA DE FORMACIÓN:</td><td>${plan.curso.nombre}</td></tr>
                <tr><td>GRUPO No.:</td><td>${plan.curso.grupo}</td></tr>
                <tr><td>APRENDIZ:</td><td>${plan.aprendiz.nombre}</td></tr>
                <tr><td>TIPO DE DOCUMENTO:</td><td>${plan.aprendiz.tipoDocumento}</td></tr>
                <tr><td>DOCUMENTO DE IDENTIDAD:</td><td>${plan.aprendiz.documento}</td></tr>
                <tr><td>TELÉFONO / CELULAR:</td><td>${plan.aprendiz.telefono || 'N/A'}</td></tr>
                <tr><td>CORREO ELECTRÓNICO:</td><td>${plan.aprendiz.correo || 'N/A'}</td></tr>
                <tr><td>INSTRUCTOR(ES):</td><td>${plan.instructores.map(i => i.nombre).join(', ')}</td></tr>
                <tr><td>FECHA DE SUSCRIPCIÓN:</td><td>${plan.fechaSuscripcion}</td></tr>
                <tr><td>PLAZO MÁXIMO DE EJECUCIÓN:</td><td>${plan.plazoEjecucion} <span class="${estadoClase}">(${estadoTexto})</span></td></tr>
            </table>

            <h2>2. COMPETENCIAS Y RESULTADOS DE APRENDIZAJE</h2>
            ${competenciasHtml}

            <h2>3. RECURSOS Y ESTRATEGIAS DE APOYO</h2>
            <ul>
                ${plan.recursos && plan.recursos.length > 0 ? 
                    plan.recursos.map(r => `<li>• ${r}</li>`).join('') : 
                    '<li>• No se registraron recursos adicionales</li>'
                }
            </ul>

            <h2>4. COMPROMISOS DEL APRENDIZ</h2>
            <div class="compromisos">
                <ul>
                    <li>• Cumplir con todas las actividades en las fechas establecidas.</li>
                    <li>• Asistir puntualmente a las tutorías programadas.</li>
                    <li>• Comunicar oportunamente cualquier dificultad que se presente.</li>
                    <li>• Dedicar el tiempo necesario para alcanzar los resultados de aprendizaje.</li>
                </ul>
            </div>

            <h2>5. SEGUIMIENTO</h2>
            <p>El instructor realizará acompañamiento durante el desarrollo del plan y verificará el cumplimiento al final del plazo establecido.</p>
            <p>El incumplimiento del presente Plan de Mejoramiento dará lugar a juicio evaluativo como <strong>NO APROBADO</strong> y la citación al COMITÉ DE EVALUACIÓN Y SEGUIMIENTO para definir las medidas sancionatorias aplicables según el Reglamento del Aprendiz (Acuerdo 009 de 2024).</p>

            <div class="firmas">
                <div class="firma">
                    <p>_________________________</p>
                    <p><strong>APRENDIZ</strong></p>
                    <p>${plan.aprendiz.nombre}</p>
                </div>
                <div class="firma">
                    <p>_________________________</p>
                    <p><strong>COORDINADOR ACADÉMICO</strong></p>
                </div>
                <div class="firma">
                    <p>_________________________</p>
                    <p><strong>INSTRUCTOR</strong></p>
                    <p>${plan.instructores.map(i => i.nombre).join(', ')}</p>
                </div>
            </div>
            
            ${plan.observaciones ? `
                <h3>ANEXOS U OBSERVACIONES</h3>
                <p>${plan.observaciones}</p>
            ` : ''}
            
            <div class="footer">
                <p>Documento generado por el Sistema de Gestión de Salones - SENA CEET</p>
                <p>Fecha de generación: ${new Date().toLocaleDateString()} - ${new Date().toLocaleTimeString()}</p>
            </div>
        `;
    }

    return {
        generarPDF
    };
})();

console.log('✅ GeneradorPlanPDF v2.0 cargado');
window.GeneradorPlanPDF = GeneradorPlanPDF;