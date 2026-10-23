document.addEventListener('DOMContentLoaded', async () => {
  const customerTableBody = document.getElementById('customerTableBody');
  const customerSearch = document.getElementById('customerSearch');
  const addCustomerButton = document.getElementById('addCustomerButton');
  const customerDialog = document.getElementById('customerDialog');
  const customerDialogTitle = document.getElementById('customerDialogTitle');
  const customerForm = document.getElementById('customerForm');
  const customerDetails = document.getElementById('customerDetails');

  let currentCustomers = [];

  function escapeHTML(value) {
    return String(value ?? '').replace(/[&<>"']/g, (character) => {
      const entities = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;',
      };
      return entities[character];
    });
  }

  function renderCustomers(customers) {
    customerTableBody.innerHTML = customers.length
      ? customers
          .map(
            (customer) => `
              <tr>
                <td>${escapeHTML(customer.name)}</td>
                <td>${escapeHTML(customer.email)}<br>${escapeHTML(customer.phone)}</td>
                <td>${Number(customer.totalOrders) || 0}</td>
                <td>${formatCurrency(customer.totalSpent)}</td>
                <td><button type="button" class="link-button" data-action="view" data-customer-id="${Number(customer.id)}">View</button></td>
              </tr>
            `
          )
          .join('')
      : '<tr><td colspan="5" class="empty-state">No customers found.</td></tr>';
  }

  async function loadCustomers() {
    try {
      const response = await apiFetch('/customers');
      currentCustomers = response.customers;
      renderCustomers(currentCustomers);
      return true;
    } catch (error) {
      redirectIfUnauthenticated(error);
      showToast(error.message, 'error');
      return false;
    }
  }

  function openCustomerDialog(mode, customer) {
    customerForm.reset();
    customerDetails.innerHTML = '';
    customerForm.hidden = mode === 'view';
    customerDetails.hidden = mode !== 'view';

    if (mode === 'view') {
      customerDialogTitle.textContent = customer.name;
      customerDetails.innerHTML = `
        <div><dt>Email</dt><dd>${escapeHTML(customer.email)}</dd></div>
        <div><dt>Phone</dt><dd>${escapeHTML(customer.phone)}</dd></div>
        <div><dt>Total orders</dt><dd>${Number(customer.totalOrders) || 0}</dd></div>
        <div><dt>Total spent</dt><dd>${escapeHTML(formatCurrency(customer.totalSpent))}</dd></div>
      `;
    } else {
      customerDialogTitle.textContent = 'Add customer';
    }

    customerDialog.showModal();
  }

  addCustomerButton.addEventListener('click', () => openCustomerDialog('add'));

  customerDialog.addEventListener('click', (event) => {
    if (event.target === customerDialog || event.target.closest('[data-close-dialog]')) {
      customerDialog.close();
    }
  });

  customerTableBody.addEventListener('click', (event) => {
    const button = event.target.closest('[data-action="view"]');
    if (!button) return;

    const customer = currentCustomers.find((entry) => entry.id === Number(button.dataset.customerId));
    if (customer) openCustomerDialog('view', customer);
  });

  customerSearch.addEventListener('input', (event) => {
    const query = event.target.value.trim().toLowerCase();
    const filtered = currentCustomers.filter((customer) => {
      return (
        customer.name.toLowerCase().includes(query) ||
        customer.email.toLowerCase().includes(query) ||
        customer.phone.includes(query)
      );
    });
    renderCustomers(filtered);
  });

  customerForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    const submitButton = customerForm.querySelector('[type="submit"]');
    submitButton.disabled = true;
    try {
      await apiFetch('/customers', {
        method: 'POST',
        body: JSON.stringify({
          name: document.getElementById('customerName').value.trim(),
          email: document.getElementById('customerEmail').value.trim(),
          phone: document.getElementById('customerPhone').value.trim(),
        }),
      });
      customerDialog.close();
      customerSearch.value = '';
      if (await loadCustomers()) showToast('Customer added');
    } catch (error) {
      showToast(error.message, 'error');
    } finally {
      submitButton.disabled = false;
    }
  });

  await loadCustomers();
});
