/* ============================================
   SISTEMA XHIMANUT — caja.js
   Módulo de cierre de caja
   ============================================ */

function initCierreCaja() {
  // Fecha y turno
  const fechaEl = document.getElementById("cierre-fecha");
  if (fechaEl) {
    const ahora = new Date();
    const fecha = ahora.toLocaleDateString("es-CO", {
      weekday: "long",
      day: "numeric",
      month: "long",
    });
    const hora = ahora.getHours();
    const turno = hora < 16 ? "Turno: 08:00 – 16:00" : "Turno: 16:00 – 23:00";
    fechaEl.textContent =
      fecha.charAt(0).toUpperCase() + fecha.slice(1) + " · " + turno;
  }

  // Calcular datos desde pedidos
  const pedidos = dbGetPedidos();
  const totalVentas = pedidos.reduce(
    (s, p) => s + p.detalle.reduce((ss, d) => ss + d.subtotal, 0),
    0,
  );
  const transacciones = pedidos.length;
  const efectivo = Math.round(totalVentas * 0.67);
  const nequi = totalVentas - efectivo;
  const propinas = Math.round(totalVentas * 0.1);
  const txEfectivo = Math.round(transacciones * 0.63);
  const txNequi = transacciones - txEfectivo;

  // Guardar en sessionStorage para la pantalla de confirmación
  sessionStorage.setItem(
    "cierre-datos",
    JSON.stringify({
      totalVentas,
      transacciones,
      efectivo,
      nequi,
      propinas,
    }),
  );

  // Poblar stats
  const el = (id) => document.getElementById(id);
  if (el("stat-total-ventas"))
    el("stat-total-ventas").textContent = formatPrecio(totalVentas);
  if (el("stat-transacciones"))
    el("stat-transacciones").textContent = transacciones;
  if (el("stat-efectivo"))
    el("stat-efectivo").textContent = formatPrecio(efectivo);
  if (el("stat-nequi")) el("stat-nequi").textContent = formatPrecio(nequi);
  if (el("stat-propinas"))
    el("stat-propinas").textContent = formatPrecio(propinas);

  // Desglose
  if (el("desglose-efectivo"))
    el("desglose-efectivo").textContent = formatPrecio(efectivo);
  if (el("desglose-efectivo-tx"))
    el("desglose-efectivo-tx").textContent = txEfectivo + " transacciones";
  if (el("desglose-nequi"))
    el("desglose-nequi").textContent = formatPrecio(nequi);
  if (el("desglose-nequi-tx"))
    el("desglose-nequi-tx").textContent = txNequi + " transacciones";
  if (el("desglose-total"))
    el("desglose-total").textContent = formatPrecio(totalVentas);

  // Gráfica por hora
  renderGraficaHoras(totalVentas);

  // Productos más vendidos
  renderProductosMasVendidos();
}

function renderGraficaHoras(totalVentas) {
  const container = document.getElementById("grafica-horas");
  if (!container) return;

  const horas = [
    "08:00",
    "09:00",
    "10:00",
    "11:00",
    "12:00",
    "13:00",
    "14:00",
    "15:00",
    "16:00",
    "17:00",
    "18:00",
    "19:00",
  ];
  const factores = [
    0.05, 0.08, 0.06, 0.1, 0.15, 0.12, 0.08, 0.06, 0.09, 0.1, 0.08, 0.03,
  ];

  const valores = factores.map((f) => Math.round(totalVentas * f));
  const maxVal = Math.max(...valores);

  container.innerHTML = `
        <div class="grafica-barras">
            ${valores
              .map(
                (val, i) => `
                <div class="grafica-col">
                    <span class="grafica-val">${formatPrecio(val).replace("$", "$")}</span>
                    <div class="grafica-barra-wrap">
                        <div class="grafica-barra" style="height: ${Math.round((val / maxVal) * 100)}%"></div>
                    </div>
                    <span class="grafica-hora">${horas[i]}</span>
                </div>
            `,
              )
              .join("")}
        </div>
    `;
}

function renderProductosMasVendidos() {
  const container = document.getElementById("productos-mas-vendidos");
  if (!container) return;

  const conteo = {};
  dbGetPedidos().forEach((p) => {
    p.detalle.forEach((d) => {
      if (!conteo[d.producto_id]) conteo[d.producto_id] = { u: 0, t: 0 };
      conteo[d.producto_id].u += d.cantidad;
      conteo[d.producto_id].t += d.subtotal;
    });
  });

  const top = Object.entries(conteo)
    .sort((a, b) => b[1].u - a[1].u)
    .slice(0, 5);
  const medallas = ["🥇", "🥈", "🥉", "4", "5"];

  container.innerHTML = top
    .map(([id, data], i) => {
      const prod = dbGetProducto(parseInt(id));
      if (!prod) return "";
      return `
            <div class="prod-vendido-item">
                <span style="font-size:18px;">${medallas[i]}</span>
                <div style="flex:1;">
                    <p style="font-size:13px; font-weight:600; color:#1f2937;">${prod.nombre}</p>
                    <p style="font-size:11px; color:#9ca3af;">${data.u} uds</p>
                </div>
                <span style="font-size:13px; font-weight:700; color:#ea580c;">${formatPrecio(data.t)}</span>
            </div>`;
    })
    .join("");
}

function confirmarCierre() {
  window.location.href = "cierre-confirmado.html";
}

function exportarReporte() {
  alert("Función de exportar PDF próximamente disponible.");
}

function initCierreConfirmado() {
  const datos = JSON.parse(sessionStorage.getItem("cierre-datos") || "{}");
  const ahora = new Date();
  const hora = ahora.toLocaleTimeString("es-CO", {
    hour: "2-digit",
    minute: "2-digit",
  });

  const el = (id) => document.getElementById(id);
  if (el("res-ventas"))
    el("res-ventas").textContent = formatPrecio(datos.totalVentas || 0);
  if (el("res-transacciones"))
    el("res-transacciones").textContent = datos.transacciones || 0;
  if (el("res-efectivo"))
    el("res-efectivo").textContent = formatPrecio(datos.efectivo || 0);
  if (el("res-nequi"))
    el("res-nequi").textContent = formatPrecio(datos.nequi || 0);
  if (el("res-propinas"))
    el("res-propinas").textContent = formatPrecio(datos.propinas || 0);
  if (el("res-hora")) el("res-hora").textContent = hora;
  if (el("res-hora-badge")) el("res-hora-badge").textContent = hora;
}

function verReporteCompleto() {
  window.location.href = "cierre-caja.html";
}
