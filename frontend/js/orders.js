document.addEventListener('DOMContentLoaded', async () => {
  const orderTableBody = document.getElementById('orderTableBody');
  const statusFilter = document.getElementById('statusFilter');
  const orderSearch = document.getElementById('orderSearch');

  let currentOrders = [];

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
