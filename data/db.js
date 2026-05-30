/* ============================================
   SISTEMA XHIMANUT — data/db.js
   Base de datos simulada (mock data)
   ============================================ */

/* ── Usuarios ── */
const DB_USUARIOS = [
  {
    id: 1,
    cedula: "1001",
    password: "admin123",
    nombre: "Carlos Pérez",
    rol: "admin",
  },
  {
    id: 2,
    cedula: "1002",
    password: "mesero123",
    nombre: "Juan García",
    rol: "mesero",
  },
  {
    id: 3,
    cedula: "1003",
    password: "cocina123",
    nombre: "María López",
    rol: "cocina-bar",
  },
  {
    id: 4,
    cedula: "1004",
    password: "caja123",
    nombre: "Andrés Martínez",
    rol: "caja",
  },
  {
    id: 5,
    cedula: "1005",
    password: "mesero123",
    nombre: "Laura Ramírez",
    rol: "mesero",
  },
  {
    id: 6,
    cedula: "1006",
    password: "mesero123",
    nombre: "Pedro Gómez",
    rol: "mesero",
  },
];

/* ── Empleados ── */
let DB_EMPLEADOS = [
  {
    id: 1,
    firstName: "Juan",
    lastName: "García",
    cedula: "1002",
    role: "mesero",
    shift: "morning",
    status: "active",
  },
  {
    id: 2,
    firstName: "Ana",
    lastName: "Martínez",
    cedula: "1005",
    role: "mesero",
    shift: "afternoon",
    status: "active",
  },
  {
    id: 3,
    firstName: "Luis",
    lastName: "Rodríguez",
    cedula: "1003",
    role: "cocina-bar",
    shift: "morning",
    status: "active",
  },
  {
    id: 4,
    firstName: "María",
    lastName: "López",
    cedula: "1004",
    role: "caja",
    shift: "morning",
    status: "active",
  },
  {
    id: 5,
    firstName: "Carlos",
    lastName: "Pérez",
    cedula: "1001",
    role: "admin",
    shift: "morning",
    status: "active",
  },
  {
    id: 6,
    firstName: "Sofía",
    lastName: "Pérez",
    cedula: "1006",
    role: "mesero",
    shift: "morning",
    status: "active",
  },
];

/* ── Mesas ── */
const DB_MESAS = [
  {
    id: 1,
    numero: 1,
    zona: "Zona Azul",
    estado: "libre",
    capacidad: 4,
    mesero_id: null,
  },
  {
    id: 2,
    numero: 2,
    zona: "Zona Azul",
    estado: "ocupada",
    capacidad: 4,
    mesero_id: 2,
  },
  {
    id: 3,
    numero: 3,
    zona: "Zona Azul",
    estado: "libre",
    capacidad: 6,
    mesero_id: null,
  },
  {
    id: 4,
    numero: 4,
    zona: "Zona Roja",
    estado: "libre",
    capacidad: 6,
    mesero_id: null,
  },
  {
    id: 5,
    numero: 5,
    zona: "Zona Roja",
    estado: "ocupada",
    capacidad: 6,
    mesero_id: 2,
  },
  {
    id: 6,
    numero: 6,
    zona: "Zona Roja",
    estado: "libre",
    capacidad: 4,
    mesero_id: null,
  },
  {
    id: 7,
    numero: 7,
    zona: "Zona Verde",
    estado: "libre",
    capacidad: 2,
    mesero_id: null,
  },
  {
    id: 8,
    numero: 8,
    zona: "Zona Verde",
    estado: "ocupada",
    capacidad: 2,
    mesero_id: 5,
  },
  {
    id: 9,
    numero: 9,
    zona: "Zona Verde",
    estado: "libre",
    capacidad: 4,
    mesero_id: null,
  },
  {
    id: 10,
    numero: 10,
    zona: "Zona Gris",
    estado: "libre",
    capacidad: 8,
    mesero_id: null,
  },
  {
    id: 11,
    numero: 11,
    zona: "Zona Gris",
    estado: "ocupada",
    capacidad: 8,
    mesero_id: 6,
  },
  {
    id: 12,
    numero: 12,
    zona: "Zona Gris",
    estado: "libre",
    capacidad: 6,
    mesero_id: null,
  },
];

/* ── Categorías ── */
const DB_CATEGORIAS = [
  { id: 1, nombre: "Carnes", area: "cocina" },
  { id: 2, nombre: "Comida de mar", area: "cocina" },
  { id: 3, nombre: "Bebidas", area: "bar" },
  { id: 4, nombre: "Dulcería", area: "bar" },
  { id: 5, nombre: "Entradas", area: "cocina" },
];

/* ── Productos ── */
const DB_PRODUCTOS = [
  {
    id: 1,
    nombre: "Bandeja paisa",
    precio: 28000,
    categoria_id: 1,
    stock: 10,
    disponible: true,
  },
  {
    id: 2,
    nombre: "Churrasco",
    precio: 35000,
    categoria_id: 1,
    stock: 8,
    disponible: true,
  },
  {
    id: 3,
    nombre: "Costilla BBQ",
    precio: 32000,
    categoria_id: 1,
    stock: 0,
    disponible: false,
  },
  {
    id: 4,
    nombre: "Pollo asado",
    precio: 24000,
    categoria_id: 1,
    stock: 12,
    disponible: true,
  },
  {
    id: 5,
    nombre: "Cazuela de mariscos",
    precio: 38000,
    categoria_id: 2,
    stock: 5,
    disponible: true,
  },
  {
    id: 6,
    nombre: "Trucha a la plancha",
    precio: 30000,
    categoria_id: 2,
    stock: 7,
    disponible: true,
  },
  {
    id: 7,
    nombre: "Camarones al ajillo",
    precio: 36000,
    categoria_id: 2,
    stock: 0,
    disponible: false,
  },
  {
    id: 8,
    nombre: "Limonada de coco",
    precio: 8000,
    categoria_id: 3,
    stock: 20,
    disponible: true,
  },
  {
    id: 9,
    nombre: "Jugo natural",
    precio: 6000,
    categoria_id: 3,
    stock: 20,
    disponible: true,
  },
  {
    id: 10,
    nombre: "Gaseosa",
    precio: 4000,
    categoria_id: 3,
    stock: 30,
    disponible: true,
  },
  {
    id: 11,
    nombre: "Agua mineral",
    precio: 3000,
    categoria_id: 3,
    stock: 25,
    disponible: true,
  },
  {
    id: 12,
    nombre: "Cerveza",
    precio: 7000,
    categoria_id: 3,
    stock: 15,
    disponible: true,
  },
  {
    id: 13,
    nombre: "Tres leches",
    precio: 10000,
    categoria_id: 4,
    stock: 8,
    disponible: true,
  },
  {
    id: 14,
    nombre: "Flan de caramelo",
    precio: 9000,
    categoria_id: 4,
    stock: 6,
    disponible: true,
  },
  {
    id: 15,
    nombre: "Brownie con helado",
    precio: 12000,
    categoria_id: 4,
    stock: 0,
    disponible: false,
  },
  {
    id: 16,
    nombre: "Patacones con hogao",
    precio: 12000,
    categoria_id: 5,
    stock: 15,
    disponible: true,
  },
  {
    id: 17,
    nombre: "Arepa de choclo",
    precio: 8000,
    categoria_id: 5,
    stock: 10,
    disponible: true,
  },
];

/* ── Pedidos activos ── */
let DB_PEDIDOS = [
  {
    id: 1,
    mesa_id: 2,
    mesero_id: 2,
    fecha: "2026-05-30",
    hora: "12:20",
    estado: "en_preparacion",
    detalle: [
      { producto_id: 1, cantidad: 2, precio_unitario: 28000, subtotal: 56000 },
      { producto_id: 9, cantidad: 2, precio_unitario: 6000, subtotal: 12000 },
    ],
  },
  {
    id: 2,
    mesa_id: 5,
    mesero_id: 2,
    fecha: "2026-05-30",
    hora: "11:45",
    estado: "pendiente",
    detalle: [
      { producto_id: 5, cantidad: 1, precio_unitario: 38000, subtotal: 38000 },
      { producto_id: 8, cantidad: 2, precio_unitario: 8000, subtotal: 16000 },
      { producto_id: 16, cantidad: 2, precio_unitario: 12000, subtotal: 24000 },
    ],
  },
  {
    id: 3,
    mesa_id: 8,
    mesero_id: 5,
    fecha: "2026-05-30",
    hora: "13:10",
    estado: "pendiente",
    detalle: [
      { producto_id: 4, cantidad: 2, precio_unitario: 24000, subtotal: 48000 },
      { producto_id: 10, cantidad: 2, precio_unitario: 4000, subtotal: 8000 },
    ],
  },
  {
    id: 4,
    mesa_id: 11,
    mesero_id: 6,
    fecha: "2026-05-30",
    hora: "13:30",
    estado: "pendiente",
    detalle: [
      { producto_id: 6, cantidad: 3, precio_unitario: 30000, subtotal: 90000 },
      { producto_id: 12, cantidad: 3, precio_unitario: 7000, subtotal: 21000 },
      { producto_id: 17, cantidad: 2, precio_unitario: 8000, subtotal: 16000 },
    ],
  },
];

/* ══════════════════════════════════════
   FUNCIONES DE ACCESO A DATOS
══════════════════════════════════════ */

/* ── Usuarios ── */
function dbGetUsuario(cedula, password) {
  return (
    DB_USUARIOS.find((u) => u.cedula === cedula && u.password === password) ||
    null
  );
}

function dbGetMeseros() {
  return DB_USUARIOS.filter((u) => u.rol === "mesero");
}

function dbGetUsuarioPorId(id) {
  return DB_USUARIOS.find((u) => u.id === id) || null;
}

/* ── Empleados ── */
function dbGetEmpleados() {
  return DB_EMPLEADOS;
}

function dbCrearEmpleado(empleado) {
  const nuevo = {
    id: DB_EMPLEADOS.length + 1,
    ...empleado,
    status: "active",
  };
  DB_EMPLEADOS.push(nuevo);
  DB_USUARIOS.push({
    id: DB_USUARIOS.length + 1,
    cedula: empleado.cedula,
    password: "1234",
    nombre: empleado.firstName + " " + empleado.lastName,
    rol: empleado.role,
  });
  return nuevo;
}

function dbEliminarEmpleado(id) {
  const index = DB_EMPLEADOS.findIndex((e) => e.id === id);
  if (index !== -1) {
    DB_EMPLEADOS.splice(index, 1);
    return true;
  }
  return false;
}

function dbActualizarEmpleado(id, datos) {
  const empleado = DB_EMPLEADOS.find((e) => e.id === id);
  if (empleado) {
    Object.assign(empleado, datos);
    return true;
  }
  return false;
}

function dbCedulaDuplicada(cedula, excludeId) {
  return DB_EMPLEADOS.some((e) => e.cedula === cedula && e.id !== excludeId);
}

/* ── Mesas ── */
function dbGetMesas() {
  return DB_MESAS;
}

function dbGetMesa(id) {
  return DB_MESAS.find((m) => m.id === id) || null;
}

function dbGetMesasPorZona(zona) {
  return DB_MESAS.filter((m) => m.zona === zona);
}

function dbGetZonas() {
  return [...new Set(DB_MESAS.map((m) => m.zona))];
}

function dbActualizarEstadoMesa(id, estado) {
  const mesa = DB_MESAS.find((m) => m.id === id);
  if (mesa) mesa.estado = estado;
}

function dbTransferirMesa(mesaId, nuevoMeseroId) {
  const mesa = DB_MESAS.find((m) => m.id === mesaId);
  if (!mesa) return false;
  mesa.mesero_id = nuevoMeseroId;
  DB_PEDIDOS.filter(
    (p) => p.mesa_id === mesaId && p.estado !== "entregado",
  ).forEach((p) => (p.mesero_id = nuevoMeseroId));
  return true;
}

/* ── Productos ── */
function dbGetProductos() {
  return DB_PRODUCTOS.filter((p) => p.disponible);
}

function dbGetTodosProductos() {
  return DB_PRODUCTOS;
}

function dbGetProductosPorCategoria(categoriaId) {
  return DB_PRODUCTOS.filter(
    (p) => p.categoria_id === categoriaId && p.disponible,
  );
}

function dbGetCategorias() {
  return DB_CATEGORIAS;
}

function dbVerificarStock(productoId, cantidad) {
  const producto = DB_PRODUCTOS.find((p) => p.id === productoId);
  return producto && producto.stock >= cantidad;
}

function dbDescontarStock(productoId, cantidad) {
  const producto = DB_PRODUCTOS.find((p) => p.id === productoId);
  if (producto) {
    producto.stock -= cantidad;
    if (producto.stock === 0) producto.disponible = false;
  }
}

/* ── Pedidos ── */
function dbGetPedidos() {
  return DB_PEDIDOS;
}

function dbGetPedidosPorMesa(mesaId) {
  return DB_PEDIDOS.filter(
    (p) => p.mesa_id === mesaId && p.estado !== "entregado",
  );
}

function dbCrearPedido(pedido) {
  const nuevo = { id: DB_PEDIDOS.length + 1, ...pedido, estado: "pendiente" };
  DB_PEDIDOS.push(nuevo);
  nuevo.detalle.forEach((item) =>
    dbDescontarStock(item.producto_id, item.cantidad),
  );
  const mesa = DB_MESAS.find((m) => m.id === pedido.mesa_id);
  if (mesa) {
    mesa.estado = "ocupada";
    mesa.mesero_id = pedido.mesero_id;
  }
  return nuevo;
}

function dbActualizarEstadoPedido(pedidoId, estado) {
  const pedido = DB_PEDIDOS.find((p) => p.id === pedidoId);
  if (pedido) pedido.estado = estado;
}

/* ── Helpers ── */
function dbGetProducto(id) {
  return DB_PRODUCTOS.find((p) => p.id === id) || null;
}

function dbGetCategoria(id) {
  return DB_CATEGORIAS.find((c) => c.id === id) || null;
}

function formatPrecio(valor) {
  return "$" + valor.toLocaleString("es-CO");
}
