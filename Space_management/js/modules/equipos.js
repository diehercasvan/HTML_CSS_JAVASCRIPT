// equipos.js - Módulo de gestión de equipos (TV/Proyectores)
// VERSIÓN COMPLETA - v0.5 - CON CAMPO SERIAL

const EquiposModule = (function() {
    
    /**
     * Abre el modal para agregar un nuevo equipo
     */
    function agregarEquipo() {
        console.log('🔄 Abriendo modal para nuevo equipo...');
        
        // Limpiar formulario
        const form = document.getElementById('formEquipo');
        if (form) form.reset();
        
        document.getElementById('equipoIndex').value = '-1';
        
        // Limpiar campo serial específicamente
        const serialField = document.getElementById('equipoSerial');
        if (serialField) serialField.value = '';
        
        if (!ModalManager.showModal('equipo')) {
            console.error('❌ No se pudo abrir el modal de equipo');
            Utils.showToast('error', 'Error al abrir el formulario');
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
            Utils.showToast('error', 'Equipo no encontrado');
            return;
        }
        
        console.log('📝 Datos del equipo:', eq);
        
        // Asignar valores a los campos
        document.getElementById('equipoIndex').value = index;
        document.getElementById('equipoTipo').value = eq.tipo || '';
        document.getElementById('equipoSerial').value = eq.serial || '';
        document.getElementById('equipoEstado').value = eq.estado || 'Excelente';
        document.getElementById('equipoLimpieza').value = eq.estadoLimpieza || 'Bueno';
        document.getElementById('equipoObservaciones').value = eq.observaciones || '';
        
        ModalManager.showModal('equipo');
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
            Utils.showToast('warning', 'Seleccione un tipo de equipo');
            return;
        }
        
        if (!serial) {
            Utils.showToast('warning', 'Ingrese el serial del equipo');
            return;
        }
        
        if (!estado) {
            Utils.showToast('warning', 'Seleccione el estado del equipo');
            return;
        }
        
        if (!estadoLimpieza) {
            Utils.showToast('warning', 'Seleccione el estado de limpieza');
            return;
        }
        
        // Crear objeto de datos
        const data = {
            tipo,
            serial,
            estado,
            estadoLimpieza,
            observaciones: observaciones || ''
        };
        
        console.log('📦 Datos a guardar:', data);
        
        // Guardar en DataManager
        if (idx >= 0) {
            // Actualizar equipo existente
            const resultado = DataManager.actualizarEquipo?.(idx, data);
            if (resultado) {
                console.log('✅ Equipo actualizado:', data);
                Utils.showToast('success', 'Equipo actualizado');
            } else {
                console.error('❌ Error al actualizar equipo');
                Utils.showToast('error', 'Error al actualizar');
                return;
            }
        } else {
            // Agregar nuevo equipo
            const nuevosEquipos = DataManager.agregarEquipo?.(data);
            if (nuevosEquipos) {
                console.log('✅ Nuevo equipo agregado:', data);
                Utils.showToast('success', 'Equipo agregado');
            } else {
                console.error('❌ Error al agregar equipo');
                Utils.showToast('error', 'Error al agregar');
                return;
            }
        }
        
        // Actualizar tabla
        if (typeof UIManager !== 'undefined' && UIManager.renderizarEquipos) {
            UIManager.renderizarEquipos();
        }
        
        // Cerrar modal
        ModalManager.hideModal('equipo');
    }

    /**
     * Elimina un equipo
     */
    function eliminarEquipo(index) {
        console.log('🗑️ Eliminando equipo índice:', index);
        
        Utils.showConfirm('¿Eliminar equipo?', 'Esta acción no se puede deshacer')
            .then(result => {
                if (result.isConfirmed) {
                    const eliminado = DataManager.eliminarEquipo?.(index);
                    
                    if (eliminado) {
                        if (typeof UIManager !== 'undefined' && UIManager.renderizarEquipos) {
                            UIManager.renderizarEquipos();
                        }
                        console.log('✅ Equipo eliminado');
                        Utils.showToast('success', 'Equipo eliminado');
                    } else {
                        console.error('❌ Error al eliminar equipo');
                        Utils.showToast('error', 'Error al eliminar');
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

    return {
        agregarEquipo,
        editarEquipo,
        guardarEquipo,
        eliminarEquipo,
        cargarEquipos
    };
})();

console.log('✅ Módulo Equipos v0.5 cargado correctamente (con campo serial)');