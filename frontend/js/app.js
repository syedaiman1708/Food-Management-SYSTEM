const API_BASE = '/api';

async function apiFetch(url, options = {}) {
  if (window.location.protocol === 'file:') {
    throw new Error('Start FoodNest with npm start and open http://localhost:5000 instead of opening the HTML file directly.');
  }

  const response = await fetch(`${API_BASE}${url}`, {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
    ...options,
  });

  const text = await response.text();
  const isJson = response.headers.get('content-type')?.includes('application/json');
  let payload = text;

  if (text && isJson) {
    try {
      payload = JSON.parse(text);
    } catch (error) {
      throw new Error('The server returned invalid JSON. Restart the app and open it at http://localhost:5000.');
    }
  }

  if (!response.ok) {
    throw new Error((payload && payload.message) || `Request failed (${response.status}).`);
  }

  return payload;
}

function showToast(message, type = 'success') {
  let toast = document.getElementById('toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'toast';
    toast.className = 'toast';
    document.body.appendChild(toast);
  }

  toast.textContent = message;
  toast.classList.add('show');
  toast.style.background = type === 'error' ? '#d94a41' : '#063b2d';

  clearTimeout(window.toastTimer);
  window.toastTimer = setTimeout(() => {
    toast.classList.remove('show');
  }, 2400);
}

function formatCurrency(value) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
  }).format(Number(value || 0));
}

function formatDate(dateString) {
  if (!dateString) return '—';
  return new Date(dateString).toLocaleString('en-IN', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
}

function redirectIfUnauthenticated(error) {
  if (error.message && error.message.toLowerCase().includes('authentication required')) {
    if (window.location.protocol === 'file:') {
      showToast('Open FoodNest through its server at http://localhost:5000, then sign in.', 'error');
      return;
    }
    window.location.href = '/login';
  }
}

document.addEventListener('click', (event) => {
  const navToggle = event.target.closest('.mobile-nav-toggle');
  if (navToggle) {
    const sidebar = document.querySelector('.sidebar');
    const isOpen = sidebar.classList.toggle('mobile-open');
    navToggle.setAttribute('aria-expanded', String(isOpen));
    navToggle.setAttribute('aria-label', isOpen ? 'Close navigation' : 'Open navigation');
    return;
  }

  const sidebarLink = event.target.closest('.sidebar-nav a');
  if (sidebarLink) {
    const sidebar = document.querySelector('.sidebar');
    const navToggleButton = document.querySelector('.mobile-nav-toggle');
    sidebar.classList.remove('mobile-open');
    if (navToggleButton) {
      navToggleButton.setAttribute('aria-expanded', 'false');
      navToggleButton.setAttribute('aria-label', 'Open navigation');
    }
  }

  const toggleButton = event.target.closest('.toggle-password');
  if (toggleButton) {
    const input = document.getElementById(toggleButton.dataset.target);
    const nextType = input.type === 'password' ? 'text' : 'password';
    input.type = nextType;
    toggleButton.textContent = nextType === 'password' ? 'Show' : 'Hide';
  }

  const logoutButton = event.target.closest('.logout-btn');
  if (logoutButton) {
    apiFetch('/auth/logout', { method: 'POST' })
      .then(() => {
        window.location.href = '/login';
      })
      .catch(() => {
        window.location.href = '/login';
      });
  }
});
