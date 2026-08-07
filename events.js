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
      title: "Author Evening — Naledi Mokoena",
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

    var sorted = EVENTS.slice().sort(function (a, b) {
      return new Date(a.date) - new Date(b.date);
    });

    if (sorted.length === 0) {
      grid.appendChild(el("li", "events-empty", "Nothing listed at the moment. Check back next week."));
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

  document.addEventListener("DOMContentLoaded", render);
})();