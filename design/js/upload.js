// Upload page logic
document.addEventListener("DOMContentLoaded", () => {
  // Drag and Drop & File Input Handling
  const dropZone = document.getElementById("drop-zone");
  const fileInput = document.getElementById("video-file-input");
  const selectedLabel = document.getElementById("selected-file-label");

  if (dropZone && fileInput) {
    ["dragenter", "dragover"].forEach((eventName) => {
      dropZone.addEventListener(eventName, (e) => {
        e.preventDefault();
        e.stopPropagation();
        dropZone.classList.add("dragover");
      });
    });

    ["dragleave", "drop"].forEach((eventName) => {
      dropZone.addEventListener(eventName, (e) => {
        e.preventDefault();
        e.stopPropagation();
        dropZone.classList.remove("dragover");
      });
    });

    dropZone.addEventListener("drop", (e) => {
      const files = e.dataTransfer.files;
      if (files.length > 0) {
        fileInput.files = files;
        showSelectedFile(files[0].name);
      }
    });

    fileInput.addEventListener("change", () => {
      if (fileInput.files.length > 0) {
        showSelectedFile(fileInput.files[0].name);
      }
    });
  }

  function showSelectedFile(name) {
    if (selectedLabel) {
      selectedLabel.textContent = `Selected: ${name}`;
      selectedLabel.style.display = "block";
    }
  }

  // Form Submission -> Simple Review Confirmation
  const form = document.getElementById("video-upload-form");
  const formContainer = document.getElementById("upload-form-container");
  const confirmBox = document.getElementById("upload-confirmation-box");
  const uploadAnotherBtn = document.getElementById("btn-upload-another");

  if (new URLSearchParams(window.location.search).get("submitted") === "true") {
    if (formContainer && confirmBox) {
      formContainer.style.display = "none";
      confirmBox.classList.add("is-visible");
    }
  }

  if (form && formContainer && confirmBox) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      // Transition to clean review confirmation state
      formContainer.style.display = "none";
      confirmBox.classList.add("is-visible");
    });
  }

  if (uploadAnotherBtn && form && formContainer && confirmBox) {
    uploadAnotherBtn.addEventListener("click", () => {
      form.reset();
      if (selectedLabel) {
        selectedLabel.textContent = "";
        selectedLabel.style.display = "none";
      }
      confirmBox.classList.remove("is-visible");
      formContainer.style.display = "block";
    });
  }
});
