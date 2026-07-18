(function () {

    const api = window.TalentAPI;

    const jobId =
        new URLSearchParams(location.search).get("id");

    async function loadJob() {

        try {

            const job =
                await api.get(`/jobs/${jobId}`);

            document.getElementById("title").value =
                job.title || "";

            document.getElementById("companyName").value =
                job.companyName || "";

            document.getElementById("location").value =
                job.location || "";

            document.getElementById("salary").value =
                job.salary || "";

            document.getElementById("jobType").value =
                job.jobType || "";

            document.getElementById("skillsRequired").value =
                job.skillsRequired || "";

            document.getElementById("description").value =
                job.description || "";

        }

        catch (e) {

            alert("Unable to load Job");

        }

    }

    document
        .getElementById("editJobForm")
        .addEventListener("submit", async function (e) {

            e.preventDefault();

            try {

                await api.put(`/jobs/${jobId}`, {

                    title:
                        document.getElementById("title").value,

                    companyName:
                        document.getElementById("companyName").value,

                    location:
                        document.getElementById("location").value,

                    salary:
                        Number(document.getElementById("salary").value),

                    description:
                        document.getElementById("description").value,

                    skillsRequired:
                        document.getElementById("skillsRequired").value,

                    jobType:
                        document.getElementById("jobType").value

                });

                alert("Job Updated Successfully");

                window.location.href =
                    "recruiter-dashboard.html";

            }

            catch (e) {

                alert(e.message);

            }

        });

    loadJob();

})();