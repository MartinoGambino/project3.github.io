class Job {
    constructor(title, posted, type, level, skill, detail) {
        this.title = title;
        this.posted = posted;
        this.type = type;
        this.level = level;
        this.skill = skill || "No Data";
        this.detail = detail || "No Data";
    }

    // this method gets the details of the job...
    getDetails() {
        return `
            <strong>Title:</strong> ${this.title}<br>
            <strong>Type:</strong> ${this.type}<br>
            <strong>Level:</strong> ${this.level}<br>
            <strong>Skill:</strong> ${this.skill}<br>
            <strong>Description:</strong> ${this.detail}<br>
            <strong>Posted:</strong> ${this.getFormattedPostedTime()}<br>
        `;
    }

    // method to format time
    getFormattedPostedTime() {
        return this.posted || "No Data";
    }

    // Static method to parse posted time into minutes for sorting, got stuck on this
    static parsePostedTime(postedTime) {
        const timeMapping = {
            "minute": 1,
            "hour": 60,
            "day": 1440,
            "week": 10080,
            "month": 43200,
        };

        const match = postedTime.match(/(\d+)\s(\w+)/); // finds number and unit of time
        if (match) {
            const value = parseInt(match[1]);
            const unit = match[2].replace(/s$/, ""); // removes plural
            return value * (timeMapping[unit] || 0);
        }
        return Infinity; // returns highest value for no data
    }
}


const display = document.getElementById('display');
const uploadButton = document.getElementById('uploadButton');
const fileInput = document.getElementById('fileInput');
const fileName = document.getElementById('fileName');
let jobsData = []; // array of all jobs 
let filteredJobs = []; // array of all filtered jobs, to be able to sort filtered jobs

// File upload event handling, also uses a button to activate input element
uploadButton.addEventListener('click', () => {
    fileInput.click();
});

fileInput.addEventListener('change', (event) => {
    const file = event.target.files[0];
    fileName.textContent = `${fileInput.files[0].name}`; // prints file name

    if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const jsonData = JSON.parse(e.target.result);
                jobsData = jsonData.map(job => new Job(job.Title, job.Posted, job.Type, job.Level, job.Skill, job.Detail));
                filteredJobs = [...jobsData];
                displayJobs(filteredJobs);
            } catch (error) { // error handling by using try/catch system
                const output = document.getElementById('output');
                output.textContent = 'Invalid JSON file.';
            }
        };
        reader.readAsText(file);
    } else {
        fileName.textContent = 'No File Selected';
    }
});

// Function to display jobs
function displayJobs(jobs) {
    const output = document.getElementById('output');
    output.innerHTML = '';

    // checks to see if jobs are not available, otherwise shows all available jobs by title, type and level
    if (jobs.length === 0) {
        output.innerHTML = 'No jobs available.';
    } else {
        jobs.forEach((job) => {
        const jobDiv = document.createElement('div');
        jobDiv.classList.add('job');
        jobDiv.style.cursor = 'pointer';
        jobDiv.innerHTML = `<strong>${job.title}</strong> | ${job.type} | ${job.level}`;
        jobDiv.addEventListener('click', () => showJobDetails(job));
        output.appendChild(jobDiv);
        });
    }


}

// popup open function
function showJobDetails(job) {
    const modal = document.getElementById('jobModal');
    const modalOverlay = document.getElementById('modalOverlay');
    const modalContent = document.getElementById('modalContent');

    modalContent.innerHTML = job.getDetails();

    modal.style.display = 'block';
    modalOverlay.style.display = 'block';
}

// popup close function
document.getElementById('closeModal').addEventListener('click', () => {
    const modal = document.getElementById('jobModal');
    const modalOverlay = document.getElementById('modalOverlay');
    modal.style.display = 'none';
    modalOverlay.style.display = 'none';
});

// filter function
function filterJobs() {
    const levelFilter = document.getElementById('leveldropdown').value.toLowerCase().trim();
    const typeFilter = document.getElementById('typedropdown').value.toLowerCase().trim();
    const skillFilter = document.getElementById('skilldropdown').value.toLowerCase().trim();

    filteredJobs = jobsData.filter(job => {
        const levelMatch = !levelFilter || job.level.toLowerCase().trim() === levelFilter;
        const typeMatch = !typeFilter || job.type.toLowerCase().trim() === typeFilter;
        const skillMatch = !skillFilter || job.skill.toLowerCase().includes(skillFilter);
        return levelMatch && typeMatch && skillMatch;
    });

    displayJobs(filteredJobs);
}

// sort function
function sortJobs(criteria) {
    const jobsToSort = filteredJobs.length > 0 ? filteredJobs : jobsData;

    if (criteria === "forwards") {
        jobsToSort.sort((a, b) => a.title.localeCompare(b.title));
    } else if (criteria === "backwards") {
        jobsToSort.sort((a, b) => b.title.localeCompare(a.title));
    } else if (criteria === "oldest") {
        jobsToSort.sort((a, b) => Job.parsePostedTime(b.posted) - Job.parsePostedTime(a.posted));
    } else if (criteria === "newest") {
        jobsToSort.sort((a, b) => Job.parsePostedTime(a.posted) - Job.parsePostedTime(b.posted));
    }

    displayJobs(jobsToSort);
}

// more DOM events
document.getElementById("filter").addEventListener("click", filterJobs);

document.getElementById("sort").addEventListener("click", () => {
    const sortSelect = document.getElementById("sortingdropdown");
    sortJobs(sortSelect.value);
});
