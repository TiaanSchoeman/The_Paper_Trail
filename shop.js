

(function () {
  "use strict";


  var BOOKS = [
    {
      title: "Intermezzo",
      author: "Sally Rooney",
      priceCents: 34900,
      inStock: true,
      cover: "#2f4f3b"
    },
    {
      title: "James",
      author: "Percival Everett",
      priceCents: 32900,
      inStock: true,
      cover: "#1c3350"
    },
    {
      title: "The Serviceberry",
      author: "Robin Wall Kimmerer",
      priceCents: 27500,
      inStock: false,
      cover: "#4a6b33"
    },
    {
      title: "Witch",
      author: "Rebecca Tamás",
      priceCents: 24000,
      inStock: true,
      cover: "#3d1f5c"
    },
    {
      title: "A Thousand Small Returns",
      author: "Naledi Mokoena",
      priceCents: 31000,
      inStock: true,
      cover: "#7a3b22"
    },
    {
      title: "Orbital",
      author: "Samantha Harvey",
      priceCents: 29900,
      inStock: false,
      cover: "#14343a"
    },
    {
      title: "The Safekeep",
      author: "Yael van der Wouden",
      priceCents: 33500,
      inStock: true,
      cover: "#5c2338"
    },
    {
      title: "Held",
      author: "Anne Michaels",
      priceCents: 28900,
      inStock: true,
      cover: "#2f3b2a"
    }
  ];

  var basketCount = 0;

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

  function updateBasket(title) {
    basketCount += 1;

    var counter = document.getElementById("basket-count");
    var status = document.getElementById("basket-status");

    if (counter) {
      counter.textContent = String(basketCount);
    }
    if (status) {
      status.textContent = title + " added. " + basketCount + " item" +
        (basketCount === 1 ? "" : "s") + " in basket.";
    }
  }

  /* --- Card ----------------------------------------------------------- */

  function buildCard(book) {
    var card = el("li", "book-card" + (book.inStock ? "" : " is-out"));

    // style.css declares .book-card { --card-color: var(--color-green) } and
    // .book-cover { background: var(--card-color) }. Setting the property on
    // the card is how that hook is meant to be used, so the cover colour comes
    // from the data without any per-book CSS.
    card.style.setProperty("--card-color", book.cover);

    var cover = el("div", "book-cover");
    cover.setAttribute("aria-hidden", "true");
    cover.appendChild(el("span", "book-cover-title", book.title));
    cover.appendChild(el("span", "book-cover-author", book.author));
    card.appendChild(cover);

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