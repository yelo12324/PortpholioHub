
      // Animate circular progress to 80% on load (right column)
      (function () {
        const progress = document.getElementById("progress");
        const text = document.getElementById("progress-text");
        if (!progress || !text) return;

        const r = 48;
        const perimeter = 2 * Math.PI * r; // ~302.4
        const targetPercent = 100;

        const start = perimeter;
        const end = perimeter * (1 - targetPercent / 100);

        const duration = 1100; // ms
        const fps = 60;
        const steps = Math.round(duration / (1000 / fps));
        let currentStep = 0;

        function animate() {
          currentStep++;
          const t = currentStep / steps;
          const eased = 1 - Math.pow(1 - t, 3);

          const offsetNow = start + (end - start) * eased;
          progress.style.strokeDashoffset = offsetNow;

          const numNow = Math.round(targetPercent * eased);
          text.textContent = numNow + "%";

          if (currentStep < steps) {
            requestAnimationFrame(animate);
          } else {
            progress.style.strokeDashoffset = end;
            text.textContent = targetPercent + "%";
          }
        }

        window.addEventListener("load", function () {
          progress.style.strokeDasharray = perimeter;
          progress.style.strokeDashoffset = start;
          setTimeout(() => requestAnimationFrame(animate), 260);
        });
      })();

      // -------- SPA-like swapping for left column (Dashboard <-> Jobs) --------
      (function () {
        const viewRoot = document.getElementById("view-root");
        const pageTitleEl = document.getElementById("page-title");
        const navLinks = document.querySelectorAll(".nav a");

        function render(templateId) {
          const tpl = document.getElementById(templateId);
          if (!tpl) return;
          const frag = tpl.content.cloneNode(true);

          // simple fade
          viewRoot.innerHTML = "";
          viewRoot.classList.add("fade-enter");
          requestAnimationFrame(() => {
            viewRoot.appendChild(frag);
            viewRoot.classList.add("fade-enter-active");
            setTimeout(() => {
              viewRoot.className = ""; // clear fade classes
            }, 240);
          });
        }

        // Initial: load Dashboard view
        render("tpl-dashboard");

        // Sidebar nav handling (only for items with data-page)
        navLinks.forEach((link) => {
          const page = link.getAttribute("data-page");
          if (!page) return;

          link.addEventListener("click", (e) => {
            e.preventDefault();

            // Toggle active: Jobs should go blue, others white
            document.querySelectorAll(".nav a").forEach((l) =>
              l.classList.remove("active")
            );
            link.classList.add("active");

            // Swap view
            if (page === "dashboard") {
              pageTitleEl.textContent = "Dashboard";
              render("tpl-dashboard");
            } else if (page === "jobs") {
              pageTitleEl.textContent = "Jobs";
              render("tpl-jobs");
            }

            // Close sidebar on small screens after navigation
            if (document.body.classList.contains("sidebar-open")) {
              document.body.classList.remove("sidebar-open");
              sidebarToggle.setAttribute("aria-expanded", "false");
            }
          });
        });
      })();

      // Off-canvas sidebar toggle (<=900px)
      const sidebarToggle = document.getElementById("sidebarToggle");
      const overlay = document.getElementById("overlay");
      if (sidebarToggle) {
        sidebarToggle.addEventListener("click", () => {
          const open = document.body.classList.toggle("sidebar-open");
          sidebarToggle.setAttribute("aria-expanded", open ? "true" : "false");
        });
      }
      if (overlay) {
        overlay.addEventListener("click", () => {
          document.body.classList.remove("sidebar-open");
          if (sidebarToggle) sidebarToggle.setAttribute("aria-expanded", "false");
        });
      }

      // ==========================================================
  // --------------------- BACKEND CODE STARTS FROM HERE ---------------------
  // ==========================================================

  
// ==========================================================
// ---------------------  JOB SUMMARY  ---------------------
// ==========================================================
  document.addEventListener('DOMContentLoaded', () => {

  // ===============================
  // GLOBAL STATE & DOM REFERENCES
  // ===============================
  const viewRoot = document.getElementById('view-root');
  const pageTitleEl = document.getElementById('page-title');
  const navLinks = document.querySelectorAll('.nav a[data-page]');
  const sidebar = document.querySelector('.sidebar');
  const sidebarToggle = document.getElementById('sidebarToggle');
  const overlay = document.getElementById('overlay');

  const templates = {
    dashboard: document.getElementById('tpl-dashboard')?.content,
    jobs: document.getElementById('tpl-jobs')?.content,
  };

  // ===============================
  // HELPER FUNCTIONS
  // ===============================

  /**
   * Decodes JWT from localStorage to get user ID.
   * @returns {string|null} The user ID or null if not found/invalid.
   */
  function getUserIdFromToken() {
    const token = localStorage.getItem('jwtToken');
    if (!token) return null;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.id || payload.userId || null;
    } catch (err) {
      console.error("Failed to decode JWT:", err);
      return null;
    }
  }

  /**
   * Formats an ISO date string into a readable format (e.g., "Sep 6, 2025").
   * @param {string} isoString - The ISO date string to format.
   * @returns {string} The formatted date string.
   */
  function formatDate(isoString) {
    if (!isoString) return 'N/A';
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(isoString).toLocaleDateString('en-US', options);
  }

  // ===============================
  // API & DATA HANDLING
  // ===============================

  /**
   * Fetches the user's applied internships from the backend.
   * @returns {Promise<Array>} A promise that resolves to an array of application objects.
   */
  async function fetchAppliedInternships() {
    const token = localStorage.getItem('jwtToken');
    if (!token) {
      console.warn("Authentication token not found.");
      throw new Error("You must be logged in to view your applications.");
    }

    const response = await fetch('http://localhost:5000/myApplications', {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch applications. Status: ${response.status}`);
    }

    return await response.json();
  }


  // ===============================
  // UI RENDERING & UPDATES
  // ===============================

  /**
   * Populates the Job Summary Table with data from the user's applications.
   * @param {Array} applications - An array of application objects from the API.
   */
  function populateJobSummaryTable(applications) {
    // The table is inside the dashboard template, so we query it from the live DOM
    const tableBody = viewRoot.querySelector('.job-table tbody');
    if (!tableBody) {
      console.error("Job summary table body not found in the current view.");
      return;
    }

    tableBody.innerHTML = ''; // Clear any placeholder content

    if (!applications || applications.length === 0) {
      tableBody.innerHTML = '<tr><td colspan="5" style="text-align: center;">You have not applied to any internships yet.</td></tr>';
      return;
    }

    applications.forEach(app => {
      // Ensure the internship data is populated from the backend
      const internship = app.internshipId;
      if (!internship) {
        console.warn("Skipping an application because internship details are missing.", app);
        return;
      }
      
      const today = new Date();
      const deadline = internship.deadline ? new Date(internship.deadline) : null;
      
      let statusText = 'Open';
      let statusClass = 'status-open';

      if (!deadline || deadline < today) {
        statusText = 'Closed';
        statusClass = 'status-closed';
      }

      const rowHTML = `
        <tr>
          <td data-label="Job Title">${internship.title || 'N/A'}</td>
          <td data-label="Company">${internship.company || 'N/A'}</td>
          <td data-label="Applied On"><time datetime="${app.appliedOn.split('T')[0]}">${formatDate(app.appliedOn)}</time></td>
          <td data-label="Status" class="${statusClass}">${statusText}</td>
  
        </tr>
      `;
      tableBody.insertAdjacentHTML('beforeend', rowHTML);
    });
  }
  
  /**
   * Updates the statistics cards (e.g., total applications).
   * @param {Array} applications - The array of application objects.
   */
  function updateStatsCards(applications) {
    const appliedCountEl = viewRoot.querySelector('.stat-card:nth-child(1) .stat-number');
    if (appliedCountEl) {
      appliedCountEl.textContent = applications.length;
    }
  }

  // ===============================
  // SPA ROUTING
  // ===============================
  
  /**
   * Renders a page template into the main view area.
   * @param {string} pageId - The ID of the page to render (e.g., 'dashboard').
   */
  async function renderPage(pageId) {
    if (!templates[pageId]) {
      console.error(`Template for page "${pageId}" not found.`);
      viewRoot.innerHTML = `<p class="error">Error: Could not load page content.</p>`;
      return;
    }
    
    // Clear previous content and append new page from template
    viewRoot.innerHTML = '';
    viewRoot.appendChild(document.importNode(templates[pageId], true));
    
    // Update page title and active nav link
    pageTitleEl.textContent = pageId.charAt(0).toUpperCase() + pageId.slice(1);
    navLinks.forEach(link => {
      link.classList.toggle('active', link.dataset.page === pageId);
      link.setAttribute('aria-current', link.dataset.page === pageId ? 'page' : 'false');
    });

    // Fetch and display data specific to the rendered page
    if (pageId === 'dashboard') {
      try {
        const tableBody = viewRoot.querySelector('.job-table tbody');
        if(tableBody) tableBody.innerHTML = '<tr><td colspan="4" style="text-align: center;">Loading applications...</td></tr>';
        
        const applications = await fetchAppliedInternships();
        populateJobSummaryTable(applications);
        updateStatsCards(applications);
      } catch (error) {
        console.error("Failed to render dashboard:", error);
        viewRoot.querySelector('.job-table tbody').innerHTML = `<tr><td colspan="4" style="text-align: center;">${error.message}</td></tr>`;
      }
    }
  }
  
  // ===============================
  // EVENT LISTENERS & INITIALIZATION
  // ===============================
  
  /**
   * Sets up all necessary event listeners for the page.
   */
  function setupEventListeners() {
    // SPA Navigation
    navLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const pageId = e.currentTarget.dataset.page;
        if (pageId) {
          renderPage(pageId);
        }
      });
    });
    
    // Sidebar toggle for mobile
    const toggleSidebar = () => {
        const isExpanded = sidebar.classList.toggle('open');
        sidebarToggle.setAttribute('aria-expanded', isExpanded);
        overlay.classList.toggle('show');
    };
    sidebarToggle.addEventListener('click', toggleSidebar);
    overlay.addEventListener('click', toggleSidebar);
  }

  /**
   * Main initialization function.
   */
  function init() {
    setupEventListeners();
    renderPage('dashboard'); // Load the initial page
  }

  // Run the app
  init();

});

// ==========================================================
// ---------------------  STATUS  ---------------------
// ==========================================================

document.addEventListener('DOMContentLoaded', () => {

  // ===============================
  // GLOBAL STATE & DOM REFERENCES
  // ===============================
  const viewRoot = document.getElementById('view-root');
  const pageTitleEl = document.getElementById('page-title');
  const navLinks = document.querySelectorAll('.nav a[data-page]');
  const sidebar = document.querySelector('.sidebar');
  const sidebarToggle = document.getElementById('sidebarToggle');
  const overlay = document.getElementById('overlay');

  const templates = {
    dashboard: document.getElementById('tpl-dashboard')?.content,
    jobs: document.getElementById('tpl-jobs')?.content,
  };

  // ===============================
  // HELPER FUNCTIONS
  // ===============================

  /**
   * Maps an application status string to a color class for the UI dot.
   */
  const statusMap = {
    'Under Review': 'blue',
    'Interview Scheduled': 'purple',
    'Accepted': 'green',
    'Rejected': 'red',
    'Applied': 'grey',
    'default': 'grey'
  };

  function getStatusColor(status) {
    return statusMap[status] || statusMap['default'];
  }

  function formatDate(isoString) {
    if (!isoString) return 'N/A';
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(isoString).toLocaleDateString('en-US', options);
  }

  // ===============================
  // API & DATA HANDLING
  // ===============================
  async function fetchAppliedInternships() {
    const token = localStorage.getItem('jwtToken');
    if (!token) {
      throw new Error("You must be logged in to view your applications.");
    }
    const response = await fetch('http://localhost:5000/myApplications', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!response.ok) {
      throw new Error(`Failed to fetch applications. Status: ${response.status}`);
    }
    return await response.json();
  }

  // ===============================
  // UI RENDERING & UPDATES
  // ===============================

  function populateJobSummaryTable(applications) {
    const tableBody = viewRoot.querySelector('.job-table tbody');
    if (!tableBody) return;
    tableBody.innerHTML = '';
    if (!applications || applications.length === 0) {
      tableBody.innerHTML = '<tr><td colspan="4" style="text-align: center;">You have not applied to any internships yet.</td></tr>';
      return;
    }
    applications.forEach(app => {
      const internship = app.internshipId;
      if (!internship) return;
      const today = new Date();
      const deadline = internship.deadline ? new Date(internship.deadline) : null;
      let statusText = 'Open';
      let statusClass = 'status-open';
      if (!deadline || deadline < today) {
        statusText = 'Closed';
        statusClass = 'status-closed';
      }
      const rowHTML = `
        <tr>
          <td data-label="Job Title">${internship.title || 'N/A'}</td>
          <td data-label="Company">${internship.company || 'N/A'}</td>
          <td data-label="Applied On"><time datetime="${app.appliedOn.split('T')[0]}">${formatDate(app.appliedOn)}</time></td>
          <td data-label="Status" class="${statusClass}">${statusText}</td>
        </tr>
      `;
      tableBody.insertAdjacentHTML('beforeend', rowHTML);
    });
  }

  /**
   * NEW: Populates the Status page with job cards based on application status.
   */
  function populateStatusCards(applications) {
    const jobsList = viewRoot.querySelector('#jobs-list');
    if (!jobsList) return;
    jobsList.innerHTML = '';

    if (!applications || applications.length === 0) {
      jobsList.innerHTML = `<p style="text-align: center; padding: 2rem;">You haven't applied for any internships yet.</p>`;
      return;
    }

    applications.forEach(app => {
      const internship = app.internshipId;
      if (!internship) return;

      const status = app.status || 'Status Unknown';
      const colorClass = getStatusColor(status);

      const cardHTML = `
        <div class="job-card">
          <div class="job-info">
            <div class="job-title-line">${internship.title}</div>
            <div class="job-sub">${internship.company} • <time datetime="${app.appliedOn.split('T')[0]}">${formatDate(app.appliedOn)}</time></div>
            <div class="job-status"><span class="dot ${colorClass}"></span>${status}</div>
          </div>
          <button class="view-btn">View Details</button>
        </div>
      `;
      jobsList.insertAdjacentHTML('beforeend', cardHTML);
    });
  }

  /**
   * UPDATED: Now counts scheduled interviews from the application status.
   */
  function updateStatsCards(applications) {
    const appliedCountEl = viewRoot.querySelector('.stat-card:nth-child(1) .stat-number');
    const interviewCountEl = viewRoot.querySelector('.stat-card:nth-child(2) .stat-number');

    if (appliedCountEl) {
      appliedCountEl.textContent = applications.length;
    }

    if (interviewCountEl) {
      const interviewCount = applications.filter(app => app.status === 'Interview Scheduled').length;
      interviewCountEl.textContent = interviewCount;
    }
  }

  // ===============================
  // SPA ROUTING
  // ===============================
  async function renderPage(pageId) {
    if (!templates[pageId]) {
      console.error(`Template for page "${pageId}" not found.`);
      viewRoot.innerHTML = `<p class="error">Error: Could not load page content.</p>`;
      return;
    }
    viewRoot.innerHTML = '';
    viewRoot.appendChild(document.importNode(templates[pageId], true));
    
    // In your HTML, the status page link has data-page="jobs"
    const pageName = pageId === 'jobs' ? 'Internships' : pageId;
    pageTitleEl.textContent = pageName.charAt(0).toUpperCase() + pageName.slice(1);

    navLinks.forEach(link => {
      link.classList.toggle('active', link.dataset.page === pageId);
      link.setAttribute('aria-current', link.dataset.page === pageId ? 'page' : 'false');
    });

    try {
      if (pageId === 'dashboard') {
        const tableBody = viewRoot.querySelector('.job-table tbody');
        if (tableBody) tableBody.innerHTML = '<tr><td colspan="4" style="text-align: center;">Loading applications...</td></tr>';
        
        const applications = await fetchAppliedInternships();
        populateJobSummaryTable(applications);
        updateStatsCards(applications);
      
      } else if (pageId === 'jobs') { // NEW: Logic for the status page
        const jobsList = viewRoot.querySelector('#jobs-list');
        if (jobsList) jobsList.innerHTML = `<p style="text-align: center; padding: 2rem;">Loading application statuses...</p>`;
        
        const applications = await fetchAppliedInternships();
        populateStatusCards(applications);
      }
    } catch (error) {
      console.error("Failed to render page:", error);
      if (pageId === 'dashboard') {
        viewRoot.querySelector('.job-table tbody').innerHTML = `<tr><td colspan="4" style="text-align: center;">${error.message}</td></tr>`;
      } else if (pageId === 'jobs') {
        viewRoot.querySelector('#jobs-list').innerHTML = `<p class="error" style="text-align: center; padding: 2rem;">${error.message}</p>`;
      }
    }
  }
  
  // ===============================
  // EVENT LISTENERS & INITIALIZATION
  // ===============================
  function setupEventListeners() {
    navLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const pageId = e.currentTarget.dataset.page;
        if (pageId) {
          renderPage(pageId);
        }
      });
    });
    
    const toggleSidebar = () => {
        const isExpanded = sidebar.classList.toggle('open');
        sidebarToggle.setAttribute('aria-expanded', isExpanded);
        overlay.classList.toggle('show');
    };
    sidebarToggle.addEventListener('click', toggleSidebar);
    overlay.addEventListener('click', toggleSidebar);
  }

  function init() {
    setupEventListeners();
    renderPage('dashboard');
  }

  init();
});
