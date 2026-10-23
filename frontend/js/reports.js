document.addEventListener('DOMContentLoaded', async () => {
  const reportCards = document.getElementById('reportCards');
  const bestSellingList = document.getElementById('bestSellingList');
  const downloadCsv = document.getElementById('downloadCsv');
  const period = document.getElementById('reportPeriod');
  const canvas = document.getElementById('reportChart');
  let salesChart;

  async function loadReports() {
    try {
      const data = await apiFetch(`/reports/summary?days=${period.value}`);

      reportCards.innerHTML = `
      <article class="summary-card">
        <span class="label">Total Revenue</span>
        <div class="value"><strong>${formatCurrency(data.totalRevenue)}</strong><span class="trend">All-time paid sales</span></div>
      </article>
      <article class="summary-card">
        <span class="label">Orders</span>
        <div class="value"><strong>${data.totalOrders}</strong><span class="trend">${data.paidOrders} paid</span></div>
      </article>
      <article class="summary-card">
        <span class="label">Average Paid Order</span>
        <div class="value"><strong>${formatCurrency(data.averageOrderValue)}</strong><span class="trend">per paid order</span></div>
      </article>
      <article class="summary-card">
        <span class="label">Low-Stock Alerts</span>
        <div class="value"><strong>${data.lowStockCount}</strong><span class="trend">items</span></div>
      </article>
      <article class="summary-card">
        <span class="label">Waste Impact</span>
        <div class="value"><strong>${formatCurrency(data.wasteImpact)}</strong><span class="trend">loss</span></div>
      </article>
    `;

      if (canvas && typeof Chart === 'function') {
        if (salesChart) salesChart.destroy();
        salesChart = new Chart(canvas, {
          type: 'bar',
          data: {
            labels: data.dailySales.map((item) => item.label),
            datasets: [{
              label: 'Paid sales',
              data: data.dailySales.map((item) => item.value),
              backgroundColor: data.dailySales.map((_, index) => ['#178653', '#2aa56c', '#ff9f1c'][index % 3]),
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
        canvas.insertAdjacentHTML('afterend', '<p class="empty-state chart-fallback">Report chart is unavailable. Check your internet connection and refresh.</p>');
      }

      bestSellingList.innerHTML = data.bestSelling.items.length
        ? data.bestSelling.items
            .map(
              (item) => `
          <div class="list-item">
            <div>
              <strong>${item.name}</strong>
              <div class="badge neutral">${item.quantity} sold · ${item.orders} paid orders</div>
            </div>
            <span>${formatCurrency(item.revenue)}</span>
          </div>
        `
            )
            .join('')
        : '<div class="empty-state">No paid menu-item sales yet.</div>';
    } catch (error) {
      redirectIfUnauthenticated(error);
      showToast(error.message, 'error');
    }
  }

  period.addEventListener('change', loadReports);

  if (downloadCsv) {
    downloadCsv.addEventListener('click', async () => {
      try {
        const csv = await apiFetch('/reports/export');
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'foodnest_sales_report.csv';
        link.click();
        URL.revokeObjectURL(url);
      } catch (error) {
        redirectIfUnauthenticated(error);
        showToast(error.message, 'error');
      }
    });
  }

  await loadReports();
});
