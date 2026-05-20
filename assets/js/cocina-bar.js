// ================================
// STATE
// Variables that control the app
// ================================

let currentZone = "kitchen"; // Active zone
let currentOrder = null; // Order being viewed
let currentFilter = "all"; // Active filter

// ================================
// INITIALIZATION
// Runs when the page loads
// ================================

document.addEventListener("DOMContentLoaded", function () {
  updateZoneBadges();
  renderQueue(currentZone);
  updateStats(currentZone);
});

// ================================
// SCREEN NAVIGATION
// Shows one screen and hides the rest
// ================================

function showScreen(screenId) {
  // Hide all screens
  document.querySelectorAll(".screen").forEach(function (screen) {
    screen.classList.remove("active");
  });

  // Show the requested screen
  document.getElementById(screenId).classList.add("active");

  // Update active nav link
  document.querySelectorAll(".nav-link").forEach(function (link) {
    link.classList.remove("active");
  });

  // Update breadcrumb
  const breadcrumbs = {
    "screen-zone": "Xhimanut / Inicio",
    "screen-queue": "Xhimanut / Cola de pedidos",
    "screen-detail": "Xhimanut / Cola / Orden",
    "screen-confirmation": "Xhimanut / Orden Lista",
  };
  document.getElementById("breadcrumb").textContent =
    breadcrumbs[screenId] || "Xhimanut";
}

// ================================
// ZONE SELECTION
// ================================

function selectZone(zone) {
  currentZone = zone;

  // Update zone tag button text
  const zoneNames = { kitchen: "Cocina", bar: "Bar" };
  document.getElementById("zone-tag").textContent = zoneNames[zone];

  renderQueue(zone);
  updateStats(zone);
  showScreen("screen-queue");

  // Update nav link active state
  document.querySelectorAll(".nav-link").forEach(function (link) {
    link.classList.remove("active");
    if (link.textContent.includes("Cola de pedidos")) {
      link.classList.add("active");
    }
  });
}

// ================================
// UPDATE ZONE BADGES
// Shows pending count on zone cards
// ================================

function updateZoneBadges() {
  // Count pending orders per zone
  const kitchenCount = DB.orders.filter(function (o) {
    return o.zone === "kitchen" && o.status !== "ready";
  }).length;

  const barCount = DB.orders.filter(function (o) {
    return o.zone === "bar" && o.status !== "ready";
  }).length;

  // Update badge text
  document.getElementById("kitchen-badge").textContent =
    kitchenCount + " pedidos pendientes";
  document.getElementById("bar-badge").textContent =
    barCount + " pedidos pendientes";

  // Green badge if zero
  document.getElementById("kitchen-badge").className =
    "zone-badge" + (kitchenCount === 0 ? " zero" : "");
  document.getElementById("bar-badge").className =
    "zone-badge" + (barCount === 0 ? " zero" : "");
}

// ================================
// UPDATE STATS
// Updates the 4 stat cards
// ================================

function updateStats(zone) {
  // Filter orders by zone
  const zoneOrders = DB.orders.filter(function (o) {
    return o.zone === zone;
  });

  // Count by status
  const pending = zoneOrders.filter(function (o) {
    return (
      o.status === "pending" || o.status === "urgent" || o.status === "new"
    );
  }).length;

  const inProgress = zoneOrders.filter(function (o) {
    return o.status === "in-progress";
  }).length;

  const ready = zoneOrders.filter(function (o) {
    return o.status === "ready";
  }).length;

  // Update the DOM
  document.getElementById("stat-pending").textContent = pending;
  document.getElementById("stat-inprogress").textContent = inProgress;
  document.getElementById("stat-ready").textContent = ready;
}

// ================================
// RENDER QUEUE
// Builds the order cards in screen 2
// ================================

function renderQueue(zone) {
  const container = document.getElementById("orders-list");

  // Filter by zone and current filter
  let filtered = DB.orders.filter(function (o) {
    return o.zone === zone;
  });

  if (currentFilter !== "all") {
    filtered = filtered.filter(function (o) {
      return o.status === currentFilter;
    });
  }

  // If no orders, show empty message
  if (filtered.length === 0) {
    container.innerHTML = `
            <div class="empty-message">
                <i class="fa-solid fa-check-circle" style="font-size:32px; margin-bottom:8px; display:block;"></i>
                No hay pedidos pendientes en esta zona
            </div>`;
    return;
  }

  // Build HTML for each order card
  container.innerHTML = filtered
    .map(function (order) {
      // Calculate progress
      const totalItems = order.items.length;
      const readyItems = order.items.filter(function (i) {
        return i.status === "ready";
      }).length;
      const progressPct = Math.round((readyItems / totalItems) * 100);

      // Status label
      const statusLabels = {
        urgent: "URGENTE",
        "in-progress": "EN PROCESO",
        new: "NUEVO",
        pending: "PENDIENTE",
      };
      const statusLabel =
        statusLabels[order.status] || order.status.toUpperCase();

      // Items text summary
      const itemsSummary = order.items
        .map(function (i) {
          return i.name + " x" + i.quantity;
        })
        .join(", ");

      // Notes (first item with notes)
      const itemWithNotes = order.items.find(function (i) {
        return i.notes;
      });
      const notesHTML = itemWithNotes
        ? `<div class="notes-tag">⚠ ${itemWithNotes.notes}</div>`
        : "";

      // Progress bar (only for in-progress)
      const progressHTML =
        order.status === "in-progress"
          ? `<div class="card-progress">
                   <div class="card-progress-fill" style="width: ${progressPct}%"></div>
               </div>
               <p class="card-progress-text">${readyItems}/${totalItems} items listos</p>`
          : "";

      return `
            <div class="order-card" onclick="viewDetail(${order.id})">
                <div class="order-card-header">
                    <div>
                        <p class="order-number">Orden #${String(order.id).padStart(4, "0")}</p>
                        <p class="order-mesa">Mesa ${order.table}</p>
                    </div>
                    <span class="order-ago">hace ${order.minutesAgo} min</span>
                </div>
                <p class="order-items-text">${itemsSummary}</p>
                <span class="status-tag ${order.status}">${statusLabel}</span>
                ${progressHTML}
                ${notesHTML}
                <p class="order-footer">
                    Mesa: ${order.table} | Mesero: ${order.waiter} | ${order.time}
                </p>
                <button class="detail-button" onclick="viewDetail(${order.id})">
                    Ver detalle →
                </button>
            </div>`;
    })
    .join("");
}

// ================================
// FILTER ORDERS
// Called when filter buttons are clicked
// ================================

function filterOrders(filter, button) {
  currentFilter = filter;

  // Update active button
  document.querySelectorAll(".filter-btn").forEach(function (btn) {
    btn.classList.remove("active");
  });
  button.classList.add("active");

  renderQueue(currentZone);
}

// ================================
// VIEW ORDER DETAIL
// Shows screen 3 with order info
// ================================

function viewDetail(orderId) {
  // Find the order
  currentOrder = DB.orders.find(function (o) {
    return o.id === orderId;
  });
  if (!currentOrder) return;

  // Update title
  document.getElementById("detail-title").textContent =
    `Orden #${String(currentOrder.id).padStart(4, "0")} · Mesa ${currentOrder.table}`;

  // Update breadcrumb
  document.getElementById("breadcrumb").textContent =
    `Xhimanut / Cola / Orden #${String(currentOrder.id).padStart(4, "0")}`;

  // Update status badge
  const statusLabels = {
    urgent: "URGENTE",
    "in-progress": "EN PROCESO",
    new: "NUEVO",
    pending: "PENDIENTE",
  };
  const badge = document.getElementById("detail-status");
  badge.textContent = statusLabels[currentOrder.status] || currentOrder.status;
  badge.className = `status-badge ${currentOrder.status}`;

  // Update time
  document.getElementById("detail-time").textContent =
    `Hace ${currentOrder.minutesAgo} minutos`;

  // Update right panel info
  document.getElementById("panel-table").textContent = currentOrder.table;
  document.getElementById("panel-waiter").textContent = currentOrder.waiter;
  document.getElementById("panel-time").textContent = currentOrder.time;
  document.getElementById("panel-elapsed").textContent =
    currentOrder.minutesAgo + " min";
  document.getElementById("panel-zone").textContent =
    currentOrder.zone === "kitchen" ? "Cocina" : "Bar";

  // Render items with checkboxes
  renderDetailItems();

  // Render other active orders in panel
  renderOtherOrders();

  showScreen("screen-detail");

  // Update nav
  document.getElementById("nav-detail").classList.add("active");
}

// ================================
// RENDER DETAIL ITEMS
// Builds item list with checkboxes
// ================================

function renderDetailItems() {
  const container = document.getElementById("detail-items");

  container.innerHTML = currentOrder.items
    .map(function (item, index) {
      const isReady = item.status === "ready";
      const notesHTML = item.notes
        ? `<div class="item-notes">⚠ ${item.notes}</div>`
        : "";
      const statusTag = isReady
        ? `<span class="item-status-tag completed">Completado</span>`
        : `<span class="item-status-tag pending">Pendiente</span>`;

      return `
            <div class="item-row">
                <input
                    type="checkbox"
                    class="item-checkbox"
                    ${isReady ? "checked" : ""}
                    onchange="toggleItem(${index}, this.checked)"
                >
                <div class="item-content">
                    <p class="item-name">${item.name} x${item.quantity}</p>
                    ${notesHTML}
                    ${statusTag}
                </div>
            </div>`;
    })
    .join("");

  updateProgress();
}

// ================================
// TOGGLE ITEM STATUS
// Called when a checkbox is clicked
// ================================

function toggleItem(itemIndex, isChecked) {
  // Update item status in DB
  currentOrder.items[itemIndex].status = isChecked ? "ready" : "pending";

  // If all items ready, update order status
  const allReady = currentOrder.items.every(function (i) {
    return i.status === "ready";
  });
  if (allReady) {
    currentOrder.status = "in-progress";
  }

  // Re-render items and progress
  renderDetailItems();
}

// ================================
// UPDATE PROGRESS BAR
// ================================

function updateProgress() {
  const total = currentOrder.items.length;
  const ready = currentOrder.items.filter(function (i) {
    return i.status === "ready";
  }).length;
  const percent = total > 0 ? Math.round((ready / total) * 100) : 0;

  document.getElementById("progress-text").textContent =
    `${ready}/${total} items`;
  document.getElementById("progress-percent").textContent =
    `${percent}% completado`;
  document.getElementById("progress-fill").style.width = percent + "%";
}

// ================================
// RENDER OTHER ORDERS
// Shows other active orders in the panel
// ================================

function renderOtherOrders() {
  const container = document.getElementById("other-orders-list");

  // Get other orders from the same zone
  const others = DB.orders.filter(function (o) {
    return o.zone === currentZone && o.id !== currentOrder.id;
  });

  if (others.length === 0) {
    container.innerHTML = `<p style="font-size:12px; color:#9ca3af;">No hay otras órdenes activas</p>`;
    return;
  }

  const statusLabels = {
    urgent: "Urgente",
    "in-progress": "En proceso",
    new: "Nuevo",
    pending: "Pendiente",
  };
  const statusClasses = {
    urgent: "urgent-text",
    "in-progress": "progress-text",
    new: "urgent-text",
    pending: "",
  };

  container.innerHTML = others
    .map(function (o) {
      return `
            <a href="#" class="other-order-link" onclick="viewDetail(${o.id}); return false;">
                Orden #${String(o.id).padStart(4, "0")} · Mesa ${o.table} ·
                <span class="${statusClasses[o.status] || ""}">
                    ${statusLabels[o.status] || o.status}
                </span>
            </a>`;
    })
    .join("");
}

// ================================
// MARK AS READY
// Called by "Marcar todo como LISTO" button
// ================================

function markAsReady() {
  // Mark all items as ready
  currentOrder.items.forEach(function (item) {
    item.status = "ready";
  });
  currentOrder.status = "ready";

  showConfirmation();
}

// ================================
// MARK PARTIAL
// Marks only checked items as ready
// ================================

function markPartial() {
  const anyReady = currentOrder.items.some(function (i) {
    return i.status === "ready";
  });

  if (!anyReady) {
    alert("Marca al menos un item como listo primero");
    return;
  }

  currentOrder.status = "in-progress";
  showConfirmation();
}

// ================================
// REPORT PROBLEM
// ================================

function reportProblem() {
  alert("Problema reportado. El mesero ha sido notificado.");
}

// ================================
// SHOW CONFIRMATION SCREEN
// ================================

function showConfirmation() {
  // Update confirmation title
  document.getElementById("confirm-title").textContent =
    `¡Orden #${String(currentOrder.id).padStart(4, "0")} lista para servir!`;

  // Update subtitle
  document.getElementById("confirm-subtitle").textContent =
    `El mesero ${currentOrder.waiter} ha sido notificado`;

  // Update order summary title
  document.getElementById("confirm-order-title").textContent =
    `Orden #${String(currentOrder.id).padStart(4, "0")} · Mesa ${currentOrder.table}`;

  // Update items list
  document.getElementById("confirm-items").innerHTML = currentOrder.items
    .map(function (item) {
      return `
                <div class="confirm-item">
                    <i class="fa-solid fa-circle-check"></i>
                    ${item.name} x${item.quantity}
                </div>`;
    })
    .join("");

  // Update prep time
  document.getElementById("confirm-time").innerHTML =
    `Tiempo de preparación: <strong>${currentOrder.minutesAgo + 2} minutos</strong>`;

  showScreen("screen-confirmation");
}

// ================================
// NEXT ORDER
// Goes back to queue and removes completed order
// ================================

function nextOrder() {
  // Remove completed order from DB
  DB.orders = DB.orders.filter(function (o) {
    return o.id !== currentOrder.id;
  });

  currentOrder = null;
  currentFilter = "all";

  // Reset filter buttons
  document.querySelectorAll(".filter-btn").forEach(function (btn) {
    btn.classList.remove("active");
  });
  document.querySelector(".filter-btn").classList.add("active");

  updateStats(currentZone);
  updateZoneBadges();
  renderQueue(currentZone);
  showScreen("screen-queue");
}

// ================================
// GO BACK TO QUEUE
// ================================

function goBackToQueue() {
  currentOrder = null;
  renderQueue(currentZone);
  showScreen("screen-queue");
}
