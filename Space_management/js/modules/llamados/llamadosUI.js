// js/modules/llamados/llamadosUI.js
// Versión 3.13 - CARGA CORRECTA DE RESPONSABLES DESDE JSON

console.log('🔄 Cargando módulo llamadosUI.js v3.13...');

const LlamadosUI = (function () {

    let estudiantesCache = {};
    let docentesCache = {};
    let todosLosResponsables = [];

    /**
     * Cargar todos los responsables al iniciar (VERSIÓN CORREGIDA)
     */
    async function cargarTodosLosResponsables() {
        console.log('👨‍🏫 Cargando todos los responsables...');

        try {
            // 1. Intentar cargar desde JSON directamente (FUENTE PRINCIPAL)
            console.log('🔄 Intentando carga desde JSON directo...');
            try {
                const response = await fetch('data/responsables.json');
                if (response.ok) {
                    const data = await response.json();
                    const jsonResponsables = data.responsables || [];
                    console.log(`📊 JSON directo: ${jsonResponsables.length} responsables`);

                    if (jsonResponsables.length > 0) {
                        todosLosResponsables = jsonResponsables.map(r => ({
                            numeroCurso: String(r.numeroCurso || '').trim(),
                            nombre: r.nombre || '',
                            documento: r.documento || '',
                            materia: r.materia || 'Sin materia',
                            horarioInicio: r.horarioInicio || '',
                            horarioFin: r.horarioFin || '',
                            email: r.email || '',
                            telefono: r.telefono || ''
                        }));

                        console.log(`✅ Cargados ${todosLosResponsables.length} responsables desde JSON`);
                        console.log('📋 Lista completa:');
                        todosLosResponsables.forEach(r => {
                            console.log(`   - ${r.nombre} (Curso: ${r.numeroCurso}, Materia: ${r.materia})`);
                        });
                        return todosLosResponsables;
                    }
                } else {
                    console.warn('⚠️ No se pudo cargar responsables.json');
                }
            } catch (e) {
                console.error('❌ Error cargando JSON:', e);
            }

            // 2. Si falla el JSON, intentar con DataManager.getResponsables
            if (DataManager.getResponsables) {
                console.log('🔄 Intentando con DataManager.getResponsables...');
                const dataManagerResponsables = DataManager.getResponsables() || [];
                console.log(`📊 DataManager.getResponsables: ${dataManagerResponsables.length} responsables`);

                if (dataManagerResponsables.length > 0) {
                    todosLosResponsables = dataManagerResponsables.map(r => ({
                        numeroCurso: String(r.numeroCurso || '').trim(),
                        nombre: r.nombre || '',
                        documento: r.documento || '',
                        materia: r.materia || 'Sin materia',
                        horarioInicio: r.horarioInicio || '',
                        horarioFin: r.horarioFin || '',
                        email: r.email || '',
                        telefono: r.telefono || ''
                    }));

                    console.log(`✅ Cargados ${todosLosResponsables.length} responsables desde DataManager`);
                    return todosLosResponsables;
                }
            }

            // 3. Último recurso: usar cargarResponsables
            if (DataManager.cargarResponsables) {
                console.log('🔄 Usando DataManager.cargarResponsables...');
                const cargados = await DataManager.cargarResponsables() || [];
                todosLosResponsables = cargados.map(r => ({
                    numeroCurso: String(r.numeroCurso || '').trim(),
                    nombre: r.nombre || '',
                    documento: r.documento || '',
                    materia: r.materia || 'Sin materia',
                    horarioInicio: r.horarioInicio || '',
                    horarioFin: r.horarioFin || '',
                    email: r.email || '',
                    telefono: r.telefono || ''
                }));

                console.log(`✅ Cargados ${todosLosResponsables.length} responsables desde cargarResponsables`);
                return todosLosResponsables;
            }

            console.warn('⚠️ No se pudieron cargar responsables de ninguna fuente');
            todosLosResponsables = [];
            return [];

        } catch (error) {
            console.error('❌ Error cargando responsables:', error);
            todosLosResponsables = [];
            return [];
        }
    }

    /**
     * Obtiene los docentes de un curso (con logging mejorado)
     */
    function getDocentesPorCurso(cursoId) {
        console.log(`🔍 getDocentesPorCurso llamado para curso: "${cursoId}"`);
        console.log(`📊 Total responsables en memoria: ${todosLosResponsables.length}`);

        if (!cursoId) {
            console.log('⚠️ cursoId vacío');
            return [];
        }

        // Mostrar todos los cursos disponibles para debugging
        const cursosDisponibles = [...new Set(todosLosResponsables.map(r => r.numeroCurso))];
        console.log('📌 Cursos con docentes:', cursosDisponibles);

        // Mostrar todos los responsables para debugging
        console.log('📋 Todos los responsables:');
        todosLosResponsables.forEach((r, i) => {
            console.log(`   ${i + 1}. ${r.nombre} - Curso: "${r.numeroCurso}" (${typeof r.numeroCurso})`);
        });

        // Filtrar por curso (comparación exacta)
        const docentes = todosLosResponsables.filter(r => {
            const coincide = String(r.numeroCurso).trim() === String(cursoId).trim();
            if (coincide) {
                console.log(`✅ Coincidencia: ${r.nombre} para curso ${cursoId}`);
            }
            return coincide;
        });

        console.log(`🎯 Resultado: ${docentes.length} docentes para curso ${cursoId}`);

        // Guardar en caché
        if (!docentesCache[cursoId]) {
            docentesCache[cursoId] = docentes;
        }

        return docentes;
    }

    /**
     * Carga los docentes en el modal con setTimeout
     */
    function cargarDocentesEnModalConRetraso() {
        console.log('⏱️ Programando carga de docentes con setTimeout...');

        setTimeout(() => {
            console.log('🔄 Ejecutando carga de docentes después del retraso...');

            const cursoSelect = document.getElementById('cursoLlamados');
            const docenteSelect = document.getElementById('nuevoDocenteLlamado');

            if (!cursoSelect || !docenteSelect) {
                console.warn('⚠️ Selector de docentes no encontrado en el modal');
                return;
            }

            const cursoId = cursoSelect.value;
            console.log(`📌 Curso seleccionado: "${cursoId}"`);

            if (!cursoId) {
                docenteSelect.innerHTML = '<option value="">Primero seleccione un curso</option>';
                return;
            }

            // Obtener docentes del curso
            const docentes = getDocentesPorCurso(cursoId);

            // Limpiar y llenar el selector
            docenteSelect.innerHTML = '<option value="">Seleccione un docente</option>';

            if (docentes.length === 0) {
                docenteSelect.innerHTML = '<option value="">No hay docentes para este curso</option>';
                console.warn(`⚠️ No hay docentes para el curso ${cursoId}`);
                return;
            }

            docentes.forEach(docente => {
                const option = document.createElement('option');
                option.value = docente.documento || '';
                option.setAttribute('data-nombre', docente.nombre || '');
                option.setAttribute('data-materia', docente.materia || 'Sin materia');
                option.textContent = `${docente.nombre} (${docente.materia})`;
                docenteSelect.appendChild(option);
            });

            console.log(`✅ ${docentes.length} docentes cargados en el modal`);
            console.log('📋 Opciones:', Array.from(docenteSelect.options).map(o => o.text));

        }, 200); // Aumentado a 200ms para mayor seguridad
    }

    /**
     * Inicializa selectores
     */
    async function inicializarSelectores() {
        console.log('🔄 Inicializando selectores de llamados...');

        await cargarTodosLosResponsables();

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

        cursoSelect.addEventListener('change', function () {
            console.log('📌 Curso cambiado a:', this.value);
            cargarEstudiantesLlamados();
        });
    }

    /**
     * Carga estudiantes del curso
     */
    async function cargarEstudiantesLlamados() {
        console.log('🔄 Cargando estudiantes para llamados...');

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
                option.setAttribute('data-telefono', est.celular || '');
                option.setAttribute('data-correo', est.correo || '');
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
            apellidos: selectedOption.getAttribute('data-apellidos'),
            telefono: selectedOption.getAttribute('data-telefono'),
            correo: selectedOption.getAttribute('data-correo')
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
                            <th>Docente</th>
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
                    <td><span class="badge bg-primary">${l.docente?.nombre || 'No asignado'}${l.docente?.materia ? ` (${l.docente.materia})` : ''}</span></td>
                    <td>${l.motivo}</td>
                    <td>${compromisos}</td>
                    <td><span class="badge ${badgeEstado}">${l.estado}</span></td>
                    <td>
                        <div class="btn-group" role="group">
                            <button class="btn btn-sm btn-primary" onclick="LlamadosUI.verDetalle('${l.id}')">
                                <i class="fas fa-eye"></i>
                            </button>
                            <button class="btn btn-sm btn-warning" onclick="LlamadosUI.cambiarEstado('${l.id}')">
                                <i class="fas fa-sync-alt"></i>
                            </button>
                            <button class="btn btn-sm btn-danger" onclick="GeneradorPDF.generarPDFLlamado('${l.id}')">
                                <i class="fas fa-file-pdf"></i>
                            </button>
                            <button class="btn btn-sm btn-success" onclick="LlamadosUI.mostrarOpcionesCompartir('${l.id}', '${estudiante.telefono}', '${estudiante.correo}')">
                                <i class="fas fa-share-alt"></i>
                            </button>
                            <button class="btn btn-sm btn-info" onclick="LlamadosUI.editarLlamado('${l.id}')">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="btn btn-sm btn-secondary" onclick="LlamadosUI.duplicarLlamado('${l.id}')">
                                <i class="fas fa-copy"></i>
                            </button>
                            <button class="btn btn-sm btn-dark" onclick="LlamadosUI.eliminarLlamado('${l.id}')">
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
                            <p><strong>Docente:</strong> <span class="badge bg-primary">${llamado.docente?.nombre || 'No asignado'}${llamado.docente?.materia ? ` (${llamado.docente.materia})` : ''}</span></p>
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
                        <p><strong>Estado:</strong> <span class="badge ${llamado.estado === 'activo' ? 'bg-warning' : 'bg-success'}">${llamado.estado}</span></p>
                    </div>
                </div>
            `,
            showCancelButton: true,
            confirmButtonText: '📝 Editar',
            cancelButtonText: 'Cerrar'
        }).then(result => {
            if (result.isConfirmed) {
                editarLlamado(id);
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
     * Editar llamado
     */
    function editarLlamado(id) {
        console.log('✏️ Editando llamado:', id);

        const llamado = LlamadosData.getLlamadoPorId(id);
        if (!llamado) {
            Swal.fire('Error', 'Llamado no encontrado', 'error');
            return;
        }

        const cursoId = llamado.curso;
        const docentes = getDocentesPorCurso(cursoId);

        const opcionesDocentes = docentes.length > 0 ?
            docentes.map(d => {
                const selected = d.documento === llamado.docente?.documento ? 'selected' : '';
                return `<option value="${d.documento}" data-nombre="${d.nombre}" data-materia="${d.materia}" ${selected}>${d.nombre} (${d.materia})</option>`;
            }).join('') :
            '<option value="">No hay docentes disponibles</option>';

        let compromisosHtml = '';
        if (llamado.compromisos && llamado.compromisos.length > 0) {
            llamado.compromisos.forEach((comp, idx) => {
                compromisosHtml += `
                    <div class="input-group mb-2">
                        <input type="text" class="form-control" placeholder="Compromiso ${idx + 1}" 
                               id="edit_compromiso_${idx}" value="${comp.descripcion}">
                        <button class="btn btn-outline-${comp.estado === 'cumplido' ? 'success' : 'warning'}" 
                                type="button" onclick="cambiarEstadoCompromiso(this, ${idx})" 
                                title="${comp.estado === 'cumplido' ? 'Cumplido' : 'Pendiente'}">
                            <i class="fas ${comp.estado === 'cumplido' ? 'fa-check-circle' : 'fa-clock'}"></i>
                        </button>
                        <button class="btn btn-outline-danger" type="button" onclick="this.parentElement.remove()">
                            <i class="fas fa-times"></i>
                        </button>
                        <input type="hidden" id="edit_compromiso_estado_${idx}" value="${comp.estado}">
                    </div>
                `;
            });
        } else {
            compromisosHtml = `
                <div class="input-group mb-2">
                    <input type="text" class="form-control" placeholder="Compromiso 1" id="edit_compromiso_0">
                    <button class="btn btn-outline-success" type="button" onclick="agregarCampoCompromisoEdit()">
                        <i class="fas fa-plus"></i>
                    </button>
                </div>
            `;
        }

        Swal.fire({
            title: '✏️ Editar Llamado',
            html: `
                <form id="formEditarLlamado" class="text-start" style="max-height: 70vh; overflow-y: auto; padding: 10px;">
                    <div class="mb-3">
                        <label class="form-label fw-bold">Tipo de Llamado</label>
                        <select class="form-select" id="editTipoLlamado">
                            <option value="academico" ${llamado.tipo === 'academico' ? 'selected' : ''}>📚 Académico</option>
                            <option value="disciplinario" ${llamado.tipo === 'disciplinario' ? 'selected' : ''}>⚠️ Disciplinario</option>
                        </select>
                    </div>
                    
                    <div class="mb-3">
                        <label class="form-label fw-bold">Nivel</label>
                        <select class="form-select" id="editNivelLlamado">
                            <option value="1" ${llamado.nivel === 1 ? 'selected' : ''}>Primer Llamado</option>
                            <option value="2" ${llamado.nivel === 2 ? 'selected' : ''}>Segundo Llamado</option>
                            <option value="3" ${llamado.nivel === 3 ? 'selected' : ''}>Tercer Llamado</option>
                        </select>
                    </div>
                    
                    <div class="mb-3">
                        <label class="form-label fw-bold">Docente que realiza el llamado</label>
                        <select class="form-select" id="editDocenteLlamado">
                            <option value="">Seleccione un docente</option>
                            ${opcionesDocentes}
                        </select>
                    </div>
                    
                    <div class="mb-3">
                        <label class="form-label fw-bold">Motivo</label>
                        <textarea class="form-control" id="editMotivo" rows="3">${llamado.motivo || ''}</textarea>
                    </div>
                    
                    <div class="mb-3">
                        <label class="form-label fw-bold">Compromisos</label>
                        <div id="editCompromisosContainer">
                            ${compromisosHtml}
                        </div>
                        <button type="button" class="btn btn-sm btn-outline-success mt-1" onclick="agregarCampoCompromisoEdit()">
                            <i class="fas fa-plus"></i> Agregar Compromiso
                        </button>
                    </div>
                    
                    <div class="mb-3">
                        <label class="form-label fw-bold">Observaciones</label>
                        <textarea class="form-control" id="editObservaciones" rows="2">${llamado.observaciones || ''}</textarea>
                    </div>
                    
                    <div class="mb-3">
                        <label class="form-label fw-bold">Estado</label>
                        <select class="form-select" id="editEstadoLlamado">
                            <option value="activo" ${llamado.estado === 'activo' ? 'selected' : ''}>🟡 Activo</option>
                            <option value="cumplido" ${llamado.estado === 'cumplido' ? 'selected' : ''}>✅ Cumplido</option>
                        </select>
                    </div>
                </form>
            `,
            width: '700px',
            showCancelButton: true,
            confirmButtonText: '💾 Guardar Cambios',
            cancelButtonText: 'Cancelar',
            didOpen: () => {
                window.editCompromisoCount = llamado.compromisos?.length || 1;
            },
            preConfirm: () => {
                const tipo = document.getElementById('editTipoLlamado').value;
                const nivel = parseInt(document.getElementById('editNivelLlamado').value);
                const docenteSelect = document.getElementById('editDocenteLlamado');
                const motivo = document.getElementById('editMotivo').value;
                const observaciones = document.getElementById('editObservaciones').value;
                const estado = document.getElementById('editEstadoLlamado').value;

                if (!motivo) {
                    Swal.showValidationMessage('El motivo es obligatorio');
                    return false;
                }

                let docente = null;
                if (docenteSelect && docenteSelect.selectedIndex > 0) {
                    const selectedOption = docenteSelect.options[docenteSelect.selectedIndex];
                    docente = {
                        documento: selectedOption.value,
                        nombre: selectedOption.getAttribute('data-nombre') || selectedOption.text.split(' (')[0],
                        materia: selectedOption.getAttribute('data-materia') || 'Sin materia'
                    };
                }

                const compromisos = [];
                let i = 0;
                while (document.getElementById(`edit_compromiso_${i}`)) {
                    const desc = document.getElementById(`edit_compromiso_${i}`).value;
                    const estadoComp = document.getElementById(`edit_compromiso_estado_${i}`)?.value || 'pendiente';

                    if (desc && desc.trim()) {
                        compromisos.push({
                            descripcion: desc.trim(),
                            estado: estadoComp
                        });
                    }
                    i++;
                }

                return {
                    tipo: tipo,
                    nivel: nivel,
                    docente: docente || llamado.docente,
                    motivo: motivo,
                    compromisos: compromisos,
                    observaciones: observaciones,
                    estado: estado
                };
            }
        }).then((result) => {
            if (result.isConfirmed && result.value) {
                const actualizado = LlamadosData.actualizarLlamado(id, result.value);

                if (actualizado) {
                    Swal.fire({
                        icon: 'success',
                        title: '✅ Llamado actualizado',
                        text: 'Los cambios han sido guardados exitosamente',
                        timer: 2000,
                        showConfirmButton: false
                    });

                    cargarLlamadosEstudiante();
                } else {
                    Swal.fire({
                        icon: 'error',
                        title: 'Error',
                        text: 'No se pudo actualizar el llamado'
                    });
                }
            }
        });
    }

    /**
     * Mostrar modal nuevo llamado
     */
    function mostrarModalNuevoLlamado() {
        console.log('📝 mostrarModalNuevoLlamado llamado');

        const cursoSelect = document.getElementById('cursoLlamados');
        const estudianteSelect = document.getElementById('estudianteLlamados');

        if (!cursoSelect.value || !estudianteSelect.value) {
            Swal.fire('Seleccione un estudiante', '', 'warning');
            return;
        }

        const cursoId = cursoSelect.value;
        const selectedOption = estudianteSelect.options[estudianteSelect.selectedIndex];
        const estudiante = {
            documento: estudianteSelect.value,
            nombre: `${selectedOption.getAttribute('data-nombres')} ${selectedOption.getAttribute('data-apellidos')}`,
            telefono: selectedOption.getAttribute('data-telefono'),
            correo: selectedOption.getAttribute('data-correo')
        };

        Swal.fire({
            title: '📝 Nuevo Llamado',
            html: `
                <form id="formNuevoLlamado" class="text-start">
                    <div class="mb-3">
                        <label class="form-label fw-bold">Tipo de Llamado</label>
                        <select class="form-select" id="nuevoTipoLlamado">
                            <option value="academico">📚 Académico</option>
                            <option value="disciplinario">⚠️ Disciplinario</option>
                        </select>
                    </div>
                    
                    <div class="mb-3">
                        <label class="form-label fw-bold">Nivel</label>
                        <select class="form-select" id="nuevoNivelLlamado">
                            <option value="1">Primer Llamado</option>
                            <option value="2">Segundo Llamado</option>
                            <option value="3">Tercer Llamado</option>
                        </select>
                    </div>
                    
                    <div class="mb-3">
                        <label class="form-label fw-bold">Docente que realiza el llamado</label>
                        <select class="form-select" id="nuevoDocenteLlamado" required>
                            <option value="">Seleccione un docente</option>
                        </select>
                    </div>
                    
                    <div class="mb-3">
                        <label class="form-label fw-bold">Motivo</label>
                        <textarea class="form-control" id="nuevoMotivo" rows="3" placeholder="Describa el motivo del llamado..."></textarea>
                    </div>
                    
                    <div class="mb-3">
                        <label class="form-label fw-bold">Compromisos</label>
                        <div id="compromisosContainer">
                            <div class="input-group mb-2">
                                <input type="text" class="form-control" placeholder="Compromiso 1" id="compromiso_0">
                                <button class="btn btn-outline-success" type="button" onclick="agregarCampoCompromiso()">
                                    <i class="fas fa-plus"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                    
                    <div class="mb-3">
                        <label class="form-label fw-bold">Observaciones</label>
                        <textarea class="form-control" id="nuevoObservaciones" rows="2"></textarea>
                    </div>
                </form>
            `,
            showCancelButton: true,
            confirmButtonText: 'Guardar',
            cancelButtonText: 'Cancelar',
            width: '600px',
            didOpen: () => {
                console.log('📌 Modal abierto, programando carga de docentes...');
                cargarDocentesEnModalConRetraso();
            },
            preConfirm: () => {
                const tipo = document.getElementById('nuevoTipoLlamado').value;
                const nivel = parseInt(document.getElementById('nuevoNivelLlamado').value);
                const docenteSelect = document.getElementById('nuevoDocenteLlamado');
                const motivo = document.getElementById('nuevoMotivo').value;
                const observaciones = document.getElementById('nuevoObservaciones').value;

                if (!docenteSelect || docenteSelect.selectedIndex <= 0) {
                    Swal.showValidationMessage('Debe seleccionar un docente');
                    return false;
                }

                if (!motivo) {
                    Swal.showValidationMessage('El motivo es obligatorio');
                    return false;
                }

                const selectedOption = docenteSelect.options[docenteSelect.selectedIndex];
                const docente = {
                    documento: selectedOption.value,
                    nombre: selectedOption.getAttribute('data-nombre') || selectedOption.text.split(' (')[0],
                    materia: selectedOption.getAttribute('data-materia') || 'Sin materia'
                };

                const compromisos = [];
                let i = 0;
                while (document.getElementById(`compromiso_${i}`)) {
                    const desc = document.getElementById(`compromiso_${i}`).value;
                    if (desc && desc.trim()) {
                        compromisos.push({
                            descripcion: desc.trim(),
                            estado: 'pendiente'
                        });
                    }
                    i++;
                }

                return {
                    curso: cursoId,
                    estudiante: estudiante,
                    fecha: new Date().toISOString().split('T')[0],
                    tipo: tipo,
                    nivel: nivel,
                    docente: docente,
                    motivo: motivo,
                    compromisos: compromisos,
                    observaciones: observaciones,
                    estado: 'activo'
                };
            }
        }).then((result) => {
            if (result.isConfirmed && result.value) {
                const nuevoLlamado = LlamadosData.agregarLlamado(result.value);
                if (nuevoLlamado) {
                    Swal.fire({
                        icon: 'success',
                        title: '✅ Llamado guardado',
                        text: 'El llamado ha sido registrado exitosamente',
                        timer: 2000,
                        showConfirmButton: false
                    });
                    cargarLlamadosEstudiante();
                }
            }
        });
    }

    /**
     * Mostrar opciones de compartir
     */
    function mostrarOpcionesCompartir(id, telefono, correo) {
        console.log('📱 Mostrando opciones de compartir:', id);

        const llamado = LlamadosData.getLlamadoPorId(id);
        if (!llamado) {
            Swal.fire('Error', 'Llamado no encontrado', 'error');
            return;
        }

        Swal.fire({
            title: '📤 Compartir Llamado',
            html: `
                <div class="text-center">
                    <p><strong>Estudiante:</strong> ${llamado.estudiante?.nombre}</p>
                    <p><strong>Documento:</strong> ${llamado.estudiante?.documento}</p>
                    <p><strong>Curso:</strong> ${llamado.curso}</p>
                    <p><strong>Docente:</strong> ${llamado.docente?.nombre || 'No asignado'}${llamado.docente?.materia ? ` (${llamado.docente.materia})` : ''}</p>
                    <p><strong>Tipo:</strong> ${llamado.tipo === 'academico' ? '📚 Académico' : '⚠️ Disciplinario'}</p>
                    <hr>
                    <p>¿Cómo desea compartir este llamado?</p>
                    <div class="row mt-3">
                        <div class="col-6">
                            <button class="btn btn-success btn-lg w-100" id="btnCompartirWhatsApp">
                                <i class="fab fa-whatsapp"></i> WhatsApp
                            </button>
                        </div>
                        <div class="col-6">
                            <button class="btn btn-primary btn-lg w-100" id="btnCompartirEmail">
                                <i class="fas fa-envelope"></i> Email
                            </button>
                        </div>
                    </div>
                    <div class="mt-3 text-muted small">
                        ${!telefono ? '⚠️ No hay teléfono registrado' : ''}
                        ${!correo ? '⚠️ No hay email registrado' : ''}
                    </div>
                </div>
            `,
            showConfirmButton: false,
            showCloseButton: true,
            didOpen: () => {
                document.getElementById('btnCompartirWhatsApp').addEventListener('click', () => {
                    if (telefono) {
                        compartirWhatsAppDirecto(llamado, telefono);
                    } else {
                        Swal.fire({
                            icon: 'warning',
                            title: 'Sin teléfono',
                            text: 'El estudiante no tiene número registrado'
                        });
                    }
                });

                document.getElementById('btnCompartirEmail').addEventListener('click', () => {
                    if (correo) {
                        compartirEmailDirecto(llamado, correo);
                    } else {
                        Swal.fire({
                            icon: 'warning',
                            title: 'Sin correo',
                            text: 'El estudiante no tiene email registrado'
                        });
                    }
                });
            }
        });
    }

    /**
     * Compartir por WhatsApp
     */
    function compartirWhatsAppDirecto(llamado, telefono) {
        const mensaje = prepararMensaje(llamado);
        const numero = telefono.replace(/\D/g, '');
        const url = `https://wa.me/${numero}?text=${encodeURIComponent(mensaje)}`;
        window.open(url, '_blank');

        Swal.fire({
            icon: 'success',
            title: 'WhatsApp abierto',
            text: 'Adjunte el PDF manualmente si es necesario',
            timer: 2000,
            showConfirmButton: false
        });
    }

    /**
     * Compartir por Email
     */
    function compartirEmailDirecto(llamado, correo) {
        const mensaje = prepararMensaje(llamado);
        const asunto = `Llamado de Atención - ${llamado.estudiante?.nombre}`;
        const url = `mailto:${correo}?subject=${encodeURIComponent(asunto)}&body=${encodeURIComponent(mensaje)}`;
        window.location.href = url;

        Swal.fire({
            icon: 'success',
            title: 'Cliente de correo abierto',
            text: 'Adjunte el PDF manualmente',
            timer: 2000,
            showConfirmButton: false
        });
    }

    /**
     * Prepara mensaje para compartir
     */
    function prepararMensaje(llamado) {
        const estado = llamado.estado === 'activo' ? '🟡 Activo' : '✅ Cumplido';

        return `
*SENA - Sistema de Gestión*
*LLAMADO DE ATENCIÓN*

*Estudiante:* ${llamado.estudiante?.nombre}
*Documento:* ${llamado.estudiante?.documento}
*Curso:* ${llamado.curso}
*Docente:* ${llamado.docente?.nombre || 'No asignado'}${llamado.docente?.materia ? ` (${llamado.docente.materia})` : ''}
*Tipo:* ${llamado.tipo === 'academico' ? '📚 Académico' : '⚠️ Disciplinario'}
*Fecha:* ${llamado.fecha}
*Estado:* ${estado}

*Motivo:*
${llamado.motivo}

*Compromisos:*
${llamado.compromisos?.map(c => `• ${c.descripcion} (${c.estado})`).join('\n') || 'Ninguno'}

*Observaciones:* ${llamado.observaciones || 'Ninguna'}

--- 
Documento generado automáticamente.
        `.trim();
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

    // Auto-inicializar
    setTimeout(() => {
        inicializarSelectores();
    }, 1000);

    // API pública
    return {
        inicializarSelectores,
        cargarEstudiantesLlamados,
        cargarLlamadosEstudiante,
        renderizarTablaLlamados,
        verDetalle,
        cambiarEstado,
        mostrarOpcionesCompartir,
        editarLlamado,
        duplicarLlamado,
        eliminarLlamado,
        mostrarModalNuevoLlamado
    };
})();

// Funciones globales para los formularios
window.agregarCampoCompromiso = function () {
    const container = document.getElementById('compromisosContainer');
    if (!container) return;

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
};

window.agregarCampoCompromisoEdit = function () {
    const container = document.getElementById('editCompromisosContainer');
    if (!container) return;

    const count = container.children.length;
    const div = document.createElement('div');
    div.className = 'input-group mb-2';
    div.innerHTML = `
        <input type="text" class="form-control" placeholder="Compromiso ${count + 1}" id="edit_compromiso_${count}">
        <button class="btn btn-outline-warning" type="button" onclick="cambiarEstadoCompromiso(this, ${count})" title="Pendiente">
            <i class="fas fa-clock"></i>
        </button>
        <button class="btn btn-outline-danger" type="button" onclick="this.parentElement.remove()">
            <i class="fas fa-times"></i>
        </button>
        <input type="hidden" id="edit_compromiso_estado_${count}" value="pendiente">
    `;
    container.appendChild(div);
};

window.cambiarEstadoCompromiso = function (btn, index) {
    const estadoInput = document.getElementById(`edit_compromiso_estado_${index}`);
    if (!estadoInput) return;

    if (estadoInput.value === 'pendiente') {
        estadoInput.value = 'cumplido';
        btn.className = 'btn btn-outline-success';
        btn.innerHTML = '<i class="fas fa-check-circle"></i>';
        btn.title = 'Cumplido';
    } else {
        estadoInput.value = 'pendiente';
        btn.className = 'btn btn-outline-warning';
        btn.innerHTML = '<i class="fas fa-clock"></i>';
        btn.title = 'Pendiente';
    }
};

console.log('✅ Módulo LlamadosUI v3.13 cargado correctamente');
window.LlamadosUI = LlamadosUI;