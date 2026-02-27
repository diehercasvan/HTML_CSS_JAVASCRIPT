// asistencia.js - Módulo de registro de asistencia
// VERSIÓN CORREGIDA - v0.5 - CON FUNCIONES DE MARCAR/DESMARCAR FUNCIONALES

const AsistenciaModule = (function() {
    
    // Almacenamiento temporal de asistencias y uniformes
    let asistenciasTemp = {};

    /**
     * Filtra la asistencia por curso y fecha
     */
    async function filtrarAsistencia() {
        const curso = document.getElementById('cursoAsistencia')?.value;
        const fecha = document.getElementById('fechaAsistencia')?.value;
        
        if (!curso || !fecha) {
            Utils.showToast('warning', 'Seleccione curso y fecha');
            return;
        }
        
        if (typeof UIManager !== 'undefined') {
            await UIManager.renderizarTablaAsistencia(curso, fecha);
        }
    }

    /**
     * Marca la asistencia de un estudiante
     */
    function marcarAsistencia(doc, presente) {
        if (!asistenciasTemp[doc]) {
            asistenciasTemp[doc] = {};
        }
        asistenciasTemp[doc].asistio = presente;
        
        const label = document.querySelector(`label[for="asistencia_${doc}"]`);
        if (label) {
            label.textContent = presente ? 'Presente' : 'Ausente';
        }
        
        console.log(`📝 Asistencia marcada para ${doc}: ${presente ? 'Presente' : 'Ausente'}`);
    }

    /**
     * Marca el uso de uniforme de un estudiante
     */
    function marcarUniforme(doc, tieneUniforme) {
        if (!asistenciasTemp[doc]) {
            asistenciasTemp[doc] = {};
        }
        asistenciasTemp[doc].uniforme = tieneUniforme;
        
        const label = document.querySelector(`label[for="uniforme_${doc}"]`);
        if (label) {
            label.textContent = tieneUniforme ? 'Con Uniforme' : 'Sin Uniforme';
        }
        
        console.log(`👕 Uniforme marcado para ${doc}: ${tieneUniforme ? 'Con Uniforme' : 'Sin Uniforme'}`);
    }

    /**
     * Marca TODOS los estudiantes como presentes y con uniforme
     */
    function marcarTodos() {
        console.log('🔄 Marcando todos los estudiantes...');
        
        // Obtener todos los checkboxes de asistencia
        const checkboxesAsistencia = document.querySelectorAll('[id^="asistencia_"]');
        const checkboxesUniforme = document.querySelectorAll('[id^="uniforme_"]');
        
        let contador = 0;
        
        // Marcar asistencias
        checkboxesAsistencia.forEach(cb => {
            if (cb.type === 'checkbox') {
                cb.checked = true;
                const doc = cb.id.replace('asistencia_', '');
                marcarAsistencia(doc, true);
                contador++;
            }
        });
        
        // Marcar uniformes
        checkboxesUniforme.forEach(cb => {
            if (cb.type === 'checkbox') {
                cb.checked = true;
                const doc = cb.id.replace('uniforme_', '');
                marcarUniforme(doc, true);
            }
        });
        
        Utils.showToast('success', `${contador} estudiantes marcados como presentes y con uniforme`);
        console.log(`✅ ${contador} estudiantes marcados`);
    }

    /**
     * Desmarca TODOS los estudiantes (asistencia y uniforme)
     */
    function desmarcarTodos() {
        console.log('🔄 Desmarcando todos los estudiantes...');
        
        // Obtener todos los checkboxes de asistencia
        const checkboxesAsistencia = document.querySelectorAll('[id^="asistencia_"]');
        const checkboxesUniforme = document.querySelectorAll('[id^="uniforme_"]');
        
        let contador = 0;
        
        // Desmarcar asistencias
        checkboxesAsistencia.forEach(cb => {
            if (cb.type === 'checkbox') {
                cb.checked = false;
                const doc = cb.id.replace('asistencia_', '');
                marcarAsistencia(doc, false);
                contador++;
            }
        });
        
        // Desmarcar uniformes
        checkboxesUniforme.forEach(cb => {
            if (cb.type === 'checkbox') {
                cb.checked = false;
                const doc = cb.id.replace('uniforme_', '');
                marcarUniforme(doc, false);
            }
        });
        
        Utils.showToast('info', `${contador} estudiantes desmarcados`);
        console.log(`✅ ${contador} estudiantes desmarcados`);
    }

    /**
     * Marca asistencia y uniforme a la vez (para checkbox principal)
     */
    function marcarTodo(doc, checked) {
        marcarAsistencia(doc, checked);
        marcarUniforme(doc, checked);
    }

    /**
     * Actualiza la observación de un estudiante
     */
    function actualizarObservacionAsistencia(doc, obs) {
        if (!asistenciasTemp[doc]) {
            asistenciasTemp[doc] = {};
        }
        asistenciasTemp[doc].observaciones = obs;
        
        console.log(`📝 Observación actualizada para ${doc}: ${obs}`);
    }

    /**
     * Guarda el registro de asistencia
     */
    async function guardarAsistencia() {
        const curso = document.getElementById('cursoAsistencia')?.value;
        const fecha = document.getElementById('fechaAsistencia')?.value;
        
        if (!curso || !fecha) {
            Utils.showToast('warning', 'Seleccione curso y fecha');
            return;
        }
        
        const estudiantes = await DataManager.getEstudiantesPorCurso(curso) || [];
        
        if (estudiantes.length === 0) {
            Utils.showToast('warning', 'No hay estudiantes en este curso');
            return;
        }
        
        const registros = estudiantes.map(e => ({
            documento: e.documento,
            nombre: `${e.nombres} ${e.apellidos}`,
            asistio: asistenciasTemp[e.documento]?.asistio || false,
            uniforme: asistenciasTemp[e.documento]?.uniforme || false,
            observaciones: asistenciasTemp[e.documento]?.observaciones || ''
        }));
        
        // Contar estadísticas para mostrar
        const totalAsistencia = registros.filter(r => r.asistio).length;
        const totalUniforme = registros.filter(r => r.uniforme).length;
        
        DataManager.guardarAsistencia?.(curso, fecha, registros);
        
        // Limpiar temporales SOLO si se guardó exitosamente
        if (DataManager.getAsistencia?.(curso, fecha)) {
            asistenciasTemp = {};
            Utils.showToast('success', `Asistencia guardada: ${totalAsistencia} presentes, ${totalUniforme} con uniforme`);
        } else {
            Utils.showToast('error', 'Error al guardar la asistencia');
        }
    }

    /**
     * Carga un registro de asistencia guardado previamente
     */
    async function cargarAsistenciaGuardada(curso, fecha) {
        const asistenciaGuardada = DataManager.getAsistencia?.(curso, fecha);
        
        if (asistenciaGuardada?.registros) {
            asistenciaGuardada.registros.forEach(r => {
                asistenciasTemp[r.documento] = {
                    asistio: r.asistio || false,
                    uniforme: r.uniforme || false,
                    observaciones: r.observaciones || ''
                };
            });
            console.log(`📋 Asistencia cargada para ${fecha}:`, asistenciasTemp);
        }
        
        return asistenciaGuardada;
    }

    /**
     * Carga la asistencia por curso (wrapper para UIManager)
     */
    function cargarAsistenciaPorCurso() {
        if (typeof UIManager !== 'undefined' && UIManager.cargarAsistenciaPorCurso) {
            UIManager.cargarAsistenciaPorCurso();
        }
    }

    // Exponer funciones globalmente
    window.filtrarAsistencia = filtrarAsistencia;
    window.marcarAsistencia = marcarAsistencia;
    window.marcarUniforme = marcarUniforme;
    window.marcarTodo = marcarTodo;
    window.actualizarObservacionAsistencia = actualizarObservacionAsistencia;
    window.guardarAsistencia = guardarAsistencia;
    window.cargarAsistenciaPorCurso = cargarAsistenciaPorCurso;
    window.marcarTodos = marcarTodos;
    window.desmarcarTodos = desmarcarTodos;

    return {
        filtrarAsistencia,
        marcarAsistencia,
        marcarUniforme,
        marcarTodo,
        actualizarObservacionAsistencia,
        guardarAsistencia,
        cargarAsistenciaPorCurso,
        cargarAsistenciaGuardada,
        marcarTodos,
        desmarcarTodos
    };
})();

console.log('✅ Módulo Asistencia v0.5 corregido - Funciones de marcar/desmarcar funcionando');