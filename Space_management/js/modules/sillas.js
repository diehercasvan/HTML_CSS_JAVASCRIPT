// sillas.js - Módulo de gestión de sillas
// VERSIÓN 0.6 - COMPLETA Y CORREGIDA

console.log('🔄 Iniciando carga de sillas.js...');

// Verificar dependencias
if (typeof DataManager === 'undefined') {
    console.error('❌ sillas.js: DataManager NO DISPONIBLE');
} else {
    console.log('✅ sillas.js: DataManager disponible');
}

const SillasModule = (function() {
    console.log('📦 Ejecutando IIFE de SillasModule...');
    
    // ===== FUNCIONES AUXILIARES =====
    
    /**
     * Valida que haya un curso seleccionado
     */
    function validarCursoSeleccionado() {
        const cursoSelect = document.getElementById('cursoSillas');
        if (!cursoSelect) {
            console.warn('⚠️ Selector de curso no encontrado');
            return null;
        }
        const curso = cursoSelect.value;
        if (!curso) {
            if (typeof Utils !== 'undefined') {
                Utils.showToast('warning', 'Debe seleccionar un curso');
            } else {
                alert('Debe seleccionar un curso');
            }
            return null;
        }
        return curso;
    }

    /**
     * Obtiene los estudiantes del curso actual
     */
    async function obtenerEstudiantesCurso(curso) {
        try {
            console.log(`🔍 Buscando estudiantes para curso "${curso}"...`);
            const estudiantes = await DataManager.getEstudiantesPorCurso(curso) || [];
            console.log(`✅ ${estudiantes.length} estudiantes encontrados`);
            return estudiantes;
        } catch (error) {
            console.error('❌ Error cargando estudiantes:', error);
            return [];
        }
    }

    /**
     * Valida que la cantidad de sillas sea suficiente
     */
    function validarCapacidadSillas(numSillas, numEstudiantes) {
        if (numSillas < numEstudiantes) {
            const msg = `Capacidad insuficiente: ${numSillas} sillas para ${numEstudiantes} estudiantes`;
            if (typeof Utils !== 'undefined') {
                Utils.showToast('error', msg);
            } else {
                alert(msg);
            }
            return false;
        }
        return true;
    }

    /**
     * Actualiza la vista de sillas y estadísticas
     */
    async function actualizarVistaSillas(curso) {
        if (!curso) return;
        
        if (typeof UIManager !== 'undefined') {
            UIManager.renderizarSillas();
            
            const estadisticas = DataManager.getEstadisticasSillas?.(curso);
            if (estadisticas && typeof UIManager.actualizarEstadisticasSillas === 'function') {
                UIManager.actualizarEstadisticasSillas(estadisticas);
            }
        }
        
        const estudiantes = await obtenerEstudiantesCurso(curso);
        const sillas = DataManager.getSillasPorCurso?.(curso) || [];
        const asignadas = sillas.filter(s => s.documento).length;
        
        console.log(`📊 Curso ${curso}: ${estudiantes.length} estudiantes, ${sillas.length} sillas, ${asignadas} asignadas`);
    }

    // ===== FUNCIONES PRINCIPALES =====
    
    /**
     * Crea nuevas sillas para un curso
     */
    async function crearSillas() {
        console.log('🔄 Creando sillas...');
        
        const curso = validarCursoSeleccionado();
        if (!curso) return;
        
        const numInput = document.getElementById('numeroSillas');
        if (!numInput) {
            console.error('❌ Input numeroSillas no encontrado');
            return;
        }
        
        const numSillas = parseInt(numInput.value);
        
        if (!numSillas || numSillas < 1) {
            if (typeof Utils !== 'undefined') {
                Utils.showToast('warning', 'Ingrese un número válido de sillas');
            } else {
                alert('Ingrese un número válido de sillas');
            }
            return;
        }
        
        if (numSillas > 100) {
            if (typeof Utils !== 'undefined') {
                Utils.showToast('warning', 'Máximo 100 sillas por curso');
            } else {
                alert('Máximo 100 sillas por curso');
            }
            return;
        }
        
        // Obtener estudiantes del curso
        const estudiantes = await obtenerEstudiantesCurso(curso);
        
        // Validar capacidad
        if (!validarCapacidadSillas(numSillas, estudiantes.length)) {
            return;
        }
        
        // Limpiar sillas existentes del curso actual
        if (DataManager.limpiarDatosPorCurso) {
            DataManager.limpiarDatosPorCurso(curso);
        }
        
        // Crear nuevas sillas
        DataManager.configurarSillas?.(numSillas, curso);
        
        // Actualizar vista
        await actualizarVistaSillas(curso);
        
        if (typeof Utils !== 'undefined') {
            Utils.showToast('success', `${numSillas} sillas creadas para el curso ${curso}`);
        } else {
            alert(`${numSillas} sillas creadas`);
        }
    }

    /**
     * Limpia todas las sillas del curso actual
     */
    async function limpiarSillasCurso() {
        console.log('🔄 Limpiando sillas del curso...');
        
        const curso = validarCursoSeleccionado();
        if (!curso) return;
        
        const sillasExistentes = DataManager.getSillasPorCurso?.(curso) || [];
        
        if (sillasExistentes.length === 0) {
            if (typeof Utils !== 'undefined') {
                Utils.showToast('info', 'No hay sillas para limpiar en este curso');
            } else {
                alert('No hay sillas para limpiar');
            }
            return;
        }
        
        const confirmar = async () => {
            if (typeof Utils !== 'undefined') {
                const result = await Utils.showConfirm(
                    '¿Limpiar sillas?', 
                    `Se eliminarán todas las ${sillasExistentes.length} sillas del curso ${curso}`
                );
                return result.isConfirmed;
            } else {
                return confirm(`¿Eliminar ${sillasExistentes.length} sillas?`);
            }
        };
        
        if (await confirmar()) {
            if (DataManager.limpiarDatosPorCurso) {
                DataManager.limpiarDatosPorCurso(curso);
            }
            
            await actualizarVistaSillas(curso);
            
            if (typeof Utils !== 'undefined') {
                Utils.showToast('success', `Sillas del curso ${curso} eliminadas`);
            }
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
            if (typeof Utils !== 'undefined') {
                Utils.showToast('error', 'Silla no encontrada');
            } else {
                alert('Silla no encontrada');
            }
            return;
        }
        
        const curso = silla.curso;
        const estudiantes = await obtenerEstudiantesCurso(curso);
        
        // Obtener estudiantes ya asignados a otras sillas
        const estudiantesAsignados = sillas
            .filter(s => s.curso === curso && s.documento && s.id !== sillaId)
            .map(s => s.documento);
        
        // Estudiantes disponibles
        let estudiantesDisponibles = estudiantes.filter(e => !estudiantesAsignados.includes(e.documento));
        
        // Si la silla ya tiene estudiante, asegurar que esté en la lista
        if (silla.documento) {
            const estudianteActual = estudiantes.find(e => e.documento === silla.documento);
            if (estudianteActual && !estudiantesDisponibles.some(e => e.documento === silla.documento)) {
                estudiantesDisponibles.unshift(estudianteActual);
            }
        }
        
        // Llenar select de estudiantes
        const select = document.getElementById('selectEstudianteSilla');
        if (!select) {
            console.error('❌ selectEstudianteSilla no encontrado');
            return;
        }
        
        select.innerHTML = '<option value="">-- Seleccione un estudiante --</option>';
        
        estudiantesDisponibles.forEach(e => {
            const opt = document.createElement('option');
            opt.value = e.documento;
            opt.setAttribute('data-nombre', `${e.nombres} ${e.apellidos}`);
            opt.textContent = `${e.documento} - ${e.nombres} ${e.apellidos}`;
            select.appendChild(opt);
        });
        
        // Seleccionar el estudiante actual si existe
        if (silla.documento) {
            for (let i = 0; i < select.options.length; i++) {
                if (select.options[i].value === silla.documento) {
                    select.selectedIndex = i;
                    cargarDatosEstudianteSilla();
                    break;
                }
            }
        }
        
        // Llenar datos de la silla
        const campos = [
            'sillaIndex', 'sillaId', 'sillaSerial', 'sillaNumero',
            'sillaEstado', 'sillaObservaciones', 'sillaEstudianteNombre', 'sillaEstudianteDocumento'
        ];
        
        campos.forEach(id => {
            const el = document.getElementById(id);
            if (el) {
                if (id === 'sillaIndex') el.value = idx;
                else if (id === 'sillaId') el.value = silla.id;
                else if (id === 'sillaSerial') el.value = silla.serial || '';
                else if (id === 'sillaNumero') el.value = silla.numero || '';
                else if (id === 'sillaEstado') el.value = silla.estado || 'Bueno';
                else if (id === 'sillaObservaciones') el.value = silla.observaciones || '';
                else if (id === 'sillaEstudianteNombre') el.value = silla.nombreEstudiante || '';
                else if (id === 'sillaEstudianteDocumento') el.value = silla.documento || '';
            }
        });
        
        // Indicador visual
        const ocupadaIndicator = document.getElementById('sillaOcupadaIndicator');
        if (ocupadaIndicator) {
            const ocupada = !!silla.documento;
            ocupadaIndicator.textContent = ocupada ? '🪑 Silla OCUPADA' : '🪑 Silla DISPONIBLE';
            ocupadaIndicator.className = ocupada ? 'badge bg-success mb-2 p-2' : 'badge bg-secondary mb-2 p-2';
        }
        
        if (typeof ModalManager !== 'undefined') {
            ModalManager.showModal('asignarSilla');
        } else {
            console.error('❌ ModalManager no disponible');
        }
    }

    /**
     * Carga datos del estudiante seleccionado
     */
    function cargarDatosEstudianteSilla() {
        const select = document.getElementById('selectEstudianteSilla');
        if (!select) return;
        
        const nombreField = document.getElementById('sillaEstudianteNombre');
        const docField = document.getElementById('sillaEstudianteDocumento');
        
        if (select.selectedIndex > 0) {
            const opt = select.options[select.selectedIndex];
            if (nombreField) nombreField.value = opt.getAttribute('data-nombre') || '';
            if (docField) docField.value = opt.value;
        } else {
            if (nombreField) nombreField.value = '';
            if (docField) docField.value = '';
        }
    }

    /**
     * Guarda la asignación de una silla
     */
    async function guardarAsignacionSilla() {
        const idx = parseInt(document.getElementById('sillaIndex')?.value);
        const doc = document.getElementById('sillaEstudianteDocumento')?.value;
        const nombre = document.getElementById('sillaEstudianteNombre')?.value;
        const estado = document.getElementById('sillaEstado')?.value;
        const obs = document.getElementById('sillaObservaciones')?.value;
        
        if (isNaN(idx)) {
            if (typeof Utils !== 'undefined') {
                Utils.showToast('error', 'Error en los datos de la silla');
            }
            return;
        }
        
        // Actualizar estado y observaciones
        DataManager.actualizarSilla?.(idx, { estado, observaciones: obs });
        
        // Si hay estudiante, asignar
        if (doc && nombre) {
            if (!DataManager.asignarSilla?.(idx, doc, nombre)) {
                if (typeof Utils !== 'undefined') {
                    Utils.showToast('warning', 'Este estudiante ya tiene una silla asignada');
                }
                return;
            }
        } else {
            // Si no hay estudiante, desasignar
            DataManager.desasignarSilla?.(idx);
        }
        
        // Actualizar vista
        const curso = document.getElementById('cursoSillas')?.value;
        await actualizarVistaSillas(curso);
        
        if (typeof ModalManager !== 'undefined') {
            ModalManager.hideModal('asignarSilla');
        }
        
        if (typeof Utils !== 'undefined') {
            Utils.showToast('success', 'Silla actualizada');
        }
    }

    /**
     * Desasigna una silla
     */
    async function desasignarSilla() {
        const idx = parseInt(document.getElementById('sillaIndex')?.value);
        
        if (isNaN(idx)) {
            if (typeof Utils !== 'undefined') {
                Utils.showToast('error', 'Error en los datos');
            }
            return;
        }
        
        const confirmar = async () => {
            if (typeof Utils !== 'undefined') {
                const result = await Utils.showConfirm(
                    '¿Desasignar silla?',
                    'El estudiante quedará sin silla asignada'
                );
                return result.isConfirmed;
            } else {
                return confirm('¿Desasignar silla?');
            }
        };
        
        if (await confirmar()) {
            DataManager.desasignarSilla?.(idx);
            
            const curso = document.getElementById('cursoSillas')?.value;
            await actualizarVistaSillas(curso);
            
            if (typeof ModalManager !== 'undefined') {
                ModalManager.hideModal('asignarSilla');
            }
            
            if (typeof Utils !== 'undefined') {
                Utils.showToast('success', 'Silla desasignada');
            }
        }
    }

    /**
     * Carga estudiantes al cambiar curso
     */
    async function cargarEstudiantesParaSillas() {
        const curso = validarCursoSeleccionado();
        if (!curso) {
            const container = document.getElementById('sillasContainer');
            if (container) {
                container.innerHTML = '<p class="text-muted">Seleccione un curso para ver las sillas</p>';
            }
            return;
        }
        
        await actualizarVistaSillas(curso);
    }

    /**
     * Asignación automática
     */
    async function asignarSillasAutomaticamente() {
        console.log('🔄 Asignación automática...');
        
        const curso = validarCursoSeleccionado();
        if (!curso) return;
        
        const sillas = DataManager.getSillasPorCurso?.(curso) || [];
        if (sillas.length === 0) {
            if (typeof Utils !== 'undefined') {
                Utils.showToast('warning', 'Primero cree las sillas');
            }
            return;
        }
        
        const estudiantes = await obtenerEstudiantesCurso(curso);
        const estudiantesAsignados = sillas.filter(s => s.documento).map(s => s.documento);
        const estudiantesSinAsignar = estudiantes.filter(e => !estudiantesAsignados.includes(e.documento));
        
        if (estudiantesSinAsignar.length === 0) {
            if (typeof Utils !== 'undefined') {
                Utils.showToast('info', 'Todos los estudiantes ya tienen silla');
            }
            return;
        }
        
        const sillasDisponibles = sillas.filter(s => !s.documento);
        
        if (sillasDisponibles.length === 0) {
            if (typeof Utils !== 'undefined') {
                Utils.showToast('warning', 'No hay sillas disponibles');
            }
            return;
        }
        
        const aAsignar = Math.min(sillasDisponibles.length, estudiantesSinAsignar.length);
        
        const confirmar = async () => {
            if (typeof Utils !== 'undefined') {
                const result = await Swal.fire({
                    title: '¿Asignar automáticamente?',
                    html: `
                        <p><strong>Estudiantes sin silla:</strong> ${estudiantesSinAsignar.length}</p>
                        <p><strong>Sillas disponibles:</strong> ${sillasDisponibles.length}</p>
                        <p><strong>Se asignarán:</strong> ${aAsignar} estudiantes</p>
                    `,
                    icon: 'question',
                    showCancelButton: true,
                    confirmButtonText: 'Sí, asignar'
                });
                return result.isConfirmed;
            } else {
                return confirm(`¿Asignar ${aAsignar} estudiantes?`);
            }
        };
        
        if (await confirmar()) {
            let asignadas = 0;
            for (let i = 0; i < aAsignar; i++) {
                const sillaGlobalIndex = DataManager.getSillas().findIndex(s => s.id === sillasDisponibles[i].id);
                const estudiante = estudiantesSinAsignar[i];
                const nombreCompleto = `${estudiante.nombres} ${estudiante.apellidos}`;
                
                if (DataManager.asignarSilla?.(sillaGlobalIndex, estudiante.documento, nombreCompleto)) {
                    asignadas++;
                }
            }
            
            await actualizarVistaSillas(curso);
            
            if (typeof Utils !== 'undefined') {
                Utils.showToast('success', `${asignadas} sillas asignadas automáticamente`);
            }
        }
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

    const api = {
        crearSillas,
        limpiarSillasCurso,
        abrirModalSilla,
        guardarAsignacionSilla,
        desasignarSilla,
        cargarEstudiantesParaSillas,
        asignarSillasAutomaticamente
    };
    
    console.log('✅ SillasModule: API creada');
    return api;
})();

if (typeof SillasModule !== 'undefined') {
    console.log('✅ SillasModule v0.6 cargado correctamente');
} else {
    console.error('❌ Error cargando SillasModule');
}

window.SillasModule = SillasModule;