(function () {
  "use strict";
  var S = window.SavingsTax, $ = function (id) { return document.getElementById(id); };
  function gbp(n) { return "£" + Number(n).toLocaleString("en-GB", { minimumFractionDigits: 2, maximumFractionDigits: 2 }); }
  function set(id, t) { $(id).textContent = t; }
  var form = $("sv-form");
  var BAND = { basic: "Basic rate", higher: "Higher rate", additional: "Additional rate" };
  function run() {
    var r = $("interest").value === "" ? { error: "Enter the interest you get in a year to see the estimate." } : S.calculate({ salary: $("salary").value, interest: $("interest").value, isaCash: $("isaCash").value, isaRate: $("isaRate").value });
    var out = $("out-rows"), msg = $("out-msg");
    if (r.error) { out.hidden = true; msg.hidden = false; msg.textContent = r.error; set("out-headline", "£0.00"); set("out-headline-sub", ""); return; }
    out.hidden = false; msg.hidden = true;
    var a = r.years["2026-27"], b = r.years["2027-28"];
    set("out-band", BAND[b.detail.band] + " taxpayer");
    set("out-psa", gbp(b.detail.psa));
    set("out-start", gbp(b.detail.startingRateUsed));
    set("out-charged", gbp(b.detail.savingsCharged));
    set("out-2026", gbp(a.tax));
    set("out-2027", gbp(b.tax));
    set("out-rise", gbp(r.rise));
    var hasIsa = r.movedInterest > 0;
    $("isa-rows").hidden = !hasIsa;
    if (hasIsa) {
      set("out-isa-moved", gbp(r.isaMoved) + (r.isaCapped ? " (capped at the £20,000 allowance)" : ""));
      set("out-isa-int", gbp(r.movedInterest));
      set("out-isa-2026", gbp(a.isaSaving));
      set("out-isa-2027", gbp(b.isaSaving));
    }
    set("out-headline", gbp(b.tax) + " in 2027 to 2028");
    set("out-headline-sub", "Up " + gbp(r.rise) + " on " + gbp(a.tax) + " in 2026 to 2027." + (hasIsa ? " An ISA move could save about " + gbp(b.isaSaving) + " a year from April 2027." : ""));
  }
  form.addEventListener("input", run);
  form.addEventListener("change", run);
  form.addEventListener("submit", function (e) { e.preventDefault(); run(); });
  run();
})();
