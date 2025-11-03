(async function authGuard() {
  if (!window.API) {
    console.error('[guard] API client não encontrado');
    return;
  }

  const path = location.pathname;
  if (!path.startsWith('/admin/')) return;

  try {
    await new Promise((resolve) => setTimeout(resolve, 30));

    const { res, data } = await window.API.me();

    if (res.status === 200 && data && data.user) {
      window.currentUser = data.user;
      console.debug('[guard] ok:', data.user.email, data.user.role);
      return;
    }

    if (res.status === 401) {
      console.warn('[guard] 401 → redirecionando para login');
      location.replace('/login.html');
      return;
    }

    console.warn('[guard] status inesperado', res.status, data);
  } catch (err) {
    console.error('[guard] erro', err);
  }
})();
