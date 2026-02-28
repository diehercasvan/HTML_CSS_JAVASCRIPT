// puestos.js - Módulo de puestos docentes y mesas
// VERSIÓN 0.6 - COMPLETA Y CORREGIDA

console.log('🔄 Iniciando carga de puestos.js...');

// Verificar dependencias
if (typeof DataManager === 'undefined') {
    console.error('❌ puestos.js: DataManager NO DISPONIBLE');
} else {
    console.log('✅ puestos.js: DataManager disponible');
}

const PuestosModule = (function () {
    console.log('📦 Ejecutando IIFE de PuestosModule...');

    // ===== FUNCIONES PARA PUESTOS DOCENTES =====

    /**
     * Carga los docentes para el puesto según el curso seleccionado
     */
    async function cargarDocentesParaPuesto() {
        console.log('🔄 Cargando docentes para puesto...');

        const cursoSelect = document.getElementById('cursoPuestoDocente');
        const docenteSelect = document.getElementById('selectDocente');

        if (!cursoSelect || !docenteSelect) {
            console.warn('❌ Selectores no encontrados');
            return;
        }

        const cursoId = cursoSelect.value;

        docenteSelect.innerHTML = '<option value="">Seleccione un docente</option>';

        const docField = document.getElementById('documentoDocente');
        if (docField) docField.value = '';

        if (!cursoId) {
            console.log('⚠️ No hay curso seleccionado');
            return;
        }

        const responsables = await DataManager.cargarResponsables?.() || [];
        const docentes = responsables.filter(r => r.numeroCurso === cursoId);

        console.log(`📚 Docentes para curso ${cursoId}:`, docentes.length);

        if (docentes.length === 0) {
            docenteSelect.innerHTML = '<option value="">No hay docentes para este curso</option>';
            return;
        }

        docentes.forEach(d => {
            const option = document.createElement('option');
            option.value = d.documento;
            option.setAttribute('data-nombre', d.nombre);
            option.setAttribute('data-documento', d.documento);
            option.setAttribute('data-materia', d.materia || '');
            option.textContent = `${d.nombre} (${d.documento})${d.materia ? ' - ' + d.materia : ''}`;
            docenteSelect.appendChild(option);
        });

        console.log(`✅ ${docentes.length} docentes cargados`);
    }

    /**
     * Carga datos del docente seleccionado
     */
    function cargarDatosDocentePuesto() {
        const select = document.getElementById('selectDocente');
        if (!select) return;

        const docField = document.getElementById('documentoDocente');
        if (!docField) return;

        if (select.selectedIndex > 0) {
            const opt = select.options[select.selectedIndex];
            docField.value = opt.getAttribute('data-documento') || '';
        } else {
            docField.value = '';
        }
    }

    /**
     * Abre modal para agregar puesto
     */
    function agregarPuestoDocente() {
        console.log('🔄 Abriendo modal puesto docente...');

        const cursoSelect = document.getElementById('cursoPuestoDocente');

        if (!cursoSelect || !cursoSelect.value) {
            if (typeof Utils !== 'undefined') {
                Utils.showToast('warning', 'Primero seleccione un curso');
            } else {
                alert('Primero seleccione un curso');
            }
            return;
        }

        const form = document.getElementById('formPuestoDocente');
        if (form) form.reset();

        const docField = document.getElementById('documentoDocente');
        if (docField) docField.value = '';

        const cursoInfo = document.getElementById('infoCursoPuesto');
        const cursoSpan = document.getElementById('cursoPuestoSeleccionado');
        if (cursoInfo && cursoSpan) {
            cursoSpan.textContent = cursoSelect.options[cursoSelect.selectedIndex].textContent;
            cursoInfo.style.display = 'block';
        }

        cargarDocentesParaPuesto();

        if (typeof ModalManager !== 'undefined') {
            ModalManager.showModal('puestoDocente');
        }
    }

    /**
     * Guarda un puesto docente
     */
    function guardarPuestoDocente() {
        console.log('💾 Guardando puesto docente...');

        const select = document.getElementById('selectDocente');

        if (!select || select.selectedIndex <= 0) {
            if (typeof Utils !== 'undefined') {
                Utils.showToast('warning', 'Seleccione un docente');
            }
            return;
        }

        const serial = document.getElementById('serialPC')?.value;
        if (!serial) {
            if (typeof Utils !== 'undefined') {
                Utils.showToast('warning', 'Ingrese el serial del PC');
            }
            return;
        }

        const opt = select.options[select.selectedIndex];
        const puesto = {
            nombre: opt.getAttribute('data-nombre') || '',
            documento: opt.value || '',
            serial: serial,
            estado: document.getElementById('estadoPC')?.value || 'Excelente',
            mouse: document.getElementById('mousePC')?.value || 'Bueno',
            teclado: document.getElementById('tecladoPC')?.value || 'Bueno',
            pantalla: document.getElementById('pantallaPC')?.value || 'Bueno',
            internet: document.getElementById('internet')?.value || 'Funciona',
            estadoLimpieza: document.getElementById('estadoLimpiezaPC')?.value || 'Bueno',
            observaciones: document.getElementById('observacionesPC')?.value || '',
            curso: document.getElementById('cursoPuestoDocente')?.value || ''
        };

        DataManager.agregarPuestoDocente(puesto);

        if (typeof UIManager !== 'undefined') {
            UIManager.renderizarPuestosDocentes();
        }

        if (typeof ModalManager !== 'undefined') {
            ModalManager.hideModal('puestoDocente');
        }

        if (typeof Utils !== 'undefined') {
            Utils.showToast('success', 'Puesto guardado');
        }
    }

    /**
     * Elimina un puesto
     */
    function eliminarPuestoDocente(index) {
        const confirmar = async () => {
            if (typeof Utils !== 'undefined') {
                const result = await Utils.showConfirm('¿Eliminar puesto?', 'Esta acción no se puede deshacer');
                return result.isConfirmed;
            }
            return confirm('¿Eliminar puesto?');
        };

        confirmar().then(ok => {
            if (ok) {
                DataManager.eliminarPuestoDocente(index);
                if (typeof UIManager !== 'undefined') {
                    UIManager.renderizarPuestosDocentes();
                }
                if (typeof Utils !== 'undefined') {
                    Utils.showToast('success', 'Puesto eliminado');
                }
            }
        });
    }

    /**
     * Inicializa selector de cursos
     */
    async function inicializarSelectorCursos() {
        console.log('🔄 Inicializando selector de cursos para puestos...');

        const cursoSelect = document.getElementById('cursoPuestoDocente');
        if (!cursoSelect) {
            console.warn('⚠️ Selector no encontrado');
            return;
        }

        const cursos = DataManager.getCursos?.() || [];

        cursoSelect.innerHTML = '<option value="">Seleccione un curso</option>';

        cursos.forEach(curso => {
            const option = document.createElement('option');
            option.value = curso.id;
            option.textContent = `${curso.id} - ${curso.nombre}`;
            cursoSelect.appendChild(option);
        });

        console.log(`✅ Selector con ${cursos.length} cursos`);
    }

    // ===== FUNCIONES PARA MESAS =====

    /**
     * Carga estudiantes para mesas
     */
    async function cargarEstudiantesParaMesas() {
        const cursoSelect = document.getElementById('cursoMesas');
        if (!cursoSelect) return;

        const cursoId = cursoSelect.value;

        if (!cursoId) {
            sessionStorage.removeItem('cursoMesasSeleccionado');
            return;
        }

        if (DataManager.hayDatosDeOtroCurso && DataManager.hayDatosDeOtroCurso(cursoId)) {
            const confirmar = async () => {
                if (typeof Utils !== 'undefined') {
                    const res = await Utils.showConfirm(
                        '¿Cambiar de curso?',
                        'Los datos del curso anterior se eliminarán'
                    );
                    return res.isConfirmed;
                }
                return confirm('¿Cambiar de curso?');
            };

            if (!await confirmar()) {
                cursoSelect.value = sessionStorage.getItem('cursoMesasSeleccionado') || '';
                return;
            }

            const otros = [...new Set([
                ...(DataManager.getMesas?.() || []).map(m => m.curso),
                ...(DataManager.getSillas?.() || []).map(s => s.curso)
            ])].filter(c => c && c !== cursoId);

            otros.forEach(c => DataManager.limpiarDatosPorCurso?.(c));
        }

        sessionStorage.setItem('cursoMesasSeleccionado', cursoId);
        console.log(`✅ Curso seleccionado para mesas: ${cursoId}`);
    }

    /**
     * Crea distribución de mesas
     */
    function crearDistribucionMesas() {
        const curso = sessionStorage.getItem('cursoMesasSeleccionado');

        if (!curso) {
            if (typeof Utils !== 'undefined') {
                Utils.showToast('warning', 'Seleccione un curso');
            }
            return;
        }

        const filas = parseInt(document.getElementById('filas')?.value) || 3;
        const cols = parseInt(document.getElementById('columnas')?.value) || 2;
        const pcs = parseInt(document.getElementById('pcsPorMesa')?.value) || 2;

        if (filas > 10 || cols > 6 || pcs > 6) {
            if (typeof Utils !== 'undefined') {
                Utils.showToast('warning', 'Límites: 10 filas, 6 columnas, 6 PCs');
            }
            return;
        }

        DataManager.configurarMesas(filas, cols, pcs, curso);

        if (typeof UIManager !== 'undefined') {
            UIManager.renderizarMesas();
        }

        if (typeof Utils !== 'undefined') {
            Utils.showToast('success', `Mesas creadas para el curso ${curso}`);
        }
    }

    /**
     * Abre configuración de mesa
     */
    function abrirConfiguracionMesa(mesaId) {
        const mesa = DataManager.getMesa(mesaId);
        if (!mesa) return;

        let html = '<div style="max-height:60vh; overflow-y:auto">';
        mesa.pcs.forEach((pc, i) => {
            const estado = typeof Utils !== 'undefined' ? Utils.getBadgeClass(pc.estado) : 'bg-secondary';
            html += `
                <div class="card mb-2">
                    <div class="card-header">PC ${i + 1} - ${pc.serial}</div>
                    <div class="card-body">
                        <span class="badge ${estado}">${pc.estado}</span>
                        <span class="badge ${pc.estudiante ? 'bg-success' : 'bg-secondary'} ms-2">
                            ${pc.estudiante || 'Sin asignar'}
                        </span>
                        <button class="btn btn-sm btn-primary mt-2 w-100" onclick="editarPC('${mesa.id}',${i})">
                            <i class="fas fa-edit"></i> Configurar
                        </button>
                    </div>
                </div>
            `;
        });
        html += '</div>';

        Swal.fire({
            title: `Mesa ${mesa.fila + 1}-${mesa.columna + 1}`,
            html,
            width: '600px',
            showConfirmButton: false,
            showCloseButton: true
        });
    }

    /**
     * Edita un PC
     */
    async function editarPC(mesaId, pcIndex) {
        if (Swal.isVisible()) Swal.close();

        const mesa = DataManager.getMesa(mesaId);
        if (!mesa?.pcs?.[pcIndex]) return;

        const pc = mesa.pcs[pcIndex];
        const estudiantes = await DataManager.getEstudiantesPorCurso(mesa.curso) || [];
        const asignados = DataManager.getPCsAsignados?.(mesa.curso) || [];
        const disponibles = estudiantes.filter(e =>
            !asignados.includes(e.documento) || e.documento === pc.documento
        );

        const select = document.getElementById('selectEstudiantePC');
        if (select) {
            select.innerHTML = '<option value="">Seleccione estudiante</option>';
            disponibles.forEach(e => {
                const opt = document.createElement('option');
                opt.value = e.documento;
                opt.setAttribute('data-nombre', `${e.nombres} ${e.apellidos}`);
                opt.textContent = `${e.documento} - ${e.nombres} ${e.apellidos}`;
                select.appendChild(opt);
            });

            if (pc.documento) {
                for (let i = 0; i < select.options.length; i++) {
                    if (select.options[i].value === pc.documento) {
                        select.selectedIndex = i;
                        window.cargarDatosEstudiantePC?.();
                        break;
                    }
                }
            }
        }

        // Llenar campos
        const campos = [
            'mesaId', 'pcIndex', 'mesaInfo', 'pcInfo', 'pcSerial',
            'pcEstudiante', 'pcDocumento', 'pcEstado', 'pcMouse',
            'pcTeclado', 'pcPantalla', 'pcInternet', 'pcLimpieza', 'pcObservaciones'
        ];

        campos.forEach(id => {
            const el = document.getElementById(id);
            if (!el) return;

            if (id === 'mesaId') el.value = mesaId;
            else if (id === 'pcIndex') el.value = pcIndex;
            else if (id === 'mesaInfo') el.textContent = `Mesa ${mesa.fila + 1}-${mesa.columna + 1}`;
            else if (id === 'pcInfo') el.textContent = `PC ${pcIndex + 1} - ${pc.serial}`;
            else if (id === 'pcSerial') el.value = pc.serial || '';
            else if (id === 'pcEstudiante') el.value = pc.estudiante || '';
            else if (id === 'pcDocumento') el.value = pc.documento || '';
            else if (id === 'pcEstado') el.value = pc.estado || 'Excelente';
            else if (id === 'pcMouse') el.value = pc.mouse || 'Bueno';
            else if (id === 'pcTeclado') el.value = pc.teclado || 'Bueno';
            else if (id === 'pcPantalla') el.value = pc.pantalla || 'Bueno';
            else if (id === 'pcInternet') el.value = pc.internet || 'Funciona';
            else if (id === 'pcLimpieza') el.value = pc.estadoLimpieza || 'Bueno';
            else if (id === 'pcObservaciones') el.value = pc.observaciones || '';
        });

        const cursoSpan = document.getElementById('cursoActual');
        if (cursoSpan) cursoSpan.textContent = mesa.curso;

        const cursoInfo = document.getElementById('cursoInfo');
        if (cursoInfo) cursoInfo.style.display = 'block';

        if (typeof ModalManager !== 'undefined') {
            ModalManager.showModal('configurarPC');
        }
    }

    /**
  * Guarda la configuración de un PC
  */
  /**
 * Guarda la configuración de un PC
 */
function guardarConfiguracionPC() {
    console.log('💾 Guardando configuración de PC...');
    
    const mesaId = document.getElementById('mesaId')?.value;
    const idx = parseInt(document.getElementById('pcIndex')?.value);
    const serial = document.getElementById('pcSerial')?.value;
    
    if (!serial) {
        if (typeof Utils !== 'undefined') {
            Utils.showToast('warning', 'Serial requerido');
        }
        return;
    }
    
    const data = {
        serial: serial,
        estudiante: document.getElementById('pcEstudiante')?.value || '',
        documento: document.getElementById('pcDocumento')?.value || '',
        estado: document.getElementById('pcEstado')?.value || 'Excelente',
        mouse: document.getElementById('pcMouse')?.value || 'Bueno',
        teclado: document.getElementById('pcTeclado')?.value || 'Bueno',
        pantalla: document.getElementById('pcPantalla')?.value || 'Bueno',
        internet: document.getElementById('pcInternet')?.value || 'Funciona',
        estadoLimpieza: document.getElementById('pcLimpieza')?.value || 'Bueno',
        observaciones: document.getElementById('pcObservaciones')?.value || ''
    };
    
    console.log('📦 Datos a guardar:', data);
    
    // IMPORTANTE: Verificar que DataManager existe
    if (typeof DataManager === 'undefined') {
        console.error('❌ DataManager no está disponible');
        if (typeof Utils !== 'undefined') {
            Utils.showToast('error', 'Error: DataManager no disponible');
        }
        return;
    }
    
    // IMPORTANTE: Usar el nombre EXACTO de la función (con c minúscula)
    if (typeof DataManager.actualizarPcEstudiante !== 'function') {
        console.error('❌ DataManager.actualizarPcEstudiante no es una función');
        console.log('Funciones disponibles en DataManager:', Object.keys(DataManager));
        if (typeof Utils !== 'undefined') {
            Utils.showToast('error', 'Error: función no disponible');
        }
        return;
    }
    
    // Llamada correcta
    const resultado = DataManager.actualizarPcEstudiante(mesaId, idx, data);
    
    if (!resultado) {
        if (typeof Utils !== 'undefined') {
            Utils.showToast('warning', 'Estudiante ya asignado');
        }
        return;
    }
    
    if (typeof UIManager !== 'undefined') {
        UIManager.renderizarMesas();
    }
    
    if (typeof ModalManager !== 'undefined') {
        ModalManager.hideModal('configurarPC');
    }
    
    if (typeof Utils !== 'undefined') {
        Utils.showToast('success', 'PC configurado');
    }
}

    /**
     * Carga datos del estudiante en PC
     */
    function cargarDatosEstudiantePC() {
        const select = document.getElementById('selectEstudiantePC');
        if (!select) return;

        const nombre = document.getElementById('pcEstudiante');
        const doc = document.getElementById('pcDocumento');

        if (select.selectedIndex > 0) {
            const opt = select.options[select.selectedIndex];
            if (nombre) nombre.value = opt.getAttribute('data-nombre') || '';
            if (doc) doc.value = opt.value;
        } else {
            if (nombre) nombre.value = '';
            if (doc) doc.value = '';
        }
    }

    // Inicializar
    setTimeout(() => {
        inicializarSelectorCursos();
    }, 300);

    // Exponer funciones
    window.cargarDocentesParaPuesto = cargarDocentesParaPuesto;
    window.cargarDatosDocentePuesto = cargarDatosDocentePuesto;
    window.agregarPuestoDocente = agregarPuestoDocente;
    window.guardarPuestoDocente = guardarPuestoDocente;
    window.eliminarPuestoDocente = eliminarPuestoDocente;

    window.cargarEstudiantesParaMesas = cargarEstudiantesParaMesas;
    window.crearDistribucionMesas = crearDistribucionMesas;
    window.abrirConfiguracionMesa = abrirConfiguracionMesa;
    window.editarPC = editarPC;
    window.guardarConfiguracionPC = guardarConfiguracionPC;
    window.cargarDatosEstudiantePC = cargarDatosEstudiantePC;

    const api = {
        cargarDocentesParaPuesto,
        agregarPuestoDocente,
        guardarPuestoDocente,
        eliminarPuestoDocente,
        cargarEstudiantesParaMesas,
        crearDistribucionMesas,
        abrirConfiguracionMesa,
        editarPC,
        guardarConfiguracionPC
    };

    console.log('✅ PuestosModule: API creada');
    return api;
})();

if (typeof PuestosModule !== 'undefined') {
    console.log('✅ PuestosModule v0.6 cargado correctamente');
} else {
    console.error('❌ Error cargando PuestosModule');
}

window.PuestosModule = PuestosModule;