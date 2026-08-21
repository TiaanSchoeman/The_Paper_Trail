/* shop.js — The Paper Trail
 *
 * BACKEND NOTE (2026-08-21): the Supabase-fetched version of this page
 * (ensureSession().then(fetchBooks)) was rendering an empty grid on the live
 * site with no console error, and the cause hasn't been pinned down remotely —
 * supabase-client.js, the jsdelivr CDN bundle, and the books table itself all
 * checked out fine when tested directly. Rather than leave the shop page
 * broken while that gets debugged with real browser DevTools, this reverts
 * to the same approach index.html's "New This Week" section already uses
 * successfully: a hardcoded array rendered on load, no fetch involved.
 *
 * Data (titles, prices, stock, cover photos) mirrors what was last confirmed
 * live in the books table after 006_cover_images_unsplash.sql ran (see the
 * pasted REST response this was checked against).
 *
 * CART CHANGE: "Add to Cart" no longer writes to Supabase. cart_items.book_id
 * is a foreign key to books.id (a real UUID), and this file only has each
 * book's slug, not that id — inserting a made-up id would just fail with a
 * foreign-key error, which is exactly the kind of silent breakage this
 * change is trying to get away from. Add to Cart instead writes to
 * LocalBasket (local-basket.js, a localStorage-backed cart keyed by slug).
 * basket.html now reads from the same store, so items added here do show up
 * there. Trade-off: this basket is per-browser, not per-account, and
 * checkout on basket.html is a client-side confirmation only — nothing is
 * written to Supabase's orders table. If the empty-grid bug gets found
 * later, swap fetchBooks()/addToCart() back in and both limitations go away
 * with it — nothing else about the markup needs to change, since
 * buildCover()/buildCard() only care that each book object has the fields
 * listed below.
 *
 * Requires local-basket.js to be loaded before this file.
 */

(function () {
  "use strict";

  var BOOKS = [
    {
      slug: "intermezzo",
      title: "Intermezzo",
      author: "Sally Rooney",
      priceCents: 34900,
      stock: 12,
      cover: "#2f4f3b",
      coverUrl: "https://images.unsplash.com/photo-1626657171364-4af23203469b?w=800&q=80&auto=format&fit=crop"
    },
    {
      slug: "james",
      title: "James",
      author: "Percival Everett",
      priceCents: 32900,
      stock: 8,
      cover: "#1c3350",
      coverUrl: "https://images.unsplash.com/photo-1776766848535-7f94d9cb152c?w=800&q=80&auto=format&fit=crop"
    },
    {
      slug: "the-serviceberry",
      title: "The Serviceberry",
      author: "Robin Wall Kimmerer",
      priceCents: 27500,
      stock: 0,
      cover: "#4a6b33",
      coverUrl: "https://images.unsplash.com/photo-1768771463712-39c53a5b5ff8?w=800&q=80&auto=format&fit=crop"
    },
    {
      slug: "witch",
      title: "Witch",
      author: "Rebecca Tamás",
      priceCents: 24000,
      stock: 10,
      cover: "#3d1f5c",
      coverUrl: "https://images.unsplash.com/photo-1603531763662-109ff15864c0?w=800&q=80&auto=format&fit=crop"
    },
    {
      slug: "a-thousand-small-returns",
      title: "A Thousand Small Returns",
      author: "Naledi Mokoena",
      priceCents: 31000,
      stock: 15,
      cover: "#7a3b22",
      coverUrl: "https://images.unsplash.com/photo-1607838660853-a2cf34eec5b9?w=800&q=80&auto=format&fit=crop"
    },
    {
      slug: "orbital",
      title: "Orbital",
      author: "Samantha Harvey",
      priceCents: 29900,
      stock: 0,
      cover: "#14343a",
      coverUrl: "https://images.unsplash.com/photo-1614730321146-b6fa6a46bcb4?w=800&q=80&auto=format&fit=crop"
    },
    {
      slug: "the-safekeep",
      title: "The Safekeep",
      author: "Yael van der Wouden",
      priceCents: 33500,
      stock: 6,
      cover: "#5c2338",
      coverUrl: "https://images.unsplash.com/photo-1602965392081-51c2cefc5b7e?w=800&q=80&auto=format&fit=crop"
    },
    {
      slug: "held",
      title: "Held",
      author: "Anne Michaels",
      priceCents: 28900,
      stock: 9,
      cover: "#2f3b2a",
      coverUrl: "https://images.unsplash.com/photo-1706790608211-4c03fd4f4d33?w=800&q=80&auto=format&fit=crop"
    }
  ];

  /* --- Helpers ---------------------------------------------------------- */

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
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  }

  /* --- Basket + popup ----------------------------------------------------
     Writes to LocalBasket (local-basket.js), which also updates the header
     badge itself. This just handles the on-page status text and the toast
     popup. */

  function injectToastStyles() {
    if (document.getElementById("basket-toast-styles")) return;
    var style = el("style");
    style.id = "basket-toast-styles";
    style.textContent =
      ".basket-toast{position:fixed;bottom:1.5rem;right:1.5rem;z-index:1000;" +
      "background:var(--color-green,#2b473c);color:#fff;padding:0.85rem 1.2rem;" +
      "border-radius:6px;font-family:var(--font-sans,'Inter',sans-serif);" +
      "font-size:0.9rem;box-shadow:0 8px 24px rgba(0,0,0,0.2);" +
      "display:flex;align-items:center;gap:0.6rem;" +
      "transform:translateY(12px);opacity:0;transition:transform 0.25s ease,opacity 0.25s ease;}" +
      ".basket-toast.is-visible{transform:translateY(0);opacity:1;}" +
      ".basket-toast a{color:#fff;text-decoration:underline;font-weight:600;white-space:nowrap;}" +
      "@media (max-width:480px){.basket-toast{left:1rem;right:1rem;bottom:1rem;}}";
    document.head.appendChild(style);
  }

  function showToast(title) {
    injectToastStyles();

    var existing = document.getElementById("basket-toast");
    if (existing) existing.remove();

    var toast = el("div", "basket-toast");
    toast.id = "basket-toast";
    toast.setAttribute("role", "status");

    toast.appendChild(el("span", null, title + " added to basket."));

    var link = el("a", null, "View basket →");
    link.href = "basket.html";
    toast.appendChild(link);

    document.body.appendChild(toast);

    requestAnimationFrame(function () {
      toast.classList.add("is-visible");
    });

    setTimeout(function () {
      toast.classList.remove("is-visible");
      setTimeout(function () {
        toast.remove();
      }, 250);
    }, 3000);
  }

  function addToBasket(book) {
    var items = window.LocalBasket
      ? window.LocalBasket.add(book, 1)
      : null;

    showToast(book.title);

    var status = document.getElementById("basket-status");
    if (status) {
      var total = window.LocalBasket ? window.LocalBasket.totalCount() : null;
      status.textContent = total === null
        ? book.title + " added."
        : book.title + " added. " + total + " item" + (total === 1 ? "" : "s") + " in basket.";
    }
  }

  /* --- Card --------------------------------------------------------------- */

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
    var inStock = book.stock > 0;
    var card = el("li", "book-card" + (inStock ? "" : " is-out"));
    card.style.setProperty("--card-color", book.cover);

    card.appendChild(buildCover(book));
    card.appendChild(el("h3", null, book.title));
    card.appendChild(el("p", null, book.author));

    var meta = el("div", "book-meta");
    meta.appendChild(el("span", "book-price", formatPrice(book.priceCents)));
    meta.appendChild(el("span", "book-stock", inStock ? "In stock" : "Out of stock"));
    card.appendChild(meta);

    var btn = el("button", "btn btn-primary btn-add", inStock ? "Add to Cart" : "Out of stock");
    btn.type = "button";

    if (inStock) {
      btn.addEventListener("click", function () {
        addToBasket(book);
      });
    } else {
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
    if (!grid) return;

    var fragment = document.createDocumentFragment();
    BOOKS.forEach(function (book) {
      fragment.appendChild(buildCard(book));
    });
    grid.appendChild(fragment);

    if (count) {
      var available = BOOKS.filter(function (book) {
        return book.stock > 0;
      }).length;
      count.textContent = available + " of " + BOOKS.length + " on the shelf";
    }
  }

  document.addEventListener("DOMContentLoaded", render);
})();