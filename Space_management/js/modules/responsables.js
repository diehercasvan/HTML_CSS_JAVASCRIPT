// responsables.js - Módulo de gestión de responsables
// VERSIÓN 0.7 - CON LISTA DE SALONES DESDE JSON

console.log('🔄 Iniciando carga de responsables.js v0.7...');

// Verificar dependencias
if (typeof DataManager === 'undefined') {
    console.error('❌ responsables.js: DataManager NO DISPONIBLE');
} else {
    console.log('✅ responsables.js: DataManager disponible');
}

const ResponsablesModule = (function () {
    console.log('📦 Ejecutando IIFE de ResponsablesModule...');

    // Variable local para almacenar responsables y salones cargados
    let responsables = [];
    let salones = [];

    /**
     * Carga los salones desde DataManager
     */
    async function cargarSalones() {
        console.log('🏢 Cargando salones en módulo...');
        try {
            if (DataManager.getSalones) {
                salones = DataManager.getSalones() || [];
            }

            if (salones.length === 0 && DataManager.cargarSalones) {
                salones = await DataManager.cargarSalones() || [];
            }

            console.log(`✅ ${salones.length} salones cargados en módulo`);
            return salones;
        } catch (error) {
            console.error('❌ Error cargando salones:', error);
            salones = [];
            return [];
        }
    }

    /**
     * Carga los responsables desde DataManager
     */
    async function cargarResponsables() {
        console.log('🔄 Cargando responsables en módulo...');
        try {
            const data = await DataManager.cargarResponsables?.() || [];

            responsables = data.map(r => ({
                numeroCurso: r.numeroCurso || r._numerocurso || r.numero_curso || '',
                nombre: r.nombre || '',
                documento: r.documento || '',
                horarioInicio: r.horarioInicio || r.horario_inicio || '',
                horarioFin: r.horarioFin || r.horario_fin || '',
                materia: r.materia || '',
                email: r.email || '',
                telefono: r.telefono || ''
            }));

            console.log(`✅ ${responsables.length} responsables cargados en módulo`);
            return responsables;
        } catch (error) {
            console.error('❌ Error cargando responsables:', error);
            responsables = [];
            return [];
        }
    }

    /**
     * Limpia los campos de datos del docente
     */
    function limpiarCamposDocente() {
        console.log('🧹 Limpiando campos de docente...');

        const campos = [
            { id: 'nombreResponsable', nombre: 'Nombre' },
            { id: 'documentoResponsable', nombre: 'Documento' },
            { id: 'horarioInicio', nombre: 'Horario inicio' },
            { id: 'horarioFin', nombre: 'Horario fin' }
        ];

        campos.forEach(campo => {
            const elemento = document.getElementById(campo.id);
            if (elemento) {
                elemento.value = '';
            }
        });
    }

    /**
     * Carga los docentes según el curso seleccionado
     */
    function cargarDocentesPorCurso() {
        console.log('🔄 Cargando docentes por curso...');

        const cursoSelect = document.getElementById('cursoResponsable');
        const docenteSelect = document.getElementById('docenteResponsable');

        if (!cursoSelect || !docenteSelect) return;

        const cursoId = cursoSelect.value;

        docenteSelect.innerHTML = '<option value="">Seleccione un docente</option>';
        limpiarCamposDocente();

        if (!cursoId) return;

        const docentesFiltrados = responsables.filter(r => r.numeroCurso === cursoId);

        if (docentesFiltrados.length === 0) {
            docenteSelect.innerHTML = '<option value="">No hay docentes para este curso</option>';
            return;
        }

        docentesFiltrados.forEach(docente => {
            const option = document.createElement('option');
            option.value = docente.documento || '';
            option.setAttribute('data-nombre', docente.nombre || '');
            option.setAttribute('data-documento', docente.documento || '');
            option.setAttribute('data-horarioInicio', docente.horarioInicio || '');
            option.setAttribute('data-horarioFin', docente.horarioFin || '');
            option.setAttribute('data-materia', docente.materia || '');
            option.textContent = `${docente.nombre} (${docente.documento})${docente.materia ? ' - ' + docente.materia : ''}`;
            docenteSelect.appendChild(option);
        });

        console.log(`✅ ${docentesFiltrados.length} docentes cargados en selector`);
    }

    /**
     * Carga los datos del docente seleccionado
     */
    function cargarDatosDocente() {
        console.log('🔄 Cargando datos del docente seleccionado...');

        const docenteSelect = document.getElementById('docenteResponsable');

        if (!docenteSelect) return;

        const selectedIndex = docenteSelect.selectedIndex;

        if (selectedIndex <= 0) {
            limpiarCamposDocente();
            return;
        }

        const selectedOption = docenteSelect.options[selectedIndex];

        const nombre = selectedOption.getAttribute('data-nombre') || '';
        const documento = selectedOption.getAttribute('data-documento') || '';
        const horarioInicio = selectedOption.getAttribute('data-horarioInicio') || '';
        const horarioFin = selectedOption.getAttribute('data-horarioFin') || '';

        const asignarSiExiste = (id, valor) => {
            const elemento = document.getElementById(id);
            if (elemento) elemento.value = valor;
        };

        asignarSiExiste('nombreResponsable', nombre);
        asignarSiExiste('documentoResponsable', documento);
        asignarSiExiste('horarioInicio', horarioInicio);
        asignarSiExiste('horarioFin', horarioFin);
    }

    /**
     * Carga el selector de salones en el formulario
     */
    async function cargarSelectorSalones() {
        console.log('🏢 Cargando selector de salones...');

        const salonSelect = document.getElementById('numeroSalon');
        if (!salonSelect) {
            console.warn('⚠️ Selector de salón no encontrado');
            return;
        }

        // Guardar el valor actual si existe
        const valorActual = salonSelect.value;

        salonSelect.innerHTML = '<option value="">Seleccione un salón</option>';

        if (salones.length === 0) {
            await cargarSalones();
        }

        if (salones.length === 0) {
            salonSelect.innerHTML = '<option value="">No hay salones disponibles</option>';
            return;
        }

        salones.forEach(salon => {
            const option = document.createElement('option');
            option.value = salon.id;
            option.textContent = salon.nombre;
            salonSelect.appendChild(option);
        });

        // Restaurar el valor si existe
        if (valorActual) {
            for (let i = 0; i < salonSelect.options.length; i++) {
                if (salonSelect.options[i].value === valorActual) {
                    salonSelect.selectedIndex = i;
                    break;
                }
            }
        }

        console.log(`✅ Selector de salones cargado con ${salones.length} opciones`);
    }

    /**
     * Muestra el formulario para nuevo responsable
     */
    async function mostrarFormulario() {
        console.log('📝 Mostrando formulario de responsable');

        const fecha = (typeof Utils !== 'undefined' && Utils.fechaActual) ?
            Utils.fechaActual() :
            new Date().toISOString().split('T')[0];

        // Limpiar formulario
        const form = document.getElementById('formResponsable');
        if (form) form.reset();

        const idField = document.getElementById('responsableId');
        if (idField) idField.value = '-1';

        const fechaField = document.getElementById('fecha');
        if (fechaField) fechaField.value = fecha;

        limpiarCamposDocente();

        const docenteSelect = document.getElementById('docenteResponsable');
        if (docenteSelect) {
            docenteSelect.innerHTML = '<option value="">Seleccione un docente</option>';
        }

        // Cargar salones en el selector
        await cargarSelectorSalones();

        // Mostrar modal
        if (typeof ModalManager !== 'undefined') {
            ModalManager.showModal('responsable');
        }
    }

    /**
     * Edita un responsable existente
     */
    async function editar(id) {
        console.log('✏️ Editando responsable ID:', id);

        const responsablesList = DataManager.getResponsables?.() || [];
        const responsable = responsablesList.find(r => r.id == id);

        if (!responsable) {
            if (typeof Utils !== 'undefined') {
                Utils.showToast('error', 'Responsable no encontrado');
            }
            return;
        }

        // Función auxiliar para asignar valor
        const asignarValor = (id, valor) => {
            const elemento = document.getElementById(id);
            if (elemento) elemento.value = valor || '';
        };

        asignarValor('responsableId', responsable.id);
        asignarValor('cursoResponsable', responsable.numeroCurso || '');

        // Primero cargar los salones y luego asignar el valor
        await cargarSelectorSalones();
        asignarValor('numeroSalon', responsable.numeroSalon || '');

        asignarValor('fecha', responsable.fecha || '');
        asignarValor('horarioInicio', responsable.horarioInicio || '');
        asignarValor('horarioFin', responsable.horarioFin || '');
        asignarValor('estadoEquipo', responsable.estadoEquipo || 'Excelente');
        asignarValor('estadoLimpieza', responsable.estadoLimpieza || 'Bueno');
        asignarValor('observaciones', responsable.observaciones || '');

        // Cargar docentes del curso
        cargarDocentesPorCurso();

        // Seleccionar el docente correspondiente
        setTimeout(() => {
            const docenteSelect = document.getElementById('docenteResponsable');
            if (docenteSelect) {
                for (let i = 0; i < docenteSelect.options.length; i++) {
                    if (docenteSelect.options[i].value === responsable.documento) {
                        docenteSelect.selectedIndex = i;
                        cargarDatosDocente();
                        break;
                    }
                }
            }
        }, 200);

        if (typeof ModalManager !== 'undefined') {
            ModalManager.showModal('responsable');
        }
    }

    /**
     * Guarda un responsable (nuevo o editado)
     */
    async function guardar() {
        console.log('💾 Guardando responsable...');

        const responsableId = document.getElementById('responsableId')?.value;
        const curso = document.getElementById('cursoResponsable')?.value;
        const salon = document.getElementById('numeroSalon')?.value;
        const docenteSelect = document.getElementById('docenteResponsable');

        // Validaciones
        if (!curso) {
            if (typeof Utils !== 'undefined') {
                Utils.showToast('warning', 'Seleccione un curso');
            }
            return;
        }

        if (!salon) {
            if (typeof Utils !== 'undefined') {
                Utils.showToast('warning', 'Seleccione un número de salón');
            }
            return;
        }

        if (!docenteSelect || docenteSelect.selectedIndex <= 0) {
            if (typeof Utils !== 'undefined') {
                Utils.showToast('warning', 'Seleccione un docente');
            }
            return;
        }

        const selectedOption = docenteSelect.options[docenteSelect.selectedIndex];
        const responsableData = {
            numeroCurso: curso,
            nombre: selectedOption.getAttribute('data-nombre') || '',
            documento: selectedOption.value || '',
            numeroSalon: salon,
            fecha: document.getElementById('fecha')?.value || '',
            horarioInicio: document.getElementById('horarioInicio')?.value || '',
            horarioFin: document.getElementById('horarioFin')?.value || '',
            estadoEquipo: document.getElementById('estadoEquipo')?.value || 'Excelente',
            estadoLimpieza: document.getElementById('estadoLimpieza')?.value || 'Bueno',
            observaciones: document.getElementById('observaciones')?.value || ''
        };

        // Validar fechas
        if (!responsableData.fecha) {
            if (typeof Utils !== 'undefined') {
                Utils.showToast('warning', 'Seleccione una fecha');
            }
            return;
        }

        if (responsableData.horarioFin && responsableData.horarioInicio &&
            responsableData.horarioFin <= responsableData.horarioInicio) {
            if (typeof Utils !== 'undefined') {
                Utils.showToast('warning', 'El horario final debe ser posterior');
            }
            return;
        }

        if (responsableId && responsableId !== '-1') {
            const index = DataManager.getResponsables().findIndex(r => r.id == responsableId);
            if (index !== -1) {
                DataManager.actualizarResponsable(index, responsableData);
                if (typeof Utils !== 'undefined') {
                    Utils.showToast('success', 'Responsable actualizado');
                }
            }
        } else {
            DataManager.guardarResponsable(responsableData);
            if (typeof Utils !== 'undefined') {
                Utils.showToast('success', 'Responsable guardado');
            }
        }

        // Actualizar tabla
        if (typeof UIManager !== 'undefined') {
            UIManager.renderizarTablaResponsables();
        }

        if (typeof ModalManager !== 'undefined') {
            ModalManager.hideModal('responsable');
        }
    }

    /**
     * Elimina un responsable
     */
    function eliminar(id) {
        console.log('🗑️ Eliminando responsable ID:', id);

        const confirmar = () => {
            if (typeof Utils !== 'undefined') {
                Utils.showConfirm('¿Eliminar responsable?', 'Esta acción no se puede deshacer')
                    .then(result => {
                        if (result.isConfirmed) {
                            DataManager.eliminarResponsable(id);
                            if (typeof UIManager !== 'undefined') {
                                UIManager.renderizarTablaResponsables();
                            }
                            if (typeof Utils !== 'undefined') {
                                Utils.showToast('success', 'Responsable eliminado');
                            }
                        }
                    });
            } else {
                if (confirm('¿Eliminar responsable? Esta acción no se puede deshacer')) {
                    DataManager.eliminarResponsable(id);
                    if (typeof UIManager !== 'undefined') {
                        UIManager.renderizarTablaResponsables();
                    }
                }
            }
        };

        confirmar();
    }

    /**
     * Inicializa el módulo - cargar responsables y salones
     */
    async function inicializar() {
        console.log('🔄 Inicializando módulo de responsables...');
        await cargarResponsables();
        await cargarSalones();
        console.log('✅ Módulo de responsables inicializado');
    }

    // Inicializar
    setTimeout(() => {
        inicializar();
    }, 300);

    // Exponer funciones globalmente
    window.mostrarFormularioResponsable = mostrarFormulario;
    window.editarResponsable = editar;
    window.guardarResponsable = guardar;
    window.eliminarResponsable = eliminar;
    window.cargarDocentesPorCurso = cargarDocentesPorCurso;
    window.cargarDatosDocente = cargarDatosDocente;

    // API pública del módulo
    const api = {
        inicializar,
        cargarResponsables,
        cargarSalones,
        cargarDocentesPorCurso,
        cargarDatosDocente,
        mostrarFormulario,
        editar,
        guardar,
        eliminar
    };

    console.log('✅ ResponsablesModule v0.7: API creada');
    return api;
})();

// Verificar carga
if (typeof ResponsablesModule !== 'undefined') {
    console.log('✅ ResponsablesModule v0.7 cargado correctamente');
} else {
    console.error('❌ Error cargando ResponsablesModule');
}

window.ResponsablesModule = ResponsablesModule;