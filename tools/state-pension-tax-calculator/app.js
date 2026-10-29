(function () {
  "use strict";
  var P = window.PensionTaxAllowance, $ = function (id) { return document.getElementById(id); };
  var KEYS = ["statePension", "privatePension", "work", "savings", "property", "dividends"];
  function gbp(n) { return "£" + Number(n).toLocaleString("en-GB", { minimumFractionDigits: 2, maximumFractionDigits: 2 }); }
  function set(id, t) { $(id).textContent = t; }
  var EXPLAIN = {
    notEligible: "The Pension Tax Allowance is only for people at or over State Pension age, so I show the normal tax bill.",
    belowPA: "Your total income is within the £12,570 Personal Allowance, so there is no Income Tax to take off.",
    full: "Your total income is £13,037 or less, so you get the full allowance of up to £94. It wipes out the tax you would otherwise owe on these figures.",
    taper: "Your total income is between £13,037 and £13,319, so the allowance is being withdrawn at £1 for every £3 of income above £13,037. This is the band with the high marginal rate.",
    none: "Your total income is £13,319 or more, so there is no Pension Tax Allowance and you pay tax in the normal way."
  };
  function run() {
    var input = { overSPA: $("overSPA").checked };
    KEYS.forEach(function (k) { input[k] = $(k).value; });
    var r = P.calculate(input);
    KEYS.forEach(function (k) {
      var m = r.error && r.errors[k] ? r.errors[k] : "";
      set(k + "-err", m);
      if (m) $(k).setAttribute("aria-invalid", "true"); else $(k).removeAttribute("aria-invalid");
    });
    var msg = $("out-msg"), rows = $("out-rows");
    if (r.error) {
      rows.hidden = true; msg.hidden = false;
      msg.textContent = "Check the boxes marked above to see your estimate.";
      set("out-headline", "£0.00"); set("out-headline-sub", ""); set("out-explain", "");
      return;
    }
    rows.hidden = false; msg.hidden = true; msg.textContent = "";
    set("out-total", gbp(r.totalIncome));
    set("out-without", gbp(r.taxWithoutPTA));
    set("out-pta", gbp(r.ptaValue));
    set("out-reduction", gbp(r.ptaReduction));
    set("out-with", gbp(r.taxWithPTA));
    set("out-marginal", r.marginalRate.toLocaleString("en-GB", { maximumFractionDigits: 2 }) + "%");
    set("out-keep", gbp(r.extra100Keep) + " of every extra £100");
    set("out-headline", gbp(r.taxWithPTA));
    set("out-headline-sub", r.ptaReduction > 0.004 ? ("Down from " + gbp(r.taxWithoutPTA) + " without the allowance") : "No change from the allowance on these figures");
    $("headline").className = "headline " + (r.taxWithPTA > 0.004 ? "owed" : "none");
    set("out-explain", EXPLAIN[r.ptaBand]);
  }
  var form = $("pta-form");
  form.addEventListener("input", run);
  form.addEventListener("change", run);
  form.addEventListener("submit", function (e) { e.preventDefault(); run(); });
  $("fill-full").addEventListener("click", function () { $("statePension").value = "13036.40"; run(); });
  run();
})();
