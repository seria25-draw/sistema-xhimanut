/* ============================================
   SISTEMA XHIMANUT — assets/js/estadisticas.js
   Estadísticas del turno (cocina / bar)
   ============================================ */

function initEstadisticas() {
  const usuario = JSON.parse(sessionStorage.getItem('usuario'));
  const zona    = usuario ? sessionStorage.getItem(`zona-${usuario.id}`) : null;

  // Label de zona
  const zonaLabel = document.getElementById('zona-label');
  if (zonaLabel) {
    const textos = { cocina: 'Vista de Cocina', bar: 'Vista de Bar' };
    zonaLabel.textContent = textos[zona] || 'Vista general · turno actual';
  }

  const pedidos    = dbGetPedidos();
  const hoy        = new Date().toISOString().slice(0, 10);
  const pedidosHoy = pedidos.filter(p => p.fecha === hoy);

  // Filtrar por zona si aplica
  const categorias   = dbGetCategorias();
  const idsCategZona = zona
    ? categorias.filter(c => c.area === zona).map(c => c.id)
    : null;

  _renderCards(pedidosHoy, idsCategZona);
  _renderTablaCompletados(pedidosHoy);
  _renderProductosTop(pedidosHoy, idsCategZona);
  _renderProblemas(pedidosHoy, idsCategZona);
}

/* ══════════════════════════════════════
   TARJETAS RESUMEN
══════════════════════════════════════ */
function _renderCards(pedidosHoy, idsCategZona) {
  const container = document.getElementById('est-cards');
  if (!container) return;

  const completados   = pedidosHoy.filter(p => p.estado === 'entregado' || p.estado === 'listo');
  const enPreparacion = pedidosHoy.filter(p => p.estado === 'en_preparacion');
  const pendientes    = pedidosHoy.filter(p => p.estado === 'pendiente');

  // Total items preparados (filtrado por zona si aplica)
  let totalItems = 0;
  pedidosHoy.forEach(p => {
    p.detalle.forEach(item => {
      if (!idsCategZona) {
        totalItems += item.cantidad;
      } else {
        const prod = dbGetProducto(item.producto_id);
        if (prod && idsCategZona.includes(prod.categoria_id)) {
          totalItems += item.cantidad;
        }
      }
    });
  });

  const cards = [
    {
      icon:  'fa-solid fa-list-check',
      color: 'red',
      valor: pedidosHoy.length,
      label: 'Pedidos del turno',
    },
    {
      icon:  'fa-solid fa-circle-check',
      color: 'green',
      valor: completados.length,
      label: 'Completados',
    },
    {
      icon:  'fa-solid fa-fire-burner',
      color: 'orange',
      valor: enPreparacion.length + pendientes.length,
      label: 'En cola',
    },
    {
      icon:  'fa-solid fa-bowl-food',
      color: 'blue',
      valor: totalItems,
      label: 'Items preparados',
    },
  ];

  container.innerHTML = cards.map(c => `
    <div class="est-card">
      <div class="est-card-icon ${c.color}">
        <i class="${c.icon}"></i>
      </div>
      <div class="est-card-valor">${c.valor}</div>
      <div class="est-card-label">${c.label}</div>
    </div>
  `).join('');
}

/* ══════════════════════════════════════
   TABLA PEDIDOS COMPLETADOS
══════════════════════════════════════ */
function _renderTablaCompletados(pedidosHoy) {
  const tbody   = document.getElementById('tabla-completados');
  const vacioEl = document.getElementById('vacio-completados');
  if (!tbody) return;

  const completados = pedidosHoy.filter(
    p => p.estado === 'entregado' || p.estado === 'listo'
  );

  if (completados.length === 0) {
    tbody.innerHTML = '';
    vacioEl?.classList.remove('hidden');
    return;
  }

  vacioEl?.classList.add('hidden');

  tbody.innerHTML = completados.map(p => {
    const mesa       = dbGetMesa(p.mesa_id);
    const totalItems = p.detalle.reduce((s, i) => s + i.cantidad, 0);
    const badgeClass = p.estado === 'listo' ? 'listo' : 'en_preparacion';
    const badgeTexto = p.estado === 'listo' ? 'Listo' : 'Entregado';

    return `
      <tr>
        <td>#${p.id}</td>
        <td>Mesa ${mesa?.numero ?? p.mesa_id}</td>
        <td>${p.hora}</td>
        <td>${totalItems} item${totalItems !== 1 ? 's' : ''}</td>
        <td><span class="est-badge ${badgeClass}">${badgeTexto}</span></td>
      </tr>
    `;
  }).join('');
}

/* ══════════════════════════════════════
   PRODUCTOS MÁS PREPARADOS
══════════════════════════════════════ */
function _renderProductosTop(pedidosHoy, idsCategZona) {
  const container = document.getElementById('est-productos');
  if (!container) return;

  // Sumar cantidades por producto
  const conteo = {}; // { productoId: cantidad }

  pedidosHoy.forEach(p => {
    p.detalle.forEach(item => {
      const prod = dbGetProducto(item.producto_id);
      if (!prod) return;
      if (idsCategZona && !idsCategZona.includes(prod.categoria_id)) return;
      conteo[item.producto_id] = (conteo[item.producto_id] || 0) + item.cantidad;
    });
  });

  const ranking = Object.entries(conteo)
    .map(([id, cnt]) => ({ producto: dbGetProducto(parseInt(id)), count: cnt }))
    .filter(x => x.producto)
    .sort((a, b) => b.count - a.count)
    .slice(0, 6);

  if (ranking.length === 0) {
    container.innerHTML = `
      <div style="grid-column:1/-1;text-align:center;padding:32px;color:#BDBDBD;">
        <i class="fa-solid fa-chart-simple" style="font-size:28px;opacity:0.4;display:block;margin-bottom:8px;"></i>
        <p style="font-size:13px;">No hay datos de productos aún</p>
      </div>`;
    return;
  }

  const rankColors = ['gold', 'silver', 'bronze'];

  container.innerHTML = ranking.map((item, i) => `
    <div class="est-producto-item">
      <div class="est-prod-rank ${rankColors[i] || ''}">${i + 1}</div>
      <div class="est-prod-nombre">${item.producto.nombre}</div>
      <div class="est-prod-count">${item.count} uds</div>
    </div>
  `).join('');
}

/* ══════════════════════════════════════
   REPORTE DE PROBLEMAS
   (pedidos con tiempo > 30 min sin completar)
══════════════════════════════════════ */
function _renderProblemas(pedidosHoy, idsCategZona) {
  const container = document.getElementById('problemas-lista');
  if (!container) return;

  const ahora   = new Date();
  const problemas = [];

  pedidosHoy.forEach(p => {
    if (p.estado === 'entregado' || p.estado === 'listo') return;

    // Calcular minutos de espera
    const [h, m]    = p.hora.split(':').map(Number);
    const horaPedido = new Date(ahora);
    horaPedido.setHours(h, m, 0, 0);

    const diffMin = Math.floor((ahora - horaPedido) / 60000);

    if (diffMin >= 30) {
      const mesa = dbGetMesa(p.mesa_id);
      problemas.push({
        pedidoId: p.id,
        mesaNum:  mesa?.numero ?? p.mesa_id,
        hora:     p.hora,
        minutos:  diffMin,
        estado:   p.estado,
      });
    }
  });

  if (problemas.length === 0) {
    container.innerHTML = `<p class="sin-problemas"><i class="fa-solid fa-circle-check" style="color:#00C853;margin-right:6px;"></i>Sin problemas reportados en este turno</p>`;
    return;
  }

  container.innerHTML = problemas.map(pr => `
    <div class="problema-item">
      <div class="problema-icon">
        <i class="fa-solid fa-clock"></i>
      </div>
      <div>
        <div class="problema-texto">
          Pedido <strong>#${pr.pedidoId}</strong> · Mesa <strong>${pr.mesaNum}</strong>
          lleva <strong>${pr.minutos} min</strong> sin completarse
          <span class="est-badge ${pr.estado}" style="margin-left:6px;">${_estadoTexto(pr.estado)}</span>
        </div>
        <div class="problema-hora">Pedido registrado a las ${pr.hora}</div>
      </div>
    </div>
  `).join('');
}

/* ── Helper estado texto ── */
function _estadoTexto(estado) {
  const textos = {
    pendiente:       'Pendiente',
    en_preparacion:  'En preparación',
    listo:           'Listo',
    entregado:       'Entregado',
  };
  return textos[estado] || estado;
}