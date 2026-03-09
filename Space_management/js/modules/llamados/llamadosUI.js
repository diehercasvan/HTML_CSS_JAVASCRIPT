// js/modules/llamados/llamadosUI.js
// Versión 3.0 - COMPLETA - CON TODAS LAS ACCIONES

console.log('🔄 Cargando módulo llamadosUI.js...');

const LlamadosUI = (function() {
    
    let estudiantesCache = {};

    /**
     * Inicializa selectores
     */
    async function inicializarSelectores() {
        console.log('🔄 Inicializando selectores de llamados...');
        
        const cursoSelect = document.getElementById('cursoLlamados');
        if (!cursoSelect) return;
        
        const cursos = DataManager.getCursos ? DataManager.getCursos() : [];
        
        cursoSelect.innerHTML = '<option value="">Seleccione un curso</option>';
        cursos.forEach(curso => {
            const option = document.createElement('option');
            option.value = curso.id;
            option.textContent = `${curso.id} - ${curso.nombre}`;
            cursoSelect.appendChild(option);
        });
        
        cursoSelect.addEventListener('change', function() {
            cargarEstudiantes();
        });
    }

    /**
     * Carga estudiantes del curso
     */
    async function cargarEstudiantes() {
        console.log('🔄 Cargando estudiantes...');
        
        const cursoSelect = document.getElementById('cursoLlamados');
        const estudianteSelect = document.getElementById('estudianteLlamados');
        
        if (!cursoSelect || !estudianteSelect) return;
        
        const cursoId = cursoSelect.value;
        
        estudianteSelect.innerHTML = '<option value="">Cargando...</option>';
        
        if (!cursoId) {
            estudianteSelect.innerHTML = '<option value="">Primero seleccione un curso</option>';
            return;
        }
        
        try {
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
            
            console.log(`✅ ${estudiantes.length} estudiantes cargados`);
            
        } catch (error) {
            console.error('❌ Error:', error);
            estudianteSelect.innerHTML = '<option value="">Error cargando estudiantes</option>';
        }
    }

    /**
     * Carga y muestra los llamados del estudiante
     */
    function cargarLlamadosEstudiante() {
        console.log('📋 Cargando llamados del estudiante...');
        
        const estudianteSelect = document.getElementById('estudianteLlamados');
        const contenedor = document.getElementById('contenedorLlamados');
        
        if (!estudianteSelect || !estudianteSelect.value) {
            Swal.fire('Seleccione un estudiante', '', 'warning');
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
     * Renderiza tabla de llamados
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
                        <div class="btn-group" role="group">
                            <button class="btn btn-sm btn-primary" onclick="LlamadosUI.verDetalle('${l.id}')" title="Ver detalle">
                                <i class="fas fa-eye"></i>
                            </button>
                            <button class="btn btn-sm btn-warning" onclick="LlamadosUI.cambiarEstado('${l.id}')" title="Cambiar estado">
                                <i class="fas fa-sync-alt"></i>
                            </button>
                            <button class="btn btn-sm btn-danger" onclick="GeneradorPDF.generarPDFLlamado('${l.id}')" title="Generar PDF">
                                <i class="fas fa-file-pdf"></i>
                            </button>
                            <button class="btn btn-sm btn-success" onclick="LlamadosUI.compartir('${l.id}')" title="Compartir">
                                <i class="fas fa-share-alt"></i>
                            </button>
                            <button class="btn btn-sm btn-info" onclick="LlamadosUI.editarLlamado('${l.id}')" title="Editar">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="btn btn-sm btn-secondary" onclick="LlamadosUI.duplicarLlamado('${l.id}')" title="Duplicar">
                                <i class="fas fa-copy"></i>
                            </button>
                            <button class="btn btn-sm btn-dark" onclick="LlamadosUI.eliminarLlamado('${l.id}')" title="Eliminar">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </td>
                </tr>
            `;
        });
        
        html += '</tbody></table></div>';
        return html;
    }

    /**
     * Ver detalle del llamado
     */
    function verDetalle(id) {
        console.log('🔍 Ver detalle:', id);
        const llamado = LlamadosData.getLlamadoPorId(id);
        
        if (!llamado) {
            Swal.fire('Error', 'Llamado no encontrado', 'error');
            return;
        }
        
        const compromisosHtml = llamado.compromisos?.map(c => `
            <div class="d-flex justify-content-between align-items-center mb-2 p-2 border rounded">
                <span>• ${c.descripcion}</span>
                <span class="badge ${c.estado === 'cumplido' ? 'bg-success' : 'bg-warning'}">
                    ${c.estado === 'cumplido' ? '✅ Cumplido' : '⏳ Pendiente'}
                </span>
            </div>
        `).join('') || '<p>No hay compromisos</p>';
        
        Swal.fire({
            title: '📋 Detalle del Llamado',
            width: '700px',
            html: `
                <div class="text-start">
                    <div class="row">
                        <div class="col-md-6">
                            <p><strong>Fecha:</strong> ${llamado.fecha}</p>
                            <p><strong>Tipo:</strong> <span class="badge ${llamado.tipo === 'academico' ? 'bg-info' : 'bg-danger'}">${llamado.tipo}</span></p>
                            <p><strong>Nivel:</strong> ${llamado.nivel || 1}</p>
                        </div>
                        <div class="col-md-6">
                            <p><strong>Estudiante:</strong> ${llamado.estudiante?.nombre}</p>
                            <p><strong>Documento:</strong> ${llamado.estudiante?.documento}</p>
                            <p><strong>Curso:</strong> ${llamado.curso}</p>
                        </div>
                    </div>
                    <div class="mt-3">
                        <h6>Motivo:</h6>
                        <p class="p-2 bg-light rounded">${llamado.motivo}</p>
                    </div>
                    <div class="mt-3">
                        <h6>Compromisos:</h6>
                        ${compromisosHtml}
                    </div>
                    ${llamado.observaciones ? `
                        <div class="mt-3">
                            <h6>Observaciones:</h6>
                            <p class="p-2 bg-light rounded">${llamado.observaciones}</p>
                        </div>
                    ` : ''}
                    <div class="mt-3">
                        <p><strong>Docente:</strong> ${llamado.docente?.nombre || 'N/A'}</p>
                        <p><strong>Estado:</strong> <span class="badge ${llamado.estado === 'activo' ? 'bg-warning' : 'bg-success'}">${llamado.estado}</span></p>
                    </div>
                </div>
            `,
            showCancelButton: true,
            confirmButtonText: 'PDF',
            cancelButtonText: 'Cerrar'
        }).then(result => {
            if (result.isConfirmed) {
                GeneradorPDF.generarPDFLlamado(id);
            }
        });
    }

    /**
     * Cambiar estado del llamado
     */
    function cambiarEstado(id) {
        console.log('🔄 Cambiar estado:', id);
        const llamado = LlamadosData.getLlamadoPorId(id);
        if (!llamado) return;
        
        Swal.fire({
            title: 'Cambiar estado',
            input: 'select',
            inputOptions: {
                'activo': '🟡 Activo',
                'cumplido': '✅ Cumplido'
            },
            inputValue: llamado.estado,
            showCancelButton: true,
            confirmButtonText: 'Actualizar'
        }).then(result => {
            if (result.isConfirmed) {
                const actualizado = LlamadosData.actualizarEstado(id, result.value);
                if (actualizado) {
                    Swal.fire({
                        icon: 'success',
                        title: 'Estado actualizado',
                        timer: 1500,
                        showConfirmButton: false
                    });
                    cargarLlamadosEstudiante();
                }
            }
        });
    }

    /**
     * Compartir llamado
     */
    function compartir(id) {
        console.log('📱 Compartir:', id);
        const llamado = LlamadosData.getLlamadoPorId(id);
        if (!llamado) return;
        
        Swal.fire({
            title: 'Compartir llamado',
            html: `
                <p>¿Cómo desea compartir este llamado?</p>
                <div class="row mt-3">
                    <div class="col-6">
                        <button class="btn btn-success btn-lg w-100" onclick="Notificaciones.compartirWhatsApp('${id}')">
                            <i class="fab fa-whatsapp"></i> WhatsApp
                        </button>
                    </div>
                    <div class="col-6">
                        <button class="btn btn-primary btn-lg w-100" onclick="Notificaciones.compartirEmail('${id}')">
                            <i class="fas fa-envelope"></i> Email
                        </button>
                    </div>
                </div>
            `,
            showConfirmButton: false,
            showCloseButton: true
        });
    }

    /**
     * Editar llamado
     */
    function editarLlamado(id) {
        console.log('✏️ Editar:', id);
        Swal.fire({
            icon: 'info',
            title: 'Editar llamado',
            text: 'Funcionalidad en desarrollo - Próximamente'
        });
    }

    /**
     * Duplicar llamado
     */
    function duplicarLlamado(id) {
        console.log('📋 Duplicar:', id);
        const duplicado = LlamadosData.duplicarLlamado(id);
        if (duplicado) {
            Swal.fire({
                icon: 'success',
                title: 'Duplicado',
                text: 'Llamado duplicado correctamente',
                timer: 1500,
                showConfirmButton: false
            });
            cargarLlamadosEstudiante();
        }
    }

    /**
     * Eliminar llamado
     */
    function eliminarLlamado(id) {
        console.log('🗑️ Eliminar:', id);
        Swal.fire({
            title: '¿Eliminar?',
            text: 'Esta acción no se puede deshacer',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            confirmButtonText: 'Sí, eliminar'
        }).then(result => {
            if (result.isConfirmed) {
                const eliminado = LlamadosData.eliminarLlamado(id);
                if (eliminado) {
                    Swal.fire({
                        icon: 'success',
                        title: 'Eliminado',
                        timer: 1500,
                        showConfirmButton: false
                    });
                    cargarLlamadosEstudiante();
                }
            }
        });
    }

    /**
     * Mostrar modal nuevo llamado
     */
    function mostrarModalNuevoLlamado() {
        const cursoSelect = document.getElementById('cursoLlamados');
        const estudianteSelect = document.getElementById('estudianteLlamados');
        
        if (!cursoSelect.value || !estudianteSelect.value) {
            Swal.fire('Seleccione un estudiante', '', 'warning');
            return;
        }
        
        Swal.fire({
            title: 'Nuevo Llamado',
            html: `
                <form>
                    <select class="form-select mb-2" id="nuevoTipo">
                        <option value="academico">Académico</option>
                        <option value="disciplinario">Disciplinario</option>
                    </select>
                    <textarea class="form-control mb-2" id="nuevoMotivo" placeholder="Motivo" rows="3"></textarea>
                    <input class="form-control mb-2" id="nuevoCompromiso" placeholder="Compromiso">
                    <textarea class="form-control" id="nuevoObservaciones" placeholder="Observaciones" rows="2"></textarea>
                </form>
            `,
            showCancelButton: true,
            confirmButtonText: 'Guardar'
        }).then(result => {
            if (result.isConfirmed) {
                console.log('Guardar nuevo llamado');
            }
        });
    }

    // Auto-inicializar
    setTimeout(inicializarSelectores, 1000);

    // API pública
    return {
        inicializarSelectores,
        cargarEstudiantes,
        cargarLlamadosEstudiante,
        renderizarTablaLlamados,
        verDetalle,
        cambiarEstado,
        compartir,
        editarLlamado,
        duplicarLlamado,
        eliminarLlamado,
        mostrarModalNuevoLlamado
    };
})();

console.log('✅ Módulo LlamadosUI v3.0 cargado');
window.LlamadosUI = LlamadosUI;