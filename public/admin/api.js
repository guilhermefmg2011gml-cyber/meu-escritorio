export const mmaApi = {
  base: 'https://mma-auth-api-production.up.railway.app',

  headers() {
    const t = localStorage.getItem('mma_token');
    return t ? { Authorization: `Bearer ${t}` } : {};
  },

  get(path) {
    return fetch(this.base + path, { headers: this.headers() });
  },

  post(path, body) {
    return fetch(this.base + path, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...this.headers() },
      body: JSON.stringify(body || {}),
    });
  },

  put(path, body) {
    return fetch(this.base + path, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...this.headers() },
      body: JSON.stringify(body || {}),
    });
  },

  del(path) {
    return fetch(this.base + path, {
      method: 'DELETE',
      headers: this.headers(),
    });
  },
};

if (typeof window !== 'undefined') {
  window.mmaApi = mmaApi;
}