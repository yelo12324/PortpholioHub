// interns-signup.js - FULLY CORRECTED

document.addEventListener('DOMContentLoaded', () => {
    // --- Element References ---
    const signupForm = document.getElementById('signup-form');
    const messageDiv = document.getElementById('message');
    const registerBtn = document.getElementById('register-btn');
    let isSubmitting = false;

    // --- Helper Functions for Displaying Messages ---
    const hideMessage = () => {
        messageDiv.style.display = 'none';
        messageDiv.innerHTML = '';
    };

    const showSuccessMessage = (text) => {
        messageDiv.innerHTML = `✅ ${text}`;
        messageDiv.style.cssText = `
            background-color: #d4edda; color: #155724; border: 1px solid #c3e6cb;
            padding: 12px 16px; margin-top: 15px; border-radius: 6px;
            font-family: sans-serif; font-size: 16px; font-weight: bold;
            display: flex; align-items: center; gap: 10px;
        `;
    };
    
    const showErrorMessage = (text) => {
       if (!messageDiv) 
        // console.log("Message div not found");
        return;
     
      messageDiv.innerHTML = `❌ ${text}`;
      messageDiv.style.cssText = `
            background-color: #f8d7da; color: #721c24; border: 1px solid #f5c6cb;
            padding: 12px 16px; margin-top: 15px; border-radius: 6px;
            font-family: sans-serif; font-size: 16px; font-weight: bold;
            display: flex; align-items: center; gap: 10px;
        `;
    };

    // --- Form Submission Event Listener ---
    signupForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        if (isSubmitting) return;

        // 1. Prepare form for submission
        isSubmitting = true;
        registerBtn.disabled = true;
        registerBtn.textContent = 'Submitting...';
        hideMessage();

        const formData = new FormData(signupForm);
        const data = Object.fromEntries(formData.entries());

        // 2. Frontend Validation
        if (data.password !== data.confirm_password) {
            showErrorMessage('Passwords do not match!');
            isSubmitting = false;
            registerBtn.disabled = false;
            registerBtn.textContent = 'Register as Recruiter';
            return;
        }

        // 3. API Call
        try {
            const response = await fetch('http://localhost:5000/recruiter-signup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });

            const result = await response.json();
            
            if (response.ok && result.success) {
                // --- Handle Success ---
                showSuccessMessage(result.message || 'Success! Redirecting...');
                
                localStorage.setItem('recruiterToken', result.token);
                console.log('Token saved to localStorage:', result.token);
                setTimeout(() => {
                    window.location.href = "/recruiter-index/recruiter-Index.html"; ;
                }, 2000);

            } else {
                // --- Handle Server Errors ---
                showErrorMessage(result.message || 'An unknown error occurred.');
                isSubmitting = false;
                registerBtn.disabled = false;
                registerBtn.textContent = 'Register as Recruiter';
            }
        } catch (error) {
            // --- Handle Network Errors ---
            console.error('Fetch error:', error);
            showErrorMessage('A network error occurred. Please try again.');
            isSubmitting = false;
            registerBtn.disabled = false;
            registerBtn.textContent = 'Register as Recruiter';
        }
    });
});