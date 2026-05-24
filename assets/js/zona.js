  /* Verificar sesión */
  const usuario = JSON.parse(sessionStorage.getItem('usuario'));
  if (!usuario) {
    window.location.href = '../../index.html';
  }

  /* Mostrar nombre */
  document.getElementById('usuario-nombre').textContent = usuario.nombre;

  /* Si ya eligió zona en esta sesión, ir directo */
  const zonaGuardada = sessionStorage.getItem(`zona-${usuario.id}`);
  if (zonaGuardada) {
    window.location.href = `cola-pedidos.html?zona=${zonaGuardada}`;
  }

  /* Mostrar conteo de pedidos por zona */
  function contarPedidosZona(area) {
    return dbGetPedidos().filter(p =>
      p.estado !== 'entregado' && p.estado !== 'listo' &&
      p.detalle.some(item => {
        const cat = dbGetCategoria(dbGetProducto(item.producto_id)?.categoria_id);
        return cat?.area === area;
      })
    ).length;
  }

  document.getElementById('kitchen-badge').textContent =
    `${contarPedidosZona('cocina')} pedidos pendientes`;
  document.getElementById('bar-badge').textContent =
    `${contarPedidosZona('bar')} pedidos pendientes`;

  /* Ir a la zona seleccionada */
  function irAZona(zona) {
    sessionStorage.setItem(`zona-${usuario.id}`, zona);
    window.location.href = `cola-pedidos.html?zona=${zona}`;
  }

  function cerrarSesion() {
    sessionStorage.clear();
    window.location.href = '../../index.html';
  }