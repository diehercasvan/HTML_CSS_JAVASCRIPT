// js/modules/asistencia/asistenciaData.js
// Versión 3.1 - CON MIGRACIÓN AUTOMÁTICA DE HORARIOS

console.log('🔄 Cargando módulo asistenciaData.js...');

const AsistenciaData = (function () {

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
  * Guarda las asistencias en storage (VERSIÓN MEJORADA)
  */
    function guardarEnStorage(asistencias) {
        try {
            console.log(`💾 Guardando ${asistencias.length} asistencias en storage...`);

            // 1. Guardar en DataManager si existe
            if (typeof DataManager !== 'undefined') {
                if (typeof DataManager.guardarTodasAsistencias === 'function') {
                    DataManager.guardarTodasAsistencias(asistencias);
                    console.log('✅ Guardado en DataManager');
                }
            }

            // 2. Guardar en localStorage (gestionSalones)
            const saved = localStorage.getItem('gestionSalones');
            let datos = saved ? JSON.parse(saved) : {};
            datos.asistencia = asistencias;
            localStorage.setItem('gestionSalones', JSON.stringify(datos));
            console.log(`✅ Guardado en localStorage (gestionSalones): ${asistencias.length} asistencias`);

            // 3. También guardar una copia de respaldo en una clave específica
            localStorage.setItem('asistenciaData', JSON.stringify(asistencias));

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
            console.log(`🗑️ Eliminando asistencia con ID: ${id} (tipo: ${typeof id})`);
            let asistencias = obtenerTodasAsistencias();
            console.log(`📊 Antes de eliminar: ${asistencias.length} asistencias`);

            const longitudInicial = asistencias.length;

            // Convertir ID a número para comparación segura
            const idNum = parseInt(id);
            const nuevaLista = asistencias.filter(a => a.id != idNum && a.id != id);

            console.log(`📊 Después de filtrar: ${nuevaLista.length} asistencias`);

            if (nuevaLista.length < longitudInicial) {
                guardarEnStorage(nuevaLista);
                console.log(`✅ Asistencia eliminada. Quedan: ${nuevaLista.length}`);
                return true;
            } else {
                console.warn(`⚠️ No se encontró asistencia con ID: ${id}`);
                console.log('IDs disponibles:', asistencias.map(a => a.id));
                return false;
            }
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
                                version: "3.1",
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
            version: "3.1",
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
 * Importa asistencias desde un archivo JSON (VERSIÓN MEJORADA)
 */
    function importarAsistencias(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();

            reader.onload = function (e) {
                try {
                    const datos = JSON.parse(e.target.result);

                    // Validar estructura
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
                                id: asistenciasActuales[index].id, // Mantener ID original
                                fechaImportacion: new Date().toISOString(),
                                importado: true
                            };
                            contadorActualizadas++;
                        } else {
                            // Agregar nueva
                            asistenciasActuales.push({
                                ...nuevaAsistencia,
                                id: Date.now() + contadorNuevas,
                                fechaImportacion: new Date().toISOString(),
                                importado: true
                            });
                            contadorNuevas++;
                        }
                    });

                    // Guardar todas las asistencias
                    guardarEnStorage(asistenciasActuales);

                    console.log(`✅ Importación completada: ${contadorNuevas} nuevas, ${contadorActualizadas} actualizadas`);

                    resolve({
                        nuevas: contadorNuevas,
                        actualizadas: contadorActualizadas,
                        total: asistenciasActuales.length
                    });

                } catch (error) {
                    reject(new Error('Error al procesar el archivo: ' + error.message));
                }
            };

            reader.onerror = () => reject(new Error('Error al leer el archivo'));
            reader.readAsText(file);
        });
    }

    /**
     * Obtiene el docente actual con horario incluido
     */
    function obtenerDocenteActual(curso) {
        if (!curso) return null;

        const responsables = typeof DataManager !== 'undefined' ?
            DataManager.getResponsables?.() || [] : [];

        const docente = responsables.find(r => r.numeroCurso === curso);

        return docente ? {
            documento: docente.documento,
            nombre: docente.nombre,
            materia: docente.materia || 'No especificada',
            horarioInicio: docente.horarioInicio || 'N/A',
            horarioFin: docente.horarioFin || 'N/A'
        } : null;
    }

    // ===== FUNCIÓN DE MIGRACIÓN AUTOMÁTICA =====
    // Se ejecuta al cargar el módulo para actualizar asistencias antiguas

    function migrarAsistenciasConHorario() {
        try {
            console.log('🔄 Verificando asistencias para migrar horarios...');
            const asistencias = obtenerTodasAsistencias();
            let modificadas = 0;

            asistencias.forEach(asist => {
                // Si la asistencia tiene docente pero le falta horario
                if (asist.docente && (!asist.docente.horarioInicio || !asist.docente.horarioFin)) {
                    const responsables = typeof DataManager !== 'undefined' ?
                        DataManager.getResponsables?.() || [] : [];

                    const docente = responsables.find(r => r.documento === asist.docente.documento);

                    if (docente) {
                        asist.docente.horarioInicio = docente.horarioInicio || 'N/A';
                        asist.docente.horarioFin = docente.horarioFin || 'N/A';
                        modificadas++;
                        console.log(`✅ Migrada asistencia del ${asist.fecha} para ${asist.docente.nombre}`);
                    }
                }
            });

            if (modificadas > 0) {
                guardarEnStorage(asistencias);
                console.log(`✅ ${modificadas} asistencias actualizadas con horario`);
            } else {
                console.log('✅ No se requirieron migraciones');
            }

        } catch (error) {
            console.error('❌ Error en migración:', error);
        }
    }

    // Ejecutar migración automática después de cargar
    setTimeout(() => {
        migrarAsistenciasConHorario();
    }, 1000);

    // API pública
    return {
        guardarAsistencia,
        obtenerTodasAsistencias,
        obtenerAsistencia,
        filtrarAsistencias,
        eliminarAsistencia,
        limpiarTodasAsistencias,
        exportarAsistencias,
        importarAsistencias,
        obtenerDocenteActual,
        guardarEnStorage, // Exportada para uso en migración manual si es necesario
        migrarAsistenciasConHorario // Exportada para poder ejecutarla manualmente si se desea
    };
})();

console.log('✅ Módulo AsistenciaData v3.1 cargado');
window.AsistenciaData = AsistenciaData;