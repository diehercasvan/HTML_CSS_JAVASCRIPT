// js/modules/planes/planesUI.js
// Versión 2.2 - CORRECCIÓN DE CARGA DE INSTRUCTORES Y ERROR DE INICIALIZACIÓN

console.log('🔄 Cargando módulo planesUI.js v2.2...');

const PlanesUI = (function () {

    let estudiantesCache = {};
    let instructoresCache = {};
    let todosLosResponsables = [];

    // ========== NUEVA FUNCIÓN: Cargar todos los responsables ==========

    async function cargarTodosLosResponsables() {
        console.log('👨‍🏫 Cargando todos los responsables para planes...');

        try {
            // Intentar desde JSON directo primero
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
                        return todosLosResponsables;
                    }
                }
            } catch (e) {
                console.error('❌ Error cargando JSON:', e);
            }

            // Si falla el JSON, intentar con DataManager
            if (DataManager.getResponsables) {
                console.log('🔄 Intentando con DataManager.getResponsables...');
                const dataManagerResponsables = DataManager.getResponsables() || [];
                todosLosResponsables = dataManagerResponsables.map(r => ({
                    numeroCurso: String(r.numeroCurso || '').trim(),
                    nombre: r.nombre || '',
                    documento: r.documento || '',
                    materia: r.materia || 'Sin materia'
                }));
                console.log(`✅ Cargados ${todosLosResponsables.length} responsables desde DataManager`);
            }

            return todosLosResponsables;

        } catch (error) {
            console.error('❌ Error cargando responsables:', error);
            todosLosResponsables = [];
            return [];
        }
    }

    // ========== NUEVA FUNCIÓN: Obtener instructores por curso ==========

    function getInstructoresPorCurso(cursoId) {
        console.log(`🔍 Buscando instructores para curso ${cursoId}`);

        if (!cursoId) return [];

        const instructores = todosLosResponsables.filter(r =>
            String(r.numeroCurso).trim() === String(cursoId).trim()
        );

        console.log(`✅ Encontrados: ${instructores.length} instructores para curso ${cursoId}`);

        // Guardar en caché
        instructoresCache[cursoId] = instructores;

        return instructores;
    }

    // ========== NUEVA FUNCIÓN: Cargar instructores en el modal ==========

    function cargarInstructoresEnModal() {
        console.log('👨‍🏫 Cargando instructores en el modal de planes...');

        const cursoSelect = document.getElementById('cursoPlanes');
        const instructoresSelect = document.getElementById('planInstructores');

        if (!cursoSelect || !instructoresSelect) {
            console.warn('⚠️ Selector de instructores no encontrado');
            return;
        }

        const cursoId = cursoSelect.value;

        if (!cursoId) {
            instructoresSelect.innerHTML = '<option value="">Primero seleccione un curso</option>';
            return;
        }

        const instructores = getInstructoresPorCurso(cursoId);

        instructoresSelect.innerHTML = '';

        if (instructores.length === 0) {
            const option = document.createElement('option');
            option.value = '';
            option.disabled = true;
            option.textContent = 'No hay instructores para este curso';
            instructoresSelect.appendChild(option);
            return;
        }

        instructores.forEach(instructor => {
            const option = document.createElement('option');
            option.value = instructor.documento;
            option.setAttribute('data-nombre', instructor.nombre);
            option.setAttribute('data-materia', instructor.materia);
            option.textContent = `${instructor.nombre} - ${instructor.materia}`;
            option.selected = true;
            instructoresSelect.appendChild(option);
        });

        console.log(`✅ ${instructores.length} instructores cargados en el modal`);
    }

    // ========== FUNCIONES AUXILIARES ==========

    function agregarCompetenciaSelector() {
        const container = document.getElementById('competenciasContainer');
        if (!container || !window.competenciasDelCurso) return;

        const index = container.children.length;
        const competencias = window.competenciasDelCurso;

        const div = document.createElement('div');
        div.className = 'card mb-2 competencia-item';
        div.setAttribute('data-index', index);
        div.innerHTML = `
            <div class="card-header bg-light d-flex justify-content-between align-items-center">
                <span><strong>Competencia ${index + 1}</strong></span>
                <button type="button" class="btn btn-sm btn-danger" onclick="if(window.PlanesUI) PlanesUI.eliminarCompetencia(this)">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="card-body">
                <div class="mb-2">
                    <label class="form-label">Seleccione la competencia no superada:</label>
                    <select class="form-select" id="comp_select_${index}" onchange="if(window.PlanesUI) PlanesUI.cargarResultadosCompetencia(${index})">
                        <option value="">Seleccione una competencia</option>
                        ${competencias.map(c => {
            const resultadosStr = JSON.stringify(c.resultados).replace(/'/g, "&#39;");
            return `<option value="${c.id}" data-resultados='${resultadosStr}'>${c.nombre}</option>`;
        }).join('')}
                    </select>
                </div>
                <div class="mb-2">
                    <label class="form-label">Resultados de Aprendizaje no superados:</label>
                    <div id="resultados_container_${index}" class="resultados-container"></div>
                </div>
                <div class="mt-3">
                    <label class="form-label fw-bold">Actividades de Mejoramiento:</label>
                    <div id="actividades_container_${index}" class="actividades-container"></div>
                    <button type="button" class="btn btn-sm btn-outline-success mt-1" onclick="if(window.PlanesUI) PlanesUI.agregarActividad(${index})">
                        <i class="fas fa-plus"></i> Agregar Actividad
                    </button>
                </div>
            </div>
        `;

        container.appendChild(div);
    }

    function agregarActividad(competenciaIndex) {
        const container = document.getElementById(`actividades_container_${competenciaIndex}`);
        if (!container) return;

        const count = container.children.length;

        const div = document.createElement('div');
        div.className = 'card mb-2 bg-light';
        div.setAttribute('data-actividad', count);
        div.innerHTML = `
            <div class="card-body p-2">
                <div class="row">
                    <div class="col-md-1">
                        <span class="badge bg-secondary">${count + 1}</span>
                    </div>
                    <div class="col-md-4">
                        <input type="text" class="form-control form-control-sm" placeholder="Actividad a realizar" id="comp_${competenciaIndex}_act_${count}_desc">
                    </div>
                    <div class="col-md-3">
                        <input type="text" class="form-control form-control-sm" placeholder="Evidencia" id="comp_${competenciaIndex}_act_${count}_evidencia">
                    </div>
                    <div class="col-md-3">
                        <input type="date" class="form-control form-control-sm" id="comp_${competenciaIndex}_act_${count}_fecha">
                    </div>
                    <div class="col-md-1">
                        <button class="btn btn-sm btn-danger" type="button" onclick="this.closest('.card').remove()">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;

        container.appendChild(div);
    }

    function agregarRecurso() {
        const container = document.getElementById('recursosContainer');
        if (!container) return;

        const count = container.children.length;

        const div = document.createElement('div');
        div.className = 'input-group mb-2';
        div.innerHTML = `
            <input type="text" class="form-control" placeholder="Recurso ${count + 1}" id="recurso_${count}">
            <button class="btn btn-outline-danger" type="button" onclick="this.parentElement.remove()">
                <i class="fas fa-times"></i>
            </button>
        `;

        container.appendChild(div);
    }

    function eliminarCompetencia(boton) {
        boton.closest('.competencia-item').remove();
    }

    function cargarResultadosCompetencia(competenciaIndex) {
        const select = document.getElementById(`comp_select_${competenciaIndex}`);
        const container = document.getElementById(`resultados_container_${competenciaIndex}`);

        if (!select || !container) return;

        const selectedOption = select.options[select.selectedIndex];
        if (!selectedOption || !selectedOption.value) {
            container.innerHTML = '';
            return;
        }

        let resultados = [];
        try {
            const dataResultados = selectedOption.getAttribute('data-resultados');
            resultados = dataResultados ? JSON.parse(dataResultados) : [];
        } catch (e) {
            console.error('Error parsing resultados:', e);
        }

        let html = '<div class="border p-2 rounded">';
        resultados.forEach((resultado, idx) => {
            html += `
                <div class="form-check">
                    <input class="form-check-input" type="checkbox" id="comp_${competenciaIndex}_rap_${idx}" value="${resultado}">
                    <label class="form-check-label" for="comp_${competenciaIndex}_rap_${idx}">
                        ${resultado}
                    </label>
                </div>
            `;
        });
        html += '</div>';

        container.innerHTML = html;
    }

    function validarYGuardarPlan(estudiante, cursoId, cursoNombre) {
        console.log('💾 Validando y guardando plan...');

        const selectInstructores = document.getElementById('planInstructores');
        const instructoresSeleccionados = Array.from(selectInstructores.selectedOptions).map(opt => ({
            documento: opt.value,
            nombre: opt.getAttribute('data-nombre') || opt.text.split(' - ')[0],
            materia: opt.getAttribute('data-materia') || (opt.text.includes(' - ') ? opt.text.split(' - ')[1] : 'Sin materia')
        }));

        const recursos = [];
        let i = 0;
        while (document.getElementById(`recurso_${i}`)) {
            const val = document.getElementById(`recurso_${i}`).value;
            if (val && val.trim()) recursos.push(val.trim());
            i++;
        }

        const competencias = [];
        const competenciasContainer = document.getElementById('competenciasContainer');

        if (!competenciasContainer || competenciasContainer.children.length === 0) {
            Swal.showValidationMessage('Debe agregar al menos una competencia');
            return false;
        }

        Array.from(competenciasContainer.children).forEach((compDiv, compIndex) => {
            const select = document.getElementById(`comp_select_${compIndex}`);
            if (!select || !select.value) return;

            const selectedOption = select.options[select.selectedIndex];
            const nombreCompetencia = selectedOption.text;

            const resultados = [];
            const checkboxes = document.querySelectorAll(`#resultados_container_${compIndex} input[type="checkbox"]:checked`);
            checkboxes.forEach(cb => {
                resultados.push(cb.value);
            });

            if (resultados.length === 0) return;

            const actividades = [];
            const actividadesContainer = document.getElementById(`actividades_container_${compIndex}`);
            if (actividadesContainer) {
                Array.from(actividadesContainer.children).forEach((actDiv, actIndex) => {
                    const desc = document.getElementById(`comp_${compIndex}_act_${actIndex}_desc`)?.value;
                    const evidencia = document.getElementById(`comp_${compIndex}_act_${actIndex}_evidencia`)?.value;
                    const fecha = document.getElementById(`comp_${compIndex}_act_${actIndex}_fecha`)?.value;

                    if (desc && desc.trim()) {
                        actividades.push({
                            numero: actIndex + 1,
                            descripcion: desc.trim(),
                            evidencia: evidencia || '',
                            fechaEntrega: fecha || '',
                            estado: 'pendiente'
                        });
                    }
                });
            }

            competencias.push({
                nombre: nombreCompetencia,
                resultados: resultados,
                actividades: actividades
            });
        });

        if (competencias.length === 0) {
            Swal.showValidationMessage('Debe seleccionar al menos una competencia con sus resultados');
            return false;
        }

        const nuevoPlan = {
            fechaSuscripcion: document.getElementById('planFechaSuscripcion').value,
            plazoEjecucion: document.getElementById('planPlazo').value,
            aprendiz: {
                documento: estudiante.documento,
                nombre: estudiante.nombreCompleto,
                tipoDocumento: document.getElementById('planTipoDocumento').value,
                telefono: document.getElementById('planTelefono').value,
                correo: document.getElementById('planCorreo').value
            },
            curso: {
                id: cursoId,
                nombre: cursoNombre,
                grupo: cursoId
            },
            instructores: instructoresSeleccionados,
            competencias: competencias,
            recursos: recursos,
            observaciones: document.getElementById('planObservaciones').value,
            estado: 'en_curso'
        };

        console.log('📦 Plan validado:', nuevoPlan);
        return nuevoPlan;
    }

    // ========== FUNCIONES PRINCIPALES ==========

    async function inicializarSelectores() {
        console.log('🔄 ===== INICIANDO INICIALIZACIÓN DE PLANES =====');

        await cargarTodosLosResponsables();

        const cursoSelect = document.getElementById('cursoPlanes');
        if (!cursoSelect) {
            console.error('❌ Selector de cursos no encontrado');
            return;
        }

        let cursos = DataManager.getCursos ? DataManager.getCursos() : [];

        if (cursos.length === 0 && DataManager.cargarCursos) {
            cursos = await DataManager.cargarCursos();
        }

        cursoSelect.innerHTML = '<option value="">Seleccione un curso</option>';

        cursos.forEach(curso => {
            const option = document.createElement('option');
            option.value = curso.id;
            option.textContent = `${curso.id} - ${curso.nombre}`;
            cursoSelect.appendChild(option);
        });

        console.log(`✅ Selector inicializado con ${cursos.length} cursos`);

        cursoSelect.addEventListener('change', function () {
            console.log('📌 Curso cambiado a:', this.value);
            cargarEstudiantes();
        });
    }

    async function cargarEstudiantes() {
        console.log('🔄 Cargando estudiantes...');

        const cursoSelect = document.getElementById('cursoPlanes');
        const estudianteSelect = document.getElementById('estudiantePlanes');

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
                option.setAttribute('data-email', est.correo || '');
                option.setAttribute('data-telefono', est.celular || '');
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
     * Muestra formulario nuevo plan (MODIFICADO)
     */
    async function mostrarFormularioNuevo() {
        console.log('📝 Mostrando formulario nuevo plan');

        const cursoSelect = document.getElementById('cursoPlanes');
        const estudianteSelect = document.getElementById('estudiantePlanes');

        if (!cursoSelect.value || !estudianteSelect.value) {
            Swal.fire({
                icon: 'warning',
                title: 'Campos requeridos',
                text: 'Debe seleccionar un curso y un estudiante'
            });
            return;
        }

        const cursoId = cursoSelect.value;
        const cursoNombre = cursoSelect.options[cursoSelect.selectedIndex]?.textContent || cursoId;

        const competencias = await DataManager.getCompetenciasPorCurso ?
            await DataManager.getCompetenciasPorCurso(cursoId) : [];

        if (competencias.length === 0) {
            Swal.fire({
                icon: 'warning',
                title: 'Sin competencias',
                text: 'El curso no tiene competencias definidas'
            });
            return;
        }

        const selectedOption = estudianteSelect.options[estudianteSelect.selectedIndex];
        const estudiante = {
            documento: estudianteSelect.value,
            nombres: selectedOption.getAttribute('data-nombres'),
            apellidos: selectedOption.getAttribute('data-apellidos'),
            email: selectedOption.getAttribute('data-email') || '',
            telefono: selectedOption.getAttribute('data-telefono') || '',
            nombreCompleto: `${selectedOption.getAttribute('data-nombres')} ${selectedOption.getAttribute('data-apellidos')}`
        };

        const hoy = new Date();
        const plazo = new Date(hoy);
        plazo.setDate(hoy.getDate() + 20);
        const fechaPlazo = plazo.toISOString().split('T')[0];
        const fechaHoy = hoy.toISOString().split('T')[0];

        Swal.fire({
            title: '📋 NUEVO PLAN DE MEJORAMIENTO',
            width: '1000px',
            html: `
            <form id="formPlanMejoramiento" class="text-start" style="max-height: 70vh; overflow-y: auto; padding: 10px;">
                <div style="background: #003366; color: white; padding: 15px; margin-bottom: 20px; border-radius: 5px;">
                    <h5 style="margin:0;">SERVICIO NACIONAL DE APRENDIZAJE - SENA</h5>
                    <h6 style="margin:5px 0 0 0;">CENTRO DE ELECTRICIDAD, ELECTRÓNICA Y TELECOMUNICACIONES - CEET</h6>
                    <p style="margin:10px 0 0 0; font-size: 12px;">Acuerdo 009 de 2024 - Artículo 46</p>
                </div>
                
                <div class="row mb-3">
                    <div class="col-md-6">
                        <label class="form-label fw-bold">PROGRAMA DE FORMACIÓN:</label>
                        <input type="text" class="form-control" value="${cursoNombre}" readonly>
                    </div>
                    <div class="col-md-6">
                        <label class="form-label fw-bold">GRUPO No.:</label>
                        <input type="text" class="form-control" value="${cursoId}" readonly>
                    </div>
                </div>
                
                <div class="row mb-3">
                    <div class="col-md-6">
                        <label class="form-label fw-bold">APRENDIZ:</label>
                        <input type="text" class="form-control" value="${estudiante.nombreCompleto}" readonly>
                    </div>
                    <div class="col-md-2">
                        <label class="form-label fw-bold">TIPO DOC.:</label>
                        <select class="form-select" id="planTipoDocumento">
                            <option value="CC">CC</option>
                            <option value="TI">TI</option>
                            <option value="CE">CE</option>
                        </select>
                    </div>
                    <div class="col-md-4">
                        <label class="form-label fw-bold">DOCUMENTO:</label>
                        <input type="text" class="form-control" value="${estudiante.documento}" readonly>
                    </div>
                </div>
                
                <div class="row mb-3">
                    <div class="col-md-6">
                        <label class="form-label fw-bold">TELÉFONO / CELULAR:</label>
                        <input type="text" class="form-control" id="planTelefono" value="${estudiante.telefono}">
                    </div>
                    <div class="col-md-6">
                        <label class="form-label fw-bold">CORREO ELECTRÓNICO:</label>
                        <input type="email" class="form-control" id="planCorreo" value="${estudiante.email}">
                    </div>
                </div>
                
                <div class="row mb-3">
                    <div class="col-md-6">
                        <label class="form-label fw-bold">INSTRUCTOR(ES):</label>
                        <select class="form-select" id="planInstructores" multiple size="3">
                            <!-- Se llenará en didOpen -->
                        </select>
                    </div>
                    <div class="col-md-3">
                        <label class="form-label fw-bold">FECHA SUSCRIPCIÓN:</label>
                        <input type="date" class="form-control" id="planFechaSuscripcion" value="${fechaHoy}" readonly>
                    </div>
                    <div class="col-md-3">
                        <label class="form-label fw-bold">PLAZO (20 días):</label>
                        <input type="date" class="form-control" id="planPlazo" value="${fechaPlazo}" readonly>
                    </div>
                </div>
                
                <div class="card mb-3">
                    <div class="card-header bg-primary text-white">
                        <h6 class="mb-0">1. COMPETENCIAS, RESULTADOS Y ACTIVIDADES</h6>
                    </div>
                    <div class="card-body">
                        <div id="competenciasContainer"></div>
                        <button type="button" class="btn btn-sm btn-outline-primary mt-2" onclick="PlanesUI.agregarCompetenciaSelector()">
                            <i class="fas fa-plus"></i> Agregar Competencia
                        </button>
                    </div>
                </div>
                
                <div class="card mb-3">
                    <div class="card-header bg-info text-white">
                        <h6 class="mb-0">3. RECURSOS Y ESTRATEGIAS DE APOYO</h6>
                    </div>
                    <div class="card-body">
                        <div id="recursosContainer">
                            <div class="input-group mb-2">
                                <input type="text" class="form-control" placeholder="Ej: Tutorías: Lunes y miércoles de 2pm a 4pm" id="recurso_0">
                                <button class="btn btn-outline-success" type="button" onclick="PlanesUI.agregarRecurso()">
                                    <i class="fas fa-plus"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="mb-3">
                    <label class="form-label fw-bold">OBSERVACIONES GENERALES:</label>
                    <textarea class="form-control" id="planObservaciones" rows="2"></textarea>
                </div>
            </form>
        `,
            showCancelButton: true,
            confirmButtonText: '✅ Generar Plan',
            cancelButtonText: '❌ Cancelar',
            confirmButtonColor: '#28a745',
            didOpen: () => {
                console.log('📌 Modal abierto, cargando instructores...');
                window.competenciasDelCurso = competencias;
                agregarCompetenciaSelector();
                setTimeout(() => {
                    cargarInstructoresEnModal();
                }, 200);
            },
            preConfirm: () => {
                return validarYGuardarPlan(estudiante, cursoId, cursoNombre);
            }
        }).then((result) => {
            if (result.isConfirmed && result.value) {
                const resultado = PlanesData.agregarPlan(result.value);
                if (resultado) {
                    Swal.fire({
                        icon: 'success',
                        title: '✅ Plan guardado',
                        text: 'El plan de mejoramiento ha sido creado exitosamente',
                        timer: 2000,
                        showConfirmButton: false
                    });
                    verPlanes();
                }
            }
        });
    }

    /**
     * Preparar mensaje para compartir
     */
    function prepararMensajePlan(plan) {
        const estado = plan.estado === 'en_curso' ? '🟡 En Curso' :
            plan.estado === 'aprobado' ? '✅ Aprobado' : '❌ No Aprobado';

        const hoy = new Date();
        const plazo = new Date(plan.plazoEjecucion);
        const diffTime = plazo - hoy;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        const diasRestantes = diffDays > 0 ? `${diffDays} días restantes` : 'PLAZO VENCIDO';

        const totalCompetencias = plan.competencias.length;
        const totalActividades = plan.competencias.reduce((acc, c) =>
            acc + (c.actividades?.length || 0), 0);

        let mensaje = `
*SENA - Sistema de Gestión*
*PLAN DE MEJORAMIENTO ACADÉMICO*

*APRENDIZ:*
• Nombre: ${plan.aprendiz.nombre}
• Documento: ${plan.aprendiz.tipoDocumento} ${plan.aprendiz.documento}
• Teléfono: ${plan.aprendiz.telefono || 'No registrado'}
• Correo: ${plan.aprendiz.correo || 'No registrado'}

*CURSO:*
• Programa: ${plan.curso.nombre}
• Grupo: ${plan.curso.grupo}

*FECHAS:*
• Suscripción: ${plan.fechaSuscripcion}
• Plazo máximo: ${plan.plazoEjecucion}
• Estado plazo: ${diasRestantes}

*COMPETENCIAS A MEJORAR: (${totalCompetencias})*
${plan.competencias.map(c => `• ${c.nombre}`).join('\n')}

*ACTIVIDADES: (${totalActividades})*
${plan.competencias.map(c =>
            c.actividades?.map(a => `  - ${a.descripcion} (Entrega: ${a.fechaEntrega || 'N/A'})`).join('\n')
        ).filter(a => a).join('\n') || '  No hay actividades registradas'}

*RECURSOS DE APOYO:*
${plan.recursos?.map(r => `• ${r}`).join('\n') || '• No se registraron recursos adicionales'}

*ESTADO DEL PLAN:* ${estado}

${plan.observaciones ? `*OBSERVACIONES:*\n${plan.observaciones}` : ''}

*INSTRUCTOR(ES):*
${plan.instructores.map(i => `• ${i.nombre} (${i.materia})`).join('\n')}

---
Documento generado por el Sistema de Gestión de Salones - SENA CEET
        `.trim();

        return mensaje;
    }

    /**
     * Mostrar opciones para compartir plan
     */
    function mostrarOpcionesCompartir(id) {
        console.log('📱 Mostrando opciones de compartir para plan:', id);

        const plan = PlanesData.getPlanPorId(id);
        if (!plan) {
            Swal.fire('Error', 'Plan no encontrado', 'error');
            return;
        }

        const telefono = plan.aprendiz.telefono;
        const correo = plan.aprendiz.correo;

        Swal.fire({
            title: '📤 Compartir Plan de Mejoramiento',
            html: `
                <div class="text-center">
                    <p><strong>Aprendiz:</strong> ${plan.aprendiz.nombre}</p>
                    <p><strong>Documento:</strong> ${plan.aprendiz.documento}</p>
                    <p><strong>Curso:</strong> ${plan.curso.nombre}</p>
                    <p><strong>Plazo:</strong> ${plan.plazoEjecucion}</p>
                    <hr>
                    <p>¿Cómo desea compartir este plan?</p>
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
                    <div class="row mt-2">
                        <div class="col-12">
                            <button class="btn btn-danger btn-lg w-100" id="btnCompartirPDF">
                                <i class="fas fa-file-pdf"></i> Compartir PDF
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
                        compartirWhatsAppPlan(plan, telefono);
                    } else {
                        Swal.fire({
                            icon: 'warning',
                            title: 'Sin teléfono',
                            text: 'El aprendiz no tiene número registrado'
                        });
                    }
                });

                document.getElementById('btnCompartirEmail').addEventListener('click', () => {
                    if (correo) {
                        compartirEmailPlan(plan, correo);
                    } else {
                        Swal.fire({
                            icon: 'warning',
                            title: 'Sin correo',
                            text: 'El aprendiz no tiene email registrado'
                        });
                    }
                });

                document.getElementById('btnCompartirPDF').addEventListener('click', () => {
                    Swal.close();
                    setTimeout(() => {
                        GeneradorPlanPDF.generarPDF(id);
                    }, 300);
                });
            }
        });
    }

    /**
     * Compartir por WhatsApp
     */
    function compartirWhatsAppPlan(plan, telefono) {
        const mensaje = prepararMensajePlan(plan);
        const numero = telefono.replace(/\D/g, '');
        const url = `https://wa.me/${numero}?text=${encodeURIComponent(mensaje)}`;
        window.open(url, '_blank');

        Swal.fire({
            icon: 'success',
            title: 'WhatsApp abierto',
            text: 'El mensaje ha sido preparado',
            timer: 2000,
            showConfirmButton: false
        });
    }

    /**
     * Compartir por Email
     */
    function compartirEmailPlan(plan, correo) {
        const mensaje = prepararMensajePlan(plan);
        const asunto = `Plan de Mejoramiento - ${plan.aprendiz.nombre}`;
        const url = `mailto:${correo}?subject=${encodeURIComponent(asunto)}&body=${encodeURIComponent(mensaje)}`;
        window.location.href = url;

        Swal.fire({
            icon: 'success',
            title: 'Cliente de correo abierto',
            text: 'El mensaje ha sido preparado',
            timer: 2000,
            showConfirmButton: false
        });
    }

    /**
     * Ver planes del estudiante
     */
    function verPlanes() {
        console.log('📋 Ver planes del estudiante...');

        const estudianteSelect = document.getElementById('estudiantePlanes');
        const contenedor = document.getElementById('contenedorPlanes');

        if (!estudianteSelect || !estudianteSelect.value) {
            Swal.fire({
                icon: 'warning',
                title: 'Seleccione un estudiante',
                text: 'Debe seleccionar un estudiante para ver sus planes'
            });
            return;
        }

        const documento = estudianteSelect.value;
        const planes = PlanesData.getPlanesPorEstudiante(documento);

        if (planes.length === 0) {
            contenedor.innerHTML = '<p class="text-muted">No hay planes de mejoramiento para este estudiante</p>';
            return;
        }

        let html = `
            <div class="table-responsive">
                <table class="table table-striped table-hover table-bordered">
                    <thead class="table-dark">
                        <tr>
                            <th>Fecha</th>
                            <th>Plazo</th>
                            <th>Días</th>
                            <th>Comp.</th>
                            <th>Actividades</th>
                            <th>Progreso</th>
                            <th>Estado</th>
                            <th>Instructor</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
        `;

        planes.forEach(p => {
            const totalActividades = p.competencias?.reduce((acc, c) =>
                acc + (c.actividades?.length || 0), 0) || 0;

            const actividadesCompletadas = p.competencias?.reduce((acc, c) =>
                acc + (c.actividades?.filter(a => a.estado === 'completada').length || 0), 0) || 0;

            const progreso = totalActividades > 0 ? Math.round((actividadesCompletadas / totalActividades) * 100) : 0;

            const hoy = new Date();
            const plazo = new Date(p.plazoEjecucion);
            const diffTime = plazo - hoy;
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

            const diasRestantes = diffDays > 0 ?
                `<span class="badge ${diffDays <= 5 ? 'bg-danger' : diffDays <= 10 ? 'bg-warning' : 'bg-success'}">${diffDays}d</span>` :
                '<span class="badge bg-danger">Vencido</span>';

            const estadoMap = {
                'en_curso': { clase: 'bg-warning', texto: 'En Curso' },
                'aprobado': { clase: 'bg-success', texto: 'Aprobado' },
                'no_aprobado': { clase: 'bg-danger', texto: 'No Aprobado' }
            };

            const estado = estadoMap[p.estado] || { clase: 'bg-secondary', texto: p.estado || 'N/A' };

            html += `
                <tr>
                    <td>${p.fechaSuscripcion || 'N/A'}</td>
                    <td>${p.plazoEjecucion || 'N/A'}</td>
                    <td>${diasRestantes}</td>
                    <td>${p.competencias?.length || 0}</td>
                    <td>${totalActividades}</td>
                    <td>
                        <div class="progress" style="height: 20px;">
                            <div class="progress-bar bg-info" role="progressbar" 
                                 style="width: ${progreso}%;" 
                                 aria-valuenow="${progreso}" aria-valuemin="0" aria-valuemax="100">
                                ${progreso}%
                            </div>
                        </div>
                    </td>
                    <td><span class="badge ${estado.clase}">${estado.texto}</span></td>
                    <td>${p.instructores?.map(i => i.nombre.split(' ')[0]).join(', ') || 'N/A'}</td>
                    <td>
                        <div class="btn-group" role="group">
                            <button class="btn btn-sm btn-primary" onclick="PlanesUI.verDetalle('${p.id}')" title="Ver detalle">
                                <i class="fas fa-eye"></i>
                            </button>
                            <button class="btn btn-sm btn-info" onclick="GeneradorPlanPDF.generarPDF('${p.id}')" title="Generar PDF">
                                <i class="fas fa-file-pdf"></i>
                            </button>
                            <button class="btn btn-sm btn-success" onclick="PlanesUI.mostrarOpcionesCompartir('${p.id}')" title="Compartir">
                                <i class="fas fa-share-alt"></i>
                            </button>
                            <button class="btn btn-sm btn-warning" onclick="PlanesUI.editarPlan('${p.id}')" title="Editar plan">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="btn btn-sm btn-danger" onclick="PlanesUI.eliminarPlan('${p.id}')" title="Eliminar plan">
                                <i class="fas fa-trash"></i>
                            </button>
                            <button class="btn btn-sm btn-secondary" onclick="PlanesUI.cambiarEstado('${p.id}')" title="Cambiar estado">
                                <i class="fas fa-sync-alt"></i>
                            </button>
                        </div>
                    </td>
                </tr>
            `;
        });

        html += '</tbody></table></div>';
        contenedor.innerHTML = html;
    }

    // ========== FUNCIONES DE ACCIONES ==========

    function verDetalle(id) {
        console.log('🔍 Ver detalle del plan:', id);
        const plan = PlanesData.getPlanPorId(id);

        if (!plan) {
            Swal.fire('Error', 'Plan no encontrado', 'error');
            return;
        }

        let competenciasHtml = '';
        plan.competencias.forEach((comp, idx) => {
            competenciasHtml += `
                <div class="card mb-2">
                    <div class="card-header bg-light">
                        <strong>Competencia ${idx + 1}:</strong> ${comp.nombre}
                    </div>
                    <div class="card-body">
                        <p><strong>Resultados no superados:</strong></p>
                        <ul>
                            ${comp.resultados.map(r => `<li>${r}</li>`).join('')}
                        </ul>
                        ${comp.actividades && comp.actividades.length > 0 ? `
                            <p><strong>Actividades:</strong></p>
                            <table class="table table-sm table-bordered">
                                <thead>
                                    <tr>
                                        <th>#</th>
                                        <th>Actividad</th>
                                        <th>Evidencia</th>
                                        <th>Fecha Entrega</th>
                                        <th>Estado</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${comp.actividades.map(a => `
                                        <tr>
                                            <td>${a.numero}</td>
                                            <td>${a.descripcion}</td>
                                            <td>${a.evidencia || 'N/A'}</td>
                                            <td>${a.fechaEntrega || 'N/A'}</td>
                                            <td><span class="badge ${a.estado === 'pendiente' ? 'bg-warning' : 'bg-success'}">${a.estado || 'pendiente'}</span></td>
                                        </tr>
                                    `).join('')}
                                </tbody>
                            </table>
                        ` : '<p class="text-muted">No hay actividades registradas</p>'}
                    </div>
                </div>
            `;
        });

        Swal.fire({
            title: '📋 Detalle del Plan de Mejoramiento',
            width: '900px',
            html: `
                <div class="text-start">
                    <div class="row mb-3">
                        <div class="col-md-6">
                            <p><strong>Fecha suscripción:</strong> ${plan.fechaSuscripcion}</p>
                            <p><strong>Plazo ejecución:</strong> ${plan.plazoEjecucion}</p>
                        </div>
                        <div class="col-md-6">
                            <p><strong>Estado:</strong> 
                                <span class="badge ${plan.estado === 'en_curso' ? 'bg-warning' : plan.estado === 'aprobado' ? 'bg-success' : 'bg-danger'}">
                                    ${plan.estado}
                                </span>
                            </p>
                        </div>
                    </div>
                    
                    <h6 class="fw-bold">Información del Aprendiz:</h6>
                    <div class="row mb-3 bg-light p-2 rounded">
                        <div class="col-md-6">${plan.aprendiz.nombre}</div>
                        <div class="col-md-3">${plan.aprendiz.tipoDocumento}: ${plan.aprendiz.documento}</div>
                        <div class="col-md-3">${plan.aprendiz.telefono}</div>
                    </div>
                    
                    <h6 class="fw-bold">Instructores:</h6>
                    <div class="mb-3">
                        ${plan.instructores.map(i => `<span class="badge bg-info me-1">${i.nombre} (${i.materia})</span>`).join('')}
                    </div>
                    
                    <h6 class="fw-bold">Competencias y Actividades:</h6>
                    ${competenciasHtml}
                    
                    ${plan.recursos && plan.recursos.length > 0 ? `
                        <h6 class="fw-bold mt-3">Recursos de Apoyo:</h6>
                        <ul>
                            ${plan.recursos.map(r => `<li>${r}</li>`).join('')}
                        </ul>
                    ` : ''}
                    
                    ${plan.observaciones ? `
                        <h6 class="fw-bold">Observaciones:</h6>
                        <p class="bg-light p-2 rounded">${plan.observaciones}</p>
                    ` : ''}
                </div>
            `,
            showCancelButton: true,
            confirmButtonText: '📤 Compartir',
            cancelButtonText: 'Cerrar'
        }).then(result => {
            if (result.isConfirmed) {
                mostrarOpcionesCompartir(id);
            }
        });
    }

    /**
     * Editar plan existente
     */
    async function editarPlan(id) {
        console.log('✏️ Editando plan:', id);

        const plan = PlanesData.getPlanPorId(id);
        if (!plan) {
            Swal.fire('Error', 'Plan no encontrado', 'error');
            return;
        }

        const cursoId = plan.curso.id;
        const cursoNombre = plan.curso.nombre;

        const competencias = await DataManager.getCompetenciasPorCurso ?
            await DataManager.getCompetenciasPorCurso(cursoId) : [];

        const instructores = getInstructoresPorCurso(cursoId);

        const opcionesInstructores = instructores.length > 0 ?
            instructores.map(i => {
                const selected = plan.instructores?.some(ins => ins.documento === i.documento) ? 'selected' : '';
                return `<option value="${i.documento}" data-nombre="${i.nombre}" data-materia="${i.materia}" ${selected}>${i.nombre} - ${i.materia}</option>`;
            }).join('') :
            '<option value="" disabled>No hay instructores para este curso</option>';

        window.competenciasDelCurso = competencias;

        const { value: formValues, isConfirmed } = await Swal.fire({
            title: '✏️ EDITAR PLAN DE MEJORAMIENTO',
            width: '1000px',
            html: `
            <form id="formPlanMejoramiento" class="text-start" style="max-height: 70vh; overflow-y: auto; padding: 10px;">
                <div style="background: #003366; color: white; padding: 15px; margin-bottom: 20px; border-radius: 5px;">
                    <h5 style="margin:0;">SERVICIO NACIONAL DE APRENDIZAJE - SENA</h5>
                    <h6 style="margin:5px 0 0 0;">CENTRO DE ELECTRICIDAD, ELECTRÓNICA Y TELECOMUNICACIONES - CEET</h6>
                    <p style="margin:10px 0 0 0; font-size: 12px;">Acuerdo 009 de 2024 - Artículo 46</p>
                </div>
                
                <div class="row mb-3">
                    <div class="col-md-6">
                        <label class="form-label fw-bold">PROGRAMA DE FORMACIÓN:</label>
                        <input type="text" class="form-control" value="${cursoNombre}" readonly>
                    </div>
                    <div class="col-md-6">
                        <label class="form-label fw-bold">GRUPO No.:</label>
                        <input type="text" class="form-control" value="${cursoId}" readonly>
                    </div>
                </div>
                
                <div class="row mb-3">
                    <div class="col-md-6">
                        <label class="form-label fw-bold">APRENDIZ:</label>
                        <input type="text" class="form-control" value="${plan.aprendiz.nombre}" readonly>
                    </div>
                    <div class="col-md-2">
                        <label class="form-label fw-bold">TIPO DOC.:</label>
                        <select class="form-select" id="planTipoDocumento">
                            <option value="CC" ${plan.aprendiz.tipoDocumento === 'CC' ? 'selected' : ''}>CC</option>
                            <option value="TI" ${plan.aprendiz.tipoDocumento === 'TI' ? 'selected' : ''}>TI</option>
                            <option value="CE" ${plan.aprendiz.tipoDocumento === 'CE' ? 'selected' : ''}>CE</option>
                        </select>
                    </div>
                    <div class="col-md-4">
                        <label class="form-label fw-bold">DOCUMENTO:</label>
                        <input type="text" class="form-control" value="${plan.aprendiz.documento}" readonly>
                    </div>
                </div>
                
                <div class="row mb-3">
                    <div class="col-md-6">
                        <label class="form-label fw-bold">TELÉFONO / CELULAR:</label>
                        <input type="text" class="form-control" id="planTelefono" value="${plan.aprendiz.telefono || ''}">
                    </div>
                    <div class="col-md-6">
                        <label class="form-label fw-bold">CORREO ELECTRÓNICO:</label>
                        <input type="email" class="form-control" id="planCorreo" value="${plan.aprendiz.correo || ''}">
                    </div>
                </div>
                
                <div class="row mb-3">
                    <div class="col-md-6">
                        <label class="form-label fw-bold">INSTRUCTOR(ES):</label>
                        <select class="form-select" id="planInstructores" multiple size="3">
                            ${opcionesInstructores}
                        </select>
                    </div>
                    <div class="col-md-3">
                        <label class="form-label fw-bold">FECHA SUSCRIPCIÓN:</label>
                        <input type="date" class="form-control" id="planFechaSuscripcion" value="${plan.fechaSuscripcion}" readonly>
                    </div>
                    <div class="col-md-3">
                        <label class="form-label fw-bold">PLAZO (20 días):</label>
                        <input type="date" class="form-control" id="planPlazo" value="${plan.plazoEjecucion}" readonly>
                    </div>
                </div>
                
                <div class="card mb-3">
                    <div class="card-header bg-primary text-white">
                        <h6 class="mb-0">1. COMPETENCIAS, RESULTADOS Y ACTIVIDADES</h6>
                    </div>
                    <div class="card-body">
                        <div id="competenciasContainer"></div>
                        <button type="button" class="btn btn-sm btn-outline-primary mt-2" onclick="PlanesUI.agregarCompetenciaSelector()">
                            <i class="fas fa-plus"></i> Agregar Competencia
                        </button>
                    </div>
                </div>
                
                <div class="card mb-3">
                    <div class="card-header bg-info text-white">
                        <h6 class="mb-0">3. RECURSOS Y ESTRATEGIAS DE APOYO</h6>
                    </div>
                    <div class="card-body">
                        <div id="recursosContainer">
                            ${plan.recursos?.map((r, idx) => `
                                <div class="input-group mb-2">
                                    <input type="text" class="form-control" value="${r}" id="recurso_${idx}">
                                    <button class="btn btn-outline-danger" type="button" onclick="this.parentElement.remove()">
                                        <i class="fas fa-times"></i>
                                    </button>
                                </div>
                            `).join('') || '<div class="input-group mb-2"><input type="text" class="form-control" placeholder="Recurso 1" id="recurso_0"><button class="btn btn-outline-success" type="button" onclick="PlanesUI.agregarRecurso()"><i class="fas fa-plus"></i></button></div>'}
                        </div>
                    </div>
                </div>
                
                <div class="mb-3">
                    <label class="form-label fw-bold">OBSERVACIONES GENERALES:</label>
                    <textarea class="form-control" id="planObservaciones" rows="2">${plan.observaciones || ''}</textarea>
                </div>
            </form>
        `,
            showCancelButton: true,
            confirmButtonText: '✅ Actualizar Plan',
            cancelButtonText: '❌ Cancelar',
            confirmButtonColor: '#28a745',
            didOpen: () => {
                window.competenciasDelCurso = competencias;
                setTimeout(() => {
                    plan.competencias.forEach(comp => {
                        agregarCompetenciaSelector();
                    });
                }, 100);
            },
            preConfirm: () => {
                return validarYGuardarPlan(plan.aprendiz, cursoId, cursoNombre);
            }
        });

        if (isConfirmed && formValues) {
            const actualizado = PlanesData.actualizarPlan(id, formValues);

            if (actualizado) {
                Swal.fire({
                    icon: 'success',
                    title: '✅ Plan actualizado',
                    text: 'El plan de mejoramiento ha sido actualizado exitosamente',
                    timer: 2000,
                    showConfirmButton: false
                });
                verPlanes();
            }
        }
    }

    /**
     * Eliminar plan
     */
    function eliminarPlan(id) {
        console.log('🗑️ Eliminando plan:', id);

        const plan = PlanesData.getPlanPorId(id);
        if (!plan) {
            Swal.fire('Error', 'Plan no encontrado', 'error');
            return;
        }

        Swal.fire({
            title: '¿Eliminar plan?',
            html: `
                <p><strong>Estudiante:</strong> ${plan.aprendiz.nombre}</p>
                <p><strong>Fecha:</strong> ${plan.fechaSuscripcion}</p>
                <p class="text-danger">Esta acción no se puede deshacer</p>
            `,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar'
        }).then((result) => {
            if (result.isConfirmed) {
                const eliminado = PlanesData.eliminarPlan(id);

                if (eliminado) {
                    Swal.fire({
                        icon: 'success',
                        title: 'Eliminado',
                        text: 'El plan ha sido eliminado',
                        timer: 1500,
                        showConfirmButton: false
                    });

                    setTimeout(() => {
                        verPlanes();
                    }, 1500);
                } else {
                    Swal.fire({
                        icon: 'error',
                        title: 'Error',
                        text: 'No se pudo eliminar el plan'
                    });
                }
            }
        });
    }

    /**
     * Cambiar estado del plan
     */
    function cambiarEstado(id) {
        console.log('🔄 Cambiando estado del plan:', id);

        const plan = PlanesData.getPlanPorId(id);
        if (!plan) {
            Swal.fire('Error', 'Plan no encontrado', 'error');
            return;
        }

        const estados = [
            { value: 'en_curso', label: '🟡 En Curso', color: 'warning' },
            { value: 'aprobado', label: '🟢 Aprobado', color: 'success' },
            { value: 'no_aprobado', label: '🔴 No Aprobado', color: 'danger' }
        ];

        const inputOptions = {};
        estados.forEach(e => { inputOptions[e.value] = e.label; });

        Swal.fire({
            title: 'Cambiar estado del plan',
            html: `
                <p><strong>Estudiante:</strong> ${plan.aprendiz.nombre}</p>
                <p><strong>Estado actual:</strong> 
                    <span class="badge bg-${plan.estado === 'en_curso' ? 'warning' : plan.estado === 'aprobado' ? 'success' : 'danger'}">
                        ${plan.estado}
                    </span>
                </p>
            `,
            input: 'select',
            inputOptions: inputOptions,
            inputValue: plan.estado,
            showCancelButton: true,
            confirmButtonText: 'Actualizar',
            cancelButtonText: 'Cancelar',
            confirmButtonColor: '#28a745',
            preConfirm: (nuevoEstado) => {
                return PlanesData.actualizarEstadoPlan(id, nuevoEstado);
            }
        }).then((result) => {
            if (result.isConfirmed) {
                Swal.fire({
                    icon: 'success',
                    title: 'Estado actualizado',
                    text: `El plan ahora está: ${estados.find(e => e.value === result.value)?.label}`,
                    timer: 1500,
                    showConfirmButton: false
                });

                setTimeout(() => {
                    verPlanes();
                }, 1500);
            }
        });
    }

    // ========== FUNCIONES DE DIAGNÓSTICO ==========

    function diagnosticarPlanes() {
        console.log('=== DIAGNÓSTICO DE PLANES ===');
        console.log('1. PlanesData existe:', typeof PlanesData !== 'undefined');

        if (typeof PlanesData === 'undefined') {
            console.error('❌ PlanesData no está disponible');
            return;
        }

        const todosPlanes = PlanesData.cargarPlanes ? PlanesData.cargarPlanes() : [];
        console.log('2. Total planes en memoria:', todosPlanes.length);

        try {
            const saved = localStorage.getItem('planesMejoramiento');
            console.log('3. localStorage (planesMejoramiento):', saved ? '✅' : '❌');
            if (saved) {
                const parsed = JSON.parse(saved);
                console.log('   - Planes en localStorage:', parsed.length);
            }
        } catch (error) {
            console.error('❌ Error leyendo localStorage:', error);
        }

        const cursoSelect = document.getElementById('cursoPlanes');
        console.log('4. Selector de cursos:', cursoSelect ? '✅' : '❌');

        const estudianteSelect = document.getElementById('estudiantePlanes');
        console.log('5. Selector de estudiantes:', estudianteSelect ? '✅' : '❌');

        console.log('6. Total instructores en memoria:', todosLosResponsables.length);

        return '✅ Diagnóstico completado';
    }

    async function diagnosticarCursos() {
        console.log('=== DIAGNÓSTICO DE CURSOS ===');
        console.log('DataManager existe:', typeof DataManager !== 'undefined');

        if (typeof DataManager !== 'undefined') {
            console.log('getCursos existe:', typeof DataManager.getCursos === 'function');
            const cursos = DataManager.getCursos();
            console.log('Cursos en memoria:', cursos);
        }

        try {
            const response = await fetch('data/cursos.json');
            console.log('Archivo cursos.json:', response.ok ? '✅' : '❌');
        } catch (error) {
            console.error('Error:', error);
        }
    }

    // ========== AUTO-INICIALIZACIÓN ==========
    setTimeout(() => {
        console.log('🔄 Auto-inicializando PlanesUI...');
        inicializarSelectores();
    }, 1000);

    document.addEventListener('DOMContentLoaded', function () {
        const tabButton = document.getElementById('planes-tab');
        if (tabButton) {
            tabButton.addEventListener('shown.bs.tab', function () {
                console.log('📌 Pestaña Planes activada - Recargando selectores...');
                inicializarSelectores();
            });
        }
    });

    // ========== API PÚBLICA ==========
    return {
        inicializarSelectores,
        cargarEstudiantes,
        verPlanes,
        verDetalle,
        editarPlan,
        eliminarPlan,
        cambiarEstado,
        mostrarFormularioNuevo,
        mostrarOpcionesCompartir,
        agregarCompetenciaSelector,
        agregarActividad,
        agregarRecurso,
        eliminarCompetencia,
        cargarResultadosCompetencia,
        diagnosticarCursos,
        diagnosticarPlanes
    };

})();

console.log('✅ Módulo PlanesUI v2.2 cargado correctamente');
window.PlanesUI = PlanesUI;
window.probarCursos = () => PlanesUI.diagnosticarCursos();
window.diagnosticarPlanes = () => PlanesUI.diagnosticarPlanes();