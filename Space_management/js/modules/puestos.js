// puestos.js - Módulo de puestos docentes y mesas
// VERSIÓN 0.8 - CON ACTUALIZACIÓN EN TIEMPO REAL

console.log('🔄 Iniciando carga de puestos.js v0.8...');

// Verificar dependencias
if (typeof DataManager === 'undefined') {
    console.error('❌ puestos.js: DataManager NO DISPONIBLE');
} else {
    console.log('✅ puestos.js: DataManager disponible');
}

const PuestosModule = (function () {
    console.log('📦 Ejecutando IIFE de PuestosModule...');

    // ===== FUNCIÓN DE VALIDACIÓN =====

    /**
     * Valida que exista al menos un puesto docente y mesas de estudiantes configuradas
     */
    function validarConfiguracion() {
        console.log('🔍 Validando configuración de puestos y mesas...');

        // Obtener datos actuales
        const puestosDocentes = DataManager.getPuestosDocentes ? DataManager.getPuestosDocentes() : [];
        const mesas = DataManager.getMesas ? DataManager.getMesas() : [];

        // Obtener curso seleccionado (si hay)
        const cursoSelect = document.getElementById('cursoPuestoDocente');
        const cursoSeleccionado = cursoSelect?.value || 'todos';

        // Filtrar por curso si hay uno seleccionado
        let puestosFiltrados = puestosDocentes;
        let mesasFiltradas = mesas;

        if (cursoSeleccionado && cursoSeleccionado !== 'todos' && cursoSeleccionado !== '') {
            puestosFiltrados = puestosDocentes.filter(p => p.curso === cursoSeleccionado);
            mesasFiltradas = mesas.filter(m => m.curso === cursoSeleccionado);
        }

        // Resultados de validación
        const tienePuestoDocente = puestosFiltrados.length > 0;
        const tieneMesas = mesasFiltradas.length > 0;

        // Calcular estadísticas adicionales
        const totalPCs = mesasFiltradas.reduce((acc, mesa) => acc + (mesa.pcs?.length || 0), 0);
        const pcsAsignados = mesasFiltradas.reduce((acc, mesa) =>
            acc + (mesa.pcs?.filter(pc => pc.estudiante).length || 0), 0);

        // Generar mensajes según el resultado
        let mensaje = '';
        let icono = 'success';
        let titulo = '✅ Configuración Completa';

        if (!tienePuestoDocente && !tieneMesas) {
            icono = 'error';
            titulo = '❌ Configuración Incompleta';
            mensaje = `
                <div class="alert alert-danger mb-3">
                    <strong>No hay configuración de puestos docentes ni mesas de estudiantes.</strong>
                </div>
                <p>Debe realizar las siguientes acciones:</p>
                <ol class="text-start">
                    <li><strong>Configurar puesto docente:</strong> Seleccione un curso y use el botón "Agregar Puesto Docente"</li>
                    <li><strong>Crear mesas de estudiantes:</strong> En la sección "Configuración de Mesas", seleccione un curso y configure la distribución</li>
                </ol>
            `;
        } else if (!tienePuestoDocente) {
            icono = 'warning';
            titulo = '⚠️ Falta Puesto Docente';
            mensaje = `
                <div class="alert alert-warning mb-3">
                    <strong>Las mesas de estudiantes están configuradas, pero falta el puesto docente.</strong>
                </div>
                <p>Acciones requeridas:</p>
                <ol class="text-start">
                    <li><strong>Configurar puesto docente:</strong> Seleccione un curso y use el botón "Agregar Puesto Docente"</li>
                    <li>Complete los datos del docente y guarde</li>
                </ol>
                <div class="mt-3 p-2 bg-light rounded">
                    <strong>📊 Mesas configuradas:</strong> ${mesasFiltradas.length} mesas, ${totalPCs} PCs (${pcsAsignados} asignados)
                </div>
            `;
        } else if (!tieneMesas) {
            icono = 'warning';
            titulo = '⚠️ Faltan Mesas de Estudiantes';
            mensaje = `
                <div class="alert alert-warning mb-3">
                    <strong>El puesto docente está configurado, pero no hay mesas de estudiantes.</strong>
                </div>
                <p>Acciones requeridas:</p>
                <ol class="text-start">
                    <li><strong>Crear mesas de estudiantes:</strong> En la sección "Configuración de Mesas"</li>
                    <li>Seleccione el curso ${cursoSeleccionado ? cursoSeleccionado : 'correspondiente'}</li>
                    <li>Configure filas, columnas y PCs por mesa</li>
                    <li>Haga clic en "Crear Distribución"</li>
                </ol>
                <div class="mt-3 p-2 bg-light rounded">
                    <strong>👨‍🏫 Puesto docente:</strong> ${puestosFiltrados.length} configurado(s)
                </div>
            `;
        } else {
            // Todo está configurado
            const totalPuestos = puestosFiltrados.length;
            const detallesPuestos = puestosFiltrados.map(p =>
                `• ${p.nombre} - PC: ${p.serial} (${p.estado})`
            ).join('<br>');

            mensaje = `
                <div class="alert alert-success mb-3">
                    <strong>✓ La configuración es correcta y completa.</strong>
                </div>
                <div class="row">
                    <div class="col-md-6">
                        <div class="card">
                            <div class="card-header bg-primary text-white">
                                <strong>👨‍🏫 Puestos Docentes (${totalPuestos})</strong>
                            </div>
                            <div class="card-body">
                                <small>${detallesPuestos}</small>
                            </div>
                        </div>
                    </div>
                    <div class="col-md-6">
                        <div class="card">
                            <div class="card-header bg-success text-white">
                                <strong>🖥️ Mesas de Estudiantes (${mesasFiltradas.length})</strong>
                            </div>
                            <div class="card-body">
                                <small>
                                    • Total PCs: ${totalPCs}<br>
                                    • PCs Asignados: ${pcsAsignados}<br>
                                    • PCs Disponibles: ${totalPCs - pcsAsignados}
                                </small>
                            </div>
                        </div>
                    </div>
                </div>
                <p class="mt-3 text-success">
                    <i class="fas fa-check-circle"></i> El salón está listo para funcionar.
                </p>
            `;
        }

        // Mostrar resultado con SweetAlert2
        Swal.fire({
            title: titulo,
            html: mensaje,
            icon: icono,
            width: '700px',
            confirmButtonText: 'Entendido',
            confirmButtonColor: '#0d6efd'
        });

        // También mostrar en consola para debugging
        console.log('📊 Resultado de validación:', {
            tienePuestoDocente,
            tieneMesas,
            puestos: puestosFiltrados.length,
            mesas: mesasFiltradas.length,
            totalPCs,
            pcsAsignados
        });

        return {
            valido: tienePuestoDocente && tieneMesas,
            tienePuestoDocente,
            tieneMesas,
            puestos: puestosFiltrados,
            mesas: mesasFiltradas
        };
    }

    /**
     * Obtiene el estado actual de la configuración
     */
    function obtenerEstadoConfiguracion() {
        const puestosDocentes = DataManager.getPuestosDocentes ? DataManager.getPuestosDocentes() : [];
        const mesas = DataManager.getMesas ? DataManager.getMesas() : [];

        const cursoSelect = document.getElementById('cursoPuestoDocente');
        const cursoSeleccionado = cursoSelect?.value;

        let puestosFiltrados = puestosDocentes;
        let mesasFiltradas = mesas;

        if (cursoSeleccionado && cursoSeleccionado !== '') {
            puestosFiltrados = puestosDocentes.filter(p => p.curso === cursoSeleccionado);
            mesasFiltradas = mesas.filter(m => m.curso === cursoSeleccionado);
        }

        return {
            tienePuesto: puestosFiltrados.length > 0,
            tieneMesas: mesasFiltradas.length > 0,
            totalPuestos: puestosFiltrados.length,
            totalMesas: mesasFiltradas.length,
            curso: cursoSeleccionado || 'todos'
        };
    }

    /**
     * NUEVA VERSIÓN: Mostrar indicador de estado con actualización en tiempo real
     */
    function mostrarIndicadorEstado() {
        const estado = obtenerEstadoConfiguracion();
        console.log('🔄 Actualizando indicador de estado:', estado);

        let indicador = document.getElementById('estadoConfiguracionPuestos');

        if (!indicador) {
            // Crear el indicador si no existe
            const container = document.querySelector('.tab-pane#puestos .row:first-child .col-md-4:last-child');
            if (container) {
                // Crear una nueva fila para el indicador
                const row = document.createElement('div');
                row.className = 'row mt-3';
                row.innerHTML = `
                    <div class="col-12">
                        <div id="estadoConfiguracionPuestos" class="alert alert-info d-flex justify-content-between align-items-center">
                            <span>
                                <i class="fas fa-info-circle"></i>
                                <strong>Estado de configuración:</strong>
                            </span>
                            <div>
                                <span class="badge ${estado.tienePuesto ? 'bg-success' : 'bg-danger'} me-2" id="badgePuestoDocente">
                                    Puesto Docente: ${estado.tienePuesto ? '✅' : '❌'}
                                </span>
                                <span class="badge ${estado.tieneMesas ? 'bg-success' : 'bg-danger'} me-2" id="badgeMesasEstudiantes">
                                    Mesas: ${estado.tieneMesas ? '✅' : '❌'}
                                </span>
                                <button class="btn btn-sm btn-outline-primary" onclick="PuestosModule.validarConfiguracion()">
                                    <i class="fas fa-sync-alt"></i> Validar
                                </button>
                            </div>
                        </div>
                    </div>
                `;

                // Insertar después del primer row
                const primerRow = document.querySelector('.tab-pane#puestos .row:first-child');
                if (primerRow && primerRow.parentNode) {
                    primerRow.parentNode.insertBefore(row, primerRow.nextSibling);
                }

                indicador = document.getElementById('estadoConfiguracionPuestos');
            }
        } else {
            // Actualizar indicador existente
            const badgePuesto = document.getElementById('badgePuestoDocente') || indicador.querySelector('.badge:first-of-type');
            const badgeMesas = document.getElementById('badgeMesasEstudiantes') || indicador.querySelector('.badge:last-of-type');

            if (badgePuesto) {
                badgePuesto.className = `badge ${estado.tienePuesto ? 'bg-success' : 'bg-danger'} me-2`;
                badgePuesto.innerHTML = `Puesto Docente: ${estado.tienePuesto ? '✅' : '❌'}`;
            }

            if (badgeMesas) {
                badgeMesas.className = `badge ${estado.tieneMesas ? 'bg-success' : 'bg-danger'} me-2`;
                badgeMesas.innerHTML = `Mesas: ${estado.tieneMesas ? '✅' : '❌'}`;
            }
        }
    }

    // ===== FUNCIONES EXISTENTES MODIFICADAS =====

    /**
     * Guarda un puesto docente (MODIFICADO para actualizar estado)
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

        // ACTUALIZAR INDICADOR INMEDIATAMENTE
        setTimeout(() => {
            mostrarIndicadorEstado();
        }, 100);
    }

    /**
     * Elimina un puesto (MODIFICADO para actualizar estado)
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
                // ACTUALIZAR INDICADOR INMEDIATAMENTE
                setTimeout(() => {
                    mostrarIndicadorEstado();
                }, 100);
            }
        });
    }

    /**
     * Crea distribución de mesas (MODIFICADO para actualizar estado)
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

        // ACTUALIZAR INDICADOR INMEDIATAMENTE
        setTimeout(() => {
            mostrarIndicadorEstado();
        }, 100);
    }

    /**
     * Inicializa selector de cursos (MODIFICADO con evento change mejorado)
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

        // Agregar evento para actualizar indicador al cambiar curso
        cursoSelect.addEventListener('change', function () {
            console.log('📌 Curso cambiado a:', this.value);
            // Actualizar el curso en sessionStorage para mesas
            if (this.value) {
                sessionStorage.setItem('cursoMesasSeleccionado', this.value);
            }
            // Actualizar indicador
            mostrarIndicadorEstado();
        });
    }

    /**
     * Inicializar todo el módulo
     */
    async function inicializar() {
        console.log('🔄 Inicializando módulo de puestos...');
        await inicializarSelectorCursos();

        // Crear indicador de estado después de un pequeño retraso
        setTimeout(() => {
            mostrarIndicadorEstado();
        }, 500);

        // Agregar listener para cuando se muestre la pestaña
        const tabButton = document.querySelector('button[data-bs-target="#puestos"]');
        if (tabButton) {
            tabButton.addEventListener('shown.bs.tab', function () {
                console.log('📌 Pestaña Puestos activada - Actualizando estado...');
                setTimeout(() => {
                    mostrarIndicadorEstado();
                }, 200);
            });
        }

        console.log('✅ Módulo de puestos inicializado');
    }

    // ===== FUNCIONES EXISTENTES (sin cambios) =====

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

        if (typeof DataManager === 'undefined') {
            console.error('❌ DataManager no está disponible');
            return;
        }

        if (typeof DataManager.actualizarPcEstudiante !== 'function') {
            console.error('❌ DataManager.actualizarPcEstudiante no es una función');
            return;
        }

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
        inicializar();
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

    // NUEVAS funciones expuestas
    window.validarConfiguracionPuestos = validarConfiguracion;

    const api = {
        cargarDocentesParaPuesto,
        agregarPuestoDocente,
        guardarPuestoDocente,
        eliminarPuestoDocente,
        cargarEstudiantesParaMesas,
        crearDistribucionMesas,
        abrirConfiguracionMesa,
        editarPC,
        guardarConfiguracionPC,
        // NUEVAS funciones en API
        validarConfiguracion,
        obtenerEstadoConfiguracion,
        mostrarIndicadorEstado,
        inicializar
    };

    console.log('✅ PuestosModule v0.8: API creada');
    return api;
})();

if (typeof PuestosModule !== 'undefined') {
    console.log('✅ PuestosModule v0.8 cargado correctamente');
} else {
    console.error('❌ Error cargando PuestosModule');
}

window.PuestosModule = PuestosModule;