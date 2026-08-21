/* basket.js — The Paper Trail
 * Renders the visitor's cart (cart_items joined to books) and handles
 * quantity changes, removal, and checkout. Requires supabase-client.js.
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

  function updateHeaderCount(items) {
    var total = items.reduce(function (sum, item) { return sum + item.quantity; }, 0);
    var counter = document.getElementById("basket-count");
    if (counter) counter.textContent = String(total);
    return total;
  }

  function buildRow(item) {
    var book = item.books;
    var row = el("li", "basket-row");

    var info = el("div", "basket-info");
    info.appendChild(el("h3", null, book.title));
    info.appendChild(el("p", null, book.author + " · " + formatPrice(book.price_cents) + " each"));
    row.appendChild(info);

    var qty = el("div", "qty-controls");
    var minus = el("button", null, "−");
    var qtyLabel = el("span", null, String(item.quantity));
    var plus = el("button", null, "+");

    minus.type = "button";
    plus.type = "button";

    minus.addEventListener("click", function () {
      handleQuantityChange(item.id, item.quantity - 1);
    });
    plus.addEventListener("click", function () {
      handleQuantityChange(item.id, item.quantity + 1);
    });

    qty.appendChild(minus);
    qty.appendChild(qtyLabel);
    qty.appendChild(plus);
    row.appendChild(qty);

    row.appendChild(el("span", "line-total", formatPrice(book.price_cents * item.quantity)));

    var remove = el("button", "btn-remove", "Remove");
    remove.type = "button";
    remove.addEventListener("click", function () {
      removeFromCart(item.id).then(render).catch(showFatalError);
    });
    row.appendChild(remove);

    return row;
  }

  function handleQuantityChange(cartItemId, newQty) {
    updateCartQuantity(cartItemId, newQty).then(render).catch(showFatalError);
  }

  function showFatalError(err) {
    console.error(err);
    var list = document.getElementById("basket-list");
    if (list) list.innerHTML = "";
    var empty = el("li", "basket-empty", "Something went wrong loading your basket. Refresh and try again.");
    if (list) list.appendChild(empty);
  }

  function render() {
    var list = document.getElementById("basket-list");
    var summary = document.getElementById("basket-summary");
    var subtotalEl = document.getElementById("basket-subtotal");
    if (!list) return;

    ensureSession()
      .then(getCart)
      .then(function (items) {
        list.innerHTML = "";
        updateHeaderCount(items);

        if (items.length === 0) {
          list.appendChild(el("li", "basket-empty", "Your basket is empty. Go find something worth reading."));
          if (summary) summary.hidden = true;
          return;
        }

        var fragment = document.createDocumentFragment();
        var subtotal = 0;

        items.forEach(function (item) {
          fragment.appendChild(buildRow(item));
          subtotal += item.books.price_cents * item.quantity;
        });

        list.appendChild(fragment);

        if (summary) {
          summary.hidden = false;
          if (subtotalEl) subtotalEl.textContent = formatPrice(subtotal);
        }
      })
      .catch(showFatalError);
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

      submitBtn.disabled = true;
      status.textContent = "Placing your order...";
      status.className = "checkout-status";

      checkout({ email: email, name: name })
        .then(function (orderId) {
          status.textContent = "Order placed — thanks, " + name + "! Reference: " + orderId;
          status.className = "checkout-status success";
          form.reset();
          render();
        })
        .catch(function (err) {
          console.error(err);
          status.textContent = err.message || "Checkout failed — try again.";
          status.className = "checkout-status error";
        })
        .finally(function () {
          submitBtn.disabled = false;
        });
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    render();
    initCheckout();
  });
})();
