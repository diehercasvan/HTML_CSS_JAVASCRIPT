// planesData.js - Gestión de Planes de Mejoramiento Académico
// Versión 1.0 - PASO 1

console.log('🔄 Cargando módulo planesData.js...');

const PlanesData = (function () {

    let planes = [];

    /**
     * Carga los planes guardados desde localStorage
     */
    function cargarPlanes() {
        try {
            const saved = localStorage.getItem('planesMejoramiento');
            if (saved) {
                planes = JSON.parse(saved);
                console.log(`✅ ${planes.length} planes cargados`);
            } else {
                planes = [];
                console.log('📭 No hay planes guardados');
            }
            return planes;
        } catch (error) {
            console.error('❌ Error cargando planes:', error);
            planes = [];
            return [];
        }
    }

    /**
     * Guarda los planes en localStorage
     */
    function guardarPlanes() {
        try {
            localStorage.setItem('planesMejoramiento', JSON.stringify(planes));
            console.log(`✅ ${planes.length} planes guardados`);
        } catch (error) {
            console.error('❌ Error guardando planes:', error);
        }
    }

    /**
     * Agrega un nuevo plan de mejoramiento
     */
    function agregarPlan(plan) {
        try {
            const nuevoPlan = {
                id: Date.now(),
                ...plan,
                fechaCreacion: new Date().toISOString(),
                historial: [
                    {
                        fecha: new Date().toISOString(),
                        accion: 'creado',
                        usuario: plan.instructores?.[0]?.nombre || 'Sistema'
                    }
                ]
            };

            planes.push(nuevoPlan);
            guardarPlanes();
            console.log('✅ Plan agregado:', nuevoPlan.id);
            return nuevoPlan;

        } catch (error) {
            console.error('❌ Error agregando plan:', error);
            return null;
        }
    }

    /**
     * Obtiene planes por estudiante
     */
    function getPlanesPorEstudiante(documento) {
        return planes.filter(p => p.aprendiz?.documento === documento)
            .sort((a, b) => new Date(b.fechaSuscripcion) - new Date(a.fechaSuscripcion));
    }

    /**
     * Obtiene un plan por su ID
     */
    function getPlanPorId(id) {
        return planes.find(p => p.id == id) || null;
    }

    /**
     * Actualiza el estado de un plan
     */
    function actualizarEstadoPlan(id, nuevoEstado, observaciones) {
        try {
            const index = planes.findIndex(p => p.id == id);
            if (index === -1) return false;

            planes[index].estado = nuevoEstado;
            if (observaciones) {
                planes[index].observaciones = observaciones;
            }
            planes[index].historial.push({
                fecha: new Date().toISOString(),
                accion: 'estado_actualizado',
                valor: nuevoEstado,
                observaciones: observaciones
            });

            guardarPlanes();
            console.log(`✅ Estado del plan ${id} actualizado a ${nuevoEstado}`);
            return true;

        } catch (error) {
            console.error('❌ Error actualizando estado:', error);
            return false;
        }
    }
    /**
     * Actualiza los datos completos de un plan
     */
    function actualizarPlan(id, nuevosDatos) {
        try {
            const index = planes.findIndex(p => p.id == id);
            if (index === -1) return false;

            planes[index] = {
                ...planes[index],
                ...nuevosDatos,
                fechaModificacion: new Date().toISOString()
            };

            if (!planes[index].historial) planes[index].historial = [];
            planes[index].historial.push({
                fecha: new Date().toISOString(),
                accion: 'actualizado',
                usuario: nuevosDatos.instructores?.[0]?.nombre || 'Sistema'
            });

            guardarPlanes();
            console.log(`✅ Plan ${id} actualizado`);
            return true;

        } catch (error) {
            console.error('❌ Error actualizando plan:', error);
            return false;
        }
    }
    /**
       * Elimina un plan
       */
    function eliminarPlan(id) {
        try {
            const index = planes.findIndex(p => p.id == id);
            if (index === -1) return false;

            const planEliminado = planes[index];
            planes.splice(index, 1);
            guardarPlanes();
            console.log(`✅ Plan ${id} eliminado`);
            return true;

        } catch (error) {
            console.error('❌ Error eliminando plan:', error);
            return false;
        }
    }
    /**
     * Actualiza el estado de una actividad
     */
    function actualizarEstadoActividad(planId, competenciaIndex, actividadIndex, nuevoEstado) {
        try {
            const plan = planes.find(p => p.id == planId);
            if (!plan) return false;

            const actividad = plan.competencias[competenciaIndex]?.actividades[actividadIndex];
            if (!actividad) return false;

            actividad.estado = nuevoEstado;
            actividad.fechaActualizacion = new Date().toISOString();

            guardarPlanes();
            console.log(`✅ Actividad ${actividadIndex + 1} actualizada a ${nuevoEstado}`);
            return true;

        } catch (error) {
            console.error('❌ Error actualizando actividad:', error);
            return false;
        }
    }

    // Cargar datos al iniciar
    setTimeout(() => {
        cargarPlanes();
    }, 200);

    // API pública
    return {
        cargarPlanes,
        agregarPlan,
        getPlanesPorEstudiante,
        getPlanPorId,
        actualizarEstadoPlan,
        actualizarPlan,
        eliminarPlan,
        actualizarEstadoActividad
    };
})();

console.log('✅ Módulo PlanesData cargado');
window.PlanesData = PlanesData;