// responsables.js - Módulo de gestión de responsables
// VERSIÓN CORREGIDA - v0.5

const ResponsablesModule = (function() {
    
    // Variable local para almacenar responsables cargados
    let responsables = [];

    /**
     * Carga los responsables desde DataManager
     */
    async function cargarResponsables() {
        try {
            console.log('🔄 Cargando responsables en módulo...');
            responsables = await DataManager.cargarResponsables?.() || [];
            console.log(`✅ ${responsables.length} responsables cargados en módulo`);
            if (responsables.length > 0) {
                console.log('📋 Ejemplo de estructura:', responsables[0]);
            }
            return responsables;
        } catch (error) {
            console.error('❌ Error cargando responsables:', error);
            responsables = [];
            return [];
        }
    }

    /**
     * Limpia los campos de datos del docente (CON VALIDACIÓN)
     */
    function limpiarCamposDocente() {
        console.log('🧹 Limpiando campos de docente...');
        
        const campos = [
            'nombreResponsable',
            'documentoResponsable',
            'horarioInicio',
            'horarioFin'
        ];
        
        campos.forEach(id => {
            const elemento = document.getElementById(id);
            if (elemento) {
                elemento.value = '';
                console.log(`✅ Campo ${id} limpiado`);
            } else {
                console.warn(`⚠️ Campo ${id} no encontrado en el DOM`);
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
        
        if (!cursoSelect) {
            console.warn('❌ Selector de curso no encontrado');
            return;
        }
        
        if (!docenteSelect) {
            console.warn('❌ Selector de docente no encontrado');
            return;
        }
        
        const cursoId = cursoSelect.value;
        console.log('📚 Curso seleccionado:', cursoId);
        
        // Limpiar select de docentes
        docenteSelect.innerHTML = '<option value="">Seleccione un docente</option>';
        
        // Limpiar campos de datos del docente (con validación)
        limpiarCamposDocente();
        
        if (!cursoId) {
            console.log('⚠️ No hay curso seleccionado');
            return;
        }
        
        // Filtrar responsables por curso
        const docentesFiltrados = responsables.filter(r => r.numeroCurso === cursoId);
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
            option.setAttribute('data-horarioInicio', docente.horarioInicio || '');
            option.setAttribute('data-horarioFin', docente.horarioFin || '');
            option.setAttribute('data-materia', docente.materia || '');
            option.textContent = `${docente.nombre} (${docente.documento})${docente.materia ? ' - ' + docente.materia : ''}`;
            docenteSelect.appendChild(option);
        });
        
        console.log(`✅ ${docentesFiltrados.length} docentes cargados en el selector`);
    }

    /**
     * Carga los datos del docente seleccionado (CON VALIDACIÓN)
     */
    function cargarDatosDocente() {
        console.log('🔄 Cargando datos del docente seleccionado...');
        
        const docenteSelect = document.getElementById('docenteResponsable');
        
        if (!docenteSelect) {
            console.warn('❌ Selector de docente no encontrado');
            return;
        }
        
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
        
        console.log('📝 Datos a cargar:', { nombre, documento, horarioInicio, horarioFin });
        
        // Asignar valores con validación
        const asignarValor = (id, valor) => {
            const elemento = document.getElementById(id);
            if (elemento) {
                elemento.value = valor;
                console.log(`✅ Campo ${id} asignado:`, valor);
            } else {
                console.warn(`⚠️ Campo ${id} no encontrado`);
            }
        };
        
        asignarValor('nombreResponsable', nombre);
        asignarValor('documentoResponsable', documento);
        asignarValor('horarioInicio', horarioInicio);
        asignarValor('horarioFin', horarioFin);
    }

    /**
     * Muestra el formulario para nuevo responsable
     */
    function mostrarFormulario() {
        console.log('📝 Mostrando formulario de responsable');
        
        const form = document.getElementById('formResponsable');
        if (form) form.reset();
        
        const idField = document.getElementById('responsableId');
        if (idField) idField.value = '-1';
        
        const fechaField = document.getElementById('fecha');
        if (fechaField) fechaField.value = new Date().toISOString().split('T')[0];
        
        // Limpiar campos de docente
        limpiarCamposDocente();
        
        // Limpiar select de docente
        const docenteSelect = document.getElementById('docenteResponsable');
        if (docenteSelect) {
            docenteSelect.innerHTML = '<option value="">Seleccione un docente</option>';
        }
        
        if (ModalManager.showModal('responsable')) {
            console.log('✅ Modal responsable abierto');
        } else {
            console.error('❌ No se pudo abrir el modal');
        }
    }

    /**
     * Edita un responsable existente
     */
    function editar(id) {
        console.log('✏️ Editando responsable ID:', id);
        
        const responsablesList = DataManager.getResponsables?.() || [];
        const responsable = responsablesList.find(r => r.id == id);
        
        if (!responsable) {
            console.error('❌ Responsable no encontrado');
            return;
        }
        
        console.log('📝 Datos del responsable:', responsable);
        
        // Asignar valores con validación
        const asignarValor = (id, valor) => {
            const elemento = document.getElementById(id);
            if (elemento) {
                elemento.value = valor || '';
                console.log(`✅ Campo ${id} asignado:`, valor);
            } else {
                console.warn(`⚠️ Campo ${id} no encontrado`);
            }
        };
        
        asignarValor('responsableId', responsable.id);
        asignarValor('cursoResponsable', responsable.numeroCurso || '');
        asignarValor('numeroSalon', responsable.numeroSalon || '');
        asignarValor('fecha', responsable.fecha || '');
        asignarValor('horarioInicio', responsable.horarioInicio || '');
        asignarValor('horarioFin', responsable.horarioFin || '');
        asignarValor('estadoEquipo', responsable.estadoEquipo || 'Excelente');
        asignarValor('estadoLimpieza', responsable.estadoLimpieza || 'Bueno');
        asignarValor('observaciones', responsable.observaciones || '');
        
        // Cargar docentes del curso
        cargarDocentesPorCurso();
        
        // Seleccionar el docente correspondiente después de un breve retraso
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
        
        ModalManager.showModal('responsable');
    }

    /**
     * Guarda un responsable (nuevo o editado)
     */
    function guardar() {
        console.log('💾 Guardando responsable...');
        
        const responsableId = document.getElementById('responsableId')?.value;
        const curso = document.getElementById('cursoResponsable')?.value;
        const docenteSelect = document.getElementById('docenteResponsable');
        
        if (!docenteSelect || docenteSelect.selectedIndex <= 0) {
            Utils.showToast('warning', 'Seleccione un curso y un docente');
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
            Utils.showToast('warning', 'Complete todos los campos');
            return;
        }
        
        if (responsableData.horarioFin <= responsableData.horarioInicio) {
            Utils.showToast('warning', 'El horario final debe ser posterior');
            return;
        }
        
        if (responsableId && responsableId !== '-1') {
            const index = DataManager.getResponsables().findIndex(r => r.id == responsableId);
            if (index !== -1) {
                DataManager.actualizarResponsable(index, responsableData);
                Utils.showToast('success', 'Responsable actualizado');
            }
        } else {
            DataManager.guardarResponsable(responsableData);
            Utils.showToast('success', 'Responsable guardado');
        }
        
        // Actualizar tabla
        if (typeof UIManager !== 'undefined') {
            UIManager.renderizarTablaResponsables();
        }
        
        ModalManager.hideModal('responsable');
    }

    /**
     * Elimina un responsable
     */
    function eliminar(id) {
        Utils.showConfirm('¿Eliminar?', 'Esta acción no se puede deshacer')
            .then(result => {
                if (result.isConfirmed) {
                    DataManager.eliminarResponsable(id);
                    if (typeof UIManager !== 'undefined') {
                        UIManager.renderizarTablaResponsables();
                    }
                    Utils.showToast('success', 'Responsable eliminado');
                }
            });
    }

    // Inicializar - cargar responsables al inicio
    setTimeout(() => {
        cargarResponsables();
    }, 200);

    // Exponer funciones globalmente
    window.mostrarFormularioResponsable = mostrarFormulario;
    window.editarResponsable = editar;
    window.guardarResponsable = guardar;
    window.eliminarResponsable = eliminar;
    window.cargarDocentesPorCurso = cargarDocentesPorCurso;
    window.cargarDatosDocente = cargarDatosDocente;

    return {
        cargarResponsables,
        cargarDocentesPorCurso,
        cargarDatosDocente,
        mostrarFormulario,
        editar,
        guardar,
        eliminar
    };
})();

console.log('✅ Módulo Responsables v0.5 cargado correctamente');