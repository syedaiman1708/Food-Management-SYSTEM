document.addEventListener('DOMContentLoaded', async () => {
  const ingredientForm = document.getElementById('ingredientForm');
  const inventoryTableBody = document.getElementById('inventoryTableBody');
  const inventorySearch = document.getElementById('inventorySearch');
  const showIngredientForm = document.getElementById('showIngredientForm');
  const cancelIngredientEdit = document.getElementById('cancelIngredientEdit');

  let currentIngredients = [];
  function renderInventory(items) {
    inventoryTableBody.innerHTML = items.length
      ? items
          .map(
            (item) => `
              <tr>
                <td>${item.name}</td>
                <td>${item.category}</td>
                <td>${item.quantity}</td>
                <td>${item.unit}</td>
                <td>${item.minimum_threshold}</td>
                <td>${item.supplier_id || 'N/A'}</td>
                <td>${formatDate(item.expiry_date)}</td>
                <td><span class="badge ${item.status === 'Low Stock' ? 'warning' : item.status === 'Critical' ? 'danger' : 'success'}">${item.status}</span></td>
                <td>
                  <div class="menu-actions">
                    <button type="button" class="link-button" data-action="edit" data-id="${item.id}">Edit</button>
                    <button type="button" class="link-button" data-action="restock" data-id="${item.id}">Restock</button>
                  </div>
                </td>
              </tr>
            `
          )
          .join('')
      : '<tr><td colspan="9" class="empty-state">No ingredients found.</td></tr>';
  }

  async function loadInventory() {
    try {
      const response = await apiFetch('/inventory');
      currentIngredients = response.ingredients;
      renderInventory(currentIngredients);
    } catch (error) {
      currentIngredients = [];
      renderInventory([]);
      redirectIfUnauthenticated(error);
      showToast(error.message, 'error');
    }
  }

  inventorySearch.addEventListener('input', (event) => {
    const query = event.target.value.trim().toLowerCase();
    const filtered = currentIngredients.filter((item) => item.name.toLowerCase().includes(query) || item.category.toLowerCase().includes(query));
    renderInventory(filtered);
  });

  showIngredientForm.addEventListener('click', () => {
    ingredientForm.reset();
    document.getElementById('ingredientId').value = '';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  cancelIngredientEdit.addEventListener('click', () => {
    ingredientForm.reset();
    document.getElementById('ingredientId').value = '';
  });

  ingredientForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const payload = {
      name: document.getElementById('ingredientName').value.trim(),
      category: document.getElementById('ingredientCategory').value.trim(),
      quantity: Number(document.getElementById('ingredientQty').value),
      unit: document.getElementById('ingredientUnit').value.trim(),
      minimum_threshold: Number(document.getElementById('ingredientThreshold').value),
      supplier_id: Number(document.getElementById('ingredientSupplier').value),
      expiry_date: document.getElementById('ingredientExpiry').value,
    };
    const ingredientId = document.getElementById('ingredientId').value;

    try {
      await apiFetch(ingredientId ? `/inventory/${ingredientId}` : '/inventory', {
        method: ingredientId ? 'PATCH' : 'POST',
        body: JSON.stringify(payload),
      });
      showToast(ingredientId ? 'Ingredient updated' : 'Ingredient added');
      ingredientForm.reset();
      document.getElementById('ingredientId').value = '';
      await loadInventory();
    } catch (error) {
      showToast(error.message, 'error');
    }
  });

  inventoryTableBody.addEventListener('click', async (event) => {
    const button = event.target.closest('[data-action]');
    const action = button?.dataset.action;
    const id = Number(button?.dataset.id);
    if (!action || !id) return;

    const ingredient = currentIngredients.find((item) => item.id === id);
    if (!ingredient) return;

    if (action === 'edit') {
      document.getElementById('ingredientId').value = ingredient.id;
      document.getElementById('ingredientName').value = ingredient.name;
      document.getElementById('ingredientCategory').value = ingredient.category;
      document.getElementById('ingredientQty').value = ingredient.quantity;
      document.getElementById('ingredientUnit').value = ingredient.unit;
      document.getElementById('ingredientThreshold').value = ingredient.minimum_threshold;
      document.getElementById('ingredientSupplier').value = ingredient.supplier_id || '';
      document.getElementById('ingredientExpiry').value = ingredient.expiry_date || '';
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    if (action === 'restock') {
      const qty = Number(window.prompt('Enter restock quantity:', '10'));
      if (!qty || qty <= 0) return;
      const unitPrice = Number(window.prompt('Enter unit price (₹):', '0')) || 0;

      try {
        await apiFetch(`/inventory/${id}/restock`, {
          method: 'PATCH',
          body: JSON.stringify({ quantity: qty, unit_price: unitPrice }),
        });
        showToast('Inventory restocked');
        await loadInventory();
      } catch (error) {
        showToast(error.message, 'error');
      }
    }
  });

  await loadInventory();
});
