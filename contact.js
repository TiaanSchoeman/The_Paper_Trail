document.addEventListener("DOMContentLoaded", initContactForm);

var FORMSPREE_ENDPOINT = "https://formspree.io/f/maewvawv";

function initContactForm() {
  const form = document.getElementById("contact-form");
  if (!form) return;

  const nameInput = document.getElementById("contact-name");
  const emailInput = document.getElementById("contact-email");
  const phoneInput = document.getElementById("contact-phone");
  const subjectInput = document.getElementById("contact-subject");
  const messageInput = document.getElementById("contact-message");

  const nameError = document.getElementById("name-error");
  const emailError = document.getElementById("email-error");
  const subjectError = document.getElementById("subject-error");
  const messageError = document.getElementById("message-error");

  const charCount = document.getElementById("char-count");
  const status = document.getElementById("form-status");
  const clearBtn = document.getElementById("clear-form");
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  messageInput.addEventListener("input", () => {
    charCount.textContent = String(messageInput.value.length);
  });

  clearBtn.addEventListener("click", () => {
    // type="reset" already clears the fields; just reset the derived UI
    setTimeout(() => {
      charCount.textContent = "0";
      clearErrors();
      status.textContent = "";
    }, 0);
  });

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    clearErrors();

    const name = nameInput.value.trim();
    const email = emailInput.value.trim();
    const subject = subjectInput.value;
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

    if (!subject) {
      setError(subjectInput, subjectError, "Please choose a subject.");
      firstInvalid = firstInvalid || subjectInput;
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

    const submitBtn = form.querySelector("button[type='submit']");
    submitBtn.disabled = true;
    setStatus("Sending...", false);

    try {
      const response = await fetch(FORMSPREE_ENDPOINT, {
        method: "POST",
        headers: { Accept: "application/json" },
        body: new FormData(form)
      });

      if (!response.ok) throw new Error("Formspree returned " + response.status);

      setStatus(`Thanks, ${name} — we've got your message and will reply within two working days.`, false);
      form.reset();
      charCount.textContent = "0";
    } catch (err) {
      console.error(err);
      setStatus("Something went wrong sending your message — try again, or email us directly.", true);
    } finally {
      submitBtn.disabled = false;
    }
  });

  [nameInput, emailInput, phoneInput, subjectInput, messageInput].forEach((input) => {
    input.addEventListener("input", () => {
      input.classList.remove("is-invalid");
      const errorEl = document.getElementById(`${input.name}-error`);
      if (errorEl) errorEl.textContent = "";
    });
  });

  function setError(input, errorEl, text) {
    input.classList.add("is-invalid");
    errorEl.textContent = text;
  }

  function clearErrors() {
    [nameInput, emailInput, subjectInput, messageInput].forEach((input) => input.classList.remove("is-invalid"));
    [nameError, emailError, subjectError, messageError].forEach((el) => (el.textContent = ""));
  }

  function setStatus(text, isError) {
    status.textContent = text;
    status.classList.toggle("error", isError);
  }
}