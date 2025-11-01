window.mmaApi = (function () {
  const API = "https://mma-auth-api-production.up.railway.app";
  function token(){ return localStorage.getItem("mma_token"); }
  async function request(path, options = {}) {
    const t = token();
    const headers = Object.assign(
      { "Content-Type": "application/json" },
      options.headers || {},
      t ? { Authorization: `Bearer ${t}` } : {}
    );
    const res = await fetch(`${API}${path}`, { ...options, headers });
    if (res.status === 401 || res.status === 403) {
      localStorage.removeItem("mma_token");
      window.location.href = "/login.html";
      return new Response(null, { status: res.status });
    }
    return res;
  }
  return {
    get: (p) => request(p, { method: "GET" }),
    post:(p,b)=>request(p,{ method:"POST", body: JSON.stringify(b||{}) }),
    put: (p,b)=>request(p,{ method:"PUT",  body: JSON.stringify(b||{}) }),
    del: (p)=>request(p,{ method:"DELETE" })
  };
})();