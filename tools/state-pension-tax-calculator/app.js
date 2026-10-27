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
  function fillScenarioCard(el, sc) {
    var owed = sc.taxYear > 0.004;
    el.querySelector(".sc-label").textContent = sc.label;
    el.querySelector(".sc-pending").hidden = !sc.pending;
    el.querySelector(".sc-tax").textContent = owed ? gbp(sc.taxYear) : "£0.00";
    el.querySelector(".sc-sub").textContent = owed ? (gbp(sc.taxMonth) + " a month") : "No Income Tax on these figures";
    el.querySelector(".sc-pa").textContent = gbp(sc.personalAllowance);
    el.querySelector(".sc-taxable").textContent = gbp(sc.taxable);
    el.querySelector(".sc-note").textContent = sc.note;
    el.className = "scenario " + (owed ? "owed" : "none");
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
    var compare = $("scenarios-compare");
    var single = $("scenarios-single");
    var banner = $("budget-pending");
    if (r.error) {
      $("out-wrap").hidden = true;
      compare.hidden = true;
      single.hidden = true;
      if (banner) banner.hidden = true;
      msg.hidden = false;
      msg.textContent = "Check the boxes marked above to see your answer.";
      $("out-tax").textContent = "";
      $("out-sub").textContent = "";
      return;
    }
    msg.hidden = true;
    $("out-wrap").hidden = false;
    $("out-sp").textContent = gbp(r.statePension);
    $("out-other").textContent = gbp(r.otherIncome);
    $("out-total").textContent = gbp(r.totalIncome);

    if (banner) {
      banner.hidden = !r.showReliefScenarios;
    }

    if (r.scenarioMode === "compare" && r.scenarios.length === 2) {
      compare.hidden = false;
      single.hidden = true;
      fillScenarioCard($("sc-a"), r.scenarios[0]);
      fillScenarioCard($("sc-b"), r.scenarios[1]);
      $("out-tax").textContent = "";
      $("out-sub").textContent = "Two scenarios pending the Budget on " + r.relief.pendingBudgetDate;
      $("headline").className = "headline pending";
      $("out-pa").textContent = gbp(r.scenarios[0].personalAllowance);
      $("out-taxable").textContent = gbp(r.scenarios[0].taxable);
      $("out-tax-year").textContent = gbp(r.scenarios[0].taxYear);
      $("out-tax-month").textContent = gbp(r.scenarios[0].taxMonth);
      $("out-explain").textContent = "Neither figure below is stated as fact. Flip the SP_ONLY_RELIEF_2027_28.mode const in pension-tax.js once the Budget confirms what happens.";
    } else {
      compare.hidden = true;
      single.hidden = false;
      var sc = r.scenarios[0];
      var owed = sc.taxYear > 0.004;
      var head = $("headline");
      head.className = "headline " + (owed ? "owed" : "none");
      $("out-tax").textContent = owed ? gbp(sc.taxYear) : "£0.00";
      $("out-sub").textContent = owed
        ? (gbp(sc.taxMonth) + " a month")
        : "No Income Tax on these figures";
      $("out-pa").textContent = gbp(sc.personalAllowance);
      $("out-taxable").textContent = gbp(sc.taxable);
      $("out-tax-year").textContent = gbp(sc.taxYear);
      $("out-tax-month").textContent = gbp(sc.taxMonth);
      if (sc.pending) {
        $("out-explain").textContent = sc.note;
      } else if (!owed) {
        $("out-explain").textContent = "Your total taxable income of " + gbp(r.totalIncome) +
          " is within the Personal Allowance of " + gbp(sc.personalAllowance) +
          ", so this estimate shows no Income Tax.";
      } else if (r.statePensionOnly) {
        $("out-explain").textContent = "With State Pension only, " + gbp(r.totalIncome) +
          " is " + gbp(sc.taxable) + " above the Personal Allowance. Tax is not taken off before the State Pension is paid. HMRC usually collects any tax due by Simple Assessment when the State Pension is someone's only income.";
      } else {
        $("out-explain").textContent = "Your State Pension plus other taxable income comes to " + gbp(r.totalIncome) +
          ", which is " + gbp(sc.taxable) + " above the Personal Allowance. HMRC usually collects the tax by changing the tax code on another pension or on earnings. If it cannot do that, it may send a Simple Assessment after the tax year.";
      }
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
