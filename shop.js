/* shop.js — The Paper Trail
 *
 * Owner: Person 2 (feature-catalog)
 *
 * Renders the BOOKS array into the card grid in shop.html. Each book carries a
 * boolean `inStock`, and "Add to Cart" is disabled when that boolean is false.
 *
 * Disabling is done on the button element itself (btn.disabled = true), not by
 * a CSS class alone. A class only changes how the button looks; the disabled
 * property is what actually blocks the click, removes it from tab order, and
 * tells assistive tech the control is unavailable.
 *
 * COVER IMAGES
 * Covers are local files under images/covers/, named after the book. Drop a
 * file in and it appears; leave it out and the card falls back to the flat
 * --card-color block with the title and author set over it, which is exactly
 * how the homepage previews look. Nothing ever renders as a broken image.
 *
 * The eight files currently in images/covers/ are typographic placeholders,
 * generated to match the colour and layout of the homepage cards. They are
 * stand-ins, not the publishers' artwork. Replacing one is a matter of
 * overwriting the file — no code change, as long as the filename stays.
 * See images/covers/README.md for the filename table and sizing.
 */

(function () {
  "use strict";

  /* --- Data ----------------------------------------------------------- */

  var COVER_DIR = "images/covers/";

  // price in cents. Integer maths avoids the floating-point rounding you get
  // from storing 249.99 and adding it up.
  var BOOKS = [
    {
      title: "Intermezzo",
      author: "Sally Rooney",
      priceCents: 34900,
      inStock: true,
      cover: "#2f4f3b",
      coverFile: "intermezzo.jpg"
    },
    {
      title: "James",
      author: "Percival Everett",
      priceCents: 32900,
      inStock: true,
      cover: "#1c3350",
      coverFile: "james.jpg"
    },
    {
      title: "The Serviceberry",
      author: "Robin Wall Kimmerer",
      priceCents: 27500,
      inStock: false,
      cover: "#4a6b33",
      coverFile: "the-serviceberry.jpg"
    },
    {
      title: "Witch",
      author: "Rebecca Tamás",
      priceCents: 24000,
      inStock: true,
      cover: "#3d1f5c",
      coverFile: "witch.jpg"
    },
    {
      title: "A Thousand Small Returns",
      author: "Naledi Mokoena",
      priceCents: 31000,
      inStock: true,
      cover: "#7a3b22",
      coverFile: "a-thousand-small-returns.jpg"
    },
    {
      title: "Orbital",
      author: "Samantha Harvey",
      priceCents: 29900,
      inStock: false,
      cover: "#14343a",
      coverFile: "orbital.jpg"
    },
    {
      title: "The Safekeep",
      author: "Yael van der Wouden",
      priceCents: 33500,
      inStock: true,
      cover: "#5c2338",
      coverFile: "the-safekeep.jpg"
    },
    {
      title: "Held",
      author: "Anne Michaels",
      priceCents: 28900,
      inStock: true,
      cover: "#2f3b2a",
      coverFile: "held.jpg"
    }
  ];

  /* --- Helpers -------------------------------------------------------- */

  var priceFormatter = new Intl.NumberFormat("en-ZA", {
    style: "currency",
    currency: "ZAR",
    minimumFractionDigits: 2
  });

  function formatPrice(cents) {
    return priceFormatter.format(cents / 100);
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

  // The basket lives in script.js so the count survives navigation and every
  // page header shows the same number. Falls back to a local counter if
  // script.js has not loaded.
  var localCount = 0;

  function updateBasket(title) {
    if (window.PaperTrail && window.PaperTrail.basket) {
      window.PaperTrail.basket.add(title);
      return;
    }

    localCount += 1;
    var counter = document.getElementById("basket-count");
    var status = document.getElementById("basket-status");
    if (counter) {
      counter.textContent = String(localCount);
    }
    if (status) {
      status.textContent = title + " added. " + localCount + " item" +
        (localCount === 1 ? "" : "s") + " in basket.";
    }
  }

  /* --- Card ----------------------------------------------------------- */

  function buildCover(book) {
    var cover = el("div", "book-cover");

    // style.css declares .book-card { --card-color: var(--color-green) } and
    // .book-cover { background: var(--card-color) }. Setting the property on
    // the card is how that hook is meant to be used, so the fallback colour
    // comes from the data without any per-book CSS.
    if (book.coverFile) {
      var img = el("img", "book-cover-img");
      img.src = COVER_DIR + book.coverFile;

      // A real cover already shows the title and author in its own artwork, so
      // the overlay text is hidden once the image loads (see .has-cover in
      // shop.html) and the alt text carries the meaning instead.
      img.alt = "Cover of " + book.title + " by " + book.author;
      img.loading = "lazy";
      img.decoding = "async";

      img.addEventListener("load", function () {
        cover.classList.add("has-cover");
      });

      // File missing or unreadable: drop the <img> so the coloured block and
      // its overlay text show, instead of a broken-image icon.
      img.addEventListener("error", function () {
        img.remove();
        cover.classList.remove("has-cover");
      });

      cover.appendChild(img);
    }

    cover.appendChild(el("span", "book-cover-title", book.title));
    cover.appendChild(el("span", "book-cover-author", book.author));

    return cover;
  }

  function buildCard(book) {
    var card = el("li", "book-card" + (book.inStock ? "" : " is-out"));
    card.style.setProperty("--card-color", book.cover);

    card.appendChild(buildCover(book));
    card.appendChild(el("h3", null, book.title));
    card.appendChild(el("p", null, book.author));

    var meta = el("div", "book-meta");
    meta.appendChild(el("span", "book-price", formatPrice(book.priceCents)));
    meta.appendChild(el("span", "book-stock", book.inStock ? "In stock" : "Out of stock"));
    card.appendChild(meta);

    var btn = el("button", "btn btn-primary btn-add", book.inStock ? "Add to Cart" : "Out of stock");
    btn.type = "button";

    if (book.inStock) {
      btn.addEventListener("click", function () {
        updateBasket(book.title);
      });
    } else {
      // The boolean drives the real disabled state, not just the styling.
      btn.disabled = true;
      btn.setAttribute("aria-disabled", "true");
      btn.title = "Not currently on the shelf";
    }

    card.appendChild(btn);
    return card;
  }

  /* --- Render --------------------------------------------------------- */

  function render() {
    var grid = document.getElementById("book-grid");
    var count = document.getElementById("shop-count");

    if (!grid) {
      return;
    }

    var fragment = document.createDocumentFragment();

    BOOKS.forEach(function (book) {
      fragment.appendChild(buildCard(book));
    });

    grid.appendChild(fragment);

    if (count) {
      var available = BOOKS.filter(function (book) {
        return book.inStock;
      }).length;

      count.textContent = available + " of " + BOOKS.length + " on the shelf";
    }
  }

  document.addEventListener("DOMContentLoaded", render);
})();
