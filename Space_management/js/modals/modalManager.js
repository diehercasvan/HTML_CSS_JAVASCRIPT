// modalManager.js - Gestión centralizada de modales
// Versión 0.5 - Independiente

const ModalManager = (function() {
    
    // Almacenamiento de modales
    const modales = {};

    /**
     * Inicializa todos los modales de la aplicación
     */
    function inicializarModales() {
        console.log('🔄 Inicializando modales...');
        
        const modalesConfig = [
            { id: 'modalResponsable', nombre: 'responsable' },
            { id: 'modalPuestoDocente', nombre: 'puestoDocente' },
            { id: 'modalEquipo', nombre: 'equipo' },
            { id: 'modalConfigurarPC', nombre: 'configurarPC' },
            { id: 'modalAsignarSilla', nombre: 'asignarSilla' }
        ];
        
        modalesConfig.forEach(config => {
            const elemento = document.getElementById(config.id);
            if (elemento) {
                try {
                    modales[config.nombre] = new bootstrap.Modal(elemento);
                    console.log(`✅ Modal ${config.nombre} inicializado`);
                } catch (e) {
                    console.error(`❌ Error inicializando modal ${config.nombre}:`, e);
                }
            } else {
                console.warn(`⚠️ Modal ${config.id} no encontrado en el DOM`);
            }
        });
        
        return modales;
    }

    /**
     * Obtiene un modal por su nombre
     */
    function getModal(nombre) {
        return modales[nombre] || null;
    }

    /**
     * Muestra un modal
     */
    function showModal(nombre) {
        const modal = modales[nombre];
        if (modal) {
            modal.show();
            return true;
        } else {
            console.error(`❌ Modal ${nombre} no disponible`);
            return false;
        }
    }

    /**
     * Oculta un modal
     */
    function hideModal(nombre) {
        const modal = modales[nombre];
        if (modal) {
            modal.hide();
            return true;
        }
        return false;
    }

    // Inicializar automáticamente
    setTimeout(() => {
        inicializarModales();
    }, 100);

    return {
        inicializarModales,
        getModal,
        showModal,
        hideModal
    };
})();

console.log('✅ ModalManager cargado');