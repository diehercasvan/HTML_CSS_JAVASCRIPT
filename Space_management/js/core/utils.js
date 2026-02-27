// utils.js - Utilidades comunes para toda la aplicación
// Versión 0.5 - Independiente

const Utils = (function() {
    
    /**
     * Obtiene la clase CSS según el estado
     */
    function getBadgeClass(estado) {
        if (!estado) return 'bg-secondary';
        switch(estado.toLowerCase()) {
            case 'excelente': return 'bg-success';
            case 'bueno': return 'bg-info';
            case 'regular': return 'bg-warning text-dark';
            case 'dañado':
            case 'malo': return 'bg-danger';
            default: return 'bg-secondary';
        }
    }

    /**
     * Obtiene la clase CSS para el estado de internet
     */
    function getInternetBadgeClass(estado) {
        if (!estado) return 'bg-secondary';
        switch(estado.toLowerCase()) {
            case 'funciona': return 'bg-success';
            case 'lento': return 'bg-warning text-dark';
            case 'no funciona': return 'bg-danger';
            default: return 'bg-secondary';
        }
    }

    /**
     * Muestra una notificación toast
     */
    function showToast(tipo, mensaje) {
        Swal.fire({
            icon: tipo,
            title: mensaje,
            toast: true,
            position: 'top-end',
            showConfirmButton: false,
            timer: 2000
        });
    }

    /**
     * Muestra un mensaje de confirmación
     */
    function showConfirm(titulo, texto) {
        return Swal.fire({
            title: titulo,
            text: texto,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Sí',
            cancelButtonText: 'Cancelar'
        });
    }

    return {
        getBadgeClass,
        getInternetBadgeClass,
        showToast,
        showConfirm
    };
})();

console.log('✅ Utils cargado');