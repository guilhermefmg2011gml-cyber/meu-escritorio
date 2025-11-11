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

const TEMPLATE_CONFIG = {
  peticao_inicial: {
    blocks: [
      "preambulo",
      "dos_fatos",
      "fundamentacao_juridica",
      "jurisprudencia",
      "dos_pedidos",
      "valor_da_causa",
    ],
    required: ["partes", "resumo_fatico"],
  },
  contestacao: {
    blocks: [
      "preambulo",
      "preliminares",
      "impugnacao_aos_fatos",
      "fundamentacao_juridica",
      "provas",
      "pedidos_finais",
    ],
    required: ["partes", "resumo_fatico"],
  },
  replica: {
    blocks: [
      "preambulo",
      "impugnacao_aos_argumentos",
      "reforco_das_teses",
      "jurisprudencia",
      "pedidos",
    ],
    required: ["partes", "resumo_fatico"],
  },
  tutela_urgencia: {
    blocks: [
      "preambulo",
      "fumus_boni_iuris",
      "periculum_in_mora",
      "fundamentacao_juridica",
      "pedidos_antecipatorios",
    ],
    required: ["partes", "resumo_fatico"],
  },
  agravo_instrumento: {
    blocks: [
      "preambulo",
      "exposicao_dos_fatos",
      "fundamentacao_juridica",
      "requerimentos",
      "documentos_obrigatorios",
    ],
    required: ["partes", "resumo_fatico"],
  },
  pedido_saneamento: {
    blocks: [
      "preambulo",
      "pontos_controvertidos",
      "medidas_propostas",
      "fundamentacao",
      "pedidos",
    ],
    required: ["partes", "resumo_fatico"],
  },
  producao_provas: {
    blocks: ["preambulo", "justificativa", "tipos_provas", "fundamentacao", "pedidos"],
    required: ["resumo_fatico"],
  },
  interlocutoria: {
    blocks: ["preambulo", "fundamentacao", "pedido"],
    required: ["resumo_fatico"],
  },
  manifestacao: {
    blocks: ["preambulo", "resposta_argumentos", "fundamentacao", "conclusao"],
    required: ["resumo_fatico"],
  },
  quesitos: {
    blocks: ["introducao", "perguntas", "fundamento_tecnico"],
    required: ["resumo_fatico"],
  },
  memoriais: {
    blocks: [
      "preambulo",
      "resumo_dos_fatos",
      "teses_defendidas",
      "jurisprudencia_aplicavel",
      "conclusao",
    ],
    required: ["resumo_fatico"],
  },
  apelacao: {
    blocks: [
      "preambulo",
      "resumo_da_decisao",
      "fundamentacao",
      "reforma_pleiteada",
      "pedidos",
    ],
    required: ["resumo_fatico"],
  },
};

const PAPEL_OPTIONS = [
  { value: "autor", label: "Autor(a)" },
  { value: "reu", label: "Réu/Ré" },
  { value: "terceiro", label: "Terceiro" },
];

let partesObrigatorias = true;
let currentPieceId = null;

function getTemplateConfig(tipo) {
  return TEMPLATE_CONFIG[tipo] || { blocks: [], required: ["partes", "resumo_fatico"] };
}

const REQUIRED_FIELD_LABEL = {
  partes: "partes",
  resumoFatico: "resumo fático",
  pedidos: "pedidos",
};

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
    const totalItens = container.querySelectorAll(".parte-item").length;
    if (partesObrigatorias && totalItens <= 1) {
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

function renderArtigosValidados(list, container, wrapper) {
  if (!wrapper || !container) return;

  container.innerHTML = "";

  if (!Array.isArray(list) || !list.length) {
    wrapper.classList.add("hidden");
    return;
  }

  wrapper.classList.remove("hidden");

  list.forEach((item) => {
    const li = document.createElement("li");

    const titulo = document.createElement("div");
    titulo.textContent = item.artigo || "Artigo não identificado";
    titulo.style.fontWeight = "600";
    li.appendChild(titulo);

    const status = document.createElement("div");
    status.classList.add("status");
    if (item.confirmado) {
      status.classList.add("ok");
      status.textContent = "✔️ Referência confirmada";
    } else {
      status.classList.add("warn");
      status.textContent = "⚠️ Referência não confirmada";
    }
    li.appendChild(status);

    if (item.referencia) {
      const link = document.createElement("a");
      link.href = item.referencia;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      link.textContent = "Ver jurisprudência relacionada";
      li.appendChild(link);
    }

    container.appendChild(li);
  });
}

function setFormDisabled(form, disabled) {
  form.querySelectorAll("input, textarea, select, button").forEach((el) => {
    if (el.id === "copiarTexto" || el.id === "exportarDocx") return;
    el.disabled = disabled;
  });
}

function updateExportButton(button) {
  if (!button) return;
  if (currentPieceId) {
    button.classList.remove("hidden");
    button.disabled = false;
  } else {
    button.classList.add("hidden");
    button.disabled = true;
  }
}

function updateTemplateHints(tipo, pedidosLabel, partesHelp) {
  const config = getTemplateConfig(tipo);
  partesObrigatorias = config.required.includes("partes");

  if (pedidosLabel) {
    const obrigatorio = config.required.includes("pedidos");
    pedidosLabel.textContent =
      "Pedidos (gerados automaticamente — utilize este campo para orientar, se desejar)";
  }

  if (partesHelp) {
    partesHelp.textContent = partesObrigatorias
      ? "Adicione as partes do processo e informe o papel de cada uma."
      : "Informe as partes quando necessário; este tipo de peça permite geração sem partes obrigatórias.";
  }
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
  const processoInput = document.getElementById("processoId");
  const gerarBtn = document.getElementById("btnGerarPeca");
  const resultadoCard = document.getElementById("resultadoCard");
  const textoGerado = document.getElementById("textoGerado");
  const jurisprudenciasLista = document.getElementById("jurisprudenciasLista");
  const copiarBtn = document.getElementById("copiarTexto");
  const exportarBtn = document.getElementById("exportarDocx");
  const pedidosLabel = document.querySelector('[data-field-label="pedidos"]');
  const partesHelp = document.getElementById("partesHelpText");

  if (!form || !tipoSelect || !partesContainer || !gerarBtn || !textoGerado || !jurisprudenciasLista) {
    console.error("[gerador] elementos obrigatórios não encontrados");
    return;
  }

  populateTipoSelect(tipoSelect);
  updateTemplateHints(tipoSelect.value, pedidosLabel, partesHelp);
  updateExportButton(exportarBtn);

  const addParte = (initialData = {}) => {
    const item = createParteItem(partesContainer, initialData);
    partesContainer.appendChild(item);
    updateParteTitles(partesContainer);
  };

  addParte();

  addParteBtn?.addEventListener("click", () => addParte());

  tipoSelect.addEventListener("change", () => {
    updateTemplateHints(tipoSelect.value, pedidosLabel, partesHelp);
  });

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

  exportarBtn?.addEventListener("click", async () => {
    if (!currentPieceId) return;

    const originalText = exportarBtn.textContent;
    try {
      exportarBtn.disabled = true;
      exportarBtn.textContent = "Gerando .docx...";
      const response = await window.API?.downloadLegalPieceDocx(currentPieceId);
      if (!response || !response.res || !response.res.ok) {
        const message = response?.res ? `Falha ao exportar (HTTP ${response.res.status})` : "Falha ao exportar";
        throw new Error(message);
      }

      const blob = response.blob;
      const downloadUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = `peca_${currentPieceId}.docx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      console.error("[gerador] falha ao exportar", error);
      const message = error instanceof Error ? error.message : "Não foi possível exportar a peça.";
      alert(message);
    } finally {
      exportarBtn.textContent = originalText;
      exportarBtn.disabled = !currentPieceId;
    }
  });

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const partes = collectPartes(partesContainer);
    const config = getTemplateConfig(tipoSelect.value);

    if (config.required.includes("partes") && !partes.length) {
      alert("Informe ao menos uma parte com nome válido.");
      return;
    }

    const resumo = resumoInput?.value.trim() || "";
    if (config.required.includes("resumo_fatico") && !resumo) {
      alert("O resumo fático é obrigatório para este tipo de peça.");
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

    const processoId = processoInput?.value.trim();
    if (processoId) {
      payload.processo_id = processoId;
    }

    try {
      setFormDisabled(form, true);
      gerarBtn.textContent = "Gerando...";
      gerarBtn.disabled = true;
      currentPieceId = null;
      updateExportButton(exportarBtn);

      const result = await window.API?.generateLegalPiece(payload);
      if (!result || !result.res || result.res.status !== 200) {
        if (result?.res?.status === 422) {
          const campos = Array.isArray(result.data?.campos)
            ? result.data.campos
                .map((campo) => REQUIRED_FIELD_LABEL[campo] || campo)
                .join(", ")
            : "";
          const message = result.data?.message || "Preencha todos os campos obrigatórios.";
          alert(campos ? `${message}\nCampos pendentes: ${campos}` : message);
          return;
        }
        const message = result?.data?.message || result?.data?.error || "Falha ao gerar peça.";
        throw new Error(message);
      }

      const data = result.data;
      textoGerado.value = data?.textoGerado || "";
      renderJurisprudencias(data?.jurisprudenciasSugeridas, jurisprudenciasLista);
      resultadoCard?.classList.remove("hidden");
      resultadoCard?.scrollIntoView({ behavior: "smooth", block: "start" });
      currentPieceId = data?.id || null;
      updateExportButton(exportarBtn);
    } catch (error) {
      console.error("[gerador] falha na geração", error);
      const message = error instanceof Error ? error.message : "Não foi possível gerar a peça.";
      alert(message);
    } finally {
      setFormDisabled(form, false);
      gerarBtn.textContent = "Gerar peça";
      gerarBtn.disabled = false;
      updateExportButton(exportarBtn);
    }
  });
}

init().catch((error) => console.error("[gerador] erro inesperado", error));