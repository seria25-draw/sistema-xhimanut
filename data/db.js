// ================================
// SIMULATED DATABASE
// All test data for the app
// ================================

const DB = {
  // List of orders that arrive to the kitchen
  orders: [
    {
      id: 35,
      table: 5,
      zone: "kitchen",
      waiter: "Ana",
      items: [
        { name: "Pasta boloñesa", quantity: 2, notes: "", status: "pending" },
      ],
      time: "11:48",
      minutesAgo: 12,
      status: "urgent",
    },
    {
      id: 39,
      table: 1,
      zone: "kitchen",
      waiter: "Juan",
      items: [
        { name: "Crepe nutella", quantity: 2, notes: "", status: "ready" },
        { name: "Ensalada César", quantity: 1, notes: "", status: "pending" },
      ],
      time: "11:53",
      minutesAgo: 7,
      status: "in-progress",
    },
    {
      id: 42,
      table: 3,
      zone: "kitchen",
      waiter: "Juan",
      items: [
        {
          name: "Pizza hawaiana Grande",
          quantity: 1,
          notes: "Sin cebolla",
          status: "pending",
        },
        {
          name: "Pizza jamón y queso",
          quantity: 1,
          notes: "",
          status: "ready",
        },
      ],
      time: "11:57",
      minutesAgo: 3,
      status: "new",
    },
    {
      id: 14,
      table: 1,
      zone: "bar",
      waiter: "Ana",
      items: [
        {
          name: "Limonada Cerezada",
          quantity: 2,
          notes: "",
          status: "pending",
        },
        { name: "Michelada", quantity: 1, notes: "", status: "pending" },
      ],
      time: "12:45",
      minutesAgo: 5,
      status: "new",
    },
    {
      id: 15,
      table: 3,
      zone: "bar",
      waiter: "Juan",
      items: [
        { name: "Soda Italiana", quantity: 1, notes: "", status: "pending" },
      ],
      time: "12:50",
      minutesAgo: 2,
      status: "pending",
    },
  ],
};
