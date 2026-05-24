/* ============================================
   SISTEMA XHIMANUT — assets/js/auth.js
   Autenticación: login + registro
   ============================================ */

/* ── Rol seleccionado en registro ── */
let _rolRegistro = null;

/* Mapa de roles del HTML al rol de DB */
const ROL_MAP = {
  waiter:  'mesero',
  kitchen: 'cocina-bar',
  bar:     'cocina-bar',
  cashier: 'caja',
  admin:   'admin',
};

/* ══════════════════════════════════════
   LOGIN
══════════════════════════════════════ */
function login() {
  const cedula   = document.getElementById('login-cedula').value.trim();
  const password = document.getElementById('login-password').value;
  const errorEl  = document.getElementById('login-error');

  errorEl.textContent = '';

  if (!cedula || !password) {
    errorEl.textContent = 'Por favor completa todos los campos.';
    return;
  }

  const usuario = dbGetUsuario(cedula, password);

  if (!usuario) {
    errorEl.textContent = 'Cédula o contraseña incorrectos.';
    _shake(document.querySelector('#screen-login .auth-button'));
    return;
  }

  /* Guardar sesión */
  sessionStorage.setItem('usuario', JSON.stringify(usuario));

  /* Recordarme */
  if (document.getElementById('remember-me')?.checked) {
    localStorage.setItem('xhim-cedula', cedula);
  } else {
    localStorage.removeItem('xhim-cedula');
  }

  /* Redirigir según rol */
  _redirigir(usuario);
}

/* Redirigir al módulo correcto según rol */
function _redirigir(usuario) {
  const rutas = {
    mesero:     'pages/mesero/pedidos.html',
    'cocina-bar': null, // necesita elegir zona primero
    caja:       'pages/caja/factura.html',
    admin:      'pages/admin/dashboard.html',
  };

  if (usuario.rol === 'cocina-bar') {
    /* Si ya eligió zona antes, ir directo */
    const zonaGuardada = localStorage.getItem(`xhim-zona-${usuario.id}`);
    if (zonaGuardada) {
      sessionStorage.setItem(`zona-${usuario.id}`, zonaGuardada);
      window.location.href = `pages/cocina-bar/cola-pedidos.html?zona=${zonaGuardada}`;
    } else {
      window.location.href = 'pages/cocina-bar/zona.html';
    }
    return;
  }

  const ruta = rutas[usuario.rol];
  if (ruta) {
    window.location.href = ruta;
  } else {
    document.getElementById('login-error').textContent = 'Rol no reconocido. Contacta al administrador.';
  }
}

/* ══════════════════════════════════════
   REGISTRO
══════════════════════════════════════ */
function selectRegisterRole(rolKey, btn) {
  _rolRegistro = rolKey;
  document.querySelectorAll('#register-roles .role-btn')
    .forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
}

function register() {
  const nombre    = (document.getElementById('reg-firstname').value.trim() + ' ' +
                     document.getElementById('reg-lastname').value.trim()).trim();
  const cedula    = document.getElementById('reg-cedula').value.trim();
  const password  = document.getElementById('reg-password').value;
  const confirmar = document.getElementById('reg-confirm').value;
  const terms     = document.getElementById('terms').checked;
  const errorEl   = document.getElementById('register-error');

  errorEl.textContent = '';

  /* Validaciones */
  if (!nombre || nombre === '') {
    errorEl.textContent = 'Ingresa tu nombre y apellido.'; return;
  }
  if (!cedula) {
    errorEl.textContent = 'Ingresa tu número de cédula.'; return;
  }
  if (!_rolRegistro) {
    errorEl.textContent = 'Selecciona tu rol en el restaurante.'; return;
  }
  if (!password || password.length < 6) {
    errorEl.textContent = 'La contraseña debe tener al menos 6 caracteres.'; return;
  }
  if (password !== confirmar) {
    errorEl.textContent = 'Las contraseñas no coinciden.'; return;
  }
  if (!terms) {
    errorEl.textContent = 'Debes aceptar los términos y condiciones.'; return;
  }

  /* Verificar cédula duplicada */
  const existe = DB_USUARIOS.find(u => u.cedula === cedula);
  if (existe) {
    errorEl.textContent = 'Ya existe un usuario con esa cédula.'; return;
  }

  /* Crear usuario */
  const nuevoUsuario = {
    id:       DB_USUARIOS.length + 1,
    cedula,
    password,
    nombre,
    rol:      ROL_MAP[_rolRegistro] || 'mesero',
  };

  DB_USUARIOS.push(nuevoUsuario);

  /* Mostrar éxito y volver al login después de 2 s */
  errorEl.style.color = 'var(--color-success)';
  errorEl.textContent = '¡Cuenta creada! Ahora inicia sesión.';

  setTimeout(() => {
    errorEl.style.color  = '';
    errorEl.textContent  = '';
    _rolRegistro         = null;
    document.querySelectorAll('#register-roles .role-btn')
      .forEach(b => b.classList.remove('active'));
    showLogin();
  }, 2000);
}

/* ══════════════════════════════════════
   NAVEGACIÓN ENTRE PANTALLAS
══════════════════════════════════════ */
function showRegister() {
  document.getElementById('screen-login').classList.remove('active');
  document.getElementById('screen-register').classList.add('active');
  _resetErrors();
}

function showLogin() {
  document.getElementById('screen-register').classList.remove('active');
  document.getElementById('screen-login').classList.add('active');
  _resetErrors();
}

/* ══════════════════════════════════════
   UTILIDADES
══════════════════════════════════════ */

/* Toggle visibilidad contraseña */
function togglePassword(inputId, btn) {
  const input = document.getElementById(inputId);
  const icon  = btn.querySelector('i');
  if (input.type === 'password') {
    input.type = 'text';
    icon.className = 'fa-solid fa-eye-slash';
  } else {
    input.type = 'password';
    icon.className = 'fa-solid fa-eye';
  }
}

/* Animación shake en error */
function _shake(el) {
  if (!el) return;
  el.style.animation = 'none';
  el.offsetHeight; // reflow
  el.style.animation = 'shake 0.4s ease';
}

/* Limpiar mensajes de error */
function _resetErrors() {
  ['login-error', 'register-error'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.textContent = '';
  });
}

/* ── Animación shake ── */
const _shakeStyle = document.createElement('style');
_shakeStyle.textContent = `
  @keyframes shake {
    0%,100% { transform: translateX(0); }
    20%      { transform: translateX(-6px); }
    40%      { transform: translateX(6px); }
    60%      { transform: translateX(-4px); }
    80%      { transform: translateX(4px); }
  }
`;
document.head.appendChild(_shakeStyle);

/* ── Autocompletar cédula si fue guardada ── */
document.addEventListener('DOMContentLoaded', () => {
  const guardada = localStorage.getItem('xhim-cedula');
  if (guardada) {
    const input = document.getElementById('login-cedula');
    if (input) {
      input.value = guardada;
      document.getElementById('remember-me').checked = true;
    }
  }

  /* Enter en password dispara login */
  document.getElementById('login-password')?.addEventListener('keydown', e => {
    if (e.key === 'Enter') login();
  });

  /* Enter en confirm-password dispara register */
  document.getElementById('reg-confirm')?.addEventListener('keydown', e => {
    if (e.key === 'Enter') register();
  });
});