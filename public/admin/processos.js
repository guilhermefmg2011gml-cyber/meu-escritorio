import { ensureAuthOrRedirect, bindLogoutHandlers } from '../js/auth-guard.js';

function escapeHtml(value) {
  if (value === null || value === undefined) return '';
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function formatDate(value) {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  try {
    return new Intl.DateTimeFormat('pt-BR').format(date);
  } catch (error) {
    console.warn('[cases] failed to format date', value, error);
    return '—';
  }
}

function formatStatus(status) {
  if (status === 'pendente') return { label: '⚠️ Pendente', className: 'pending' };
  if (!status) return { label: '—', className: '' };
  if (status === 'ok' || status === 'sincronizado') {
    return { label: '✅ Ok', className: 'ok' };
  }
  return { label: escapeHtml(status), className: '' };
}

function renderCaseCard(item) {
  const numero = escapeHtml(item.numero_cnj || '—');
  const tribunal = escapeHtml(item.tribunal || '—');
  const classe = escapeHtml(item.classe || '—');
  const assunto = escapeHtml(item.assunto || '—');
  const orgao = escapeHtml(item.orgao || '—');
  const atualizado = formatDate(item.atualizado_em);
  const prazo = formatDate(item.prazo_final);
  const status = formatStatus(item.status);

  return `
    <article class="case-card" data-case-id="${item.id}">
      <div class="case-number">${numero}</div>
      <div class="case-meta">
        <div><span>Tribunal</span>${tribunal}</div>
        <div><span>Órgão</span>${orgao || '—'}</div>
        <div><span>Classe</span>${classe || '—'}</div>
        <div><span>Assunto</span>${assunto || '—'}</div>
        <div><span>Atualizado em</span>${atualizado}</div>
        ${item.prazo_final ? `<div><span>Prazo final</span>${prazo}</div>` : ''}
      </div>
      <div class="case-status ${status.className}">${status.label}</div>
    </article>
  `;
}

function renderAlertCard(item) {
  const numero = escapeHtml(item.numero_cnj || '—');
  const tribunal = escapeHtml(item.tribunal || '—');
  const prazo = formatDate(item.prazo_final);
  const status = formatStatus(item.status);

  return `
    <article class="case-card alert" data-case-id="${item.id}">
      <div class="case-number">${numero}</div>
      <div class="case-meta">
        <div><span>Tribunal</span>${tribunal}</div>
        ${item.prazo_final ? `<div><span>Prazo final</span>${prazo}</div>` : ''}
      </div>
      <div class="case-status ${status.className}">${status.label}</div>
    </article>
  `;
}

async function init() {
  const user = await ensureAuthOrRedirect();
  if (!user) return;

  bindLogoutHandlers();

  const sidebarFrame = document.querySelector('.sidebar-frame');
  if (sidebarFrame) {
    sidebarFrame.addEventListener('load', () => {
      const doc = sidebarFrame.contentDocument || sidebarFrame.contentWindow?.document;
      if (doc) {
        bindLogoutHandlers(doc);
      }
    });
  }

  const form = document.getElementById('caseForm');
  const syncButton = document.getElementById('caseSync');
  const casesList = document.getElementById('casesList');
  const casesEmpty = document.getElementById('casesEmpty');
  const alertsList = document.getElementById('alertsList');
  const alertsEmpty = document.getElementById('alertsEmpty');
  const loadingIndicator = document.getElementById('casesLoading');

  if (!window.API) {
    console.error('[cases] API client não encontrado');
    return;
  }

  let cachedCases = [];
  const syncButtonDefault = syncButton ? syncButton.textContent : '';

  function toggleLoading(isLoading) {
    if (loadingIndicator) {
      loadingIndicator.classList.toggle('hidden', !isLoading);
    }
    if (syncButton) {
      syncButton.disabled = isLoading;
      syncButton.textContent = isLoading ? 'Sincronizando...' : syncButtonDefault || 'Sincronizar agora';
    }
  }

  function renderCases() {
    if (!casesList) return;
    const items = cachedCases.map((item) => renderCaseCard(item)).join('');
    casesList.innerHTML = items;
    if (casesEmpty) {
      casesEmpty.classList.toggle('hidden', cachedCases.length > 0);
    }
    if (cachedCases.length === 0 && casesList) {
      casesList.innerHTML = '';
    }
  }

  function renderAlerts() {
    if (!alertsList) return;
    const alerts = cachedCases.filter((item) => item.status === 'pendente' || !!item.prazo_final);
    alertsList.innerHTML = alerts.map((item) => renderAlertCard(item)).join('');
    if (alertsEmpty) {
      alertsEmpty.classList.toggle('hidden', alerts.length > 0);
    }
    if (alerts.length === 0) {
      alertsList.innerHTML = '';
    }
  }

  async function loadCases() {
    toggleLoading(true);
    try {
      const result = await window.API.casesList();
      if (!result || result.res.status !== 200 || !Array.isArray(result.data)) {
        throw new Error(`Resposta inesperada (${result?.res?.status})`);
      }
      cachedCases = result.data;
      renderCases();
      renderAlerts();
    } catch (error) {
      console.error('[cases] falha ao carregar processos', error);
      if (casesEmpty) {
        casesEmpty.textContent = 'Não foi possível carregar os processos.';
        casesEmpty.classList.remove('hidden');
      }
    } finally {
      toggleLoading(false);
    }
  }

  async function handleCreate(event) {
    event.preventDefault();
    if (!form) return;

    const formData = new FormData(form);
    const payload = {
      numero_cnj: formData.get('numero_cnj')?.toString().trim(),
      tribunal: formData.get('tribunal')?.toString().trim(),
      orgao: formData.get('orgao')?.toString().trim() || null,
      classe: formData.get('classe')?.toString().trim() || null,
      assunto: formData.get('assunto')?.toString().trim() || null,
    };

    if (!payload.numero_cnj || !payload.tribunal) {
      alert('Preencha número CNJ e tribunal.');
      return;
    }

    try {
      const result = await window.API.createCase(payload);
      if (!result || !result.res || !result.res.ok) {
        const message = result?.data?.error || 'Erro ao cadastrar processo.';
        alert(message);
        return;
      }
      form.reset();
      await loadCases();
      alert('Processo cadastrado com sucesso!');
    } catch (error) {
      console.error('[cases] erro ao cadastrar processo', error);
      alert('Erro na comunicação com o servidor.');
    }
  }

  async function handleSync() {
    try {
      toggleLoading(true);
      const result = await window.API.triggerCaseSync();
      if (!result || !result.res || !result.res.ok) {
        const message = result?.data?.error || 'Falha ao iniciar sincronização.';
        alert(message);
        return;
      }
      alert('Sincronização iniciada! Atualize a página em alguns minutos.');
    } catch (error) {
      console.error('[cases] erro ao iniciar sincronização', error);
      alert('Erro ao iniciar sincronização automática.');
    } finally {
      toggleLoading(false);
    }
  }

  if (form) {
    form.addEventListener('submit', handleCreate);
  }
  if (syncButton) {
    syncButton.addEventListener('click', handleSync);
  }

  await loadCases();
}

init();