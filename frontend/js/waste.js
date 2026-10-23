document.addEventListener('DOMContentLoaded', async () => {
  const wasteForm = document.getElementById('wasteForm');
  const wasteTableBody = document.getElementById('wasteTableBody');
  const wasteSummary = document.getElementById('wasteSummary');
  const showWasteForm = document.getElementById('showWasteForm');

  let currentWaste = [];

  function renderSummary(summary) {
    wasteSummary.innerHTML = `
      <div class="summary-card">
        <span class="label">Total Waste</span>
        <div class="value"><strong>${summary.totalWaste}</strong><span class="trend">kg</span></div>
      </div>
      <div class="summary-card">
        <span class="label">Estimated Loss</span>
        <div class="value"><strong>${formatCurrency(summary.totalLoss)}</strong><span class="trend">₹</span></div>
      </div>
      <div class="summary-card">
        <span class="label">Waste Records</span>
        <div class="value"><strong>${currentWaste.length}</strong><span class="trend">entries</span></div>
      </div>
    `;
  }

  function renderWaste(items) {
    wasteTableBody.innerHTML = items.length
      ? items
          .map(
            (item) => `
              <tr>
                <td>${item.ingredient_name}</td>
                <td>${item.quantity}</td>
                <td>${item.reason}</td>
                <td>${formatDate(item.waste_date)}</td>
                <td>${formatCurrency(item.estimated_loss)}</td>
              </tr>
            `
          )
          .join('')
      : '<tr><td colspan="5" class="empty-state">No waste records available.</td></tr>';
  }

  async function loadWaste() {
    try {
      const response = await apiFetch('/waste');
      currentWaste = response.waste;
      renderSummary(response.summary);
      renderWaste(currentWaste);
    } catch (error) {
      redirectIfUnauthenticated(error);
      showToast(error.message, 'error');
    }
  }

  showWasteForm.addEventListener('click', () => {
    wasteForm.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });

  wasteForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const payload = {
      ingredient_name: document.getElementById('wasteIngredient').value.trim(),
      quantity: Number(document.getElementById('wasteQuantity').value),
      reason: document.getElementById('wasteReason').value.trim(),
      estimated_loss: Number(document.getElementById('wasteLoss').value),
    };

    try {
      await apiFetch('/waste', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      showToast('Waste record saved');
      wasteForm.reset();
      await loadWaste();
    } catch (error) {
      showToast(error.message, 'error');
    }
  });

  await loadWaste();
});
