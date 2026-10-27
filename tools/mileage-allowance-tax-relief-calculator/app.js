(function () {
  "use strict";
  var M = window.Mileage, R = M.RATES, $ = function (id) { return document.getElementById(id); };
  function gbp(n) { return "£" + Number(n).toLocaleString("en-GB", { minimumFractionDigits: 2, maximumFractionDigits: 2 }); }
  function num(n) { return Number(n).toLocaleString("en-GB", { maximumFractionDigits: 0 }); }
  function set(id, t) { $(id).textContent = t; }
  function show(el, on) { el.hidden = !on; }

  var form = $("mile-form");
  var yearSel = $("tax-year");
  var bandSel = $("tax-band");
  Object.keys(R.years).forEach(function (k) {
    var o = document.createElement("option");
    o.value = k; o.textContent = R.years[k].label;
    yearSel.appendChild(o);
  });
  R.taxBands.forEach(function (b) {
    var o = document.createElement("option");
    o.value = b.id; o.textContent = b.label;
    bandSel.appendChild(o);
  });
  yearSel.value = "2026-27";
  bandSel.value = "uk-basic";

  function pick(name) {
    var el = form.querySelector('input[name="' + name + '"]:checked');
    return el ? el.value : null;
  }

  function syncMode() {
    var mode = pick("mode");
    var emp = mode === "employee";
    show($("employer-field"), emp);
    show($("employee-results"), emp);
    show($("self-results"), !emp);
    $("claim-link").href = R.claimUrl;
    $("claim-link-self").href = R.claimUrl;
  }

  function run() {
    syncMode();
    var mode = pick("mode");
    var input = {
      mode: mode,
      miles: $("miles").value,
      vehicle: pick("vehicle"),
      taxYear: yearSel.value,
      taxBand: bandSel.value,
      employerPpm: $("employer-ppm").value
    };
    var empty = $("miles").value === "" || (mode === "employee" && $("employer-ppm").value === "");
    var r = empty
      ? { error: mode === "employee" ? "Enter your business miles and what your employer pays per mile." : "Enter your business miles to see the estimate." }
      : M.calculate(input);

    var msg = $("out-msg");
    if (r.error) {
      msg.hidden = false;
      msg.textContent = r.error;
      set("out-headline", "£0.00");
      set("out-headline-sub", "");
      show($("employee-results"), false);
      show($("self-results"), false);
      return;
    }
    msg.hidden = true;

    var ratesLine = r.rateFirstPpm === r.rateAfterPpm
      ? r.rateFirstPpm + "p a mile"
      : r.rateFirstPpm + "p for the first " + num(R.thresholdMiles) + " miles, then " + r.rateAfterPpm + "p";

    if (r.mode === "self-employed") {
      set("out-headline", gbp(r.deductionPounds));
      set("out-headline-sub", "Simplified mileage deduction for " + num(r.miles) + " miles at " + ratesLine + ".");
      set("out-self-miles", num(r.miles) + " miles");
      set("out-self-rates", ratesLine);
      set("out-self-deduction", gbp(r.deductionPounds));
      set("out-self-saving", gbp(r.estimatedTaxSaving) + " at " + r.taxBandLabel);
      show($("self-results"), true);
      show($("employee-results"), false);
      return;
    }

    var head, sub;
    if (r.marPounds > 0) {
      head = gbp(r.marPounds);
      sub = "Mileage Allowance Relief you may be able to claim at " + r.taxBandLabel + ".";
    } else if (r.taxableExcessPounds > 0) {
      head = gbp(r.taxableExcessPounds);
      sub = "Taxable excess: your employer pays more than the tax free maximum.";
    } else {
      head = gbp(0);
      sub = "Your employer pays exactly the tax free maximum. No relief and no taxable excess.";
    }
    set("out-headline", head);
    set("out-headline-sub", sub);
    set("out-miles", num(r.miles) + " miles");
    set("out-rates", ratesLine);
    set("out-approved", gbp(r.approvedPounds));
    set("out-employer", gbp(r.employerPaysPounds) + " (" + r.employerPpm + "p a mile)");
    set("out-shortfall", gbp(r.shortfallPounds));
    set("out-excess", gbp(r.taxableExcessPounds));
    set("out-mar", gbp(r.marPounds));
    show($("employee-results"), true);
    show($("self-results"), false);
    show($("row-shortfall"), r.shortfallPounds > 0);
    show($("row-excess"), r.taxableExcessPounds > 0);
    show($("row-mar"), r.marPounds > 0);
    show($("claim-note"), r.marPounds > 0);
  }

  form.addEventListener("input", run);
  form.addEventListener("change", run);
  form.addEventListener("submit", function (e) { e.preventDefault(); run(); });
  run();
})();
