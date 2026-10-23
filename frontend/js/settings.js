document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('settingsForm');
  const defaults = {
    restaurantName: 'FoodNest Kitchen',
    contactEmail: 'hello@foodnest.io',
    contactPhone: '+91 98765 43210',
    currency: 'INR',
    stockNotifications: true,
  };

  function readSettings() {
    try {
      return { ...defaults, ...JSON.parse(localStorage.getItem('foodnest.settings') || '{}') };
    } catch (error) {
      showToast('Saved settings could not be read. Defaults were loaded.', 'error');
      return defaults;
    }
  }

  function populateForm(settings) {
    form.elements.restaurantName.value = settings.restaurantName;
    form.elements.contactEmail.value = settings.contactEmail;
    form.elements.contactPhone.value = settings.contactPhone;
    form.elements.currency.value = settings.currency;
    form.elements.stockNotifications.checked = Boolean(settings.stockNotifications);
  }

  populateForm(readSettings());

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const settings = {
      restaurantName: form.elements.restaurantName.value.trim(),
      contactEmail: form.elements.contactEmail.value.trim(),
      contactPhone: form.elements.contactPhone.value.trim(),
      currency: form.elements.currency.value,
      stockNotifications: form.elements.stockNotifications.checked,
    };

    if (!settings.restaurantName || !settings.contactEmail) {
      showToast('Restaurant name and contact email are required.', 'error');
      return;
    }

    try {
      localStorage.setItem('foodnest.settings', JSON.stringify(settings));
      showToast('Settings saved on this device.');
    } catch (error) {
      showToast('Settings could not be saved in this browser.', 'error');
    }
  });

  form.addEventListener('reset', () => {
    window.setTimeout(() => populateForm(defaults), 0);
  });
});
