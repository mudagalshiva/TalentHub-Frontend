(function () {
  const api = window.TalentAPI;
  const ui = window.TalentUI;
  const jobs = window.TalentJobs;

  function number(value) {
    return Number(value || 0).toLocaleString();
  }

  function stat(icon, label, value) {
    return `<article class="card stat-card"><i class="fa-solid ${icon}"></i><strong>${number(value)}</strong><span class="muted">${label}</span></article>`;
  }

  function bars(items) {
    const max = Math.max(...items.map((item) => item.value), 1);
    return `<div class="chart-bars">${items.map((item) => `<div class="bar-row"><span>${item.label}</span><div class="bar-track"><div class="bar-fill" style="width:${Math.max(6, item.value / max * 100)}%"></div></div><strong>${number(item.value)}</strong></div>`).join("")}</div>`;
  }

  function listItems(items, emptyText) {
    if (!items || !items.length) return ui.emptyState("Nothing here yet", emptyText, "fa-inbox");
    return items.slice(0, 5).map((item) => `
      <div class="row-between" style="padding:14px 0;border-bottom:1px solid var(--line)">
        <div>
          <strong>${item.title || item.jobTitle || item.name || "Item"}</strong>
          <div class="muted">${item.companyName || item.status || item.email || "Recently updated"}</div>
        </div>
        <span class="tag">${item.status || item.jobType || "Open"}</span>
      </div>
    `).join("");
  }

  async function loadCandidate() {
    const mount = document.getElementById("candidateDashboard");
    if (!mount) return;
    const user = window.TalentAuth.requireAuth(["CANDIDATE"]);
    if (!mount || !user) return;
    mount.innerHTML = ui.skeletonCards(4);
    try {
      const data = await api.get("/dashboard/candidate");
      const applications = data.applications || data.recentApplications || [];
      const saved = data.savedJobs || [];
      const recommended = data.recommendedJobs || [];
      mount.innerHTML = `
        <div class="grid grid-4">
          ${stat("fa-paper-plane", "Applications", data.totalApplications || applications.length)}
          ${stat("fa-bookmark", "Saved jobs", data.totalSavedJobs || saved.length)}
          ${stat("fa-eye", "Profile views", data.profileViews)}
          ${stat("fa-star", "Recommendations", recommended.length)}
        </div>
        <div class="dashboard-grid" style="margin-top:22px">
          <section class="card card-pad"><div class="row-between"><h2>Recent applications</h2><a class="btn btn-secondary" href="applications.html">View all</a></div>${listItems(applications, "Submitted applications will appear here.")}</section>
          <aside class="card card-pad"><h2>Resume</h2><p class="muted">Upload a current resume for one-click applications.</p><form id="resumeForm"><input class="input" type="file" name="resume" accept=".pdf,.doc,.docx"><button class="btn btn-primary btn-block" style="margin-top:12px">Upload resume</button></form></aside>
        </div>
        <section class="card card-pad" style="margin-top:22px"><h2>Recommended jobs</h2><div class="grid grid-3">${recommended.length ? recommended.map(jobs.jobCard).join("") : ui.emptyState("No recommendations yet", "Personalized roles will appear here as your profile grows.", "fa-wand-magic-sparkles")}</div></section>
      `;
      bindResume();
    } catch (error) {
      mount.innerHTML = ui.emptyState("Dashboard could not be loaded", error.message, "fa-triangle-exclamation");
    }
  }

  async function loadRecruiter() {
    const mount = document.getElementById("recruiterDashboard");
    if (!mount) return;
    const user = window.TalentAuth.requireAuth(["RECRUITER"]);
    if (!mount || !user) return;
    mount.innerHTML = ui.skeletonCards(4);
    try {
      const data = await api.get("/dashboard/recruiter");
      const recruiterJobs = data.jobs || data.activeJobs || [];
      const applications = data.applications || data.recentApplications || [];
      mount.innerHTML = `
        <div class="grid grid-4">
          ${stat("fa-briefcase", "Total jobs", data.totalJobs || recruiterJobs.length)}
          ${stat("fa-users", "Applications", data.totalApplications || applications.length)}
          ${stat("fa-calendar-check", "Interviews", data.interviews)}
          ${stat("fa-chart-line", "Views", data.totalViews)}
        </div>
        <div class="dashboard-grid" style="margin-top:22px">
          <section class="card card-pad"><div class="row-between"><h2>Manage jobs</h2><a class="btn btn-primary" href="create-job.html"><i class="fa-solid fa-plus"></i>Create job</a></div><div class="table-wrap">${jobsTable(recruiterJobs)}</div></section>
          <aside class="card card-pad"><h2>Pipeline</h2>${bars([{ label: "Applied", value: data.applied || applications.length }, { label: "Screening", value: data.screening }, { label: "Interview", value: data.interview }, { label: "Offer", value: data.offer }])}</aside>
        </div>
        <section class="card card-pad" style="margin-top:22px"><h2>Recent candidates</h2>${listItems(applications, "New applicants will appear here.")}</section>
      `;
      bindJobDelete();
    } catch (error) {
      mount.innerHTML = ui.emptyState("Dashboard could not be loaded", error.message, "fa-triangle-exclamation");
    }
  }

  function jobsTable(items) {
    if (!items.length) return ui.emptyState("No jobs posted", "Create a job to start receiving applications.", "fa-plus");
    return `<table class="table"><thead><tr><th>Role</th><th>Location</th><th>Status</th><th>Actions</th></tr></thead><tbody>${items.map((item) => {
      const id = item.id || item.jobId;
      return `<tr><td><strong>${item.title || item.jobTitle}</strong><div class="muted">${item.companyName || ""}</div></td><td>${item.location || "Remote"}</td><td><span class="tag tag-success">${item.status || "Open"}</span></td>

<td>

<div class="action-buttons">

<a
href="edit-job.html?id=${id}"
class="btn btn-secondary">

✏ Edit

</a>

<a
href="recruiter-applicants.html?jobId=${id}"
class="btn btn-primary">

👥 Applicants

</a>

<button
class="btn btn-danger"
data-delete-job="${id}">

🗑 Delete

</button>

</div>

</td></tr>`;
    }).join("")}</tbody></table>`;
  }

  async function loadAdmin() {
    const mount = document.getElementById("adminDashboard");
    if (!mount) return;
    const user = window.TalentAuth.requireAuth(["ADMIN"]);
    if (!mount || !user) return;
    mount.innerHTML = ui.skeletonCards(4);
    try {
      const data = await api.get("/dashboard/admin");
      mount.innerHTML = `
        <div class="grid grid-4">
          ${stat("fa-users", "Total users", data.totalUsers)}
          ${stat("fa-user-tie", "Recruiters", data.totalRecruiters)}
          ${stat("fa-user-graduate", "Candidates", data.totalCandidates)}
          ${stat("fa-briefcase", "Jobs", data.totalJobs)}
        </div>
        <div class="dashboard-grid" style="margin-top:22px">
          <section class="card card-pad"><h2>Platform activity</h2>${bars([{ label: "Users", value: data.totalUsers }, { label: "Jobs", value: data.totalJobs }, { label: "Applications", value: data.totalApplications }, { label: "Recruiters", value: data.totalRecruiters }])}</section>
          <aside class="card card-pad"><h2>Applications</h2><strong style="font-size:3rem">${number(data.totalApplications)}</strong><p class="muted">Total submitted applications</p></aside>
        </div>
        <section class="card card-pad" style="margin-top:22px"><h2>Recent records</h2><div class="table-wrap">${adminTable(data.recentUsers || data.users || [])}</div></section>
      `;
    } catch (error) {
      mount.innerHTML = ui.emptyState("Dashboard could not be loaded", error.message, "fa-triangle-exclamation");
    }
  }

  function adminTable(users) {
    if (!users.length) return ui.emptyState("No user records", "Recent platform records will appear here.", "fa-database");
    return `<table class="table"><thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Status</th></tr></thead><tbody>${users.map((user) => `<tr><td>${user.name || user.fullName || "User"}</td><td>${user.email || ""}</td><td>${user.role || "CANDIDATE"}</td><td><span class="tag tag-success">${user.status || "Active"}</span></td></tr>`).join("")}</tbody></table>`;
  }

  function bindResume() {
    document.getElementById("resumeForm")?.addEventListener("submit", async (event) => {
      event.preventDefault();
      try {
        await api.post("/resume/upload", new FormData(event.currentTarget));
        ui.toast("Resume uploaded.", "success");
      } catch (error) {
        ui.toast(error.message, "error");
      }
    });
  }

  function bindJobDelete() {
    document.querySelectorAll("[data-delete-job]").forEach((button) => {
      button.addEventListener("click", () => {
        const id = button.dataset.deleteJob;
        ui.openModal("Delete job", "<p>This job posting will be removed for candidates.</p>", `<button class="btn btn-secondary" data-modal-close>Cancel</button><button class="btn btn-danger" id="confirmDelete">Delete</button>`);
        document.getElementById("confirmDelete").addEventListener("click", async () => {
          try {
            await api.delete(`/jobs/${id}`);
            ui.toast("Job deleted.", "success");
            location.reload();
          } catch (error) {
            ui.toast(error.message, "error");
          }
        });
      });
    });
  }

  document.addEventListener("DOMContentLoaded", () => {
    loadCandidate();
    loadRecruiter();
    loadAdmin();
  });
})(); 
