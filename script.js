/* =====================================================================
   The Paper Trail — shared site script.
   Loaded by every page. Each init function returns early when the markup
   it needs is absent, so one file can serve four different pages.
   ===================================================================== */

(function () {
  "use strict";

  var STORAGE_KEY = "paper-trail-basket";

  /* --- Basket ---------------------------------------------------------
     Previously there were three separate basket implementations: a dead
     button on the homepage, a link to the shop on the events page, and a
     counter in shop.js that reset on every navigation. This is the single
     source of truth. It persists in localStorage so the count survives a
     page change, which is the only way a multi-page static site can hold
     state without a backend.

     Exposed on window because shop.js needs to add to it and the two files
     are separate scripts, not modules.
  ------------------------------------------------------------------- */

  function readCount() {
    try {
      var raw = window.localStorage.getItem(STORAGE_KEY);
      var n = parseInt(raw, 10);
      return isNaN(n) || n < 0 ? 0 : n;
    } catch (err) {
      // Private browsing can throw on access. A basket that forgets is
      // better than a page that dies.
      return 0;
    }
  }

  function writeCount(n) {
    try {
      window.localStorage.setItem(STORAGE_KEY, String(n));
    } catch (err) {
      /* ignore */
    }
  }

  function paintCount(n) {
    var nodes = document.querySelectorAll("[data-basket-count]");
    var i;
    for (i = 0; i < nodes.length; i += 1) {
      nodes[i].textContent = String(n);
    }
  }

  var basket = {
    count: function () {
      return readCount();
    },
    add: function (title) {
      var n = readCount() + 1;
      writeCount(n);
      paintCount(n);

      var status = document.getElementById("basket-status");
      if (status) {
        status.textContent = title + " added. " + n + " item" +
          (n === 1 ? "" : "s") + " in basket.";
      }
      return n;
    },
    clear: function () {
      writeCount(0);
      paintCount(0);
    }
  };

  window.PaperTrail = window.PaperTrail || {};
  window.PaperTrail.basket = basket;

  function initBasket() {
    paintCount(readCount());

    // Other tabs changing the basket should not leave this one stale.
    window.addEventListener("storage", function (event) {
      if (event.key === STORAGE_KEY) {
        paintCount(readCount());
      }
    });

    var buttons = document.querySelectorAll(".btn-basket");
    var i;
    for (i = 0; i < buttons.length; i += 1) {
      if (buttons[i].tagName !== "BUTTON") {
        continue;
      }
      buttons[i].addEventListener("click", function () {
        var n = readCount();
        var status = document.getElementById("basket-status");
        var text = n === 0
          ? "Your basket is empty."
          : n + " item" + (n === 1 ? "" : "s") + " in your basket. Checkout is not built yet.";

        if (status) {
          status.textContent = text;
        } else {
          window.alert(text);
        }
      });
    }
  }

  /* --- Mobile navigation ----------------------------------------------
     style.css hides .main-nav below 900px. Without a toggle the site had
     no navigation at all on a phone. The button is created by the markup,
     not injected here, so it still exists if JS fails; the CSS keeps it
     hidden above 900px.
  ------------------------------------------------------------------- */

  function initNav() {
    var toggle = document.querySelector(".nav-toggle");
    var nav = document.querySelector(".main-nav");

    if (!toggle || !nav) {
      return;
    }

    function close() {
      nav.classList.remove("is-open");
      toggle.setAttribute("aria-expanded", "false");
    }

    toggle.addEventListener("click", function () {
      var open = nav.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape") {
        close();
      }
    });

    // A link tap should collapse the menu rather than leave it hanging
    // open behind the new page during the transition.
    nav.addEventListener("click", function (event) {
      if (event.target.tagName === "A") {
        close();
      }
    });
  }

  /* --- Scroll reveal --------------------------------------------------- */

  function initScrollReveal() {
    var revealEls = document.querySelectorAll(".reveal");

    if (!revealEls.length) {
      return;
    }

    // Respect users who've asked for reduced motion. Guarded because an
    // unguarded call throws where matchMedia is absent, and this runs in the
    // same handler as the newsletter form, which would then never bind.
    var prefersReducedMotion = typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // No IntersectionObserver means no reveal, and .reveal is opacity: 0.
    // Showing everything is the correct failure mode.
    if (prefersReducedMotion || typeof IntersectionObserver === "undefined") {
      Array.prototype.forEach.call(revealEls, function (el) {
        el.classList.add("is-visible");
      });
      return;
    }

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -60px 0px" }
    );

    Array.prototype.forEach.call(revealEls, function (el) {
      observer.observe(el);
    });
  }

  /* --- Newsletter sign-up ----------------------------------------------
     No backend, per the sprint's MVP scope. This validates the address
     client-side and shows an inline message.
  ------------------------------------------------------------------- */

  function initNewsletterForm() {
    var form = document.getElementById("newsletter-form");
    if (!form) {
      return;
    }

    var input = document.getElementById("newsletter-email");
    var message = document.getElementById("newsletter-message");
    var emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!input || !message) {
      return;
    }

    function showMessage(text, isError) {
      message.textContent = text;
      message.classList.toggle("error", isError);
    }

    form.addEventListener("submit", function (event) {
      event.preventDefault();

      var value = input.value.trim();

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
      showMessage("Thanks, you're on the list.", false);
      form.reset();
    });

    input.addEventListener("input", function () {
      input.classList.remove("error");
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    initNav();
    initBasket();
    initScrollReveal();
    initNewsletterForm();
  });
})();
