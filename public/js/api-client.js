const TOKEN_KEY = "mma_auth_token";

const DEFAULT_API = (() => {
  if (typeof location !== "undefined") {
    const host = location.hostname;
    if (host === "localhost" || host === "127.0.0.1") {
      return "http://localhost:8080";
    }
  }
  return "https://mma-auth-api-production.up.railway.app";
})();

function resolveBase() {
  let base = DEFAULT_API;
  if (typeof window !== "undefined") {
    if (window.APP_CONFIG && window.APP_CONFIG.API_BASE) {
      base = window.APP_CONFIG.API_BASE;
    } else if (window.API_BASE) {
      base = window.API_BASE;
    }
  }
  while (base.endsWith("/")) base = base.slice(0, -1);
  return base;
}

function loadStoredToken() {
  try {
    return localStorage.getItem(TOKEN_KEY) || null;
  } catch (err) {
    console.warn("[api] não foi possível ler token salvo", err);
    return null;
  }
}

function storeToken(token) {
  try {
    if (!token) localStorage.removeItem(TOKEN_KEY);
    else localStorage.setItem(TOKEN_KEY, token);
  } catch (err) {
    console.warn("[api] não foi possível persistir token", err);
  }
}

function buildUrl(base, path) {
  if (/^https?:/i.test(path)) return path;
  const cleanBase = base.endsWith("/") ? base.slice(0, -1) : base;
  let cleanPath = path.startsWith("/") ? path : `/${path}`;
  if (!cleanPath.startsWith("/api")) {
    cleanPath = cleanPath === "/" ? "/api" : `/api${cleanPath}`;
  }
  return `${cleanBase}${cleanPath}`;
}

async function ensureJson(res) {
  const contentType = (res.headers && res.headers.get && res.headers.get("content-type")) || "";
  if (contentType.toLowerCase().includes("application/json")) {
    return res.json();
  }

  const text = await res.text();
  const preview = text ? text.slice(0, 200) : "(corpo vazio)";
  throw new Error(`Resposta não-JSON (status ${res.status}): ${preview}`);
}

const API = {
  base: resolveBase(),
  _token: loadStoredToken(),

  getToken() {
    if (!this._token) this._token = loadStoredToken();
    return this._token;
  },

  setToken(token) {
    this._token = token;
    storeToken(token);
  },

  async request(path, opts = {}) {
    const base = resolveBase();
    this.base = base;
    const url = buildUrl(base, path);
    const headers = { ...(opts.headers || {}) };

    const body = opts.body;
    const isFormData = typeof FormData !== "undefined" && body instanceof FormData;
    const isBuffer = typeof Buffer !== "undefined" && body instanceof Buffer;

    if (!isFormData && !isBuffer && body !== undefined && !headers["Content-Type"]) {
      headers["Content-Type"] = "application/json";
    }

    const token = this.getToken();
    if (token && !headers.Authorization) {
      headers.Authorization = `Bearer ${token}`;
    }

    const fetchOpts = {
      method: opts.method || "GET",
      headers,
      credentials: "include",
      cache: "no-store",
    };

    if (body !== undefined) {
      if (!isFormData && headers["Content-Type"] === "application/json" && typeof body !== "string") {
        fetchOpts.body = JSON.stringify(body);
      } else {
        fetchOpts.body = body;
      }
    }

    const res = await fetch(url, fetchOpts);
    return res;
  },

  async json(path, opts) {
    const res = await this.request(path, opts || {});
    try {
      const data = await ensureJson(res);
      return { res, data };
    } catch (error) {
      if (res.ok) {
        throw error;
      }
      return { res, data: { error: error?.message || String(error) } };
    }
  },

  async authedFetch(path, opts) {
    const { res, data } = await this.json(path, opts);
    if (!res.ok) {
      const error = data?.error || data?.message || `HTTP ${res.status}`;
      throw new Error(error);
    }
    return data;
  },

  async me() {
    return this.json("/auth/me");
  },

  async login(body) {
    const { res, data } = await this.json("/auth/login", { method: "POST", body });
    if (res.ok && data?.token) {
      this.setToken(data.token);
    }
    return { res, data };
  },

  async logout() {
    this.setToken(null);
    return this.request("/auth/logout", { method: "POST" });
  },

  async auditLatest() {
    return this.json("/audit/latest");
  },

  async adminUsers() {
    return this.json("/admin/users");
  },

  async casesList() {
    return this.json("/cases");
  },

  async casesPending() {
    return this.json("/cases/pending");
  },
  
  async createCase(body) {
    return this.json("/cases", { method: "POST", body });
  },

  async triggerCaseSync() {
    return this.json("/cases/sync/run", { method: "POST" });
  },
  
  async generateLegalPiece(body) {
    return this.json("/admin/ai/gerador-pecas", { method: "POST", body });
  },
  
  async downloadLegalPieceDocx(id) {
    const res = await this.request(`/admin/ai/gerador-pecas/${id}/exportar`);
    if (!res.ok) {
      let message = `HTTP ${res.status}`;
      try {
        const data = await res.clone().json();
        message = data?.message || data?.error || message;
      } catch (_) {
        // Ignore JSON parse errors for binary bodies
      }
      throw new Error(message);
    }

    const blob = await res.blob();
    return { res, blob };
  },
  
  async post(path, body) {
    return this.authedFetch(path, { method: "POST", body });
  },

  async patch(path, body) {
    return this.authedFetch(path, { method: "PATCH", body });
  },
};


if (typeof window !== "undefined") {
  window.API = API;
}

export const login = (body) => API.login(body);
export const me = () => API.me();
export const api = API;
export default API;