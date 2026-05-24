/* ============================================
   SISTEMA XHIMANUT — cocina-bar.js
   ============================================ */

let zonaActual   = null;
let pedidoActual = null;
let filtroActual = 'all';

function initCocinBar() {
  const params   = new URLSearchParams(window.location.search);
  const usuario  = JSON.parse(sessionStorage.getItem('usuario'));
  zonaActual     = params.get('zona') ||
                   sessionStorage.getItem(`zona-${usuario?.id}`);

  if (!zonaActual) {
    window.location.href = 'zona.html';
    return;
  }

  const nombres = { cocina: ' Cocina', bar: ' Bar' };
  document.getElementById('zone-tag').textContent     = nombres[zonaActual];
  document.getElementById('queue-titulo').textContent =
    `Cola de pedidos — ${zonaActual === 'cocina' ? 'Cocina' : 'Bar'}`;

  renderQueue();
  updateStats();
}

function cambiarZona() {
  const usuario = JSON.parse(sessionStorage.getItem('usuario'));
  sessionStorage.removeItem(`zona-${usuario.id}`);
  window.location.href = 'zona.html';
}

function showScreen(screenId) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById(screenId).classList.add('active');
}

function getPedidosDeZona() {
  return dbGetPedidos().filter(p => {
    if (p.estado === 'entregado') return false;
    return p.detalle.some(item => {
      const cat = dbGetCategoria(dbGetProducto(item.producto_id)?.categoria_id);
      return cat?.area === zonaActual;
    });
  });
}

function getItemsDeZona(pedido) {
  return pedido.detalle.filter(item => {
    const cat = dbGetCategoria(dbGetProducto(item.producto_id)?.categoria_id);
    return cat?.area === zonaActual;
  });
}

function updateStats() {
  const pedidos = getPedidosDeZona();
  document.getElementById('stat-pending').textContent    = pedidos.filter(p => p.estado === 'pendiente').length;
  document.getElementById('stat-inprogress').textContent = pedidos.filter(p => p.estado === 'en_preparacion').length;
  document.getElementById('stat-ready').textContent      = pedidos.filter(p => p.estado === 'listo').length;
  document.getElementById('stat-total').textContent      = pedidos.length;
}

function renderQueue() {
  const container = document.getElementById('orders-list');
  let pedidos     = getPedidosDeZona();

  if (filtroActual !== 'all') {
    pedidos = pedidos.filter(p => p.estado === filtroActual);
  }

  if (pedidos.length === 0) {
    container.innerHTML = `
      <div class="empty-message">
        <i class="fa-solid fa-circle-check" style="font-size:32px;display:block;margin-bottom:8px;color:#00C853;opacity:0.5"></i>
        No hay pedidos pendientes en esta zona
      </div>`;
    updateStats();
    return;
  }

  container.innerHTML = '';

  pedidos.forEach(pedido => {
    const mesa   = dbGetMesa(pedido.mesa_id);
    const items  = getItemsDeZona(pedido);
    const total  = items.length;
    const listos = items.filter(i => i._listo).length;
    const pct    = total > 0 ? Math.round((listos / total) * 100) : 0;

    const itemsTexto = items.map(i => {
      const p = dbGetProducto(i.producto_id);
      return `${p?.nombre} ×${i.cantidad}`;
    }).join(', ');

    const estadoLabel = {
      pendiente:      'Pendiente',
      en_preparacion: 'En proceso',
      listo:          'Listo',
    }[pedido.estado] || pedido.estado;

    const progressHTML = pedido.estado === 'en_preparacion'
      ? `<div class="card-progress">
           <div class="card-progress-fill" style="width:${pct}%"></div>
         </div>
         <p class="card-progress-text">${listos}/${total} items listos</p>`
      : '';

    const card = document.createElement('div');
    card.className = `order-card ${pedido.estado}`;
    card.innerHTML = `
      <div class="order-card-header">
        <div>
          <p class="order-number">Pedido #${pedido.id}</p>
          <p class="order-mesa">Mesa ${mesa?.numero || pedido.mesa_id} · ${mesa?.zona || ''}</p>
        </div>
        <span class="order-ago">${pedido.hora}</span>
      </div>
      <p class="order-items-text">${itemsTexto}</p>
      <span class="status-tag ${pedido.estado}">${estadoLabel}</span>
      ${progressHTML}
      <p class="order-footer">
        <i class="fa-solid fa-clock"></i> ${pedido.hora}
        &nbsp;·&nbsp;
        <i class="fa-solid fa-location-dot"></i> ${mesa?.zona || '—'}
      </p>
      <button class="detail-button" onclick="verDetalle(${pedido.id})">
        Ver detalle →
      </button>
    `;
    container.appendChild(card);
  });

  updateStats();
}

function filterOrders(filtro, btn) {
  filtroActual = filtro;
  document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  renderQueue();
}

function verDetalle(pedidoId) {
  pedidoActual = dbGetPedidos().find(p => p.id === pedidoId);
  if (!pedidoActual) return;

  const mesa = dbGetMesa(pedidoActual.mesa_id);

  document.getElementById('detail-title').textContent =
    `Pedido #${pedidoActual.id} · Mesa ${mesa?.numero}`;

  const statusLabels = {
    pendiente:      'PENDIENTE',
    en_preparacion: 'EN PROCESO',
    listo:          'LISTO',
  };

  const badge = document.getElementById('detail-status');
  badge.textContent = statusLabels[pedidoActual.estado] || pedidoActual.estado;
  badge.className   = `status-badge ${pedidoActual.estado}`;

  document.getElementById('detail-time').textContent  = `Hora: ${pedidoActual.hora}`;
  document.getElementById('panel-table').textContent  = `Mesa ${mesa?.numero}`;
  document.getElementById('panel-zone').textContent   = mesa?.zona || '—';
  document.getElementById('panel-time').textContent   = pedidoActual.hora;
  document.getElementById('panel-area').textContent   = zonaActual === 'cocina' ? 'Cocina' : 'Bar';

  if (pedidoActual.estado === 'pendiente') {
    dbActualizarEstadoPedido(pedidoActual.id, 'en_preparacion');
    pedidoActual.estado = 'en_preparacion';
    badge.textContent   = 'EN PROCESO';
    badge.className     = 'status-badge en_preparacion';
  }

  renderDetailItems();
  renderOtherOrders();
  showScreen('screen-detail');
}

function renderDetailItems() {
  const container = document.getElementById('detail-items');
  const items     = getItemsDeZona(pedidoActual);

  container.innerHTML = items.map((item, idx) => {
    const producto = dbGetProducto(item.producto_id);
    const listo    = item._listo || false;
    const statusTag = listo
      ? `<span class="item-status-tag completed">Completado</span>`
      : `<span class="item-status-tag pending">Pendiente</span>`;

    return `
      <div class="item-row">
        <input type="checkbox" class="item-checkbox"
          ${listo ? 'checked' : ''}
          onchange="toggleItem(${idx}, this.checked)"
        />
        <div class="item-content">
          <p class="item-name">${producto?.nombre} ×${item.cantidad}</p>
          ${statusTag}
        </div>
      </div>
    `;
  }).join('');

  updateProgress();
}

function toggleItem(idx, checked) {
  const items = getItemsDeZona(pedidoActual);
  const item  = pedidoActual.detalle.find(d =>
    d.producto_id === items[idx].producto_id
  );
  if (item) item._listo = checked;
  renderDetailItems();
}

function updateProgress() {
  const items  = getItemsDeZona(pedidoActual);
  const total  = items.length;
  const listos = items.filter(i => i._listo).length;
  const pct    = total > 0 ? Math.round((listos / total) * 100) : 0;

  document.getElementById('progress-text').textContent    = `${listos}/${total} items`;
  document.getElementById('progress-percent').textContent = `${pct}% completado`;
  document.getElementById('progress-fill').style.width    = `${pct}%`;
}

function renderOtherOrders() {
  const container = document.getElementById('other-orders-list');
  const otros     = getPedidosDeZona().filter(p => p.id !== pedidoActual.id);

  if (otros.length === 0) {
    container.innerHTML = `<p style="font-size:12px;color:#9E9E9E">No hay otras órdenes activas</p>`;
    return;
  }

  container.innerHTML = otros.map(p => {
    const mesa  = dbGetMesa(p.mesa_id);
    const label = { pendiente: 'Pendiente', en_preparacion: 'En proceso', listo: 'Listo' }[p.estado] || p.estado;
    return `
      <a href="#" class="other-order-link" onclick="verDetalle(${p.id}); return false;">
        Pedido #${p.id} · Mesa ${mesa?.numero} ·
        <span style="color:#E53935;font-weight:700">${label}</span>
      </a>
    `;
  }).join('');
}

/* ══════════════════════════════════════
   MARCAR LISTO — notifica al mesero
══════════════════════════════════════ */
function markAsReady() {
  pedidoActual.detalle.forEach(item => {
    const cat = dbGetCategoria(dbGetProducto(item.producto_id)?.categoria_id);
    if (cat?.area === zonaActual) item._listo = true;
  });

  dbActualizarEstadoPedido(pedidoActual.id, 'listo');
  pedidoActual.estado = 'listo';

  /* ── Escribir notificación en localStorage ── */
  const mesa = dbGetMesa(pedidoActual.mesa_id);
  const cola = JSON.parse(localStorage.getItem('xhim-notifs') || '[]');

  cola.push({
    pedidoId:  pedidoActual.id,
    mesaNum:   mesa?.numero,
    meseroId:  pedidoActual.mesero_id,
    zona:      zonaActual,
    timestamp: Date.now(),
    leida:     false,
  });

  localStorage.setItem('xhim-notifs', JSON.stringify(cola));

  showConfirmation();
}

function markPartial() {
  const items  = getItemsDeZona(pedidoActual);
  const alguno = items.some(i => i._listo);

  if (!alguno) {
    alert('Marca al menos un item como listo primero.');
    return;
  }

  dbActualizarEstadoPedido(pedidoActual.id, 'en_preparacion');
  showConfirmation();
}

function showConfirmation() {
  const mesa  = dbGetMesa(pedidoActual.mesa_id);
  const items = getItemsDeZona(pedidoActual);

  document.getElementById('confirm-title').textContent       = `¡Pedido #${pedidoActual.id} listo!`;
  document.getElementById('confirm-subtitle').textContent    = `Mesa ${mesa?.numero} — El mesero ha sido notificado`;
  document.getElementById('confirm-order-title').textContent = `Pedido #${pedidoActual.id} · Mesa ${mesa?.numero}`;
  document.getElementById('confirm-time').innerHTML          = `Hora: <strong>${pedidoActual.hora}</strong>`;

  document.getElementById('confirm-items').innerHTML = items.map(item => {
    const p = dbGetProducto(item.producto_id);
    return `
      <div class="confirm-item">
        <i class="fa-solid fa-circle-check"></i>
        ${p?.nombre} ×${item.cantidad}
      </div>
    `;
  }).join('');

  showScreen('screen-confirmation');
}

function nextOrder() {
  pedidoActual = null;
  filtroActual = 'all';
  document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
  document.querySelector('.filter-btn').classList.add('active');
  renderQueue();
  showScreen('screen-queue');
}

function goBackToQueue() {
  pedidoActual = null;
  renderQueue();
  showScreen('screen-queue');
}