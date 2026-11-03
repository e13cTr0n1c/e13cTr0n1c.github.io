(function () {
  "use strict";
  var E = window.SideTax, $ = function (id) { return document.getElementById(id); };
  function gbp(n) { return "£" + Number(n).toLocaleString("en-GB", { minimumFractionDigits: 2, maximumFractionDigits: 2 }); }
  function set(id, t) { $(id).textContent = t; }
  function year() { var c = document.querySelector('input[name="year"]:checked'); return c ? c.value : "2026-27"; }
  function run() {
    var r = E.calculate({ year: year(), salary: $("salary").value, gross: $("gross").value, expenses: $("expenses").value });
    var out = $("out-rows"), msg = $("out-msg"), head = $("headline");
    if (r.error) { out.hidden = true; msg.hidden = false; msg.textContent = r.error; set("out-headline", "Not yet"); set("out-headline-sub", ""); head.className = "headline none"; return; }
    out.hidden = false; msg.hidden = true;
    head.className = r.total > 0 ? "headline owed" : "headline none";
    set("out-headline", gbp(r.total));
    set("out-headline-sub", r.covered ? "Your takings are within the £1,000 trading allowance, so there is no tax to pay on them." : "That is " + r.setAsidePct + "% of your side hustle takings for " + r.label + "." + (r.poaLikely ? " With a bill this size, HMRC may also ask for payments on account." : ""));
    set("out-method", r.covered ? "The allowance covers it all" : (r.method === "costs" ? "Your actual costs (" + gbp(r.expenses) + ")" : "The £1,000 trading allowance"));
    set("out-profit", gbp(r.profit));
    set("out-tax", gbp(r.extraTax));
    set("out-c4", gbp(r.class4));
    set("out-total", gbp(r.total));
    set("out-rate", r.profit > 0 ? r.effective + "%" : "0%");
    set("out-keep", gbp(r.keep));
    set("out-c2", r.profit === 0 ? "Not needed" : (r.class2Credited ? "Treated as paid, nothing to pay" : "Nothing to pay. Optional voluntary " + gbp(r.c2year) + " a year to protect your record"));
  }
  document.querySelectorAll("[data-ex]").forEach(function (b) {
    b.addEventListener("click", function () { var v = b.getAttribute("data-ex").split(","); $("salary").value = v[0]; $("gross").value = v[1]; $("expenses").value = v[2]; run(); });
  });
  var f = $("calc-form"); f.addEventListener("input", run); f.addEventListener("change", run); f.addEventListener("submit", function (e) { e.preventDefault(); run(); });
  run();
})();
