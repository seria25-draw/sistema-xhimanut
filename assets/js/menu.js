/* ============================================
   SISTEMA XHIMANUT — menu.js
   Consulta del menú para el mesero
   ============================================ */

const PRODUCTO_IMG_MENU = {
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

const CATEGORIA_ICON_MENU = {
  1: 'fa-solid fa-drumstick-bite',
  2: 'fa-solid fa-fish',
  3: 'fa-solid fa-martini-glass',
  4: 'fa-solid fa-cake-candles',
  5: 'fa-solid fa-leaf',
};

let categoriaActivaMenu  = 'todas';
let disponibilidadActiva = 'todos';

function initMenu() {
  renderTabsMenu();
  renderMenu();
}

/* ── Tabs de categoría ── */
function renderTabsMenu() {
  const categorias = dbGetCategorias();
  const tabs       = document.getElementById('menu-tabs');
  tabs.innerHTML   = '';

  const tabTodas = document.createElement('button');
  tabTodas.className = `menu-tab ${categoriaActivaMenu === 'todas' ? 'active' : ''}`;
  tabTodas.innerHTML = `<i class="fa-solid fa-border-all"></i> Todas`;
  tabTodas.onclick   = () => { categoriaActivaMenu = 'todas'; renderTabsMenu(); renderMenu(); };
  tabs.appendChild(tabTodas);

  categorias.forEach(cat => {
    const tab = document.createElement('button');
    tab.className = `menu-tab ${categoriaActivaMenu === cat.id ? 'active' : ''}`;
    tab.innerHTML = `<i class="${CATEGORIA_ICON_MENU[cat.id] || 'fa-solid fa-tag'}"></i> ${cat.nombre}`;
    tab.onclick   = () => { categoriaActivaMenu = cat.id; renderTabsMenu(); renderMenu(); };
    tabs.appendChild(tab);
  });
}

/* ── Filtro disponibilidad ── */
function filtrarDisponibilidad(tipo) {
  disponibilidadActiva = tipo;
  ['todos', 'disponibles', 'agotados'].forEach(t => {
    const btn = document.getElementById(`btn-${t}`);
    if (btn) btn.classList.toggle('active', t === tipo);
  });
  renderMenu();
}

/* ── Filtrar por búsqueda ── */
function filtrarMenu() { renderMenu(); }

/* ── Render del menú ── */
function renderMenu() {
  const busqueda = document.getElementById('buscador-menu').value.toLowerCase();
  let productos  = dbGetTodosProductos();

  /* Filtrar por categoría */
  if (categoriaActivaMenu !== 'todas') {
    productos = productos.filter(p => p.categoria_id === categoriaActivaMenu);
  }

  /* Filtrar por disponibilidad */
  if (disponibilidadActiva === 'disponibles') {
    productos = productos.filter(p => p.disponible);
  } else if (disponibilidadActiva === 'agotados') {
    productos = productos.filter(p => !p.disponible);
  }

  /* Filtrar por búsqueda */
  if (busqueda) {
    productos = productos.filter(p => p.nombre.toLowerCase().includes(busqueda));
  }

  const grid = document.getElementById('menu-grid');
  grid.innerHTML = '';

  if (productos.length === 0) {
    grid.innerHTML = `
      <div class="menu-vacio">
        <i class="fa-solid fa-magnifying-glass"></i>
        <p>No se encontraron productos</p>
      </div>`;
    return;
  }

  productos.forEach(producto => {
    const categoria = dbGetCategoria(producto.categoria_id);
    const img       = PRODUCTO_IMG_MENU[producto.id] || '';
    const stockBajo = producto.stock > 0 && producto.stock <= 3;
    const agotado   = !producto.disponible;

    const card = document.createElement('div');
    card.className = `menu-card${agotado ? ' agotado' : ''}`;
    card.innerHTML = `
      <div class="menu-card-img">
        <img src="${img}" alt="${producto.nombre}" onerror="this.style.display='none'"/>
        <span class="menu-area-badge ${categoria?.area}">
          ${categoria?.area === 'cocina' ? '🔥 Cocina' : '🍹 Bar'}
        </span>
        <div class="menu-disp-badge ${agotado ? 'agotado' : 'disponible'}">
          <i class="fa-solid ${agotado ? 'fa-ban' : 'fa-check'}"></i>
        </div>
      </div>
      <div class="menu-card-body">
        <div class="menu-card-categoria">${categoria?.nombre || ''}</div>
        <div class="menu-card-nombre">${producto.nombre}</div>
        <div class="menu-card-footer">
          <span class="menu-card-precio">${formatPrecio(producto.precio)}</span>
          <span class="menu-card-stock ${agotado ? 'agotado-txt' : stockBajo ? 'bajo' : ''}">
            ${agotado
              ? '<i class="fa-solid fa-ban"></i> Agotado'
              : stockBajo
                ? `<i class="fa-solid fa-triangle-exclamation"></i> Solo ${producto.stock}`
                : `<i class="fa-solid fa-box"></i> ${producto.stock} uds`
            }
          </span>
        </div>
      </div>
    `;
    grid.appendChild(card);
  });
}