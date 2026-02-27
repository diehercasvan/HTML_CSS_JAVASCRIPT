// puestos.js - Módulo de puestos docentes y mesas
// VERSIÓN CORREGIDA - v0.5

const PuestosModule = (function() {
    
    // ===== FUNCIONES PARA PUESTOS DOCENTES =====
    
    /**
     * Carga los docentes para el puesto según el curso seleccionado
     */
    async function cargarDocentesParaPuesto() {
        console.log('🔄 Cargando docentes para puesto...');
        
        const cursoSelect = document.getElementById('cursoPuestoDocente');
        const docenteSelect = document.getElementById('selectDocente');
        
        if (!cursoSelect || !docenteSelect) {
            console.error('❌ Selectores no encontrados');
            return;
        }
        
        const cursoId = cursoSelect.value;
        
        // Limpiar select de docentes
        docenteSelect.innerHTML = '<option value="">Seleccione un docente</option>';
        document.getElementById('documentoDocente').value = '';
        
        if (!cursoId) {
            console.log('⚠️ No hay curso seleccionado');
            return;
        }
        
        try {
            // Cargar responsables desde DataManager
            const responsables = await DataManager.cargarResponsables?.() || [];
            console.log(`📚 Total responsables: ${responsables.length}`);
            
            // Filtrar por curso - usar numeroCurso (camelCase)
            const docentes = responsables.filter(r => r.numeroCurso === cursoId);
            console.log(`📚 Docentes para curso ${cursoId}:`, docentes);
            
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
            
            console.log(`✅ ${docentes.length} docentes cargados en el selector`);
            
        } catch (error) {
            console.error('❌ Error cargando docentes:', error);
        }
    }

    /**
     * Carga datos del docente seleccionado en el puesto
     */
    function cargarDatosDocentePuesto() {
        const select = document.getElementById('selectDocente');
        if (!select) return;
        
        const selectedIndex = select.selectedIndex;
        
        if (selectedIndex > 0) {
            const selectedOption = select.options[selectedIndex];
            const documento = selectedOption.getAttribute('data-documento') || '';
            document.getElementById('documentoDocente').value = documento;
            console.log('✅ Documento seleccionado:', documento);
        } else {
            document.getElementById('documentoDocente').value = '';
        }
    }

    /**
     * Abre el modal para agregar puesto docente
     */
    function agregarPuestoDocente() {
        console.log('🔄 Abriendo modal de puesto docente...');
        
        const cursoSelect = document.getElementById('cursoPuestoDocente');
        
        if (!cursoSelect || !cursoSelect.value) {
            Utils.showToast('warning', 'Primero seleccione un curso');
            return;
        }
        
        // Limpiar formulario
        const form = document.getElementById('formPuestoDocente');
        if (form) form.reset();
        
        document.getElementById('documentoDocente').value = '';
        
        // Mostrar información del curso en el modal
        const cursoInfo = document.getElementById('infoCursoPuesto');
        const cursoSpan = document.getElementById('cursoPuestoSeleccionado');
        
        if (cursoInfo && cursoSpan) {
            const selectedOption = cursoSelect.options[cursoSelect.selectedIndex];
            cursoSpan.textContent = selectedOption.textContent;
            cursoInfo.style.display = 'block';
        }
        
        // Cargar docentes del curso
        cargarDocentesParaPuesto();
        
        // Abrir modal
        if (!ModalManager.showModal('puestoDocente')) {
            console.error('❌ No se pudo abrir el modal');
        }
    }

    /**
     * Guarda un puesto docente
     */
    function guardarPuestoDocente() {
        console.log('🔄 Guardando puesto docente...');
        
        const select = document.getElementById('selectDocente');
        
        if (!select || select.selectedIndex <= 0) {
            Utils.showToast('warning', 'Seleccione un docente');
            return;
        }
        
        const serial = document.getElementById('serialPC')?.value;
        if (!serial) {
            Utils.showToast('warning', 'Ingrese el serial del PC');
            return;
        }
        
        const selectedIndex = select.selectedIndex;
        const selectedOption = select.options[selectedIndex];
        
        // Obtener datos del docente seleccionado
        const nombre = selectedOption.getAttribute('data-nombre') || '';
        const documento = selectedOption.value || '';
        const materia = selectedOption.getAttribute('data-materia') || '';
        
        console.log('📝 Datos a guardar:', { nombre, documento, serial, materia });
        
        const puesto = {
            nombre: nombre,
            documento: documento,
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
        
        // Guardar en DataManager
        DataManager.agregarPuestoDocente(puesto);
        
        // Actualizar tabla
        if (typeof UIManager !== 'undefined' && UIManager.renderizarPuestosDocentes) {
            UIManager.renderizarPuestosDocentes();
        }
        
        // Cerrar modal
        ModalManager.hideModal('puestoDocente');
        Utils.showToast('success', 'Puesto guardado');
    }

    /**
     * Elimina un puesto docente
     */
    function eliminarPuestoDocente(index) {
        Utils.showConfirm('¿Eliminar?', 'Esta acción no se puede deshacer')
            .then(result => {
                if (result.isConfirmed) {
                    DataManager.eliminarPuestoDocente(index);
                    if (typeof UIManager !== 'undefined') {
                        UIManager.renderizarPuestosDocentes();
                    }
                    Utils.showToast('success', 'Puesto eliminado');
                }
            });
    }

    /**
     * Inicializa el selector de cursos para puestos
     */
    async function inicializarSelectorCursos() {
        console.log('🔄 Inicializando selector de cursos para puestos...');
        
        const cursoSelect = document.getElementById('cursoPuestoDocente');
        if (!cursoSelect) {
            console.warn('⚠️ Selector de cursos no encontrado');
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
        
        console.log(`✅ Selector de cursos inicializado con ${cursos.length} cursos`);
    }

    // ===== FUNCIONES PARA MESAS =====
    
    /**
     * Carga estudiantes para mesas según curso
     */
    async function cargarEstudiantesParaMesas() {
        const cursoSelect = document.getElementById('cursoMesas');
        if (!cursoSelect) return;
        
        const cursoId = cursoSelect.value;
        
        if (!cursoId) {
            sessionStorage.removeItem('cursoMesasSeleccionado');
            return;
        }
        
        sessionStorage.setItem('cursoMesasSeleccionado', cursoId);
        console.log(`✅ Curso seleccionado para mesas: ${cursoId}`);
    }

    /**
     * Crea la distribución de mesas
     */
    function crearDistribucionMesas() {
        const curso = sessionStorage.getItem('cursoMesasSeleccionado');
        if (!curso) {
            Utils.showToast('warning', 'Seleccione un curso');
            return;
        }
        
        const filas = parseInt(document.getElementById('filas')?.value) || 3;
        const cols = parseInt(document.getElementById('columnas')?.value) || 2;
        const pcs = parseInt(document.getElementById('pcsPorMesa')?.value) || 2;
        
        if (filas > 10) {
            Utils.showToast('warning', 'Máximo 10 filas');
            return;
        }
        if (cols > 6) {
            Utils.showToast('warning', 'Máximo 6 columnas');
            return;
        }
        if (pcs > 6) {
            Utils.showToast('warning', 'Máximo 6 PCs por mesa');
            return;
        }
        
        DataManager.configurarMesas(filas, cols, pcs, curso);
        
        if (typeof UIManager !== 'undefined') {
            UIManager.renderizarMesas();
        }
        
        Utils.showToast('success', 'Mesas creadas');
    }

    /**
     * Abre configuración de una mesa
     */
    function abrirConfiguracionMesa(mesaId) {
        const mesa = DataManager.getMesa(mesaId);
        if (!mesa) return;
        
        let html = '<div style="max-height:60vh; overflow-y:auto">';
        mesa.pcs.forEach((pc, i) => {
            const estado = Utils.getBadgeClass(pc.estado);
            html += `
                <div class="card mb-2">
                    <div class="card-header">PC ${i+1} - ${pc.serial}</div>
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
            title: `Mesa ${mesa.fila+1}-${mesa.columna+1}`,
            html,
            width: '600px',
            showConfirmButton: false,
            showCloseButton: true
        });
    }

    /**
     * Edita un PC específico
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
        
        // Llenar campos
        document.getElementById('mesaId').value = mesaId;
        document.getElementById('pcIndex').value = pcIndex;
        document.getElementById('mesaInfo').textContent = `Mesa ${mesa.fila+1}-${mesa.columna+1}`;
        document.getElementById('pcInfo').textContent = `PC ${pcIndex+1} - ${pc.serial}`;
        document.getElementById('pcSerial').value = pc.serial || '';
        document.getElementById('pcEstudiante').value = pc.estudiante || '';
        document.getElementById('pcDocumento').value = pc.documento || '';
        document.getElementById('pcEstado').value = pc.estado || 'Excelente';
        document.getElementById('pcMouse').value = pc.mouse || 'Bueno';
        document.getElementById('pcTeclado').value = pc.teclado || 'Bueno';
        document.getElementById('pcPantalla').value = pc.pantalla || 'Bueno';
        document.getElementById('pcInternet').value = pc.internet || 'Funciona';
        document.getElementById('pcLimpieza').value = pc.estadoLimpieza || 'Bueno';
        document.getElementById('pcObservaciones').value = pc.observaciones || '';
        document.getElementById('cursoActual').textContent = mesa.curso;
        document.getElementById('cursoInfo').style.display = 'block';
        
        ModalManager.showModal('configurarPC');
    }

    /**
     * Guarda la configuración de un PC
     */
    function guardarConfiguracionPC() {
        const mesaId = document.getElementById('mesaId')?.value;
        const idx = parseInt(document.getElementById('pcIndex')?.value);
        const serial = document.getElementById('pcSerial')?.value;
        
        if (!serial) {
            Utils.showToast('warning', 'Serial requerido');
            return;
        }
        
        const data = {
            serial,
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
        
        if (!DataManager.actualizarPcEstudiante(mesaId, idx, data)) {
            Utils.showToast('warning', 'Estudiante ya asignado');
            return;
        }
        
        if (typeof UIManager !== 'undefined') {
            UIManager.renderizarMesas();
        }
        
        ModalManager.hideModal('configurarPC');
        Utils.showToast('success', 'PC configurado');
    }

    /**
     * Carga datos del estudiante seleccionado en el PC
     */
    function cargarDatosEstudiantePC() {
        const select = document.getElementById('selectEstudiantePC');
        if (select.selectedIndex > 0) {
            const opt = select.options[select.selectedIndex];
            document.getElementById('pcEstudiante').value = opt.getAttribute('data-nombre') || '';
            document.getElementById('pcDocumento').value = opt.value;
        } else {
            document.getElementById('pcEstudiante').value = '';
            document.getElementById('pcDocumento').value = '';
        }
    }

    // Inicializar al cargar el módulo
    setTimeout(() => {
        inicializarSelectorCursos();
    }, 300);

    // Exponer funciones globalmente
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

    return {
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
})();

console.log('✅ Módulo Puestos v0.5 cargado correctamente');