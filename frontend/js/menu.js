document.addEventListener('DOMContentLoaded', async () => {
  const menuGrid = document.getElementById('menuGrid');
  const menuForm = document.getElementById('menuForm');
  const menuCategory = document.getElementById('menuCategory');
  const menuSearch = document.getElementById('menuSearch');
  const showAddForm = document.getElementById('showAddForm');
  const cancelEdit = document.getElementById('cancelMenuEdit');

  let currentItems = [];

  function populateCategories(categories) {
    menuCategory.innerHTML = categories
      .map((category) => `<option value="${category.id}">${category.name}</option>`)
      .join('');
  }

  function renderMenu(items) {
    menuGrid.innerHTML = items.length
      ? items
          .map(
            (item) => `
              <article class="menu-item-card">
                <img src="${item.image || 'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=900&q=80'}" alt="${item.name}" />
                <div class="menu-item-body">
                  <div class="menu-item-meta">
                    <span class="badge ${item.available ? 'success' : 'neutral'}">${item.available ? 'Available' : 'Unavailable'}</span>
                    <strong>${formatCurrency(item.price)}</strong>
                  </div>
                  <h3>${item.name}</h3>
                  <p>${item.category}</p>
                  <p>${item.description}</p>
                  <div class="menu-actions">
                    <button type="button" class="link-button" data-action="edit" data-id="${item.id}">Edit</button>
                    <button type="button" class="link-button" data-action="delete" data-id="${item.id}">Delete</button>
                  </div>
                </div>
              </article>
            `
          )
          .join('')
      : '<div class="empty-state full-span">No menu items found.</div>';
  }

  async function loadMenu() {
    try {
      const response = await apiFetch('/menu');
      currentItems = response.items;
      populateCategories(response.categories);
      renderMenu(currentItems);
    } catch (error) {
      redirectIfUnauthenticated(error);
      showToast(error.message, 'error');
    }
  }

  menuSearch.addEventListener('input', (event) => {
    const searchValue = event.target.value.trim().toLowerCase();
    const filtered = currentItems.filter((item) => {
      return item.name.toLowerCase().includes(searchValue) || item.category.toLowerCase().includes(searchValue);
    });
    renderMenu(filtered);
  });

  showAddForm.addEventListener('click', () => {
    menuForm.reset();
    document.getElementById('menuId').value = '';
    document.getElementById('menuAvailable').checked = true;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  cancelEdit.addEventListener('click', () => {
    menuForm.reset();
    document.getElementById('menuId').value = '';
    document.getElementById('menuAvailable').checked = true;
  });

  menuForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    const payload = {
      name: document.getElementById('menuName').value.trim(),
      category_id: Number(document.getElementById('menuCategory').value),
      description: document.getElementById('menuDescription').value.trim(),
      price: Number(document.getElementById('menuPrice').value),
      image: document.getElementById('menuImage').value.trim() || undefined,
      available: document.getElementById('menuAvailable').checked,
    };

    const itemId = document.getElementById('menuId').value;

    try {
      if (itemId) {
        await apiFetch(`/menu/${itemId}`, {
          method: 'PUT',
          body: JSON.stringify(payload),
        });
        showToast('Food item updated');
      } else {
        await apiFetch('/menu', {
          method: 'POST',
          body: JSON.stringify(payload),
        });
        showToast('Food item added');
      }

      menuForm.reset();
      document.getElementById('menuId').value = '';
      document.getElementById('menuAvailable').checked = true;
      await loadMenu();
    } catch (error) {
      showToast(error.message, 'error');
    }
  });

  menuGrid.addEventListener('click', async (event) => {
    const action = event.target.dataset.action;
    const id = Number(event.target.dataset.id);
    if (!action || !id) return;

    const item = currentItems.find((entry) => entry.id === id);
    if (!item) return;

    if (action === 'edit') {
      document.getElementById('menuId').value = item.id;
      document.getElementById('menuName').value = item.name;
      document.getElementById('menuCategory').value = item.category_id;
      document.getElementById('menuPrice').value = item.price;
      document.getElementById('menuImage').value = item.image || '';
      document.getElementById('menuDescription').value = item.description;
      document.getElementById('menuAvailable').checked = item.available;
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    if (action === 'delete') {
      const confirmed = window.confirm(`Delete ${item.name}?`);
      if (!confirmed) return;

      try {
        await apiFetch(`/menu/${id}`, { method: 'DELETE' });
        showToast('Food item deleted');
        await loadMenu();
      } catch (error) {
        showToast(error.message, 'error');
      }
    }
  });

  await loadMenu();
});
