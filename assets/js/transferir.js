/* ============================================
   SISTEMA XHIMANUT — transferir.js
   Transferir mesa a otro mesero
   ============================================ */

let mesaSeleccionadaTransferir = null;
let meseroSeleccionado         = null;
let zonaActivaTransferir       = 'todas';

function initTransferir() {
  renderZonasTransferir();
  renderMesasTransferir();
}

/* ══════════════════════════════════════
   ZONAS
══════════════════════════════════════ */
function renderZonasTransferir() {
  const zonas = dbGetZonas();
  const tabs  = document.getElementById('zona-tabs');
  tabs.innerHTML = '';

  const tabTodas = document.createElement('button');
  tabTodas.className = `zona-tab ${zonaActivaTransferir === 'todas' ? 'active' : ''}`;
  tabTodas.textContent = 'Todas';
  tabTodas.onclick = () => { zonaActivaTransferir = 'todas'; renderZonasTransferir(); renderMesasTransferir(); };
  tabs.appendChild(tabTodas);

  zonas.forEach(zona => {
    const tab = document.createElement('button');
    tab.className = `zona-tab ${zonaActivaTransferir === zona ? 'active' : ''}`;
    tab.textContent = zona;
    tab.onclick = () => { zonaActivaTransferir = zona; renderZonasTransferir(); renderMesasTransferir(); };
    tabs.appendChild(tab);
  });
}

/* ══════════════════════════════════════
   MESAS
══════════════════════════════════════ */
function renderMesasTransferir() {
  let mesas = dbGetMesas();

  if (zonaActivaTransferir !== 'todas') {
    mesas = mesas.filter(m => m.zona === zonaActivaTransferir);
  }

  const grid = document.getElementById('mesas-transferir-grid');
  grid.innerHTML = '';

  mesas.forEach(mesa => {
    const meseroActual = mesa.mesero_id ? dbGetUsuarioPorId(mesa.mesero_id) : null;
    const seleccionada = mesaSeleccionadaTransferir?.id === mesa.id;

    const card = document.createElement('div');
    card.className = `mesa-transferir-card ${mesa.estado}${seleccionada ? ' selected' : ''}`;
    card.innerHTML = `
      <div class="mesa-transferir-numero">Mesa ${mesa.numero}</div>
      <div class="mesa-transferir-zona">
        <i class="fa-solid fa-location-dot"></i> ${mesa.zona}
        &nbsp;·&nbsp;
        <i class="fa-solid fa-user-group"></i> ${mesa.capacidad}
      </div>
      <span class="badge badge-${mesa.estado === 'libre' ? 'libre' : 'ocupada'}">
        ${mesa.estado === 'libre' ? 'Libre' : 'Ocupada'}
      </span>
      ${meseroActual ? `
        <div class="mesa-transferir-mesero" style="margin-top:8px">
          <i class="fa-solid fa-user-tie"></i>
          ${meseroActual.nombre.split(' ')[0]}
        </div>
      ` : ''}
    `;

    card.onclick = () => seleccionarMesaTransferir(mesa.id);
    grid.appendChild(card);
  });
}

function seleccionarMesaTransferir(mesaId) {
  mesaSeleccionadaTransferir = dbGetMesa(mesaId);
  meseroSeleccionado         = null;

  renderMesasTransferir();

  /* Activar paso 2 */
  const paso2 = document.getElementById('paso-mesero');
  paso2.style.opacity       = '1';
  paso2.style.pointerEvents = 'auto';

  /* Ocultar resumen */
  document.getElementById('transferir-resumen').classList.add('hidden');

  renderMeserosTransferir();

  /* Scroll al paso 2 */
  paso2.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

/* ══════════════════════════════════════
   MESEROS
══════════════════════════════════════ */
function renderMeserosTransferir() {
  const meseros = dbGetMeseros();
  const grid    = document.getElementById('meseros-grid');
  grid.innerHTML = '';

  meseros.forEach(mesero => {
    const esMismo    = mesero.id === mesaSeleccionadaTransferir?.mesero_id;
    const seleccionado = meseroSeleccionado?.id === mesero.id;
    const iniciales  = mesero.nombre.split(' ').map(p => p[0]).slice(0, 2).join('').toUpperCase();

    /* Contar mesas que atiende */
    const mesasAtendidas = dbGetMesas().filter(m => m.mesero_id === mesero.id).length;

    const card = document.createElement('div');
    card.className = `mesero-card${esMismo ? ' mismo' : ''}${seleccionado ? ' selected' : ''}`;
    card.innerHTML = `
      <div class="mesero-avatar">${iniciales}</div>
      <div>
        <div class="mesero-info-nombre">${mesero.nombre}</div>
        <div class="mesero-info-mesas">
          <i class="fa-solid fa-chair"></i>
          ${mesasAtendidas} mesa${mesasAtendidas !== 1 ? 's' : ''} activa${mesasAtendidas !== 1 ? 's' : ''}
          ${esMismo ? ' · (mesero actual)' : ''}
        </div>
      </div>
    `;

    if (!esMismo) {
      card.onclick = () => seleccionarMeseroTransferir(mesero.id);
    }

    grid.appendChild(card);
  });
}

function seleccionarMeseroTransferir(meseroId) {
  meseroSeleccionado = dbGetUsuarioPorId(meseroId);
  renderMeserosTransferir();
  mostrarResumenTransferir();
}

/* ══════════════════════════════════════
   RESUMEN Y CONFIRMACIÓN
══════════════════════════════════════ */
function mostrarResumenTransferir() {
  const resumen = document.getElementById('transferir-resumen');
  resumen.classList.remove('hidden');

  const mesa   = mesaSeleccionadaTransferir;
  const mesero = meseroSeleccionado;

  document.getElementById('resumen-mesa').textContent =
    `Mesa ${mesa.numero} · ${mesa.zona}`;
  document.getElementById('resumen-mesero').textContent =
    mesero.nombre;

  resumen.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function confirmarTransferencia() {
  if (!mesaSeleccionadaTransferir || !meseroSeleccionado) return;

  const mesa   = mesaSeleccionadaTransferir;
  const mesero = meseroSeleccionado;

  /* Transferir en db */
  dbTransferirMesa(mesa.id, mesero.id);

  /* Mostrar modal */
  document.getElementById('modal-transferir-msg').textContent =
    `Mesa ${mesa.numero} asignada a ${mesero.nombre} correctamente.`;
  document.getElementById('modal-transferir').classList.remove('hidden');
}

function cerrarModalTransferir() {
  document.getElementById('modal-transferir').classList.add('hidden');

  /* Resetear */
  mesaSeleccionadaTransferir = null;
  meseroSeleccionado         = null;
  zonaActivaTransferir       = 'todas';

  const paso2 = document.getElementById('paso-mesero');
  paso2.style.opacity       = '0.4';
  paso2.style.pointerEvents = 'none';
  document.getElementById('transferir-resumen').classList.add('hidden');

  renderZonasTransferir();
  renderMesasTransferir();
}