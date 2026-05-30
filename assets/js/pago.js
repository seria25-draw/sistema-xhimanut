/* ============================================
   SISTEMA XHIMANUT — assets/js/pago.js
   Registro de pago y cálculo de cambio
   ============================================ */

/* Billetes colombianos más comunes */
const BILLETES = [5000, 10000, 20000, 50000, 100000, 200000];

let _factura   = null; // datos de sessionStorage
let _recibido  = 0;

function initPago() {
  /* Leer factura activa */
  const raw = sessionStorage.getItem('factura-activa');
  if (!raw) {
    /* Sin datos → volver a factura */
    window.location.href = 'factura.html';
    return;
  }

  _factura = JSON.parse(raw);

  _renderResumen();
  _renderDetalle();
  _renderPanelCobro();
  _renderBilletes();
}

/* ══════════════════════════════════════
   RESUMEN IZQUIERDO
══════════════════════════════════════ */
function _renderResumen() {
  const metodosLabel = {
    efectivo:      'Efectivo',
    tarjeta:       'Tarjeta',
    transferencia: 'Transferencia',
  };

  document.getElementById('pago-subtitulo').textContent =
    `Mesa ${_factura.mesaNum} · ${_factura.mesaZona}`;

  document.getElementById('res-mesa').textContent    = `Mesa ${_factura.mesaNum} · ${_factura.mesaZona}`;
  document.getElementById('res-metodo').textContent  = metodosLabel[_factura.metodo] || _factura.metodo;
  document.getElementById('res-subtotal').textContent = formatPrecio(_factura.subtotal);
  document.getElementById('res-iva').textContent      = formatPrecio(_factura.iva);
  document.getElementById('res-total').textContent    = formatPrecio(_factura.total);
}

/* ══════════════════════════════════════
   DETALLE PRODUCTOS (colapsable)
══════════════════════════════════════ */
function _renderDetalle() {
  const wrap = document.getElementById('detalle-productos');
  if (!wrap || !_factura.detalle) return;

  wrap.innerHTML = '';

  _factura.detalle.forEach(item => {
    const prod = dbGetProducto(item.producto_id);
    if (!prod) return;

    const div = document.createElement('div');
    div.className = 'detalle-item';
    div.innerHTML = `
      <span class="detalle-item-nombre">${prod.nombre}</span>
      <span class="detalle-item-cant">x${item.cantidad}</span>
      <span class="detalle-item-precio">${formatPrecio(item.subtotal)}</span>
    `;
    wrap.appendChild(div);
  });
}

function toggleDetalle() {
  const wrap    = document.getElementById('detalle-productos');
  const toggle  = document.querySelector('.detalle-toggle');
  const chevron = document.getElementById('detalle-chevron');
  if (!wrap) return;

  wrap.classList.toggle('hidden');
  toggle?.classList.toggle('open');
}

/* ══════════════════════════════════════
   PANEL COBRO (efectivo vs digital)
══════════════════════════════════════ */
function _renderPanelCobro() {
  const esEfectivo = _factura.metodo === 'efectivo';

  document.getElementById('cobro-efectivo').classList.toggle('hidden', !esEfectivo);
  document.getElementById('cobro-digital').classList.toggle('hidden', esEfectivo);

  const totalFmt = formatPrecio(_factura.total);
  document.getElementById('cobro-total-display').textContent  = totalFmt;
  document.getElementById('cobro-total-digital').textContent  = totalFmt;

  /* Cambio inicial */
  if (esEfectivo) {
    _actualizarCambioUI(0);
  } else {
    /* Digital: habilitar botón directamente */
    document.getElementById('btn-registrar').disabled = false;
  }
}

/* ══════════════════════════════════════
   BILLETES RÁPIDOS
══════════════════════════════════════ */
function _renderBilletes() {
  const grid = document.getElementById('billetes-grid');
  if (!grid) return;

  /* Incluir billetes >= total y los anteriores */
  const billetesAMostrar = BILLETES.filter(b => {
    /* Mostrar siempre los 4 más cercanos hacia arriba del total */
    return true;
  });

  grid.innerHTML = '';

  billetesAMostrar.forEach(monto => {
    const btn = document.createElement('button');
    btn.className = 'billete-btn';
    btn.textContent = _formatBillete(monto);
    btn.onclick = () => usarBillete(monto, btn);
    grid.appendChild(btn);
  });
}

function _formatBillete(monto) {
  if (monto >= 1000) return `$${monto / 1000}K`;
  return `$${monto}`;
}

function usarBillete(monto, btn) {
  /* Deseleccionar otros */
  document.querySelectorAll('.billete-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');

  /* Poner en input */
  const input = document.getElementById('input-recibido');
  if (input) {
    input.value = monto;
    _recibido = monto;
    _actualizarCambioUI(monto);
  }
}

/* ══════════════════════════════════════
   CALCULAR CAMBIO
══════════════════════════════════════ */
function calcularCambio() {
  const input = document.getElementById('input-recibido');
  _recibido = parseFloat(input?.value) || 0;

  /* Deseleccionar billete si modificó manualmente */
  document.querySelectorAll('.billete-btn').forEach(b => b.classList.remove('active'));

  _actualizarCambioUI(_recibido);
}

function _actualizarCambioUI(recibido) {
  const total  = _factura.total;
  const cambio = recibido - total;

  /* Actualizar valores */
  document.getElementById('cambio-recibido').textContent = formatPrecio(recibido);
  document.getElementById('cambio-total').textContent    = formatPrecio(total);

  const resultadoRow   = document.getElementById('cambio-resultado-row');
  const resultadoLabel = document.getElementById('cambio-resultado-label');
  const resultadoVal   = document.getElementById('cambio-resultado-val');
  const alertaEl       = document.getElementById('alerta-insuficiente');
  const faltaEl        = document.getElementById('falta-valor');
  const btnRegistrar   = document.getElementById('btn-registrar');

  if (recibido === 0) {
    /* Sin input aún */
    resultadoVal.textContent = '$0';
    resultadoRow.classList.remove('insuficiente');
    alertaEl?.classList.add('hidden');
    btnRegistrar.disabled = true;

  } else if (cambio < 0) {
    /* Pago insuficiente */
    resultadoLabel.textContent = 'Falta por pagar';
    resultadoVal.textContent   = formatPrecio(Math.abs(cambio));
    resultadoRow.classList.add('insuficiente');
    alertaEl?.classList.remove('hidden');
    if (faltaEl) faltaEl.textContent = formatPrecio(Math.abs(cambio));
    btnRegistrar.disabled = true;

  } else {
    /* Pago suficiente */
    resultadoLabel.textContent = 'Cambio a devolver';
    resultadoVal.textContent   = formatPrecio(cambio);
    resultadoRow.classList.remove('insuficiente');
    alertaEl?.classList.add('hidden');
    btnRegistrar.disabled = false;
  }
}

/* ══════════════════════════════════════
   REGISTRAR PAGO
══════════════════════════════════════ */
function registrarPago() {
  const esEfectivo = _factura.metodo === 'efectivo';
  const cambio     = esEfectivo ? (_recibido - _factura.total) : 0;

  /* Marcar pedido como entregado en DB */
  dbActualizarEstadoPedido(_factura.pedidoId, 'entregado');

  /* Liberar mesa */
  dbActualizarEstadoMesa(_factura.mesaId, 'libre');

  /* Limpiar sesión */
  sessionStorage.removeItem('factura-activa');

  /* Modal éxito */
  const modal    = document.getElementById('modal-pago-ok');
  const msgEl    = document.getElementById('modal-pago-msg');
  const cambioWrap = document.getElementById('modal-cambio-wrap');
  const cambioVal  = document.getElementById('modal-cambio-val');

  if (msgEl) msgEl.textContent = `Mesa ${_factura.mesaNum} · ${_factura.metodo === 'efectivo' ? 'Efectivo' : _factura.metodo === 'tarjeta' ? 'Tarjeta' : 'Transferencia'}`;

  if (esEfectivo && cambio > 0) {
    cambioWrap?.classList.remove('hidden');
    if (cambioVal) cambioVal.textContent = formatPrecio(cambio);
  } else {
    cambioWrap?.classList.add('hidden');
  }

  modal?.classList.remove('hidden');
}

/* ══════════════════════════════════════
   FINALIZAR — ir a factura limpia
══════════════════════════════════════ */
function finalizarPago() {
  document.getElementById('modal-pago-ok')?.classList.add('hidden');
  window.location.href = 'factura.html';
}