// The round book listing URL (Etsy or Payhip). While this is empty the call to action stays hidden.
// Paste the full https:// listing URL between the quotes; ?ref=ps-uk-window-cleaner-round-book is added for you.
const ROUND_BOOK_URL = 'https://arthurverse67.gumroad.com/l/btewfm';
const ROUND_BOOK_REF = 'ps-uk-window-cleaner-round-book';

(function () {
  "use strict";
  var P = window.PriceRise, $ = function (id) { return document.getElementById(id); };
  function gbp(n) { return "£" + Math.abs(Number(n)).toLocaleString("en-GB", { minimumFractionDigits: 2, maximumFractionDigits: 2 }); }
  function gbp0(n) { return "£" + Math.round(Math.abs(Number(n))).toLocaleString("en-GB"); }
  function pct(n) { return String(Number(n)) + "%"; }
  function set(id, t) { $(id).textContent = t; }
  var FIELDS = { customers: "customers", price: "price", weeks: "weeks", risePct: "rise", step: "step", lost: "lost" };

  // Call to action: shown only when ROUND_BOOK_URL is set.
  var href = P.ctaHref(ROUND_BOOK_URL, ROUND_BOOK_REF);
  document.querySelectorAll("[data-cta]").forEach(function (el) {
    if (!href) { el.hidden = true; return; }
    el.querySelectorAll("[data-cta-link]").forEach(function (a) { a.setAttribute("href", href); });
    el.hidden = false;
  });

  function run() {
    var r = P.calculate({ customers: $("customers").value, price: $("price").value, weeks: $("weeks").value, risePct: $("rise").value, step: $("step").value, lost: $("lost").value });
    Object.keys(FIELDS).forEach(function (k) {
      var id = FIELDS[k], msg = r.error && r.errors[k] ? r.errors[k] : "";
      set(id + "-err", msg);
      if (msg) $(id).setAttribute("aria-invalid", "true"); else $(id).removeAttribute("aria-invalid");
    });
    var msgEl = $("out-msg"), rows = $("out-rows");
    if (r.error) {
      rows.hidden = true; msgEl.hidden = false; set("out-summary", "");
      msgEl.textContent = "Check the boxes marked above to see your figures.";
      return;
    }
    rows.hidden = false; msgEl.hidden = true;
    set("out-p2", r.noChange ? "No change (" + gbp(r.newPrice) + ")" : gbp(r.newPrice));
    set("out-p2-note", r.roundedFrom !== null ? "Rounded up from " + gbp(r.roundedFrom) : "");
    set("out-c", r.cleansPerYear.toFixed(1));
    set("out-t0", gbp(r.takingsNow));
    set("out-t1", gbp(r.takingsAfter));
    set("out-t1-note", r.lost > 0 ? "With " + r.lost + " customer" + (r.lost === 1 ? "" : "s") + " gone" : "");
    var lbl = $("row-extra").querySelector(".result-label").firstChild;
    if (r.extra < 0) {
      lbl.nodeValue = "Less a year";
      set("out-extra", gbp(r.extra));
      set("out-extra-note", "About " + gbp(r.perMonth) + " less a month");
    } else {
      lbl.nodeValue = "Extra a year";
      set("out-extra", gbp(r.extra));
      set("out-extra-note", r.extra > 0 ? "About " + gbp(r.perMonth) + " a month" : "");
    }
    $("row-e0").hidden = r.lost === 0;
    set("out-e0", gbp(r.extraIfAllStay));
    set("out-lmax", r.couldLose + " (" + r.sharePct + "% of the round)");

    var s;
    if (r.noChange) s = "No change: the price stays at " + gbp(r.price) + ", so you could lose 0 customers and still take the same.";
    else {
      s = "Putting " + gbp(r.price) + " up by " + pct(r.risePct) + " to " + gbp(r.newPrice);
      if (r.extra > 0) s += " adds about " + gbp0(r.extra) + " a year" + (r.lost > 0 ? ", even after losing " + r.lost : "") + ".";
      else if (r.extra < 0) s += " and losing " + r.lost + " customer" + (r.lost === 1 ? "" : "s") + " takes about " + gbp0(r.extra) + " less a year.";
      else s += " takes the same as now.";
      s += " You could lose " + r.couldLose + " of " + r.customers + " customers and still take the same.";
    }
    set("out-summary", s);
  }
  var form = $("pr-form");
  form.addEventListener("input", run); form.addEventListener("change", run);
  form.addEventListener("submit", function (e) { e.preventDefault(); });
  run();
})();
