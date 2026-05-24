/* ============================================
   SISTEMA XHIMANUT — estado.js
   Estado del pedido en tiempo real (HU-02)
   ============================================ */

const PRODUCTO_IMG_ESTADO = {
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
const ESTADO_CONFIG = {
  pendiente: {
    label: "Pendiente",
    icon: "fa-solid fa-clock",
    clase: "pendiente",
  },
  en_preparacion: {
    label: "En preparación",
    icon: "fa-solid fa-fire-burner",
    clase: "en_preparacion",
  },
  listo: { label: "¡Listo!", icon: "fa-solid fa-circle-check", clase: "listo" },
};

let estadosProductos = {};
let pedidosNotificados = new Set();
let intervalActualizacion = null;

/* ── Inicializar ── */
function initEstado() {
  actualizarHora();
  renderPedidos();
  intervalActualizacion = setInterval(() => {
    simularAvanceEstados();
    renderPedidos();
    actualizarHora();
  }, 8000);
}

function actualizarEstados() {
  const btn = document.querySelector(".btn-refresh");
  btn.classList.add("girando");
  setTimeout(() => {
    btn.classList.remove("girando");
    renderPedidos();
    actualizarHora();
  }, 600);
}

function actualizarHora() {
  const el = document.getElementById("hora-actualizacion");
  if (el) el.textContent = new Date().toLocaleTimeString("es-CO");
}

/* ══════════════════════════════════════
   RENDER
══════════════════════════════════════ */
function renderPedidos() {
  const usuario = JSON.parse(sessionStorage.getItem("usuario"));
  const todos = dbGetPedidos();
  const pedidos = todos.filter(
    (p) => p.mesero_id === usuario.id && p.estado !== "entregado",
  );

  const grid = document.getElementById("pedidos-grid");
  const sinPed = document.getElementById("sin-pedidos");

  if (pedidos.length === 0) {
    grid.innerHTML = "";
    sinPed.classList.remove("hidden");
    return;
  }

  sinPed.classList.add("hidden");
  grid.innerHTML = "";

  pedidos.forEach((pedido) => {
    if (!estadosProductos[pedido.id]) {
      estadosProductos[pedido.id] = {};
      pedido.detalle.forEach((item) => {
        estadosProductos[pedido.id][item.producto_id] = pedido.estado;
      });
    }

    const estadoGlobal = calcularEstadoGlobal(pedido.id, pedido.detalle);
    const mesa = dbGetMesa(pedido.mesa_id);
    const config = ESTADO_CONFIG[estadoGlobal];

    /* Actualizar en DB y notificar si está listo */
    if (estadoGlobal === "listo") {
      dbActualizarEstadoPedido(pedido.id, "listo");
      if (!pedidosNotificados.has(pedido.id)) {
        pedidosNotificados.add(pedido.id);
        /* El layout.js detectará el cambio en la próxima verificación */
      }
    } else {
      dbActualizarEstadoPedido(pedido.id, estadoGlobal);
    }

    const card = document.createElement("div");
    card.className = `pedido-card estado-${estadoGlobal}`;
    card.innerHTML = `
      <div class="pedido-card-header">
        <div class="pedido-card-mesa">
          <h3><i class="fa-solid fa-chair" style="color:var(--color-primary);margin-right:6px"></i>Mesa ${mesa?.numero || pedido.mesa_id}</h3>
        </div>
        <div style="display:flex;align-items:center;gap:var(--space-md)">
          <span class="pedido-card-meta">
            <i class="fa-solid fa-clock"></i> ${pedido.hora}
            &nbsp;·&nbsp;
            <i class="fa-solid fa-hashtag"></i>${pedido.id}
          </span>
          <div class="estado-pill ${config.clase}">
            <span class="estado-dot"></span>
            ${config.label}
          </div>
        </div>
      </div>

      <div class="progreso-bar-wrap">
        <div class="progreso-steps">
          ${renderProgreso(estadoGlobal)}
        </div>
      </div>

      <div class="pedido-productos">
        ${renderProductosPedido(pedido)}
      </div>

      <div class="pedido-card-footer">
        <div class="pedido-card-footer-info">
          <i class="fa-solid fa-bowl-food"></i>
          ${pedido.detalle.length} producto${pedido.detalle.length !== 1 ? "s" : ""}
          &nbsp;·&nbsp;
          <i class="fa-solid fa-location-dot"></i>
          ${mesa?.zona || "—"}
        </div>
        <button
          class="btn-entregar"
          ${estadoGlobal !== "listo" ? "disabled" : ""}
          onclick="marcarEntregado(${pedido.id})"
        >
          <i class="fa-solid fa-check-double"></i>
          ${estadoGlobal === "listo" ? "Marcar entregado" : "En preparación..."}
        </button>
      </div>
    `;
    grid.appendChild(card);
  });
}

function renderProgreso(estadoGlobal) {
  const steps = [
    { label: "Recibido", icon: "fa-solid fa-check" },
    { label: "Preparando", icon: "fa-solid fa-fire-burner" },
    { label: "Listo", icon: "fa-solid fa-circle-check" },
  ];
  const orden = ["pendiente", "en_preparacion", "listo"];
  const idx = orden.indexOf(estadoGlobal);

  return steps
    .map((step, i) => {
      const completado = i < idx;
      const activo = i === idx;
      const clase = completado ? "completado" : activo ? "activo" : "";
      const linea =
        i < steps.length - 1
          ? `<div class="progreso-linea ${completado ? "activa" : ""}"></div>`
          : "";
      return `
      <div class="progreso-step ${clase}">
        <div class="progreso-step-circle">
          <i class="${completado ? "fa-solid fa-check" : step.icon}"></i>
        </div>
        <span class="progreso-step-label">${step.label}</span>
      </div>${linea}
    `;
    })
    .join("");
}

function renderProductosPedido(pedido) {
  const configProd = {
    pendiente: {
      label: "Pendiente",
      clase: "pendiente",
      icon: "fa-solid fa-clock",
    },
    en_preparacion: {
      label: "Preparando",
      clase: "preparacion",
      icon: "fa-solid fa-fire-burner",
    },
    listo: { label: "Listo", clase: "listo", icon: "fa-solid fa-circle-check" },
  };

  return pedido.detalle
    .map((item) => {
      const producto = dbGetProducto(item.producto_id);
      const estadoProd =
        estadosProductos[pedido.id]?.[item.producto_id] || "pendiente";
      const img = PRODUCTO_IMG_ESTADO[item.producto_id] || "";
      const cfg = configProd[estadoProd];

      return `
      <div class="pedido-producto-item ${cfg.clase}">
        <div class="prod-emoji">
  <img src="${img}" alt="" style="width:100%;height:100%;object-fit:cover;border-radius:6px;" onerror="this.style.display='none'"/>
</div>
        <div class="prod-info">
          <div class="prod-nombre">${producto?.nombre || "Producto"}</div>
          <div class="prod-cantidad">x${item.cantidad} · ${formatPrecio(item.subtotal)}</div>
        </div>
        <div class="prod-estado ${cfg.clase}">
          <i class="${cfg.icon}"></i> ${cfg.label}
        </div>
      </div>
    `;
    })
    .join("");
}

/* ══════════════════════════════════════
   SIMULACIÓN
══════════════════════════════════════ */
function simularAvanceEstados() {
  const orden = ["pendiente", "en_preparacion", "listo"];
  Object.keys(estadosProductos).forEach((pedidoId) => {
    Object.keys(estadosProductos[pedidoId]).forEach((productoId) => {
      const actual = estadosProductos[pedidoId][productoId];
      const idx = orden.indexOf(actual);
      if (idx < orden.length - 1 && Math.random() < 0.45) {
        estadosProductos[pedidoId][productoId] = orden[idx + 1];
      }
    });
  });
}

function calcularEstadoGlobal(pedidoId, detalle) {
  const estados = detalle.map(
    (item) => estadosProductos[pedidoId]?.[item.producto_id] || "pendiente",
  );
  if (estados.every((e) => e === "listo")) return "listo";
  if (estados.some((e) => e === "en_preparacion" || e === "listo"))
    return "en_preparacion";
  return "pendiente";
}

function marcarEntregado(pedidoId) {
  dbActualizarEstadoPedido(pedidoId, "entregado");
  delete estadosProductos[pedidoId];
  pedidosNotificados.delete(pedidoId);
  renderPedidos();
  actualizarHora();
}
