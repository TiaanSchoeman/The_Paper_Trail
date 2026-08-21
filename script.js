document.addEventListener("DOMContentLoaded", () => {
  initScrollReveal();
  initNewsletterForm();
  initBasketCount();
});

// Keeps the header basket badge in sync on any page that includes
// supabase-client.js. shop.js and basket.js already manage their own count
// after add/remove actions — this just sets the initial number on load.
function initBasketCount() {
  const counter = document.getElementById("basket-count");
  if (!counter) return;
  if (typeof ensureSession !== "function" || typeof getCart !== "function") return;

  ensureSession()
    .then(getCart)
    .then((items) => {
      const total = items.reduce((sum, item) => sum + item.quantity, 0);
      counter.textContent = String(total);
    })
    .catch((err) => console.error(err));
}

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

  form.addEventListener("submit", async (event) => {
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

    const submitBtn = form.querySelector("button[type='submit']");
    if (submitBtn) submitBtn.disabled = true;

    try {
      await signUpNewsletter(value);
      showMessage("Thanks — you're on the list.", false);
      form.reset();
    } catch (err) {
      if (err && err.code === "23505") {
        showMessage("That email's already signed up.", true);
      } else {
        console.error(err);
        showMessage("Something went wrong — try again.", true);
      }
    } finally {
      if (submitBtn) submitBtn.disabled = false;
    }
  });

  input.addEventListener("input", () => {
    input.classList.remove("error");
  });

  function showMessage(text, isError) {
    message.textContent = text;
    message.classList.toggle("error", isError);
  }
}