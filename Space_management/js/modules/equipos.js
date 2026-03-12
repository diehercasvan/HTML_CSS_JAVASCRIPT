// equipos.js - Módulo de gestión de equipos (TV/Proyectores)
// VERSIÓN 0.6 - COMPLETA Y CORREGIDA

console.log('🔄 Iniciando carga de equipos.js...');

// Verificar dependencias
if (typeof DataManager === 'undefined') {
    console.error('❌ equipos.js: DataManager NO DISPONIBLE');
} else {
    console.log('✅ equipos.js: DataManager disponible');
}

const EquiposModule = (function () {
    console.log('📦 Ejecutando IIFE de EquiposModule...');

    /**
     * Abre el modal para agregar un nuevo equipo
     */
    function agregarEquipo() {
        console.log('🔄 Abriendo modal para nuevo equipo...');

        const form = document.getElementById('formEquipo');
        if (form) form.reset();

        const indexField = document.getElementById('equipoIndex');
        if (indexField) indexField.value = '-1';

        const serialField = document.getElementById('equipoSerial');
        if (serialField) serialField.value = '';

        if (typeof ModalManager !== 'undefined') {
            ModalManager.showModal('equipo');
        } else {
            console.error('❌ ModalManager no disponible');
            if (typeof Utils !== 'undefined') {
                Utils.showToast('error', 'Error al abrir el formulario');
            } else {
                alert('Error al abrir el formulario');
            }
        }
    }

    /**
     * Edita un equipo existente
     */
    function editarEquipo(index) {
        console.log('🔄 Editando equipo índice:', index);

        const equipos = DataManager.getEquipos?.() || [];
        const eq = equipos[index];

        if (!eq) {
            console.error('❌ Equipo no encontrado');
            if (typeof Utils !== 'undefined') {
                Utils.showToast('error', 'Equipo no encontrado');
            }
            return;
        }

        console.log('📝 Datos del equipo:', eq);

        // Asignar valores a los campos
        const campos = [
            { id: 'equipoIndex', valor: index },
            { id: 'equipoTipo', valor: eq.tipo || '' },
            { id: 'equipoSerial', valor: eq.serial || '' },
            { id: 'equipoEstado', valor: eq.estado || 'Excelente' },
            { id: 'equipoLimpieza', valor: eq.estadoLimpieza || 'Bueno' },
            { id: 'equipoObservaciones', valor: eq.observaciones || '' }
        ];

        campos.forEach(campo => {
            const el = document.getElementById(campo.id);
            if (el) {
                el.value = campo.valor;
                console.log(`✅ Campo ${campo.id} asignado:`, campo.valor);
            } else {
                console.warn(`⚠️ Campo ${campo.id} no encontrado`);
            }
        });

        if (typeof ModalManager !== 'undefined') {
            ModalManager.showModal('equipo');
        }
    }

    /**
     * Guarda un equipo (nuevo o editado)
     */
    function guardarEquipo() {
        console.log('💾 Guardando equipo...');

        // Obtener valores del formulario
        const tipo = document.getElementById('equipoTipo')?.value;
        const serial = document.getElementById('equipoSerial')?.value;
        const estado = document.getElementById('equipoEstado')?.value;
        const estadoLimpieza = document.getElementById('equipoLimpieza')?.value;
        const observaciones = document.getElementById('equipoObservaciones')?.value;
        const idx = parseInt(document.getElementById('equipoIndex')?.value || '-1');

        // Validaciones
        if (!tipo) {
            if (typeof Utils !== 'undefined') {
                Utils.showToast('warning', 'Seleccione un tipo de equipo');
            } else {
                alert('Seleccione un tipo de equipo');
            }
            return;
        }

        if (!serial) {
            if (typeof Utils !== 'undefined') {
                Utils.showToast('warning', 'Ingrese el serial del equipo');
            } else {
                alert('Ingrese el serial del equipo');
            }
            return;
        }

        const data = {
            tipo,
            serial,
            estado: estado || 'Excelente',
            estadoLimpieza: estadoLimpieza || 'Bueno',
            observaciones: observaciones || ''
        };

        console.log('📦 Datos a guardar:', data);

        let resultado = false;
        if (idx >= 0) {
            resultado = DataManager.actualizarEquipo?.(idx, data) || false;
            if (resultado && typeof Utils !== 'undefined') {
                Utils.showToast('success', 'Equipo actualizado');
            }
        } else {
            const nuevos = DataManager.agregarEquipo?.(data);
            resultado = !!nuevos;
            if (resultado && typeof Utils !== 'undefined') {
                Utils.showToast('success', 'Equipo agregado');
            }
        }

        if (!resultado && typeof Utils !== 'undefined') {
            Utils.showToast('error', 'Error al guardar');
        }

        // Actualizar tabla
        if (typeof UIManager !== 'undefined' && UIManager.renderizarEquipos) {
            UIManager.renderizarEquipos();
        }

        if (typeof ModalManager !== 'undefined') {
            ModalManager.hideModal('equipo');
        }
    }

    /**
     * Elimina un equipo
     */
    function eliminarEquipo(index) {
        console.log('🗑️ Eliminando equipo índice:', index);

        const confirmar = async () => {
            if (typeof Utils !== 'undefined') {
                const result = await Utils.showConfirm(
                    '¿Eliminar equipo?',
                    'Esta acción no se puede deshacer'
                );
                return result.isConfirmed;
            } else {
                return confirm('¿Eliminar equipo?');
            }
        };

        confirmar().then(confirmed => {
            if (confirmed) {
                const eliminado = DataManager.eliminarEquipo?.(index);

                if (eliminado && typeof UIManager !== 'undefined') {
                    UIManager.renderizarEquipos();
                }

                if (typeof Utils !== 'undefined') {
                    if (eliminado) {
                        Utils.showToast('success', 'Equipo eliminado');
                    } else {
                        Utils.showToast('error', 'Error al eliminar');
                    }
                }
            }
        });
    }

    /**
     * Carga la lista de equipos (para inicialización)
     */
    function cargarEquipos() {
        console.log('🔄 Cargando equipos...');
        const equipos = DataManager.getEquipos?.() || [];
        console.log(`✅ ${equipos.length} equipos cargados`);
        return equipos;
    }

    // Inicializar
    setTimeout(() => {
        cargarEquipos();
    }, 300);

    // Exponer funciones globalmente
    window.agregarEquipo = agregarEquipo;
    window.editarEquipo = editarEquipo;
    window.guardarEquipo = guardarEquipo;
    window.eliminarEquipo = eliminarEquipo;

    const api = {
        agregarEquipo,
        editarEquipo,
        guardarEquipo,
        eliminarEquipo,
        cargarEquipos
    };

    console.log('✅ EquiposModule: API creada');
    return api;
})();

if (typeof EquiposModule !== 'undefined') {
    console.log('✅ EquiposModule v0.6 cargado correctamente');
} else {
    console.error('❌ Error cargando EquiposModule');
}

window.EquiposModule = EquiposModule;