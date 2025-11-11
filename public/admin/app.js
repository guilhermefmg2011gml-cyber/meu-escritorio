import { bindLogoutHandlers, logout } from '../js/auth-guard.js';

(function () {
  if (typeof bindLogoutHandlers === 'function') {
    bindLogoutHandlers();
  }

  const openInNewTab = (url) => {
    if (!url) return;
    window.open(url, '_blank', 'noopener');
  };

  const handleCardAction = (card) => {
    const action = card.dataset.action;
    const href = card.dataset.href;

    if (action === 'logout') {
      logout();
      return;
    }

    if (href) {
      openInNewTab(href);
    }
  };

  const cards = document.querySelectorAll('[data-tool-card]');
  cards.forEach((card) => {
    card.addEventListener('click', (event) => {
      event.preventDefault();
      handleCardAction(card);
    });

    card.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        handleCardAction(card);
      }
    });
  });
})();