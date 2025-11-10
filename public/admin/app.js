import { bindLogoutHandlers } from '../js/auth-guard.js';

(function () {
  const API = window.API;
  if (!API) {
    console.error('[app] API client não encontrado');
    return;
  }

  const menuBtn = document.querySelector('[data-menu]');
  const sidebar = document.querySelector('.sidebar');
  if (menuBtn && sidebar) {
    menuBtn.addEventListener('click', () => sidebar.classList.toggle('open'));
  }

  if (typeof bindLogoutHandlers === 'function') {
    bindLogoutHandlers();
  }

  const sidebarFrame = document.querySelector('.sidebar-frame');
    if (sidebarFrame) {
    sidebarFrame.addEventListener('load', () => {
      const doc = sidebarFrame.contentDocument || sidebarFrame.contentWindow?.document;
      if (doc) {
        bindLogoutHandlers(doc);
      }
    });
  }

  async function loadUsersCount() {
    const el = document.getElementById('kpi-usuarios');
    if (!el) return;

    try {
      const result = await API.adminUsers();
      if (!result || result.res.status !== 200) {
        console.warn('users request returned', result?.res?.status);
        el.textContent = '—';
        return;
      }
      const users = Array.isArray(result.data) ? result.data : [];
      el.textContent = users.length ? users.length : '0';
    } catch (error) {
      console.warn('Falha ao carregar quantidade de usuários', error);
      el.textContent = '—';
    }
  }
  
  async function loadAuditStatus() {
    const el = document.getElementById('kpi-eventos');
    if (!el) return;

    try {
      const result = await API.auditLatest();
      if (!result || result.res.status !== 200) {
        console.warn('audit/latest retornou', result?.res?.status);
        el.textContent = '—';
        return;
      }
      const logs = Array.isArray(result.data) ? result.data : [];
      el.textContent = logs.length ? 'Ativo' : '—';
    } catch (error) {
      console.warn('Falha ao carregar status de auditoria', error);
      el.textContent = '—';
    }
  }

  function geradorDePecasInteligentes() {
    const statusEl = document.getElementById('generator-status');
    const previewEl = document.getElementById('generator-preview');
    const buttonEl = document.getElementById('generator-run');

    if (!statusEl || !previewEl || !buttonEl) {
      return;
    }

    const tipos = ['Petição Inicial', 'Contestação', 'Manifestação', 'Memorial', 'Recurso Especial'];
    const cenarios = [
      'responsabilidade civil por danos materiais e morais',
      'cobrança de honorários contratuais inadimplidos',
      'revisão contratual em relação de consumo',
      'exceção de pré-executividade em execução fiscal',
      'pedido de tutela provisória em favor do cliente',
    ];
    const fundamentos = [
      'artigos 186 e 927 do Código Civil',
      'art. 14 do Código de Defesa do Consumidor',
      'art. 300 do Código de Processo Civil',
      'precedentes do STJ sobre a matéria em debate',
      'princípios da boa-fé objetiva e equilíbrio contratual',
    ];
    const pedidos = [
      'a procedência integral dos pedidos',
      'a condenação da parte adversa ao pagamento de custas e honorários',
      'a concessão de tutela antecipada para resguardar o direito do cliente',
      'a produção de todas as provas admitidas em direito',
      'a intimação das partes para audiência de conciliação',
    ];

    const pick = (list) => list[Math.floor(Math.random() * list.length)];

    const gerarRascunho = () => {
      const tipo = pick(tipos);
      const cenario = pick(cenarios);
      const fundamento = pick(fundamentos);
      const pedido = pick(pedidos);
      const processo = `${Math.floor(Math.random() * 9)}${String(Math.floor(Math.random() * 1_000_000)).padStart(6, '0')}-${Math.floor(Math.random() * 90)}.${Math.floor(Math.random() * 9)}.${Math.floor(Math.random() * 4)}`;
      const cliente = pick(['Maria de Souza', 'João Pereira', 'Empresa Alfa Ltda.', 'Clínica Vida Plena', 'Carlos Andrade']);

      return [
        `PEÇA: ${tipo.toUpperCase()}`,
        `Processo nº ${processo}`,
        `Cliente: ${cliente}`,
        '',
        'I - DOS FATOS',
        `Relata-se, em síntese, situação envolvendo ${cenario}, com documentos comprobatórios anexos ao dossiê digital.`,
        '',
        'II - DO DIREITO',
        `A pretensão encontra respaldo em ${fundamento}, destacando-se jurisprudência atualizada favorável à tese.`,
        '',
        'III - DOS PEDIDOS',
        `Diante do exposto, requer ${pedido}, sem prejuízo de outras medidas necessárias para resguardar o direito.`,
        '',
        'Termos em que, pede deferimento.',
        `${new Date().toLocaleDateString('pt-BR')} — Elaborado automaticamente pelo assistente inteligente.`,
      ].join('\n');
    };

    statusEl.textContent = 'Pronto para uso';
    const originalButtonLabel = buttonEl.textContent;

    if (!previewEl.dataset.placeholder) {
      previewEl.dataset.placeholder = previewEl.textContent || '';
    }

    const handleClick = () => {
      buttonEl.disabled = true;
      buttonEl.textContent = 'Gerando...';
      statusEl.textContent = 'Gerando rascunho com base no histórico recente...';

      window.setTimeout(() => {
        const texto = gerarRascunho();
        previewEl.textContent = texto;
        previewEl.classList.remove('muted');
        statusEl.textContent = `Última geração: ${new Date().toLocaleString('pt-BR')}`;
        buttonEl.disabled = false;
        buttonEl.textContent = originalButtonLabel;
      }, 350);
    };

    if (buttonEl.dataset.generatorBound !== 'true') {
      buttonEl.dataset.generatorBound = 'true';
      buttonEl.addEventListener('click', handleClick);
    }
  }

  loadUsersCount();
  loadAuditStatus();
  geradorDePecasInteligentes();
})();
