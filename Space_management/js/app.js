// app.js - Archivo principal de la aplicación v0.6
// VERSIÓN COMPLETA Y CORREGIDA

console.log('🔄 Iniciando carga de app.js...');

// ===== INICIALIZACIÓN =====
document.addEventListener('DOMContentLoaded', async function () {
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
         // ===== INICIALIZAR MÓDULO DE LLAMADOS =====
        console.log('🔄 Inicializando módulo de llamados...');
        if (typeof LlamadosUI !== 'undefined') {
            // Pequeño retraso para asegurar que el DOM está listo
            setTimeout(() => {
                LlamadosUI.inicializarSelectores();
            }, 1000);
        } else {
            console.warn('⚠️ Módulo LlamadosUI no disponible');
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

// ===== FUNCIÓN DE FORZAR GUARDADO =====

/**
 * Fuerza el guardado de todos los datos en localStorage
 */
window.forzarGuardado = function () {
    console.log('💾 Forzando guardado de datos...');

    // Verificar estado actual
    const mesas = DataManager.getMesas?.() || [];
    const sillas = DataManager.getSillas?.() || [];

    console.log('📊 Estado antes del guardado:');
    console.log('- Mesas:', mesas.length);
    console.log('- Sillas:', sillas.length);

    // Forzar guardado
    DataManager.guardarEnLocalStorage();

    // Verificar que se guardó
    const saved = localStorage.getItem('gestionSalones');
    if (saved) {
        const parsed = JSON.parse(saved);
        console.log('✅ Datos guardados en localStorage:');
        console.log('- Mesas guardadas:', parsed.mesas?.length || 0);
        console.log('- Sillas guardadas:', parsed.sillas?.length || 0);

        Swal.fire({
            icon: 'success',
            title: 'Datos guardados',
            html: `
                <p>✅ Mesas: ${parsed.mesas?.length || 0}</p>
                <p>✅ Sillas: ${parsed.sillas?.length || 0}</p>
                <p>✅ Responsables: ${parsed.responsables?.length || 0}</p>
                <p>✅ Equipos: ${parsed.equipos?.length || 0}</p>
            `,
            timer: 3000,
            showConfirmButton: false
        });
    } else {
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'No se pudieron guardar los datos'
        });
    }
};
// ===== FUNCIONES DE EXPORTACIÓN/IMPORTACIÓN =====

/**
 * Exporta los datos actuales a JSON
 */
// ===== FUNCIONES DE EXPORTACIÓN/IMPORTACIÓN =====

window.exportarDatos = function () {
    console.log('📤 Exportando datos...');

    try {
        // Forzar guardado antes de exportar
        DataManager.guardarEnLocalStorage();

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
window.importarDatos = function (event) {
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
    reader.onload = function (e) {
        try {
            const datos = JSON.parse(e.target.result);

            // Mostrar resumen de datos a importar
            console.log('📦 Datos a importar:', {
                responsables: datos.responsables?.length || 0,
                puestos: datos.puestosDocentes?.length || 0,
                mesas: datos.mesas?.length || 0,
                equipos: datos.equipos?.length || 0,
                sillas: datos.sillas?.length || 0,
                asistencia: datos.asistencia?.length || 0
            });

            Swal.fire({
                title: '¿Importar datos?',
                html: `
                    <p>Esta acción reemplazará todos los datos actuales:</p>
                    <ul style="text-align: left;">
                        <li>📋 Responsables: ${datos.responsables?.length || 0}</li>
                        <li>👨‍🏫 Puestos Docentes: ${datos.puestosDocentes?.length || 0}</li>
                        <li>🖥️ Mesas: ${datos.mesas?.length || 0}</li>
                        <li>📺 Equipos: ${datos.equipos?.length || 0}</li>
                        <li>🪑 Sillas: ${datos.sillas?.length || 0}</li>
                        <li>📅 Asistencias: ${datos.asistencia?.length || 0}</li>
                    </ul>
                `,
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#d33',
                confirmButtonText: 'Sí, importar',
                cancelButtonText: 'Cancelar'
            }).then((result) => {
                if (result.isConfirmed) {
                    // Importar datos
                    const importado = DataManager.importarDatos ? DataManager.importarDatos(datos) : false;

                    if (importado) {
                        // Forzar guardado en localStorage
                        DataManager.guardarEnLocalStorage();

                        // Actualizar todas las vistas
                        if (typeof UIManager !== 'undefined') {
                            UIManager.renderizarTablaResponsables();
                            UIManager.renderizarPuestosDocentes();
                            UIManager.renderizarMesas();
                            UIManager.renderizarEquipos();
                            UIManager.renderizarSillas();

                            // Si hay un curso seleccionado en sillas, actualizar estadísticas
                            const cursoSillas = document.getElementById('cursoSillas')?.value;
                            if (cursoSillas) {
                                const estadisticas = DataManager.getEstadisticasSillas?.(cursoSillas);
                                if (estadisticas && UIManager.actualizarEstadisticasSillas) {
                                    UIManager.actualizarEstadisticasSillas(estadisticas);
                                }
                            }
                        }

                        Swal.fire({
                            icon: 'success',
                            title: 'Datos importados',
                            text: 'Los datos se han cargado correctamente',
                            timer: 2000,
                            showConfirmButton: false
                        });

                        console.log('✅ Datos importados y vistas actualizadas');
                    } else {
                        Swal.fire({
                            icon: 'error',
                            title: 'Error',
                            text: 'No se pudieron importar los datos'
                        });
                    }
                }
            });

        } catch (error) {
            console.error('❌ Error importando:', error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Archivo JSON inválido'
            });
        }
        event.target.value = '';
    };
    reader.readAsText(file);
};

/**
 * Limpia todos los datos
 */
window.limpiarTodosLosDatos = function () {
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

window.guardarSnapshot = function () {
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

window.mostrarHistorial = function () {
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

window.exportarHistorialCompleto = function () {
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

window.generarReporteCompleto = function () {
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
/**
 * Fuerza la actualización de todas las vistas después de importar
 */
window.actualizarVistasDespuesDeImportar = function () {
    console.log('🔄 Actualizando vistas después de importar...');

    if (typeof UIManager !== 'undefined') {
        UIManager.renderizarTablaResponsables();
        UIManager.renderizarPuestosDocentes();
        UIManager.renderizarMesas();
        UIManager.renderizarEquipos();
        UIManager.renderizarSillas();

        // Actualizar selector de cursos
        const cursoSillas = document.getElementById('cursoSillas');
        if (cursoSillas && cursoSillas.value) {
            const estadisticas = DataManager.getEstadisticasSillas?.(cursoSillas.value);
            if (estadisticas && UIManager.actualizarEstadisticasSillas) {
                UIManager.actualizarEstadisticasSillas(estadisticas);
            }
        }
    }

    console.log('✅ Vistas actualizadas');
};
/**
 * Actualiza el panel de validación con el estado de los módulos
 */
/**
 * Actualiza el panel de validación con el estado de los módulos
 */
/**
 * Actualiza el panel de validación con el estado de los módulos
 */
window.actualizarPanelValidacion = function() {
    console.log('🔄 Actualizando panel de validación...');
    
    const panel = document.getElementById('contenidoValidacion');
    if (!panel) return;
    
    // Verificar módulos core
    const modulos = [
        { nombre: 'DataManager', objeto: window.DataManager, grupo: 'core' },
        { nombre: 'Utils', objeto: window.Utils, grupo: 'core' },
        { nombre: 'ModalManager', objeto: window.ModalManager, grupo: 'core' },
        { nombre: 'UIManager', objeto: window.UIManager, grupo: 'core' },
        { nombre: 'ResponsablesModule', objeto: window.ResponsablesModule, grupo: 'modulos' },
        { nombre: 'PuestosModule', objeto: window.PuestosModule, grupo: 'modulos' },
        { nombre: 'EquiposModule', objeto: window.EquiposModule, grupo: 'modulos' },
        { nombre: 'SillasModule', objeto: window.SillasModule, grupo: 'modulos' },
        { nombre: 'Reportes', objeto: window.Reportes, grupo: 'modulos' }
    ];
    
    // Módulos de asistencia
    const modulosAsistencia = [
        { nombre: 'AsistenciaData', objeto: window.AsistenciaData, grupo: 'asistencia' },
        { nombre: 'AsistenciaDiaria', objeto: window.AsistenciaDiaria, grupo: 'asistencia' },
        { nombre: 'ExportarAsistencia', objeto: window.ExportarAsistencia, grupo: 'asistencia' },
        { nombre: 'HistorialAsistencia', objeto: window.HistorialAsistencia, grupo: 'asistencia' }
    ];
    
    // Módulos de llamados
    const modulosLlamados = [
        { nombre: 'LlamadosData', objeto: window.LlamadosData, grupo: 'llamados' },
        { nombre: 'LlamadosUI', objeto: window.LlamadosUI, grupo: 'llamados' }
    ];
    
    // Verificar datos en localStorage
    let datosGuardados = { responsables: 0, puestos: 0, mesas: 0, equipos: 0, sillas: 0, asistencias: 0, llamados: 0 };
    try {
        const saved = localStorage.getItem('gestionSalones');
        if (saved) {
            const parsed = JSON.parse(saved);
            datosGuardados = {
                responsables: parsed.responsables?.length || 0,
                puestos: parsed.puestosDocentes?.length || 0,
                mesas: parsed.mesas?.length || 0,
                equipos: parsed.equipos?.length || 0,
                sillas: parsed.sillas?.length || 0,
                asistencias: parsed.asistencia?.length || 0
            };
        }
        
        // Verificar llamados en localStorage aparte
        const savedLlamados = localStorage.getItem('gestionLlamados');
        if (savedLlamados) {
            const parsed = JSON.parse(savedLlamados);
            datosGuardados.llamados = parsed.length || 0;
        }
        
    } catch (e) {
        console.error('Error leyendo localStorage:', e);
    }
    
    // Verificar datos en memoria
    let datosMemoria = { responsables: 0, puestos: 0, mesas: 0, equipos: 0, sillas: 0, asistencias: 0, llamados: 0 };
    if (window.DataManager) {
        datosMemoria = {
            responsables: DataManager.getResponsables?.().length || 0,
            puestos: DataManager.getPuestosDocentes?.().length || 0,
            mesas: DataManager.getMesas?.().length || 0,
            equipos: DataManager.getEquipos?.().length || 0,
            sillas: DataManager.getSillas?.().length || 0,
            asistencias: DataManager.getTodasAsistencias?.().length || 0
        };
    }
    
    if (window.LlamadosData) {
        datosMemoria.llamados = LlamadosData.cargarLlamados?.().length || 0;
    }
    
    // ⚠️ IMPORTANTE: Declarar html ANTES de usarlo
    let html = '<table style="width:100%; border-collapse: collapse; font-size: 11px;">';
    
    // Módulos Core
    html += '<tr style="background: #0d6efd; color: white;"><th colspan="2" style="padding: 5px;">📦 MÓDULOS CORE</th></tr>';
    modulos.filter(m => m.grupo === 'core').forEach(mod => {
        const estado = typeof mod.objeto !== 'undefined' ? '✅' : '❌';
        html += `<tr><td style="padding: 3px;">${mod.nombre}</td><td style="text-align: right;">${estado}</td></tr>`;
    });
    
    // Módulos Funcionales
    html += '<tr style="background: #198754; color: white;"><th colspan="2" style="padding: 5px;">🔧 MÓDULOS FUNCIONALES</th></tr>';
    modulos.filter(m => m.grupo === 'modulos').forEach(mod => {
        const estado = typeof mod.objeto !== 'undefined' ? '✅' : '❌';
        html += `<tr><td style="padding: 3px;">${mod.nombre.replace('Module', '')}</td><td style="text-align: right;">${estado}</td></tr>`;
    });
    
    // Módulos de Asistencia
    html += '<tr style="background: #6f42c1; color: white;"><th colspan="2" style="padding: 5px;">📅 MÓDULOS ASISTENCIA</th></tr>';
    modulosAsistencia.forEach(mod => {
        const estado = typeof mod.objeto !== 'undefined' ? '✅' : '❌';
        html += `<tr><td style="padding: 3px;">${mod.nombre}</td><td style="text-align: right;">${estado}</td></tr>`;
    });
    
    // Módulos de Llamados
    html += '<tr style="background: #dc3545; color: white;"><th colspan="2" style="padding: 5px;">⚠️ MÓDULOS LLAMADOS</th></tr>';
    modulosLlamados.forEach(mod => {
        const estado = typeof mod.objeto !== 'undefined' ? '✅' : '❌';
        html += `<tr><td style="padding: 3px;">${mod.nombre}</td><td style="text-align: right;">${estado}</td></tr>`;
    });
    
    // Datos en memoria
    html += '<tr style="background: #fd7e14; color: white;"><th colspan="2" style="padding: 5px;">💾 DATOS EN MEMORIA</th></tr>';
    html += `<tr><td>Responsables</td><td style="text-align: right;">${datosMemoria.responsables}</td></tr>`;
    html += `<tr><td>Puestos Docentes</td><td style="text-align: right;">${datosMemoria.puestos}</td></tr>`;
    html += `<tr><td>Mesas</td><td style="text-align: right;">${datosMemoria.mesas}</td></tr>`;
    html += `<tr><td>Equipos</td><td style="text-align: right;">${datosMemoria.equipos}</td></tr>`;
    html += `<tr><td>Sillas</td><td style="text-align: right;">${datosMemoria.sillas}</td></tr>`;
    html += `<tr><td>Asistencias</td><td style="text-align: right; font-weight: bold;">${datosMemoria.asistencias}</td></tr>`;
    html += `<tr><td>Llamados</td><td style="text-align: right; font-weight: bold; color: #dc3545;">${datosMemoria.llamados}</td></tr>`;
    
    // Datos en localStorage
    html += '<tr style="background: #6c757d; color: white;"><th colspan="2" style="padding: 5px;">💿 LOCALSTORAGE</th></tr>';
    html += `<tr><td>Responsables</td><td style="text-align: right;">${datosGuardados.responsables}</td></tr>`;
    html += `<tr><td>Puestos Docentes</td><td style="text-align: right;">${datosGuardados.puestos}</td></tr>`;
    html += `<tr><td>Mesas</td><td style="text-align: right;">${datosGuardados.mesas}</td></tr>`;
    html += `<tr><td>Equipos</td><td style="text-align: right;">${datosGuardados.equipos}</td></tr>`;
    html += `<tr><td>Sillas</td><td style="text-align: right;">${datosGuardados.sillas}</td></tr>`;
    html += `<tr><td>Asistencias</td><td style="text-align: right; font-weight: bold;">${datosGuardados.asistencias}</td></tr>`;
    html += `<tr><td>Llamados</td><td style="text-align: right; font-weight: bold; color: #dc3545;">${datosGuardados.llamados}</td></tr>`;
    
    html += '</table>';
    
    panel.innerHTML = html;
    console.log('✅ Panel de validación actualizado');
};

setInterval(actualizarPanelValidacion, 3000);
/**
 * Muestra un resumen completo en consola
 */
window.validarSistema = function () {
    console.log('=== VALIDACIÓN COMPLETA DEL SISTEMA ===');

    // 1. Verificar archivos JS cargados
    console.log('\n📁 ARCHIVOS JS CARGADOS:');
    document.querySelectorAll('script[src]').forEach((s, i) => {
        console.log(`${i + 1}. ${s.src.split('/').pop()}`);
    });

    // 2. Verificar módulos
    console.log('\n📦 MÓDULOS:');
    const modulos = ['DataManager', 'Utils', 'ModalManager', 'UIManager',
        'ResponsablesModule', 'PuestosModule', 'EquiposModule',
        'SillasModule', 'AsistenciaModule', 'Reportes'];

    modulos.forEach(m => {
        console.log(`${m}:`, typeof window[m] !== 'undefined' ? '✅' : '❌');
    });

    // 3. Verificar datos
    console.log('\n💾 DATOS:');
    if (window.DataManager) {
        console.log('Responsables:', DataManager.getResponsables?.().length || 0);
        console.log('Puestos Docentes:', DataManager.getPuestosDocentes?.().length || 0);
        console.log('Mesas:', DataManager.getMesas?.().length || 0);
        console.log('Equipos:', DataManager.getEquipos?.().length || 0);
        console.log('Sillas:', DataManager.getSillas?.().length || 0);
    }

    // 4. Verificar localStorage
    console.log('\n💿 LOCALSTORAGE:');
    try {
        const saved = localStorage.getItem('gestionSalones');
        if (saved) {
            const parsed = JSON.parse(saved);
            console.log('Responsables:', parsed.responsables?.length || 0);
            console.log('Puestos Docentes:', parsed.puestosDocentes?.length || 0);
            console.log('Mesas:', parsed.mesas?.length || 0);
            console.log('Equipos:', parsed.equipos?.length || 0);
            console.log('Sillas:', parsed.sillas?.length || 0);
        } else {
            console.log('No hay datos guardados');
        }
    } catch (e) {
        console.error('Error leyendo localStorage:', e);
    }
};

// Funciones para la pestaña de llamados
window.cargarEstudiantesLlamados = async function() {
    console.log('🔄 cargarEstudiantesLlamados llamado');
    if (typeof LlamadosUI !== 'undefined') {
        await LlamadosUI.cargarEstudiantes();
    } else {
        console.error('❌ LlamadosUI no está disponible');
    }
};

window.cargarLlamadosEstudiante = function() {
    console.log('🔄 cargarLlamadosEstudiante llamado');
    if (typeof LlamadosUI !== 'undefined') {
        LlamadosUI.cargarLlamadosEstudiante();
    } else {
        console.error('❌ LlamadosUI no está disponible');
        Swal.fire('Error', 'Módulo de llamados no disponible', 'error');
    }
};

window.mostrarModalNuevoLlamado = function() {
    console.log('🔄 mostrarModalNuevoLlamado llamado');
    if (typeof LlamadosUI !== 'undefined') {
        LlamadosUI.mostrarModalNuevoLlamado();
    } else {
        console.error('❌ LlamadosUI no está disponible');
        Swal.fire('Error', 'Módulo de llamados no disponible', 'error');
    }
};

// Inicializar módulo de llamados
if (typeof LlamadosUI !== 'undefined' && LlamadosUI.inicializarSelectores) {
    console.log('🔄 Inicializando módulo de llamados...');
    LlamadosUI.inicializarSelectores();
} else {
    console.warn('⚠️ Módulo de llamados no disponible');
}

// Exponer módulos de asistencia globalmente
window.AsistenciaDiaria = AsistenciaDiaria;
window.AsistenciaData = AsistenciaData;
window.ExportarAsistencia = ExportarAsistencia;
window.HistorialAsistencia = HistorialAsistencia;

// Funciones de acceso rápido
window.filtrarAsistencia = () => AsistenciaDiaria.filtrarAsistencia();
window.marcarAsistencia = (doc, val) => AsistenciaDiaria.marcarAsistencia(doc, val);
window.marcarUniforme = (doc, val) => AsistenciaDiaria.marcarUniforme(doc, val);
window.actualizarObservacionAsistencia = (doc, obs) => AsistenciaDiaria.actualizarObservacion(doc, obs);
window.guardarAsistencia = () => AsistenciaDiaria.guardarAsistencia();
window.cargarAsistenciaPorCurso = () => AsistenciaDiaria.cargarAsistenciaPorCurso();
window.marcarTodos = () => AsistenciaDiaria.marcarTodos();
window.desmarcarTodos = () => AsistenciaDiaria.desmarcarTodos();
window.exportarTodo = function () {
    const asistencias = AsistenciaData.obtenerTodasAsistencias();
    AsistenciaData.exportarParaUnificar(asistencias);
};

// Inicializar historial al cargar la página
setTimeout(() => {
    if (typeof HistorialAsistencia !== 'undefined') {
        HistorialAsistencia.renderizarHistorial();
    }
}, 1000);
// ===== DIAGNÓSTICO =====

window.diagnosticarSistema = function () {
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
    const saved = localStorage.getItem('gestionSalones');
    if (saved) {
        const parsed = JSON.parse(saved);
        console.log('- gestionSalones: ✅');
        console.log('  • Mesas:', parsed.mesas?.length || 0);
        console.log('  • Sillas:', parsed.sillas?.length || 0);
    } else {
        console.log('- gestionSalones: ❌');
    }

    console.log('- gestionSalonesHistorial:', localStorage.getItem('gestionSalonesHistorial') ? '✅' : '❌');

    console.log('\n📋 Funciones globales:');
    const funciones = [
        'exportarDatos', 'importarDatos', 'limpiarTodosLosDatos',
        'generarReporteCompleto', 'mostrarHistorial', 'guardarSnapshot',
        'exportarHistorialCompleto', 'forzarGuardado'
    ];
    funciones.forEach(f => console.log(`- ${f}:`, typeof window[f] === 'function' ? '✅' : '❌'));
};

// En app.js, agregar función global

window.importarListaAsistencia = function(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    if (!file.name.endsWith('.json')) {
        Swal.fire({
            icon: 'error',
            title: 'Archivo inválido',
            text: 'Por favor seleccione un archivo JSON'
        });
        event.target.value = '';
        return;
    }
    
    AsistenciaData.importarAsistencias(file)
        .then(() => {
            // Recargar vista actual si hay curso seleccionado
            const curso = document.getElementById('cursoAsistencia')?.value;
            const fecha = document.getElementById('fechaAsistencia')?.value;
            if (curso && fecha) {
                AsistenciaDiaria.filtrarAsistencia();
            }
            if (typeof HistorialAsistencia !== 'undefined') {
                HistorialAsistencia.renderizarHistorial();
            }
        })
        .catch(error => {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: error.message
            });
        })
        .finally(() => {
            event.target.value = '';
        });
};

// Ejecutar diagnóstico automático
setTimeout(() => {
    console.log('ℹ️ Ejecute diagnosticarSistema() en la consola para ver el estado completo');
}, 2000);

console.log('✅ app.js v0.6 cargado correctamente');

// En app.js, asegurar que el historial se renderiza después de cargar

// Inicializar historial al cargar la página
setTimeout(() => {
    if (typeof HistorialAsistencia !== 'undefined') {
        console.log('🔄 Renderizando historial de asistencias...');
        HistorialAsistencia.renderizarHistorial();
    }
}, 1500); // Aumentar el timeout para asegurar que todo está cargado