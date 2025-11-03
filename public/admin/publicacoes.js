import { ensureAuthOrRedirect, bindLogoutHandlers } from '../js/auth-guard.js';

async function init() {
  const user = await ensureAuthOrRedirect();
  if (!user) return;

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

init();