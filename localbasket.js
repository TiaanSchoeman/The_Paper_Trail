/* local-basket.js — The Paper Trail
 *
 * Client-side basket store, backed by localStorage. Introduced because
 * shop.js's "Add to Cart" was updating an in-memory counter only (reset on
 * every page load/navigation), which is why items added on the shop page
 * never showed up on basket.html — that page was still reading the real
 * Supabase cart_items table, which nothing was writing to any more.
 *
 * This replaces the Supabase cart entirely (carts/cart_items) while the
 * shop/events empty-grid bug is unresolved — see the note at the top of
 * shop.js for why fetchBooks()/addToCart() were dropped in the first place.
 * No book has a real Supabase id here, only a slug, so there is nothing to
 * write to cart_items against; a localStorage array keyed by slug sidesteps
 * that instead of fighting it.
 *
 * Include this file on every page that shows the basket badge or count —
 * before script.js, shop.js, or basket.js, all of which now read from it.
 * It has no dependency on supabase-client.js at all.
 */
(function (global) {
  "use strict";

  var STORAGE_KEY = "paperTrailBasket";

  function readAll() {
    try {
      var raw = window.localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (err) {
      // Storage blocked (private browsing, disabled, quota) — basket just
      // behaves as always-empty for this page view. Nothing else breaks.
      return [];
    }
  }

  function writeAll(items) {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch (err) {
      // Can't persist — the in-memory change still renders for this page
      // view, it just won't survive a reload.
    }
  }

  function totalCount(items) {
    return items.reduce(function (sum, item) {
      return sum + item.quantity;
    }, 0);
  }

  function findIndex(items, slug) {
    for (var i = 0; i < items.length; i++) {
      if (items[i].slug === slug) return i;
    }
    return -1;
  }

  // book needs: slug, title, author, priceCents, coverUrl
  function add(book, quantity) {
    quantity = quantity || 1;
    var items = readAll();
    var i = findIndex(items, book.slug);

    if (i > -1) {
      items[i].quantity += quantity;
    } else {
      items.push({
        slug: book.slug,
        title: book.title,
        author: book.author,
        priceCents: book.priceCents,
        coverUrl: book.coverUrl,
        quantity: quantity
      });
    }

    writeAll(items);
    refreshBadge();
    return items;
  }

  function updateQuantity(slug, quantity) {
    var items = readAll();
    if (quantity <= 0) {
      items = items.filter(function (item) {
        return item.slug !== slug;
      });
    } else {
      var i = findIndex(items, slug);
      if (i > -1) items[i].quantity = quantity;
    }
    writeAll(items);
    refreshBadge();
    return items;
  }

  function remove(slug) {
    return updateQuantity(slug, 0);
  }

  function clear() {
    writeAll([]);
    refreshBadge();
  }

  function refreshBadge() {
    var counter = document.getElementById("basket-count");
    if (counter) counter.textContent = String(totalCount(readAll()));
  }

  global.LocalBasket = {
    getAll: readAll,
    add: add,
    updateQuantity: updateQuantity,
    remove: remove,
    clear: clear,
    totalCount: function () {
      return totalCount(readAll());
    },
    refreshBadge: refreshBadge
  };

  document.addEventListener("DOMContentLoaded", refreshBadge);
})(window);