document.addEventListener("DOMContentLoaded", initContactForm);

function initContactForm() {
  const form = document.getElementById("contact-form");
  if (!form) return;

  const nameInput = document.getElementById("contact-name");
  const emailInput = document.getElementById("contact-email");
  const messageInput = document.getElementById("contact-message");

  const nameError = document.getElementById("name-error");
  const emailError = document.getElementById("email-error");
  const messageError = document.getElementById("message-error");

  const status = document.getElementById("form-status");
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  form.addEventListener("submit", (event) => {
    event.preventDefault();

    clearErrors();

    const name = nameInput.value.trim();
    const email = emailInput.value.trim();
    const message = messageInput.value.trim();

    let firstInvalid = null;

    if (!name) {
      setError(nameInput, nameError, "Please enter your name.");
      firstInvalid = firstInvalid || nameInput;
    }

    if (!email) {
      setError(emailInput, emailError, "Please enter your email address.");
      firstInvalid = firstInvalid || emailInput;
    } else if (!emailPattern.test(email)) {
      setError(emailInput, emailError, "That doesn't look like a valid email address.");
      firstInvalid = firstInvalid || emailInput;
    }

    if (!message) {
      setError(messageInput, messageError, "Please add a short message.");
      firstInvalid = firstInvalid || messageInput;
    }

    if (firstInvalid) {
      firstInvalid.focus();
      setStatus("Please fix the highlighted fields.", true);
      return;
    }

    setStatus(`Thanks, ${name} — we've got your message and will reply soon.`, false);
    form.reset();
  });

  [nameInput, emailInput, messageInput].forEach((input) => {
    input.addEventListener("input", () => {
      input.classList.remove("error");
      const errorEl = document.getElementById(`${input.name}-error`);
      if (errorEl) errorEl.textContent = "";
    });
  });

  function setError(input, errorEl, text) {
    input.classList.add("error");
    errorEl.textContent = text;
  }

  function clearErrors() {
    [nameInput, emailInput, messageInput].forEach((input) => input.classList.remove("error"));
    [nameError, emailError, messageError].forEach((el) => (el.textContent = ""));
  }

  function setStatus(text, isError) {
    status.textContent = text;
    status.classList.toggle("error", isError);
  }
}