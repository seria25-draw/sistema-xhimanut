// ================================
// STATE
// ================================
let editingId = null;
let deletingId = null;
let _adminPage = "";

// ================================
// INIT
// ================================
function initAdminPage(page) {
  _adminPage = page;

  const raw = sessionStorage.getItem("usuario");
  if (!raw) {
    window.location.href = "../../index.html";
    return;
  }

  // Search — usa el input del navbar compartido
  const searchInput = document.getElementById("navbar-search-input");
  if (searchInput) {
    searchInput.addEventListener("input", function () {
      manejarBusqueda(this.value.trim().toLowerCase(), page);
    });
  }

  // Inicializar contenido según página
  if (page === "dashboard") initDashboard();
  if (page === "usuarios") {
    renderEmployees();
    updateStats();
  }
  if (page === "reportes") initReportes();
  if (page === "configuracion") initConfiguracion();
}

// ================================
// PANELES
// ================================
function toggleNotifPanel() {
  const panel = document.getElementById("panel-notificaciones");
  const overlay = document.getElementById("notif-overlay");
  const perfil = document.getElementById("panel-perfil");

  if (panel && panel.classList.contains("hidden")) {
    perfil?.classList.add("hidden");
    panel.classList.remove("hidden");
    overlay?.classList.remove("hidden");
  } else {
    cerrarPaneles();
  }
}

function togglePerfilPanel() {
  const panel = document.getElementById("panel-perfil");
  const overlay = document.getElementById("notif-overlay");
  const notif = document.getElementById("panel-notificaciones");

  if (panel && panel.classList.contains("hidden")) {
    notif?.classList.add("hidden");
    panel.classList.remove("hidden");
    overlay?.classList.remove("hidden");
  } else {
    cerrarPaneles();
  }
}

// ================================
// PERFIL
// ================================
function guardarPerfilAdmin() {
  const actual = document.getElementById("pass-actual")?.value;
  const nueva = document.getElementById("pass-nueva")?.value;
  const confirmar = document.getElementById("pass-confirmar")?.value;
  const errorEl = document.getElementById("perfil-error");
  const successEl = document.getElementById("perfil-success");

  errorEl?.classList.add("hidden");
  successEl?.classList.add("hidden");

  if (!actual || !nueva || !confirmar) {
    if (errorEl) errorEl.textContent = "Completa todos los campos.";
    errorEl?.classList.remove("hidden");
    return;
  }

  const user = JSON.parse(sessionStorage.getItem("usuario"));
  const userDB = DB_USUARIOS.find(
    (u) => u.cedula === user.cedula && u.password === actual,
  );
  if (!userDB) {
    if (errorEl) errorEl.textContent = "La contraseña actual es incorrecta.";
    errorEl?.classList.remove("hidden");
    return;
  }
  if (nueva.length < 6) {
    if (errorEl) errorEl.textContent = "Mínimo 6 caracteres.";
    errorEl?.classList.remove("hidden");
    return;
  }
  if (nueva !== confirmar) {
    if (errorEl) errorEl.textContent = "Las contraseñas no coinciden.";
    errorEl?.classList.remove("hidden");
    return;
  }

  userDB.password = nueva;
  successEl?.classList.remove("hidden");
  ["pass-actual", "pass-nueva", "pass-confirmar"].forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.value = "";
  });
}

function logoutAdmin() {
  sessionStorage.clear();
  window.location.href = "../../index.html";
}

// ================================
// BÚSQUEDA
// ================================
function manejarBusqueda(query, page) {
  if (page === "usuarios") {
    if (!query) {
      renderEmployees();
      return;
    }
    const filtered = dbGetEmpleados().filter((emp) => {
      const nombre = (emp.firstName + " " + emp.lastName).toLowerCase();
      return nombre.includes(query) || emp.role.toLowerCase().includes(query);
    });
    renderFilteredEmployees(filtered);
  }

  if (page === "reportes") {
    const items = document.querySelectorAll(".reporte-producto-item");
    items.forEach((item) => {
      const texto = item.textContent.toLowerCase();
      item.style.display = texto.includes(query) ? "" : "none";
    });
  }

  if (page === "configuracion") {
    const sections = document.querySelectorAll(".config-section");
    sections.forEach((section) => {
      const texto = section.textContent.toLowerCase();
      section.style.display = texto.includes(query) ? "" : "none";
    });
  }
}

// ================================
// DASHBOARD
// ================================
function initDashboard() {
  const dateEl = document.getElementById("dashboard-date");
  if (dateEl) {
    const f = new Date().toLocaleDateString("es-CO", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    dateEl.textContent = f.charAt(0).toUpperCase() + f.slice(1);
  }

  const mesas = dbGetMesas();
  const ocupadas = mesas.filter((m) => m.estado === "ocupada").length;
  const totalM = mesas.length;
  const el = (id) => document.getElementById(id);
  if (el("stat-mesas")) el("stat-mesas").textContent = ocupadas + " / " + totalM;
  if (el("stat-ocupacion"))
    el("stat-ocupacion").textContent =
      "Ocupación " + Math.round((ocupadas / totalM) * 100) + "%";

  const pedidos = dbGetPedidos().filter((p) => p.estado !== "entregado");
  if (el("stat-ordenes")) el("stat-ordenes").textContent = pedidos.length;

  if (pedidos.length > 0) {
    const totalVentas = pedidos.reduce(
      (s, p) => s + p.detalle.reduce((ss, d) => ss + d.subtotal, 0),
      0,
    );
    const ticket = Math.round(totalVentas / pedidos.length);
    if (el("stat-ventas")) el("stat-ventas").textContent = formatPrecio(totalVentas);
    if (el("stat-ticket")) el("stat-ticket").textContent = formatPrecio(ticket);
  }

  renderEmpleadosTurno();
  renderTopProductos();
}

function renderEmpleadosTurno() {
  const container = document.getElementById("employees-on-shift");
  if (!container) return;
  const empleados = dbGetEmpleados().filter((e) => e.status === "active");
  const colors = ["avatar-red", "avatar-orange", "avatar-green", "avatar-blue", "avatar-purple", "avatar-pink"];
  const roles = {
    mesero: "Mesero",
    "cocina-bar": "Cocina / Bar",
    caja: "Cajero",
    admin: "Administrador",
  };

  container.innerHTML = empleados
    .map(
      (emp, i) => `
        <div class="employee-item">
            <div class="employee-avatar ${colors[i % colors.length]}">
                ${emp.firstName.charAt(0).toUpperCase()}
            </div>
            <div class="employee-item-info">
                <p class="employee-item-name">${emp.firstName} ${emp.lastName}</p>
                <p class="employee-item-role">${roles[emp.role] || emp.role}</p>
            </div>
            <span class="badge badge-active">Activo</span>
        </div>`,
    )
    .join("");
}

function renderTopProductos() {
  const container = document.getElementById("top-products");
  if (!container) return;
  const conteo = {};
  dbGetPedidos().forEach((p) => {
    p.detalle.forEach((d) => {
      if (!conteo[d.producto_id]) conteo[d.producto_id] = { u: 0, t: 0 };
      conteo[d.producto_id].u += d.cantidad;
      conteo[d.producto_id].t += d.subtotal;
    });
  });
  const top = Object.entries(conteo).sort((a, b) => b[1].u - a[1].u).slice(0, 5);
  container.innerHTML = top
    .map(([id, data]) => {
      const prod = dbGetProducto(parseInt(id));
      if (!prod) return "";
      return `
            <div class="product-item">
                <span class="product-name">${prod.nombre}</span>
                <span class="product-units">${data.u} unidades</span>
                <span class="product-price">${formatPrecio(data.t)}</span>
            </div>`;
    })
    .join("");
}

// ================================
// EMPLEADOS
// ================================
function renderEmployees() {
  const employees = dbGetEmpleados();
  renderFilteredEmployees(employees);
  const countEl = document.getElementById("employees-count");
  if (countEl) countEl.textContent = employees.length + " empleados registrados";
}

function renderFilteredEmployees(employees) {
  const tbody = document.getElementById("employees-table");
  if (!tbody) return;
  if (employees.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7" style="text-align:center;padding:40px;color:#9ca3af;">No se encontraron empleados</td></tr>`;
    return;
  }
  const roles = { mesero: "Mesero", "cocina-bar": "Cocina / Bar", caja: "Caja", admin: "Administrador" };
  const shifts = { morning: "Mañana", afternoon: "Tarde" };
  const colors = ["avatar-red", "avatar-orange", "avatar-green", "avatar-blue", "avatar-purple", "avatar-pink"];

  tbody.innerHTML = employees
    .map(
      (emp, i) => `
        <tr>
            <td>
                <div class="employee-name-cell">
                    <div class="employee-avatar ${colors[i % colors.length]}">${emp.firstName.charAt(0).toUpperCase()}</div>
                    <span class="employee-full-name">${emp.firstName} ${emp.lastName}</span>
                </div>
            </td>
            <td>${roles[emp.role] || emp.role}</td>
            <td><span class="badge badge-${emp.shift}">${shifts[emp.shift] || emp.shift}</span></td>
            <td>${emp.shift === "morning" ? "08:00" : "16:00"}</td>
            <td>${emp.shift === "morning" ? "16:00" : "23:00"}</td>
            <td><span class="badge badge-${emp.status}">${emp.status === "active" ? "Activo" : "Inactivo"}</span></td>
            <td>
                <button class="btn-icon edit" onclick="openEditModal(${emp.id})"><i class="fa-solid fa-pen-to-square"></i></button>
                <button class="btn-icon delete" onclick="openConfirmDelete(${emp.id})"><i class="fa-solid fa-trash"></i></button>
            </td>
        </tr>`,
    )
    .join("");
}

function updateStats() {
  const e = dbGetEmpleados();
  const s = (id) => document.getElementById(id);
  if (s("stat-total")) s("stat-total").textContent = e.length;
  if (s("stat-active")) s("stat-active").textContent = e.filter((x) => x.status === "active").length;
  if (s("stat-morning")) s("stat-morning").textContent = e.filter((x) => x.shift === "morning").length;
  if (s("stat-afternoon")) s("stat-afternoon").textContent = e.filter((x) => x.shift === "afternoon").length;
}

function openCreateModal() {
  editingId = null;
  ["field-firstname", "field-lastname", "field-cedula", "field-role", "field-shift"].forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.value = "";
  });
  document.getElementById("modal-error").textContent = "";
  document.getElementById("modal-title").textContent = "Nuevo empleado";
  document.getElementById("save-btn-text").textContent = "Crear empleado";
  document.getElementById("modal-employee").classList.add("active");
}

function openEditModal(id) {
  const emp = dbGetEmpleados().find((e) => e.id === id);
  if (!emp) return;
  editingId = id;
  document.getElementById("field-firstname").value = emp.firstName;
  document.getElementById("field-lastname").value = emp.lastName;
  document.getElementById("field-cedula").value = emp.cedula;
  document.getElementById("field-role").value = emp.role;
  document.getElementById("field-shift").value = emp.shift;
  document.getElementById("modal-error").textContent = "";
  document.getElementById("modal-title").textContent = "Editar empleado";
  document.getElementById("save-btn-text").textContent = "Guardar cambios";
  document.getElementById("modal-employee").classList.add("active");
}

function closeModal() {
  document.getElementById("modal-employee").classList.remove("active");
  editingId = null;
}

function saveEmployee() {
  const firstName = document.getElementById("field-firstname").value.trim();
  const lastName = document.getElementById("field-lastname").value.trim();
  const cedula = document.getElementById("field-cedula").value.trim();
  const role = document.getElementById("field-role").value;
  const shift = document.getElementById("field-shift").value;
  const errorEl = document.getElementById("modal-error");
  errorEl.textContent = "";

  if (!firstName || !lastName || !cedula || !role || !shift) {
    errorEl.textContent = "Por favor completa todos los campos";
    return;
  }
  if (dbCedulaDuplicada(cedula, editingId)) {
    errorEl.textContent = "Ya existe un empleado con esa cédula";
    return;
  }
  if (editingId) {
    dbActualizarEmpleado(editingId, { firstName, lastName, cedula, role, shift });
  } else {
    dbCrearEmpleado({ firstName, lastName, cedula, role, shift });
  }
  closeModal();
  renderEmployees();
  updateStats();
}

function openConfirmDelete(id) {
  const emp = dbGetEmpleados().find((e) => e.id === id);
  if (!emp) return;
  deletingId = id;
  document.getElementById("confirm-name").textContent = emp.firstName + " " + emp.lastName;
  document.getElementById("modal-confirm").classList.add("active");
}

function closeConfirm() {
  document.getElementById("modal-confirm").classList.remove("active");
  deletingId = null;
}

function confirmDelete() {
  if (!deletingId) return;
  dbEliminarEmpleado(deletingId);
  closeConfirm();
  renderEmployees();
  updateStats();
}

// ================================
// REPORTES
// ================================
function initReportes() {
  const hoy = new Date();
  const lunes = new Date(hoy);
  lunes.setDate(hoy.getDate() - hoy.getDay() + 1);
  const domingo = new Date(lunes);
  domingo.setDate(lunes.getDate() + 6);

  const fmt = (d) => d.toLocaleDateString("es-CO", { day: "2-digit", month: "2-digit", year: "numeric" });
  const rangoEl = document.getElementById("reporte-rango");
  if (rangoEl) rangoEl.textContent = "Semana " + fmt(lunes) + " – " + fmt(domingo);

  const pedidos = dbGetPedidos();
  const totalVentas = pedidos.reduce((s, p) => s + p.detalle.reduce((ss, d) => ss + d.subtotal, 0), 0);
  const totalOrdenes = pedidos.length;
  const ticket = totalOrdenes > 0 ? Math.round(totalVentas / totalOrdenes) : 0;
  const propinas = Math.round(totalVentas * 0.1);

  const el = (id) => document.getElementById(id);
  if (el("r-ventas-total")) el("r-ventas-total").textContent = formatPrecio(totalVentas);
  if (el("r-ticket")) el("r-ticket").textContent = formatPrecio(ticket);
  if (el("r-ordenes")) el("r-ordenes").textContent = totalOrdenes;
  if (el("r-ordenes-day")) el("r-ordenes-day").textContent = Math.round(totalOrdenes / 7) + " órdenes/día";
  if (el("r-propinas")) el("r-propinas").textContent = formatPrecio(propinas);
  if (el("r-ventas-change")) el("r-ventas-change").textContent = "+18% vs semana anterior";
  if (el("r-ticket-change")) el("r-ticket-change").textContent = "+13% vs semana anterior";

  renderVentasPorDia();
  renderTopProductosReporte();
  renderDesempenoPorTurno(totalVentas, totalOrdenes, ticket);
}

function renderVentasPorDia() {
  const container = document.getElementById("ventas-por-dia");
  if (!container) return;
  const dias = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
  const pedidos = dbGetPedidos();
  const base = pedidos.reduce((s, p) => s + p.detalle.reduce((ss, d) => ss + d.subtotal, 0), 0);
  const factores = [0.14, 0.15, 0.13, 0.16, 0.19, 0.23];

  container.innerHTML = dias
    .map((dia, i) => {
      const ventas = Math.round(base * factores[i]);
      const ordenes = Math.round(pedidos.length * factores[i] * 2);
      return `
            <div class="ventas-dia-item reporte-producto-item">
                <div>
                    <p style="font-size:14px;font-weight:600;color:#1f2937;">${dia} ${15 + i}</p>
                    <p style="font-size:12px;color:#9ca3af;">${ordenes} órdenes</p>
                </div>
                <span style="font-size:15px;font-weight:700;color:#ea580c;">${formatPrecio(ventas)}</span>
            </div>`;
    })
    .join("");
}

function renderTopProductosReporte() {
  const container = document.getElementById("top-productos-reporte");
  if (!container) return;
  const conteo = {};
  dbGetPedidos().forEach((p) => {
    p.detalle.forEach((d) => {
      if (!conteo[d.producto_id]) conteo[d.producto_id] = { u: 0, t: 0 };
      conteo[d.producto_id].u += d.cantidad;
      conteo[d.producto_id].t += d.subtotal;
    });
  });
  const top = Object.entries(conteo).sort((a, b) => b[1].u - a[1].u).slice(0, 10);
  container.innerHTML = top
    .map(([id, data], i) => {
      const prod = dbGetProducto(parseInt(id));
      if (!prod) return "";
      return `
            <div class="top-prod-item reporte-producto-item">
                <span class="top-prod-num">${i + 1}</span>
                <div class="top-prod-info">
                    <p style="font-size:13px;font-weight:600;color:#1f2937;">${prod.nombre}</p>
                    <p style="font-size:11px;color:#9ca3af;">${data.u} unidades</p>
                </div>
                <span style="font-size:13px;font-weight:700;color:#ea580c;">${formatPrecio(data.t)}</span>
            </div>`;
    })
    .join("");
}

function renderDesempenoPorTurno(totalVentas, totalOrdenes, ticket) {
  const container = document.getElementById("turno-grid");
  if (!container) return;
  const mañana = Math.round(totalVentas * 0.38);
  const tarde = totalVentas - mañana;
  const ordM = Math.round(totalOrdenes * 0.36);
  const ordT = totalOrdenes - ordM;

  container.innerHTML = `
        <div class="turno-card turno-mañana">
            <p class="turno-label">Turno Mañana (8:00–16:00)</p>
            <p class="turno-valor">${formatPrecio(mañana)}</p>
            <p class="turno-sub">${ordM} órdenes · Ticket: ${formatPrecio(Math.round(mañana / ordM))}</p>
        </div>
        <div class="turno-card turno-tarde">
            <p class="turno-label">Turno Tarde (16:00–23:00)</p>
            <p class="turno-valor">${formatPrecio(tarde)}</p>
            <p class="turno-sub">${ordT} órdenes · Ticket: ${formatPrecio(Math.round(tarde / ordT))}</p>
        </div>
        <div class="turno-card turno-general">
            <p class="turno-label">Promedio general</p>
            <p class="turno-valor">${formatPrecio(ticket)}</p>
            <p class="turno-sub">${totalOrdenes} órdenes totales</p>
        </div>`;
}

function exportarPDF() {
  alert("Función de exportar PDF próximamente disponible.");
}

// ================================
// CONFIGURACIÓN
// ================================
function initConfiguracion() {
  const cfg = JSON.parse(localStorage.getItem("xhim-config") || "{}");
  if (cfg.nombre) document.getElementById("cfg-nombre").value = cfg.nombre;
  if (cfg.mesas) document.getElementById("cfg-mesas").value = cfg.mesas;
  if (cfg.telefono) document.getElementById("cfg-telefono").value = cfg.telefono;
  if (cfg.email) document.getElementById("cfg-email").value = cfg.email;
  if (cfg.propina) document.getElementById("cfg-propina").value = cfg.propina;
  if (cfg.iva) document.getElementById("cfg-iva").value = cfg.iva;
  if (cfg.apertura) document.getElementById("cfg-apertura").value = cfg.apertura;
  if (cfg.cierre) document.getElementById("cfg-cierre").value = cfg.cierre;
  if (cfg.turno) document.getElementById("cfg-turno").value = cfg.turno;
}

function guardarConfiguracion() {
  const cfg = {
    nombre: document.getElementById("cfg-nombre").value,
    mesas: document.getElementById("cfg-mesas").value,
    telefono: document.getElementById("cfg-telefono").value,
    email: document.getElementById("cfg-email").value,
    propina: document.getElementById("cfg-propina").value,
    iva: document.getElementById("cfg-iva").value,
    apertura: document.getElementById("cfg-apertura").value,
    cierre: document.getElementById("cfg-cierre").value,
    turno: document.getElementById("cfg-turno").value,
  };
  localStorage.setItem("xhim-config", JSON.stringify(cfg));
  mostrarToastAdmin("✅ Configuración guardada correctamente");
}

function mostrarToastAdmin(msg) {
  let toast = document.getElementById("admin-toast");
  if (!toast) {
    toast = document.createElement("div");
    toast.id = "admin-toast";
    toast.style.cssText = `
            position:fixed;bottom:24px;right:24px;
            background:#fff;border:1.5px solid #00C853;
            border-radius:12px;padding:14px 20px;
            box-shadow:0 8px 32px rgba(0,0,0,0.12);
            z-index:9999;font-size:14px;font-weight:600;
            color:#1f2937;font-family:'Segoe UI',sans-serif;
        `;
    document.body.appendChild(toast);
  }
  toast.textContent = msg;
  toast.style.display = "block";
  setTimeout(() => { toast.style.display = "none"; }, 3000);
}