const ADMIN_PREFIX = '/admin/';
let cachedUser = null;
let pendingAuth = null;

function isAdminPath(pathname) {
  return typeof pathname === 'string' && pathname.startsWith(ADMIN_PREFIX);
}

async function fetchCurrentUser() {
  if (!window.API) {
    console.error('[guard] API client não encontrado');
    return null;
  }

  try {
    const { res, data } = await window.API.me();

    if (res.status === 200 && data && data.user) {
      cachedUser = data.user;
      window.currentUser = data.user;
      console.debug('[guard] ok:', data.user.email, data.user.role);
      return cachedUser;
    }

    if (res.status === 401) {
      console.warn('[guard] 401 → redirecionando para login');
      window.location.replace('/login.html');
      return null;
    }

    console.warn('[guard] status inesperado', res.status, data);
  } catch (err) {
    console.error('[guard] erro', err);
  }

  return null;
}

export async function ensureAuthOrRedirect() {
  if (!isAdminPath(window.location.pathname)) {
    return cachedUser;
  }

  if (cachedUser) {
    return cachedUser;
  }

  if (!pendingAuth) {
    pendingAuth = fetchCurrentUser().finally(() => {
      pendingAuth = null;
    });
  }

  return pendingAuth;
}

export async function logout() {
  try {
    await window.API?.logout();
  } catch (err) {
    console.warn('[guard] falha ao sair', err);
  }

  const target = window.top || window;
  target.location.href = '/login.html';
}

const onLogoutClick = (event) => {
  if (event) {
    event.preventDefault();
  }
  logout();
};

export function bindLogoutHandlers(root = document) {
  if (!root) return;

  root.querySelectorAll('[data-logout]').forEach((el) => {
    if (el.dataset.logoutBound === 'true') return;
    el.dataset.logoutBound = 'true';
    el.addEventListener('click', onLogoutClick);
  });
}

if (typeof window !== 'undefined') {
  window.__mmLogout = logout;

  if (isAdminPath(window.location.pathname)) {
    ensureAuthOrRedirect();
    bindLogoutHandlers();
  }
}

export default {
  ensureAuthOrRedirect,
  logout,
  bindLogoutHandlers,
};