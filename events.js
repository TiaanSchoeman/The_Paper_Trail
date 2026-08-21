/* events.js — The Paper Trail
 * Fetches events from Supabase (table: events) and renders the listing.
 * The "Add an event" form inserts a new row. Requires supabase-client.js.
 */

(function () {
  "use strict";

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

    supabase
      .from("events")
      .select("*")
      .order("event_date", { ascending: true })
      .then(function (result) {
        if (result.error) throw result.error;
        var events = result.data;

        grid.innerHTML = "";

        if (events.length === 0) {
          grid.appendChild(el("li", "events-empty", "Nothing listed at the moment. Check back next week."));
          if (count) count.textContent = "";
          return;
        }

        var fragment = document.createDocumentFragment();
        events.forEach(function (event) {
          fragment.appendChild(buildCard(event));
        });
        grid.appendChild(fragment);

        if (count) {
          count.textContent = events.length + (events.length === 1 ? " event" : " events");
        }
      })
      .catch(function (err) {
        console.error(err);
        grid.innerHTML = "";
        grid.appendChild(el("li", "events-empty", "Couldn't load events right now."));
      });
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

      var submitBtn = form.querySelector("button[type='submit']");
      submitBtn.disabled = true;
      if (status) status.textContent = "Adding...";

      supabase
        .from("events")
        .insert({
          title: title,
          host: host,
          blurb: blurb,
          event_date: new Date(date).toISOString(),
          seats_total: seats,
          seats_left: seats
        })
        .then(function (result) {
          if (result.error) throw result.error;
          if (status) status.textContent = "Event added.";
          form.reset();
          panel.setAttribute("hidden", "");
          toggle.setAttribute("aria-expanded", "false");
          render();
        })
        .catch(function (err) {
          console.error(err);
          if (status) status.textContent = "Couldn't add the event — try again.";
        })
        .finally(function () {
          submitBtn.disabled = false;
        });
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    ensureSession().then(render).catch(function (err) {
      console.error(err);
      render();
    });
    initAddEventForm();
  });
})();