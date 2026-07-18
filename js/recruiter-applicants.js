(function () {

    const api = window.TalentAPI;
    const ui = window.TalentUI;

    const jobId =
        new URLSearchParams(window.location.search)
            .get("jobId");

    async function loadApplicants() {

        const mount =
            document.getElementById("applicantsTable");

        if (!mount) return;

        mount.innerHTML =
            ui.skeletonCards(4);

        try {

            const applications =
                await api.get(`/applications/job/${jobId}`);

            if (!applications.length) {

                mount.innerHTML =
                    ui.emptyState(
                        "No Applications",
                        "No candidates have applied yet.",
                        "fa-users"
                    );

                return;
            }

            mount.innerHTML = `

            <div class="table-wrap">

            <table class="table">

            <thead>

            <tr>

            <th>Name</th>

            <th>Email</th>

            <th>Resume</th>

            <th>Status</th>

            <th>Actions</th>

            </tr>

            </thead>

            <tbody>

            ${applications.map(app => `

            <tr>

            <td>

            ${app.applicantName}

            </td>

            <td>

            ${app.applicantEmail}

            </td>

            <td>
            ${
            app.resumeUrl
            ? `<a href="http://localhost:8080${app.resumeUrl}"
                   target="_blank"
                   class="btn btn-secondary">
                   View Resume
               </a>`
            : "No Resume"
            }
            </td>

            <td>

            <span class="tag">

            ${app.status}

            </span>

            </td>

            <td>

            <button
            class="btn btn-primary shortlist"
            data-id="${app.id}">

            Shortlist

            </button>

            <button
            class="btn btn-success select"
            data-id="${app.id}">

            Select

            </button>

            <button
            class="btn btn-danger reject"
            data-id="${app.id}">

            Reject

            </button>

            </td>

            </tr>

            `).join("")}

            </tbody>

            </table>

            </div>

            `;

            bindButtons();

        }

        catch (error) {

            mount.innerHTML =
                ui.emptyState(
                    "Unable to load applicants",
                    error.message,
                    "fa-triangle-exclamation"
                );

        }

    }

    function bindButtons() {

        document
            .querySelectorAll(".shortlist")
            .forEach(button => {

                button.onclick = () =>
                    updateStatus(
                        button.dataset.id,
                        "SHORTLISTED"
                    );

            });

        document
            .querySelectorAll(".select")
            .forEach(button => {

                button.onclick = () =>
                    updateStatus(
                        button.dataset.id,
                        "SELECTED"
                    );

            });

        document
            .querySelectorAll(".reject")
            .forEach(button => {

                button.onclick = () =>
                    updateStatus(
                        button.dataset.id,
                        "REJECTED"
                    );

            });

    }

    async function updateStatus(id, status) {

        try {

            await api.put(
                `/applications/${id}/status?status=${status}`
            );

            ui.toast(
                "Application Updated",
                "success"
            );

            loadApplicants();

        }

        catch (error) {

            ui.toast(
                error.message,
                "error"
            );

        }

    }

    document.addEventListener(

        "DOMContentLoaded",

        loadApplicants

    );

})();