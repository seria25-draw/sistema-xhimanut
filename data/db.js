// Base de datos simulada
// En un entorno real, esta información se almacenaría en una base de datos
const DB = {
  // Lista de pedidos que llegan a cocina
  orders: [
    {
      id: 12,
      table: 2,
      zone: "Cocina",
      items: ["Pechuga a la grill", "Caldo de Pescado"],
      time: "12:35 PM",
      status: "En preparación",
    },
    {
      id: 13,
      table: 5,
      zone: "Cocina",
      items: ["Pechuga Xhimanut", "Ensalada", "Arroz"],
      time: "12:40 PM",
      status: "Pendiente",
    },
    {
      id: 14,
      table: 1,
      zone: "Bar",
      items: ["Limonada Cerezada", "Michelada"],
      time: "12:45 PM",
      status: "Pendiente",
    },
    {
      id: 15,
      table: 3,
      zone: "Bar",
      items: ["Soda Italiana"],
      time: "12:50 PM",
      status: "Pendiente",
    },
  ],
};
