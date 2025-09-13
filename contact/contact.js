document.getElementById("contact-form").addEventListener("submit", async function (e) {
  e.preventDefault();

  // Get form values
  const name = this.name.value.trim();
  const email = this.email.value.trim();
  const subject = this.subject.value.trim();
  const phoneNumber = this.phoneNumber.value.trim(); // <-- ADD THIS LINE
  const message = this.message.value.trim();

  // Basic validation
  if (!name || !email || !subject || !message || !phoneNumber) {
    alert("All fields are required!");
    return;
  }

  try {
    const res = await fetch("http://localhost:5000/contactUs", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ name, email, subject, message, phoneNumber }) // phoneNumber is now defined
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.message || "Failed to send message.");
    } else {
      alert("✅ Message sent successfully!");
      this.reset();
    }
  } catch (err) {
    console.error("❌ Submission error:", err);
    alert("Something went wrong. Please try again.");
  }
});