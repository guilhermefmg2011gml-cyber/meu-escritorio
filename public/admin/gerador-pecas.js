import { ensureAuthOrRedirect, bindLogoutHandlers } from "../js/auth-guard.js";

const TIPOS_PECA = [
  "peticao_inicial",
  "contestacao",
  "replica",
  "agravo_instrumento",
  "pedido_saneamento",
  "producao_provas",
  "interlocutoria",
  "manifestacao",
  "quesitos",
  "memoriais",
  "apelacao",
  "tutela_urgencia",
];

const TIPO_LABEL = {
  peticao_inicial: "Petição inicial",
  contestacao: "Contestação",
  replica: "Réplica",
  agravo_instrumento: "Agravo de instrumento",
  pedido_saneamento: "Pedido de saneamento",
  producao_provas: "Produção de provas",
  interlocutoria: "Interlocutória",
  manifestacao: "Manifestação",
  quesitos: "Quesitos",
  memoriais: "Memoriais",
  apelacao: "Apelação",
  tutela_urgencia: "Tutela de urgência",
};

const PAPEL_OPTIONS = [
  { value: "autor", label: "Autor(a)" },
  { value: "reu", label: "Réu/Ré" },
  { value: "terceiro", label: "Terceiro" },
];

function createSelectOption(value, label) {
  const option = document.createElement("option");
  option.value = value;
  option.textContent = label;
  return option;
}

function populateTipoSelect(select) {
  select.innerHTML = "";
  TIPOS_PECA.forEach((tipo) => {
    const option = createSelectOption(tipo, TIPO_LABEL[tipo] || tipo);
    select.appendChild(option);
  });
}

function updateParteTitles(container) {
  container.querySelectorAll(".parte-item").forEach((item, index) => {
    const title = item.querySelector(".parte-item-title");
    if (title) {
      title.textContent = `Parte ${index + 1}`;
    }
  });
}

function createParteItem(container, initialData = {}) {
  const wrapper = document.createElement("div");
  wrapper.className = "parte-item";

  const header = document.createElement("div");
  header.className = "parte-item-header";

  const title = document.createElement("h5");
  title.className = "parte-item-title";
  title.textContent = "Parte";

  const removeButton = document.createElement("button");
  removeButton.type = "button";
  removeButton.className = "linklike parte-remove";
  removeButton.textContent = "Remover";
  removeButton.addEventListener("click", () => {
    if (container.querySelectorAll(".parte-item").length <= 1) {
      alert("É necessário manter ao menos uma parte cadastrada.");
      return;
    }
    wrapper.remove();
    updateParteTitles(container);
  });

  header.appendChild(title);
  header.appendChild(removeButton);

  const fields = document.createElement("div");
  fields.className = "parte-item-fields";

  const nomeLabel = document.createElement("label");
  nomeLabel.textContent = "Nome completo";
  const nomeInput = document.createElement("input");
  nomeInput.name = "nome";
  nomeInput.placeholder = "Nome da parte";
  nomeInput.required = true;
  nomeInput.value = initialData.nome || "";
  nomeLabel.appendChild(nomeInput);

  const papelLabel = document.createElement("label");
  papelLabel.textContent = "Papel";
  const papelSelect = document.createElement("select");
  papelSelect.name = "papel";
  papelSelect.required = true;
  PAPEL_OPTIONS.forEach((option) => {
    papelSelect.appendChild(createSelectOption(option.value, option.label));
  });
  papelSelect.value = initialData.papel || PAPEL_OPTIONS[0].value;
  papelLabel.appendChild(papelSelect);

  const qualLabel = document.createElement("label");
  qualLabel.textContent = "Qualificação (opcional)";
  const qualTextarea = document.createElement("textarea");
  qualTextarea.name = "qualificacao";
  qualTextarea.placeholder = "Dados de qualificação: estado civil, profissão, CPF/CNPJ, endereço...";
  qualTextarea.rows = 3;
  qualTextarea.value = initialData.qualificacao || "";
  qualLabel.style.gridColumn = "1 / -1";
  qualLabel.appendChild(qualTextarea);

  fields.appendChild(nomeLabel);
  fields.appendChild(papelLabel);
  fields.appendChild(qualLabel);

  wrapper.appendChild(header);
  wrapper.appendChild(fields);

  return wrapper;
}

function collectPartes(container) {
  const partes = [];
  container.querySelectorAll(".parte-item").forEach((item) => {
    const nome = item.querySelector('input[name="nome"]').value.trim();
    const papel = item.querySelector('select[name="papel"]').value;
    const qualificacao = item.querySelector('textarea[name="qualificacao"]').value.trim();

    if (!nome) return;

    const parte = { nome, papel };
    if (qualificacao) {
      parte.qualificacao = qualificacao;
    }
    partes.push(parte);
  });
  return partes;
}

function renderJurisprudencias(list, container) {
  container.innerHTML = "";
  if (!Array.isArray(list) || !list.length) {
    const empty = document.createElement("li");
    empty.textContent = "Nenhuma jurisprudência sugerida no momento.";
    container.appendChild(empty);
    return;
  }

  list.forEach((item) => {
    const li = document.createElement("li");
    if (item.titulo) {
      if (item.url) {
        const link = document.createElement("a");
        link.href = item.url;
        link.target = "_blank";
        link.rel = "noopener noreferrer";
        link.textContent = item.titulo;
        li.appendChild(link);
      } else {
        const title = document.createElement("strong");
        title.textContent = item.titulo;
        li.appendChild(title);
      }
    }

    if (item.resumo) {
      const p = document.createElement("p");
      p.textContent = item.resumo;
      li.appendChild(p);
    }

    if (item.publicadoEm) {
      const date = new Date(item.publicadoEm);
      if (!Number.isNaN(date.getTime())) {
        const small = document.createElement("small");
        small.textContent = `Publicado em ${date.toLocaleDateString("pt-BR")}`;
        small.style.color = "var(--muted)";
        li.appendChild(small);
      }
    }

    if (item.url && !item.titulo) {
      const link = document.createElement("a");
      link.href = item.url;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      link.textContent = "Acessar jurisprudência";
      li.appendChild(link);
    }

    container.appendChild(li);
  });
}

function setFormDisabled(form, disabled) {
  form.querySelectorAll("input, textarea, select, button").forEach((el) => {
    if (el.id === "copiarTexto") return;
    el.disabled = disabled;
  });
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

  const form = document.getElementById("generatorForm");
  const tipoSelect = document.getElementById("tipoPeca");
  const partesContainer = document.getElementById("partesContainer");
  const addParteBtn = document.getElementById("adicionarParte");
  const resumoInput = document.getElementById("resumoFatico");
  const pedidosInput = document.getElementById("pedidos");
  const documentosInput = document.getElementById("documentos");
  const clienteInput = document.getElementById("clienteId");
  const gerarBtn = document.getElementById("btnGerarPeca");
  const resultadoCard = document.getElementById("resultadoCard");
  const textoGerado = document.getElementById("textoGerado");
  const jurisprudenciasLista = document.getElementById("jurisprudenciasLista");
  const copiarBtn = document.getElementById("copiarTexto");

  if (!form || !tipoSelect || !partesContainer || !gerarBtn || !textoGerado || !jurisprudenciasLista) {
    console.error("[gerador] elementos obrigatórios não encontrados");
    return;
  }

  populateTipoSelect(tipoSelect);

  const addParte = (initialData = {}) => {
    const item = createParteItem(partesContainer, initialData);
    partesContainer.appendChild(item);
    updateParteTitles(partesContainer);
  };

  addParte();

  addParteBtn?.addEventListener("click", () => addParte());

  copiarBtn?.addEventListener("click", async () => {
    if (!textoGerado.value) {
      return;
    }
    try {
      await navigator.clipboard.writeText(textoGerado.value);
      const original = copiarBtn.textContent;
      copiarBtn.textContent = "Copiado!";
      setTimeout(() => {
        copiarBtn.textContent = original;
      }, 1500);
    } catch (error) {
      console.warn("[gerador] não foi possível copiar", error);
      alert("Não foi possível copiar o texto automaticamente. Copie manualmente.");
    }
  });

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const partes = collectPartes(partesContainer);
    if (!partes.length) {
      alert("Informe ao menos uma parte com nome válido.");
      return;
    }

    const resumo = resumoInput?.value.trim();
    if (!resumo) {
      alert("O resumo fático é obrigatório.");
      resumoInput?.focus();
      return;
    }

    const documentosRaw = documentosInput?.value || "";
    const documentosList = documentosRaw
      .split(/\r?\n|,/)
      .map((item) => item.trim())
      .filter(Boolean);

    const payload = {
      tipo_peca: tipoSelect.value,
      resumo_fatico: resumo,
      partes,
    };

    const pedidos = pedidosInput?.value.trim();
    if (pedidos) {
      payload.pedidos = pedidos;
    }

    if (documentosList.length) {
      payload.documentos = documentosList;
    }

    const clienteId = clienteInput?.value.trim();
    if (clienteId) {
      payload.cliente_id = clienteId;
    }

    try {
      setFormDisabled(form, true);
      gerarBtn.textContent = "Gerando...";
      gerarBtn.disabled = true;

      const result = await window.API?.generateLegalPiece(payload);
      if (!result || !result.res || result.res.status !== 200) {
        const message = result?.data?.message || result?.data?.error || "Falha ao gerar peça.";
        throw new Error(message);
      }

      const data = result.data;
      textoGerado.value = data?.textoGerado || "";
      renderJurisprudencias(data?.jurisprudenciasSugeridas, jurisprudenciasLista);
      resultadoCard?.classList.remove("hidden");
      resultadoCard?.scrollIntoView({ behavior: "smooth", block: "start" });
    } catch (error) {
      console.error("[gerador] falha na geração", error);
      const message = error instanceof Error ? error.message : "Não foi possível gerar a peça.";
      alert(message);
    } finally {
      setFormDisabled(form, false);
      gerarBtn.textContent = "Gerar peça";
      gerarBtn.disabled = false;
    }
  });
}

init().catch((error) => console.error("[gerador] erro inesperado", error));