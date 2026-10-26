(function () {
  "use strict";
  var W = window.WageBudget, $ = function (id) { return document.getElementById(id); };
  var IDS = ["hourly", "hours"].concat(W.LINES);
  function gbp(n) { return "£" + Number(n).toLocaleString("en-GB", { minimumFractionDigits: 2, maximumFractionDigits: 2 }); }
  function region() { var f = document.querySelector("input[name=region]:checked"); return f ? f.value : "ruk"; }
  function run() {
    var input = { region: region(), jrfFood: $("jrfFood").checked };
    IDS.forEach(function (id) { input[id] = $(id).value; });
    $("food").disabled = input.jrfFood;
    if (input.jrfFood) $("food").value = W.WAGE.jrfFoodMonth;
    var r = W.check(input);
    IDS.forEach(function (id) { var m = r.errors[id] || ""; $(id + "-err").textContent = m; if (m) $(id).setAttribute("aria-invalid", "true"); else $(id).removeAttribute("aria-invalid"); });
    if (!r.ok) { $("b-wrap").hidden = true; $("b-msg").hidden = false; $("b-head").textContent = ""; $("b-headline").className = "headline none"; $("b-msg").textContent = "Check the boxes marked above."; return; }
    $("b-msg").hidden = true; $("b-wrap").hidden = false;
    var p = r.pay;
    $("b-head").textContent = r.verdict === "surplus" ? gbp(r.surplus) + " left over" : r.verdict === "shortfall" ? gbp(r.shortfall) + " short" : "Just breaking even";
    $("b-headline").className = "headline " + (r.verdict === "shortfall" ? "owed" : "none");
    $("b-gross").textContent = gbp(p.gross) + " a year (" + gbp(p.monthlyGross) + " a month)";
    $("b-tax").textContent = gbp(p.monthlyTax) + " a month";
    $("b-ni").textContent = gbp(p.monthlyNi) + " a month";
    $("b-take").textContent = gbp(p.monthly) + " a month";
    $("b-costs").textContent = gbp(r.totalCosts) + " a month";
    $("b-diff-label").textContent = r.verdict === "shortfall" ? "Monthly shortfall" : "Monthly surplus";
    $("b-diff").textContent = r.verdict === "shortfall" ? "-" + gbp(r.shortfall) : gbp(r.surplus);
    $("b-explain").textContent = "On " + gbp(Number(input.hourly)) + " an hour for " + input.hours + " hours a week, I estimate you take home " + gbp(p.monthly) + " a month. Your costs come to " + gbp(r.totalCosts) + ", so " +
      (r.verdict === "surplus" ? "you have " + gbp(r.surplus) + " a month left for savings, one off costs and everything else." :
       r.verdict === "shortfall" ? "you are " + gbp(r.shortfall) + " a month short. Something has to give, or you may be able to get help such as Universal Credit." :
       "you break even with nothing left over.");
  }
  $("b-form").addEventListener("input", run);
  $("b-form").addEventListener("change", run);
  $("b-form").addEventListener("submit", function (e) { e.preventDefault(); });
  run();
})();
