// app.js - Archivo principal de la aplicación v0.4
// REESCRITO COMPLETAMENTE - Versión corregida

// ===== VARIABLES GLOBALES =====
let modalResponsable = null;
let modalPuestoDocente = null;
let modalEquipo = null;
let modalConfigurarPC = null;
let modalAsignarSilla = null;

let estudiantesCache = {};
let asistenciasTemp = {};

// ===== INICIALIZACIÓN =====
document.addEventListener('DOMContentLoaded', async function() {
    console.log('🚀 Iniciando aplicación v0.4...');
    
    // Verificar dependencias
    if (typeof DataManager === 'undefined') {
        console.error('❌ DataManager no está definido');
        return;
    }
    
    if (typeof UIManager === 'undefined') {
        console.error('❌ UIManager no está definido');
        return;
    }
    
    if (typeof Swal === 'undefined') {
        console.error('❌ SweetAlert2 no está definido');
        return;
    }
    
    try {
        // Cargar datos guardados
        await DataManager.cargarDeLocalStorage();
        
        // Inicializar la aplicación
        await inicializarAplicacion();
        
    } catch (error) {
        console.error('❌ Error fatal en inicialización:', error);
    }
});

// ===== FUNCIÓN PRINCIPAL DE INICIALIZACIÓN =====
async function inicializarAplicacion() {
    console.log('🔄 Inicializando aplicación...');
    
    try {
        // Configurar fecha actual
        const hoy = new Date().toISOString().split('T')[0];
        const fechaInput = document.getElementById('fecha');
        if (fechaInput) fechaInput.value = hoy;
        
        const fechaAsistencia = document.getElementById('fechaAsistencia');
        if (fechaAsistencia) fechaAsistencia.value = hoy;
        
        // Inicializar selectores UI
        await UIManager.inicializarSelectores();
        
        // Renderizar todas las vistas
        UIManager.renderizarTablaResponsables();
        UIManager.renderizarPuestosDocentes();
        UIManager.renderizarMesas();
        UIManager.renderizarEquipos();
        UIManager.renderizarSillas();
        
        // Inicializar selectores específicos
        await inicializarSelectorCursosPuestos();
        
        // Inicializar modales
        inicializarModales();
        
        // Configurar texto del toggle
        const toggleText = document.getElementById('toggleConfigText');
        if (toggleText) toggleText.textContent = 'Ocultar';
        
        console.log('✅ Aplicación inicializada correctamente');
        
    } catch (error) {
        console.error('❌ Error en inicialización:', error);
    }
}

// ===== INICIALIZACIÓN DE MODALES =====
function inicializarModales() {
    try {
        // Modal de responsable
        const modalResponsableElement = document.getElementById('modalResponsable');
        if (modalResponsableElement) {
            modalResponsable = new bootstrap.Modal(modalResponsableElement);
            console.log('✅ Modal responsable inicializado');
        }
        
        // Modal de puesto docente
        const modalPuestoElement = document.getElementById('modalPuestoDocente');
        if (modalPuestoElement) {
            modalPuestoDocente = new bootstrap.Modal(modalPuestoElement);
            console.log('✅ Modal puesto docente inicializado');
        }
        
        // Modal de equipo
        const modalEquipoElement = document.getElementById('modalEquipo');
        if (modalEquipoElement) {
            modalEquipo = new bootstrap.Modal(modalEquipoElement);
            console.log('✅ Modal equipo inicializado');
        }
        
        // Modal de configuración de PC
        const modalPCElement = document.getElementById('modalConfigurarPC');
        if (modalPCElement) {
            modalConfigurarPC = new bootstrap.Modal(modalPCElement);
            console.log('✅ Modal configuración PC inicializado');
        }
        
        // Modal de asignación de silla
        const modalSillaElement = document.getElementById('modalAsignarSilla');
        if (modalSillaElement) {
            modalAsignarSilla = new bootstrap.Modal(modalSillaElement);
            console.log('✅ Modal asignación silla inicializado');
        }
        
    } catch (error) {
        console.error('Error inicializando modales:', error);
    }
}

// ===== INICIALIZACIÓN DE SELECTOR DE CURSOS PARA PUESTOS =====
async function inicializarSelectorCursosPuestos() {
    try {
        console.log('🔄 Inicializando selector de cursos para puestos...');
        
        const cursoSelect = document.getElementById('cursoPuestoDocente');
        if (!cursoSelect) {
            console.warn('⚠️ Selector cursoPuestoDocente no encontrado');
            return;
        }
        
        const cursos = DataManager.getCursos?.() || [];
        
        // Limpiar y llenar select
        cursoSelect.innerHTML = '<option value="">Seleccione un curso</option>';
        
        cursos.forEach(curso => {
            const option = document.createElement('option');
            option.value = curso.id;
            option.textContent = `${curso.id} - ${curso.nombre}`;
            cursoSelect.appendChild(option);
        });
        
        console.log(`✅ Selector de cursos para puestos inicializado con ${cursos.length} cursos`);
        
    } catch (error) {
        console.error('Error inicializando selector de cursos:', error);
    }
}

// ===== FUNCIONES DE RESPONSABLES =====

// Mostrar formulario de nuevo responsable
function mostrarFormularioResponsable() {
    try {
        console.log('📝 Mostrando formulario de responsable');
        
        if (!modalResponsable) {
            const modalElement = document.getElementById('modalResponsable');
            if (!modalElement) {
                console.error('Modal responsable no encontrado');
                return;
            }
            modalResponsable = new bootstrap.Modal(modalElement);
        }
        
        // Limpiar formulario
        const form = document.getElementById('formResponsable');
        if (form) form.reset();
        
        const idField = document.getElementById('responsableId');
        if (idField) idField.value = '-1';
        
        const hoy = new Date().toISOString().split('T')[0];
        const fechaField = document.getElementById('fecha');
        if (fechaField) fechaField.value = hoy;
        
        modalResponsable.show();
        
    } catch (error) {
        console.error('Error en mostrarFormularioResponsable:', error);
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'No se pudo abrir el formulario'
        });
    }
}

// Editar responsable existente
function editarResponsable(id) {
    try {
        console.log('✏️ Editando responsable ID:', id);
        
        if (!modalResponsable) {
            const modalElement = document.getElementById('modalResponsable');
            if (!modalElement) return;
            modalResponsable = new bootstrap.Modal(modalElement);
        }
        
        const responsables = DataManager.getResponsables() || [];
        const responsable = responsables.find(r => r.id == id);
        
        if (!responsable) {
            console.error('Responsable no encontrado');
            return;
        }
        
        // Llenar campos básicos
        document.getElementById('responsableId').value = responsable.id;
        document.getElementById('cursoResponsable').value = responsable.numeroCurso || '';
        document.getElementById('numeroSalon').value = responsable.numeroSalon || '';
        document.getElementById('fecha').value = responsable.fecha || '';
        document.getElementById('horarioInicio').value = responsable.horarioInicio || responsable.horario || '';
        document.getElementById('horarioFin').value = responsable.horarioFin || '';
        document.getElementById('estadoEquipo').value = responsable.estadoEquipo || 'Excelente';
        document.getElementById('estadoLimpieza').value = responsable.estadoLimpieza || 'Bueno';
        document.getElementById('observaciones').value = responsable.observaciones || '';
        
        // Cargar docentes del curso
        if (typeof UIManager !== 'undefined' && UIManager.cargarDocentesPorCurso) {
            UIManager.cargarDocentesPorCurso();
            
            // Seleccionar el docente correspondiente después de un breve retraso
            setTimeout(() => {
                const docenteSelect = document.getElementById('docenteResponsable');
                if (docenteSelect) {
                    for (let i = 0; i < docenteSelect.options.length; i++) {
                        if (docenteSelect.options[i].value === responsable.documento) {
                            docenteSelect.selectedIndex = i;
                            if (typeof UIManager.cargarDatosDocente === 'function') {
                                UIManager.cargarDatosDocente();
                            }
                            break;
                        }
                    }
                }
            }, 100);
        }
        
        modalResponsable.show();
        
    } catch (error) {
        console.error('Error editando responsable:', error);
    }
}

// Guardar responsable
function guardarResponsable() {
    try {
        const responsableId = document.getElementById('responsableId')?.value;
        const curso = document.getElementById('cursoResponsable')?.value;
        const docenteSelect = document.getElementById('docenteResponsable');
        
        if (!docenteSelect || docenteSelect.selectedIndex <= 0) {
            Swal.fire({
                icon: 'warning',
                title: 'Campos requeridos',
                text: 'Debe seleccionar un curso y un docente'
            });
            return;
        }
        
        const selectedOption = docenteSelect.options[docenteSelect.selectedIndex];
        
        const responsableData = {
            numeroCurso: curso,
            nombre: selectedOption.getAttribute('data-nombre') || '',
            documento: selectedOption.value || '',
            numeroSalon: document.getElementById('numeroSalon')?.value || '',
            fecha: document.getElementById('fecha')?.value || '',
            horarioInicio: document.getElementById('horarioInicio')?.value || '',
            horarioFin: document.getElementById('horarioFin')?.value || '',
            estadoEquipo: document.getElementById('estadoEquipo')?.value || 'Excelente',
            estadoLimpieza: document.getElementById('estadoLimpieza')?.value || 'Bueno',
            observaciones: document.getElementById('observaciones')?.value || ''
        };
        
        // Validaciones
        if (!responsableData.numeroSalon || !responsableData.fecha || !responsableData.horarioInicio || !responsableData.horarioFin) {
            Swal.fire({
                icon: 'warning',
                title: 'Campos requeridos',
                text: 'Complete todos los campos obligatorios'
            });
            return;
        }
        
        if (responsableData.horarioFin <= responsableData.horarioInicio) {
            Swal.fire({
                icon: 'warning',
                title: 'Horario inválido',
                text: 'El horario final debe ser posterior al inicio'
            });
            return;
        }
        
        if (responsableId && responsableId !== '-1') {
            // Actualizar existente
            const responsables = DataManager.getResponsables() || [];
            const index = responsables.findIndex(r => r.id == responsableId);
            if (index !== -1) {
                DataManager.actualizarResponsable(index, responsableData);
                Swal.fire({
                    icon: 'success',
                    title: 'Éxito',
                    text: 'Responsable actualizado',
                    timer: 1500,
                    showConfirmButton: false
                });
            }
        } else {
            // Nuevo responsable
            DataManager.guardarResponsable(responsableData);
            Swal.fire({
                icon: 'success',
                title: 'Éxito',
                text: 'Responsable guardado',
                timer: 1500,
                showConfirmButton: false
            });
        }
        
        // Actualizar tabla
        if (typeof UIManager !== 'undefined' && UIManager.renderizarTablaResponsables) {
            UIManager.renderizarTablaResponsables();
        }
        
        if (modalResponsable) modalResponsable.hide();
        
    } catch (error) {
        console.error('Error guardando responsable:', error);
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'No se pudo guardar el responsable'
        });
    }
}

// Eliminar responsable
function eliminarResponsable(id) {
    Swal.fire({
        title: '¿Está seguro?',
        text: 'Esta acción no se puede deshacer',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Sí, eliminar',
        cancelButtonText: 'Cancelar'
    }).then((result) => {
        if (result.isConfirmed) {
            try {
                DataManager.eliminarResponsable(id);
                if (typeof UIManager !== 'undefined' && UIManager.renderizarTablaResponsables) {
                    UIManager.renderizarTablaResponsables();
                }
                Swal.fire({
                    icon: 'success',
                    title: 'Eliminado',
                    text: 'Responsable eliminado',
                    timer: 1500,
                    showConfirmButton: false
                });
            } catch (error) {
                console.error('Error eliminando responsable:', error);
            }
        }
    });
}

// ===== FUNCIONES DE PUESTOS DOCENTES =====

// IMPLEMENTACIÓN DIRECTA EN APP.JS (sin depender de UIManager)
async function cargarDocentesParaPuesto() {
    console.log('🔄 Cargando docentes para puesto (implementación directa)');
    
    try {
        const cursoSelect = document.getElementById('cursoPuestoDocente');
        const docenteSelect = document.getElementById('selectDocente');
        
        if (!cursoSelect || !docenteSelect) {
            console.warn('Selectores no encontrados');
            return;
        }
        
        const cursoId = cursoSelect.value;
        
        // Limpiar select de docentes
        docenteSelect.innerHTML = '<option value="">Seleccione un docente</option>';
        
        const documentoField = document.getElementById('documentoDocente');
        if (documentoField) documentoField.value = '';
        
        if (!cursoId) {
            return;
        }
        
        // Cargar responsables desde DataManager
        const responsables = await DataManager.cargarResponsables() || [];
        const docentesFiltrados = responsables.filter(r => r.numero_curso === cursoId);
        
        console.log(`📚 Docentes encontrados para curso ${cursoId}:`, docentesFiltrados.length);
        
        if (docentesFiltrados.length === 0) {
            docenteSelect.innerHTML = '<option value="">No hay docentes para este curso</option>';
            return;
        }
        
        docentesFiltrados.forEach(docente => {
            const option = document.createElement('option');
            option.value = docente.documento || '';
            option.setAttribute('data-nombre', docente.nombre || '');
            option.setAttribute('data-documento', docente.documento || '');
            option.setAttribute('data-materia', docente.materia || '');
            option.textContent = `${docente.nombre} (${docente.documento})`;
            docenteSelect.appendChild(option);
        });
        
        console.log('✅ Select de docentes actualizado');
        
    } catch (error) {
        console.error('Error cargando docentes para puesto:', error);
    }
}

function cargarDatosDocentePuesto() {
    console.log('🔄 Cargando datos del docente seleccionado');
    
    try {
        const docenteSelect = document.getElementById('selectDocente');
        if (!docenteSelect) return;
        
        const selectedIndex = docenteSelect.selectedIndex;
        
        if (selectedIndex <= 0) {
            const documentoField = document.getElementById('documentoDocente');
            if (documentoField) documentoField.value = '';
            return;
        }
        
        const selectedOption = docenteSelect.options[selectedIndex];
        const documento = selectedOption.getAttribute('data-documento') || '';
        
        const documentoField = document.getElementById('documentoDocente');
        if (documentoField) documentoField.value = documento;
        
    } catch (error) {
        console.error('Error cargando datos del docente:', error);
    }
}

function agregarPuestoDocente() {
    try {
        console.log('🔄 Abriendo modal de puesto docente...');
        
        const cursoSelect = document.getElementById('cursoPuestoDocente');
        
        if (!cursoSelect || !cursoSelect.value) {
            Swal.fire({
                icon: 'warning',
                title: 'Curso requerido',
                text: 'Primero debe seleccionar un curso'
            });
            return;
        }
        
        // Limpiar formulario
        const form = document.getElementById('formPuestoDocente');
        if (form) form.reset();
        
        const documentoField = document.getElementById('documentoDocente');
        if (documentoField) documentoField.value = '';
        
        // Mostrar información del curso en el modal
        const cursoInfo = document.getElementById('infoCursoPuesto');
        const cursoSpan = document.getElementById('cursoPuestoSeleccionado');
        
        if (cursoInfo && cursoSpan) {
            const selectedOption = cursoSelect.options[cursoSelect.selectedIndex];
            cursoSpan.textContent = selectedOption.textContent;
            cursoInfo.style.display = 'block';
        }
        
        // Cargar docentes
        cargarDocentesParaPuesto();
        
        if (modalPuestoDocente) {
            modalPuestoDocente.show();
        }
        
    } catch (error) {
        console.error('Error abriendo modal:', error);
    }
}

function guardarPuestoDocente() {
    try {
        const selectDocente = document.getElementById('selectDocente');
        
        if (!selectDocente || selectDocente.selectedIndex <= 0) {
            Swal.fire({
                icon: 'warning',
                title: 'Campo requerido',
                text: 'Seleccione un docente'
            });
            return;
        }
        
        const selectedOption = selectDocente.options[selectDocente.selectedIndex];
        const nombre = selectedOption.getAttribute('data-nombre') || '';
        const documento = selectedOption.getAttribute('data-documento') || '';
        
        const serialPC = document.getElementById('serialPC')?.value;
        if (!serialPC) {
            Swal.fire({
                icon: 'warning',
                title: 'Campo requerido',
                text: 'Ingrese el serial del PC'
            });
            return;
        }
        
        const puestoData = {
            nombre: nombre,
            documento: documento,
            serial: serialPC,
            estado: document.getElementById('estadoPC')?.value || 'Excelente',
            mouse: document.getElementById('mousePC')?.value || 'Bueno',
            teclado: document.getElementById('tecladoPC')?.value || 'Bueno',
            pantalla: document.getElementById('pantallaPC')?.value || 'Bueno',
            internet: document.getElementById('internet')?.value || 'Funciona',
            estadoLimpieza: document.getElementById('estadoLimpiezaPC')?.value || 'Bueno',
            observaciones: document.getElementById('observacionesPC')?.value || '',
            curso: document.getElementById('cursoPuestoDocente')?.value || ''
        };
        
        DataManager.agregarPuestoDocente(puestoData);
        
        if (typeof UIManager !== 'undefined' && UIManager.renderizarPuestosDocentes) {
            UIManager.renderizarPuestosDocentes();
        }
        
        if (modalPuestoDocente) {
            modalPuestoDocente.hide();
        }
        
        Swal.fire({
            icon: 'success',
            title: 'Éxito',
            text: 'Puesto docente guardado',
            timer: 1500,
            showConfirmButton: false
        });
        
    } catch (error) {
        console.error('Error guardando puesto docente:', error);
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'No se pudo guardar el puesto docente'
        });
    }
}

function eliminarPuestoDocente(index) {
    Swal.fire({
        title: '¿Está seguro?',
        text: 'Esta acción no se puede deshacer',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Sí, eliminar'
    }).then((result) => {
        if (result.isConfirmed) {
            DataManager.eliminarPuestoDocente(index);
            if (typeof UIManager !== 'undefined' && UIManager.renderizarPuestosDocentes) {
                UIManager.renderizarPuestosDocentes();
            }
            Swal.fire({
                icon: 'success',
                title: 'Eliminado',
                text: 'Puesto eliminado',
                timer: 1500,
                showConfirmButton: false
            });
        }
    });
}

// ===== FUNCIONES DE MESAS =====

function crearDistribucionMesas() {
    try {
        const filas = parseInt(document.getElementById('filas')?.value) || 3;
        const columnas = parseInt(document.getElementById('columnas')?.value) || 2;
        const pcsPorMesa = parseInt(document.getElementById('pcsPorMesa')?.value) || 2;
        const curso = sessionStorage.getItem('cursoMesasSeleccionado');
        
        if (!curso) {
            Swal.fire({
                icon: 'warning',
                title: 'Curso requerido',
                text: 'Primero seleccione un curso'
            });
            return;
        }
        
        if (filas > 10) {
            Swal.fire({ icon: 'warning', title: 'Límite', text: 'Máximo 10 filas' });
            return;
        }
        if (columnas > 6) {
            Swal.fire({ icon: 'warning', title: 'Límite', text: 'Máximo 6 columnas' });
            document.getElementById('columnas').value = 6;
            return;
        }
        if (pcsPorMesa > 6) {
            Swal.fire({ icon: 'warning', title: 'Límite', text: 'Máximo 6 PCs por mesa' });
            return;
        }
        
        DataManager.configurarMesas(filas, columnas, pcsPorMesa, curso);
        
        if (typeof UIManager !== 'undefined' && UIManager.renderizarMesas) {
            UIManager.renderizarMesas();
        }
        
        Swal.fire({
            icon: 'success',
            title: 'Éxito',
            text: 'Mesas creadas correctamente',
            timer: 1500,
            showConfirmButton: false
        });
        
    } catch (error) {
        console.error('Error creando distribución:', error);
    }
}

function abrirConfiguracionMesa(mesaId) {
    try {
        const mesa = DataManager.getMesa(mesaId);
        if (!mesa) return;
        
        let pcGridHtml = '<div style="max-height: 60vh; overflow-y: auto; padding: 10px;">';
        
        mesa.pcs.forEach((pc, index) => {
            const estadoClass = UIManager?.getBadgeClass ? UIManager.getBadgeClass(pc.estado) : 'bg-secondary';
            const asignadoClass = pc.estudiante ? 'bg-success' : 'bg-secondary';
            
            pcGridHtml += `
                <div class="card mb-3">
                    <div class="card-header d-flex justify-content-between align-items-center">
                        <span><strong>PC ${index + 1}</strong> - ${pc.serial || 'Sin serial'}</span>
                        <span class="badge ${estadoClass}">${pc.estado || 'N/A'}</span>
                    </div>
                    <div class="card-body">
                        <div class="mb-2">
                            <span class="badge ${asignadoClass}">
                                <i class="fas fa-user"></i> ${pc.estudiante || 'No asignado'}
                            </span>
                        </div>
                        <button class="btn btn-sm btn-primary mt-2 w-100" onclick="editarPC('${mesa.id}', ${index})">
                            <i class="fas fa-edit"></i> Configurar
                        </button>
                    </div>
                </div>
            `;
        });
        
        pcGridHtml += '</div>';
        
        Swal.fire({
            title: `Mesa ${mesa.fila + 1}-${mesa.columna + 1} - Curso ${mesa.curso}`,
            html: pcGridHtml,
            width: '900px',
            showConfirmButton: false,
            showCloseButton: true
        });
        
    } catch (error) {
        console.error('Error abriendo configuración:', error);
    }
}

async function editarPC(mesaId, pcIndex) {
    try {
        if (Swal.isVisible()) Swal.close();
        
        const modalElement = document.getElementById('modalConfigurarPC');
        if (!modalElement) return;
        
        if (!modalConfigurarPC) modalConfigurarPC = new bootstrap.Modal(modalElement);
        
        const mesa = DataManager.getMesa(mesaId);
        if (!mesa || !mesa.pcs || !mesa.pcs[pcIndex]) return;
        
        const pc = mesa.pcs[pcIndex];
        const curso = mesa.curso;
        
        // Cargar estudiantes del curso
        const estudiantes = await DataManager.getEstudiantesPorCurso(curso) || [];
        const pcsAsignados = DataManager.getPCsAsignados ? DataManager.getPCsAsignados(curso) : [];
        
        const estudiantesDisponibles = estudiantes.filter(e => 
            !pcsAsignados.includes(e.documento) || e.documento === pc.documento
        );
        
        // Llenar select de estudiantes
        const selectEstudiante = document.getElementById('selectEstudiantePC');
        if (selectEstudiante) {
            selectEstudiante.innerHTML = '<option value="">Seleccione un estudiante</option>';
            
            estudiantesDisponibles.forEach(est => {
                const option = document.createElement('option');
                option.value = est.documento;
                option.setAttribute('data-nombres', est.nombres);
                option.setAttribute('data-apellidos', est.apellidos);
                option.textContent = `${est.documento} - ${est.nombres} ${est.apellidos}`;
                selectEstudiante.appendChild(option);
            });
            
            if (pc.documento) {
                for (let i = 0; i < selectEstudiante.options.length; i++) {
                    if (selectEstudiante.options[i].value === pc.documento) {
                        selectEstudiante.selectedIndex = i;
                        cargarDatosEstudiantePC();
                        break;
                    }
                }
            }
        }
        
        // Llenar campos del formulario
        document.getElementById('mesaId').value = mesaId;
        document.getElementById('pcIndex').value = pcIndex;
        document.getElementById('mesaInfo').textContent = `Mesa: ${mesa.fila + 1}-${mesa.columna + 1}`;
        document.getElementById('pcInfo').textContent = `PC ${pcIndex + 1} - Serial: ${pc.serial || 'N/A'}`;
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
        
        document.getElementById('cursoActual').textContent = curso;
        document.getElementById('cursoMesa').value = curso;
        document.getElementById('cursoInfo').style.display = 'block';
        
        modalConfigurarPC.show();
        
    } catch (error) {
        console.error('Error editando PC:', error);
    }
}

function cargarDatosEstudiantePC() {
    try {
        const select = document.getElementById('selectEstudiantePC');
        if (!select) return;
        
        const selectedIndex = select.selectedIndex;
        if (selectedIndex <= 0) {
            document.getElementById('pcEstudiante').value = '';
            document.getElementById('pcDocumento').value = '';
            return;
        }
        
        const selectedOption = select.options[selectedIndex];
        const nombres = selectedOption.getAttribute('data-nombres');
        const apellidos = selectedOption.getAttribute('data-apellidos');
        const nombreCompleto = `${nombres} ${apellidos}`;
        
        document.getElementById('pcEstudiante').value = nombreCompleto;
        document.getElementById('pcDocumento').value = selectedOption.value;
        
    } catch (error) {
        console.error('Error cargando datos del estudiante:', error);
    }
}

function guardarConfiguracionPC() {
    try {
        const mesaId = document.getElementById('mesaId')?.value;
        const pcIndex = document.getElementById('pcIndex')?.value;
        
        if (!mesaId || !pcIndex) {
            Swal.fire({ icon: 'error', title: 'Error', text: 'Datos de PC inválidos' });
            return;
        }
        
        const pcIndexNum = parseInt(pcIndex);
        const serial = document.getElementById('pcSerial')?.value;
        
        if (!serial) {
            Swal.fire({ icon: 'warning', title: 'Campo requerido', text: 'Ingrese el serial del PC' });
            return;
        }
        
        const pcData = {
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
        
        const resultado = DataManager.actualizarPcEstudiante(mesaId, pcIndexNum, pcData);
        
        if (!resultado) {
            Swal.fire({
                icon: 'warning',
                title: 'Estudiante ya asignado',
                text: 'Este estudiante ya tiene un PC asignado en este curso'
            });
            return;
        }
        
        if (typeof UIManager !== 'undefined' && UIManager.renderizarMesas) {
            UIManager.renderizarMesas();
        }
        
        if (modalConfigurarPC) modalConfigurarPC.hide();
        
        Swal.fire({
            icon: 'success',
            title: 'Éxito',
            text: 'PC configurado correctamente',
            timer: 1500,
            showConfirmButton: false
        });
        
    } catch (error) {
        console.error('Error guardando configuración:', error);
        Swal.fire({ icon: 'error', title: 'Error', text: 'No se pudo guardar' });
    }
}

// ===== FUNCIONES DE EQUIPOS =====

function agregarEquipo() {
    try {
        document.getElementById('formEquipo')?.reset();
        document.getElementById('equipoIndex').value = '-1';
        if (modalEquipo) modalEquipo.show();
    } catch (error) {
        console.error('Error agregando equipo:', error);
    }
}

function editarEquipo(index) {
    try {
        const equipos = DataManager.getEquipos() || [];
        const equipo = equipos[index];
        if (!equipo) return;
        
        document.getElementById('equipoIndex').value = index;
        document.getElementById('equipoTipo').value = equipo.tipo || '';
        document.getElementById('equipoEstado').value = equipo.estado || 'Excelente';
        document.getElementById('equipoLimpieza').value = equipo.estadoLimpieza || 'Bueno';
        document.getElementById('equipoObservaciones').value = equipo.observaciones || '';
        
        if (modalEquipo) modalEquipo.show();
        
    } catch (error) {
        console.error('Error editando equipo:', error);
    }
}

function guardarEquipo() {
    try {
        const tipo = document.getElementById('equipoTipo')?.value;
        const estado = document.getElementById('equipoEstado')?.value;
        const estadoLimpieza = document.getElementById('equipoLimpieza')?.value;
        const observaciones = document.getElementById('equipoObservaciones')?.value;
        const index = parseInt(document.getElementById('equipoIndex')?.value || '-1');
        
        if (!tipo) {
            Swal.fire({ icon: 'warning', title: 'Campo requerido', text: 'Seleccione un tipo de equipo' });
            return;
        }
        
        const equipoData = { tipo, estado, estadoLimpieza, observaciones };
        
        if (index >= 0) {
            DataManager.actualizarEquipo(index, equipoData);
            Swal.fire({ icon: 'success', title: 'Éxito', text: 'Equipo actualizado', timer: 1500 });
        } else {
            DataManager.agregarEquipo(equipoData);
            Swal.fire({ icon: 'success', title: 'Éxito', text: 'Equipo agregado', timer: 1500 });
        }
        
        if (typeof UIManager !== 'undefined' && UIManager.renderizarEquipos) {
            UIManager.renderizarEquipos();
        }
        
        if (modalEquipo) modalEquipo.hide();
        
    } catch (error) {
        console.error('Error guardando equipo:', error);
    }
}

function eliminarEquipo(index) {
    Swal.fire({
        title: '¿Está seguro?',
        text: 'Esta acción no se puede deshacer',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        confirmButtonText: 'Sí, eliminar'
    }).then((result) => {
        if (result.isConfirmed) {
            DataManager.eliminarEquipo(index);
            if (typeof UIManager !== 'undefined' && UIManager.renderizarEquipos) {
                UIManager.renderizarEquipos();
            }
            Swal.fire({ icon: 'success', title: 'Eliminado', text: 'Equipo eliminado', timer: 1500 });
        }
    });
}

// ===== FUNCIONES DE SILLAS =====

async function abrirModalSilla(sillaId) {
    try {
        const sillas = DataManager.getSillas() || [];
        const silla = sillas.find(s => s.id === sillaId);
        const index = sillas.findIndex(s => s.id === sillaId);
        
        if (!silla) return;
        
        if (!modalAsignarSilla) {
            const modalElement = document.getElementById('modalAsignarSilla');
            if (modalElement) modalAsignarSilla = new bootstrap.Modal(modalElement);
            else return;
        }
        
        // Cargar estudiantes del curso
        const estudiantes = await DataManager.getEstudiantesPorCurso(silla.curso) || [];
        const estudiantesSinSilla = DataManager.getEstudiantesSinSilla ? 
            DataManager.getEstudiantesSinSilla(estudiantes, silla.curso) : estudiantes;
        
        const select = document.getElementById('selectEstudianteSilla');
        if (select) {
            select.innerHTML = '<option value="">Seleccione un estudiante</option>';
            
            estudiantesSinSilla.forEach(est => {
                const option = document.createElement('option');
                option.value = est.documento;
                option.setAttribute('data-nombres', est.nombres);
                option.setAttribute('data-apellidos', est.apellidos);
                option.textContent = `${est.documento} - ${est.nombres} ${est.apellidos}`;
                select.appendChild(option);
            });
            
            if (silla.documento) {
                for (let i = 0; i < select.options.length; i++) {
                    if (select.options[i].value === silla.documento) {
                        select.selectedIndex = i;
                        cargarDatosEstudianteSilla();
                        break;
                    }
                }
            }
        }
        
        document.getElementById('sillaIndex').value = index;
        document.getElementById('sillaId').value = silla.id;
        document.getElementById('sillaSerial').value = silla.serial || '';
        document.getElementById('sillaNumero').value = silla.numero || '';
        document.getElementById('sillaEstado').value = silla.estado || 'Bueno';
        document.getElementById('sillaObservaciones').value = silla.observaciones || '';
        document.getElementById('sillaEstudianteNombre').value = silla.nombreEstudiante || '';
        document.getElementById('sillaEstudianteDocumento').value = silla.documento || '';
        
        modalAsignarSilla.show();
        
    } catch (error) {
        console.error('Error abriendo modal de silla:', error);
    }
}

function cargarDatosEstudianteSilla() {
    try {
        const select = document.getElementById('selectEstudianteSilla');
        if (!select) return;
        
        const selectedIndex = select.selectedIndex;
        if (selectedIndex <= 0) {
            document.getElementById('sillaEstudianteNombre').value = '';
            document.getElementById('sillaEstudianteDocumento').value = '';
            return;
        }
        
        const selectedOption = select.options[selectedIndex];
        const nombres = selectedOption.getAttribute('data-nombres');
        const apellidos = selectedOption.getAttribute('data-apellidos');
        const nombreCompleto = `${nombres} ${apellidos}`;
        
        document.getElementById('sillaEstudianteNombre').value = nombreCompleto;
        document.getElementById('sillaEstudianteDocumento').value = selectedOption.value;
        
    } catch (error) {
        console.error('Error cargando datos del estudiante:', error);
    }
}

function guardarAsignacionSilla() {
    try {
        const index = parseInt(document.getElementById('sillaIndex')?.value);
        const documento = document.getElementById('sillaEstudianteDocumento')?.value;
        const nombreEstudiante = document.getElementById('sillaEstudianteNombre')?.value;
        const estado = document.getElementById('sillaEstado')?.value;
        const observaciones = document.getElementById('sillaObservaciones')?.value;
        
        if (isNaN(index)) {
            Swal.fire({ icon: 'error', title: 'Error', text: 'Índice de silla inválido' });
            return;
        }
        
        DataManager.actualizarSilla(index, { estado, observaciones });
        
        if (documento && nombreEstudiante) {
            const asignado = DataManager.asignarSilla ? 
                DataManager.asignarSilla(index, documento, nombreEstudiante) : false;
            
            if (!asignado) {
                Swal.fire({
                    icon: 'warning',
                    title: 'Estudiante ya asignado',
                    text: 'Este estudiante ya tiene una silla asignada'
                });
                return;
            }
        }
        
        if (typeof UIManager !== 'undefined' && UIManager.renderizarSillas) {
            UIManager.renderizarSillas();
        }
        
        if (modalAsignarSilla) modalAsignarSilla.hide();
        
        Swal.fire({
            icon: 'success',
            title: 'Éxito',
            text: 'Silla actualizada correctamente',
            timer: 1500
        });
        
    } catch (error) {
        console.error('Error guardando asignación:', error);
        Swal.fire({ icon: 'error', title: 'Error', text: 'No se pudo guardar' });
    }
}

function desasignarSilla() {
    try {
        const index = parseInt(document.getElementById('sillaIndex')?.value);
        
        if (isNaN(index)) {
            Swal.fire({ icon: 'error', title: 'Error', text: 'Índice de silla inválido' });
            return;
        }
        
        Swal.fire({
            title: '¿Desasignar silla?',
            text: 'El estudiante quedará sin silla asignada',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            confirmButtonText: 'Sí, desasignar'
        }).then((result) => {
            if (result.isConfirmed) {
                if (DataManager.desasignarSilla) {
                    DataManager.desasignarSilla(index);
                }
                
                if (typeof UIManager !== 'undefined' && UIManager.renderizarSillas) {
                    UIManager.renderizarSillas();
                }
                
                if (modalAsignarSilla) modalAsignarSilla.hide();
                
                Swal.fire({
                    icon: 'success',
                    title: 'Desasignado',
                    text: 'Silla desasignada correctamente',
                    timer: 1500
                });
            }
        });
        
    } catch (error) {
        console.error('Error desasignando silla:', error);
    }
}

function crearSillas() {
    try {
        const numeroSillas = parseInt(document.getElementById('numeroSillas')?.value);
        const curso = document.getElementById('cursoSillas')?.value;
        
        if (!numeroSillas || numeroSillas < 1) {
            Swal.fire({
                icon: 'warning',
                title: 'Campo requerido',
                text: 'Ingrese un número válido de sillas'
            });
            return;
        }
        
        if (!curso) {
            Swal.fire({
                icon: 'warning',
                title: 'Campo requerido',
                text: 'Seleccione un curso'
            });
            return;
        }
        
        if (numeroSillas > 50) {
            Swal.fire({
                icon: 'warning',
                title: 'Límite excedido',
                text: 'Máximo 50 sillas por curso'
            });
            return;
        }
        
        if (DataManager.configurarSillas) {
            DataManager.configurarSillas(numeroSillas, curso);
        }
        
        if (typeof UIManager !== 'undefined' && UIManager.renderizarSillas) {
            UIManager.renderizarSillas();
        }
        
        Swal.fire({
            icon: 'success',
            title: 'Éxito',
            text: `${numeroSillas} sillas creadas`,
            timer: 1500
        });
        
    } catch (error) {
        console.error('Error creando sillas:', error);
        Swal.fire({ icon: 'error', title: 'Error', text: 'No se pudieron crear las sillas' });
    }
}

function asignarSillasAutomaticamente() {
    Swal.fire({
        icon: 'info',
        title: 'Funcionalidad',
        text: 'Asignación automática en desarrollo',
        timer: 2000
    });
}

// ===== FUNCIONES DE ASISTENCIA =====

async function filtrarAsistencia() {
    try {
        const curso = document.getElementById('cursoAsistencia')?.value;
        const fecha = document.getElementById('fechaAsistencia')?.value;
        
        if (!curso || !fecha) {
            Swal.fire({
                icon: 'warning',
                title: 'Campos requeridos',
                text: 'Seleccione un curso y una fecha'
            });
            return;
        }
        
        if (typeof UIManager !== 'undefined' && UIManager.renderizarTablaAsistencia) {
            await UIManager.renderizarTablaAsistencia(curso, fecha);
        }
        
    } catch (error) {
        console.error('Error filtrando asistencia:', error);
    }
}

function marcarAsistencia(documento, asistio) {
    try {
        if (!asistenciasTemp[documento]) {
            asistenciasTemp[documento] = {};
        }
        asistenciasTemp[documento].asistio = asistio;
        
        const label = document.querySelector(`label[for="asistencia_${documento}"]`);
        if (label) {
            label.textContent = asistio ? 'Presente' : 'Ausente';
        }
        
    } catch (error) {
        console.error('Error marcando asistencia:', error);
    }
}

function actualizarObservacionAsistencia(documento, observacion) {
    try {
        if (!asistenciasTemp[documento]) {
            asistenciasTemp[documento] = {};
        }
        asistenciasTemp[documento].observaciones = observacion;
        
    } catch (error) {
        console.error('Error actualizando observación:', error);
    }
}

async function guardarAsistencia() {
    try {
        const curso = document.getElementById('cursoAsistencia')?.value;
        const fecha = document.getElementById('fechaAsistencia')?.value;
        
        if (!curso || !fecha) {
            Swal.fire({
                icon: 'warning',
                title: 'Campos requeridos',
                text: 'Seleccione un curso y una fecha'
            });
            return;
        }
        
        const estudiantes = await DataManager.getEstudiantesPorCurso(curso) || [];
        
        const registros = estudiantes.map(est => ({
            documento: est.documento,
            nombre: `${est.nombres} ${est.apellidos}`,
            asistio: asistenciasTemp[est.documento]?.asistio || false,
            observaciones: asistenciasTemp[est.documento]?.observaciones || ''
        }));
        
        if (DataManager.guardarAsistencia) {
            DataManager.guardarAsistencia(curso, fecha, registros);
        }
        
        asistenciasTemp = {};
        
        Swal.fire({
            icon: 'success',
            title: 'Éxito',
            text: 'Asistencia guardada',
            timer: 1500
        });
        
    } catch (error) {
        console.error('Error guardando asistencia:', error);
        Swal.fire({ icon: 'error', title: 'Error', text: 'No se pudo guardar' });
    }
}

// ===== FUNCIONES DE EXPORTACIÓN/IMPORTACIÓN =====

function exportarDatos() {
    try {
        const datos = DataManager.exportarDatos ? DataManager.exportarDatos() : null;
        
        if (!datos) {
            Swal.fire({ icon: 'error', title: 'Error', text: 'No se pudieron exportar los datos' });
            return;
        }
        
        const datosJSON = JSON.stringify(datos, null, 2);
        const blob = new Blob([datosJSON], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `gestion-salones-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        Swal.fire({
            icon: 'success',
            title: 'Datos exportados',
            text: 'Archivo JSON descargado',
            timer: 1500
        });
        
    } catch (error) {
        console.error('Error exportando datos:', error);
        Swal.fire({ icon: 'error', title: 'Error', text: 'No se pudo exportar' });
    }
}

function importarDatos(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    if (!file.name.endsWith('.json')) {
        Swal.fire({
            icon: 'error',
            title: 'Archivo inválido',
            text: 'Seleccione un archivo JSON'
        });
        event.target.value = '';
        return;
    }
    
    const reader = new FileReader();
    
    reader.onload = function(e) {
        try {
            const datos = JSON.parse(e.target.result);
            
            Swal.fire({
                title: '¿Importar datos?',
                text: 'Esta acción reemplazará todos los datos actuales',
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#d33',
                confirmButtonText: 'Sí, importar',
                cancelButtonText: 'Cancelar'
            }).then((result) => {
                if (result.isConfirmed) {
                    const importado = DataManager.importarDatos ? DataManager.importarDatos(datos) : false;
                    
                    if (importado) {
                        location.reload();
                    } else {
                        throw new Error('Error al importar');
                    }
                }
            });
            
        } catch (error) {
            console.error('Error importando:', error);
            Swal.fire({ icon: 'error', title: 'Error', text: 'Archivo inválido' });
        }
        
        event.target.value = '';
    };
    
    reader.readAsText(file);
}

function limpiarTodosLosDatos() {
    Swal.fire({
        title: '¿Limpiar todos los datos?',
        text: 'Esta acción eliminará TODOS los registros',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        confirmButtonText: 'Sí, limpiar todo',
        cancelButtonText: 'Cancelar'
    }).then((result) => {
        if (result.isConfirmed) {
            try {
                if (DataManager.limpiarTodosLosDatos) {
                    DataManager.limpiarTodosLosDatos();
                }
                location.reload();
            } catch (error) {
                console.error('Error limpiando datos:', error);
                Swal.fire({ icon: 'error', title: 'Error', text: 'No se pudieron eliminar los datos' });
            }
        }
    });
}

function generarReporteCompleto() {
    if (typeof Reportes !== 'undefined' && Reportes.generarReporteCompleto) {
        Reportes.generarReporteCompleto();
    } else {
        Swal.fire({
            icon: 'info',
            title: 'Reportes',
            text: 'Módulo de reportes no disponible'
        });
    }
}

// ===== EXPONER FUNCIONES GLOBALMENTE =====
window.mostrarFormularioResponsable = mostrarFormularioResponsable;
window.editarResponsable = editarResponsable;
window.guardarResponsable = guardarResponsable;
window.eliminarResponsable = eliminarResponsable;

window.agregarPuestoDocente = agregarPuestoDocente;
window.guardarPuestoDocente = guardarPuestoDocente;
window.eliminarPuestoDocente = eliminarPuestoDocente;
window.cargarDocentesParaPuesto = cargarDocentesParaPuesto;
window.cargarDatosDocentePuesto = cargarDatosDocentePuesto;

window.crearDistribucionMesas = crearDistribucionMesas;
window.abrirConfiguracionMesa = abrirConfiguracionMesa;
window.editarPC = editarPC;
window.guardarConfiguracionPC = guardarConfiguracionPC;
window.cargarDatosEstudiantePC = cargarDatosEstudiantePC;

window.agregarEquipo = agregarEquipo;
window.editarEquipo = editarEquipo;
window.guardarEquipo = guardarEquipo;
window.eliminarEquipo = eliminarEquipo;

window.crearSillas = crearSillas;
window.abrirModalSilla = abrirModalSilla;
window.cargarDatosEstudianteSilla = cargarDatosEstudianteSilla;
window.guardarAsignacionSilla = guardarAsignacionSilla;
window.desasignarSilla = desasignarSilla;
window.asignarSillasAutomaticamente = asignarSillasAutomaticamente;

window.filtrarAsistencia = filtrarAsistencia;
window.marcarAsistencia = marcarAsistencia;
window.actualizarObservacionAsistencia = actualizarObservacionAsistencia;
window.guardarAsistencia = guardarAsistencia;

window.exportarDatos = exportarDatos;
window.importarDatos = importarDatos;
window.limpiarTodosLosDatos = limpiarTodosLosDatos;
window.generarReporteCompleto = generarReporteCompleto;

console.log('✅ App v0.4 cargada correctamente');