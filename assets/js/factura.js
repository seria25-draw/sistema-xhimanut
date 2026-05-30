/* ============================================
   SISTEMA XHIMANUT — assets/js/factura.js
   Generación de factura digital
   ============================================ */

const IVA_PORCENTAJE = 0.08;

let _mesaSeleccionada  = null;
let _pedidoActual      = null;
let _metodoPago        = 'efectivo';

function initFactura() {
  _renderMesasOcupadas();
  _setFecha();
}

/* ══════════════════════════════════════
   MESAS OCUPADAS
══════════════════════════════════════ */
function _renderMesasOcupadas() {
  const mesas   = dbGetMesas().filter(m => m.estado === 'ocupada');
  const lista   = document.getElementById('mesas-list');
  if (!lista) return;

  if (mesas.length === 0) {
    lista.innerHTML = `
      <div class="mesas-vacias">
        <i class="fa-solid fa-chair"></i>
        <p>No hay mesas ocupadas</p>
      </div>`;
    return;
  }

  lista.innerHTML = '';

  mesas.forEach(mesa => {
    const pedidos = dbGetPedidosPorMesa(mesa.id);
    const total   = _calcularTotalPedidos(pedidos);

    const item = document.createElement('div');
    item.className = 'mesa-item';
    item.id = `mesa-item-${mesa.id}`;
    item.onclick = () => seleccionarMesa(mesa.id);

    item.innerHTML = `
      <div class="mesa-num">${mesa.numero}</div>
      <div>
        <div class="mesa-info-nombre">Mesa ${mesa.numero}</div>
        <div class="mesa-info-zona">${mesa.zona}</div>
      </div>
      <span class="mesa-total-badge">${formatPrecio(total)}</span>
    `;

    lista.appendChild(item);
  });
}

/* ══════════════════════════════════════
   SELECCIONAR MESA
══════════════════════════════════════ */
function seleccionarMesa(mesaId) {
  _mesaSeleccionada = mesaId;

  /* Highlight activo */
  document.querySelectorAll('.mesa-item').forEach(el => el.classList.remove('active'));
  document.getElementById(`mesa-item-${mesaId}`)?.classList.add('active');

  const mesa    = dbGetMesa(mesaId);
  const pedidos = dbGetPedidosPorMesa(mesaId);

  if (!mesa || pedidos.length === 0) {
    _mostrarVacia();
    return;
  }

  /* Tomar el pedido más reciente no entregado */
  _pedidoActual = pedidos[pedidos.length - 1];

  _renderFactura(mesa, _pedidoActual);
}

function _mostrarVacia() {
  document.getElementById('factura-vacia').classList.remove('hidden');
  document.getElementById('factura-contenido').classList.add('hidden');
}

/* ══════════════════════════════════════
   RENDERIZAR FACTURA
══════════════════════════════════════ */
function _renderFactura(mesa, pedido) {
  document.getElementById('factura-vacia').classList.add('hidden');
  document.getElementById('factura-contenido').classList.remove('hidden');

  /* Número de factura */
  document.getElementById('factura-num').textContent = `#${String(pedido.id).padStart(4, '0')}`;

  /* Info mesa/mesero/hora */
  const mesero = dbGetUsuarioPorId(pedido.mesero_id);
  document.getElementById('info-mesa').textContent   = `Mesa ${mesa.numero} · ${mesa.zona}`;
  document.getElementById('info-mesero').textContent = mesero?.nombre || '—';
  document.getElementById('info-hora').textContent   = pedido.hora || '—';

  /* Items */
  const tbody = document.getElementById('factura-items');
  tbody.innerHTML = '';

  pedido.detalle.forEach(item => {
    const prod = dbGetProducto(item.producto_id);
    if (!prod) return;

    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${prod.nombre}</td>
      <td class="text-center">${item.cantidad}</td>
      <td class="text-right">${formatPrecio(item.precio_unitario)}</td>
      <td class="text-right">${formatPrecio(item.subtotal)}</td>
    `;
    tbody.appendChild(tr);
  });

  /* Totales */
  const subtotal = pedido.detalle.reduce((s, i) => s + i.subtotal, 0);
  const iva      = Math.round(subtotal * IVA_PORCENTAJE);
  const total    = subtotal + iva;

  document.getElementById('total-subtotal').textContent = formatPrecio(subtotal);
  document.getElementById('total-iva').textContent      = formatPrecio(iva);
  document.getElementById('total-final').textContent    = formatPrecio(total);

  /* Guardar total en sessionStorage para la página de pago */
  sessionStorage.setItem('factura-activa', JSON.stringify({
    mesaId:   mesa.id,
    mesaNum:  mesa.numero,
    mesaZona: mesa.zona,
    pedidoId: pedido.id,
    subtotal,
    iva,
    total,
    metodo:   _metodoPago,
    detalle:  pedido.detalle,
  }));
}

/* ══════════════════════════════════════
   MÉTODO DE PAGO
══════════════════════════════════════ */
function seleccionarMetodo(metodo, btn) {
  _metodoPago = metodo;

  document.querySelectorAll('.metodo-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');

  /* Actualizar sesión */
  const data = JSON.parse(sessionStorage.getItem('factura-activa') || '{}');
  data.metodo = metodo;
  sessionStorage.setItem('factura-activa', JSON.stringify(data));
}

/* ══════════════════════════════════════
   IR A PAGO
══════════════════════════════════════ */
function irAPago() {
  if (!_mesaSeleccionada || !_pedidoActual) {
    alert('Selecciona una mesa primero.');
    return;
  }
  window.location.href = 'pago.html';
}

/* ══════════════════════════════════════
   IMPRIMIR
══════════════════════════════════════ */
function imprimirFactura() {
  if (!_pedidoActual) return;
  window.print();
}

/* ══════════════════════════════════════
   HELPERS
══════════════════════════════════════ */
function _calcularTotalPedidos(pedidos) {
  return pedidos.reduce((total, p) => {
    const sub = p.detalle.reduce((s, i) => s + i.subtotal, 0);
    return total + sub + Math.round(sub * IVA_PORCENTAJE);
  }, 0);
}

function _setFecha() {
  const ahora = new Date();
  const opts  = { year: 'numeric', month: 'long', day: 'numeric' };
  const fecha = ahora.toLocaleDateString('es-CO', opts);
  const hora  = ahora.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' });
  const el    = document.getElementById('factura-fecha');
  if (el) el.textContent = `${fecha} · ${hora}`;
}

function cerrarModal() {
  document.getElementById('modal-exito')?.classList.add('hidden');
}