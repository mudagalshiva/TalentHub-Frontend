(function () {

    const api = window.TalentAPI;

    function createJobCard(job) {

        return `
            <article class="card job-card">

                <div class="job-top">

                    <div class="job-logo">
                        ${(job.companyName || "C").charAt(0)}
                    </div>

                    <div>
                        <h3>${job.title}</h3>
                        <span class="muted">
                            ${job.companyName}
                        </span>
                    </div>

                </div>

                <div class="meta">

                    <span>
                        <i class="fa-solid fa-location-dot"></i>
                        ${job.location}
                    </span>

                    <span>
                        <i class="fa-solid fa-briefcase"></i>
                        ${job.jobType}
                    </span>

                    <span>
                        <i class="fa-solid fa-indian-rupee-sign"></i>
                        ${job.salary}
                    </span>

                </div>

                <p class="job-description">
                    ${job.description}
                </p>

                <div class="row-between">

                    <a
                        href="job-details.html?id=${job.id}"
                        class="btn btn-primary">

                        View Details

                    </a>

                </div>

            </article>
        `;
    }

    async function loadFeaturedJobs() {

        const container =
            document.getElementById("featuredJobs");

        if (!container) return;

        container.innerHTML =
            "<p>Loading jobs...</p>";

        try {

            const jobs =
                await api.get("/jobs");

            container.innerHTML = "";

            if (jobs.length === 0) {

                container.innerHTML =
                    "<h3>No Jobs Found</h3>";

                return;

            }

            jobs.slice(0,6).forEach(job=>{

                container.innerHTML +=
                    createJobCard(job);

            });

        }

        catch(error){

            console.error(error);

            container.innerHTML =

            `
                <h3>
                    Unable to load jobs
                </h3>
            `;

        }

    }

    async function loadCompanies(){

        const container =
            document.getElementById("featuredCompanies");

        if(!container) return;

        try{

            const jobs =
                await api.get("/jobs");

            const companies=[];

            jobs.forEach(job=>{

                if(!companies.find(c=>c.name===job.companyName)){

                    companies.push({

                        name:job.companyName,

                        location:job.location

                    });

                }

            });

            container.innerHTML="";

            companies.slice(0,4).forEach(company=>{

                container.innerHTML +=

                `
                    <article class="card">

                        <h3>${company.name}</h3>

                        <p>${company.location}</p>

                    </article>
                `;

            });

        }

        catch(error){

            console.log(error);

        }

    }

    function bindSearch(){

        const form =
            document.getElementById("homeSearchForm");

        if(!form) return;

        form.addEventListener("submit",function(e){

            e.preventDefault();

            const keyword =
                form.keyword.value;

            const location =
                form.location.value;

            location.href=
            `jobs.html?keyword=${keyword}&location=${location}`;

        });

    }

    document.addEventListener(

        "DOMContentLoaded",

        function(){

            loadFeaturedJobs();

            loadCompanies();

            bindSearch();

        }

    );

})();