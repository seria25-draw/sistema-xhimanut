/* ============================================
   SISTEMA XHIMANUT — mesero.js
   ============================================ */

let mesaSeleccionada = null;
let carrito = [];
let categoriaActiva = "todas";
let paginaActual = 1;
const MESAS_POR_PAGINA = 6;

/* categoría */
const PRODUCTO_IMG = {
  1: "../../assets/img/productos/bandeja-paisa.jpg",
  2: "../../assets/img/productos/churrasco.jpg",
  3: "../../assets/img/productos/costilla-bbq.jpg",
  4: "../../assets/img/productos/pollo-asado.jpg",
  5: "../../assets/img/productos/cazuela-mariscos.jpg",
  6: "../../assets/img/productos/trucha.jpg",
  7: "../../assets/img/productos/camarones.jpg",
  8: "../../assets/img/productos/limonada-coco.jpg",
  9: "../../assets/img/productos/jugo-natural.jpg",
  10: "../../assets/img/productos/gaseosa.jpg",
  11: "../../assets/img/productos/agua-mineral.jpg",
  12: "../../assets/img/productos/cerveza.jpg",
  13: "../../assets/img/productos/tres-leches.jpg",
  14: "../../assets/img/productos/flan-caramelo.jpg",
  15: "../../assets/img/productos/brownie-helado.jpg",
  16: "../../assets/img/productos/patacones.jpg",
  17: "../../assets/img/productos/arepa-choclo.jpg",
};

/* Iconos de tab por categoría */
const CATEGORIA_ICON = {
  todas: "fa-solid fa-border-all",
  1: "fa-solid fa-drumstick-bite",
  2: "fa-solid fa-fish",
  3: "fa-solid fa-martini-glass",
  4: "fa-solid fa-cake-candles",
  5: "fa-solid fa-leaf",
};
const CATEGORIA_EMOJI = {
  1: "🥩",
  2: "🦞",
  3: "🥤",
  4: "🍮",
  5: "🫓",
};

/* ── Inicializar ── */
function initMesero() {
  const usuario = JSON.parse(sessionStorage.getItem("usuario"));
  if (!usuario) return;

  const hora = new Date().getHours();
  const saludo =
    hora < 12 ? "Buenos días" : hora < 18 ? "Buenas tardes" : "Buenas noches";
  document.getElementById("saludo").textContent =
    `${saludo}, ${usuario.nombre.split(" ")[0]} 👋`;
  document.getElementById("fecha-turno").textContent = getFechaTurno();

  renderMesas();
}

function getFechaTurno() {
  return new Date().toLocaleDateString("es-CO", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

/* ══════════════════════════════════════
   MESAS
══════════════════════════════════════ */
function renderMesas() {
  const todasMesas = dbGetMesas();
  const totalPaginas = Math.ceil(todasMesas.length / MESAS_POR_PAGINA);
  const inicio = (paginaActual - 1) * MESAS_POR_PAGINA;
  const mesas  = todasMesas.slice(inicio, inicio + MESAS_POR_PAGINA);

  const grid = document.getElementById('mesas-grid');
  grid.innerHTML = '';

  mesas.forEach(mesa => {
    const pedidos   = dbGetPedidosPorMesa(mesa.id);
    const infoExtra = mesa.estado === 'ocupada' && pedidos.length > 0
      ? `${pedidos[0].detalle.length} items · desde ${pedidos[0].hora}`
      : 'Disponible';

    const card = document.createElement('div');
    card.className = `mesa-card ${mesa.estado}`;
    card.innerHTML = `
      <div class="mesa-card-header">
        <h3>Mesa ${mesa.numero}</h3>
        <span class="badge badge-${mesa.estado === 'libre' ? 'libre' : 'ocupada'}">
          ${mesa.estado === 'libre' ? 'Libre' : 'Ocupada'}
        </span>
      </div>
      <p class="mesa-card-zona">
        <i class="fa-solid fa-location-dot"></i> ${mesa.zona}
        &nbsp;·&nbsp;
        <i class="fa-solid fa-user-group"></i> ${mesa.capacidad} personas
      </p>
      <p class="mesa-card-info">${infoExtra}</p>
      <button class="btn-mesa" onclick="${mesa.estado === 'libre' ? `seleccionarMesa(${mesa.id})` : `verPedido(${mesa.id})`}">
        ${mesa.estado === 'libre'
          ? '<i class="fa-solid fa-plus"></i> Tomar pedido'
          : '<i class="fa-solid fa-eye"></i> Ver pedido'
        }
      </button>
    `;
    grid.appendChild(card);
  });

  /* Renderizar paginación */
  renderPaginacion(totalPaginas);
}

function renderPaginacion(totalPaginas) {
  let paginacion = document.getElementById('paginacion-mesas');
  if (!paginacion) {
    paginacion = document.createElement('div');
    paginacion.id = 'paginacion-mesas';
    paginacion.className = 'paginacion';
    document.getElementById('mesas-grid').after(paginacion);
  }

  if (totalPaginas <= 1) {
    paginacion.innerHTML = '';
    return;
  }

  paginacion.innerHTML = '';

  /* Botón anterior */
  const btnAnterior = document.createElement('button');
  btnAnterior.className = `pag-btn${paginaActual === 1 ? ' disabled' : ''}`;
  btnAnterior.innerHTML = '<i class="fa-solid fa-chevron-left"></i>';
  btnAnterior.disabled = paginaActual === 1;
  btnAnterior.onclick = () => { paginaActual--; renderMesas(); };
  paginacion.appendChild(btnAnterior);

  /* Números de página */
  for (let i = 1; i <= totalPaginas; i++) {
    const btn = document.createElement('button');
    btn.className = `pag-btn${i === paginaActual ? ' active' : ''}`;
    btn.textContent = i;
    btn.onclick = () => { paginaActual = i; renderMesas(); };
    paginacion.appendChild(btn);
  }

  /* Botón siguiente */
  const btnSiguiente = document.createElement('button');
  btnSiguiente.className = `pag-btn${paginaActual === totalPaginas ? ' disabled' : ''}`;
  btnSiguiente.innerHTML = '<i class="fa-solid fa-chevron-right"></i>';
  btnSiguiente.disabled = paginaActual === totalPaginas;
  btnSiguiente.onclick = () => { paginaActual++; renderMesas(); };
  paginacion.appendChild(btnSiguiente);
}

function seleccionarMesa(mesaId) {
  mesaSeleccionada = dbGetMesa(mesaId);
  carrito = [];
  categoriaActiva = "todas";

  document.getElementById("pedido-mesa-titulo").textContent =
    `Mesa ${mesaSeleccionada.numero}`;
  document.getElementById("pedido-mesa-zona").textContent =
    `${mesaSeleccionada.zona} · ${mesaSeleccionada.capacidad} personas`;

  document.getElementById("seccion-mesas").classList.add("hidden");
  document.getElementById("seccion-pedido").classList.remove("hidden");

  renderCategorias();
  renderProductos();
  renderCarrito();
}

function volverAMesas() {
  mesaSeleccionada = null;
  carrito = [];
  categoriaActiva = "todas";
  paginaActual = 1;

  document.getElementById("seccion-pedido").classList.add("hidden");
  document.getElementById("seccion-mesas").classList.remove("hidden");
  renderMesas();
}

/* ══════════════════════════════════════
   CATEGORÍAS
══════════════════════════════════════ */
function renderCategorias() {
  const categorias = dbGetCategorias();
  const tabs = document.getElementById("categorias-tabs");
  tabs.innerHTML = "";

  /* Tab Todas */
  const tabTodas = document.createElement("button");
  tabTodas.className = `tab-categoria ${categoriaActiva === "todas" ? "active" : ""}`;
  tabTodas.innerHTML = `<i class="${CATEGORIA_ICON.todas}"></i> Todas`;
  tabTodas.onclick = () => {
    categoriaActiva = "todas";
    renderCategorias();
    renderProductos();
  };
  tabs.appendChild(tabTodas);

  categorias.forEach((cat) => {
    const tab = document.createElement("button");
    tab.className = `tab-categoria ${categoriaActiva === cat.id ? "active" : ""}`;
    tab.innerHTML = `<i class="${CATEGORIA_ICON[cat.id] || "fa-solid fa-tag"}"></i> ${cat.nombre}`;
    tab.onclick = () => {
      categoriaActiva = cat.id;
      renderCategorias();
      renderProductos();
    };
    tabs.appendChild(tab);
  });
}

/* ══════════════════════════════════════
   PRODUCTOS
══════════════════════════════════════ */
function renderProductos() {
  const busqueda = document.getElementById("buscador").value.toLowerCase();
  const todos = DB_PRODUCTOS; // incluye agotados

  let productos =
    categoriaActiva === "todas"
      ? todos
      : todos.filter((p) => p.categoria_id === categoriaActiva);

  if (busqueda) {
    productos = productos.filter((p) =>
      p.nombre.toLowerCase().includes(busqueda),
    );
  }

  const grid = document.getElementById("productos-grid");
  grid.innerHTML = "";

  if (productos.length === 0) {
    grid.innerHTML = `
      <div style="grid-column:1/-1;text-align:center;color:var(--color-text-muted);padding:40px 0;">
        <i class="fa-solid fa-magnifying-glass" style="font-size:28px;display:block;margin-bottom:8px;opacity:0.4"></i>
        No se encontraron productos
      </div>`;
    return;
  }

  productos.forEach((producto) => {
    const categoria = dbGetCategoria(producto.categoria_id);
    const emoji = CATEGORIA_EMOJI[producto.categoria_id] || "🍽️";
    const stockBajo = producto.stock > 0 && producto.stock <= 3;
    const agotado = !producto.disponible;

    const card = document.createElement("div");
    card.className = `producto-card${agotado ? " agotado" : ""}`;
    card.innerHTML = `
  <div class="producto-img">
    <img
      src="${PRODUCTO_IMG[producto.id]}"
      alt="${producto.nombre}"
      style="width:100%;height:100%;object-fit:cover;display:block;"
      onerror="this.style.display='none'"
    />
    <span class="area-tag">${categoria?.area === "cocina" ? "🔥 Cocina" : "🍹 Bar"}</span>
  </div>
  <div class="producto-body">
    <div class="producto-nombre">${producto.nombre}</div>
    <div class="producto-precio">${formatPrecio(producto.precio)}</div>
    <div class="producto-stock ${agotado ? "agotado-txt" : stockBajo ? "bajo" : ""}">
      ${agotado
        ? '<i class="fa-solid fa-ban"></i> Agotado'
        : stockBajo
          ? `<i class="fa-solid fa-triangle-exclamation"></i> Solo ${producto.stock}`
          : '<i class="fa-solid fa-check"></i> Disponible'
      }
    </div>
  </div>
  <button class="producto-btn-add" ${agotado ? "disabled" : ""} onclick="agregarAlCarrito(${producto.id})">
    <i class="fa-solid fa-plus"></i> Agregar
  </button>
`;
    grid.appendChild(card);
  });
}

function filtrarProductos() {
  renderProductos();
}

/* ══════════════════════════════════════
   CARRITO
══════════════════════════════════════ */
function agregarAlCarrito(productoId) {
  const existente = carrito.find((i) => i.producto_id === productoId);
  const cantidadActual = existente ? existente.cantidad : 0;

  if (!dbVerificarStock(productoId, cantidadActual + 1)) {
    alert("No hay suficiente stock disponible.");
    return;
  }

  if (existente) {
    existente.cantidad++;
    existente.subtotal = existente.cantidad * existente.precio_unitario;
  } else {
    const p = dbGetProducto(productoId);
    carrito.push({
      producto_id: p.id,
      nombre: p.nombre,
      precio_unitario: p.precio,
      cantidad: 1,
      subtotal: p.precio,
      categoria_id: p.categoria_id,
    });
  }
  renderCarrito();
}

function cambiarCantidad(productoId, delta) {
  const item = carrito.find((i) => i.producto_id === productoId);
  if (!item) return;

  const nueva = item.cantidad + delta;
  if (nueva <= 0) {
    eliminarDelCarrito(productoId);
    return;
  }
  if (!dbVerificarStock(productoId, nueva)) {
    alert("No hay suficiente stock.");
    return;
  }

  item.cantidad = nueva;
  item.subtotal = nueva * item.precio_unitario;
  renderCarrito();
}

function eliminarDelCarrito(productoId) {
  carrito = carrito.filter((i) => i.producto_id !== productoId);
  renderCarrito();
}

function renderCarrito() {
  const container = document.getElementById("carrito-items");
  const badge = document.getElementById("carrito-count-badge");
  const totalEl = document.getElementById("carrito-total");
  const btnEnviar = document.getElementById("btn-enviar");

  const totalItems = carrito.reduce((a, i) => a + i.cantidad, 0);
  const totalPrecio = carrito.reduce((a, i) => a + i.subtotal, 0);

  badge.textContent = `${totalItems} item${totalItems !== 1 ? "s" : ""}`;
  totalEl.textContent = formatPrecio(totalPrecio);
  btnEnviar.disabled = carrito.length === 0;

  container.innerHTML = "";

  if (carrito.length === 0) {
    container.innerHTML = `
      <div class="carrito-empty">
        <i class="fa-solid fa-cart-shopping"></i>
        <p>Agrega productos al pedido</p>
      </div>`;
    return;
  }

  carrito.forEach((item) => {
    const emoji = CATEGORIA_EMOJI[item.categoria_id] || "🍽️";
    const div = document.createElement("div");
    div.className = "carrito-item";
    div.innerHTML = `
      <div class="carrito-item-emoji">${emoji}</div>
      <div class="carrito-item-info">
        <div class="carrito-item-nombre">${item.nombre}</div>
        <div class="carrito-item-precio">${formatPrecio(item.subtotal)}</div>
      </div>
      <div class="cantidad-control">
        <button class="cantidad-btn" onclick="cambiarCantidad(${item.producto_id}, -1)">−</button>
        <span class="cantidad-valor">${item.cantidad}</span>
        <button class="cantidad-btn" onclick="cambiarCantidad(${item.producto_id}, 1)">+</button>
      </div>
      <button class="carrito-item-eliminar" onclick="eliminarDelCarrito(${item.producto_id})">
        <i class="fa-solid fa-trash"></i>
      </button>
    `;
    container.appendChild(div);
  });
}

/* ══════════════════════════════════════
   ENVIAR PEDIDO
══════════════════════════════════════ */
function enviarPedido() {
  if (carrito.length === 0 || !mesaSeleccionada) return;

  const usuario = JSON.parse(sessionStorage.getItem("usuario"));
  const ahora = new Date();

  const nuevo = dbCrearPedido({
    mesa_id: mesaSeleccionada.id,
    mesero_id: usuario.id,
    fecha: ahora.toISOString().split("T")[0],
    hora: ahora.toTimeString().slice(0, 5),
    observaciones: document.getElementById("observaciones").value,
    detalle: carrito.map((i) => ({
      producto_id: i.producto_id,
      cantidad: i.cantidad,
      precio_unitario: i.precio_unitario,
      subtotal: i.subtotal,
    })),
  });

  const areas = [
    ...new Set(
      carrito.map((item) => {
        const cat = dbGetCategoria(
          dbGetProducto(item.producto_id).categoria_id,
        );
        return cat?.area === "cocina" ? "Cocina" : "Bar";
      }),
    ),
  ].join(" y ");

  document.getElementById("modal-mensaje").textContent =
    `Pedido #${nuevo.id} enviado a ${areas}. Mesa ${mesaSeleccionada.numero}.`;
  document.getElementById("modal-exito").classList.remove("hidden");
}

function cerrarModal() {
  document.getElementById("modal-exito").classList.add("hidden");
  volverAMesas();
}

function verPedido(mesaId) {
  sessionStorage.setItem('mesa-cuenta', mesaId);
  window.location.href = 'cuenta.html';
}