document.addEventListener("DOMContentLoaded", () => {
  initScrollReveal();
  initNewsletterForm();
});

function initScrollReveal() {
  const revealEls = document.querySelectorAll(".reveal");

  if (!revealEls.length) return;


  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  if (prefersReducedMotion) {
    revealEls.forEach((el) => el.classList.add("is-visible"));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15, rootMargin: "0px 0px -60px 0px" }
  );

  revealEls.forEach((el) => observer.observe(el));
}


function initNewsletterForm() {
  const form = document.getElementById("newsletter-form");
  if (!form) return;

  const input = document.getElementById("newsletter-email");
  const message = document.getElementById("newsletter-message");
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  form.addEventListener("submit", (event) => {
    event.preventDefault();

    const value = input.value.trim();

    if (!value) {
      showMessage("Please enter your email address.", true);
      input.classList.add("error");
      return;
    }

    if (!emailPattern.test(value)) {
      showMessage("That doesn't look like a valid email address.", true);
      input.classList.add("error");
      return;
    }

    input.classList.remove("error");
    showMessage("Thanks — you're on the list.", false);
    form.reset();
  });

  input.addEventListener("input", () => {
    input.classList.remove("error");
  });

  function showMessage(text, isError) {
    message.textContent = text;
    message.classList.toggle("error", isError);
  }
}