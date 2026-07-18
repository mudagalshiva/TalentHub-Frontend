(function () {
  const api = window.TalentAPI;

  function rolePath(role) {
    return window.TalentUI.dashboardForRole(api.normalizeRole(role));
  }

  function requireAuth(roles) {
    const user = api.getUser();
    if (!api.getToken() || !user) {
      location.href = `login.html?redirect=${encodeURIComponent(location.pathname.split("/").pop() || "index.html")}`;
      return null;
    }
    if (roles && roles.length && !roles.includes(user.role)) {
      location.href = rolePath(user.role);
      return null;
    }
    return user;
  }

  function hydrateUser(data) {
    const token = data?.token || data?.jwt || data?.accessToken || data?.access_token;
    const rawUser = data?.user || data?.data?.user || data;
    const user = {
      id: rawUser?.id || rawUser?.userId || rawUser?.sub,
      name: rawUser?.name || rawUser?.fullName || rawUser?.username || rawUser?.email || "TalentHub user",
      email: rawUser?.email || rawUser?.username,
      role: api.normalizeRole(rawUser?.role || rawUser?.roles || rawUser?.authorities)
    };
    return { token, user };
  }

  function setButtonLoading(button, isLoading, text) {
    if (!button) return;
    button.disabled = isLoading;
    if (isLoading) {
      button.dataset.originalText = button.innerHTML;
      button.innerHTML = `<i class="fa-solid fa-circle-notch fa-spin"></i>${text || "Working..."}`;
    } else if (button.dataset.originalText) {
      button.innerHTML = button.dataset.originalText;
    }
  }

  function validateRequired(form) {
    let valid = true;
    form.querySelectorAll("[required]").forEach((field) => {
      const group = field.closest(".form-group");
      const error = group?.querySelector(".field-error");
      if (!field.value.trim()) {
        valid = false;
        if (error) error.textContent = "This field is required.";
      } else if (field.type === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(field.value)) {
        valid = false;
        if (error) error.textContent = "Enter a valid email address.";
      } else {
        if (error) error.textContent = "";
      }
    });
    return valid;
  }

  async function handleLogin(event) {
    event.preventDefault();
    const form = event.currentTarget;
    if (!validateRequired(form)) return;
    const submit = form.querySelector("[type='submit']");
    setButtonLoading(submit, true, "Signing in...");
    try {
      const data = await api.post("/auth/login", {
        email: form.email.value.trim(),
        username: form.email.value.trim(),
        password: form.password.value
      });
      const session = hydrateUser(data);
      if (!session.token) throw new Error("Login succeeded but no JWT token was returned.");
      api.setSession(session.token, session.user);
      if (form.remember?.checked) localStorage.setItem("talenthub_remember_email", form.email.value.trim());
      const params = new URLSearchParams(location.search);
      location.href = params.get("redirect") || rolePath(session.user.role);
    } catch (error) {
      window.TalentUI.toast(error.message, "error");
    } finally {
      setButtonLoading(submit, false);
    }
  }

  async function handleRegister(event) {
    event.preventDefault();
    const form = event.currentTarget;
    if (!validateRequired(form)) return;
    if (form.password.value.length < 8) {
      form.password.closest(".form-group").querySelector(".field-error").textContent = "Use at least 8 characters.";
      return;
    }
    if (form.password.value !== form.confirmPassword.value) {
      form.confirmPassword.closest(".form-group").querySelector(".field-error").textContent = "Passwords do not match.";
      return;
    }
    const submit = form.querySelector("[type='submit']");
    setButtonLoading(submit, true, "Creating account...");
    try {
      const payload = {
        name: form.name.value.trim(),
        fullName: form.name.value.trim(),
        email: form.email.value.trim(),
        password: form.password.value,
        role: form.role.value,
        companyName: form.companyName?.value.trim()
      };
      const data = await api.post("/auth/register", payload);
      const session = hydrateUser(data);
      if (session.token) {
        api.setSession(session.token, session.user);
        location.href = rolePath(session.user.role);
      } else {
        window.TalentUI.toast("Account created. Please sign in.", "success");
        location.href = "login.html";
      }
    } catch (error) {
      window.TalentUI.toast(error.message, "error");
    } finally {
      setButtonLoading(submit, false);
    }
  }

  function bindAuthPages() {
    const loginForm = document.getElementById("loginForm");
    if (loginForm) {
      loginForm.email.value = localStorage.getItem("talenthub_remember_email") || "";
      loginForm.addEventListener("submit", handleLogin);
      document.getElementById("forgotPassword")?.addEventListener("click", () => {
        window.TalentUI.openModal("Forgot password", `<p class="muted">Enter the email connected to your account.</p><div class="form-group"><label>Email</label><input class="input" id="resetEmail" type="email" value="${loginForm.email.value || ""}"></div>`, `<button class="btn btn-secondary" data-modal-close>Cancel</button><button class="btn btn-primary" id="sendReset">Send link</button>`);
        document.getElementById("sendReset").addEventListener("click", async () => {
          try {
            await api.post("/auth/forgot-password", { email: document.getElementById("resetEmail").value.trim() });
            window.TalentUI.toast("Reset link requested.", "success");
            window.TalentUI.closeModal();
          } catch (error) {
            window.TalentUI.toast(error.message, "error");
          }
        });
      });
    }

    const registerForm = document.getElementById("registerForm");
    if (registerForm) {
      registerForm.addEventListener("submit", handleRegister);
      const role = registerForm.role;
      const companyGroup = document.getElementById("companyNameGroup");
      role.addEventListener("change", () => companyGroup.classList.toggle("hidden", role.value !== "RECRUITER"));
    }
  }

  function logout() {
    api.clearSession();
    window.TalentUI.toast("You have been signed out.", "success");
    setTimeout(() => {
      location.href = "login.html";
    }, 450);
  }

  document.addEventListener("DOMContentLoaded", bindAuthPages);

  window.TalentAuth = {
    requireAuth,
    logout,
    rolePath,
    validateRequired,
    setButtonLoading
  };
})();
