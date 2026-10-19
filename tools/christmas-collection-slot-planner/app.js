// The Christmas order book listing URL. While this is empty the call to action stays hidden.
// Paste the full https:// listing URL between the quotes; ?ref=ps-uk-christmas-order-book is added for you.
const CHRISTMAS_ORDER_BOOK_URL = 'https://arthurverse67.gumroad.com/l/christmasorderbook';
const CHRISTMAS_ORDER_BOOK_REF = 'ps-uk-christmas-order-book';

(function () {
  "use strict";
  var X = window.Slots, $ = function (id) { return document.getElementById(id); };
  function set(id, t) { $(id).textContent = t; }
  var href = X.ctaHref(CHRISTMAS_ORDER_BOOK_URL, CHRISTMAS_ORDER_BOOK_REF);
  document.querySelectorAll("[data-cta-link]").forEach(function (a) { if (href) a.setAttribute("href", href); });
  var cta = $("cta-main");

  var box = $("drows"), count = 0;
  var DEFAULTS = [["Mon 21 Dec", "08:00", "17:00", 25], ["Tue 22 Dec", "08:00", "17:00", 25], ["Wed 23 Dec", "07:30", "17:30", 25], ["Thu 24 Dec", "07:30", "13:00", 25]];
  function addDay(v) {
    if (box.children.length >= X.MAX_DAYS) return;
    v = v || ["", "09:00", "16:00", 0];
    var i = count++, d = document.createElement("div");
    d.className = "drow";
    d.innerHTML =
      '<div class="full"><label for="dl' + i + '">Day label</label><input type="text" id="dl' + i + '" class="dl" maxlength="20" autocomplete="off"></div>' +
      '<div><label for="df' + i + '">First slot starts</label><input type="time" id="df' + i + '" class="df" step="900"></div>' +
      '<div><label for="dt' + i + '">Last slot starts</label><input type="time" id="dt' + i + '" class="dt" step="900"></div>' +
      '<div><label for="ds' + i + '">Share of orders %</label><input type="number" id="ds' + i + '" class="ds" inputmode="numeric" min="0" max="100" step="1"></div>' +
      '<div><button type="button" class="rm">Remove</button></div>' +
      '<span class="err" role="alert"></span>';
    d.querySelector(".dl").value = v[0]; d.querySelector(".df").value = v[1]; d.querySelector(".dt").value = v[2]; d.querySelector(".ds").value = v[3];
    box.appendChild(d);
    buttons();
  }
  function buttons() {
    var k = box.children.length;
    $("add-day").disabled = k >= X.MAX_DAYS;
    box.querySelectorAll(".rm").forEach(function (b) { b.disabled = k <= 1; b.setAttribute("aria-label", "Remove " + (b.closest(".drow").querySelector(".dl").value || "this day")); });
  }
  DEFAULTS.forEach(addDay);
  $("add-day").addEventListener("click", function () { addDay(); run(); });
  box.addEventListener("click", function (e) {
    if (!e.target.classList.contains("rm") || box.children.length <= 1) return;
    e.target.closest(".drow").remove(); buttons(); run();
  });
  $("spread").addEventListener("click", function () {
    var s = X.spread(box.children.length);
    box.querySelectorAll(".ds").forEach(function (el, i) { el.value = s[i]; });
    run();
  });

  function days() {
    return Array.prototype.map.call(box.querySelectorAll(".drow"), function (d) {
      return { label: d.querySelector(".dl").value, first: d.querySelector(".df").value, last: d.querySelector(".dt").value, share: d.querySelector(".ds").value };
    });
  }
  function run() {
    var r = X.plan({ orders: $("orders").value, slot: $("slot").value, people: $("people").value, handover: $("handover").value, days: days() });
    ["orders", "slot", "people", "handover"].forEach(function (id) {
      var m = r.error && r.errors[id] ? r.errors[id] : ""; set(id + "-err", m);
      if (m) $(id).setAttribute("aria-invalid", "true"); else $(id).removeAttribute("aria-invalid");
    });
    var de = r.error && r.errors.dayRows ? r.errors.dayRows : {};
    box.querySelectorAll(".drow").forEach(function (d, i) { d.querySelector(".err").textContent = de[i] || ""; });
    buttons();
    var st = $("share-total"), bad = r.error && r.errors.shares;
    st.textContent = "Shares add up to " + r.shareTotal + "%." + (bad ? " Shares should add up to 100%." : "");
    st.className = bad ? "bad" : "";
    var msg = $("out-msg"), wrap = $("out-wrap");
    if (r.error) {
      wrap.hidden = true; msg.hidden = false; cta.hidden = true;
      msg.textContent = bad && Object.keys(r.errors).length === 1 ? "Shares should add up to 100%." : "Check the boxes marked above to see your slots.";
      return;
    }
    wrap.hidden = false; msg.hidden = true;
    set("out-headline", String(r.C));
    set("out-sub", "You can hand over up to " + r.C + " orders per slot. Across " + r.totalSlots + " slots on " + r.days + " day" + (r.days === 1 ? "" : "s") + ", that is room for " + r.totalCap.toLocaleString("en-GB") + " orders. You expect " + r.orders.toLocaleString("en-GB") + ".");
    var hl = $("headline");
    hl.className = "headline " + (r.allFit ? "refund" : "owed");
    var v;
    if (r.allFit) v = "Your orders fit. Set Orders per slot to " + r.suggest + " to spread them evenly.";
    else {
      var o = r.over[0];
      v = o.label + " is over: about " + o.orders + " orders need " + o.perSlot + " per slot, but you can hand over " + r.C + ". Add people (you would need " + o.staff + "), add hours, or move some orders to another day.";
      if (r.over.length > 1) v += " Also over: " + r.over.slice(1).map(function (x) { return x.label; }).join(", ") + ".";
    }
    set("out-verdict", v);
    var tb = $("out-table"); tb.innerHTML = "";
    r.rows.forEach(function (row) {
      var tr = document.createElement("tr");
      [row.label, row.slots, "about " + row.orders, row.perSlot, r.C, row.fits ? "Yes" : "No", row.staff].forEach(function (c, k) {
        var td = document.createElement("td"); td.textContent = String(c);
        if (k > 0 && k !== 5) td.className = "num";
        if (k === 5 && !row.fits) td.className = "no";
        tr.appendChild(td);
      });
      tb.appendChild(tr);
    });
    set("cta-suggest", "Type " + r.suggest + " into Settings, Orders per slot.");
    cta.hidden = !href;
  }
  var form = $("xs-form");
  form.addEventListener("input", run); form.addEventListener("change", run);
  form.addEventListener("submit", function (e) { e.preventDefault(); });
  run();
})();
