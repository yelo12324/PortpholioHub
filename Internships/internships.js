let allJobs = [];

// ===============================
//  FILTERING LOGIC
// ===============================

function applyFilters() {
  const workTypeValue = document.getElementById('workType').value;
  const experienceValue = document.getElementById('experience').value;
  const roleValue = document.getElementById('role').value;
  const stipendValue = document.getElementById('stipend').value;
  const durationValue = document.getElementById('duration').value;
  console.log("Selected Filters:", { workTypeValue, experienceValue, roleValue, stipendValue, durationValue });
  if (allJobs.length > 0) {
    console.log("Data structure of a job from the server:", allJobs[0]);
  }
  const filteredJobs = allJobs.filter(job => {
        if (!job) return false;

    const workTypeMatch = workTypeValue === 'all' || job.workType === workTypeValue;
    const experienceMatch = experienceValue === 'all' || job.experienceLevel === experienceValue;

    const roleMatch = roleValue === 'all' || job.title.toLowerCase().includes(roleValue.toLowerCase());

    const stipendMatch = stipendValue === 'all' || job.stipend >= parseInt(stipendValue, 10);

    const durationMatch = durationValue === 'all' || job.duration <= parseInt(durationValue, 10);
    
    return workTypeMatch && experienceMatch && roleMatch && stipendMatch && durationMatch;
  });

  displayJobs(filteredJobs);
}


// ===============================
// FILTER CHANGE LOGGING
// ===============================
const filterEls = [
  document.getElementById('workType'),
  document.getElementById('experience'),
  document.getElementById('role'),
  document.getElementById('stipend'),
  document.getElementById('duration')
];
filterEls.forEach(el =>
  el.addEventListener('change', () => {
    console.log(el.id + ' selected:', el.value);
  })
);

// ===============================
// DRAWER LOGIC FOR MOBILE
// ===============================
const filters = document.getElementById('filters');
const menuBtn = document.getElementById('menuBtn');
const overlay = document.getElementById('drawerOverlay');
const closeDrawerBtn = document.getElementById('closeDrawer');

function openDrawer() {
  filters.classList.add('as-drawer', 'open');
  overlay.classList.add('show');
  overlay.hidden = false;
  menuBtn.setAttribute('aria-expanded', 'true');
  document.body.style.overflow = 'hidden';
}
function closeDrawer() {
  filters.classList.remove('open');
  overlay.classList.remove('show');
  menuBtn.setAttribute('aria-expanded', 'false');
  document.body.style.overflow = '';
  setTimeout(() => {
    overlay.hidden = true;
  }, 250);
}

menuBtn.addEventListener('click', () => {
  const expanded = menuBtn.getAttribute('aria-expanded') === 'true';
  if (!expanded) openDrawer();
  else closeDrawer();
});
overlay.addEventListener('click', closeDrawer);
closeDrawerBtn.addEventListener('click', closeDrawer);

function syncForViewport() {
  const w = window.innerWidth;
  if (w > 600) {
    filters.classList.remove('as-drawer', 'open');
    overlay.classList.remove('show');
    overlay.hidden = true;
    menuBtn.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }
}
window.addEventListener('resize', syncForViewport);
window.addEventListener('orientationchange', syncForViewport);
syncForViewport();

// ===============================
// HELPER FUNCTIONS
// ===============================
function setButtonToApplied(button) {
  button.disabled = true;
  button.classList.add('applied');
  button.textContent = 'Applied';
   button.style.backgroundColor = '#28a745'; // green
  console.log(`✅ Button updated to Applied state for jobId=${button.dataset.jobId}`);
}
// Get userId safely from JWT payload
function getUserIdFromToken() {
  const token = localStorage.getItem('jwtToken');
  if (!token) return null;

  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.id || payload.userId || null; // adjust field based on backend
  } catch (err) {
    console.error("❌ Failed to decode JWT:", err);
    return null;
  }
}

// Fetch applied jobs from backend (JWT user only)
async function getAppliedJobsFromDB() {
  const token = localStorage.getItem('jwtToken');
  if (!token) return [];

  try {
    const res = await fetch('http://localhost:5000/myApplications', {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (!res.ok) throw new Error('Failed to fetch applied jobs');
    const apps = await res.json();
      const appliedJobIds = apps.map(app => app.internshipId._id);
    console.log("📥 Applied jobs fetched from DB:", appliedJobIds);
     // Save in localStorage under user-specific key
    const userId = getUserIdFromToken();
    if (userId) {
      localStorage.setItem(`appliedJobs_${userId}`, JSON.stringify(appliedJobIds));
    }
    return appliedJobIds;
    } catch (err) {
    console.error('Error fetching applied jobs:', err);
    return [];
  }
}

function isJobApplied(internshipId) {
    const userId = getUserIdFromToken();
  if (!userId) return false;
 const appliedJobs = JSON.parse(localStorage.getItem(`appliedJobs_${userId}`)) || [];
  const applied = appliedJobs.includes(internshipId);
  console.log(`🔎 Checking isJobApplied(${internshipId})for user ${userId}:`, applied);
  return applied;
}

async function updateAllButtonStates() {
  const appliedJobs = await getAppliedJobsFromDB();
  const allApplyButtons = document.querySelectorAll('.apply');

  allApplyButtons.forEach(button => {
    const jobId = button.dataset.jobId;
    if (appliedJobs.includes(jobId)) {
      setButtonToApplied(button);
    }
  });
}

// ===============================
// RENDER JOB CARD
// ===============================
function createJobCard(job) {
  const skillsHTML = job.skills
    .map(skill => `<span class="chip">${skill}</span>`)
    .join('');

     const deadline = job.deadline ? new Date(job.deadline) : null;
  const today = new Date();

  let statusText = "Open";
  let statusColor = "#09ff00ff"; // Green
  let buttonDisabled = false;
  let buttonText = "Apply Now";
  let buttonBg = "#007bff"; // Default blue


  if (deadline && deadline < today) {
    statusText = "Closed";
    statusColor = "red";
        buttonDisabled = true;
    buttonText = "Closed";
    buttonBg = "red";
  }

  return `
    <section class="card">
       <span style="display: flex; align-items: center; gap: 10px;">
        <h1>${job.title}</h1>
        <span style="font-size: 14px; font-weight: bold; color: ${statusColor};">
          ${statusText}
        </span>
      </span>
      <p class="desc">${job.description}</p>
      <div class="metrics">
        <div class="metric"><div class="value">${job.employmentType}</div><div class="label">Employment type</div></div>
        <div class="metric"><div class="value">${job.stipend}</div><div class="label">Stipend</div></div>
        <div class="metric"><div class="value">${job.duration} month</div><div class="label">Duration</div></div>
        <div class="metric"><div class="value">${job.workType}</div><div class="label">Work Type</div></div>
        <div class="metric"><div class="value">${job.experienceLevel}</div><div class="label">Experience Level</div></div>
        <div class="metric"><div class="value">${job.location}</div><div class="label">Location</div></div>
      </div>
      <div class="skills">
        <h3>Skills</h3>
        <div class="chips">${skillsHTML}</div>
      </div>
      <div class="cta">
     <div class="cta">
        <button 
          class="apply" 
          data-job-id="${job._id}" 
          style="background-color:${buttonBg}; color:#fff;" 
          ${buttonDisabled ? "disabled" : ""}>
          ${buttonText}
        </button>      </div>
    </section>
  `;
}

// ===============================
// DISPLAY JOBS (New Reusable Function)
// ===============================
function displayJobs(jobsToDisplay) {
  const jobContainer = document.getElementById('jobDetails');
  jobContainer.innerHTML = ''; // Clear previous jobs

  if (jobsToDisplay.length === 0) {
    jobContainer.innerHTML =
      '<p>No internships found. Try adjusting your filters or check back later!</p>';
  } else {
    // Loop through the jobs and create a card for each one
    jobsToDisplay.forEach(job => {
      jobContainer.innerHTML += createJobCard(job);
    });

    // After rendering, update the "Apply" button states for the logged-in user
    updateAllButtonStates();
  }
}

// ===============================
// FETCH & DISPLAY JOBS
// ===============================
async function fetchAndDisplayJobs() {
  const jobContainer = document.getElementById('jobDetails');
  jobContainer.innerHTML = '<p></p>';

  try {
    const response = await fetch('http://localhost:5000/jobs');
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    const jobs = await response.json();
// SORT INTERNSHIPS BY MOST RECENT
    jobs.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    allJobs = jobs; 

    // jobContainer.innerHTML = '';

    if (jobs.length === 0) {
      jobContainer.innerHTML =
        '<p>No internships posted yet. Check back later!</p>';
    } else {
      jobs.forEach(job => {
        jobContainer.innerHTML += createJobCard(job);
      });

      // update button states per user
      // updateAllButtonStates();
    }
  } catch (error) {
    console.error('Error fetching jobs:', error);
    jobContainer.innerHTML =
      '<p class="error">Could not load jobs. Please try again later.</p>';
  }
}

// ===============================
// LOCAL STORAGE HELPERS
// ===============================

function saveAppliedJob(internshipId) {
   const userId = getUserIdFromToken();
  if (!userId) return;

  let appliedJobs = JSON.parse(localStorage.getItem(`appliedJobs_${userId}`)) || [];
  
  if (!appliedJobs.includes(internshipId)) {
    appliedJobs.push(internshipId);
    localStorage.setItem(`appliedJobs_${userId}`, JSON.stringify(appliedJobs));
    console.log(`💾 Saved job ${internshipId} to user ${userId}.`);

  }

   let applicantCounts = JSON.parse(localStorage.getItem('applicantCounts')) || {};
  applicantCounts[internshipId] = (applicantCounts[internshipId] || 0) + 1;
  localStorage.setItem('applicantCounts', JSON.stringify(applicantCounts));
  console.log(`📊 Updated local applicant count for ${internshipId}:`, applicantCounts[internshipId]);
}


// ===============================
// EVENT LISTENERS
// ===============================
document.addEventListener('DOMContentLoaded', () => {
  fetchAndDisplayJobs().then(() => {
        const userId = getUserIdFromToken();
    if (!userId) return;

    const appliedJobs = JSON.parse(localStorage.getItem(`appliedJobs_${userId}`)) || [];
    appliedJobs.forEach(id => {
      const btn = document.querySelector(`.apply[data-job-id="${id}"]`);
      if (btn) {
        setButtonToApplied(btn);
      }
    });
  });
});
// ==============================
// JOB APPLICATION HANDLER
// ==============================
document.addEventListener('click', async e => {
  if (e.target.matches('#jobDetails .apply')) {
    const token = localStorage.getItem('jwtToken');
    if (!token) {
      alert('❌ You must be logged in to apply.');
      return;
    }

    const applyButton = e.target;
    const internshipId = applyButton.dataset.jobId;
    const card = applyButton.closest('.card');
    if (!card) return;

       if (isJobApplied(internshipId)) {
      alert('⚠️ Already applied for this job.');
      return;
    }

    const applicationData = { internshipId };
    console.log('Applying for job:', applicationData);

    applyButton.disabled = true;
    applyButton.textContent = 'Applying...';

    try {
      const response = await fetch('http://localhost:5000/applyInternship', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(applicationData)
      });

       const result = await response.json();
             console.log("📤 Apply API response:", result);


      if (response.ok) {
        alert('✅ Application submitted successfully!');
        setButtonToApplied(applyButton);
        saveAppliedJob(internshipId);

        applyButton.textContent = 'Applied';
        applyButton.style.backgroundColor = '#28a745';

        // Increment applicant count in backend
        try {
          await fetch(
            `http://localhost:5000/jobs/${internshipId}/incrementApplicants`,
            {
              method: 'PUT',
              headers: { Authorization: `Bearer ${token}` }
            }
          );
          console.log(
            `✅ Applicant count incremented for job ${internshipId}`
          );
        } catch (err) {
          console.error(
            `❌ Failed to increment applicant count for ${internshipId}:`,
            err
          );
        }
      } else {
        throw new Error(result.message || 'Failed to apply.');
      }
    } catch (error) {
      console.error('❌ Error submitting application:', error);
      alert(`❌ Error: ${error.message}`);
      applyButton.disabled = false;
      applyButton.textContent = 'Apply Now';
    }
  }
});