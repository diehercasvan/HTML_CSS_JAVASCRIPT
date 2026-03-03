// asistenciaData.js - Módulo para gestionar datos de asistencia
// Versión 0.8 - COMPLETO

console.log('🔄 Cargando módulo asistenciaData.js...');

const AsistenciaData = (function() {
    
    /**
     * Guarda la asistencia de un día específico
     */
    function guardarAsistencia(curso, fecha, registros) {
        try {
            console.log(`💾 Guardando asistencia para curso ${curso}, fecha ${fecha}`);
            
            let asistencias = obtenerTodasAsistencias();
            
            const index = asistencias.findIndex(a => a.curso === curso && a.fecha === fecha);
            
            const nuevoRegistro = {
                id: Date.now(),
                curso: curso,
                fecha: fecha,
                registros: registros,
                fechaRegistro: new Date().toISOString(),
                docente: obtenerDocenteActual(curso)
            };
            
            if (index >= 0) {
                asistencias[index] = nuevoRegistro;
                console.log('✅ Asistencia actualizada');
            } else {
                asistencias.push(nuevoRegistro);
                console.log('✅ Asistencia guardada');
            }
            
            guardarEnStorage(asistencias);
            return nuevoRegistro;
            
        } catch (error) {
            console.error('❌ Error guardando asistencia:', error);
            return null;
        }
    }

    /**
     * Obtiene todas las asistencias guardadas
     */
    function obtenerTodasAsistencias() {
        try {
            let asistencias = [];
            
            // Intentar de DataManager
            if (typeof DataManager !== 'undefined' && DataManager.getTodasAsistencias) {
                asistencias = DataManager.getTodasAsistencias() || [];
            }
            
            // Si no hay, buscar en localStorage
            if (asistencias.length === 0) {
                const saved = localStorage.getItem('gestionSalones');
                if (saved) {
                    const parsed = JSON.parse(saved);
                    asistencias = parsed.asistencia || [];
                }
            }
            
            return asistencias;
            
        } catch (error) {
            console.error('❌ Error obteniendo asistencias:', error);
            return [];
        }
    }

    /**
     * Guarda las asistencias en storage
     */
    function guardarEnStorage(asistencias) {
        try {
            if (typeof DataManager !== 'undefined') {
                // Intentar guardar en DataManager
                if (DataManager.guardarTodasAsistencias) {
                    DataManager.guardarTodasAsistencias(asistencias);
                } else {
                    // Fallback: guardar en localStorage directamente
                    const saved = localStorage.getItem('gestionSalones');
                    let datos = saved ? JSON.parse(saved) : {};
                    datos.asistencia = asistencias;
                    localStorage.setItem('gestionSalones', JSON.stringify(datos));
                }
            }
            console.log(`✅ ${asistencias.length} asistencias guardadas`);
            
        } catch (error) {
            console.error('❌ Error guardando en storage:', error);
        }
    }

    /**
     * Obtiene asistencia por curso y fecha
     */
    function obtenerAsistencia(curso, fecha) {
        const asistencias = obtenerTodasAsistencias();
        return asistencias.find(a => a.curso === curso && a.fecha === fecha);
    }

    /**
     * Filtra asistencias por criterios
     */
    function filtrarAsistencias(curso = null, fechaInicio = null, fechaFin = null) {
        let asistencias = obtenerTodasAsistencias();
        
        if (curso) {
            asistencias = asistencias.filter(a => a.curso === curso);
        }
        
        if (fechaInicio) {
            asistencias = asistencias.filter(a => a.fecha >= fechaInicio);
        }
        
        if (fechaFin) {
            asistencias = asistencias.filter(a => a.fecha <= fechaFin);
        }
        
        return asistencias.sort((a, b) => b.fecha.localeCompare(a.fecha));
    }

    /**
     * Elimina una asistencia específica
     */
    function eliminarAsistencia(id) {
        try {
            let asistencias = obtenerTodasAsistencias();
            const nuevaLista = asistencias.filter(a => a.id !== id);
            
            if (nuevaLista.length !== asistencias.length) {
                guardarEnStorage(nuevaLista);
                console.log('✅ Asistencia eliminada');
                return true;
            }
            return false;
            
        } catch (error) {
            console.error('❌ Error eliminando asistencia:', error);
            return false;
        }
    }

    /**
     * Limpia todas las asistencias (con backup opcional)
     */
    function limpiarTodasAsistencias(crearBackup = true) {
        return new Promise((resolve) => {
            Swal.fire({
                title: '¿Limpiar todas las asistencias?',
                html: crearBackup ? 
                    '<p>Se creará un archivo de respaldo antes de limpiar.</p>' :
                    '<p class="text-danger">Esta acción no se puede deshacer.</p>',
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#d33',
                cancelButtonColor: '#3085d6',
                confirmButtonText: 'Sí, limpiar',
                cancelButtonText: 'Cancelar'
            }).then((result) => {
                if (result.isConfirmed) {
                    if (crearBackup) {
                        const asistencias = obtenerTodasAsistencias();
                        if (asistencias.length > 0) {
                            const backup = {
                                version: "0.8",
                                fecha: new Date().toISOString(),
                                tipo: "backup_asistencias",
                                asistencias: asistencias
                            };
                            
                            const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
                            const url = URL.createObjectURL(blob);
                            const a = document.createElement('a');
                            a.href = url;
                            a.download = `backup-asistencias-${new Date().toISOString().split('T')[0]}.json`;
                            document.body.appendChild(a);
                            a.click();
                            document.body.removeChild(a);
                            URL.revokeObjectURL(url);
                        }
                    }
                    
                    guardarEnStorage([]);
                    
                    Swal.fire({
                        icon: 'success',
                        title: 'Asistencias limpiadas',
                        text: 'Todas las asistencias han sido eliminadas',
                        timer: 2000,
                        showConfirmButton: false
                    });
                    
                    resolve(true);
                } else {
                    resolve(false);
                }
            });
        });
    }

    /**
     * Exporta asistencias seleccionadas para unificación
     */
    function exportarParaUnificar(asistencias) {
        if (!asistencias || asistencias.length === 0) {
            Swal.fire({
                icon: 'warning',
                title: 'Sin datos',
                text: 'No hay asistencias para exportar'
            });
            return null;
        }
        
        const datos = {
            version: "0.8",
            tipo: "exportacion_unificacion",
            fechaExportacion: new Date().toISOString(),
            totalRegistros: asistencias.length,
            asistencias: asistencias
        };
        
        const blob = new Blob([JSON.stringify(datos, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `asistencias-para-unificar-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        return datos;
    }

    /**
     * Obtiene el docente actual desde el responsable del curso
     */
    function obtenerDocenteActual(curso) {
        if (!curso) return null;
        
        const responsables = typeof DataManager !== 'undefined' ? 
            DataManager.getResponsables?.() || [] : [];
        
        const docente = responsables.find(r => r.numeroCurso === curso);
        
        return docente ? {
            documento: docente.documento,
            nombre: docente.nombre,
            materia: docente.materia || 'No especificada'
        } : null;
    }

    // API pública
    return {
        guardarAsistencia,
        obtenerTodasAsistencias,
        obtenerAsistencia,
        filtrarAsistencias,
        eliminarAsistencia,
        limpiarTodasAsistencias,
        exportarParaUnificar,
        obtenerDocenteActual
    };
})();

console.log('✅ Módulo AsistenciaData cargado');
window.AsistenciaData = AsistenciaData;