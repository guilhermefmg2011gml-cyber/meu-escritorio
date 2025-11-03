(function () {
  const API = window.API;
  if (!API) {
    console.error('[app] API client não encontrado');
    return;
  }
  const menuBtn = document.querySelector('[data-menu]');
  const sidebar = document.querySelector('.sidebar');
  if (menuBtn && sidebar) {
    menuBtn.addEventListener('click', () => sidebar.classList.toggle('open'));
  }

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

  document.querySelectorAll('[data-logout]').forEach((button) => {
    button.addEventListener('click', async () => {
      try {
        await API.logout();
      } catch (err) {
        console.warn('[app] falha ao sair', err);
      }
      window.location.href = '/login.html';
    });
  });

  async function loadUsersCount() {
    const el = document.getElementById('kpi-usuarios');
    if (!el) return;

    try {
      const result = await API.adminUsers();
      if (!result || result.res.status !== 200) {
        console.warn('users request returned', result?.res?.status);
        el.textContent = '—';
        return;
      }
      const users = Array.isArray(result.data) ? result.data : [];
      el.textContent = users.length ? users.length : '0';
    } catch (error) {
      console.warn('Falha ao carregar quantidade de usuários', error);
      el.textContent = '—';
    }
  }
  
  async function loadAuditStatus() {
    const el = document.getElementById('kpi-eventos');
    if (!el) return;

    try {
      const result = await API.auditLatest();
      if (!result || result.res.status !== 200) {
        console.warn('audit/latest retornou', result?.res?.status);
        el.textContent = '—';
        return;
      }
      const logs = Array.isArray(result.data) ? result.data : [];
      el.textContent = logs.length ? 'Ativo' : '—';
    } catch (error) {
      console.warn('Falha ao carregar status de auditoria', error);
      el.textContent = '—';
    }
  }

  loadUsersCount();
  loadAuditStatus();
})();
