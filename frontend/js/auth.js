document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.getElementById('loginForm');
  const registerForm = document.getElementById('registerForm');
  const dashboardUrl = window.location.hostname.endsWith('.github.io')
    ? `${HOSTED_APP_URL}/dashboard`
    : '/dashboard';

  if (loginForm) {
    loginForm.addEventListener('submit', async (event) => {
      event.preventDefault();
      const payload = {
        username: document.getElementById('loginUsername').value.trim(),
        password: document.getElementById('loginPassword').value,
      };

      try {
        const result = await apiFetch('/auth/login', {
          method: 'POST',
          body: JSON.stringify(payload),
        });

        showToast(result.message || 'Login successful');
        window.location.href = dashboardUrl;
      } catch (error) {
        showToast(error.message, 'error');
      }
    });
  }

  if (registerForm) {
    registerForm.addEventListener('submit', async (event) => {
      event.preventDefault();
      const payload = {
        fullName: document.getElementById('registerName').value.trim(),
        username: document.getElementById('registerUsername').value.trim(),
        email: document.getElementById('registerEmail').value.trim(),
        password: document.getElementById('registerPassword').value,
      };

      try {
        const result = await apiFetch('/auth/register', {
          method: 'POST',
          body: JSON.stringify(payload),
        });

        showToast(result.message || 'Registration complete');
        window.location.href = dashboardUrl;
      } catch (error) {
        showToast(error.message, 'error');
      }
    });
  }
});
