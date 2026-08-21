(function () {
  "use strict";

  var EVENTS = [
    {
      date: "2026-08-12T19:00",
      title: "Poetry Slam",
      host: "Rosalind Achebe",
      blurb: "An open-mic evening of original poetry, seasoned voices and first-timers alike. Bring a poem or just your ears.",
      seatsLeft: 14
    },
    {
      date: "2026-08-14T18:30",
      title: "Author Evening: Naledi Mokoena",
      host: "The Paper Trail team",
      blurb: "Naledi reads from her debut novel, A Thousand Small Returns, in conversation with our booksellers. Books on sale.",
      seatsLeft: 0
    },
    {
      date: "2026-08-18T19:00",
      title: "Translation Night",
      host: "Dr Yusuf Hartmann",
      blurb: "A celebration of literature across five languages: readings, discussion, and a tasting flight of short fiction.",
      seatsLeft: 22
    },
    {
      date: "2026-08-21T19:30",
      title: "Crime Fiction Book Club",
      host: "Marika de Villiers",
      blurb: "This month we argue about The Secret History. Latecomers welcome, spoilers guaranteed.",
      seatsLeft: 6
    },
    {
      date: "2026-08-26T18:00",
      title: "Printer's Night",
      host: "Old Town Letterpress",
      blurb: "A hands-on evening on the shop's original trade. Set a line of type, pull a print, take it home.",
      seatsLeft: 9
    },
    {
      date: "2026-09-02T19:00",
      title: "Short Story Supper",
      host: "The Paper Trail team",
      blurb: "Four short stories read aloud over a shared table. Dinner included, twenty seats only.",
      seatsLeft: 0
    }
  ];

  var dateFormatter = new Intl.DateTimeFormat("en-ZA", {
    weekday: "short",
    day: "numeric",
    month: "short"
  });

  var timeFormatter = new Intl.DateTimeFormat("en-ZA", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false
  });

  function formatEventDate(when) {
    return dateFormatter.format(when).replace(",", "").toUpperCase();
  }

  function el(tag, className, text) {
    var node = document.createElement(tag);
    if (className) {
      node.className = className;
    }
    if (text !== undefined) {
      node.textContent = text;
    }
    return node;
  }

  function buildCard(event) {
    var when = new Date(event.date);
    var isFull = event.seatsLeft === 0;

    var card = el("li", "event-card" + (isFull ? " is-full" : ""));

    // <time> with a machine-readable datetime, so the date is not only visual.
    var dateNode = el("p", "event-date");
    var timeEl = el("time", null, formatEventDate(when));
    timeEl.setAttribute("datetime", event.date);
    dateNode.appendChild(timeEl);

    card.appendChild(dateNode);
    card.appendChild(el("h3", null, event.title));
    card.appendChild(el("p", "event-host", "Hosted by " + event.host));
    card.appendChild(el("p", "event-blurb", event.blurb));
    card.appendChild(el(
      "p",
      "event-meta",
      timeFormatter.format(when) + " · " + (isFull ? "Fully booked" : event.seatsLeft + " seats left")
    ));

    return card;
  }

  /* --- Render --------------------------------------------------------- */

  function render() {
    var grid = document.getElementById("event-grid");
    var count = document.getElementById("events-count");

    if (!grid) {
      return;
    }

    // Re-render replaces the list rather than appending to it, so calling
    // this after an add does not duplicate every existing card.
    grid.textContent = "";

    var sorted = EVENTS.slice().sort(function (a, b) {
      return new Date(a.date) - new Date(b.date);
    });

    if (sorted.length === 0) {
      grid.appendChild(el("li", "events-empty", "Nothing listed at the moment. Check back next week."));
      if (count) {
        count.textContent = "";
      }
      return;
    }

    // Build into a fragment first, then append once. One reflow instead of one
    // per card, which matters as the list grows.
    var fragment = document.createDocumentFragment();

    sorted.forEach(function (event) {
      fragment.appendChild(buildCard(event));
    });

    grid.appendChild(fragment);

    if (count) {
      count.textContent = sorted.length + (sorted.length === 1 ? " event" : " events");
    }
  }

  /* --- Add an event ----------------------------------------------------
     events.html carries the toggle button, a hidden panel and five fields.
     Validation is driven by a table rather than a chain of if-blocks in the
     submit handler: adding a field is one row, and the error-display logic
     is written once instead of once per field.
  ------------------------------------------------------------------- */

  function initAddEventForm() {
    var toggle = document.getElementById("add-event-toggle");
    var panel = document.getElementById("add-event-panel");
    var form = document.getElementById("add-event-form");
    var cancel = document.getElementById("cancel-event");
    var status = document.getElementById("form-status");

    if (!toggle || !panel || !form) {
      return;
    }

    var FIELDS = [
      {
        input: document.getElementById("event-date"),
        error: document.getElementById("error-date"),
        validate: function (value) {
          if (!value) {
            return "Choose a date and time.";
          }
          var when = new Date(value);
          if (isNaN(when.getTime())) {
            return "That date could not be read.";
          }
          if (when.getTime() < Date.now()) {
            return "The date is in the past.";
          }
          return "";
        }
      },
      {
        input: document.getElementById("event-seats"),
        error: document.getElementById("error-seats"),
        validate: function (value) {
          if (value === "") {
            return "Enter a number of seats.";
          }
          var seats = Number(value);
          // Number("") is 0 and Number("12abc") is NaN, so both are checked.
          if (isNaN(seats) || seats < 0 || seats > 200) {
            return "Seats must be between 0 and 200.";
          }
          if (Math.floor(seats) !== seats) {
            return "Seats must be a whole number.";
          }
          return "";
        }
      },
      {
        input: document.getElementById("event-title"),
        error: document.getElementById("error-title"),
        validate: function (value) {
          if (value.length < 3) {
            return "Give the event a title of at least 3 characters.";
          }
          if (value.length > 80) {
            return "Titles are capped at 80 characters.";
          }
          return "";
        }
      },
      {
        input: document.getElementById("event-host"),
        error: document.getElementById("error-host"),
        validate: function (value) {
          if (value.length < 2) {
            return "Say who is hosting.";
          }
          if (value.length > 60) {
            return "Host names are capped at 60 characters.";
          }
          return "";
        }
      },
      {
        input: document.getElementById("event-blurb"),
        error: document.getElementById("error-blurb"),
        validate: function (value) {
          if (value.length < 20) {
            return "Write at least 20 characters of description.";
          }
          if (value.length > 240) {
            return "Descriptions are capped at 240 characters.";
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

    function clearForm() {
      form.reset();
      FIELDS.forEach(function (field) {
        showError(field, "");
      });
    }

    function setOpen(open) {
      panel.hidden = !open;
      toggle.setAttribute("aria-expanded", open ? "true" : "false");

      if (open && FIELDS.length) {
        FIELDS[0].input.focus();
      } else {
        clearForm();
        if (status) {
          status.textContent = "";
        }
      }
    }

    toggle.addEventListener("click", function () {
      setOpen(panel.hidden);
    });

    if (cancel) {
      cancel.addEventListener("click", function () {
        setOpen(false);
        toggle.focus();
      });
    }

    // Clear an error as soon as the field is corrected, rather than making
    // the user resubmit to find out.
    FIELDS.forEach(function (field) {
      field.input.addEventListener("input", function () {
        if (field.input.classList.contains("is-invalid")) {
          checkField(field);
        }
      });
    });

    form.addEventListener("submit", function (submitEvent) {
      // Without this the page reloads and the in-memory array is wiped, so
      // the new event would vanish the instant it was added.
      submitEvent.preventDefault();

      var firstInvalid = null;

      FIELDS.forEach(function (field) {
        if (!checkField(field) && !firstInvalid) {
          firstInvalid = field.input;
        }
      });

      if (firstInvalid) {
        firstInvalid.focus();
        if (status) {
          status.textContent = "";
        }
        return;
      }

      var values = {};
      FIELDS.forEach(function (field) {
        values[field.input.name] = field.input.value.trim();
      });

      EVENTS.push({
        date: values.date,
        title: values.title,
        host: values.host,
        blurb: values.blurb,
        seatsLeft: Number(values.seats)
      });

      render();
      clearForm();

      if (status) {
        // Stated plainly: there is no backend, so this is honest about what
        // "added" means.
        status.textContent = "Added to the listing. It will not survive a reload.";
      }
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    render();
    initAddEventForm();
  });
})();
