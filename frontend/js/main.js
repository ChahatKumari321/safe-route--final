// ============================================================
// SafeRoute Karachi — Shared Auth Utilities
// ============================================================

const API_BASE = '/api';

const Auth = {
  getToken:   () => localStorage.getItem('sr_token'),
  getUser:    () => { try { return JSON.parse(localStorage.getItem('sr_user')); } catch { return null; } },
  isLoggedIn: () => !!localStorage.getItem('sr_token'),
  isAdmin:    () => { const u = Auth.getUser(); return u && u.role === 'admin'; },

  save(token, user) {
    localStorage.setItem('sr_token', token);
    localStorage.setItem('sr_user', JSON.stringify(user));
  },

  logout() {
    localStorage.removeItem('sr_token');
    localStorage.removeItem('sr_user');
    window.location.href = '/login.html';
  },

  redirectIfNotLoggedIn() {
    if (!Auth.isLoggedIn()) window.location.href = '/login.html';
  },

  redirectIfNotAdmin() {
    if (!Auth.isAdmin()) window.location.href = '/dashboard.html';
  },

  redirectIfLoggedIn() {
    if (Auth.isLoggedIn()) window.location.href = '/dashboard.html';
  },
};

// ─── API HELPER ───────────────────────────────────────────────────────────────
async function apiRequest(method, path, body = null, auth = false) {
  const headers = { 'Content-Type': 'application/json' };
  if (auth) {
    const token = Auth.getToken();
    if (token) headers['Authorization'] = `Bearer ${token}`;
  }

  const options = { method, headers };
  if (body) options.body = JSON.stringify(body);

  const response = await fetch(API_BASE + path, options);
  const data = await response.json();
  return { status: response.status, ok: response.ok, data };
}

// ─── NAVBAR INJECTION ─────────────────────────────────────────────────────────
function injectNavbar(activePage = '') {
  const user = Auth.getUser();
  const isLoggedIn = Auth.isLoggedIn();
  const isAdmin = Auth.isAdmin();

  const navLinks = [
    { href: '/index.html',     label: 'Home',    id: 'home' },
    { href: '/map.html',       label: '🗺 Map',   id: 'map' },
  ];

  if (isLoggedIn) {
    navLinks.push({ href: '/report.html',    label: '+ Report', id: 'report' });
    navLinks.push({ href: '/dashboard.html', label: 'Dashboard', id: 'dashboard' });
    if (isAdmin) navLinks.push({ href: '/admin.html', label: '⚙ Admin', id: 'admin' });
  } else {
    navLinks.push({ href: '/login.html',    label: 'Login', id: 'login' });
    navLinks.push({ href: '/register.html', label: 'Register', id: 'register' });
  }

  const linksHTML = navLinks.map(l =>
    `<li><a href="${l.href}" class="${activePage === l.id ? 'active' : ''}">${l.label}</a></li>`
  ).join('');

  const authRight = isLoggedIn
    ? `<li><span style="color:var(--gray-300);font-size:0.85rem;padding:0.4rem 0.5rem">👤 ${user?.name || 'User'}</span></li>
       <li><a href="#" onclick="Auth.logout();return false;" style="color:var(--danger)">Logout</a></li>`
    : '';

  document.getElementById('navbar-placeholder').innerHTML = `
    <nav class="navbar">
      <a href="/index.html" class="navbar-brand">
        <span class="brand-icon">🛡</span>
        <span>Safe<span>Route</span> Karachi</span>
      </a>
      <ul class="navbar-links" id="navLinks">
        ${linksHTML}
        ${authRight}
      </ul>
      <div class="navbar-toggle" onclick="document.getElementById('navLinks').classList.toggle('open')">
        <span></span><span></span><span></span>
      </div>
    </nav>
  `;
}

// ─── UTILITY HELPERS ──────────────────────────────────────────────────────────
function formatDate(dt) {
  if (!dt) return 'N/A';
  return new Date(dt).toLocaleString('en-PK', {
    year: 'numeric', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit'
  });
}

function timeAgo(dt) {
  const diff = Date.now() - new Date(dt).getTime();
  const mins  = Math.floor(diff / 60000);
  if (mins < 1)   return 'just now';
  if (mins < 60)  return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24)   return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

function statusBadge(status) {
  return `<span class="badge badge-${status}">${status}</span>`;
}

function showAlert(containerId, message, type = 'danger') {
  const icons = { danger: '⚠', success: '✓', info: 'ℹ', warning: '⚠' };
  const el = document.getElementById(containerId);
  if (el) {
    el.innerHTML = `<div class="alert alert-${type}">${icons[type] || ''} ${message}</div>`;
    el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }
}

function clearAlert(containerId) {
  const el = document.getElementById(containerId);
  if (el) el.innerHTML = '';
}

function setLoading(buttonEl, loading, text = null) {
  if (!buttonEl) return;
  if (loading) {
    buttonEl.disabled = true;
    buttonEl._origText = buttonEl.innerHTML;
    buttonEl.innerHTML = '<span class="spinner" style="width:16px;height:16px;margin:0;border-width:2px;display:inline-block;"></span> Loading...';
  } else {
    buttonEl.disabled = false;
    buttonEl.innerHTML = text || buttonEl._origText || 'Submit';
  }
}

// Category color map
const CATEGORY_COLORS = {
  1: '#e74c3c', // Street Crime
  2: '#e67e22', // Road Accidents
  3: '#3498db', // Waterlogging
  4: '#9b59b6', // Road Blockages
  5: '#f39c12', // Poor Lighting
  6: '#e91e63', // Harassment
  7: '#7f8c8d', // Other
};

function getCategoryColor(categoryId, colorHex) {
  return colorHex || CATEGORY_COLORS[categoryId] || '#7f8c8d';
}

// Create a colored circle marker for Leaflet
function createIncidentMarker(lat, lng, color) {
  return L.circleMarker([lat, lng], {
    radius: 9,
    fillColor: color,
    color: '#fff',
    weight: 2,
    opacity: 1,
    fillOpacity: 0.85,
  });
}
