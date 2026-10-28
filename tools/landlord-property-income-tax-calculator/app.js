(function () {
  "use strict";
  var P = window.PropertyTax, $ = function (id) { return document.getElementById(id); };
  function gbp(n) { return "£" + Number(n).toLocaleString("en-GB", { minimumFractionDigits: 2, maximumFractionDigits: 2 }); }
  function set(id, t) { $(id).textContent = t; }
  var form = $("pt-form");
  function run() {
    var r = $("profit").value === "" ? { error: "Enter your rental profit to see the estimate." } : P.calculate({ salary: $("salary").value, profit: $("profit").value, finance: $("finance").value });
    var out = $("out-rows"), msg = $("out-msg");
    if (r.error) { out.hidden = true; msg.hidden = false; msg.textContent = r.error; set("out-headline", "£0.00"); set("out-headline-sub", ""); return; }
    out.hidden = false; msg.hidden = true;
    var a = r.years["2026-27"], b = r.years["2027-28"];
    set("out-taxable", gbp(b.detail.propertyTaxable));
    set("out-credit-2026", gbp(a.detail.credit));
    set("out-credit-2027", gbp(b.detail.credit));
    set("out-2026", gbp(a.tax));
    set("out-2027", gbp(b.tax));
    set("out-rise", gbp(r.rise));
    set("out-headline", gbp(b.tax) + " in 2027 to 2028");
    set("out-headline-sub", "Up " + gbp(r.rise) + " on " + gbp(a.tax) + " in 2026 to 2027.");
  }
  form.addEventListener("input", run);
  form.addEventListener("change", run);
  form.addEventListener("submit", function (e) { e.preventDefault(); run(); });
  run();
})();
