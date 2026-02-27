// sillas.js - Módulo de gestión de sillas
// VERSIÓN MEJORADA - v0.5 - Con limpieza y control de ocupación

const SillasModule = (function() {
    
    // ===== FUNCIONES PRINCIPALES =====
    
    /**
     * Crea nuevas sillas para un curso (reemplaza las existentes)
     */
    function crearSillas() {
        console.log('🔄 Creando sillas...');
        
        const num = parseInt(document.getElementById('numeroSillas')?.value);
        const curso = document.getElementById('cursoSillas')?.value;
        
        if (!num || num < 1) {
            Utils.showToast('warning', 'Ingrese un número válido de sillas');
            return;
        }
        
        if (!curso) {
            Utils.showToast('warning', 'Seleccione un curso');
            return;
        }
        
        if (num > 100) {
            Utils.showToast('warning', 'Máximo 100 sillas por curso');
            return;
        }
        
        // Verificar si ya existen sillas para este curso
        const sillasExistentes = DataManager.getSillasPorCurso?.(curso) || [];
        
        if (sillasExistentes.length > 0) {
            // Preguntar si desea reemplazar
            Swal.fire({
                title: '¿Reemplazar sillas?',
                text: `Ya existen ${sillasExistentes.length} sillas para este curso. ¿Desea reemplazarlas con ${num} sillas nuevas?`,
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#d33',
                cancelButtonColor: '#3085d6',
                confirmButtonText: 'Sí, reemplazar',
                cancelButtonText: 'Cancelar'
            }).then((result) => {
                if (result.isConfirmed) {
                    // Eliminar sillas existentes del curso
                    eliminarSillasPorCurso(curso);
                    // Crear nuevas sillas
                    crearNuevasSillas(num, curso);
                }
            });
        } else {
            // No hay sillas existentes, crear directamente
            crearNuevasSillas(num, curso);
        }
    }

    /**
     * Crea nuevas sillas (función interna)
     */
    function crearNuevasSillas(num, curso) {
        // Configurar nuevas sillas
        DataManager.configurarSillas?.(num, curso);
        
        // Actualizar vista
        if (typeof UIManager !== 'undefined') {
            UIManager.renderizarSillas();
            actualizarEstadisticas(curso);
        }
        
        Utils.showToast('success', `${num} sillas creadas para el curso ${curso}`);
    }

    /**
     * Elimina todas las sillas de un curso específico
     */
    function eliminarSillasPorCurso(curso) {
        console.log('🗑️ Eliminando sillas del curso:', curso);
        
        const todasLasSillas = DataManager.getSillas?.() || [];
        const sillasAConservar = todasLasSillas.filter(s => s.curso !== curso);
        
        // Actualizar el estado en DataManager
        if (DataManager.actualizarSillas) {
            DataManager.actualizarSillas(sillasAConservar);
        } else {
            // Si no hay función específica, trabajar directamente
            const state = DataManager.getState?.();
            if (state) {
                state.sillas = sillasAConservar;
                DataManager.guardarEnLocalStorage?.();
            }
        }
        
        console.log(`✅ Sillas del curso ${curso} eliminadas`);
    }

    /**
     * Limpia todas las sillas de un curso (con confirmación)
     */
    function limpiarSillasCurso() {
        const curso = document.getElementById('cursoSillas')?.value;
        
        if (!curso) {
            Utils.showToast('warning', 'Seleccione un curso');
            return;
        }
        
        const sillasExistentes = DataManager.getSillasPorCurso?.(curso) || [];
        
        if (sillasExistentes.length === 0) {
            Utils.showToast('info', 'No hay sillas para limpiar en este curso');
            return;
        }
        
        Swal.fire({
            title: '¿Limpiar sillas?',
            text: `Se eliminarán todas las ${sillasExistentes.length} sillas del curso ${curso}. Esta acción no se puede deshacer.`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Sí, limpiar todo',
            cancelButtonText: 'Cancelar'
        }).then((result) => {
            if (result.isConfirmed) {
                eliminarSillasPorCurso(curso);
                
                if (typeof UIManager !== 'undefined') {
                    UIManager.renderizarSillas();
                    actualizarEstadisticas(curso);
                }
                
                Utils.showToast('success', `Sillas del curso ${curso} eliminadas`);
            }
        });
    }

    /**
     * Actualiza las estadísticas de sillas
     */
    function actualizarEstadisticas(curso) {
        if (!curso) return;
        
        const estadisticas = DataManager.getEstadisticasSillas?.(curso);
        if (estadisticas && typeof UIManager !== 'undefined') {
            UIManager.actualizarEstadisticasSillas(estadisticas);
        }
    }

    /**
     * Abre el modal para asignar una silla
     */
    async function abrirModalSilla(sillaId) {
        console.log('🔄 Abriendo modal de silla:', sillaId);
        
        const sillas = DataManager.getSillas?.() || [];
        const silla = sillas.find(s => s.id === sillaId);
        const idx = sillas.findIndex(s => s.id === sillaId);
        
        if (!silla) {
            Utils.showToast('error', 'Silla no encontrada');
            return;
        }
        
        // Marcar en el formulario si la silla está ocupada
        const ocupada = silla.documento ? true : false;
        
        const estudiantes = await DataManager.getEstudiantesPorCurso(silla.curso) || [];
        
        // Obtener estudiantes sin silla (excluyendo el actual si ya tiene)
        let sinSilla = [];
        if (DataManager.getEstudiantesSinSilla) {
            sinSilla = DataManager.getEstudiantesSinSilla(estudiantes, silla.curso);
        } else {
            const ocupados = sillas.filter(s => s.curso === silla.curso && s.documento).map(s => s.documento);
            sinSilla = estudiantes.filter(e => !ocupados.includes(e.documento));
        }
        
        // Si la silla ya tiene estudiante, agregarlo a la lista
        if (silla.documento) {
            const estudianteActual = estudiantes.find(e => e.documento === silla.documento);
            if (estudianteActual && !sinSilla.some(e => e.documento === silla.documento)) {
                sinSilla.unshift(estudianteActual);
            }
        }
        
        const select = document.getElementById('selectEstudianteSilla');
        select.innerHTML = '<option value="">Seleccione estudiante</option>';
        
        sinSilla.forEach(e => {
            const opt = document.createElement('option');
            opt.value = e.documento;
            opt.setAttribute('data-nombre', `${e.nombres} ${e.apellidos}`);
            opt.textContent = `${e.documento} - ${e.nombres} ${e.apellidos}`;
            select.appendChild(opt);
        });
        
        if (silla.documento) {
            for (let i = 0; i < select.options.length; i++) {
                if (select.options[i].value === silla.documento) {
                    select.selectedIndex = i;
                    window.cargarDatosEstudianteSilla?.();
                    break;
                }
            }
        }
        
        // Llenar campos del formulario
        document.getElementById('sillaIndex').value = idx;
        document.getElementById('sillaId').value = silla.id;
        document.getElementById('sillaSerial').value = silla.serial || '';
        document.getElementById('sillaNumero').value = silla.numero || '';
        document.getElementById('sillaEstado').value = silla.estado || 'Bueno';
        document.getElementById('sillaObservaciones').value = silla.observaciones || '';
        document.getElementById('sillaEstudianteNombre').value = silla.nombreEstudiante || '';
        document.getElementById('sillaEstudianteDocumento').value = silla.documento || '';
        
        // Marcar visualmente si está ocupada
        const ocupadaIndicator = document.getElementById('sillaOcupadaIndicator');
        if (ocupadaIndicator) {
            ocupadaIndicator.textContent = ocupada ? 'Silla OCUPADA' : 'Silla DISPONIBLE';
            ocupadaIndicator.className = ocupada ? 'badge bg-success mb-2' : 'badge bg-secondary mb-2';
        }
        
        ModalManager.showModal('asignarSilla');
    }

    /**
     * Carga datos del estudiante seleccionado en la silla
     */
    function cargarDatosEstudianteSilla() {
        const select = document.getElementById('selectEstudianteSilla');
        if (select.selectedIndex > 0) {
            const opt = select.options[select.selectedIndex];
            document.getElementById('sillaEstudianteNombre').value = opt.getAttribute('data-nombre') || '';
            document.getElementById('sillaEstudianteDocumento').value = opt.value;
        } else {
            document.getElementById('sillaEstudianteNombre').value = '';
            document.getElementById('sillaEstudianteDocumento').value = '';
        }
    }

    /**
     * Guarda la asignación de una silla
     */
    function guardarAsignacionSilla() {
        const idx = parseInt(document.getElementById('sillaIndex')?.value);
        const doc = document.getElementById('sillaEstudianteDocumento')?.value;
        const nombre = document.getElementById('sillaEstudianteNombre')?.value;
        const estado = document.getElementById('sillaEstado')?.value;
        const obs = document.getElementById('sillaObservaciones')?.value;
        
        if (isNaN(idx)) {
            Utils.showToast('error', 'Error en los datos de la silla');
            return;
        }
        
        // Actualizar estado y observaciones
        DataManager.actualizarSilla?.(idx, { estado, observaciones: obs });
        
        // Asignar o desasignar estudiante
        if (doc && nombre) {
            // Verificar si el estudiante ya tiene otra silla
            if (!DataManager.asignarSilla?.(idx, doc, nombre)) {
                Utils.showToast('warning', 'Este estudiante ya tiene una silla asignada');
                return;
            }
            console.log(`✅ Estudiante ${nombre} asignado a silla ${idx}`);
        } else {
            // Si no hay estudiante, desasignar
            DataManager.desasignarSilla?.(idx);
            console.log(`✅ Silla ${idx} desasignada`);
        }
        
        // Actualizar vista
        if (typeof UIManager !== 'undefined') {
            UIManager.renderizarSillas();
            
            const curso = document.getElementById('cursoSillas')?.value;
            if (curso) {
                const estadisticas = DataManager.getEstadisticasSillas?.(curso);
                if (estadisticas) {
                    UIManager.actualizarEstadisticasSillas(estadisticas);
                }
            }
        }
        
        ModalManager.hideModal('asignarSilla');
        Utils.showToast('success', 'Silla actualizada');
    }

    /**
     * Desasigna una silla
     */
    function desasignarSilla() {
        const idx = parseInt(document.getElementById('sillaIndex')?.value);
        
        if (isNaN(idx)) {
            Utils.showToast('error', 'Error en los datos');
            return;
        }
        
        Swal.fire({
            title: '¿Desasignar silla?',
            text: 'El estudiante quedará sin silla asignada',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            confirmButtonText: 'Sí, desasignar',
            cancelButtonText: 'Cancelar'
        }).then((result) => {
            if (result.isConfirmed) {
                DataManager.desasignarSilla?.(idx);
                
                if (typeof UIManager !== 'undefined') {
                    UIManager.renderizarSillas();
                    
                    const curso = document.getElementById('cursoSillas')?.value;
                    if (curso) {
                        const estadisticas = DataManager.getEstadisticasSillas?.(curso);
                        if (estadisticas) {
                            UIManager.actualizarEstadisticasSillas(estadisticas);
                        }
                    }
                }
                
                ModalManager.hideModal('asignarSilla');
                Utils.showToast('success', 'Silla desasignada');
            }
        });
    }

    /**
     * Carga estudiantes para el selector de sillas
     */
    async function cargarEstudiantesParaSillas() {
        const cursoSelect = document.getElementById('cursoSillas');
        if (!cursoSelect) return;
        
        const cursoId = cursoSelect.value;
        if (!cursoId) return;
        
        // Actualizar estadísticas
        if (typeof UIManager !== 'undefined') {
            const estadisticas = DataManager.getEstadisticasSillas?.(cursoId);
            if (estadisticas) {
                UIManager.actualizarEstadisticasSillas(estadisticas);
            }
            UIManager.renderizarSillas();
        }
    }

    /**
     * Asignación automática (mejorada)
     */
    async function asignarSillasAutomaticamente() {
        const curso = document.getElementById('cursoSillas')?.value;
        
        if (!curso) {
            Utils.showToast('warning', 'Seleccione un curso');
            return;
        }
        
        const sillas = DataManager.getSillasPorCurso?.(curso) || [];
        if (sillas.length === 0) {
            Utils.showToast('warning', 'Primero cree las sillas');
            return;
        }
        
        const estudiantes = await DataManager.getEstudiantesPorCurso(curso) || [];
        const estudiantesSinSilla = DataManager.getEstudiantesSinSilla?.(estudiantes, curso) || estudiantes;
        
        if (estudiantesSinSilla.length === 0) {
            Utils.showToast('info', 'Todos los estudiantes ya tienen silla');
            return;
        }
        
        const sillasDisponibles = sillas.filter(s => !s.documento);
        
        if (sillasDisponibles.length === 0) {
            Utils.showToast('warning', 'No hay sillas disponibles');
            return;
        }
        
        // Preguntar confirmación
        Swal.fire({
            title: '¿Asignar automáticamente?',
            text: `Se asignarán ${Math.min(sillasDisponibles.length, estudiantesSinSilla.length)} sillas a estudiantes sin asignar`,
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Sí, asignar',
            cancelButtonText: 'Cancelar'
        }).then((result) => {
            if (result.isConfirmed) {
                let asignadas = 0;
                for (let i = 0; i < Math.min(sillasDisponibles.length, estudiantesSinSilla.length); i++) {
                    const sillaGlobalIndex = DataManager.getSillas().findIndex(s => s.id === sillasDisponibles[i].id);
                    const estudiante = estudiantesSinSilla[i];
                    const nombreCompleto = `${estudiante.nombres} ${estudiante.apellidos}`;
                    
                    DataManager.asignarSilla?.(sillaGlobalIndex, estudiante.documento, nombreCompleto);
                    asignadas++;
                }
                
                if (typeof UIManager !== 'undefined') {
                    UIManager.renderizarSillas();
                    
                    const estadisticas = DataManager.getEstadisticasSillas?.(curso);
                    if (estadisticas) {
                        UIManager.actualizarEstadisticasSillas(estadisticas);
                    }
                }
                
                Utils.showToast('success', `${asignadas} sillas asignadas automáticamente`);
            }
        });
    }

    // Exponer funciones globalmente
    window.crearSillas = crearSillas;
    window.limpiarSillasCurso = limpiarSillasCurso;
    window.abrirModalSilla = abrirModalSilla;
    window.cargarDatosEstudianteSilla = cargarDatosEstudianteSilla;
    window.guardarAsignacionSilla = guardarAsignacionSilla;
    window.desasignarSilla = desasignarSilla;
    window.cargarEstudiantesParaSillas = cargarEstudiantesParaSillas;
    window.asignarSillasAutomaticamente = asignarSillasAutomaticamente;

    return {
        crearSillas,
        limpiarSillasCurso,
        abrirModalSilla,
        guardarAsignacionSilla,
        desasignarSilla,
        cargarEstudiantesParaSillas,
        asignarSillasAutomaticamente
    };
})();

console.log('✅ Módulo Sillas v0.5 mejorado cargado correctamente');