(function () {
  const token = localStorage.getItem("mma_token");
  if (!token) { window.location.href = "/login.html"; return; }

  function parseJwt(t) {
    try {
      const p = t.split(".")[1];
      return JSON.parse(atob(p.replace(/-/g,"+").replace(/_/g,"/")));
    } catch { return null; }
  }
  const payload = parseJwt(token);
  if (!payload) {
    localStorage.removeItem("mma_token");
    window.location.href = "/login.html";
  }
})();