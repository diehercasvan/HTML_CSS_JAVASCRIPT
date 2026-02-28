// responsables.js - Módulo de gestión de responsables
// VERSIÓN 0.6 - COMPLETA Y CORREGIDA

console.log('🔄 Iniciando carga de responsables.js...');

// Verificar dependencias
if (typeof DataManager === 'undefined') {
    console.error('❌ responsables.js: DataManager NO DISPONIBLE');
} else {
    console.log('✅ responsables.js: DataManager disponible');
}

const ResponsablesModule = (function() {
    console.log('📦 Ejecutando IIFE de ResponsablesModule...');
    
    // Variable local para almacenar responsables cargados
    let responsables = [];

    /**
     * Carga los responsables desde DataManager
     */
    async function cargarResponsables() {
        console.log('🔄 Cargando responsables en módulo...');
        try {
            const data = await DataManager.cargarResponsables?.() || [];
            
            // Normalizar nombres de propiedades
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
            if (responsables.length > 0) {
                console.log('📋 Ejemplo:', responsables[0]);
            }
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
                console.log(`✅ Campo ${campo.nombre} limpiado`);
            } else {
                console.warn(`⚠️ Campo ${campo.nombre} (${campo.id}) no encontrado`);
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
        
        // Limpiar campos de datos del docente
        limpiarCamposDocente();
        
        if (!cursoId) {
            console.log('⚠️ No hay curso seleccionado');
            return;
        }
        
        // Filtrar responsables por curso
        const docentesFiltrados = responsables.filter(r => r.numeroCurso === cursoId);
        console.log(`📚 Docentes encontrados:`, docentesFiltrados.length);
        
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
        
        if (!docenteSelect) {
            console.warn('⚠️ Selector de docente no encontrado');
            return;
        }
        
        const selectedIndex = docenteSelect.selectedIndex;
        
        if (selectedIndex <= 0) {
            limpiarCamposDocente();
            return;
        }
        
        const selectedOption = docenteSelect.options[selectedIndex];
        
        // Obtener valores con validación
        const nombre = selectedOption.getAttribute('data-nombre') || '';
        const documento = selectedOption.getAttribute('data-documento') || '';
        const horarioInicio = selectedOption.getAttribute('data-horarioInicio') || '';
        const horarioFin = selectedOption.getAttribute('data-horarioFin') || '';
        
        console.log('📝 Datos a cargar:', { nombre, documento, horarioInicio, horarioFin });
        
        // Asignar valores con verificación de existencia
        const asignarSiExiste = (id, valor) => {
            const elemento = document.getElementById(id);
            if (elemento) {
                elemento.value = valor;
                console.log(`✅ ${id} asignado:`, valor);
                return true;
            } else {
                console.warn(`⚠️ Campo ${id} no encontrado`);
                return false;
            }
        };
        
        asignarSiExiste('nombreResponsable', nombre);
        asignarSiExiste('documentoResponsable', documento);
        asignarSiExiste('horarioInicio', horarioInicio);
        asignarSiExiste('horarioFin', horarioFin);
    }

    /**
     * Muestra el formulario para nuevo responsable
     */
    function mostrarFormulario() {
        console.log('📝 Mostrando formulario de responsable');
        
        // Verificar que Utils existe
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
        
        // Mostrar modal
        if (typeof ModalManager !== 'undefined') {
            ModalManager.showModal('responsable');
        } else {
            console.error('❌ ModalManager no disponible');
            alert('Error: ModalManager no disponible');
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
            if (typeof Utils !== 'undefined') {
                Utils.showToast('error', 'Responsable no encontrado');
            }
            return;
        }
        
        console.log('📝 Datos del responsable:', responsable);
        
        // Función auxiliar para asignar valor
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
        
        // Seleccionar el docente correspondiente
        setTimeout(() => {
            const docenteSelect = document.getElementById('docenteResponsable');
            if (docenteSelect) {
                for (let i = 0; i < docenteSelect.options.length; i++) {
                    if (docenteSelect.options[i].value === responsable.documento) {
                        docenteSelect.selectedIndex = i;
                        cargarDatosDocente();
                        console.log('✅ Docente seleccionado:', responsable.documento);
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
    function guardar() {
        console.log('💾 Guardando responsable...');
        
        const responsableId = document.getElementById('responsableId')?.value;
        const curso = document.getElementById('cursoResponsable')?.value;
        const docenteSelect = document.getElementById('docenteResponsable');
        
        if (!docenteSelect || docenteSelect.selectedIndex <= 0) {
            if (typeof Utils !== 'undefined') {
                Utils.showToast('warning', 'Seleccione un curso y un docente');
            } else {
                alert('Seleccione un curso y un docente');
            }
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
        if (!responsableData.numeroSalon || !responsableData.fecha) {
            if (typeof Utils !== 'undefined') {
                Utils.showToast('warning', 'Complete todos los campos');
            } else {
                alert('Complete todos los campos');
            }
            return;
        }
        
        if (responsableData.horarioFin && responsableData.horarioInicio && 
            responsableData.horarioFin <= responsableData.horarioInicio) {
            if (typeof Utils !== 'undefined') {
                Utils.showToast('warning', 'El horario final debe ser posterior');
            } else {
                alert('El horario final debe ser posterior');
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

    // Inicializar - cargar responsables al inicio
    setTimeout(() => {
        cargarResponsables();
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
        cargarResponsables,
        cargarDocentesPorCurso,
        cargarDatosDocente,
        mostrarFormulario,
        editar,
        guardar,
        eliminar
    };
    
    console.log('✅ ResponsablesModule: API creada');
    return api;
})();

// Verificar carga
if (typeof ResponsablesModule !== 'undefined') {
    console.log('✅ ResponsablesModule v0.6 cargado correctamente');
} else {
    console.error('❌ Error cargando ResponsablesModule');
}

// Exponer globalmente
window.ResponsablesModule = ResponsablesModule;