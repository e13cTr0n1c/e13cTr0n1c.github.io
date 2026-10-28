(function () {
  "use strict";
  var I = window.IsaCompare, $ = function (id) { return document.getElementById(id); };
  function gbp(n) { return "£" + Number(n).toLocaleString("en-GB", { minimumFractionDigits: 2, maximumFractionDigits: 2 }); }
  function set(id, t) { $(id).textContent = t; }
  var form = $("isa-form");
  function run() {
    var r = I.calculate({ yearly: $("yearly").value, years: $("years").value, growth: $("growth").value, price: $("price").value });
    var out = $("out-rows"), msg = $("out-msg");
    if (r.error) { out.hidden = true; msg.hidden = false; msg.textContent = r.error; set("out-headline", "£0.00"); set("out-headline-sub", ""); return; }
    out.hidden = false; msg.hidden = true;
    set("out-paid", gbp(r.contributions) + (r.capped ? " (capped at £4,000 a year)" : ""));
    set("out-lisa-bal", gbp(r.lisa.balance));
    set("out-lisa-home", gbp(r.lisa.toHome));
    set("out-lisa-charge", r.underCap ? "None" : gbp(r.lisa.charge) + " at 20% (was " + gbp(r.lisa.oldCharge) + " at 25%)");
    set("out-ftb-bal", gbp(r.ftb.balance));
    set("out-ftb-bonus", r.underCap ? gbp(r.ftb.bonus) + (r.ftb.bonusCapped ? " (capped at £20,000)" : "") : "None, home over £450,000 (rules to be confirmed)");
    set("out-ftb-home", gbp(r.ftb.toHome));
    var d = r.difference;
    set("out-diff", Math.abs(d) < 0.005 ? "The same" : d > 0 ? "First Time Buyer ISA by " + gbp(d) : "Lifetime ISA by " + gbp(-d));
    set("out-headline", Math.abs(d) < 0.005 ? "A tie" : d > 0 ? "First Time Buyer ISA" : "Lifetime ISA");
    set("out-headline-sub", "Lifetime ISA puts " + gbp(r.lisa.toHome) + " towards your home; First Time Buyer ISA puts " + gbp(r.ftb.toHome) + ".");
  }
  form.addEventListener("input", run);
  form.addEventListener("change", run);
  form.addEventListener("submit", function (e) { e.preventDefault(); run(); });
  run();
})();
