// js/modules/asistencia/asistenciaData.js
// Versión 2.1 - COMPLETA - CON IMPORTAR ASISTENCIAS

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
                console.log('✅ Nueva asistencia agregada');
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
            
            // Intentar desde DataManager
            if (typeof DataManager !== 'undefined') {
                if (typeof DataManager.getTodasAsistencias === 'function') {
                    asistencias = DataManager.getTodasAsistencias() || [];
                }
            }
            
            // Si no hay, buscar en localStorage
            if (asistencias.length === 0) {
                const saved = localStorage.getItem('gestionSalones');
                if (saved) {
                    try {
                        const parsed = JSON.parse(saved);
                        asistencias = parsed.asistencia || [];
                    } catch (e) {
                        console.error('Error parsing gestionSalones:', e);
                    }
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
            // Guardar en DataManager si existe
            if (typeof DataManager !== 'undefined') {
                if (typeof DataManager.guardarTodasAsistencias === 'function') {
                    DataManager.guardarTodasAsistencias(asistencias);
                }
            }
            
            // Guardar en localStorage
            const saved = localStorage.getItem('gestionSalones');
            let datos = saved ? JSON.parse(saved) : {};
            datos.asistencia = asistencias;
            localStorage.setItem('gestionSalones', JSON.stringify(datos));
            
            console.log(`✅ ${asistencias.length} asistencias guardadas`);
            return true;
            
        } catch (error) {
            console.error('❌ Error guardando en storage:', error);
            return false;
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
     * Limpia todas las asistencias (con backup)
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
                                version: "2.1",
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
     * Exporta asistencias a JSON
     */
    function exportarAsistencias(asistencias = null) {
        const datosAExportar = asistencias || obtenerTodasAsistencias();
        
        if (!datosAExportar || datosAExportar.length === 0) {
            Swal.fire({
                icon: 'info',
                title: 'Sin datos',
                text: 'No hay asistencias para exportar'
            });
            return null;
        }
        
        const datos = {
            version: "2.1",
            fechaExportacion: new Date().toISOString(),
            totalRegistros: datosAExportar.length,
            asistencias: datosAExportar
        };
        
        const blob = new Blob([JSON.stringify(datos, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `asistencias-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        Swal.fire({
            icon: 'success',
            title: 'Exportado',
            text: `${datosAExportar.length} registros exportados`,
            timer: 2000,
            showConfirmButton: false
        });
        
        return datos;
    }

    /**
     * NUEVA FUNCIÓN: Importa asistencias desde un archivo JSON
     */
    function importarAsistencias(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            
            reader.onload = function(e) {
                try {
                    const datos = JSON.parse(e.target.result);
                    
                    // Validar estructura del archivo
                    if (!datos.asistencias || !Array.isArray(datos.asistencias)) {
                        reject(new Error('El archivo no tiene el formato correcto'));
                        return;
                    }
                    
                    // Obtener asistencias actuales
                    let asistenciasActuales = obtenerTodasAsistencias();
                    let contadorNuevas = 0;
                    let contadorActualizadas = 0;
                    
                    // Procesar cada asistencia del archivo
                    datos.asistencias.forEach(nuevaAsistencia => {
                        // Buscar si ya existe (mismo curso y misma fecha)
                        const index = asistenciasActuales.findIndex(
                            a => a.curso === nuevaAsistencia.curso && a.fecha === nuevaAsistencia.fecha
                        );
                        
                        if (index >= 0) {
                            // Actualizar existente
                            asistenciasActuales[index] = {
                                ...nuevaAsistencia,
                                id: asistenciasActuales[index].id, // Mantener el ID original
                                fechaImportacion: new Date().toISOString()
                            };
                            contadorActualizadas++;
                        } else {
                            // Agregar nueva
                            asistenciasActuales.push({
                                ...nuevaAsistencia,
                                id: Date.now() + contadorNuevas, // ID único
                                fechaImportacion: new Date().toISOString()
                            });
                            contadorNuevas++;
                        }
                    });
                    
                    // Guardar todas las asistencias
                    guardarEnStorage(asistenciasActuales);
                    
                    Swal.fire({
                        icon: 'success',
                        title: 'Importación completada',
                        html: `
                            <p>✅ Nuevas: ${contadorNuevas}</p>
                            <p>🔄 Actualizadas: ${contadorActualizadas}</p>
                            <p>📊 Total: ${asistenciasActuales.length}</p>
                        `,
                        timer: 3000,
                        showConfirmButton: false
                    });
                    
                    resolve(asistenciasActuales);
                    
                } catch (error) {
                    reject(new Error('Error al procesar el archivo: ' + error.message));
                }
            };
            
            reader.onerror = () => reject(new Error('Error al leer el archivo'));
            reader.readAsText(file);
        });
    }

    /**
     * Obtiene el docente actual
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
        exportarAsistencias,
        importarAsistencias,  // ← NUEVA FUNCIÓN AGREGADA
        obtenerDocenteActual
    };
})();

console.log('✅ Módulo AsistenciaData v2.1 cargado');
window.AsistenciaData = AsistenciaData;