// js/modules/llamados/generadorPDF.js
// Módulo para generar PDF de llamados de atención

console.log('🔄 Cargando generadorPDF.js...');

const GeneradorPDF = (function() {
    
    /**
     * Genera PDF de un llamado de atención
     */
    async function generarPDFLlamado(llamadoId) {
        console.log('📄 Generando PDF para llamado:', llamadoId);
        
        try {
            const llamado = LlamadosData.getLlamadoPorId(llamadoId);
            if (!llamado) {
                Swal.fire('Error', 'Llamado no encontrado', 'error');
                return;
            }
            
            // Crear contenido HTML para el PDF
            const contenido = `
                <div style="padding: 30px; font-family: Arial; max-width: 800px; margin: 0 auto;">
                    <div style="text-align: center; margin-bottom: 30px;">
                        <h1 style="color: #dc3545; margin: 0;">LLAMADO DE ATENCIÓN</h1>
                        <h2 style="color: #666; margin: 5px 0;">${llamado.tipo === 'academico' ? 'ACADÉMICO' : 'DISCIPLINARIO'}</h2>
                        <hr style="border: 2px solid #dc3545;">
                    </div>
                    
                    <div style="margin-bottom: 20px;">
                        <table style="width: 100%; border-collapse: collapse;">
                            <tr>
                                <td style="padding: 8px; background: #f8f9fa;"><strong>Fecha:</strong></td>
                                <td style="padding: 8px;">${llamado.fecha}</td>
                            </tr>
                            <tr>
                                <td style="padding: 8px; background: #f8f9fa;"><strong>Estudiante:</strong></td>
                                <td style="padding: 8px;">${llamado.estudiante.nombre}</td>
                            </tr>
                            <tr>
                                <td style="padding: 8px; background: #f8f9fa;"><strong>Documento:</strong></td>
                                <td style="padding: 8px;">${llamado.estudiante.documento}</td>
                            </tr>
                            <tr>
                                <td style="padding: 8px; background: #f8f9fa;"><strong>Curso:</strong></td>
                                <td style="padding: 8px;">${llamado.curso}</td>
                            </tr>
                            <tr>
                                <td style="padding: 8px; background: #f8f9fa;"><strong>Docente:</strong></td>
                                <td style="padding: 8px;">${llamado.docente?.nombre || 'No especificado'}</td>
                            </tr>
                        </table>
                    </div>
                    
                    <div style="margin-bottom: 20px;">
                        <h3 style="color: #dc3545;">MOTIVO DEL LLAMADO</h3>
                        <p style="padding: 15px; background: #f8f9fa; border-left: 4px solid #dc3545;">
                            ${llamado.motivo}
                        </p>
                    </div>
                    
                    <div style="margin-bottom: 20px;">
                        <h3 style="color: #dc3545;">COMPROMISOS</h3>
                        <ul style="padding: 15px; background: #f8f9fa; border-left: 4px solid #dc3545;">
                            ${llamado.compromisos.map(c => `<li style="margin: 5px 0;">${c.descripcion}</li>`).join('')}
                        </ul>
                    </div>
                    
                    ${llamado.observaciones ? `
                    <div style="margin-bottom: 20px;">
                        <h3 style="color: #dc3545;">OBSERVACIONES</h3>
                        <p style="padding: 15px; background: #f8f9fa; border-left: 4px solid #dc3545;">
                            ${llamado.observaciones}
                        </p>
                    </div>
                    ` : ''}
                    
                    <div style="margin-top: 50px;">
                        <div style="float: left; width: 45%; text-align: center;">
                            <p>_________________________</p>
                            <p><strong>Docente</strong></p>
                        </div>
                        <div style="float: right; width: 45%; text-align: center;">
                            <p>_________________________</p>
                            <p><strong>Acudiente/Estudiante</strong></p>
                        </div>
                        <div style="clear: both;"></div>
                    </div>
                </div>
            `;
            
            // Crear ventana para vista previa
            const ventana = window.open('', '_blank');
            ventana.document.write(`
                <html>
                    <head>
                        <title>Llamado de Atención</title>
                        <style>
                            body { font-family: Arial, sans-serif; margin: 20px; }
                            @media print {
                                .no-print { display: none; }
                            }
                        </style>
                    </head>
                    <body>
                        ${contenido}
                        <div class="no-print" style="text-align: center; margin-top: 20px;">
                            <button onclick="window.print()" style="padding: 10px 20px; background: #0d6efd; color: white; border: none; border-radius: 5px; cursor: pointer;">
                                <i class="fas fa-print"></i> Imprimir / Guardar PDF
                            </button>
                        </div>
                    </body>
                </html>
            `);
            ventana.document.close();
            
        } catch (error) {
            console.error('❌ Error generando PDF:', error);
            Swal.fire('Error', 'No se pudo generar el PDF', 'error');
        }
    }

    // API pública
    return {
        generarPDFLlamado
    };
})();

console.log('✅ GeneradorPDF cargado');
window.GeneradorPDF = GeneradorPDF;