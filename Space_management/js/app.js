// app.js - Archivo principal de la aplicación v0.6
// VERSIÓN COMPLETA Y CORREGIDA

console.log('🔄 Iniciando carga de app.js...');

// ===== INICIALIZACIÓN =====
document.addEventListener('DOMContentLoaded', async function() {
    console.log('🚀 DOMContentLoaded disparado - Iniciando aplicación v0.6...');
    
    // Verificar dependencias críticas
    const dependencias = [
        { nombre: 'DataManager', obj: window.DataManager },
        { nombre: 'Utils', obj: window.Utils },
        { nombre: 'ModalManager', obj: window.ModalManager },
        { nombre: 'UIManager', obj: window.UIManager }
    ];
    
    let todasOk = true;
    dependencias.forEach(dep => {
        if (typeof dep.obj === 'undefined') {
            console.error(`❌ ${dep.nombre} NO DISPONIBLE`);
            todasOk = false;
        } else {
            console.log(`✅ ${dep.nombre} disponible`);
        }
    });
    
    if (!todasOk) {
        console.error('❌ Faltan dependencias críticas. No se puede continuar.');
        document.body.innerHTML += '<div style="color:red; padding:20px; background:#ffeeee; border:2px solid red; margin:20px;">❌ Error: Faltan módulos esenciales. Revise la consola.</div>';
        return;
    }
    
    try {
        // Cargar datos guardados
        console.log('🔄 Cargando datos desde localStorage...');
        await DataManager.cargarDeLocalStorage();
        console.log('✅ Datos cargados correctamente');
        
        // Inicializar UI
        if (typeof UIManager !== 'undefined') {
            console.log('🔄 Inicializando selectores UI...');
            await UIManager.inicializarSelectores();
            
            console.log('🔄 Renderizando tablas...');
            UIManager.renderizarTablaResponsables();
            UIManager.renderizarPuestosDocentes();
            UIManager.renderizarMesas();
            UIManager.renderizarEquipos();
            UIManager.renderizarSillas();
        }
        
        // Configurar fecha actual
        const hoy = (typeof Utils !== 'undefined' && Utils.fechaActual) ? 
                    Utils.fechaActual() : 
                    new Date().toISOString().split('T')[0];
        
        const fechaInput = document.getElementById('fecha');
        if (fechaInput) {
            fechaInput.value = hoy;
            console.log('✅ Fecha actual establecida:', hoy);
        }
        
        const fechaAsistencia = document.getElementById('fechaAsistencia');
        if (fechaAsistencia) {
            fechaAsistencia.value = hoy;
        }
        
        // Configurar texto del toggle
        const toggleText = document.getElementById('toggleConfigText');
        if (toggleText) toggleText.textContent = 'Ocultar';
        
        console.log('✅ Aplicación v0.6 inicializada correctamente');
        
    } catch (error) {
        console.error('❌ Error en inicialización:', error);
    }
});

// ===== FUNCIONES DE EXPORTACIÓN/IMPORTACIÓN =====

/**
 * Exporta los datos actuales a JSON
 */
window.exportarDatos = function() {
    console.log('📤 Exportando datos...');
    
    try {
        const datos = DataManager.exportarDatos ? DataManager.exportarDatos() : null;
        
        if (!datos) {
            if (typeof Utils !== 'undefined') {
                Utils.showToast('error', 'No se pudieron exportar los datos');
            } else {
                alert('Error al exportar');
            }
            return;
        }
        
        const fecha = (typeof Utils !== 'undefined' && Utils.fechaActual) ? 
                      Utils.fechaActual() : 
                      new Date().toISOString().split('T')[0];
        
        const blob = new Blob([JSON.stringify(datos, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `gestion-salones-${fecha}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        if (typeof Utils !== 'undefined') {
            Utils.showToast('success', 'Datos exportados');
        }
        
    } catch (error) {
        console.error('❌ Error exportando:', error);
        if (typeof Utils !== 'undefined') {
            Utils.showToast('error', 'Error al exportar');
        }
    }
};

/**
 * Importa datos desde un archivo JSON
 */
window.importarDatos = function(event) {
    console.log('📥 Importando datos...');
    
    const file = event.target.files[0];
    if (!file) return;
    
    if (!file.name.endsWith('.json')) {
        if (typeof Utils !== 'undefined') {
            Utils.showToast('error', 'Seleccione un archivo JSON');
        } else {
            alert('Archivo no válido');
        }
        event.target.value = '';
        return;
    }
    
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const datos = JSON.parse(e.target.result);
            
            const confirmar = async () => {
                if (typeof Utils !== 'undefined') {
                    const result = await Swal.fire({
                        title: '¿Importar datos?',
                        text: 'Esta acción reemplazará todos los datos actuales',
                        icon: 'warning',
                        showCancelButton: true,
                        confirmButtonColor: '#d33',
                        confirmButtonText: 'Sí, importar',
                        cancelButtonText: 'Cancelar'
                    });
                    return result.isConfirmed;
                }
                return confirm('¿Importar datos? Se reemplazarán todos los datos actuales');
            };
            
            confirmar().then(ok => {
                if (ok) {
                    if (DataManager.importarDatos && DataManager.importarDatos(datos)) {
                        if (typeof Utils !== 'undefined') {
                            Utils.showToast('success', 'Datos importados, recargando...');
                        }
                        setTimeout(() => location.reload(), 1500);
                    } else {
                        if (typeof Utils !== 'undefined') {
                            Utils.showToast('error', 'Error al importar');
                        }
                    }
                }
            });
            
        } catch (error) {
            console.error('❌ Error importando:', error);
            if (typeof Utils !== 'undefined') {
                Utils.showToast('error', 'Archivo inválido');
            }
        }
        event.target.value = '';
    };
    reader.readAsText(file);
};

/**
 * Limpia todos los datos
 */
window.limpiarTodosLosDatos = function() {
    console.log('🗑️ Limpiando todos los datos...');
    
    const confirmar = async () => {
        if (typeof Utils !== 'undefined') {
            const result = await Swal.fire({
                title: '¿Limpiar todos los datos?',
                text: 'Esta acción eliminará TODOS los registros. No se puede deshacer.',
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#d33',
                confirmButtonText: 'Sí, limpiar todo',
                cancelButtonText: 'Cancelar'
            });
            return result.isConfirmed;
        }
        return confirm('¿Limpiar todos los datos? Esta acción no se puede deshacer');
    };
    
    confirmar().then(ok => {
        if (ok) {
            try {
                if (DataManager.limpiarTodosLosDatos) {
                    DataManager.limpiarTodosLosDatos();
                }
                
                if (typeof UIManager !== 'undefined') {
                    UIManager.renderizarTablaResponsables();
                    UIManager.renderizarPuestosDocentes();
                    UIManager.renderizarMesas();
                    UIManager.renderizarEquipos();
                    UIManager.renderizarSillas();
                }
                
                if (typeof Utils !== 'undefined') {
                    Utils.showToast('success', 'Datos limpiados');
                }
                
                console.log('✅ Todos los datos limpiados');
                
            } catch (error) {
                console.error('❌ Error limpiando datos:', error);
                if (typeof Utils !== 'undefined') {
                    Utils.showToast('error', 'Error al limpiar');
                }
            }
        }
    });
};

// ===== FUNCIONES DE SNAPSHOTS =====

window.guardarSnapshot = function() {
    console.log('📸 Guardando snapshot...');
    if (typeof Reportes !== 'undefined' && Reportes.guardarSnapshot) {
        Reportes.guardarSnapshot();
    } else {
        console.warn('⚠️ Reportes no disponible');
        if (typeof Utils !== 'undefined') {
            Utils.showToast('info', 'Función no disponible');
        }
    }
};

window.mostrarHistorial = function() {
    console.log('📚 Mostrando historial...');
    if (typeof Reportes !== 'undefined' && Reportes.mostrarHistorial) {
        Reportes.mostrarHistorial();
    } else {
        console.warn('⚠️ Reportes no disponible');
        if (typeof Utils !== 'undefined') {
            Utils.showToast('info', 'Función no disponible');
        }
    }
};

window.exportarHistorialCompleto = function() {
    console.log('📦 Exportando historial completo...');
    if (typeof Reportes !== 'undefined' && Reportes.exportarHistorialCompleto) {
        Reportes.exportarHistorialCompleto();
    } else {
        console.warn('⚠️ Reportes no disponible');
        if (typeof Utils !== 'undefined') {
            Utils.showToast('info', 'Función no disponible');
        }
    }
};

window.generarReporteCompleto = function() {
    console.log('📊 Generando reporte...');
    if (typeof Reportes !== 'undefined' && Reportes.generarReporteProfesional) {
        Reportes.generarReporteProfesional();
    } else {
        console.warn('⚠️ Reportes no disponible');
        if (typeof Utils !== 'undefined') {
            Utils.showToast('info', 'Función no disponible');
        }
    }
};

// ===== DIAGNÓSTICO =====

window.diagnosticarSistema = function() {
    console.log('=== DIAGNÓSTICO DEL SISTEMA v0.6 ===');
    console.log('DataManager:', typeof DataManager);
    console.log('Utils:', typeof Utils);
    console.log('ModalManager:', typeof ModalManager);
    console.log('UIManager:', typeof UIManager);
    
    console.log('\n📊 Módulos:');
    console.log('- ResponsablesModule:', typeof ResponsablesModule);
    console.log('- PuestosModule:', typeof PuestosModule);
    console.log('- EquiposModule:', typeof EquiposModule);
    console.log('- SillasModule:', typeof SillasModule);
    console.log('- AsistenciaModule:', typeof AsistenciaModule);
    console.log('- Reportes:', typeof Reportes);
    
    console.log('\n💾 localStorage:');
    console.log('- gestionSalones:', localStorage.getItem('gestionSalones') ? '✅' : '❌');
    console.log('- gestionSalonesHistorial:', localStorage.getItem('gestionSalonesHistorial') ? '✅' : '❌');
    
    console.log('\n📋 Funciones globales:');
    const funciones = [
        'exportarDatos', 'importarDatos', 'limpiarTodosLosDatos',
        'generarReporteCompleto', 'mostrarHistorial', 'guardarSnapshot',
        'exportarHistorialCompleto'
    ];
    funciones.forEach(f => console.log(`- ${f}:`, typeof window[f] === 'function' ? '✅' : '❌'));
};

// Ejecutar diagnóstico automático
setTimeout(() => {
    console.log('ℹ️ Ejecute diagnosticarSistema() en la consola para ver el estado completo');
}, 2000);

console.log('✅ app.js v0.6 cargado correctamente');