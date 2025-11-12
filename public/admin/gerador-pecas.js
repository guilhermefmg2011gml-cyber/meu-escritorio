import { ensureAuthOrRedirect, bindLogoutHandlers } from "../js/auth-guard.js";

await ensureAuthOrRedirect();
bindLogoutHandlers(document);

const API = window.API;
const chatWin = document.getElementById("chat-window");
const inputEl = document.getElementById("input");
const btnEnviar = document.getElementById("btn-enviar");
const btnRefinar = document.getElementById("btn-refinar");
const btnNovoChat = document.getElementById("btn-novo-chat");
const btnHistorico = document.getElementById("btn-historico");
const btnExportar = document.getElementById("btn-exportar");
const btnDownload = document.getElementById("btn-download");
const fileInput = document.getElementById("file");
const chips = document.getElementById("chips");
const toast = document.getElementById("toast");

const tipoPecaEl = document.getElementById("tipoPeca");
const clienteIdEl = document.getElementById("clienteId");
const processoIdEl = document.getElementById("processoId");
const docsEl = document.getElementById("docs");

const estado = {
  etapa: 0,
  dados: {
    tipo: tipoPecaEl?.value || "peticao_inicial",
    tipoTexto: "",
    resumo: "",
    pedidos: "",
    documentos: "",
    parte: "",
  },
  historico: [],
  ultimaPeca: null,
  ultimaPecaId: null,
  anexos: [],
};

const tipoLabel = {
  peticao_inicial: "Petição inicial",
  contestacao: "Contestação",
  replica: "Réplica",
  agravo_instrumento: "Agravo",
  apelacao: "Apelação",
   memoriais: "Memoriais",
  manifestacao: "Manifestação",
  recurso_especial: "Recurso Especial",
  };

function showToast(message, ok = false) {
  if (!toast) return;
  toast.textContent = message;
  toast.style.background = ok ? "var(--ok)" : "#1a1a1a";
  toast.classList.remove("hidden");
  window.clearTimeout(showToast._timeout);
  showToast._timeout = window.setTimeout(() => toast.classList.add("hidden"), 2600);
}

function addMsg(text, role = "bot") {
  if (!chatWin) return null;
  const el = document.createElement("div");
  el.className = `msg ${role}`;
  el.innerHTML = text.replace(/\n/g, "<br/>");
  chatWin.appendChild(el);
  chatWin.scrollTop = chatWin.scrollHeight;
  return el;
}

function addTyping() {
  if (!chatWin) return null;
  const el = document.createElement("div");
  el.className = "msg bot";
  el.innerHTML = '<div class="typing"><div class="dot"></div><div class="dot"></div><div class="dot"></div></div>';
  chatWin.appendChild(el);
  chatWin.scrollTop = chatWin.scrollHeight;
  return el;
}

function removeEl(el) {
  if (el && typeof el.remove === "function") {
    el.remove();
  }
}

function normalizarTipo(texto) {
  if (!texto) return null;
  const slug = texto
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  const entradas = Object.entries(tipoLabel);
  for (const [value, label] of entradas) {
    const base = `${value} ${label}`
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z\s]/g, " ")
      .replace(/\s+/g, " ")
      .trim();

    if (base.includes(slug) || slug.includes(base) || slug === label.toLowerCase()) {
      return value;
    }
  }
  return null;
}

function getPartesLista() {
  const partes = [];
  const nome = estado.dados.parte?.trim();
  if (nome) {
    partes.push({ nome, papel: "autor" });
  }
  return partes;
}

  function getPartesLista() {
  const partes = [];
  const nome = estado.dados.parte?.trim();
  if (nome) {
    partes.push({ nome, papel: "autor" });
  }
  return partes;
}

  function getContexto() {
  return {
    tipoPeca: tipoPecaEl?.value || estado.dados.tipo || "peticao_inicial",
    clienteId: clienteIdEl?.value.trim() || null,
    processoId: processoIdEl?.value.trim() || null,
    documentos: getDocumentosLista(),
    anexos: estado.anexos,
  };
}

  function storageKey() {
  const contexto = getContexto();
  return `mm_gerador_hist_${contexto.clienteId || "anon"}_${contexto.processoId || "semproc"}`;
}
  function saveHistory() {
  try {
    const payload = {
      historico: estado.historico,
      dados: estado.dados,
      etapa: estado.etapa,
      ultimaPeca: estado.ultimaPeca,
      ultimaPecaId: estado.ultimaPecaId,
    };
    localStorage.setItem(storageKey(), JSON.stringify(payload));
  } catch (error) {
    console.warn("[gerador] não foi possível salvar histórico", error);
  }
}
  function renderHistorico() {
  if (!chatWin) return;
  chatWin.innerHTML = "";
  if (!estado.historico.length) {
    addMsg(
      '👋 Olá! Vamos gerar sua peça <strong>passo a passo</strong>. Qual o <em>tipo de peça</em> você precisa?\n<small>Dica: você pode alterar o tipo na lateral e anexar PDFs.</small>'
    );
    return;
  }
  estado.historico.forEach((msg) => addMsg(msg.content, msg.role));
}

  function loadHistory() {
  try {
    const stored = localStorage.getItem(storageKey());
    if (!stored) return;
    const data = JSON.parse(stored);
    if (Array.isArray(data?.historico)) {
      estado.historico = data.historico;
    }
    if (data?.dados) {
      estado.dados = { ...estado.dados, ...data.dados };
      if (estado.dados.tipo && tipoPecaEl) {
        tipoPecaEl.value = estado.dados.tipo;
      }
      if (estado.dados.documentos && docsEl) {
        docsEl.value = estado.dados.documentos;
      }
    }
    if (typeof data?.etapa === "number") {
      estado.etapa = data.etapa;
    }
    estado.ultimaPeca = data?.ultimaPeca || null;
    estado.ultimaPecaId = data?.ultimaPecaId || null;
    btnDownload.disabled = !estado.ultimaPecaId;
  } catch (error) {
    console.warn("[gerador] não foi possível carregar histórico", error);
  } finally {
    renderHistorico();
  }
}

function pushHistorico(content, role) {
  estado.historico.push({ content, role });
  saveHistory();
}

function proximaEtapaMensagem() {
  switch (estado.etapa) {
    case 0:
      addMsg("Perfeito. Agora descreva brevemente os fatos relevantes do caso.");
      break;
    case 1:
      addMsg("Entendido. Quais são os pedidos principais que deseja incluir?");
      break;
    case 2:
      addMsg("Certo. Liste os documentos relevantes (procuração, contrato, etc.).");
      break;
    case 3:
      addMsg("Ótimo. Quem é a parte principal ou cliente? Informe o nome, por favor.");
      break;
    case 4:
      addMsg("Tudo pronto! Gerando a peça com base nas informações fornecidas...");
      break;
    default:
      addMsg("Se quiser refinar, descreva como devo ajustar ou inicie um novo chat.");
  }
}

function resetEtapas() {
  estado.etapa = 0;
  estado.dados = {
    tipo: tipoPecaEl?.value || "peticao_inicial",
    tipoTexto: "",
    resumo: "",
    pedidos: "",
    documentos: "",
    parte: "",
  };
}

async function gerarPeca() {
  const typing = addTyping();
  btnEnviar.disabled = true;
  btnRefinar.disabled = true;

try {
    const contexto = getContexto();
    const payload = {
      tipo_peca: contexto.tipoPeca,
      resumo_fatico: estado.dados.resumo || "",
      pedidos: estado.dados.pedidos || undefined,
      documentos: contexto.documentos.length ? contexto.documentos : undefined,
      cliente_id: contexto.clienteId || undefined,
      processo_id: contexto.processoId || undefined,
      partes: getPartesLista(),
    };

    const result = await API?.generateLegalPiece(payload);
    if (!result || !result.res) {
      throw new Error("Não foi possível conectar à API");
    }

    if (!result.res.ok) {
      if (result.res.status === 422) {
        const campos = Array.isArray(result.data?.campos) ? result.data.campos.join(", ") : "";
        const msg = result.data?.message || "Preencha todos os campos obrigatórios.";
        throw new Error(campos ? `${msg}\nCampos pendentes: ${campos}` : msg);
      }
      const message = result.data?.message || result.data?.error || `Falha ao gerar peça (HTTP ${result.res.status})`;
      throw new Error(message);
    }

    const data = result.data || {};
    const texto = data.textoGerado || "Peça gerada, revise o conteúdo.";
    estado.ultimaPeca = texto;
    estado.ultimaPecaId = data.id || null;
    estado.etapa = 5;
    btnDownload.disabled = !estado.ultimaPecaId;

    const tipoTexto = tipoLabel[contexto.tipoPeca] || contexto.tipoPeca;
    const detalhes = [
      `✅ Peça "${tipoTexto}" gerada com sucesso!`,
      estado.dados.resumo ? `• Fatos: ${estado.dados.resumo}` : null,
      estado.dados.pedidos ? `• Pedidos: ${estado.dados.pedidos}` : null,
      contexto.documentos.length ? `• Documentos: ${contexto.documentos.join(", ")}` : null,
      estado.dados.parte ? `• Parte principal: ${estado.dados.parte}` : null,
    ]
      .filter(Boolean)
      .join("\n");

    pushHistorico(detalhes, "bot");
    pushHistorico(texto, "bot");

    removeEl(typing);
    addMsg(detalhes, "bot");
    addMsg(texto, "bot");

    if (Array.isArray(data.jurisprudenciasSugeridas) && data.jurisprudenciasSugeridas.length) {
      const lista = data.jurisprudenciasSugeridas
        .map((item, index) => `${index + 1}. ${item.titulo || item.resumo || "Jurisprudência sugerida"}${item.url ? ` — ${item.url}` : ""}`)
        .join("\n");
      pushHistorico(lista, "bot");
      addMsg(`📚 Jurisprudências sugeridas:\n${lista}`, "bot");
    }

    showToast("Peça gerada", true);
    saveHistory();
  } catch (error) {
    removeEl(typing);
    const message = error instanceof Error ? error.message : "Erro inesperado ao gerar a peça.";
    addMsg(`❌ ${message}`, "bot");
    pushHistorico(`❌ ${message}`, "bot");
    showToast(message, false);
    estado.etapa = 4; // permite tentar novamente
  } finally {
    btnEnviar.disabled = false;
    btnRefinar.disabled = false;
  }
}

async function refinarMensagem() {
  const instrucao = inputEl?.value.trim();
  if (!instrucao) {
    showToast("Descreva como deseja refinar", false);
    return;
  }

  if (!estado.ultimaPeca) {
    showToast("Gere uma peça antes de refinar", false);
    return;
  }

  addMsg(`Refinar: ${instrucao}`, "user");
  pushHistorico(`Refinar: ${instrucao}`, "user");
  inputEl.value = "";
  const typing = addTyping();
  btnEnviar.disabled = true;
  btnRefinar.disabled = true;
    try {
    const contexto = getContexto();
    const payload = {
      tipo_peca: contexto.tipoPeca,
      topico: "Peça integral",
      conteudo_atual: estado.ultimaPeca,
      novas_informacoes: instrucao,
      cliente_id: contexto.clienteId || undefined,
      processo_id: contexto.processoId || undefined,
      partes: getPartesLista(),
    };

     const data = await API?.post("/admin/ai/gerador-pecas/aprimorar-topico", payload);
    if (!data) {
      throw new Error("Refino indisponível no momento");
    }

    const texto = data.textoReescrito || data.texto || "Refino aplicado.";
    estado.ultimaPeca = texto;
    addMsg(texto, "bot");
    pushHistorico(texto, "bot");
    showToast("Refino aplicado", true);
    saveHistory();
  } catch (error) {
    const message = error instanceof Error ? error.message : "Falha ao refinar.";
    addMsg(`❌ ${message}`, "bot");
    pushHistorico(`❌ ${message}`, "bot");
    showToast(message, false);
  } finally {
    removeEl(typing);
    btnEnviar.disabled = false;
    btnRefinar.disabled = false;
  }
}

function registrarMensagemUsuario(texto) {
  addMsg(texto, "user");
  pushHistorico(texto, "user");
}

async function enviarMensagem() {
  const texto = inputEl?.value.trim();
  if (!texto) return;
  inputEl.value = "";
  registrarMensagemUsuario(texto);

  if (estado.etapa === 0) {
    const tipo = normalizarTipo(texto);
    if (tipo && tipoPecaEl) {
      tipoPecaEl.value = tipo;
      estado.dados.tipo = tipo;
    }
    estado.dados.tipoTexto = texto;
    estado.etapa = 1;
    proximaEtapaMensagem();
    pushHistorico("Perfeito. Agora descreva brevemente os fatos relevantes do caso.", "bot");
    return;
  }
  if (estado.etapa === 1) {
    estado.dados.resumo = texto;
    estado.etapa = 2;
    proximaEtapaMensagem();
    pushHistorico("Entendido. Quais são os pedidos principais que deseja incluir?", "bot");
    return;

  }

  if (estado.etapa === 2) {
    estado.dados.pedidos = texto;
    estado.etapa = 3;
    proximaEtapaMensagem();
    pushHistorico("Certo. Liste os documentos relevantes (procuração, contrato, etc.).", "bot");
    return;
  }
  if (estado.etapa === 3) {
    estado.dados.documentos = texto;
    if (docsEl && !docsEl.value) {
      docsEl.value = texto;
    }
    estado.etapa = 4;
    proximaEtapaMensagem();
    pushHistorico("Ótimo. Quem é a parte principal ou cliente? Informe o nome, por favor.", "bot");
    return;

  }

  if (estado.etapa === 4) {
    estado.dados.parte = texto;
    await gerarPeca();
    return;
  }

  // Após geração, mensagens adicionais são tratadas como observações
  const aviso =
    "Mensagem registrada. Utilize o botão Refinar para ajustar ou inicie um novo chat para recomeçar.";
  addMsg(aviso, "bot");
  pushHistorico(aviso, "bot");
}

  function resetarChat() {
  estado.historico = [];
  estado.ultimaPeca = null;
  estado.ultimaPecaId = null;
  btnDownload.disabled = true;
  resetEtapas();
  saveHistory();
  renderHistorico();
  showToast("Novo chat iniciado", true);
}

async function baixarDocx() {
  if (!estado.ultimaPecaId) return;
  try {
    btnDownload.disabled = true;
    btnDownload.textContent = "Gerando .docx...";
    const response = await API?.downloadLegalPieceDocx(estado.ultimaPecaId);
    if (!response) {
      throw new Error("Download indisponível");
    }
    const blob = response.blob;
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `peca_${estado.ultimaPecaId}.docx`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast("Arquivo gerado", true);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Falha ao gerar arquivo.";
    showToast(message, false);
  } finally {
    btnDownload.textContent = "Baixar .docx";
    btnDownload.disabled = !estado.ultimaPecaId;
  }
}

function exportarConversa() {
  const texto = estado.historico
    .map((item) => `${item.role === "user" ? "Usuário" : "Assistente"}: ${item.content}`)
    .join("\n\n");
  const blob = new Blob([texto], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `conversa_${Date.now()}.txt`;
  a.click();
  URL.revokeObjectURL(url);
  showToast("Conversa exportada", true);
}

function registrarUploadLocal(files) {
  const lista = Array.from(files || []);
  if (!lista.length) return;
  lista.forEach((file) => {
    estado.anexos.push({
      name: file.name,
      size: file.size,
      lastModified: file.lastModified,
    });
  });
  const nomes = lista.map((file) => file.name).join(", ");
  addMsg(`📎 Anexos adicionados: ${nomes}`, "bot");
  pushHistorico(`📎 Anexos adicionados: ${nomes}`, "bot");
  saveHistory();
}

if (btnEnviar) {
  btnEnviar.addEventListener("click", enviarMensagem);
}

if (btnEnviar) {
  btnEnviar.addEventListener("click", enviarMensagem);
}

if (btnNovoChat) {
  btnNovoChat.addEventListener("click", resetarChat);
}

if (btnExportar) {
  btnExportar.addEventListener("click", exportarConversa);
}

if (btnDownload) {
  btnDownload.addEventListener("click", baixarDocx);
}

if (btnHistorico) {
  btnHistorico.addEventListener("click", () => {
    loadHistory();
    showToast("Histórico local carregado", true);
  });
}


if (fileInput) {
  fileInput.addEventListener("change", (event) => {
    registrarUploadLocal(event.target.files);
    fileInput.value = "";
  });
}

if (chips) {
  chips.addEventListener("click", (event) => {
    const chip = event.target.closest(".chip");
    if (!chip || !inputEl) return;
    const insert = chip.dataset.insert || chip.textContent || "";
    const existing = inputEl.value;
    inputEl.value = existing ? `${existing}\n${insert}` : insert;
    inputEl.focus();
  });
}

if (inputEl) {
  inputEl.addEventListener("keydown", (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      enviarMensagem();
    }
  });
}

if (tipoPecaEl) {
  tipoPecaEl.addEventListener("change", () => {
    estado.dados.tipo = tipoPecaEl.value;
    saveHistory();
  });
}

loadHistory();