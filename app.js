// ==========================================
// BASE DE DATOS LOCAL (LOCALSTORAGE)
// ==========================================

if (!localStorage.getItem('db_estudiantes')) {
    localStorage.setItem('db_estudiantes', JSON.stringify([]));
}
if (!localStorage.getItem('db_notas')) {
    localStorage.setItem('db_notas', JSON.stringify([]));
}

function getEstudiantesLocal() {
    return JSON.parse(localStorage.getItem('db_estudiantes')) || [];
}

function saveEstudiantesLocal(data) {
    localStorage.setItem('db_estudiantes', JSON.stringify(data));
}

function getNotasLocal() {
    return JSON.parse(localStorage.getItem('db_notas')) || [];
}

function saveNotasLocal(data) {
    localStorage.setItem('db_notas', JSON.stringify(data));
}

window.baseDeDatosEstudiantes = [];

document.addEventListener('DOMContentLoaded', () => {
    mostrarSelectorDeRol();
    cargarDatosDesdeServidor();
});

const MATERIAS_EDUCATIVAS = [
    "Matemática",
    "Castellano",
    "Inglés",
    "Ciencias Naturales",
    "Biología",
    "Física",
    "Química",
    "Historia",
    "Geografía",
    "Educación Física",
    "Arte y Patrimonio",
    "Formación para la Soberanía Nacional",
    "Orientación"
];

// ==========================================
// 1. CONTROL DE ACCESO Y ROLES
// ==========================================

function mostrarSelectorDeRol() {
    const roleScreen = document.getElementById('role-selector-screen');
    const adminLogin = document.getElementById('admin-login-modal');
    const studentScreen = document.getElementById('student-portal-screen');
    const adminApp = document.getElementById('admin-app-container');

    if (roleScreen) roleScreen.style.display = 'flex';
    if (adminLogin) adminLogin.style.display = 'none';
    if (studentScreen) studentScreen.style.display = 'none';
    if (adminApp) adminApp.style.display = 'none';
}

function abrirLoginAdmin() {
    const roleScreen = document.getElementById('role-selector-screen');
    const adminLogin = document.getElementById('admin-login-modal');
    const errorMsg = document.getElementById('login-error');
    const formLogin = document.getElementById('form-admin-login');

    if (roleScreen) roleScreen.style.display = 'none';
    if (adminLogin) adminLogin.style.display = 'flex';
    if (errorMsg) errorMsg.style.display = 'none';
    if (formLogin) formLogin.reset();
}

function volverASeleccionRol() {
    mostrarSelectorDeRol();
}

function validarLoginAdmin(event) {
    event.preventDefault();
    
    const usuarioInput = document.getElementById('admin-user');
    const passInput = document.getElementById('admin-pass');
    const errorMsg = document.getElementById('login-error');

    const usuario = usuarioInput ? usuarioInput.value.trim() : '';
    const password = passInput ? passInput.value.trim() : '';

    if (usuario === 'Admin' && password === '123') {
        const adminLogin = document.getElementById('admin-login-modal');
        const adminApp = document.getElementById('admin-app-container');

        if (adminLogin) adminLogin.style.display = 'none';
        if (adminApp) adminApp.style.display = 'flex';

        switchTab('dashboard');
    } else {
        if (errorMsg) errorMsg.style.display = 'block';
    }
}

function selectRole(role) {
    if (role === 'admin') {
        abrirLoginAdmin();
    } else if (role === 'student') {
        const roleScreen = document.getElementById('role-selector-screen');
        const studentScreen = document.getElementById('student-portal-screen');
        const adminApp = document.getElementById('admin-app-container');

        if (roleScreen) roleScreen.style.display = 'none';
        if (studentScreen) studentScreen.style.display = 'flex';
        if (adminApp) adminApp.style.display = 'none';
    }
}

function resetRoleSelection() {
    const cedulaInput = document.getElementById('student-cedula-input');
    const resultsContainer = document.getElementById('student-results-container');

    if (cedulaInput) cedulaInput.value = '';
    if (resultsContainer) resultsContainer.style.display = 'none';

    mostrarSelectorDeRol();
}

function fetchStudentGrades(event) {
    if (event) event.preventDefault();

    const cedulaInput = document.getElementById('student-cedula-input');
    const resultsContainer = document.getElementById('student-results-container');
    const tbody = document.getElementById('res-student-grades-body');

    if (!cedulaInput || !resultsContainer || !tbody) return;

    const cedula = cedulaInput.value.trim();

    if (!cedula) {
        alert("Por favor, ingrese su número de cédula.");
        return;
    }

    resultsContainer.style.display = 'block';

    const estudiantes = getEstudiantesLocal();
    const estudiante = estudiantes.find(est => String(est.cedula).trim().toLowerCase() === cedula.toLowerCase());

    if (estudiante) {
        const anioTexto = estudiante.anio_asignado ? `${estudiante.anio_asignado}° Año` : 'Sin asignar';
        const seccionTexto = estudiante.seccion ? ` - Sección "${estudiante.seccion}"` : '';
        const asignacionFinal = (estudiante.anio_asignado || estudiante.seccion) ? `${anioTexto}${seccionTexto}` : 'No Asignado';

        resultsContainer.innerHTML = `
            <hr style="border: 0; border-top: 1px solid var(--border-color); margin: 1rem 0;">
            <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 1rem; margin-bottom: 1.25rem;">
                <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #cbd5e1; padding-bottom: 0.5rem; margin-bottom: 0.75rem;">
                    <h4 style="font-size: 1.1rem; color: var(--primary-color); font-weight: 700; margin: 0;">${estudiante.nombres}</h4>
                    <span style="background: var(--primary-light); color: var(--primary-color); padding: 4px 8px; border-radius: 4px; font-weight: bold; font-size: 0.85rem;">${estudiante.cedula}</span>
                </div>
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 0.5rem; font-size: 0.85rem; color: #334155;">
                    <div><strong>Año y Sección:</strong> <span style="color: #0284c7; font-weight: 600;">${asignacionFinal}</span></div>
                    <div><strong>Edad:</strong> ${estudiante.edad} años</div>
                    <div><strong>Correo:</strong> ${estudiante.correo || 'N/A'}</div>
                    <div><strong>Teléfono:</strong> ${estudiante.telefono || 'N/A'}</div>
                </div>
            </div>

            <div class="table-container">
                <table class="professional-table">
                    <thead>
                        <tr>
                            <th>Materia / Unidad</th>
                            <th>Nota</th>
                            <th>Estado</th>
                        </tr>
                    </thead>
                    <tbody id="res-student-grades-body"></tbody>
                </table>
            </div>
        `;
    } else {
        resultsContainer.innerHTML = `
            <hr style="border: 0; border-top: 1px solid var(--border-color); margin: 1rem 0;">
            <div style="text-align: center; color: #dc2626; padding: 1rem; font-weight: 600;">
                No se encontró ningún estudiante registrado con la cédula ${cedula}.
            </div>
        `;
        return;
    }

    const newTbody = document.getElementById('res-student-grades-body');
    const notas = getNotasLocal().filter(n => String(n.cedula_estudiante).trim().toLowerCase() === cedula.toLowerCase());

    if (notas.length === 0) {
        newTbody.innerHTML = `<tr><td colspan="3" style="text-align: center; color: #dc2626; padding: 1rem;">No se encontraron evaluaciones registradas.</td></tr>`;
        return;
    }

    notas.forEach(n => {
        const tr = document.createElement('tr');
        const aprobado = parseFloat(n.nota) >= 12.0;
        const estadoSpan = aprobado 
            ? `<span style="color: #16a34a; font-weight: bold; background: #dcfce7; padding: 4px 8px; border-radius: 4px;">Aprobado</span>`
            : `<span style="color: #dc2626; font-weight: bold; background: #fee2e2; padding: 4px 8px; border-radius: 4px;">Reprobado</span>`;

        tr.innerHTML = `
            <td>${n.materia}</td>
            <td><strong>${parseFloat(n.nota).toFixed(1)}</strong></td>
            <td>${estadoSpan}</td>
        `;
        newTbody.appendChild(tr);
    });
}

// ==========================================
// 2. OPERACIONES Y CÁLCULOS DEL DASHBOARD
// ==========================================

function cargarDatosDesdeServidor(tabActual = 'dashboard') {
    const estudiantes = getEstudiantesLocal();
    window.baseDeDatosEstudiantes = estudiantes;

    actualizarDashboardMetrics();
    poblarSelectores();
    poblarDesplegableMaterias('materia');
    poblarDesplegableMaterias('nueva-materia-input');

    if (tabActual === 'matricula') {
        volverASeleccionAnio();
    }
}

function actualizarDashboardMetrics() {
    const estudiantes = getEstudiantesLocal();
    const totalEstudiantes = estudiantes.length;

    // 1. Resumen Académico
    const countTotalElem = document.getElementById('dash-total-estudiantes');
    const countPendientesElem = document.getElementById('dash-pendientes-asignar');
    const promedioEdadElem = document.getElementById('dash-promedio-edad');

    const pendientes = estudiantes.filter(e => !e.anio_asignado).length;
    
    let promedioEdad = 0;
    if (totalEstudiantes > 0) {
        const sumaEdades = estudiantes.reduce((acc, curr) => acc + (parseFloat(curr.edad) || 0), 0);
        promedioEdad = (sumaEdades / totalEstudiantes).toFixed(1);
    }

    if (countTotalElem) countTotalElem.innerText = totalEstudiantes;
    if (countPendientesElem) countPendientesElem.innerText = pendientes;
    if (promedioEdadElem) promedioEdadElem.innerText = `${promedioEdad} años`;

    // 2. Distribución de Matrícula por Años y Secciones
    const distributionContainer = document.getElementById('dashboard-years-distribution');
    if (!distributionContainer) return;

    distributionContainer.innerHTML = '';

    for (let anio = 1; anio <= 5; anio++) {
        const estudiantesAnio = estudiantes.filter(e => parseInt(e.anio_asignado) === anio);
        const cantAnio = estudiantesAnio.length;
        const porcAnio = totalEstudiantes > 0 ? ((cantAnio / totalEstudiantes) * 100).toFixed(1) : '0.0';

        let seccionesHTML = '';
        ['A', 'B', 'C'].forEach(sec => {
            const cantSec = estudiantesAnio.filter(e => (e.seccion || '').toUpperCase() === sec).length;
            const porcSecRelativo = cantAnio > 0 ? ((cantSec / cantAnio) * 100).toFixed(0) : '0';
            const porcSecTotal = totalEstudiantes > 0 ? ((cantSec / totalEstudiantes) * 100).toFixed(1) : '0.0';

            seccionesHTML += `
                <div class="dash-sec-item">
                    <div class="dash-sec-header">
                        <span>Sección ${sec}</span>
                        <span><b>${cantSec}</b> alumnos (${porcSecTotal}% total)</span>
                    </div>
                    <div class="progress-bar-bg">
                        <div class="progress-bar-fill sec-fill" style="width: ${porcSecRelativo}%;"></div>
                    </div>
                </div>
            `;
        });

        const yearCard = document.createElement('div');
        yearCard.className = 'dash-year-card';
        yearCard.innerHTML = `
            <div class="dash-year-title-box">
                <div>
                    <h3>${anio}° Año</h3>
                    <p class="dash-year-sub">${cantAnio} de ${totalEstudiantes} estudiantes</p>
                </div>
                <span class="dash-year-badge">${porcAnio}%</span>
            </div>
            <div class="progress-bar-bg" style="margin-bottom: 1rem;">
                <div class="progress-bar-fill year-fill" style="width: ${porcAnio}%;"></div>
            </div>
            <div class="dash-sections-container">
                ${seccionesHTML}
            </div>
        `;
        distributionContainer.appendChild(yearCard);
    }
}

function poblarDesplegableMaterias(idSelect) {
    const select = document.getElementById(idSelect);
    if (!select) return;

    select.innerHTML = '<option value="">-- Seleccionar Materia --</option>';
    MATERIAS_EDUCATIVAS.forEach(mat => {
        const option = document.createElement('option');
        option.value = mat;
        option.textContent = mat;
        select.appendChild(option);
    });
}

function switchTab(tabId) {
    document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
    document.querySelectorAll('.nav-menu a').forEach(link => link.classList.remove('active'));

    const targetTab = document.getElementById(`tab-${tabId}`);
    if (targetTab) targetTab.classList.add('active');

    const activeLink = Array.from(document.querySelectorAll('.nav-menu a')).find(link => link.getAttribute('onclick')?.includes(tabId));
    if (activeLink) activeLink.classList.add('active');

    cargarDatosDesdeServidor(tabId);

    if (tabId === 'notas') {
        const yearSelect = document.getElementById('select-year-grade');
        if (yearSelect) yearSelect.value = '';
        filtrarEstudiantesPorAnio();
    }
}

function saveStudent(event) {
    event.preventDefault();

    const cedula = document.getElementById('cedula').value.trim();
    const estudiantes = getEstudiantesLocal();

    if (estudiantes.some(est => est.cedula.toLowerCase() === cedula.toLowerCase())) {
        alert("Error: La cédula ingresada ya se encuentra registrada.");
        return;
    }

    const nuevoEstudiante = {
        id: Date.now(),
        cedula: cedula,
        nombres: document.getElementById('nombres').value.trim(),
        edad: document.getElementById('edad').value.trim(),
        correo: document.getElementById('correo').value.trim(),
        telefono: document.getElementById('telefono').value.trim() || null,
        anio_asignado: null,
        seccion: null
    };

    estudiantes.push(nuevoEstudiante);
    saveEstudiantesLocal(estudiantes);

    alert("Estudiante guardado exitosamente de forma local.");
    document.getElementById('student-form').reset();
    switchTab('dashboard');
}

function poblarSelectores() {
    const estudiantes = window.baseDeDatosEstudiantes || [];
    const disponibles = estudiantes.filter(est => !est.anio_asignado);
    const container = document.getElementById('unassigned-students-list');

    if (!container) return;
    container.innerHTML = '';

    if (disponibles.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: #94a3b8; padding: 2rem;">No hay estudiantes pendientes por asignar.</p>';
        return;
    }

    disponibles.forEach(est => {
        const item = document.createElement('label');
        item.style.cssText = 'display: flex; justify-content: space-between; align-items: center; padding: 0.75rem 1rem; border-bottom: 1px solid #f1f5f9; cursor: pointer; transition: background 0.2s;';
        item.onmouseover = () => item.style.background = '#f8fafc';
        item.onmouseout = () => item.style.background = 'transparent';

        item.innerHTML = `
            <div style="display: flex; align-items: center; gap: 12px;">
                <input type="checkbox" class="student-checkbox" value="${est.cedula}" style="width: 18px; height: 18px; cursor: pointer;">
                <span style="font-weight: 600; color: #334155;">${est.nombres}</span>
            </div>
            <span style="color: #64748b; font-size: 0.85rem; background: #f1f5f9; padding: 2px 8px; border-radius: 4px;">${est.cedula}</span>
        `;
        container.appendChild(item);
    });

    const masterCB = document.getElementById('select-all-students');
    if (masterCB) masterCB.checked = false;
}

function toggleSelectAll(masterCheckbox) {
    const checkboxes = document.querySelectorAll('.student-checkbox');
    checkboxes.forEach(cb => cb.checked = masterCheckbox.checked);
}

function ejecutarAsignacionMasiva() {
    const year = document.getElementById('assign-year-select').value;
    const seccion = document.getElementById('assign-section-select').value;
    
    const checkboxes = document.querySelectorAll('.student-checkbox:checked');
    const cedulas = Array.from(checkboxes).map(cb => cb.value);

    if (!year || !seccion) {
        alert("Por favor, selecciona un año académico y una sección (A, B o C).");
        return;
    }

    if (cedulas.length === 0) {
        alert("Debes seleccionar al menos un estudiante de la lista.");
        return;
    }

    let estudiantes = getEstudiantesLocal();

    estudiantes = estudiantes.map(est => {
        if (cedulas.includes(est.cedula)) {
            return { ...est, anio_asignado: parseInt(year), seccion: seccion.toUpperCase() };
        }
        return est;
    });

    saveEstudiantesLocal(estudiantes);

    alert(`${cedulas.length} estudiantes asignados a ${year}° Año '${seccion}' con éxito.`);
    document.getElementById('assign-year-select').value = '';
    document.getElementById('assign-section-select').value = '';
    cargarDatosDesdeServidor('dashboard');
}

function filtrarEstudiantesPorAnio() {
    const anioSeleccionado = document.getElementById('select-year-grade').value;
    const selectEstudiante = document.getElementById('select-student-grade');
    
    if (!selectEstudiante) return;

    if (!anioSeleccionado) {
        selectEstudiante.innerHTML = '<option value="">-- Selecciona primero un año --</option>';
        selectEstudiante.disabled = true;
        return;
    }

    const estudiantes = window.baseDeDatosEstudiantes || [];
    const estudiantesDelAnio = estudiantes.filter(est => parseInt(est.anio_asignado) === parseInt(anioSeleccionado));

    selectEstudiante.innerHTML = '<option value="">-- Seleccionar Estudiante --</option>';

    if (estudiantesDelAnio.length === 0) {
        selectEstudiante.innerHTML = '<option value="">No hay estudiantes inscritos en este año</option>';
        selectEstudiante.disabled = true;
        return;
    }

    selectEstudiante.disabled = false;
    estudiantesDelAnio.forEach(est => {
        const option = document.createElement('option');
        option.value = est.cedula;
        option.text = `${est.nombres} (${est.cedula})`;
        selectEstudiante.appendChild(option);
    });
}

function saveGrade(event) {
    event.preventDefault();

    const cedula = document.getElementById('select-student-grade').value;
    const materia = document.getElementById('materia').value;
    const nota = parseFloat(document.getElementById('nota').value);

    if (!materia) {
        alert("Por favor, selecciona una materia del listado.");
        return;
    }

    const notas = getNotasLocal();

    const yaExiste = notas.some(n => 
        String(n.cedula_estudiante).trim() === String(cedula).trim() && 
        n.materia.toLowerCase() === materia.toLowerCase()
    );

    if (yaExiste) {
        alert(`El estudiante ya posee una nota registrada para la materia "${materia}". No se permiten materias repetidas.`);
        return;
    }

    notas.push({
        id: Date.now(),
        cedula_estudiante: cedula,
        materia: materia,
        nota: nota
    });

    saveNotasLocal(notas);

    alert("Calificación registrada con éxito.");
    document.getElementById('notes-form').reset();
    switchTab('dashboard');
}

// ==========================================
// 3. MATRÍCULA ACTIVA Y GESTIÓN DE NOTAS
// ==========================================

let anioSeleccionadoActual = null;
let seccionSeleccionadaActual = null;
let estudianteSeleccionadoNotas = null;

function actualizarContadoresMatricula() {
    const estudiantes = getEstudiantesLocal();
    
    for (let i = 1; i <= 5; i++) {
        const totalAno = estudiantes.filter(e => parseInt(e.anio_asignado) === i).length;
        const badge = document.getElementById(`badge-year-${i}`);
        if (badge) {
            badge.textContent = `${totalAno} Estudiante${totalAno === 1 ? '' : 's'}`;
        }
    }
}

function seleccionarAnioMatricula(anio) {
    anioSeleccionadoActual = anio;
    document.getElementById('paso-anos-matricula').style.display = 'none';
    document.getElementById('paso-secciones-matricula').style.display = 'block';
    document.getElementById('paso-tabla-matricula').style.display = 'none';
    document.getElementById('paso-detalles-notas-estudiante').style.display = 'none';

    document.getElementById('titulo-anio-seleccionado').textContent = `Selecciona una Sección de ${anio}° Año`;
    actualizarContadoresSecciones(anio);
}

function volverASeleccionAnio() {
    anioSeleccionadoActual = null;
    document.getElementById('paso-anos-matricula').style.display = 'block';
    document.getElementById('paso-secciones-matricula').style.display = 'none';
    document.getElementById('paso-tabla-matricula').style.display = 'none';
    document.getElementById('paso-detalles-notas-estudiante').style.display = 'none';
    actualizarContadoresMatricula();
}

function seleccionarSeccionTabla(seccion) {
    seccionSeleccionadaActual = seccion;
    document.getElementById('paso-secciones-matricula').style.display = 'none';
    document.getElementById('paso-tabla-matricula').style.display = 'block';
    document.getElementById('paso-detalles-notas-estudiante').style.display = 'none';

    document.getElementById('titulo-seccion-seleccionada').textContent = 
        `Estudiantes de ${anioSeleccionadoActual}° Año - Sección "${seccion}"`;

    renderizarTablaEstudiantesSeccion();
}

function volverASeleccionSeccion() {
    seccionSeleccionadaActual = null;
    document.getElementById('paso-secciones-matricula').style.display = 'block';
    document.getElementById('paso-tabla-matricula').style.display = 'none';
    document.getElementById('paso-detalles-notas-estudiante').style.display = 'none';
    actualizarContadoresSecciones(anioSeleccionadoActual);
}

function actualizarContadoresSecciones(anio) {
    const estudiantes = getEstudiantesLocal();
    const estudiantesDelAnio = estudiantes.filter(e => parseInt(e.anio_asignado) === parseInt(anio));

    ['A', 'B', 'C'].forEach(sec => {
        const total = estudiantesDelAnio.filter(e => (e.seccion || '').toUpperCase() === sec).length;
        const badge = document.getElementById(`badge-seccion-${sec}`);
        if (badge) badge.textContent = `${total} Alumno${total === 1 ? '' : 's'}`;
    });
}

function renderizarTablaEstudiantesSeccion() {
    const tbody = document.getElementById('tabla-estudiantes-seccion-body');
    if (!tbody) return;

    const estudiantes = getEstudiantesLocal();

    const alumnos = estudiantes.filter(e => 
        parseInt(e.anio_asignado) === parseInt(anioSeleccionadoActual) &&
        (e.seccion || '').toUpperCase() === seccionSeleccionadaActual.toUpperCase()
    );

    tbody.innerHTML = '';

    if (alumnos.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5" style="text-align: center; color: #94a3b8; padding: 1.5rem;">No hay estudiantes matriculados en esta sección.</td></tr>`;
        return;
    }

    alumnos.forEach(est => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><b>${est.cedula}</b></td>
            <td>${est.nombres}</td>
            <td>
                <select onchange="cambiarSeccionEstudiante('${est.cedula}', this.value)" style="padding: 4px 8px; border-radius: 6px; border: 1px solid #cbd5e1; cursor: pointer;">
                    <option value="A" ${est.seccion === 'A' ? 'selected' : ''}>Sección A</option>
                    <option value="B" ${est.seccion === 'B' ? 'selected' : ''}>Sección B</option>
                    <option value="C" ${est.seccion === 'C' ? 'selected' : ''}>Sección C</option>
                </select>
            </td>
            <td>
                <button onclick="verNotasEstudiante('${est.cedula}')" style="background: #0284c7; color: white; border: none; padding: 6px 12px; border-radius: 6px; cursor: pointer; font-size: 0.85rem; display: flex; align-items: center; gap: 4px;">
                    <i class="bx bx-show"></i> Ver y Gestionar Notas
                </button>
            </td>
            <td>
                <button onclick="desvincularEstudianteDelAnio('${est.cedula}')" style="background: #f59e0b; color: white; border: none; padding: 6px 12px; border-radius: 6px; cursor: pointer; font-size: 0.85rem; display: flex; align-items: center; gap: 4px;">
                    <i class="bx bx-user-x"></i> Quitar del Año
                </button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

function cambiarSeccionEstudiante(cedula, nuevaSeccion) {
    let estudiantes = getEstudiantesLocal();
    estudiantes = estudiantes.map(e => {
        if (String(e.cedula) === String(cedula)) {
            return { ...e, seccion: nuevaSeccion };
        }
        return e;
    });

    saveEstudiantesLocal(estudiantes);
    renderizarTablaEstudiantesSeccion();
}

function desvincularEstudianteDelAnio(cedula) {
    if (!confirm(`¿Deseas quitar a este estudiante del año actual? Volverá a la lista de 'Sin Asignar'.`)) {
        return;
    }

    let estudiantes = getEstudiantesLocal();
    estudiantes = estudiantes.map(e => {
        if (String(e.cedula) === String(cedula)) {
            return { ...e, anio_asignado: null, seccion: null };
        }
        return e;
    });

    saveEstudiantesLocal(estudiantes);
    renderizarTablaEstudiantesSeccion();
}

// ==========================================
// 4. VISTA DE EDICIÓN / BORRADO DE NOTAS
// ==========================================

function verNotasEstudiante(cedula) {
    const estudiantes = getEstudiantesLocal();
    const est = estudiantes.find(e => String(e.cedula) === String(cedula));

    if (!est) return;

    estudianteSeleccionadoNotas = est;

    document.getElementById('paso-tabla-matricula').style.display = 'none';
    document.getElementById('paso-detalles-notas-estudiante').style.display = 'block';

    document.getElementById('nombre-estudiante-notas').textContent = est.nombres;
    document.getElementById('cedula-estudiante-notas').textContent = `Cédula: ${est.cedula}`;

    renderizarTablaNotasEstudiante();
}

function volverATablaSeccion() {
    estudianteSeleccionadoNotas = null;
    document.getElementById('paso-detalles-notas-estudiante').style.display = 'none';
    document.getElementById('paso-tabla-matricula').style.display = 'block';
}

function renderizarTablaNotasEstudiante() {
    if (!estudianteSeleccionadoNotas) return;

    const tbody = document.getElementById('tabla-gestion-notas-body');
    const notas = getNotasLocal().filter(n => String(n.cedula_estudiante) === String(estudianteSeleccionadoNotas.cedula));

    tbody.innerHTML = '';

    if (notas.length === 0) {
        tbody.innerHTML = `<tr><td colspan="4" style="text-align: center; color: #94a3b8; padding: 1.5rem;">El estudiante no posee calificaciones registradas.</td></tr>`;
        return;
    }

    notas.forEach(n => {
        const aprobado = parseFloat(n.nota) >= 12.0;
        const estadoSpan = aprobado 
            ? `<span style="color: #16a34a; font-weight: bold; background: #dcfce7; padding: 4px 8px; border-radius: 4px;">Aprobado</span>`
            : `<span style="color: #dc2626; font-weight: bold; background: #fee2e2; padding: 4px 8px; border-radius: 4px;">Reprobado</span>`;

        let opcionesMaterias = MATERIAS_EDUCATIVAS.map(m => 
            `<option value="${m}" ${m === n.materia ? 'selected' : ''}>${m}</option>`
        ).join('');

        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>
                <select id="materia-input-${n.id}" style="padding: 6px 8px; border-radius: 4px; border: 1px solid #cbd5e1; width: 95%;">
                    ${opcionesMaterias}
                </select>
            </td>
            <td>
                <input type="number" id="nota-input-${n.id}" value="${n.nota}" min="0" max="20" step="0.1" style="padding: 6px 8px; border-radius: 4px; border: 1px solid #cbd5e1; width: 80px;">
            </td>
            <td>${estadoSpan}</td>
            <td>
                <div style="display: flex; gap: 8px;">
                    <button onclick="modificarNota(${n.id})" style="background: #16a34a; color: white; border: none; padding: 6px 10px; border-radius: 6px; cursor: pointer; font-size: 0.8rem; display: flex; align-items: center; gap: 4px;">
                        <i class="bx bx-save"></i> Guardar
                    </button>
                    <button onclick="eliminarNota(${n.id})" style="background: #dc2626; color: white; border: none; padding: 6px 10px; border-radius: 6px; cursor: pointer; font-size: 0.8rem; display: flex; align-items: center; gap: 4px;">
                        <i class="bx bx-trash"></i> Borrar
                    </button>
                </div>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

function modificarNota(idNota) {
    const nuevaMateria = document.getElementById(`materia-input-${idNota}`).value;
    const nuevaNota = parseFloat(document.getElementById(`nota-input-${idNota}`).value);

    if (!nuevaMateria || isNaN(nuevaNota)) {
        alert("Por favor introduce datos válidos.");
        return;
    }

    let notas = getNotasLocal();

    const existeDuplicado = notas.some(n => 
        n.id !== idNota &&
        String(n.cedula_estudiante).trim() === String(estudianteSeleccionadoNotas.cedula).trim() &&
        n.materia.toLowerCase() === nuevaMateria.toLowerCase()
    );

    if (existeDuplicado) {
        alert(`El estudiante ya posee registrada la materia "${nuevaMateria}". Elige una materia distinta.`);
        return;
    }

    notas = notas.map(n => {
        if (n.id === idNota) {
            return { ...n, materia: nuevaMateria, nota: nuevaNota };
        }
        return n;
    });

    saveNotasLocal(notas);
    alert("Nota actualizada con éxito.");
    renderizarTablaNotasEstudiante();
}

function eliminarNota(idNota) {
    if (!confirm("¿Deseas eliminar esta nota permanentemente?")) {
        return;
    }

    let notas = getNotasLocal();
    notas = notas.filter(n => n.id !== idNota);

    saveNotasLocal(notas);
    renderizarTablaNotasEstudiante();
}

function guardarNuevaNotaDirecta(event) {
    event.preventDefault();

    if (!estudianteSeleccionadoNotas) return;

    const materiaSelect = document.getElementById('nueva-materia-input');
    const notaInput = document.getElementById('nueva-nota-input');

    const materia = materiaSelect.value;
    const nota = parseFloat(notaInput.value);

    if (!materia) {
        alert("Por favor, selecciona una materia del listado.");
        return;
    }

    const notas = getNotasLocal();

    const existeNota = notas.some(n => 
        String(n.cedula_estudiante).trim() === String(estudianteSeleccionadoNotas.cedula).trim() && 
        n.materia.toLowerCase() === materia.toLowerCase()
    );

    if (existeNota) {
        alert(`El estudiante ya posee una nota registrada para la materia "${materia}".`);
        return;
    }

    notas.push({
        id: Date.now(),
        cedula_estudiante: estudianteSeleccionadoNotas.cedula,
        materia: materia,
        nota: nota
    });

    saveNotasLocal(notas);

    materiaSelect.value = '';
    notaInput.value = '';

    renderizarTablaNotasEstudiante();
}
