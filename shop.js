(function () {
  "use strict";

  var COVER_PATH = "images/covers/";

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
      coverFile: "serviceberry.jpg"
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
      coverFile: "thousand-returns.jpg"
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
      coverFile: "safekeep.jpg"
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

  /* --- Card ----------------------------------------------------------- */

  function buildCover(book) {
    var cover = el("div", "book-cover");

    // style.css declares .book-card { --card-color: var(--color-green) } and
    // .book-cover { background: var(--card-color) }. Setting the property on
    // the card is how that hook is meant to be used, so the cover colour comes
    // from the data without any per-book CSS.
    if (book.coverFile) {
      var img = el("img", "book-cover-img");
      img.src = COVER_PATH + book.coverFile;

      // Decorative: the title and author are already on the card below, so an
      // alt description here would only be read out twice.
      img.alt = "";
      img.loading = "lazy";
      img.decoding = "async";

      // .has-cover is added on load, not up front. If the file is missing the
      // class never lands and the overlay text stays visible over the colour
      // block, so the card degrades instead of going blank.
      img.addEventListener("load", function () {
        cover.classList.add("has-cover");
      });

      img.addEventListener("error", function () {
        img.remove();
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
        // The basket lives in script.js so the count survives navigation and
        // the header on every page shows the same number.
        if (window.PaperTrail && window.PaperTrail.basket) {
          window.PaperTrail.basket.add(book.title);
        }
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
