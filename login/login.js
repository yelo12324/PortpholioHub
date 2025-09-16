document.addEventListener('DOMContentLoaded', () => {
    // --- 1. Element References ---
    const loginForm = document.getElementById('loginForm');
    const messageDiv = document.getElementById('message');
    const loginBtn = document.getElementById('login-btn');

    if (!loginForm) {
        console.error("Fatal Error: Could not find the login form with ID 'loginForm'. Check your HTML.");
        return;
    }

    let isSubmitting = false;

    // --- Helper functions for messages (showSuccessMessage, showErrorMessage, etc.) ---
    // (Your existing message functions are perfect, no changes needed here)
    const hideMessage = () => {
        messageDiv.style.display = 'none';
        messageDiv.innerHTML = '';
    };

    const showSuccessMessage = (text) => {
        messageDiv.style.display = 'flex';
        messageDiv.innerHTML = `✅ ${text}`;
        messageDiv.style.cssText = `
            background-color: #d4edda; color: #155724; border: 1px solid #c3e6cb;
            padding: 12px 16px; margin-bottom: 15px; border-radius: 6px;
            font-family: sans-serif; font-size: 16px; font-weight: bold;
            display: flex; align-items: center; gap: 10px;
        `;
    };
    
    const showErrorMessage = (text) => {
        messageDiv.style.display = 'flex';
        messageDiv.innerHTML = `❌ ${text}`;
        messageDiv.style.cssText = `
            background-color: #f8d7da; color: #721c24; border: 1px solid #f5c6cb;
            padding: 12px 16px; margin-bottom: 15px; border-radius: 6px;
            font-family: sans-serif; font-size: 16px; font-weight: bold;
            display: flex; align-items: center; gap: 10px;
        `;
    };


    // --- 3. Form Submission Event Listener ---
    loginForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        if (isSubmitting) return;

        isSubmitting = true;
        loginBtn.disabled = true;
        loginBtn.textContent = 'Logging in...';
        hideMessage();

        const formData = new FormData(loginForm);
        const data = Object.fromEntries(formData.entries());

        try {
            const response = await fetch('https://portpholiohub.onrender.com/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });

            const responseText = await response.text();
            console.log('Raw response from server:', responseText);

            if (!responseText) {
                showErrorMessage("Received an empty response from server.");
                isSubmitting = false;
                loginBtn.disabled = false;
                loginBtn.textContent = 'Login';
                return;
            }

            const result = JSON.parse(responseText);
            console.log('Parsed server response:', result);

            if (response.ok) {
                showSuccessMessage(result.message || "Login successful!");
                localStorage.setItem('jwtToken', result.token);

                // --- NEW: CONDITIONAL REDIRECT LOGIC ---
                // This checks the 'userType' field from the server's response.
                    setTimeout(() => {
                    if (result.userType === 'recruiter') {
                        // If the user is a recruiter, redirect to the recruiter page.
                    window.location.href = "/recruiter-Index/recruiter-Index.html"; ;
                    } else {
                        // Otherwise, redirect to the main page (for interns).
                        window.location.href = '/'; 
                    }
                }, 1500);
                // --- END OF NEW LOGIC ---

            } else {
                showErrorMessage(result.message);
                isSubmitting = false;
                loginBtn.disabled = false;
                loginBtn.textContent = 'Login';
            }

        } catch (error) {
            console.error('Fetch or Parsing error:', error);
            showErrorMessage('An error occurred. Please check the console.');
            isSubmitting = false;
            loginBtn.disabled = false;
            loginBtn.textContent = 'Login';
        }
    });
});

