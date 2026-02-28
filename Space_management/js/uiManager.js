// uiManager.js - Módulo para manejar la interfaz de usuario v0.6
// VERSIÓN COMPLETA Y CORREGIDA

console.log('🔄 Iniciando carga de uiManager.js...');

// Verificar dependencias
if (typeof DataManager === 'undefined') {
    console.error('❌ uiManager.js: DataManager NO DISPONIBLE');
} else {
    console.log('✅ uiManager.js: DataManager disponible');
}

const UIManager = (function() {
    console.log('📦 Ejecutando IIFE de UIManager...');
    
    let cursos = [];
    let responsables = [];
    let estudiantesCache = {};

    // ===== FUNCIONES DE INICIALIZACIÓN =====
    
    async function inicializarSelectores() {
        console.log('🔄 Inicializando selectores UI...');
        try {
            await cargarCursosSelectores();
            await cargarResponsablesData();
            console.log('✅ Selectores UI inicializados');
        } catch (error) {
            console.error('❌ Error inicializando selectores:', error);
        }
    }

    async function cargarCursosSelectores() {
        try {
            console.log('🔄 Cargando cursos en selectores...');
            
            if (typeof DataManager === 'undefined') {
                console.error('❌ DataManager no disponible');
                return;
            }
            
            let cursosData = DataManager.getCursos ? DataManager.getCursos() : [];
            
            if (cursosData.length === 0) {
                cursosData = await DataManager.cargarCursos ? await DataManager.cargarCursos() : [];
            }
            
            if (cursosData.length === 0) {
                console.warn('⚠️ Usando cursos de ejemplo');
                cursosData = [
                    { id: '101', nombre: 'Matemáticas 10°' },
                    { id: '102', nombre: 'Español 10°' },
                    { id: '103', nombre: 'Ciencias 10°' }
                ];
            }
            
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
                    const valorActual = select.value;
                    
                    select.innerHTML = '<option value="">Seleccione un curso</option>';
                    
                    cursosData.forEach(curso => {
                        const option = document.createElement('option');
                        option.value = curso.id;
                        option.textContent = `${curso.id} - ${curso.nombre}`;
                        select.appendChild(option);
                    });
                    
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

    async function cargarResponsablesData() {
        try {
            console.log('🔄 Cargando responsables...');
            
            if (typeof DataManager === 'undefined') {
                console.error('❌ DataManager no disponible');
                responsables = [];
                return;
            }
            
            responsables = await DataManager.cargarResponsables ? await DataManager.cargarResponsables() : [];
            
            console.log(`✅ Responsables cargados: ${responsables.length}`);
            if (responsables.length > 0) {
                console.log('📋 Ejemplo:', responsables[0]);
            }
            
        } catch (error) {
            console.error('❌ Error cargando responsables:', error);
            responsables = [];
        }
    }

    // ===== FUNCIONES DE RESPONSABLES =====
    
    function renderizarTablaResponsables() {
        const tbody = document.getElementById('cuerpoTablaResponsables');
        if (!tbody) {
            console.warn('⚠️ Tabla de responsables no encontrada');
            return;
        }

        const responsablesList = DataManager.getResponsables ? DataManager.getResponsables() : [];
        
        if (responsablesList.length === 0) {
            tbody.innerHTML = '<tr><td colspan="11" class="text-center">No hay responsables registrados</td></tr>';
            return;
        }

        let html = '';
        responsablesList.forEach(responsable => {
            const horarioInicio = responsable.horarioInicio || 'N/A';
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
    
    function renderizarPuestosDocentes() {
        const tbody = document.getElementById('cuerpoTablaPuestosDocentes');
        if (!tbody) {
            console.warn('⚠️ Tabla de puestos no encontrada');
            return;
        }

        const puestos = DataManager.getPuestosDocentes ? DataManager.getPuestosDocentes() : [];
        
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
    
    function renderizarMesas() {
        const container = document.getElementById('mesasContainer');
        if (!container) {
            console.warn('⚠️ Contenedor de mesas no encontrado');
            return;
        }

        const cursoSeleccionado = sessionStorage.getItem('cursoMesasSeleccionado');
        
        if (!cursoSeleccionado) {
            container.innerHTML = '<p class="text-muted">Seleccione un curso para ver las mesas</p>';
            return;
        }

        const mesas = DataManager.getMesasPorCurso ? 
            DataManager.getMesasPorCurso(cursoSeleccionado) : [];
        
        console.log(`📊 Renderizando ${mesas.length} mesas para curso ${cursoSeleccionado}`);
        
        if (mesas.length === 0) {
            container.innerHTML = `<p class="text-muted">No hay mesas configuradas para el curso ${cursoSeleccionado}</p>`;
            return;
        }

        const columnas = parseInt(document.getElementById('columnas')?.value) || 2;

        let colClass = 'col-md-6';
        if (columnas === 1) colClass = 'col-12';
        else if (columnas === 2) colClass = 'col-md-6';
        else if (columnas === 3) colClass = 'col-md-4';
        else if (columnas === 4) colClass = 'col-md-3';
        else if (columnas === 5) colClass = 'col-md-2-4';
        else colClass = 'col-md-2';

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
    
    function renderizarEquipos() {
        const tbody = document.getElementById('cuerpoTablaEquipos');
        if (!tbody) {
            console.warn('⚠️ Tabla de equipos no encontrada');
            return;
        }

        const equipos = DataManager.getEquipos ? DataManager.getEquipos() : [];
        
        if (equipos.length === 0) {
            tbody.innerHTML = '<tr><td colspan="7" class="text-center">No hay equipos registrados</td></tr>';
            return;
        }

        let html = '';
        equipos.forEach((equipo, index) => {
            html += `
                <tr>
                    <td>${index + 1}</td>
                    <td><span class="badge bg-info">${equipo.tipo || 'N/A'}</span></td>
                    <td><span class="badge bg-secondary">${equipo.serial || 'N/A'}</span></td>
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
    
    function renderizarSillas() {
        const container = document.getElementById('sillasContainer');
        if (!container) {
            console.warn('⚠️ Contenedor de sillas no encontrado');
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
            container.innerHTML = `<p class="text-muted">No hay sillas configuradas para el curso ${cursoSeleccionado}</p>`;
            return;
        }

        const total = sillas.length;
        const ocupadas = sillas.filter(s => s.documento).length;
        const disponibles = total - ocupadas;

        let html = `
            <div class="row mb-3">
                <div class="col-12">
                    <div class="alert alert-info">
                        <strong>Resumen:</strong> ${total} sillas | 
                        <span class="text-success">${ocupadas} ocupadas</span> | 
                        <span class="text-secondary">${disponibles} disponibles</span>
                    </div>
                </div>
            </div>
            <div class="row">
        `;
        
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
        
        html += '</div>';
        container.innerHTML = html;
    }

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
                    <div class="stat-box"><strong>Total:</strong> ${estadisticas.total}</div>
                    <div class="stat-box"><strong>Ocupadas:</strong> ${estadisticas.ocupadas}</div>
                    <div class="stat-box"><strong>Disponibles:</strong> ${estadisticas.disponibles}</div>
                </div>
                <div class="col-6">
                    <div class="stat-box text-success"><strong>Excelente:</strong> ${estadisticas.excelente || 0}</div>
                    <div class="stat-box text-info"><strong>Bueno:</strong> ${estadisticas.bueno || 0}</div>
                    <div class="stat-box text-warning"><strong>Regular:</strong> ${estadisticas.regular || 0}</div>
                    <div class="stat-box text-danger"><strong>Malo:</strong> ${estadisticas.malo || 0}</div>
                </div>
            </div>
        `;
    }

    // ===== FUNCIONES DE ASISTENCIA =====
    
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
            console.error('❌ Error cargando asistencia:', error);
        }
    }

    async function renderizarTablaAsistencia(cursoId, fecha) {
        const tbody = document.getElementById('cuerpoTablaAsistencia');
        if (!tbody) {
            console.warn('⚠️ Tabla de asistencia no encontrada');
            return;
        }
        
        try {
            const estudiantes = await DataManager.getEstudiantesPorCurso(cursoId);
            const sillas = DataManager.getSillasPorCurso ? 
                DataManager.getSillasPorCurso(cursoId) : [];
            
            let asistenciaGuardada = null;
            if (typeof AsistenciaModule !== 'undefined' && AsistenciaModule.cargarAsistenciaGuardada) {
                asistenciaGuardada = await AsistenciaModule.cargarAsistenciaGuardada(cursoId, fecha);
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
                                       onchange="marcarAsistencia('${estudiante.documento}', this.checked)">
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
                                       onchange="marcarUniforme('${estudiante.documento}', this.checked)">
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
                                   onchange="actualizarObservacionAsistencia('${estudiante.documento}', this.value)">
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

    // ===== FUNCIONES AUXILIARES =====
    
    function getBadgeClass(estado) {
        if (typeof Utils !== 'undefined' && Utils.getBadgeClass) {
            return Utils.getBadgeClass(estado);
        }
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

    function getInternetBadgeClass(estado) {
        if (typeof Utils !== 'undefined' && Utils.getInternetBadgeClass) {
            return Utils.getInternetBadgeClass(estado);
        }
        if (!estado) return 'bg-secondary';
        switch(estado.toLowerCase()) {
            case 'funciona': return 'bg-success';
            case 'lento': return 'bg-warning text-dark';
            case 'no funciona': return 'bg-danger';
            default: return 'bg-secondary';
        }
    }

    // API pública
    const api = {
        inicializarSelectores,
        renderizarTablaResponsables,
        renderizarPuestosDocentes,
        renderizarMesas,
        renderizarEquipos,
        renderizarSillas,
        actualizarEstadisticasSillas,
        cargarAsistenciaPorCurso,
        renderizarTablaAsistencia,
        getBadgeClass,
        getInternetBadgeClass
    };
    
    console.log('✅ UIManager: API creada');
    return api;
})();

if (typeof UIManager !== 'undefined') {
    console.log('✅ UIManager v0.6 cargado correctamente');
} else {
    console.error('❌ Error cargando UIManager');
}

window.UIManager = UIManager;