// exportarAsistencia.js - Módulo para exportar registros de asistencia
// Versión 0.8 - COMPLETO

console.log('🔄 Cargando módulo exportarAsistencia.js...');

const ExportarAsistencia = (function() {
    
    /**
     * Obtiene el número de semana ISO
     */
    function obtenerNumeroSemana(fecha) {
        const date = new Date(fecha);
        date.setHours(0, 0, 0, 0);
        date.setDate(date.getDate() + 3 - (date.getDay() + 6) % 7);
        const week1 = new Date(date.getFullYear(), 0, 4);
        return Math.ceil(((date - week1) / 86400000 + 1) / 7);
    }

    /**
     * Obtiene asistencia por rango de fechas
     */
    function obtenerAsistenciaPorDias(curso, fechaInicio, fechaFin) {
        const dias = [];
        const start = new Date(fechaInicio);
        const end = new Date(fechaFin);
        
        for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
            const fechaStr = d.toISOString().split('T')[0];
            const asistencia = typeof AsistenciaData !== 'undefined' ? 
                AsistenciaData.obtenerAsistencia(curso, fechaStr) : null;
            
            if (asistencia) {
                dias.push({
                    fecha: fechaStr,
                    asistencia: asistencia.registros
                });
            }
        }
        
        return dias;
    }

    /**
     * Descarga un archivo JSON
     */
    function descargarJSON(datos, nombreArchivo) {
        const blob = new Blob([JSON.stringify(datos, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = nombreArchivo;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    /**
     * Exporta registro diario
     */
    function exportarRegistroDiario() {
        console.log('📤 Exportando registro diario...');
        
        const curso = document.getElementById('cursoAsistencia')?.value;
        const fecha = document.getElementById('fechaAsistencia')?.value;
        
        if (!curso || !fecha) {
            Swal.fire({
                icon: 'warning',
                title: 'Campos requeridos',
                text: 'Seleccione curso y fecha'
            });
            return;
        }
        
        const asistencia = typeof AsistenciaData !== 'undefined' ? 
            AsistenciaData.obtenerAsistencia(curso, fecha) : null;
        
        if (!asistencia) {
            Swal.fire({
                icon: 'warning',
                title: 'Sin datos',
                text: 'No hay asistencia guardada para esta fecha'
            });
            return;
        }
        
        const docente = typeof AsistenciaData !== 'undefined' ? 
            AsistenciaData.obtenerDocenteActual(curso) : null;
        
        const datos = {
            version: "0.8",
            tipo: "registro_diario",
            metadata: {
                docente: docente || { nombre: 'Desconocido' },
                curso: curso,
                fecha: fecha
            },
            asistencia: asistencia.registros,
            totalEstudiantes: asistencia.registros.length,
            presentes: asistencia.registros.filter(a => a.asistio).length,
            ausentes: asistencia.registros.filter(a => !a.asistio).length
        };
        
        const nombreArchivo = `asistencia-${curso}-${fecha}.json`;
        descargarJSON(datos, nombreArchivo);
        
        Swal.fire({
            icon: 'success',
            title: 'Registro exportado',
            text: `Archivo: ${nombreArchivo}`,
            timer: 2000,
            showConfirmButton: false
        });
    }

    /**
     * Exporta registro semanal
     */
    function exportarRegistroSemanal() {
        console.log('📤 Exportando registro semanal...');
        
        const curso = document.getElementById('cursoAsistencia')?.value;
        const semanaInput = document.getElementById('semanaAsistencia')?.value;
        
        if (!curso || !semanaInput) {
            Swal.fire({
                icon: 'warning',
                title: 'Campos requeridos',
                text: 'Seleccione curso y semana'
            });
            return;
        }
        
        // Calcular fechas de la semana
        const [year, week] = semanaInput.split('-W');
        const fechaInicio = new Date(year, 0, 1 + (week - 1) * 7);
        while (fechaInicio.getDay() !== 1) {
            fechaInicio.setDate(fechaInicio.getDate() + 1);
        }
        const fechaFin = new Date(fechaInicio);
        fechaFin.setDate(fechaFin.getDate() + 4);
        
        const fechaInicioStr = fechaInicio.toISOString().split('T')[0];
        const fechaFinStr = fechaFin.toISOString().split('T')[0];
        
        const docente = typeof AsistenciaData !== 'undefined' ? 
            AsistenciaData.obtenerDocenteActual(curso) : null;
        
        const dias = obtenerAsistenciaPorDias(curso, fechaInicioStr, fechaFinStr);
        
        let totalPresentes = 0;
        let totalRegistros = 0;
        dias.forEach(dia => {
            totalPresentes += dia.asistencia.filter(a => a.asistio).length;
            totalRegistros += dia.asistencia.length;
        });
        
        const datos = {
            version: "0.8",
            tipo: "registro_semanal",
            metadata: {
                docente: docente || { nombre: 'Desconocido' },
                curso: curso,
                semana: semanaInput,
                fechaInicio: fechaInicioStr,
                fechaFin: fechaFinStr
            },
            dias: dias,
            totalSemana: {
                registros: totalRegistros,
                presentes: totalPresentes,
                ausentes: totalRegistros - totalPresentes,
                porcentaje: totalRegistros > 0 ? 
                    Math.round((totalPresentes / totalRegistros) * 100) : 0
            }
        };
        
        const nombreArchivo = `asistencia-${curso}-semana-${week}-${year}.json`;
        descargarJSON(datos, nombreArchivo);
        
        Swal.fire({
            icon: 'success',
            title: 'Registro semanal exportado',
            text: `Archivo: ${nombreArchivo}`,
            timer: 2000,
            showConfirmButton: false
        });
    }

    // API pública
    return {
        exportarRegistroDiario,
        exportarRegistroSemanal
    };
})();

console.log('✅ Módulo ExportarAsistencia cargado');
window.ExportarAsistencia = ExportarAsistencia;