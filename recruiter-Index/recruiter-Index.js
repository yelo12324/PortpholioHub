// Hamburger toggle
const hamburger = document.getElementById('hamburger');
const navLinks = document.getElementById('nav-links');

if (hamburger && navLinks) {
  hamburger.addEventListener('click', () => {
    navLinks.classList.toggle('active');
  });
}

// Intersection Observer to add 'in-view' class on scroll
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('in-view');
    }
  });
}, {
  threshold: 0.2
});

if (document.querySelectorAll('.hiw-step')) {
  document.querySelectorAll('.hiw-step').forEach(step => {
    observer.observe(step);
  });
}

// Dropdown toggle logic
if (document.querySelectorAll('.dropdown > button')) {
  document.querySelectorAll('.dropdown > button').forEach(button => {
    button.addEventListener('click', (e) => {
      e.stopPropagation();
      document.querySelectorAll('.dropdown-content').forEach(menu => {
        if (menu !== button.nextElementSibling) menu.style.display = 'none';
      });
      const dropdownMenu = button.nextElementSibling;
      dropdownMenu.style.display = dropdownMenu.style.display === 'block' ? 'none' : 'block';
    });
  });
}

document.addEventListener('click', () => {
  document.querySelectorAll('.dropdown-content').forEach(menu => {
    menu.style.display = 'none';
  });
});

// Pagination active state
if (document.querySelector('.pagination')) {
  document.querySelectorAll('.pagination a').forEach(button => {
    button.addEventListener('click', () => {
      document.querySelectorAll('.pagination a').forEach(btn => btn.classList.remove('active'));
      button.classList.add('active');
    });
  });
}

if (document.querySelector('.filters')) {
  document.querySelector('.filters').addEventListener('click', function(e) {
    if (window.innerWidth <= 660 && e.target === this) {
      this.classList.toggle('show');
    }
  });
}

(function () {
  const scrollObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        scrollObserver.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.1
  });

  if (document.querySelectorAll('.animate-on-scroll')) {
    document.querySelectorAll('.animate-on-scroll').forEach((el) => scrollObserver.observe(el));
  }
})();

(function () {
  const testimonialObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        testimonialObserver.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.1
  });

  if (document.querySelectorAll('.animate-on-scroll')) {
    document.querySelectorAll('.animate-on-scroll').forEach(el => testimonialObserver.observe(el));
  }
})();

// Cursor
var crsr = document.querySelector("#cursor");
var blur = document.querySelector("#cursorblur");

if (crsr && blur) {
  document.addEventListener("mousemove", function (dets) {
    crsr.style.left = dets.x + "px";
    crsr.style.top = dets.y + "px";
    blur.style.left = dets.x - 250 + "px";
    blur.style.top = dets.y - 250 + "px";
  });
}


function showAlert(message, type = "success") {
  // Create alert box if it doesn't exist
  let alertBox = document.getElementById("alertBox");
  if (!alertBox) {
    alertBox = document.createElement("div");
    alertBox.id = "alertBox";
    alertBox.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      padding: 15px 20px;
      border-radius: 5px;
      color: white;
      z-index: 10000;
      display: none;
      max-width: 300px;
    `;
    document.body.appendChild(alertBox);
  }
  
  alertBox.innerText = message;
  alertBox.className = `alert ${type}`;
  alertBox.style.display = "block";
  alertBox.style.backgroundColor = type === "success" ? "#4CAF50" : 
                                  type === "info" ? "#2196F3" : "#f44336";
  
  setTimeout(() => {
    alertBox.style.display = "none";
  }, 4000);
}

// SHOW TALENTS 

const grid = document.getElementById("profileGrid");
const paginationDiv = document.getElementById("pagination");
const API_URL = "http://localhost:5000/recruiter/profiles";

async function fetchProfiles(page = 1) {
  try {
    const res = await fetch(`${API_URL}?page=${page}`);
    const data = await res.json();

    renderProfiles(data.profiles);
    renderPagination(data.totalPages, data.currentPage);
  } catch (err) {
    console.error("❌ Error fetching profiles:", err);
  }
}

function renderProfiles(profiles) {
  grid.innerHTML = ""; // clear old profiles
    const fragment = document.createDocumentFragment(); 

  profiles.forEach(profile => {
    const card = document.createElement("div");
    card.classList.add("card");

    card.innerHTML = `
      <div class="card-header">
        <img src="${profile.photo || 'default-avatar.png'}" alt="Profile" class="profile-pic">
        <h3>${profile.fullName || "Unknown"}</h3>
      </div>
      <p>${profile.role || "Role Not Provided"} | ${profile.city || "Location"} |</p>
      <p>${profile.aboutMe || ""}</p>
      <div class="skills">
        ${profile.skills?.map(skill => `<div class="skill">${skill.name}</div>`).join("")}
      </div>
      <div class="portfolio">
        <button data-user-id="${profile._id}" class="portfolio-btn protected-link" >View Portfolio</button>
      </div>
    `;
        fragment.appendChild(card); 
  });
    grid.appendChild(fragment); 
}

grid.addEventListener('click', function(event) {
  if (event.target.classList.contains('portfolio-btn')) {
    
    const token = localStorage.getItem('recruiterToken');

    if (!token) {
      showAlert("Login first to access this feature", "error");
      return; 
    }

    const userId = event.target.dataset.userId;
    if (userId) {
      viewPortfolio(userId);
    }
  }
});

function viewPortfolio(id) {
  window.location.href = `/portfolio-viewer.html?userId=${id}`;
}


function renderPagination(totalPages, currentPage) {
  paginationDiv.innerHTML = "";

  for (let i = 1; i <= totalPages; i++) {
    const pageLink = document.createElement("a");
    pageLink.href = "#";
    pageLink.textContent = i;
    if (i === currentPage) pageLink.classList.add("active");

    pageLink.addEventListener("click", (e) => {
      e.preventDefault();
      fetchProfiles(i);
    });

    paginationDiv.appendChild(pageLink);
  }

  // Next button
  if (currentPage < totalPages) {
    const next = document.createElement("a");
    next.href = "#";
    next.innerHTML = `<i class="ri-arrow-drop-right-line"></i>`;
    next.addEventListener("click", (e) => {
      e.preventDefault();
      fetchProfiles(currentPage + 1);
    });
    paginationDiv.appendChild(next);
  }
}


// Load first page
fetchProfiles(1);

// =======================================================
// ---------------------- LOGOUT ------------------------
// =======================================================

document.addEventListener("DOMContentLoaded", () => {
    // Get the HTML elements
    const authLinks = document.getElementById("auth-links");
    const logoutBtn = document.getElementById("logout-btn");
    
    const token = localStorage.getItem('recruiterToken');

    if (token) {
        fetch("http://localhost:5000/recruiter/me", {
            method: "GET",
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })
        .then(res => {
            if (!res.ok) {
                throw new Error('Token validation failed');
            }
            return res.json();
        })
        .then(data => {
            if (data.authenticated) {
                authLinks.style.display = "none";
                logoutBtn.style.display = "inline-block";
            }
        })
        .catch(err => {
           
            console.error("Authentication check failed:", err);
           
            localStorage.removeItem('recruiterToken');
            
            authLinks.style.display = "inline-block";
            logoutBtn.style.display = "none";
        });
    } else {
        // If no token is found, the user is logged out
        authLinks.style.display = "inline-block";
        logoutBtn.style.display = "none";
    }
 // 2. HANDLE LOGOUT BUTTON CLICK
  logoutBtn.addEventListener("click", () => {
        if (window.confirm("Do you want to logout from PortfolioHub?")) {

    localStorage.removeItem('jwtToken');
        window.location.href = "index.html";
        }
  });
    // Handle the logout button click
    logoutBtn.addEventListener("click", (e) => {
        e.preventDefault(); // Prevent the <a> tag from navigating
      if (window.confirm("Do you want to logout from PortfolioHub?")) 
      {     
        localStorage.removeItem('recruiterToken');
        window.location.href = "recruiter-index.html";
      }
        
    });

      
  // ==========================================================
  //  IF USER IS NOT LOGIN, POPUP SHOW
  // ==========================================================
  
  

});