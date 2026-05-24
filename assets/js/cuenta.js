/* ============================================
   SISTEMA XHIMANUT — cuenta.js
   Ver pedido y solicitar cuenta (HU-03)
   ============================================ */

const PRODUCTO_IMG_CUENTA = {
  1:  '../../assets/img/productos/bandeja-paisa.jpg',
  2:  '../../assets/img/productos/churrasco.jpg',
  3:  '../../assets/img/productos/costilla-bbq.jpg',
  4:  '../../assets/img/productos/pollo-asado.jpg',
  5:  '../../assets/img/productos/cazuela-mariscos.jpg',
  6:  '../../assets/img/productos/trucha.jpg',
  7:  '../../assets/img/productos/camarones.jpg',
  8:  '../../assets/img/productos/limonada-coco.jpg',
  9:  '../../assets/img/productos/jugo-natural.jpg',
  10: '../../assets/img/productos/gaseosa.jpg',
  11: '../../assets/img/productos/agua-mineral.jpg',
  12: '../../assets/img/productos/cerveza.jpg',
  13: '../../assets/img/productos/tres-leches.jpg',
  14: '../../assets/img/productos/flan-caramelo.jpg',
  15: '../../assets/img/productos/brownie-helado.jpg',
  16: '../../assets/img/productos/patacones.jpg',
  17: '../../assets/img/productos/arepa-choclo.jpg',
};

let mesaActivaCuenta   = null;
let pedidoActivo       = null;
let carritoAdicional   = [];
let categoriaActivaMini = 'todas';

/* ── Inicializar ── */
function initCuenta() {
  renderMesasOcupadas();
    // Si viene desde "Ver pedido", cargar la mesa automáticamente
  const mesaId = sessionStorage.getItem('mesa-cuenta');
  if (mesaId) {
    sessionStorage.removeItem('mesa-cuenta');
    seleccionarMesaCuenta(parseInt(mesaId));
  }
}

/* ══════════════════════════════════════
   SELECTOR DE MESAS OCUPADAS
══════════════════════════════════════ */
function renderMesasOcupadas() {
  const mesas   = dbGetMesas().filter(m => m.estado === 'ocupada');
  const grid    = document.getElementById('mesas-ocupadas-grid');
  grid.innerHTML = '';

  if (mesas.length === 0) {
    grid.innerHTML = `<p class="sin-mesas-ocupadas">
      <i class="fa-solid fa-circle-info"></i>
      No hay mesas ocupadas en este momento
    </p>`;
    return;
  }

  mesas.forEach(mesa => {
    const pedidos = dbGetPedidosPorMesa(mesa.id);
    const chip    = document.createElement('button');
    chip.className = `mesa-chip${mesaActivaCuenta?.id === mesa.id ? ' active' : ''}`;
    chip.innerHTML = `
      <i class="fa-solid fa-chair"></i>
      Mesa ${mesa.numero}
      <span style="font-size:10px;opacity:0.7">${pedidos.length > 0 ? pedidos[0].detalle.length + ' items' : ''}</span>
    `;
    chip.onclick = () => seleccionarMesaCuenta(mesa.id);
    grid.appendChild(chip);
  });
}

/* ── Seleccionar mesa ── */
function seleccionarMesaCuenta(mesaId) {
  mesaActivaCuenta = dbGetMesa(mesaId);
  const pedidos    = dbGetPedidosPorMesa(mesaId).filter(p => p.estado !== 'entregado');

  if (pedidos.length === 0) {
    alert('Esta mesa no tiene pedidos activos.');
    return;
  }

  pedidoActivo   = pedidos[0];
  carritoAdicional = [];

  /* Actualizar chips */
  renderMesasOcupadas();

  /* Mostrar layout */
  document.getElementById('cuenta-layout').classList.remove('hidden');

  /* Rellenar datos */
  renderDetallePedido();
  renderResumen();
}

/* ══════════════════════════════════════
   DETALLE DEL PEDIDO
══════════════════════════════════════ */
function renderDetallePedido() {
  const mesa = mesaActivaCuenta;

  document.getElementById('cuenta-mesa-titulo').textContent = `Mesa ${mesa.numero}`;
  document.getElementById('cuenta-mesa-info').textContent   = `${mesa.zona} · ${mesa.capacidad} personas`;
  document.getElementById('cuenta-pedido-hora').innerHTML   = `<i class="fa-solid fa-clock"></i> ${pedidoActivo.hora}`;

  const container = document.getElementById('cuenta-productos');
  container.innerHTML = '';

  pedidoActivo.detalle.forEach(item => {
    const producto = dbGetProducto(item.producto_id);
    const img      = PRODUCTO_IMG_CUENTA[item.producto_id] || '';

    const div = document.createElement('div');
    div.className = 'cuenta-producto-item';
    div.innerHTML = `
      <div class="cuenta-prod-img">
        <img src="${img}" alt="${producto?.nombre}" onerror="this.style.display='none'"/>
      </div>
      <div class="cuenta-prod-info">
        <div class="cuenta-prod-nombre">${producto?.nombre || 'Producto'}</div>
        <div class="cuenta-prod-meta">
          <span><i class="fa-solid fa-xmark"></i> ${item.cantidad}</span>
          <span>${formatPrecio(item.precio_unitario)} c/u</span>
        </div>
      </div>
      <div>
        <div class="cuenta-prod-precio">${formatPrecio(item.subtotal)}</div>
        <div class="cuenta-prod-unitario">${item.cantidad} × ${formatPrecio(item.precio_unitario)}</div>
      </div>
    `;
    container.appendChild(div);
  });
}

/* ══════════════════════════════════════
   RESUMEN
══════════════════════════════════════ */
function renderResumen() {
  const subtotal = pedidoActivo.detalle.reduce((a, i) => a + i.subtotal, 0);
  const total    = subtotal;
  const count    = pedidoActivo.detalle.reduce((a, i) => a + i.cantidad, 0);

  document.getElementById('resumen-subtotal').textContent    = formatPrecio(subtotal);
  document.getElementById('resumen-total').textContent       = formatPrecio(total);
  document.getElementById('resumen-pedido-id').textContent   = `#${pedidoActivo.id}`;
  document.getElementById('resumen-hora').textContent        = `Desde las ${pedidoActivo.hora}`;
  document.getElementById('resumen-items-count').textContent = `${count} producto${count !== 1 ? 's' : ''}`;

  /* Items del resumen */
  const resumenItems = document.getElementById('resumen-items');
  resumenItems.innerHTML = '';

  pedidoActivo.detalle.forEach(item => {
    const producto = dbGetProducto(item.producto_id);
    const div      = document.createElement('div');
    div.className  = 'resumen-item';
    div.innerHTML  = `
      <span class="resumen-item-nombre">${producto?.nombre || 'Producto'}</span>
      <span class="resumen-item-cant">×${item.cantidad}</span>
      <span class="resumen-item-precio">${formatPrecio(item.subtotal)}</span>
    `;
    resumenItems.appendChild(div);
  });
}

/* ══════════════════════════════════════
   AGREGAR MÁS PRODUCTOS
══════════════════════════════════════ */
function toggleAgregarMas() {
  const panel = document.getElementById('agregar-mas-panel');
  panel.classList.toggle('hidden');

  if (!panel.classList.contains('hidden')) {
    renderTabsMini();
    renderProductosMini();
  }
}

function renderTabsMini() {
  const categorias = dbGetCategorias();
  const tabs       = document.getElementById('categorias-tabs-mini');
  tabs.innerHTML   = '';

  const tabTodas = document.createElement('button');
  tabTodas.className = `tab-mini ${categoriaActivaMini === 'todas' ? 'active' : ''}`;
  tabTodas.textContent = 'Todas';
  tabTodas.onclick = () => { categoriaActivaMini = 'todas'; renderTabsMini(); renderProductosMini(); };
  tabs.appendChild(tabTodas);

  categorias.forEach(cat => {
    const tab = document.createElement('button');
    tab.className = `tab-mini ${categoriaActivaMini === cat.id ? 'active' : ''}`;
    tab.textContent = cat.nombre;
    tab.onclick = () => { categoriaActivaMini = cat.id; renderTabsMini(); renderProductosMini(); };
    tabs.appendChild(tab);
  });
}

function renderProductosMini() {
  let productos = DB_PRODUCTOS.filter(p => p.disponible);
  if (categoriaActivaMini !== 'todas') {
    productos = productos.filter(p => p.categoria_id === categoriaActivaMini);
  }

  const grid   = document.getElementById('productos-mini-grid');
  grid.innerHTML = '';

  productos.forEach(producto => {
    const img  = PRODUCTO_IMG_CUENTA[producto.id] || '';
    const card = document.createElement('div');
    card.className = `producto-mini-card${!producto.disponible ? ' agotado' : ''}`;
    card.innerHTML = `
      <div class="producto-mini-img">
        <img src="${img}" alt="${producto.nombre}" onerror="this.style.display='none'"/>
      </div>
      <div class="producto-mini-body">
        <div class="producto-mini-nombre">${producto.nombre}</div>
        <div class="producto-mini-precio">${formatPrecio(producto.precio)}</div>
      </div>
    `;
    if (producto.disponible) {
      card.onclick = () => agregarAdicional(producto.id);
    }
    grid.appendChild(card);
  });
}

function agregarAdicional(productoId) {
  const existente = carritoAdicional.find(i => i.producto_id === productoId);

  if (!dbVerificarStock(productoId, (existente?.cantidad || 0) + 1)) {
    alert('No hay suficiente stock.'); return;
  }

  if (existente) {
    existente.cantidad++;
    existente.subtotal = existente.cantidad * existente.precio_unitario;
  } else {
    const p = dbGetProducto(productoId);
    carritoAdicional.push({
      producto_id:     p.id,
      nombre:          p.nombre,
      precio_unitario: p.precio,
      cantidad:        1,
      subtotal:        p.precio,
    });
  }

  renderCarritoAdicional();
}

function renderCarritoAdicional() {
  const container = document.getElementById('carrito-adicional');
  const items     = document.getElementById('carrito-adicional-items');

  if (carritoAdicional.length === 0) {
    container.classList.add('hidden');
    return;
  }

  container.classList.remove('hidden');
  items.innerHTML = '';

  carritoAdicional.forEach(item => {
    const div = document.createElement('div');
    div.className = 'carrito-adicional-item';
    div.innerHTML = `
      <span class="carrito-adicional-item-nombre">${item.nombre} ×${item.cantidad}</span>
      <span class="carrito-adicional-item-precio">${formatPrecio(item.subtotal)}</span>
    `;
    items.appendChild(div);
  });
}

function confirmarAdicional() {
  if (carritoAdicional.length === 0) return;

  /* Agregar items al pedido actual */
  carritoAdicional.forEach(item => {
    const existente = pedidoActivo.detalle.find(d => d.producto_id === item.producto_id);
    if (existente) {
      existente.cantidad += item.cantidad;
      existente.subtotal  = existente.cantidad * existente.precio_unitario;
    } else {
      pedidoActivo.detalle.push({ ...item });
    }
    dbDescontarStock(item.producto_id, item.cantidad);
  });

  carritoAdicional = [];
  toggleAgregarMas();
  renderDetallePedido();
  renderResumen();
}

/* ══════════════════════════════════════
   SOLICITAR CUENTA
══════════════════════════════════════ */
function solicitarCuenta() {
  if (!pedidoActivo) return;

  const total = pedidoActivo.detalle.reduce((a, i) => a + i.subtotal, 0);
  const mesa  = mesaActivaCuenta;

  /* Marcar pedido como "por cobrar" en db */
  dbActualizarEstadoPedido(pedidoActivo.id, 'por_cobrar');

  /* Mostrar modal */
  document.getElementById('modal-cuenta-msg').textContent =
    `Mesa ${mesa.numero} — Pedido #${pedidoActivo.id} enviado a caja`;
  document.getElementById('modal-cuenta-total').textContent = formatPrecio(total);
  document.getElementById('modal-cuenta').classList.remove('hidden');
}

function cerrarModalCuenta() {
  document.getElementById('modal-cuenta').classList.add('hidden');
  /* Resetear */
  mesaActivaCuenta = null;
  pedidoActivo     = null;
  carritoAdicional = [];
  document.getElementById('cuenta-layout').classList.add('hidden');
  renderMesasOcupadas();
}