(function () {
  "use strict";
  var S = window.StatePensionTax, $ = function (id) { return document.getElementById(id); };
  function gbp(n) {
    return (n < -0.004 ? "minus " : "") + "£" + Math.abs(Number(n)).toLocaleString("en-GB", {
      minimumFractionDigits: 2, maximumFractionDigits: 2
    });
  }
  function setDefaultSP() {
    var y = S.YEARS[$("year").value] || S.YEARS["2027-28"];
    $("statePension").placeholder = String(y.fullNewSP);
    $("sp-hint").textContent = y.fullNewSPStatus === "expected"
      ? ("Defaults to the expected full new State Pension of " + gbp(y.fullNewSP) + " a year. Not yet confirmed on GOV.UK.")
      : ("Defaults to the full new State Pension of " + gbp(y.fullNewSP) + " a year (£" + y.fullNewSPWeekly.toFixed(2) + " a week).");
    var tag = $("sp-tag");
    if (tag) {
      tag.textContent = y.fullNewSPStatus === "expected" ? "Expected figure for 2027/28" : "Confirmed 2026/27 rate on GOV.UK";
      tag.hidden = false;
    }
  }
  function run() {
    var input = {
      year: $("year").value,
      statePension: $("statePension").value,
      otherIncome: $("otherIncome").value,
      region: $("region").value
    };
    var r = S.calculate(input);
    ["statePension", "otherIncome"].forEach(function (id) {
      var m = r.error && r.errors[id] ? r.errors[id] : "";
      $(id + "-err").textContent = m;
      if (m) $(id).setAttribute("aria-invalid", "true");
      else $(id).removeAttribute("aria-invalid");
    });
    var msg = $("out-msg");
    if (r.error) {
      $("out-wrap").hidden = true;
      msg.hidden = false;
      msg.textContent = "Check the boxes marked above to see your answer.";
      $("out-tax").textContent = "";
      $("out-sub").textContent = "";
      return;
    }
    msg.hidden = true;
    $("out-wrap").hidden = false;
    var owed = r.taxYear > 0.004;
    var head = $("headline");
    head.className = "headline " + (owed ? "owed" : "none");
    $("out-tax").textContent = owed ? gbp(r.taxYear) : "£0.00";
    $("out-sub").textContent = owed
      ? (gbp(r.taxMonth) + " a month")
      : "No Income Tax on these figures";
    $("out-sp").textContent = gbp(r.statePension);
    $("out-other").textContent = gbp(r.otherIncome);
    $("out-total").textContent = gbp(r.totalIncome);
    $("out-pa").textContent = gbp(r.personalAllowance);
    $("out-taxable").textContent = gbp(r.taxable);
    $("out-tax-year").textContent = gbp(r.taxYear);
    $("out-tax-month").textContent = gbp(r.taxMonth);
    var explain = $("out-explain");
    if (!owed) {
      explain.textContent = "Your total taxable income of " + gbp(r.totalIncome) +
        " is within the Personal Allowance of " + gbp(r.personalAllowance) +
        ", so this estimate shows no Income Tax.";
    } else if (r.statePensionOnly) {
      explain.textContent = "With State Pension only, " + gbp(r.totalIncome) +
        " is " + gbp(r.taxable) + " above the Personal Allowance. Tax is not taken off before the State Pension is paid. HMRC usually collects any tax due by Simple Assessment when the State Pension is someone's only income.";
    } else {
      explain.textContent = "Your State Pension plus other taxable income comes to " + gbp(r.totalIncome) +
        ", which is " + gbp(r.taxable) + " above the Personal Allowance. HMRC usually collects the tax by changing the tax code on another pension or on earnings. If it cannot do that, it may send a Simple Assessment after the tax year.";
    }
  }
  $("year").addEventListener("change", function () { setDefaultSP(); run(); });
  $("sp-form").addEventListener("input", run);
  $("sp-form").addEventListener("change", run);
  $("fill-full").addEventListener("click", function () {
    var y = S.YEARS[$("year").value] || S.YEARS["2027-28"];
    $("statePension").value = String(y.fullNewSP);
    run();
  });
  setDefaultSP();
  run();
})();
