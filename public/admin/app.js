import { bindLogoutHandlers } from '../js/auth-guard.js';

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

  if (typeof bindLogoutHandlers === 'function') {
    bindLogoutHandlers();

  const sidebarFrame = document.querySelector('.sidebar-frame');
    if (sidebarFrame) {
      sidebarFrame.addEventListener('load', () => {
        const doc = sidebarFrame.contentDocument || sidebarFrame.contentWindow?.document;
        if (doc) {
          bindLogoutHandlers(doc);
        }
      });
    }
  }

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
