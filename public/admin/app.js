(function () {
  // abrir/fechar sidebar no mobile
  const menuBtn = document.querySelector('[data-menu]');
  const sidebar = document.querySelector('.sidebar');
  if (menuBtn && sidebar) {
    menuBtn.addEventListener('click', () => sidebar.classList.toggle('open'));
  }

  // marcar link ativo
 const segments = window.location.pathname.split('/').filter(Boolean);
  const segment = (segments.pop() || '').split('?')[0];
  const currentSegment = segment === 'admin' ? 'app.html' : segment;
  document.querySelectorAll('.nav a').forEach((link) => {
    const href = link.getAttribute('href') || '';
    const last = href.split('/').pop()?.split('?')[0];
    if (last === currentSegment) {
      link.classList.add('active');
    }
  });

  // logout
  document.querySelectorAll('[data-logout]').forEach((button) => {
    button.addEventListener('click', () => {
      localStorage.removeItem('mma_token');
      window.location.href = '/login.html';
    });
  });

  if (!window.mmaApi) {
    return;
  }

  async function loadUsersCount() {
    const el = document.getElementById('kpi-usuarios');
    if (!el) return;

    try {
      const res = await mmaApi.get('/api/admin/users');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const users = await res.json();
      el.textContent = Array.isArray(users) ? users.length : '—';
    } catch (error) {
      console.error('Falha ao carregar quantidade de usuários', error);
      el.textContent = '—';
    }
  }
  
  async function loadAuditStatus() {
    const el = document.getElementById('kpi-eventos');
    if (!el) return;

    try {
      const res = await mmaApi.get('/api/audit?limit=1');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const logs = await res.json();
      el.textContent = Array.isArray(logs) && logs.length ? 'Ativo' : '—';
    } catch (error) {
      console.error('Falha ao carregar status de auditoria', error);
      el.textContent = '—';
    }
  }

  loadUsersCount();
  loadAuditStatus();
})();
