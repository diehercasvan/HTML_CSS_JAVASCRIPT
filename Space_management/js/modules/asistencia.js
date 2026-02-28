// asistencia.js - Módulo de registro de asistencia
// VERSIÓN 0.6 - COMPLETA Y CORREGIDA

console.log('🔄 Iniciando carga de asistencia.js...');

// Verificar dependencias
if (typeof DataManager === 'undefined') {
    console.error('❌ asistencia.js: DataManager NO DISPONIBLE');
} else {
    console.log('✅ asistencia.js: DataManager disponible');
}

const AsistenciaModule = (function() {
    console.log('📦 Ejecutando IIFE de AsistenciaModule...');
    
    let asistenciasTemp = {};

    /**
     * Filtra la asistencia por curso y fecha
     */
    async function filtrarAsistencia() {
        console.log('🔄 Filtrando asistencia...');
        
        const cursoSelect = document.getElementById('cursoAsistencia');
        const fechaInput = document.getElementById('fechaAsistencia');
        
        if (!cursoSelect || !fechaInput) {
            console.error('❌ Elementos de filtro no encontrados');
            return;
        }
        
        const curso = cursoSelect.value;
        const fecha = fechaInput.value;
        
        if (!curso || !fecha) {
            if (typeof Utils !== 'undefined') {
                Utils.showToast('warning', 'Seleccione curso y fecha');
            } else {
                alert('Seleccione curso y fecha');
            }
            return;
        }
        
        if (typeof UIManager !== 'undefined' && UIManager.renderizarTablaAsistencia) {
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
        
        console.log(`📝 Asistencia ${doc}: ${presente ? 'Presente' : 'Ausente'}`);
    }

    /**
     * Marca el uso de uniforme
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
        
        console.log(`👕 Uniforme ${doc}: ${tieneUniforme ? 'Sí' : 'No'}`);
    }

    /**
     * Marca TODOS los estudiantes
     */
    function marcarTodos() {
        console.log('🔄 Marcando todos...');
        
        const asis = document.querySelectorAll('[id^="asistencia_"]');
        const unif = document.querySelectorAll('[id^="uniforme_"]');
        
        let contador = 0;
        
        asis.forEach(cb => {
            if (cb.type === 'checkbox') {
                cb.checked = true;
                const doc = cb.id.replace('asistencia_', '');
                marcarAsistencia(doc, true);
                contador++;
            }
        });
        
        unif.forEach(cb => {
            if (cb.type === 'checkbox') {
                cb.checked = true;
                const doc = cb.id.replace('uniforme_', '');
                marcarUniforme(doc, true);
            }
        });
        
        if (typeof Utils !== 'undefined') {
            Utils.showToast('success', `${contador} estudiantes marcados`);
        }
    }

    /**
     * Desmarca TODOS los estudiantes
     */
    function desmarcarTodos() {
        console.log('🔄 Desmarcando todos...');
        
        const asis = document.querySelectorAll('[id^="asistencia_"]');
        const unif = document.querySelectorAll('[id^="uniforme_"]');
        
        let contador = 0;
        
        asis.forEach(cb => {
            if (cb.type === 'checkbox') {
                cb.checked = false;
                const doc = cb.id.replace('asistencia_', '');
                marcarAsistencia(doc, false);
                contador++;
            }
        });
        
        unif.forEach(cb => {
            if (cb.type === 'checkbox') {
                cb.checked = false;
                const doc = cb.id.replace('uniforme_', '');
                marcarUniforme(doc, false);
            }
        });
        
        if (typeof Utils !== 'undefined') {
            Utils.showToast('info', `${contador} estudiantes desmarcados`);
        }
    }

    /**
     * Actualiza observación
     */
    function actualizarObservacionAsistencia(doc, obs) {
        if (!asistenciasTemp[doc]) {
            asistenciasTemp[doc] = {};
        }
        asistenciasTemp[doc].observaciones = obs;
        console.log(`📝 Obs ${doc}: ${obs}`);
    }

    /**
     * Guarda la asistencia
     */
    async function guardarAsistencia() {
        console.log('💾 Guardando asistencia...');
        
        const cursoSelect = document.getElementById('cursoAsistencia');
        const fechaInput = document.getElementById('fechaAsistencia');
        
        if (!cursoSelect || !fechaInput) {
            console.error('❌ Elementos no encontrados');
            return;
        }
        
        const curso = cursoSelect.value;
        const fecha = fechaInput.value;
        
        if (!curso || !fecha) {
            if (typeof Utils !== 'undefined') {
                Utils.showToast('warning', 'Seleccione curso y fecha');
            }
            return;
        }
        
        const estudiantes = await DataManager.getEstudiantesPorCurso(curso) || [];
        
        if (estudiantes.length === 0) {
            if (typeof Utils !== 'undefined') {
                Utils.showToast('warning', 'No hay estudiantes en este curso');
            }
            return;
        }
        
        const registros = estudiantes.map(e => ({
            documento: e.documento,
            nombre: `${e.nombres} ${e.apellidos}`,
            asistio: asistenciasTemp[e.documento]?.asistio || false,
            uniforme: asistenciasTemp[e.documento]?.uniforme || false,
            observaciones: asistenciasTemp[e.documento]?.observaciones || ''
        }));
        
        const totalAsistencia = registros.filter(r => r.asistio).length;
        const totalUniforme = registros.filter(r => r.uniforme).length;
        
        DataManager.guardarAsistencia?.(curso, fecha, registros);
        
        if (DataManager.getAsistencia?.(curso, fecha)) {
            asistenciasTemp = {};
            if (typeof Utils !== 'undefined') {
                Utils.showToast('success', `Guardado: ${totalAsistencia} presentes, ${totalUniforme} uniforme`);
            }
        } else if (typeof Utils !== 'undefined') {
            Utils.showToast('error', 'Error al guardar');
        }
    }

    /**
     * Carga asistencia guardada
     */
    async function cargarAsistenciaGuardada(curso, fecha) {
        const guardada = DataManager.getAsistencia?.(curso, fecha);
        if (guardada?.registros) {
            guardada.registros.forEach(r => {
                asistenciasTemp[r.documento] = {
                    asistio: r.asistio || false,
                    uniforme: r.uniforme || false,
                    observaciones: r.observaciones || ''
                };
            });
        }
        return guardada;
    }

    /**
     * Carga asistencia por curso
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
    window.actualizarObservacionAsistencia = actualizarObservacionAsistencia;
    window.guardarAsistencia = guardarAsistencia;
    window.cargarAsistenciaPorCurso = cargarAsistenciaPorCurso;
    window.marcarTodos = marcarTodos;
    window.desmarcarTodos = desmarcarTodos;

    const api = {
        filtrarAsistencia,
        marcarAsistencia,
        marcarUniforme,
        actualizarObservacionAsistencia,
        guardarAsistencia,
        cargarAsistenciaPorCurso,
        cargarAsistenciaGuardada,
        marcarTodos,
        desmarcarTodos
    };
    
    console.log('✅ AsistenciaModule: API creada');
    return api;
})();

if (typeof AsistenciaModule !== 'undefined') {
    console.log('✅ AsistenciaModule v0.6 cargado correctamente');
} else {
    console.error('❌ Error cargando AsistenciaModule');
}

window.AsistenciaModule = AsistenciaModule;