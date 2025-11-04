import { ensureAuthOrRedirect } from "../js/auth-guard.js";
import { apiFetch, api } from "/js/api-client.js";

const params = new URLSearchParams(window.location.search);
const id = params.get("id");

if (!id) {
  alert("ID do processo não informado.");
  window.location.href = "/admin/processos.html";
  throw new Error("process_id_missing");
}

const titleEl = document.querySelector("#procTitle");
const cnjEl = document.querySelector("#infoCnj");
const courtEl = document.querySelector("#infoCourt");
const jurisdictionEl = document.querySelector("#infoJurisdiction");
const areaEl = document.querySelector("#infoArea");
const subjectEl = document.querySelector("#infoSubject");
const situationEl = document.querySelector("#infoSituation");
const statusEl = document.querySelector("#infoStatus");
const updatedEl = document.querySelector("#infoUpdated");
const partiesEl = document.querySelector("#partiesList");
const partyCard = document.querySelector("#partyCard");
const timelineEl = document.querySelector("#timeline");
const formEv = document.querySelector("#ev");

function formatDateTime(value) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleString("pt-BR");
}

function renderProcess(proc = {}) {
  if (titleEl) {
    titleEl.textContent = proc.cnj ? `Processo ${proc.cnj}` : `Processo #${proc.id || ""}`;
  }
  if (cnjEl) cnjEl.textContent = proc.cnj || "—";
  if (courtEl) courtEl.textContent = proc.court || proc.comarca || "—";
  if (jurisdictionEl) jurisdictionEl.textContent = proc.jurisdiction || "—";
  if (areaEl) areaEl.textContent = proc.area || proc.classe || "—";
  if (subjectEl) subjectEl.textContent = proc.subject || proc.assunto || "—";
  if (situationEl) situationEl.textContent = proc.situation || proc.situacao || "—";
  if (statusEl) statusEl.textContent = proc.status || "—";
  if (updatedEl) updatedEl.textContent = formatDateTime(proc.updated_at);
}

function renderParties(list = []) {
  if (!partiesEl) return;
  partiesEl.innerHTML = "";
  if (!Array.isArray(list) || !list.length) {
    partiesEl.textContent = "Nenhuma parte cadastrada.";
    return;
  }

  list.forEach((party) => {
    const item = document.createElement("div");
    item.className = "card party-item";

    const title = document.createElement("div");
    const roleText = party?.role ? `${party.role} — ` : "";
    title.textContent = `${roleText}${party?.name || "Nome não informado"}`;
    item.appendChild(title);

    const meta = document.createElement("div");
    meta.className = "muted";
    const pieces = [];
    if (party?.doc) pieces.push(party.doc);
    if (party?.oab) pieces.push(`OAB ${party.oab}`);
    meta.textContent = pieces.join(" · ");
    item.appendChild(meta);

    partiesEl.appendChild(item);
  });
}

function renderTimeline(events = []) {
  if (!timelineEl) return;
  timelineEl.innerHTML = "";
  if (!Array.isArray(events) || !events.length) {
    const empty = document.createElement("div");
    empty.className = "item";
    empty.textContent = "Sem eventos registrados.";
    timelineEl.appendChild(empty);
    return;
  }

  events.forEach((event) => {
    const item = document.createElement("div");
    item.className = "item";

    const when = document.createElement("div");
    when.className = "when";
    when.textContent = formatDateTime(event.data_evento);
    item.appendChild(when);

    const type = document.createElement("div");
    type.className = "type";
    const title = event.title || event.descricao || "Evento";
    type.textContent = `${title} · origem: ${event.origem || "-"}`;
    item.appendChild(type);

    const desc = document.createElement("div");
    desc.className = "desc";
    desc.textContent = event.descricao || event.title || "";
    item.appendChild(desc);

    if (event.detail) {
      const detail = document.createElement("div");
      detail.className = "detail";
      detail.textContent = typeof event.detail === "string" ? event.detail : JSON.stringify(event.detail);
      item.appendChild(detail);
    }

    timelineEl.appendChild(item);
  });
}

async function load() {
  await ensureAuthOrRedirect();
  try {
    const [proc, events] = await Promise.all([
      apiFetch(`/processes/${id}`),
      apiFetch(`/processes/${id}/events`),
    ]);
    renderProcess(proc);
    renderParties(proc?.parties || []);
    if (partyCard) {
      partyCard.classList.toggle("hidden", !proc?.parties?.length);
    }
    renderTimeline(events);
  } catch (error) {
    console.error("[processo] erro ao carregar", error);
    alert("Não foi possível carregar os dados do processo.");
  }
}

if (formEv) {
  formEv.addEventListener("submit", async (event) => {
    event.preventDefault();
    const data = new FormData(formEv);
    const at = data.get("at");
    try {
      await api.post(`/processes/${id}/events`, {
        title: data.get("title"),
        detail: data.get("detail"),
        at: at ? new Date(at).getTime() : undefined,
      });
      formEv.reset();
      await load();
    } catch (error) {
      console.error("[processo] erro ao adicionar evento", error);
      alert("Não foi possível adicionar o evento. Tente novamente.");
    }
  });
}

load();