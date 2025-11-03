function currentSegment() {
  try {
    const topLocation = window.top?.location;
    const path = topLocation?.pathname || window.location.pathname;
    const segments = path.split('/').filter(Boolean);
    const last = segments.pop();
    const file = last && last !== 'admin' ? last : 'app.html';
    return file.split('?')[0];
  } catch (err) {
    console.warn('[sidebar] não foi possível determinar segmento atual', err);
    return 'app.html';
  }
}

function highlightActiveLink() {
  const segment = currentSegment();
  document.querySelectorAll('.nav a[href]').forEach((link) => {
    const href = link.getAttribute('href');
    if (!href) return;
    const last = href.split('/').filter(Boolean).pop();
    if (!last) return;
    const target = last.split('?')[0];
    if (target === segment) {
      link.classList.add('active');
    } else {
      link.classList.remove('active');
    }
  });
}

function bindLogout() {
  const handleClick = async (event) => {
    event.preventDefault();
    const performLogout = window.top?.__mmLogout || window.__mmLogout;

    if (typeof performLogout === 'function') {
      await performLogout();
      return;
    }

    const target = window.top || window;
    target.location.href = '/login.html';
  };

  document.querySelectorAll('[data-logout]').forEach((el) => {
    if (el.dataset.logoutBound === 'true') return;
    el.dataset.logoutBound = 'true';
    el.addEventListener('click', handleClick);
  });
}

highlightActiveLink();
bindLogout();

window.addEventListener('DOMContentLoaded', () => {
  highlightActiveLink();
  bindLogout();
});