// llamadosUI.js - Interfaz de usuario para llamados de atención
// Versión 0.9 - COMPLETA CON AUTOINICIALIZACIÓN

console.log('🔄 Cargando módulo llamadosUI.js...');

const LlamadosUI = (function() {
    
    let plantillas = {};
    let estudiantesCache = {};

    /**
     * Inicializa los selectores de la pestaña llamados
     */
    async function inicializarSelectores() {
        console.log('🔄 Inicializando selectores de llamados...');
        
        const cursoSelect = document.getElementById('cursoLlamados');
        if (!cursoSelect) {
            console.warn('⚠️ Selector de cursos no encontrado en el DOM');
            return;
        }
        
        // Cargar cursos desde DataManager
        const cursos = DataManager.getCursos ? DataManager.getCursos() : [];
        console.log(`📚 Cursos disponibles: ${cursos.length}`);
        
        cursoSelect.innerHTML = '<option value="">Seleccione un curso</option>';
        
        cursos.forEach(curso => {
            const option = document.createElement('option');
            option.value = curso.id;
            option.textContent = `${curso.id} - ${curso.nombre}`;
            cursoSelect.appendChild(option);
        });
        
        console.log(`✅ Selector de cursos inicializado con ${cursos.length} cursos`);
        
        // Agregar evento change al selector de curso
        cursoSelect.addEventListener('change', function() {
            console.log('📌 Curso cambiado a:', this.value);
            cargarEstudiantes();
        });
    }

    /**
     * Carga los estudiantes del curso seleccionado
     */
    async function cargarEstudiantes() {
        console.log('🔄 Cargando estudiantes para llamados...');
        
        const cursoSelect = document.getElementById('cursoLlamados');
        const estudianteSelect = document.getElementById('estudianteLlamados');
        const contenedor = document.getElementById('contenedorLlamados');
        
        if (!cursoSelect || !estudianteSelect || !contenedor) {
            console.warn('⚠️ Elementos del DOM no encontrados');
            return;
        }
        
        const cursoId = cursoSelect.value;
        
        // Limpiar select de estudiantes
        estudianteSelect.innerHTML = '<option value="">Cargando estudiantes...</option>';
        contenedor.innerHTML = '<p class="text-muted">Seleccione un estudiante para ver sus llamados</p>';
        
        if (!cursoId) {
            estudianteSelect.innerHTML = '<option value="">Primero seleccione un curso</option>';
            return;
        }
        
        try {
            // Cargar estudiantes del curso
            const estudiantes = await DataManager.getEstudiantesPorCurso(cursoId) || [];
            estudiantesCache[cursoId] = estudiantes;
            
            estudianteSelect.innerHTML = '<option value="">Seleccione un estudiante</option>';
            
            estudiantes.forEach(est => {
                const option = document.createElement('option');
                option.value = est.documento;
                option.setAttribute('data-nombres', est.nombres);
                option.setAttribute('data-apellidos', est.apellidos);
                option.textContent = `${est.documento} - ${est.nombres} ${est.apellidos}`;
                estudianteSelect.appendChild(option);
            });
            
            console.log(`✅ ${estudiantes.length} estudiantes cargados para curso ${cursoId}`);
            
        } catch (error) {
            console.error('❌ Error cargando estudiantes:', error);
            estudianteSelect.innerHTML = '<option value="">Error cargando estudiantes</option>';
        }
    }

    /**
     * Muestra el modal para nuevo llamado
     */
    function mostrarModalNuevoLlamado() {
        console.log('📝 Mostrando modal nuevo llamado...');
        
        const cursoSelect = document.getElementById('cursoLlamados');
        const estudianteSelect = document.getElementById('estudianteLlamados');
        
        if (!cursoSelect || !estudianteSelect) {
            console.error('❌ Selectores no encontrados');
            return;
        }
        
        if (!cursoSelect.value) {
            Swal.fire({
                icon: 'warning',
                title: 'Curso requerido',
                text: 'Seleccione un curso primero'
            });
            return;
        }
        
        if (!estudianteSelect.value) {
            Swal.fire({
                icon: 'warning',
                title: 'Estudiante requerido',
                text: 'Seleccione un estudiante'
            });
            return;
        }
        
        const cursoId = cursoSelect.value;
        const cursoNombre = cursoSelect.options[cursoSelect.selectedIndex]?.textContent || cursoId;
        
        const selectedOption = estudianteSelect.options[estudianteSelect.selectedIndex];
        const estudiante = {
            documento: estudianteSelect.value,
            nombres: selectedOption.getAttribute('data-nombres'),
            apellidos: selectedOption.getAttribute('data-apellidos'),
            nombreCompleto: selectedOption.textContent.split(' - ')[1] || selectedOption.textContent
        };
        
        console.log('📝 Estudiante seleccionado:', estudiante);
        
        Swal.fire({
            title: '📢 Nuevo Llamado de Atención',
            width: '700px',
            html: `
                <form id="formLlamado" class="text-start">
                    <div class="row">
                        <div class="col-md-6 mb-3">
                            <label class="form-label fw-bold">Estudiante</label>
                            <input type="text" class="form-control bg-light" value="${estudiante.nombreCompleto}" readonly>
                        </div>
                        <div class="col-md-6 mb-3">
                            <label class="form-label fw-bold">Curso</label>
                            <input type="text" class="form-control bg-light" value="${cursoNombre}" readonly>
                        </div>
                    </div>
                    
                    <div class="row">
                        <div class="col-md-6 mb-3">
                            <label class="form-label fw-bold">Tipo de Llamado</label>
                            <select class="form-select" id="llamadoTipo">
                                <option value="academico">📚 Académico</option>
                                <option value="disciplinario">⚠️ Disciplinario</option>
                            </select>
                        </div>
                        <div class="col-md-6 mb-3">
                            <label class="form-label fw-bold">Fecha</label>
                            <input type="date" class="form-control bg-light" id="llamadoFecha" value="${new Date().toISOString().split('T')[0]}" readonly>
                        </div>
                    </div>
                    
                    <div class="mb-3">
                        <label class="form-label fw-bold">Motivo del Llamado</label>
                        <textarea class="form-control" id="llamadoMotivo" rows="3" placeholder="Describa el motivo del llamado..."></textarea>
                    </div>
                    
                    <div class="mb-3">
                        <label class="form-label fw-bold">Compromisos</label>
                        <div id="compromisosContainer">
                            <div class="input-group mb-2">
                                <input type="text" class="form-control" placeholder="Compromiso 1" id="compromiso_0">
                                <button class="btn btn-outline-success" type="button" onclick="LlamadosUI.agregarCampoCompromiso()">
                                    <i class="fas fa-plus"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                    
                    <div class="mb-3">
                        <label class="form-label fw-bold">Observaciones</label>
                        <textarea class="form-control" id="llamadoObservaciones" rows="2" placeholder="Observaciones adicionales..."></textarea>
                    </div>
                </form>
            `,
            showCancelButton: true,
            confirmButtonText: '✅ Generar Llamado',
            cancelButtonText: '❌ Cancelar',
            confirmButtonColor: '#dc3545',
            preConfirm: () => {
                const compromisos = [];
                let i = 0;
                while (document.getElementById(`compromiso_${i}`)) {
                    const val = document.getElementById(`compromiso_${i}`).value;
                    if (val && val.trim()) compromisos.push(val.trim());
                    i++;
                }
                
                return {
                    tipo: document.getElementById('llamadoTipo').value,
                    motivo: document.getElementById('llamadoMotivo').value,
                    compromisos: compromisos,
                    observaciones: document.getElementById('llamadoObservaciones').value
                };
            }
        }).then((result) => {
            if (result.isConfirmed) {
                guardarLlamado(estudiante, cursoId, result.value);
            }
        });
    }

    /**
     * Agrega un nuevo campo de compromiso
     */
    function agregarCampoCompromiso() {
        const container = document.getElementById('compromisosContainer');
        const count = container.children.length;
        
        const div = document.createElement('div');
        div.className = 'input-group mb-2';
        div.innerHTML = `
            <input type="text" class="form-control" placeholder="Compromiso ${count + 1}" id="compromiso_${count}">
            <button class="btn btn-outline-danger" type="button" onclick="this.parentElement.remove()">
                <i class="fas fa-times"></i>
            </button>
        `;
        container.appendChild(div);
    }

    /**
     * Guarda el llamado en el sistema
     */
    async function guardarLlamado(estudiante, curso, datos) {
        console.log('💾 Guardando llamado...', datos);
        
        if (!datos.motivo || !datos.motivo.trim()) {
            Swal.fire({
                icon: 'warning',
                title: 'Campo requerido',
                text: 'Debe ingresar el motivo del llamado'
            });
            return;
        }
        
        const docenteActual = obtenerDocenteActual(curso);
        
        const nuevoLlamado = {
            estudiante: {
                documento: estudiante.documento,
                nombre: estudiante.nombreCompleto,
                nombres: estudiante.nombres,
                apellidos: estudiante.apellidos
            },
            curso: curso,
            tipo: datos.tipo,
            motivo: datos.motivo,
            compromisos: datos.compromisos.map(c => ({ 
                descripcion: c, 
                estado: 'pendiente',
                fechaCreacion: new Date().toISOString()
            })),
            observaciones: datos.observaciones || '',
            docente: docenteActual,
            fecha: new Date().toISOString().split('T')[0],
            estado: 'activo',
            nivel: calcularNivelLlamado(estudiante.documento, datos.tipo)
        };
        
        const resultado = LlamadosData.agregarLlamado(nuevoLlamado);
        
        if (resultado) {
            Swal.fire({
                icon: 'success',
                title: '✅ Llamado generado',
                text: 'El llamado de atención ha sido registrado',
                timer: 2000,
                showConfirmButton: false
            });
            
            // Actualizar la tabla de llamados
            cargarLlamadosEstudiante();
        }
    }

    /**
     * Calcula el nivel del llamado basado en llamados anteriores
     */
    function calcularNivelLlamado(documento, tipo) {
        const llamadosAnteriores = LlamadosData.getLlamadosPorEstudiante(documento)
            .filter(l => l.tipo === tipo);
        return llamadosAnteriores.length + 1;
    }

    /**
     * Obtiene el docente actual del curso
     */
    function obtenerDocenteActual(curso) {
        const responsables = DataManager.getResponsables?.() || [];
        const docente = responsables.find(r => r.numeroCurso === curso);
        return docente ? { 
            nombre: docente.nombre, 
            documento: docente.documento,
            materia: docente.materia || 'No especificada'
        } : null;
    }

    /**
     * Carga y muestra los llamados del estudiante seleccionado
     */
    function cargarLlamadosEstudiante() {
        console.log('🔄 Cargando llamados del estudiante...');
        
        const estudianteSelect = document.getElementById('estudianteLlamados');
        const cursoSelect = document.getElementById('cursoLlamados');
        const contenedor = document.getElementById('contenedorLlamados');
        
        if (!estudianteSelect || !cursoSelect || !contenedor) {
            console.warn('⚠️ Elementos no encontrados');
            return;
        }
        
        if (!estudianteSelect.value || !cursoSelect.value) {
            Swal.fire({
                icon: 'warning',
                title: 'Seleccione un estudiante',
                text: 'Debe seleccionar un curso y un estudiante'
            });
            return;
        }
        
        const selectedOption = estudianteSelect.options[estudianteSelect.selectedIndex];
        const estudiante = {
            documento: estudianteSelect.value,
            nombres: selectedOption.getAttribute('data-nombres'),
            apellidos: selectedOption.getAttribute('data-apellidos')
        };
        
        const html = renderizarTablaLlamados(estudiante);
        contenedor.innerHTML = html;
    }

    /**
     * Renderiza la tabla de llamados de un estudiante
     */
    function renderizarTablaLlamados(estudiante) {
        const llamados = LlamadosData.getLlamadosPorEstudiante(estudiante.documento);
        
        if (llamados.length === 0) {
            return '<p class="text-muted">No hay llamados registrados para este estudiante</p>';
        }
        
        let html = `
            <div class="table-responsive">
                <h6 class="mt-3">📋 Historial de Llamados</h6>
                <table class="table table-striped table-hover table-bordered">
                    <thead class="table-dark">
                        <tr>
                            <th>Fecha</th>
                            <th>Tipo</th>
                            <th>Nivel</th>
                            <th>Motivo</th>
                            <th>Compromisos</th>
                            <th>Estado</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
        `;
        
        llamados.forEach(l => {
            const compromisos = l.compromisos?.map(c => 
                `<span class="badge ${c.estado === 'cumplido' ? 'bg-success' : 'bg-warning'} me-1">${c.descripcion}</span>`
            ).join(' ') || 'Sin compromisos';
            
            const badgeTipo = l.tipo === 'academico' ? 'bg-info' : 'bg-danger';
            const badgeEstado = l.estado === 'activo' ? 'bg-warning' : 'bg-success';
            
            html += `
                <tr>
                    <td>${l.fecha}</td>
                    <td><span class="badge ${badgeTipo}">${l.tipo}</span></td>
                    <td><span class="badge bg-secondary">${l.nivel || 1}</span></td>
                    <td>${l.motivo}</td>
                    <td>${compromisos}</td>
                    <td><span class="badge ${badgeEstado}">${l.estado}</span></td>
                    <td>
                        <button class="btn btn-sm btn-primary" onclick="LlamadosUI.verDetalle('${l.id}')">
                            <i class="fas fa-eye"></i>
                        </button>
                    </td>
                </tr>
            `;
        });
        
        html += '</tbody></table></div>';
        return html;
    }

    /**
     * Muestra detalle de un llamado
     */
    function verDetalle(id) {
        // Implementar vista detalle
        console.log('Ver detalle:', id);
    }

    // Auto-inicializar cuando el DOM esté listo
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            setTimeout(inicializarSelectores, 500);
        });
    } else {
        setTimeout(inicializarSelectores, 500);
    }

    // API pública
    return {
        inicializarSelectores,
        cargarEstudiantes,
        mostrarModalNuevoLlamado,
        agregarCampoCompromiso,
        cargarLlamadosEstudiante,
        renderizarTablaLlamados,
        verDetalle
    };
})();

console.log('✅ Módulo LlamadosUI v0.9 cargado correctamente');
window.LlamadosUI = LlamadosUI;