(function () {
  "use strict";

  var BOOKS = [
    {
      title: "Intermezzo",
      author: "Sally Rooney",
      priceCents: 34900,
      inStock: true,
      cover: "#2f4f3b",
      coverUrl: "https://images.unsplash.com/photo-1626657171364-4af23203469b?w=800&q=80&auto=format&fit=crop"
    },
    {
      title: "James",
      author: "Percival Everett",
      priceCents: 32900,
      inStock: true,
      cover: "#1c3350",
      coverUrl: "https://images.unsplash.com/photo-1776766848535-7f94d9cb152c?w=800&q=80&auto=format&fit=crop"
    },
    {
      title: "The Serviceberry",
      author: "Robin Wall Kimmerer",
      priceCents: 27500,
      inStock: false,
      cover: "#4a6b33",
      coverUrl: "https://images.unsplash.com/photo-1768771463712-39c53a5b5ff8?w=800&q=80&auto=format&fit=crop"
    },
    {
      title: "Witch",
      author: "Rebecca Tamás",
      priceCents: 24000,
      inStock: true,
      cover: "#3d1f5c",
      coverUrl: "https://images.unsplash.com/photo-1603531763662-109ff15864c0?w=800&q=80&auto=format&fit=crop"
    },
    {
      title: "A Thousand Small Returns",
      author: "Naledi Mokoena",
      priceCents: 31000,
      inStock: true,
      cover: "#7a3b22",
      coverUrl: "https://images.unsplash.com/photo-1607838660853-a2cf34eec5b9?w=800&q=80&auto=format&fit=crop"
    },
    {
      title: "Orbital",
      author: "Samantha Harvey",
      priceCents: 29900,
      inStock: false,
      cover: "#14343a",
      coverUrl: "https://images.unsplash.com/photo-1614730321146-b6fa6a46bcb4?w=800&q=80&auto=format&fit=crop"
    },
    {
      title: "The Safekeep",
      author: "Yael van der Wouden",
      priceCents: 33500,
      inStock: true,
      cover: "#5c2338",
      coverUrl: "https://images.unsplash.com/photo-1602965392081-51c2cefc5b7e?w=800&q=80&auto=format&fit=crop"
    },
    {
      title: "Held",
      author: "Anne Michaels",
      priceCents: 28900,
      inStock: true,
      cover: "#2f3b2a",
      coverUrl: "https://images.unsplash.com/photo-1706790608211-4c03fd4f4d33?w=800&q=80&auto=format&fit=crop"
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

    if (book.coverUrl) {
      var img = el("img", "book-cover-img");
      img.src = book.coverUrl;

      img.alt = "Cover of " + book.title + " by " + book.author;
      img.loading = "lazy";
      img.decoding = "async";

      img.addEventListener("load", function () {
        cover.classList.add("has-cover");
      });

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