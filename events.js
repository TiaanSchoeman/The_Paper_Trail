/* events.js — The Paper Trail
 *
 * BACKEND NOTE (2026-08-21): same issue and same fix as shop.js — the
 * Supabase-fetched version (supabase.from("events").select("*")...) was
 * rendering an empty grid on the live site with no console error. This
 * reverts to a hardcoded array rendered on load, the same pattern
 * index.html's static events preview already uses successfully.
 *
 * ADD EVENT FORM: previously inserted into the Supabase events table. That's
 * removed too — it now just pushes the new event into the in-memory EVENTS
 * array and re-renders, so the button actually works (the earlier version's
 * insert() call was one more thing depending on the same broken fetch path).
 * The trade-off is real: an event added here lives only in this browser tab
 * and is gone on refresh, since nothing is written anywhere. If the
 * empty-grid bug gets found later, swap the insert() call back in.
 */

(function () {
  "use strict";

  var EVENTS = [
    {
      title: "Poetry Slam",
      host: "Rosalind Achebe",
      blurb: "An open-mic evening of original poetry — seasoned voices and first-timers alike. Bring a poem or just your ears.",
      event_date: "2026-08-25T18:30:00",
      seats_total: 40,
      seats_left: 40
    },
    {
      title: "Author Evening — Naledi Mokoena",
      host: "The Paper Trail team",
      blurb: "Naledi reads from her debut novel, A Thousand Small Returns, in conversation with our booksellers. Books on sale.",
      event_date: "2026-08-28T19:00:00",
      seats_total: 60,
      seats_left: 12
    },
    {
      title: "Translation Night",
      host: "Dr Yusuf Hartmann",
      blurb: "A celebration of literature across five languages — readings, discussion, and a tasting flight of short fiction.",
      event_date: "2026-09-01T18:00:00",
      seats_total: 30,
      seats_left: 0
    },
    {
      title: "Book Club: Autumn Read",
      host: "The Paper Trail team",
      blurb: "This month's pick discussed over tea and biscuits. New faces always welcome — no need to have finished the book.",
      event_date: "2026-09-04T17:30:00",
      seats_total: 25,
      seats_left: 25
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
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  }

  function buildCard(event) {
    var when = new Date(event.event_date);
    var isFull = event.seats_left === 0;

    var card = el("li", "event-card" + (isFull ? " is-full" : ""));

    var dateNode = el("p", "event-date");
    var timeEl = el("time", null, formatEventDate(when));
    timeEl.setAttribute("datetime", event.event_date);
    dateNode.appendChild(timeEl);

    card.appendChild(dateNode);
    card.appendChild(el("h3", null, event.title));
    card.appendChild(el("p", "event-host", "Hosted by " + event.host));
    card.appendChild(el("p", "event-blurb", event.blurb));
    card.appendChild(el(
      "p",
      "event-meta",
      timeFormatter.format(when) + " · " + (isFull ? "Fully booked" : event.seats_left + " seats left")
    ));

    return card;
  }

  function render() {
    var grid = document.getElementById("event-grid");
    var count = document.getElementById("events-count");
    if (!grid) return;

    // Keep the list in date order — the add-event form appends to the end
    // of the array, not necessarily in date order.
    var sorted = EVENTS.slice().sort(function (a, b) {
      return new Date(a.event_date) - new Date(b.event_date);
    });

    grid.innerHTML = "";

    if (sorted.length === 0) {
      grid.appendChild(el("li", "events-empty", "Nothing listed at the moment. Check back next week."));
      if (count) count.textContent = "";
      return;
    }

    var fragment = document.createDocumentFragment();
    sorted.forEach(function (event) {
      fragment.appendChild(buildCard(event));
    });
    grid.appendChild(fragment);

    if (count) {
      count.textContent = sorted.length + (sorted.length === 1 ? " event" : " events");
    }
  }

  /* --- Add event form --------------------------------------------------- */

  function fieldError(id) {
    return document.getElementById("error-" + id);
  }

  function clearFormErrors(form) {
    form.querySelectorAll(".is-invalid").forEach(function (input) {
      input.classList.remove("is-invalid");
    });
    form.querySelectorAll(".field-error").forEach(function (span) {
      span.textContent = "";
    });
  }

  function initAddEventForm() {
    var toggle = document.getElementById("add-event-toggle");
    var panel = document.getElementById("add-event-panel");
    var cancel = document.getElementById("cancel-event");
    var form = document.getElementById("add-event-form");
    var status = document.getElementById("form-status");

    if (!toggle || !panel || !form) return;

    toggle.addEventListener("click", function () {
      var isHidden = panel.hasAttribute("hidden");
      if (isHidden) {
        panel.removeAttribute("hidden");
        toggle.setAttribute("aria-expanded", "true");
      } else {
        panel.setAttribute("hidden", "");
        toggle.setAttribute("aria-expanded", "false");
      }
    });

    if (cancel) {
      cancel.addEventListener("click", function () {
        panel.setAttribute("hidden", "");
        toggle.setAttribute("aria-expanded", "false");
        form.reset();
        clearFormErrors(form);
      });
    }

    form.addEventListener("submit", function (event) {
      event.preventDefault();
      clearFormErrors(form);

      var date = document.getElementById("event-date").value;
      var seats = parseInt(document.getElementById("event-seats").value, 10);
      var title = document.getElementById("event-title").value.trim();
      var host = document.getElementById("event-host").value.trim();
      var blurb = document.getElementById("event-blurb").value.trim();

      var firstInvalid = null;

      function markInvalid(fieldId, input, message) {
        input.classList.add("is-invalid");
        var errEl = fieldError(fieldId);
        if (errEl) errEl.textContent = message;
        firstInvalid = firstInvalid || input;
      }

      if (!date) markInvalid("date", document.getElementById("event-date"), "Please pick a date and time.");
      if (isNaN(seats) || seats < 0) markInvalid("seats", document.getElementById("event-seats"), "Enter a valid number of seats.");
      if (!title) markInvalid("title", document.getElementById("event-title"), "Please add a title.");
      if (!host) markInvalid("host", document.getElementById("event-host"), "Please add a host.");
      if (!blurb) markInvalid("blurb", document.getElementById("event-blurb"), "Please add a short description.");

      if (firstInvalid) {
        firstInvalid.focus();
        if (status) status.textContent = "Please fix the highlighted fields.";
        return;
      }

      EVENTS.push({
        title: title,
        host: host,
        blurb: blurb,
        event_date: new Date(date).toISOString(),
        seats_total: seats,
        seats_left: seats
      });

      if (status) status.textContent = "Event added.";
      form.reset();
      panel.setAttribute("hidden", "");
      toggle.setAttribute("aria-expanded", "false");
      render();
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    render();
    initAddEventForm();
  });
})();