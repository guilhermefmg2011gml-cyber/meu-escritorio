(function () {
  const path = location.pathname;
  
  if (path.endsWith('/login.html')) return;
  if (!path.startsWith('/admin/')) return;

  const token = localStorage.getItem('mma_token');
  if (!token) {
    location.replace('/login.html');
    return;
  }

  fetch('https://mma-auth-api-production.up.railway.app/api/auth/me', {
    headers: { Authorization: `Bearer ${token}` },

  })
    .then((res) => {
      if (res.ok) return;
      localStorage.removeItem('mma_token');
      location.replace('/login.html');
    })
    .catch(() => {
      localStorage.removeItem('mma_token');
      location.replace('/login.html');
    });
})();