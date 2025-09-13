// ========== IMAGE PREVIEW HANDLING ==========
function previewImage(inputId, previewId) {
  const input = document.getElementById(inputId);
  const previewBox = document.getElementById(previewId);

  input.addEventListener("change", () => {
    const file = input.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = function (e) {
        previewBox.innerHTML = `<img src="${e.target.result}" alt="Preview" style="width: 100%; height: 100%; object-fit: cover; border-radius: 15px;" />`;
      };
      reader.readAsDataURL(file);
    }
  });
}

previewImage("photo1", "preview1");
previewImage("photo2", "preview2");
previewImage("photo3", "preview3");

// ========== ALERT FUNCTION ==========
function showAlert(message, type = "success") {
  const alertBox = document.getElementById("alertBox");
  alertBox.innerText = message;
  alertBox.className = `alert ${type} show`;
  alertBox.style.display = "block";
  setTimeout(() => {
    alertBox.classList.remove("show");
    alertBox.style.display = "none";
  }, 4000);
}

// ========== FORM SUBMISSION ==========
document.querySelector(".save-btn").addEventListener("click", async function (e) {
  e.preventDefault();

  const projectBlocks = document.querySelectorAll(".work-block");
  const formData = new FormData();
  const workArray = [];

  // projectBlocks.forEach((block, i) => {
  //   const title = block.querySelector(`input[name="text${i + 1}"]`)?.value.trim();
  //   const desc = block.querySelector(`input[name="desc${i + 1}"]`)?.value.trim();
  //   const link = block.querySelector(`input[name="link${i + 1}"]`)?.value.trim();
  //   const photo = block.querySelector(`input[name="photo${i + 1}"]`)?.files[0];

  //   if (title && desc && link) {
  //     workArray.push({ name:title, description: desc, link });

  //     if (photo) {
  //       formData.append(`photo${i + 1}`, photo);
  //     }
  //   }
  // });

// In form3.js

projectBlocks.forEach((block, i) => {
    // ✅ Use the correct names to find the inputs
    const name = block.querySelector(`input[name="name${i + 1}"]`)?.value.trim();
    const description = block.querySelector(`input[name="description${i + 1}"]`)?.value.trim();
    const link = block.querySelector(`input[name="link${i + 1}"]`)?.value.trim();
    const photo = block.querySelector(`input[name="photo${i + 1}"]`)?.files[0];

    // Only add project if essential fields are filled
    if (name && description && photo) {
      workArray.push({ name, description, link });
      formData.append(`photo${i + 1}`, photo);
    }
});

// ✅ Corrected validation logic
if (workArray.length < 2) {
    return showAlert("Please add at least two valid projects with photos", "error");
}

  formData.append("work", JSON.stringify(workArray));

  try {
    const res = await fetch("http://localhost:5000/submit-portfolio-form3", {
      method: "POST",
      body: formData,
      credentials: "include",
    });

    const data = await res.json();

    if (!res.ok) {
      return showAlert(data.message || "Something went wrong", "error");
    }

    showAlert("Projects submitted successfully!", "success");

    setTimeout(() => {
      window.location.href = "form4.html";
    }, 1500);
  } catch (err) {
    console.error("❌ AJAX Error:", err);
    showAlert("Failed to submit projects. Try again.", "error");
  }
});


// ----------------------------------
// EXISTING FORM 3
// ----------------------------------
window.addEventListener("DOMContentLoaded", async () => {
  try {
    const res = await fetch("/portfolio-data", { credentials: "include" });
    const data = await res.json();

    if (Array.isArray(data.myWork)) {
      const blocks = document.querySelectorAll(".work-block");
      data.myWork.forEach((work, i) => {
        const block = blocks[i];
        if (block) {
          block.querySelector(`input[name="text${i + 1}"]`).value = work.name;
          block.querySelector(`input[name="desc${i + 1}"]`).value = work.description;
          block.querySelector(`input[name="link${i + 1}"]`).value = work.link;
          // Preview image is optional, cannot pre-fill file input
        }
      });
    }

  } catch (err) {
    console.error("❌ Error loading form3 data:", err);
  }
});
