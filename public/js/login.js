import API, { login as loginRequest, me } from "/js/api-client.js";

const form = document.querySelector("#loginForm");
const errorBox = document.querySelector("#error");
const submitBtn = form?.querySelector('button[type="submit"]');
const originalText = submitBtn?.textContent || "Entrar";

function showError(message) {
  if (!errorBox) return;
  errorBox.textContent = message;
  errorBox.style.display = "block";
}

function clearError() {
  if (!errorBox) return;
  errorBox.textContent = "";
  errorBox.style.display = "none";
}

async function checkSession() {
  try {
    const { res, data } = await me();
    if (res.status === 200 && data && data.user) {
      window.location.replace("/admin/app.html");
    }
  } catch (err) {
    console.debug("[login] nenhuma sessão ativa", err);
  }
}

async function handleSubmit(event) {
  event.preventDefault();
  clearError();
  if (!submitBtn) return;

  submitBtn.disabled = true;
  submitBtn.textContent = "Entrando...";

  const email = document.querySelector("#email")?.value.trim() || "";
  const password = document.querySelector("#password")?.value || "";

  try {
    const { res, data } = await loginRequest({ email, password });
    if (res.status === 200) {
      // garante que o token atualizado esteja disponível globalmente
      window.API = API;
      window.location.href = "/admin/app.html";
      return;
    }

    const message = data?.error || data?.message || "Falha ao entrar.";
    showError(message);
  } catch (error) {
    console.warn("[login] erro ao autenticar", error);
    showError("Erro ao autenticar. Tente novamente.");
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = originalText;
  }
}

if (form) {
  form.addEventListener("submit", handleSubmit);
  checkSession();
}