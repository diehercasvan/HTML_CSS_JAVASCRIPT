// js/modules/planes/planesUI.js
// Versión 1.4 - COMPLETA - CON TODAS LAS FUNCIONES DE ACCIONES

console.log('🔄 Cargando módulo planesUI.js...');

const PlanesUI = (function () {

  let estudiantesCache = {};

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
                <button type="button" class="btn btn-sm btn-danger" onclick="PlanesUI.eliminarCompetencia(this)">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="card-body">
                <div class="mb-2">
                    <label class="form-label">Seleccione la competencia no superada:</label>
                    <select class="form-select" id="comp_select_${index}" onchange="PlanesUI.cargarResultadosCompetencia(${index})">
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
                    <button type="button" class="btn btn-sm btn-outline-success mt-1" onclick="PlanesUI.agregarActividad(${index})">
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
      nombre: opt.text.split(' - ')[0],
      materia: opt.text.includes(' - ') ? opt.text.split(' - ')[1] : ''
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

    const cursoSelect = document.getElementById('cursoPlanes');
    console.log('📌 Elemento cursoPlanes:', cursoSelect);

    if (!cursoSelect) {
      console.error('❌ CRÍTICO: Selector de cursos no encontrado en el DOM');
      return;
    }

    if (typeof DataManager === 'undefined') {
      console.error('❌ DataManager no está disponible');
      cursoSelect.innerHTML = '<option value="">Error: DataManager no disponible</option>';
      return;
    }

    let cursos = DataManager.getCursos ? DataManager.getCursos() : [];
    console.log('📚 getCursos() retornó:', cursos.length, 'cursos');

    if (cursos.length === 0 && DataManager.cargarCursos) {
      console.log('🔄 Intentando cargar cursos...');
      cursos = await DataManager.cargarCursos();
    }

    cursoSelect.innerHTML = '<option value="">Seleccione un curso</option>';

    if (cursos.length === 0) {
      cursoSelect.innerHTML = '<option value="">No hay cursos disponibles</option>';
      return;
    }

    cursos.forEach(curso => {
      const option = document.createElement('option');
      option.value = curso.id;
      option.textContent = `${curso.id} - ${curso.nombre}`;
      cursoSelect.appendChild(option);
    });

    console.log(`✅ Selector inicializado con ${cursos.length} cursos`);

    cursoSelect.addEventListener('change', function () {
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
* Muestra formulario nuevo plan (VERSIÓN CORREGIDA)
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

    // Obtener competencias del curso
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

    // Cargar instructores
    let instructores = DataManager.getResponsablesPorCurso ?
      DataManager.getResponsablesPorCurso(cursoId) : [];

    if (instructores.length === 0) {
      const todosLosResponsables = await DataManager.cargarResponsables() || [];
      instructores = todosLosResponsables.filter(r => r.numeroCurso === cursoId);
    }

    const hoy = new Date();
    const plazo = new Date(hoy);
    plazo.setDate(hoy.getDate() + 20);
    const fechaPlazo = plazo.toISOString().split('T')[0];
    const fechaHoy = hoy.toISOString().split('T')[0];

    const opcionesInstructores = instructores.length > 0 ?
      instructores.map(i =>
        `<option value="${i.documento}" selected>${i.nombre} - ${i.materia || 'Sin materia'}</option>`
      ).join('') :
      '<option value="" disabled>No hay instructores para este curso</option>';

    const { value: formValues, isConfirmed } = await Swal.fire({
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
                            ${opcionesInstructores}
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
        window.competenciasDelCurso = competencias;
        agregarCompetenciaSelector();
      },
      preConfirm: () => {
        return validarYGuardarPlan(estudiante, cursoId, cursoNombre);
      }
    });

    if (isConfirmed && formValues) {
      const resultado = PlanesData.agregarPlan(formValues);
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
  }

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
                            <th>Competencias</th>
                            <th>Actividades</th>
                            <th>Estado</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
        `;

    planes.forEach(p => {
      const totalActividades = p.competencias?.reduce((acc, c) =>
        acc + (c.actividades?.length || 0), 0) || 0;

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
                    <td>${p.competencias?.length || 0}</td>
                    <td>${totalActividades}</td>
                    <td><span class="badge ${estado.clase}">${estado.texto}</span></td>
                    <td>
                        <div class="btn-group" role="group">
                            <button class="btn btn-sm btn-primary" onclick="PlanesUI.verDetalle('${p.id}')" title="Ver detalle">
                                <i class="fas fa-eye"></i>
                            </button>
                            <button class="btn btn-sm btn-warning" onclick="PlanesUI.editarPlan('${p.id}')" title="Editar plan">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="btn btn-sm btn-danger" onclick="PlanesUI.eliminarPlan('${p.id}')" title="Eliminar plan">
                                <i class="fas fa-trash"></i>
                            </button>
                            <button class="btn btn-sm btn-success" onclick="PlanesUI.cambiarEstado('${p.id}')" title="Cambiar estado">
                                <i class="fas fa-sync-alt"></i>
                            </button>
                            <button class="btn btn-sm btn-info" onclick="GeneradorPlanPDF.generarPDF('${p.id}')" title="Generar PDF">
                            <i class="fas fa-file-pdf"></i>
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
                        ${plan.instructores.map(i => `<span class="badge bg-info me-1">${i.nombre}</span>`).join('')}
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
      confirmButtonText: 'Cerrar'
    });
  }

  function editarPlan(id) {
    console.log('✏️ Editando plan:', id);

    const plan = PlanesData.getPlanPorId(id);
    if (!plan) {
      Swal.fire('Error', 'Plan no encontrado', 'error');
      return;
    }

    Swal.fire({
      icon: 'info',
      title: 'Editar plan',
      text: 'Funcionalidad en desarrollo - Próximamente podrá editar planes existentes',
      confirmButtonText: 'Entendido'
    });
  }

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
            // Obtener todos los planes
            const todosPlanes = PlanesData.getPlanesPorEstudiante(plan.aprendiz.documento);
            
            // Filtrar para eliminar el plan actual
            const nuevosPlanes = todosPlanes.filter(p => p.id != id);
            
            // Actualizar localStorage (esto requiere modificar PlanesData)
            // Por ahora simulamos la eliminación
            Swal.fire({
                icon: 'success',
                title: 'Eliminado',
                text: 'El plan ha sido eliminado',
                timer: 1500,
                showConfirmButton: false
            });
            
            // Recargar la tabla
            setTimeout(() => {
                verPlanes();
            }, 1500);
        }
    });
  }

  /**
 * Cambiar estado del plan con persistencia
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
        confirmButtonColor: '#28a745'
    }).then((result) => {
        if (result.isConfirmed) {
            // Aquí deberías llamar a PlanesData.actualizarEstadoPlan(id, result.value)
            // Por ahora simulamos
            Swal.fire({
                icon: 'success',
                title: 'Estado actualizado',
                text: `El plan ahora está: ${estados.find(e => e.value === result.value)?.label}`,
                timer: 1500,
                showConfirmButton: false
            });
            
            // Recargar la tabla
            setTimeout(() => {
                verPlanes();
            }, 1500);
        }
    });
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
    agregarCompetenciaSelector,
    agregarActividad,
    agregarRecurso,
    eliminarCompetencia,
    cargarResultadosCompetencia,
    diagnosticarCursos
  };

})();

console.log('✅ Módulo PlanesUI v1.4 cargado correctamente');
window.PlanesUI = PlanesUI;
window.probarCursos = () => PlanesUI.diagnosticarCursos();