// asistenciaDiaria.js - Módulo para registro diario de asistencia
// Versión 0.8 - COMPLETO

console.log('🔄 Cargando módulo asistenciaDiaria.js...');

const AsistenciaDiaria = (function () {

    /**
     * Filtra la asistencia por curso y fecha
     */
    // En asistenciaDiaria.js, función filtrarAsistencia

    async function filtrarAsistencia() {
        console.log('🔍 Filtrando asistencia...');

        const cursoSelect = document.getElementById('cursoAsistencia');
        const fechaInput = document.getElementById('fechaAsistencia');

        if (!cursoSelect || !fechaInput) return;

        const curso = cursoSelect.value;
        const fecha = fechaInput.value;

        if (!curso || !fecha) {
            if (typeof Utils !== 'undefined') {
                Utils.showToast('warning', 'Seleccione curso y fecha');
            }
            return;
        }

        // Buscar asistencia guardada
        const asistenciaGuardada = AsistenciaData.obtenerAsistencia(curso, fecha);

        if (asistenciaGuardada) {
            console.log('📋 Asistencia encontrada:', asistenciaGuardada);
            // Cargar en temporales para edición
            window.asistenciasTemp = {};
            asistenciaGuardada.registros.forEach(r => {
                window.asistenciasTemp[r.documento] = {
                    asistio: r.asistio,
                    uniforme: r.uniforme,
                    observaciones: r.observaciones
                };
            });
        } else {
            console.log('📭 No hay asistencia guardada para esta fecha');
            window.asistenciasTemp = {};
        }

        await renderizarTablaAsistencia(curso, fecha);
    }

    /**
     * Renderiza la tabla de asistencia diaria
     */
    async function renderizarTablaAsistencia(cursoId, fecha) {
        console.log(`📋 Renderizando asistencia para curso ${cursoId}, fecha ${fecha}`);

        const tbody = document.getElementById('cuerpoTablaAsistencia');
        if (!tbody) return;

        try {
            // Obtener estudiantes del curso
            const estudiantes = await DataManager.getEstudiantesPorCurso(cursoId) || [];

            // Obtener sillas asignadas
            const sillas = typeof DataManager.getSillasPorCurso === 'function' ?
                DataManager.getSillasPorCurso(cursoId) : [];

            // Obtener asistencia guardada si existe
            let asistenciaGuardada = null;
            if (typeof AsistenciaData !== 'undefined') {
                asistenciaGuardada = AsistenciaData.obtenerAsistencia(cursoId, fecha);
            }

            if (estudiantes.length === 0) {
                tbody.innerHTML = '<tr><td colspan="7" class="text-center">No hay estudiantes en este curso</td></tr>';
                return;
            }

            let html = '';
            estudiantes.forEach(estudiante => {
                const sillaAsignada = sillas.find(s => s.documento === estudiante.documento);
                const registro = asistenciaGuardada?.registros?.find(
                    r => r.documento === estudiante.documento
                );

                const nombreCompleto = `${estudiante.nombres} ${estudiante.apellidos}`;
                const asistio = registro?.asistio || false;
                const uniforme = registro?.uniforme || false;
                const observaciones = registro?.observaciones || '';

                html += `
                    <tr>
                        <td>${estudiante.documento}</td>
                        <td>${nombreCompleto}</td>
                        <td>${sillaAsignada ? `Silla ${sillaAsignada.numero}` : 'Sin asignar'}</td>
                        <td>${sillaAsignada ? sillaAsignada.serial : 'N/A'}</td>
                        <td class="text-center">
                            <div class="form-check form-switch">
                                <input class="form-check-input" type="checkbox" 
                                       id="asistencia_${estudiante.documento}" 
                                       ${asistio ? 'checked' : ''}
                                       onchange="AsistenciaDiaria.marcarAsistencia('${estudiante.documento}', this.checked)">
                                <label class="form-check-label" for="asistencia_${estudiante.documento}">
                                    ${asistio ? 'Presente' : 'Ausente'}
                                </label>
                            </div>
                        </td>
                        <td class="text-center">
                            <div class="form-check form-switch">
                                <input class="form-check-input" type="checkbox" 
                                       id="uniforme_${estudiante.documento}" 
                                       ${uniforme ? 'checked' : ''}
                                       onchange="AsistenciaDiaria.marcarUniforme('${estudiante.documento}', this.checked)">
                                <label class="form-check-label" for="uniforme_${estudiante.documento}">
                                    ${uniforme ? 'Con Uniforme' : 'Sin Uniforme'}
                                </label>
                            </div>
                        </td>
                        <td>
                            <input type="text" class="form-control form-control-sm" 
                                   id="obs_${estudiante.documento}" 
                                   value="${observaciones}"
                                   placeholder="Observaciones"
                                   onchange="AsistenciaDiaria.actualizarObservacion('${estudiante.documento}', this.value)">
                        </td>
                    </tr>
                `;
            });

            tbody.innerHTML = html;

        } catch (error) {
            console.error('❌ Error renderizando asistencia:', error);
            tbody.innerHTML = '<tr><td colspan="7" class="text-center">Error cargando datos</td></tr>';
        }
    }

    /**
     * Marca asistencia de un estudiante
     */
    function marcarAsistencia(doc, presente) {
        if (!window.asistenciasTemp) window.asistenciasTemp = {};
        if (!window.asistenciasTemp[doc]) window.asistenciasTemp[doc] = {};

        window.asistenciasTemp[doc].asistio = presente;

        const label = document.querySelector(`label[for="asistencia_${doc}"]`);
        if (label) {
            label.textContent = presente ? 'Presente' : 'Ausente';
        }
    }

    /**
     * Marca uniforme de un estudiante
     */
    function marcarUniforme(doc, tieneUniforme) {
        if (!window.asistenciasTemp) window.asistenciasTemp = {};
        if (!window.asistenciasTemp[doc]) window.asistenciasTemp[doc] = {};

        window.asistenciasTemp[doc].uniforme = tieneUniforme;

        const label = document.querySelector(`label[for="uniforme_${doc}"]`);
        if (label) {
            label.textContent = tieneUniforme ? 'Con Uniforme' : 'Sin Uniforme';
        }
    }

    /**
     * Actualiza observación
     */
    function actualizarObservacion(doc, obs) {
        if (!window.asistenciasTemp) window.asistenciasTemp = {};
        if (!window.asistenciasTemp[doc]) window.asistenciasTemp[doc] = {};

        window.asistenciasTemp[doc].observaciones = obs;
    }

    /**
     * Marca todos los estudiantes
     */
    function marcarTodos() {
        console.log('✅ Marcando todos los estudiantes');

        const asis = document.querySelectorAll('[id^="asistencia_"]');
        const unif = document.querySelectorAll('[id^="uniforme_"]');

        asis.forEach(cb => {
            if (cb.type === 'checkbox') {
                cb.checked = true;
                const doc = cb.id.replace('asistencia_', '');
                marcarAsistencia(doc, true);
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
            Utils.showToast('success', 'Todos marcados');
        }
    }

    /**
     * Desmarca todos los estudiantes
     */
    function desmarcarTodos() {
        console.log('✅ Desmarcando todos los estudiantes');

        const asis = document.querySelectorAll('[id^="asistencia_"]');
        const unif = document.querySelectorAll('[id^="uniforme_"]');

        asis.forEach(cb => {
            if (cb.type === 'checkbox') {
                cb.checked = false;
                const doc = cb.id.replace('asistencia_', '');
                marcarAsistencia(doc, false);
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
            Utils.showToast('info', 'Todos desmarcados');
        }
    }

    /**
     * Guarda la asistencia del día
     */

    // En asistenciaDiaria.js, función guardarAsistencia

    async function guardarAsistencia() {
        console.log('💾 Guardando asistencia...');

        const cursoSelect = document.getElementById('cursoAsistencia');
        const fechaInput = document.getElementById('fechaAsistencia');

        if (!cursoSelect || !fechaInput) return;

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
            asistio: window.asistenciasTemp?.[e.documento]?.asistio || false,
            uniforme: window.asistenciasTemp?.[e.documento]?.uniforme || false,
            observaciones: window.asistenciasTemp?.[e.documento]?.observaciones || ''
        }));

        if (typeof AsistenciaData !== 'undefined') {
            const resultado = AsistenciaData.guardarAsistencia(curso, fecha, registros);

            if (resultado) {
                const presentes = registros.filter(r => r.asistio).length;
                const uniformes = registros.filter(r => r.uniforme).length;

                Swal.fire({
                    icon: 'success',
                    title: '✅ Asistencia guardada',
                    html: `
                    <p>Presentes: ${presentes}</p>
                    <p>Con uniforme: ${uniformes}</p>
                    <p>Total: ${registros.length}</p>
                `,
                    timer: 2000,
                    showConfirmButton: false
                });

                // Limpiar temporales
                window.asistenciasTemp = {};

                // Actualizar historial
                if (typeof HistorialAsistencia !== 'undefined') {
                    HistorialAsistencia.renderizarHistorial();
                }
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'No se pudo guardar la asistencia'
                });
            }
        }
    }

    /**
     * Carga asistencia por curso (inicialización)
     */
    function cargarAsistenciaPorCurso() {
        const cursoSelect = document.getElementById('cursoAsistencia');
        const fechaInput = document.getElementById('fechaAsistencia');

        if (cursoSelect && cursoSelect.value && fechaInput) {
            if (!fechaInput.value) {
                fechaInput.value = new Date().toISOString().split('T')[0];
            }
            filtrarAsistencia();
        }
    }

    // API pública
    return {
        filtrarAsistencia,
        renderizarTablaAsistencia,
        marcarAsistencia,
        marcarUniforme,
        actualizarObservacion,
        marcarTodos,
        desmarcarTodos,
        guardarAsistencia,
        cargarAsistenciaPorCurso
    };
})();

console.log('✅ Módulo AsistenciaDiaria cargado');
window.AsistenciaDiaria = AsistenciaDiaria;