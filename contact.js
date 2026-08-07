(function () {
  "use strict";

  /* ---------------------------------------------------------------------
     Contact form validation.

     Same field-table pattern as events.js: each field is one row of
     {input, error, validate}, and both the submit handler and the live
     input handler walk the table. Adding a field is one row rather than
     another if-block, and the error-display logic exists once.

     There is no backend in this sprint, so the form does not post anywhere.
     preventDefault stops the reload that would otherwise clear the fields
     and look like a successful send.
  --------------------------------------------------------------------- */

  var EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  // Digits, spaces, brackets, hyphens and an optional leading +. Deliberately
  // loose: phone formats vary and a strict pattern rejects valid numbers.
  var PHONE_PATTERN = /^\+?[\d\s()-]{7,20}$/;

  var MESSAGE_MAX = 600;

  function init() {
    var form = document.getElementById("contact-form");
    if (!form) {
      return;
    }

    var status = document.getElementById("contact-status");
    var clearBtn = document.getElementById("clear-form");
    var messageInput = document.getElementById("contact-message");
    var messageCount = document.getElementById("message-count");

    var FIELDS = [
      {
        input: document.getElementById("contact-name"),
        error: document.getElementById("error-name"),
        validate: function (value) {
          if (value.length < 2) {
            return "Please give us your name.";
          }
          if (value.length > 80) {
            return "Names are capped at 80 characters.";
          }
          return "";
        }
      },
      {
        input: document.getElementById("contact-email"),
        error: document.getElementById("error-email"),
        validate: function (value) {
          if (!value) {
            return "We need an email address to reply to.";
          }
          if (!EMAIL_PATTERN.test(value)) {
            return "That doesn't look like a valid email address.";
          }
          return "";
        }
      },
      {
        input: document.getElementById("contact-phone"),
        error: document.getElementById("error-phone"),
        validate: function (value) {
          // Optional: empty is valid, anything present must be plausible.
          if (!value) {
            return "";
          }
          if (!PHONE_PATTERN.test(value)) {
            return "Use digits, spaces and an optional leading +.";
          }
          return "";
        }
      },
      {
        input: document.getElementById("contact-subject"),
        error: document.getElementById("error-subject"),
        validate: function (value) {
          if (!value) {
            return "Pick a subject so we can route your message.";
          }
          return "";
        }
      },
      {
        input: messageInput,
        error: document.getElementById("error-message"),
        validate: function (value) {
          if (value.length < 10) {
            return "Tell us a little more, at least 10 characters.";
          }
          if (value.length > MESSAGE_MAX) {
            return "Messages are capped at " + MESSAGE_MAX + " characters.";
          }
          return "";
        }
      }
    ].filter(function (field) {
      return field.input && field.error;
    });

    function showError(field, message) {
      field.error.textContent = message;
      field.input.classList.toggle("is-invalid", Boolean(message));
      field.input.setAttribute("aria-invalid", message ? "true" : "false");
    }

    function checkField(field) {
      var message = field.validate(field.input.value.trim());
      showError(field, message);
      return !message;
    }

    function setStatus(text, isError) {
      if (!status) {
        return;
      }
      status.textContent = text;
      status.classList.toggle("is-error", Boolean(isError));
    }

    function updateCount() {
      if (messageCount && messageInput) {
        messageCount.textContent = messageInput.value.length + " / " + MESSAGE_MAX;
      }
    }

    // Clear an error as soon as the field is corrected, rather than making
    // the user resubmit to find out.
    FIELDS.forEach(function (field) {
      var eventName = field.input.tagName === "SELECT" ? "change" : "input";

      field.input.addEventListener(eventName, function () {
        if (field.input.classList.contains("is-invalid")) {
          checkField(field);
        }
      });
    });

    if (messageInput) {
      messageInput.addEventListener("input", updateCount);
      updateCount();
    }

    if (clearBtn) {
      clearBtn.addEventListener("click", function () {
        // type="reset" empties the fields; the error state and the counter
        // are ours to clear. Deferred so it runs after the native reset.
        window.setTimeout(function () {
          FIELDS.forEach(function (field) {
            showError(field, "");
          });
          setStatus("", false);
          updateCount();
        }, 0);
      });
    }

    form.addEventListener("submit", function (event) {
      event.preventDefault();

      var firstInvalid = null;

      FIELDS.forEach(function (field) {
        if (!checkField(field) && !firstInvalid) {
          firstInvalid = field.input;
        }
      });

      if (firstInvalid) {
        firstInvalid.focus();
        setStatus("Please fix the highlighted fields.", true);
        return;
      }

      form.reset();
      FIELDS.forEach(function (field) {
        showError(field, "");
      });
      updateCount();

      // Honest about what happens: there is no server behind this yet.
      setStatus("Thanks. Your message has been checked but not sent, the shop has no mail server yet.", false);
    });
  }

  document.addEventListener("DOMContentLoaded", init);
})();
