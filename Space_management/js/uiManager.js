// uiManager.js - Módulo para manejar la interfaz de usuario v0.4
// RECONSTRUIDO COMPLETAMENTE

const UIManager = (function() {
    // ===== VARIABLES PRIVADAS =====
    let cursos = [];
    let responsables = [];
    let estudiantesCache = {};

    // ===== FUNCIONES DE INICIALIZACIÓN =====
    
    /**
     * Inicializa todos los selectores de la aplicación
     */
    async function inicializarSelectores() {
        console.log('🔄 Inicializando selectores UI...');
    try {
        // Cargar cursos primero
        await cargarCursosSelectores();
        
        // Luego cargar responsables
        await cargarResponsablesData();
        
        console.log('✅ Selectores UI inicializados');
    } catch (error) {
        console.error('Error inicializando selectores:', error);
    }
    }

    /**
     * Carga los cursos en todos los selectores de la aplicación
     */
   // uiManager.js - Función cargarCursosSelectores CORREGIDA

/**
 * Carga los cursos en todos los selectores de la aplicación
 */
async function cargarCursosSelectores() {
    try {
        console.log('🔄 Cargando cursos en selectores...');
        
        // Verificar que DataManager existe
        if (typeof DataManager === 'undefined') {
            console.error('❌ DataManager no está disponible');
            return;
        }
        
        // Obtener cursos con validación
        let cursosData = [];
        try {
            cursosData = DataManager.getCursos ? DataManager.getCursos() : [];
        } catch (e) {
            console.error('Error al obtener cursos:', e);
            cursosData = [];
        }
        
        // Si no hay cursos, intentar cargarlos
        if (cursosData.length === 0) {
            try {
                cursosData = await DataManager.cargarCursos ? await DataManager.cargarCursos() : [];
            } catch (e) {
                console.error('Error al cargar cursos:', e);
            }
        }
        
        console.log(`📚 Cursos obtenidos: ${cursosData.length}`);
        
        // Si aún no hay cursos, usar datos de ejemplo
        if (cursosData.length === 0) {
            console.warn('⚠️ Usando cursos de ejemplo');
            cursosData = [
                { id: '101', nombre: 'Matemáticas 10°' },
                { id: '102', nombre: 'Español 10°' },
                { id: '103', nombre: 'Ciencias 10°' }
            ];
        }
        
        // Array de selectores donde se deben cargar los cursos
        const selectores = [
            'cursoResponsable',
            'cursoMesas',
            'cursoSillas',
            'cursoAsistencia',
            'cursoPuestoDocente'
        ];
        
        let selectoresEncontrados = 0;
        
        selectores.forEach(id => {
            const select = document.getElementById(id);
            if (select) {
                selectoresEncontrados++;
                
                // Guardar el valor seleccionado actualmente si existe
                const valorActual = select.value;
                
                // Limpiar y llenar el select
                select.innerHTML = '<option value="">Seleccione un curso</option>';
                
                cursosData.forEach(curso => {
                    const option = document.createElement('option');
                    option.value = curso.id;
                    option.textContent = `${curso.id} - ${curso.nombre}`;
                    select.appendChild(option);
                });
                
                // Restaurar el valor seleccionado si existía y sigue siendo válido
                if (valorActual) {
                    for (let i = 0; i < select.options.length; i++) {
                        if (select.options[i].value === valorActual) {
                            select.selectedIndex = i;
                            break;
                        }
                    }
                }
            }
        });
        
        console.log(`✅ Cursos cargados en ${selectoresEncontrados} selectores`);
        
    } catch (error) {
        console.error('❌ Error en cargarCursosSelectores:', error);
    }
}

    /**
     * Carga los datos de responsables
     */
    async function cargarResponsablesData() {
        try {
        console.log('🔄 Cargando responsables...');
        
        if (typeof DataManager === 'undefined') {
            console.error('❌ DataManager no está disponible');
            responsables = [];
            return;
        }
        
        try {
            responsables = await DataManager.cargarResponsables ? await DataManager.cargarResponsables() : [];
        } catch (e) {
            console.error('Error al cargar responsables:', e);
            responsables = [];
        }
        
        console.log(`✅ Responsables cargados: ${responsables.length}`);
        
    } catch (error) {
        console.error('Error cargando responsables:', error);
        responsables = [];
    }
    }

    // ===== FUNCIONES DE RESPONSABLES =====
    
    /**
     * Carga los docentes según el curso seleccionado
     */
    function cargarDocentesPorCurso() {
        try {
            const cursoSelect = document.getElementById('cursoResponsable');
            const docenteSelect = document.getElementById('docenteResponsable');
            
            if (!cursoSelect || !docenteSelect) {
                console.warn('Selectores de curso o docente no encontrados');
                return;
            }
            
            const cursoId = cursoSelect.value;
            
            // Limpiar select de docentes
            docenteSelect.innerHTML = '<option value="">Seleccione un docente</option>';
            
            // Limpiar campos de datos del docente
            limpiarCamposDocente();
            
            if (!cursoId) {
                return;
            }
            
            // Filtrar responsables por curso
            const docentesFiltrados = responsables.filter(r => r.numero_curso === cursoId);
            
            if (docentesFiltrados.length === 0) {
                docenteSelect.innerHTML = '<option value="">No hay docentes para este curso</option>';
                return;
            }
            
            docentesFiltrados.forEach(docente => {
                const option = document.createElement('option');
                option.value = docente.documento || '';
                option.setAttribute('data-nombre', docente.nombre || '');
                option.setAttribute('data-documento', docente.documento || '');
                option.setAttribute('data-horario-inicio', docente.horario_inicio || '');
                option.setAttribute('data-horario-fin', docente.horario_fin || '');
                option.setAttribute('data-materia', docente.materia || '');
                option.textContent = `${docente.nombre} (${docente.documento})${docente.materia ? ' - ' + docente.materia : ''}`;
                docenteSelect.appendChild(option);
            });
            
            console.log(`✅ ${docentesFiltrados.length} docentes cargados para el curso ${cursoId}`);
            
        } catch (error) {
            console.error('Error en cargarDocentesPorCurso:', error);
        }
    }

    /**
     * Carga los datos del docente seleccionado
     */
    function cargarDatosDocente() {
        try {
            const docenteSelect = document.getElementById('docenteResponsable');
            
            if (!docenteSelect) {
                console.warn('Selector de docente no encontrado');
                return;
            }
            
            const selectedIndex = docenteSelect.selectedIndex;
            
            if (selectedIndex <= 0) {
                limpiarCamposDocente();
                return;
            }
            
            const selectedOption = docenteSelect.options[selectedIndex];
            
            // Obtener valores
            const nombre = selectedOption.getAttribute('data-nombre') || '';
            const documento = selectedOption.getAttribute('data-documento') || '';
            const horarioInicio = selectedOption.getAttribute('data-horario-inicio') || '';
            const horarioFin = selectedOption.getAttribute('data-horario-fin') || '';
            
            // Asignar valores a los campos
            const nombreField = document.getElementById('nombreResponsable');
            const documentoField = document.getElementById('documentoResponsable');
            const horarioInicioField = document.getElementById('horarioInicio');
            const horarioFinField = document.getElementById('horarioFin');
            
            if (nombreField) nombreField.value = nombre;
            if (documentoField) documentoField.value = documento;
            if (horarioInicioField) horarioInicioField.value = horarioInicio;
            if (horarioFinField) horarioFinField.value = horarioFin;
            
        } catch (error) {
            console.error('Error en cargarDatosDocente:', error);
        }
    }

    /**
     * Limpia los campos de datos del docente
     */
    function limpiarCamposDocente() {
        const nombreField = document.getElementById('nombreResponsable');
        const documentoField = document.getElementById('documentoResponsable');
        const horarioInicioField = document.getElementById('horarioInicio');
        const horarioFinField = document.getElementById('horarioFin');
        
        if (nombreField) nombreField.value = '';
        if (documentoField) documentoField.value = '';
        if (horarioInicioField) horarioInicioField.value = '';
        if (horarioFinField) horarioFinField.value = '';
    }

    /**
     * Renderiza la tabla de responsables
     */
    function renderizarTablaResponsables() {
        const tbody = document.getElementById('cuerpoTablaResponsables');
        if (!tbody) {
            console.warn('Tabla de responsables no encontrada');
            return;
        }

        const responsablesList = DataManager.getResponsables() || [];
        
        if (responsablesList.length === 0) {
            tbody.innerHTML = '<tr><td colspan="11" class="text-center">No hay responsables registrados</td></tr>';
            return;
        }

        let html = '';
        responsablesList.forEach(responsable => {
            const horarioInicio = responsable.horarioInicio || responsable.horario || 'N/A';
            const horarioFin = responsable.horarioFin || 'N/A';
            
            html += `
                <tr>
                    <td><span class="badge bg-info">${responsable.numeroCurso || ''}</span></td>
                    <td>${responsable.nombre || ''}</td>
                    <td>${responsable.documento || ''}</td>
                    <td><span class="badge bg-secondary">${responsable.numeroSalon || ''}</span></td>
                    <td>${responsable.fecha || ''}</td>
                    <td>${horarioInicio}</td>
                    <td>${horarioFin}</td>
                    <td><span class="badge ${getBadgeClass(responsable.estadoEquipo)}">${responsable.estadoEquipo || 'N/A'}</span></td>
                    <td><span class="badge ${getBadgeClass(responsable.estadoLimpieza)}">${responsable.estadoLimpieza || 'N/A'}</span></td>
                    <td><small>${responsable.observaciones || ''}</small></td>
                    <td>
                        <button class="btn btn-sm btn-primary" onclick="editarResponsable(${responsable.id})">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-sm btn-danger" onclick="eliminarResponsable(${responsable.id})">
                            <i class="fas fa-trash"></i>
                        </button>
                    </td>
                </tr>
            `;
        });
        tbody.innerHTML = html;
    }

    // ===== FUNCIONES DE PUESTOS DOCENTES =====
    
    /**
     * Renderiza la tabla de puestos docentes
     */
    function renderizarPuestosDocentes() {
        const tbody = document.getElementById('cuerpoTablaPuestosDocentes');
        if (!tbody) {
            console.warn('Tabla de puestos docentes no encontrada');
            return;
        }

        const puestos = DataManager.getPuestosDocentes() || [];
        
        if (puestos.length === 0) {
            tbody.innerHTML = '<tr><td colspan="12" class="text-center">No hay puestos docentes registrados</td></tr>';
            return;
        }

        let html = '';
        puestos.forEach((puesto, index) => {
            html += `
                <tr>
                    <td>${index + 1}</td>
                    <td>${puesto.nombre || ''}</td>
                    <td>${puesto.documento || ''}</td>
                    <td><span class="badge bg-secondary">${puesto.serial || ''}</span></td>
                    <td><span class="badge ${getBadgeClass(puesto.estado)}">${puesto.estado || 'N/A'}</span></td>
                    <td><span class="badge ${getBadgeClass(puesto.mouse)}">${puesto.mouse || 'N/A'}</span></td>
                    <td><span class="badge ${getBadgeClass(puesto.teclado)}">${puesto.teclado || 'N/A'}</span></td>
                    <td><span class="badge ${getBadgeClass(puesto.pantalla)}">${puesto.pantalla || 'N/A'}</span></td>
                    <td><span class="badge ${getInternetBadgeClass(puesto.internet)}">${puesto.internet || 'N/A'}</span></td>
                    <td><span class="badge ${getBadgeClass(puesto.estadoLimpieza)}">${puesto.estadoLimpieza || 'N/A'}</span></td>
                    <td><small>${puesto.observaciones || ''}</small></td>
                    <td>
                        <button class="btn btn-sm btn-danger" onclick="eliminarPuestoDocente(${index})">
                            <i class="fas fa-trash"></i>
                        </button>
                    </td>
                </tr>
            `;
        });
        tbody.innerHTML = html;
    }

    // ===== FUNCIONES DE MESAS =====
    
    /**
     * Carga los estudiantes para las mesas según el curso seleccionado
     */
    async function cargarEstudiantesParaMesas() {
        try {
            const cursoSelect = document.getElementById('cursoMesas');
            if (!cursoSelect) return;
            
            const cursoId = cursoSelect.value;
            
            if (!cursoId) {
                sessionStorage.removeItem('cursoMesasSeleccionado');
                return;
            }
            
            sessionStorage.setItem('cursoMesasSeleccionado', cursoId);
            
            // Cargar estudiantes para cache
            const estudiantes = await DataManager.getEstudiantesPorCurso(cursoId);
            estudiantesCache[cursoId] = estudiantes;
            
            console.log(`✅ Estudiantes cargados para mesas: ${estudiantes.length}`);
            
        } catch (error) {
            console.error('Error cargando estudiantes para mesas:', error);
        }
    }

    /**
     * Renderiza las mesas
     */
    function renderizarMesas() {
        const container = document.getElementById('mesasContainer');
        if (!container) {
            console.warn('Contenedor de mesas no encontrado');
            return;
        }

        const cursoSeleccionado = sessionStorage.getItem('cursoMesasSeleccionado');
        const mesas = cursoSeleccionado 
            ? DataManager.getMesasPorCurso ? DataManager.getMesasPorCurso(cursoSeleccionado) : []
            : DataManager.getMesas ? DataManager.getMesas() : [];
        
        const columnas = parseInt(document.getElementById('columnas')?.value) || 2;
        
        if (mesas.length === 0) {
            container.innerHTML = '<p class="text-muted">No hay mesas configuradas para este curso</p>';
            return;
        }

        // Determinar clase de columna según número de columnas
        let colClass = 'col-md-6';
        if (columnas === 1) colClass = 'col-12';
        else if (columnas === 2) colClass = 'col-md-6';
        else if (columnas === 3) colClass = 'col-md-4';
        else if (columnas === 4) colClass = 'col-md-3';
        else if (columnas === 5) colClass = 'col-md-2-4';
        else colClass = 'col-md-2';

        // Agrupar mesas por fila
        const mesasPorFila = {};
        mesas.forEach(mesa => {
            if (!mesasPorFila[mesa.fila]) mesasPorFila[mesa.fila] = [];
            mesasPorFila[mesa.fila].push(mesa);
        });

        let html = '';
        Object.keys(mesasPorFila).sort((a, b) => parseInt(a) - parseInt(b)).forEach(fila => {
            const mesasFila = mesasPorFila[fila];
            html += `<div class="row mb-4">`;
            
            mesasFila.forEach(mesa => {
                const pcsAsignados = mesa.pcs.filter(pc => pc.estudiante).length;
                const pcsTotales = mesa.pcs.length;
                
                const excelentes = mesa.pcs.filter(pc => pc.estado === 'Excelente').length;
                const buenos = mesa.pcs.filter(pc => pc.estado === 'Bueno').length;
                const regulares = mesa.pcs.filter(pc => pc.estado === 'Regular').length;
                const danados = mesa.pcs.filter(pc => pc.estado === 'Dañado').length;
                
                html += `
                    <div class="${colClass} mb-3">
                        <div class="mesa-card" onclick="abrirConfiguracionMesa('${mesa.id}')">
                            <div class="mesa-header">
                                Mesa ${parseInt(fila) + 1}-${mesa.columna + 1}
                            </div>
                            <div class="mesa-body">
                                <i class="fas fa-desktop pc-icon-large"></i>
                                <div class="pc-count">${pcsTotales} PCs</div>
                                <div class="pc-asignados">
                                    <i class="fas fa-user-check"></i> ${pcsAsignados} asignados
                                </div>
                                <div class="mesa-stats">
                                    ${excelentes > 0 ? `<div class="mesa-stat excelente">${excelentes} ✦</div>` : ''}
                                    ${buenos > 0 ? `<div class="mesa-stat bueno">${buenos} ✓</div>` : ''}
                                    ${regulares > 0 ? `<div class="mesa-stat regular">${regulares} ⚠</div>` : ''}
                                    ${danados > 0 ? `<div class="mesa-stat danado">${danados} ✗</div>` : ''}
                                </div>
                            </div>
                        </div>
                    </div>
                `;
            });
            
            html += `</div>`;
        });
        
        container.innerHTML = html;
    }

    // ===== FUNCIONES DE EQUIPOS =====
    
    /**
     * Renderiza la tabla de equipos
     */
    function renderizarEquipos() {
        const tbody = document.getElementById('cuerpoTablaEquipos');
        if (!tbody) {
            console.warn('Tabla de equipos no encontrada');
            return;
        }

        const equipos = DataManager.getEquipos() || [];
        
        if (equipos.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" class="text-center">No hay equipos registrados</td></tr>';
            return;
        }

        let html = '';
        equipos.forEach((equipo, index) => {
            html += `
                <tr>
                    <td>${index + 1}</td>
                    <td><span class="badge bg-info">${equipo.tipo || 'N/A'}</span></td>
                    <td><span class="badge ${getBadgeClass(equipo.estado)}">${equipo.estado || 'N/A'}</span></td>
                    <td><span class="badge ${getBadgeClass(equipo.estadoLimpieza)}">${equipo.estadoLimpieza || 'N/A'}</span></td>
                    <td><small>${equipo.observaciones || ''}</small></td>
                    <td>
                        <button class="btn btn-sm btn-primary" onclick="editarEquipo(${index})">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-sm btn-danger" onclick="eliminarEquipo(${index})">
                            <i class="fas fa-trash"></i>
                        </button>
                    </td>
                </tr>
            `;
        });
        tbody.innerHTML = html;
    }

    // ===== FUNCIONES DE SILLAS =====
    
    /**
     * Carga los estudiantes para sillas según el curso seleccionado
     */
    async function cargarEstudiantesParaSillas() {
        try {
            const cursoSelect = document.getElementById('cursoSillas');
            if (!cursoSelect) return;
            
            const cursoId = cursoSelect.value;
            
            if (!cursoId) return;
            
            const estudiantes = await DataManager.getEstudiantesPorCurso(cursoId);
            estudiantesCache[cursoId] = estudiantes;
            
            // Actualizar estadísticas
            const estadisticas = DataManager.getEstadisticasSillas ? 
                DataManager.getEstadisticasSillas(cursoId) : null;
            
            if (estadisticas) {
                actualizarEstadisticasSillas(estadisticas);
            }
            
            renderizarSillas();
            
        } catch (error) {
            console.error('Error cargando estudiantes para sillas:', error);
        }
    }

    /**
     * Renderiza las sillas
     */
    function renderizarSillas() {
        const container = document.getElementById('sillasContainer');
        if (!container) {
            console.warn('Contenedor de sillas no encontrado');
            return;
        }

        const cursoSeleccionado = document.getElementById('cursoSillas')?.value;
        
        if (!cursoSeleccionado) {
            container.innerHTML = '<p class="text-muted">Seleccione un curso para ver las sillas</p>';
            return;
        }

        const sillas = DataManager.getSillasPorCurso ? 
            DataManager.getSillasPorCurso(cursoSeleccionado) : [];
        
        if (sillas.length === 0) {
            container.innerHTML = '<p class="text-muted">No hay sillas configuradas para este curso</p>';
            return;
        }

        let html = '';
        sillas.forEach(silla => {
            const estadoClass = getBadgeClass(silla.estado);
            const asignadoClass = silla.documento ? 'bg-success' : 'bg-secondary';
            const asignadoText = silla.documento ? silla.nombreEstudiante : 'Disponible';
            
            html += `
                <div class="col-md-3 col-sm-4 col-6 mb-3">
                    <div class="card silla-card" onclick="abrirModalSilla('${silla.id}')">
                        <div class="card-header text-center ${silla.documento ? 'bg-success text-white' : 'bg-light'}">
                            <i class="fas fa-chair"></i> Silla ${silla.numero}
                        </div>
                        <div class="card-body">
                            <p class="small mb-1"><strong>Serial:</strong> ${silla.serial}</p>
                            <p class="small mb-1">
                                <span class="badge ${asignadoClass}">
                                    <i class="fas fa-user"></i> ${asignadoText}
                                </span>
                            </p>
                            <p class="small mb-1">
                                <span class="badge ${estadoClass}">${silla.estado}</span>
                            </p>
                        </div>
                    </div>
                </div>
            `;
        });
        container.innerHTML = html;
    }

    /**
     * Actualiza las estadísticas de sillas
     */
    function actualizarEstadisticasSillas(estadisticas) {
        const container = document.getElementById('estadisticasSillas');
        if (!container) return;
        
        if (!estadisticas || estadisticas.total === 0) {
            container.innerHTML = '<p class="text-muted">No hay sillas para mostrar estadísticas</p>';
            return;
        }
        
        container.innerHTML = `
            <div class="row">
                <div class="col-6">
                    <div class="stat-box">
                        <strong>Total:</strong> ${estadisticas.total}
                    </div>
                    <div class="stat-box">
                        <strong>Ocupadas:</strong> ${estadisticas.ocupadas}
                    </div>
                    <div class="stat-box">
                        <strong>Disponibles:</strong> ${estadisticas.disponibles}
                    </div>
                </div>
                <div class="col-6">
                    <div class="stat-box text-success">
                        <strong>Excelente:</strong> ${estadisticas.excelente}
                    </div>
                    <div class="stat-box text-info">
                        <strong>Bueno:</strong> ${estadisticas.bueno}
                    </div>
                    <div class="stat-box text-warning">
                        <strong>Regular:</strong> ${estadisticas.regular}
                    </div>
                    <div class="stat-box text-danger">
                        <strong>Malo:</strong> ${estadisticas.malo}
                    </div>
                </div>
            </div>
        `;
    }

    // ===== FUNCIONES DE ASISTENCIA =====
    
    /**
     * Carga la asistencia por curso
     */
    async function cargarAsistenciaPorCurso() {
        try {
            const cursoSelect = document.getElementById('cursoAsistencia');
            const fechaInput = document.getElementById('fechaAsistencia');
            
            if (!cursoSelect || !fechaInput) return;
            
            const cursoId = cursoSelect.value;
            if (!cursoId) return;
            
            if (!fechaInput.value) {
                fechaInput.value = new Date().toISOString().split('T')[0];
            }
            
            await renderizarTablaAsistencia(cursoId, fechaInput.value);
            
        } catch (error) {
            console.error('Error cargando asistencia:', error);
        }
    }

    /**
     * Renderiza la tabla de asistencia
     */
    async function renderizarTablaAsistencia(cursoId, fecha) {
        const tbody = document.getElementById('cuerpoTablaAsistencia');
        if (!tbody) {
            console.warn('Tabla de asistencia no encontrada');
            return;
        }
        
        try {
            // Obtener estudiantes del curso
            const estudiantes = await DataManager.getEstudiantesPorCurso(cursoId);
            
            // Obtener sillas asignadas
            const sillas = DataManager.getSillasPorCurso ? 
                DataManager.getSillasPorCurso(cursoId) : [];
            
            // Obtener registro de asistencia si existe
            const asistenciaGuardada = DataManager.getAsistencia ? 
                DataManager.getAsistencia(cursoId, fecha) : null;
            
            if (estudiantes.length === 0) {
                tbody.innerHTML = '<tr><td colspan="6" class="text-center">No hay estudiantes en este curso</td></tr>';
                return;
            }
            
            let html = '';
            estudiantes.forEach(estudiante => {
                const sillaAsignada = sillas.find(s => s.documento === estudiante.documento);
                const registroAsistencia = asistenciaGuardada?.registros?.find(
                    r => r.documento === estudiante.documento
                );
                
                const nombreCompleto = `${estudiante.nombres} ${estudiante.apellidos}`;
                const asistio = registroAsistencia?.asistio || false;
                const observaciones = registroAsistencia?.observaciones || '';
                
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
                                       onchange="marcarAsistencia('${estudiante.documento}', this.checked)">
                                <label class="form-check-label" for="asistencia_${estudiante.documento}">
                                    ${asistio ? 'Presente' : 'Ausente'}
                                </label>
                            </div>
                        </td>
                        <td>
                            <input type="text" class="form-control form-control-sm" 
                                   id="obs_${estudiante.documento}" 
                                   value="${observaciones}"
                                   placeholder="Observaciones"
                                   onchange="actualizarObservacionAsistencia('${estudiante.documento}', this.value)">
                        </td>
                    </tr>
                `;
            });
            
            tbody.innerHTML = html;
            
        } catch (error) {
            console.error('Error renderizando tabla de asistencia:', error);
            tbody.innerHTML = '<tr><td colspan="6" class="text-center">Error cargando datos</td></tr>';
        }
    }

    // ===== FUNCIONES AUXILIARES =====
    
    /**
     * Obtiene la clase CSS según el estado
     */
    function getBadgeClass(estado) {
        if (!estado) return 'bg-secondary';
        switch(estado.toLowerCase()) {
            case 'excelente': return 'bg-success';
            case 'bueno': return 'bg-info';
            case 'regular': return 'bg-warning text-dark';
            case 'dañado':
            case 'malo': return 'bg-danger';
            default: return 'bg-secondary';
        }
    }

    /**
     * Obtiene la clase CSS para el estado de internet
     */
    function getInternetBadgeClass(estado) {
        if (!estado) return 'bg-secondary';
        switch(estado.toLowerCase()) {
            case 'funciona': return 'bg-success';
            case 'lento': return 'bg-warning text-dark';
            case 'no funciona': return 'bg-danger';
            default: return 'bg-secondary';
        }
    }

    // ===== API PÚBLICA =====
    return {
        // Inicialización
        inicializarSelectores,
        
        // Responsables
        cargarDocentesPorCurso,
        cargarDatosDocente,
        renderizarTablaResponsables,
        
        // Puestos Docentes
        renderizarPuestosDocentes,
        
        // Mesas
        cargarEstudiantesParaMesas,
        renderizarMesas,
        
        // Equipos
        renderizarEquipos,
        
        // Sillas
        cargarEstudiantesParaSillas,
        renderizarSillas,
        actualizarEstadisticasSillas,
        
        // Asistencia
        cargarAsistenciaPorCurso,
        renderizarTablaAsistencia,
        
        // Utilidades
        getBadgeClass,
        getInternetBadgeClass
    };
})();

// Verificar que UIManager se cargó correctamente
if (typeof UIManager !== 'undefined') {
    console.log('✅ UIManager v0.4 cargado correctamente');
    console.log('📋 Funciones disponibles:', Object.keys(UIManager));
} else {
    console.error('❌ Error cargando UIManager');
}

// Función de depuración para verificar el estado
window.depurarUI = function() {
    console.log('=== DEPURACIÓN UI ===');
    console.log('DataManager disponible:', typeof DataManager);
    
    if (typeof DataManager !== 'undefined') {
        console.log('getCursos:', typeof DataManager.getCursos);
        console.log('cargarCursos:', typeof DataManager.cargarCursos);
        
        try {
            const cursos = DataManager.getCursos ? DataManager.getCursos() : [];
            console.log('Cursos actuales:', cursos);
        } catch (e) {
            console.error('Error obteniendo cursos:', e);
        }
    }
    
    // Verificar selectores
    const selectores = [
        'cursoResponsable',
        'cursoMesas', 
        'cursoSillas',
        'cursoAsistencia',
        'cursoPuestoDocente'
    ];
    
    selectores.forEach(id => {
        const el = document.getElementById(id);
        console.log(`${id}: ${el ? '✅' : '❌'}`);
        if (el) {
            console.log(`  - Opciones: ${el.options.length}`);
        }
    });
};