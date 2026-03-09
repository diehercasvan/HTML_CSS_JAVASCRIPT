// js/modules/llamados/llamadosData.js
// Versión 3.0 - COMPLETA - CON TODAS LAS FUNCIONES

console.log('🔄 Cargando módulo llamadosData.js...');

const LlamadosData = (function() {
    
    let llamados = [];

    /**
     * Carga los llamados guardados
     */
    function cargarLlamados() {
        try {
            console.log('📚 Cargando llamados desde localStorage...');
            const saved = localStorage.getItem('gestionLlamados');
            if (saved) {
                llamados = JSON.parse(saved);
                console.log(`✅ ${llamados.length} llamados cargados`);
            } else {
                llamados = [];
                console.log('📭 No hay llamados guardados');
            }
            return llamados;
        } catch (error) {
            console.error('❌ Error cargando llamados:', error);
            llamados = [];
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
            return true;
        } catch (error) {
            console.error('❌ Error guardando llamados:', error);
            return false;
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
     * Obtiene un llamado por su ID
     */
    function getLlamadoPorId(id) {
        console.log(`🔍 Buscando llamado ID: ${id} (${typeof id})`);
        const encontrado = llamados.find(l => String(l.id) === String(id));
        if (encontrado) {
            console.log('✅ Llamado encontrado');
        } else {
            console.log('❌ Llamado no encontrado. IDs:', llamados.map(l => l.id));
        }
        return encontrado || null;
    }

    /**
     * Actualiza el estado de un llamado
     */
    function actualizarEstado(id, nuevoEstado) {
        try {
            const index = llamados.findIndex(l => String(l.id) === String(id));
            if (index === -1) return false;
            
            llamados[index].estado = nuevoEstado;
            llamados[index].historial.push({
                fecha: new Date().toISOString(),
                accion: 'estado_actualizado',
                valor: nuevoEstado
            });
            
            guardarLlamados();
            console.log(`✅ Estado del llamado ${id} actualizado a ${nuevoEstado}`);
            return true;
            
        } catch (error) {
            console.error('❌ Error actualizando estado:', error);
            return false;
        }
    }

    /**
     * Actualiza un llamado completo
     */
    function actualizarLlamado(id, nuevosDatos) {
        try {
            const index = llamados.findIndex(l => String(l.id) === String(id));
            if (index === -1) return false;
            
            llamados[index] = {
                ...llamados[index],
                ...nuevosDatos,
                fechaModificacion: new Date().toISOString()
            };
            
            llamados[index].historial.push({
                fecha: new Date().toISOString(),
                accion: 'actualizado'
            });
            
            guardarLlamados();
            console.log(`✅ Llamado ${id} actualizado`);
            return true;
            
        } catch (error) {
            console.error('❌ Error actualizando llamado:', error);
            return false;
        }
    }

    /**
     * Elimina un llamado
     */
    function eliminarLlamado(id) {
        try {
            const index = llamados.findIndex(l => String(l.id) === String(id));
            if (index === -1) return false;
            
            llamados.splice(index, 1);
            guardarLlamados();
            console.log(`✅ Llamado ${id} eliminado`);
            return true;
            
        } catch (error) {
            console.error('❌ Error eliminando llamado:', error);
            return false;
        }
    }

    /**
     * Duplica un llamado
     */
    function duplicarLlamado(id) {
        try {
            const original = getLlamadoPorId(id);
            if (!original) return null;
            
            const copia = {
                ...original,
                id: Date.now(),
                fecha: new Date().toISOString().split('T')[0],
                fechaCreacion: new Date().toISOString(),
                estado: 'activo',
                historial: [
                    {
                        fecha: new Date().toISOString(),
                        accion: 'duplicado',
                        original: id
                    }
                ]
            };
            
            llamados.push(copia);
            guardarLlamados();
            console.log(`✅ Llamado duplicado: ${copia.id}`);
            return copia;
            
        } catch (error) {
            console.error('❌ Error duplicando llamado:', error);
            return null;
        }
    }

    /**
     * Exporta todos los llamados a JSON
     */
    function exportarLlamados() {
        const datos = {
            version: "3.0",
            fechaExportacion: new Date().toISOString(),
            total: llamados.length,
            llamados: llamados
        };
        
        const blob = new Blob([JSON.stringify(datos, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `llamados-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        Swal.fire({
            icon: 'success',
            title: 'Exportado',
            text: `${llamados.length} llamados exportados`,
            timer: 2000,
            showConfirmButton: false
        });
    }

    /**
     * Importa llamados desde JSON
     */
    function importarLlamados(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            
            reader.onload = function(e) {
                try {
                    const datos = JSON.parse(e.target.result);
                    
                    if (!datos.llamados || !Array.isArray(datos.llamados)) {
                        reject(new Error('Formato de archivo inválido'));
                        return;
                    }
                    
                    let nuevos = 0;
                    let actualizados = 0;
                    
                    datos.llamados.forEach(nuevo => {
                        const existe = llamados.some(l => l.id === nuevo.id);
                        if (!existe) {
                            llamados.push(nuevo);
                            nuevos++;
                        } else {
                            const index = llamados.findIndex(l => l.id === nuevo.id);
                            llamados[index] = nuevo;
                            actualizados++;
                        }
                    });
                    
                    guardarLlamados();
                    
                    Swal.fire({
                        icon: 'success',
                        title: 'Importado',
                        html: `
                            <p>✅ Nuevos: ${nuevos}</p>
                            <p>🔄 Actualizados: ${actualizados}</p>
                            <p>📊 Total: ${llamados.length}</p>
                        `,
                        timer: 3000,
                        showConfirmButton: false
                    });
                    
                    resolve({ nuevos, actualizados });
                    
                } catch (error) {
                    reject(error);
                }
            };
            
            reader.readAsText(file);
        });
    }

    // Inicializar
    setTimeout(() => {
        cargarLlamados();
    }, 200);

    // API pública
    return {
        cargarLlamados,
        agregarLlamado,
        getLlamadosPorEstudiante,
        getLlamadoPorId,
        actualizarEstado,
        actualizarLlamado,
        eliminarLlamado,
        duplicarLlamado,
        exportarLlamados,
        importarLlamados
    };
})();

console.log('✅ Módulo LlamadosData v3.0 cargado');
window.LlamadosData = LlamadosData;