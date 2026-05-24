/* ============================================
   SISTEMA XHIMANUT — layout.js
   ============================================ */

const MENUS = {
  mesero: [
    { section: 'General' },
    { icon: 'fa-solid fa-house',        label: 'Inicio / Mesas',   href: '../../pages/mesero/pedidos.html',    page: 'Inicio / Mesas'  },
    { icon: 'fa-solid fa-eye',          label: 'Estado pedido',    href: '../../pages/mesero/estado.html',     page: 'Estado pedido'   },
    { icon: 'fa-solid fa-file-invoice', label: 'Solicitar cuenta', href: '../../pages/mesero/cuenta.html',     page: 'Cuenta'          },
    { section: 'Herramientas' },
    { icon: 'fa-solid fa-book-open',    label: 'Ver menú',         href: '../../pages/mesero/menu.html',       page: 'Menú'            },
    { icon: 'fa-solid fa-right-left',   label: 'Transferir mesa',  href: '../../pages/mesero/transferir.html', page: 'Transferir mesa' },
  ],
  'cocina-bar-cocina': [
    { section: 'Cocina ' },
    { icon: 'fa-solid fa-fire-burner',     label: 'Cola de pedidos',   href: '../../pages/cocina-bar/cola-pedidos.html?zona=cocina', page: 'Cola pedidos'    },
    { icon: 'fa-solid fa-chart-bar',       label: 'Estadísticas',      href: '../../pages/cocina-bar/estadisticas.html?zona=cocina', page: 'Estadísticas'   },
    { section: 'Acciones' },
    { icon: 'fa-solid fa-ban',             label: 'Marcar agotado',    href: '../../pages/cocina-bar/agotados.html',                 page: 'Agotados'       },
    { icon: 'fa-solid fa-arrows-rotate',   label: 'Cambiar zona',      href: '../../pages/cocina-bar/zona.html',                     page: 'Zona'           },
  ],
  'cocina-bar-bar': [
    { section: 'Bar ' },
    { icon: 'fa-solid fa-martini-glass',   label: 'Cola de pedidos',   href: '../../pages/cocina-bar/cola-pedidos.html?zona=bar',    page: 'Cola pedidos'   },
    { icon: 'fa-solid fa-chart-bar',       label: 'Estadísticas',      href: '../../pages/cocina-bar/estadisticas.html?zona=bar',    page: 'Estadísticas'   },
    { section: 'Acciones' },
    { icon: 'fa-solid fa-arrows-rotate',   label: 'Cambiar zona',      href: '../../pages/cocina-bar/zona.html',                     page: 'Zona'           },
  ],
  caja: [
    { section: 'General' },
    { icon: 'fa-solid fa-receipt',         label: 'Generar factura',   href: '../../pages/caja/factura.html',      page: 'Factura'        },
    { icon: 'fa-solid fa-money-bill',      label: 'Registrar pago',    href: '../../pages/caja/pago.html',         page: 'Pago'           },
    { section: 'Cierre' },
    { icon: 'fa-solid fa-cash-register',   label: 'Cierre de caja',    href: '../../pages/caja/cierre-caja.html',  page: 'Cierre de caja' },
  ],
  admin: [
    { section: 'General' },
    { icon: 'fa-solid fa-chart-line',      label: 'Dashboard',         href: '../../pages/admin/dashboard.html',   page: 'Dashboard'      },
    { section: 'Gestión' },
    { icon: 'fa-solid fa-users',           label: 'Usuarios',          href: '../../pages/admin/usuarios.html',    page: 'Usuarios'       },
  ],
};

const ROL_LABELS = {
  mesero:             'Mesero',
  'cocina-bar-cocina':'Cocina',
  'cocina-bar-bar':   'Bar',
  'cocina-bar':       'Cocina / Bar',
  caja:               'Cajero',
  admin:              'Administrador',
};

let notificaciones = [];

async function initLayout(paginaActual = '') {
  const usuario = JSON.parse(sessionStorage.getItem('usuario'));
  if (!usuario) { window.location.href = getLoginPath(); return; }

  try {
    const res  = await fetch('../../layout/navbar.html');
    const html = await res.text();
    document.getElementById('layout-container').innerHTML = html;
  } catch (e) {
    console.error('Error cargando layout:', e);
    return;
  }

  /* Determinar menú según rol + zona */
  const { nombre, rol, cedula } = usuario;
  let menuKey = rol;

  if (rol === 'cocina-bar') {
    const zona = sessionStorage.getItem(`zona-${usuario.id}`);
    if (zona) menuKey = `cocina-bar-${zona}`;
  }

  const menu     = MENUS[menuKey] || [];
  const iniciales = nombre.split(' ').map(p => p[0]).slice(0, 2).join('').toUpperCase();
  const rolLabel  = ROL_LABELS[menuKey] || ROL_LABELS[rol] || rol;

  /* Navbar */
  document.getElementById('navbar-avatar').textContent     = iniciales;
  document.getElementById('navbar-nombre').textContent     = nombre;
  document.getElementById('sidebar-rol-label').textContent = rolLabel;

  /* Panel perfil */
  const pa = document.getElementById('perfil-avatar-grande');
  const pn = document.getElementById('perfil-nombre-grande');
  const pr = document.getElementById('perfil-rol-badge');
  const pc = document.getElementById('perfil-cedula');
  const po = document.getElementById('perfil-rol');
  if (pa) pa.textContent = iniciales;
  if (pn) pn.textContent = nombre;
  if (pr) pr.textContent = rolLabel;
  if (pc) pc.textContent = cedula || '—';
  if (po) po.textContent = rolLabel;

  if (paginaActual) {
    document.getElementById('navbar-page-title').textContent = paginaActual;
  }

  /* Generar menú */
  const nav = document.getElementById('sidebar-nav');
  nav.innerHTML = '';

  menu.forEach(item => {
    if (item.section) {
      const sec = document.createElement('div');
      sec.className   = 'sidebar-section-title';
      sec.textContent = item.section;
      nav.appendChild(sec);
    } else {
      const esActivo = paginaActual === item.page;
      const a = document.createElement('a');
      a.href      = item.href;
      a.className = `sidebar-nav-item${esActivo ? ' active' : ''}`;
      a.innerHTML = `
        <span class="sidebar-nav-icon"><i class="${item.icon}"></i></span>
        <span class="sidebar-nav-label">${item.label}</span>
        <span class="nav-notif-dot hidden" id="dot-${item.page.replace(/[\s/]/g, '-').toLowerCase()}"></span>
      `;
      nav.appendChild(a);
    }
  });

  /* Logout */
  const btnLogout = document.getElementById('btn-logout');
  if (btnLogout) {
    btnLogout.addEventListener('click', e => { e.preventDefault(); cerrarSesion(); });
  }

  /* Click en avatar abre perfil */
  const navbarUser = document.getElementById('navbar-user');
  if (navbarUser) navbarUser.addEventListener('click', () => abrirPerfil());

  /* Polling notificaciones solo para mesero */
  if (rol === 'mesero') {
    iniciarPollingNotificaciones(usuario.id);
  }
}

/* ══════════════════════════════════════
   POLLING NOTIFICACIONES
══════════════════════════════════════ */
let ultimoTimestamp = Date.now();

function iniciarPollingNotificaciones(meseroId) {
  setInterval(() => verificarNotifsLocalStorage(meseroId), 3000);
}

function verificarNotifsLocalStorage(meseroId) {
  const cola   = JSON.parse(localStorage.getItem('xhim-notifs') || '[]');
  const nuevas = cola.filter(n =>
    n.meseroId === meseroId &&
    !n.leida &&
    n.timestamp > ultimoTimestamp - 5000
  );

  nuevas.forEach(n => {
    n.leida = true;
    agregarNotificacion(
      `¡Pedido #${n.pedidoId} listo!`,
      `Mesa ${n.mesaNum} lista para entregar`,
      'listo'
    );
    ultimoTimestamp = Date.now();
  });

  if (nuevas.length > 0) {
    localStorage.setItem('xhim-notifs', JSON.stringify(cola));
  }
}

/* ══════════════════════════════════════
   PANEL NOTIFICACIONES
══════════════════════════════════════ */
function toggleNotificaciones() {
  const panel   = document.getElementById('panel-notificaciones');
  const overlay = document.getElementById('notif-overlay');

  if (panel.classList.contains('hidden')) {
    cerrarPaneles();
    panel.classList.remove('hidden');
    overlay.classList.remove('hidden');
    renderNotificaciones();
    const badge = document.getElementById('notif-badge');
    if (badge) badge.style.display = 'none';
  } else {
    cerrarPaneles();
  }
}

function renderNotificaciones() {
  const lista = document.getElementById('notif-lista');
  if (!lista) return;

  if (notificaciones.length === 0) {
    lista.innerHTML = `
      <div class="notif-vacia">
        <i class="fa-solid fa-bell-slash"></i>
        <p>Sin notificaciones nuevas</p>
      </div>`;
    return;
  }

  lista.innerHTML = '';
  notificaciones.slice().reverse().forEach(n => {
    const div = document.createElement('div');
    div.className = `notif-item${n.leida ? '' : ' no-leida'}`;
    div.innerHTML = `
      <div class="notif-item-icon ${n.tipo}">
        <i class="${n.icono}"></i>
      </div>
      <div class="notif-item-body">
        <div class="notif-item-titulo">${n.titulo}</div>
        <div class="notif-item-msg">${n.mensaje}</div>
        <div class="notif-item-hora">${n.hora}</div>
      </div>
    `;
    lista.appendChild(div);
    n.leida = true;
  });
}

function agregarNotificacion(titulo, mensaje, tipo = 'listo') {
  const iconos = {
    listo:  'fa-solid fa-circle-check',
    alerta: 'fa-solid fa-triangle-exclamation',
    info:   'fa-solid fa-circle-info',
  };

  notificaciones.push({
    titulo, mensaje, tipo,
    icono: iconos[tipo] || iconos.info,
    hora:  new Date().toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' }),
    leida: false,
  });

  const badge = document.getElementById('notif-badge');
  if (badge) badge.style.display = 'block';

  mostrarToastGlobal(`🟢 ${titulo}`, mensaje);
}

/* ══════════════════════════════════════
   PANEL PERFIL
══════════════════════════════════════ */
function abrirPerfil() {
  cerrarPaneles();
  document.getElementById('panel-perfil')?.classList.remove('hidden');
  document.getElementById('notif-overlay')?.classList.remove('hidden');
  ['pass-actual', 'pass-nueva', 'pass-confirmar'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = '';
  });
  ocultarMensajesPerfil();
}

function guardarPerfil() {
  const actual    = document.getElementById('pass-actual')?.value;
  const nueva     = document.getElementById('pass-nueva')?.value;
  const confirmar = document.getElementById('pass-confirmar')?.value;
  const usuario   = JSON.parse(sessionStorage.getItem('usuario'));

  ocultarMensajesPerfil();

  if (!actual || !nueva || !confirmar) { mostrarErrorPerfil('Completa todos los campos.'); return; }

  const usuarioDB = dbGetUsuario(usuario.cedula, actual);
  if (!usuarioDB) { mostrarErrorPerfil('La contraseña actual es incorrecta.'); return; }
  if (nueva.length < 6) { mostrarErrorPerfil('Mínimo 6 caracteres.'); return; }
  if (nueva !== confirmar) { mostrarErrorPerfil('Las contraseñas no coinciden.'); return; }

  const userEnDB = DB_USUARIOS.find(u => u.cedula === usuario.cedula);
  if (userEnDB) userEnDB.password = nueva;

  document.getElementById('perfil-success')?.classList.remove('hidden');
  ['pass-actual', 'pass-nueva', 'pass-confirmar'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = '';
  });
}

function mostrarErrorPerfil(msg) {
  const el = document.getElementById('perfil-error');
  if (el) { el.textContent = msg; el.classList.remove('hidden'); }
}

function ocultarMensajesPerfil() {
  document.getElementById('perfil-error')?.classList.add('hidden');
  document.getElementById('perfil-success')?.classList.add('hidden');
}

function cerrarPaneles() {
  document.getElementById('panel-notificaciones')?.classList.add('hidden');
  document.getElementById('panel-perfil')?.classList.add('hidden');
  document.getElementById('notif-overlay')?.classList.add('hidden');
}

/* ══════════════════════════════════════
   TOAST GLOBAL
══════════════════════════════════════ */
let toastGlobalTimeout = null;

function mostrarToastGlobal(titulo, msg) {
  let toast = document.getElementById('toast-global');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'toast-global';
    toast.style.cssText = `
      position:fixed;bottom:24px;right:24px;
      background:#fff;border:1.5px solid #00C853;border-radius:12px;
      padding:14px 18px;display:flex;align-items:center;gap:12px;
      box-shadow:0 8px 32px rgba(0,0,0,0.12);z-index:9999;
      min-width:300px;font-family:'Segoe UI',sans-serif;
    `;
    document.body.appendChild(toast);
  }

  toast.innerHTML = `
    <div style="width:38px;height:38px;border-radius:50%;
      background:rgba(0,200,83,0.12);color:#00C853;
      display:flex;align-items:center;justify-content:center;
      font-size:16px;flex-shrink:0;border:1px solid rgba(0,200,83,0.3);">
      <i class="fa-solid fa-bell"></i>
    </div>
    <div style="flex:1">
      <div style="font-size:13px;font-weight:800;color:#1A1A1A">${titulo}</div>
      <div style="font-size:11px;color:#9E9E9E;margin-top:2px">${msg}</div>
    </div>
    <button onclick="cerrarToastGlobal()" style="background:none;border:none;
      color:#9E9E9E;cursor:pointer;font-size:12px;padding:4px;">
      <i class="fa-solid fa-x"></i>
    </button>
  `;
  toast.style.display = 'flex';

  if (toastGlobalTimeout) clearTimeout(toastGlobalTimeout);
  toastGlobalTimeout = setTimeout(cerrarToastGlobal, 6000);
}

function cerrarToastGlobal() {
  const t = document.getElementById('toast-global');
  if (t) t.style.display = 'none';
}

function cerrarSesion() {
  sessionStorage.clear();
  window.location.href = getLoginPath();
}

function getLoginPath() {
  const depth = window.location.pathname.split('/').length - 2;
  return '../'.repeat(depth) + 'index.html';
}