// form.js - CORRECTED FOR MULTI-STEP LOGIC

console.log("✅ 1. form.js script loaded.");

const form = document.getElementById('portfolio-form');
const saveBtn = document.getElementById('saveBtn');
const alertBox = document.getElementById('alertBox');

// Helper function for showing alerts remains the same
function showAlert(message, type = "error") {
    alertBox.textContent = message;
    alertBox.className = `alert ${type}`;
    alertBox.style.display = 'block';
    setTimeout(() => { alertBox.style.display = 'none'; }, 4000);
}
// in form.js

form.addEventListener('click', (event) => {
    event.preventDefault();
    
    // --- Collect basic text data ---
    const step1Data = {
        fullName: form.querySelector('#fullName')?.value || '',
        role: form.querySelector('#role')?.value || '',
        city: form.querySelector('#city')?.value || '',
        dob: form.querySelector('#dob')?.value || '',
        gender: form.querySelector('input[name="gender"]:checked')?.value || '',
        aboutMe: form.querySelector('#aboutMe')?.value || ''
    };

    // ✅ ADD THIS BLOCK TO COLLECT EDUCATION DATA
    const educationArray = [];
    document.querySelectorAll('.education-block').forEach(block => {
        const degree = block.querySelector('.eduDegree')?.value || '';
        const college = block.querySelector('.eduCollege')?.value || '';
        const year = block.querySelector('.eduYear')?.value || '';
        if (degree && college && year) {
            educationArray.push({ degree, college, year });
        }
    });
    // Add the education array to our data object
    step1Data.education = educationArray;
    
    // --- Validation ---
    if (!step1Data.fullName.trim()) {
        return showAlert('Full Name is required.', 'error');
    }
    if (step1Data.education.length === 0) {
        return showAlert('Please fill out at least one education entry.', 'error');
    }

    // --- Save everything from Step 1 to sessionStorage ---
    try {
        sessionStorage.setItem('portfolioStep1', JSON.stringify(step1Data));
        console.log("✅ Step 1 data (including education) saved. Redirecting...");
        window.location.href = '/form/form2.html';
    } catch (error) {
        console.error("❌ Could not save to sessionStorage:", error);
        showAlert("An error occurred while saving your progress.", "error");
    }
});