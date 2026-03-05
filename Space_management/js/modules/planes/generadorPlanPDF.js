// js/modules/planes/generadorPlanPDF.js
// Generador de PDF para Planes de Mejoramiento - Plantilla SENA

console.log('🔄 Cargando generadorPlanPDF.js...');

const GeneradorPlanPDF = (function() {
    
    /**
     * Genera PDF de un plan de mejoramiento
     */
    function generarPDF(planId) {
        console.log('📄 Generando PDF para plan:', planId);
        
        const plan = PlanesData.getPlanPorId(planId);
        if (!plan) {
            Swal.fire('Error', 'Plan no encontrado', 'error');
            return;
        }
        
        // Crear contenido HTML con la estructura de Word
        const contenido = generarHTMLPlan(plan);
        
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
                        margin: 2cm;
                        font-size: 12pt;
                        line-height: 1.5;
                    }
                    h1 {
                        color: #003366;
                        text-align: center;
                        font-size: 16pt;
                        margin-bottom: 5px;
                    }
                    h2 {
                        color: #003366;
                        font-size: 14pt;
                        margin-top: 20px;
                        margin-bottom: 10px;
                    }
                    h3 {
                        font-size: 13pt;
                        margin-top: 15px;
                        margin-bottom: 5px;
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
                        border: 1px solid #ccc;
                    }
                    .header-sena {
                        text-align: center;
                        margin-bottom: 30px;
                    }
                    .header-sena h1 {
                        margin: 0;
                        color: #003366;
                    }
                    .header-sena h2 {
                        margin: 5px 0;
                        color: #003366;
                        font-weight: normal;
                    }
                    .info-table {
                        width: 100%;
                        margin: 20px 0;
                    }
                    .info-table td {
                        border: none;
                        padding: 5px;
                    }
                    .info-table td:first-child {
                        width: 200px;
                        font-weight: bold;
                    }
                    .firmas {
                        margin-top: 50px;
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
                    @media print {
                        .no-print {
                            display: none;
                        }
                    }
                </style>
            </head>
            <body>
                ${contenido}
                
                <div class="no-print" style="text-align: center; margin-top: 30px;">
                    <button onclick="window.print()" style="padding: 10px 20px; background: #003366; color: white; border: none; border-radius: 5px; cursor: pointer;">
                        🖨️ Guardar como PDF
                    </button>
                    <button onclick="window.close()" style="padding: 10px 20px; background: #6c757d; color: white; border: none; border-radius: 5px; cursor: pointer; margin-left: 10px;">
                        ❌ Cerrar
                    </button>
                </div>
            </body>
            </html>
        `);
        ventana.document.close();
    }

    /**
     * Genera el HTML del plan con la estructura de la plantilla Word
     */
    function generarHTMLPlan(plan) {
        const competenciasHtml = plan.competencias.map((comp, idx) => `
            <h3>${idx + 1}. COMPETENCIA: ${comp.nombre}</h3>
            
            <p><strong>RESULTADOS DE APRENDIZAJE NO SUPERADOS:</strong></p>
            <ul>
                ${comp.resultados.map(r => `<li>• ${r}</li>`).join('')}
            </ul>
            
            <h4>ACTIVIDADES Y EVIDENCIAS DE MEJORAMIENTO:</h4>
            <table>
                <thead>
                    <tr>
                        <th>No.</th>
                        <th>ACTIVIDAD A REALIZAR</th>
                        <th>EVIDENCIA A PRESENTAR</th>
                        <th>FECHA DE ENTREGA</th>
                    </tr>
                </thead>
                <tbody>
                    ${comp.actividades.map(a => `
                        <tr>
                            <td>${a.numero}</td>
                            <td>${a.descripcion}</td>
                            <td>${a.evidencia || 'N/A'}</td>
                            <td>${a.fechaEntrega || 'N/A'}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `).join('');

        return `
            <div class="header-sena">
                <h1>SERVICIO NACIONAL DE APRENDIZAJE - SENA</h1>
                <h2>CENTRO DE ELECTRICIDAD, ELECTRÓNICA Y TELECOMUNICACIONES - CEET</h2>
                <h2>PLAN DE MEJORAMIENTO ACADÉMICO</h2>
                <p><strong>Acuerdo 009 de 2024 - Artículo 46</strong></p>
            </div>

            <h2>INFORMACIÓN GENERAL</h2>
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
                <tr><td>PLAZO MÁXIMO DE EJECUCIÓN:</td><td>${plan.plazoEjecucion}</td></tr>
            </table>

            ${competenciasHtml}

            <h2>RECURSOS Y ESTRATEGIAS DE APOYO</h2>
            <ul>
                ${plan.recursos.map(r => `<li>• ${r}</li>`).join('')}
            </ul>

            <h2>COMPROMISOS DEL APRENDIZ</h2>
            <ul>
                <li>• Cumplir con todas las actividades en las fechas establecidas.</li>
                <li>• Asistir puntualmente a las tutorías programadas.</li>
                <li>• Comunicar oportunamente cualquier dificultad que se presente.</li>
                <li>• Dedicar el tiempo necesario para alcanzar los resultados de aprendizaje.</li>
            </ul>

            <h2>SEGUIMIENTO</h2>
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
                <h3>ANEXOS</h3>
                <p>${plan.observaciones}</p>
            ` : ''}
        `;
    }

    return {
        generarPDF
    };
})();

console.log('✅ GeneradorPlanPDF cargado');
window.GeneradorPlanPDF = GeneradorPlanPDF;