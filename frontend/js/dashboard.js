document.addEventListener('DOMContentLoaded', async () => {
  const period = document.getElementById('dashboardPeriod');
  const canvas = document.getElementById('salesChart');
  let salesChart;

  async function loadDashboard() {
    try {
      const data = await apiFetch(`/dashboard/summary?days=${period.value}`);

      const cards = [
        { label: 'Total Orders', value: data.totalOrders, detail: `${data.paidOrders} paid orders` },
        { label: 'Paid Revenue', value: formatCurrency(data.revenue), detail: 'All-time, excludes cancelled' },
        { label: 'Active Menu Items', value: data.activeMenuItems, detail: 'Available dishes' },
        { label: 'Low-Stock Ingredients', value: data.lowStockIngredients, detail: 'Needs restock' },
        { label: 'Food Waste Cost', value: formatCurrency(data.wasteCost), detail: 'All-time estimated loss' },
      ];

      const summaryCards = document.getElementById('summaryCards');
      summaryCards.innerHTML = cards
        .map(
          (card) => `
          <article class="summary-card">
            <span class="label">${card.label}</span>
            <div class="value">
              <strong>${card.value}</strong>
              <span class="trend">${card.detail}</span>
            </div>
          </article>
        `
        )
        .join('');

      if (canvas && typeof Chart === 'function') {
        if (salesChart) salesChart.destroy();
        salesChart = new Chart(canvas, {
          type: 'line',
          data: {
            labels: data.weeklySales.map((item) => item.label),
            datasets: [{
              label: 'Paid sales',
              data: data.weeklySales.map((item) => item.value),
              borderColor: '#178653',
              backgroundColor: 'rgba(23, 134, 83, 0.12)',
              borderWidth: 3,
              tension: 0.35,
              fill: true,
              pointRadius: 3,
              pointHoverRadius: 6,
            }],
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
              x: {
                grid: { display: false },
                ticks: { autoSkip: true, maxTicksLimit: 8, maxRotation: 0 },
              },
              y: {
                beginAtZero: true,
                ticks: {
                  maxTicksLimit: 6,
                  callback: (value) => `₹${new Intl.NumberFormat('en-IN').format(value)}`,
                },
              },
            },
          },
        });
      } else if (canvas && !canvas.nextElementSibling?.classList.contains('chart-fallback')) {
        canvas.insertAdjacentHTML('afterend', '<p class="empty-state chart-fallback">Sales chart is unavailable. Check your internet connection and refresh.</p>');
      }

      const popularFoods = document.getElementById('popularFoods');
      if (popularFoods) {
        popularFoods.innerHTML = data.popularFoods.length
          ? data.popularFoods
              .map(
                (item) => `
            <div class="list-item">
              <div>
                <strong>${item.name}</strong>
                <div class="badge neutral">${item.quantity} sold · ${item.orders} orders</div>
              </div>
              <span>${formatCurrency(item.revenue)}</span>
            </div>
          `
              )
              .join('')
          : '<div class="empty-state">No paid menu-item sales yet.</div>';
      }

      const recentOrdersTable = document.getElementById('recentOrdersTable');
      if (recentOrdersTable) {
        recentOrdersTable.innerHTML = data.recentOrders.length
          ? data.recentOrders
              .map(
                (order) => `
            <tr>
              <td>#${order.id}</td>
              <td>${order.customer}</td>
              <td>${formatCurrency(order.amount)}</td>
              <td><span class="badge ${order.status === 'Completed' ? 'success' : order.status === 'Preparing' ? 'warning' : 'neutral'}">${order.status}</span></td>
            </tr>
          `
              )
              .join('')
          : '<tr><td colspan="4" class="empty-state">No orders yet.</td></tr>';
      }

      const lowStockList = document.getElementById('lowStockList');
      if (lowStockList) {
        lowStockList.innerHTML = data.lowStockAlerts.length
          ? data.lowStockAlerts
              .map(
                (item) => `
                <div class="list-item">
                  <div>
                    <strong>${item.name}</strong>
                    <div class="badge warning">Only ${item.quantity} ${item.unit}</div>
                  </div>
                  <span>Min ${item.threshold}</span>
                </div>
              `
              )
              .join('')
          : '<div class="empty-state">No low-stock alerts.</div>';
      }

      const expiringList = document.getElementById('expiringList');
      if (expiringList) {
        expiringList.innerHTML = data.expiringIngredients.length
          ? data.expiringIngredients
              .map(
                (item) => `
                <div class="list-item">
                  <div>
                    <strong>${item.name}</strong>
                    <div class="badge danger">Expiring ${formatDate(item.expiry)}</div>
                  </div>
                  <span>${item.quantity} ${item.unit}</span>
                </div>
              `
              )
              .join('')
          : '<div class="empty-state">No ingredients nearing expiry.</div>';
      }

      const activityList = document.getElementById('activityList');
      if (activityList) {
        activityList.innerHTML = data.recentActivity.length
          ? data.recentActivity
              .map(
                (item) => `
            <div class="list-item">
              <div>
                <strong>${item.action}</strong>
                <div class="badge neutral">${item.actor}</div>
              </div>
              <span>${formatDate(item.time)}</span>
            </div>
          `
              )
              .join('')
          : '<div class="empty-state">No recent activity.</div>';
      }
    } catch (error) {
      redirectIfUnauthenticated(error);
      showToast(error.message, 'error');
    }
  }

  period.addEventListener('change', loadDashboard);
  await loadDashboard();
});
