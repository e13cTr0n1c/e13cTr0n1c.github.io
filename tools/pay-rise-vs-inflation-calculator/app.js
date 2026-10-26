(function () {
  "use strict";
  var P = window.PAYCPI, $ = function (id) { return document.getElementById(id); };
  function gbp(n) { return "£" + Number(n).toLocaleString("en-GB", { minimumFractionDigits: 2, maximumFractionDigits: 2 }); }
  function pc(n) { return Number(n).toLocaleString("en-GB", { minimumFractionDigits: 1, maximumFractionDigits: 1 }) + "%"; }
  function sign(n, s) { return (n > 0 ? "+" : n < 0 ? "-" : "") + s; }
  document.querySelectorAll("[data-cpi]").forEach(function (e) { e.textContent = pc(P.PAY_CPI.cpi); });
  function period() { var f = document.querySelector("input[name=period]:checked"); return f ? f.value : "annual"; }
  function run() {
    var r = P.compare($("oldPay").value, $("newPay").value, period());
    ["oldPay", "newPay"].forEach(function (id) { var m = r.errors[id] || ""; $(id + "-err").textContent = m; if (m) $(id).setAttribute("aria-invalid", "true"); else $(id).removeAttribute("aria-invalid"); });
    if (!r.ok) { $("p-wrap").hidden = true; $("p-msg").hidden = false; $("p-head").textContent = ""; $("p-headline").className = "headline none"; $("p-msg").textContent = ($("oldPay").value === "" && $("newPay").value === "") ? "Type in your old and new pay to see if the rise beats inflation." : "Check the boxes marked above."; return; }
    $("p-msg").hidden = true; $("p-wrap").hidden = false;
    $("p-head").textContent = r.verdict === "yes" ? "Yes" : r.verdict === "no" ? "No" : "Level with inflation";
    $("p-headline").className = "headline " + (r.verdict === "no" ? "owed" : "none");
    $("p-rise").textContent = sign(r.riseCash, gbp(Math.abs(r.riseCash))) + " " + r.per + " (" + sign(r.risePct, pc(Math.abs(r.risePct))) + ")";
    $("p-cpi").textContent = pc(r.cpi);
    $("p-needed").textContent = gbp(r.needed) + " " + r.per + " (a rise of " + gbp(r.neededRise) + ")";
    $("p-real").textContent = sign(r.realPct, pc(Math.abs(r.realPct))) + " (" + sign(r.gap, gbp(Math.abs(r.gap))) + " " + r.per + ")";
    $("p-explain").textContent = "Prices rose " + pc(r.cpi) + " in the year to September 2026, so to stand still your pay needed to go from " + gbp(r.oldPay) + " to " + gbp(r.needed) + " " + r.per + ". " +
      (r.verdict === "yes" ? "Your new pay is " + gbp(r.newPay) + ", so you are " + gbp(r.gap) + " " + r.per + " ahead in real terms." :
       r.verdict === "no" ? "Your new pay is " + gbp(r.newPay) + ", so you would need another " + gbp(r.shortfall) + " " + r.per + " to match inflation." :
       "Your new pay is " + gbp(r.newPay) + ", so you are just keeping pace with prices.");
  }
  $("p-form").addEventListener("input", run);
  $("p-form").addEventListener("change", run);
  $("p-form").addEventListener("submit", function (e) { e.preventDefault(); });
  run();
})();
