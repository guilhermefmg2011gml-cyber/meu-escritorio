// Configuração global da API para ambientes estáticos.
// Em DESENVOLVIMENTO:
// public/config.js  (e também em dist/config.js se você subir o build manualmente)
//
// A URL abaixo deve apontar diretamente para a raiz da API (incluindo o sufixo /api).
// Ajuste conforme o ambiente utilizado.
window.APP_CONFIG = Object.assign({}, window.APP_CONFIG, {
  API_BASE: "https://mma-auth-api-production.up.railway.app/api",
});

// Normaliza a base para evitar barras duplicadas ao montar as URLs.
(function normalizeApiBase() {
  const fallback = "/api";
  let base = (window.APP_CONFIG && window.APP_CONFIG.API_BASE) || fallback;
  while (base.endsWith("/")) base = base.slice(0, -1);
  window.APP_CONFIG.API_BASE = base;
  window.buildApiUrl = function buildApiUrl(path) {
    const finalBase = (window.APP_CONFIG && window.APP_CONFIG.API_BASE) || fallback;
    const cleanPath = path.startsWith("/") ? path : `/${path}`;
    return `${finalBase}${cleanPath}`;
  };
})();

// Quando publicar o backend em outro serviço, troque por algo como:
// window.APP_CONFIG = { API_BASE: "https://SEU-PROJETO.up.railway.app/api" };