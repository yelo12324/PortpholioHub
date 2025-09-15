// Mobile Menu Toggle
const navMenu = document.querySelector('nav ul');
const openBtn = document.querySelector('.fa-bars');
const closeBtn = document.querySelector('.fa-times');

openBtn.onclick = () => navMenu.style.right = '0';
closeBtn.onclick = () => navMenu.style.right = '-100%';

// Tab Switching
function openTab(tabName, event) {
  document.querySelectorAll('.tab-links').forEach(link =>
    link.classList.remove('active-link')
  );
  document.querySelectorAll('.tab-contents').forEach(content =>
    content.classList.remove('active-tab')
  );
  event.currentTarget.classList.add('active-link');
  document.getElementById(tabName).classList.add('active-tab');
}


// Cursor
var crsr = document.querySelector("#cursor");
var blur = document.querySelector("#cursorblur");

document.addEventListener("mousemove", function (dets) {
  crsr.style.left = dets.x + "px";
  crsr.style.top = dets.y + "px";
  blur.style.left = dets.x - 250 + "px";
  blur.style.top = dets.y - 250 + "px";
});



// 🧠 Load profile from backend on page load
window.addEventListener('DOMContentLoaded', async () => {
  const params = new URLSearchParams(window.location.search);
  const userId = params.get('userId');

  let endpoint = userId ? `/profile/${userId}` : '/profile';
  

  try {
    const res = await fetch(endpoint);
    if (!res.ok) {
  const errData = await res.json();
  if (res.status === 404 && errData.message === "Portfolio not found") {
    showPopupAlert("🚫 Please Build Portfolio First", 120000);
  }
  throw new Error(errData.message || "Failed to load profile");
}

    const data = await res.json();

    // ✅ Header Text
    document.querySelector(".header-text p").innerHTML = `<span id="typer">${data.role || "Frontend Developer"}</span>`;
    document.querySelector(".header-text h1").innerHTML = `Hi, I'm <span>${data.username || "Name"}</span><br> from ${data.city || "Your City"}`;

    // ✅ Profile Image
    const fullPath = data.imagePath ? `/${data.imagePath}` : "default.jpg";
    document.querySelector("#profile-image-header").src = fullPath;
    document.querySelector("#profile-image-about").src = fullPath;

    // ✅ Resume
    if (data.resumePath) {
      document.querySelector("#resume-link-header").href = `/${data.resumePath}`;
      document.querySelector("#resume-link-footer").href = `/${data.resumePath}`;
    }

    // ✅ About Me
    if (data.aboutMe) {
      document.getElementById("about-me-text").textContent = data.aboutMe;
    }

    // ✅ Skills
    if (data.skills?.length) {
      document.querySelector("#skills ul").innerHTML = data.skills.map(skill =>
        `<li><span>${skill.name}</span><br>${skill.description}</li>`
      ).join("");
    }

    // ✅ Experience
    if (data.experience?.length) {
      document.querySelector("#experience ul").innerHTML = data.experience.map(exp =>
        `<li><span>${exp.start} - ${exp.end}</span><br>${exp.role} at ${exp.company}</li>`
      ).join("");
    }

    // ✅ Education
    if (data.education?.length) {
      document.querySelector("#education ul").innerHTML = data.education.map(edu =>
        `<li><span>${edu.graduationYear}</span><br>${edu.degree} at ${edu.institute}</li>`
      ).join("");
    }

    // ✅ My Work
    if (Array.isArray(data.myWork) && data.myWork.length > 0) {
      document.querySelector(".work-list").innerHTML = data.myWork.map(work => `
        <div class="work">
          <img src="/${work.photoPath}" alt="project image">
          <div class="layer">
            <h2>${work.name}</h2>
            <p>${work.description}</p>
            <a href="${work.link}" target="_blank"><i class="fas fa-external-link-alt"></i></a>
          </div>
        </div>
      `).join("");
    }

    // ✅ Contact
    if (data.contact) {
      document.querySelector("#contact .contact-left p:nth-child(2)").innerHTML = `<i class="fas fa-paper-plane"></i>${data.contact.email}`;
      document.querySelector("#contact .contact-left p:nth-child(3)").innerHTML = `<i class="fas fa-phone-square-alt"></i>${data.contact.phone}`;
    }

    // ✅ Social Icons
    const icons = {
      github: "fab fa-github",
      linkedin: "fab fa-linkedin",
      instagram: "fab fa-instagram",
      facebook: "fab fa-facebook"
    };
    const socialHTML = Object.keys(icons).map(platform => {
      if (data.contact?.[platform]) {
        return `<a href="${data.contact[platform]}" target="_blank"><i class="${icons[platform]}"></i></a>`;
      }
      return '';
    }).join('');
    document.querySelector(".social-icons").innerHTML = socialHTML;

    console.log("✅ Profile loaded", data);
  } catch (err) {
    console.error("❌ Profile load error:", err.message);
    document.querySelector(".header-text h1").textContent = "Profile not found or private";
  }
});

// POP UP FOR PROTFOLIO 

function showPopupAlert(message, duration = 2200000) { 
  // Create overlay
  const overlay = document.createElement('div');
  overlay.id = 'popup-alert-overlay';
  overlay.style.cssText = `
    position: fixed;
    top: 0; left: 0;
    width: 100%; height: 100%;
    background-color: rgba(0, 0, 0, 0.3);
    backdrop-filter: blur(15px);
    z-index: 9998;
  `;

  // Create alert box
  const alertBox = document.createElement('div');
  alertBox.textContent = message;
  alertBox.style.cssText = `
    position: fixed;
    top: 20px;
    left: 50%;
    transform: translateX(-50%);
    background-color: #f44336;
    color: white;
    padding: 15px 25px;
    border-radius: 5px;
    z-index: 9999;
    font-size: 16px;
    box-shadow: 0 2px 10px rgba(0,0,0,0.3);
  `;

  // Append to body
  document.body.appendChild(overlay);
  document.body.appendChild(alertBox);

  // Remove after timeout
  setTimeout(() => {
    alertBox.remove();
    overlay.remove();
  }, duration);
}