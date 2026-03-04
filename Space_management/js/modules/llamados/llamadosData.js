// llamadosData.js - Gestión de datos de llamados de atención
// Versión 0.9

console.log('🔄 Cargando módulo llamadosData.js...');

const LlamadosData = (function () {

    // Estructura de datos para llamados
    let llamados = [];

    /**
     * Carga los llamados guardados
     */
    function cargarLlamados() {
        try {
            const saved = localStorage.getItem('gestionLlamados');
            if (saved) {
                llamados = JSON.parse(saved);
                console.log(`✅ ${llamados.length} llamados cargados`);
            } else {
                llamados = [];
            }
            return llamados;
        } catch (error) {
            console.error('❌ Error cargando llamados:', error);
            return [];
        }
    }

    /**
     * Guarda los llamados en localStorage
     */
    function guardarLlamados() {
        try {
            localStorage.setItem('gestionLlamados', JSON.stringify(llamados));
            console.log(`✅ ${llamados.length} llamados guardados`);
        } catch (error) {
            console.error('❌ Error guardando llamados:', error);
        }
    }

    /**
     * Agrega un nuevo llamado
     */
    function agregarLlamado(llamado) {
        try {
            const nuevoLlamado = {
                id: Date.now(),
                ...llamado,
                fechaCreacion: new Date().toISOString(),
                historial: [
                    {
                        fecha: new Date().toISOString(),
                        accion: 'creado',
                        usuario: llamado.docente?.nombre || 'Sistema'
                    }
                ]
            };

            llamados.push(nuevoLlamado);
            guardarLlamados();
            console.log('✅ Llamado agregado:', nuevoLlamado.id);
            return nuevoLlamado;

        } catch (error) {
            console.error('❌ Error agregando llamado:', error);
            return null;
        }
    }

    /**
     * Obtiene llamados por estudiante
     */
    function getLlamadosPorEstudiante(documento) {
        return llamados.filter(l => l.estudiante?.documento === documento)
            .sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
    }

    /**
     * Obtiene llamados por curso
     */
    function getLlamadosPorCurso(cursoId) {
        return llamados.filter(l => l.curso === cursoId)
            .sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
    }

    /**
     * Actualiza el estado de un llamado
     */
    function actualizarEstadoLlamado(id, nuevoEstado, observacion) {
        try {
            const index = llamados.findIndex(l => l.id === id);
            if (index === -1) return false;

            llamados[index].estado = nuevoEstado;
            llamados[index].historial.push({
                fecha: new Date().toISOString(),
                accion: 'estado_actualizado',
                valor: nuevoEstado,
                observacion: observacion
            });

            guardarLlamados();
            return true;

        } catch (error) {
            console.error('❌ Error actualizando estado:', error);
            return false;
        }
    }

    /**
     * Agrega un compromiso a un llamado
     */
    function agregarCompromiso(llamadoId, compromiso) {
        try {
            const index = llamados.findIndex(l => l.id === llamadoId);
            if (index === -1) return false;

            if (!llamados[index].compromisos) {
                llamados[index].compromisos = [];
            }

            const nuevoCompromiso = {
                id: Date.now(),
                ...compromiso,
                fechaCreacion: new Date().toISOString(),
                estado: 'pendiente'
            };

            llamados[index].compromisos.push(nuevoCompromiso);
            guardarLlamados();
            return nuevoCompromiso;

        } catch (error) {
            console.error('❌ Error agregando compromiso:', error);
            return false;
        }
    }

    /**
     * Marca un compromiso como cumplido
     */
    function cumplirCompromiso(llamadoId, compromisoId, observacion) {
        try {
            const llamado = llamados.find(l => l.id === llamadoId);
            if (!llamado) return false;

            const compromiso = llamado.compromisos?.find(c => c.id === compromisoId);
            if (!compromiso) return false;

            compromiso.estado = 'cumplido';
            compromiso.fechaCumplimiento = new Date().toISOString();
            compromiso.observacion = observacion;

            guardarLlamados();
            return true;

        } catch (error) {
            console.error('❌ Error actualizando compromiso:', error);
            return false;
        }
    }

    /**
     * Cuenta llamados por estudiante
     */
    function contarLlamadosPorEstudiante(documento) {
        const llamadosEstudiante = getLlamadosPorEstudiante(documento);
        return {
            academicos: llamadosEstudiante.filter(l => l.tipo === 'academico').length,
            disciplinarios: llamadosEstudiante.filter(l => l.tipo === 'disciplinario').length,
            total: llamadosEstudiante.length
        };
    }

    // Cargar datos al iniciar
    setTimeout(() => {
        cargarLlamados();
    }, 200);
    /**
 * Obtiene un llamado por su ID
 */
    function getLlamadoPorId(id) {
        return llamados.find(l => l.id == id) || null;
    }

    // API pública
    return {
        cargarLlamados,
        agregarLlamado,
        getLlamadosPorEstudiante,
        getLlamadosPorCurso,
        actualizarEstadoLlamado,
        agregarCompromiso,
        cumplirCompromiso,
        contarLlamadosPorEstudiante,
        cargarLlamados,
        agregarLlamado,
        getLlamadosPorEstudiante,
        getLlamadoPorId
    };
})();

console.log('✅ Módulo LlamadosData cargado');
window.LlamadosData = LlamadosData;