// // jobcard.js

// document.addEventListener("DOMContentLoaded", async () => {
//   try {
//     // 1. Get jobId from URL
//     const params = new URLSearchParams(window.location.search);
//     const jobId = params.get("id");

//     if (!jobId) {
//       console.error("❌ No jobId in URL");
//       document.querySelector(".job-title").textContent = "Job not found";
//       return;
//     }

//     // 2. Fetch job details from backend
//     const res = await fetch(`http://localhost:5000/jobs/${jobId}`);
//     if (!res.ok) throw new Error("Failed to fetch job");

//     const job = await res.json();

//     // 3. Select first job-card (since your HTML has placeholders)
//     const jobCard = document.querySelector(".job-card");
//     if (!jobCard) return;

//     // 4. Fill in details
//     jobCard.querySelector(".job-title").textContent = job.title;
//     jobCard.querySelector(".job-meta").textContent =
//       `₹${job.stipend} • ${job.duration} months • ${job.workType} • ${job.experienceLevel}`;
//     jobCard.querySelector(".job-desc").textContent = job.description;

//     // Skills
//     const skillsDiv = jobCard.querySelector(".skills");
//     skillsDiv.innerHTML = job.skills.map(skill => `<span class="skill">${skill}</span>`).join("");

//     // Location
//     jobCard.querySelector(".location").textContent = `📍 ${job.location}`;

//   } catch (err) {
//     console.error("❌ Error loading job details:", err);
//     document.querySelector(".job-title").textContent = "Could not load job details.";
//   }
// });
