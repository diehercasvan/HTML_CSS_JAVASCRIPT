// modalManager.js - Gestión centralizada de modales
// VERSIÓN 0.6 - COMPLETA Y CORREGIDA

console.log('🔄 Iniciando carga de modalManager.js...');

const ModalManager = (function () {
    console.log('📦 Ejecutando IIFE de ModalManager...');

    // Almacenamiento de modales
    const modales = {};

    /**
     * Inicializa todos los modales de la aplicación
     */
    function inicializarModales() {
        console.log('🔄 Inicializando modales...');

        // Verificar que bootstrap está disponible
        if (typeof bootstrap === 'undefined') {
            console.error('❌ Bootstrap no está disponible');
            return;
        }

        const modalesConfig = [
            { id: 'modalResponsable', nombre: 'responsable' },
            { id: 'modalPuestoDocente', nombre: 'puestoDocente' },
            { id: 'modalEquipo', nombre: 'equipo' },
            { id: 'modalConfigurarPC', nombre: 'configurarPC' },
            { id: 'modalAsignarSilla', nombre: 'asignarSilla' }
        ];

        let contador = 0;
        let errores = 0;

        modalesConfig.forEach(config => {
            const elemento = document.getElementById(config.id);
            if (elemento) {
                try {
                    // Verificar que el elemento existe antes de crear el modal
                    if (elemento && typeof bootstrap.Modal === 'function') {
                        modales[config.nombre] = new bootstrap.Modal(elemento);
                        console.log(`✅ Modal ${config.nombre} (${config.id}) inicializado`);
                        contador++;
                    } else {
                        console.error(`❌ bootstrap.Modal no disponible para ${config.id}`);
                        errores++;
                    }
                } catch (e) {
                    console.error(`❌ Error inicializando modal ${config.nombre}:`, e);
                    errores++;
                }
            } else {
                console.warn(`⚠️ Modal ${config.id} no encontrado en el DOM`);
                errores++;
            }
        });

        console.log(`✅ ${contador} modales inicializados correctamente (${errores} errores)`);
        return modales;
    }

    /**
     * Obtiene un modal por su nombre
     */
    function getModal(nombre) {
        const modal = modales[nombre] || null;
        if (!modal) {
            console.warn(`⚠️ Modal ${nombre} no encontrado`);
        }
        return modal;
    }

    /**
     * Muestra un modal
     */
    function showModal(nombre) {
        console.log(`📌 Intentando mostrar modal: ${nombre}`);

        const modal = modales[nombre];
        if (modal) {
            try {
                modal.show();
                console.log(`✅ Modal ${nombre} mostrado`);
                return true;
            } catch (e) {
                console.error(`❌ Error al mostrar modal ${nombre}:`, e);
                return false;
            }
        } else {
            console.error(`❌ Modal ${nombre} no disponible`);

            // Intentar inicializar modales si no están disponibles
            if (Object.keys(modales).length === 0) {
                console.log('🔄 No hay modales inicializados, intentando inicializar...');
                inicializarModales();
                // Reintentar después de un breve retraso
                setTimeout(() => {
                    if (modales[nombre]) {
                        modales[nombre].show();
                        console.log(`✅ Modal ${nombre} mostrado después de reinicializar`);
                    }
                }, 100);
            }
            return false;
        }
    }

    /**
     * Oculta un modal
     */
    function hideModal(nombre) {
        console.log(`📌 Intentando ocultar modal: ${nombre}`);

        const modal = modales[nombre];
        if (modal) {
            try {
                modal.hide();
                console.log(`✅ Modal ${nombre} ocultado`);
                return true;
            } catch (e) {
                console.error(`❌ Error al ocultar modal ${nombre}:`, e);
                return false;
            }
        } else {
            console.warn(`⚠️ Modal ${nombre} no disponible para ocultar`);
            return false;
        }
    }

    /**
     * Alterna un modal (muestra/oculta)
     */
    function toggleModal(nombre) {
        const modal = modales[nombre];
        if (modal) {
            modal.toggle();
            return true;
        }
        return false;
    }

    /**
     * Verifica si un modal existe
     */
    function modalExiste(nombre) {
        return !!modales[nombre];
    }

    /**
     * Lista todos los modales disponibles
     */
    function listarModales() {
        console.log('📋 Modales disponibles:', Object.keys(modales));
        return Object.keys(modales);
    }

    /**
     * Reinicializa un modal específico
     */
    function reinicializarModal(nombre) {
        const config = {
            'responsable': 'modalResponsable',
            'puestoDocente': 'modalPuestoDocente',
            'equipo': 'modalEquipo',
            'configurarPC': 'modalConfigurarPC',
            'asignarSilla': 'modalAsignarSilla'
        };

        const id = config[nombre];
        if (!id) {
            console.error(`❌ Nombre de modal inválido: ${nombre}`);
            return false;
        }

        const elemento = document.getElementById(id);
        if (elemento && typeof bootstrap !== 'undefined' && bootstrap.Modal) {
            try {
                modales[nombre] = new bootstrap.Modal(elemento);
                console.log(`✅ Modal ${nombre} reinicializado`);
                return true;
            } catch (e) {
                console.error(`❌ Error reinicializando modal ${nombre}:`, e);
                return false;
            }
        }
        return false;
    }

    // Inicializar automáticamente después de que el DOM esté listo
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            console.log('📌 DOMContentLoaded - Inicializando modales...');
            setTimeout(inicializarModales, 100); // Pequeño retraso para asegurar que todo esté cargado
        });
    } else {
        console.log('📌 DOM ya cargado - Inicializando modales...');
        setTimeout(inicializarModales, 100);
    }

    // También intentar inicializar después de un tiempo si algo falla
    setTimeout(() => {
        if (Object.keys(modales).length === 0) {
            console.log('⚠️ No hay modales inicializados, reintentando...');
            inicializarModales();
        }
    }, 500);

    // API pública
    const api = {
        inicializarModales,
        getModal,
        showModal,
        hideModal,
        toggleModal,
        modalExiste,
        listarModales,
        reinicializarModal
    };

    console.log('✅ ModalManager: API creada');
    return api;
})();

// Verificar que ModalManager se cargó correctamente
if (typeof ModalManager !== 'undefined') {
    console.log('✅ ModalManager v0.6 cargado correctamente');
    console.log('📋 Funciones disponibles:', Object.keys(ModalManager));
} else {
    console.error('❌ Error cargando ModalManager');
}

// Exponer globalmente (por si acaso)
window.ModalManager = ModalManager;

// Script de diagnóstico para verificar modales
window.diagnosticarModales = function () {
    console.log('=== DIAGNÓSTICO DE MODALES ===');

    const modalesIds = [
        'modalResponsable',
        'modalPuestoDocente',
        'modalEquipo',
        'modalConfigurarPC',
        'modalAsignarSilla'
    ];

    console.log('🔍 Verificando elementos en DOM:');
    modalesIds.forEach(id => {
        const el = document.getElementById(id);
        console.log(`- ${id}: ${el ? '✅' : '❌'}`);
        if (el) {
            console.log(`  • Clases: ${el.className}`);
            console.log(`  • Display: ${el.style.display}`);
        }
    });

    console.log('\n🔍 Verificando modales inicializados:');
    const modalesInicializados = ModalManager.listarModales();
    console.log('- Inicializados:', modalesInicializados);

    console.log('\n🔍 Verificando Bootstrap:');
    console.log('- bootstrap:', typeof bootstrap);
    console.log('- bootstrap.Modal:', typeof bootstrap?.Modal);
};