document.addEventListener('DOMContentLoaded', async () => {
  const orderTableBody = document.getElementById('orderTableBody');
  const statusFilter = document.getElementById('statusFilter');
  const orderSearch = document.getElementById('orderSearch');
  const addFoodOrderButton = document.getElementById('addFoodOrderButton');
  const foodOrderDialog = document.getElementById('foodOrderDialog');
  const foodOrderForm = document.getElementById('foodOrderForm');
  const foodOrderCustomer = document.getElementById('foodOrderCustomer');
  const orderItemList = document.getElementById('orderItemList');
  const foodOrderTotal = document.getElementById('foodOrderTotal');
  const addOrderItemButton = document.getElementById('addOrderItemButton');

  let currentOrders = [];
  let customers = [];
  let menuItems = [];

  function escapeHTML(value) {
    return String(value ?? '').replace(/[&<>"']/g, (character) => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;',
    })[character]);
  }

  function getItemSummary(items) {
    if (Array.isArray(items)) {
      return items.map((item) => `${item.name || `Item ${item.food_item_id}`} x ${item.quantity}`).join(', ');
    }
    return items || '—';
  }

  function renderOrders(items) {
    if (!orderTableBody) return;

    orderTableBody.innerHTML = items.length
      ? items
          .map(
            (order) => `
              <tr>
                <td>#${order.id}</td>
                <td>${escapeHTML(order.customer_name || order.customer?.name || 'Walk in')}</td>
                <td>${escapeHTML(getItemSummary(order.items))}</td>
                <td>${Array.isArray(order.items) ? order.items.reduce((sum, item) => sum + Number(item.quantity || 0), 0) : 1}</td>
                <td>${formatCurrency(order.total_amount)}</td>
                <td>${formatDate(order.order_date)}</td>
                <td><span class="badge ${order.payment_status === 'Paid' ? 'success' : 'warning'}">${escapeHTML(order.payment_status)}</span></td>
                <td>
                  <select class="status-select" data-order-id="${order.id}">
                    <option value="Pending" ${order.order_status === 'Pending' ? 'selected' : ''}>Pending</option>
                    <option value="Preparing" ${order.order_status === 'Preparing' ? 'selected' : ''}>Preparing</option>
                    <option value="Ready" ${order.order_status === 'Ready' ? 'selected' : ''}>Ready</option>
                    <option value="Completed" ${order.order_status === 'Completed' ? 'selected' : ''}>Completed</option>
                    <option value="Cancelled" ${order.order_status === 'Cancelled' ? 'selected' : ''}>Cancelled</option>
                  </select>
                </td>
                <td><button type="button" class="link-button" data-action="view" data-order-id="${order.id}">View</button></td>
              </tr>
            `
          )
          .join('')
      : '<tr><td colspan="9" class="empty-state">No orders found.</td></tr>';
  }

  function renderOrderItems() {
    const rows = [...orderItemList.querySelectorAll('.order-item-row')];
    let total = 0;

    rows.forEach((row) => {
      const select = row.querySelector('.order-item-select');
      const quantityInput = row.querySelector('.order-item-quantity');
      const item = menuItems.find((entry) => entry.id === Number(select.value));
      const quantity = Number(quantityInput.value) || 0;
      if (item) total += Number(item.price) * quantity;
      row.querySelector('.order-item-price').textContent = formatCurrency(item ? item.price * quantity : 0);
    });

    foodOrderTotal.textContent = formatCurrency(total);
  }

  function addOrderItemRow() {
    const row = document.createElement('div');
    row.className = 'order-item-row';
    row.innerHTML = `
      <label>
        <span>Food item</span>
        <select class="order-item-select" required>
          ${menuItems.map((item) => `<option value="${item.id}">${escapeHTML(item.name)} — ${formatCurrency(item.price)}</option>`).join('')}
        </select>
      </label>
      <label>
        <span>Quantity</span>
        <input class="order-item-quantity" type="number" min="1" step="1" value="1" required />
      </label>
      <strong class="order-item-price"></strong>
      <button class="link-button remove-order-item" type="button" aria-label="Remove food item">Remove</button>
    `;
    orderItemList.appendChild(row);
    renderOrderItems();
  }

  async function openFoodOrderDialog() {
    addFoodOrderButton.disabled = true;
    try {
      const [customerResponse, menuResponse] = await Promise.all([
        apiFetch('/customers'),
        apiFetch('/menu'),
      ]);
      customers = customerResponse.customers;
      menuItems = menuResponse.items.filter((item) => item.available);
      if (!customers.length || !menuItems.length) {
        throw new Error('Add a customer and an available food item before creating an order.');
      }

      foodOrderCustomer.innerHTML = customers
        .map((customer) => `<option value="${customer.id}">${escapeHTML(customer.name)} (${escapeHTML(customer.phone)})</option>`)
        .join('');
      orderItemList.innerHTML = '';
      addOrderItemRow();
      foodOrderDialog.showModal();
    } catch (error) {
      redirectIfUnauthenticated(error);
      showToast(error.message, 'error');
    } finally {
      addFoodOrderButton.disabled = false;
    }
  }

  async function loadOrders() {
    try {
      const response = await apiFetch(`/orders?status=${statusFilter.value}`);
      currentOrders = response.orders;
      renderOrders(currentOrders);
    } catch (error) {
      currentOrders = [];
      renderOrders([]);
      redirectIfUnauthenticated(error);
      showToast(error.message, 'error');
    }
  }

  addFoodOrderButton.addEventListener('click', openFoodOrderDialog);
  addOrderItemButton.addEventListener('click', addOrderItemRow);
  foodOrderDialog.addEventListener('click', (event) => {
    if (event.target === foodOrderDialog || event.target.closest('[data-close-order-dialog]')) {
      foodOrderDialog.close();
    }
  });

  orderItemList.addEventListener('input', renderOrderItems);
  orderItemList.addEventListener('change', renderOrderItems);
  orderItemList.addEventListener('click', (event) => {
    const removeButton = event.target.closest('.remove-order-item');
    if (!removeButton) return;
    const rows = orderItemList.querySelectorAll('.order-item-row');
    if (rows.length === 1) {
      showToast('An order must contain at least one food item.', 'error');
      return;
    }
    removeButton.closest('.order-item-row').remove();
    renderOrderItems();
  });

  foodOrderForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const submitButton = foodOrderForm.querySelector('[type="submit"]');
    const items = [...orderItemList.querySelectorAll('.order-item-row')].map((row) => ({
      food_item_id: Number(row.querySelector('.order-item-select').value),
      quantity: Number(row.querySelector('.order-item-quantity').value),
    }));

    submitButton.disabled = true;
    try {
      const response = await apiFetch('/orders', {
        method: 'POST',
        body: JSON.stringify({
          customerId: Number(foodOrderCustomer.value),
          items,
        }),
      });
      foodOrderDialog.close();
      showToast(response.message || 'Food order saved.');
      await loadOrders();
    } catch (error) {
      showToast(error.message, 'error');
    } finally {
      submitButton.disabled = false;
    }
  });

  statusFilter.addEventListener('change', loadOrders);

  orderSearch.addEventListener('input', (event) => {
    const query = event.target.value.trim().toLowerCase();
    const filtered = currentOrders.filter((order) => {
      return (
        String(order.id).includes(query) ||
        (order.customer_name || '').toLowerCase().includes(query) ||
        getItemSummary(order.items).toLowerCase().includes(query)
      );
    });
    renderOrders(filtered);
  });

  orderTableBody.addEventListener('change', async (event) => {
    const select = event.target.closest('.status-select');
    if (!select) return;

    const orderId = Number(select.dataset.orderId);
    const nextStatus = select.value;

    try {
      await apiFetch(`/orders/${orderId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status: nextStatus }),
      });
      showToast(`Order #${orderId} marked as ${nextStatus}`);
      await loadOrders();
    } catch (error) {
      showToast(error.message, 'error');
    }
  });

  orderTableBody.addEventListener('click', async (event) => {
    const button = event.target.closest('[data-action="view"]');
    if (!button) return;
    const order = currentOrders.find((entry) => entry.id === Number(button.dataset.orderId));
    if (!order) return;
    alert(`Order #${order.id}\nCustomer: ${order.customer_name}\nItems: ${getItemSummary(order.items)}\nTotal: ${formatCurrency(order.total_amount)}\nStatus: ${order.order_status}`);
  });

  await loadOrders();
});
