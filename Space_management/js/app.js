// app.js - Archivo principal de la aplicación v0.5
// Versión simplificada - solo inicialización

// ===== INICIALIZACIÓN =====
document.addEventListener('DOMContentLoaded', async function() {
    console.log('🚀 Iniciando aplicación v0.5...');
    
    // Verificar dependencias
    if (typeof DataManager === 'undefined') {
        console.error('❌ DataManager no disponible');
        return;
    }
    
    try {
        // Cargar datos guardados
        await DataManager.cargarDeLocalStorage();
        
        // Inicializar UI (debe estar disponible)
        if (typeof UIManager !== 'undefined') {
            await UIManager.inicializarSelectores();
            UIManager.renderizarTablaResponsables();
            UIManager.renderizarPuestosDocentes();
            UIManager.renderizarMesas();
            UIManager.renderizarEquipos();
            UIManager.renderizarSillas();
        }
        
        // Configurar fecha actual
        const hoy = new Date().toISOString().split('T')[0];
        const fechaInput = document.getElementById('fecha');
        if (fechaInput) fechaInput.value = hoy;
        
        const fechaAsistencia = document.getElementById('fechaAsistencia');
        if (fechaAsistencia) fechaAsistencia.value = hoy;
        
        // Configurar texto del toggle
        const toggleText = document.getElementById('toggleConfigText');
        if (toggleText) toggleText.textContent = 'Ocultar';
        
        console.log('✅ Aplicación v0.5 inicializada correctamente');
        
    } catch (error) {
        console.error('❌ Error en inicialización:', error);
    }
});

// Funciones globales de utilidad (para compatibilidad)
window.Utils = Utils;
window.ModalManager = ModalManager;

console.log('✅ App v0.5 cargada');