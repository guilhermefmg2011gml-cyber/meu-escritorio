import { ensureAuthOrRedirect, bindLogoutHandlers } from "../js/auth-guard.js";

const API = window.API;

const state = {
  loading: false,
};

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

function escapeHtml(str = "") {
  return String(str).replace(/[&<>"']/g, (ch) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  })[ch]);
}

function formatDate(value) {
  if (!value) return "";
  try {
    return new Date(value).toLocaleString("pt-BR");
  } catch (err) {
    return value;
  }
}

function toggle(el, show) {
  if (!el) return;
  el.classList.toggle("hidden", !show);
  if (el.classList.contains("drawer")) {
    el.classList.toggle("show", !!show);
  }
}

async function loadProcesses() {
  if (!API) return;
  if (state.loading) return;
  state.loading = true;
  const grid = document.querySelector("#gridProc tbody");
  if (grid) grid.innerHTML = `<tr><td colspan="6">Carregando...</td></tr>`;

  const q = document.querySelector("#fltQ").value.trim();
  const situacao = document.querySelector("#fltSit").value;

  try {
    const rows = await API.listProcesses({ q, situacao });
    if (grid) {
      if (!rows.length) {
        grid.innerHTML = `<tr><td colspan="6">Nenhum processo localizado.</td></tr>`;
      } else {
        grid.innerHTML = rows
          .map(
            (r) => `
              <tr data-id="${r.id}">
                <td><button class="linklike" data-open="${r.id}">${escapeHtml(r.numero || "")}</button></td>
                <td>${escapeHtml(r.classe || "")}</td>
                <td>${escapeHtml(r.assunto || "")}</td>
                <td>${escapeHtml(r.instancia || "")}</td>
                <td>${escapeHtml(r.situacao || "")}</td>
                <td>${escapeHtml(r.origem || "")}</td>
              </tr>
            `
          )
          .join("");
      }

      grid.querySelectorAll("[data-open]").forEach((btn) => {
        btn.addEventListener("click", () => openDrawer(btn.dataset.open));
      });
    }
  } catch (error) {
    console.error("[processos] falha ao carregar", error);
    if (grid) grid.innerHTML = `<tr><td colspan="6">Erro ao carregar processos.</td></tr>`;
  } finally {
    state.loading = false;
  }
}

async function salvarManual() {
  try {
    const payload = {
      numero: document.querySelector("#pNumero").value.trim(),
      classe: document.querySelector("#pClasse").value.trim(),
      assunto: document.querySelector("#pAssunto").value.trim(),
      foro: document.querySelector("#pForo").value.trim(),
      vara: document.querySelector("#pVara").value.trim(),
      instancia: document.querySelector("#pInstancia").value.trim(),
      situacao: document.querySelector("#pSituacao").value,
      polo_ativo: document.querySelector("#pAtivo").value.trim(),
      polo_passivo: document.querySelector("#pPassivo").value.trim(),
    };
    if (!payload.numero) {
      alert("Informe o número do processo");
      return;
    }
    const res = await API.createProcessManual(payload);
    if (res?.id) {
      toggle(document.querySelector("#modalProc"), false);
      await loadProcesses();
    } else {
      alert("Não foi possível salvar");
    }
  } catch (error) {
    console.error("[processos] falha ao salvar", error);
    alert("Erro ao salvar processo");
  }
}

async function openDrawer(id) {
  if (!id) return;
  try {
    const [meta, events] = await Promise.all([
      API.getProcessDetails(id),
      API.getProcessEvents(id),
    ]);

    const drawer = document.querySelector("#drawer");
    const dwTitle = document.querySelector("#dwTitle");
    const dwMeta = document.querySelector("#dwMeta");
    const dwEvents = document.querySelector("#dwEvents");

    if (dwTitle) dwTitle.textContent = meta?.numero || `Processo #${id}`;
    if (dwMeta) {
      dwMeta.innerHTML = `
        <div><strong>Classe:</strong> ${escapeHtml(meta?.classe || "")}</div>
        <div><strong>Assunto:</strong> ${escapeHtml(meta?.assunto || "")}</div>
        <div><strong>Instância:</strong> ${escapeHtml(meta?.instancia || "")}</div>
        <div><strong>Situação:</strong> ${escapeHtml(meta?.situacao || "")}</div>
      `;
    }
    if (dwEvents) {
      dwEvents.innerHTML = (events || [])
        .map(
          (ev) => `
            <li>
              <time>${formatDate(ev.data_mov)}</time>
              <div><strong>${escapeHtml(ev.movimento || "")}</strong></div>
              ${ev.complemento ? `<div>${escapeHtml(ev.complemento)}</div>` : ""}
              <small>origem: ${escapeHtml(ev.origem || "")}</small>
            </li>
          `
        )
        .join("");
    }
    toggle(drawer, true);
  } catch (error) {
    console.error("[processos] falha ao abrir drawer", error);
    alert("Não foi possível carregar detalhes do processo");
  }
}

async function executarPdpjTest() {
  try {
    const result = await API.pdpjPing();
    alert(result?.ok ? "PDPJ OK: token emitido" : "Falha ao testar PDPJ");
  } catch (error) {
    alert(`Falha PDPJ: ${error?.message || error}`);
  }
}

async function rodarSyncOAB() {
  const oab = document.querySelector("#oabNum").value.trim();
  const uf = document.querySelector("#oabUF").value.trim() || "GO";
  if (!oab) return alert("Informe a OAB (apenas números)");
  try {
    const result = await API.syncByOAB({ oab, uf, ingerir: true });
    if (result?.ok) {
      alert(`Sincronizado! Registros: ${result.total}. Inseridos: ${result.inseridos?.length || 0}`);
      toggle(document.querySelector("#modalOAB"), false);
      await loadProcesses();
    } else {
      alert(`Falha na sincronização: ${result?.error || "ver logs"}`);
    }
  } catch (error) {
    alert(`Falha na sincronização: ${error?.message || error}`);
  }
}

async function importarCSV() {
  const text = document.querySelector("#csvText").value.trim();
  if (!text) return alert("Cole seu CSV no campo.");
  try {
    const result = await API.importProcessesCSV(text);
    if (result?.ok) {
      alert(
        `Importado. Inseridos: ${result.inseridos} | Atualizados: ${result.atualizados} | Erros: ${result.erros}`
      );
      toggle(document.querySelector("#modalCSV"), false);
      await loadProcesses();
    } else {
      alert(`Falha ao importar: ${result?.error || "ver logs"}`);
    }
  } catch (error) {
    alert(`Falha ao importar: ${error?.message || error}`);
  }
}

function bindUiEvents() {
  document.querySelector("#btnBuscar")?.addEventListener("click", loadProcesses);
  document.querySelector("#btnNovoProc")?.addEventListener("click", () =>
    toggle(document.querySelector("#modalProc"), true)
  );
  document.querySelector("#fecharProc")?.addEventListener("click", () =>
    toggle(document.querySelector("#modalProc"), false)
  );
  document.querySelector("#salvarProc")?.addEventListener("click", salvarManual);

  document.querySelector("#btnPdpj")?.addEventListener("click", executarPdpjTest);

  document.querySelector("#btnSyncOAB")?.addEventListener("click", () =>
    toggle(document.querySelector("#modalOAB"), true)
  );
  document.querySelector("#fecharOAB")?.addEventListener("click", () =>
    toggle(document.querySelector("#modalOAB"), false)
  );
  document.querySelector("#rodarOAB")?.addEventListener("click", rodarSyncOAB);

  document.querySelector("#btnImportCSV")?.addEventListener("click", () =>
    toggle(document.querySelector("#modalCSV"), true)
  );
  document.querySelector("#btnCSVFechar")?.addEventListener("click", () =>
    toggle(document.querySelector("#modalCSV"), false)
  );
  document.querySelector("#btnCSVEnviar")?.addEventListener("click", importarCSV);

  document.querySelector("#dwClose")?.addEventListener("click", () =>
    toggle(document.querySelector("#drawer"), false)
  );
}

async function bootstrap() {
  const user = await ensureAuthOrRedirect();
  if (!user) return;

  bindLogoutHandlers();
  toggleSidebarMenu();
  initSidebarLogoutSync();
  bindUiEvents();
  await loadProcesses();
}

bootstrap();