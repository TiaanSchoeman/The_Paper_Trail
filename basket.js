/* basket.js — The Paper Trail
 *
 * BACKEND NOTE (2026-08-21): reads from LocalBasket (local-basket.js), not
 * Supabase's cart_items table. shop.js's "Add to Cart" writes there too, so
 * this page now actually shows what got added — previously shop.js used a
 * page-local counter that reset on navigation, so nothing this page fetched
 * from Supabase ever matched it. Requires local-basket.js to be loaded
 * before this file.
 *
 * CHECKOUT: no order is written to Supabase. checkout_cart() is an RPC that
 * operates on real cart_items rows tied to the visitor's auth session — this
 * basket has no such rows, only slugs in localStorage, so there's nothing
 * for that RPC to act on. "Place order" below is a client-side confirmation
 * only: it validates the form, shows a reference, and clears the local
 * basket. If/when the shop goes back to being Supabase-driven, swap this
 * for a real checkout({ email, name }) call again.
 */

(function () {
  "use strict";

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

  function buildRow(item) {
    var row = el("li", "basket-row");

    var info = el("div", "basket-info");
    info.appendChild(el("h3", null, item.title));
    info.appendChild(el("p", null, item.author + " · " + formatPrice(item.priceCents) + " each"));
    row.appendChild(info);

    var qty = el("div", "qty-controls");
    var minus = el("button", null, "−");
    var qtyLabel = el("span", null, String(item.quantity));
    var plus = el("button", null, "+");

    minus.type = "button";
    plus.type = "button";

    minus.addEventListener("click", function () {
      window.LocalBasket.updateQuantity(item.slug, item.quantity - 1);
      render();
    });
    plus.addEventListener("click", function () {
      window.LocalBasket.updateQuantity(item.slug, item.quantity + 1);
      render();
    });

    qty.appendChild(minus);
    qty.appendChild(qtyLabel);
    qty.appendChild(plus);
    row.appendChild(qty);

    row.appendChild(el("span", "line-total", formatPrice(item.priceCents * item.quantity)));

    var remove = el("button", "btn-remove", "Remove");
    remove.type = "button";
    remove.addEventListener("click", function () {
      window.LocalBasket.remove(item.slug);
      render();
    });
    row.appendChild(remove);

    return row;
  }

  function render() {
    var list = document.getElementById("basket-list");
    var summary = document.getElementById("basket-summary");
    var subtotalEl = document.getElementById("basket-subtotal");
    if (!list) return;

    var items = window.LocalBasket ? window.LocalBasket.getAll() : [];

    list.innerHTML = "";

    if (items.length === 0) {
      list.appendChild(el("li", "basket-empty", "Your basket is empty. Go find something worth reading."));
      if (summary) summary.hidden = true;
      return;
    }

    var fragment = document.createDocumentFragment();
    var subtotal = 0;

    items.forEach(function (item) {
      fragment.appendChild(buildRow(item));
      subtotal += item.priceCents * item.quantity;
    });

    list.appendChild(fragment);

    if (summary) {
      summary.hidden = false;
      if (subtotalEl) subtotalEl.textContent = formatPrice(subtotal);
    }
  }

  function initCheckout() {
    var form = document.getElementById("checkout-form");
    if (!form) return;

    var status = document.getElementById("checkout-status");

    form.addEventListener("submit", function (event) {
      event.preventDefault();

      var name = document.getElementById("checkout-name").value.trim();
      var email = document.getElementById("checkout-email").value.trim();
      var submitBtn = form.querySelector("button[type='submit']");

      if (!name || !email) {
        status.textContent = "Please fill in your name and email.";
        status.className = "checkout-status error";
        return;
      }

      var items = window.LocalBasket ? window.LocalBasket.getAll() : [];
      if (items.length === 0) {
        status.textContent = "Your basket is empty.";
        status.className = "checkout-status error";
        return;
      }

      submitBtn.disabled = true;
      status.textContent = "Placing your order...";
      status.className = "checkout-status";

      // Client-side only — see the note at the top of this file.
      var reference = "PT-" + Date.now().toString(36).toUpperCase();

      setTimeout(function () {
        status.textContent = "Order placed — thanks, " + name + "! Reference: " + reference;
        status.className = "checkout-status success";
        form.reset();
        if (window.LocalBasket) window.LocalBasket.clear();
        render();
        submitBtn.disabled = false;
      }, 400);
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    render();
    initCheckout();
  });
})();