// utils.js - Utilidades comunes
console.log('🔄 Iniciando carga de utils.js...');

const Utils = (function() {
    console.log('📦 Ejecutando IIFE de Utils...');
    
    function getBadgeClass(estado) {
        if (!estado) return 'bg-secondary';
        switch(estado.toLowerCase()) {
            case 'excelente': return 'bg-success';
            case 'bueno': return 'bg-info';
            case 'regular': return 'bg-warning text-dark';
            case 'dañado': case 'malo': return 'bg-danger';
            default: return 'bg-secondary';
        }
    }

    function showToast(tipo, mensaje) {
        Swal.fire({ icon: tipo, title: mensaje, toast: true, position: 'top-end', showConfirmButton: false, timer: 2000 });
    }

    function showConfirm(titulo, texto) {
        return Swal.fire({ title: titulo, text: texto, icon: 'warning', showCancelButton: true, confirmButtonColor: '#d33', confirmButtonText: 'Sí', cancelButtonText: 'Cancelar' });
    }

    function fechaActual() {
        const d = new Date();
        return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
    }

    const api = { getBadgeClass, showToast, showConfirm, fechaActual };
    console.log('✅ Utils: API creada');
    return api;
})();

console.log('✅ Utils cargado:', typeof Utils);
window.Utils = Utils;