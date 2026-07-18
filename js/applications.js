(function () {

    const api = window.TalentAPI;
    const ui = window.TalentUI;
    const jobTools = window.TalentJobs;

    function table(items) {

        if (!items.length) {

            return ui.emptyState(
                "No applications yet",
                "Your submitted applications will appear here.",
                "fa-paper-plane"
            );

        }

        return `
        <div class="table-wrap">

            <table class="table">

                <thead>

                    <tr>

                        <th>Job Title</th>

                        <th>Company</th>

                        <th>Status</th>

                        <th>Applied Date</th>

                    </tr>

                </thead>

                <tbody>

                    ${items.map(item => `

                    <tr>

                        <td>

                            <strong>

                                ${item.job?.title || "N/A"}

                            </strong>

                        </td>

                        <td>

                            ${item.job?.companyName || "N/A"}

                        </td>

                        <td>

                            <span class="tag tag-primary">

                                ${item.status}

                            </span>

                        </td>

                        <td>

                            ${item.appliedDate || "-"}

                        </td>

                    </tr>

                    `).join("")}

                </tbody>

            </table>

        </div>

        `;

    }

    async function loadApplications() {

        const mount =
            document.getElementById("applicationsPage");

        if (!mount) return;

        if (!window.TalentAuth.requireAuth()) return;

        mount.innerHTML =
            ui.skeletonCards(3);

        try {

            const applications =
                await api.get("/applications");

            mount.innerHTML = `

                <section class="card card-pad">

                    <h2>

                        My Applications

                    </h2>

                    ${table(applications)}

                </section>

            `;

        }

        catch (error) {

            console.error(error);

            mount.innerHTML =
                ui.emptyState(
                    "Unable to load applications",
                    error.message,
                    "fa-triangle-exclamation"
                );

        }

    }

    async function loadSavedJobs() {

        const mount =
            document.getElementById("savedJobsPage");

        if (!mount) return;

        if (!window.TalentAuth.requireAuth()) return;

        mount.innerHTML =
            ui.skeletonCards(3);

        try {

            const jobs =
                await api.get("/saved-jobs");

            if (!jobs.length) {

                mount.innerHTML =
                    ui.emptyState(
                        "No saved jobs",
                        "Save jobs from Jobs page.",
                        "fa-bookmark"
                    );

                return;

            }

            mount.innerHTML =

                `<div class="grid grid-3">

                    ${jobs.map(jobTools.jobCard).join("")}

                </div>`;

        }

        catch (error) {

            console.error(error);

            mount.innerHTML =
                ui.emptyState(
                    "Unable to load saved jobs",
                    error.message,
                    "fa-triangle-exclamation"
                );

        }

    }

    async function loadCompanies() {

        const mount =
            document.getElementById("companyPage");

        if (!mount) return;

        mount.innerHTML =
            ui.skeletonCards(3);

        try {

            const jobs =
                await api.get("/jobs");

            const companies = [];

            jobs.forEach(job => {

                if (!companies.find(c => c.name === job.companyName)) {

                    companies.push({

                        name: job.companyName,

                        location: job.location,

                        count: jobs.filter(
                            j => j.companyName === job.companyName
                        ).length

                    });

                }

            });

            mount.innerHTML =

                `<div class="grid grid-3">

                ${companies.map(company => `

                <article class="card company-card">

                    <div class="company-logo">

                        ${company.name.charAt(0)}

                    </div>

                    <h3>

                        ${company.name}

                    </h3>

                    <p>

                        ${company.location}

                    </p>

                    <span class="tag">

                        ${company.count} Jobs

                    </span>

                </article>

                `).join("")}

                </div>`;

        }

        catch (error) {

            console.error(error);

            mount.innerHTML =
                ui.emptyState(
                    "Unable to load companies",
                    error.message,
                    "fa-triangle-exclamation"
                );

        }

    }

    document.addEventListener("DOMContentLoaded", function () {

        loadApplications();

        loadSavedJobs();

        loadCompanies();

    });

})();