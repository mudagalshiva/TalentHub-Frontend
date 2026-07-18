(function () {
  const api = window.TalentAPI;
  const ui = window.TalentUI;

  function userInitials(user) {
    return (user?.name || user?.email || "TH").split(/\s+/).map((part) => part[0]).join("").slice(0, 2).toUpperCase();
  }

  async function loadProfile() {
    const mount = document.getElementById("profilePage");
    if (!mount) return;
    const user = window.TalentAuth.requireAuth();
    if (!mount || !user) return;
    mount.innerHTML = ui.skeletonCards(3);
    try {
      const profile = await api.get("/profile").catch(() => api.get(`/users/${user.id}/profile`));
      const merged = { ...user, ...profile };
      mount.innerHTML = profileTemplate(merged);
      bindProfileForm();
    } catch (error) {
      mount.innerHTML = profileTemplate(user);
      bindProfileForm();
      ui.toast("Profile details could not be loaded. Showing your session details.", "warning");
    }
  }

  function profileTemplate(profile) {
    return `
      <section class="card profile-cover">
        <div class="profile-head">
          <div class="avatar">${userInitials(profile)}</div>
          <div><h1>${profile.name || profile.fullName || "TalentHub user"}</h1><p>${profile.role || "CANDIDATE"} · ${profile.email || ""}</p></div>
        </div>
      </section>
      <section class="section">
        <div class="layout">
          <aside class="card card-pad sidebar">
            <h2>Profile strength</h2>
            ${progress(profile)}
            <p class="muted">Complete your skills, experience, education, and resume for stronger matches.</p>
          </aside>
          <form class="card card-pad" id="profileForm">
            <div class="form-row">
              <div class="form-group"><label>Full name</label><input class="input" name="name" value="${profile.name || profile.fullName || ""}" required><div class="field-error"></div></div>
              <div class="form-group"><label>Email</label><input class="input" name="email" type="email" value="${profile.email || ""}" required><div class="field-error"></div></div>
            </div>
            <div class="form-row">
              <div class="form-group"><label>Phone</label><input class="input" name="phone" value="${profile.phone || ""}"></div>
              <div class="form-group"><label>Location</label><input class="input" name="location" value="${profile.location || ""}"></div>
            </div>
            <div class="form-group"><label>Skills</label><input class="input" name="skills" value="${Array.isArray(profile.skills) ? profile.skills.join(", ") : profile.skills || ""}"></div>
            <div class="form-group"><label>Experience</label><textarea class="textarea" name="experience">${profile.experience || ""}</textarea></div>
            <div class="form-group"><label>Education</label><textarea class="textarea" name="education">${profile.education || ""}</textarea></div>
            <div class="form-group"><label>Resume</label><input class="input" name="resume" type="file" accept=".pdf,.doc,.docx"></div>
            <button class="btn btn-primary"><i class="fa-solid fa-floppy-disk"></i>Update profile</button>
          </form>
        </div>
      </section>
    `;
  }

  function progress(profile) {
    const fields = ["name", "email", "phone", "location", "skills", "experience", "education"];
    const done = fields.filter((field) => profile[field]).length;
    const percent = Math.round(done / fields.length * 100);
    return `<div class="bar-track" style="height:14px"><div class="bar-fill" style="width:${percent}%"></div></div><strong style="display:block;margin:12px 0">${percent}% complete</strong>`;
  }

  function bindProfileForm() {
    document.getElementById("profileForm")?.addEventListener("submit", async (event) => {
      event.preventDefault();
      if (!window.TalentAuth.validateRequired(event.currentTarget)) return;
      const form = event.currentTarget;
      const payload = Object.fromEntries(new FormData(form));
      delete payload.resume;
      try {
        await api.put("/profile", payload);
        if (form.resume.files[0]) await api.post("/resume/upload", new FormData(form));
        ui.toast("Profile updated.", "success");
      } catch (error) {
        ui.toast(error.message, "error");
      }
    });
  }

  async function bindJobForm() {
    const form = document.getElementById("jobForm");
    if (!form) return;
    window.TalentAuth.requireAuth(["RECRUITER"]);
    const id = new URLSearchParams(location.search).get("id");
    if (id) {
      try {
        const job = await api.get(`/jobs/${id}`);
        Object.entries(job).forEach(([key, value]) => {
          if (form[key]) form[key].value = Array.isArray(value) ? value.join(", ") : value;
        });
      } catch (error) {
        ui.toast(error.message, "error");
      }
    }
    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      if (!window.TalentAuth.validateRequired(form)) return;
      const payload = Object.fromEntries(new FormData(form));
      try {
        if (id) await api.put(`/jobs/${id}`, payload);
        else await api.post("/jobs", payload);
        ui.toast(id ? "Job updated." : "Job created.", "success");
        location.href = "recruiter-dashboard.html";
      } catch (error) {
        ui.toast(error.message, "error");
      }
    });
  }

  document.addEventListener("DOMContentLoaded", () => {
    loadProfile();
    bindJobForm();
  });
})();
