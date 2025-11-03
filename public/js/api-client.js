window.API = {
  base: '/api',

  async request(path, opts = {}) {
    const res = await fetch(`${this.base}${path}`, {
      method: opts.method || 'GET',
      headers: { 'Content-Type': 'application/json', ...(opts.headers || {}) },
      body: opts.body ? JSON.stringify(opts.body) : undefined,
      credentials: 'include',
      cache: 'no-store',
    });
    return res;
  },

  async json(path, opts) {
    const res = await this.request(path, opts);
    let data = null;
    const text = await res.text();
    if (text) {
      try {
        data = JSON.parse(text);
      } catch (err) {
        console.warn('[api] resposta não é JSON válido', err);
      }
    }
    return { res, data };
  },

  me() {
    return this.json('/auth/me');
  },

  login(body) {
    return this.json('/auth/login', { method: 'POST', body });
  },

  logout() {
    return this.request('/auth/logout', { method: 'POST' });
  },

  auditLatest() {
    return this.json('/audit/latest');
  },

  adminUsers() {
    return this.json('/admin/users');
  },
};