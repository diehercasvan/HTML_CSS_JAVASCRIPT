// dataManager.js - Módulo para manejar datos y operaciones CRUD v0.6
// VERSIÓN COMPLETA Y CORREGIDA - CON TODAS LAS FUNCIONES EN ORDEN

console.log('🔄 Iniciando carga de dataManager.js...');

const DataManager = (function() {
    console.log('📦 Ejecutando IIFE de DataManager...');
    
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
    
    async function cargarCursos() {
        console.log('📚 DataManager.cargarCursos() llamado');
        try {
            const response = await fetch('data/cursos.json');
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            const data = await response.json();
            state.cursos = data.cursos || [];
            console.log(`✅ Cursos cargados: ${state.cursos.length}`);
            return state.cursos;
        } catch (error) {
            console.error('❌ Error cargando cursos:', error);
            state.cursos = [];
            return [];
        }
    }

    function getCursos() {
        return state.cursos || [];
    }

    // ===== FUNCIONES DE RESPONSABLES =====
    
    async function cargarResponsables() {
        console.log('👤 DataManager.cargarResponsables() llamado');
        try {
            const response = await fetch('data/responsables.json');
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            const data = await response.json();
            const responsables = data.responsables || [];
            console.log(`✅ Responsables cargados: ${responsables.length}`);
            return responsables;
        } catch (error) {
            console.error('❌ Error cargando responsables:', error);
            return [];
        }
    }

    function getResponsables() {
        return state.responsables || [];
    }

    function getResponsablesPorCurso(numeroCurso) {
        if (!state.responsables) return [];
        return state.responsables.filter(r => r.numeroCurso === numeroCurso);
    }

    function guardarResponsable(data) {
        try {
            if (!state.responsables) state.responsables = [];
            
            const nuevoResponsable = {
                ...data,
                numeroCurso: data.numeroCurso,
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

    function actualizarResponsable(index, data) {
        try {
            if (!state.responsables) state.responsables = [];
            
            if (index >= 0 && index < state.responsables.length) {
                state.responsables[index] = { 
                    ...state.responsables[index], 
                    ...data,
                    numeroCurso: data.numeroCurso || state.responsables[index].numeroCurso,
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

    function getPuestosDocentes() {
        return state.puestosDocentes || [];
    }

    function eliminarPuestoDocente(index) {
        try {
            if (!state.puestosDocentes) state.puestosDocentes = [];
            
            if (index >= 0 && index < state.puestosDocentes.length) {
                state.puestosDocentes.splice(index, 1);
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

    // ===== FUNCIONES DE EQUIPOS =====
    
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
            console.log('✅ Equipo agregado:', nuevoEquipo);
            return state.equipos;
            
        } catch (error) {
            console.error('❌ Error agregando equipo:', error);
            return state.equipos || [];
        }
    }

    function getEquipos() {
        return state.equipos || [];
    }

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
                console.log('✅ Equipo actualizado:', state.equipos[index]);
                return true;
            }
            return false;
            
        } catch (error) {
            console.error('❌ Error actualizando equipo:', error);
            return false;
        }
    }

    function eliminarEquipo(index) {
        try {
            if (!state.equipos) state.equipos = [];
            
            if (index >= 0 && index < state.equipos.length) {
                state.equipos.splice(index, 1);
                guardarEnLocalStorage();
                console.log('✅ Equipo eliminado:', index);
                return true;
            }
            return false;
            
        } catch (error) {
            console.error('❌ Error eliminando equipo:', error);
            return false;
        }
    }

    // ===== FUNCIONES DE ESTUDIANTES =====
    
    async function cargarEstudiantes() {
        console.log('👨‍🎓 DataManager.cargarEstudiantes() llamado');
        try {
            const response = await fetch('data/estudiantes.json');
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            const data = await response.json();
            const estudiantes = data.estudiantes || [];
            console.log(`✅ Estudiantes cargados: ${estudiantes.length}`);
            return estudiantes;
        } catch (error) {
            console.error('❌ Error cargando estudiantes:', error);
            return [];
        }
    }

    async function getEstudiantesPorCurso(numeroCurso) {
        console.log(`🔍 Buscando estudiantes para curso ${numeroCurso}`);
        try {
            const estudiantes = await cargarEstudiantes();
            const filtrados = estudiantes.filter(e => String(e.numeroCurso) === String(numeroCurso));
            console.log(`✅ Encontrados: ${filtrados.length}`);
            return filtrados;
        } catch (error) {
            console.error('❌ Error obteniendo estudiantes:', error);
            return [];
        }
    }

    // ===== FUNCIONES DE MESAS =====
    
    function configurarMesas(filas, columnas, pcsPorMesa, curso) {
        try {
            // Limpiar mesas existentes del mismo curso
            if (state.mesas) {
                state.mesas = state.mesas.filter(m => m.curso !== curso);
            }
            
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
                        excelente: 0,
                        bueno: pcs.length,
                        regular: 0,
                        danado: 0,
                        asignados: 0
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
            
            state.mesas = [...(state.mesas || []), ...mesas];
            guardarEnLocalStorage();
            console.log(`✅ ${mesas.length} mesas creadas para curso ${curso}`);
            return state.mesas;
            
        } catch (error) {
            console.error('❌ Error configurando mesas:', error);
            return state.mesas || [];
        }
    }

    function getMesas() {
        return state.mesas || [];
    }

    function getMesasPorCurso(curso) {
        if (!state.mesas) return [];
        return state.mesas.filter(m => m.curso === curso);
    }

    function getMesa(mesaId) {
        if (!state.mesas) return null;
        return state.mesas.find(m => m.id === mesaId);
    }

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

    // ===== FUNCIONES AUXILIARES PARA MESAS (ORDEN CRÍTICO) =====
    
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
        
        console.log(`📊 Estadísticas actualizadas para mesa ${mesa.fila+1}-${mesa.columna+1}:`, mesa.stats);
    }

    /**
     * Verifica si un estudiante ya tiene un PC asignado en un curso
     */
    function verificarEstudianteEnPCs(documento, curso) {
        console.log(`🔍 Verificando estudiante ${documento} en curso ${curso}...`);
        
        if (!state.mesas) {
            console.log('📭 No hay mesas en el estado');
            return false;
        }
        
        const mesas = state.mesas.filter(m => m.curso === curso);
        console.log(`📊 ${mesas.length} mesas encontradas para curso ${curso}`);
        
        for (const mesa of mesas) {
            for (const pc of mesa.pcs) {
                if (pc.documento === documento) {
                    console.log(`✅ Estudiante encontrado en mesa ${mesa.fila+1}-${mesa.columna+1}, PC ${pc.serial}`);
                    return true;
                }
            }
        }
        
        console.log(`✅ Estudiante ${documento} NO tiene PC asignado en este curso`);
        return false;
    }

    /**
     * Actualiza los datos de un PC específico
     */
    function actualizarPcEstudiante(mesaId, pcIndex, data) {
        console.log('🔄 actualizarPcEstudiante llamado:', { mesaId, pcIndex, data });
        
        try {
            if (!state.mesas) {
                console.error('❌ No hay mesas en el estado');
                return false;
            }
            
            const mesa = state.mesas.find(m => m.id === mesaId);
            if (!mesa) {
                console.error('❌ Mesa no encontrada:', mesaId);
                return false;
            }
            
            if (!mesa.pcs || !mesa.pcs[pcIndex]) {
                console.error('❌ PC no encontrado en la mesa');
                return false;
            }
            
            const pcActual = mesa.pcs[pcIndex];
            
            // Verificar si el estudiante ya está asignado a otro PC
            if (data.documento && data.documento !== pcActual.documento) {
                console.log(`🔍 Verificando si estudiante ${data.documento} ya tiene PC...`);
                const documentoExistente = verificarEstudianteEnPCs(data.documento, mesa.curso);
                
                if (documentoExistente) {
                    console.warn('⚠️ Estudiante ya tiene un PC asignado');
                    return false;
                }
            }
            
            // Si el estudiante actual tiene documento y el nuevo no, es una desasignación
            if (pcActual.documento && !data.documento) {
                console.log(`🔄 Desasignando estudiante ${pcActual.documento} del PC`);
            }
            
            // Actualizar el PC
            mesa.pcs[pcIndex] = { ...pcActual, ...data };
            console.log(`✅ PC actualizado:`, mesa.pcs[pcIndex]);
            
            // Actualizar estadísticas de la mesa
            actualizarEstadisticasMesa(mesa);
            
            guardarEnLocalStorage();
            console.log('✅ Cambios guardados en localStorage');
            return true;
            
        } catch (error) {
            console.error('❌ Error actualizando PC:', error);
            return false;
        }
    }

    // ===== FUNCIONES DE SILLAS =====
    
    function configurarSillas(numeroSillas, curso) {
        try {
            if (!numeroSillas) return [];
            
            // Limpiar sillas existentes del mismo curso
            if (state.sillas) {
                state.sillas = state.sillas.filter(s => s.curso !== curso);
            }
            
            const nuevasSillas = Array(parseInt(numeroSillas)).fill().map((_, index) => ({
                id: `silla_${Date.now()}_${index}`,
                numero: index + 1,
                serial: `SILLA-${curso}-${String(index + 1).padStart(3, '0')}`,
                curso: curso,
                estudiante: '',
                documento: '',
                nombreEstudiante: '',
                estado: 'Bueno',
                observaciones: ''
            }));
            
            state.sillas = [...(state.sillas || []), ...nuevasSillas];
            guardarEnLocalStorage();
            console.log(`✅ ${nuevasSillas.length} sillas creadas para el curso ${curso}`);
            return state.sillas;
            
        } catch (error) {
            console.error('❌ Error configurando sillas:', error);
            return state.sillas || [];
        }
    }

    function getSillas() {
        return state.sillas || [];
    }

    function getSillasPorCurso(curso) {
        if (!state.sillas) return [];
        return state.sillas.filter(s => s.curso === curso);
    }

    function getSillasAsignadas(curso) {
        const sillas = getSillasPorCurso(curso);
        return sillas.filter(s => s.documento);
    }

    function getEstudiantesSinSilla(estudiantes, curso) {
        if (!state.sillas) return estudiantes;
        
        const sillasOcupadas = state.sillas
            .filter(s => s.curso === curso && s.documento)
            .map(s => s.documento);
        
        return estudiantes.filter(e => !sillasOcupadas.includes(e.documento));
    }

    function asignarSilla(sillaIndex, documento, nombreEstudiante) {
        try {
            if (!state.sillas || !state.sillas[sillaIndex]) return false;
            
            const silla = state.sillas[sillaIndex];
            
            const sillaExistente = state.sillas.find(
                s => s.curso === silla.curso && 
                s.documento === documento && 
                s.documento
            );
            
            if (sillaExistente) {
                console.warn('⚠️ El estudiante ya tiene una silla asignada en este curso');
                return false;
            }
            
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
    
    function guardarAsistencia(curso, fecha, registros) {
        try {
            if (!state.asistencia) state.asistencia = [];
            
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
                state.asistencia[indexExistente] = nuevoRegistro;
                console.log('✅ Asistencia actualizada');
            } else {
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

    function getAsistencia(curso, fecha) {
        if (!state.asistencia) return null;
        return state.asistencia.find(a => a.curso === curso && a.fecha === fecha);
    }

    function getTodasAsistencias() {
        return state.asistencia || [];
    }

    // ===== FUNCIONES DE LIMPIEZA POR CURSO =====
    
    function limpiarDatosPorCurso(curso) {
        try {
            console.log(`🔄 Limpiando datos del curso ${curso}...`);
            
            if (state.mesas) {
                state.mesas = state.mesas.filter(m => m.curso !== curso);
            }
            
            if (state.sillas) {
                state.sillas = state.sillas.filter(s => s.curso !== curso);
            }
            
            guardarEnLocalStorage();
            console.log(`✅ Datos del curso ${curso} limpiados`);
            return true;
            
        } catch (error) {
            console.error('❌ Error limpiando datos por curso:', error);
            return false;
        }
    }

    function getDatosPorCurso(curso) {
        return {
            mesas: (state.mesas || []).filter(m => m.curso === curso),
            sillas: (state.sillas || []).filter(s => s.curso === curso),
            responsables: state.responsables || [],
            puestosDocentes: state.puestosDocentes || [],
            equipos: state.equipos || [],
            asistencia: (state.asistencia || []).filter(a => a.curso === curso)
        };
    }

    function hayDatosDeOtroCurso(cursoActual) {
        const otrosCursos = {
            mesas: (state.mesas || []).some(m => m.curso && m.curso !== cursoActual),
            sillas: (state.sillas || []).some(s => s.curso && s.curso !== cursoActual)
        };
        
        return otrosCursos.mesas || otrosCursos.sillas;
    }

    // ===== FUNCIONES DE LOCALSTORAGE =====
    
    function guardarEnLocalStorage() {
        try {
            localStorage.setItem('gestionSalones', JSON.stringify(state));
            console.log('💾 Datos guardados en localStorage');
        } catch (error) {
            console.error('❌ Error guardando en localStorage:', error);
        }
    }

    async function cargarDeLocalStorage() {
        try {
            console.log('🔄 Cargando datos desde localStorage...');
            
            await cargarCursos();
            
            const saved = localStorage.getItem('gestionSalones');
            
            if (saved) {
                const parsed = JSON.parse(saved);
                
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
        }
        return state;
    }

    function getState() {
        return state;
    }

    // ===== FUNCIONES DE EXPORTACIÓN/IMPORTACIÓN =====
    
    function exportarDatos() {
        try {
            const datosCompletos = {
                version: "0.6",
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

    function importarDatos(datos) {
        try {
            if (!datos || typeof datos !== 'object') {
                throw new Error('Datos inválidos');
            }
            
            state = {
                cursos: state.cursos,
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

    // ===== FUNCIONES DE HISTÓRICO =====

    function guardarSnapshot() {
        try {
            const snapshot = {
                id: Date.now(),
                fecha: new Date().toISOString().split('T')[0],
                hora: new Date().toLocaleTimeString(),
                datos: {
                    responsables: state.responsables || [],
                    puestosDocentes: state.puestosDocentes || [],
                    mesas: state.mesas || [],
                    equipos: state.equipos || [],
                    sillas: state.sillas || [],
                    asistencia: state.asistencia || []
                }
            };

            let historial = [];
            try {
                const saved = localStorage.getItem('gestionSalonesHistorial');
                historial = saved ? JSON.parse(saved) : [];
            } catch (e) {
                historial = [];
            }

            historial.push(snapshot);
            
            if (historial.length > 50) {
                historial = historial.slice(-50);
            }

            localStorage.setItem('gestionSalonesHistorial', JSON.stringify(historial));
            console.log(`✅ Snapshot guardado: ${snapshot.fecha} ${snapshot.hora}`);
            return snapshot;
            
        } catch (error) {
            console.error('❌ Error guardando snapshot:', error);
            return null;
        }
    }

    function getHistorial() {
        try {
            const saved = localStorage.getItem('gestionSalonesHistorial');
            return saved ? JSON.parse(saved) : [];
        } catch (error) {
            console.error('❌ Error cargando historial:', error);
            return [];
        }
    }

    function cargarSnapshot(id) {
        try {
            const historial = getHistorial();
            const snapshot = historial.find(h => h.id === id);
            
            if (snapshot) {
                state = {
                    cursos: state.cursos,
                    responsables: snapshot.datos.responsables || [],
                    puestosDocentes: snapshot.datos.puestosDocentes || [],
                    mesas: snapshot.datos.mesas || [],
                    equipos: snapshot.datos.equipos || [],
                    sillas: snapshot.datos.sillas || [],
                    asistencia: snapshot.datos.asistencia || []
                };
                guardarEnLocalStorage();
                console.log(`✅ Snapshot cargado: ${snapshot.fecha}`);
                return true;
            }
            return false;
            
        } catch (error) {
            console.error('❌ Error cargando snapshot:', error);
            return false;
        }
    }

    function exportarHistorialCompleto() {
        try {
            const historial = getHistorial();
            const datosCompletos = {
                version: "0.6",
                fechaExportacion: new Date().toISOString(),
                historial: historial,
                datosActuales: {
                    responsables: state.responsables || [],
                    puestosDocentes: state.puestosDocentes || [],
                    mesas: state.mesas || [],
                    equipos: state.equipos || [],
                    sillas: state.sillas || [],
                    asistencia: state.asistencia || []
                }
            };
            return datosCompletos;
            
        } catch (error) {
            console.error('❌ Error exportando historial:', error);
            return null;
        }
    }

    // ===== API PÚBLICA =====
    const api = {
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
        
        // Equipos
        agregarEquipo,
        getEquipos,
        actualizarEquipo,
        eliminarEquipo,
        
        // Estudiantes
        cargarEstudiantes,
        getEstudiantesPorCurso,
        
        // Mesas
        configurarMesas,
        getMesas,
        getMesasPorCurso,
        getMesa,
        getPCsAsignados,
        actualizarPcEstudiante,
        
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
        
        // Limpieza por curso
        limpiarDatosPorCurso,
        getDatosPorCurso,
        hayDatosDeOtroCurso,
        
        // Exportación/Importación
        exportarDatos,
        importarDatos,
        limpiarTodosLosDatos,
        
        // Historial
        guardarSnapshot,
        getHistorial,
        cargarSnapshot,
        exportarHistorialCompleto,
        
        // Utilidades
        guardarEnLocalStorage,
        cargarDeLocalStorage,
        getState
    };

    console.log('✅ DataManager: API creada con', Object.keys(api).length, 'funciones');
    return api;
})();

// Verificación final
if (typeof DataManager !== 'undefined') {
    console.log('✅ DataManager v0.6 cargado correctamente');
    console.log('📋 Funciones principales:');
    console.log('- actualizarPcEstudiante:', typeof DataManager.actualizarPcEstudiante);
    console.log('- verificarEstudianteEnPCs:', typeof DataManager.verificarEstudianteEnPCs);
} else {
    console.error('❌ Error cargando DataManager');
}

// Exponer globalmente
window.DataManager = DataManager;