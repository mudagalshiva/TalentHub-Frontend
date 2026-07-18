(function () {
  const api = window.TalentAPI;
  const ui = window.TalentUI;

  function value(job, keys, fallback = "") {
    for (const key of keys) {
      const result = key.split(".").reduce((acc, part) => acc?.[part], job);
      if (result !== undefined && result !== null && result !== "") return result;
    }
    return fallback;
  }

  function jobCard(job) {
    const id = value(job, ["id", "jobId"]);
    const title = value(job, ["title", "jobTitle"], "Untitled role");
    const company = value(job, ["companyName", "company.name"], "Company");
    const location = value(job, ["location", "city"], "Remote");
    const type = value(job, ["jobType", "type"], "Full time");
    const experience = value(job, ["experience", "experienceLevel"], "Any level");
    const salary = value(job, ["salaryRange", "salary"], "Competitive");
    const description = value(job, ["shortDescription", "description"], "").slice(0, 150);
    return `
      <article class="card job-card">
        <div class="row-between">
          <div class="job-top">
            <div class="job-logo">${company.slice(0, 1).toUpperCase()}</div>
            <div>
              <h3>${title}</h3>
              <span class="muted">${company}</span>
            </div>
          </div>
          <button class="icon-btn" data-save-job="${id}" aria-label="Save job"><i class="fa-regular fa-bookmark"></i></button>
        </div>
        <p class="muted" style="margin-top:16px">${description || "Open role posted by this employer."}</p>
        <div class="meta">
          <span><i class="fa-solid fa-location-dot"></i>${location}</span>
          <span><i class="fa-solid fa-business-time"></i>${experience}</span>
          <span><i class="fa-solid fa-clock"></i>${type}</span>
          <span><i class="fa-solid fa-wallet"></i>${salary}</span>
        </div>
        <div class="row-between">
          <a class="btn btn-secondary" href="job-details.html?id=${encodeURIComponent(id)}">Details</a>
          <button class="btn btn-primary" data-apply-job="${id}"><i class="fa-solid fa-paper-plane"></i>Apply</button>
        </div>
      </article>
    `;
  }

  function extractList(data) {
    return window.TalentMain?.extractList(data) || (Array.isArray(data) ? data : data?.content || data?.jobs || data?.data || []);
  }

  function totalPages(data, listLength) {
    return data?.totalPages || data?.page?.totalPages || Math.ceil((data?.totalElements || listLength) / Number(new URLSearchParams(location.search).get("size") || 9)) || 1;
  }

  function formToParams(form) {
    const params = {};
    new FormData(form).forEach((value, key) => {
      if (value) params[key] = value;
    });
    params.page = Number(new URLSearchParams(location.search).get("page") || 0);
    params.size = 9;
    return params;
  }

  function syncFiltersFromUrl(form) {
    const params = new URLSearchParams(location.search);
    form.querySelectorAll("[name]").forEach((input) => {
      if (params.has(input.name)) input.value = params.get(input.name);
    });
  }

  async function loadJobs() {
    const list = document.getElementById("jobsList");
    const form = document.getElementById("jobFilters");
    if (!list || !form) return;
    syncFiltersFromUrl(form);
    list.innerHTML = ui.skeletonCards(6);
    try {
      const data = await api.get("/jobs", formToParams(form));
      const jobs = extractList(data);
      document.getElementById("jobCount").textContent = `${data?.totalElements || jobs.length} jobs`;
      list.innerHTML = jobs.length ? jobs.map(jobCard).join("") : ui.emptyState("No jobs match this search", "Try adjusting filters or clearing the search.", "fa-filter");
      renderPagination(totalPages(data, jobs.length), Number(new URLSearchParams(location.search).get("page") || 0));
    } catch (error) {
      list.innerHTML = ui.emptyState("Jobs could not be loaded", error.message, "fa-triangle-exclamation");
    }
  }

  function renderPagination(pages, current) {
    const mount = document.getElementById("pagination");
    if (!mount) return;
    if (pages <= 1) {
      mount.innerHTML = "";
      return;
    }
    mount.innerHTML = Array.from({ length: Math.min(pages, 8) }, (_, index) => `<button class="${index === current ? "active" : ""}" data-page="${index}">${index + 1}</button>`).join("");
  }

  async function loadJobDetails() {
    const mount = document.getElementById("jobDetails");
    if (!mount) return;
    const id = new URLSearchParams(location.search).get("id");
    if (!id) {
      mount.innerHTML = ui.emptyState("Job not selected", "Open this page from a job card.", "fa-link");
      return;
    }
    mount.innerHTML = ui.skeletonCards(2);
    try {
      const job = await api.get(`/jobs/${id}`);
      const title = value(job, ["title", "jobTitle"], "Untitled role");
      const company = value(job, ["companyName", "company.name"], "Company");
      const skills = value(job, ["skillsRequired", "requiredSkills", "skills"], ""
    );
      const skillList = Array.isArray(skills)? skills: String(skills) .split(",").filter(skill => skill.trim() !== "");
      document.getElementById("jobBannerTitle").textContent = title;
      document.getElementById("jobBannerCompany").textContent = company;
      mount.innerHTML = `
        <div class="job-detail-shell">
          <article class="card card-pad">
            <div class="job-top">
              <div class="job-logo">${company.slice(0, 1).toUpperCase()}</div>
              <div><h2>${title}</h2><p class="muted">${company}</p></div>
            </div>
            <div class="meta">
              <span><i class="fa-solid fa-location-dot"></i>${value(job, ["location"], "Remote")}</span>
              <span><i class="fa-solid fa-clock"></i>${value(job, ["jobType", "type"], "Full time")}</span>
              <span><i class="fa-solid fa-wallet"></i>${value(job, ["salaryRange", "salary"], "Competitive")}</span>
              <span><i class="fa-solid fa-business-time"></i>${value(job, ["experience", "experienceLevel"], "Any level")}</span>
            </div>
            <h3>Description</h3>
            <p>${value(job, ["description"], "No description was provided.")}</p>
            <h3>Skills</h3>
            <div class="meta">${skillList.length ? skillList.map((skill) => `<span>${skill.trim()}</span>`).join("") : `<span>Skills not specified</span>`}</div>
          </article>
          <aside class="card card-pad sticky-card">
            <h3>Ready to apply?</h3>
            <p class="muted">Submit your profile and resume for recruiter review.</p>
            <button class="btn btn-primary btn-block" data-apply-job="${id}"><i class="fa-solid fa-paper-plane"></i>Apply now</button>
            <button class="btn btn-secondary btn-block" style="margin-top:10px" data-save-job="${id}"><i class="fa-regular fa-bookmark"></i>Save job</button>
            <button class="btn btn-ghost btn-block" style="margin-top:10px" id="shareJob"><i class="fa-solid fa-share-nodes"></i>Share</button>
          </aside>
        </div>
      `;
      loadRelatedJobs(job);
    } catch (error) {
      mount.innerHTML = ui.emptyState("Job details could not be loaded", error.message, "fa-triangle-exclamation");
    }
  }

  async function loadRelatedJobs(job) {
    const mount = document.getElementById("relatedJobs");
    if (!mount) return;
    try {
      const data = await api.get("/jobs", { location: value(job, ["location"], ""), size: 3 });
      const jobs = extractList(data).filter((item) => String(value(item, ["id", "jobId"])) !== String(value(job, ["id", "jobId"]))).slice(0, 3);
      mount.innerHTML = jobs.length ? jobs.map(jobCard).join("") : ui.emptyState("No related jobs", "Related roles will show here when available.", "fa-briefcase");
    } catch (error) {
      mount.innerHTML = "";
    }
  }

  function applyModal(jobId) {

    if (!api.getToken()) {
        location.href =
            `login.html?redirect=${encodeURIComponent(`job-details.html?id=${jobId}`)}`;
        return;
    }

    ui.openModal(
        "Apply for this job",

        `
        <form id="applyForm">

            <div class="form-group">

                <label>Cover Note</label>

                <textarea
                    class="textarea"
                    name="coverLetter"
                    placeholder="Tell the recruiter why you're a good fit"></textarea>

            </div>

            <div class="form-group">

                <label>Upload Resume</label>

                <input
                    class="input"
                    type="file"
                    name="file"
                    accept=".pdf,.doc,.docx">

            </div>

        </form>
        `,

        `
        <button class="btn btn-secondary" data-modal-close>
            Cancel
        </button>

        <button class="btn btn-primary" id="submitApplication">
            <i class="fa-solid fa-paper-plane"></i>
            Submit Application
        </button>
        `
    );

    document
        .getElementById("submitApplication")
        .addEventListener("click", async () => {

            const form =
                document.getElementById("applyForm");

            const formData =
                new FormData();

            if (form.file.files.length > 0) {

                formData.append(
                    "file",
                    form.file.files[0]
                );

            }

            try {

                // Upload Resume

                let resumeUrl = "";

if (form.file.files.length > 0) {

    const uploadResponse = await api.post(
        "/resume/upload",
        formData
    );

    if (typeof uploadResponse === "string") {

        resumeUrl = uploadResponse;

    } else {

        resumeUrl =
            uploadResponse.resumeUrl ||
            uploadResponse.url ||
            uploadResponse.path ||
            "";

    }

}

await api.post("/applications/apply", {

    jobId: Number(jobId),

    applicantName: window.TalentAPI.getUser().name,

    applicantEmail: window.TalentAPI.getUser().email,

    coverLetter: form.coverLetter.value,

    resumeUrl: resumeUrl

});

                ui.toast(
                    "Application submitted successfully.",
                    "success"
                );

                ui.closeModal();

            }
            catch (error) {

                console.error(error);

                ui.toast(
                    error.message || "Application failed.",
                    "error"
                );

            }

        });

}

  function bindJobs() {
    const form = document.getElementById("jobFilters");
    if (form) {
      form.addEventListener("submit", (event) => {
        event.preventDefault();
        const params = new URLSearchParams(new FormData(form));
        location.href = `jobs.html?${params.toString()}`;
      });
      document.getElementById("clearFilters")?.addEventListener("click", () => {
        location.href = "jobs.html";
      });
    }

    document.addEventListener("click", (event) => {
      const page = event.target.closest("[data-page]");
      if (page) {
        const params = new URLSearchParams(location.search);
        params.set("page", page.dataset.page);
        location.href = `jobs.html?${params.toString()}`;
      }
      const apply = event.target.closest("[data-apply-job]");
      if (apply) applyModal(apply.dataset.applyJob);
      const save = event.target.closest("[data-save-job]");
      if (save) saveJob(save.dataset.saveJob, save);
      if (event.target.closest("#shareJob")) {
        navigator.clipboard?.writeText(location.href);
        ui.toast("Job link copied.", "success");
      }
    });
  }

  document.addEventListener("DOMContentLoaded", () => {
    bindJobs();
    loadJobs();
    loadJobDetails();
  });

  window.TalentJobs = { jobCard, extractList, value };
})();
