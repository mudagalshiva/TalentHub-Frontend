(function () {
  const pages = [
    ["index.html", "Home"],
    ["jobs.html", "Jobs"],
    ["company.html", "Companies"],
    ["applications.html", "Applications"],
    ["ai-career.html", "🤖 AI Career"]
  ];

  function currentFile() {
    const file = location.pathname.split("/").pop();
    return file || "index.html";
  }

  function dashboardForRole(role) {
    if (role === "ADMIN") return "admin-dashboard.html";
    if (role === "RECRUITER") return "recruiter-dashboard.html";
    return "candidate-dashboard.html";
  }

  function renderNavbar() {
    const mount = document.querySelector("[data-component='navbar']");
    if (!mount) return;
    const user = window.TalentAPI.getUser();
    const active = currentFile();
    const links = pages.map(([href, label]) => `<a href="${href}" class="${active === href ? "active" : ""}">${label}</a>`).join("");
    mount.innerHTML = `
      <header class="topbar">
        <div class="container nav-inner">
          <a class="brand" href="index.html" aria-label="TalentHub home">
            <span class="brand-mark"><i class="fa-solid fa-briefcase"></i></span>
            <span>TalentHub</span>
          </a>
          <nav class="nav-links" id="navLinks">${links}</nav>
          <div class="nav-actions">
            <button class="icon-btn" id="themeToggle" aria-label="Toggle theme"><i class="fa-solid fa-moon"></i></button>
            ${user ? `<a class="btn btn-secondary" href="${dashboardForRole(user.role)}"><i class="fa-solid fa-gauge-high"></i>Dashboard</a><button class="btn btn-primary" id="logoutBtn"><i class="fa-solid fa-right-from-bracket"></i>Logout</button>` : `<a class="btn btn-secondary" href="login.html">Login</a><a class="btn btn-primary" href="register.html">Join now</a>`}
            <button class="mobile-toggle" id="mobileToggle" aria-label="Open menu"><i class="fa-solid fa-bars"></i></button>
          </div>
        </div>
      </header>
    `;
  }

  function renderFooter() {
    const mount = document.querySelector("[data-component='footer']");
    if (!mount) return;
    mount.innerHTML = `
      <footer class="footer">
        <div class="container">
          <div class="footer-grid">
            <div>
              <a class="brand" href="index.html"><span class="brand-mark"><i class="fa-solid fa-briefcase"></i></span><span>TalentHub</span></a>
              <p class="muted" style="margin-top:14px">A focused hiring workspace for candidates, recruiters, and operations teams.</p>
            </div>
            <div>
              <h4>Product</h4>
              <a href="jobs.html">Browse jobs</a>
              <a href="saved-jobs.html">Saved jobs</a>
              <a href="applications.html">Applications</a>
            </div>
            <div>
              <h4>Teams</h4>
              <a href="recruiter-dashboard.html">Recruiters</a>
              <a href="candidate-dashboard.html">Candidates</a>
              <a href="admin-dashboard.html">Admins</a>
            </div>
            <div>
              <h4>Company</h4>
              <a href="company.html">Companies</a>
              <a href="profile.html">Profile</a>
              <a href="create-job.html">Post a job</a>
            </div>
          </div>
          <div class="footer-bottom">
            <span>© ${new Date().getFullYear()} TalentHub. All rights reserved.</span>
            <span><i class="fa-solid fa-shield-halved"></i> Secure hiring workspace</span>
          </div>
        </div>
      </footer>
    `;
  }

  function renderUtilities() {
    if (!document.querySelector(".toast-stack")) {
      document.body.insertAdjacentHTML("beforeend", `<div class="toast-stack" id="toastStack"></div>`);
    }
    if (!document.querySelector(".loader-overlay")) {
      document.body.insertAdjacentHTML("beforeend", `<div class="loader-overlay" id="loaderOverlay"><div class="spinner" aria-label="Loading"></div></div>`);
    }
    if (!document.querySelector(".modal-backdrop")) {
      document.body.insertAdjacentHTML("beforeend", `
        <div class="modal-backdrop" id="modalBackdrop" role="dialog" aria-modal="true">
          <div class="modal">
            <div class="modal-head"><h3 id="modalTitle">TalentHub</h3><button class="icon-btn" data-modal-close aria-label="Close"><i class="fa-solid fa-xmark"></i></button></div>
            <div class="modal-body" id="modalBody"></div>
            <div class="modal-foot" id="modalFoot"></div>
          </div>
        </div>
      `);
    }
  }

  function bindSharedEvents() {
    const mobileToggle = document.getElementById("mobileToggle");
    const navLinks = document.getElementById("navLinks");
    if (mobileToggle && navLinks) {
      mobileToggle.addEventListener("click", () => navLinks.classList.toggle("open"));
    }

    const logoutBtn = document.getElementById("logoutBtn");
    if (logoutBtn) logoutBtn.addEventListener("click", window.TalentAuth.logout);

    const themeToggle = document.getElementById("themeToggle");
    if (themeToggle) {
      themeToggle.addEventListener("click", () => {
        const next = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
        localStorage.setItem("talenthub_theme", next);
        document.documentElement.dataset.theme = next;
      });
    }

    document.addEventListener("click", (event) => {
      if (event.target.matches("[data-modal-close]") || event.target.closest("[data-modal-close]")) closeModal();
      if (event.target.id === "modalBackdrop") closeModal();
    });
  }

  function toast(message, type = "info") {
    const stack = document.getElementById("toastStack");
    if (!stack) return;
    const item = document.createElement("div");
    item.className = "toast";
    item.style.background = type === "success" ? "#166534" : type === "error" ? "#991b1b" : type === "warning" ? "#92400e" : "#172033";
    item.textContent = message;
    stack.appendChild(item);
    setTimeout(() => item.remove(), 4200);
  }

  function loading(show) {
    const overlay = document.getElementById("loaderOverlay");
    if (overlay) overlay.classList.toggle("open", Boolean(show));
  }

  function openModal(title, body, foot) {
    document.getElementById("modalTitle").textContent = title;
    document.getElementById("modalBody").innerHTML = body;
    document.getElementById("modalFoot").innerHTML = foot || `<button class="btn btn-primary" data-modal-close>Done</button>`;
    document.getElementById("modalBackdrop").classList.add("open");
    document.body.classList.add("no-scroll");
  }

  function closeModal() {
    const modal = document.getElementById("modalBackdrop");
    if (modal) modal.classList.remove("open");
    document.body.classList.remove("no-scroll");
  }

  function emptyState(title, text, icon = "fa-magnifying-glass") {
    return `<div class="empty-state card"><i class="fa-solid ${icon}"></i><h3>${title}</h3><p>${text}</p></div>`;
  }

  function skeletonCards(count = 3) {
    return Array.from({ length: count }, () => `<div class="skeleton"></div>`).join("");
  }

  document.documentElement.dataset.theme = localStorage.getItem("talenthub_theme") || "light";
  document.addEventListener("DOMContentLoaded", () => {
    renderNavbar();
    renderFooter();
    renderUtilities();
    bindSharedEvents();
  });

  window.TalentUI = {
    toast,
    loading,
    openModal,
    closeModal,
    emptyState,
    skeletonCards,
    dashboardForRole
  };
})();
