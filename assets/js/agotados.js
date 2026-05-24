/* ============================================
   SISTEMA XHIMANUT — assets/js/agotados.js
   Disponibilidad de productos (cocina/bar)
   ============================================ */

let _categoriaActiva = null;
let _cambiosPendientes = {}; // { productoId: true/false }

/* ── Imágenes de productos ── */
const PRODUCTO_IMG = {
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

function initAgotados() {
  _cambiosPendientes = {};
  _renderTabs();
  _renderGrid(_categoriaActiva);
}

/* ── Tabs de categoría ── */
function _renderTabs() {
  const usuario  = JSON.parse(sessionStorage.getItem('usuario'));
  const zona     = usuario ? sessionStorage.getItem(`zona-${usuario.id}`) : null;

  // Filtrar categorías según zona del usuario (cocina o bar)
  const categorias = dbGetCategorias().filter(c => {
    if (!zona) return true; // admin/sin zona: ver todo
    return c.area === zona;
  });

  const container = document.getElementById('agot-tabs');
  if (!container) return;

  container.innerHTML = '';

  // Tab "Todas"
  const tabTodas = document.createElement('button');
  tabTodas.className = `agot-tab${_categoriaActiva === null ? ' active' : ''}`;
  tabTodas.textContent = 'Todas';
  tabTodas.onclick = () => _seleccionarTab(null);
  container.appendChild(tabTodas);

  categorias.forEach(cat => {
    const tab = document.createElement('button');
    tab.className = `agot-tab${_categoriaActiva === cat.id ? ' active' : ''}`;
    tab.textContent = cat.nombre;
    tab.onclick = () => _seleccionarTab(cat.id);
    container.appendChild(tab);
  });
}

function _seleccionarTab(categoriaId) {
  _categoriaActiva = categoriaId;
  _renderTabs();
  _renderGrid(categoriaId);
}

/* ── Grid de productos ── */
function _renderGrid(categoriaId) {
  const usuario = JSON.parse(sessionStorage.getItem('usuario'));
  const zona    = usuario ? sessionStorage.getItem(`zona-${usuario.id}`) : null;

  let productos = dbGetTodosProductos();

  // Filtrar por zona
  if (zona) {
    const categoriasZona = dbGetCategorias()
      .filter(c => c.area === zona)
      .map(c => c.id);
    productos = productos.filter(p => categoriasZona.includes(p.categoria_id));
  }

  // Filtrar por categoría activa
  if (categoriaId !== null) {
    productos = productos.filter(p => p.categoria_id === categoriaId);
  }

  const grid = document.getElementById('agot-grid');
  if (!grid) return;

  grid.innerHTML = '';

  if (productos.length === 0) {
    grid.innerHTML = `
      <div style="grid-column:1/-1;text-align:center;padding:48px;color:#BDBDBD;">
        <i class="fa-solid fa-box-open" style="font-size:32px;opacity:0.4;display:block;margin-bottom:12px;"></i>
        <p>No hay productos en esta categoría</p>
      </div>`;
    return;
  }

  productos.forEach(producto => {
    const cat = dbGetCategoria(producto.categoria_id);

    // Estado actual: puede haber cambio pendiente
    const disponible = _cambiosPendientes.hasOwnProperty(producto.id)
      ? _cambiosPendientes[producto.id]
      : producto.disponible;

    const card = document.createElement('div');
    card.className = `agot-card ${disponible ? 'disponible' : 'agotado'}`;
    card.id = `agot-card-${producto.id}`;

    // Stock
    let stockClass  = '';
    let stockTexto  = `Stock: ${producto.stock}`;
    if (producto.stock === 0)       { stockClass = 'agotado'; stockTexto = 'Sin stock'; }
    else if (producto.stock <= 3)   { stockClass = 'bajo';    stockTexto = `Stock bajo: ${producto.stock}`; }

    const imgSrc    = PRODUCTO_IMG[producto.id] || '';
    const imgFallback = _iconoCategoria(cat?.area);

    card.innerHTML = `
      <div class="agot-card-img">
        ${imgSrc
          ? `<img src="${imgSrc}" alt="${producto.nombre}"
               onerror="this.style.display='none';this.nextElementSibling.style.display='flex';">
             <div class="agot-img-fallback" style="display:none;width:100%;height:100%;
               align-items:center;justify-content:center;background:#F5F5F5;font-size:36px;">
               ${imgFallback}
             </div>`
          : `<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;
               background:#F5F5F5;font-size:36px;">${imgFallback}</div>`
        }
        ${!disponible ? `<div class="agot-overlay"><i class="fa-solid fa-ban"></i></div>` : ''}
      </div>
      <div class="agot-card-body">
        <div class="agot-card-nombre">${producto.nombre}</div>
        <div class="agot-card-categoria">${cat?.nombre || '—'} · ${formatPrecio(producto.precio)}</div>
        <div class="agot-card-footer">
          <span class="agot-stock ${stockClass}">
            <i class="fa-solid fa-cubes-stacked"></i> ${stockTexto}
          </span>
          <div class="agot-toggle-wrap">
            <span class="agot-toggle-label">${disponible ? 'Disponible' : 'Agotado'}</span>
            <label class="agot-toggle">
              <input type="checkbox" ${disponible ? 'checked' : ''}
                onchange="toggleDisponibilidad(${producto.id}, this.checked)">
              <span class="agot-toggle-slider"></span>
            </label>
          </div>
        </div>
      </div>
    `;

    grid.appendChild(card);
  });
}

/* ── Toggle individual ── */
function toggleDisponibilidad(productoId, nuevoEstado) {
  // Guardar en cambios pendientes
  _cambiosPendientes[productoId] = nuevoEstado;

  // Actualizar visual de la card sin re-renderizar todo
  const card = document.getElementById(`agot-card-${productoId}`);
  if (!card) return;

  card.className = `agot-card ${nuevoEstado ? 'disponible' : 'agotado'}`;

  // Actualizar overlay
  const imgWrap = card.querySelector('.agot-card-img');
  const overlay = imgWrap.querySelector('.agot-overlay');

  if (!nuevoEstado && !overlay) {
    const div = document.createElement('div');
    div.className = 'agot-overlay';
    div.innerHTML = '<i class="fa-solid fa-ban"></i>';
    imgWrap.appendChild(div);
  } else if (nuevoEstado && overlay) {
    overlay.remove();
  }

  // Actualizar label
  const label = card.querySelector('.agot-toggle-label');
  if (label) label.textContent = nuevoEstado ? 'Disponible' : 'Agotado';
}

/* ── Guardar cambios ── */
function guardarCambios() {
  const total = Object.keys(_cambiosPendientes).length;

  if (total === 0) {
    _mostrarAlerta('No hay cambios para guardar');
    return;
  }

  // Aplicar cambios a la DB simulada
  Object.entries(_cambiosPendientes).forEach(([id, disponible]) => {
    const producto = DB_PRODUCTOS.find(p => p.id === parseInt(id));
    if (producto) {
      producto.disponible = disponible;
      // Si se marca disponible y stock era 0, advertencia visual (no bloqueante)
    }
  });

  _cambiosPendientes = {};
  _mostrarAlerta(`Cambios guardados correctamente (${total} producto${total !== 1 ? 's' : ''})`);

  // Re-renderizar para reflejar estado guardado
  _renderGrid(_categoriaActiva);
}

/* ── Alerta ── */
function _mostrarAlerta(mensaje) {
  const alerta = document.getElementById('alerta-guardado');
  if (!alerta) return;

  alerta.innerHTML = `<i class="fa-solid fa-circle-check"></i> ${mensaje}`;
  alerta.classList.remove('hidden');

  clearTimeout(alerta._timer);
  alerta._timer = setTimeout(() => alerta.classList.add('hidden'), 3500);
}

/* ── Helper ── */
function _iconoCategoria(area) {
  const iconos = {
    cocina: '🍽️',
    bar:    '🍹',
  };
  return iconos[area] || '🍴';
}