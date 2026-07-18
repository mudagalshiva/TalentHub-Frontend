// ==========================
// ai-career.js
// PART 1
// Paste this first.
// Wait for my PART 2.
// ==========================

(function () {

    const api = window.TalentAPI;
    const ui = window.TalentUI;

    const form = document.getElementById("resumeAnalyzeForm");

    const scoreContainer = document.getElementById("analysisResult");
    const skillsContainer = document.getElementById("skillsList");
    const missingContainer = document.getElementById("missingSkills");
    const jobsContainer = document.getElementById("recommendedJobs");
    const questionContainer = document.getElementById("questions");
    const suggestionContainer = document.getElementById("suggestions");

    function createSkillChip(skill) {

        return `
            <span class="tag tag-success"
                  style="margin:5px;
                  display:inline-block;">
                ${skill}
            </span>
        `;

    }

    function createMissingChip(skill) {

        return `
            <span class="tag tag-warning"
                  style="margin:5px;
                  display:inline-block;">
                ${skill}
            </span>
        `;

    }

    function createJobCard(job) {

        return `

        <article class="card card-pad"
                 style="margin-bottom:18px;">

            <div class="row-between">

                <div>

                    <h3>${job.title}</h3>

                    <p class="muted">

                        ${job.company}

                    </p>

                </div>

                <div>

                    <span class="tag tag-success">

                        ${job.match}% Match

                    </span>

                </div>

            </div>

            <div style="margin-top:18px;">

                <a href="job-details.html?id=${job.id}"

                   class="btn btn-primary">

                    <i class="fa-solid fa-eye"></i>

                    View Details

                </a>

            </div>

        </article>

        `;

    }

    function renderScore(data) {

        scoreContainer.innerHTML = `

        <div class="grid grid-4">

            <div class="card stat-card">

                <i class="fa-solid fa-chart-line"></i>

                <strong>

                    ${data.resumeScore}%

                </strong>

                <span>

                    Resume Score

                </span>

            </div>

            <div class="card stat-card">

                <i class="fa-solid fa-code"></i>

                <strong>

                    ${data.skills.length}

                </strong>

                <span>

                    Skills Found

                </span>

            </div>

            <div class="card stat-card">

                <i class="fa-solid fa-triangle-exclamation"></i>

                <strong>

                    ${data.missingSkills.length}

                </strong>

                <span>

                    Missing Skills

                </span>

            </div>

            <div class="card stat-card">

                <i class="fa-solid fa-briefcase"></i>

                <strong>

                    ${data.recommendedJobs.length}

                </strong>

                <span>

                    Recommended Jobs

                </span>

            </div>

        </div>

        `;

    }

    function renderSkills(data) {

        if (data.skills.length === 0) {

            skillsContainer.innerHTML = `

                <p class="muted">

                    No skills detected.

                </p>

            `;

            return;

        }

        skillsContainer.innerHTML = "";

        data.skills.forEach(skill => {

            skillsContainer.innerHTML += createSkillChip(skill);

        });

    }

    function renderMissingSkills(data) {

        if (data.missingSkills.length === 0) {

            missingContainer.innerHTML = `

                <p class="muted">

                    Great!

                    No important skills missing.

                </p>

            `;

            return;

        }

        missingContainer.innerHTML = "";

        data.missingSkills.forEach(skill => {

            missingContainer.innerHTML += createMissingChip(skill);

        });

    }

;  

// ==========================
// ai-career.js
// PART 2
// Paste immediately after PART 1
// ==========================

    function renderJobs(data) {

        if (data.recommendedJobs.length === 0) {

            jobsContainer.innerHTML = `

                <p class="muted">

                    No recommended jobs found.

                </p>

            `;

            return;

        }

        jobsContainer.innerHTML = "";

        data.recommendedJobs.forEach(job => {

            jobsContainer.innerHTML += createJobCard(job);

        });

    }

    function renderQuestions(data) {

        if (data.interviewQuestions.length === 0) {

            questionContainer.innerHTML = `

                <p class="muted">

                    No interview questions generated.

                </p>

            `;

            return;

        }

        let html = "<ol>";

        data.interviewQuestions.forEach(question => {

            html += `

                <li style="margin-bottom:12px;">

                    ${question}

                </li>

            `;

        });

        html += "</ol>";

        questionContainer.innerHTML = html;

    }

    function renderSuggestions(data) {

        if (data.suggestions.length === 0) {

            suggestionContainer.innerHTML = `

                <p class="muted">

                    No suggestions available.

                </p>

            `;

            return;

        }

        let html = "<ul>";

        data.suggestions.forEach(item => {

            html += `

                <li style="margin-bottom:10px;">

                    ${item}

                </li>

            `;

        });

        html += "</ul>";

        suggestionContainer.innerHTML = html;

    }

    async function analyzeResume(file) {

        const formData = new FormData();

        formData.append("file", file);

        try {

            ui.loading(true);

            const response = await api.post(
                "/ai/analyze",
                formData
            );

            ui.loading(false);

            renderScore(response);

            renderSkills(response);

            renderMissingSkills(response);

            renderJobs(response);

            renderQuestions(response);

            renderSuggestions(response);

            ui.toast(
                "Resume analyzed successfully.",
                "success"
            );

        } catch (error) {

            ui.loading(false);

            console.error(error);

            ui.toast(
                error.message || "Analysis failed.",
                "error"
            );

        }

    }

    document.addEventListener(
        "DOMContentLoaded",
        function () {

            if (!form) return;

            form.addEventListener(
                "submit",
                function (event) {

                    event.preventDefault();

                    const resume =
                        form.resume.files[0];

                    if (!resume) {

                        ui.toast(
                            "Please select a resume.",
                            "warning"
                        );

                        return;

                    }

                    analyzeResume(resume);

                }
            );

        }
    );

})();