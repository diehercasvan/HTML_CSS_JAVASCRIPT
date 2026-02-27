// dataManager.js - Módulo para manejar datos y operaciones CRUD v0.4
// RECONSTRUIDO COMPLETAMENTE

const DataManager = (function() {
    // ===== ESTADO DE LA APLICACIÓN =====
    let state = {
        cursos: [],
        responsables: [],
        puestosDocentes: [],
        mesas: [],
        equipos: [],
        sillas: [],
        asistencia: []
    };

    // ===== FUNCIONES DE CURSOS =====
    
    /**
     * Carga los cursos desde el archivo JSON
     */
    async function cargarCursos() {
        try {
            console.log('🔄 Cargando cursos...');
            const response = await fetch('data/cursos.json');
            
            if (!response.ok) {
                throw new Error(`Error HTTP: ${response.status}`);
            }
            
            const data = await response.json();
            state.cursos = data.cursos || [];
            console.log(`✅ ${state.cursos.length} cursos cargados`);
            return state.cursos;
            
        } catch (error) {
            console.error('❌ Error cargando cursos:', error);
            state.cursos = [];
            return [];
        }
    }

    /**
     * Obtiene la lista de cursos
     */
    function getCursos() {
        return state.cursos || [];
    }

    // ===== FUNCIONES DE RESPONSABLES =====
    
    /**
     * Carga los responsables desde el archivo JSON
     */
    async function cargarResponsables() {
        try {
            console.log('🔄 Cargando responsables...');
            const response = await fetch('data/responsables.json');
            
            if (!response.ok) {
                throw new Error(`Error HTTP: ${response.status}`);
            }
            
            const data = await response.json();
            const responsables = data.responsables || [];
            console.log(`✅ ${responsables.length} responsables cargados`);
            return responsables;
            
        } catch (error) {
            console.error('❌ Error cargando responsables:', error);
            return [];
        }
    }

    /**
     * Obtiene todos los responsables guardados
     */
    function getResponsables() {
        if (!state.responsables) state.responsables = [];
        return state.responsables;
    }

    /**
     * Obtiene responsables filtrados por curso
     */
    function getResponsablesPorCurso(numeroCurso) {
        if (!state.responsables) return [];
        return state.responsables.filter(r => r.numeroCurso === numeroCurso);
    }

    /**
     * Guarda un nuevo responsable
     */
    function guardarResponsable(data) {
        try {
            if (!state.responsables) state.responsables = [];
            
            const nuevoResponsable = {
                ...data,
                id: Date.now(),
                fechaRegistro: new Date().toISOString()
            };
            
            state.responsables.push(nuevoResponsable);
            guardarEnLocalStorage();
            console.log('✅ Responsable guardado:', nuevoResponsable.id);
            return nuevoResponsable;
            
        } catch (error) {
            console.error('❌ Error guardando responsable:', error);
            return null;
        }
    }

    /**
     * Actualiza un responsable existente
     */
    function actualizarResponsable(index, data) {
        try {
            if (!state.responsables) state.responsables = [];
            
            if (index >= 0 && index < state.responsables.length) {
                state.responsables[index] = { 
                    ...state.responsables[index], 
                    ...data,
                    fechaModificacion: new Date().toISOString()
                };
                guardarEnLocalStorage();
                console.log('✅ Responsable actualizado:', index);
                return true;
            }
            return false;
            
        } catch (error) {
            console.error('❌ Error actualizando responsable:', error);
            return false;
        }
    }

    /**
     * Elimina un responsable por ID
     */
    function eliminarResponsable(id) {
        try {
            if (!state.responsables) state.responsables = [];
            
            const idNum = typeof id === 'string' ? parseInt(id) : id;
            const longitudInicial = state.responsables.length;
            
            state.responsables = state.responsables.filter(r => r.id !== idNum);
            
            if (state.responsables.length < longitudInicial) {
                guardarEnLocalStorage();
                console.log('✅ Responsable eliminado:', id);
                return true;
            }
            
            console.warn('⚠️ Responsable no encontrado:', id);
            return false;
            
        } catch (error) {
            console.error('❌ Error eliminando responsable:', error);
            return false;
        }
    }

    // ===== FUNCIONES DE PUESTOS DOCENTES =====
    
    /**
     * Agrega un nuevo puesto docente
     */
    function agregarPuestoDocente(puesto) {
        try {
            if (!state.puestosDocentes) state.puestosDocentes = [];
            
            const nuevoPuesto = {
                ...puesto,
                id: Date.now(),
                fechaCreacion: new Date().toISOString()
            };
            
            state.puestosDocentes.push(nuevoPuesto);
            guardarEnLocalStorage();
            console.log('✅ Puesto docente agregado:', nuevoPuesto.id);
            return state.puestosDocentes;
            
        } catch (error) {
            console.error('❌ Error agregando puesto docente:', error);
            return state.puestosDocentes || [];
        }
    }

    /**
     * Obtiene todos los puestos docentes
     */
    function getPuestosDocentes() {
        if (!state.puestosDocentes) state.puestosDocentes = [];
        return state.puestosDocentes;
    }

    /**
     * Elimina un puesto docente por índice
     */
    function eliminarPuestoDocente(index) {
        try {
            if (!state.puestosDocentes) state.puestosDocentes = [];
            
            if (index >= 0 && index < state.puestosDocentes.length) {
                const eliminado = state.puestosDocentes.splice(index, 1);
                guardarEnLocalStorage();
                console.log('✅ Puesto docente eliminado');
                return true;
            }
            return false;
            
        } catch (error) {
            console.error('❌ Error eliminando puesto docente:', error);
            return false;
        }
    }

    // ===== FUNCIONES DE MESAS =====
    
    /**
     * Configura las mesas según filas, columnas y PCs por mesa
     */
    function configurarMesas(filas, columnas, pcsPorMesa, curso) {
        try {
            const mesas = [];
            
            for (let i = 0; i < filas; i++) {
                for (let j = 0; j < columnas; j++) {
                    const pcs = [];
                    
                    for (let k = 0; k < pcsPorMesa; k++) {
                        pcs.push({
                            id: `pc_${i}_${j}_${k}_${Date.now()}`,
                            serial: `PC${String(i+1).padStart(2,'0')}${String(j+1).padStart(2,'0')}${String(k+1).padStart(2,'0')}`,
                            curso: curso,
                            estudiante: '',
                            documento: '',
                            nombreEstudiante: '',
                            estado: 'Excelente',
                            mouse: 'Bueno',
                            teclado: 'Bueno',
                            pantalla: 'Bueno',
                            internet: 'Funciona',
                            estadoLimpieza: 'Bueno',
                            observaciones: ''
                        });
                    }
                    
                    const stats = {
                        total: pcs.length,
                        excelente: pcs.filter(pc => pc.estado === 'Excelente').length,
                        bueno: pcs.filter(pc => pc.estado === 'Bueno').length,
                        regular: pcs.filter(pc => pc.estado === 'Regular').length,
                        danado: pcs.filter(pc => pc.estado === 'Dañado').length,
                        asignados: pcs.filter(pc => pc.estudiante).length
                    };
                    
                    mesas.push({
                        id: `mesa_${i}_${j}_${Date.now()}`,
                        fila: i,
                        columna: j,
                        curso: curso,
                        pcs: pcs,
                        stats: stats
                    });
                }
            }
            
            // Filtrar mesas existentes del mismo curso o agregar nuevas
            if (state.mesas && curso) {
                const mesasOtrosCursos = state.mesas.filter(m => m.curso !== curso);
                state.mesas = [...mesasOtrosCursos, ...mesas];
            } else {
                state.mesas = mesas;
            }
            
            guardarEnLocalStorage();
            console.log(`✅ ${mesas.length} mesas configuradas para el curso ${curso}`);
            return state.mesas;
            
        } catch (error) {
            console.error('❌ Error configurando mesas:', error);
            return state.mesas || [];
        }
    }

    /**
     * Obtiene todas las mesas
     */
    function getMesas() {
        if (!state.mesas) state.mesas = [];
        return state.mesas;
    }

    /**
     * Obtiene mesas filtradas por curso
     */
    function getMesasPorCurso(curso) {
        if (!state.mesas) return [];
        return state.mesas.filter(m => m.curso === curso);
    }

    /**
     * Obtiene una mesa por su ID
     */
    function getMesa(mesaId) {
        if (!state.mesas) return null;
        return state.mesas.find(m => m.id === mesaId);
    }

    /**
     * Obtiene los documentos de estudiantes asignados a PCs en un curso
     */
    function getPCsAsignados(curso) {
        if (!state.mesas) return [];
        
        const mesas = state.mesas.filter(m => m.curso === curso);
        const pcsAsignados = [];
        
        mesas.forEach(mesa => {
            mesa.pcs.forEach(pc => {
                if (pc.documento) {
                    pcsAsignados.push(pc.documento);
                }
            });
        });
        
        return pcsAsignados;
    }

    /**
     * Actualiza los datos de un PC específico
     */
    function actualizarPcEstudiante(mesaId, pcIndex, data) {
        try {
            if (!state.mesas) return false;
            
            const mesa = state.mesas.find(m => m.id === mesaId);
            if (!mesa || !mesa.pcs || !mesa.pcs[pcIndex]) return false;
            
            // Verificar si el estudiante ya está asignado a otro PC en el mismo curso
            if (data.documento && data.documento !== mesa.pcs[pcIndex].documento) {
                const documentoExistente = verificarEstudianteEnPCs(data.documento, mesa.curso);
                if (documentoExistente) {
                    console.warn('⚠️ Estudiante ya tiene un PC asignado');
                    return false;
                }
            }
            
            // Actualizar el PC
            mesa.pcs[pcIndex] = { ...mesa.pcs[pcIndex], ...data };
            
            // Actualizar estadísticas de la mesa
            actualizarEstadisticasMesa(mesa);
            
            guardarEnLocalStorage();
            console.log('✅ PC actualizado');
            return true;
            
        } catch (error) {
            console.error('❌ Error actualizando PC:', error);
            return false;
        }
    }

    /**
     * Verifica si un estudiante ya tiene un PC asignado en un curso
     */
    function verificarEstudianteEnPCs(documento, curso) {
        if (!state.mesas) return false;
        
        const mesas = state.mesas.filter(m => m.curso === curso);
        for (const mesa of mesas) {
            for (const pc of mesa.pcs) {
                if (pc.documento === documento) {
                    return true;
                }
            }
        }
        return false;
    }

    /**
     * Actualiza las estadísticas de una mesa
     */
    function actualizarEstadisticasMesa(mesa) {
        if (!mesa || !mesa.pcs) return;
        
        mesa.stats = {
            total: mesa.pcs.length,
            excelente: mesa.pcs.filter(pc => pc.estado === 'Excelente').length,
            bueno: mesa.pcs.filter(pc => pc.estado === 'Bueno').length,
            regular: mesa.pcs.filter(pc => pc.estado === 'Regular').length,
            danado: mesa.pcs.filter(pc => pc.estado === 'Dañado').length,
            asignados: mesa.pcs.filter(pc => pc.estudiante).length
        };
    }

    // ===== FUNCIONES DE EQUIPOS =====
    
    /**
     * Agrega un nuevo equipo
     */
    function agregarEquipo(equipo) {
        try {
            if (!state.equipos) state.equipos = [];
            
            const nuevoEquipo = {
                ...equipo,
                id: Date.now(),
                fechaCreacion: new Date().toISOString()
            };
            
            state.equipos.push(nuevoEquipo);
            guardarEnLocalStorage();
            console.log('✅ Equipo agregado');
            return state.equipos;
            
        } catch (error) {
            console.error('❌ Error agregando equipo:', error);
            return state.equipos || [];
        }
    }

    /**
     * Obtiene todos los equipos
     */
    function getEquipos() {
        if (!state.equipos) state.equipos = [];
        return state.equipos;
    }

    /**
     * Actualiza un equipo existente
     */
    function actualizarEquipo(index, equipo) {
        try {
            if (!state.equipos) state.equipos = [];
            
            if (index >= 0 && index < state.equipos.length) {
                state.equipos[index] = { 
                    ...state.equipos[index], 
                    ...equipo,
                    fechaModificacion: new Date().toISOString()
                };
                guardarEnLocalStorage();
                console.log('✅ Equipo actualizado');
                return true;
            }
            return false;
            
        } catch (error) {
            console.error('❌ Error actualizando equipo:', error);
            return false;
        }
    }

    /**
     * Elimina un equipo por índice
     */
    function eliminarEquipo(index) {
        try {
            if (!state.equipos) state.equipos = [];
            
            if (index >= 0 && index < state.equipos.length) {
                state.equipos.splice(index, 1);
                guardarEnLocalStorage();
                console.log('✅ Equipo eliminado');
                return true;
            }
            return false;
            
        } catch (error) {
            console.error('❌ Error eliminando equipo:', error);
            return false;
        }
    }

    // ===== FUNCIONES DE SILLAS =====
    
    /**
     * Configura las sillas para un curso
     */
    function configurarSillas(numeroSillas, curso) {
        try {
            if (!numeroSillas) return [];
            
            if (!state.sillas) state.sillas = [];
            
            // Obtener sillas existentes del curso
            const sillasCurso = state.sillas.filter(s => s.curso === curso);
            
            // Determinar el último número de silla
            let ultimoNumero = 0;
            if (sillasCurso.length > 0) {
                ultimoNumero = Math.max(...sillasCurso.map(s => s.numero || 0));
            }
            
            // Crear nuevas sillas
            const nuevasSillas = Array(parseInt(numeroSillas)).fill().map((_, index) => ({
                id: `silla_${Date.now()}_${index}`,
                numero: ultimoNumero + index + 1,
                serial: `SILLA-${curso}-${String(ultimoNumero + index + 1).padStart(3, '0')}`,
                curso: curso,
                estudiante: '',
                documento: '',
                nombreEstudiante: '',
                estado: 'Bueno',
                observaciones: ''
            }));
            
            // Agregar nuevas sillas
            state.sillas = [...state.sillas, ...nuevasSillas];
            
            guardarEnLocalStorage();
            console.log(`✅ ${nuevasSillas.length} sillas creadas para el curso ${curso}`);
            return state.sillas;
            
        } catch (error) {
            console.error('❌ Error configurando sillas:', error);
            return state.sillas || [];
        }
    }

    /**
     * Obtiene todas las sillas
     */
    function getSillas() {
        if (!state.sillas) state.sillas = [];
        return state.sillas;
    }

    /**
     * Obtiene sillas filtradas por curso
     */
    function getSillasPorCurso(curso) {
        if (!state.sillas) return [];
        return state.sillas.filter(s => s.curso === curso);
    }

    /**
     * Obtiene las sillas asignadas en un curso
     */
    function getSillasAsignadas(curso) {
        const sillas = getSillasPorCurso(curso);
        return sillas.filter(s => s.documento);
    }

    /**
     * Obtiene estudiantes sin silla asignada
     */
    function getEstudiantesSinSilla(estudiantes, curso) {
        if (!state.sillas) return estudiantes;
        
        const sillasOcupadas = state.sillas
            .filter(s => s.curso === curso && s.documento)
            .map(s => s.documento);
        
        return estudiantes.filter(e => !sillasOcupadas.includes(e.documento));
    }

    /**
     * Asigna un estudiante a una silla
     */
    function asignarSilla(sillaIndex, documento, nombreEstudiante) {
        try {
            if (!state.sillas || !state.sillas[sillaIndex]) return false;
            
            const silla = state.sillas[sillaIndex];
            
            // Verificar si el estudiante ya tiene una silla en este curso
            const sillaExistente = state.sillas.find(
                s => s.curso === silla.curso && 
                s.documento === documento && 
                s.documento
            );
            
            if (sillaExistente) {
                console.warn('⚠️ El estudiante ya tiene una silla asignada en este curso');
                return false;
            }
            
            // Asignar estudiante a la silla
            state.sillas[sillaIndex].documento = documento;
            state.sillas[sillaIndex].nombreEstudiante = nombreEstudiante;
            state.sillas[sillaIndex].estudiante = nombreEstudiante;
            
            guardarEnLocalStorage();
            console.log('✅ Estudiante asignado a silla');
            return true;
            
        } catch (error) {
            console.error('❌ Error asignando silla:', error);
            return false;
        }
    }

    /**
     * Desasigna un estudiante de una silla
     */
    function desasignarSilla(sillaIndex) {
        try {
            if (!state.sillas || !state.sillas[sillaIndex]) return false;
            
            state.sillas[sillaIndex].documento = '';
            state.sillas[sillaIndex].nombreEstudiante = '';
            state.sillas[sillaIndex].estudiante = '';
            
            guardarEnLocalStorage();
            console.log('✅ Silla desasignada');
            return true;
            
        } catch (error) {
            console.error('❌ Error desasignando silla:', error);
            return false;
        }
    }

    /**
     * Actualiza los datos de una silla
     */
    function actualizarSilla(index, data) {
        try {
            if (!state.sillas) state.sillas = [];
            
            if (index >= 0 && index < state.sillas.length) {
                state.sillas[index] = { ...state.sillas[index], ...data };
                guardarEnLocalStorage();
                console.log('✅ Silla actualizada');
                return true;
            }
            return false;
            
        } catch (error) {
            console.error('❌ Error actualizando silla:', error);
            return false;
        }
    }

    /**
     * Obtiene estadísticas de sillas por curso
     */
    function getEstadisticasSillas(curso) {
        const sillas = getSillasPorCurso(curso);
        
        return {
            total: sillas.length,
            ocupadas: sillas.filter(s => s.documento).length,
            disponibles: sillas.filter(s => !s.documento).length,
            excelente: sillas.filter(s => s.estado === 'Excelente').length,
            bueno: sillas.filter(s => s.estado === 'Bueno').length,
            regular: sillas.filter(s => s.estado === 'Regular').length,
            malo: sillas.filter(s => s.estado === 'Malo').length
        };
    }

    // ===== FUNCIONES DE ASISTENCIA =====
    
    /**
     * Guarda un registro de asistencia
     */
    function guardarAsistencia(curso, fecha, registros) {
        try {
            if (!state.asistencia) state.asistencia = [];
            
            // Buscar si ya existe un registro para este curso y fecha
            const indexExistente = state.asistencia.findIndex(
                a => a.curso === curso && a.fecha === fecha
            );
            
            const nuevoRegistro = {
                id: Date.now(),
                curso: curso,
                fecha: fecha,
                registros: registros,
                fechaRegistro: new Date().toISOString()
            };
            
            if (indexExistente >= 0) {
                // Actualizar existente
                state.asistencia[indexExistente] = nuevoRegistro;
                console.log('✅ Asistencia actualizada');
            } else {
                // Agregar nuevo
                state.asistencia.push(nuevoRegistro);
                console.log('✅ Asistencia guardada');
            }
            
            guardarEnLocalStorage();
            return nuevoRegistro;
            
        } catch (error) {
            console.error('❌ Error guardando asistencia:', error);
            return null;
        }
    }

    /**
     * Obtiene un registro de asistencia por curso y fecha
     */
    function getAsistencia(curso, fecha) {
        if (!state.asistencia) return null;
        return state.asistencia.find(a => a.curso === curso && a.fecha === fecha);
    }

    /**
     * Obtiene todos los registros de asistencia
     */
    function getTodasAsistencias() {
        return state.asistencia || [];
    }

    // ===== FUNCIONES DE ESTUDIANTES =====
    
    /**
     * Carga los estudiantes desde el archivo JSON
     */
    async function cargarEstudiantes() {
        try {
            console.log('🔄 Cargando estudiantes...');
            const response = await fetch('data/estudiantes.json');
            
            if (!response.ok) {
                throw new Error(`Error HTTP: ${response.status}`);
            }
            
            const data = await response.json();
            console.log(`✅ ${data.estudiantes?.length || 0} estudiantes cargados`);
            return data.estudiantes || [];
            
        } catch (error) {
            console.error('❌ Error cargando estudiantes:', error);
            return [];
        }
    }

    /**
     * Obtiene estudiantes filtrados por curso
     */
    async function getEstudiantesPorCurso(numeroCurso) {
        try {
            const estudiantes = await cargarEstudiantes();
            return estudiantes.filter(e => e.numero_curso === numeroCurso);
        } catch (error) {
            console.error('❌ Error obteniendo estudiantes por curso:', error);
            return [];
        }
    }

    // ===== FUNCIONES DE EXPORTACIÓN/IMPORTACIÓN =====
    
    /**
     * Exporta todos los datos a un objeto
     */
    function exportarDatos() {
        try {
            const datosCompletos = {
                version: "0.4",
                fechaExportacion: new Date().toISOString(),
                responsables: state.responsables || [],
                puestosDocentes: state.puestosDocentes || [],
                mesas: state.mesas || [],
                equipos: state.equipos || [],
                sillas: state.sillas || [],
                asistencia: state.asistencia || []
            };
            
            console.log('✅ Datos exportados');
            return datosCompletos;
            
        } catch (error) {
            console.error('❌ Error exportando datos:', error);
            return null;
        }
    }

    /**
     * Importa datos desde un objeto
     */
    function importarDatos(datos) {
        try {
            if (!datos || typeof datos !== 'object') {
                throw new Error('Datos inválidos');
            }
            
            // Actualizar estado con los datos importados
            state = {
                cursos: state.cursos, // Mantener cursos base
                responsables: datos.responsables || [],
                puestosDocentes: datos.puestosDocentes || [],
                mesas: datos.mesas || [],
                equipos: datos.equipos || [],
                sillas: datos.sillas || [],
                asistencia: datos.asistencia || []
            };
            
            guardarEnLocalStorage();
            console.log('✅ Datos importados correctamente');
            return true;
            
        } catch (error) {
            console.error('❌ Error importando datos:', error);
            return false;
        }
    }

    /**
     * Limpia todos los datos (excepto cursos base)
     */
    function limpiarTodosLosDatos() {
        try {
            state = {
                cursos: state.cursos || [],
                responsables: [],
                puestosDocentes: [],
                mesas: [],
                equipos: [],
                sillas: [],
                asistencia: []
            };
            
            guardarEnLocalStorage();
            console.log('✅ Todos los datos han sido limpiados');
            return state;
            
        } catch (error) {
            console.error('❌ Error limpiando datos:', error);
            return state;
        }
    }

    // ===== FUNCIONES DE UTILIDADES =====
    
    /**
     * Guarda el estado en localStorage
     */
    function guardarEnLocalStorage() {
        try {
            localStorage.setItem('gestionSalones', JSON.stringify(state));
            console.log('💾 Datos guardados en localStorage');
        } catch (error) {
            console.error('❌ Error guardando en localStorage:', error);
        }
    }

    /**
     * Carga el estado desde localStorage
     */
    async function cargarDeLocalStorage() {
        try {
            console.log('🔄 Cargando datos desde localStorage...');
            
            // Primero cargar cursos base
            await cargarCursos();
            
            const saved = localStorage.getItem('gestionSalones');
            
            if (saved) {
                const parsed = JSON.parse(saved);
                
                // Actualizar estado con datos guardados
                state = {
                    ...state,
                    responsables: parsed.responsables || [],
                    puestosDocentes: parsed.puestosDocentes || [],
                    mesas: parsed.mesas || [],
                    equipos: parsed.equipos || [],
                    sillas: parsed.sillas || [],
                    asistencia: parsed.asistencia || []
                };
                
                console.log('✅ Datos cargados desde localStorage');
            } else {
                console.log('ℹ️ No hay datos guardados en localStorage');
            }
            
        } catch (error) {
            console.error('❌ Error cargando de localStorage:', error);
            // Asegurar estado base
            state = {
                cursos: state.cursos || [],
                responsables: [],
                puestosDocentes: [],
                mesas: [],
                equipos: [],
                sillas: [],
                asistencia: []
            };
        }
        
        return state;
    }

    /**
     * Obtiene el estado actual (solo para depuración)
     */
    function getState() {
        return state;
    }

    // ===== API PÚBLICA =====
    return {
        // Cursos
        cargarCursos,
        getCursos,
        
        // Responsables
        cargarResponsables,
        getResponsables,
        getResponsablesPorCurso,
        guardarResponsable,
        actualizarResponsable,
        eliminarResponsable,
        
        // Puestos Docentes
        agregarPuestoDocente,
        getPuestosDocentes,
        eliminarPuestoDocente,
        
        // Mesas
        configurarMesas,
        getMesas,
        getMesasPorCurso,
        getMesa,
        getPCsAsignados,
        actualizarPcEstudiante,
        verificarEstudianteEnPCs,
        
        // Equipos
        agregarEquipo,
        getEquipos,
        actualizarEquipo,
        eliminarEquipo,
        
        // Sillas
        configurarSillas,
        getSillas,
        getSillasPorCurso,
        getSillasAsignadas,
        getEstudiantesSinSilla,
        asignarSilla,
        desasignarSilla,
        actualizarSilla,
        getEstadisticasSillas,
        
        // Asistencia
        guardarAsistencia,
        getAsistencia,
        getTodasAsistencias,
        
        // Estudiantes
        cargarEstudiantes,
        getEstudiantesPorCurso,
        
        // Exportación/Importación
        exportarDatos,
        importarDatos,
        limpiarTodosLosDatos,
        
        // Utilidades
        guardarEnLocalStorage,
        cargarDeLocalStorage,
        getState
    };
})();

// Verificar que DataManager se cargó correctamente
if (typeof DataManager !== 'undefined') {
    console.log('✅ DataManager v0.4 cargado correctamente');
    console.log('📋 Funciones disponibles:', Object.keys(DataManager));
} else {
    console.error('❌ Error cargando DataManager');
}