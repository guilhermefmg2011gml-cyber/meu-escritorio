import { ensureAuthOrRedirect, bindLogoutHandlers } from "../js/auth-guard.js";
import { apiFetch } from "/js/api-client.js";

const state = {
  loading: false,
};

const tableBody = document.querySelector("#processTable tbody");
const drawer = document.querySelector("#drawer");
const drawerTitle = document.querySelector("#drawerTitle");
const drawerClose = document.querySelector("#drawerClose");
const timelineEl = document.querySelector("#timeline");
const searchBtn = document.querySelector("#btnBuscar");
const importBtn = document.querySelector("#btnImportCSV");
const csvInput = document.querySelector("#csvFile");

function toggleSidebarMenu() {
  const menuBtn = document.querySelector("[data-menu]");
  const sidebar = document.querySelector(".sidebar");
  if (menuBtn && sidebar) {
    menuBtn.addEventListener("click", () => sidebar.classList.toggle("open"));
  }
}

function initSidebarLogoutSync() {
  const sidebarFrame = document.querySelector(".sidebar-frame");
  if (sidebarFrame) {
    sidebarFrame.addEventListener("load", () => {
      const doc = sidebarFrame.contentDocument || sidebarFrame.contentWindow?.document;
      if (doc) {
        bindLogoutHandlers(doc);
      }
    });
  }
}

function escapeHtml(value = "") {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function formatDateTime(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return escapeHtml(value);
  return date.toLocaleString("pt-BR");
}

function renderProcesses(rows = []) {
  if (!tableBody) return;
  if (!rows.length) {
    tableBody.innerHTML = `<tr><td colspan="7">Nenhum processo localizado.</td></tr>`;
    return;
  }

  tableBody.innerHTML = rows
    .map(
      (row) => `
        <tr>
          <td>${escapeHtml(row.cnj || row.cnj_number || "")}</td>
          <td>${escapeHtml(row.titulo || row.subject || row.classeNome || "—")}</td>
          <td>${escapeHtml(row.classe || row.classeNome || "—")}</td>
          <td>${escapeHtml(row.uf || row.tribunal || "—")}</td>
          <td>${escapeHtml(row.situacao || row.situation || "—")}</td>
          <td>${escapeHtml(row.cliente || row.orgaoNome || "—")}</td>
          <td><button class="btn-secondary" data-open-timeline="${row.id}">Timeline</button></td>
        </tr>
      `
    )
    .join("");
}

async function loadProcesses() {
  if (state.loading) return;
  state.loading = true;
  if (tableBody) {
    tableBody.innerHTML = `<tr><td colspan="7">Carregando processos...</td></tr>`;
  }

  const q = document.querySelector("#fltQ")?.value?.trim();
  const uf = document.querySelector("#fltUF")?.value?.trim().toUpperCase();
  const oab = document.querySelector("#fltOAB")?.value?.trim();

  try {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (uf) params.set("uf", uf);
    if (oab) params.set("oab", oab);
    const query = params.toString();
    const rows = await apiFetch(`/processes${query ? `?${query}` : ""}`);
    renderProcesses(Array.isArray(rows) ? rows : []);

  } catch (error) {
    console.error("[processos] erro ao carregar lista", error);
    if (tableBody) {
      tableBody.innerHTML = `<tr><td colspan="7">Erro ao carregar processos.</td></tr>`;
    }
  } finally {
    state.loading = false;
  }
}

async function openTimeline(processId) {
  if (!processId) return;
  try {
    const [proc, events] = await Promise.all([
      apiFetch(`/processes/${processId}`),
      apiFetch(`/processes/${processId}/events`),
    ]);

    if (drawerTitle) {
      const title = proc?.cnj ? `${proc.cnj} — Timeline` : `Processo #${processId}`;
      drawerTitle.textContent = title;
    }

    if (timelineEl) {
      const list = Array.isArray(events) ? events : [];
      if (!list.length) {
        timelineEl.innerHTML = `<div class="item">Sem eventos registrados.</div>`;
      } else {
        timelineEl.innerHTML = list
          .map(
            (ev) => `
              <div class="item">
                <div class="when">${formatDateTime(ev.data_evento)}</div>
                <div class="type">${escapeHtml(ev.tipo || "-")} · origem: ${escapeHtml(ev.origem || "-")}</div>
                <div class="desc">${escapeHtml(ev.descricao || "")}</div>
              </div>
            `
          )
          .join("");
      }
    }
    if (drawer) {
      drawer.classList.remove("hidden");
    }
    
  } catch (error) {
    console.error("[processos] erro ao abrir timeline", error);
    alert("Não foi possível carregar a timeline do processo.");
  }
}

function bindTimelineEvents() {
  document.addEventListener("click", (event) => {
    const target = event.target;
    const button = target instanceof Element ? target.closest("[data-open-timeline]") : null;
    if (!button) return;
    const processId = button.getAttribute("data-open-timeline");
    openTimeline(processId);
  });

  if (drawerClose) {
    drawerClose.addEventListener("click", () => {
      drawer?.classList.add("hidden");
    });
  }
}

async function handleCsvImport(file) {
  if (!file) return;
  if (!oab) return alert("Informe a OAB (apenas números)");
  try {
    const text = await file.text();
    if (!text.trim()) {
      alert("O arquivo CSV está vazio.");
      return;
    }
    const result = await apiFetch("/processes/import-csv", {
      method: "POST",
      headers: { "Content-Type": "text/plain; charset=utf-8" },
      body: text,
    });
    const created = result?.created ?? 0;
    const updated = result?.updated ?? 0;
    const skipped = result?.skipped ?? 0;
    alert(`Importação concluída. Registros: ${result?.rows ?? 0}. Criados: ${created}. Atualizados: ${updated}. Ignorados: ${skipped}.`);
    await loadProcesses();
  } catch (error) {
    console.error("[processos] erro ao importar CSV", error);
    alert(error?.message || "Falha ao importar CSV");
  }
}

function bindActions() {
  if (searchBtn) {
    searchBtn.addEventListener("click", () => loadProcesses());
  }
document.querySelectorAll(".filters input").forEach((input) => {
    input.addEventListener("keydown", (event) => {
      if (event.key === "Enter") {
        event.preventDefault();
        loadProcesses();
      }
    });
  });

  if (importBtn && csvInput) {
    importBtn.addEventListener("click", () => csvInput.click());
    csvInput.addEventListener("change", async (event) => {
      const file = event.target?.files?.[0];
      await handleCsvImport(file);
      event.target.value = "";
    });
  }
}

async function bootstrap() {
  const user = await ensureAuthOrRedirect();
  if (!user) return;

  bindLogoutHandlers();
  toggleSidebarMenu();
  initSidebarLogoutSync();
  bindActions();
  bindTimelineEvents();
  await loadProcesses();
}

bootstrap();