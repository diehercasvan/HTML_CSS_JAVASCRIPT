// js/modules/llamados/notificaciones.js
// Versión 1.0 - COMPARTIR WHATSAPP Y EMAIL

console.log('🔄 Cargando módulo notificaciones.js...');

const Notificaciones = (function() {
    
    /**
     * Prepara mensaje de texto
     */
    function prepararMensaje(llamado) {
        const estado = llamado.estado === 'activo' ? '🟡 Activo' : '✅ Cumplido';
        
        return `
*SENA - Sistema de Gestión*
*LLAMADO DE ATENCIÓN*

*Estudiante:* ${llamado.estudiante?.nombre}
*Documento:* ${llamado.estudiante?.documento}
*Curso:* ${llamado.curso}
*Tipo:* ${llamado.tipo === 'academico' ? '📚 Académico' : '⚠️ Disciplinario'}
*Fecha:* ${llamado.fecha}
*Estado:* ${estado}

*Motivo:*
${llamado.motivo}

*Compromisos:*
${llamado.compromisos?.map(c => `• ${c.descripcion}`).join('\n') || 'Ninguno'}

*Observaciones:* ${llamado.observaciones || 'Ninguna'}

*Docente:* ${llamado.docente?.nombre || 'N/A'}

--- 
Documento generado automáticamente.
        `.trim();
    }

    /**
     * Compartir por WhatsApp
     */
    function compartirWhatsApp(id) {
        const llamado = LlamadosData.getLlamadoPorId(id);
        if (!llamado) return;
        
        const telefono = llamado.estudiante?.telefono || '';
        const mensaje = prepararMensaje(llamado);
        
        if (!telefono) {
            Swal.fire('Sin teléfono', 'El estudiante no tiene número registrado', 'warning');
            return;
        }
        
        const numero = telefono.replace(/\D/g, '');
        const url = `https://wa.me/${numero}?text=${encodeURIComponent(mensaje)}`;
        
        window.open(url, '_blank');
        
        Swal.fire({
            icon: 'success',
            title: 'WhatsApp abierto',
            text: 'Adjunte el PDF manualmente si es necesario',
            timer: 2000,
            showConfirmButton: false
        });
    }

    /**
     * Compartir por Email
     */
    function compartirEmail(id) {
        const llamado = LlamadosData.getLlamadoPorId(id);
        if (!llamado) return;
        
        const email = llamado.estudiante?.correo || '';
        const mensaje = prepararMensaje(llamado);
        const asunto = `Llamado de Atención - ${llamado.estudiante?.nombre}`;
        
        if (!email) {
            Swal.fire('Sin correo', 'El estudiante no tiene email registrado', 'warning');
            return;
        }
        
        const url = `mailto:${email}?subject=${encodeURIComponent(asunto)}&body=${encodeURIComponent(mensaje)}`;
        
        window.location.href = url;
        
        Swal.fire({
            icon: 'success',
            title: 'Cliente de correo abierto',
            text: 'Adjunte el PDF manualmente',
            timer: 2000,
            showConfirmButton: false
        });
    }

    return {
        compartirWhatsApp,
        compartirEmail
    };
})();

console.log('✅ Módulo Notificaciones cargado');
window.Notificaciones = Notificaciones;