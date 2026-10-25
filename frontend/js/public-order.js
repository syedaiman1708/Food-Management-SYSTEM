document.addEventListener('DOMContentLoaded', async () => {
  const publicMenu = document.getElementById('publicMenu');
  const cartItems = document.getElementById('cartItems');
  const cartTotal = document.getElementById('cartTotal');
  const checkoutForm = document.getElementById('checkoutForm');
  const orderPhone = document.getElementById('orderPhone');
  const placeOrderButton = document.getElementById('placeOrderButton');
  const orderConfirmation = document.getElementById('orderConfirmation');

  let menuItems = [];
  const cart = new Map();

  function escapeHTML(value) {
    return String(value ?? '').replace(/[&<>"']/g, (character) => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;',
    })[character]);
  }

  function renderMenu() {
    publicMenu.innerHTML = menuItems.length
      ? menuItems.map((item) => `
          <article class="public-menu-card">
            <img src="${escapeHTML(item.image || '')}" alt="${escapeHTML(item.name)}" loading="lazy" />
            <div class="public-menu-card-body">
              <div class="menu-meta">
                <span>${escapeHTML(item.category)}</span>
                <strong>${escapeHTML(formatCurrency(item.price))}</strong>
              </div>
              <h3>${escapeHTML(item.name)}</h3>
              <p>${escapeHTML(item.description)}</p>
              <button class="btn btn-primary" type="button" data-add-item="${Number(item.id)}">Add to order</button>
            </div>
          </article>
        `).join('')
      : '<p class="empty-state full-span">There are no menu items available right now.</p>';
  }

  function renderCart() {
    const selectedItems = [...cart.entries()]
      .map(([id, quantity]) => ({ item: menuItems.find((entry) => entry.id === id), quantity }))
      .filter((entry) => entry.item);
    const total = selectedItems.reduce((sum, entry) => sum + Number(entry.item.price) * entry.quantity, 0);

    cartItems.innerHTML = selectedItems.length
      ? selectedItems.map(({ item, quantity }) => `
          <div class="public-cart-row">
            <div>
              <strong>${escapeHTML(item.name)}</strong>
              <span>${escapeHTML(formatCurrency(item.price))} each</span>
            </div>
            <div class="cart-quantity">
              <button type="button" data-cart-action="decrease" data-item-id="${item.id}" aria-label="Remove one ${escapeHTML(item.name)}">−</button>
              <span>${quantity}</span>
              <button type="button" data-cart-action="increase" data-item-id="${item.id}" aria-label="Add one ${escapeHTML(item.name)}">+</button>
            </div>
          </div>
        `).join('')
      : '<p class="empty-state">Your order is empty. Add a dish to get started.</p>';

    cartTotal.textContent = formatCurrency(total);
    placeOrderButton.disabled = selectedItems.length === 0;
  }

  publicMenu.addEventListener('click', (event) => {
    const button = event.target.closest('[data-add-item]');
    if (!button) return;

    const itemId = Number(button.dataset.addItem);
    cart.set(itemId, Math.min((cart.get(itemId) || 0) + 1, 99));
    orderConfirmation.hidden = true;
    renderCart();
    showToast('Added to your order');
  });

  cartItems.addEventListener('click', (event) => {
    const button = event.target.closest('[data-cart-action]');
    if (!button) return;

    const itemId = Number(button.dataset.itemId);
    const quantity = cart.get(itemId) || 0;
    if (button.dataset.cartAction === 'decrease' && quantity <= 1) {
      cart.delete(itemId);
    } else if (button.dataset.cartAction === 'decrease') {
      cart.set(itemId, quantity - 1);
    } else if (quantity < 99) {
      cart.set(itemId, quantity + 1);
    }
    renderCart();
  });

  orderPhone.addEventListener('input', () => {
    orderPhone.value = orderPhone.value.replace(/\D/g, '').slice(0, 10);
  });

  checkoutForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const items = [...cart.entries()].map(([food_item_id, quantity]) => ({ food_item_id, quantity }));
    if (!items.length) {
      showToast('Add at least one dish to your order.', 'error');
      return;
    }

    placeOrderButton.disabled = true;
    try {
      const response = await apiFetch('/orders/public', {
        method: 'POST',
        body: JSON.stringify({
          name: document.getElementById('orderName').value.trim(),
          phone: orderPhone.value,
          items,
        }),
      });
      cart.clear();
      checkoutForm.reset();
      renderCart();
      orderConfirmation.textContent = `Order #${response.order.id} placed successfully. Your total is ${formatCurrency(response.order.total_amount)}.`;
      orderConfirmation.hidden = false;
      showToast(response.message || 'Your order has been placed.');
    } catch (error) {
      showToast(error.message, 'error');
    } finally {
      renderCart();
    }
  });

  renderCart();
  try {
    const response = await apiFetch('/menu/public');
    menuItems = response.items;
    renderMenu();
  } catch (error) {
    publicMenu.innerHTML = `<p class="empty-state full-span">${escapeHTML(error.message)}</p>`;
  }
});
