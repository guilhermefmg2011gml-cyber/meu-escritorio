const TOKEN_KEY = "mma_auth_token";

function resolveBase() {
  let base =
    (typeof window !== "undefined" && window.APP_CONFIG && window.APP_CONFIG.API_BASE) ||
    (typeof window !== "undefined" && window.API_BASE) ||
    "http://localhost:8080";
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

  async pdpjPing() {
    const data = await this.authedFetch("/pdpj/test");
    return data;
  },

  async listProcesses(filters = {}) {
    const params = new URLSearchParams();
    if (filters.q) params.set("q", filters.q);
    if (filters.uf) params.set("uf", filters.uf);
    if (filters.oab) params.set("oab", filters.oab);
    const query = params.toString();
    const data = await this.authedFetch(`/processes${query ? `?${query}` : ""}`);
    return Array.isArray(data) ? data : [];
  },

  async createProcessManual(payload) {
    const data = await this.authedFetch("/processes", { method: "POST", body: payload });
    return data;
  },

  async getProcessDetails(id) {
    if (!id) throw new Error("ID obrigatório");
    return this.authedFetch(`/processes/${id}`);
  },

  async getProcessEvents(id) {
    if (!id) throw new Error("ID obrigatório");
    const data = await this.authedFetch(`/processes/${id}/events`);
    return Array.isArray(data) ? data : [];
  },

  async importProcessesCSV(csvText) {
    return this.authedFetch("/processes/import-csv", {
      method: "POST",
      headers: { "Content-Type": "text/plain; charset=utf-8" },
      body: typeof csvText === "string" ? csvText : String(csvText ?? ""),
    });
  },

  async syncByOAB({ oab, uf, ingerir = true } = {}) {
    return this.authedFetch("/processes/sync-oab", {
      method: "POST",
      body: { oab, uf, ingerir },
    });
  },

  async post(path, body) {
    return this.authedFetch(path, { method: "POST", body });
  },

  async patch(path, body) {
    return this.authedFetch(path, { method: "PATCH", body });
  },
};


export async function datajudSearchNumero(numero) {
  const cnj = (numero || "").trim();
  if (!cnj) throw new Error("CNJ obrigatório");
  return API.authedFetch(`/datajud/search/numero?numero=${encodeURIComponent(cnj)}`);
}

export async function datajudImportNumero(numero) {
  const cnj = (numero || "").trim();
  if (!cnj) throw new Error("CNJ obrigatório");
  return API.authedFetch(`/datajud/${encodeURIComponent(cnj)}`);
}

export async function datajudSync(payload = {}) {
  return API.authedFetch(`/datajud/sync`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: payload,
  });
}


export async function listAliases() {
  return API.authedFetch(`/datajud/aliases`);
}


export async function apiFetch(path, opts = {}) {
  if (typeof path !== "string" || !path.trim()) {
    throw new Error("Path obrigatório");
  }

  let target = path.trim();
  if (/^https?:/i.test(target)) {
    return API.authedFetch(target, opts);
  }

  if (target.startsWith("/api/")) {
    target = target.slice(4);
  } else if (target === "/api") {
    target = "/";
  }

  if (!target.startsWith("/")) {
    target = `/${target}`;
  }

  return API.authedFetch(target, opts);
}

if (typeof window !== "undefined") {
  window.API = API;
}

export const login = (body) => API.login(body);
export const me = () => API.me();
export const api = API;
export default API;