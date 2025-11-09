import { ensureAuthOrRedirect, bindLogoutHandlers } from "../js/auth-guard.js";

const DEFAULT_API_BASE = "https://mma-auth-api-production.up.railway.app";

function resolveApiBase() {
  if (typeof window === "undefined") return DEFAULT_API_BASE;
  const configured = window.APP_CONFIG?.API_BASE || window.API_BASE;
  const apiClientBase = window.API?.base;
  const base = configured || apiClientBase || DEFAULT_API_BASE;
  return base.endsWith("/") ? base.slice(0, -1) : base;
}

function getAuthHeaders() {
  const token = window.API?.getToken?.();
  if (!token) return {};
  return { Authorization: `Bearer ${token}` };
}

async function fetchJson(path, options = {}) {
  const base = resolveApiBase();
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  const url = `${base}${cleanPath}`;

  const headers = { "Content-Type": "application/json", ...getAuthHeaders(), ...(options.headers || {}) };
  const fetchOptions = {
    method: options.method || "GET",
    headers,
    credentials: "include",
    cache: "no-store",
  };

  if (options.body !== undefined) {
    fetchOptions.body = typeof options.body === "string" ? options.body : JSON.stringify(options.body);
  }

  const res = await fetch(url, fetchOptions);
  let data = null;
  try {
    data = await res.json();
  } catch (error) {
    if (res.ok) {
      throw error;
    }
  }

  if (!res.ok) {
    const message = data?.error || data?.message || `Erro HTTP ${res.status}`;
    throw new Error(message);
  }

  return data;
}

function showMessage(message) {
  alert(message);
}

function formatDate(value) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleDateString("pt-BR");
}

function escapeHtml(value) {
  if (value === null || value === undefined) return "";
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function renderProcessCard(item) {
  return `
    <article class="case-card">
      <div class="case-number">${escapeHtml(item.numero_cnj || "—")}</div>
      <div class="case-meta">
        <div><span>Tribunal</span>${escapeHtml(item.tribunal || "—")}</div>
        <div><span>Órgão</span>${escapeHtml(item.orgao || "—")}</div>
        <div><span>Classe</span>${escapeHtml(item.classe || "—")}</div>
        <div><span>Assunto</span>${escapeHtml(item.assunto || "—")}</div>
        <div><span>Atualizado em</span>${formatDate(item.atualizado_em)}</div>
      </div>
    </article>
  `;
}

function renderPendingCard(item) {
  return `
    <article class="case-card alert">
      <div class="case-number">${escapeHtml(item.numero_cnj || "—")}</div>
      <div class="case-meta">
        <div><span>Tribunal</span>${escapeHtml(item.tribunal || "—")}</div>
        <div><span>Prazo final</span>${item.prazo_final ? formatDate(item.prazo_final) : "—"}</div>
        <div><span>Movimentação</span>${escapeHtml(item.descricao || "—")}</div>
      </div>
    </article>
  `;
}

async function init() {
  const user = await ensureAuthOrRedirect();
  if (!user) return;

  bindLogoutHandlers();

  const sidebarFrame = document.querySelector(".sidebar-frame");
  if (sidebarFrame) {
    sidebarFrame.addEventListener("load", () => {
      const doc = sidebarFrame.contentDocument || sidebarFrame.contentWindow?.document;
      if (doc) {
        bindLogoutHandlers(doc);
      }
    });
  }

  const form = document.getElementById("caseForm");
  const btnCadastrar = document.getElementById("btn-cadastrar-processo") || form?.querySelector('button[type="submit"]');
  const btnSync = document.getElementById("btn-sincronizar-agora") || document.getElementById("caseSync");
  const listaProcessos = document.getElementById("lista-processos") || document.getElementById("casesList");
  const listaPrazos = document.getElementById("lista-prazos") || document.getElementById("alertsList");
  const casosVazio = document.getElementById("casesEmpty");
  const prazosVazio = document.getElementById("alertsEmpty");
  const carregando = document.getElementById("casesLoading");

  const inputCNJ = document.querySelector('input[name="numero_cnj"]') || document.getElementById("numero-cnj");
  const inputTribunal = document.querySelector('input[name="tribunal"]') || document.getElementById("tribunal");
  const inputOrgao = document.querySelector('input[name="orgao"]') || document.getElementById("orgao-julgador");
  const inputClasse = document.querySelector('input[name="classe"]') || document.getElementById("classe-processual");
  const inputAssunto = document.querySelector('input[name="assunto"]') || document.getElementById("assunto");

  async function requestCases() {
    if (window.API?.casesList) {
      const result = await window.API.casesList();
      if (!result?.res?.ok || !Array.isArray(result.data)) {
        const message = result?.data?.error || `HTTP ${result?.res?.status ?? "erro"}`;
        throw new Error(message);
      }
      return result.data;
    }
    return fetchJson("/api/cases");
  }

  async function requestPending() {
    if (window.API?.casesPending) {
      const result = await window.API.casesPending();
      if (!result?.res?.ok || !Array.isArray(result.data)) {
        const message = result?.data?.error || `HTTP ${result?.res?.status ?? "erro"}`;
        throw new Error(message);
      }
      return result.data;
    }
    return fetchJson("/api/cases/pending");
  }

  async function createCase(payload) {
    if (window.API?.createCase) {
      const result = await window.API.createCase(payload);
      if (!result?.res?.ok) {
        const message = result?.data?.error || `HTTP ${result?.res?.status ?? "erro"}`;
        throw new Error(message);
      }
      return result.data;
    }
    return fetchJson("/api/cases", { method: "POST", body: payload });
  }

  async function triggerSync() {
    if (window.API?.triggerCaseSync) {
      const result = await window.API.triggerCaseSync();
      if (!result?.res?.ok) {
        const message = result?.data?.error || `HTTP ${result?.res?.status ?? "erro"}`;
        throw new Error(message);
      }
      return result.data;
    }
    return fetchJson("/api/cases/sync/run", { method: "POST" });
  }

  async function carregarProcessos() {
    if (!listaProcessos) return;
    listaProcessos.innerHTML = "<p style='color:#ccc'>Carregando processos...</p>";
    if (casosVazio) {
      casosVazio.classList.add("hidden");
    }
    if (carregando) {
      carregando.classList.remove("hidden");
    }

    try {
      const dados = await requestCases();
      if (!dados.length) {
        listaProcessos.innerHTML = "<p>Nenhum processo cadastrado até o momento.</p>";
        if (casosVazio) {
          casosVazio.classList.remove("hidden");
        }
        return;
      }
      
      listaProcessos.innerHTML = dados.map((item) => renderProcessCard(item)).join("");
    } catch (error) {
      console.error("[processos] erro ao carregar lista", error);
      listaProcessos.innerHTML = "<p style='color:#ff8080'>Erro ao carregar processos cadastrados.</p>";
    } finally {
      if (carregando) {
        carregando.classList.add("hidden");
      }
    }
  }

  async function carregarPrazos() {
    if (!listaPrazos) return;
    listaPrazos.innerHTML = "<p style='color:#ccc'>Carregando movimentações com prazo...</p>";
    if (prazosVazio) {
      prazosVazio.classList.add("hidden");
    }

    try {
      const dados = await requestPending();
      if (!dados.length) {
        listaPrazos.innerHTML = "<p>Não há movimentações pendentes no momento.</p>";
        if (prazosVazio) {
          prazosVazio.classList.remove("hidden");
        }
        return;
      }

      listaPrazos.innerHTML = dados.map((item) => renderPendingCard(item)).join("");
    } catch (error) {
      console.error("[processos] erro ao carregar prazos", error);
      listaPrazos.innerHTML = "<p style='color:#ff8080'>Erro ao carregar movimentações com prazo.</p>";
    }
  }

  async function cadastrarProcesso(event) {
    event?.preventDefault?.();

    const numero_cnj = inputCNJ?.value?.trim();
    const tribunal = inputTribunal?.value?.trim();
    const orgao = inputOrgao?.value?.trim();
    const classe = inputClasse?.value?.trim();
    const assunto = inputAssunto?.value?.trim();

    if (!numero_cnj || !tribunal) {
      showMessage("Preencha pelo menos Número CNJ e Tribunal.");
      return;
    }

    try {
      await createCase({ numero_cnj, tribunal, orgao, classe, assunto });
      showMessage("Processo cadastrado e colocado em monitoramento automático.");

      if (inputCNJ) inputCNJ.value = "";
      if (inputTribunal) inputTribunal.value = "";
      if (inputOrgao) inputOrgao.value = "";
      if (inputClasse) inputClasse.value = "";
      if (inputAssunto) inputAssunto.value = "";

      await Promise.all([carregarProcessos(), carregarPrazos()]);
    } catch (error) {
      console.error("[processos] erro ao cadastrar processo", error);
      showMessage(error?.message || "Erro ao cadastrar processo.");
    }
  }

  async function sincronizarAgora(event) {
    event?.preventDefault?.();
    if (btnSync) {
      btnSync.disabled = true;
      btnSync.textContent = "Sincronizando...";
    }
    try {
      await triggerSync();
      showMessage("Sincronização iniciada. Os processos serão atualizados em instantes.");
    } catch (error) {
      console.error("[processos] erro ao iniciar sincronização", error);
      showMessage(error?.message || "Erro ao acionar sincronização.");
    } finally {
      if (btnSync) {
        btnSync.disabled = false;
        btnSync.textContent = "Sincronizar agora";
      }
    }
  }

  if (form) {
    form.addEventListener("submit", cadastrarProcesso);
  }
  if (btnCadastrar) {
    btnCadastrar.addEventListener("click", cadastrarProcesso);
  }
  if (btnSync) {
    btnSync.addEventListener("click", sincronizarAgora);
  }

  await carregarProcessos();
  await carregarPrazos();
}

init();