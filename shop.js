/* shop.js — The Paper Trail
 *
 * Fetches books from Supabase (table: books) and wires "Add to Cart" to a
 * real cart (tables: carts, cart_items) scoped to the visitor's anonymous
 * auth session. Requires supabase-client.js to be loaded first.
 */

(function () {
  "use strict";

  var COVER_DIR = ""; // image_url already stores the full relative path

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

  function buildCover(book) {
    var cover = el("div", "book-cover");

    if (book.image_url) {
      var img = el("img", "book-cover-img");
      img.src = COVER_DIR + book.image_url;
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
    card.style.setProperty("--card-color", book.cover_color);

    card.appendChild(buildCover(book));
    card.appendChild(el("h3", null, book.title));
    card.appendChild(el("p", null, book.author));

    var meta = el("div", "book-meta");
    meta.appendChild(el("span", "book-price", formatPrice(book.price_cents)));
    meta.appendChild(el("span", "book-stock", inStock ? "In stock" : "Out of stock"));
    card.appendChild(meta);

    var btn = el("button", "btn btn-primary btn-add", inStock ? "Add to Cart" : "Out of stock");
    btn.type = "button";

    if (inStock) {
      btn.addEventListener("click", function () {
        btn.disabled = true;
        addToCart(book.id, 1)
          .then(function () {
            return refreshBasketCount(book.title);
          })
          .catch(function (err) {
            console.error(err);
            setBasketStatus("Couldn't add " + book.title + " — try again.");
          })
          .finally(function () {
            btn.disabled = false;
          });
      });
    } else {
      btn.disabled = true;
      btn.setAttribute("aria-disabled", "true");
      btn.title = "Not currently on the shelf";
    }

    card.appendChild(btn);
    return card;
  }

  function setBasketStatus(text) {
    var status = document.getElementById("basket-status");
    if (status) status.textContent = text;
  }

  function refreshBasketCount(justAddedTitle) {
    return getCart().then(function (items) {
      var total = items.reduce(function (sum, item) {
        return sum + item.quantity;
      }, 0);

      var counter = document.getElementById("basket-count");
      if (counter) counter.textContent = String(total);

      if (justAddedTitle) {
        setBasketStatus(
          justAddedTitle + " added. " + total + " item" + (total === 1 ? "" : "s") + " in basket."
        );
      }
      return total;
    });
  }

  function render() {
    var grid = document.getElementById("book-grid");
    var count = document.getElementById("shop-count");
    if (!grid) return;

    ensureSession()
      .then(fetchBooks)
      .then(function (books) {
        var fragment = document.createDocumentFragment();
        books.forEach(function (book) {
          fragment.appendChild(buildCard(book));
        });
        grid.appendChild(fragment);

        if (count) {
          var available = books.filter(function (b) { return b.stock > 0; }).length;
          count.textContent = available + " of " + books.length + " on the shelf";
        }

        return refreshBasketCount();
      })
      .catch(function (err) {
        console.error(err);
        var count2 = document.getElementById("shop-count");
        if (count2) count2.textContent = "Couldn't load the shelf right now.";
      });
  }

  document.addEventListener("DOMContentLoaded", render);
})();
